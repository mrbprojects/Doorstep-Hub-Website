'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import NewHostelDetailPage from '@/pghostels/hostel-detail/[slug]/page';
import SpaServiceDetailPage from '@/components/spasalon/SpaServiceDetailPage';
import { CategoryOrListingPage } from '@/components/appliances/CategoryOrListingPage';
import SpaSubCategoryPage from '@/components/spasalon/SpaSubCategoryPage';

export default function RootCatchAllPage() {
    const params = useParams();
    const slugParts = params.slug; // This will be an array
    const [providerType, setProviderType] = useState(null); // null=loading, 'hostel', 'spa', 'none'
    const SPA_SERVICE_ID = '69524f4a57bb211ca094e5e6';

    // Take the last part of the slug for specialist detail or subcategory
    const lastSlug = Array.isArray(slugParts) ? slugParts[slugParts.length - 1] : slugParts;

    useEffect(() => {
        if (!lastSlug) return;
        
        let active = true;
        const checkSlug = async () => {
            try {
                const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/single-professional-provider`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ providerSlug: lastSlug })
                });
                const data = await resp.json();
                if (!active) return;
                
                if (data?.success && Array.isArray(data.storeData) && data.storeData.length > 0) {
                    const store = data.storeData[0];
                    if (store.serviceId === SPA_SERVICE_ID) {
                        setProviderType('spa');
                    } else {
                        setProviderType('hostel');
                    }
                } else {
                    setProviderType('none');
                }
            } catch (e) {
                if (active) setProviderType('none');
            }
        };
        checkSlug();
        return () => { active = false; };
    }, [lastSlug]);

    if (!lastSlug) {
        return <div className="min-h-screen bg-transparent" />;
    }

    if (providerType === null) {
        return <div className="min-h-screen bg-transparent flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#C06C84] border-t-transparent rounded-full animate-spin" />
        </div>;
    }

    if (providerType === 'hostel') {
        return <NewHostelDetailPage slugOverride={lastSlug} />;
    }

    if (providerType === 'spa') {
        return <SpaServiceDetailPage slugOverride={lastSlug} />;
    }

    // If it's a 2-level slug and not a provider, handle as Spa Subcategory
    if (Array.isArray(slugParts) && slugParts.length === 2 && providerType === 'none') {
        return (
            <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
                <SpaSubCategoryPage slugOverride={lastSlug} />
            </Suspense>
        );
    }

    // Default to CategoryOrListingPage for single slugs
    return (
        <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
            <CategoryOrListingPage slug={lastSlug} />
        </Suspense>
    );
}
