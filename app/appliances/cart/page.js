'use client';

import { CartPage } from '@/components/appliances/CartPage';
import { useRouter } from 'next/navigation';

export default function CartRoute() {
    const router = useRouter();

    return (
        <CartPage
            onBack={() => router.back()}
            onProceedToAddress={() => {
                localStorage.setItem('service_cart_flow', 'true');
                router.push('/appliances/address');
            }}
        />
    );
}
