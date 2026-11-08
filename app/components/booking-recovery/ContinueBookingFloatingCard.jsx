'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ArrowRight, X, Sparkles } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';

const EXCLUDED_PATHS = [
    '/checkout',
    '/confirm',
    '/thank-you',
    '/payment-failed',
    '/login',
];

export function ContinueBookingFloatingCard() {
    const mounted = useMounted();
    const pathname = usePathname();
    const router = useRouter();

    const [recoveryData, setRecoveryData] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    // Re-evaluate on pathname change or storage updates
    useEffect(() => {
        if (!mounted || typeof window === 'undefined') return;

        // Don't show if on excluded booking/payment routes
        const isExcluded = EXCLUDED_PATHS.some((path) => pathname?.includes(path));
        if (isExcluded) {
            queueMicrotask(() => setRecoveryData(null));
            return;
        }

        try {
            const lastCheckoutUrl = sessionStorage.getItem('last_checkout_url');
            if (!lastCheckoutUrl || !lastCheckoutUrl.startsWith('/')) {
                queueMicrotask(() => setRecoveryData(null));
                return;
            }

            // Check if dismissed for this specific URL
            const dismissedUrl = sessionStorage.getItem('dismissed_booking_url');
            if (dismissedUrl === lastCheckoutUrl) {
                queueMicrotask(() => setDismissed(true));
                return;
            }

            let pending = {};
            try {
                pending = JSON.parse(
                    sessionStorage.getItem('pending_booking') ||
                    localStorage.getItem('pending_booking') ||
                    '{}'
                );
            } catch {}

            // Determine vertical & title
            let vertical = 'Service';
            let iconColor = 'text-[#037166]';
            let bgGradient = 'from-[#037166] to-[#025c53]';

            if (lastCheckoutUrl.includes('religious')) {
                vertical = 'Sacred Ritual Booking';
                iconColor = 'text-amber-600';
                bgGradient = 'from-amber-600 to-orange-700';
            } else if (lastCheckoutUrl.includes('pghostels')) {
                vertical = 'PG & Hostel Booking';
                iconColor = 'text-emerald-600';
                bgGradient = 'from-[#037166] to-[#04a99d]';
            } else if (lastCheckoutUrl.includes('spa-salon')) {
                vertical = 'Salon & Spa Appointment';
                iconColor = 'text-pink-600';
                bgGradient = 'from-[#6D1357] to-[#8a1a6f]';
            } else if (lastCheckoutUrl.includes('appliance') || lastCheckoutUrl.includes('services')) {
                vertical = 'Appliance Service';
                iconColor = 'text-[#037166]';
                bgGradient = 'from-[#037166] to-[#025c53]';
            }

            queueMicrotask(() => {
                setRecoveryData({
                    url: lastCheckoutUrl,
                    title: pending.serviceName || pending.categoryName || vertical,
                    date: pending.bookedDate || '',
                    time: pending.bookedTime || '',
                    iconColor,
                    bgGradient,
                });
                setDismissed(false);
            });
        } catch {
            queueMicrotask(() => setRecoveryData(null));
        }
    }, [mounted, pathname]);

    const handleDismiss = () => {
        if (recoveryData?.url && typeof window !== 'undefined') {
            try {
                sessionStorage.setItem('dismissed_booking_url', recoveryData.url);
            } catch {}
        }
        setDismissed(true);
    };

    const handleResume = () => {
        if (recoveryData?.url) {
            router.push(recoveryData.url);
        }
    };

    if (!mounted || !recoveryData || dismissed) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                transition={{ type: 'spring', damping: 24, stiffness: 260 }}
                className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 max-w-sm w-[calc(100vw-24px)] sm:w-auto shadow-2xl rounded-2xl overflow-hidden border border-gray-200/80 bg-white/95 backdrop-blur-md"
            >
                <div className="p-3.5 sm:p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                        <Calendar className={`w-5 h-5 ${recoveryData.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> In Progress
                            </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">
                            {recoveryData.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate">
                            Resume where you left off
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={handleResume}
                            className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${recoveryData.bgGradient} shadow-sm hover:opacity-95 active:scale-95 transition-all`}
                        >
                            <span>Resume</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleDismiss}
                            aria-label="Dismiss booking reminder"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
