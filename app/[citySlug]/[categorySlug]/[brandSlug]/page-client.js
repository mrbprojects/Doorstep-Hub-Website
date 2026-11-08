'use client';

import RepairServiceBrandPage from '../../../appliances/repair-service/[citySlug]/[categorySlug]/[brandSlug]/page-client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const appliancesTheme = {
  bgScrolled: 'bg-white/80',
  bgMobile: 'bg-white/95',
  textMain: 'text-gray-900',
  textHover: 'text-[#037166]',
  border: 'border-gray-100',
  accent: 'bg-[#037166]',
  accentGradientFrom: 'from-[#037166]',
  accentGradientTo: 'to-[#04a99d]',
  buttonBg: 'bg-gray-50',
  isLight: true,
};

const footerTheme = {
  bg: 'bg-white',
  borderTop: 'border-gray-100',
  accentGlow: '#037166',
  accentColor: '#037166',
  accentHover: '#04a99d',
  accentGradientFrom: 'from-[#037166]',
  accentGradientTo: 'to-[#04a99d]',
  headingGradient: 'from-[#037166] via-gray-900 to-[#037166]',
  textMain: 'text-gray-900',
  textMuted: 'text-gray-500',
  textSubtle: 'text-gray-400',
  textLink: 'text-gray-600',
  textLinkHover: 'hover:text-[#037166]',
  groupNameColor: 'text-gray-900',
  dividerColor: 'text-gray-100',
  socialBg: 'bg-gray-50',
  socialBorder: 'border-gray-100',
  tooltipBg: 'bg-white border-[#037166]/20',
  tooltipText: 'text-gray-900',
  iconBg: 'bg-gray-50',
  iconHoverBg: 'group-hover:bg-[#037166]/10',
  isLight: true,
};

export default function SeoBrandRoutePageClient() {
  return (
    <div className="appliance-global min-h-screen bg-white">
      <Header theme={appliancesTheme} />
      <main className="bg-white">
        <RepairServiceBrandPage />
      </main>
      <Footer theme={footerTheme} />
    </div>
  );
}
