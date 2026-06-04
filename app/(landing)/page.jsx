import React from 'react';
import nextDynamic from 'next/dynamic';
import HeroSection from '@/components/landing/HeroSection';
import { redirect } from 'next/navigation';

// Dynamically load below-the-fold sections to optimize initial bundle size & reduce JS execution time
const BookingServices = nextDynamic(() => import('@/components/landing/BookingServices').then(m => m.BookingServices), { ssr: false });
const NearbyServiceCenters = nextDynamic(() => import('@/components/landing/NearbyServiceCenters').then(m => m.NearbyServiceCenters), { ssr: false });
const PremiumPGHostels = nextDynamic(() => import('@/components/landing/PremiumPGHostels').then(m => m.PremiumPGHostels), { ssr: false });
const RecommendedHostels = nextDynamic(() => import('@/components/landing/RecommendedHostels').then(m => m.RecommendedHostels), { ssr: false });
const LatestReligiousServices = nextDynamic(() => import('@/components/landing/LatestReligiousServices').then(m => m.LatestReligiousServices), { ssr: false });
const RecommendedReligious = nextDynamic(() => import('@/components/landing/RecommendedReligious').then(m => m.RecommendedReligious), { ssr: false });
const LatestSpaServices = nextDynamic(() => import('@/components/landing/LatestSpaServices').then(m => m.LatestSpaServices), { ssr: false });
const RecommendedSpaSalon = nextDynamic(() => import('@/components/landing/RecommendedSpaSalon').then(m => m.RecommendedSpaSalon), { ssr: false });
const AppDownload = nextDynamic(() => import('@/components/landing/AppDownload').then(m => m.AppDownload), { ssr: false });

export const dynamic = 'force-dynamic';

export default async function Home() {
    let showHomeScreen = false;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/get-website-screen-settings`, {
            cache: 'no-store'
        });
        const data = await response.json();
        if (data.success && data.data) {
            showHomeScreen = data.data.homescreen;
        }
    } catch (error) {
        console.error("Error fetching screen settings:", error);
    }

    if (!showHomeScreen) {
        redirect('/appliance-repair-services');
    }

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Doorstep Hub",
        "url": "https://doorstephub.com",
        "logo": "https://doorstephub.com/d-hub-logo.png",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91 8886688666",
            "contactType": "customer service",
            "areaServed": "IN",
            "availableLanguage": ["en", "te", "hi"]
        },
        "sameAs": [
            "https://www.facebook.com/doorstephub",
            "https://www.instagram.com/doorstephub",
            "https://twitter.com/doorstephub"
        ]
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Doorstep Hub",
        "url": "https://doorstephub.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://doorstephub.com/results?search={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <div className="landing-global bg-white min-h-screen text-gray-900 overflow-x-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <HeroSection />
            <BookingServices />
            <NearbyServiceCenters />
            <PremiumPGHostels />
            <RecommendedHostels />
            <LatestReligiousServices />
            <RecommendedReligious />
            <LatestSpaServices />
            <RecommendedSpaSalon />
            <AppDownload />
        </div>
    );
}
