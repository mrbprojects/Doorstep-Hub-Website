'use client';

import { BookingConfirmationPage } from '@/components/services/BookingConfirmationPage';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function BookingContent() {
    const router = useRouter();
    const [address, setAddress] = useState(null);

    useEffect(() => {
        // Get address from session storage or context
        const savedAddress = sessionStorage.getItem('selected_address');
        if (savedAddress) {
            setAddress(JSON.parse(savedAddress));
        }
    }, []);

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

import { Suspense } from 'react';

export default function BookingRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <BookingContent />
        </Suspense>
    );
}
