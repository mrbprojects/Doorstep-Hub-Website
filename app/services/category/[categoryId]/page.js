import { CategoryPage } from '@/components/services/CategoryPage';

export default function CategoryRoute({ params, searchParams }) {
    return (
        <CategoryPage
            categoryId={params.categoryId}
            category={searchParams.name || ''}
        />
    );
}
