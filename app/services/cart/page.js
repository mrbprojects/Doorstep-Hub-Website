'use client';

import { CartPage } from '@/components/services/CartPage';
import { useRouter } from 'next/navigation';
import { useServiceCart } from '@/context/ServiceCartContext';

export default function CartRoute() {
    const router = useRouter();
    const { cartItems } = useServiceCart();

    const handleProceed = () => {
        // Check if there's a PG Hostel service in the cart
        const pgItem = cartItems.find(item => item.itemType === 'professional_service');
        if (pgItem) {
            // Find addons for this service
            const addons = cartItems
                .filter(item => item.itemType === 'professional_addon' && item.parentServiceId === pgItem.itemId)
                .map(item => item.itemId)
                .join(',');

            router.push(`/pghostels/booking/address?providerId=${pgItem.providerId}&packageId=${pgItem.itemId}${addons ? `&addons=${addons}` : ''}`);
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
