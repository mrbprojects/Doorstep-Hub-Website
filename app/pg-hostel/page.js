'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PGHostelRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the correct route
        router.replace('/pghostels');
    }, [router]);

    // return (
    //     // <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-[#037166]/5 to-[#05080D]">
    //     //     <div className="text-center">
    //     //         <div className="text-2xl font-bold text-gray-900 mb-2">Redirecting...</div>
    //     //         <div className="text-gray-600">Taking you to PG & Hostels</div>
    //     //     </div>
    //     // </div>
    // );
}
