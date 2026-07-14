import dynamic from 'next/dynamic';
import { ComingSoonPageOverlay } from '@/components/shared/ComingSoonPageOverlay';

const HomePage = dynamic(() => import('@/components/spasalon/HomePage').then(m => m.HomePage), { ssr: false });

export default function SpaSalonPage() {
    // Coming soon — keep full landing UI, block interaction with shade
    // return <HomePage />;
    return (
        <ComingSoonPageOverlay label="Coming Soon">
            <HomePage />
        </ComingSoonPageOverlay>
    );
}
