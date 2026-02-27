import React, { useState, useEffect } from 'react';
import { RatingFilter } from './RatingFilter';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, MapPin, Zap, ArrowRight, Filter, X } from 'lucide-react';
import { fetchFeaturedServices, imageLoader } from '@/lib/api';
import { useLocation } from '@/hooks/useLocation';

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
          // Using default coordinates only if needed, or empty body as per Postman snippet
          const body = {
            lattitude: '17.4391296',
            longitude: '78.4433152',
          };

          const response = await fetch(
            'https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/getallcategorys',
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
              image: `https://api.doorstephub.com/${item.image}`
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
          // Use location if available, otherwise try to detect
          let currentLoc = location;
          if (!currentLoc) {
            // Default to Hyderabad if detection fails or is pending
            currentLoc = { lat: 17.3850, lng: 78.4867 };
          }

          const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/nearest_service_centers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lattitude: currentLoc.lat,
              longitude: currentLoc.lng,
            }),
          });

          if (!response.ok) throw new Error('Failed to fetch stores');
          const result = await response.json();

          if (result.success && result.nearestServiceCenters) {
            setStores(result.nearestServiceCenters.map(item => ({
              id: item._id,
              name: item.name || `${item.firstName} ${item.lastName}`,
              address: item.address || item.cityName || 'Location not specified',
              rating: item.rating || 4.5,
              image: item.image ? `https://api.doorstephub.com/${item.image}` : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
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
          const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/products/latest_bookings_services', {
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
              image: service.mainImage ? `https://api.doorstephub.com/${service.mainImage}` : 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400',
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
        return 'All Categories';
      case 'recent':
        return 'Recently Booked Services';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0a0a0a] text-white"
    >
      {/* Header */}
      <section className="bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] text-white py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 mt-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-4xl md:text-5xl font-bold">{getTitle()}</h1>
            {/* Rating Filter moved to sidebar */}
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
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
              <div className={type === 'featured' ? "flex flex-col gap-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
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
                      <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/10 hover:border-[#037166]/50 shadow-lg hover:shadow-[#037166]/20 transition-all duration-300">
                        {/* Image Section */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={category.image}
                            alt={category.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
                        </div>

                        {/* Content Section */}
                        <div className="p-6 flex flex-col flex-1 relative">
                          <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#04a99d] transition-colors line-clamp-1">
                            {category.title}
                          </h4>
                          {/* Optional: Add description if available, or just a CTA */}
                          <div className="mt-auto flex items-center justify-between">
                            <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">Explore All Services</span>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#037166] transition-all">
                              <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                            </div>
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
                      whileHover={{ x: 10 }} // Slight horizontal shift on hover instead of lift
                      onClick={() => onServiceClick?.(service._id, service.categoryName, service.subcategoryName, service.slug)}
                      className="group cursor-pointer"
                    >
                      <div className="flex flex-col md:flex-row gap-6 p-4 rounded-3xl bg-[#1a1a1a] border border-white/10 hover:border-[#037166]/50 transition-all duration-300 h-full overflow-hidden">
                        <div className="relative w-full md:w-80 h-56 rounded-2xl overflow-hidden flex-shrink-0">
                          <img
                            src={imageLoader({ src: service.mainImage })}
                            alt={service.serviceName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white text-xs font-bold flex items-center gap-1 shadow-lg">
                            <Zap className="w-3 h-3" />
                            {service.serviceDelhiveryType || 'Featured'}
                          </div>
                        </div>
                        <div className="flex-1 py-2 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-2xl font-bold text-white group-hover:text-[#04a99d] transition-colors line-clamp-1">
                                {service.serviceName}
                              </h4>
                              <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                                <Star className="w-4 h-4 fill-[#04a99d] text-[#04a99d]" />
                                <span className="text-white font-medium text-sm">{service.rating || 4.8}</span>
                              </div>
                            </div>
                            <p className="text-white/60 text-base mb-4 line-clamp-2">{service.description}</p>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                            <div className="flex flex-col">
                              {/* <span className="text-xs text-white/40 mb-1">Service Cost</span>
                                  <p className="text-2xl font-bold text-white">₹{service.serviceCharge}</p> */}
                            </div>
                            <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium hover:shadow-lg hover:shadow-[#037166]/30 transition-all text-sm flex items-center gap-2">
                              Book Now
                              <ArrowRight className="w-4 h-4" />
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
                      onClick={() => onStoreClick?.(store.id)}
                      className="group cursor-pointer"
                    >
                      <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-[#1a1a1a] border border-white/10 h-full">
                        <div className="relative h-48 overflow-hidden">
                          <img
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
                            View Center
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
                          <img
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
                            {/* <p className="text-2xl font-bold text-white">₹{service.price}</p> */}
                            <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium hover:shadow-lg transition-all text-sm flex items-center gap-2">
                              Book Now
                              <ArrowRight className="w-4 h-4" />
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

        {/* Mobile Filter Panel */}
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
    </motion.div>
  );
}
