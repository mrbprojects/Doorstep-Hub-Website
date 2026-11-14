import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const slug = resolvedParams?.slug || '';
    const planName = slugToTitle(slug) || 'Appliance AMC Plan';

    return getSEOMetadata(`/amc/${slug}`, {
        title: `${planName} Maintenance Contract | Doorstep Hub AMC`,
        description: `Get complete protection, free preventive maintenance, priority visits, and genuine spares with ${planName} from Doorstep Hub.`,
    });
}

export default function AmcPlanLayout({ children }) {
    return children;
}
