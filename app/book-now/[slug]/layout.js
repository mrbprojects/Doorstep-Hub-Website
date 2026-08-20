import { getSEOMetadata, slugToTitle } from '@/lib/seo';

export async function generateMetadata({ params }) {
    const slug = params?.slug || '';
    const titleName = slugToTitle(slug);
    return await getSEOMetadata(`/book-now/${slug}`, {
        title: `Book ${titleName} | Doorstep Hub`,
        description: `Book trusted, certified ${titleName} at Doorstep Hub. Certified technicians, genuine spare parts, transparent pricing and doorstep warranty.`,
    });
}

export default function BookNowLayout({ children }) {
    return children;
}
