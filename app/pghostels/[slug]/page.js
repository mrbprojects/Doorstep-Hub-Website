import PGHostelSlugPageClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const slug = params.slug || '';
    const path = `/pghostels/${slug}`;
    return await getSEOMetadata(path);
}

export default async function PGHostelSlugPage({ params }) {
    return <PGHostelSlugPageClient params={params} />;
}
