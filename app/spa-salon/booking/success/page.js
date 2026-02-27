'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Home, Download, Share2, Sparkles } from 'lucide-react';

export default function SuccessPage() {
    const router = useRouter();

    const bookingId = `SPA${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const handleBackToHome = () => {
        router.push('/spa-salon');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-[#FBEAF0] flex items-center justify-center py-8 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 text-center border border-white/50">
                    {/* Success Animation */}
                    <div className="relative mx-auto mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-28 h-28 bg-gradient-to-br from-[#C06C84] to-[#6C5CE7] rounded-full flex items-center justify-center mx-auto shadow-xl shadow-[#C06C84]/40 relative z-10"
                        >
                            <CheckCircle2 className="w-14 h-14 text-white" />
                        </motion.div>

                        {/* Decorative Sparkles */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            className="absolute -inset-4 text-[#C06C84]/40"
                        >
                            <Sparkles className="w-full h-full" />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h1 className="text-3xl font-black text-[#0F172A] mb-2">Booking Confirmed!</h1>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Your luxury wellness experience is booked. Our expert professional will reach you as scheduled.
                        </p>

                        {/* Booking ID Card */}
                        <div className="bg-gradient-to-br from-[#C06C84]/10 to-[#6C5CE7]/5 rounded-3xl p-6 mb-8 border border-[#C06C84]/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-125 transition-transform">
                                <Sparkles className="w-12 h-12 text-[#C06C84]" />
                            </div>
                            <div className="text-sm font-bold text-[#C06C84] mb-1 uppercase tracking-widest">Booking ID</div>
                            <div className="text-3xl font-black text-[#0F172A] mb-4">{bookingId}</div>

                            <div className="flex items-center justify-center space-x-3">
                                <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center space-x-2 shadow-sm">
                                    <Download className="w-4 h-4" />
                                    <span>Download Ticket</span>
                                </button>
                                <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center space-x-2 shadow-sm">
                                    <Share2 className="w-4 h-4" />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>

                        {/* What's Next */}
                        <div className="bg-[#F6F7FB] rounded-3xl p-6 mb-8 text-left border border-gray-100">
                            <h3 className="font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-[#C06C84] rounded-full"></span>
                                Next Steps
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-[#C06C84] mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Professional will call to confirm location</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-[#C06C84] mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Please keep towels & water ready</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-[#C06C84] mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Pay after completion via Link/Cash</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <button
                                onClick={handleBackToHome}
                                className="w-full py-4 bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-[#C06C84]/50 transition-all flex items-center justify-center space-x-2 group"
                            >
                                <Home className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                <span>Back to Home</span>
                            </button>

                            <button
                                onClick={() => router.push('/spa-salon/results')}
                                className="w-full py-4 bg-white border-2 border-gray-100 text-[#0F172A] rounded-2xl font-bold hover:border-[#C06C84] hover:text-[#C06C84] transition-all"
                            >
                                Book More Services
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Support Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 text-center text-sm text-gray-500 bg-white/50 backdrop-blur-sm py-2 rounded-full inline-block mx-auto w-full"
                >
                    Need help? Reach us at{' '}
                    <a href="mailto:wellness@d-hub.com" className="font-bold text-[#C06C84] hover:underline">
                        wellness@d-hub.com
                    </a>
                </motion.div>
            </motion.div>
        </div>
    );
}
