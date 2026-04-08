'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { CategoryOrListingPage } from '@/components/appliances/CategoryOrListingPage';

export default function RootCatchAllPage() {
    const params = useParams();
    const slugParts = params.slug; // This will be an array

    // Root slugs are reserved for appliance SEO URLs only. Spa, religious,
    // and PG/hostel flows live under their own route folders.
    const lastSlug = Array.isArray(slugParts) ? slugParts[slugParts.length - 1] : slugParts;

    if (!lastSlug) {
        return <div className="min-h-screen bg-transparent" />;
    }

    const parentSlug = Array.isArray(slugParts) && slugParts.length > 1 ? slugParts[slugParts.length - 2] : null;

    return (
        <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
            <CategoryOrListingPage slug={lastSlug} categorySlug={parentSlug} />
        </Suspense>
    );
}
