'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ServicesListingPage } from '@/components/appliances/ServicesListingPage';


import { Loader2 } from 'lucide-react';

function ApplianceListingContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug;
    const categorySlug = searchParams.get('cat') || null;
    const subCategoryName = searchParams.get('name') || undefined;
    const subCategoryId = searchParams.get('id') || undefined;

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <ServicesListingPage
                slug={slug}
                category={categorySlug}
                subCategory={subCategoryName}
                subCategoryId={subCategoryId}
            />
        </div>
    );
}

export default function ApplianceListingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#037166] animate-spin" />
            </div>
        }>
            <ApplianceListingContent />
        </Suspense>
    );
}
