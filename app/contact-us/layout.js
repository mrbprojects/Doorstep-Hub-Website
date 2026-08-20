import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('/contact-us', {
        title: 'Contact DoorstepHub | 24/7 Help & Customer Support',
        description: 'Have questions? Contact DoorstepHub for any service-related queries, feedback, or support. We are available 24/7.',
    });
}

export default function ContactUsLayout({ children }) {
    return children;
}
