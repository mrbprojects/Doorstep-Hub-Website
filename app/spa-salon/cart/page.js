'use client';

import { SpaCartPage } from '@/components/spasalon/SpaCartPage';
import { useRouter } from 'next/navigation';

export default function SpaCartRoute() {
    const router = useRouter();

    return (
        <SpaCartPage
            onBack={() => router.back()}
            onProceedToAddress={() => router.push('/spa-salon/booking/address')}
        />
    );
}
