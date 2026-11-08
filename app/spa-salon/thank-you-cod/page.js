'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import {  Calendar, MapPin, Sparkles, Scissors, ArrowRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

function getInitialSpaCodBookingDetails(searchParams) {
    if (typeof window === 'undefined') {
        return { date: '', time: '', address: '' };
    }
    try {
        const rawSaved = sessionStorage.getItem('selected_address');
        let addressData = null;
        if (rawSaved) {
            try { addressData = JSON.parse(rawSaved); } catch {}
        }
        if (!addressData) {
            try {
                const pending = JSON.parse(sessionStorage.getItem('pending_booking') || '{}');
                if (pending?.address) addressData = pending.address;
            } catch {}
        }

        const dateParam = searchParams.get('date') || 'Date not set';
        const timeParam = searchParams.get('time') || '';

        if (addressData) {
            return {
                date: dateParam,
                time: timeParam,
                address: formatCompleteAddress(addressData)
            };
        }

        return {
            date: dateParam,
            time: timeParam,
            address: 'Selected Address'
        };
    } catch {
        return { date: '', time: '', address: 'Selected Address' };
    }
}

function SpaThankYouCodContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookingDetails, setBookingDetails] = useState(() => getInitialSpaCodBookingDetails(searchParams));

    useEffect(() => {
        const rawSaved = sessionStorage.getItem('selected_address');
        const token = typeof window !== 'undefined'
            ? (localStorage.getItem('token') || sessionStorage.getItem('token'))
            : null;

        if (!rawSaved && token) {
            const dateParam = searchParams.get('date') || 'Date not set';
            const timeParam = searchParams.get('time') || '';

            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/useraddress/getuseraddress`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                    const defaultAddr = data.data.find(a => a.defaultAddress) || data.data[0];
                    setBookingDetails({
                        date: dateParam,
                        time: timeParam,
                        address: formatCompleteAddress(defaultAddr)
                    });
                }
            })
            .catch(() => {});
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C06C84]/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#6C5CE7]/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden relative z-10 border border-[#C06C84]/15"
            >
                {/* Header Section */}
                <div className="bg-gradient-to-br from-[#C06C84] to-[#6C5CE7] p-12 text-center relative">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                    >
                        <Scissors className="w-10 h-10 text-[#C06C84]" />
                    </motion.div>

                    <h1 className="text-3xl font-bold text-white mb-3">Spa Booking Confirmed!</h1>
                    <p className="text-white/80 text-lg">Relax and get ready for your pampered session.</p>
                </div>

                <div className="p-10">
                    {/* COD Highlight */}
                    <div className="mb-10 p-5 rounded-2xl bg-[#C06C84]/5 border border-[#C06C84]/15 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#C06C84]/10 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-[#C06C84]" />
                        </div>
                        <div>
                            <p className="text-[#C06C84] font-bold mb-0.5">Pay at Doorstep (COD)</p>
                            <p className="text-[#C06C84]/70 text-sm">Please pay the expert after your service is completed.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        {/* Date & Time */}
                        <div className="space-y-1.5 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2 text-[#C06C84] mb-2">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Appointment</span>
                            </div>
                            <p className="text-gray-900 font-bold text-lg">{bookingDetails.date}</p>
                            <p className="text-gray-500">{bookingDetails.time}</p>
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2 text-[#C06C84] mb-2">
                                <MapPin className="w-4 h-4 shrink-0" />
                                <span className="text-xs font-bold uppercase tracking-wider">Location</span>
                            </div>
                            <p className="text-gray-900 font-bold text-sm leading-snug break-words">
                                {bookingDetails.address}
                            </p>
                        </div>
                    </div>

                    <div className="text-center mb-10 px-6">
                        <p className="text-[#C06C84] italic flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            &quot;You deserve this moment of self-care.&quot;
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            onClick={() => router.push('/spa-salon')}
                            className="w-full py-7 bg-[#C06C84] hover:bg-[#6C5CE7] text-white text-lg rounded-2xl shadow-lg transition-all font-bold"
                        >
                            Book More Services
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/')}
                            className="w-full text-gray-400 hover:text-gray-900 p-4 font-medium"
                        >
                            Back to Home <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function SpaThankYouCodPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
            <SpaThankYouCodContent />
        </Suspense>
    );
}
