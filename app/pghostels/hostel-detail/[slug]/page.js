'use client';

import dynamic from 'next/dynamic';

const NewHostelDetailPage = dynamic(
    () => import('@/components/pghostels/NewHostelDetailPage'),
    { ssr: false }
);

export default function Page({ params, searchParams }) {
    return <NewHostelDetailPage params={params} searchParams={searchParams} />;
}
