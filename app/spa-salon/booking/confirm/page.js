'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Clock, CreditCard, Wallet, Truck, CheckCircle, User, Loader2, Scissors } from 'lucide-react';
import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

export default function SpaConfirmPage() {
    const router = useRouter();
    const { cartData, cartItems, loading: cartLoading } = useServiceCart();
    const { token, isAuthenticated } = useAuth();

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [bookedDate, setBookedDate] = useState('');
    const [bookedTime, setBookedTime] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // Default to Online for prepayment
    const [paymentOption, setPaymentOption] = useState('ADVANCE'); // 'ADVANCE' or 'FULL'
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const PLATFORM_FEE = 125;

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

    const availableDates = getAvailableDates();
    const availableTimesForSelectedDate = getAvailableTimes(bookedDate);

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
                ? ((cartData?.totalServiceCost || 0) * 0.25 + PLATFORM_FEE).toFixed(0)
                : ((cartData?.totalServiceCost || 0) + PLATFORM_FEE).toFixed(0);
            const remaining = paymentOption === 'ADVANCE'
                ? ((cartData?.totalServiceCost || 0) * 0.75).toFixed(0)
                : '0';

            router.push(`/spa-salon/thank-you?date=${bookedDate}&time=${bookedTime}&paid=${paid}&remaining=${remaining}`);
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        const isProfessional = cartItems.some(item => item.itemType === 'professional_service' || item.itemType === 'professional_addon');
        const checkoutProviderType = isProfessional ? 'professional' : 'regular';

        setLoading(true);
        try {
            let endpoint = '';
            let payload = {
                serviceAddressId: selectedAddress._id,
                bookedDate,
                bookedTime,
                paymentMethod,
                paymentOption, // 'ADVANCE' or 'FULL'
                sourceOfLead: 'website',
                providerType: checkoutProviderType
            };

            if (paymentMethod === 'ONLINE') {
                endpoint = 'https://api.doorstephub.com/v1/dhubApi/app/service-cart/initiate-payment';
            } else {
                endpoint = 'https://api.doorstephub.com/v1/dhubApi/app/service-cart/checkout';
            }

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
                    const easebuzzUrl = `https://testpay.easebuzz.in/pay/${data.access_key}`;
                    toast.success('Redirecting to payment gateway...');
                    window.location.href = easebuzzUrl;
                } else {
                    toast.success('Booking confirmed! Relax and enjoy.');
                    const paid = paymentOption === 'ADVANCE'
                        ? ((cartData?.totalServiceCost || 0) * 0.25 + PLATFORM_FEE).toFixed(0)
                        : ((cartData?.totalServiceCost || 0) + PLATFORM_FEE).toFixed(0);
                    const remaining = paymentOption === 'ADVANCE'
                        ? ((cartData?.totalServiceCost || 0) * 0.75).toFixed(0)
                        : '0';

                    router.push(`/spa-salon/thank-you?date=${bookedDate}&time=${bookedTime}&paid=${paid}&remaining=${remaining}`);
                }
            } else {
                toast.error(data.message || 'Checkout failed');
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
                <Loader2 className="w-10 h-10 text-[#C06C84] animate-spin" />
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
            <section className="sticky top-20 z-40 bg-gradient-to-r from-[#C06C84] via-pink-600 to-[#6C5CE7] border-b border-white/10 shadow-lg">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.back()}
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
                        <Scissors className="w-8 h-8" />
                        Confirm Slot
                    </motion.h1>
                </div>

                {/* Progress Indicator */}
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-6">
                    <div className="flex items-center gap-2">
                        {['Selection', 'Address', 'Confirm & Pay'].map((step, index) => {
                            const isCompleted = index < 2;
                            const isCurrent = index === 2;
                            return (
                                <React.Fragment key={step}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-white shadow-md' : isCurrent ? 'bg-white ring-4 ring-white/30 scale-110 shadow-lg' : 'bg-white/30'
                                            }`}>
                                            {isCompleted ? (
                                                <CheckCircle className="w-5 h-5 text-[#C06C84]" />
                                            ) : (
                                                <span className={`text-sm font-bold ${isCurrent ? 'text-[#C06C84]' : 'text-white/60'}`}>{index + 1}</span>
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
                                <Calendar className="w-5 h-5 text-[#C06C84]" />
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
                                                ? 'bg-[#C06C84] border-[#C06C84] text-white shadow-lg'
                                                : 'bg-white border-gray-100 text-gray-700 hover:border-[#C06C84]/30'
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
                                <Clock className="w-5 h-5 text-[#C06C84]" />
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
                                                ? 'bg-[#C06C84] text-white shadow-lg shadow-[#C06C84]/30'
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
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-2xl bg-white border-2 border-[#C06C84]/20 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#C06C84]" />
                                Payment Choice
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentOption('ADVANCE')}
                                    className={`p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${paymentOption === 'ADVANCE'
                                        ? 'border-[#C06C84] bg-[#C06C84]/5'
                                        : 'border-gray-100 hover:border-[#C06C84]/30 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`font-bold ${paymentOption === 'ADVANCE' ? 'text-[#C06C84]' : 'text-gray-900'}`}>
                                            Pay Advance
                                        </h4>
                                        {paymentOption === 'ADVANCE' && <CheckCircle className="w-5 h-5 text-[#C06C84]" />}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">Pay platform fee + 25% deposit to confirm your slot.</p>
                                    <p className="text-2xl font-bold text-gray-900">₹{((cartData?.totalServiceCost || 0) * 0.25 + PLATFORM_FEE).toFixed(0)}</p>
                                    <div className="mt-2 text-[10px] text-gray-400 uppercase font-bold tracking-wider">Slot Confirmed</div>
                                </button>

                                <button
                                    onClick={() => setPaymentOption('FULL')}
                                    className={`p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${paymentOption === 'FULL'
                                        ? 'border-[#C06C84] bg-[#C06C84]/5'
                                        : 'border-gray-100 hover:border-[#C06C84]/30 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`font-bold ${paymentOption === 'FULL' ? 'text-[#C06C84]' : 'text-gray-900'}`}>
                                            Full Payment
                                        </h4>
                                        {paymentOption === 'FULL' && <CheckCircle className="w-5 h-5 text-[#C06C84]" />}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">Pay total amount including service cost upfront.</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ₹{((cartData?.totalServiceCost || 0) + PLATFORM_FEE).toFixed(0)}
                                    </p>
                                    <div className="mt-2 text-[10px] text-gray-400 uppercase font-bold tracking-wider">Hassle Free</div>
                                </button>
                            </div>
                        </motion.div>

                        {/* Payment Method */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-[#C06C84]" />
                                Select Payment Method
                            </h3>
                            <div className="grid md:grid-cols-3 gap-3">
                                {[
                                    { id: 'ONLINE', label: 'Online Payment', icon: CreditCard },
                                    { id: 'WALLET', label: 'Wallet Pay', icon: Wallet },
                                    { id: 'COD', label: 'Pay at Store', icon: Truck },
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`p-5 rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === method.id
                                            ? 'bg-[#C06C84] text-white shadow-lg'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        <method.icon className={`w-6 h-6 ${paymentMethod === method.id ? 'text-white' : 'text-[#C06C84]'}`} />
                                        <span className="text-sm font-medium">{method.label}</span>
                                    </button>
                                ))}
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
                                <MapPin className="w-5 h-5 text-[#C06C84]" />
                                Booking Address
                            </h3>
                            {selectedAddress ? (
                                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                    <p className="text-gray-900 font-medium mb-1">{selectedAddress.name}</p>
                                    <p className="text-gray-600">{selectedAddress.flat}, {selectedAddress.area}</p>
                                    <p className="text-gray-500">{selectedAddress.cityName}, {selectedAddress.postalCode}</p>
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
                                        <div className="w-12 h-12 rounded-xl bg-[#C06C84]/10 flex items-center justify-center text-[#C06C84]">
                                            <Scissors className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Services Selected</p>
                                            <p className="text-gray-900 font-bold">{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 space-y-1 pl-1">
                                        {cartItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                                <div className="w-1 h-1 rounded-full bg-[#C06C84]" />
                                                <span className="line-clamp-1">{item.itemName}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 text-sm">Service Cost</span>
                                        <span className="text-gray-900 font-bold">₹{cartData?.totalServiceCost || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-500 text-sm">Platform Fee</span>
                                            <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 cursor-help" title="Booking & Platform Service Fee">?</div>
                                        </div>
                                        <span className="text-gray-900 font-bold">₹{PLATFORM_FEE}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Final Calculation */}
                            <div className="p-4 rounded-2xl bg-[#C06C84]/5 border border-[#C06C84]/20 mb-6">
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-600 font-medium">Payable Now</span>
                                    <span className="text-2xl font-black text-[#C06C84]">
                                        ₹{paymentOption === 'ADVANCE'
                                            ? ((cartData?.totalServiceCost || 0) * 0.25 + PLATFORM_FEE).toFixed(0)
                                            : ((cartData?.totalServiceCost || 0) + PLATFORM_FEE).toFixed(0)}
                                    </span>
                                </div>
                                <p className="text-[10px] text-[#C06C84] uppercase font-bold">
                                    {paymentOption === 'ADVANCE' ? 'Advance + Platform Fee' : 'Total Service Paid'}
                                </p>
                            </div>

                            {paymentOption === 'ADVANCE' && (
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm">Remaining to Pay</span>
                                        <span className="text-gray-900 font-bold">₹{((cartData?.totalServiceCost || 0) * 0.75).toFixed(0)}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase">Pay at store after service</p>
                                </div>
                            )}

                            {/* Confirm Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCheckout}
                                disabled={loading || !bookedDate || !bookedTime}
                                className={`w-full px-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${loading || !bookedDate || !bookedTime
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] text-white hover:shadow-[#C06C84]/40'
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Confirming...
                                    </div>
                                ) : (
                                    paymentOption === 'ADVANCE' ? 'Pay Advance & Book' : 'Pay Full Amount'
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
                        router.back();
                    }
                }}
            />
        </motion.div>
    );
}
