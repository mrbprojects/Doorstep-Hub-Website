'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
    clearStoredProviderSession,
    getProviderProfile,
    getStoredProviderSession,
    saveStoredProviderSession,
} from '@/lib/providerAuthApi';

const ProviderAuthContext = createContext(null);

export function useProviderAuth() {
    const ctx = useContext(ProviderAuthContext);
    if (!ctx) throw new Error('useProviderAuth must be used within ProviderAuthProvider');
    return ctx;
}

export function ProviderAuthProvider({ children }) {
    const [session, setSession] = useState(() => {
        if (typeof window === 'undefined') return null;
        try {
            return getStoredProviderSession() || null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(() => {
        if (typeof window === 'undefined') return true;
        try {
            const stored = getStoredProviderSession();
            return !!stored?.token;
        } catch {
            return false;
        }
    });

    const hydrate = useCallback(async () => {
        const stored = getStoredProviderSession();
        if (!stored?.token) {
            return;
        }
        try {
            const profile = await getProviderProfile(stored.token, stored.userId);
            const next = { ...stored, profile };
            saveStoredProviderSession(next);
            setSession(next);
        } catch {
            // Keep stored session
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const stored = getStoredProviderSession();
        if (stored?.token) {
            (async () => {
                try {
                    const profile = await getProviderProfile(stored.token, stored.userId);
                    if (isMounted) {
                        const next = { ...stored, profile };
                        saveStoredProviderSession(next);
                        setSession(next);
                    }
                } catch {
                    // Keep stored session
                } finally {
                    if (isMounted) {
                        setLoading(false);
                    }
                }
            })();
        }
        return () => {
            isMounted = false;
        };
    }, []);

    const loginSession = useCallback((data) => {
        saveStoredProviderSession(data);
        setSession(data);
    }, []);

    const refreshProfile = useCallback(async () => {
        if (!session?.token) return null;
        const profile = await getProviderProfile(session.token, session.userId);
        const next = { ...session, profile };
        saveStoredProviderSession(next);
        setSession(next);
        return profile;
    }, [session]);

    const logout = useCallback(() => {
        clearStoredProviderSession();
        setSession(null);
    }, []);

    return (
        <ProviderAuthContext.Provider
            value={{
                session,
                token: session?.token || null,
                userId: session?.userId || null,
                profile: session?.profile || null,
                phone: session?.phone || '',
                isAuthenticated: !!session?.token,
                loading,
                loginSession,
                refreshProfile,
                logout,
                hydrate,
            }}
        >
            {children}
        </ProviderAuthContext.Provider>
    );
}
