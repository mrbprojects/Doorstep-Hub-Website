'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Calendar, Clock, Info, CreditCard, Wallet, Truck, Sparkles, CheckCircle, User, Loader2, Home, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { BookingSteps, FLOW_TYPES } from '@/components/shared/BookingSteps';
import { AnimatePresence } from 'motion/react';
import { verifyBookingPaymentStatus } from '@/lib/accountApi';

function areCitiesMatching(cityA, cityB) {
  if (!cityA || !cityB) return true;
  const clean = (c) => String(typeof c === 'object' ? (c?.name || '') : c || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const a = clean(cityA);
  const b = clean(cityB);
  if (!a || !b) return true;
  if (a === b) return true;
  const hyderabadGroup = ['hyderabad', 'secunderabad', 'cyberabad'];
  if (hyderabadGroup.includes(a) && hyderabadGroup.includes(b)) return true;
  if (a.includes(b) || b.includes(a)) return true;
  return false;
}

export function ServiceCartCheckoutPage({ selectedAddress, onBack, onSuccess }) {
    const { cartData, cartItems, clearCart } = useServiceCart();
    const { token, isAuthenticated } = useAuth();
    const router = useRouter();

    const bookingCost = cartData?.finalAmount || 0;
    const baseServiceCost = Number(cartData?.totalServiceCost ?? cartData?.finalAmount ?? 0);
    const inspectionCost = cartItems.reduce((acc, item) => acc + (item.inspectionCost || 0), 0);

    const [bookedDate, setBookedDate] = useState('');
    const [bookedTime, setBookedTime] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('ONLINE');
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [technicianPreference, setTechnicianPreference] = useState('any');
    const [walletBalance, setWalletBalance] = useState(0);
    const [walletLimits, setWalletLimits] = useState({
        minWalletUsageOrderAmount: 0,
        maxWalletUsageOrderAmount: 0,
        minWalletUsageEnabled: false,
        maxWalletUsageEnabled: false,
    });
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'failure' | null
    const [fullAddress, setFullAddress] = useState(selectedAddress);
    const [locationMismatch, setLocationMismatch] = useState(null);

    const providerCity = cartData?.provider?.cityName;
    const userCity = fullAddress?.cityName || selectedAddress?.cityName;
    const isLocationMismatch = Boolean(providerCity && userCity && !areCitiesMatching(userCity, providerCity));

    useEffect(() => {
        if (selectedAddress) setFullAddress(selectedAddress);
    }, [selectedAddress]);

    // Ensure complete address details even if sessionStorage had partial snapshot
    useEffect(() => {
        if (!token || !selectedAddress?._id) return;
        if (!selectedAddress.addressLineOne || !selectedAddress.phone) {
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/useraddress/getuseraddress`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success && Array.isArray(data.data)) {
                        const match = data.data.find(a => a._id === selectedAddress._id);
                        if (match) { setFullAddress(match); sessionStorage.setItem('selected_address', JSON.stringify(match)); }
                    }
                })
                .catch(() => {});
        }
    }, [token, selectedAddress?._id, selectedAddress?.addressLineOne, selectedAddress?.phone]);

    useEffect(() => {
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/wallet/balance`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.wallet) {
                    setWalletBalance(data.wallet.currentBalance || 0);
                    setWalletLimits({
                        minWalletUsageOrderAmount: Number(data.minWalletUsageOrderAmount || 0),
                        maxWalletUsageOrderAmount: Number(data.maxWalletUsageOrderAmount || 0),
                        minWalletUsageEnabled: Boolean(data.minWalletUsageEnabled),
                        maxWalletUsageEnabled: Boolean(data.maxWalletUsageEnabled),
                    });
                }
            })
            .catch(() => {});
    }, [token]);

    const getWalletUsageBlockedReason = (amount) => {
        const min = walletLimits.minWalletUsageEnabled ? walletLimits.minWalletUsageOrderAmount : 0;
        const max = walletLimits.maxWalletUsageEnabled ? walletLimits.maxWalletUsageOrderAmount : 0;
        if (min > 0 && amount < min) {
            return `To enable D-Hub Wallet, minimum service charge should be above ₹${min} as per admin settings.`;
        }
        if (max > 0 && amount > max) {
            return `To enable D-Hub Wallet, service charge should be below ₹${max} as per admin settings.`;
        }
        return null;
    };

    // On mount: check if returning from Easebuzz payment gateway authoritatively
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        if (!status) return;

        const pendingRaw = sessionStorage.getItem('pending_booking');
        if (!pendingRaw) {
            if (status === 'success') {
                console.warn('[Payment] Blocked unverified success callback: No pending booking session found');
            }
            return;
        }

        let pending = {};
        try {
            pending = JSON.parse(pendingRaw);
        } catch (e) {
            console.error('Failed to parse pending booking', e);
        }

        const orderRef = pending.orderId || urlParams.get('orderId');
        const txnRef = pending.txnid || urlParams.get('txnid');

        if (!orderRef && !txnRef) {
            console.warn('[Payment] Blocked unverified callback: Missing orderId and txnid references');
            return;
        }

        if (!token) return;

        verifyBookingPaymentStatus(token, { orderId: orderRef, txnid: txnRef })
            .then((verification) => {
                if (verification.isPaid) {
                    setPaymentStatus('success');
                    clearCart();
                    sessionStorage.removeItem('pending_booking');
                    toast.success('Payment verified! Booking confirmed.');
                    if (onSuccess) {
                        onSuccess({
                            bookingId: verification.orderId || orderRef,
                            bookedDate: pending.bookedDate,
                            bookedTime: pending.bookedTime,
                            amount: bookingCost
                        }, 'ONLINE');
                    }
                } else if (verification.status === 'pending' || verification.status === 'payment_pending') {
                    setPaymentStatus('pending');
                    toast.info('Payment is pending confirmation from bank. Your cart is preserved.');
                } else {
                    setPaymentStatus('failure');
                    sessionStorage.removeItem('pending_booking');
                    toast.error('Payment failed or was cancelled. Your booking details are preserved in cart.');
                    router.push('/services/payment-failed');
                }
            })
            .catch((err) => {
                console.error('[Payment] Verification error:', err);
                toast.error('Unable to verify payment with server. Your cart is preserved.');
            });
    }, [clearCart, onSuccess, bookingCost, token, router]);

    // Check authentication on mount
    useEffect(() => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
        }
    }, [isAuthenticated]);

    // Service window: 9 AM to 9 PM (9:00 to 21:00)
    const SERVICE_START_HOUR = 9;
    const SERVICE_END_HOUR = 21;
    const BUFFER_HOURS = 3;

    // Smart date availability logic
    const getAvailableDates = () => {
        const now = new Date();
        const dates = [];
        let startDate = new Date(now);

        // Check if today is still available (current time + 3hr buffer < 9 PM)
        const todayCutoff = new Date();
        todayCutoff.setHours(SERVICE_END_HOUR - BUFFER_HOURS, 0, 0, 0); // 6 PM cutoff

        if (now > todayCutoff) {
            // Skip today, start from tomorrow
            startDate.setDate(startDate.getDate() + 1);
        }

        for (let i = (now > todayCutoff ? 1 : 0); i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            dates.push({
                value: date.toISOString().split('T')[0],
                label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                }),
            });
        }
        return dates;
    };

    // Smart time slot availability based on selected date
    const getAvailableTimes = (selectedDateValue) => {
        const now = new Date();
        const selectedDate = new Date(selectedDateValue);

        // Time slots (2-hour windows)
        const allTimeSlots = [
            { label: '09:00 AM - 11:00 AM', value: '09:00', startHour: 9, endHour: 11 },
            { label: '11:00 AM - 01:00 PM', value: '11:00', startHour: 11, endHour: 13 },
            { label: '01:00 PM - 03:00 PM', value: '13:00', startHour: 13, endHour: 15 },
            { label: '03:00 PM - 05:00 PM', value: '15:00', startHour: 15, endHour: 17 },
            { label: '05:00 PM - 07:00 PM', value: '17:00', startHour: 17, endHour: 19 },
            { label: '07:00 PM - 09:00 PM', value: '19:00', startHour: 19, endHour: 21 },
        ];

        // If today and past cutoff time, filter available slots
        if (selectedDate.toDateString() === now.toDateString()) {
            const currentHour = now.getHours();
            const cutoffHour = SERVICE_END_HOUR - BUFFER_HOURS; // 6 PM cutoff

            if (currentHour >= cutoffHour) {
                return []; // No slots available today
            }

            return allTimeSlots.filter(slot => slot.startHour > currentHour);
        }

        return allTimeSlots;
    };

    const availableDates = getAvailableDates();
    const availableTimesForSelectedDate = getAvailableTimes(bookedDate);

    // Reset time when date changes
    useEffect(() => {
        setBookedTime('');
    }, [bookedDate]);

    const handleCheckout = async () => {
        if (!selectedAddress) {
            toast.error('Please select an address');
            return;
        }
        if (!bookedDate) {
            toast.error('Please select a date');
            return;
        }
        if (!bookedTime) {
            toast.error('Please select a time');
            return;
        }

        // Validate location matching
        if (isLocationMismatch) {
            const providerName = cartData?.provider?.businessName ||
                cartData?.provider?.name ||
                [cartData?.provider?.firstName, cartData?.provider?.lastName].filter(Boolean).join(' ') ||
                'Selected Service Center';
            const userCityStr = typeof userCity === 'object' ? (userCity?.name || '') : String(userCity);
            const providerCityStr = typeof providerCity === 'object' ? (providerCity?.name || '') : String(providerCity);

            setLocationMismatch({
                userCity: userCityStr,
                providerCity: providerCityStr,
                providerName
            });
            return;
        }

        if (paymentMethod === 'WALLET') {
            const blockedReason = getWalletUsageBlockedReason(baseServiceCost);
            if (blockedReason) {
                toast.error(blockedReason);
                return;
            }
        }

        setLoading(true);
        try {
            const endpoint = paymentMethod === 'ONLINE'
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/service-cart/initiate-payment`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/service-cart/checkout`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    serviceAddressId: selectedAddress._id,
                    bookedDate,
                    bookedTime,
                    paymentMethod,
                    sourceOfLead: 'website',
                    returnUrl: `${window.location.protocol}//${window.location.host}${window.location.pathname}`,
                    surl: `${window.location.protocol}//${window.location.host}${window.location.pathname}?status=success`,
                    furl: `${window.location.protocol}//${window.location.host}${window.location.pathname}?status=cancelled`
                })
            });

            const data = await response.json();
            console.log('💳 Checkout Response:', data);

            if (data.success) {
                if (paymentMethod === 'ONLINE' && data.access_key) {
                    // Save pending booking details to sessionStorage before redirect
                    sessionStorage.setItem('pending_booking', JSON.stringify({
                        bookedDate,
                        bookedTime,
                        address: selectedAddress,
                        orderId: data.bookingId || data.orderId || null,
                        txnid: data.txnid || null
                    }));

                    // Redirect to Easebuzz payment gateway with access_key
                    const easebuzzUrl = `https://pay.easebuzz.in/pay/${data.access_key}`;
                    console.log('🔗 Redirecting to Easebuzz:', easebuzzUrl);
                    toast.success('Redirecting to payment gateway...');
                    window.location.href = easebuzzUrl;
                } else {
                    // COD or Wallet payment successful
                    toast.success('Booking created successfully!');
                    clearCart(); // Clear cart only on successful booking
                    if (onSuccess) onSuccess(data, paymentMethod);
                }
            } else {
                if (data.code === 'LOCATION_MISMATCH') {
                    setLocationMismatch({
                        userCity: data.userCity || (typeof userCity === 'object' ? userCity?.name : userCity),
                        providerCity: data.providerCity || (typeof providerCity === 'object' ? providerCity?.name : providerCity),
                        providerName: data.providerName || 'Selected Service Center'
                    });
                } else {
                    const detail = data.easebuzz?.error_desc || data.easebuzz?.data || data.error;
                    toast.error(detail ? `${data.message || 'Checkout failed'}: ${detail}` : (data.message || 'Checkout failed'));
                }
            }

        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Failed to complete checkout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-20 pb-32"
        >
            {/* Header */}
            <section className="sticky top-20 z-40 bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] border-b border-white/10 shadow-lg">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={onBack}
                        className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Address
                    </motion.button>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3"
                    >
                        <Sparkles className="w-8 h-8" />
                        Confirm Your Booking
                    </motion.h1>
                </div>

                {/* Progress Indicator */}
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
                    <BookingSteps
                        flowType={FLOW_TYPES.NORMAL}
                        currentStep="address"
                        serviceSlug="services"
                    />
                </div>
            </section>

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Location Mismatch Banner */}
                        {isLocationMismatch && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-sm">
                                <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-xs flex-1">
                                    <p className="font-bold text-sm text-amber-900">Service Location Mismatch</p>
                                    <p className="mt-1 text-amber-800 leading-relaxed">
                                        Your service address is in <strong>{typeof userCity === 'object' ? userCity?.name : userCity}</strong>, but the selected service center is in <strong>{typeof providerCity === 'object' ? providerCity?.name : providerCity}</strong>. This provider cannot deliver service to your location.
                                    </p>
                                    <div className="mt-2.5 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => router.push('/services/child/683dbc04b62d2a241de0f7e8?category=Services&name=Service%20Centers')}
                                            className="px-3 py-1.5 rounded-lg bg-[#037166] text-white text-[11px] font-bold hover:brightness-105 transition-all shadow-sm"
                                        >
                                            Change Service Center
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onBack}
                                            className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-[11px] font-semibold hover:bg-amber-100 transition-all"
                                        >
                                            Change Address
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Date Selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10"
                        >
                            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[#04a99d]" />
                                Select Date
                            </h4>
                            {availableDates.length === 0 ? (
                                <p className="text-white/70 text-sm">No dates available at this time</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {availableDates.map((date) => (
                                        <button
                                            key={date.value}
                                            onClick={() => setBookedDate(date.value)}
                                            className={`p-4 rounded-xl font-medium transition-all ${bookedDate === date.value
                                                ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-lg shadow-[#037166]/30'
                                                : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                                }`}
                                        >
                                            {date.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Time Selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10"
                        >
                            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#04a99d]" />
                                Select Time Slot
                            </h4>
                            {availableTimesForSelectedDate.length === 0 ? (
                                <p className="text-white/70 text-sm">
                                    {bookedDate
                                        ? 'No time slots available for selected date'
                                        : 'Please select a date first'
                                    }
                                </p>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-3">
                                    {availableTimesForSelectedDate.map((time) => (
                                        <button
                                            key={time.value}
                                            onClick={() => setBookedTime(time.value)}
                                            className={`p-4 rounded-xl font-medium transition-all ${bookedTime === time.value
                                                ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-lg shadow-[#037166]/30'
                                                : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                                }`}
                                        >
                                            {time.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Technician Preference */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10"
                        >
                            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-[#04a99d]" />
                                Technician Preference (Optional)
                            </h4>
                            <div className="grid md:grid-cols-3 gap-3">
                                {[
                                    { value: 'any', label: 'Any Available' },
                                    { value: 'senior', label: 'Senior Technician' },
                                    { value: 'same', label: 'Same as Last Time' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setTechnicianPreference(option.value)}
                                        className={`p-4 rounded-xl font-medium transition-all ${technicianPreference === option.value
                                            ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Payment Method */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10"
                        >
                            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#04a99d]" />
                                Select Payment Method
                            </h4>
                            <div className="grid md:grid-cols-3 gap-3">
                                {[
                                    { id: 'WALLET', label: 'Wallet Pay', icon: Wallet },
                                    { id: 'ONLINE', label: 'Online Payment', icon: CreditCard },
                                    { id: 'COD', label: 'Pay After Service (Cash on Service Delivery)', icon: Truck },
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => {
                                            if (method.id === 'WALLET') {
                                                const reason = getWalletUsageBlockedReason(baseServiceCost);
                                                if (reason) {
                                                    toast.error(reason);
                                                    return;
                                                }
                                            }
                                            setPaymentMethod(method.id);
                                        }}
                                        className={`p-5 rounded-xl flex flex-col items-center gap-2 transition-all text-center ${paymentMethod === method.id
                                            ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-lg'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        <method.icon className={`w-6 h-6 ${paymentMethod === method.id ? 'text-white' : 'text-[#04a99d]'}`} />
                                        <h6 className="text-xs font-medium leading-tight">{method.label}</h6>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Service Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-3.5">
                                <h4 className="text-base sm:text-lg font-bold text-[#0f172a] flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-[#04a99d]" />
                                    <span>Service Address</span>
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (typeof onBack === 'function') {
                                            onBack();
                                        } else {
                                            router.push('/services/address');
                                        }
                                    }}
                                    className="text-xs font-semibold text-[#037166] hover:text-[#025a51] hover:underline transition-colors"
                                >
                                    Change Address
                                </button>
                            </div>
                            {(() => {
                                const currentAddr = fullAddress || selectedAddress;
                                if (!currentAddr) return (
                                    <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-center">
                                        <p className="text-xs text-gray-500 mb-2">No service address selected</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (typeof onBack === 'function') {
                                                    onBack();
                                                } else {
                                                    router.push('/services/address');
                                                }
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-[#037166] text-white text-xs font-semibold hover:bg-[#025a51] transition-all"
                                        >
                                            Select Address
                                        </button>
                                    </div>
                                );
                                const clean = (v) => (!v || String(v).trim().toUpperCase() === 'N/A' || String(v).trim().toUpperCase() === 'UNDEFINED' || String(v).trim().toUpperCase() === 'NULL' ? null : String(v).trim());
                                const streetParts = [clean(currentAddr.flat), clean(currentAddr.area), clean(currentAddr.addressLineOne), clean(currentAddr.addressLineTwo)].filter(Boolean);
                                const seen = new Set();
                                const uniqueStreet = streetParts.filter(s => { const k = s.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
                                const regionParts = [clean(currentAddr.cityName || currentAddr.city), clean(currentAddr.stateName || currentAddr.state), clean(currentAddr.postalCode || currentAddr.pincode)].filter(Boolean);
                                const addrType = clean(currentAddr.type)?.toLowerCase();
                                return (
                                    <div className="p-4 rounded-xl bg-[#f8fafc] border border-gray-200/80">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <div className="flex items-center gap-1.5 font-bold text-[#0f172a] text-sm sm:text-base">
                                                {addrType === 'home' ? <Home className="w-4 h-4 text-[#037166]" /> : addrType === 'office' ? <Briefcase className="w-4 h-4 text-[#037166]" /> : <MapPin className="w-4 h-4 text-[#037166]" />}
                                                <span>{clean(currentAddr.name) || clean(currentAddr.userName) || 'Customer'}</span>
                                            </div>
                                            {clean(currentAddr.type) && <span className="px-2 py-0.5 rounded-full bg-[#037166]/10 text-[#037166] text-[10px] font-bold uppercase tracking-wider">{clean(currentAddr.type)}</span>}
                                            {currentAddr.defaultAddress && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[10px] font-bold uppercase tracking-wider">DEFAULT</span>}
                                        </div>
                                        {clean(currentAddr.phone) && <p className="text-xs font-medium text-gray-600 mb-1.5">Phone: <span className="font-semibold text-gray-900">{clean(currentAddr.phone)}</span></p>}
                                        {uniqueStreet.length > 0 ? <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{uniqueStreet.join(', ')}</p> : clean(currentAddr.address) ? <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{clean(currentAddr.address)}</p> : null}
                                        {regionParts.length > 0 && <p className="text-xs font-medium text-gray-500 mt-1">{regionParts.join(', ')}</p>}
                                    </div>
                                );
                            })()}
                        </motion.div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="sticky top-48 p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10"
                        >
                            <h4 className="text-xl font-bold text-white mb-6">Booking Summary</h4>

                            {/* Cart Items */}
                            <div className="space-y-3 mb-6">
                                {cartItems.map((item) => (
                                    <div key={item.itemId} className="flex justify-between text-sm">
                                        <div className="flex-1">
                                            <h6 className="text-white/90 font-bold">{item.itemName}</h6>
                                            <p className="text-[#04a99d] text-[10px] font-semibold uppercase tracking-wider mb-1">
                                                {item.packageName || 'Standard Package'}
                                            </p>
                                            <p className="text-white/40 text-[10px]">Qty: {item.quantity || 1}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-white/10 mb-4" />

                            {/* Pricing */}
                            <div className="space-y-2 mb-2">
                                {bookingCost > 0 && (
                                    <div className="flex justify-between items-start text-white/80">
                                        <div className="flex flex-col">
                                            <span>Platform Fee</span>
                                            <div className="flex items-center gap-1 text-[#04a99d] text-xs font-normal">
                                                <Info className="w-3 h-3" />
                                                <span>pay online</span>
                                            </div>
                                        </div>
                                        <span>₹{bookingCost.toFixed(2)}</span>
                                    </div>
                                )}

                                {inspectionCost > 0 && (
                                    <div className="flex flex-col gap-1 mt-4">
                                        <div className="flex justify-between items-start text-white/80">
                                            <div className="flex flex-col">
                                                <span>Doorstep Inspection Fee</span>
                                                <div className="flex items-center gap-1 text-[#04a99d] text-xs font-normal">
                                                    <Info className="w-3 h-3" />
                                                    <span>pay at Doorstep</span>
                                                </div>
                                            </div>
                                            <span>₹{inspectionCost.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-[10px] text-white/50 bg-white/5 p-2 rounded">
                                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#04a99d]" />
                                            <p>Note: This is the Platform fee only. The Doorstep Inspection Fee will be collected at Doorstep.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-white/10 mb-4" />

                            <div className="flex justify-between text-xl font-bold text-white mb-6">
                                <span>Total</span>
                                <span>{paymentMethod === 'COD' ? '₹0.00' : `₹${bookingCost.toFixed(2)}`}</span>
                            </div>
                            {paymentMethod === 'COD' && (
                                <div className="p-3 rounded-lg bg-[#037166]/10 border border-[#037166]/20 mb-4">
                                    <p className="text-white/70 text-xs">
                                        * Total ₹{bookingCost.toFixed(2)} to be paid to the technician after service completion.
                                    </p>
                                </div>
                            )}

                            {/* Selected Date/Time Preview */}
                            {bookedDate && bookedTime && (
                                <div className="p-4 rounded-lg bg-[#037166]/10 border border-[#037166]/20 mb-6">
                                    <p className="text-white/80 text-sm mb-2">Scheduled for:</p>
                                    <p className="text-white font-medium">
                                        {availableDates.find(d => d.value === bookedDate)?.label}
                                    </p>
                                    <p className="text-white font-medium">
                                        {availableTimesForSelectedDate.find(t => t.value === bookedTime)?.label}
                                    </p>
                                </div>
                            )}

                            {/* Confirm Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCheckout}
                                disabled={loading || !bookedDate || !bookedTime}
                                className={`w-full px-6 py-4 rounded-xl font-medium text-lg transition-all ${loading || !bookedDate || !bookedTime
                                    ? 'bg-white/20 text-white/60 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white hover:shadow-lg hover:shadow-[#037166]/40'
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </div>
                                ) : paymentMethod === 'COD' ? (
                                    `Confirm Booking (Pay After Service)`
                                ) : (
                                    `Confirm Booking - ₹${bookingCost.toFixed(2)}`
                                )}
                            </motion.button>

                            <p className="text-white/60 text-xs text-center mt-4">
                                You'll receive a confirmation email and SMS
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => {
                    setShowAuthModal(false);
                    // Navigate back if user closes without logging in
                    if (!isAuthenticated) {
                        onBack();
                    }
                }}
            />

            {/* Location Mismatch Alert Modal */}
            <AnimatePresence>
                {locationMismatch && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-amber-200 relative overflow-hidden"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
                                <MapPin className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Location Mismatch</h3>

                            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-4 space-y-2 text-xs">
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-gray-500 font-semibold">Your Service Address:</span>
                                    <span className="font-bold text-gray-900 text-right">{locationMismatch.userCity}</span>
                                </div>
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-gray-500 font-semibold">Selected Service Center:</span>
                                    <span className="font-bold text-amber-800 text-right">
                                        {locationMismatch.providerName} ({locationMismatch.providerCity})
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                Your service address is in <strong className="text-gray-900">{locationMismatch.userCity}</strong>, but the selected service center is located in <strong className="text-gray-900">{locationMismatch.providerCity}</strong>. This service center is unable to provide service at your location.
                                <br /><br />
                                Kindly select a service center at your location, or choose an address in <strong className="text-gray-900">{locationMismatch.providerCity}</strong>.
                            </p>

                            <div className="space-y-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLocationMismatch(null);
                                        router.push('/services/child/683dbc04b62d2a241de0f7e8?category=Services&name=Service%20Centers');
                                    }}
                                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#037166] to-[#04a99d] hover:brightness-105 transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    Select Service Center in {locationMismatch.userCity}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLocationMismatch(null);
                                        onBack();
                                    }}
                                    className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-center"
                                >
                                    Choose Another Address
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

