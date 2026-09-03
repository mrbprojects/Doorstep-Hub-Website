import dynamic from 'next/dynamic';

const ServiceDetailsPage = dynamic(() => import('@/components/services/ServiceDetailsPage').then(m => m.ServiceDetailsPage), { ssr: false });

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
