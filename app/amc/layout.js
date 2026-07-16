import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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
