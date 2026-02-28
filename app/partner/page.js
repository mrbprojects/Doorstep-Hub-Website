'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Old /partner route redirects to /service-partner
export default function PartnerRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/service-partner');
    }, [router]);
    return null;
}
