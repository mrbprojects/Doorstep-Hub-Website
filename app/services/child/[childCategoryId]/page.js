import { PartnersListingPage } from '@/components/services/PartnersListingPage';
import { CentersListingPage } from '@/components/services/CentersListingPage';

export default function ChildCategoryListingRoute({ params, searchParams }) {
    const { childCategoryId } = params;
    const category = searchParams.category || 'Services';
    const subCategory = searchParams.name || '';

    // Specialized rendering based on Child Category ID
    if (childCategoryId === '683dbbfbb62d2a241de0f7e3') {
        return (
            <PartnersListingPage
                childCategoryId={childCategoryId}
                category={category}
                subCategory={subCategory}
            />
        );
    }

    if (childCategoryId === '683dbc04b62d2a241de0f7e8') {
        return (
            <CentersListingPage
                childCategoryId={childCategoryId}
                category={category}
                subCategory={subCategory}
            />
        );
    }

    // Default fallback (though these are the primary ones)
    return (
        <PartnersListingPage
            childCategoryId={childCategoryId}
            category={category}
            subCategory={subCategory}
        />
    );
}
