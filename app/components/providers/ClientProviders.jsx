'use client';

import { Toaster } from 'sonner';
import { GlobalAuthModal } from '@/components/auth/GlobalAuthModal';

export function ClientProviders({ children }) {
    return (
        <>
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
        </>
    );
}
