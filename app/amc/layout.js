import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Annual Maintenance Care (AMC) Plans | Doorstep Hub',
  description: 'Subscribe to Annual Maintenance Care (AMC) for your home appliances & electronics. Get covered doorstep service visits at ₹0 fee.',
  openGraph: {
    title: 'Doorstep Hub Annual Maintenance Care (AMC)',
    description: 'Subscribe to Annual Maintenance Care for your home appliances. Get covered doorstep service visits at ₹0 fee.',
    url: 'https://doorstephub.com/amc',
    siteName: 'Doorstep Hub',
    images: [
      {
        url: 'https://api.doorstephub.com/uploads/Doorstep-Hub-AMC-Service.png',
        width: 1200,
        height: 630,
        alt: 'Doorstep Hub AMC Service',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doorstep Hub Annual Maintenance Care (AMC)',
    description: 'Subscribe to Annual Maintenance Care for your home appliances. Get covered doorstep service visits at ₹0 fee.',
    images: ['https://api.doorstephub.com/uploads/Doorstep-Hub-AMC-Service.png'],
  },
};

export default function AmcLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f3faf8]">
      <Header />
      <div className="pt-20 flex-grow flex flex-col">
        {children}
      </div>
      <Footer />
    </div>
  );
}
