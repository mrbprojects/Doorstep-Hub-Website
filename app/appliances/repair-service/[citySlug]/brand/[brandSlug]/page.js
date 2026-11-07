import ServicePageClient from '@/appliances/repair-service/[citySlug]/[categorySlug]/[brandSlug]/page-client';
import { getSEOMetadata } from '@/lib/seo';
import { buildFlatBrandCityPublicPath, buildFlatBrandPublicPath, isFlatBrandListingSlug, FLAT_BRAND_AUTO_CITY } from '@/lib/applianceRepairSlugs';
import { fetchSlugRegistry } from '@/lib/slugRegistry';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const { citySlug, brandSlug } = resolvedParams || {};
    const registry = await fetchSlugRegistry();
    if (!isFlatBrandListingSlug(brandSlug, registry)) {
        return { title: 'Doorstep Hub' };
    }
    const publicPath = citySlug === FLAT_BRAND_AUTO_CITY
        ? buildFlatBrandPublicPath(brandSlug, { trusted: true })
        : buildFlatBrandCityPublicPath(citySlug, brandSlug, { trusted: true });
    return await getSEOMetadata(publicPath || `/appliances/repair-service/${citySlug}/brand/${brandSlug}`);
}

export default async function FlatBrandServicePage({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const { brandSlug } = resolvedParams || {};
    const registry = await fetchSlugRegistry();
    if (!isFlatBrandListingSlug(brandSlug, registry)) {
        notFound();
    }
    return <ServicePageClient />;
}
