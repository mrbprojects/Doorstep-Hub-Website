import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const name = slugToTitle(slug) || 'Beauty & Salon';

    return getSEOMetadata(`/spa-salon/category/${slug}`, {
        title: `${name} at Home | Salon & Spa Services - Doorstep Hub`,
        description: `Book premium ${name} services at home. Certified beauticians, top-quality hygienic products, and doorstep service from Doorstep Hub.`,
    });
}

export default function SpaCategoryLayout({ children }) {
    return children;
}
