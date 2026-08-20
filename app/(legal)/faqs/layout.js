import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('/faqs', {
        title: 'Frequently Asked Questions (FAQs) | Doorstep Hub',
        description: 'Find instant answers to common questions about Doorstep Hub bookings, technician guarantees, cancellations, and doorstep services.',
    });
}

export default function FaqsLayout({ children }) {
    return children;
}
