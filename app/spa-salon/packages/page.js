import { FeaturedPackagesPage } from '@/components/spasalon/FeaturedPackagesPage';
import { Suspense } from 'react';

export default function FeaturedPackagesRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-[#C06C84]">Loading...</div>}>
            <FeaturedPackagesPage />
        </Suspense>
    );
}
