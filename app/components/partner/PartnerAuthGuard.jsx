'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useProviderAuth } from '@/context/ProviderAuthContext';

export function PartnerAuthGuard({ children }) {
    const { isAuthenticated, loading } = useProviderAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            window.location.hash = 'join-partner';
        }
    }, [loading, isAuthenticated]);

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
                <p className="text-gray-700 font-semibold mb-2">Partner login required</p>
                <p className="text-sm text-gray-500 mb-4">
                    Verify your mobile number on the Become a Partner page to access your dashboard.
                </p>
                <Link
                    href="/service-partner#join-partner"
                    className="px-6 py-3 bg-[#037166] text-white font-semibold rounded-xl hover:bg-[#025951] transition-all"
                >
                    Go to Partner Login
                </Link>
            </div>
        );
    }

    return children;
}
