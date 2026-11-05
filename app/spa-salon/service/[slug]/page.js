'use client';

import dynamic from 'next/dynamic';

const SpaServiceDetailPage = dynamic(
    () => import('@/components/spasalon/SpaServiceDetailPage'),
    { ssr: false }
);

export default function Page({ params, searchParams }) {
    return <SpaServiceDetailPage params={params} searchParams={searchParams} />;
}
