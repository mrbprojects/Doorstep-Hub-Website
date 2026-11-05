'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Clock, CreditCard, Wallet, Truck, CheckCircle, User, Loader2, Scissors, Info, Banknote, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { trackBookingCompleted, trackPaymentStarted } from '@/lib/leadTracking';
import { LocationMismatchModal, areCitiesMatching } from '@/components/shared/LocationMismatchModal';
import { verifyBookingPaymentStatus } from '@/lib/accountApi';

export default function SpaConfirmPage() {
    const router = useRouter();
    const { cartData, cartItems, loading: cartLoading, clearCart } = useServiceCart();
    const { token, isAuthenticated } = useAuth();

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [bookedDate, setBookedDate] = useState('');
    const [bookedTime, setBookedTime] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('ONLINE');
    const [paymentOption, setPaymentOption] = useState('ADVANCE');
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [locationMismatch, setLocationMismatch] = useState(null);
    const addressLine1 = [selectedAddress?.flat, selectedAddress?.area].filter(Boolean).join(', ');
    const addressLine2 = [selectedAddress?.cityName, selectedAddress?.postalCode].filter(Boolean).join(', ');

    // Mark client-side mount to avoid hydration mismatch with new Date()
    useEffect(() => { setMounted(true); }, []);

    // On mount: check if returning from Easebuzz payment gateway
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        if (status === 'success') {
            const urlOrderId = urlParams.get('orderId') || '';
            const urlTxnid = urlParams.get('txnid') || '';

            let pendingBooking = {};
            try { pendingBooking = JSON.parse(sessionStorage.getItem('pending_booking') || '{}'); } catch (e) {}
            if (!pendingBooking.bookedDate) {
                try { pendingBooking = JSON.parse(localStorage.getItem('spa_last_booking') || '{}'); } catch (e) {}
            }

            const orderId = urlOrderId || pendingBooking.orderId || '';
            const txnid = urlTxnid || pendingBooking.txnid || '';
            const date = urlParams.get('date') || pendingBooking.bookedDate || '';
            const time = urlParams.get('time') || pendingBooking.bookedTime || '';
            const paid = pendingBooking.paid || '0';
            const remaining = pendingBooking.remaining || '0';

            const proceedSuccess = () => {
                setPaymentStatus('success');
                clearCart();
                sessionStorage.removeItem('pending_booking');
                toast.success('Payment successful! Booking confirmed.');
                trackBookingCompleted(orderId, { vertical: 'spa-salon' });
                router.push(`/spa-salon/thank-you?orderId=${encodeURIComponent(orderId)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&paid=${encodeURIComponent(paid)}&remaining=${encodeURIComponent(remaining)}`);
            };

            if (token && (orderId || txnid)) {
                verifyBookingPaymentStatus(token, { orderId, txnid })
                    .then((verification) => {
                        if (verification.isPaid) {
                            proceedSuccess();
                        } else if (verification.status === 'pending' || verification.status === 'payment_pending') {
                            setPaymentStatus('pending');
                            toast.info('Payment is pending confirmation. Your cart is preserved.');
                        } else {
                            setPaymentStatus('failure');
                            toast.error('Payment verification failed.');
                        }
                    })
                    .catch(() => {
                        proceedSuccess();
                    });
            } else {
                proceedSuccess();
            }
        } else if (status === 'failure' || status === 'cancelled' || status === 'cancel') {
            setPaymentStatus('failure');
            toast.error('Payment was cancelled or could not be completed. You can try again or choose Pay After Service.');
            if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, [clearCart, router, token]);



    useEffect(() => {
        const savedAddress = sessionStorage.getItem('selected_address');
        if (savedAddress) {
            setSelectedAddress(JSON.parse(savedAddress));
        } else {
            toast.error("No address selected");
            router.push('/spa-salon/booking/address');
        }

        // Auto-select first available date
        const initialDates = getAvailableDates();
        if (initialDates.length > 0) {
            setBookedDate(initialDates[0].value);
        }
    }, [router]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isAuthenticated) {
                setShowAuthModal(true);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [isAuthenticated]);

    // Service window: 9 AM to 9 PM
    const SERVICE_START_HOUR = 9;
    const SERVICE_END_HOUR = 21;
    const BUFFER_HOURS = 2; // Spa might need less buffer than rituals

    const getAvailableDates = () => {
        const now = new Date();
        const dates = [];

        // Start showing Today from 9 AM till 8 PM (1 hour before 9 PM close)
        const todayLimit = new Date();
        todayLimit.setHours(SERVICE_END_HOUR - 1, 0, 0, 0);

        const startFromTomorrow = now > todayLimit;

        for (let i = (startFromTomorrow ? 1 : 0); i < 10 + (startFromTomorrow ? 1 : 0); i++) {
            const date = new Date();
            date.setDate(now.getDate() + i);
            dates.push({
                value: date.toISOString().split('T')[0],
                dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNumber: date.getDate().toString().padStart(2, '0'),
                month: date.toLocaleDateString('en-US', { month: 'short' }),
                fullLabel: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            });
        }
        return dates;
    };

    const getAvailableTimes = (selectedDateValue) => {
        const now = new Date();
        const selectedDate = new Date(selectedDateValue);

        const allTimeSlots = [
            { label: '09:00 AM - 11:00 AM', value: '09:00', startHour: 9 },
            { label: '11:00 AM - 01:00 PM', value: '11:00', startHour: 11 },
            { label: '01:00 PM - 03:00 PM', value: '13:00', startHour: 13 },
            { label: '03:00 PM - 05:00 PM', value: '15:00', startHour: 15 },
            { label: '05:00 PM - 07:00 PM', value: '17:00', startHour: 17 },
            { label: '07:00 PM - 09:00 PM', value: '19:00', startHour: 19 },
        ];

        if (selectedDate.toDateString() === now.toDateString()) {
            const currentHour = now.getHours();
            return allTimeSlots.filter(slot => slot.startHour > currentHour + 1); // 1 hour buffer for same day
        }

        return allTimeSlots;
    };

    // Only compute dates/times on the client to avoid hydration mismatch
    const availableDates = mounted ? getAvailableDates() : [];
    const availableTimesForSelectedDate = mounted ? getAvailableTimes(bookedDate) : [];

    useEffect(() => {
        setBookedTime('');
    }, [bookedDate]);

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to proceed');
            setShowAuthModal(true);
            return;
        }
        if (!selectedAddress) {
            toast.error('Please select an address');
            return;
        }
        if (!bookedDate || !bookedTime) {
            toast.error('Please select date and time');
            return;
        }

        // Mock Bypass
        const isMock = cartItems.some(item => item.providerId?.startsWith('mock_'));
        if (isMock) {
            toast.success('Mock Booking Confirmed!');
            const paid = paymentOption === 'ADVANCE'
                ? (cartData?.advPayment || 0)
                : (cartData?.finalAmount || 0);
            const remaining = paymentOption === 'ADVANCE'
                ? ((cartData?.finalAmount || 0) - (cartData?.advPayment || 0))
                : 0;
            router.push(`/spa-salon/thank-you?date=${bookedDate}&time=${bookedTime}&paid=${paid}&remaining=${remaining}`);
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        const isProfessional = cartItems.some(item => item.itemType === 'professional_service' || item.itemType === 'professional_addon');
        const checkoutProviderType = isProfessional ? 'professional' : 'regular';

        // Preflight location check
        const providerCity = cartData?.provider?.cityName;
        const userCity = selectedAddress?.cityName;
        if (providerCity && userCity && !areCitiesMatching(userCity, providerCity)) {
            setLocationMismatch({
                userCity: String(userCity),
                providerCity: String(providerCity),
                providerName: cartData?.provider?.businessName || cartData?.provider?.name || 'Selected Spa & Salon Professional'
            });
            return;
        }

        setLoading(true);
        try {
            let payload = {
                serviceAddressId: selectedAddress._id,
                bookedDate,
                bookedTime,
                paymentMethod,
                paymentOption,
                ...(paymentOption === 'ADVANCE' ? { adv: true } : {}),
                sourceOfLead: 'website',
                providerType: checkoutProviderType,
                returnUrl: `${window.location.protocol}//${window.location.host}${window.location.pathname}`,
                surl: `${window.location.protocol}//${window.location.host}${window.location.pathname}?status=success&date=${encodeURIComponent(bookedDate)}&time=${encodeURIComponent(bookedTime)}`,
                furl: `${window.location.protocol}//${window.location.host}${window.location.pathname}?status=cancelled`
            };

            const endpoint = paymentMethod === 'ONLINE'
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/service-cart/initiate-payment`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/service-cart/checkout`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                if (paymentMethod === 'ONLINE' && data.access_key) {
                    trackPaymentStarted({
                        vertical: 'spa-salon',
                        bookingId: data.bookingId || data.orderId,
                        eventData: { paymentMethod: 'ONLINE' },
                    });
                    // Use backend-calculated amounts
                    const paid = paymentOption === 'ADVANCE'
                        ? (cartData?.advPayment || 0)
                        : (cartData?.finalAmount || 0);
                    const remaining = paymentOption === 'ADVANCE'
                        ? ((cartData?.finalAmount || 0) - (cartData?.advPayment || 0))
                        : 0;

                    const pendingData = {
                        bookedDate,
                        bookedTime,
                        address: selectedAddress,
                        orderId: data.bookingId || data.orderId || null,
                        paid,
                        remaining
                    };
                    sessionStorage.setItem('pending_booking', JSON.stringify(pendingData));
                    if (selectedAddress) {
                        sessionStorage.setItem('selected_address', JSON.stringify(selectedAddress));
                    }
                    try { localStorage.setItem('spa_last_booking', JSON.stringify(pendingData)); } catch (e) {}

                    const easebuzzUrl = `https://pay.easebuzz.in/pay/${data.access_key}`;
                    toast.success('Redirecting to payment gateway...');
                    window.location.href = easebuzzUrl;
                } else {
                    // Use backend-calculated amounts
                    const paid = paymentOption === 'ADVANCE'
                        ? (cartData?.advPayment || 0)
                        : (cartData?.finalAmount || 0);
                    const remaining = paymentOption === 'ADVANCE'
                        ? ((cartData?.finalAmount || 0) - (cartData?.advPayment || 0))
                        : 0;

                    toast.success('Booking created successfully!');
                    trackBookingCompleted(data.bookingId || data.orderId, { vertical: 'spa-salon' });
                    clearCart();
                    if (paymentMethod === 'COD') {
                        router.push(`/spa-salon/thank-you-cod?date=${bookedDate}&time=${bookedTime}`);
                    } else {
                        router.push(`/spa-salon/thank-you?date=${bookedDate}&time=${bookedTime}&paid=${paid}&remaining=${remaining}`);
                    }
                }
            } else {
                if (data.code === 'LOCATION_MISMATCH') {
                    setLocationMismatch({
                        userCity: data.userCity || selectedAddress?.cityName,
                        providerCity: data.providerCity || 'Provider Location',
                        providerName: data.providerName || 'Selected Spa & Salon Professional',
                    });
                    return;
                }
                const detail = data.easebuzz?.error_desc || data.easebuzz?.data || data.error;
                toast.error(detail ? `${data.message || 'Checkout failed'}: ${detail}` : (data.message || 'Checkout failed'));
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Failed to complete checkout');
        } finally {
            setLoading(false);
        }
    };

    if (cartLoading && cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-[#6D1357] animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-20 pb-32 bg-gray-50"
        >
            {/* Header */}
            <section className=" top-20 z-40 bg-gradient-to-r from-[#C06C84] via-pink-600 to-[#6C5CE7] border-b border-white/10 shadow-lg">
                <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Address
                    </motion.button>

                    <div className="flex flex-col md:flex-row md:items-center justify-start gap-12">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl font-bold text-white flex items-center gap-4 shrink-0"
                        >
                            <Scissors className="w-8 h-8" />
                            Confirm Slot
                        </motion.h1>

                        <div className="flex-1 max-w-5xl">
                            <div className="flex items-center gap-8">
                                {['Selection', 'Address', 'Confirm & Pay'].map((step, index) => {
                                    const isCompleted = index < 2;
                                    const isCurrent = index === 2;
                                    return (
                                        <React.Fragment key={step}>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-white shadow-md' : isCurrent ? 'bg-white ring-4 ring-white/30 scale-110 shadow-lg' : 'bg-white/30'
                                                    }`}>
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-5 h-5 text-[#6D1357]" />
                                                    ) : (
                                                        <span className={`text-sm font-bold ${isCurrent ? 'text-[#6D1357]' : 'text-white/60'}`}>{index + 1}</span>
                                                    )}
                                                </div>
                                                <span className={`text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all hidden sm:inline ${isCurrent ? 'text-white' : 'text-white/70'
                                                    }`}>{step}</span>
                                            </div>
                                            {index < 2 && (
                                                <div className={`h-0.5 flex-1 mx-12 transition-all ${isCompleted ? 'bg-white/80' : 'bg-white/20'
                                                    }`} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Date Selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[#6D1357]" />
                                Select Date
                            </h3>
                            {availableDates.length === 0 ? (
                                <p className="text-gray-500 text-sm">No dates available at this time</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {availableDates.map((date) => (
                                        <button
                                            key={date.value}
                                            onClick={() => setBookedDate(date.value)}
                                            className={`p-4 rounded-2xl flex flex-col items-center gap-0.5 transition-all border-2 ${bookedDate === date.value
                                                ? 'bg-[#6D1357] border-[#6D1357] text-white shadow-lg'
                                                : 'bg-white border-gray-100 text-gray-700 hover:border-[#6D1357]/30'
                                                }`}
                                        >
                                            <span className={`text-[10px] uppercase font-bold tracking-widest ${bookedDate === date.value ? 'text-white/80' : 'text-gray-400'}`}>
                                                {date.dayName}
                                            </span>
                                            <span className="text-lg font-black tracking-tight">{date.dayNumber} {date.month}</span>
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
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#6D1357]" />
                                Select Time Slot
                            </h3>
                            {availableTimesForSelectedDate.length === 0 ? (
                                <p className="text-gray-500 text-sm">
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
                                                ? 'bg-[#6D1357] text-white shadow-lg shadow-[#6D1357]/30'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                        >
                                            {time.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Payment Option - Advance vs Full */}
                        {/* <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-2xl bg-white border-2 border-[#6D1357]/20 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#6D1357]" />
                                Payment Choice
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentOption('ADVANCE')}
                                    className={`p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${paymentOption === 'ADVANCE'
                                        ? 'border-[#6D1357] bg-[#6D1357]/5'
                                        : 'border-gray-100 hover:border-[#6D1357]/30 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`font-bold ${paymentOption === 'ADVANCE' ? 'text-[#6D1357]' : 'text-gray-900'}`}>
                                            Pay Advance
                                        </h4>
                                        {paymentOption === 'ADVANCE' && <CheckCircle className="w-5 h-5 text-[#6D1357]" />}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">Pay consultation fee + advance amount to confirm your slot.</p>
                                    <p className="text-2xl font-bold text-gray-900">₹{(cartData?.advPayment ?? 0).toFixed(2)}</p>
                                    <div className="mt-2 text-[10px] text-gray-400 uppercase font-bold tracking-wider">Slot Confirmed</div>
                                </button>

                                <button
                                    onClick={() => setPaymentOption('FULL')}
                                    className={`p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${paymentOption === 'FULL'
                                        ? 'border-[#6D1357] bg-[#6D1357]/5'
                                        : 'border-gray-100 hover:border-[#6D1357]/30 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`font-bold ${paymentOption === 'FULL' ? 'text-[#6D1357]' : 'text-gray-900'}`}>
                                            Full Payment
                                        </h4>
                                        {paymentOption === 'FULL' && <CheckCircle className="w-5 h-5 text-[#6D1357]" />}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">Pay total amount including all fees upfront.</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ₹{(cartData?.finalAmount ?? 0).toFixed(2)}
                                    </p>
                                    <div className="mt-2 text-[10px] text-gray-400 uppercase font-bold tracking-wider">Hassle Free</div>
                                </button>
                            </div>
                        </motion.div> */}

                        {/* Payment Method */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#6D1357]" />
                                Payment Method
                            </h3>
                            <p className="text-xs text-gray-400 mb-4">Choose your preferred payment method</p>

                            <div className="space-y-3">
                                {/* Option 1: Instant Online Payment */}
                                <div
                                    onClick={() => setPaymentMethod('ONLINE')}
                                    className={`p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all border ${
                                        paymentMethod === 'ONLINE'
                                            ? 'bg-gradient-to-r from-[#6D1357]/10 to-[#8E1B73]/10 border-[#6D1357] shadow-xs ring-1 ring-[#6D1357]/40'
                                            : 'bg-white hover:bg-gray-50/80 border-gray-200'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                        paymentMethod === 'ONLINE'
                                            ? 'bg-gradient-to-r from-[#6D1357] to-[#8E1B73] text-white shadow-xs'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-900 block">Instant Online Payment</span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#6D1357]/10 text-[#6D1357]">Fast &amp; Secure</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">Pay securely via UPI (GPay, PhonePe, Paytm), Credit/Debit Card, or Net Banking</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                        paymentMethod === 'ONLINE'
                                            ? 'border-[#6D1357] bg-[#6D1357] text-white'
                                            : 'border-gray-300 bg-white'
                                    }`}>
                                        {paymentMethod === 'ONLINE' && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                </div>

                                {/* Option 2: Pay After Service (Cash on Service Delivery) */}
                                <div
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all border ${
                                        paymentMethod === 'COD'
                                            ? 'bg-gradient-to-r from-[#6D1357]/10 to-[#8E1B73]/10 border-[#6D1357] shadow-xs ring-1 ring-[#6D1357]/40'
                                            : 'bg-white hover:bg-gray-50/80 border-gray-200'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                        paymentMethod === 'COD'
                                            ? 'bg-gradient-to-r from-[#6D1357] to-[#8E1B73] text-white shadow-xs'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        <Banknote className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-900 block">Pay After Service (Cash on Service Delivery)</span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">No Advance</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">Pay full payment with cash or UPI directly at salon / to specialist after service delivery</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                        paymentMethod === 'COD'
                                            ? 'border-[#6D1357] bg-[#6D1357] text-white'
                                            : 'border-gray-300 bg-white'
                                    }`}>
                                        {paymentMethod === 'COD' && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Service Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#6D1357]" />
                                Booking Address
                            </h3>
                            {selectedAddress ? (
                                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                    <p className="text-gray-900 font-medium mb-1">{selectedAddress.name || 'Address'}</p>
                                    {addressLine1 && <p className="text-gray-600 break-words">{addressLine1}</p>}
                                    {addressLine2 && <p className="text-gray-500 break-words">{addressLine2}</p>}
                                </div>
                            ) : (
                                <div className="p-4 rounded-lg bg-gray-50">
                                    <p className="text-gray-400">No address selected</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="sticky top-48 p-6 rounded-3xl bg-white border border-gray-200 shadow-xl"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                            {/* Service Details */}
                            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                                <div className="flex flex-col gap-3 mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-[#6D1357]/10 flex items-center justify-center text-[#6D1357]">
                                            <Scissors className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Services Selected</p>
                                            <p className="text-gray-900 font-bold">{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 space-y-2 pl-1">
                                        {cartItems.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">

                                                <div className="w-1.5 h-1.5 rounded-full bg-[#6D1357] mt-2"></div>

                                                <div className="flex justify-between w-full">
                                                    <span className="line-clamp-1">{item.itemName}</span>
                                                    <span className="font-medium text-gray-900">₹{Number(item.price).toFixed(2)}</span>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2.5 pt-1">
                                    {/* Subtotal */}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-gray-900 font-semibold">₹{(cartData?.totalServiceCost ?? 0).toFixed(2)}</span>
                                    </div>



                                    {/* GST */}
                                    {(cartData?.gstAmount ?? 0) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">GST (18%)</span>
                                            <span className="text-gray-900 font-semibold">₹{(cartData?.gstAmount ?? 0).toFixed(2)}</span>
                                        </div>
                                    )}

                                    {/* Consultation / Platform Fee */}
                                    {(cartData?.consultationFee ?? 0) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-500">Platform Fee</span>
                                                <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 cursor-help" title="Non-refundable booking fee">?</div>
                                            </div>
                                            <span className="text-gray-900 font-semibold">₹{(cartData?.consultationFee ?? 0).toFixed(2)}</span>
                                        </div>
                                    )}


                                    <div className="flex items-center gap-1.5 mt-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-1.5 h-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#6D1357" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 22a10 10 0 100-20 10 10 0 000 20z" />
                                        </svg>
                                        <span className='text-[#6D1357] text-[12px] font-medium'>Pay Online.</span>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-gray-200 pt-2.5">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span className="text-gray-700">Total Amount</span>
                                            <span className="text-gray-900">₹{(cartData?.finalAmount ?? 0).toFixed(2)}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Inclusive of all taxes & fees</p>
                                    </div>

                                    {/* Non-refundable note */}
                                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 22a10 10 0 100-20 10 10 0 000 20z" />
                                        </svg>
                                        <span>Platform fee is non-refundable.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Final Calculation */}
                            <div className="p-4 rounded-2xl bg-[#6D1357]/5 border border-[#6D1357]/20 mb-6">
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-600 font-medium">Payable Now</span>
                                    <span className="text-2xl font-black text-[#6D1357]">
                                        {paymentMethod === 'COD'
                                            ? '₹0.00'
                                            : `₹${(cartData?.finalAmount ?? 0).toFixed(2)}`}
                                    </span>
                                </div>
                                <p className="text-[10px] text-[#6D1357] uppercase font-bold">
                                    {paymentMethod === 'COD' ? 'Pay After Service Delivery' : 'Full Amount (incl. all fees)'}
                                </p>
                                {paymentMethod === 'COD' && (
                                    <p className="text-[11px] text-[#6D1357] font-medium mt-1.5 pt-1.5 border-t border-[#6D1357]/20">
                                        * Total ₹{(cartData?.finalAmount ?? 0).toFixed(2)} to be paid at salon or to specialist after service delivery.
                                    </p>
                                )}
                            </div>

                            {/* Confirm Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCheckout}
                                disabled={loading || !bookedDate || !bookedTime}
                                className={`w-full px-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${loading || !bookedDate || !bookedTime
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-[#6D1357] to-[#6C5CE7] text-white hover:shadow-[#6D1357]/40'
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Confirming...
                                    </div>
                                ) : paymentMethod === 'COD' ? (
                                    'Book Now (Pay After Service)'
                                ) : (
                                    `Book Now • ₹${(cartData?.finalAmount ?? 0).toFixed(2)}`
                                )}
                            </motion.button>

                            <div className="mt-4 space-y-1.5 text-center">
                                <p className="text-[10px] text-gray-400">
                                    By booking, you agree to our Terms &amp; Cancellation Policy.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-[10px] text-[#6D1357] bg-[#6D1357]/5 p-2.5 rounded-xl border border-[#6D1357]/10">
                                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="font-medium">As per RBI guidelines, payment gateway charges may apply depending on the mode of payment.</span>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => {
                    setShowAuthModal(false);
                    if (!isAuthenticated) {
                        router.back();
                    }
                }}
            />

            <LocationMismatchModal
                mismatch={locationMismatch}
                onClose={() => setLocationMismatch(null)}
                onSelectAnotherAddress={() => router.push('/spa-salon/booking/address')}
                browseUrl="/spa-salon"
                providerLabel="Spa & Salon Professional"
            />
        </motion.div>
    );
}

