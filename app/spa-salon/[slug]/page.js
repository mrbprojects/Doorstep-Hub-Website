import SpaSalonSlugPageClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const slug = params.slug || '';
    const path = `/spa-salon/${slug}`;
    return await getSEOMetadata(path);
}

export default async function SpaSalonSlugPage() {
    return <SpaSalonSlugPageClient />;
}
