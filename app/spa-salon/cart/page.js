'use client';

import { SpaCartPage } from '@/components/spasalon/SpaCartPage';
import { useRouter } from 'next/navigation';
import { useServiceCart } from '@/context/ServiceCartContext';
import { toast } from 'sonner';

export default function SpaCartRoute() {
    const router = useRouter();
    const { cartItems, cartData } = useServiceCart();

    const handleProceed = () => {
        const spaItem = cartItems.find(item => item.itemType === 'professional_service');
        const providerId = cartData?.provider?._id || cartData?.providerId || spaItem?.providerId;

        if (spaItem && providerId && providerId !== 'undefined' && providerId !== 'null') {
            // Find any addons associated with this service
            const addons = cartItems
                .filter(item => item.itemType === 'professional_addon' && item.parentServiceId === spaItem.itemId)
                .map(item => item.itemId)
                .join(',');

            // Navigate to address with the parameters the booking flow expects
            router.push(`/spa-salon/booking/address?providerId=${providerId}&packageId=${spaItem.itemId}${addons ? `&addons=${addons}` : ''}`);
        } else if (!spaItem && cartItems.length > 0) {
            toast.error('Service details not found in cart.');
        } else {
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
