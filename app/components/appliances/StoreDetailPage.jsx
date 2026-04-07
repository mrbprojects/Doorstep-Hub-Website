'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
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
  ThumbsUp, CheckCheck, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useLocationContext } from '@/context/LocationContext';

export function StoreDetailPage({ storeId, serviceId, onBack }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('services');
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
  const { location } = useLocationContext();

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
              const matched = centersData.nearByServiceCenters.find(c =>
                c.slug === storeId || c._id === storeId
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
    <div className="h-80 rounded-2xl bg-[#1a1a1a] border border-white/10 overflow-hidden relative">
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="h-48 bg-gray-800" />
      <div className="p-6 space-y-3">
        <div className="h-6 w-3/4 bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-700/50 rounded animate-pulse" />
        <div className="h-10 w-full bg-gray-700 rounded-lg animate-pulse" />
      </div>
    </div>
  );

  const ShimmerCenterCard = () => (
    <div className="h-48 rounded-2xl bg-[#1a1a1a] border border-white/10 overflow-hidden relative">
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="flex">
        <div className="w-64 h-48 bg-gray-800" />
        <div className="flex-1 p-6 space-y-4">
          <div className="h-8 w-1/2 bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-700/50 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (!loading && !centerData) {
    return <div className="min-h-screen bg-[#0a0a0a]" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-20 bg-gradient-to-b from-[#0a0a0a] via-[#0f1614] to-[#0a0a0a]"
    >
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
          className="inline-flex items-center gap-2 px-4 py-2 mb-4 sm:mb-8 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/80 hover:bg-white/10 hover:border-[#037166]/50 transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Hero Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative  h-[320px] xs:h-[350px] md:h-[400px] lg:h-[500px] rounded-3xl overflow-hidden mb-8 shadow-2xl"
        >
          {bannerImage ? (
            <img
              src={bannerImage}
              alt="Service Center Banner"
              className="w-full  object-fit"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] flex items-center justify-center">
              <Sparkles className="w-20 h-20 text-[#037166]/20" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Store Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 sm:p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-1.5 md:mb-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                  {center.business_name || `${center.firstName || ''} ${center.lastName || ''}`}
                </h1>

                {/* App Links beside heading */}
                <div className="flex items-center gap-3">
                  <a
                    href={globalSettings?.customerAndroidAppLink || "https://play.google.com/store/apps/details?id=com.doorstephub.customer"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-28 md:w-32 h-8 md:h-10 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-lg shadow-[#037166]/20 hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 overflow-hidden border border-white/10"
                    title="Get it on Google Play"
                  >
                    <img src="/andriod1.png" alt="Google Play" className="h-full w-full object-contain p-1.5 brightness-0 invert" />
                  </a>
                  <a
                    href={globalSettings?.customerIosAppLink || "https://apps.apple.com/in/app/doorstep-hub/id6475340236"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-28 md:w-32 h-8 md:h-10 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-lg shadow-[#037166]/20 hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 overflow-hidden border border-white/10"
                    title="Download on the App Store"
                  >
                    <img src="/apple2.png" alt="App Store" className="h-full w-full object-contain p-1.5 brightness-0 invert" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:grid md:grid-cols-2 lg:flex lg:flex-row lg:items-center lg:gap-6 mb-3 md:mb-4">
                <div className="flex items-start gap-1.5 md:gap-2">
                  <MapPin className="w-4 h-4 text-[#037166] flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-xs sm:text-sm line-clamp-1">{center.address}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-[#037166] text-[#037166]" />
                    <span className="text-white font-semibold text-xs sm:text-sm">{(center.avgRating || center.rating)?.toFixed(1) || '4.5'}</span>
                    <span className="text-white/50 text-[10px] sm:text-xs">({center.totalRatings || center.reviews?.length || 0})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#037166]/20">
                      <CheckCheck className="w-2.5 h-2.5 text-[#037166]" />
                    </div>
                    <span className="text-white/80 text-xs sm:text-sm">{center.totalOrders || 0}+ Jobs Done</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#037166]" />
                  <span className="text-white/80 text-[10px] sm:text-xs">Express Service</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sticky Tab Navigation */}
        <div className="sticky top-20 z-40 mb-8 bg-[#0a0a0a]/80 backdrop-blur-xl border-y border-white/5 -mx-6 px-6 lg:-mx-8 lg:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex gap-2 overflow-x-auto py-1">
              {['services', 'about', 'Working Images', 'location', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-6 py-4 text-sm font-medium capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'text-[#037166]' : 'text-white/60 hover:text-white/80'
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeStoreTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#037166] to-[#04a99d]"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="mb-6 w-full px-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">Our Services & Rate Cards</h2>
                <p className="text-white/60 text-sm sm:text-base">Choose from our professional repair packages</p>
              </div>

              {/* Service Cards - Using API data */}
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 w-full">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl bg-[#1a1a1a] border border-white/10 overflow-hidden relative">
                      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      <div className="flex flex-col sm:flex-row h-full">
                        <div className="w-full sm:w-32 bg-gray-800" />
                        <div className="flex-1 p-4 space-y-3">
                          <div className="h-4 w-3/4 bg-gray-700 rounded animate-pulse" />
                          <div className="h-2 w-full bg-gray-700/50 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
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
                      className={`relative bg-white/5 backdrop-blur-sm border-2 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${selectedPackages.includes(service.id)
                        ? 'border-[#037166] shadow-xl shadow-[#037166]/20'
                        : 'border-white/10 hover:border-white/20'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row h-full">
                        {/* Service Image */}
                        {service.image && (
                          <div className="relative w-full sm:w-32 h-32 sm:h-auto overflow-hidden">
                            <img
                              src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.image}`}
                              alt={service.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                            {/* Rating Badge */}
                            {service.rating && (
                              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-white font-semibold text-xs">{service.rating}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                          <div className="flex-1 mb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                {/* Selection Indicator */}
                                {selectedPackages.includes(service.id) && (
                                  <div className="inline-flex items-center gap-1.5 text-[#037166] mb-1">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Selected</span>
                                  </div>
                                )}
                                <h4 className="text-base sm:text-lg font-bold text-white mb-1 leading-snug">{service.name}</h4>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <span className="text-xl sm:text-2xl font-bold text-[#037166]">₹{service.price}</span>
                                {service.priceUnit && (
                                  <span className="text-white/40 text-[10px] ml-1">/{service.priceUnit}</span>
                                )}
                              </div>
                            </div>

                            {/* Service Description */}
                            <p className="text-white/60 text-xs line-clamp-2 max-w-2xl">{service.description}</p>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/5 pt-4">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-5">
                              {service.totalOrders > 0 && (
                                <div className="flex items-center gap-2.5">
                                  <div className="flex items-center gap-1 text-white/60 text-xs whitespace-nowrap">
                                    <CheckCheck className="w-4 h-4 text-[#037166]" />
                                    <span>{service.totalOrders} orders</span>
                                  </div>

                                  {service.bannerImages?.length > 0 && (
                                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide max-w-[120px] py-1">
                                      {service.bannerImages.map((img, idx) => (
                                        <div key={idx} className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0 border border-white/10 ring-1 ring-white/5 shadow-sm">
                                          <img
                                            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img}`}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                              {service.duration && service.duration !== 'N/A' && (
                                <div className="flex items-center gap-1.5 text-white/60 text-sm">
                                  <Clock className="w-4 h-4 text-[#037166]" />
                                  <span>{service.duration}</span>
                                </div>
                              )}
                              {service.subcategoryName && (
                                <div className="px-3 py-1 rounded-full bg-[#037166]/20 border border-[#037166]/30">
                                  <span className="text-[#037166] text-[10px] font-bold uppercase tracking-wider">{service.subcategoryName}</span>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(service);
                              }}
                              className="w-full sm:w-auto px-6 py-3 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold text-sm hover:shadow-xl hover:shadow-[#037166]/30 transition-all flex items-center justify-center gap-2"
                            >
                              Book Now
                              <ArrowLeft className="w-3 h-3 rotate-180" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-white/60 text-lg mb-4">No services available at this center yet.</p>
                  <p className="text-white/40 text-sm">Please check back later or contact the service center directly.</p>
                </div>
              )}

              {/* Action Buttons */}
              {services && services.length > 0 && (
                <div className="flex justify-center sm:justify-start gap-4 w-full mb-8">
                  <button
                    onClick={handleContinueBooking}
                    disabled={loading || selectedPackages.length === 0}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold hover:shadow-xl hover:shadow-[#037166]/30 transition-all text-center flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Continue Booking (${selectedPackages.length})`}
                    {!loading && <ArrowLeft className="w-4 h-4 rotate-180" />}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">About {center.business_name}</h2>

              {/* Description */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
                <p className="text-white/70 text-lg leading-relaxed">
                  {aboutBio}
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#037166]/50 transition-all">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] flex-shrink-0 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-white">Expert Technicians</h4>
                  </div>
                  <p className="text-white/60">Certified professionals with years of experience</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#037166]/50 transition-all">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] flex-shrink-0 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-white leading-tight">30 - 90 Days Service Warranty On Repairs</h4>
                  </div>
                  <p className="text-white/60">All repairs backed by our guarantee</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#037166]/50 transition-all">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] flex-shrink-0 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-white">Same-Day Service</h4>
                  </div>
                  <p className="text-white/60">Fast turnaround for urgent repairs</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#037166]/20 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[#037166]" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50 mb-1">Address</p>
                      <p className="text-lg font-semibold text-white">{center.address}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#037166]/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-[#037166]" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50 mb-1">Last Updated</p>
                      <p className="text-lg font-semibold text-white">{center.updateTime || 'Recently'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* WORKING IMAGES TAB */}
          {activeTab === 'Working Images' && (
            <motion.div
              key="Working Images"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-white mb-2">Our Work</h2>
              <p className="text-white/60 mb-8 text-lg">See examples of our repair and service projects</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {portfolioImages && portfolioImages.length > 0 ? (
                  portfolioImages.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => setLightboxIndex(index)}
                      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-white/60">
                    No working images available
                  </div>
                )}
              </div>

              {/* Lightbox with navigation */}
              <AnimatePresence>
                {lightboxIndex !== null && portfolioImages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setLightboxIndex(null)}
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
                  >
                    {/* Close */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
                      className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all z-[120]"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>

                    {/* Counter */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium z-[120]">
                      {lightboxIndex + 1} / {portfolioImages.length}
                    </div>

                    {/* Prev Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + portfolioImages.length) % portfolioImages.length); }}
                      className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all z-[120]"
                    >
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % portfolioImages.length); }}
                      className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all z-[120]"
                    >
                      <ArrowLeft className="w-5 h-5 text-white rotate-180" />
                    </button>

                    {/* Image */}
                    <motion.img
                      key={lightboxIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      src={portfolioImages[lightboxIndex]}
                      alt={`Portfolio ${lightboxIndex + 1}`}
                      className="max-w-[calc(100%-120px)] max-h-[85vh] rounded-2xl shadow-2xl object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Thumbnail strip */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-4 overflow-x-auto max-w-[90vw]">
                      {portfolioImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                          className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === lightboxIndex ? 'border-[#037166] scale-110' : 'border-white/20 opacity-50 hover:opacity-80'
                            }`}
                        >
                          <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* LOCATION TAB */}
          {activeTab === 'location' && (
            <motion.div
              key="location"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-white mb-2">Our Location</h2>
              <p className="text-white/60 mb-8 text-lg">Visit us at our service center</p>

              {/* Map */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden mb-8">
                <div className="relative h-[500px] bg-gray-900">
                  {locationData && (
                    <iframe
                      src={`https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="Store Location"
                    />
                  )}
                </div>
              </div>

              {/* Address Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#037166]/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[#037166]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2 text-lg">Address</h4>
                      <p className="text-white/60 leading-relaxed">
                        {locationData?.address || center.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#037166]/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-[#037166]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2 text-lg">Get Directions</h4>
                      <p className="text-white/60 leading-relaxed mb-3">
                        Professional service available in {locationData?.cityName || centerData?.cityName || 'your area'}.
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${locationData?.latitude},${locationData?.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#037166] font-semibold hover:text-[#04a99d] transition-colors"
                      >
                        Open in Maps
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Customer Reviews</h2>
                  <p className="text-white/60 text-lg">What our customers say about us</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-6 h-6 fill-[#037166] text-[#037166]" />
                    <span className="text-3xl font-bold text-white">{center.avgRating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <p className="text-sm text-white/50">Based on {center.totalRatings || 0} reviews</p>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6 mb-8">
                {reviews.slice(0, reviewsToShow).map((review, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {review.name?.charAt(0) || 'U'}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold text-white text-lg">{review.name}</h5>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${i < Math.floor(review.rating)
                                  ? 'fill-[#037166] text-[#037166]'
                                  : 'text-white/20'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-white/70 leading-relaxed">{review.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {reviews.length > reviewsToShow && (
                <div className="text-center">
                  <button
                    onClick={() => setReviewsToShow(prev => prev + 3)}
                    className="px-8 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-[#037166]/50 transition-all"
                  >
                    Load More Reviews
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Addons Popup */}
      <AnimatePresence>
        {showAddonsPopup && addonsData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddonsPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f1614] border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add Related Services</h2>
                <button
                  onClick={() => setShowAddonsPopup(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Parent Service (Auto-selected) */}
              <div className="mb-6">
                <p className="text-white/60 text-sm mb-3">Selected Service:</p>
                <div className="bg-white/5 border border-[#037166]/30 rounded-2xl p-4 flex items-center gap-4">
                  {addonsData.parentServiceImage && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${addonsData.parentServiceImage}`}
                      alt={addonsData.parentServiceName}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{addonsData.parentServiceName}</h3>
                    <p className="text-[#037166] font-bold">₹{addonsData.parentServicePrice.toFixed(2)}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#037166] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Addons List */}
              {addonsData.addons && addonsData.addons.length > 0 && (
                <div className="mb-6">
                  <p className="text-white/60 text-sm mb-3">
                    Additional Services ({addonsData.addons.length} available):
                  </p>
                  <div className="space-y-3">
                    {addonsData.addons.map((addon) => (
                      <div
                        key={addon._id}
                        onClick={() => toggleAddonSelection(addon._id)}
                        className={`bg-white/5 border-2 rounded-2xl p-4 cursor-pointer transition-all hover:bg-white/10 ${selectedAddons.includes(addon._id)
                          ? 'border-[#037166] shadow-lg shadow-[#037166]/20'
                          : 'border-white/10'
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <div
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${selectedAddons.includes(addon._id)
                              ? 'bg-[#037166] border-[#037166]'
                              : 'border-white/30'
                              }`}
                          >
                            {selectedAddons.includes(addon._id) && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>

                          {/* Addon Info */}
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">{addon.childServiceName}</h4>
                            {addon.description && (
                              <p className="text-white/60 text-sm mb-2">{addon.description}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-[#037166] font-bold">₹{addon.price.toFixed(2)}</span>
                              <span className="text-white/40 text-sm">/ {addon.priceUnit}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Price */}
              <div className="bg-white/5 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Total Price:</span>
                  <span className="text-2xl font-bold text-[#037166]">
                    ₹
                    {(
                      addonsData.parentServicePrice +
                      (addonsData.addons
                        ?.filter((addon) => selectedAddons.includes(addon._id))
                        .reduce((sum, addon) => sum + addon.price, 0) || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <p className="text-white/40 text-sm mt-2">
                  {1 + selectedAddons.length} item{selectedAddons.length !== 0 ? 's' : ''} selected
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleSkipAddons}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all"
                >
                  Skip Addons
                </button>
                <button
                  onClick={handleContinueWithAddons}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-semibold hover:shadow-xl hover:shadow-[#037166]/30 transition-all"
                >
                  Continue ({1 + selectedAddons.length} item{selectedAddons.length !== 0 ? 's' : ''})
                </button>
              </div>

              {/* Loading Overlay */}
              {loadingAddons && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-[#037166] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sticky Bottom Bar */}
      <AnimatePresence>
        {selectedPackages.length > 0 && activeTab === 'services' && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[60] p-4 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/10"
          >
            <div className="max-w-[1400px] w-full mx-auto flex flex-row items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-white font-bold text-base sm:text-lg">{selectedPackages.length} Service{selectedPackages.length > 1 ? 's' : ''} Selected</span>
                <span className="text-white/60 text-xs sm:text-sm">
                  Total: ₹{services.filter(s => selectedPackages.includes(s.id)).reduce((acc, curr) => acc + curr.price, 0)}
                </span>
              </div>
              <button
                onClick={handleContinueBooking}
                disabled={loading}
                className="px-6 py-3 sm:px-10 sm:py-4 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold text-sm sm:text-lg shadow-xl shadow-[#037166]/20 hover:shadow-[#037166]/40 transition-all flex items-center justify-center gap-2 sm:gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue Booking'}
                {!loading && <ArrowLeft className="w-4 h-4 rotate-180" />}
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
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </motion.div>
  );
}
