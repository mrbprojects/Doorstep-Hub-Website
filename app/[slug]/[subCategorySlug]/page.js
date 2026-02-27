
import { ServicesListingPage } from '@/components/appliances/ServicesListingPage';

export default function SubCategoryPage({ params }) {
    // URL structure: /[slug]/[subCategorySlug]
    // params.slug is the category slug
    // params.subCategorySlug is the subcategory slug

    return (
        <ServicesListingPage
            slug={params.subCategorySlug}
            category={params.slug}
        />
    );
}
