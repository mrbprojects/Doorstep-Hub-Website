'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReligiousRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/religious-services');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-white"></div>
        </div>
    );
}
