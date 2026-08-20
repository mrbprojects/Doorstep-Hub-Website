import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('/refund-policy', {
        title: 'Refund & Cancellation Policy | Doorstep Hub',
        description: 'Read the official cancellation, replacement, and refund policies for services booked through Doorstep Hub.'
    });
}

export default function RefundPolicyLayout({ children }) {
    return children;
}
