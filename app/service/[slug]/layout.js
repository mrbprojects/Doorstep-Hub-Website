import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const name = slugToTitle(slug) || 'Service';

    return getSEOMetadata(`/service/${slug}`, {
        title: `${name} | Doorstep Hub Verified Services`,
        description: `Book verified, top-rated ${name} on Doorstep Hub. Transparent pricing, trusted professionals, and doorstep warranty.`,
    });
}

export default function ServiceSlugLayout({ children }) {
    return children;
}
