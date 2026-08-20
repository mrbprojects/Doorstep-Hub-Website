import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('/careers');
}

export default function CareersLayout({ children }) {
    return children;
}
