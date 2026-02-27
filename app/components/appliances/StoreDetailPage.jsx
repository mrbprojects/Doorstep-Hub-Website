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
  ThumbsUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';

export function StoreDetailPage({ storeId, serviceId }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('services');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [reviewsToShow, setReviewsToShow] = useState(3);
  const [selectedPackages, setSelectedPackages] = useState([]);

  // API data state
  const [loading, setLoading] = useState(true);
  const [centerData, setCenterData] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [bannerImage, setBannerImage] = useState('');
  const [aboutBio, setAboutBio] = useState('');
  const [locationData, setLocationData] = useState(null);

  // Addons popup state
  const [showAddonsPopup, setShowAddonsPopup] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [addonsData, setAddonsData] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [loadingAddons, setLoadingAddons] = useState(false);

  // Get service cart functions from context
  const { addToCart: addToServiceCart, clearCart } = useServiceCart();

  // Fetch service center details from API
  useEffect(() => {
    const fetchCenterDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/service_center_services/${storeId}`,
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
          setCenterData(data.serviceCenter);

          // Set services
          setServices(data.services || []);

          // Set reviews
          setReviews(data.reviews || []);

          // Set portfolio images
          const portfolioUrls = data.portfolio?.images?.map((img) =>
            `https://api.doorstephub.com${img}`
          ) || [];
          setPortfolioImages(portfolioUrls);

          // Set banner image
          if (data.banner_image) {
            setBannerImage(`https://api.doorstephub.com/${data.banner_image}`);
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
  }, [storeId]);

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
        'https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/service-addons',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceIds: [serviceId],
            providerId: storeId
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
        storeId,        // providerId
        service.id,     // itemId (using id from old API)
        'service',      // itemType
        1               // quantity
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
            storeId,        // providerId
            addon._id,      // itemId (addons use _id)
            'addon',        // itemType
            1,              // quantity
            service.id      // parentServiceId (using id from old API)
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-20 bg-gradient-to-b from-[#0a0a0a] via-[#0f1614] to-[#0a0a0a]"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/80 hover:bg-white/10 hover:border-[#037166]/50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Hero Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[500px] rounded-3xl overflow-hidden mb-8 shadow-2xl"
        >
          {bannerImage ? (
            <img
              src={bannerImage}
              alt="Service Center Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] flex items-center justify-center">
              <Sparkles className="w-20 h-20 text-[#037166]/20" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Store Info Overlay */}
          <div className="absolute bottom-8 left-8 right-8">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h1 className="text-4xl font-bold text-white mb-3">
                {center.firstName} {center.lastName}
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#037166]" />
                  <span className="text-white/80">{center.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-[#037166] text-[#037166]" />
                    <span className="text-white font-semibold">{center.avgRating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <span className="text-white/60">({center.totalRatings || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#037166]" />
                  <span className="text-white/80">{center.totalOrders || 0}+ Jobs Done</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-semibold">
                  Starting from ₹{center.BasePrice || center.serviceBookingCost || 0}
                </div> */}
                <div className="flex gap-2">
                  <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#037166]" />
                    <span className="text-white/80 text-sm">Express Service</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sticky Tab Navigation */}
        <div className="sticky top-20 z-40 mb-8 bg-[#0a0a0a]/80 backdrop-blur-xl border-y border-white/5 -mx-6 px-6 lg:-mx-8 lg:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex gap-2 overflow-x-auto py-1">
              {['services', 'about', 'portfolio', 'location', 'reviews'].map((tab) => (
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
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Available Services</h2>
                <p className="text-white/60 text-lg">Choose from our professional repair packages</p>
              </div>

              {/* Service Cards - Using API data */}
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-96 rounded-3xl bg-[#1a1a1a] border border-white/10 overflow-hidden relative">
                      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      <div className="h-48 bg-gray-800" />
                      <div className="p-6 space-y-4">
                        <div className="h-6 w-3/4 bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 w-full bg-gray-700/50 rounded animate-pulse" />
                        <div className="h-8 w-24 bg-gray-700 rounded-lg animate-pulse" />
                        <div className="h-12 w-full bg-gray-700 rounded-xl animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : services && services.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.id || index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleSelectPackage(service.id)}
                      className={`relative bg-white/5 backdrop-blur-sm border-2 rounded-3xl overflow-hidden cursor-pointer transition-all hover:scale-105 ${selectedPackages.includes(service.id)
                        ? 'border-[#037166] shadow-xl shadow-[#037166]/20'
                        : 'border-white/10 hover:border-white/20'
                        }`}
                    >
                      {/* Service Image */}
                      {service.image && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={`https://api.doorstephub.com/${service.image}`}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                          {/* Rating Badge */}
                          {service.rating && (
                            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-white font-semibold text-sm">{service.rating}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-6">
                        {/* Selection Indicator */}
                        {selectedPackages.includes(service.id) && (
                          <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#037166] flex items-center justify-center z-10">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}

                        {/* Service Name */}
                        <h4 className="text-xl font-bold text-white mb-2">{service.name}</h4>

                        {/* Service Description */}
                        <p className="text-white/60 text-sm mb-4 line-clamp-2">{service.description}</p>

                        {/* Price and Stats */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-[#037166]">₹{service.price}</span>
                            {service.priceUnit && (
                              <span className="text-white/40 text-xs">/{service.priceUnit}</span>
                            )}
                          </div>
                          {service.totalOrders > 0 && (
                            <div className="flex items-center gap-1 text-white/60 text-sm">
                              <Users className="w-4 h-4" />
                              <span>{service.totalOrders} orders</span>
                            </div>
                          )}
                        </div>

                        {/* Duration */}
                        {service.duration && service.duration !== 'N/A' && (
                          <div className="flex items-center gap-2 text-white/60 mb-4">
                            <Clock className="w-4 h-4 text-[#037166]" />
                            <span className="text-sm">{service.duration}</span>
                          </div>
                        )}

                        {/* Subcategory Badge */}
                        {service.subcategoryName && (
                          <div className="inline-block px-3 py-1 rounded-full bg-[#037166]/20 border border-[#037166]/30 mb-4">
                            <h6 className="text-[#037166] text-xs font-semibold">{service.subcategoryName}</h6>
                          </div>
                        )}

                        {/* CTA Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(service);
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-semibold hover:shadow-xl hover:shadow-[#037166]/30 transition-all"
                        >
                          Book Now
                        </button>
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
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      localStorage.setItem('service_cart_flow', 'true');
                      router.push('/appliances/address');
                    }}
                    className="px-8 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-[#037166]/50 transition-all"
                  >
                    Proceed to Address ({selectedPackages.length})
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
              <h2 className="text-3xl font-bold text-white mb-6">About {center.firstName} {center.lastName}</h2>

              {/* Description */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
                <p className="text-white/70 text-lg leading-relaxed">
                  {aboutBio}
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#037166]/50 transition-all">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Expert Technicians</h4>
                  <p className="text-white/60">Certified professionals with years of experience</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#037166]/50 transition-all">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] flex items-center justify-center mb-4">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">90-Day Warranty</h4>
                  <p className="text-white/60">All repairs backed by our guarantee</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#037166]/50 transition-all">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] flex items-center justify-center mb-4">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Same-Day Service</h4>
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

          {/* PORTFOLIO TAB */}
          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-white mb-2">Our Work</h2>
              <p className="text-white/60 mb-8 text-lg">See examples of our repair and service projects</p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioImages && portfolioImages.length > 0 ? (
                  portfolioImages.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setLightboxImage(image)}
                      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-white/60">
                    No portfolio images available
                  </div>
                )}
              </div>

              {/* Lightbox */}
              <AnimatePresence>
                {lightboxImage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setLightboxImage(null)}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                  >
                    <button
                      onClick={() => setLightboxImage(null)}
                      className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                    <motion.img
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      src={lightboxImage}
                      alt="Portfolio"
                      className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    />
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
                      src={`https://api.doorstephub.com/${addonsData.parentServiceImage}`}
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