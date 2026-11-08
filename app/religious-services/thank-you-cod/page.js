'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { CheckCircle, Calendar, MapPin, Sparkles, Wallet } from 'lucide-react';
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

function getInitialReligiousCodBookingDetails(searchParams) {
    if (typeof window === 'undefined') {
        return {
            date: '',
            time: '',
            address: '',
            addressType: '',
            contactPerson: '',
            contactPhone: ''
        };
    }
    try {
        const rawSaved = sessionStorage.getItem('religious_booking_address') ||
                         sessionStorage.getItem('selected_address');
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
                address: formatCompleteAddress(addressData),
                addressType: addressData.type || '',
                contactPerson: addressData.name || addressData.userName || '',
                contactPhone: addressData.phone || ''
            };
        }

        return {
            date: dateParam,
            time: timeParam,
            address: 'Selected Address',
            addressType: '',
            contactPerson: '',
            contactPhone: ''
        };
    } catch {
        return {
            date: '',
            time: '',
            address: 'Selected Address',
            addressType: '',
            contactPerson: '',
            contactPhone: ''
        };
    }
}

function ReligiousThankYouCodContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookingDetails, setBookingDetails] = useState(() => getInitialReligiousCodBookingDetails(searchParams));

    useEffect(() => {
        const rawSaved = sessionStorage.getItem('religious_booking_address') ||
                         sessionStorage.getItem('selected_address');
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
                        address: formatCompleteAddress(defaultAddr),
                        addressType: defaultAddr.type || '',
                        contactPerson: defaultAddr.name || defaultAddr.userName || '',
                        contactPhone: defaultAddr.phone || ''
                    });
                }
            })
            .catch(() => {});
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-[var(--off-white)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--saffron)]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--temple-red)]/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden relative z-10 border border-[var(--saffron)]/15"
            >
                {/* Header Section */}
                <div className="bg-gradient-to-br from-[var(--saffron)] to-[var(--temple-red)] p-12 text-center relative">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                    >
                        <CheckCircle className="w-10 h-10 text-[var(--saffron)]" />
                    </motion.div>

                    <h1 className="text-3xl font-bold text-white mb-3">Service Booked Successfully!</h1>
                    <p className="text-white/80 text-lg">Your ritual has been scheduled. No immediate payment needed.</p>
                </div>

                <div className="p-10">
                    {/* COD Highlight */}
                    <div className="mb-10 p-5 rounded-2xl bg-green-50 border border-green-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-green-800 font-bold mb-0.5">Cash on Service Delivery (COD)</p>
                            <p className="text-green-600/80 text-sm">Please pay the amount to the priest after the ceremony.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        {/* Date & Time */}
                        <div className="space-y-1.5 p-5 rounded-2xl bg-[var(--off-white)] border border-gray-100">
                            <div className="flex items-center gap-2 text-[var(--saffron)] mb-2">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Appointment</span>
                            </div>
                            <p className="text-[var(--deep-charcoal)] font-bold text-lg">{bookingDetails.date}</p>
                            <p className="text-gray-500">{bookingDetails.time}</p>
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5 p-5 rounded-2xl bg-[var(--off-white)] border border-gray-100">
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 text-[var(--saffron)]">
                                    <MapPin className="w-4 h-4 shrink-0" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Location</span>
                                </div>
                                {bookingDetails.addressType && (
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                                        {bookingDetails.addressType}
                                    </span>
                                )}
                            </div>
                            <p className="text-[var(--deep-charcoal)] font-bold text-sm leading-snug break-words">
                                {bookingDetails.address}
                            </p>
                            {bookingDetails.contactPerson && (
                                <p className="text-xs text-gray-500 font-medium pt-1 border-t border-gray-200/50">
                                    {bookingDetails.contactPerson} {bookingDetails.contactPhone ? `• ${bookingDetails.contactPhone}` : ''}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="text-center mb-10 px-6">
                        <p className="text-gray-500 italic flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-[var(--saffron)]" />
                            &quot;May your sacred rituals bring peace and prosperity.&quot;
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            onClick={() => router.push('/religious-services')}
                            className="w-full py-7 bg-[var(--saffron)] hover:bg-[var(--temple-red)] text-white text-lg rounded-2xl shadow-lg transition-all font-bold"
                        >
                            Explore More Rituals
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/')}
                            className="w-full text-gray-400 hover:text-[var(--deep-charcoal)] p-4 font-medium"
                        >
                            Back to Homepage
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function ReligiousThankYouCodPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">Loading...</div>}>
            <ReligiousThankYouCodContent />
        </Suspense>
    );
}
