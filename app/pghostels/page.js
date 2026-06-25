'use client';

import dynamic from 'next/dynamic';

const PremiumHomePage = dynamic(() => import('@/components/pghostels/PremiumHomePage').then(m => m.PremiumHomePage), { ssr: false });

export default function PGHostelsPage() {
    return <PremiumHomePage />;
}
