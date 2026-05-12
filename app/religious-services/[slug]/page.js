'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CategorySlugPage from '../category/[slug]/page';
import ReligiousServiceDetailPage from '../service/[slug]/page';
import SubCategoryServicesPage from '../subcategory/[slug]/page';
import { fetchLandingJson } from '@/lib/landingApiCache';

/**
 * Root slug router for Religious Services.
 * - First, try category by slug.
 * - If not a category, try provider by slug.
 */
export default function ReligiousRootSlugPage() {
  const params = useParams();
  const slug = params.slug;
  const [mode, setMode] = useState('loading'); // 'loading' | 'service' | 'category' | 'subcategory'

  useEffect(() => {
    let active = true;
    const detect = async () => {
      try {
        // 1) Check if slug matches a category (fetch full list and match locally to avoid provider call on category slugs)
        const catData = await fetchLandingJson(
          'slug-resolve:religious:categories',
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/categories`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId: '695250aa57bb211ca094e5fd',
              serviceSlug: 'rituals-and-religious-services'
            })
          }
        );
        if (active && catData?.success && Array.isArray(catData.category)) {
          const isCategory = catData.category.some(
            (c) =>
              (c.slug && c.slug.toLowerCase() === slug.toLowerCase()) ||
              c._id === slug
          );
          if (isCategory) {
            setMode('category');
            return;
          }

          for (const category of catData.category) {
            const subData = await fetchLandingJson(
              `slug-resolve:religious:subcategories:${category.slug}`,
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  categorySlug: category.slug,
                  serviceSlug: 'rituals-and-religious-services'
                })
              }
            );
            if (!active) return;

            if (subData?.success && Array.isArray(subData.data)) {
              const isSubcategory = subData.data.some(
                (sub) =>
                  (sub.slug && sub.slug.toLowerCase() === slug.toLowerCase()) ||
                  sub._id === slug
              );

              if (isSubcategory) {
                setMode('subcategory');
                return;
              }
            }
          }
        }

        // 2) Fallback: check provider
        const provData = await fetchLandingJson(
          `slug-resolve:religious:provider:${slug}`,
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/single-professional-provider`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ providerSlug: slug })
          }
        );
        if (!active) return;
        const hasProvider = provData?.success && Array.isArray(provData.storeData) && provData.storeData.length > 0;
        setMode(hasProvider ? 'service' : 'category');
      } catch {
        if (active) setMode('category');
      }
    };
    detect();
    return () => { active = false; };
  }, [slug]);

  if (mode === 'loading') return <div className="min-h-screen bg-white" />;

  if (mode === 'service') {
    return <ReligiousServiceDetailPage slugOverride={slug} />;
  }

  if (mode === 'subcategory') {
    return <SubCategoryServicesPage />;
  }

  return <CategorySlugPage params={{ slug }} />;
}
