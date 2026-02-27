'use client';

import { useRouter } from 'next/navigation';
import { ViewAllPage } from '@/components/appliances/ViewAllPage';

export default function RecentServicesPage() {
    const router = useRouter();

    const handleServiceClick = (serviceId, categoryName, subcategoryName) => {
        const categoryParam = encodeURIComponent(categoryName || 'General');
        const subCategoryParam = encodeURIComponent(subcategoryName || 'Service');
        router.push(`/appliances/detail/${serviceId}?category=${categoryParam}&subCategory=${subCategoryParam}`);
    };

    return (
        <ViewAllPage
            type="recent"
            onBack={() => router.back()}
            onServiceClick={handleServiceClick}
        />
    );
}
