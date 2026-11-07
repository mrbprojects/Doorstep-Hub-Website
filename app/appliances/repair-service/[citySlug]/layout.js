import { getSEOMetadata, slugToTitle, getCityAsset } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const citySlug = resolvedParams?.citySlug || '';
    const cityAsset = getCityAsset(citySlug);
    const cityName = cityAsset?.name || slugToTitle(citySlug);

    return await getSEOMetadata(`/appliances-repair-service-center-${citySlug}`, {
        title: `Appliance Repair Service Center in ${cityName} | Doorstep Hub`,
        description: `Book trusted home appliance repair and service in ${cityName} at Doorstep Hub. Expert technicians for Refrigerator, Washing Machine, AC, TV, Microwave, Geyser and more with doorstep warranty.`,
        image: cityAsset?.image,
    });
}

export default function ApplianceRepairCityLayout({ children }) {
    return children;
}
