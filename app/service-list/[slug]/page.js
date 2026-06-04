import ServiceCenterDetailPageClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const slug = params.slug || '';
    const path = `/service-list/${slug}`;
    return await getSEOMetadata(path);
}

export default async function ServiceCenterDetailPage({ params }) {
    return <ServiceCenterDetailPageClient params={params} />;
}
