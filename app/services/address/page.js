'use client';

import { AddressPage } from '@/components/services/AddressPage';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddressRoute() {
    const router = useRouter();
    const [selectedAddress, setSelectedAddress] = useState(null);

    return (
        <AddressPage
            selectedAddress={selectedAddress}
            onSelectAddress={setSelectedAddress}
            onBack={() => {
                const isDirect = localStorage.getItem('last_service_id');
                if (isDirect) {
                    const serviceId = localStorage.getItem('last_service_id');
                    router.push(`/services/detail/${serviceId}`);
                } else {
                    router.push('/services/cart');
                }
            }}
            onContinue={() => {
                const isServiceCartFlow = localStorage.getItem('service_cart_flow');
                if (isServiceCartFlow) {
                    router.push('/services/checkout');
                    setTimeout(() => localStorage.removeItem('service_cart_flow'), 100);
                } else {
                    router.push('/services/booking');
                }
            }}
        />
    );
}
