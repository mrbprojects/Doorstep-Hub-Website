import React from 'react';
import nextDynamic from 'next/dynamic';
import HeroSection from '@/components/landing/HeroSection';
import { redirect } from 'next/navigation';

// Dynamically load below-the-fold sections with SSR enabled
const KnowledgeSection = nextDynamic(() => import('@/components/landing/KnowledgeSection').then(m => m.KnowledgeSection));
const AppDownload = nextDynamic(() => import('@/components/landing/AppDownload').then(m => m.AppDownload));
const HomeHowItWorksSection = nextDynamic(() => import('@/components/landing/HomeHowItWorksSection').then(m => m.HomeHowItWorksSection));
const HomeWhyChooseUsSection = nextDynamic(() => import('@/components/landing/HomeWhyChooseUsSection').then(m => m.HomeWhyChooseUsSection));
const HomeExclusiveOffersSection = nextDynamic(() => import('@/components/landing/HomeExclusiveOffersSection').then(m => m.HomeExclusiveOffersSection));

export const dynamic = 'force-dynamic';

export default async function Home() {
    // Default to true so the approved Doorstep Hub homepage is always displayed
    // even during local development, build time, or backend network timeouts.
    let showHomeScreen = true;

    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi';
        const response = await fetch(`${baseUrl}/app/applience-repairs-website/get-website-screen-settings`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(3000)
        });
        if (response.ok) {
            const data = await response.json();
            if (data && data.success && data.data && typeof data.data.homescreen === 'boolean') {
                showHomeScreen = data.data.homescreen;
            }
        }
    } catch {
        // Network or API failure: keep approved homepage active
        showHomeScreen = true;
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
            {/* Dynamic Exclusive Offers & Coupons placed immediately below Hero section */}
            <HomeExclusiveOffersSection />
            {/* How It Works & Why Choose Doorstep Hub */}
            <HomeHowItWorksSection />
            <HomeWhyChooseUsSection />
            <KnowledgeSection />
            <AppDownload />
        </div>
    );
}
