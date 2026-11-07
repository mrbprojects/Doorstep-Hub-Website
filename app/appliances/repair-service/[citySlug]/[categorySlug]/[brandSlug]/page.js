import ServicePageClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const { citySlug, categorySlug, brandSlug } = resolvedParams || {};
    const path = `/appliances/repair-service/${citySlug}/${categorySlug}/${brandSlug}`;
    return await getSEOMetadata(path);
}

export default async function ServicePage() {
    return <ServicePageClient />;
}
