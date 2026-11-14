import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const name = slugToTitle(slug) || 'Beauty Treatment';

    return getSEOMetadata(`/spa-salon/service/${slug}`, {
        title: `${name} | Doorstep Salon & Spa Booking - Doorstep Hub`,
        description: `Book ${name} online. Experienced beauticians, branded cosmetic products, and relaxing salon experience at home.`,
    });
}

export default function SpaServiceLayout({ children }) {
    return children;
}
