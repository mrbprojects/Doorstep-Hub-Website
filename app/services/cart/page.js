'use client';

import { CartPage } from '@/components/services/CartPage';
import { useRouter } from 'next/navigation';
import { useServiceCart } from '@/context/ServiceCartContext';
import { toast } from 'sonner';

export default function CartRoute() {
    const router = useRouter();
    const { cartItems, cartData } = useServiceCart();

    const handleProceed = () => {
        const professionalItem = cartItems.find(item => item.itemType === 'professional_service' || item.itemType === 'service');
        // Extract providerId correctly from the root cart object
        const providerId = cartData?.provider?._id || cartData?.providerId || professionalItem?.providerId;

        if (professionalItem && providerId && providerId !== 'undefined' && providerId !== 'null') {
            const addons = cartItems
                .filter(item => item.itemType === 'professional_addon' && item.parentServiceId === professionalItem.itemId)
                .map(item => item.itemId)
                .join(',');

            router.push(`/services/address?providerId=${providerId}&packageId=${professionalItem.itemId}${addons ? `&addons=${addons}` : ''}`);
        } else if (!professionalItem && cartItems.length > 0) {
            toast.error('Service details not found in cart.');
        } else {
            localStorage.setItem('service_cart_flow', 'true');
            router.push('/services/address');
        }
    };

    return (
        <CartPage
            onBack={() => router.back()}
            onProceedToAddress={handleProceed}
        />
    );
}
