'use client';

import { useRouter } from 'next/navigation';
import { ViewAllPage } from '@/components/services/ViewAllPage';

export default function FeaturedPage() {
    const router = useRouter();

    const handleServiceClick = (serviceId, categoryName, subcategoryName) => {
        const categoryParam = encodeURIComponent(categoryName || 'General');
        const subCategoryParam = encodeURIComponent(subcategoryName || 'Service');
        router.push(`/services/detail/${serviceId}?category=${categoryParam}&subCategory=${subCategoryParam}`);
    };

    return (
        <ViewAllPage
            type="featured"
            onBack={() => router.back()}
            onServiceClick={handleServiceClick}
            enableRatingFilter={true}
        />
    );
}
