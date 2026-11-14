import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const name = slugToTitle(slug) || 'PG Hostels';

    return getSEOMetadata(`/pghostels/subcategory/${slug}`, {
        title: `${name} | Affordable & Premium PG Hostels - Doorstep Hub`,
        description: `Find top-rated ${name} with food, WiFi, power backup, and security. Zero brokerage options and easy monthly booking on Doorstep Hub.`,
    });
}

export default function PGSubcategoryLayout({ children }) {
    return children;
}
