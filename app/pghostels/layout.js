import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { NetworkStatus } from '@/components/ui/NetworkStatus';
import { SessionManager } from '@/components/auth/SessionManager';

export const metadata = {
    title: 'PG & Hostels Booking | DoorstepHub',
    description: 'Find verified PGs, co-living spaces, and hostels near your college or office. Book instantly with zero brokerage.',
};

export default function PGHostelsLayout({ children }) {
    const pgTheme = {
        bgScrolled: 'bg-white/95',
        bgMobile: 'bg-white/95',
        textMain: 'text-gray-700',
        textHover: 'text-[#037166]',
        border: 'border-gray-200',
        accent: 'bg-[#037166]',
        accentGradientFrom: 'from-[#037166]',
        accentGradientTo: 'to-[#025951]',
        buttonBg: 'bg-gray-50',
        isLight: true
    };

    const footerTheme = {
        bg: 'from-[#0a0f0e] to-[#050a09]',
        borderTop: 'border-[#037166]/20',
        accentGlow: '#037166',
        accentColor: '#037166',
        accentHover: '#04a99d',
        accentGradientFrom: 'from-[#037166]',
        accentGradientTo: 'to-[#025951]',
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
        tooltipBg: 'bg-[#0a0f0e] border-[#037166]/50',
        tooltipText: 'text-white',
        iconBg: 'bg-white/5',
        iconHoverBg: 'group-hover:bg-[#037166]/20',
        isLight: false,
    };

    return (
        <>
            <NetworkStatus />
            <SessionManager />
            <Header theme={pgTheme} />
            {children}
            <Footer theme={footerTheme} />
        </>
    );
}
