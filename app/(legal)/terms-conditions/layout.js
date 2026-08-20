import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('/terms-conditions', {
        title: 'Terms & Conditions | Doorstep Hub',
        description: 'Read the terms and conditions for booking and using doorstep services on Doorstep Hub.'
    });
}

export default function TermsConditionsLayout({ children }) {
    return children;
}
