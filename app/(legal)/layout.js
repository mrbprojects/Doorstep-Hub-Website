import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function LegalLayout({ children }) {
    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Header />
            <main className="pt-24 min-h-[calc(100vh-400px)]">
                {children}
            </main>
            <Footer />
        </div>
    );
}
