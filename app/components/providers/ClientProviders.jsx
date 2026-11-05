'use client';

import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { GlobalAuthModal } from '@/components/auth/GlobalAuthModal';
import { LeadResumeHandler } from '@/components/smart-leads/LeadResumeHandler';
import { GlobalProgressBar } from '@/components/ui/GlobalProgressBar';
import { GlobalLoaderProvider } from '@/context/GlobalLoaderContext';
import { SmartAppBannerMeta } from '@/components/app-promotion/SmartAppBannerMeta';
import { AppInstallBanner } from '@/components/app-promotion/AppInstallBanner';

// Global safeguard against third-party scripts (GTM, Google Translate, SEO tags, extensions)
// that detach or mutate DOM nodes outside React's reconciler, preventing "Cannot read properties of null (reading 'removeChild')"
if (typeof window !== 'undefined') {
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function (child) {
        if (!child || child.parentNode !== this) {
            return child;
        }
        return originalRemoveChild.apply(this, arguments);
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function (newNode, referenceNode) {
        if (referenceNode && referenceNode.parentNode !== this) {
            return newNode;
        }
        return originalInsertBefore.apply(this, arguments);
    };
}

export function ClientProviders({ children }) {
    return (
        <GlobalLoaderProvider>
            <Suspense fallback={null}>
                <GlobalProgressBar />
            </Suspense>
            <LeadResumeHandler />
            <SmartAppBannerMeta />
            {children}
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
