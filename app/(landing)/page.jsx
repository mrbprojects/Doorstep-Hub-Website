import HeroSection from '@/components/landing/HeroSection';
import { BookingServices } from '@/components/landing/BookingServices';
import { NearbyServiceCenters } from '@/components/landing/NearbyServiceCenters';
import { LatestSpaServices } from '@/components/landing/LatestSpaServices';
import { RecommendedSpaSalon } from '@/components/landing/RecommendedSpaSalon';
import { PremiumPGHostels } from '@/components/landing/PremiumPGHostels';
import { RecommendedHostels } from '@/components/landing/RecommendedHostels';
import { LatestReligiousServices } from '@/components/landing/LatestReligiousServices';
import { RecommendedReligious } from '@/components/landing/RecommendedReligious';
import { AppDownload } from '@/components/landing/AppDownload';
import { KnowledgeSection } from '@/components/landing/KnowledgeSection';

import { redirect } from 'next/navigation';

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
        <div className="bg-[#0a0a0a] min-h-screen text-white overflow-x-hidden">
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
            {/* <KnowledgeSection /> */}
        </div>
    );
}

