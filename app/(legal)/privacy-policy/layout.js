import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('/privacy-policy', {
        title: 'Privacy Policy | Doorstep Hub',
        description: 'Read the privacy policy of Doorstep Hub. Understand how we collect, protect, and use your personal information.'
    });
}

export default function PrivacyPolicyLayout({ children }) {
    return children;
}
