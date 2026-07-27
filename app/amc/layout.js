import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Doorstep Hub Book AMC Services for Home Appliances & Electronics',
  description: 'Protect your AC, computer, washing machine, LED/Smart TV, refrigerator and other home appliances with Doorstep Hub Book AMC Services. Get preventive maintenance, expert repair support, doorstep service and priority booking. Book your AMC today at doorstephub.com/amc or call 8886688666.',
  openGraph: {
    title: 'Doorstep Hub Book AMC Services for Home Appliances & Electronics',
    description: 'Protect your AC, computer, washing machine, LED/Smart TV, refrigerator and other home appliances with Doorstep Hub Book AMC Services. Get preventive maintenance, expert repair support, doorstep service and priority booking. Book your AMC today at doorstephub.com/amc or call 8886688666.',
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
    title: 'Doorstep Hub Book AMC Services for Home Appliances & Electronics',
    description: 'Protect your AC, computer, washing machine, LED/Smart TV, refrigerator and other home appliances with Doorstep Hub Book AMC Services. Get preventive maintenance, expert repair support, doorstep service and priority booking. Book your AMC today at doorstephub.com/amc or call 8886688666.',
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
