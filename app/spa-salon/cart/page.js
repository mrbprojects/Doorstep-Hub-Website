'use client';

import { SpaCartPage } from '@/components/spasalon/SpaCartPage';
import { useRouter } from 'next/navigation';
import { useServiceCart } from '@/context/ServiceCartContext';

export default function SpaCartRoute() {
    const router = useRouter();
    const { cartItems } = useServiceCart();

    const handleProceed = () => {
        // Find the main Spa/Salon service in the cart
        const spaItem = cartItems.find(item => item.itemType === 'professional_service');
        // Fallback: If spaItem doesn't have providerId, try to find it from any other item
        const providerId = spaItem.providerId || cartItems.find(i => i.providerId)?.providerId;

        if (spaItem && providerId && providerId !== 'undefined') {
            // Find any addons associated with this service
            const addons = cartItems
                .filter(item => item.itemType === 'professional_addon' && item.parentServiceId === spaItem.itemId)
                .map(item => item.itemId)
                .join(',');

            // Navigate to address with the parameters the booking flow expects
            router.push(`/spa-salon/booking/address?providerId=${providerId}&packageId=${spaItem.itemId}${addons ? `&addons=${addons}` : ''}`);
        } else {
            // If the cart is empty or main item is missing, go back to top-level
            router.push('/spa-salon');
        }
    };

    return (
        <SpaCartPage
            onBack={() => router.back()}
            onProceedToAddress={handleProceed}
        />
    );
}
