'use client';

import { PGCartPage } from '@/components/pghostels/PGCartPage';
import { useRouter } from 'next/navigation';
import { useServiceCart } from '@/context/ServiceCartContext';

export default function PGCartRoute() {
    const router = useRouter();
    const { cartItems } = useServiceCart();

    const handleProceed = () => {
        const pgItem = cartItems.find(item => item.itemType === 'professional_service');
        // Fallback: If pgItem doesn't have providerId, try to find it from any other item
        const providerId = pgItem.providerId || cartItems.find(i => i.providerId)?.providerId;

        if (pgItem && providerId && providerId !== 'undefined') {
            const addons = cartItems
                .filter(item => item.itemType === 'professional_addon' && item.parentServiceId === pgItem.itemId)
                .map(item => item.itemId)
                .join(',');

            router.push(`/pghostels/booking/address?providerId=${providerId}&packageId=${pgItem.itemId}${addons ? `&addons=${addons}` : ''}`);
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
