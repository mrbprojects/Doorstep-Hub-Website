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
    const { cartData, cartItems, loading: cartLoading, cartError, fetchCart, addToCart } = useServiceCart();
    const { token, isAuthenticated } = useAuth();

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [bookedDate, setBookedDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('ONLINE');
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

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

    const availableDates = getAvailableDates();


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
                paymentMethod, // BUG-R2-02 FIX: Use state variable instead of hardcoded 'ONLINE'
                sourceOfLead: 'website',
                providerType: 'professional',
            };

            const endpoint = paymentMethod === 'ONLINE'
                ? 'https://api.doorstephub.com/v1/dhubApi/app/service-cart/initiate-payment'
                : 'https://api.doorstephub.com/v1/dhubApi/app/service-cart/checkout';

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                if (paymentMethod === 'ONLINE' && data.access_key) {
                    toast.success('Redirecting to payment gateway...');
                    window.location.href = `https://testpay.easebuzz.in/pay/${data.access_key}`;
                } else {
                    sessionStorage.removeItem('pg_booking_data');
                    toast.success('Booking confirmed! Welcome to your new home.');
                    const bookingId = data.bookingId || data.orderId || data._id || '';
                    router.push(`/pghostels/booking/success?date=${bookedDate}&time=10:00&bookingId=${bookingId}`);
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
            className="min-h-screen pt-[300px] md:pt-[280px] pb-32 bg-gray-50"
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

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3"
                    >
                        <Building2 className="w-8 h-8" />
                        Confirm Your Space In PG
                    </motion.h1>
                </div>

                {/* Progress Indicator */}
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-6">
                    <div className="flex items-center gap-2">
                        {['Select PG', 'Address', 'Confirm & Pay'].map((step, index) => {
                            const isCompleted = index < 2;
                            const isCurrent = index === 2;
                            return (
                                <React.Fragment key={step}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-white shadow-md' : isCurrent ? 'bg-white ring-4 ring-white/30 scale-110 shadow-lg' : 'bg-white/30'
                                            }`}>
                                            {isCompleted ? (
                                                <CheckCircle className="w-5 h-5 text-[#037166]" />
                                            ) : (
                                                <span className={`text-sm font-bold ${isCurrent ? 'text-[#037166]' : 'text-white/60'}`}>{index + 1}</span>
                                            )}
                                        </div>
                                        <span className={`text-xs sm:text-sm font-medium transition-all ${isCurrent ? 'text-white font-bold' : 'text-white/70'
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

                        {/* Payment Method */}
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
                            <p className="text-xs text-gray-400 mb-4">Only online payment is accepted for PG bookings</p>
                            <div className="p-5 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-lg flex items-center gap-4">
                                <CreditCard className="w-6 h-6" />
                                <div>
                                    <p className="font-semibold">Online Payment</p>
                                    <p className="text-xs text-white/70">Secure payment via payment gateway</p>
                                </div>
                                <CheckCircle className="w-5 h-5 ml-auto" />
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
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Hostel Monthly Rent</span>
                                        <span className="text-gray-900 font-bold">₹{safeNum(cartData?.totalServiceCost)}</span>
                                    </div>
                                    {(safeNum(cartData?.platformFee) > 0) && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Platform Fee</span>
                                                <span className="text-gray-900 font-bold">₹{safeNum(cartData.platformFee)}</span>
                                            </div>
                                            {/* Info note */}
                                            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#037166]/8 border border-[#037166]/20">
                                                <Info className="w-4 h-4 text-[#037166] flex-shrink-0 mt-0.5" />
                                                <p className="text-xs text-[#037166] leading-snug">
                                                    This is the <strong>only amount you pay now</strong> to confirm your booking. Monthly rent is paid directly at the hostel.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    {(safeNum(cartData?.gstAmount) > 0) && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">GST</span>
                                            <span className="text-gray-900 font-bold">₹{safeNum(cartData.gstAmount)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="p-4 rounded-2xl bg-[#037166]/5 border border-[#037166]/20 mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600 font-medium">Total Payable Now</span>
                                    <span className="text-2xl font-black text-[#037166]">
                                        ₹{safeNum(cartData?.finalAmount || cartData?.totalServiceCost).toFixed(0)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                    <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                    <p className="text-[11px] text-amber-700 font-medium">
                                        Monthly rent of ₹{safeNum(cartData?.totalServiceCost)} is <strong>Pay at Hostel</strong> — not charged now
                                    </p>
                                </div>
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

                            <p className="mt-4 text-[10px] text-center text-gray-400">
                                By booking, you agree to our Terms & Cancellation Policy.
                            </p>
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
