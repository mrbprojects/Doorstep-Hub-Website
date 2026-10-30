import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ApplianceRepairsLayout({ children }) {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            {children}
            <Footer />
        </div>
    );
}

