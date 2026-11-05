'use client';

import dynamic from 'next/dynamic';

const ReligiousServiceDetailPage = dynamic(
    () => import('@/components/religious/ReligiousServiceDetailPage'),
    { ssr: false }
);

export default function Page({ params, searchParams }) {
    return <ReligiousServiceDetailPage params={params} searchParams={searchParams} />;
}
