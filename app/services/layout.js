import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ServicesLayout({ children }) {
    const servicesTheme = {
        bgScrolled: 'bg-[#0a0a0a]/90',
        bgMobile: 'bg-[#0a0a0a]/95',
        textMain: 'text-gray-300',
        textHover: 'text-[#037166]',
        border: 'border-[#037166]/20',
        accent: 'bg-[#037166]',
        accentGradientFrom: 'from-[#037166]',
        accentGradientTo: 'to-[#02b39a]',
        buttonBg: 'bg-[#1a1a1a]', // For icon buttons
    };

    return (
        <>
            <Header theme={servicesTheme} />
            {children}
            <Footer />
        </>
    );
}
