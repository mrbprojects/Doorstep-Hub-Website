import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slugArr = Array.isArray(resolvedParams?.slug) ? resolvedParams.slug : [resolvedParams?.slug || ''];
    const pathSlug = slugArr.join('/');
    const title = slugArr.map(s => slugToTitle(s)).filter(Boolean).join(' - ') || 'Appliance Repair Service';

    return getSEOMetadata(`/appliances/${pathSlug}`, {
        title: `${title} | Doorstep Hub`,
        description: `Book expert doorstep repair and maintenance for ${title}. Verified technicians, genuine spare parts, and fast service across India.`,
    });
}

export default function ApplianceCatchAllLayout({ children }) {
    return children;
}
