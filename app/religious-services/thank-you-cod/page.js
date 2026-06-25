'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { CheckCircle, Calendar, MapPin, Sparkles, ArrowRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ReligiousThankYouCodContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookingDetails, setBookingDetails] = useState({ date: '', time: '', address: '' });

    useEffect(() => {
        const savedAddress = sessionStorage.getItem('religious_booking_address') || sessionStorage.getItem('selected_address');
        const addressData = savedAddress ? JSON.parse(savedAddress) : null;

        setBookingDetails({
            date: searchParams.get('date') || 'Date not set',
            time: searchParams.get('time') || '',
            address: addressData ? `${addressData.flat}, ${addressData.area}, ${addressData.cityName}` : 'Selected Address'
        });
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
                            <div className="flex items-center gap-2 text-[var(--saffron)] mb-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Location</span>
                            </div>
                            <p className="text-[var(--deep-charcoal)] font-bold line-clamp-2 leading-tight">
                                {bookingDetails.address}
                            </p>
                        </div>
                    </div>

                    <div className="text-center mb-10 px-6">
                        <p className="text-gray-500 italic flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-[var(--saffron)]" />
                            "May your sacred rituals bring peace and prosperity."
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
