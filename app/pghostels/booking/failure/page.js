'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { XCircle, Home, RefreshCcw, HelpCircle } from 'lucide-react';

export default function FailurePage() {
    const router = useRouter();

    const handleRetry = () => {
        router.push('/pghostels/booking/confirm');
    };

    const handleBackToHome = () => {
        router.push('/pghostels');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-red-50 flex items-center justify-center py-8 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-red-100">
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                        <p className="text-gray-600 mb-8">
                            We couldn't process your payment. Don't worry, no amount has been deducted from your account.
                        </p>

                        {/* Error Info Card */}
                        <div className="bg-red-50 rounded-2xl p-6 mb-6 border border-red-100 text-left">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-red-500" />
                                Common Reasons
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>Insufficient funds in the account</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>Bank server unavailable</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>Incorrect UPI PIN entered</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleRetry}
                                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-red-500/30 transition-all flex items-center justify-center space-x-2"
                            >
                                <RefreshCcw className="w-5 h-5" />
                                <span>Retry Payment</span>
                            </button>

                            <button
                                onClick={handleBackToHome}
                                className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-red-500 hover:text-red-500 transition-all flex items-center justify-center space-x-2"
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
                    className="mt-6 text-center text-sm text-gray-500"
                >
                    Problem persists? Contact us at{' '}
                    <a href="mailto:support@pghostels.com" className="text-red-500 hover:underline">
                        support@pghostels.com
                    </a>
                </motion.div>
            </motion.div>
        </div>
    );
}
