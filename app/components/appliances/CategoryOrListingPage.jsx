'use client';

import React, { useState, useEffect } from 'react';
import { CategoryPage } from '@/components/appliances/CategoryPage';
import { ServicesListingPage } from '@/components/appliances/ServicesListingPage';
import { ServiceDetailsPage } from '@/components/appliances/ServiceDetailsPage';
import { StoreDetailPage } from '@/components/appliances/StoreDetailPage';
import { Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

export function CategoryOrListingPage({ slug, onBack }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryServiceId = searchParams.get('id');
    const [viewType, setViewType] = useState('loading'); // 'loading', 'category', 'listing', 'detail', '404'
    const [categoryData, setCategoryData] = useState(null);
    const [serviceId, setServiceId] = useState(queryServiceId);

    // Immediate redirection for 404/not found state
    useEffect(() => {
        if (viewType === '404') {
            router.replace('/book-appointment');
        }
    }, [viewType, router]);

    useEffect(() => {
        const checkSlugType = async () => {
            try {
                // 0. If we have a queryServiceId override, go straight to detail
                if (queryServiceId) {
                    setServiceId(queryServiceId);
                    setViewType('detail');
                    return;
                }
                // 1. Try to fetch as a Category first
                const catResponse = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/getsubcategorysbycategoryid', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug: slug })
                });

                const catData = await catResponse.json();

                // If the API returns successfully but has a suspicious number of subcategories (e.g. > 15),
                // it might be returning all subcategories instead of filtering by category.
                // We'll trust it only if it's successful and has a reasonable count, 
                // otherwise we'll double check against the hierarchical list.
                if (catData.success && Array.isArray(catData.data) && catData.data.length > 0 && catData.data.length < 20) {
                    setCategoryData(catData);
                    setViewType('category');
                    return;
                }

                // 2. Try to fetch as a deep Category or Subcategory
                const allRes = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/all-services');
                const allData = await allRes.json();

                if (allData.success && Array.isArray(allData.data)) {
                    // Slug generation helper
                    const generateSlug = (name) => name?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';

                    for (const cat of allData.data) {
                        // Check if it matches a category slug
                        if (cat.slug === slug || generateSlug(cat.name) === slug) {
                            setCategoryData({
                                success: true,
                                data: cat.subcategories || [],
                                categoryName: cat.name,
                                slug: cat.slug || slug
                            });
                            setViewType('category');
                            return;
                        }

                        // Check subcategories
                        const subcategories = cat.subcategories || [];
                        for (const sub of subcategories) {
                            if (sub.slug === slug || generateSlug(sub.name) === slug) {
                                setViewType('listing'); // It's a subcategory match
                                return;
                            }
                        }
                    }
                }

                // 3. Try to fetch as a Store (Service Center)
                const storeResponse = await fetch(`https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/service_center_services/${slug}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (storeResponse.ok) {
                    const storeDataResult = await storeResponse.json();
                    if (storeDataResult.success) {
                        setViewType('store');
                        return;
                    }
                }

                // 4. Final Fallback: Assume it's a Service Detail slug
                // Let ServiceDetailsPage try to handle it.
                setViewType('detail');

            } catch (error) {
                console.error("Error checking slug type:", error);
                setViewType('listing');
            }
        };

        if (slug) {
            checkSlugType();
        }
    }, [slug, queryServiceId]);

    if (viewType === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="w-8 h-8 text-[#037166] animate-spin" />
            </div>
        );
    }

    if (viewType === 'category') {
        return <CategoryPage slug={slug} initialData={categoryData} onBack={onBack} />;
    }

    if (viewType === 'detail') {
        return <ServiceDetailsPage serviceSlug={slug} serviceId={serviceId} onBack={onBack} />;
    }

    if (viewType === 'listing') {
        return <ServicesListingPage slug={slug} onBack={onBack} />;
    }

    if (viewType === 'store') {
        return <StoreDetailPage storeId={slug} onBack={onBack} />;
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]" />
    );
}
