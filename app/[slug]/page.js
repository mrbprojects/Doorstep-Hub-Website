import { Suspense } from 'react';
import { CategoryOrListingPage } from '@/components/appliances/CategoryOrListingPage';

export default function RootSlugPage({ params }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
            <CategoryOrListingPage
                slug={params.slug}
            />
        </Suspense>
    );
}
