import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const name = slugToTitle(slug) || 'Service Details';

    return getSEOMetadata(`/detail/${slug}`, {
        title: `${name} | Doorstep Hub Service Details`,
        description: `View service details, verified pricing, customer ratings, and book ${name} on Doorstep Hub.`,
    });
}

export default function DetailSlugLayout({ children }) {
    return children;
}
