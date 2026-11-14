import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const name = slugToTitle(slug) || 'Religious Ritual';

    return getSEOMetadata(`/religious-services/subcategory/${slug}`, {
        title: `${name} | Online Pandit Booking & Pooja Services - Doorstep Hub`,
        description: `Perform ${name} with certified Vedic pandits. Complete ritual guidance, auspicious muhurat, and doorstep puja service on Doorstep Hub.`,
    });
}

export default function ReligiousSubcategoryLayout({ children }) {
    return children;
}
