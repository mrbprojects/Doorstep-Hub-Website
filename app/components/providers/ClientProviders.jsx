'use client';

import { Suspense, useEffect } from 'react';
import { Toaster } from 'sonner';
import { GlobalAuthModal } from '@/components/auth/GlobalAuthModal';
import { LeadResumeHandler } from '@/components/smart-leads/LeadResumeHandler';
import { GlobalProgressBar } from '@/components/ui/GlobalProgressBar';
import { GlobalLoaderProvider } from '@/context/GlobalLoaderContext';
import { SmartAppBannerMeta } from '@/components/app-promotion/SmartAppBannerMeta';
import { AppInstallBanner } from '@/components/app-promotion/AppInstallBanner';
import { ContinueBookingFloatingCard } from '@/components/booking-recovery/ContinueBookingFloatingCard';

export function ClientProviders({ children }) {
    useEffect(() => {
        // Automatically recover from stale chunks after a build or deployment
        const handleChunkError = (event) => {
            const err = event?.error || event?.reason;
            const message = String(err?.message || event?.message || '');
            if (
                err?.name === 'ChunkLoadError' ||
                message.includes('Loading chunk') ||
                message.includes('Loading CSS chunk') ||
                message.includes('Failed to fetch dynamically imported module')
            ) {
                const lastReload = sessionStorage.getItem('chunk_error_reload');
                const now = Date.now();
                if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
                    sessionStorage.setItem('chunk_error_reload', String(now));
                    window.location.reload();
                }
            }
        };

        window.addEventListener('error', handleChunkError);
        window.addEventListener('unhandledrejection', handleChunkError);
        return () => {
            window.removeEventListener('error', handleChunkError);
            window.removeEventListener('unhandledrejection', handleChunkError);
        };
    }, []);
    return (
        <GlobalLoaderProvider>
            <Suspense fallback={null}>
                <GlobalProgressBar />
            </Suspense>
            <LeadResumeHandler />
            <SmartAppBannerMeta />
            {children}
            <ContinueBookingFloatingCard />
            <AppInstallBanner />
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1a1a1a',
                        color: '#fff',
                        border: '1px solid rgba(3, 113, 102, 0.3)',
                    },
                }}
            />
            <GlobalAuthModal />
        </GlobalLoaderProvider>
    );
}
