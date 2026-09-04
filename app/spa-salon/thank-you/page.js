'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { CheckCircle, Calendar, MapPin, Sparkles, ArrowRight, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackBookingCompleted } from '@/lib/leadTracking';

const clean = (val) => {
    if (!val) return '';
    const s = String(val).trim();
    if (!s || s.toLowerCase() === 'n/a' || s.toLowerCase() === 'undefined' || s.toLowerCase() === 'null') return '';
    return s;
};

const formatCompleteAddress = (addr) => {
    if (!addr) return 'Selected Address';
    if (typeof addr === 'string') return addr;

    const parts = [
        clean(addr.flat),
        clean(addr.area),
        clean(addr.addressLineOne),
        clean(addr.addressLineTwo),
        clean(addr.cityName),
        clean(addr.stateName),
        clean(addr.postalCode || addr.pincode)
    ].filter(Boolean);

    const seen = new Set();
    const uniqueParts = parts.filter(part => {
        const lower = part.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
    });

    if (uniqueParts.length === 0) {
        return clean(addr.address) || clean(addr.cityName) || 'Selected Address';
    }

    return uniqueParts.join(', ');
};

function SpaThankYouContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookingDetails, setBookingDetails] = useState({
        orderId: '',
        date: '',
        time: '',
        paid: '0',
        remaining: '0',
        address: ''
    });

    useEffect(() => {
        const rawSaved = sessionStorage.getItem('selected_address');
        let addressData = null;
        if (rawSaved) {
            try { addressData = JSON.parse(rawSaved); } catch (e) {}
        }

        let pending = {};
        try { pending = JSON.parse(sessionStorage.getItem('pending_booking') || '{}'); } catch (e) {}

        let lastLocal = {};
        try { lastLocal = JSON.parse(localStorage.getItem('spa_last_booking') || '{}'); } catch (e) {}

        if (!addressData) {
            if (pending?.address) addressData = pending.address;
            else if (lastLocal?.address) addressData = lastLocal.address;
        }

        const rawOrderId = (searchParams.get('orderId') || '').trim();
        const rawDate = (searchParams.get('date') || '').trim();
        const rawTime = (searchParams.get('time') || '').trim();

        const resolvedOrderId = rawOrderId || pending.orderId || lastLocal.orderId || '';
        const resolvedDate = (rawDate && rawDate !== 'Date not set')
            ? rawDate
            : (pending.bookedDate || lastLocal.bookedDate || 'Date not set');
        const resolvedTime = rawTime
            ? rawTime
            : (pending.bookedTime || lastLocal.bookedTime || '');
        const resolvedPaid = searchParams.get('paid') || pending.paid || lastLocal.paid || '0';
        const resolvedRemaining = searchParams.get('remaining') || pending.remaining || lastLocal.remaining || '0';

        if (addressData) {
            setBookingDetails({
                orderId: resolvedOrderId,
                date: resolvedDate,
                time: resolvedTime,
                paid: resolvedPaid,
                remaining: resolvedRemaining,
                address: formatCompleteAddress(addressData)
            });
        } else {
            const token = typeof window !== 'undefined'
                ? (localStorage.getItem('token') || sessionStorage.getItem('token'))
                : null;

            if (token) {
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/useraddress/getuseraddress`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                        const defaultAddr = data.data.find(a => a.defaultAddress) || data.data[0];
                        setBookingDetails({
                            orderId: resolvedOrderId,
                            date: resolvedDate,
                            time: resolvedTime,
                            paid: resolvedPaid,
                            remaining: resolvedRemaining,
                            address: formatCompleteAddress(defaultAddr)
                        });
                    } else {
                        setBookingDetails({
                            orderId: resolvedOrderId,
                            date: resolvedDate,
                            time: resolvedTime,
                            paid: resolvedPaid,
                            remaining: resolvedRemaining,
                            address: 'Selected Address'
                        });
                    }
                })
                .catch(() => {
                    setBookingDetails({
                        orderId: resolvedOrderId,
                        date: resolvedDate,
                        time: resolvedTime,
                        paid: resolvedPaid,
                        remaining: resolvedRemaining,
                        address: 'Selected Address'
                    });
                });
            } else {
                setBookingDetails({
                    orderId: resolvedOrderId,
                    date: resolvedDate,
                    time: resolvedTime,
                    paid: resolvedPaid,
                    remaining: resolvedRemaining,
                    address: 'Selected Address'
                });
            }
        }

        if (resolvedOrderId) {
            trackBookingCompleted(resolvedOrderId, { vertical: 'spa-salon' });
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6D1357]/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#6C5CE7]/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-[#6D1357]/20"
            >
                {/* Header Section */}
                <div className="bg-gradient-to-br from-[#6D1357] to-[#6C5CE7] p-10 text-center relative overflow-hidden">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative"
                    >
                        <CheckCircle className="w-12 h-12 text-[#6D1357]" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-2 border-dashed border-[#6D1357]/30 rounded-full"
                        />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-white mb-2"
                    >
                        Booking Confirmed!
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/90 mb-4"
                    >
                        Get ready to relax. Your expert is booked.
                    </motion.p>
                    {bookingDetails.orderId && (
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-mono">
                            Booking ID: {bookingDetails.orderId}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="p-8">
                    <div className="space-y-6">
                        {/* Date & Time */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#6D1357]/10 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-6 h-6 text-[#6D1357]" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Date & Time</p>
                                <p className="text-gray-900 font-bold text-lg">
                                    {bookingDetails.date || 'Date not set'}
                                    {bookingDetails.time && <span className="text-sm font-normal text-gray-600 block">{bookingDetails.time}</span>}
                                </p>
                            </div>
                        </motion.div>

                        {/* Location */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#6D1357]/10 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-6 h-6 text-[#6D1357]" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Service Location</p>
                                <p className="text-gray-900 font-semibold leading-tight line-clamp-2">
                                    {bookingDetails.address || 'Loading address...'}
                                </p>
                            </div>
                        </motion.div>

                        {/* Payment Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 }}
                            className="p-5 rounded-3xl bg-white border-2 border-[#6D1357]/10 shadow-sm"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-gray-500 text-sm">Paid Today</span>
                                <span className="text-xl font-bold text-[#6D1357]">₹{bookingDetails.paid}</span>
                            </div>
                            {bookingDetails.remaining !== '0' && (
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <span className="text-gray-500 text-sm">Pay at Store</span>
                                    <span className="text-lg font-bold text-gray-900">₹{bookingDetails.remaining}</span>
                                </div>
                            )}
                        </motion.div>

                        {/* Quote */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-center py-4 px-6 bg-pink-50 rounded-xl"
                        >
                            <p className="text-[#6D1357] italic flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                "Beauty begins the moment you decide to be yourself."
                                <Sparkles className="w-4 h-4" />
                            </p>
                        </motion.div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex flex-col gap-3">
                        <Button
                            onClick={() => router.push('/spa-salon')}
                            className="w-full py-6 bg-gradient-to-r from-[#6D1357] to-[#6C5CE7] hover:opacity-90 text-white text-lg rounded-xl shadow-lg transition-all font-semibold"
                        >
                            Book Another Service
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/')}
                            className="w-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 py-4 rounded-xl"
                        >
                            Back to Home <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function SpaThankYouPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-[#6D1357]">Loading Confirmation...</div>}>
            <SpaThankYouContent />
        </Suspense>
    );
}
