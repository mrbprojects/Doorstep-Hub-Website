'use client';

import { useRouter } from 'next/navigation';
import { ViewAllPage } from '@/components/services/ViewAllPage';

export default function ServiceCentersPage() {
    const router = useRouter();

    const handleStoreClick = (storeId) => {
        router.push(`/service-list/${storeId}`);
    };

    return (
        <ViewAllPage
            type="stores"
            onBack={() => router.back()}
            onStoreClick={handleStoreClick}
            enableRatingFilter={true}
        />
    );
}
