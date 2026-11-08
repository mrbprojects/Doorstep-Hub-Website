import FeaturedServicesPageClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('/service-list/featured-services/all');
}

export default function FeaturedServicesPage() {
    return <FeaturedServicesPageClient />;
}
