'use client';

import { PGCartPage } from '@/components/pghostels/PGCartPage';
import { useRouter } from 'next/navigation';
import { useServiceCart } from '@/context/ServiceCartContext';
import { toast } from 'sonner';

export default function PGCartRoute() {
    const router = useRouter();
    const { cartItems, cartData } = useServiceCart();

    const handleProceed = () => {
        const pgItem = cartItems.find(item => item.itemType === 'professional_service');
        const providerId = cartData?.provider?._id || cartData?.providerId || pgItem?.providerId;

        if (pgItem && providerId && providerId !== 'undefined' && providerId !== 'null') {
            const addons = cartItems
                .filter(item => item.itemType === 'professional_addon' && item.parentServiceId === pgItem.itemId)
                .map(item => item.itemId)
                .join(',');

            router.push(`/pghostels/booking/address?providerId=${providerId}&packageId=${pgItem.itemId}${addons ? `&addons=${addons}` : ''}`);
        } else if (!pgItem && cartItems.length > 0) {
            toast.error('Booking details not found in cart.');
        } else {
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
