import { CategoryOrListingPage } from '@/components/appliances/CategoryOrListingPage';

export default function RootSlugPage({ params }) {
    return (
        <CategoryOrListingPage
            slug={params.slug}
        />
    );
}
