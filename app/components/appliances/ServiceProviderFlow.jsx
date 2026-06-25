
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Hero } from '@/components/appliances/Hero';
import { TopCategories } from '@/components/appliances/TopCategories';
import { FeaturedServices } from '@/components/appliances/FeaturedServices';
import { RecentlyBooked } from '@/components/appliances/RecentlyBooked';
import { PromoBanner } from '@/components/appliances/PromoBanner';
import { DownloadApp } from '@/components/appliances/DownloadApp';
import { NearbyServiceCenters as NearbyStores } from '@/components/appliances/NearbyStores';
import { PopularCenters } from '@/components/appliances/PopularCenters';
import { KnowledgeSpace } from '@/components/appliances/KnowledgeSpace';
import { Newsletter } from '@/components/appliances/Newsletter';
import { Footer } from '@/components/layout/Footer';
import { CategoryPage } from '@/components/appliances/CategoryPage';
import { ServicesListingPage } from '@/components/appliances/ServicesListingPage';
import { ServiceDetailsPage } from '@/components/appliances/ServiceDetailsPage';
import { CartPage } from '@/components/appliances/CartPage';
import { AddressPage } from '@/components/appliances/AddressPage';
import { BookingConfirmationPage } from '@/components/appliances/BookingConfirmationPage';
import { AllServicesPage } from '@/components/appliances/AllServicesPage';
import { StoreDetailPage } from '@/components/appliances/StoreDetailPage';
import { ViewAllPage } from '@/components/appliances/ViewAllPage';
import { ServiceCartCheckoutPage } from '@/components/appliances/ServiceCartCheckoutPage';
import { ThankYouPage } from '@/components/appliances/ThankYouPage';
import { GlobalNav } from '@/components/layout/GlobalNav';
import { Toaster } from 'sonner';

import { useServiceCart } from '@/context/ServiceCartContext';

export default function ServiceProviderFlow({ serviceType = null }) {
  const router = useRouter();
  const { cartItems, addToCart, removeFromCart } = useServiceCart();
  const [scrollY, setScrollY] = useState(0);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryClick = (category) => {
    // Check if category is an object (from API/new logic) or string (legacy/fallback)
    if (typeof category === 'object' && category !== null) {
      setSelectedCategory(category.title || category.name);
      setSelectedCategoryId(category._id);
    } else {
      setSelectedCategory(category);
      setSelectedCategoryId(null); // Or handle fallback mapping if needed
    }
    setCurrentPage('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubCategoryClick = (subCategory) => {
    if (typeof subCategory === 'object' && subCategory !== null) {
      setSelectedSubCategory(subCategory.name);
      setSelectedSubCategoryId(subCategory._id);
    } else {
      setSelectedSubCategory(subCategory);
      setSelectedSubCategoryId(null);
    }
    setCurrentPage('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleServiceClick = (serviceId, categoryName = null, subcategoryName = null) => {
    setSelectedServiceId(serviceId);

    // Set category if provided, otherwise keep current or set default
    if (categoryName) {
      setSelectedCategory(categoryName);
    } else if (!selectedCategory) {
      setSelectedCategory('Oven Repair');
    }

    // Set subcategory if provided, otherwise keep current or set default
    if (subcategoryName) {
      setSelectedSubCategory(subcategoryName);
    } else if (!selectedSubCategory) {
      setSelectedSubCategory('General Repair');
    }

    setCurrentPage('serviceDetails');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (item) => {
    // ServiceCart's addToCart: (providerId, itemId, itemType, quantity, parentServiceId)
    // Here item seems to be from AllServicesPage or similar
    const success = await addToCart(item.serviceId || item.id, item.id, 'service', item.quantity || 1);
    if (success) {
      // toast is already handled in Context
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedSubCategoryId(null);
    setSelectedServiceId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCategory = () => {
    setCurrentPage('category');
    setSelectedSubCategory(null);
    setSelectedSubCategoryId(null);
    setSelectedServiceId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToServices = () => {
    setCurrentPage('services');
    setSelectedServiceId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToCart = () => {
    localStorage.removeItem('last_service_id');
    localStorage.removeItem('booking_package_details');
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
    setSelectedSubCategoryId(null);
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
    // Navigate to the dedicated centers page
    router.push('/appliances/centers');
  };

  const handleViewAllCategories = () => {
    setCurrentPage('viewAllCategories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllRecent = () => {
    setCurrentPage('viewAllRecent');
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

      <GlobalNav
        currentPage={currentPage}
        onCartClick={handleGoToCart}
      />

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
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
          <RecentlyBooked
            onServiceClick={handleServiceClick}
            onViewAll={handleViewAllRecent}
          />
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
          categoryId={selectedCategoryId}
          onSubCategoryClick={handleSubCategoryClick}
          onBack={handleBackToHome}
        />
      )}

      {currentPage === 'services' && selectedCategory && selectedSubCategory && (
        <ServicesListingPage
          category={selectedCategory}
          subCategory={selectedSubCategory}
          subCategoryId={selectedSubCategoryId}
          onBack={handleBackToCategory}
          onServiceClick={handleServiceClick}
          onStoreClick={handleStoreClick}
        />
      )}

      {currentPage === 'serviceDetails' && selectedCategory && selectedSubCategory && selectedServiceId !== null && (
        <ServiceDetailsPage
          serviceId={selectedServiceId}
          category={selectedCategory}
          subCategory={selectedSubCategory}
          onBack={handleBackToServices}
          onBookNow={handleGoToAddress}
        />
      )}

      {currentPage === 'cart' && (
        <CartPage
          onBack={() => {
            if (selectedServiceId) {
              setCurrentPage('serviceDetails');
            } else {
              setCurrentPage('services');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onProceedToAddress={() => {
            // Set flag to indicate service cart flow
            localStorage.setItem('service_cart_flow', 'true');
            setCurrentPage('address');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'service-cart-checkout' && (
        <ServiceCartCheckoutPage
          selectedAddress={selectedAddress}
          onBack={() => setCurrentPage('address')}
          onSuccess={(data) => {
            // Save booking details for thank you page
            setBookingDetails({
              orderId: data.bookingId || data.orderId || '',
              date: data.bookedDate || 'Confirmed',
              time: data.bookedTime || '',
              address: `${selectedAddress?.flat}, ${selectedAddress?.area}, ${selectedAddress?.cityName}`
            });
            // Save to sessionStorage for persistence (fallback if state is lost)
            sessionStorage.setItem('last_booking_date', data.bookedDate || 'Confirmed');
            sessionStorage.setItem('last_booking_time', data.bookedTime || '');
            setCurrentPage('thankYou');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'address' && (
        <AddressPage
          selectedAddress={selectedAddress}
          onSelectAddress={handleSelectAddress}
          onBack={() => {
            const isDirect = localStorage.getItem('last_service_id');
            if (isDirect) {
              setCurrentPage('serviceDetails');
            } else {
              setCurrentPage('cart');
            }
          }}
          onContinue={() => {
            const isServiceCartFlow = localStorage.getItem('service_cart_flow');
            console.log('🔍 AddressPage Continue - Service Cart Flow:', isServiceCartFlow);
            if (isServiceCartFlow) {
              // Service cart flow: go to service cart checkout
              console.log('✅ Navigating to service-cart-checkout');
              setCurrentPage('service-cart-checkout');
              // Remove flag after navigation
              setTimeout(() => localStorage.removeItem('service_cart_flow'), 100);
            } else {
              // Regular service flow: go to booking confirmation
              console.log('✅ Navigating to booking confirmation');
              handleGoToBooking();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'booking' && selectedAddress && (
        <BookingConfirmationPage
          cartItems={cartItems}
          address={selectedAddress}
          onBack={() => setCurrentPage('address')}
          onConfirmBooking={(data) => {
            // Save booking details for thank you page
            setBookingDetails({
              orderId: data?.bookingId || data?.orderId || '',
              date: data?.bookedDate || 'Confirmed',
              time: data?.bookedTime || '',
              address: `${selectedAddress?.flat}, ${selectedAddress?.area}, ${selectedAddress?.cityName}`
            });
            // Save to sessionStorage for persistence (fallback if state is lost)
            sessionStorage.setItem('last_booking_date', data?.bookedDate || 'Confirmed');
            sessionStorage.setItem('last_booking_time', data?.bookedTime || '');
            setCurrentPage('thankYou');
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
          serviceId={selectedSubCategoryId}
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

      {currentPage === 'viewAllRecent' && (
        <ViewAllPage
          type="recent"
          onBack={handleBackToHome}
          onServiceClick={handleServiceClick}
        />
      )}

      {currentPage === 'thankYou' && (
        <ThankYouPage bookingDetails={bookingDetails} />
      )}

      <Footer />
    </div>
  );
}
