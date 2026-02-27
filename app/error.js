'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Runtime Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
                <p className="text-gray-500 mb-8">
                    We encountered an unexpected error. Don't worry, it's not you - it's us.
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={() => reset()}
                        className="w-full bg-[#037166] hover:bg-[#025951] text-white rounded-xl py-6 text-lg font-semibold"
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => window.location.href = '/'}
                        className="w-full text-gray-500 hover:text-gray-900"
                    >
                        Go to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
