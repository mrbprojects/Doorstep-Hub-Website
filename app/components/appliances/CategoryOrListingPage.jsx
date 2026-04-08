'use client';

import React, { useState, useEffect } from 'react';
import { CategoryPage } from '@/components/appliances/CategoryPage';
import { ServicesListingPage } from '@/components/appliances/ServicesListingPage';
import { ServiceDetailsPage } from '@/components/appliances/ServiceDetailsPage';
import { StoreDetailPage } from '@/components/appliances/StoreDetailPage';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Animated404 } from '@/components/ui/Animated404';
import SpaCategoryPage from '@/components/spasalon/SpaCategoryPage';
import SpaSubCategoryPage from '@/components/spasalon/SpaSubCategoryPage';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const appliancesTheme = {
    bgScrolled: 'bg-[#0a0a0a]/80',
    bgMobile: 'bg-[#0a0a0a]/95',
    textMain: 'text-white/90',
    textHover: 'text-[#037166]',
    border: 'border-[#037166]/20',
    accent: 'bg-[#037166]',
    accentGradientFrom: 'from-[#037166]',
    accentGradientTo: 'to-[#025951]',
    buttonBg: 'bg-[#1a1a1a]',
    isLight: false
};

const footerTheme = {
    bg: 'from-[#0a0a0a] to-black',
    borderTop: 'border-[#037166]/20',
    accentGlow: '#037166',
    accentColor: '#037166',
    accentHover: '#04a99d',
    accentGradientFrom: 'from-[#037166]',
    accentGradientTo: 'to-[#04a99d]',
    headingGradient: 'from-[#037166] via-white to-[#037166]',
    textMain: 'text-white',
    textMuted: 'text-white/60',
    textSubtle: 'text-white/40',
    textLink: 'text-white/70',
    textLinkHover: 'hover:text-[#04a99d]',
    groupNameColor: 'text-white',
    dividerColor: 'text-white/20',
    socialBg: 'bg-white/5',
    socialBorder: 'border-white/10',
    tooltipBg: 'bg-[#1a1a1a] border-[#037166]/50',
    tooltipText: 'text-white',
    iconBg: 'bg-white/5',
    iconHoverBg: 'group-hover:bg-[#037166]/20',
    isLight: false,
};

function AppliancePageShell({ children }) {
    return (
        <div className="min-h-screen">
            <Header theme={appliancesTheme} />
            {children}
            <Footer theme={footerTheme} />
        </div>
    );
}

export function CategoryOrListingPage({ slug, categorySlug, onBack }) {
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
                // 1. If this is a two-part appliance URL, resolve the child
                // slug through its parent category and show the listing page.
                if (categorySlug) {
                    const subCatResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ slug: categorySlug })
                    });

                    const subCatData = await subCatResponse.json();
                    if (subCatData.success && Array.isArray(subCatData.data)) {
                        const generateSlug = (name) => name?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';
                        const matchedSubCat = subCatData.data.find(sub =>
                            sub.slug === slug || sub._id === slug || generateSlug(sub.name) === slug
                        );

                        if (matchedSubCat) {
                            setCategoryData({
                                categoryName: subCatData.categoryName || categorySlug,
                                subCategoryName: matchedSubCat.name,
                                subCategoryId: matchedSubCat._id
                            });
                            setViewType('listing');
                            return;
                        }
                    }
                }

                // 2. Try to fetch as a Category first
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

                // 3. Resolve root-level appliance service center slugs.
                // Example: /anvika-computer-repair-services should show StoreDetailPage.
                const centersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/get_service_center`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lattitude: '17.3850',
                        longitude: '78.4867',
                        page: 1,
                        limit: 100
                    })
                });
                const centersData = await centersResponse.json();
                if (centersData.success && Array.isArray(centersData.nearByServiceCenters)) {
                    const matchedCenter = centersData.nearByServiceCenters.find(center =>
                        center.slug === slug || center._id === slug
                    );
                    if (matchedCenter) {
                        setViewType('store');
                        return;
                    }
                }

                // 4. Try to resolve a root-level appliance subcategory slug.
                // Example: /microwave-oven-repair should show the appliance listing page.
                const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getallcategorys`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lattitude: '17.3850',
                        longitude: '78.4867'
                    })
                });
                const categoriesData = await categoriesResponse.json();

                if (categoriesData.success && Array.isArray(categoriesData.data)) {
                    const generateSlug = (name) => name?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';

                    for (const applianceCategory of categoriesData.data) {
                        const subcategoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ slug: applianceCategory.slug })
                        });
                        const subcategoriesData = await subcategoriesResponse.json();

                        if (subcategoriesData.success && Array.isArray(subcategoriesData.data)) {
                            const matchedSubcategory = subcategoriesData.data.find(subcategory =>
                                subcategory.slug === slug ||
                                subcategory._id === slug ||
                                generateSlug(subcategory.name) === slug
                            );

                            if (matchedSubcategory) {
                                setCategoryData({
                                    categoryName: applianceCategory.name,
                                    categorySlug: applianceCategory.slug,
                                    subCategoryName: matchedSubcategory.name,
                                    subCategoryId: matchedSubcategory._id
                                });
                                setViewType('listing');
                                return;
                            }
                        }
                    }
                }

                // 5. Try to fetch as a Spa Category
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

                // 6. Try to fetch as a deep Category or Subcategory
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

                // 7. Try to fetch as a Store (Service Center)
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

                // 8. Final Fallback: Assume it's a Service Detail slug
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
    }, [slug, categorySlug, queryServiceId]);

    if (viewType === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="w-8 h-8 text-[#037166] animate-spin" />
            </div>
        );
    }

    if (viewType === 'category') {
        return (
            <AppliancePageShell>
                <CategoryPage slug={slug} initialData={categoryData} onBack={onBack} />
            </AppliancePageShell>
        );
    }

    if (viewType === 'detail') {
        return (
            <AppliancePageShell>
                <ServiceDetailsPage serviceSlug={slug} serviceId={serviceId} onBack={onBack} />
            </AppliancePageShell>
        );
    }

    if (viewType === 'listing') {
        return (
            <AppliancePageShell>
                <ServicesListingPage
                    slug={slug}
                    category={categoryData?.categorySlug || categorySlug}
                    subCategory={categoryData?.subCategoryName}
                    subCategoryId={categoryData?.subCategoryId}
                    onBack={onBack}
                />
            </AppliancePageShell>
        );
    }

    if (viewType === '404') {
        return (
            <AppliancePageShell>
                <Animated404 />
            </AppliancePageShell>
        );
    }

    if (viewType === 'store') {
        return (
            <AppliancePageShell>
                <StoreDetailPage storeId={slug} onBack={onBack} />
            </AppliancePageShell>
        );
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

