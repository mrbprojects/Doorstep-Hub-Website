'use client';

import React from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthModal } from '@/context/AuthModalContext';

export function GlobalAuthModal() {
    const { isAuthModalOpen, closeAuthModal } = useAuthModal();

    return (
        <AuthModal
            isOpen={isAuthModalOpen}
            onClose={closeAuthModal}
        />
    );
}
