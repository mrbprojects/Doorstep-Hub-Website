'use client';

import { useRouter } from 'next/navigation';
import { ViewAllPage } from '@/components/appliances/ViewAllPage';

export default function VerifiedPartnersPage() {
    const router = useRouter();

    const handleServiceClick = (serviceId, categoryName, subcategoryName) => {
        const categoryParam = encodeURIComponent(categoryName || 'General');
        const subCategoryParam = encodeURIComponent(subcategoryName || 'Service');
        router.push(`/appliances/detail/${serviceId}?category=${categoryParam}&subCategory=${subCategoryParam}`);
    };

    return (
        <ViewAllPage
            type="featured" // Reuse featured services logic for now, or create a new 'verified' type if backend supports it
            onBack={() => router.back()}
            onServiceClick={handleServiceClick}
            enableRatingFilter={true}
        />
    );
}
