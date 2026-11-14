import { getSEOMetadata, slugToTitle, getApplianceCategoryAsset } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const catAsset = getApplianceCategoryAsset(slug);
    const serviceName = catAsset?.categoryName || slugToTitle(slug);

    return getSEOMetadata(`/appliances/listing/${slug}`, {
        title: `${serviceName} Services & Repair | Doorstep Hub`,
        description: `Explore certified ${serviceName} repair services with upfront pricing, genuine parts, and verified technician warranty at Doorstep Hub.`,
        image: catAsset?.image,
    });
}

export default function ApplianceListingLayout({ children }) {
    return children;
}
