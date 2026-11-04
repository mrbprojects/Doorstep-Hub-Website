'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowLeft, Star, MapPin, Clock, DollarSign, Filter, X, Zap, RotateCcw, ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { useLocationContext } from '@/context/LocationContext';
import DOMPurify from 'dompurify';
import { imageLoader } from '@/lib/api';
import { AdSenseUnit } from '@/components/sell-buy/ads/AdSenseUnit';
import { ADSENSE_CONFIG } from '@/config/adsense';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi').replace(/\/+$/, '');

export function ServicesListingPage({ category, subCategory, subCategoryId, childCategoryId, slug }) {
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
  // Track which categories have been fetched to avoid duplicate API calls
  const fetchedCatsRef = useRef(new Set());
  // Track which category we've already auto-expanded to avoid loops
  const autoExpandedForRef = useRef(null);

  // Metadata State (derived from props or API)
  const [pageTitle, setPageTitle] = useState(subCategory || '');
  const [categoryName, setCategoryName] = useState(category || '');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [categoryFaqs, setCategoryFaqs] = useState([]);
  const [faqActiveIndex, setFaqActiveIndex] = useState(null);
  const [activeSubcatData, setActiveSubcatData] = useState(null);

  useEffect(() => {
    if (subCategory) setPageTitle(subCategory);
    if (category) setCategoryName(category);
  }, [category, subCategory]);

  useEffect(() => {
    const fetchSubcatDetails = async () => {
      if (!category) return;
      try {
        const response = await fetch(`${API_BASE}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: category })
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const matched = data.data.find(sub =>
            sub.slug === slug || sub._id === subCategoryId
          );
          if (matched) {
            setActiveSubcatData(matched);
          }
        }
      } catch (err) {
        console.error("Error fetching subcat details:", err);
      }
    };
    fetchSubcatDetails();
  }, [category, slug, subCategoryId]);

  const getNearbyCentersFromResponse = (data) => {
    const centersList =
      data?.nearByServiceCenters ||
      data?.nearbyServiceCenters ||
      data?.nearestServiceCenters ||
      data?.serviceCenters ||
      [];

    return Array.isArray(centersList) ? centersList : [];
  };

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
      if ((!subCategoryId && !childCategoryId && !slug) || !location?.lat || !location?.lng) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let apiUrl = `${API_BASE}/app/applience-repairs-website/services_by_subcategory`;
        let body = {
          lattitude: location.lat,
          longitude: location.lng,
          cityName: location.city || '',
          city: location.city || '',
        };

        if (slug) {
          body.slug = slug;
        } else if (childCategoryId) {
          apiUrl = `${API_BASE}/app/applience-repairs-website/services_by_childcategory`;
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
          // Extract custom metadata & FAQs
          setCustomTitle(servicesData.categoryTitle || servicesData.title || '');
          setCustomDescription(servicesData.categoryDescription || servicesData.description || '');
          setCategoryFaqs(servicesData.categoryFaqs || servicesData.faqs || []);

          // Enrich services with slugs without an extra API call
          const enrichedServices = (servicesData.dhubServices || []).map(service => {
            if (service.slug) return service;
            // Generate slug from service name directly
            const generatedSlug = (service.name || service.itemName || 'service')
              .toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            return { ...service, slug: generatedSlug };
          });

          setServices(enrichedServices);

          const responseCenters = getNearbyCentersFromResponse(servicesData).map(center => {
            if (center.slug) return center;
            const generatedSlug = (center.business_name || center.name || center.firstName || 'service-center')
              .toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            return { ...center, slug: generatedSlug };
          });
          setCenters(responseCenters);

          // Update metadata if missing
          if ((!subCategory || !category) && enrichedServices.length > 0) {
            const firstService = enrichedServices[0];
            if (!subCategory && firstService.subcategoryName) setPageTitle(firstService.subcategoryName);
            if (!category && firstService.categoryName) setCategoryName(firstService.categoryName);
          }
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
  }, [subCategoryId, childCategoryId, slug, location?.lat, location?.lng, minRating]);

  // Fetch Categories for Sidebar
  useEffect(() => {
    const fetchAllCategories = async () => {
      if (!location?.lat || !location?.lng) return;

      setLoadingCategories(true);
      try {
        const response = await fetch(`${API_BASE}/app/applience-repairs-website/getallcategorys`, {
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

  // Helper to fetch subcategories - uses a ref to prevent duplicate calls
  const fetchSubcategories = async (catId, catSlug) => {
    // If already fetched, fetching, or in cache, skip
    if (fetchedCatsRef.current.has(catId) || categorySubcats[catId]) return;

    // Mark as fetching immediately to prevent concurrent calls
    fetchedCatsRef.current.add(catId);
    setLoadingSubcats(prev => ({ ...prev, [catId]: true }));
    try {
      const response = await fetch(`${API_BASE}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: catSlug })
      });

      const data = await response.json();
      if (data.success && data.data) {
        setCategorySubcats(prev => ({ ...prev, [catId]: data.data }));
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      // Remove from fetched set on error so it can be retried
      fetchedCatsRef.current.delete(catId);
    } finally {
      setLoadingSubcats(prev => ({ ...prev, [catId]: false }));
    }
  };

  // Auto-expand active category and fetch subcategories - only runs once per category
  useEffect(() => {
    if (allCategories.length > 0 && category) {
      // Use the `category` prop (from URL) directly - it's the category slug
      const activeCat = allCategories.find(c => c.slug === category || c.name === category);
      if (activeCat) {
        // Update display name from the real category name
        if (categoryName !== activeCat.name) {
          setCategoryName(activeCat.name);
        }

        // Only auto-expand and fetch once per category to prevent loops
        if (autoExpandedForRef.current !== activeCat._id) {
          autoExpandedForRef.current = activeCat._id;
          setExpandedCategory(activeCat._id);
          fetchSubcategories(activeCat._id, activeCat.slug);
        }
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

  const handleSubCategorySelect = (subCat, catSlug) => {
    // Navigate to the selected subcategory
    router.push(`/${subCat.slug}`);
    // Close mobile filter if open
    setFilterOpen(false);
  };


  // Local filtering as fallback/additional layer
  const filteredServices = services.filter(s => {
    // If no minRating, show all
    if (minRating === 0) return true;
    const rating = parseFloat(s.rating || 0);
    return rating >= minRating;
  });

  const filteredCenters = centers.filter(c => {
    if (minRating === 0) return true;
    const rating = parseFloat(c.rating || 0);
    return rating >= minRating;
  });


  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  };

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                if (categoryName) {
                  const activeCat = allCategories.find(c => c.name === categoryName);
                  if (activeCat?.slug) {
                    router.push(`/${activeCat.slug}`);
                  } else {
                    router.back();
                  }
                } else {
                  router.back();
                }
              }}
              className="inline-flex lg:hidden items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-gray-900 hover:bg-white transition-all text-sm whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              {categoryName ? `Back to ${categoryName}` : 'Back'}
            </motion.button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-white/75 mb-3">
              <span className="hover:underline cursor-pointer" onClick={() => router.push('/appliances')}>Home</span>
              <ChevronRight className="w-3 h-3 text-white/50" />
              {categoryName && (
                <>
                  <span className="hover:underline cursor-pointer" onClick={() => {
                    const activeCat = allCategories.find(c => c.name === categoryName);
                    if (activeCat?.slug) {
                      router.push(`/${activeCat.slug}`);
                    }
                  }}>{categoryName}</span>
                  <ChevronRight className="w-3 h-3 text-white/50" />
                </>
              )}
              <span className="text-white font-medium">{pageTitle}</span>
            </div>

            <h1 className="text-3xl md:text-3xl font-bold !text-white mb-2" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
              {activeSubcatData?.title || activeSubcatData?.name || customTitle || pageTitle}
            </h1>
            <p className="!text-white/90" style={{ color: 'rgba(255, 255, 255, 0.9)', WebkitTextFillColor: 'rgba(255, 255, 255, 0.9)' }}>
              {activeSubcatData?.description || customDescription || (categoryName ? `${categoryName} • Professional Services` : 'Professional Services')}
            </p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-6 mt-4">
          <div className="flex items-center justify-center lg:justify-between gap-4">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                if (categoryName) {
                  const activeCat = allCategories.find(c => c.name === categoryName);
                  if (activeCat?.slug) {
                    router.push(`/${activeCat.slug}`);
                  } else {
                    router.back();
                  }
                } else {
                  router.back();
                }
              }}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-gray-900 hover:bg-white transition-all text-sm whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              {categoryName ? `Back to ${categoryName}` : 'Back'}
            </motion.button>

            <div className="inline-flex p-1.5 bg-white/85 backdrop-blur-md rounded-full border border-slate-200 shadow-sm">
              <button
                onClick={() => setActiveTab('services')}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'services'
                  ? 'bg-gradient-to-r from-[#e89117] to-[#00796B] text-white shadow-lg shadow-[#00796B]/30'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-slate-100'
                  }`}
              >
                All Services
              </button>
              <button
                onClick={() => setActiveTab('centers')}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'centers'
                  ? 'bg-gradient-to-r from-[#e89117] to-[#00796B] text-white shadow-lg shadow-[#00796B]/30'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-slate-100'
                  }`}
              >
                Nearby Centers
              </button>
            </div>
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
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#04a99d]" />
                Filters
              </h4>

              {/* Categories Filter */}
              <div className="mb-8 border-b border-slate-200 pb-6">
                <h6 className="block text-gray-700 mb-3 text-sm font-medium">Categories</h6>
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
                              ? 'bg-slate-100 text-gray-900'
                              : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900'
                            }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            {/* <Folder className="w-4 h-4 text-[#04a99d]" /> */}
                            {cat.name}
                          </span>
                          {expandedCategory === cat._id ? (
                            <ChevronDown className={`w-4 h-4 ${cat.name === category ? 'text-[#04a99d]' : 'text-[#04a99d]'}`} />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
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
                              <div className="pl-4 pr-1 py-1 space-y-1 mt-1 border-l border-slate-200 ml-3">
                                {loadingSubcats[cat._id] ? (
                                  <div className="px-3 py-2">
                                    <div className="w-4 h-4 border-2 border-[#037166]/20 border-t-[#037166] rounded-full animate-spin" />
                                  </div>
                                ) : categorySubcats[cat._id]?.length > 0 ? (
                                  categorySubcats[cat._id].map(sub => (
                                    <button
                                      key={sub._id}
                                      onClick={() => handleSubCategorySelect(sub, cat.slug)}
                                      className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors truncate ${sub.slug === slug || sub._id === subCategoryId
                                        ? 'bg-[#037166]/20 text-[#04a99d] font-medium'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-slate-50'
                                        }`}
                                    >
                                      {sub.name}
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 text-xs text-gray-400">No services found</div>
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

              {/* Rating Filter */}
              <div className="mb-6">
                <h6 className="block text-gray-700 mb-3 text-sm font-medium">Minimum Rating</h6>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(rating)}
                      className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${minRating === rating
                        ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white'
                        : 'bg-slate-50 text-gray-600 hover:bg-slate-100'
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
                onClick={resetFilters}
                className="w-full mt-6 px-4 py-3 rounded-lg border border-slate-200 text-gray-700 hover:bg-slate-50 transition-all text-sm font-medium flex items-center justify-center gap-2"
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
                        onClick={() => router.push(`/${service.slug}`)}
                      >
                        <div className="flex flex-col relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 hover:border-[#037166]/50 transition-all duration-300">
                          {/* Image */}
                          <div className="relative h-48 overflow-hidden bg-slate-900">
                            {(() => {
                              const serviceImg = service.mainImage || service.image || service.itemImage || service.serviceImage;
                              return (
                                <img loading="lazy" decoding="async"
                                  src={serviceImg ? imageLoader({ src: serviceImg }) : 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400'}
                                  alt={service.name || 'Appliance Service'}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400';
                                  }}
                                />
                              );
                            })()}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />

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
                            <div
                              className="text-white/80 text-[11px] mb-4 line-clamp-2 rich-text-content"
                              dangerouslySetInnerHTML={{
                                __html: typeof window !== 'undefined' ? DOMPurify.sanitize(service.description || '', {
                                  ADD_ATTR: ['target', 'href', 'src', 'alt', 'class', 'style']
                                }) : service.description || '',
                              }}
                            />

                            {/* CTA Button */}
                            <button
                              onClick={() => router.push(`/${service.slug}`)}
                              className="w-full mt-auto px-4 py-3 rounded-lg bg-gradient-to-r from-[#e89117] to-[#00796B] text-white font-medium hover:shadow-lg hover:shadow-[#00796B]/30 transition-all"
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
                      🥺 No services found.
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
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
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
                        onClick={() => router.push(`/service-list/${center.slug || center._id}`)}
                        className="group cursor-pointer"
                      >
                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 hover:border-[#037166]/50 transition-all duration-300 h-full md:h-[185px]">
                          <div className="flex flex-col md:flex-row h-full">
                            <div className="relative w-full md:w-44 h-36 md:h-full overflow-hidden flex-shrink-0 bg-white">
                              {(() => {
                                const centerImg = center.logo || center.image || center.banner;
                                return (
                                  <img loading="lazy" decoding="async"
                                    src={centerImg ? imageLoader({ src: centerImg }) : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'}
                                    alt={center.name || 'Service Center'}
                                    className="w-full h-full object-contain bg-white transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400';
                                    }}
                                  />
                                );
                              })()}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a1a1a]/60" />

                              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white text-[11px] font-semibold">
                                Open Now
                              </div>
                            </div>

                            <div className="flex-1 p-3 md:p-3.5 flex flex-col justify-between min-w-0">
                              <h4 className="text-base md:text-lg leading-tight font-bold text-gray-900 mb-1 group-hover:text-[#037166] transition-colors line-clamp-2 break-words">
                                {center.business_name || center.name}
                              </h4>
                              <p className="text-gray-700 text-xs leading-snug mb-2 flex items-start gap-1.5 line-clamp-2 break-words">
                                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-600" />
                                {center.address}
                              </p>

                              <div className="flex flex-wrap items-center gap-1 mb-2.5">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 fill-[#04a99d] text-[#04a99d]" />
                                  <span className="text-gray-900 font-semibold text-sm">{center.rating}</span>
                                  <span className="text-gray-600 text-xs">({center.totalOrders} orders)</span>
                                </div>
                                {(() => {
                                  const distVal = center.distance || center.distanceInKm || center.distanceKm;
                                  const parsedDist = parseFloat(distVal);
                                  return !isNaN(parsedDist) && parsedDist > 0 ? (
                                    <div className="flex items-center gap-1 text-gray-600 text-xs md:text-sm">
                                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                      {parsedDist.toFixed(1)} km away
                                    </div>
                                  ) : null;
                                })()}
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/service-list/${center.slug || center._id}`);
                                }}
                                className="w-fit px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#e89117] to-[#00796B] text-white text-xs font-semibold hover:shadow-lg hover:shadow-[#00796B]/30 transition-all"
                              >
                                Book Service
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center !text-black py-20 ">
                      🥺 No service centers found nearby.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── RESPONSIVE ADSENSE UNIT ── */}
            <div className="my-8">
              <AdSenseUnit slotId={ADSENSE_CONFIG.slots.categoryFeed} />
            </div>

            {/* FAQs Accordion Section */}
            {(() => {
              const allFaqs = [
                ...(activeSubcatData?.faqs || []),
                ...(categoryFaqs || [])
              ].filter(faq => faq && (faq.question || faq.title) && (faq.answer || faq.description));
              return allFaqs.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mt-16 pt-8 border-t border-slate-200"
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Frequently Asked Questions
                    </h3>
                    <p className="text-gray-600">
                      Find quick answers to common questions about {activeSubcatData?.name || customTitle || pageTitle} services.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {allFaqs.slice(0, 9).map((faq, index) => (
                      <div
                        key={index}
                        className={`border rounded-2xl overflow-hidden transition-all duration-300 ${faqActiveIndex === index
                          ? 'bg-white border-[#037166]/50 shadow-md shadow-[#037166]/5'
                          : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                          }`}
                      >
                        <button
                          onClick={() => setFaqActiveIndex(faqActiveIndex === index ? null : index)}
                          className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                        >
                          <span className="text-lg font-medium text-gray-900">
                            {faq.question || faq.title}
                          </span>
                          <span className="text-[#037166] flex-shrink-0">
                            <svg
                              className={`w-5 h-5 transition-transform duration-300 ${faqActiveIndex === index ? 'rotate-180' : ''
                                }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {faqActiveIndex === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-[#f1f5f9] pt-4">
                                {faq.answer || faq.description}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : null;
            })()}

            {/* Customer Reviews & Ratings UI Section */}
            {(() => {
              let currentCity = location?.city;
              if (!currentCity && typeof window !== 'undefined') {
                const match = window.location.pathname.match(/-service-center-(.+)$/) || window.location.pathname.match(/\/nearby\/[^\/]+\/(.+)$/);
                if (match && match[1]) {
                  const raw = match[1].split('/')[0];
                  currentCity = raw.charAt(0).toUpperCase() + raw.slice(1).replace(/-/g, ' ');
                }
              }
              if (!currentCity) currentCity = 'Your City';

              const currentService = activeSubcatData?.name || (typeof customTitle !== 'undefined' ? customTitle : '') || (typeof pageTitle !== 'undefined' ? pageTitle : '') || 'Appliance Repair';
              const reviewItems = [
                { name: 'Santhosh Kumar', rating: 5, date: '2 days ago', body: `Excellent doorstep ${currentService} service in ${currentCity}. Technician arrived within 30 minutes!` },
                { name: 'Priya Sharma', rating: 5, date: '4 days ago', body: `Very professional ${currentService} service in ${currentCity}. Genuine spare parts and reasonable price.` },
                { name: 'Venkatesh Rao', rating: 4, date: '1 week ago', body: `Great experience with Doorstep Hub in ${currentCity}. Quick diagnostic and polite staff.` },
                { name: 'Ananya Reddy', rating: 5, date: '1 week ago', body: `Highly recommended ${currentService} near ${currentCity}. Fixed the issue on the spot.` },
                { name: 'Kiran Verma', rating: 5, date: '2 weeks ago', body: `Top class service in ${currentCity}! 90-day warranty provided on repairs.` },
                { name: 'Srinivas Rao', rating: 5, date: '3 weeks ago', body: `Punctual and honest technician in ${currentCity}. Satisfied with the service quality.` },
              ];

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mt-16 pt-8 border-t border-slate-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3.5 sm:gap-4">
                    <div className="max-w-xl">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                        Customer Reviews & Ratings in {currentCity}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        Verified customer feedback for {currentService} in {currentCity}.
                      </p>
                    </div>
                    <div className="hidden sm:inline-flex flex-wrap items-center gap-2 sm:gap-2.5 bg-emerald-50/80 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full border border-[#037166]/20 self-start sm:self-auto shrink-0 shadow-sm">
                      <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="font-black text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                        4.8<span className="text-gray-400 font-medium text-[10px] sm:text-xs">/5.0</span>
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0 hidden xs:inline-block" />
                      <span className="text-gray-600 font-semibold text-xs sm:text-sm whitespace-nowrap">
                        1,240 Verified Reviews
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviewItems.map((rev, index) => (
                      <div
                        key={index}
                        className="bg-white border border-slate-200 hover:border-[#037166]/40 p-6 rounded-2xl shadow-sm transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-full bg-[#037166]/10 text-[#037166] font-bold flex items-center justify-center text-sm">
                                {rev.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm">{rev.name}</h4>
                                <p className="text-xs text-gray-400">{rev.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center text-amber-400">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            "{rev.body}"
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#037166] font-medium">
                          <span>Verified Booking</span>
                          <span>{currentCity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })()}
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
