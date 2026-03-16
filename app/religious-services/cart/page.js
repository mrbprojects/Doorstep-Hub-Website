'use client';

import { ReligiousCartPage } from '@/components/religious/ReligiousCartPage';
import { useRouter } from 'next/navigation';
import { useServiceCart } from '@/context/ServiceCartContext';

export default function ReligiousCartRoute() {
    const router = useRouter();
    const { cartItems } = useServiceCart();

    const handleProceed = () => {
        // Find the main Religious service in the cart
        const religiousItem = cartItems.find(item => item.itemType === 'professional_service');
        if (religiousItem) {
            // Find any addons associated with this service
            const addons = cartItems
                .filter(item => item.itemType === 'professional_addon' && item.parentServiceId === religiousItem.itemId)
                .map(item => item.itemId)
                .join(',');

            // Navigate to address with the parameters the booking flow expects
            router.push(`/religious-services/booking/address?providerId=${religiousItem.providerId}&packageId=${religiousItem.itemId}${addons ? `&addons=${addons}` : ''}`);
        } else {
            // If the cart is empty or main item is missing, go back to services
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
