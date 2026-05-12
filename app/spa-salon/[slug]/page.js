'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SpaCategoryPage from '@/components/spasalon/SpaCategoryPage';
import SpaSubCategoryPage from '@/components/spasalon/SpaSubCategoryPage';
import SpaServiceDetailPage from '@/components/spasalon/SpaServiceDetailPage';

const SPA_SERVICE_ID = '69524f4a57bb211ca094e5e6';

export default function SpaSalonSlugPage() {
    const params = useParams();
    const slug = params.slug;
    const [mode, setMode] = useState('loading');
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        let active = true;

        const resolveSlug = async () => {
            try {
                const categoryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serviceId: SPA_SERVICE_ID })
                });
                const categoryData = await categoryResponse.json();

                if (!active) return;

                if (categoryData.success && Array.isArray(categoryData.category)) {
                    const matchedCategory = categoryData.category.find(category => category.slug === slug || category._id === slug);
                    if (matchedCategory) {
                        setInitialData(matchedCategory);
                        setMode('category');
                        return;
                    }

                    for (const category of categoryData.category) {
                        const subcategoryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ categorySlug: category.slug, serviceSlug: 'spa-salon' })
                        });
                        const subcategoryData = await subcategoryResponse.json();

                        if (!active) return;

                        if (subcategoryData.success && Array.isArray(subcategoryData.data)) {
                            const matchedSubcategory = subcategoryData.data.find(subcategory =>
                                subcategory.slug === slug || subcategory._id === slug || subcategory.id === slug
                            );

                            if (matchedSubcategory) {
                                setInitialData({
                                    ...matchedSubcategory,
                                    categoryName: category.name,
                                    categoryId: category._id
                                });
                                setMode('subcategory');
                                return;
                            }
                        }
                    }
                }

                setMode('service');
            } catch (error) {
                console.error('Failed to resolve spa slug', error);
                if (active) setMode('service');
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

    if (mode === 'category') {
        return <SpaCategoryPage slugOverride={slug} initialData={initialData} />;
    }

    if (mode === 'subcategory') {
        return <SpaSubCategoryPage slugOverride={slug} initialData={initialData} />;
    }

    return <SpaServiceDetailPage slugOverride={slug} />;
}
