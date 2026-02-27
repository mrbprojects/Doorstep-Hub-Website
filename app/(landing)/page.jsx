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

export default async function Home() {
    let showHomeScreen = false;

    try {
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/get-website-screen-settings', {
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

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-white overflow-x-hidden">
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
            <KnowledgeSection />
        </div>
    );
}
