'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';

export function AccountAuthGuard({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const { openAuthModal } = useAuthModal();
    const hasPromptedLogin = useRef(false);

    useEffect(() => {
        if (loading) return;

        if (isAuthenticated) {
            hasPromptedLogin.current = false;
            return;
        }

        if (!hasPromptedLogin.current) {
            hasPromptedLogin.current = true;
            openAuthModal();
        }
    }, [loading, isAuthenticated, openAuthModal]);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
                <p className="text-gray-700 font-semibold mb-2">Please log in to access your account</p>
                <p className="text-sm text-gray-500 mb-4">Use the login button in the header to continue.</p>
            </div>
        );
    }

    return children;
}
