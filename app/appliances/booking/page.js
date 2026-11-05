'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

const BookingConfirmationPage = dynamic(
    () => import('@/components/appliances/BookingConfirmationPage').then((mod) => mod.BookingConfirmationPage),
    {
        ssr: false,
        loading: () => <div className="min-h-screen bg-white" />
    }
);

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
            onBack={() => {
                if (typeof window !== 'undefined' && window.history.length > 2) {
                    router.back();
                } else {
                    router.push('/appliances/address');
                }
            }}
            onChangeAddress={() => router.push('/appliances/address')}
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
