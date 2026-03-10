'use client';

import { ReligiousCartPage } from '@/components/religious/ReligiousCartPage';
import { useRouter } from 'next/navigation';

export default function ReligiousCartRoute() {
    const router = useRouter();

    return (
        <ReligiousCartPage
            onBack={() => router.back()}
            onProceedToAddress={() => router.push('/religious-services/booking/address')}
        />
    );
}
