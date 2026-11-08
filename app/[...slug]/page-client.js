'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { CategoryOrListingPage } from '@/components/appliances/CategoryOrListingPage';
import { SubCategoryPageSkeleton } from '@/components/skeletons';

export default function RootCatchAllPageClient() {
    const params = useParams();
    const slugParts = params.slug; // This will be an array

    // Root slugs are reserved for appliance SEO URLs only. Spa, religious,
    // and PG/hostel flows live under their own route folders.
    const lastSlug = Array.isArray(slugParts) ? slugParts[slugParts.length - 1] : slugParts;

    if (!lastSlug) {
        return <SubCategoryPageSkeleton />;
    }

    const parentSlug = Array.isArray(slugParts) && slugParts.length > 1 ? slugParts[slugParts.length - 2] : null;

    return (
        <Suspense fallback={<SubCategoryPageSkeleton />}>
            <CategoryOrListingPage slug={lastSlug} categorySlug={parentSlug} />
        </Suspense>
    );
}
