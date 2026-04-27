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
        category: 'appliances/categories',
        recentlyBooked: 'appliances/recent',
        featuredServices: 'appliances/featured',
        serviceCenter: 'appliances/centers',
        verifiedPartner: 'appliances/verified'
    });

    useEffect(() => {
        const fetchSlugs = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/get_slugs_by_serviceId/683daaa8f261c1548bdf7442`);
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
        router.push(`/${serviceSlugs.home}/detail/${serviceId}?category=${categoryParam}&subCategory=${subCategoryParam}`);
    };

    const openModal = () => setShowModal(true);
    const openExploreModal = () => setShowExploreModal(true);

    const handleExploreSelect = (type) => {
        if (type === 'partner') {
            router.push(`/${serviceSlugs.category}`);
        } else if (type === 'center') {
            router.push(`/${serviceSlugs.serviceCenter}`);
        }
        setShowExploreModal(false);
    };

    const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                "name": "Professional Appliance Repair Services",
                "description": "Expert repair and maintenance for all home appliances including AC, Refrigerator, TV, and more.",
                "provider": {
                    "@type": "Organization",
                    "name": "Doorstep Hub",
                    "url": "https://doorstephub.com"
                },
                "areaServed": {
                    "@type": "Country",
                    "name": "India"
                }
            },
            {
                "@type": "ItemList",
                "name": "Our Most Popular Appliance Services",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "AC Repair & Service" },
                    { "@type": "ListItem", "position": 2, "name": "TV Repair & Service" },
                    { "@type": "ListItem", "position": 3, "name": "Refrigerator Repair" },
                    { "@type": "ListItem", "position": 4, "name": "Washing Machine Repair" },
                    { "@type": "ListItem", "position": 5, "name": "Microwave Oven Repair" }
                ]
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />
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
            <PopularCenters onStoreClick={(storeId) => {
                router.push(`/appliances/store/${storeId}`);
            }} />
            <Newsletter />
        </>
    );
}
