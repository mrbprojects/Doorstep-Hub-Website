import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
    title: 'Religious & Spiritual Services | DoorstepHub',
    description: 'Book improved pandits, pujas, and spiritual services. Experience divine connection at your doorstep.',
};

export default function ReligiousServicesLayout({ children }) {
    const religiousTheme = {
        bgScrolled: 'bg-[#fff5e6]/95', // Warm light cream
        bgMobile: 'bg-[#fff5e6]/95',
        textMain: 'text-[#4a0d0d]', // Deep Maroon
        textHover: 'text-[#ff9933]', // Saffron
        border: 'border-[#ff9933]/20',
        accent: 'bg-[#ff9933]',
        accentGradientFrom: 'from-[#800000]', // Maroon
        accentGradientTo: 'to-[#ff9933]', // Saffron
        buttonBg: 'bg-white',
        isLight: true
    };

    const footerTheme = {
        bg: 'from-[#1c0a00] to-[#100500]',
        borderTop: 'border-[#ff9933]/20',
        accentGlow: '#ff9933',
        accentColor: '#ff9933',
        accentHover: '#ffb347',
        accentGradientFrom: 'from-[#800000]',
        accentGradientTo: 'to-[#ff9933]',
        headingGradient: 'from-[#ff9933] via-[#fff5e6] to-[#ff9933]',
        textMain: 'text-white',
        textMuted: 'text-white/60',
        textSubtle: 'text-white/40',
        textLink: 'text-[#fff5e6]/70',
        textLinkHover: 'hover:text-[#ffb347]',
        groupNameColor: 'text-[#fff5e6]',
        dividerColor: 'text-[#ff9933]/30',
        socialBg: 'bg-white/5',
        socialBorder: 'border-[#ff9933]/20',
        tooltipBg: 'bg-[#1c0a00] border-[#ff9933]/50',
        tooltipText: 'text-white',
        iconBg: 'bg-white/5',
        iconHoverBg: 'group-hover:bg-[#ff9933]/20',
        isLight: false,
    };

    return (
        <>
            <Header theme={religiousTheme} />
            {children}
            <Footer theme={footerTheme} />
        </>
    );
}
