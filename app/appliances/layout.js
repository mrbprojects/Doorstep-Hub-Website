import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function AppliancesLayout({ children }) {
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

    return (
        <div className="min-h-screen">
            <Header theme={appliancesTheme} />
            {children}
            <Footer theme={footerTheme} />
        </div>
    );
}
