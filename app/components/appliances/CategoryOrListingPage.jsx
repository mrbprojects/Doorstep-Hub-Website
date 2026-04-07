'use client';

import React, { useState, useEffect } from 'react';
import { CategoryPage } from '@/components/appliances/CategoryPage';
import { ServicesListingPage } from '@/components/appliances/ServicesListingPage';
import { ServiceDetailsPage } from '@/components/appliances/ServiceDetailsPage';
import { StoreDetailPage } from '@/components/appliances/StoreDetailPage';
import { Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Animated404 } from '@/components/ui/Animated404';
import SpaCategoryPage from '@/components/spasalon/SpaCategoryPage';
import SpaSubCategoryPage from '@/components/spasalon/SpaSubCategoryPage';

export function CategoryOrListingPage({ slug, onBack }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryServiceId = searchParams.get('id');
    const [viewType, setViewType] = useState('loading'); // 'loading', 'category', 'listing', 'detail', '404', 'store', 'spa-category', 'spa-subcategory'
    const [categoryData, setCategoryData] = useState(null);
    const [serviceId, setServiceId] = useState(queryServiceId);

    // Removed immediate redirect effect, returning Animated404 instead

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
                const catResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
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

                // 2. Try to fetch as a Spa Category
                const spaCatRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serviceId: '69524f4a57bb211ca094e5e6' }) // Spa & Salon
                });
                const spaCatData = await spaCatRes.json();
                if (spaCatData.success && Array.isArray(spaCatData.category)) {
                    const matchedCat = spaCatData.category.find(c => c.slug === slug);
                    if (matchedCat) {
                        setCategoryData(matchedCat);
                        setViewType('spa-category');
                        return;
                    }

                    // Check Spa Subcategories - Need to fetch subcategories for each category to accurately find it
                    // Optimization: We could have a search API, but for now we search across categories
                    for (const cat of spaCatData.category) {
                        const subRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ categorySlug: cat.slug })
                        });
                        const subData = await subRes.json();
                        if (subData.success && Array.isArray(subData.data)) {
                            const matchedSub = subData.data.find(s => s.slug === slug || s._id === slug || s.id === slug);
                            if (matchedSub) {
                                setCategoryData({ ...matchedSub, categoryName: cat.name, categoryId: cat._id });
                                setViewType('spa-subcategory');
                                return;
                            }
                        }
                    }
                }

                // 2. Try to fetch as a deep Category or Subcategory
                const allRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/all-services`);
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
                const storeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/service_center_services/${slug}`, {
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

    if (viewType === '404') {
        return <Animated404 />;
    }

    if (viewType === 'store') {
        return <StoreDetailPage storeId={slug} onBack={onBack} />;
    }

    if (viewType === 'spa-category') {
        return <SpaCategoryPage slugOverride={slug} initialData={categoryData} />;
    }

    if (viewType === 'spa-subcategory') {
        return <SpaSubCategoryPage slugOverride={slug} initialData={categoryData} />;
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]" />
    );
}

