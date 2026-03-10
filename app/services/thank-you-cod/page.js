'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { CheckCircle, Calendar, MapPin, Sparkles, ArrowRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ThankYouCodContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookingDetails, setBookingDetails] = useState({ date: '', time: '', address: '' });

    useEffect(() => {
        const savedAddress = sessionStorage.getItem('selected_address');
        const sessionAddress = savedAddress ? JSON.parse(savedAddress) : null;

        const urlAddress = searchParams.get('address');
        const displayAddress = urlAddress || (sessionAddress ? `${sessionAddress.flat}, ${sessionAddress.area}, ${sessionAddress.cityName}` : '');

        setBookingDetails({
            date: searchParams.get('date') || 'Confirmed',
            time: searchParams.get('time') || '',
            address: displayAddress
        });
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#025a51]/30 via-[#037166]/20 to-black -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl bg-white rounded-3xl p-10 shadow-2xl relative"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Successful!</h1>
                    <p className="text-gray-500 text-lg">Your professional service is scheduled.</p>
                </div>

                {/* COD Badge */}
                <div className="mb-8 p-6 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-6 h-6 text-[#04a99d]" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-lg mb-0.5">Cash on Service Delivery (COD)</p>
                        <p className="text-gray-500 text-sm">Pay the service expert directly after completion.</p>
                    </div>
                </div>

                <div className="space-y-6 mb-10">
                    <div className="flex gap-4">
                        <Calendar className="w-6 h-6 text-[#04a99d] flex-shrink-0 mt-1" />
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Schedule</p>
                            <p className="text-gray-900 font-bold text-xl">{bookingDetails.date}</p>
                            <p className="text-gray-500">{bookingDetails.time}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <MapPin className="w-6 h-6 text-[#04a99d] flex-shrink-0 mt-1" />
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                            <p className="text-gray-900 font-bold leading-tight">{bookingDetails.address}</p>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => router.push('/services')}
                    className="w-full py-7 bg-[#037166] hover:bg-[#04a99d] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#037166]/20 mb-4 transition-all"
                >
                    Explore More Services
                </Button>
                <button
                    onClick={() => router.push('/')}
                    className="w-full text-gray-400 hover:text-gray-900 p-4 font-medium transition-colors"
                >
                    Back to Home
                </button>
            </motion.div>
        </div>
    );
}

export default function GenericThankYouCodPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-[#04a99d]">Loading...</div>}>
            <ThankYouCodContent />
        </Suspense>
    );
}
