import { StoreDetailPage } from '@/components/appliances/StoreDetailPage';

export default function StoreRoute({ params, searchParams }) {
    return (
        <StoreDetailPage
            storeId={params.storeId}
            serviceId={searchParams.serviceId || null}
        />
    );
}
