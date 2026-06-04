import RootCatchAllPageClient from './page-client';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const slugParts = params.slug || [];
    const path = `/${slugParts.join('/')}`;
    return await getSEOMetadata(path);
}

export default async function RootCatchAllPage() {
    return <RootCatchAllPageClient />;
}
