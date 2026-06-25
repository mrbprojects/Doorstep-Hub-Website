import dynamic from 'next/dynamic';

const DetailsPage = dynamic(() => import('@/components/spasalon/DetailsPage').then(m => m.DetailsPage), { ssr: false });

export default function SpaSalonDetailSlugPage() {
    return <DetailsPage />;
}
