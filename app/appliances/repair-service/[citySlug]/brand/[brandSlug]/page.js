import ServicePageClient from '@/appliances/repair-service/[citySlug]/[categorySlug]/[brandSlug]/page-client';
import { getSEOMetadata } from '@/lib/seo';
import { buildFlatBrandCityPublicPath, buildFlatBrandPublicPath, isFlatBrandListingSlug, FLAT_BRAND_AUTO_CITY } from '@/lib/applianceRepairSlugs';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
    const { citySlug, brandSlug } = params;
    if (!isFlatBrandListingSlug(brandSlug)) {
        return { title: 'Doorstep Hub' };
    }
    const publicPath = citySlug === FLAT_BRAND_AUTO_CITY
        ? buildFlatBrandPublicPath(brandSlug)
        : buildFlatBrandCityPublicPath(citySlug, brandSlug);
    return await getSEOMetadata(publicPath || `/appliances/repair-service/${citySlug}/brand/${brandSlug}`);
}

export default async function FlatBrandServicePage({ params }) {
    const { brandSlug } = params;
    if (!isFlatBrandListingSlug(brandSlug)) {
        notFound();
    }
    return <ServicePageClient />;
}
