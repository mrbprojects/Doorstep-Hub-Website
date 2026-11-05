'use client';

import dynamic from 'next/dynamic';

const SpaServiceDetailPage = dynamic(
    () => import('@/components/spasalon/SpaServiceDetailPage'),
    { ssr: false }
);

export default function RootSpaServicePage() {
    return <SpaServiceDetailPage />;
}
