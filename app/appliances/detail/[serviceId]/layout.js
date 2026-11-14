import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const resolvedParams = (params && typeof params.then === 'function') ? await params : params;
    const serviceId = resolvedParams?.serviceId || '';

    return getSEOMetadata(`/appliances/detail/${serviceId}`, {
        title: 'Appliance Service Details | Doorstep Hub',
        description: 'View service pricing, technician details, and warranty terms for home appliance repair on Doorstep Hub.',
    });
}

export default function ApplianceDetailLayout({ children }) {
    return children;
}
