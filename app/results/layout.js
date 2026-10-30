import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ResultsLayout({ children }) {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            {children}
            <Footer />
        </div>
    );
}

