import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const name = slugToTitle(slug) || 'Puja & Rituals';

    return getSEOMetadata(`/religious-services/category/${slug}`, {
        title: `${name} Services | Book Pandits & Purohits - Doorstep Hub`,
        description: `Book experienced pandits for ${name} at your home. Complete samagri, authentic Vedic rituals, and transparent pricing on Doorstep Hub.`,
    });
}

export default function ReligiousCategoryLayout({ children }) {
    return children;
}
