import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const name = slugToTitle(slug) || 'Hostel Accommodation';

    return getSEOMetadata(`/pghostels/hostel-detail/${slug}`, {
        title: `${name} | Verified PG & Hostel - Doorstep Hub`,
        description: `View photos, amenities, room sharing options, rules, and monthly rent for ${name} on Doorstep Hub. Verified and safe stay.`,
    });
}

export default function PGHostelDetailLayout({ children }) {
    return children;
}
