'use client';

import React, { useState, useEffect } from 'react';
import { CategoryPage } from '@/components/appliances/CategoryPage';
import { ServicesListingPage } from '@/components/appliances/ServicesListingPage';
import { ServiceDetailsPage } from '@/components/appliances/ServiceDetailsPage';
import { StoreDetailPage } from '@/components/appliances/StoreDetailPage';
import { Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Animated404 } from '@/components/ui/Animated404';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const appliancesTheme = {
    bgScrolled: 'bg-white/80',
    bgMobile: 'bg-white/95',
    textMain: 'text-gray-900',
    textHover: 'text-[#037166]',
    border: 'border-gray-100',
    accent: 'bg-[#037166]',
    accentGradientFrom: 'from-[#037166]',
    accentGradientTo: 'to-[#04a99d]',
    buttonBg: 'bg-gray-50',
    isLight: true
};

const footerTheme = {
    bg: 'bg-white',
    borderTop: 'border-gray-100',
    accentGlow: '#037166',
    accentColor: '#037166',
    accentHover: '#04a99d',
    accentGradientFrom: 'from-[#037166]',
    accentGradientTo: 'to-[#04a99d]',
    headingGradient: 'from-[#037166] via-gray-900 to-[#037166]',
    textMain: 'text-gray-900',
    textMuted: 'text-gray-500',
    textSubtle: 'text-gray-400',
    textLink: 'text-gray-600',
    textLinkHover: 'hover:text-[#037166]',
    groupNameColor: 'text-gray-900',
    dividerColor: 'text-gray-100',
    socialBg: 'bg-gray-50',
    socialBorder: 'border-gray-100',
    tooltipBg: 'bg-white border-[#037166]/20',
    tooltipText: 'text-gray-900',
    iconBg: 'bg-gray-50',
    iconHoverBg: 'group-hover:bg-[#037166]/10',
    isLight: true,
};

function AppliancePageShell({ children }) {
    return (
        <div className="appliance-global min-h-screen bg-white">
            <Header theme={appliancesTheme} />
            {children}
            <Footer theme={footerTheme} />
        </div>
    );
}

export function CategoryOrListingPage({ slug, categorySlug, onBack }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryServiceId = searchParams.get('id');
    const [viewType, setViewType] = useState('loading'); // 'loading', 'category', 'listing', 'detail', '404', 'store'
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
                if (catData.success && Array.isArray(catData.data) && catData.data.length > 0 && catData.data.length < 20) {
                    setCategoryData(catData);
                    setViewType('category');
                    return;
                }

                // 3. Resolve root-level appliance service center slugs.
                // If it matches a store, REDIRECT to /service-list/[slug]
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
                    const generateSlug = (name) => name?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';
                    const matchedCenter = centersData.nearByServiceCenters.find(center =>
                        center.slug === slug || 
                        center._id === slug ||
                        generateSlug(center.business_name || center.name) === slug
                    );
                    if (matchedCenter) {
                        router.replace(`/service-list/${slug}`);
                        return;
                    }
                }

                // 4. Try to resolve a root-level appliance subcategory slug.
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

                // 5. Try to fetch as a deep appliance Category or Subcategory
                const allRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/all-services`);
                const allData = await allRes.json();

                if (allData.success && Array.isArray(allData.data)) {
                    const generateSlug = (name) => name?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';

                    for (const cat of allData.data) {
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

                        const subcategories = cat.subcategories || [];
                        for (const sub of subcategories) {
                            if (sub.slug === slug || generateSlug(sub.name) === slug) {
                                setViewType('listing');
                                return;
                            }
                        }
                    }
                }

                // 6. Try to fetch as an appliance Store directly
                const storeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/service_center_services/${slug}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (storeResponse.ok) {
                    const storeDataResult = await storeResponse.json();
                    if (storeDataResult.success) {
                        router.replace(`/service-list/${slug}`);
                        return;
                    }
                }

                // 7. Final Fallback
                setViewType('detail');

            } catch (error) {
                console.error("Error checking slug type:", error);
                setViewType('listing');
            }
        };

        if (slug) {
            checkSlugType();
        }
    }, [slug, categorySlug, queryServiceId, router]);

    if (viewType === 'loading') {
        return (
            <div className="appliance-global min-h-screen flex items-center justify-center bg-white">
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

    return (
        <div className="appliance-global min-h-screen bg-white" />
    );
}
