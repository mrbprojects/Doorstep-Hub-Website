'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const CategorySlugPage = dynamic(() => import('../category/[slug]/page'), { ssr: false });
const ReligiousServiceDetailPage = dynamic(() => import('../service/[slug]/page'), { ssr: false });
const SubCategoryServicesPage = dynamic(() => import('../subcategory/[slug]/page'), { ssr: false });

export default function ReligiousRootSlugPageClient() {
  const params = useParams();
  const slug = params.slug;
  const [mode, setMode] = useState('loading'); // 'loading' | 'service' | 'category' | 'subcategory'

  useEffect(() => {
    let active = true;
    const detect = async () => {
      try {
        // 1) Check if slug matches a category (fetch full list and match locally to avoid provider call on category slugs)
        const catResp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: '695250aa57bb211ca094e5fd',
            serviceSlug: 'rituals-and-religious-services'
          })
        });
        const catData = await catResp.json();
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
            const subResp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                categorySlug: category.slug,
                serviceSlug: 'rituals-and-religious-services'
              })
            });
            const subData = await subResp.json();
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
        const provResp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/single-professional-provider`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerSlug: slug })
        });
        const provData = await provResp.json();
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
