'use client';

import { AddressPage } from '@/components/appliances/AddressPage';
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
                const serviceSlug = localStorage.getItem('last_service_slug');
                const serviceId = localStorage.getItem('last_service_id');

                if (serviceSlug) {
                    router.push(`/${serviceSlug}`);
                } else if (serviceId) {
                    router.push(`/appliances/detail/${serviceId}`);
                } else {
                    router.push('/appliances/cart');
                }
            }}
            onContinue={() => {
                const isServiceCartFlow = localStorage.getItem('service_cart_flow');
                if (isServiceCartFlow) {
                    router.push('/appliances/checkout');
                    setTimeout(() => localStorage.removeItem('service_cart_flow'), 100);
                } else {
                    router.push('/appliances/booking');
                }
            }}
        />
    );
}
