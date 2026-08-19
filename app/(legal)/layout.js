import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function LegalLayout({ children }) {
    return (
        <div className="bg-gradient-to-b from-[#f3faf8] via-white to-[#f8fafc] text-slate-900 min-h-screen font-sans flex flex-col justify-between">
            <Header />
            <main className="pt-24 flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}
