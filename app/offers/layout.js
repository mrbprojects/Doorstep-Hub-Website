import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSEOMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await getSEOMetadata('/offers', {
        title: 'Exclusive Offers & Discount Coupons | Doorstep Hub',
        description: 'Explore active discounts, promo codes, and special offers on home appliance repair, spa services, and more at Doorstep Hub.',
    });
}

export default function OffersLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Header />
            <main className="pt-20">
                {children}
            </main>
            <Footer />
        </div>
    );
}

