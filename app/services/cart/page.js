'use client';

import { CartPage } from '@/components/services/CartPage';
import { useRouter } from 'next/navigation';
import { useServiceCart } from '@/context/ServiceCartContext';
import { toast } from 'sonner';

export default function CartRoute() {
    const router = useRouter();
    const { cartItems, cartData } = useServiceCart();

    const handleProceed = () => {
        // Separate professional services from appliance services
        const professionalItem = cartItems.find(item => item.itemType === 'professional_service');
        const applianceItem = cartItems.find(item => item.itemType === 'service');
        
        // Extract providerId correctly from the root cart object
        const providerId = cartData?.provider?._id || cartData?.providerId || professionalItem?.providerId;

        if (professionalItem && providerId && providerId !== 'undefined' && providerId !== 'null') {
            const addons = cartItems
                .filter(item => item.itemType === 'professional_addon' && item.parentServiceId === professionalItem.itemId)
                .map(item => item.itemId)
                .join(',');

            localStorage.setItem('service_cart_flow', 'true');
            router.push(`/services/address?providerId=${providerId}&packageId=${professionalItem.itemId}${addons ? `&addons=${addons}` : ''}`);
        } else if (applianceItem) {
            // It's an appliance service, route to appliance flow
            localStorage.setItem('service_cart_flow', 'true');
            router.push('/appliances/address');
        } else if (!professionalItem && !applianceItem && cartItems.length > 0) {
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
