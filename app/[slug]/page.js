'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import NewHostelDetailPage from '@/pghostels/hostel-detail/[slug]/page';
import { CategoryOrListingPage } from '@/components/appliances/CategoryOrListingPage';

export default function RootSlugPage() {
    const params = useParams();
    const slug = params.slug;
    const [isHostel, setIsHostel] = useState(null); // null=loading, true=hostel, false=other

    useEffect(() => {
        let active = true;
        const checkSlug = async () => {
            try {
                const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/single-professional-provider`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ providerSlug: slug })
                });
                const data = await resp.json();
                if (!active) return;
                setIsHostel(data?.success && Array.isArray(data.storeData) && data.storeData.length > 0);
            } catch (e) {
                if (active) setIsHostel(false);
            }
        };
        checkSlug();
        return () => { active = false; };
    }, [slug]);

    if (isHostel === null) {
        return <div className="min-h-screen bg-white" />;
    }

    if (isHostel) {
        return <NewHostelDetailPage slugOverride={slug} />;
    }

    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
            <CategoryOrListingPage slug={slug} />
        </Suspense>
    );
}
