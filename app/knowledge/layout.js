import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function KnowledgeLayout({ children }) {
    const knowledgeTheme = {
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

    return (
        <div className="min-h-screen">
            <Header theme={knowledgeTheme} />
            <main>{children}</main>
            <Footer />
        </div>
    );
}
