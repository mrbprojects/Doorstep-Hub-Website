'use client';

import { ReligiousCartPage } from '@/components/religious/ReligiousCartPage';
import { useRouter } from 'next/navigation';
import { useServiceCart } from '@/context/ServiceCartContext';
import { toast } from 'sonner';

export default function ReligiousCartRoute() {
    const router = useRouter();
    const { cartItems, cartData } = useServiceCart();

    const handleProceed = () => {
        const religiousItem = cartItems.find(item => item.itemType === 'professional_service');
        const providerId = cartData?.provider?._id || cartData?.providerId || religiousItem?.providerId;

        if (religiousItem && providerId && providerId !== 'undefined' && providerId !== 'null') {
            // Find any addons associated with this service
            const addons = cartItems
                .filter(item => item.itemType === 'professional_addon' && item.parentServiceId === religiousItem.itemId)
                .map(item => item.itemId)
                .join(',');

            // Navigate to address with the parameters the booking flow expects
            router.push(`/religious-services/booking/address?providerId=${providerId}&packageId=${religiousItem.itemId}${addons ? `&addons=${addons}` : ''}`);
        } else if (!religiousItem && cartItems.length > 0) {
            toast.error('Ritual details not found in cart.');
        } else {
            router.push('/religious-services');
        }
    };

    return (
        <ReligiousCartPage
            onBack={() => router.back()}
            onProceedToAddress={handleProceed}
        />
    );
}
