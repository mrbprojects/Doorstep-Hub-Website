import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('@/components/spasalon/HomePage').then(m => m.HomePage), { ssr: false });

export default function SpaSalonPage() {
    return <HomePage />;
}
