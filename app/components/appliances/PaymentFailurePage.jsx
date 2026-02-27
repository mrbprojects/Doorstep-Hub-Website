'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, Home, XCircle, ShieldAlert, HeadphonesIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export function PaymentFailurePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [hasBookingData, setHasBookingData] = useState(false);

    useEffect(() => {
        // Check if we have booking data to retry
        const savedAddress = sessionStorage.getItem('selected_address');
        const bookingDetails = sessionStorage.getItem('booking_package_details');

        // Also check URL parameters for booking reference
        const orderId = searchParams.get('orderId');
        const serviceId = searchParams.get('serviceId');
        const date = searchParams.get('date');
        const time = searchParams.get('time');
        const addressParam = searchParams.get('address');

        // If we have URL params, restore to sessionStorage
        if (orderId || serviceId) {
            if (date) sessionStorage.setItem('last_booking_date', date);
            if (time) sessionStorage.setItem('last_booking_time', time);
            if (addressParam) {
                try {
                    // Try to parse if it's JSON, otherwise use as string
                    const addressData = addressParam.startsWith('{')
                        ? JSON.parse(addressParam)
                        : { fullAddress: addressParam };
                    sessionStorage.setItem('selected_address', JSON.stringify(addressData));
                } catch (e) {
                    console.error('Failed to parse address:', e);
                }
            }
        }

        setHasBookingData(!!(savedAddress || bookingDetails || orderId || serviceId));
    }, [searchParams]);

    const handleRetry = () => {
        // Check for saved booking data
        const savedAddress = sessionStorage.getItem('selected_address');
        const bookingDetails = sessionStorage.getItem('booking_package_details');
        const serviceId = searchParams.get('serviceId');

        if (savedAddress || searchParams.get('address')) {
            // If we have address, redirect back to confirmation page
            router.push('/appliances/booking');
        } else if (bookingDetails || serviceId) {
            // If we have booking details or serviceId, redirect to address selection
            router.push('/appliances/address');
        } else {
            // Fallback to home if no data
            router.push('/appliances');
        }
    };

    const handleGoHome = () => {
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a1111] to-[#0a0a0a] flex items-center justify-center px-4 py-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-xl w-full"
            >
                {/* Error Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="flex justify-center mb-8"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center">
                            <XCircle className="w-20 h-20 text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                        Payment Failed
                    </h1>
                    <p className="text-xl text-white/80 mb-6">Oops! We couldn't process your transaction</p>

                    <div className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-sm leading-relaxed max-w-md mx-auto">
                        <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p> Don't worry, <strong>no funds were deducted</strong> from your account. If any amount was debited, it will be refunded automatically within 5-7 business days.</p>
                    </div>
                </motion.div>

                {/* Common Reasons Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10"
                >
                    <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Possible Reasons</h4>
                    <ul className="space-y-3">
                        {[
                            'Insufficient funds in your account',
                            'Unstable internet connection',
                            'Incorrect payment details or OTP',
                            'Bank server timeout or downtime'
                        ].map((reason, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-white/70 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {reason}
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 mb-8">
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRetry}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition-all hover:brightness-110"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Retry Payment
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoHome}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Back to Homepage
                    </motion.button>
                </div>

                {/* Help Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center"
                >
                    <p className="text-white/40 text-sm flex items-center justify-center gap-2">
                        <HeadphonesIcon className="w-4 h-4" />
                        Need help? Contact our support at <span className="text-white underline decoration-white/20">support@doorstephub.com</span>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
