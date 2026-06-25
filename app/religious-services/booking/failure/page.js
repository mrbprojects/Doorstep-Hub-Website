'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { XCircle, Home, RefreshCcw, HelpCircle } from 'lucide-react';

export default function ReligiousFailurePage() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            handleRetry();
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const handleRetry = () => {
        router.push('/religious-services/cart');
    };

    const handleBackToHome = () => {
        router.push('/religious-services');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a1111] to-[#0a0a0a] flex items-center justify-center py-8 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center border border-white/10">
                    {/* Failure Animation */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30"
                    >
                        <XCircle className="w-12 h-12 text-white" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h1 className="text-3xl font-bold text-white mb-2">Service Booking Failed</h1>
                        <p className="text-white/60 mb-2">
                            We couldn't process your payment for the religious service. Your details are safe and no funds were deducted.
                        </p>
                        <p className="text-sm text-red-500 font-medium mb-8 flex items-center justify-center gap-2">
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                            Redirecting to selection for retry in 5 seconds...
                        </p>

                        {/* Error Info Card */}
                        <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10 text-left">
                            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-red-500" />
                                Possible Reasons
                            </h3>
                            <ul className="space-y-2 text-sm text-white/50">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>Payment session expired</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>Incorrect payment credentials</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>Bank server communication error</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleRetry}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-red-500/30 transition-all flex items-center justify-center space-x-2"
                            >
                                <RefreshCcw className="w-5 h-5" />
                                <span>Retry Payment</span>
                            </button>

                            <button
                                onClick={handleBackToHome}
                                className="w-full py-4 bg-white/5 border border-white/10 text-white/70 rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
                            >
                                <Home className="w-5 h-5" />
                                <span>Back to Home</span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Support Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 text-center text-sm text-white/40"
                >
                    Contact us: <span className="text-white underline cursor-pointer">support@doorstephub.com</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
