import { ServiceDetailsPage } from '@/components/services/ServiceDetailsPage';

export default function ServiceDetailRoute({ params, searchParams }) {
    return (
        <ServiceDetailsPage
            serviceId={params.serviceId}
            category={searchParams.category || ''}
            subCategory={searchParams.subCategory || ''}
            subCategoryId={searchParams.subCategoryId || ''}
        />
    );
}
