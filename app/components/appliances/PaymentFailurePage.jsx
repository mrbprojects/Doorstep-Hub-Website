'use client';

import React, { useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, ArrowLeft, XCircle, ShieldAlert, HeadphonesIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { inferVertical, trackPaymentFailed } from '@/lib/leadTracking';

export function PaymentFailurePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Resolves the exact checkout screen where the user initiated payment
    const getTargetDestination = useCallback(() => {
        // 1. Explicit returnUrl or from query parameter
        const returnUrlParam = searchParams.get('returnUrl') || searchParams.get('from');
        if (returnUrlParam) {
            try {
                const decoded = decodeURIComponent(returnUrlParam);
                if (decoded.startsWith('/') && !decoded.includes('payment-failed') && !decoded.includes('failure')) {
                    return decoded;
                }
            } catch {
                if (returnUrlParam.startsWith('/') && !returnUrlParam.includes('payment-failed')) {
                    return returnUrlParam;
                }
            }
        }

        // 2. Saved in sessionStorage when payment was initiated
        if (typeof window !== 'undefined') {
            try {
                const savedUrl = sessionStorage.getItem('last_checkout_url');
                if (savedUrl && savedUrl.startsWith('/') && !savedUrl.includes('payment-failed') && !savedUrl.includes('failure')) {
                    return savedUrl;
                }
            } catch {}
        }

        // 3. Fallback based on deepType or type query params, or txnid prefix
        const type = (searchParams.get('type') || searchParams.get('serviceType') || '').toLowerCase();
        const deepType = (searchParams.get('deepType') || searchParams.get('servicedeeptype') || '').toLowerCase();
        const txnid = (searchParams.get('txnid') || searchParams.get('orderId') || '').toLowerCase();

        if (txnid.includes('wlt') || type.includes('wallet') || deepType.includes('wallet')) {
            return '/account/wallet';
        }
        if (deepType.includes('hostel') || deepType.includes('pg') || type.includes('hostel') || type.includes('pg')) {
            return '/pghostels/booking/confirm';
        }
        if (deepType.includes('spa') || deepType.includes('saloon') || deepType.includes('salon') || type.includes('spa')) {
            return '/spa-salon/booking/confirm';
        }
        if (deepType.includes('religio') || deepType.includes('puja') || deepType.includes('pandit') || type.includes('religio')) {
            return '/religious-services/booking/confirm';
        }
        if (type === 'crm' || type.includes('crm') || searchParams.get('channel') === 'book_appointment') {
            return '/book-appointment';
        }
        if (type === 'service-center') {
            return '/appliances/checkout';
        }
        if (type === 'professional' || type === 'verified-partner') {
            return '/appliances/booking';
        }

        // 4. Default to appliances checkout screen — never homepage
        return '/appliances/checkout';
    }, [searchParams]);

    const handleRetry = useCallback(() => {
        const target = getTargetDestination();
        router.push(target);
    }, [getTargetDestination, router]);

    useEffect(() => {
        // Restore booking reference parameters if present
        const orderId = searchParams.get('orderId');
        const serviceId = searchParams.get('serviceId');
        const date = searchParams.get('date');
        const time = searchParams.get('time');
        const addressParam = searchParams.get('address');

        if (orderId || serviceId) {
            if (date) sessionStorage.setItem('last_booking_date', date);
            if (time) sessionStorage.setItem('last_booking_time', time);
            if (addressParam) {
                try {
                    const addressData = addressParam.startsWith('{')
                        ? JSON.parse(addressParam)
                        : { fullAddress: addressParam };
                    sessionStorage.setItem('selected_address', JSON.stringify(addressData));
                } catch (e) {
                    console.error('Failed to parse address:', e);
                }
            }
        }

        trackPaymentFailed({
            vertical: inferVertical(),
            eventData: {
                reason: searchParams.get('reason') || 'gateway_failure',
                channel: 'payment_failed_page',
                orderId: orderId || '',
                serviceId: serviceId || '',
                type: searchParams.get('type') || '',
            },
        });

        // Auto-redirect after 5 seconds back to the booking / checkout screen
        const timer = setTimeout(() => {
            handleRetry();
        }, 5000);
        return () => clearTimeout(timer);
    }, [searchParams, handleRetry]);

    const getDestinationName = () => {
        const target = getTargetDestination();
        if (target.includes('checkout') || target.includes('confirm') || target.includes('booking')) {
            return 'your booking screen';
        }
        if (target.includes('cart')) {
            return 'cart';
        }
        return 'your booking screen';
    };

    const handleBackToServices = () => {
        const target = getTargetDestination();
        router.push(target);
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
                    <p className="text-xl text-white/80 mb-6">Oops! We couldn&apos;t process your transaction</p>

                    <div className="inline-flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-sm leading-relaxed max-w-md mx-auto">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p> Don&apos;t worry, <strong>no funds were deducted</strong> from your account.</p>
                        </div>
                        <p className="text-red-400 font-medium mt-2 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Redirecting to {getDestinationName()} in 5 seconds...
                        </p>
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
                            'Payment cancelled on gateway',
                            'Insufficient funds in your account',
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
                        Return to Booking Screen
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBackToServices}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Booking Details
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
