'use client';

import { useRouter } from 'next/navigation';
import { ViewAllPage } from '@/components/services/ViewAllPage';

export default function AllCategoriesPage() {
    const router = useRouter();

    const handleCategoryClick = (category) => {
        router.push(`/services/category/${category._id}?name=${encodeURIComponent(category.title)}`);
    };

    return (
        <ViewAllPage
            type="categories"
            onBack={() => router.back()}
            onCategoryClick={handleCategoryClick}
        />
    );
}
