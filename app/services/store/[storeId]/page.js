import dynamic from 'next/dynamic';

const StoreDetailPage = dynamic(
    () => import('@/components/services/StoreDetailPage').then(m => m.StoreDetailPage),
    { ssr: false }
);

export default function StoreRoute({ params, searchParams }) {
    return (
        <StoreDetailPage
            storeId={params.storeId}
            serviceId={searchParams.serviceId || null}
        />
    );
}
