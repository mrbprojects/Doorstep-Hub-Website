import FeaturedServicesPageClient from '../page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const slug = Array.isArray(resolvedParams?.slug) ? resolvedParams.slug.join('/') : (resolvedParams?.slug || 'all');
    return await getSEOMetadata(`/service-list/featured-services/${slug}`);
}

export default function FeaturedServicesCatchAllPage() {
    return <FeaturedServicesPageClient />;
}
