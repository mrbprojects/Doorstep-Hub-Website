'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Clock, CreditCard, Wallet, Truck, Sparkles, CheckCircle, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'next/link';
// Assuming AuthModal is available globally or similar path
// If not found, I will just omit it or use the standard one available
import { AuthModal } from '@/components/auth/AuthModal';

export default function ReligiousConfirmPage() {
    const router = useRouter();
    const { cartData, cartItems, loading: cartLoading } = useServiceCart();
    const { token, isAuthenticated } = useAuth();

    // Address from session storage (selected in previous step - standardized key)
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [bookedDate, setBookedDate] = useState('');
    const [bookedTime, setBookedTime] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
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
                    toast.success('Booking created successfully!');
                    router.push(`/religious-services/thank-you?date=${bookedDate}&time=${bookedTime}`);
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

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3"
                    >
                        <Sparkles className="w-8 h-8" />
                        Confirm Your Ritual
                    </motion.h1>
                </div>

                {/* Progress Indicator */}
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-6">
                    <div className="flex items-center gap-2">
                        {['Selection', 'Address', 'Confirm & Pay'].map((step, index) => (
                            <React.Fragment key={step}>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-[var(--saffron)]" />
                                    </div>
                                    <span className="text-white/90 text-sm font-medium hidden sm:inline">{step}</span>
                                </div>
                                {index < 2 && <div className="h-0.5 flex-1 bg-white/30" />}
                            </React.Fragment>
                        ))}
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


                        {/* Payment Method */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-[var(--deep-charcoal)] mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[var(--saffron)]" />
                                Select Payment Method
                            </h3>
                            <div className="grid md:grid-cols-3 gap-3">
                                {[
                                    { id: 'COD', label: 'Pay after Service', icon: Truck },
                                    { id: 'WALLET', label: 'Wallet Pay', icon: Wallet },
                                    { id: 'ONLINE', label: 'Online Payment', icon: CreditCard },
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`p-5 rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === method.id
                                            ? 'bg-[var(--saffron)] text-white shadow-lg'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        <method.icon className={`w-6 h-6 ${paymentMethod === method.id ? 'text-white' : 'text-[var(--saffron)]'}`} />
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
                            <h3 className="text-xl font-bold text-[var(--deep-charcoal)] mb-6">Booking Summary</h3>

                            {/* Cart Items */}
                            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                                {cartItems.map((item) => (
                                    <div key={item.itemId || item._id} className="flex justify-between text-sm">
                                        <div className="flex-1">
                                            <p className="text-[var(--deep-charcoal)] font-bold">{item.itemName}</p>
                                            <p className="text-gray-400 text-[10px]">Qty: {item.quantity || 1}</p>
                                        </div>
                                        <span className="text-[var(--deep-charcoal)] font-medium">₹{item.subtotal?.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-gray-100 mb-4" />

                            {/* Pricing */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{(cartData?.totalServiceCost || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Platform Fee</span>
                                    <span>₹{(cartData?.platformFee || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>GST</span>
                                    <span>₹{(cartData?.gstAmount || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 mb-4" />

                            <div className="flex justify-between text-xl font-bold text-[var(--saffron)] mb-6">
                                <span>Total</span>
                                <span>₹{(cartData?.finalAmount || 0).toFixed(2)}</span>
                            </div>

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
                                    `Pay ₹${(cartData?.finalAmount || 0).toFixed(2)}`
                                )}
                            </motion.button>
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
