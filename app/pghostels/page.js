'use client';

import dynamic from 'next/dynamic';
import { ComingSoonPageOverlay } from '@/components/shared/ComingSoonPageOverlay';

const PremiumHomePage = dynamic(() => import('@/components/pghostels/PremiumHomePage').then(m => m.PremiumHomePage), { ssr: false });

export default function PGHostelsPage() {
    // Coming soon — keep full landing UI, block interaction with shade
    // return <PremiumHomePage />;
    return (
        <ComingSoonPageOverlay label="Coming Soon">
            <PremiumHomePage />
        </ComingSoonPageOverlay>
    );
}
