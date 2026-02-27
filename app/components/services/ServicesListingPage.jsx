'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowLeft, Star, MapPin, Clock, DollarSign, Filter, X, Zap, RotateCcw, ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { useLocationContext } from '@/context/LocationContext';

export function ServicesListingPage({ category, subCategory, subCategoryId, childCategoryId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('services');
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minRating, setMinRating] = useState(parseFloat(searchParams.get('rating')) || 0);
  const [services, setServices] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { location } = useLocationContext();

  // Categories & Subcategories State
  const [allCategories, setAllCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categorySubcats, setCategorySubcats] = useState({}); // Cache for subcategories
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcats, setLoadingSubcats] = useState({});

  const handleRatingChange = (rating) => {
    const newRating = rating === minRating ? 0 : rating;
    setMinRating(newRating);

    const params = new URLSearchParams(searchParams.toString());
    if (newRating > 0) {
      params.set('rating', newRating.toString());
    } else {
      params.delete('rating');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const resetFilters = () => {
    setMinRating(0);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('rating');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const fetchServices = async () => {
      if ((!subCategoryId && !childCategoryId) || !location?.lat || !location?.lng) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let apiUrl = 'https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/services_by_subcategory';
        let body = {
          lattitude: location.lat,
          longitude: location.lng,
        };

        if (childCategoryId) {
          apiUrl = 'https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/services_by_childcategory';
          body.childcategoryId = childCategoryId;
        } else {
          body.subcategoryId = subCategoryId;
        }

        // Add minRating to payload if set
        if (minRating > 0) {
          body.minRating = minRating;
        }

        // Fetch services and nearby centers from appropriate API
        const servicesResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (!servicesResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const servicesData = await servicesResponse.json();

        if (servicesData.success) {
          // Set services from dhubServices array
          setServices(servicesData.dhubServices || []);

          // Set centers from nearByServiceCenters array (same API response)
          setCenters(servicesData.nearByServiceCenters || []);

          console.log('Fetched services:', servicesData.dhubServices?.length || 0);
          console.log('Fetched nearby centers:', servicesData.nearByServiceCenters?.length || 0);
        } else {
          setServices([]);
          setCenters([]);
        }

      } catch (error) {
        console.error("Error fetching services:", error);
        setServices([]);
        setCenters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [subCategoryId, childCategoryId, location?.lat, location?.lng, minRating]);

  // Fetch Categories for Sidebar
  useEffect(() => {
    const fetchAllCategories = async () => {
      if (!location?.lat || !location?.lng) return;

      setLoadingCategories(true);
      try {
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/getallcategorys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lattitude: location.lat,
            longitude: location.lng,
          })
        });

        const data = await response.json();
        if (data.success && data.data) {
          setAllCategories(data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchAllCategories();
  }, [location?.lat, location?.lng]);

  // Helper to fetch subcategories
  const fetchSubcategories = async (catId, slug) => {
    // If already fetched or fetching, skip
    if (categorySubcats[catId] || loadingSubcats[catId]) return;

    setLoadingSubcats(prev => ({ ...prev, [catId]: true }));
    try {
      const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/getsubcategorysbycategoryid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug })
      });

      const data = await response.json();
      if (data.success && data.data) {
        setCategorySubcats(prev => ({ ...prev, [catId]: data.data }));
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    } finally {
      setLoadingSubcats(prev => ({ ...prev, [catId]: false }));
    }
  };

  // Auto-expand active category and fetch subcategories
  useEffect(() => {
    if (allCategories.length > 0 && category) {
      const activeCat = allCategories.find(c => c.name === category);
      if (activeCat) {
        // Only if not already manually interacted (simple check: if expanded is null or different? 
        // Actually best to just enforce it matches current context on load/change)
        if (expandedCategory !== activeCat._id) {
          setExpandedCategory(activeCat._id);
        }
        fetchSubcategories(activeCat._id, activeCat.slug);
      }
    }
  }, [allCategories, category]);

  const handleCategoryExpand = (catId) => {
    if (expandedCategory === catId) {
      setExpandedCategory(null);
      return;
    }
    const cat = allCategories.find(c => c._id === catId);
    setExpandedCategory(catId);
    if (cat) {
      fetchSubcategories(catId, cat.slug);
    }
  };

  const handleSubCategorySelect = (subCat, catName) => {
    // Navigate to the selected subcategory
    router.push(`/appliances/listing/${subCat._id}?category=${encodeURIComponent(catName)}&name=${encodeURIComponent(subCat.name)}`);
    // Close mobile filter if open
    setFilterOpen(false);
  };


  // Local filtering as fallback/additional layer
  const filteredServices = services.filter(s => (s.rating || 0) >= minRating);
  const filteredCenters = centers.filter(c => (c.rating || 0) >= minRating);


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-20"
    >
      {/* Header with Teal Gradient */}
      <div className="z-40 bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] border-b border-white/10 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => {
              const activeCat = allCategories.find(c => c.name === category);
              if (activeCat?._id) {
                router.push(`/${activeCat.slug}`);
              } else {
                router.back();
              }
            }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {category}
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white/50 mb-2">
              {subCategory}
            </h1>
            <p className="text-white/80">{category} • Professional Services</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex gap-2 border-t border-white/10 pt-4">
            <button
              onClick={() => setActiveTab('services')}
              className="relative px-6 py-3 text-sm font-medium text-white transition-all"
            >
              All Services
              {activeTab === 'services' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('centers')}
              className="relative px-6 py-3 text-sm font-medium text-white/70 hover:text-white transition-all"
            >
              Nearby Centers
              {activeTab === 'centers' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filter - Desktop */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden lg:block w-80 flex-shrink-0"
          >
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#04a99d]" />
                Filters
              </h4>

              {/* Categories Filter */}
              <div className="mb-8 border-b border-white/10 pb-6">
                <h6 className="block text-white/80 mb-3 text-sm font-medium">Categories</h6>
                <div className="space-y-2">
                  {loadingCategories ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-8 bg-white/5 rounded-lg" />
                      <div className="h-8 bg-white/5 rounded-lg" />
                    </div>
                  ) : (
                    allCategories.map((cat) => (
                      <div key={cat._id} className="overflow-hidden">
                        <button
                          onClick={() => handleCategoryExpand(cat._id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${cat.name === category
                            ? 'bg-[#037166]/10 text-[#04a99d] font-bold border border-[#037166]/20'
                            : expandedCategory === cat._id
                              ? 'bg-white/10 text-white'
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            {/* <Folder className="w-4 h-4 text-[#04a99d]" /> */}
                            {cat.name}
                          </span>
                          {expandedCategory === cat._id ? (
                            <ChevronDown className={`w-4 h-4 ${cat.name === category ? 'text-[#04a99d]' : 'text-[#04a99d]'}`} />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-white/40" />
                          )}
                        </button>

                        {/* Subcategories Expansion */}
                        <AnimatePresence>
                          {expandedCategory === cat._id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pr-1 py-1 space-y-1 mt-1 border-l border-white/10 ml-3">
                                {loadingSubcats[cat._id] ? (
                                  <div className="px-3 py-2 text-xs text-white/40">Loading...</div>
                                ) : categorySubcats[cat._id]?.length > 0 ? (
                                  categorySubcats[cat._id].map(sub => (
                                    <button
                                      key={sub._id}
                                      onClick={() => handleSubCategorySelect(sub, cat.name)}
                                      className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors truncate ${sub._id === subCategoryId
                                        ? 'bg-[#037166]/20 text-[#04a99d] font-medium'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                      {sub.name}
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 text-xs text-white/40">No services found</div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Price Range */}
              {/* <div className="mb-6">
                <h6 className="block text-white/80 mb-3 text-sm font-medium">Price Range</h6>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#037166]"
                    placeholder="Min"
                  />
                  <span className="text-white/40">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#037166]"
                    placeholder="Max"
                  />
                </div>
              </div> */}

              {/* Rating Filter */}
              <div className="mb-6">
                <h6 className="block text-white/80 mb-3 text-sm font-medium">Minimum Rating</h6>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(rating)}
                      className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${minRating === rating
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

              {/* Availability */}
              {/* <div>
                <h6 className="block text-white/80 mb-3 text-sm font-medium">Availability</h6>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-all text-sm">
                    <Zap className="w-4 h-4 text-[#04a99d]" />
                    Available Now
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-all text-sm">
                    <Clock className="w-4 h-4 text-[#04a99d]" />
                    Same Day Service
                  </button>
                </div>
              </div> */}

              {/* Reset Button */}
              <button
                onClick={resetFilters}
                className="w-full mt-6 px-4 py-3 rounded-lg border border-white/20 text-white/80 hover:bg-white/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Filters
              </button>
            </div>
          </motion.aside>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 z-50 px-6 py-3 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium shadow-2xl flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>

          {/* Main Content Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'services' ? (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {loading ? (
                    // Service Skeleton
                    [1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />
                    ))
                  ) : filteredServices.length > 0 ? (
                    filteredServices.map((service, index) => (
                      <motion.div
                        key={service._id || index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="group cursor-pointer h-full"
                      >
                        <div className="flex flex-col relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 hover:border-[#037166]/50 transition-all duration-300">
                          {/* Image */}
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={service.mainImage ? `https://api.doorstephub.com/${service.mainImage}` : 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400'} // Fallback image
                              alt={service.name}
                              className="w-full h-full object-cover transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />



                            {/* Price Badge */}
                            {/* <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white font-bold">
                              ₹{service.minFare}
                            </div> */}

                            {/* Rating Badge - Bottom Left Flush */}
                            <div className="absolute bottom-0 left-0 z-20">
                              <div className="flex items-center gap-1 px-3 py-1.5 rounded-tr-xl bg-black/60 backdrop-blur-md border-t border-r border-white/10">
                                <Star className="w-3.5 h-3.5 fill-[#04a99d] text-[#04a99d]" />
                                <span className="text-white text-xs font-bold">{service.rating}</span>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex flex-col flex-1 p-6">
                            <h4 className="text-[14px] font-bold text-white mb-2 group-hover:text-[#04a99d] transition-colors line-clamp-2">
                              {service.name}
                            </h4>
                            <p className="text-white/60 text-[11px] mb-4 line-clamp-2">{service.description}</p>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                              {/* <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-[#04a99d] text-[#04a99d]" />
                                <span className="text-white font-medium">{service.rating}</span>
                                <span className="text-white/40">({service.totalOrders})</span>
                              </div> */}
                              {/* <div className="flex items-center gap-1 text-white/60">
                                <Clock className="w-4 h-4" />
                                <span>60 mins</span>
                              </div> */}
                              {/* Distance placeholder if API doesn't provide */}
                              {/* <div className="flex items-center gap-1 text-white/60">
                                <MapPin className="w-4 h-4" />
                                <span>2.5 km</span>
                              </div> */}
                            </div>

                            {/* CTA Button */}
                            <button
                              onClick={() => router.push(`/appliances/detail/${service._id}?category=${encodeURIComponent(category)}&subCategory=${encodeURIComponent(subCategory)}`)}
                              className="w-full mt-auto px-4 py-3 rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium hover:shadow-lg hover:shadow-[#037166]/30 transition-all"
                            >
                              Book Now
                            </button>
                          </div>

                          {/* Hover Border Glow */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 rounded-2xl border-2 border-[#037166] pointer-events-none"
                            style={{ boxShadow: '0 0 20px rgba(3, 113, 102, 0.4)' }}
                          />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 text-white/60">
                      No services found for this category.
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="centers"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {loading ? (
                    // Center Skeleton
                    [1, 2].map((i) => (
                      <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
                    ))
                  ) : filteredCenters.length > 0 ? (
                    filteredCenters.map((center, index) => (
                      <motion.div
                        key={center._id || index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="group cursor-pointer"
                      >
                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 hover:border-[#037166]/50 transition-all duration-300">
                          <div className="flex flex-col md:flex-row">
                            {/* Image */}
                            <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden">
                              <img
                                src={center.logo ? `https://api.doorstephub.com/${center.logo}` : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'}
                                alt={center.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a1a1a]/60" />

                              {/* Open Badge */}
                              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white text-xs font-bold">
                                Open Now
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6">
                              <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-[#04a99d] transition-colors">
                                {center.business_name || center.name}
                              </h4>
                              <p className="text-white/60 text-sm mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {center.address}
                              </p>

                              <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-[#04a99d] text-[#04a99d]" />
                                  <span className="text-white font-medium">{center.rating}</span>
                                  <span className="text-white/40 text-sm">({center.totalOrders} orders)</span>
                                </div>
                                <div className="flex items-center gap-1 text-white/60 text-sm">
                                  <MapPin className="w-4 h-4" />
                                </div>
                                {/* <div className="text-white/60 text-sm">
                                  Min Fare: ₹{center.minFare}
                                </div> */}
                                {center.totalViews !== undefined && (
                                  <div className="text-white/60 text-sm">
                                    Views: {center.totalViews}
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => router.push(`/appliances/store/${center._id}?serviceId=${subCategoryId}`)}
                                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium hover:shadow-lg hover:shadow-[#037166]/30 transition-all"
                              >
                                View Center
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 text-white/60">
                      🥺 No service centers found nearby.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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

              {/* Same filter content as desktop */}
              <div className="space-y-6">
                <div>
                  <h6 className="block text-white/80 mb-3 text-sm font-medium">Price Range</h6>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                      placeholder="Min"
                    />
                    <span className="text-white/40">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div>
                  <h6 className="block text-white/80 mb-3 text-sm font-medium">Minimum Rating</h6>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => {
                          handleRatingChange(rating);
                          setFilterOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${minRating === rating
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
    </motion.div>
  );
}