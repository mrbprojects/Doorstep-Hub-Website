import { StoreDetailPage } from '@/components/services/StoreDetailPage';

export default function StoreRoute({ params, searchParams }) {
    return (
        <StoreDetailPage
            storeId={params.storeId}
            serviceId={searchParams.serviceId || null}
        />
    );
}
