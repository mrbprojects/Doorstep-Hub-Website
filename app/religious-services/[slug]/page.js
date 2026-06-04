import ReligiousRootSlugPageClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const slug = params.slug || '';
    const path = `/religious-services/${slug}`;
    return await getSEOMetadata(path);
}

export default async function ReligiousRootSlugPage() {
    return <ReligiousRootSlugPageClient />;
}
