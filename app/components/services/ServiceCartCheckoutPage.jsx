'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Calendar, Clock, Info, CreditCard, Wallet, Truck, Sparkles, CheckCircle, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { BookingSteps, FLOW_TYPES } from '@/components/shared/BookingSteps';

export function ServiceCartCheckoutPage({ selectedAddress, onBack, onSuccess }) {
    const { cartData, cartItems } = useServiceCart();
    const { token, isAuthenticated } = useAuth();

    const bookingCost = cartData?.finalAmount || 0;
    const inspectionCost = cartItems.reduce((acc, item) => acc + (item.inspectionCost || 0), 0);

    const [bookedDate, setBookedDate] = useState('');
    const [bookedTime, setBookedTime] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [technicianPreference, setTechnicianPreference] = useState('any');

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

        setLoading(true);
        try {
            const endpoint = paymentMethod === 'ONLINE'
                ? 'https://api.doorstephub.com/v1/dhubApi/app/service-cart/initiate-payment'
                : 'https://api.doorstephub.com/v1/dhubApi/app/service-cart/checkout';

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
                    sourceOfLead: 'website'
                })
            });

            const data = await response.json();
            console.log('💳 Checkout Response:', data);

            if (data.success) {
                if (paymentMethod === 'ONLINE' && data.access_key) {
                    // Redirect to Easebuzz payment gateway with access_key
                    const easebuzzUrl = `https://testpay.easebuzz.in/pay/${data.access_key}`;
                    console.log('🔗 Redirecting to Easebuzz:', easebuzzUrl);
                    toast.success('Redirecting to payment gateway...');
                    window.location.href = easebuzzUrl;
                } else {
                    // COD or Wallet payment successful
                    toast.success('Booking created successfully!');
                    onSuccess && onSuccess(data);
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-20 pb-32"
        >
            {/* Header */}
            <section className="sticky top-20 z-40 bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] border-b border-white/10 shadow-lg">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
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
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-6">
                    <BookingSteps
                        flowType={FLOW_TYPES.SERVICE_CENTER}
                        currentStep="address"
                        serviceSlug="services"
                    />
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
                                    { id: 'COD', label: 'Cash on ServiceDelivery', icon: Truck },
                                    { id: 'WALLET', label: 'Wallet Pay', icon: Wallet },
                                    { id: 'ONLINE', label: 'Online Payment', icon: CreditCard },
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`p-5 rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === method.id
                                            ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-lg'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        <method.icon className={`w-6 h-6 ${paymentMethod === method.id ? 'text-white' : 'text-[#04a99d]'}`} />
                                        <h6 className="text-sm font-medium">{method.label}</h6>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Service Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10"
                        >
                            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#04a99d]" />
                                Service Address
                            </h4>
                            <div className="p-4 rounded-lg bg-white/5">
                                <h6 className="text-white font-medium mb-1">{selectedAddress?.name}</h6>
                                <p className="text-white/80">{selectedAddress?.flat}, {selectedAddress?.area}</p>
                                <p className="text-white/60">{selectedAddress?.cityName}, {selectedAddress?.postalCode}</p>
                            </div>
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
                                            <span>Online Consultation Fee</span>
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
                                            <p>Note: This is the online consultation fee only. The Doorstep Inspection Fee will be collected at Doorstep.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-white/10 mb-4" />

                            <div className="flex justify-between text-xl font-bold text-white mb-6">
                                <span>Total</span>
                                <span>₹{bookingCost.toFixed(2)}</span>
                            </div>

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
        </motion.div>
    );
}
