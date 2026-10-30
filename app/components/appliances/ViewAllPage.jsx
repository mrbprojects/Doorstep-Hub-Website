import React, { useState, useEffect } from 'react';
import { RatingFilter } from './RatingFilter';
import { motion, AnimatePresence } from 'motion/react';
import DOMPurify from 'dompurify';
import { ArrowLeft, Star, MapPin, Zap, ArrowRight, Filter, X } from 'lucide-react';
import { fetchFeaturedServices, imageLoader } from '@/lib/api';
import { useLocation } from '@/hooks/useLocation';
import { useGlobalSettings } from '@/context/GlobalSettingsContext';
import { ApplianceHowItWorks } from '@/components/appliances/ApplianceHowItWorks';
import { ApplianceComparison } from '@/components/appliances/ApplianceComparison';
import { PaymentMethodsSection } from '@/components/appliances/PaymentMethodsSection';

const DEFAULT_APP_LINKS = {
  ios: 'https://apps.apple.com/in/app/doorstep-hub/id6475340236',
  android:
    'https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share',
};

export function ViewAllPage({
  type,
  onBack,
  onServiceClick,
  onStoreClick,
  onCategoryClick,
  enableRatingFilter = false,
}) {
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [recentServices, setRecentServices] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const { location, detectLocation } = useLocation();
  const { globalSettings } = useGlobalSettings() || {};

  const handleRatingSelect = (rating) => {
    setSelectedRating(rating === selectedRating ? null : rating);
  };

  const ShimmerGrid = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="group">
            <div className="relative h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-shimmer" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
              <div className="absolute inset-0 flex items-end p-8">
                <div className="h-8 w-48 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded animate-shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (type === 'categories') {
      const fetchCategories = async () => {
        try {
          if (!location) {
            setIsLoading(false);
            return;
          }

          const body = {
            lattitude: location.lat,
            longitude: location.lng,
          };

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getallcategorys`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(body),
            }
          );

          if (!response.ok) throw new Error('Failed to fetch categories');
          const result = await response.json();

          if (result.success && result.data) {
            setCategories(result.data.map(item => ({
              ...item,
              title: item.name,
              image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${item.image}`
            })));
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCategories();
    } else if (type === 'stores') {
      const fetchStores = async () => {
        try {
          setIsLoading(true);

          if (!location) {
            setIsLoading(false);
            return;
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/nearest_service_centers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lattitude: location.lat,
              longitude: location.lng,
            }),
          });

          if (!response.ok) throw new Error('Failed to fetch stores');
          const result = await response.json();

          if (result.success && result.nearestServiceCenters) {
            setStores(result.nearestServiceCenters.map(item => ({
              id: item._id,
              slug: item.slug,
              name: item.name || `${item.firstName} ${item.lastName}`,
              address: item.address || item.cityName || 'Location not specified',
              rating: item.rating || 4.5,
              image: item.image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${item.image}` : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
              reviews: item.reviews || 'New'
            })));
          }
        } catch (error) {
          console.error('Error fetching stores:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStores();
    } else if (type === 'featured') {
      const loadFeatured = async () => {
        try {
          setIsLoading(true);
          const data = await fetchFeaturedServices();
          setFeaturedServices(data);
        } catch (error) {
          console.error('Error fetching featured services:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadFeatured();
    } else if (type === 'recent') {
      const fetchRecentServices = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/latest_bookings_services`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) throw new Error('Failed to fetch recent services');
          const data = await response.json();
          if (data.success && data.services) {
            setRecentServices(data.services.map(service => ({
              id: service._id,
              image: service.mainImage ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.mainImage}` : 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400',
              title: service.serviceName,
              description: `${service.categoryName} - ${service.subcategoryName}`,
              price: service.serviceBookingCost || 999,
              bookings: Math.floor(Math.random() * 200) + 50,
              categoryName: service.categoryName,
              subcategoryName: service.subcategoryName,
              slug: service.slug,
            })));
          }
        } catch (error) {
          console.error('Error fetching recent services:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRecentServices();
    } else {
      setIsLoading(false);
    }
  }, [type, location]);

  const getTitle = () => {
    switch (type) {
      case 'featured':
        return 'All Featured Services';
      case 'stores':
        return 'Nearest Appliance Service Centers';
      case 'categories':
        return 'Book Trusted Appliance Repair Services at Your Doorstep';
      case 'recent':
        return 'Recently Booked Services';
      default:
        return 'Book Trusted Appliance Repair Services at Your Doorstep';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'categories':
        return 'Discover certified doorstep repair services for all major home and kitchen appliances. From ACs and refrigerators to washing machines and TVs, book expert technicians with genuine parts and warranty in minutes.';
      case 'featured':
        return 'Browse our most popular and highest-rated doorstep appliance repair solutions with verified professionals, upfront pricing, and comprehensive warranty support.';
      case 'stores':
        return 'Find authorized and certified appliance service centers near you for swift doorstep diagnostics, maintenance, and genuine replacement parts.';
      case 'recent':
        return 'Explore recently booked repair services trusted by homeowners in your city for quick turnaround and reliable doorstep repairs.';
      default:
        return 'Book expert doorstep repair and maintenance services for home appliances with certified professionals and guaranteed warranty.';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0a0a0a] text-white"
    >
      {/* Header with Background Image & Gradient */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 border-b border-white/10">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: "url('/categories-hero-bg.jpg')" }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-[#025a51]/80 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/25 hover:border-white/40 text-white text-xs sm:text-sm font-bold shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (Title, Description, Highlights) */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/30 text-white text-[11px] sm:text-xs font-black tracking-widest uppercase mb-3 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>DOORSTEP HUB · VERIFIED SERVICES</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-3 sm:mb-4">
                {getTitle()}
              </h1>

              <p className="text-sm sm:text-base md:text-lg !text-white leading-relaxed font-normal max-w-2xl">
                {getDescription()}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-semibold text-white">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white">
                  <Zap className="w-3.5 h-3.5 text-white" /> Same Day Service
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 4.8/5 Customer Rating
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white">
                  🛡️ 30-90 Days Warranty
                </span>
              </div>
            </div>

            {/* Right Column: App Download Card with Dynamic Links */}
            <div className="lg:col-span-5 xl:col-span-4 flex justify-start lg:justify-end">
              <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 rounded-3xl shadow-2xl">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white mb-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Doorstep Hub App</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black !text-white leading-snug">
                  Experience Faster Bookings on Mobile
                </h3>
                <p className="text-xs sm:text-sm !text-white mt-1 mb-4 leading-relaxed">
                  Track service technicians in real-time, get instant updates & exclusive app offers.
                </p>

                {/* App Download Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={globalSettings?.playStore || globalSettings?.customerAndroidAppLink || DEFAULT_APP_LINKS.android}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-36 sm:w-40 items-center justify-center overflow-hidden rounded-full border border-[#9ecbc3] bg-[#DEF2EF] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 hover:scale-105 active:scale-95"
                    title="Get it on Google Play"
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src="/andriod1.png"
                      alt="Google Play"
                      className="h-full w-full object-cover opacity-95 brightness-0 invert"
                    />
                  </a>

                  <a
                    href={globalSettings?.appStore || globalSettings?.customerIosAppLink || DEFAULT_APP_LINKS.ios}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-36 sm:w-40 items-center justify-center overflow-hidden rounded-full border border-[#9ecbc3] bg-[#DEF2EF] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 hover:scale-105 active:scale-95"
                    title="Download on App Store"
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src="/apple2.png"
                      alt="App Store"
                      className="h-full w-full object-cover opacity-95 brightness-0 invert"
                    />
                  </a>
                </div>

                <div className="mt-3.5 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-white font-medium">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>4.8 / 5.0 Rating</span>
                  </span>
                  <span>50k+ Downloads</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
        {!location && !isLoading && (type === 'stores' || type === 'categories') ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] rounded-[2.5rem] border border-white/10 backdrop-blur-sm shadow-2xl">
            <div className="p-6 rounded-full bg-white/5 mb-6">
              <MapPin className="h-12 w-12 text-[#04a99d] animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Service Location Needed</h2>
            <p className="text-white/60 text-center max-w-md mb-8 px-6 leading-relaxed">
              We need your location to show verified service centers and categories available in your area.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => detectLocation()}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold shadow-[0_0_30px_rgba(3,113,102,0.3)] hover:shadow-[0_0_40px_rgba(3,113,102,0.5)] transition-all"
            >
              Detect Location Automatically
            </motion.button>
          </div>
        ) : (
          <div className="flex gap-8">
            {/* Sidebar Filter - Desktop */}
            {enableRatingFilter && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="hidden lg:block w-80 flex-shrink-0"
              >
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 sticky top-24">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#04a99d]" />
                    Filters
                  </h4>

                  {/* Rating Filter */}
                  <div className="mb-6">
                    <h6 className="block text-white/80 mb-3 text-sm font-medium">Minimum Rating</h6>
                    <div className="space-y-2">
                      {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRatingSelect(rating)}
                          className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedRating === rating
                            ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{rating}+ Stars</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={() => setSelectedRating(null)}
                    className="w-full mt-6 px-4 py-3 rounded-lg border border-white/20 text-white/80 hover:bg-white/5 transition-all text-sm font-medium"
                  >
                    Reset Filters
                  </button>
                </div>
              </motion.aside>
            )}

            {/* Mobile Filter Button */}
            {enableRatingFilter && (
              <button
                onClick={() => setFilterOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-50 px-6 py-3 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium shadow-2xl flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            )}

            {/* Main Content */}
            <div className="flex-1">
              {isLoading ? (
                <>
                  <ShimmerGrid />
                  <style jsx>{`
                      @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                      }
                      .animate-shimmer {
                        background-size: 200% 100%;
                        animation: shimmer 1.5s infinite;
                      }
                    `}</style>
                </>
              ) : (
                <div className={(type === 'featured' || type === 'categories') ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                  {type === 'categories' && categories
                    .map((category, index) => (
                      <motion.div
                        key={category._id || index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -8 }}
                        onClick={() => onCategoryClick?.(category)}
                        className="group cursor-pointer"
                      >
                        <div className="flex flex-col sm:flex-row gap-4 p-2.5 rounded-2xl bg-[#1a1a1a] border border-white/10 hover:border-[#037166]/50 shadow-lg hover:shadow-[#037166]/20 transition-all duration-300 overflow-hidden">
                          {/* Image Section */}
                          <div className="relative w-32 h-24 sm:w-40 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-[#0f1110]">
                            <img loading="lazy" decoding="async"
                              src={category.image}
                              alt={category.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 py-0.5 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex items-start justify-between mb-1 gap-2">
                                <h4 className="text-lg font-bold text-white group-hover:text-[#04a99d] transition-colors truncate">
                                  {category.title}
                                </h4>
                                <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded-lg border border-white/10 flex-shrink-0">
                                  <Star className="w-3 h-3 fill-[#04a99d] text-[#04a99d]" />
                                  <span className="text-white text-[10px] font-bold">{category.rating || '4.8'}</span>
                                </div>
                              </div>
                              <p className="text-white text-xs mb-2 line-clamp-1 italic font-medium">
                                {category.totalOrders || '1.2k+'} Successfully Completed
                              </p>
                              <p className="text-white/90 text-[11px] line-clamp-1 leading-tight">
                                {category.description || `Professional ${category.title} services by experts.`}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1.5 text-white/80 text-[9px]">
                                <Zap className="w-3 h-3 text-[#04a99d]" />
                                <span>Verified Services</span>
                              </div>
                              <button className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium hover:shadow-lg transition-all text-[11px] flex items-center gap-1">
                                Book
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  }

                  {type === 'featured' && featuredServices
                    .filter(s => !selectedRating || (s.rating || 4.8) >= selectedRating)
                    .map((service, index) => (
                      <motion.div
                        key={service._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 10 }}
                        onClick={() => onServiceClick?.(service._id, service.categoryName, service.subcategoryName, service.slug)}
                        className="group cursor-pointer"
                      >
                        <div className="flex flex-col sm:flex-row gap-4 p-2.5 rounded-2xl bg-[#1a1a1a] border border-white/10 hover:border-[#037166]/50 transition-all duration-300 h-full overflow-hidden">
                          <div className="relative w-32 h-24 sm:w-40 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-[#0f1110]">
                            <img loading="lazy" decoding="async"
                              src={imageLoader({ src: service.mainImage || service.image })}
                              alt={service.serviceName || 'Featured Service'}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400';
                              }}
                            />
                            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white text-[9px] font-bold flex items-center gap-1 shadow-lg">
                              <Zap className="w-2.5 h-2.5" />
                              {service.serviceDelhiveryType || 'Featured'}
                            </div>
                          </div>
                          <div className="flex-1 py-0.5 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex items-start justify-between mb-1 gap-2">
                                <h4 className="text-lg font-bold text-white group-hover:text-[#04a99d] transition-colors truncate">
                                  {service.serviceName}
                                </h4>
                                <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded-lg border border-white/10 flex-shrink-0">
                                  <Star className="w-3 h-3 fill-[#04a99d] text-[#04a99d]" />
                                  <span className="text-white font-bold text-[10px]">{service.rating || 4.8}</span>
                                </div>
                              </div>
                              <p className="text-white/50 text-xs mb-2 line-clamp-1 italic">
                                {service.totalOrders || '2.5k+'} Services Booked
                              </p>
                              <div 
                                className="text-white/40 text-[11px] line-clamp-1 leading-tight"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(service.description) }}
                              />
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                              <div className="flex flex-col">
                              </div>
                              <button className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium hover:shadow-lg transition-all text-[11px] flex items-center gap-1">
                                Book
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                  {type === 'stores' && stores
                    .filter(s => !selectedRating || s.rating >= selectedRating)
                    .map((store, index) => (
                      <motion.div
                        key={store.id || index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -8 }}
                        onClick={() => onStoreClick?.(store.slug || store.id)}
                        className="group cursor-pointer"
                      >
                        <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-[#1a1a1a] border border-white/10 h-full">
                          <div className="relative h-48 overflow-hidden">
                            <img loading="lazy" decoding="async"
                              src={store.image}
                              alt={store.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>
                          <div className="p-6">
                            <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#04a99d] transition-colors line-clamp-1">
                              {store.name}
                            </h4>
                            <p className="text-white/60 text-sm mb-4 flex items-center gap-2 line-clamp-1">
                              <MapPin className="w-4 h-4 text-[#04a99d]" />
                              {store.address}
                            </p>
                            <div className="flex items-center gap-1 mb-4">
                              <Star className="w-4 h-4 fill-[#04a99d] text-[#04a99d]" />
                              <span className="text-white font-medium">{store.rating}</span>
                              <span className="text-white/40">({store.reviews} reviews)</span>
                            </div>
                            <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium hover:shadow-lg hover:shadow-[#037166]/30 transition-all flex items-center justify-center gap-2">
                              Book Service
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                  {type === 'recent' && recentServices
                    .filter(s => !selectedRating || (s.rating || 4.5) >= selectedRating)
                    .map((service, index) => (
                      <motion.div
                        key={service.id || index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="group cursor-pointer h-full"
                        onClick={() => onServiceClick?.(service.id, service.categoryName, service.subcategoryName, service.slug)}
                      >
                        <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 shadow-lg">
                          <div className="relative h-48 overflow-hidden">
                            <img loading="lazy" decoding="async"
                              src={service.image}
                              alt={service.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                              <Star className="w-4 h-4 text-[#04a99d] fill-[#04a99d]" />
                              <span className="text-sm font-medium text-white">4.8</span>
                            </div>
                          </div>
                          <div className="p-6">
                            <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#04a99d] transition-colors line-clamp-1">
                              {service.title}
                            </h4>
                            <p className="text-white/60 text-sm mb-4 line-clamp-2">{service.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                              <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium hover:shadow-lg transition-all text-sm flex items-center gap-2">
                                Book Now
                                <ArrowRight className="w-3 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        <AnimatePresence>
          {filterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setFilterOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] rounded-t-3xl border-t border-white/10 p-6 lg:hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold text-white flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#04a99d]" />
                    Filters
                  </h4>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h6 className="block text-white/80 mb-3 text-sm font-medium">Minimum Rating</h6>
                    <div className="space-y-2">
                      {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => {
                            handleRatingSelect(rating);
                            setFilterOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedRating === rating
                            ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white'
                            : 'bg-white/5 text-white/70'
                            }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{rating}+ Stars</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setFilterOpen(false)}
                    className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>

      {/* 3 Value Sections */}
      <ApplianceHowItWorks />
      <ApplianceComparison />
      <PaymentMethodsSection />
    </motion.div>
  );
}
