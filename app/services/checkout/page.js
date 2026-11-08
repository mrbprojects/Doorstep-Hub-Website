'use client';

import { ServiceCartCheckoutPage } from '@/components/services/ServiceCartCheckoutPage';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CheckoutRoute() {
    const router = useRouter();
    const [selectedAddress] = useState(() => {
        if (typeof window === 'undefined') return null;
        try {
            const savedAddress = sessionStorage.getItem('selected_address');
            return savedAddress ? JSON.parse(savedAddress) : null;
        } catch {
            return null;
        }
    });

    return (
        <ServiceCartCheckoutPage
            selectedAddress={selectedAddress}
            onBack={() => router.push('/services/address')}
            onSuccess={(data) => {
                router.push(`/services/thank-you?date=${data?.bookedDate || ''}&time=${data?.bookedTime || ''}`);
            }}
        />
    );
}
