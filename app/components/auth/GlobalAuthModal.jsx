'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthModal } from '@/context/AuthModalContext';
import { useAuth } from '@/context/AuthContext';

export function GlobalAuthModal() {
    const { isAuthModalOpen, closeAuthModal } = useAuthModal();
    const { isAuthenticated } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    if (pathname?.startsWith('/service-partner') || pathname?.startsWith('/partner')) {
        return null;
    }

    const handleClose = () => {
        closeAuthModal();
        if (!isAuthenticated && pathname?.startsWith('/account')) {
            router.push('/');
        }
    };

    return (
        <AuthModal
            isOpen={isAuthModalOpen}
            onClose={handleClose}
        />
    );
}
