'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { GoogleMap, Marker, OverlayViewF, FLOAT_PANE } from '@react-google-maps/api';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Award,
  CheckCircle,
  Shield,
  Users,
  Calendar,
  X,
  Check,
  Sparkles,
  ThumbsUp, CheckCheck, Loader2, Store
} from 'lucide-react';
import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useLocationContext } from '@/context/LocationContext';
import DOMPurify from 'dompurify';

// ── Map Configuration ──
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const MAP_OPTIONS = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
    { featureType: 'transit', elementType: 'geometry.fill', stylers: [{ color: '#037166' }] },
    { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit.station.bus', stylers: [{ visibility: 'off' }] },
  ],
};

const GREEN_DOT = {
  url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  scaledSize: { width: 44, height: 44 },
  anchor: { x: 22, y: 44 },
};

const CENTER_LOGO = {
  url: '/servicecenterpointlogo.png',
  scaledSize: { width: 38, height: 50 },
  anchor: { x: 19, y: 50 },
};

export function StoreDetailPage({ storeId, serviceId, onBack }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Service Rates');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [reviewsToShow, setReviewsToShow] = useState(3);
  const [selectedPackages, setSelectedPackages] = useState([]);

  // API data state
  const [loading, setLoading] = useState(true);
  const [centerData, setCenterData] = useState(null);
  const [resolvedProviderId, setResolvedProviderId] = useState(null); // Always a real MongoDB _id
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [bannerImage, setBannerImage] = useState('');
  const [aboutBio, setAboutBio] = useState('');
  const [locationData, setLocationData] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);

  // Addons popup state
  const [showAddonsPopup, setShowAddonsPopup] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [addonsData, setAddonsData] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [loadingAddons, setLoadingAddons] = useState(false);

  // Get service cart functions from context
  const { addToCart: addToServiceCart, clearCart } = useServiceCart();
  // Get user's real location
  const { location, isMapsLoaded } = useLocationContext();

  // Fetch service center details from API
  useEffect(() => {
    let interval;
    if (lightboxIndex !== null && portfolioImages.length > 1) {
      interval = setInterval(() => {
        setLightboxIndex((prev) => (prev + 1) % portfolioImages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [lightboxIndex, portfolioImages.length]);

  useEffect(() => {
    const fetchCenterDetails = async () => {
      setLoading(true);
      try {
        let resolvedStoreId = storeId;

        // If storeId is not a valid MongoDB ID (24 hex chars), treat it as a slug
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(storeId);

        if (isMongoId) {
          // Already a real ID — use directly
          setResolvedProviderId(storeId);
        } else {
          // Resolve slug to real MongoDB _id
          try {
            const centersRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/get_service_center`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lattitude: location?.lat ?? 17.3850,  // Use real user location, fallback to Hyderabad
                longitude: location?.lng ?? 78.4867,
                page: 1,
                limit: 100
              })
            });
            const centersData = await centersRes.json();
            if (centersData.success && Array.isArray(centersData.nearByServiceCenters)) {
              const generateSlug = (name) => name?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';
              const matched = centersData.nearByServiceCenters.find(c =>
                c.slug === storeId || 
                c._id === storeId ||
                generateSlug(c.business_name || c.name) === storeId
              );
              if (matched) {
                resolvedStoreId = matched._id;
                setResolvedProviderId(matched._id);
                console.log('Resolved slug to provider _id:', matched._id);
              }
            }
          } catch (resError) {
            console.error('Error resolving slug to ID:', resError);
          }
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/service_center_services/${resolvedStoreId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch service center details');
        }

        const data = await response.json();

        if (data.success) {
          // Set center data
          const center = data.nearByServiceCenters?.[0] || data.data || data.serviceCenter;
          setCenterData(center);

          // If we still don't have a resolved provider ID, extract it from center data
          if (center?._id) {
            setResolvedProviderId(prev => prev || center._id);
          }

          // Set services
          // Map array if it exists, otherwise try to find it in the center object
          const rawServices = data.services || center?.services || [];
          const mappedServices = rawServices.map(s => ({
            id: s._id || s.id,
            name: s.name || s.title,
            description: s.description || s.bio,
            price: s.price || s.minFare || s.inspectionCost || 0,
            image: s.image || s.logo,
            rating: s.rating || 4.5,
            totalOrders: s.totalOrders || 0,
            duration: s.duration || '60 mins',
            subcategoryName: s.subcategoryName || center?.speciality,
            bannerImages: s.banner_images || []
          }));
          setServices(mappedServices);

          // Set reviews
          setReviews(data.reviews || center?.reviews || []);

          // Set portfolio images
          const portfolioUrls = data.portfolio?.images?.map((img) =>
            `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img.startsWith('/') ? img.slice(1) : img}`
          ) || [];
          setPortfolioImages(portfolioUrls);

          // Set banner image
          if (data.banner_image) {
            setBannerImage(`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${data.banner_image}`);
          }

          // Set about bio
          setAboutBio(data.about?.bio || '');

          // Set location data
          setLocationData(data.location || null);

          console.log('Service center data loaded:', data);
        }
      } catch (error) {
        console.error('Error fetching service center details:', error);
        toast.error('Failed to load service center details');
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchCenterDetails();
    }
  }, [storeId, location?.lat, location?.lng]);

  // Fetch Global Settings for App Links
  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/get_global_settings`);
        const data = await response.json();
        if (data.success && data.policy) {
          setGlobalSettings(data.policy);
        }
      } catch (error) {
        console.error('Error fetching global settings:', error);
      }
    };
    fetchGlobalSettings();
  }, []);

  // Immediate redirection logic
  useEffect(() => {
    if (!loading && !centerData) {
      router.replace('/appliance-repair-services');
    }
  }, [loading, centerData, router]);

  // Pre-select serviceId if provided
  useEffect(() => {
    if (serviceId && services.length > 0) {
      if (!selectedPackages.includes(serviceId)) {
        setSelectedPackages([serviceId]);
      }
    }
  }, [serviceId, services]);

  // Get center data or use fallback
  const center = centerData || {
    firstName: 'Loading',
    lastName: '...',
    address: 'Loading address...',
    avgRating: 0,
    totalRatings: 0,
    totalOrders: 0,
    BasePrice: 0,
    inspectionCost: 0,
    serviceBookingCost: 0
  };

  const handleSelectPackage = (packageId) => {
    setSelectedPackages(prev =>
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  // Fetch service addons
  const fetchServiceAddons = async (serviceId) => {
    setLoadingAddons(true);
    try {
      console.log('Fetching addons for service:', serviceId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/service-addons`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceIds: [serviceId],
            providerId: resolvedProviderId || storeId
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch addons');
      }

      const data = await response.json();
      console.log('Addons API response:', data);

      if (data.success && data.data && data.data.length > 0) {
        return data.data[0]; // Return first item with addons
      }
      return null;
    } catch (error) {
      console.error('Error fetching addons:', error);
      return null;
    } finally {
      setLoadingAddons(false);
    }
  };

  const handleAddToCart = async (service) => {
    console.log('Add to cart clicked for service:', service);
    // Store current service
    setCurrentService(service);

    // Check for addons
    const addons = await fetchServiceAddons(service.id);

    if (addons && addons.addons && addons.addons.length > 0) {
      // Show popup if addons exist
      console.log('Showing addons popup with data:', addons);
      setAddonsData(addons);
      setSelectedAddons([]); // Reset selected addons
      setShowAddonsPopup(true);
    } else {
      // No addons, add directly to cart
      console.log('No addons found, adding directly to cart');
      addServiceToCart(service, []);
    }
  };

  const addServiceToCart = async (service, addons = []) => {
    try {
      // Step 1: Clear the cart first
      console.log('Clearing cart before adding new items...');
      await clearCart();

      // Step 2: Add parent service
      console.log('Adding parent service to cart:', service);
      const parentAdded = await addToServiceCart(
        resolvedProviderId || storeId, // Use real MongoDB _id, not slug
        service.id,                    // itemId
        'service',                     // itemType
        1                              // quantity
      );

      if (!parentAdded) {
        toast.error('Failed to add service to cart');
        return;
      }

      // Step 3: Add selected addons
      if (addons.length > 0) {
        console.log('Adding addons to cart:', addons);
        for (const addon of addons) {
          await addToServiceCart(
            resolvedProviderId || storeId, // Use real MongoDB _id, not slug
            addon._id,                     // itemId (addons use _id)
            'addon',                       // itemType
            1,                             // quantity
            service.id                     // parentServiceId
          );
        }
      }

      // Close popup and navigate to address
      setShowAddonsPopup(false);
      localStorage.setItem('service_cart_flow', 'true');
      router.push('/appliances/address');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add items to cart');
    }
  };

  const handleContinueWithAddons = () => {
    if (currentService) {
      const selected = addonsData.addons.filter(addon =>
        selectedAddons.includes(addon._id)
      );
      addServiceToCart(currentService, selected);
    }
  };

  const handleSkipAddons = () => {
    if (currentService) {
      addServiceToCart(currentService, []);
    }
  };

  const toggleAddonSelection = (addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleContinueBooking = async () => {
    if (selectedPackages.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Clear the cart first
      console.log('Clearing cart before adding multiple items...');
      await clearCart();

      // Step 2: Add all selected services
      const servicesToAdd = services.filter(s => selectedPackages.includes(s.id));
      console.log('Adding multiple services to cart:', servicesToAdd);

      for (const service of servicesToAdd) {
        await addToServiceCart(
          resolvedProviderId || storeId,
          service.id,
          'service',
          1
        );
      }

      // Step 3: Navigate to address
      localStorage.setItem('service_cart_flow', 'true');
      router.push('/appliances/address');
    } catch (error) {
      console.error('Error in multiple selection cart update:', error);
      toast.error('Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const ShimmerServiceCard = () => (
    <div className="h-28 rounded-2xl bg-white border border-gray-100 overflow-hidden relative">
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent" />
      <div className="flex flex-col sm:flex-row h-full">
        <div className="w-full sm:w-32 bg-gray-100" />
        <div className="flex-1 p-4 space-y-3">
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-2 w-full bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );


  if (!loading && !centerData) {
    return <div className="appliance-detail-page min-h-screen bg-white" />;
  }

  // Generate Schema.org JSON-LD for Local SEO
  const schemaData = centerData ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": centerData.business_name || `${centerData.firstName} ${centerData.lastName}`,
    "image": (centerData.image || centerData.logo)
      ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${centerData.image || centerData.logo}`.replace(/([^:]\/)\/+/g, "$1")
      : "https://doorstephub.com/d-hub-logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": centerData.cityName || centerData.city || "",
      "addressRegion": centerData.stateName || centerData.state || "",
      "addressCountry": "India",
      "streetAddress": centerData.address
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": centerData.lattitude || centerData.latitude,
      "longitude": centerData.longitude || centerData.longitude
    },
    "url": typeof window !== 'undefined' ? window.location.href : '',
    "telephone": centerData.phone || "+918886688666",
    "areaServed": centerData.cityName || centerData.city || "",
    "serviceType": centerData.speciality || "Appliance Repair Services",
    "aggregateRating": centerData.avgRating ? {
      "@type": "AggregateRating",
      "ratingValue": centerData.avgRating,
      "reviewCount": centerData.totalRatings || centerData.reviews?.length || 10
    } : undefined
  } : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="appliance-detail-page min-h-screen pt-24 pb-20 bg-gray-50/30"
    >
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => onBack ? onBack() : router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 mb-4 sm:mb-8 rounded-full bg-white border border-gray-100 text-gray-700 hover:bg-gray-50 hover:text-[#037166] transition-all text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Hero Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[320px] xs:h-[350px] md:h-[400px] lg:h-[500px] rounded-2xl mb-8 shadow-2xl"
        >
          <div className="h-full w-full rounded-2xl overflow-hidden">
            {bannerImage ? (
              <img
                src={bannerImage}
                alt="Service Center Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Sparkles className="w-20 h-20 text-[#037166]/10" />
              </div>
            )}
          </div>

          {/* No Gradient Overlay - for maximum clarity */}

          {/* Store Info Overlay - Half Above / Half Below */}
          <div className="absolute left-0 right-0 bottom-0 translate-y-1/2">
            <div className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl">
            
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-1.5 md:mb-3">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-white shadow-2xl bg-white flex items-center justify-center">
                      {(center.logo || center.image) ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${(center.logo || center.image).startsWith('/') ? (center.logo || center.image).slice(1) : (center.logo || center.image)}`}
                          alt="Store Logo"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1667503779301-3120a323859a?auto=format&fit=crop&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                          <Store className="w-10 h-10 text-[#037166]/10" />
                        </div>
                      )}
                    </div>
                    {/* Verified Badge */}
                    {/* <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-lg">
                      <Check className="w-4 h-4 text-white font-bold" />
                    </div> */}
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-1">
                      {center.business_name || `${center.firstName || ''} ${center.lastName || ''}`}
                    </h1>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#037166] animate-pulse" />
                      <span className="text-[10px] sm:text-xs font-bold text-[#037166] uppercase tracking-wider">Verified Professional Service</span>
                    </div>
                  </div>
                </div>

                {/* App Links beside heading */}
                <div className="flex items-center gap-3">
                  <a
                    href={globalSettings?.customerAndroidAppLink || "https://play.google.com/store/apps/details?id=com.doorstephub.customer"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-36 xs:w-44 md:w-38 h-12 xs:h-14 md:h-13 bg-[#DEF2EF] rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden border border-[#9ecbc3]"
                    title="Get it on Google Play"
                  >
                    <img src="/andriod1.png" alt="Google Play" className="h-full w-full object-cover " />
                  </a>
                  <a
                    href={globalSettings?.customerIosAppLink || "https://apps.apple.com/in/app/doorstep-hub/id6475340236"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-36 xs:w-44 md:w-38 h-12 xs:h-14 md:h-13 bg-[#DEF2EF] rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden border border-[#9ecbc3]"
                    title="Download on the App Store"
                  >
                    <img src="/apple2.png" alt="App Store" className="h-full w-full object-cover" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:grid md:grid-cols-2 lg:flex lg:flex-row lg:items-center lg:gap-6 mb-3 md:mb-4">
                <div className="flex items-start gap-1.5 md:gap-2">
                  <MapPin className="w-4 h-4 text-[#037166] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-xs sm:text-sm font-medium line-clamp-1">{center.address}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-[#037166] text-[#037166]" />
                    <span className="text-gray-900 font-bold text-xs sm:text-sm">{(center.avgRating || center.rating)?.toFixed(1) || '4.5'}</span>
                    <span className="text-gray-400 text-[10px] sm:text-xs">({center.totalRatings || center.reviews?.length || 0})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#037166]/10">
                      <CheckCheck className="w-2.5 h-2.5 text-[#037166]" />
                    </div>
                    <span className="text-gray-700 text-xs sm:text-sm font-semibold">{center.totalOrders || 0}+ Jobs Done</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-full bg-[#037166]/5 border border-[#037166]/10 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#037166]" />
                  <span className="text-[#037166] text-[10px] sm:text-xs font-bold">Express Service</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Space for overlapped store info card */}
        <div className="h-24 sm:h-28 md:h-32" />

        {/* Sticky Tab Navigation */}
        <div className="sticky top-20 z-40 mb-8 bg-white/80 backdrop-blur-xl border-y border-gray-100 -mx-6 px-6 lg:-mx-8 lg:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex gap-2 overflow-x-auto py-2">
              {['Service Rates', 'About', 'Working Images', 'Location', 'Reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-6 py-2 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab
                    ? 'bg-[#037166] text-white shadow-lg shadow-[#037166]/20'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'Service Rates' && (
            <motion.div
              key="Service Rates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="mb-6 w-full px-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5">Our Services & Rate Cards</h2>
                <p className="text-gray-500 text-sm sm:text-base">Choose from our professional repair packages</p>
              </div>

              {/* Service Cards */}
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 w-full">
                  {Array.from({ length: 4 }).map((_, i) => <ShimmerServiceCard key={i} />)}
                </div>
              ) : services && services.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 w-full">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.id || index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleSelectPackage(service.id)}
                      className={`relative bg-white border-2 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${selectedPackages.includes(service.id)
                        ? 'border-[#037166] shadow-xl shadow-[#037166]/10'
                        : 'border-gray-100 hover:border-[#037166]/20'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row h-full">
                        {/* Service Image */}
                        {service.image && (
                          <div className="relative w-full sm:w-44 h-44 sm:h-auto sm:self-stretch overflow-hidden bg-white">
                            <img
                              src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.image}`}
                              alt={service.name}
                              className="w-full h-full object-cover"
                            />
                            {/* Rating Badge */}
                            {service.rating && (
                              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-white shadow-sm border border-gray-100 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-[#037166] text-[#037166]" />
                                <span className="text-gray-900 font-bold text-[10px]">{service.rating}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                          <div className="flex-1 mb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                {selectedPackages.includes(service.id) && (
                                  <div className="inline-flex items-center gap-1.5 text-[#037166] mb-1">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Selected</span>
                                  </div>
                                )}
                                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1 leading-snug">{service.name}</h4>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <span className="text-xl sm:text-2xl font-bold text-[#037166]">₹{service.price}</span>
                                {service.priceUnit && (
                                  <span className="text-gray-400 text-[10px] ml-1">/{service.priceUnit}</span>
                                )}
                              </div>
                            </div>

                            <div
                              className="text-gray-500 text-xs font-medium line-clamp-2 max-w-2xl leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(service.description) }}
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-50 pt-4">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-5">
                              {service.totalOrders > 0 && (
                                <div className="flex items-center gap-2.5">
                                  <div className="flex items-center gap-1 text-gray-500 text-xs whitespace-nowrap">
                                    <CheckCheck className="w-4 h-4 text-[#037166]" />
                                    <span>{service.totalOrders} orders</span>
                                  </div>
                                </div>
                              )}
                              {service.duration && service.duration !== 'N/A' && (
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                  <Clock className="w-4 h-4 text-[#037166]" />
                                  <span>{service.duration}</span>
                                </div>
                              )}
                              {service.subcategoryName && (
                                <div className="px-3 py-1 rounded-full bg-[#037166]/10 border border-[#037166]/20">
                                  <span className="text-[#037166] text-[10px] font-bold uppercase tracking-wider">{service.subcategoryName}</span>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(service);
                              }}
                              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#037166] text-white font-bold text-sm whitespace-nowrap hover:bg-[#04a99d] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                            >
                              Book Now
                              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">No services available at this center yet.</p>
                </div>
              )}

              {/* Action Buttons */}
              {services && services.length > 0 && (
                <div className="flex justify-center sm:justify-start gap-4 w-full mb-8">
                  <button
                    onClick={handleContinueBooking}
                    disabled={loading || selectedPackages.length === 0}
                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-gray-900 text-white font-bold hover:shadow-xl transition-all text-center flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Continue Booking (${selectedPackages.length})`}
                    {!loading && <ArrowLeft className="w-4 h-4 rotate-180" />}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'About' && (
            <motion.div
              key="About"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About {center.business_name}</h2>
              <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-8 shadow-sm">
                <div
                  className="text-gray-600 text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(aboutBio) }}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#037166]/30 transition-all shadow-sm">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#037166]/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#037166]" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Expert Technicians</h4>
                  </div>
                  <p className="text-gray-500 font-medium">Certified professionals with years of experience</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#037166]/30 transition-all shadow-sm">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#037166]/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-[#037166]" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 leading-tight">Service Warranty</h4>
                  </div>
                  <p className="text-gray-500 font-medium">All repairs backed by our guarantee</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#037166]/30 transition-all shadow-sm">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#037166]/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-[#037166]" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Same-Day Service</h4>
                  </div>
                  <p className="text-gray-500 font-medium">Fast turnaround for urgent repairs</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Working Images' && (
            <motion.div
              key="Working Images"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Work</h2>
              <p className="text-gray-500 mb-8">See examples of our repair and service projects</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {portfolioImages.length > 0 ? (
                  portfolioImages.map((image, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => setLightboxIndex(index)}
                      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm"
                    >
                      <img src={image} alt={`Work ${index + 1}`} className="w-full h-full object-cover" />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    No working images available
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'Location' && (
            <motion.div
              key="Location"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Our Location</h2>
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg mb-12">
                <div className="relative h-[500px] bg-gray-50">
                  {isMapsLoaded && locationData ? (
                    <GoogleMap
                      mapContainerStyle={MAP_CONTAINER_STYLE}
                      center={{ lat: parseFloat(locationData.latitude), lng: parseFloat(locationData.longitude) }}
                      zoom={15}
                      options={MAP_OPTIONS}
                    >
                      <Marker position={{ lat: parseFloat(locationData.latitude), lng: parseFloat(locationData.longitude) }} icon={CENTER_LOGO} />
                      {location && <Marker position={{ lat: location.lat, lng: location.lng }} icon={GREEN_DOT} />}
                    </GoogleMap>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Reviews' && (
            <motion.div
              key="Reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
              <div className="space-y-4">
                {reviews.slice(0, reviewsToShow).map((review, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                        {review.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-gray-900">{review.name}</h5>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-4 h-4 ${j < Math.floor(review.rating) ? 'fill-[#037166] text-[#037166]' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm font-medium">{review.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddonsPopup && addonsData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddonsPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Add Related Services</h2>
                <button onClick={() => setShowAddonsPopup(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                {addonsData.addons.map((addon) => (
                  <div
                    key={addon._id}
                    onClick={() => toggleAddonSelection(addon._id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddons.includes(addon._id) ? 'bg-[#037166]/5 border-[#037166]' : 'bg-white border-gray-100'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${selectedAddons.includes(addon._id) ? 'bg-[#037166] border-[#037166]' : 'border-gray-200'}`}>
                        {selectedAddons.includes(addon._id) && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-gray-900 font-bold">{addon.childServiceName}</h4>
                        <div className="text-gray-500 text-xs" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(addon.description) }} />
                        <span className="text-[#037166] font-bold">₹{addon.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={handleSkipAddons} className="flex-1 py-3 rounded-full bg-gray-50 text-gray-400 font-bold">Skip</button>
                <button onClick={handleContinueWithAddons} className="flex-1 py-3 rounded-full bg-[#037166] text-white font-bold">Add Selected</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPackages.length > 0 && activeTab === 'Service Rates' && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[60] p-4 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl"
          >
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
              <div>
                <span className="text-gray-900 font-bold text-lg">{selectedPackages.length} Selected</span>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total: ₹{services.filter(s => selectedPackages.includes(s.id)).reduce((acc, curr) => acc + curr.price, 0)}</p>
              </div>
              <button onClick={handleContinueBooking} className="px-8 py-3 rounded-full bg-gray-900 text-white font-bold transition-all flex items-center gap-2">
                Continue Booking <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.02) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </motion.div>
  );
}
