'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ServicesListingPage } from '@/components/appliances/ServicesListingPage';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Loader2 } from 'lucide-react';

const appliancesTheme = {
    bgScrolled: 'bg-[#0a0a0a]/80',
    bgMobile: 'bg-[#0a0a0a]/95',
    textMain: 'text-white/90',
    textHover: 'text-[#037166]',
    border: 'border-[#037166]/20',
    accent: 'bg-[#037166]',
    accentGradientFrom: 'from-[#037166]',
    accentGradientTo: 'to-[#025951]',
    buttonBg: 'bg-[#1a1a1a]',
    isLight: false
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

function ApplianceListingContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug;
    const categorySlug = searchParams.get('cat') || null;
    const subCategoryName = searchParams.get('name') || undefined;
    const subCategoryId = searchParams.get('id') || undefined;

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <ServicesListingPage
                slug={slug}
                category={categorySlug}
                subCategory={subCategoryName}
                subCategoryId={subCategoryId}
            />
        </div>
    );
}

export default function ApplianceListingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#037166] animate-spin" />
            </div>
        }>
            <ApplianceListingContent />
        </Suspense>
    );
}
