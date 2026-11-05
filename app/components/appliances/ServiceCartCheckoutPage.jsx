'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Calendar, Clock, Info, CreditCard, Wallet, Truck, Sparkles, CheckCircle, User, Loader2, Plus, Minus, Home, Briefcase, ShieldCheck, Check, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { BookingSteps, FLOW_TYPES } from '@/components/shared/BookingSteps';
import { useGlobalSettings } from '@/context/GlobalSettingsContext';
import { useRouter } from 'next/navigation';
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
    const { cartData, cartItems, clearCart, addToCart, removeFromCart } = useServiceCart();
    const { token, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    // Fees from GlobalSettingsContext (fetched once at app level)
    const { onlineBookingFee, doorstepInspectionFee } = useGlobalSettings() || {};

    // Calculate final payable amount directly from service-cart/get response
    const baseServiceCost = Number(cartData?.totalServiceCost || 0);
    const gstAmount = Number(cartData?.gstAmount || 0);
    // Platform Fee (non-refundable booking fee paid online) — ₹99 default
    const platformFee = Number(onlineBookingFee ?? cartData?.platformFee ?? 99);
    // Doorstep Inspection Fee (paid at doorstep by technician) — ₹175 default
    const consultationFee = Number(doorstepInspectionFee ?? cartData?.consultationFee ?? 175);
    // Grand total = service cost + GST + platform fee (doorstep fee is collected separately)
    const bookingCost = Number(cartData?.finalAmount || (baseServiceCost + gstAmount + platformFee));

    const [bookedDate, setBookedDate] = useState('');
    const [bookedTime, setBookedTime] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('ONLINE');
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [technicianPreference, setTechnicianPreference] = useState('any');
    const [walletBalance, setWalletBalance] = useState(0);
    const [walletData, setWalletData] = useState(null);
    const [walletLoading, setWalletLoading] = useState(false);
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

    // Ensure 100% complete address details even if sessionStorage had a partial snapshot
    useEffect(() => {
        if (!token || !selectedAddress?._id) return;
        if (!selectedAddress.addressLineOne || !selectedAddress.phone) {
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/useraddress/getuseraddress`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                        const match = data.data.find(a => a._id === selectedAddress._id);
                        if (match) {
                            setFullAddress(match);
                            sessionStorage.setItem('selected_address', JSON.stringify(match));
                        }
                    }
                })
                .catch(() => {});
        }
    }, [token, selectedAddress?._id, selectedAddress?.addressLineOne, selectedAddress?.phone]);

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
                    toast.error('Payment failed or was cancelled. Your booking details are preserved in cart.');
                }
            })
            .catch((err) => {
                console.error('[Payment] Verification error:', err);
                toast.error('Unable to verify payment with server. Your cart is preserved.');
            });
    }, [router, clearCart, token, onSuccess, bookingCost]);

    // Fetch Wallet Balance
    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (!token) return;
            setWalletLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/wallet/balance`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success && data.wallet) {
                    setWalletBalance(data.wallet.currentBalance || 0);
                    setWalletData(data.wallet);
                    setWalletLimits({
                        minWalletUsageOrderAmount: Number(data.minWalletUsageOrderAmount || 0),
                        maxWalletUsageOrderAmount: Number(data.maxWalletUsageOrderAmount || 0),
                        minWalletUsageEnabled: Boolean(data.minWalletUsageEnabled),
                        maxWalletUsageEnabled: Boolean(data.maxWalletUsageEnabled),
                    });
                }
            } catch (error) {
                console.error('Error fetching wallet balance:', error);
            } finally {
                setWalletLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchWalletBalance();
        }
    }, [token, isAuthenticated]);

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

    // Check authentication on mount
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            setShowAuthModal(true);
        }
    }, [isAuthenticated, authLoading]);

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

    const handleUpdateQuantity = async (item, delta) => {
        const newQuantity = (item.quantity || 1) + delta;

        if (newQuantity < 1) {
            await removeFromCart(item.itemId);
            return;
        }

        const providerId = cartData?.provider?._id;
        if (!providerId) return;

        await addToCart(
            providerId,
            item.itemId,
            item.itemType,
            delta,
            item.parentServiceId,
            cartData?.providerType || 'regular'
        );
    };

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
                    // DO NOT clear cart here — data must survive the redirect
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
                    // Cart will be cleared on return when ?status=success is detected
                    window.location.href = easebuzzUrl;
                } else {
                    // COD or Wallet payment successful
                    toast.success('Booking created successfully!');
                    clearCart(); // Clear cart only on successful booking
                    if (onSuccess) onSuccess(data);
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
            className="min-h-screen bg-[#f8fafc] pt-16 sm:pt-20 pb-16"
        >
            {/* Sleek Compact Header */}
            <section className="sticky top-16 sm:top-20 z-40 bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] border-b border-white/10 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
                        <div className="flex items-center gap-2.5">
                            <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={onBack}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all text-xs font-semibold flex-shrink-0"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Back</span>
                            </motion.button>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                                    <span>Confirm Your Booking</span>
                                </h1>
                                <p className="text-white/80 text-[11px] hidden sm:block">
                                    Select your preferred date, time slot & payment method
                                </p>
                            </div>
                        </div>

                        {/* Progress Stepper */}
                        <div className="scale-90 sm:scale-95 origin-left md:origin-right py-1">
                            <BookingSteps
                                flowType={FLOW_TYPES.SERVICE_CENTER}
                                currentStep="address"
                                serviceSlug="appliances"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
                <div className="grid lg:grid-cols-12 gap-5 lg:gap-6 items-start">
                    {/* Left Column: Form Cards */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-4">
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

                        {/* 1. Schedule Service (Date & Time unified) */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-4 sm:p-5"
                        >
                            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-gray-100">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-full bg-[#037166] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                        1
                                    </span>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-bold text-[#0f172a] flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[#037166]" />
                                            <span>Schedule Service</span>
                                        </h3>
                                        <p className="text-[11px] text-gray-500">Pick preferred appointment date and time</p>
                                    </div>
                                </div>
                                {bookedDate && bookedTime && (
                                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                                        <Check className="w-3.5 h-3.5" /> Slot Picked
                                    </span>
                                )}
                            </div>

                            {/* Date Selection */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                    Choose Date
                                </label>
                                {availableDates.length === 0 ? (
                                    <p className="text-gray-500 text-xs">No dates available at this time</p>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                        {availableDates.map((date) => {
                                            const isSelected = bookedDate === date.value;
                                            return (
                                                <button
                                                    key={date.value}
                                                    type="button"
                                                    onClick={() => setBookedDate(date.value)}
                                                    className={`px-2 py-2 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-0.5 border ${
                                                        isSelected
                                                            ? 'bg-gradient-to-br from-[#037166] to-[#04a99d] text-white border-[#037166] shadow-sm ring-2 ring-[#037166]/20'
                                                            : 'bg-gray-50 hover:bg-white text-gray-700 hover:text-gray-900 border-gray-200 hover:border-[#037166]/50'
                                                    }`}
                                                >
                                                    <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                        {date.label.split(' ')[0]}
                                                    </span>
                                                    <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                                                        {date.label.split(' ').slice(1).join(' ') || date.value.slice(5)}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Time Slot Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Choose Time Slot
                                    </label>
                                    {bookedTime && (
                                        <span className="text-[11px] text-[#037166] font-semibold">
                                            2-Hour Arrival Window
                                        </span>
                                    )}
                                </div>

                                {availableTimesForSelectedDate.length === 0 ? (
                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center text-xs text-gray-500">
                                        {bookedDate ? 'No time slots available for this date. Please pick another date.' : 'Please select a date above to view available time slots'}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {availableTimesForSelectedDate.map((time) => {
                                            const isSelected = bookedTime === time.value;
                                            return (
                                                <button
                                                    key={time.value}
                                                    type="button"
                                                    onClick={() => setBookedTime(time.value)}
                                                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
                                                        isSelected
                                                            ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white border-[#037166] shadow-sm ring-2 ring-[#037166]/20'
                                                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-[#037166]/50'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#037166]'}`} />
                                                        {time.label}
                                                    </span>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* 2. Technician Preference (Optional) */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-4 sm:p-5"
                        >
                            <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-gray-100">
                                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                    2
                                </span>
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-[#0f172a] flex items-center gap-2">
                                        <User className="w-4 h-4 text-[#037166]" />
                                        <span>Technician Preference</span>
                                        <span className="text-[11px] font-normal text-gray-400">(Optional)</span>
                                    </h3>
                                    <p className="text-[11px] text-gray-500">Choose who performs your appliance service</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                {[
                                    { value: 'any', label: 'Any Available', sub: 'Fastest dispatch (Recommended)' },
                                    { value: 'senior', label: 'Senior Technician', sub: '5+ yrs verified experience' },
                                    { value: 'same', label: 'Same as Last Time', sub: 'Preferred technician' },
                                ].map((option) => {
                                    const isSelected = technicianPreference === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setTechnicianPreference(option.value)}
                                            className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                                                isSelected
                                                    ? 'bg-[#f0fbf9] border-[#037166] text-[#037166] ring-1 ring-[#037166]'
                                                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold">{option.label}</span>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#037166] bg-[#037166]' : 'border-gray-300'}`}>
                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-500 mt-1">{option.sub}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* 3. Payment Method */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-4 sm:p-5"
                        >
                            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                        3
                                    </span>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-bold text-[#0f172a] flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-[#037166]" />
                                            <span>Select Payment Method</span>
                                        </h3>
                                        <p className="text-[11px] text-gray-500">Pay platform booking fee securely</p>
                                    </div>
                                </div>
                                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Safe
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Online Payment Card */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('ONLINE')}
                                    className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                                        paymentMethod === 'ONLINE'
                                            ? 'bg-[#f0fbf9] border-[#037166] text-[#037166] ring-1 ring-[#037166]'
                                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentMethod === 'ONLINE' ? 'bg-[#037166] text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                <CreditCard className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs sm:text-sm font-bold text-gray-900">Online Payment</h4>
                                                <span className="text-[10px] text-emerald-600 font-semibold">Instant Confirmation</span>
                                            </div>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'ONLINE' ? 'border-[#037166] bg-[#037166]' : 'border-gray-300'}`}>
                                            {paymentMethod === 'ONLINE' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-gray-100 text-[9px] text-gray-500">
                                        <span className="bg-gray-100 px-1 py-0.5 rounded font-medium text-gray-700">UPI</span>
                                        <span className="bg-gray-100 px-1 py-0.5 rounded font-medium text-gray-700">Cards</span>
                                        <span className="bg-gray-100 px-1 py-0.5 rounded font-medium text-gray-700">NetBanking</span>
                                    </div>
                                </button>

                                {/* Pay After Service (Cash on Service Delivery) */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                                        paymentMethod === 'COD'
                                            ? 'bg-[#f0fbf9] border-[#037166] text-[#037166] ring-1 ring-[#037166]'
                                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentMethod === 'COD' ? 'bg-[#037166] text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                <Banknote className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs sm:text-sm font-bold text-gray-900">Pay After Service</h4>
                                                <span className="text-[10px] text-emerald-600 font-semibold">Cash / UPI at Doorstep</span>
                                            </div>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'COD' ? 'border-[#037166] bg-[#037166]' : 'border-gray-300'}`}>
                                            {paymentMethod === 'COD' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 pt-2 border-t border-gray-100">
                                        Pay full payment directly to technician after service
                                    </p>
                                </button>

                                {/* Wallet Pay Card */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const reason = getWalletUsageBlockedReason(baseServiceCost);
                                        if (reason) {
                                            toast.error(reason);
                                            return;
                                        }
                                        setPaymentMethod('WALLET');
                                    }}
                                    className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                                        paymentMethod === 'WALLET'
                                            ? 'bg-[#f0fbf9] border-[#037166] text-[#037166] ring-1 ring-[#037166]'
                                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentMethod === 'WALLET' ? 'bg-[#037166] text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                <Wallet className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs sm:text-sm font-bold text-gray-900">D-Hub Wallet</h4>
                                                <span className="text-[10px] text-gray-500">
                                                    Bal: <strong className="text-gray-900 font-bold">₹{Number(walletBalance).toFixed(2)}</strong>
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'WALLET' ? 'border-[#037166] bg-[#037166]' : 'border-gray-300'}`}>
                                            {paymentMethod === 'WALLET' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic pt-2 border-t border-gray-100">
                                        {getWalletUsageBlockedReason(baseServiceCost) || 'Pay using D-Hub wallet balance'}
                                    </p>
                                </button>
                            </div>

                            {/* Active Wallet Details Box */}
                            {paymentMethod === 'WALLET' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3 p-4 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-xs"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-[9px] uppercase tracking-wider text-emerald-200 font-bold">D-Hub Active Wallet</span>
                                            <p className="text-xl !text-white  font-extrabold mt-0.5">₹{Number(walletBalance).toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-mono tracking-widest text-emerald-100">
                                                {walletData?.walletId ? `**** ${walletData.walletId.split('-').pop()}` : 'DH PAY'}
                                            </span>
                                            <span className="block text-[9px] text-emerald-200/80">Account Active</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* 4. Service Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-4 sm:p-5"
                        >
                            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                        4
                                    </span>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-bold text-[#0f172a] flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-[#037166]" />
                                            <span>Service Address</span>
                                        </h3>
                                        <p className="text-[11px] text-gray-500">Technician will visit this location</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (typeof onBack === 'function') {
                                            onBack();
                                        } else {
                                            router.push('/appliances/address');
                                        }
                                    }}
                                    className="text-xs font-bold text-[#037166] hover:text-[#025a51] hover:underline transition-colors"
                                >
                                    Change Address
                                </button>
                            </div>

                            {(() => {
                                const currentAddr = fullAddress || selectedAddress;
                                if (!currentAddr) {
                                    return (
                                        <div className="p-3.5 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-center">
                                            <p className="text-xs text-gray-500 mb-2">No service address selected</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (typeof onBack === 'function') {
                                                        onBack();
                                                    } else {
                                                        router.push('/appliances/address');
                                                    }
                                                }}
                                                className="px-3 py-1.5 rounded-lg bg-[#037166] text-white text-xs font-semibold hover:bg-[#025a51] transition-all"
                                            >
                                                Select Address
                                            </button>
                                        </div>
                                    );
                                }

                                const clean = (v) => (!v || String(v).trim().toUpperCase() === 'N/A' || String(v).trim().toUpperCase() === 'UNDEFINED' || String(v).trim().toUpperCase() === 'NULL' ? null : String(v).trim());

                                const streetParts = [
                                    clean(currentAddr.flat),
                                    clean(currentAddr.area),
                                    clean(currentAddr.addressLineOne),
                                    clean(currentAddr.addressLineTwo),
                                ].filter(Boolean);

                                const seen = new Set();
                                const uniqueStreet = streetParts.filter(s => {
                                    const k = s.toLowerCase();
                                    if (seen.has(k)) return false;
                                    seen.add(k);
                                    return true;
                                });

                                const regionParts = [
                                    clean(currentAddr.cityName || currentAddr.city),
                                    clean(currentAddr.stateName || currentAddr.state),
                                    clean(currentAddr.postalCode || currentAddr.pincode),
                                ].filter(Boolean);

                                const addrType = clean(currentAddr.type)?.toLowerCase();

                                return (
                                    <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-gray-200/80">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <div className="flex items-center gap-1.5 font-bold text-[#0f172a] text-sm">
                                                {addrType === 'home' ? (
                                                    <Home className="w-3.5 h-3.5 text-[#037166]" />
                                                ) : addrType === 'office' ? (
                                                    <Briefcase className="w-3.5 h-3.5 text-[#037166]" />
                                                ) : (
                                                    <MapPin className="w-3.5 h-3.5 text-[#037166]" />
                                                )}
                                                <span>{clean(currentAddr.name) || clean(currentAddr.userName) || 'Customer'}</span>
                                            </div>
                                            {clean(currentAddr.type) && (
                                                <span className="px-2 py-0.5 rounded-full bg-[#037166]/10 text-[#037166] text-[10px] font-bold uppercase tracking-wider">
                                                    {clean(currentAddr.type)}
                                                </span>
                                            )}
                                            {currentAddr.defaultAddress && (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                                                    DEFAULT
                                                </span>
                                            )}
                                        </div>

                                        {clean(currentAddr.phone) && (
                                            <p className="text-xs font-medium text-gray-600 mb-1">
                                                Phone: <span className="font-semibold text-gray-900">{clean(currentAddr.phone)}</span>
                                            </p>
                                        )}

                                        {uniqueStreet.length > 0 ? (
                                            <p className="text-xs text-gray-700 leading-relaxed font-normal">
                                                {uniqueStreet.join(', ')}
                                            </p>
                                        ) : clean(currentAddr.address) ? (
                                            <p className="text-xs text-gray-700 leading-relaxed font-normal">
                                                {clean(currentAddr.address)}
                                            </p>
                                        ) : null}

                                        {regionParts.length > 0 && (
                                            <p className="text-xs font-medium text-gray-500 mt-0.5">
                                                {regionParts.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}
                        </motion.div>
                    </div>

                    {/* Right Column: Booking Summary Sidebar */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="sticky top-28 space-y-3.5">
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="rounded-2xl bg-white border border-gray-200/90 shadow-sm p-4 sm:p-5"
                            >
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                    <h3 className="text-base font-bold text-gray-900">Booking Summary</h3>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                        {cartItems.length} {cartItems.length === 1 ? 'service' : 'services'}
                                    </span>
                                </div>

                                {/* Cart Items List */}
                                <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1 my-1.5">
                                    {cartItems.map((item) => (
                                        <div key={item.itemId} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate leading-snug">{item.itemName}</h4>
                                                {item.packageName && (
                                                    <span className="inline-block text-[10px] text-[#037166] font-semibold uppercase tracking-wider mt-0.5">
                                                        {item.packageName}
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateQuantity(item, -1)}
                                                            className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-lg transition-colors active:scale-90"
                                                            title="Decrease quantity"
                                                        >
                                                            <Minus className="w-2.5 h-2.5" />
                                                        </button>
                                                        <span className="w-6 text-center font-bold text-gray-900 text-xs">{item.quantity || 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateQuantity(item, 1)}
                                                            className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-lg transition-colors active:scale-90"
                                                            title="Increase quantity"
                                                        >
                                                            <Plus className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <span className="font-bold text-gray-900 text-sm">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                                                {item.quantity > 1 && (
                                                    <span className="block text-[10px] text-gray-400 font-normal">₹{item.price} each</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Services Subtotal</span>
                                        <span className="font-semibold text-gray-900">₹{baseServiceCost.toFixed(2)}</span>
                                    </div>

                                    {gstAmount > 0 && (
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <span>GST</span>
                                                <span className="text-[10px] px-1 rounded bg-gray-100 text-gray-600 border border-gray-200">18%</span>
                                            </span>
                                            <span className="font-semibold text-gray-900">₹{gstAmount.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center text-gray-600">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-700">Platform Fee</span>
                                            <span className="text-[10px] text-gray-400">Non-refundable booking fee</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">₹{platformFee.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-gray-600">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-700">Doorstep Inspection Fee</span>
                                            <span className="text-[10px] text-emerald-600 font-semibold">Pay at doorstep to technician</span>
                                        </div>
                                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                            ₹{consultationFee.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Total Payable Now */}
                                <div className="mt-3 pt-3 border-t-2 border-dashed border-gray-200">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                {paymentMethod === 'COD' ? 'Payable Now' : 'Payable Now Online'}
                                            </span>
                                            <h3 className="text-2xl font-black text-gray-900 leading-tight">
                                                {paymentMethod === 'COD' ? '₹0.00' : `₹${bookingCost.toFixed(2)}`}
                                            </h3>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                                            {paymentMethod === 'COD' ? 'Pay at Doorstep' : 'All Inclusive'}
                                        </span>
                                    </div>
                                    {paymentMethod === 'COD' ? (
                                        <p className="text-[10px] text-emerald-700 font-medium mt-1">
                                            * Total ₹{bookingCost.toFixed(2)} to be paid to technician after service completion.
                                        </p>
                                    ) : (
                                        <p className="text-[10px] text-gray-500 mt-1">
                                            *Inspection fee of ₹{consultationFee.toFixed(2)} will be collected after on-site inspection.
                                        </p>
                                    )}
                                </div>

                                {/* Scheduled Slot Chip */}
                                {bookedDate && bookedTime && (
                                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 font-semibold">
                                            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                                            {availableDates.find(d => d.value === bookedDate)?.label} • {availableTimesForSelectedDate.find(t => t.value === bookedTime)?.label}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase bg-emerald-200/60 px-1.5 py-0.5 rounded text-emerald-800">Selected</span>
                                    </div>
                                )}

                                {/* Primary Action Button */}
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={handleCheckout}
                                        disabled={loading || !bookedDate || !bookedTime}
                                        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-sm ${
                                            loading || !bookedDate || !bookedTime
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-[#037166] to-[#04a99d] hover:from-[#025a51] hover:to-[#038e83] text-white hover:shadow-md hover:shadow-[#037166]/20 active:scale-[0.99]'
                                        }`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Processing Booking...</span>
                                            </>
                                        ) : !bookedDate || !bookedTime ? (
                                            <span>Select Date & Time Slot Above</span>
                                        ) : paymentMethod === 'COD' ? (
                                            <>
                                                <span>Confirm Booking (Pay After Service)</span>
                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </>
                                        ) : paymentMethod === 'WALLET' ? (
                                            <>
                                                <span>Pay with Wallet • ₹{bookingCost.toFixed(2)}</span>
                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </>
                                        ) : (
                                            <>
                                                <span>Confirm & Pay ₹{bookingCost.toFixed(2)}</span>
                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                <p className="text-[#6b7280] text-[10px] text-center mt-3">
                                    By booking, you agree to our Terms & Cancellation Policy.
                                </p>

                                {/* Trust and Policy micro-strip */}
                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-3 text-[10px] text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Safe Checkout</span>
                                    </span>
                                    <span>•</span>
                                    <span>Verified Pros</span>
                                    <span>•</span>
                                    <span>RBI Compliant</span>
                                </div>
                            </motion.div>
                        </div>
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

