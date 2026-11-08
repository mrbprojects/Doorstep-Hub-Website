'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';

const AddressPage = dynamic(
    () => import('@/components/appliances/AddressPage').then((mod) => mod.AddressPage),
    {
        ssr: false,
        loading: () => <div className="min-h-screen bg-white" />
    }
);

export default function AddressRoute() {
    const router = useRouter();
    const [selectedAddress, setSelectedAddress] = useState(null);

    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <AddressPage
                selectedAddress={selectedAddress}
                onSelectAddress={setSelectedAddress}
                onBack={() => router.back()}
                onContinue={() => {
                    const isServiceCartFlow = typeof window !== 'undefined' ? localStorage.getItem('service_cart_flow') : null;
                    if (isServiceCartFlow) {
                        router.push('/appliances/checkout');
                        setTimeout(() => localStorage.removeItem('service_cart_flow'), 100);
                    } else {
                        router.push('/appliances/booking');
                    }
                }}
            />
        </Suspense>
    );
}
