
'use client';

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { TopCategories } from '@/components/TopCategories';
import { FeaturedServices } from '@/components/FeaturedServices';
import { RecentlyBooked } from '@/components/RecentlyBooked';
import { PromoBanner } from '@/components/PromoBanner';
import { DownloadApp } from '@/components/DownloadApp';
import { NearbyStores } from '@/components/NearbyStores';
import { PopularCenters } from '@/components/PopularCenters';
import { KnowledgeSpace } from '@/components/KnowledgeSpace';
import { Newsletter } from '@/components/Newsletter';
import { Footer } from '@/components/Footer';
import { CategoryPage } from '@/components/CategoryPage';
import { ServicesListingPage } from '@/components/ServicesListingPage';
import { ServiceDetailsPage } from '@/components/ServiceDetailsPage';
import { CartPage } from '@/components/CartPage';
import { AddressPage } from '@/components/AddressPage';
import { BookingConfirmationPage } from '@/components/BookingConfirmationPage';
import { AllServicesPage } from '@/components/AllServicesPage';
import { StoreDetailPage } from '@/components/StoreDetailPage';
import { ViewAllPage } from '@/components/ViewAllPage';
import { Toaster } from 'sonner';

export default function ServiceProviderFlow({ serviceType = null }) {
  const [scrollY, setScrollY] = useState(0);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentPage('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setCurrentPage('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleServiceClick = (serviceId) => {
    setSelectedServiceId(serviceId);
    if (!selectedCategory) {
      setSelectedCategory('Oven Repair');
    }
    if (!selectedSubCategory) {
      setSelectedSubCategory('General Repair');
    }
    setCurrentPage('serviceDetails');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (item) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, item];
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, quantity } : item)
    );
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedServiceId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCategory = () => {
    setCurrentPage('category');
    setSelectedSubCategory(null);
    setSelectedServiceId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToServices = () => {
    setCurrentPage('services');
    setSelectedServiceId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToCart = () => {
    setCurrentPage('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToAddress = () => {
    setCurrentPage('address');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToBooking = () => {
    setCurrentPage('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
  };

  const handleGoToAllServices = () => {
    setCurrentPage('allServices');
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStoreClick = (storeId) => {
    setSelectedStoreId(storeId);
    setCurrentPage('storeDetail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllFeatured = () => {
    setCurrentPage('viewAllFeatured');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllStores = () => {
    setCurrentPage('viewAllStores');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllCategories = () => {
    setCurrentPage('viewAllCategories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: 'white',
            border: '1px solid rgba(3, 113, 102, 0.3)',
          },
          className: 'sonner-toast',
          duration: 3000,
        }}
      />

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <Navigation
        onLogoClick={handleBackToHome}
        onCartClick={handleGoToCart}
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />

      {currentPage === 'home' && (
        <>
          <Hero
            onViewServices={handleGoToAllServices}
            onBookService={handleViewAllCategories}
          />
          <TopCategories
            onCategoryClick={handleCategoryClick}
            onViewAll={handleViewAllCategories}
          />
          <FeaturedServices
            onServiceClick={handleServiceClick}
            onViewAll={handleViewAllFeatured}
          />
          <RecentlyBooked />
          <PromoBanner />
          <DownloadApp />
          <NearbyStores
            onStoreClick={handleStoreClick}
            onViewAll={handleViewAllStores}
          />
          <PopularCenters
            onStoreClick={handleStoreClick}
          />
          <KnowledgeSpace />
          <Newsletter />
        </>
      )}

      {currentPage === 'category' && selectedCategory && (
        <CategoryPage
          category={selectedCategory}
          onSubCategoryClick={handleSubCategoryClick}
          onBack={handleBackToHome}
        />
      )}

      {currentPage === 'services' && selectedCategory && selectedSubCategory && (
        <ServicesListingPage
          category={selectedCategory}
          subCategory={selectedSubCategory}
          onBack={handleBackToCategory}
          onServiceClick={handleServiceClick}
        />
      )}

      {currentPage === 'serviceDetails' && selectedCategory && selectedSubCategory && selectedServiceId !== null && (
        <ServiceDetailsPage
          serviceId={selectedServiceId}
          category={selectedCategory}
          subCategory={selectedSubCategory}
          onBack={handleBackToServices}
          onAddToCart={handleAddToCart}
          onGoToCart={handleGoToCart}
        />
      )}

      {currentPage === 'cart' && (
        <CartPage
          cartItems={cartItems}
          onBack={() => setCurrentPage('serviceDetails')}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onProceedToAddress={handleGoToAddress}
          onAddToCart={handleAddToCart}
        />
      )}

      {currentPage === 'address' && (
        <AddressPage
          selectedAddress={selectedAddress}
          onSelectAddress={handleSelectAddress}
          onBack={() => setCurrentPage('cart')}
          onContinue={handleGoToBooking}
        />
      )}

      {currentPage === 'booking' && selectedAddress && (
        <BookingConfirmationPage
          cartItems={cartItems}
          address={selectedAddress}
          onBack={() => setCurrentPage('address')}
          onConfirmBooking={() => {
            setCartItems([]);
            setSelectedAddress(null);
            handleBackToHome();
          }}
        />
      )}

      {currentPage === 'allServices' && (
        <AllServicesPage
          onServiceClick={handleServiceClick}
          onStoreClick={handleStoreClick}
          onBack={handleBackToHome}
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
        />
      )}

      {currentPage === 'storeDetail' && selectedStoreId !== null && (
        <StoreDetailPage
          storeId={selectedStoreId}
          onBack={handleBackToHome}
          onAddToCart={handleAddToCart}
          onGoToCart={handleGoToCart}
          onServiceClick={handleServiceClick}
        />
      )}

      {currentPage === 'viewAllFeatured' && (
        <ViewAllPage
          type="featured"
          onBack={handleBackToHome}
          onServiceClick={handleServiceClick}
        />
      )}

      {currentPage === 'viewAllStores' && (
        <ViewAllPage
          type="stores"
          onBack={handleBackToHome}
          onStoreClick={handleStoreClick}
        />
      )}

      {currentPage === 'viewAllCategories' && (
        <ViewAllPage
          type="categories"
          onBack={handleBackToHome}
          onCategoryClick={handleCategoryClick}
        />
      )}

      <Footer />
    </div>
  );
}
