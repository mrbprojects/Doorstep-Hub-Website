import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
    title: 'Search Results | Doorstep Hub',
    robots: {
        index: false,
        follow: true,
    },
};

export default function ResultsLayout({ children }) {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            {children}
            <Footer />
        </div>
    );
}

