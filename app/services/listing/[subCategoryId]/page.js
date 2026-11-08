import { ServicesListingPage } from '@/components/services/ServicesListingPage';

export default function ListingRoute({ params, searchParams }) {
    return (
        <ServicesListingPage
            subCategoryId={params.subCategoryId}
            category={searchParams.category || ''}
            subCategory={searchParams.name || ''}
        />
    );
}
