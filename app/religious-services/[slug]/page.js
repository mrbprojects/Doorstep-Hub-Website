import ReligiousRootSlugPageClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const path = `/religious-services/${slug}`;
    return await getSEOMetadata(path);
}

export default async function ReligiousRootSlugPage() {
    return <ReligiousRootSlugPageClient />;
}
