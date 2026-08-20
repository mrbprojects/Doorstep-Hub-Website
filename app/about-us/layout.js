import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('/about-us');
}

export default function AboutUsLayout({ children }) {
    return children;
}
