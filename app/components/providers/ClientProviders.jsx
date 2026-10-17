'use client';

import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { GlobalAuthModal } from '@/components/auth/GlobalAuthModal';
import { LeadResumeHandler } from '@/components/smart-leads/LeadResumeHandler';
import { GlobalProgressBar } from '@/components/ui/GlobalProgressBar';
import { GlobalLoaderProvider } from '@/context/GlobalLoaderContext';

export function ClientProviders({ children }) {
    return (
        <GlobalLoaderProvider>
            <Suspense fallback={null}>
                <GlobalProgressBar />
            </Suspense>
            <LeadResumeHandler />
            {children}
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
