import { getSEOMetadata, slugToTitle, getCityAsset, getApplianceCategoryAsset, getBrandAsset } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const citySlug = resolvedParams?.citySlug || '';

    const cityAsset = getCityAsset(citySlug);
    const cityName = cityAsset?.name || slugToTitle(citySlug);
    const brandAsset = getBrandAsset(slug);
    const catAsset = getApplianceCategoryAsset(slug);

    const rawServiceName = slugToTitle(
        slug.replace(/-(?:book-doorstep-service-today|repair-service-today|repair-services?|service-today).*$/i, '')
    );
    const serviceName = rawServiceName || slugToTitle(slug);

    const title = `Book ${serviceName} in ${cityName} | Doorstep Hub`;
    const description = `Book certified ${serviceName} in ${cityName} at Doorstep Hub. Same-day doorstep service, genuine spare parts, transparent pricing, and doorstep warranty.`;

    const image = catAsset?.image || brandAsset?.image || cityAsset?.image;

    return await getSEOMetadata(`/nearby/${slug}/${citySlug}`, {
        title,
        description,
        image
    });
}

export default function NearbyServiceCityLayout({ children }) {
    return children;
}
