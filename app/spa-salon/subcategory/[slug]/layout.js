import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const name = slugToTitle(slug) || 'Spa Treatment';

    return getSEOMetadata(`/spa-salon/subcategory/${slug}`, {
        title: `${name} Services at Home | Doorstep Hub`,
        description: `Experience professional ${name} at the comfort of your home. Hygienic kits, trained therapists, transparent prices on Doorstep Hub.`,
    });
}

export default function SpaSubcategoryLayout({ children }) {
    return children;
}
