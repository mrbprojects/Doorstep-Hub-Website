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
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const hydrate = useCallback(async () => {
        const stored = getStoredProviderSession();
        if (!stored?.token) {
            setSession(null);
            setLoading(false);
            return;
        }
        setSession(stored);
        try {
            const profile = await getProviderProfile(stored.token, stored.userId);
            const next = { ...stored, profile };
            saveStoredProviderSession(next);
            setSession(next);
        } catch {
            setSession(stored);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

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
