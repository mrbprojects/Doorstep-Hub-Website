'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hero } from '@/components/services/Hero';
import { ServiceBookingModal } from '@/components/services/ServiceBookingModal';
import { ServiceTypeSelectionModal } from '@/components/services/ServiceTypeSelectionModal';
import { TopCategories } from '@/components/services/TopCategories';
import { FeaturedServices } from '@/components/services/FeaturedServices';
import { RecentlyBooked } from '@/components/services/RecentlyBooked';
import { PromoBanner } from '@/components/services/PromoBanner';
import { DownloadApp } from '@/components/services/DownloadApp';
import { NearbyServiceCenters as NearbyStores } from '@/components/services/NearbyStores';
import { PopularCenters } from '@/components/services/PopularCenters';
import { KnowledgeSpace } from '@/components/services/KnowledgeSpace';
import { Newsletter } from '@/components/services/Newsletter';

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
        // IDs provided by user for specific child categories
        const typeToId = {
            'partner': '683dbbfbb62d2a241de0f7e3', // Verified Partners
            'center': '683dbc04b62d2a241de0f7e8'    // Service Center
        };

        const id = typeToId[type];
        if (id) {
            router.push(`/services/child/${id}?category=Services&name=${type === 'partner' ? 'Verified Partners' : 'Service Centers'}`);
        } else {
            console.error('Unknown explore type:', type);
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
