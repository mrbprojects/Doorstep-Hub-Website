'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '@/config/env';

// ─── Default fee fallbacks (used until the backend adds these fields to policy) ───
// Backend field names to watch for: onlineBookingFee, doorstepInspectionFee
const DEFAULT_ONLINE_BOOKING_FEE = 125;
const DEFAULT_DOORSTEP_INSPECTION_FEE = 175;

const GlobalSettingsContext = createContext(null);

export function GlobalSettingsProvider({ children }) {
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(
                    `${API_BASE_URL}/app/get_global_settings`
                );
                const data = await res.json();
                if (data.success && data.policy) {
                    setPolicy(data.policy);
                }
            } catch (err) {
                console.warn('GlobalSettings fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // Derive fee values — will auto-update once backend adds these policy fields
    const onlineBookingFee = Number(
        policy?.onlineBookingFee
        ?? policy?.platformFee
        ?? policy?.bookingFee
        ?? policy?.crmBookingFee
        ?? DEFAULT_ONLINE_BOOKING_FEE
    );

    const doorstepInspectionFee = Number(
        policy?.doorstepInspectionFee
        ?? policy?.consultationFee
        ?? policy?.inspectionFee
        ?? policy?.crmConsultationFee
        ?? DEFAULT_DOORSTEP_INSPECTION_FEE
    );

    return (
        <GlobalSettingsContext.Provider value={{
            policy,
            loading,
            onlineBookingFee,
            doorstepInspectionFee,
        }}>
            {children}
        </GlobalSettingsContext.Provider>
    );
}

export function useGlobalSettings() {
    return useContext(GlobalSettingsContext);
}
