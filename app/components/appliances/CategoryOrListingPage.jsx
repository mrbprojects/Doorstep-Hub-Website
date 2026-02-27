'use client';

import React, { useState, useEffect } from 'react';
import { CategoryPage } from '@/components/appliances/CategoryPage';
import { ServicesListingPage } from '@/components/appliances/ServicesListingPage';
import { ServiceDetailsPage } from '@/components/appliances/ServiceDetailsPage';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export function CategoryOrListingPage({ slug }) {
    const searchParams = useSearchParams();
    const queryServiceId = searchParams.get('id');
    const [viewType, setViewType] = useState('loading'); // 'loading', 'category', 'listing', 'detail', '404'
    const [categoryData, setCategoryData] = useState(null);
    const [serviceId, setServiceId] = useState(queryServiceId);

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

                // 3. Final Fallback: Assume it's a Service Detail slug
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
    }, [slug]);

    if (viewType === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="w-8 h-8 text-[#037166] animate-spin" />
            </div>
        );
    }

    if (viewType === 'category') {
        return <CategoryPage slug={slug} initialData={categoryData} />;
    }

    if (viewType === 'detail') {
        return <ServiceDetailsPage serviceSlug={slug} serviceId={serviceId} />;
    }

    if (viewType === 'listing') {
        return <ServicesListingPage slug={slug} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
            <p>Page not found</p>
        </div>
    );
}
