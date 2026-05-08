'use client';

import { BookingConfirmationPage } from '@/components/appliances/BookingConfirmationPage';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function BookingContent() {
    const router = useRouter();
    const [address, setAddress] = useState(null);

    useEffect(() => {
        // Get the selected address from session storage
        const savedAddress = sessionStorage.getItem('selected_address');
        if (savedAddress) {
            setAddress(JSON.parse(savedAddress));
        }
    }, []);

    return (
        <BookingConfirmationPage
            address={address}
            onBack={() => router.back()}
            onConfirmBooking={(data) => {
                router.push(`/appliances/thank-you?date=${data?.bookedDate || ''}&time=${data?.bookedTime || ''}`);
            }}
        />
    );
}

export default function BookingRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <BookingContent />
        </Suspense>
    );
}
