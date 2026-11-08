'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';

const BookingConfirmationPage = dynamic(
    () => import('@/components/services/BookingConfirmationPage').then((mod) => mod.BookingConfirmationPage),
    {
        ssr: false,
        loading: () => <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>
    }
);

function BookingContent() {
    const router = useRouter();
    const [address] = useState(() => {
        if (typeof window === 'undefined') return null;
        try {
            const savedAddress = sessionStorage.getItem('selected_address');
            return savedAddress ? JSON.parse(savedAddress) : null;
        } catch {
            return null;
        }
    });

    return (
        <BookingConfirmationPage
            address={address}
            onBack={() => router.push('/services/address')}
            onConfirmBooking={(data) => {
                router.push(`/services/thank-you?date=${data?.bookedDate || ''}&time=${data?.bookedTime || ''}`);
            }}
        />
    );
}

export default function BookingRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <BookingContent />
        </Suspense>
    );
}
