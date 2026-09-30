import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('/help-center', {
        title: 'Doorstep Hub Help Center | FAQs, Support & Service Guides',
        description: 'Find answers to common questions about Doorstep Hub appliance repairs, home services, AMC contracts, bookings, technician tracking, and service partner onboarding.',
    });
}

export default function HelpCenterLayout({ children }) {
    return children;
}
