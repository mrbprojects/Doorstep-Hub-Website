'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Clock, CreditCard, Wallet, Truck, Sparkles, CheckCircle, User, Loader2, Info } from 'lucide-react';

import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'next/link';
// Assuming AuthModal is available globally or similar path
// If not found, I will just omit it or use the standard one available
import { AuthModal } from '@/components/auth/AuthModal';

export default function ReligiousConfirmPage() {
    const router = useRouter();
    const { cartData, cartItems, loading: cartLoading, clearCart } = useServiceCart();
    const { token, isAuthenticated } = useAuth();

    // Address from session storage (selected in previous step - standardized key)
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [bookedDate, setBookedDate] = useState('');
    const [bookedTime, setBookedTime] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('ONLINE');
    const [paymentOption, setPaymentOption] = useState('ADVANCE'); // 'ADVANCE' or 'FULL'
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'failure' | null
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

            toast.success('Payment successful! Booking confirmed.');
            router.push(`/religious-services/thank-you?orderId=${pendingBooking.orderId || ''}&date=${pendingBooking.bookedDate || ''}&time=${pendingBooking.bookedTime || ''}`);
        } else if (status === 'failure') {
            setPaymentStatus('failure');
            toast.error('Payment failed. Redirecting to cart for retry...');
            setTimeout(() => {
                router.push('/religious-services/cart');
            }, 2000);
        }
    }, [clearCart, router]);
    const [technicianPreference, setTechnicianPreference] = useState('any');

    // Load address - using 'religious_booking_address' as set in previous step
    // OR 'selected_address' if matching PG Hostels strictly
    // PG Hostels uses 'selected_address'. Religious Address page I just wrote used 'religious_booking_address'. 
    // I should check both or standardize.
    useEffect(() => {
        const savedAddress = sessionStorage.getItem('religious_booking_address') || sessionStorage.getItem('selected_address');
        if (savedAddress) {
            setSelectedAddress(JSON.parse(savedAddress));
        } else {
            // If no address, redirect back
            toast.error("No address selected");
            router.push('/religious-services/booking/address');
        }
    }, [router]);

    // Check authentication on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isAuthenticated) {
                setShowAuthModal(true);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [isAuthenticated]);

    // Service window: 9 AM to 9 PM (9:00 to 21:00)
    const SERVICE_START_HOUR = 9;
    const SERVICE_END_HOUR = 21;
    const BUFFER_HOURS = 3;

    // Smart date availability logic (Exact match to PG)
    const getAvailableDates = () => {
        const now = new Date();
        const dates = [];
        let startDate = new Date(now);

        const todayCutoff = new Date();
        todayCutoff.setHours(SERVICE_END_HOUR - BUFFER_HOURS, 0, 0, 0);

        if (now > todayCutoff) {
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

    // Smart time slot availability (Exact match to PG)
    const getAvailableTimes = (selectedDateValue) => {
        const now = new Date();
        const selectedDate = new Date(selectedDateValue);

        const allTimeSlots = [
            { label: '09:00 AM - 11:00 AM', value: '09:00', startHour: 9, endHour: 11 },
            { label: '11:00 AM - 01:00 PM', value: '11:00', startHour: 11, endHour: 13 },
            { label: '01:00 PM - 03:00 PM', value: '13:00', startHour: 13, endHour: 15 },
            { label: '03:00 PM - 05:00 PM', value: '15:00', startHour: 15, endHour: 17 },
            { label: '05:00 PM - 07:00 PM', value: '17:00', startHour: 17, endHour: 19 },
            { label: '07:00 PM - 09:00 PM', value: '19:00', startHour: 19, endHour: 21 },
        ];

        if (selectedDate.toDateString() === now.toDateString()) {
            const currentHour = now.getHours();
            const cutoffHour = SERVICE_END_HOUR - BUFFER_HOURS;

            if (currentHour >= cutoffHour) {
                return [];
            }

            return allTimeSlots.filter(slot => slot.startHour > currentHour);
        }

        return allTimeSlots;
    };

    // Only compute on client to avoid hydration mismatch
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
        if (!bookedDate) {
            toast.error('Please select a date');
            return;
        }
        if (!bookedTime) {
            toast.error('Please select a time');
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
                paymentOption,
                ...(paymentOption === 'ADVANCE' ? { adv: true } : {}),
                sourceOfLead: 'website',
                providerType: checkoutProviderType,
                surl: `${window.location.protocol}//${window.location.host}${window.location.pathname}?status=success`,
                furl: `${window.location.protocol}//${window.location.host}/services/payment-failed?type=professional&deepType=Religious Services`
            };

            if (paymentMethod === 'ONLINE') {
                endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/service-cart/initiate-payment`;
            } else {
                endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/service-cart/checkout`;
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
                    // Save pending booking details to sessionStorage before redirect
                    sessionStorage.setItem('pending_booking', JSON.stringify({
                        bookedDate,
                        bookedTime,
                        address: selectedAddress,
                        orderId: data.bookingId || data.orderId || null
                    }));

                    const easebuzzUrl = `https://pay.easebuzz.in/pay/${data.access_key}`;
                    toast.success('Redirecting to payment gateway...');
                    window.location.href = easebuzzUrl;
                } else {
                    toast.success('Booking created successfully!');
                    clearCart();
                    if (paymentMethod === 'COD') {
                        router.push(`/religious-services/thank-you-cod?date=${bookedDate}&time=${bookedTime}`);
                    } else {
                        router.push(`/religious-services/thank-you?date=${bookedDate}&time=${bookedTime}`);
                    }
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
            <div className="min-h-screen flex items-center justify-center bg-[var(--off-white)]">
                <Loader2 className="w-10 h-10 text-[var(--saffron)] animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-20 pb-32 bg-[var(--off-white)]"
        >
            {/* Header - Religious Theme */}
            <section className="sticky top-20 z-40 bg-gradient-to-r from-[var(--saffron)] via-[var(--temple-red)] to-[var(--deep-charcoal)] border-b border-white/10 shadow-lg">
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

                    <div className="flex flex-col md:flex-row md:items-center justify-start gap-12">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3 shrink-0"
                        >
                            <Sparkles className="w-8 h-8" />
                            Confirm Your Ritual
                        </motion.h1>

                        <div className="flex-1 max-w-2xl">
                            <div className="flex items-center gap-2">
                                {['Selection', 'Address', 'Confirm & Pay'].map((step, index) => (
                                    <React.Fragment key={step}>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-[var(--saffron)]" />
                                            </div>
                                            <span className="text-white/90 text-[10px] md:text-sm font-bold uppercase tracking-wider hidden sm:inline">{step}</span>
                                        </div>
                                        {index < 2 && <div className="h-0.5 flex-1 bg-white/30" />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </section>

            <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Date Selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-[var(--deep-charcoal)] mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[var(--saffron)]" />
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
                                            className={`p-4 rounded-xl font-medium transition-all ${bookedDate === date.value
                                                ? 'bg-[var(--saffron)] text-white shadow-lg shadow-[var(--saffron)]/30'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
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
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-[var(--deep-charcoal)] mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[var(--saffron)]" />
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
                                                ? 'bg-[var(--saffron)] text-white shadow-lg shadow-[var(--saffron)]/30'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                        >
                                            {time.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Technician Preference (Optional) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-[var(--deep-charcoal)] mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-[var(--saffron)]" />
                                Service Preference (Optional)
                            </h3>
                            <div className="grid md:grid-cols-3 gap-3">
                                {[
                                    { value: 'any', label: 'Any Priest/Expert' },
                                    { value: 'senior', label: 'Senior Pandit' },
                                    { value: 'contact', label: 'Call before visit' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setTechnicianPreference(option.value)}
                                        className={`p-4 rounded-xl font-medium transition-all ${technicianPreference === option.value
                                            ? 'bg-[var(--saffron)] text-white'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>


                        {/* Payment Method — Online Only */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-[var(--deep-charcoal)] mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[var(--saffron)]" />
                                Payment Method
                            </h3>
                            <p className="text-xs text-gray-400 mb-4">Secure online payment only</p>
                            <div className="p-5 rounded-xl flex items-center gap-4 bg-[var(--saffron)] text-white shadow-lg">
                                <CreditCard className="w-6 h-6 text-white" />
                                <div className="flex-1">
                                    <span className="text-sm font-semibold">Online Payment</span>
                                    <p className="text-xs text-white/70 mt-0.5">Pay securely via UPI / Card / Net Banking</p>
                                </div>
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        </motion.div>



                        {/* Service Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-[var(--deep-charcoal)] mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[var(--saffron)]" />
                                Booking Address
                            </h3>
                            {selectedAddress ? (
                                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                    <p className="text-[var(--deep-charcoal)] font-medium mb-1">{selectedAddress.name}</p>
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
                            className="sticky top-48 p-6 rounded-2xl bg-white border border-gray-200 shadow-lg"
                        >
                            <h3 className="text-xl font-bold text-[var(--deep-charcoal)] mb-6">Order Summary</h3>

                            {/* Service Details */}
                            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                                <div className="flex flex-col gap-3 mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-[var(--saffron)]/10 flex items-center justify-center text-[var(--saffron)]">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Services Selected</p>
                                            <p className="text-gray-900 font-bold">{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 space-y-2 pl-1">
                                        {cartItems.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--saffron)] mt-2"></div>
                                                <div className="flex justify-between w-full">
                                                    <span className="line-clamp-1">{item.itemName}</span>
                                                    <span className="font-medium text-gray-900">₹{Number(item.subtotal || item.price || 0).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2.5 pt-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-gray-900 font-semibold">₹{(cartData?.totalServiceCost || 0).toFixed(2)}</span>
                                    </div>

                                    {(cartData?.gstAmount ?? 0) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">GST (18%)</span>
                                            <span className="text-gray-900 font-semibold">₹{(cartData?.gstAmount ?? 0).toFixed(2)}</span>
                                        </div>
                                    )}

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
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-1.5 h-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="var(--saffron)" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 22a10 10 0 100-20 10 10 0 000 20z" />
                                        </svg>
                                        <span className='text-[var(--saffron)] text-[12px]'>Pay Online.</span>
                                    </div>

                                    <div className="border-t border-gray-200 pt-2.5">
                                        <div className="flex justify-between font-bold text-sm">
                                            <span className="text-gray-800">Total Amount</span>
                                            <span className="text-gray-900">₹{(cartData?.finalAmount || 0).toFixed(2)}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Inclusive of all taxes &amp; fees</p>
                                    </div>

                                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                        <Info className="w-3 h-3 flex-shrink-0" />
                                        <span>Platform fee is non-refundable.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Final Calculation Cards */}
                            <div className="mt-6 p-4 rounded-2xl bg-[var(--saffron)]/5 border border-[var(--saffron)]/20 mb-4">
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-600 font-medium text-sm">Payable Now</span>
                                    <span className="text-2xl font-black text-[var(--saffron)]">
                                        ₹{paymentOption === 'ADVANCE' ? (cartData?.advPayment ?? 0).toFixed(2) : (cartData?.finalAmount ?? 0).toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-[10px] text-[var(--saffron)] uppercase font-bold">
                                    {paymentOption === 'ADVANCE' ? '' : 'Full Payment'}
                                </p>
                            </div>

                            {/* {paymentOption === 'ADVANCE' && (
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm">Remaining to Pay</span>
                                        <span className="text-gray-900 font-bold">₹{((cartData?.finalAmount ?? 0) - (cartData?.advPayment ?? 0)).toFixed(2)}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase">Pay at location after service</p>
                                </div>
                            )} */}

                            {/* Selected Date/Time Preview */}
                            {bookedDate && bookedTime && (
                                <div className="p-4 rounded-lg bg-[var(--saffron)]/5 border border-[var(--saffron)]/10 mb-6">
                                    <p className="text-gray-600 text-sm mb-2">Scheduled for:</p>
                                    <p className="text-[var(--saffron)] font-bold">
                                        {availableDates.find(d => d.value === bookedDate)?.label}
                                    </p>
                                    <p className="text-[var(--saffron)] font-bold">
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
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-[var(--saffron)] hover:bg-[var(--temple-red)] text-white hover:shadow-lg'
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    'Book Now'
                                )}
                            </motion.button>

                            <div className="mt-4 space-y-1.5 text-center">
                                <p className="text-[10px] text-gray-400">
                                    By booking, you agree to our Terms &amp; Cancellation Policy.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-[10px] text-[#ff9933] bg-[#ff9933]/5 p-2.5 rounded-xl border border-[#ff9933]/10">
                                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="font-medium">As per RBI guidelines, payment gateway charges may apply depending on the mode of payment.</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
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

