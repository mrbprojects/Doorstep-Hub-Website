'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function GlobalProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const timerRef = useRef(null);
    const safetyTimeoutRef = useRef(null);

    const startLoading = () => {
        setLoading(true);
        setProgress(25);

        if (timerRef.current) clearInterval(timerRef.current);
        if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

        timerRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 85) {
                    clearInterval(timerRef.current);
                    return 85;
                }
                const diff = (90 - prev) * 0.15;
                return prev + Math.max(diff, 1.5);
            });
        }, 150);

        // Safety fallback: if no route change or completion after 4 seconds, smoothly complete
        safetyTimeoutRef.current = setTimeout(() => {
            stopLoading();
        }, 4000);
    };

    const stopLoading = () => {
        setProgress(100);
        if (timerRef.current) clearInterval(timerRef.current);
        if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
        setTimeout(() => {
            setLoading(false);
            setProgress(0);
        }, 300);
    };

    // Route change triggers stopLoading
    useEffect(() => {
        stopLoading();
    }, [pathname, searchParams]);

    // Global click listener for internal navigation and action buttons
    useEffect(() => {
        const handleClick = (e) => {
            // 1. Check for Link clicks
            const targetAnchor = e.target.closest('a');
            if (targetAnchor && targetAnchor.href && !targetAnchor.target && targetAnchor.origin === window.location.origin) {
                const targetUrl = new URL(targetAnchor.href);
                if (targetUrl.pathname !== window.location.pathname || targetUrl.search !== window.location.search) {
                    startLoading();
                    return;
                }
            }

            // 2. Check for action button clicks (Book Service, Book Appointment, Pay, Next, etc.)
            const btn = e.target.closest('button');
            if (btn && !btn.disabled) {
                const text = (btn.textContent || '').trim().toLowerCase();
                const isActionBtn =
                    text.includes('book') ||
                    text.includes('pay') ||
                    text.includes('next') ||
                    text.includes('proceed') ||
                    text.includes('submit') ||
                    text.includes('confirm') ||
                    btn.getAttribute('type') === 'submit';

                if (isActionBtn) {
                    startLoading();
                }
            }
        };

        const handleStartCustom = () => startLoading();
        const handleStopCustom = () => stopLoading();

        window.addEventListener('click', handleClick, true);
        window.addEventListener('app-start-loading', handleStartCustom);
        window.addEventListener('app-stop-loading', handleStopCustom);

        return () => {
            window.removeEventListener('click', handleClick, true);
            window.removeEventListener('app-start-loading', handleStartCustom);
            window.removeEventListener('app-stop-loading', handleStopCustom);
            if (timerRef.current) clearInterval(timerRef.current);
            if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
        };
    }, []);

    if (!loading && progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 h-[3.5px] z-[99999] pointer-events-none bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-[#00594F] via-[#007F70] to-[#0ABF83] transition-all duration-200 ease-out shadow-[0_0_12px_#0ABF83]"
                style={{
                    width: `${progress}%`,
                    opacity: progress === 100 ? 0 : 1,
                    transition: progress === 100 ? 'width 200ms ease-out, opacity 300ms ease-out' : 'width 200ms ease-out',
                }}
            >
                {/* Glowing leading edge pulse */}
                <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-r from-transparent via-white/40 to-white/90 shadow-[0_0_16px_#0ABF83]" />
            </div>
        </div>
    );
}

export function triggerGlobalLoaderStart() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('app-start-loading'));
    }
}

export function triggerGlobalLoaderStop() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('app-stop-loading'));
    }
}
