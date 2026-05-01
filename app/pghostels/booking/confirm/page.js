'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, MapPin, Calendar, Clock, CreditCard, Wallet,
    Truck, CheckCircle, Loader2, Building2, Info
} from 'lucide-react';

import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { useRef } from 'react';

// Safely convert any value (including nested objects) to a primitive for rendering
const safeStr = (val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val || fallback;
    if (typeof val === 'number') return val;
    if (typeof val === 'object') return val.title || val.name || val.label || val.value || fallback;
    return String(val) || fallback;
};
const safeNum = (val, fallback = 0) => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'number') return val;
    if (typeof val === 'object') return val.amount || val.value || fallback;
    return parseFloat(val) || fallback;
};

function PGConfirmContent() {
    const router = useRouter();
    const { cartData, cartItems, loading: cartLoading, cartError, fetchCart, addToCart, clearCart } = useServiceCart();
    const { token, isAuthenticated } = useAuth();

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [bookedDate, setBookedDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('ONLINE');
    const [paymentOption, setPaymentOption] = useState('ADVANCE'); // 'ADVANCE' or 'FULL'
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch from new Date() during SSR
    useEffect(() => { setMounted(true); }, []);

    // On mount: check if returning from Easebuzz payment gateway
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        if (status === 'success') {
            setPaymentStatus('success');
            // Payment confirmed — now safe to clear cart
            clearCart();

            const pendingBooking = JSON.parse(sessionStorage.getItem('pending_booking') || '{}');
            sessionStorage.removeItem('pending_booking');
            sessionStorage.removeItem('pg_booking_data');

            toast.success('Payment successful! Booking confirmed.');
            router.push(`/pghostels/booking/success?date=${pendingBooking.bookedDate || ''}&time=10:00&bookingId=${pendingBooking.bookingId || ''}`);
        } else if (status === 'failure') {
            setPaymentStatus('failure');
            toast.error('Payment failed. Redirecting to cart for retry...');
            setTimeout(() => {
                router.push('/pghostels/cart');
            }, 2000);
        }
    }, [clearCart, router]);

    // Service window: 9 AM to 9 PM
    const SERVICE_END_HOUR = 21;

    useEffect(() => {
        const savedAddress = sessionStorage.getItem('selected_address');
        if (savedAddress) {
            setSelectedAddress(JSON.parse(savedAddress));
        } else {
            toast.error('No address selected');
            router.push('/pghostels/booking/address');
        }

        // Auto-select first available date
        const initialDates = getAvailableDates();
        if (initialDates.length > 0) {
            setBookedDate(initialDates[0].value);
        }
    }, [router]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isAuthenticated) setShowAuthModal(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [isAuthenticated]);

    // Cart restoration if empty
    const cartRestoredRef = useRef(false);
    useEffect(() => {
        if (!isAuthenticated || cartLoading || cartItems.length > 0 || cartRestoredRef.current) return;
        const saved = sessionStorage.getItem('pg_booking_data');
        if (!saved) return;
        cartRestoredRef.current = true;
        (async () => {
            try {
                const { providerId, packageId, addons } = JSON.parse(saved);
                await addToCart(providerId, packageId, 'professional_service', 1, null, 'professional', true);
                if (Array.isArray(addons)) {
                    for (const addonId of addons) {
                        await addToCart(providerId, addonId, 'professional_addon', 1, packageId, 'professional', true);
                    }
                }
                toast.success('Booking details restored');
            } catch { console.warn('Cart restoration failed'); }
        })();
    }, [isAuthenticated, cartLoading, cartItems.length]);


    const getAvailableDates = () => {
        const now = new Date();
        const dates = [];
        const todayLimit = new Date();
        todayLimit.setHours(SERVICE_END_HOUR - 1, 0, 0, 0);
        const startFromTomorrow = now > todayLimit;

        for (let i = (startFromTomorrow ? 1 : 0); i < 10 + (startFromTomorrow ? 1 : 0); i++) {
            const date = new Date();
            date.setDate(now.getDate() + i);

            // BUG-R2-09 FIX: Use local date instead of UTC to avoid timezone shift
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const localDateStr = `${yyyy}-${mm}-${dd}`;

            dates.push({
                value: localDateStr,
                dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNumber: dd,
                month: date.toLocaleDateString('en-US', { month: 'short' }),
            });
        }
        return dates;
    };

    // Only compute on client to avoid hydration mismatch
    const availableDates = mounted ? getAvailableDates() : [];


    const handleCheckout = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to proceed');
            setShowAuthModal(true);
            return;
        }
        if (!selectedAddress) { toast.error('Please select an address'); return; }
        if (!bookedDate) { toast.error('Please select a move-in date'); return; }
        if (cartItems.length === 0) { toast.error('Your cart is empty'); return; }

        setLoading(true);
        try {
            const payload = {
                serviceAddressId: selectedAddress._id,
                bookedDate,
                bookedTime: '10:00',
                paymentMethod,
                paymentOption,
                ...(paymentOption === 'ADVANCE' ? { adv: true } : {}),
                sourceOfLead: 'website',
                providerType: 'professional',
                surl: `${window.location.protocol}//${window.location.host}${window.location.pathname}?status=success`,
                furl: `${window.location.protocol}//${window.location.host}/services/payment-failed?type=professional&deepType=PG Hostels`
            };

            const endpoint = paymentMethod === 'ONLINE'
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/service-cart/initiate-payment`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/service-cart/checkout`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                if (paymentMethod === 'ONLINE' && data.access_key) {
                    // Save pending booking details to sessionStorage before redirect
                    sessionStorage.setItem('pending_booking', JSON.stringify({
                        bookedDate,
                        address: selectedAddress,
                        bookingId: data.bookingId || data.orderId || data._id || null
                    }));

                    toast.success('Redirecting to payment gateway...');
                    window.location.href = `https://pay.easebuzz.in/pay/${data.access_key}`;
                } else {
                    sessionStorage.removeItem('pg_booking_data');
                    toast.success('Booking confirmed! Welcome to your new home.');
                    clearCart();
                    const bookingId = data.bookingId || data.orderId || data._id || '';
                    if (paymentMethod === 'COD') {
                        router.push(`/pghostels/booking/success-cod?date=${bookedDate}&bookingId=${bookingId}`);
                    } else {
                        router.push(`/pghostels/booking/success?date=${bookedDate}&time=10:00&bookingId=${bookingId}`);
                    }
                }
            } else {
                toast.error(data.message || 'Checkout failed');
            }
        } catch {
            toast.error('Failed to complete checkout');
        } finally {
            setLoading(false);
        }
    };

    if (cartLoading && cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-[#037166] animate-spin" />
            </div>
        );
    }

    if (cartError && cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <p className="text-gray-500 font-medium">Failed to load booking details.</p>
                <button
                    onClick={() => fetchCart()}
                    className="px-6 py-2 bg-[#037166] text-white rounded-xl font-semibold hover:bg-[#025a51] transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-[180px] md:pt-[160px] pb-32 bg-gray-50"
        >
            {/* Header */}
            <section className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-r from-[#037166] via-teal-600 to-[#04a99d] border-b border-white/10 shadow-lg">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => {
                            // BUG-R2-08 FIX: Preserve providerId on back navigation
                            const saved = sessionStorage.getItem('pg_booking_data');
                            let providerId = '';
                            if (saved) {
                                try {
                                    providerId = JSON.parse(saved).providerId;
                                } catch (e) { console.error(e); }
                            }
                            router.push(`/pghostels/booking/address${providerId ? `?providerId=${providerId}` : ''}`);
                        }}
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
                            className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3 shrink-0"
                        >
                            <Building2 className="w-8 h-8" />
                            Confirm Your Space In PG
                        </motion.h1>

                        <div className="flex-1 max-w-2xl">
                            <div className="flex items-center gap-2">
                                {['Select PG', 'Address', 'Confirm & Pay'].map((step, index) => {
                                    const isCompleted = index < 2;
                                    const isCurrent = index === 2;
                                    return (
                                        <React.Fragment key={step}>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-white shadow-md' : isCurrent ? 'bg-white ring-4 ring-white/30 scale-110 shadow-lg' : 'bg-white/30'
                                                    }`}>
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-5 h-5 text-[#037166]" />
                                                    ) : (
                                                        <span className={`text-sm font-bold ${isCurrent ? 'text-[#037166]' : 'text-white/60'}`}>{index + 1}</span>
                                                    )}
                                                </div>
                                                <span className={`text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all hidden sm:inline ${isCurrent ? 'text-white' : 'text-white/70'
                                                    }`}>{step}</span>
                                            </div>
                                            {index < 2 && (
                                                <div className={`h-0.5 flex-1 mx-2 transition-all ${isCompleted ? 'bg-white/80' : 'bg-white/20'
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

            <div className="max-w-[1200px] mx-auto mt-10 px-6 lg:px-8 py-8">
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
                                <Calendar className="w-5 h-5 text-[#037166]" />
                                Move-in Date
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
                                                ? 'bg-[#037166] border-[#037166] text-white shadow-lg'
                                                : 'bg-white border-gray-100 text-gray-700 hover:border-[#037166]/30'
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

                        {/* Available Rooms */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[#037166]" />
                                Available Rooms
                            </h3>
                            {cartItems.length === 0 ? (
                                <p className="text-gray-400 text-sm">No rooms in cart</p>
                            ) : (
                                <div className="space-y-3">
                                    {cartItems.map((item, idx) => {
                                        const roomName = typeof item.itemName === 'object'
                                            ? (item.itemName?.title || item.itemName?.name || 'Room')
                                            : (item.itemName || item.name || 'Room');
                                        const roomType = typeof item.itemType === 'object'
                                            ? (item.itemType?.title || item.itemType?.name || 'Hostel Room')
                                            : (item.itemType || 'Hostel Room');
                                        const roomPrice = typeof item.itemPrice === 'object'
                                            ? (item.itemPrice?.amount || 0)
                                            : (item.itemPrice || item.price || 0);
                                        return (
                                            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-[#037166]/5 border border-[#037166]/15">
                                                <div className="w-10 h-10 rounded-lg bg-[#037166]/10 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-5 h-5 text-[#037166]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">{roomName}</p>
                                                    <p className="text-sm text-gray-500">{roomType}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-[#037166]">₹{roomPrice}</p>
                                                    <p className="text-[10px] text-gray-400">/month</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {bookedDate && (
                                        <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <p className="text-xs text-green-700 font-medium">
                                                Room available from <strong>{new Date(bookedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>

                        {/* Payment Method — Online Only */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#037166]" />
                                Payment Method
                            </h3>
                            <p className="text-xs text-gray-400 mb-4">Secure online payment only</p>
                            <div className="p-5 rounded-xl flex items-center gap-4 bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-lg">
                                <CreditCard className="w-6 h-6 text-white" />
                                <div className="flex-1">
                                    <span className="text-sm font-semibold">Online Payment</span>
                                    <p className="text-xs text-white/70 mt-0.5">Pay securely via UPI / Card / Net Banking</p>
                                </div>
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        </motion.div>

                        {/* Payment Choice: Advance vs Full */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-[#037166]" />
                                Payment Choice
                            </h3>
                            <p className="text-xs text-gray-400 mb-4">Choose how much to pay now</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentOption('ADVANCE')}
                                    className={`p-5 rounded-2xl border-2 transition-all text-left ${
                                        paymentOption === 'ADVANCE'
                                            ? 'border-[#037166] bg-[#037166]/5'
                                            : 'border-gray-100 hover:border-[#037166]/30 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-bold text-sm ${paymentOption === 'ADVANCE' ? 'text-[#037166]' : 'text-gray-900'}`}>Pay Advance</h4>
                                        {paymentOption === 'ADVANCE' && <CheckCircle className="w-4 h-4 text-[#037166]" />}
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Pay advance to confirm your slot.</p>
                                    <p className="text-xl font-black text-gray-900">₹{cartData?.advPayment ?? 0}</p>
                                    <div className="mt-1 text-[10px] text-gray-400 uppercase font-bold">Slot Confirmed</div>
                                </button>
                                <button
                                    onClick={() => setPaymentOption('FULL')}
                                    className={`p-5 rounded-2xl border-2 transition-all text-left ${
                                        paymentOption === 'FULL'
                                            ? 'border-[#037166] bg-[#037166]/5'
                                            : 'border-gray-100 hover:border-[#037166]/30 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-bold text-sm ${paymentOption === 'FULL' ? 'text-[#037166]' : 'text-gray-900'}`}>Full Payment</h4>
                                        {paymentOption === 'FULL' && <CheckCircle className="w-4 h-4 text-[#037166]" />}
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Pay total amount including all fees.</p>
                                    <p className="text-xl font-black text-gray-900">₹{cartData?.finalAmount ?? 0}</p>
                                    <div className="mt-1 text-[10px] text-gray-400 uppercase font-bold">Hassle Free</div>
                                </button>
                            </div>
                        </motion.div>

                        {/* Booking Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#037166]" />
                                Booking Address
                            </h3>
                            {selectedAddress ? (
                                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                    <p className="text-gray-900 font-medium mb-1">{safeStr(selectedAddress.name)}</p>
                                    <p className="text-gray-600">{safeStr(selectedAddress.flat)}, {safeStr(selectedAddress.area)}</p>
                                    <p className="text-gray-500">{safeStr(selectedAddress.cityName)}, {safeStr(selectedAddress.postalCode)}</p>
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
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h3>

                            {/* Cart Items */}
                            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                                <div className="flex flex-col gap-3 mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-[#037166]/10 flex items-center justify-center text-[#037166]">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Items Selected</p>
                                            <p className="text-gray-900 font-bold">{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 space-y-1 pl-1">
                                        {cartItems.map((item, idx) => {
                                            const name = typeof item.itemName === 'object'
                                                ? (item.itemName?.title || item.itemName?.name || 'Room')
                                                : (item.itemName || item.name || 'Room');
                                            return (
                                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                                    <div className="w-1 h-1 rounded-full bg-[#037166]" />
                                                    <span className="line-clamp-1">{name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="space-y-2.5 pt-1">
                                    {/* Monthly Rent */}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Monthly Rent</span>
                                        <span className="text-gray-900 font-semibold">₹{safeNum(cartData?.totalServiceCost).toFixed(2)}</span>
                                    </div>

                                    {/* Platform Fee */}
                                    {safeNum(cartData?.consultationFee) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-500">Platform Fee</span>
                                                <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 cursor-help" title="Non-refundable booking fee">?</div>
                                            </div>
                                            <span className="text-gray-900 font-semibold">₹{safeNum(cartData?.consultationFee).toFixed(2)}</span>
                                        </div>
                                    )}

                                    {/* GST */}
                                    {safeNum(cartData?.gstAmount) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">GST (18%)</span>
                                            <span className="text-gray-900 font-semibold">₹{safeNum(cartData?.gstAmount).toFixed(2)}</span>
                                        </div>
                                    )}

                                    {/* Divider + Total */}
                                    <div className="border-t border-gray-200 pt-2.5">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span className="text-gray-700">Total Booking Fee</span>
                                            <span className="text-gray-900">₹{safeNum(cartData?.finalAmount || cartData?.totalServiceCost).toFixed(2)}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Inclusive of all taxes &amp; fees</p>
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

                            {/* Final Calculation Cards */}
                            <div className="p-4 rounded-2xl bg-[#037166]/5 border border-[#037166]/20 mb-4">
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-600 font-medium">Payable Now</span>
                                    <span className="text-2xl font-black text-[#037166]">
                                        ₹{paymentOption === 'ADVANCE' ? (cartData?.advPayment ?? 0).toFixed(2) : safeNum(cartData?.finalAmount || cartData?.totalServiceCost).toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-[10px] text-[#037166] uppercase font-bold">
                                    {paymentOption === 'ADVANCE' ? 'Advance Booking Fee' : 'Full Booking Fee'}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Remaining Amount</span>
                                    <span className="text-gray-900 font-bold">
                                        ₹{(safeNum(cartData?.totalServiceCost) + (paymentOption === 'ADVANCE' ? (safeNum(cartData?.finalAmount || cartData?.totalServiceCost) - safeNum(cartData?.advPayment)) : 0)).toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase leading-tight">
                                    Monthly rent of ₹{safeNum(cartData?.totalServiceCost).toFixed(2)} + dues to be paid directly at hostel
                                </p>
                            </div>

                            {/* Confirm Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCheckout}
                                disabled={loading || !bookedDate}
                                className={`w-full px-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${loading || !bookedDate
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white hover:shadow-[#037166]/40'
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Confirming...
                                    </div>
                                ) : (
                                    'Confirm Booking'
                                )}
                            </motion.button>

                            <div className="mt-4 space-y-1.5 text-center">
                                    <p className="text-[10px] text-gray-400">
                                        By booking, you agree to our Terms &amp; Cancellation Policy.
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-[10px] text-[#037166] bg-[#037166]/5 p-2.5 rounded-xl border border-[#037166]/10">
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
                        toast.error('Please login to continue your booking.');
                        router.push('/pghostels');
                    }
                }}
            />
        </motion.div>
    );
}

export default function PGConfirmPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-[#037166] animate-spin" />
            </div>
        }>
            <PGConfirmContent />
        </Suspense>
    );
}

