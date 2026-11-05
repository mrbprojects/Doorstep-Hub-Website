'use client';

import { AddressPage } from '@/components/services/AddressPage';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function AddressRouteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
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
                
                // Reconstruct query string
                const queryString = searchParams.toString();
                const routeSuffix = queryString ? `?${queryString}` : '';

                if (isServiceCartFlow) {
                    router.push(`/services/checkout${routeSuffix}`);
                    setTimeout(() => localStorage.removeItem('service_cart_flow'), 100);
                } else {
                    router.push(`/services/booking${routeSuffix}`);
                }
            }}
        />
    );
}

export default function AddressRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <AddressRouteContent />
        </Suspense>
    );
}
