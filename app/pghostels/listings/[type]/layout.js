import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const type = resolvedParams?.type || '';
    const formattedType = slugToTitle(type) || 'PG & Hostels';

    return getSEOMetadata(`/pghostels/listings/${type}`, {
        title: `Best ${formattedType} Near You | Verified PG & Hostels - Doorstep Hub`,
        description: `Explore verified, fully furnished ${formattedType} with high-speed WiFi, hygienic food, daily housekeeping, and 24/7 security on Doorstep Hub.`,
    });
}

export default function PGListingsLayout({ children }) {
    return children;
}
