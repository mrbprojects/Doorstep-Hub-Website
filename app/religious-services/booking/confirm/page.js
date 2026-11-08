'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, MapPin, Calendar, Clock, CreditCard, Sparkles, User, Loader2, Info, Check, ShieldCheck, Home, Briefcase, ChevronRight, Banknote
} from 'lucide-react';

import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useAuth } from '@/context/AuthContext';
import { useMounted } from '@/hooks/useMounted';
import { AuthModal } from '@/components/auth/AuthModal';
import { trackBookingCompleted, trackPaymentStarted } from '@/lib/leadTracking';
import { LocationMismatchModal, areCitiesMatching } from '@/components/shared/LocationMismatchModal';

const clean = (v) => {
    if (!v) return null;
    let s = String(v).trim().replace(/^[\s,]+|[\s,]+$/g, '').trim();
    if (!s || s.toUpperCase() === 'N/A' || s === ',' || s === '-') return null;
    return s;
};

const formatFullAddress = (addr) => {
    if (!addr) return { street: '', cityState: '', postalCode: '', hasDetails: false };

    const rawParts = [
        clean(addr.flat),
        clean(addr.area),
        clean(addr.addressLineOne),
        clean(addr.addressLineTwo)
    ].filter(Boolean);

    // Deduplicate identical parts and parts already contained as substrings in longer parts
    const filtered = [];
    for (const part of rawParts) {
        const lowerPart = part.toLowerCase();
        const isDuplicateOrSubstring = filtered.some(existing => {
            const lowerExisting = existing.toLowerCase();
            return lowerExisting === lowerPart || lowerExisting.includes(lowerPart);
        });
        if (!isDuplicateOrSubstring) {
            for (let i = filtered.length - 1; i >= 0; i--) {
                if (lowerPart.includes(filtered[i].toLowerCase())) {
                    filtered.splice(i, 1);
                }
            }
            filtered.push(part);
        }
    }

    const cityParts = [
        clean(addr.cityName),
        clean(addr.stateName)
    ].filter(Boolean);

    const pin = clean(addr.postalCode);

    return {
        street: filtered.join(', ').replace(/\s*,\s*,\s*/g, ', '),
        cityState: cityParts.join(', '),
        postalCode: pin,
        hasDetails: filtered.length > 0 || cityParts.length > 0
    };
};

const getAddressIcon = (type) => {
    const lower = type?.toLowerCase() || '';
    if (lower.includes('home')) return Home;
    if (lower.includes('work') || lower.includes('office')) return Briefcase;
    return MapPin;
};

export default function ReligiousConfirmPage() {
    const router = useRouter();
    const { cartData, cartItems, loading: cartLoading, clearCart } = useServiceCart();
    const { token, isAuthenticated } = useAuth();

    // Address from session storage (selected in previous step - standardized key)
    const [selectedAddress, setSelectedAddress] = useState(() => {
        if (typeof window === 'undefined') return null;
        try {
            const savedAddress = sessionStorage.getItem('religious_booking_address') || sessionStorage.getItem('selected_address');
            return savedAddress ? JSON.parse(savedAddress) : null;
        } catch {
            return null;
        }
    });

    const [bookedDate, setBookedDate] = useState('');
    const [bookedTime, setBookedTime] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('ONLINE');
    const [paymentOption, setPaymentOption] = useState('ADVANCE'); // 'ADVANCE' or 'FULL'
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const mounted = useMounted();
    const [locationMismatch, setLocationMismatch] = useState(null);

    // On mount: check if returning from Easebuzz payment gateway
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        if (status === 'success') {
            clearCart();

            let pendingBooking = {};
            try {
                pendingBooking = JSON.parse(sessionStorage.getItem('pending_booking') || '{}');
            } catch {}
            if (!pendingBooking.bookedDate) {
                try {
                    pendingBooking = JSON.parse(localStorage.getItem('religious_last_booking') || '{}');
                } catch {}
            }

            const orderId = urlParams.get('orderId') || pendingBooking.orderId || '';
            const date = urlParams.get('date') || pendingBooking.bookedDate || sessionStorage.getItem('religious_booking_date') || '';
            const time = urlParams.get('time') || pendingBooking.bookedTime || sessionStorage.getItem('religious_booking_time') || '';

            if (pendingBooking.address) {
                sessionStorage.setItem('religious_booking_address', JSON.stringify(pendingBooking.address));
            }

            toast.success('Payment successful! Booking confirmed.');
            router.push(`/religious-services/thank-you?orderId=${encodeURIComponent(orderId)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`);
        } else if (status === 'failure' || status === 'cancelled' || status === 'cancel') {
            toast.error('Payment was cancelled or could not be completed. You can try again or choose Pay After Service.');
            if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, [clearCart, router]);
    const [technicianPreference, setTechnicianPreference] = useState('any');

    // Load address - fetch default user address from API if not already in session storage
    useEffect(() => {
        if (selectedAddress) return;
        if (token) {
            let active = true;
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/useraddress/getuseraddress`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(data => {
                if (active && data.success && Array.isArray(data.data) && data.data.length > 0) {
                    const defaultAddr = data.data.find(a => a.defaultAddress) || data.data[0];
                    setSelectedAddress(defaultAddr);
                    sessionStorage.setItem('religious_booking_address', JSON.stringify(defaultAddr));
                }
            })
            .catch(err => console.error("Error fetching default address:", err));
            return () => { active = false; };
        }
    }, [token, selectedAddress]);

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
    const SERVICE_END_HOUR = 21;
    const BUFFER_HOURS = 3;

    // Smart date availability logic (Exact match to PG)
    const getAvailableDates = () => {
        const now = new Date();
        const dates = [];

        const todayCutoff = new Date();
        todayCutoff.setHours(SERVICE_END_HOUR - BUFFER_HOURS, 0, 0, 0);

        const startOffset = now > todayCutoff ? 1 : 0;

        for (let i = 0; i < 7; i++) {
            const offset = startOffset + i;
            const date = new Date();
            date.setDate(now.getDate() + offset);

            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const value = `${yyyy}-${mm}-${dd}`;

            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const dayLabel = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : dayName;
            const dateLabel = monthDay;
            const fullLabel = offset === 0 ? `Today, ${monthDay}` : offset === 1 ? `Tomorrow, ${monthDay}` : `${dayName}, ${monthDay}`;

            dates.push({
                value,
                dayLabel,
                dateLabel,
                label: fullLabel,
            });
        }
        return dates;
    };

    // Smart time slot availability (Exact match to PG)
    const getAvailableTimes = (selectedDateValue) => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        const allTimeSlots = [
            { label: '09:00 AM - 11:00 AM', value: '09:00', startHour: 9, endHour: 11 },
            { label: '11:00 AM - 01:00 PM', value: '11:00', startHour: 11, endHour: 13 },
            { label: '01:00 PM - 03:00 PM', value: '13:00', startHour: 13, endHour: 15 },
            { label: '03:00 PM - 05:00 PM', value: '15:00', startHour: 15, endHour: 17 },
            { label: '05:00 PM - 07:00 PM', value: '17:00', startHour: 17, endHour: 19 },
            { label: '07:00 PM - 09:00 PM', value: '19:00', startHour: 19, endHour: 21 },
        ];

        if (selectedDateValue === todayStr) {
            const currentHour = now.getHours();
            const cutoffHour = SERVICE_END_HOUR - BUFFER_HOURS;

            if (currentHour >= cutoffHour) {
                return [];
            }

            return allTimeSlots.filter(slot => slot.startHour >= currentHour + BUFFER_HOURS);
        }

        return allTimeSlots;
    };

    // Only compute on client to avoid hydration mismatch
    const availableDates = useMemo(() => {
        return mounted ? getAvailableDates() : [];
    }, [mounted]);

    const availableTimesForSelectedDate = useMemo(() => {
        return mounted ? getAvailableTimes(bookedDate) : [];
    }, [mounted, bookedDate]);

    // Auto-select first available date & reset time when date changes
    if (!bookedDate && availableDates.length > 0) {
        setBookedDate(availableDates[0].value);
    }
    const [prevBookedDate, setPrevBookedDate] = useState(bookedDate);
    if (prevBookedDate !== bookedDate) {
        setPrevBookedDate(bookedDate);
        setBookedTime('');
    }

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to proceed');
            setShowAuthModal(true);
            return;
        }
        if (!selectedAddress) {
            toast.error('Please select an address for this ritual');
            router.push('/religious-services/booking/address');
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

        // Preflight location check
        const providerCity = cartData?.provider?.cityName;
        const userCity = selectedAddress?.cityName;
        if (providerCity && userCity && !areCitiesMatching(userCity, providerCity)) {
            setLocationMismatch({
                userCity: String(userCity),
                providerCity: String(providerCity),
                providerName: cartData?.provider?.businessName || cartData?.provider?.name || 'Selected Priest / Ritual Specialist'
            });
            return;
        }

        setLoading(true);
        try {
            let endpoint = '';
            const origin = typeof window !== 'undefined'
                ? `${window.location.protocol}//${window.location.host}`
                : 'https://doorstephub.com';
            const currentCheckoutPath = typeof window !== 'undefined' ? window.location.pathname : '/religious-services/booking/confirm';
            const cleanBaseUrl = `${origin}${currentCheckoutPath}`;

            try {
                sessionStorage.setItem('last_checkout_url', currentCheckoutPath + (typeof window !== 'undefined' ? window.location.search : ''));
            } catch {}

            let payload = {
                serviceAddressId: selectedAddress._id || selectedAddress.id,
                bookedDate,
                bookedTime,
                paymentMethod,
                paymentOption,
                ...(paymentOption === 'ADVANCE' ? { adv: true } : { adv: false }),
                sourceOfLead: 'website',
                providerType: checkoutProviderType,
                returnUrl: cleanBaseUrl,
                surl: `${cleanBaseUrl}?status=success`,
                furl: `${origin}/services/payment-failed`,
                udf1: String(selectedAddress._id || selectedAddress.id || '').slice(0, 50),
                udf2: String(bookedDate || '').replace(/[^0-9-]/g, '').slice(0, 20),
                udf3: String(bookedTime || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20),
                udf4: String(paymentOption || 'FULL').slice(0, 20),
                udf5: String(checkoutProviderType || 'regular').slice(0, 20),
                udf6: 'website',
                udf7: 'doorstephub',
                udf8: 'religious',
                udf9: 'online',
                udf10: 'none'
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
                    trackPaymentStarted({
                        vertical: 'religious',
                        bookingId: data.bookingId || data.orderId,
                    });
                    // Save pending booking details to both sessionStorage and localStorage before redirect
                    const pendingData = {
                        bookedDate,
                        bookedTime,
                        address: selectedAddress,
                        orderId: data.bookingId || data.orderId || null
                    };
                    sessionStorage.setItem('pending_booking', JSON.stringify(pendingData));
                    sessionStorage.setItem('religious_booking_date', bookedDate);
                    sessionStorage.setItem('religious_booking_time', bookedTime);
                    if (selectedAddress) {
                        sessionStorage.setItem('religious_booking_address', JSON.stringify(selectedAddress));
                    }
                    try {
                        localStorage.setItem('religious_last_booking', JSON.stringify(pendingData));
                    } catch {}

                    try {
                        sessionStorage.setItem('last_checkout_url', currentCheckoutPath);
                    } catch {}
                    const easebuzzUrl = `https://pay.easebuzz.in/pay/${data.access_key}`;
                    toast.success('Redirecting to payment gateway...');
                    window.location.href = easebuzzUrl;
                } else {
                    toast.success('Booking created successfully!');
                    trackBookingCompleted(data.bookingId || data.orderId, { vertical: 'religious' });
                    if (selectedAddress) {
                        sessionStorage.setItem('religious_booking_address', JSON.stringify(selectedAddress));
                    }
                    clearCart();
                    if (paymentMethod === 'COD') {
                        router.push(`/religious-services/thank-you-cod?date=${bookedDate}&time=${bookedTime}`);
                    } else {
                        router.push(`/religious-services/thank-you?date=${bookedDate}&time=${bookedTime}`);
                    }
                }
            } else {
                if (data.code === 'LOCATION_MISMATCH') {
                    setLocationMismatch({
                        userCity: data.userCity || selectedAddress?.cityName,
                        providerCity: data.providerCity || 'Provider Location',
                        providerName: data.providerName || 'Selected Priest / Ritual Specialist',
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
            className="min-h-screen pt-16 sm:pt-20 pb-28 bg-[var(--off-white)]"
        >
            {/* Header - Religious Theme (Compact) */}
            <section className="sticky top-16 sm:top-20 z-40 bg-gradient-to-r from-[var(--saffron)] via-[var(--temple-red)] to-[var(--deep-charcoal)] border-b border-white/10 shadow-md">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white hover:bg-white/25 transition-all text-xs font-semibold"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Address</span>
                        </motion.button>
                        <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                            <span className="hidden sm:inline">Selected Services:</span>
                            <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
                                {cartItems.length} {cartItems.length === 1 ? 'Ritual' : 'Rituals'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-200" />
                                Confirm Your Ritual Booking
                            </h1>
                            <p className="text-white/80 text-xs mt-0.5">
                                Select ritual schedule and verify details before checkout
                            </p>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            {['Selection', 'Address', 'Confirm & Pay'].map((step, index) => {
                                const isCompleted = index < 2;
                                const isCurrent = index === 2;
                                return (
                                    <React.Fragment key={step}>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                isCompleted ? 'bg-white text-[var(--saffron)] shadow-xs' :
                                                isCurrent ? 'bg-amber-300 text-gray-900 ring-2 ring-white/40 font-extrabold shadow-sm' :
                                                'bg-white/20 text-white/60'
                                            }`}>
                                                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : index + 1}
                                            </div>
                                            <span className={`text-[11px] font-bold uppercase tracking-wider transition-all hidden md:inline ${
                                                isCurrent ? 'text-white' : 'text-white/70'
                                            }`}>
                                                {step}
                                            </span>
                                        </div>
                                        {index < 2 && <div className="w-6 sm:w-8 h-0.5 bg-white/25" />}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Main Left Content Column */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                        {/* 1. Date Selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-xs"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-[var(--deep-charcoal)] flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[var(--saffron)]" />
                                    <span>Select Ritual Date</span>
                                </h3>
                                {bookedDate && (
                                    <span className="text-xs font-bold text-[var(--saffron)] bg-amber-50 px-2 py-0.5 rounded-full border border-[var(--saffron)]/20">
                                        {availableDates.find(d => d.value === bookedDate)?.label}
                                    </span>
                                )}
                            </div>

                            {availableDates.length === 0 ? (
                                <p className="text-gray-500 text-xs py-3">No dates available at this time</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    {availableDates.map((date) => {
                                        const isSelected = bookedDate === date.value;
                                        return (
                                            <button
                                                key={date.value}
                                                type="button"
                                                onClick={() => setBookedDate(date.value)}
                                                className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all border ${
                                                    isSelected
                                                        ? 'bg-gradient-to-r from-[var(--saffron)] to-[var(--temple-red)] text-white shadow-md border-transparent ring-2 ring-[var(--saffron)]/25'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:border-[var(--saffron)]/40 hover:bg-amber-50/20'
                                                }`}
                                            >
                                                <span className={`text-[10px] uppercase font-bold tracking-wider ${
                                                    isSelected ? 'text-white/80' : 'text-gray-400'
                                                }`}>
                                                    {date.dayLabel || date.label}
                                                </span>
                                                <span className="text-sm font-extrabold mt-0.5">
                                                    {date.dateLabel || date.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>

                        {/* 2. Time Slot Selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-xs"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-[var(--deep-charcoal)] flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[var(--saffron)]" />
                                    <span>Select Time Slot</span>
                                </h3>
                                {bookedTime && (
                                    <span className="text-xs font-bold text-[var(--saffron)] bg-amber-50 px-2 py-0.5 rounded-full border border-[var(--saffron)]/20">
                                        {availableTimesForSelectedDate.find(t => t.value === bookedTime)?.label}
                                    </span>
                                )}
                            </div>

                            {availableTimesForSelectedDate.length === 0 ? (
                                <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    <Clock className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                                    <p className="text-gray-500 text-xs font-medium">
                                        {bookedDate
                                            ? 'No time slots available for selected date. Please choose another date.'
                                            : 'Please select a ritual date first to view available time slots.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {availableTimesForSelectedDate.map((time) => {
                                        const isSelected = bookedTime === time.value;
                                        return (
                                            <button
                                                key={time.value}
                                                type="button"
                                                onClick={() => setBookedTime(time.value)}
                                                className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all border ${
                                                    isSelected
                                                        ? 'bg-gradient-to-r from-[var(--saffron)] to-[var(--temple-red)] text-white shadow-md border-transparent ring-2 ring-[var(--saffron)]/25'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:border-[var(--saffron)]/40 hover:bg-amber-50/20'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                                                    <span>{time.label}</span>
                                                </div>
                                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>

                        {/* 3. Booking Address / Ritual Location */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-xs"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-[var(--deep-charcoal)] flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[var(--saffron)]" />
                                    <span>Ritual Location</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => router.push('/religious-services/booking/address')}
                                    className="text-xs font-bold text-[var(--saffron)] hover:text-[var(--temple-red)] transition-colors inline-flex items-center gap-1"
                                >
                                    <span>Change Address</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {selectedAddress ? (
                                (() => {
                                    const Icon = getAddressIcon(selectedAddress.type);
                                    const { street, cityState, postalCode } = formatFullAddress(selectedAddress);
                                    return (
                                        <div className="p-3.5 rounded-xl bg-amber-50/30 border border-amber-200/60 flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--saffron)]/15 text-[var(--saffron)] flex items-center justify-center shrink-0 mt-0.5">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-gray-900 capitalize">
                                                        {selectedAddress.type || 'Address'}
                                                    </span>
                                                    {selectedAddress.defaultAddress && (
                                                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[var(--saffron)]/15 text-[var(--saffron)]">
                                                            DEFAULT
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold text-gray-900 mb-0.5">
                                                    {selectedAddress.name}
                                                    {selectedAddress.phone && (
                                                        <span className="text-gray-700 font-semibold"> • {selectedAddress.phone}</span>
                                                    )}
                                                </p>
                                                {street && (
                                                    <p className="text-xs sm:text-[13px] text-gray-800 font-medium leading-relaxed break-words mb-1.5">
                                                        {street}
                                                    </p>
                                                )}
                                                {(cityState || postalCode) && (
                                                    <p className="text-xs text-gray-800 font-semibold flex items-center gap-1.5">
                                                        <span>{cityState}</span>
                                                        {postalCode && (
                                                            <span className="font-bold bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded text-[10px]">
                                                                PIN: {postalCode}
                                                            </span>
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="p-4 rounded-xl bg-gray-50 text-center">
                                    <p className="text-xs text-gray-500">No address selected.</p>
                                    <button
                                        onClick={() => router.push('/religious-services/booking/address')}
                                        className="mt-2 text-xs font-bold text-[var(--saffron)]"
                                    >
                                        Select Address
                                    </button>
                                </div>
                            )}
                        </motion.div>

                        {/* 4. Priest Preference (Optional) */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-xs"
                        >
                            <h3 className="text-base font-bold text-[var(--deep-charcoal)] mb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-[var(--saffron)]" />
                                <span>Priest / Specialist Preference (Optional)</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                {[
                                    { value: 'any', label: 'Any Vedic Priest' },
                                    { value: 'senior', label: 'Senior Pandit' },
                                    { value: 'contact', label: 'Call Before Visit' },
                                ].map((option) => {
                                    const isSelected = technicianPreference === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setTechnicianPreference(option.value)}
                                            className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                                                isSelected
                                                    ? 'bg-[var(--saffron)] text-white border-[var(--saffron)] shadow-xs'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                            <span>{option.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* 5. Payment Method */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-xs"
                        >
                            <h3 className="text-base font-bold text-[var(--deep-charcoal)] mb-1 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[var(--saffron)]" />
                                <span>Payment Method</span>
                            </h3>
                            <p className="text-xs text-gray-500 mb-3.5">Choose your preferred payment method</p>
                            
                            <div className="space-y-3">
                                {/* Option 1: Instant Online Payment */}
                                <div
                                    onClick={() => setPaymentMethod('ONLINE')}
                                    className={`p-3.5 rounded-xl flex items-center gap-3.5 cursor-pointer transition-all border ${
                                        paymentMethod === 'ONLINE'
                                            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-[var(--saffron)] shadow-xs ring-1 ring-[var(--saffron)]/40'
                                            : 'bg-white hover:bg-gray-50/80 border-gray-200'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                        paymentMethod === 'ONLINE'
                                            ? 'bg-[var(--saffron)] text-white shadow-xs'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs sm:text-sm font-bold text-gray-900 block">Instant Online Payment</span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Fast &amp; Secure</span>
                                        </div>
                                        <p className="text-[11px] text-gray-600 mt-0.5">Pay securely via UPI (GPay, PhonePe, Paytm), Credit/Debit Card, or Net Banking</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                        paymentMethod === 'ONLINE'
                                            ? 'border-[var(--saffron)] bg-[var(--saffron)] text-white'
                                            : 'border-gray-300 bg-white'
                                    }`}>
                                        {paymentMethod === 'ONLINE' && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                </div>

                                {/* Option 2: Pay After Service (Cash on Service Delivery) */}
                                <div
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`p-3.5 rounded-xl flex items-center gap-3.5 cursor-pointer transition-all border ${
                                        paymentMethod === 'COD'
                                            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-[var(--saffron)] shadow-xs ring-1 ring-[var(--saffron)]/40'
                                            : 'bg-white hover:bg-gray-50/80 border-gray-200'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                        paymentMethod === 'COD'
                                            ? 'bg-[var(--saffron)] text-white shadow-xs'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        <Banknote className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs sm:text-sm font-bold text-gray-900 block">Pay After Service (Cash on Service Delivery)</span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">No Advance</span>
                                        </div>
                                        <p className="text-[11px] text-gray-600 mt-0.5">Pay full payment with cash or UPI directly to priest after ritual completion</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                        paymentMethod === 'COD'
                                            ? 'border-[var(--saffron)] bg-[var(--saffron)] text-white'
                                            : 'border-gray-300 bg-white'
                                    }`}>
                                        {paymentMethod === 'COD' && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                </div>

                                {/* Online Payment Option Selection */}
                                {paymentMethod === 'ONLINE' && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            Online Payment Choice
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => setPaymentOption('ADVANCE')}
                                                className={`p-3 rounded-xl border text-left transition-all ${paymentOption === 'ADVANCE'
                                                    ? 'border-[var(--saffron)] bg-amber-50/60 ring-1 ring-[var(--saffron)]/30'
                                                    : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-gray-900">Pay Advance</span>
                                                    {paymentOption === 'ADVANCE' && <Check className="w-4 h-4 text-[var(--saffron)]" />}
                                                </div>
                                                <p className="text-[11px] text-gray-500 mb-1.5">Platform advance fee to confirm booking</p>
                                                <p className="text-base font-extrabold text-[var(--saffron)]">
                                                    ₹{(cartData?.advPayment ?? 0).toFixed(2)}
                                                </p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPaymentOption('FULL')}
                                                className={`p-3 rounded-xl border text-left transition-all ${paymentOption === 'FULL'
                                                    ? 'border-[var(--saffron)] bg-amber-50/60 ring-1 ring-[var(--saffron)]/30'
                                                    : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-gray-900">Full Payment</span>
                                                    {paymentOption === 'FULL' && <Check className="w-4 h-4 text-[var(--saffron)]" />}
                                                </div>
                                                <p className="text-[11px] text-gray-500 mb-1.5">Pay complete ritual amount upfront online</p>
                                                <p className="text-base font-extrabold text-gray-900">
                                                    ₹{(cartData?.finalAmount ?? 0).toFixed(2)}
                                                </p>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Order Summary Sidebar */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="sticky top-24 p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-md space-y-4"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <h3 className="text-base font-bold text-[var(--deep-charcoal)]">Order Summary</h3>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                    {cartItems.length} {cartItems.length === 1 ? 'Service' : 'Services'}
                                </span>
                            </div>

                            {/* Scheduled for preview */}
                            {bookedDate && bookedTime && (
                                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-200/80">
                                    <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--saffron)] mb-1">
                                        Scheduled Appointment
                                    </p>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                                        <Calendar className="w-3.5 h-3.5 text-[var(--saffron)]" />
                                        <span>{availableDates.find(d => d.value === bookedDate)?.label}</span>
                                        <span className="text-gray-300">•</span>
                                        <Clock className="w-3.5 h-3.5 text-[var(--saffron)]" />
                                        <span>{availableTimesForSelectedDate.find(t => t.value === bookedTime)?.label}</span>
                                    </div>
                                </div>
                            )}

                            {/* Cart items list */}
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-50">
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="pt-1.5 first:pt-0 flex items-start justify-between gap-2 text-xs">
                                        <div className="flex items-start gap-1.5 min-w-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--saffron)] mt-1.5 shrink-0" />
                                            <span className="text-gray-700 font-medium line-clamp-1">{item.itemName}</span>
                                        </div>
                                        <span className="font-bold text-gray-900 shrink-0">
                                            ₹{Number(item.subtotal || item.price || 0).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Fee Breakdown */}
                            <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-gray-900">₹{(cartData?.totalServiceCost || 0).toFixed(2)}</span>
                                </div>

                                {(cartData?.gstAmount ?? 0) > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>GST (18%)</span>
                                        <span className="font-semibold text-gray-900">₹{(cartData?.gstAmount ?? 0).toFixed(2)}</span>
                                    </div>
                                )}

                                {(cartData?.consultationFee ?? 0) > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <span>Platform Fee</span>
                                        </span>
                                        <span className="font-semibold text-gray-900">₹{(cartData?.consultationFee ?? 0).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="border-t border-gray-200 pt-2.5 flex justify-between items-baseline">
                                    <span className="text-sm font-bold text-gray-900">Total Amount</span>
                                    <span className="text-lg font-extrabold text-gray-900">
                                        ₹{(cartData?.finalAmount || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Payable Now Card */}
                            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-[var(--saffron)]/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-gray-600 font-medium block">Payable Now</span>
                                        <span className="text-[10px] text-[var(--saffron)] font-bold uppercase tracking-wider">
                                            {paymentMethod === 'COD'
                                                ? 'Pay After Service'
                                                : paymentOption === 'ADVANCE'
                                                    ? 'Platform Fee'
                                                    : 'Full Payment'}
                                        </span>
                                    </div>
                                    <span className="text-2xl font-black text-[var(--saffron)]">
                                        {paymentMethod === 'COD'
                                            ? '₹0.00'
                                            : `₹${paymentOption === 'ADVANCE' ? (cartData?.advPayment ?? 0).toFixed(2) : (cartData?.finalAmount ?? 0).toFixed(2)}`}
                                    </span>
                                </div>
                                {paymentMethod === 'COD' && (
                                    <p className="text-[10px] text-amber-800 font-medium mt-1.5 pt-1.5 border-t border-[var(--saffron)]/20">
                                        * Total ₹{(cartData?.finalAmount || 0).toFixed(2)} to be paid to priest after ritual completion.
                                    </p>
                                )}
                            </div>

                            {/* CTA Button */}
                            <div>
                                {(!bookedDate || !bookedTime) && (
                                    <p className="text-[11px] text-amber-600 font-semibold text-center mb-1.5">
                                        Please select date &amp; time slot above
                                    </p>
                                )}
                                <button
                                    onClick={handleCheckout}
                                    disabled={loading || !bookedDate || !bookedTime}
                                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
                                        loading || !bookedDate || !bookedTime
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-[var(--saffron)] to-[var(--temple-red)] text-white shadow-md hover:shadow-lg hover:shadow-[var(--saffron)]/30 active:scale-98'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : paymentMethod === 'COD' ? (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>Book Now (Pay After Service)</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>
                                                Book Now • ₹{paymentOption === 'ADVANCE' ? (cartData?.advPayment ?? 0).toFixed(2) : (cartData?.finalAmount ?? 0).toFixed(2)}
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="pt-2 text-center space-y-1">
                                <p className="text-[10px] text-gray-400">
                                    By continuing, you agree to our Terms &amp; Cancellation Policy.
                                </p>
                                <div className="flex items-center justify-center gap-1.5 text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/50">
                                    <Info className="w-3 h-3 text-amber-700 shrink-0" />
                                    <span>Instant confirmation &amp; verified Vedic priests.</span>
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

            <LocationMismatchModal
                mismatch={locationMismatch}
                onClose={() => setLocationMismatch(null)}
                onSelectAnotherAddress={() => router.push('/religious-services/booking/address')}
                browseUrl="/religious-services"
                providerLabel="Priest / Ritual Specialist"
            />
        </motion.div>
    );
}

