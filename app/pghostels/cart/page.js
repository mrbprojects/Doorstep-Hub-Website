'use client';

import { PGCartPage } from '@/components/pghostels/PGCartPage';
import { useRouter } from 'next/navigation';
import { useServiceCart } from '@/context/ServiceCartContext';

export default function PGCartRoute() {
    const router = useRouter();
    const { cartItems } = useServiceCart();

    const handleProceed = () => {
        const pgItem = cartItems.find(item => item.itemType === 'professional_service');
        if (pgItem) {
            const addons = cartItems
                .filter(item => item.itemType === 'professional_addon' && item.parentServiceId === pgItem.itemId)
                .map(item => item.itemId)
                .join(',');

            router.push(`/pghostels/booking/address?providerId=${pgItem.providerId}&packageId=${pgItem.itemId}${addons ? `&addons=${addons}` : ''}`);
        } else {
            // Fallback or alert if no PG item is found but they are in PG cart
            router.push('/pghostels');
        }
    };

    return (
        <PGCartPage
            onBack={() => router.back()}
            onProceedToAddress={handleProceed}
        />
    );
}
