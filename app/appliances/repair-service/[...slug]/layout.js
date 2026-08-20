import { getSEOMetadata, slugToTitle, getCityAsset, getApplianceCategoryAsset, getBrandAsset } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const slugParts = params?.slug || [];
    const citySlug = slugParts[0] || '';
    const categorySlug = slugParts[1] || '';
    const brandSlug = slugParts[2] || '';
    const serviceSlug = slugParts[3] || '';

    const cityAsset = getCityAsset(citySlug);
    const cityName = cityAsset?.name || slugToTitle(citySlug);
    const catAsset = getApplianceCategoryAsset(categorySlug || serviceSlug);
    const catName = catAsset?.categoryName || slugToTitle(categorySlug);
    const brandAsset = getBrandAsset(brandSlug);
    const brandName = brandAsset?.name || slugToTitle(brandSlug);

    let title = '';
    let description = '';
    let image = catAsset?.image || brandAsset?.image || cityAsset?.image;

    if (serviceSlug) {
        const sName = slugToTitle(serviceSlug);
        title = `Book ${sName} in ${cityName} | Doorstep Hub`;
        description = `Book professional ${sName} in ${cityName} at Doorstep Hub. Verified technicians, genuine spare parts, and doorstep warranty.`;
    } else if (brandSlug) {
        title = `${brandName} ${catName} Service Center in ${cityName} | Doorstep Hub`;
        description = `Authorized ${brandName} ${catName} repair and service in ${cityName}. Certified technicians, genuine parts, and doorstep service.`;
    } else if (categorySlug) {
        title = `Professional ${catName} & Service Center in ${cityName} | Doorstep Hub`;
        description = `Get professional doorstep ${catName} in ${cityName} by expert technicians. Genuine spare parts, warranty on repairs, and same-day service.`;
        image = catAsset?.image || cityAsset?.image;
    } else {
        title = `Appliance Repair Service Center in ${cityName} | Doorstep Hub`;
        description = `Book trusted home appliance repair and service in ${cityName} at Doorstep Hub.`;
        image = cityAsset?.image;
    }

    const publicPath = categorySlug
        ? `/${categorySlug.replace(/-services$/, '')}-service-center-${citySlug}`
        : `/appliances-repair-service-center-${citySlug}`;

    return await getSEOMetadata(publicPath, {
        title,
        description,
        image
    });
}

export default function ApplianceRepairCatchAllLayout({ children }) {
    return children;
}
