import ServicePageClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const { citySlug, categorySlug, brandSlug } = params;
    const path = `/appliances/repair-service/${citySlug}/${categorySlug}/${brandSlug}`;
    return await getSEOMetadata(path);
}

export default async function ServicePage() {
    return <ServicePageClient />;
}
