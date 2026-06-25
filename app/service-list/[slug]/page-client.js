'use client';

import { useParams, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
const StoreDetailPage = dynamic(() => import('@/components/appliances/StoreDetailPage').then(m => m.StoreDetailPage), { ssr: false });
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const appliancesTheme = {
    bgScrolled: 'bg-white/80',
    bgMobile: 'bg-white/95',
    textMain: 'text-[#037166]',
    textHover: 'text-[#037166]',
    border: 'border-gray-100',
    accent: 'bg-[#037166]',
    accentGradientFrom: 'from-[#037166]',
    accentGradientTo: 'to-[#04a99d]',
    buttonBg: 'bg-gray-50',
    isLight: true
};

const footerTheme = {
    bg: 'from-[#0a0a0a] to-black',
    borderTop: 'border-[#037166]/20',
    accentGlow: '#037166',
    accentColor: '#037166',
    accentHover: '#04a99d',
    accentGradientFrom: 'from-[#037166]',
    accentGradientTo: 'to-[#04a99d]',
    headingGradient: 'from-[#037166] via-white to-[#037166]',
    textMain: 'text-white',
    textMuted: 'text-white/60',
    textSubtle: 'text-white/40',
    textLink: 'text-white/70',
    textLinkHover: 'hover:text-[#04a99d]',
    groupNameColor: 'text-white',
    dividerColor: 'text-white/20',
    socialBg: 'bg-white/5',
    socialBorder: 'border-white/10',
    tooltipBg: 'bg-[#1a1a1a] border-[#037166]/50',
    tooltipText: 'text-white',
    iconBg: 'bg-white/5',
    iconHoverBg: 'group-hover:bg-[#037166]/20',
    isLight: false,
};

import { Suspense } from 'react';

function ServiceCenterContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug;
    const serviceId = searchParams.get('serviceId');

    return (
        <div className="min-h-screen">
            <Header theme={appliancesTheme} />
            <StoreDetailPage storeId={slug} serviceId={serviceId} />
            <Footer theme={footerTheme} />
        </div>
    );
}

export default function ServiceCenterDetailPageClient() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
            <ServiceCenterContent />
        </Suspense>
    );
}
