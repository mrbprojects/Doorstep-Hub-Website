'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { resolveParam } from '@/utils/slugHelper';

const NewHostelDetailPage = dynamic(() => import('@/components/pghostels/NewHostelDetailPage'), { ssr: false });
const PGSubcategoryPage = dynamic(() => import('../subcategory/[slug]/page'), { ssr: false });
const PGListingsPageContent = dynamic(
    () => import('@/components/pghostels/PGListingsPageContent').then(m => m.PGListingsPageContent),
    { ssr: false }
);

const PG_SERVICE_ID = '69524fb157bb211ca094e5ee';

function PGSubcategoryListingsPage({ subcategory }) {
    return (
        <PGListingsPageContent subcategoryOverride={subcategory} />
    );
}

export default function PGHostelSlugPageClient({ params: propParams }) {
    const routeParams = useParams();
    const slug = propParams?.slug || routeParams.slug;
    const [mode, setMode] = useState('loading');
    const [resolvedSubcategory, setResolvedSubcategory] = useState(null);

    useEffect(() => {
        let active = true;

        const resolveSlug = async () => {
            try {
                const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serviceId: PG_SERVICE_ID }),
                });
                const categoriesData = await categoriesResponse.json();

                if (!active) return;

                const categories = categoriesData.category || categoriesData.categories || categoriesData.data || [];
                const matchedCategory = Array.isArray(categories)
                    ? categories.find((category) =>
                        category?._id === slug ||
                        (category?.slug && category.slug.toLowerCase() === slug.toLowerCase())
                    )
                    : null;

                if (matchedCategory) {
                    setMode('subcategory');
                    return;
                }

                if (Array.isArray(categories)) {
                    for (const category of categories) {
                        const subcategoryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ categorySlug: category.slug, serviceId: PG_SERVICE_ID }),
                        });
                        const subcategoryData = await subcategoryResponse.json();
                        if (!active) return;

                        if (subcategoryData.success && Array.isArray(subcategoryData.data)) {
                            const matchedSubcategory = subcategoryData.data.find((subcategory) =>
                                subcategory?._id === slug ||
                                (subcategory?.slug && subcategory.slug.toLowerCase() === slug.toLowerCase())
                            );

                            if (matchedSubcategory) {
                                setResolvedSubcategory(matchedSubcategory);
                                setMode('subcategoryListing');
                                return;
                            }
                        }
                    }
                }

                const payload = {
                    ...resolveParam(slug, 'categoryId', 'categorySlug'),
                    serviceId: PG_SERVICE_ID,
                };
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await response.json();

                if (!active) return;

                if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                    setMode('subcategory');
                    return;
                }

                setMode('detail');
            } catch (error) {
                console.error('Failed to resolve PG slug', error);
                if (active) setMode('detail');
            }
        };

        if (slug) resolveSlug();

        return () => {
            active = false;
        };
    }, [slug]);

    if (mode === 'loading') {
        return <div className="min-h-screen bg-white" />;
    }

    if (mode === 'subcategory') {
        return <PGSubcategoryPage />;
    }

    if (mode === 'subcategoryListing' && resolvedSubcategory) {
        return <PGSubcategoryListingsPage subcategory={resolvedSubcategory} />;
    }

    return <NewHostelDetailPage slugOverride={slug} />;
}
