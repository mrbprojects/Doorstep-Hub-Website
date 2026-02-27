'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Hero } from '@/components/appliances/Hero';
import { ServiceBookingModal } from '@/components/appliances/ServiceBookingModal';
import { ServiceTypeSelectionModal } from '@/components/appliances/ServiceTypeSelectionModal';
import { TopCategories } from '@/components/appliances/TopCategories';
import { FeaturedServices } from '@/components/appliances/FeaturedServices';
import { RecentlyBooked } from '@/components/appliances/RecentlyBooked';
import { DownloadApp } from '@/components/appliances/DownloadApp';
import { NearbyServiceCenters as NearbyStores } from '@/components/appliances/NearbyStores';
import { PopularCenters } from '@/components/appliances/PopularCenters';
import { KnowledgeSpace } from '@/components/appliances/KnowledgeSpace';
import { Newsletter } from '@/components/appliances/Newsletter';

export function ApplianceHomePage() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [showExploreModal, setShowExploreModal] = useState(false);
    const [serviceSlugs, setServiceSlugs] = useState({
        home: 'appliance-repair-services',
        category: 'service-list/category/appliance-repair-service',
        recentlyBooked: 'all-service-categories',
        featuredServices: 'all-service-categories',
        serviceCenter: 'nearby-service-centers',
        verifiedPartner: 'verified-appliance-repair-partners'
    });

    // Fetch Slugs for this service
    useEffect(() => {
        const fetchSlugs = async () => {
            try {
                const res = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/get_slugs_by_serviceId/683daaa8f261c1548bdf7442');
                const data = await res.json();
                if (data.success && data.data) {
                    setServiceSlugs(prev => ({ ...prev, ...data.data }));
                }
            } catch (error) {
                console.error("Failed to fetch appliance sub-page slugs:", error);
            }
        };
        fetchSlugs();
    }, []);

    const handleServiceClick = (serviceId, categoryName, subcategoryName, serviceSlug) => {
        if (serviceSlug) {
            router.push(`/${serviceSlug}`);
            return;
        }
        const categoryParam = encodeURIComponent(categoryName || 'General');
        const subCategoryParam = encodeURIComponent(subcategoryName || 'Service');
        // Fallback to ID-based if no slug
        router.push(`/${serviceSlugs.home}/detail/${serviceId}?category=${categoryParam}&subCategory=${subCategoryParam}`);
    };

    const openModal = () => setShowModal(true);
    const openExploreModal = () => setShowExploreModal(true);

    const handleExploreSelect = (type) => {
        const typeToId = {
            'partner': '683dbbfbb62d2a241de0f7e3',
            'center': '683dbc04b62d2a241de0f7e8'
        };

        const id = typeToId[type];
        if (id) {
            const baseUrl = `/${serviceSlugs.home}`;
            if (type === 'partner') {
                router.push(`/${serviceSlugs.verifiedPartner}`);
            } else {
                // Align with the slug used in the "Nearest Appliance Service Centers" section
                router.push(`/${serviceSlugs.serviceCenter}`);
            }
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
            <TopCategories onViewAll={() => router.push(`/${serviceSlugs.category}`)} />
            <FeaturedServices
                onServiceClick={handleServiceClick}
                onViewAll={() => router.push(`/${serviceSlugs.featuredServices}`)}
            />
            <RecentlyBooked
                onServiceClick={handleServiceClick}
                onViewAll={() => router.push(`/${serviceSlugs.recentlyBooked}`)}
            />
            <DownloadApp />
            <NearbyStores onViewAll={() => router.push(`/${serviceSlugs.serviceCenter}`)} />
            <PopularCenters onStoreClick={(store) => {
                const categoryParam = encodeURIComponent('General');
                const subCategoryParam = encodeURIComponent(store.speciality || 'Service');
                router.push(`/${serviceSlugs.home}/detail/${store.id}?category=${categoryParam}&subCategory=${subCategoryParam}`);
            }} />
            <KnowledgeSpace />
            <Newsletter />
        </>
    );
}
