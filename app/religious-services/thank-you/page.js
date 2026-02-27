'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { CheckCircle, Home, Calendar, MapPin, Sparkles, Flower2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ThankYouContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookingDetails, setBookingDetails] = useState({ orderId: '', date: '', time: '', address: '' });

    useEffect(() => {
        // Retrieve address from session storage (used in booking flow)
        const savedAddress = sessionStorage.getItem('religious_booking_address') || sessionStorage.getItem('selected_address');
        const addressData = savedAddress ? JSON.parse(savedAddress) : null;

        setBookingDetails({
            orderId: searchParams.get('orderId') || '',
            date: searchParams.get('date'),
            time: searchParams.get('time'),
            address: addressData ? `${addressData.flat}, ${addressData.area}` : 'Selected Address'
        });

        // Optional: Clear booking session data after success
        // sessionStorage.removeItem('religious_booking_data');
        // sessionStorage.removeItem('religious_booking_address');
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-[var(--off-white)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--saffron)]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--temple-red)]/5 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-[var(--warm-gold)]/5 rounded-full blur-[80px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-[var(--saffron)]/20"
            >
                {/* Header Section */}
                <div className="bg-gradient-to-br from-[var(--saffron)] to-[var(--temple-red)] p-10 text-center relative overflow-hidden">
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative"
                    >
                        <CheckCircle className="w-12 h-12 text-[var(--saffron)]" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-2 border-dashed border-[var(--saffron)]/30 rounded-full"
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
                        Your spiritual service has been scheduled.
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
                            className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--off-white)] border border-[var(--saffron)]/10"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[var(--saffron)]/10 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-6 h-6 text-[var(--saffron)]" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Date & Time</p>
                                <p className="text-[var(--deep-charcoal)] font-bold text-lg">
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
                            className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--off-white)] border border-[var(--saffron)]/10"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[var(--saffron)]/10 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-6 h-6 text-[var(--saffron)]" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Service Location</p>
                                <p className="text-[var(--deep-charcoal)] font-semibold leading-tight">
                                    {bookingDetails.address || 'Loading address...'}
                                </p>
                            </div>
                        </motion.div>

                        {/* Divine Quote/Message */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-center py-4 px-6 bg-[var(--warm-beige)]/30 rounded-xl"
                        >
                            <p className="text-[var(--deep-charcoal)] italic flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4 text-[var(--saffron)]" />
                                "May peace and prosperity be with you."
                                <Sparkles className="w-4 h-4 text-[var(--saffron)]" />
                            </p>
                        </motion.div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex flex-col gap-3">
                        <Button
                            onClick={() => router.push('/religious-services')}
                            className="w-full py-6 bg-[var(--saffron)] hover:bg-[var(--temple-red)] text-white text-lg rounded-xl shadow-lg shadow-[var(--saffron)]/20 transition-all font-semibold"
                        >
                            Book Another Service
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/')}
                            className="w-full text-gray-500 hover:text-[var(--deep-charcoal)] hover:bg-gray-100 py-4 rounded-xl"
                        >
                            Back to Home <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function ReligiousThankYouPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center text-[var(--saffron)]">Loading Divine Confirmation...</div>}>
            <ThankYouContent />
        </Suspense>
    );
}
