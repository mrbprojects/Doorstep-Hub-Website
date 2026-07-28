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
    bg: 'from-white to-[#f8fafc]',
    borderTop: 'border-slate-200/80',
    accentGlow: '#037166',
    accentColor: '#037166',
    accentHover: '#04a99d',
    accentGradientFrom: 'from-[#037166]',
    accentGradientTo: 'to-[#04a99d]',
    headingGradient: 'from-[#037166] via-[#025951] to-[#037166]',
    textMain: 'text-[#037166]',
    textMuted: 'text-[#2f6f69]',
    textSubtle: 'text-[#5f8f89]',
    textLink: 'text-[#2f6f69]',
    textLinkHover: 'hover:text-[#04a99d]',
    groupNameColor: 'text-[#037166]',
    dividerColor: 'text-[#9bc7c1]',
    socialBg: 'bg-[#eef8f6]',
    socialBorder: 'border-[#cfe8e3]',
    tooltipBg: 'bg-white border-[#cfe8e3]',
    tooltipText: 'text-[#037166]',
    iconBg: 'bg-[#eef8f6]',
    iconHoverBg: 'group-hover:bg-[#037166]/10',
    isLight: true,
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
