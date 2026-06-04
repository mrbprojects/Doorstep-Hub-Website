import SeoBrandRoutePageClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const { citySlug, categorySlug, brandSlug } = params;
    const path = `/${citySlug}/${categorySlug}/${brandSlug}`;
    return await getSEOMetadata(path);
}

export default async function SeoBrandRoutePage() {
    return <SeoBrandRoutePageClient />;
}
