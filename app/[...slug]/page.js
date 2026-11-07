import RootCatchAllPageClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slugParts = resolvedParams?.slug || [];
    const path = `/${Array.isArray(slugParts) ? slugParts.join('/') : slugParts}`;
    return await getSEOMetadata(path);
}

export default async function RootCatchAllPage() {
    return <RootCatchAllPageClient />;
}
