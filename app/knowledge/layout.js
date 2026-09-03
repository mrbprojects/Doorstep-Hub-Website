import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function KnowledgeLayout({ children }) {
    const knowledgeTheme = {
        bgScrolled: 'bg-white/95',
        bgMobile: 'bg-white/98',
        textMain: 'text-gray-900',
        textHover: 'text-[#037166]',
        border: 'border-gray-100',
        accent: 'bg-[#037166]',
        accentGradientFrom: 'from-[#037166]',
        accentGradientTo: 'to-[#025951]',
        buttonBg: 'bg-gray-50',
        isLight: true
    };

    return (
        <div className="min-h-screen">
            <Header theme={knowledgeTheme} />
            <main className="pt-20 lg:pt-24">{children}</main>
            <Footer />
        </div>
    );
}
