import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function BookAppointmentLayout({ children }) {
    const appliancesTheme = {
        bgScrolled: 'bg-white/95',
        bgMobile: 'bg-white/98',
        textMain: 'text-[#0f172a]',
        textHover: 'text-[#037166]',
        border: 'border-[#037166]/20',
        accent: 'bg-[#037166]',
        accentGradientFrom: 'from-[#037166]',
        accentGradientTo: 'to-[#025951]',
        buttonBg: 'bg-[#eef8f6]',
        isLight: true
    };

    return (
        <div className="min-h-screen">
            <Header theme={appliancesTheme} />
            {children}
            <Footer />
        </div>
    );
}
