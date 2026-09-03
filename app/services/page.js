'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Hero } from '@/components/services/Hero';
import { TopCategories } from '@/components/services/TopCategories';
import { FeaturedServices } from '@/components/services/FeaturedServices';
import { DownloadApp } from '@/components/services/DownloadApp';

// Below-the-fold and modal components dynamically loaded to reduce JS bundle size and evaluation time
const ServiceBookingModal = dynamic(() => import('@/components/services/ServiceBookingModal').then(m => m.ServiceBookingModal), { ssr: false });
const ServiceTypeSelectionModal = dynamic(() => import('@/components/services/ServiceTypeSelectionModal').then(m => m.ServiceTypeSelectionModal), { ssr: false });
const RecentlyBooked = dynamic(() => import('@/components/services/RecentlyBooked').then(m => m.RecentlyBooked), { ssr: false });
const NearbyStores = dynamic(() => import('@/components/services/NearbyStores').then(m => m.NearbyServiceCenters), { ssr: false });
const PopularCenters = dynamic(() => import('@/components/services/PopularCenters').then(m => m.PopularCenters), { ssr: false });
const KnowledgeSpace = dynamic(() => import('@/components/services/KnowledgeSpace').then(m => m.KnowledgeSpace), { ssr: false });
const Newsletter = dynamic(() => import('@/components/services/Newsletter').then(m => m.Newsletter), { ssr: false });

export default function ServicesPage() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [showExploreModal, setShowExploreModal] = useState(false);

    const handleServiceClick = (serviceId, categoryName, subcategoryName) => {
        // Encode parameters for URL
        const categoryParam = encodeURIComponent(categoryName || 'General');
        const subCategoryParam = encodeURIComponent(subcategoryName || 'Service');

        // Navigate to service detail page
        router.push(`/services/detail/${serviceId}?category=${categoryParam}&subCategory=${subCategoryParam}`);
    };

    const openModal = () => setShowModal(true);
    const openExploreModal = () => setShowExploreModal(true);

    const handleExploreSelect = (type) => {
        if (type === 'partner') {
            router.push('/services/categories');
        } else if (type === 'center') {
            const centerId = '683dbc04b62d2a241de0f7e8';
            router.push(`/services/child/${centerId}?category=Services&name=Service Centers`);
        }
        setShowExploreModal(false);
    };

    return (
        <>
            <Hero
                onBookService={openModal}
                onViewServices={openExploreModal}
            />
            <ServiceBookingModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
            <ServiceTypeSelectionModal
                isOpen={showExploreModal}
                onClose={() => setShowExploreModal(false)}
                onSelect={handleExploreSelect}
            />
            <TopCategories onViewAll={() => router.push('/services/categories')} />
            <FeaturedServices
                onServiceClick={handleServiceClick}
                onViewAll={() => router.push('/services/featured')}
            />
            <RecentlyBooked
                onServiceClick={handleServiceClick}
                onViewAll={() => router.push('/services/recent')}
            />
            {/* <PromoBanner /> */}
            <DownloadApp />
            <NearbyStores />
            <PopularCenters onStoreClick={(store) => {
                const categoryParam = encodeURIComponent('General');
                const subCategoryParam = encodeURIComponent(store.speciality || 'Service');
                router.push(`/services/detail/${store.id}?category=${categoryParam}&subCategory=${subCategoryParam}`);
            }} />
            <KnowledgeSpace />
            <Newsletter />
        </>
    );
}
