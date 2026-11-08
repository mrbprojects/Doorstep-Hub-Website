'use client';

import { Suspense, useState } from 'react';
import { motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Home, MapPin, Calendar, Wallet } from 'lucide-react';


function SuccessCodContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookingDetails] = useState(() => {
        if (typeof window === 'undefined') return { date: '', address: '' };
        try {
            const savedAddress = sessionStorage.getItem('selected_address');
            const addressData = savedAddress ? JSON.parse(savedAddress) : null;
            return {
                date: searchParams.get('date') || 'TBD',
                address: addressData ? `${addressData.flat}, ${addressData.area}, ${addressData.cityName}` : 'Selected PG location'
            };
        } catch {
            return { date: 'TBD', address: 'Selected PG location' };
        }
    });

    const handleBackToHome = () => {
        router.push('/pghostels');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Success Animation Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl bg-white shadow-2xl rounded-[2.5rem] border border-gray-100 overflow-hidden"
            >
                <div className="p-10 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20"
                    >
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </motion.div>

                    <h1 className="text-4xl font-black text-gray-900 mb-2">Space Booked!</h1>
                    <p className="text-gray-500 text-lg mb-8">Welcome to your new home. Payment is simple.</p>

                    {/* Pay at Hostel Card */}
                    <div className="bg-green-50 rounded-3xl p-6 border border-green-200/50 mb-8 text-left flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                            <Wallet className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-green-800 font-bold text-lg mb-1">Pay at Hostel (COD)</p>
                            <p className="text-green-700/70 text-sm leading-relaxed">
                                No advance payment taken online. Simply pay your monthly rent and deposit directly to the hostel owner when you move in.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-left mb-8">
                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Move-in Date</span>
                            </div>
                            <p className="font-bold text-gray-900 text-lg">{bookingDetails.date}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                <MapPin className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Location</span>
                            </div>
                            <p className="font-bold text-gray-900 line-clamp-2 leading-tight">{bookingDetails.address}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleBackToHome}
                            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all shadow-gray-900/10 flex items-center justify-center gap-3"
                        >
                            <Home className="w-5 h-5" />
                            Return to Dashboard
                        </button>
                        <button
                            onClick={() => router.push('/pghostels/listings/all')}
                            className="w-full py-5 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all"
                        >
                            Explore More PGs
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50/50 p-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-400">Need help? WhatsApp us at <span className="text-green-600 font-bold">+91 9123456789</span></p>
                </div>
            </motion.div>
        </div>
    );
}

export default function SuccessCodPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><CheckCircle2 className="w-10 h-10 text-green-500 animate-pulse" /></div>}>
            <SuccessCodContent />
        </Suspense>
    );
}
