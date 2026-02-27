'use client';

import { Suspense } from 'react';
import { motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Home, Download, Share2 } from 'lucide-react';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // BUG-05 FIX: Read real booking ID from URL params set by confirm page
    const bookingId = searchParams.get('bookingId') || 'Pending';
    const moveInDate = searchParams.get('date') || '';

    const handleBackToHome = () => {
        router.push('/pghostels');
    };

    // BUG-06 FIX: Download triggers browser print dialog
    const handleDownload = () => {
        window.print();
    };

    // BUG-06 FIX: Share uses Web Share API, falls back to clipboard copy
    const handleShare = async () => {
        const shareData = {
            title: 'My PG Booking – DoorstepHub',
            text: `I just booked a PG! Booking ID: ${bookingId}${moveInDate ? `, Move-in: ${moveInDate}` : ''}.`,
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                alert('Booking details copied to clipboard!');
            }
        } catch {
            // User cancelled share — do nothing
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center py-8 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
                    {/* Success Animation */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-24 h-24 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#22C55E]/30"
                    >
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                        <p className="text-gray-600 mb-8">
                            Your PG booking has been successfully confirmed. We've sent the details to your email.
                        </p>

                        {/* Booking ID Card */}
                        <div className="bg-gradient-to-br from-[#037166]/10 to-[#037166]/5 rounded-2xl p-6 mb-6 border border-[#037166]/20">
                            <div className="text-sm text-gray-600 mb-1">Booking ID</div>
                            <div className="text-2xl font-bold text-[#037166] mb-1">{bookingId}</div>
                            {moveInDate && (
                                <div className="text-sm text-gray-500 mb-4">Move-in: {moveInDate}</div>
                            )}

                            <div className="flex items-center justify-center space-x-3">
                                <button
                                    onClick={handleDownload}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>

                        {/* What's Next */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
                            <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-[#037166] rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>The hostel owner will contact you within 24 hours</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-[#037166] rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>Complete the security deposit payment</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-[#037166] rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>Move in on your selected date</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleBackToHome}
                                className="w-full py-4 bg-gradient-to-r from-[#037166] to-[#025951] text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-[#037166]/30 transition-all flex items-center justify-center space-x-2"
                            >
                                <Home className="w-5 h-5" />
                                <span>Back to Home</span>
                            </button>

                            <button
                                onClick={() => router.push('/pghostels/listings/all')}
                                className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-[#037166] hover:text-[#037166] transition-all"
                            >
                                Browse More PGs
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
                    Need help? Contact us at{' '}
                    <a href="mailto:support@doorstephub.com" className="text-[#037166] hover:underline">
                        support@doorstephub.com
                    </a>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#037166]"></div></div>}>
            <SuccessContent />
        </Suspense>
    );
}
