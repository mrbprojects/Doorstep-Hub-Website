import React, { useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { BookingServices } from './components/BookingServices';
import { NearbyServiceCenters } from './components/NearbyServiceCenters';
import { LatestSpaServices } from './components/LatestSpaServices';
import { RecommendedSpaSalon } from './components/RecommendedSpaSalon';
import { PremiumPGHostels } from './components/PremiumPGHostels';
import { RecommendedHostels } from './components/RecommendedHostels';
import { LatestReligiousServices } from './components/LatestReligiousServices';
import { RecommendedReligious } from './components/RecommendedReligious';
import { AppDownload } from './components/AppDownload';
import { KnowledgeSection } from './components/KnowledgeSection';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { ServiceDetail } from './components/ServiceDetail';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'service'>('home');

  // Make setCurrentView globally available for service card clicks
  React.useEffect(() => {
    (window as any).navigateToService = () => setCurrentView('service');
    (window as any).navigateToHome = () => setCurrentView('home');
  }, []);

  if (currentView === 'service') {
    return <ServiceDetail />;
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white overflow-x-hidden">
      <Header />
      <HeroSection />
      <BookingServices />
      <NearbyServiceCenters />
      <LatestSpaServices />
      <RecommendedSpaSalon />
      <PremiumPGHostels />
      <RecommendedHostels />
      <LatestReligiousServices />
      <RecommendedReligious />
      <AppDownload />
      <KnowledgeSection />
      <Footer />
    </div>
  );
}