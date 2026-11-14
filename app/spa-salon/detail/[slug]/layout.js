import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const name = slugToTitle(slug) || 'Service Detail';

    return getSEOMetadata(`/spa-salon/detail/${slug}`, {
        title: `${name} - Salon & Spa Service Details | Doorstep Hub`,
        description: `View pricing, session duration, and inclusions for ${name} at Doorstep Hub. Certified beauticians and doorstep service.`,
    });
}

export default function SpaDetailLayout({ children }) {
    return children;
}
