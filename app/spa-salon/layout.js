import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
    title: 'Spa & Salon Services | DoorstepHub',
    description: 'Book premium spa, salon, and wellness services at home or nearby.',
};

export default function SpaSalonLayout({ children }) {
    const spaSalonTheme = {
        bgScrolled: 'bg-white/80',
        bgMobile: 'bg-white/95',
        textMain: 'text-[#0F172A]',
        textHover: 'text-[#C06C84]',
        border: 'border-[#C06C84]/10',
        accent: 'bg-[#C06C84]',
        accentGradientFrom: 'from-[#C06C84]',
        accentGradientTo: 'to-[#6C5CE7]',
        buttonBg: 'bg-[#F6F7FB]',
        isLight: true
    };

    const footerTheme = {
        bg: 'from-[#1a0515] to-[#0f020e]',
        borderTop: 'border-[#C06C84]/20',
        accentGlow: '#C06C84',
        accentColor: '#C06C84',
        accentHover: '#d4839a',
        accentGradientFrom: 'from-[#C06C84]',
        accentGradientTo: 'to-[#6C5CE7]',
        headingGradient: 'from-[#C06C84] via-white to-[#C06C84]',
        textMain: 'text-white',
        textMuted: 'text-white/60',
        textSubtle: 'text-white/40',
        textLink: 'text-white/70',
        textLinkHover: 'hover:text-[#d4839a]',
        groupNameColor: 'text-white',
        dividerColor: 'text-white/20',
        socialBg: 'bg-white/5',
        socialBorder: 'border-white/10',
        tooltipBg: 'bg-[#1a0515] border-[#C06C84]/50',
        tooltipText: 'text-white',
        iconBg: 'bg-white/5',
        iconHoverBg: 'group-hover:bg-[#C06C84]/20',
        isLight: false,
    };

    return (
        <div className="min-h-screen bg-white">
            <Header theme={spaSalonTheme} />
            {children}
            <Footer theme={footerTheme} />
        </div>
    );
}
