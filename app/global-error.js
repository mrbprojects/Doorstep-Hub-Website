'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalError({ error, reset }) {
    const router = useRouter();

    useEffect(() => {
        console.error('[GlobalError] Unhandled root application exception:', error);
    }, [error]);

    const handleReturnToBooking = () => {
        if (typeof window !== 'undefined') {
            const lastUrl = sessionStorage.getItem('last_checkout_url');
            if (lastUrl && lastUrl.startsWith('/')) {
                router.push(lastUrl);
                return;
            }
            router.push('/appliances/checkout');
        }
    };

    return (
        <html lang="en">
            <body className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl font-bold">
                        !
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        An unexpected application error occurred. Your booking details and selections are preserved.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={handleReturnToBooking}
                            className="w-full py-3.5 px-4 bg-[#037166] hover:bg-[#025951] text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                        >
                            Return to Booking Screen
                        </button>
                        <button
                            onClick={() => reset()}
                            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
