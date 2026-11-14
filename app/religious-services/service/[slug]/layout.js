import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const name = slugToTitle(slug) || 'Puja Service';

    return getSEOMetadata(`/religious-services/service/${slug}`, {
        title: `${name} Booking | Vedic Pandits & Samagri - Doorstep Hub`,
        description: `Book ${name} online. Verified purohits, authentic rituals, samagri packages, and doorstep service on Doorstep Hub.`,
    });
}

export default function ReligiousServiceLayout({ children }) {
    return children;
}
