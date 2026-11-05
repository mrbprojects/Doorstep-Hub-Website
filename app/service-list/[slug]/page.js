import ServiceCenterDetailPageClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug || '';
    const path = `/service-list/${slug}`;
    return await getSEOMetadata(path);
}

export default async function ServiceCenterDetailPage({ params }) {
    const resolvedParams = await params;
    return <ServiceCenterDetailPageClient params={resolvedParams} />;
}
