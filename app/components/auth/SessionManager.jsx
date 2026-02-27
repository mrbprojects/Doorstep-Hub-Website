'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionExpiryModal } from '@/components/ui/SessionExpiryModal';
import { toast } from 'sonner';

export const SESSION_EVENT = 'session-expired';

export function SessionManager() {
    const [isExpired, setIsExpired] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // 1. Listen for custom event from API interceptors
        const handleSessionExpired = () => {
            setIsExpired(true);
            // Optional: Clear token immediately
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
        };

        window.addEventListener(SESSION_EVENT, handleSessionExpired);

        // 2. Check token validity on window focus (for multi-tab support)
        const handleFocus = () => {
            const token = localStorage.getItem('auth_token');
            // Simple existence check - in real app, decode JWT to check exp
            if (!token && localStorage.getItem('user_data')) {
                // If we had user data but no token, consider expired
                setIsExpired(true);
            }
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener(SESSION_EVENT, handleSessionExpired);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const handleLogin = () => {
        setIsExpired(false);
        // Redirect to login (adjust path as needed)
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
    };

    return (
        <SessionExpiryModal
            isOpen={isExpired}
            onLogin={handleLogin}
        />
    );
}

// Helper to trigger expiry from anywhere
export const triggerSessionExpiry = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(SESSION_EVENT));
    }
};
