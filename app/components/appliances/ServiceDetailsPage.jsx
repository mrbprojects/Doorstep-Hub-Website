'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowLeft, Star, Clock, Shield, CheckCircle, Award, ThumbsUp, ChevronLeft, ChevronRight, ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useLocationContext } from '@/context/LocationContext';

// Service-specific accent colors
const serviceAccents = {
  'Oven Repair': '#5a8b9d', // muted teal/steel blue
  'TV Repair': '#5a8b9d',
  'Home Cleaning & Maintenance': '#52c4b8', // soft mint
  'Refrigerator Repair': '#5a8b9d',
  'Washing Machine Repair': '#5a8b9d',
  'Computer Repair': '#5a8b9d',
  'AC Repair': '#5a8b9d',
  'Plumbing Service': '#8b8a5a', // warm amber-teal
};


export function ServiceDetailsPage({
  serviceId,
  serviceSlug, // Added Slug support
  category,
  subCategory,
  subCategoryId
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addToCart } = useServiceCart();
  const [activeTab, setActiveTab] = useState('About Service');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(4);
  const accentColor = serviceAccents[category] || '#5a8b9d';

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId && !serviceSlug) return;
      setLoading(true);
      try {
        let response;
        if (serviceSlug) {
          // Priority: Call API directly with slug
          response = await fetch(`https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/dhub_service_details/${serviceSlug}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });

          // If direct slug call fails, try resolution fallback
          if (!response.ok) {
            const allRes = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/all-services');
            const allData = await allRes.json();

            if (allData.success && Array.isArray(allData.data)) {
              const generateSlug = (n) => n?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';
              let matchedId = null;

              for (const cat of allData.data) {
                for (const sub of (cat.subcategories || [])) {
                  if (sub.slug === serviceSlug || generateSlug(sub.name) === serviceSlug) {
                    matchedId = sub._id;
                    break;
                  }
                }
                if (matchedId) break;
              }

              if (matchedId) {
                response = await fetch(`https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/dhub_service_details/${matchedId}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({}),
                });
              }
            }
          }
        } else if (serviceId) {
          response = await fetch(`https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/dhub_service_details/${serviceId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });
        }

        if (!response.ok) throw new Error('Failed to fetch details');

        const data = await response.json();
        if (data.success) {
          setServiceDetails(data);

          // Apply Dynamic SEO from Service Model
          if (data.seo) {
            const seo = data.seo;
            document.title = seo.title || document.title;

            if (seo.description) {
              let metaDesc = document.querySelector('meta[name="description"]');
              if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = 'description';
                document.head.appendChild(metaDesc);
              }
              metaDesc.setAttribute("content", seo.description);
            }

            const keywords = Array.isArray(seo.keywords) ? seo.keywords.join(", ") : seo.keywords;
            if (keywords) {
              let metaKeywords = document.querySelector('meta[name="keywords"]');
              if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.name = 'keywords';
                document.head.appendChild(metaKeywords);
              }
              metaKeywords.setAttribute("content", keywords);
            }
            console.log("[Service SEO] Applied:", seo.title);
          }

          // Apply Canonical URL
          const currentPath = window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/$/, "");
          const canonicalUrl = `https://doorstephub.com${currentPath}`;
          let linkCanonical = document.querySelector('link[rel="canonical"]');
          if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.rel = "canonical";
            document.head.appendChild(linkCanonical);
          }
          linkCanonical.href = canonicalUrl;

          // Auto-enrich URL if metadata is missing
          if (!category || !subCategory || !subCategoryId) {
            try {
              const res = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/all-services');
              const allServicesData = await res.json();
              if (allServicesData.success && Array.isArray(allServicesData.data)) {
                let foundCat = '';
                let foundSub = '';
                let foundSubId = '';

                for (const cat of allServicesData.data) {
                  const subContent = cat.subcategories || [];
                  for (const sub of subContent) {
                    if (sub._id === data.storeData?.subCategoryId) {
                      foundCat = cat.name;
                      foundSub = sub.name;
                      foundSubId = sub._id;
                      const catSlug = cat.slug;
                      const subSlug = sub.slug;

                      if (foundCat && foundSub && foundSubId) {
                        const params = new URLSearchParams(window.location.search);
                        params.set('category', foundCat);
                        params.set('subCategory', foundSub);
                        params.set('subCategoryId', foundSubId);
                        if (catSlug) params.set('categorySlug', catSlug);
                        if (subSlug) params.set('subCategorySlug', subSlug);
                        router.replace(`${window.location.pathname}?${params.toString()}`);
                      }
                      break;
                    }
                  }
                  if (foundCat) break;
                }
              }
            } catch (enrichError) {
              console.error("Error auto-enriching URL:", enrichError);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
        toast.error("Failed to load service details");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId, serviceSlug, category, subCategory, subCategoryId, router]);

  // Fetch related services
  const [relatedServices, setRelatedServices] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const { location } = useLocationContext();

  useEffect(() => {
    const fetchRelated = async () => {
      if (!subCategoryId || !location?.lat || !location?.lng) return;

      setLoadingRelated(true);
      try {
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/services_by_subcategory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subcategoryId: subCategoryId,
            lattitude: location.lat,
            longitude: location.lng
          })
        });

        const data = await response.json();
        if (data.success) {
          // Filter out the current service if possible
          const filtered = (data.dhubServices || []).filter(s => s._id !== serviceId && s.slug !== serviceSlug);
          setRelatedServices(filtered.slice(0, 4)); // Show top 4
        }
      } catch (error) {
        console.error("Error fetching related services:", error);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelated();
  }, [subCategoryId, location, serviceId, serviceSlug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="aspect-video w-full rounded-2xl bg-white/5 animate-pulse" />
              <div className="h-40 w-full rounded-2xl bg-white/5 animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-12 w-3/4 rounded-xl bg-white/5 animate-pulse" />
              <div className="h-6 w-1/2 rounded-xl bg-white/5 animate-pulse" />
              <div className="h-32 w-full rounded-xl bg-white/5 animate-pulse" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
                <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!serviceDetails?.storeData) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
        <button onClick={() => router.back()} className="px-6 py-2 bg-white/10 rounded-full">Go Back</button>
      </div>
    );
  }

  const { storeData, provider_rate_cards = [], serviceImages = [], customerRatings = [] } = serviceDetails;

  // Prepare images list (banner + service images)
  // FIXED CODE:
  const images = [
    storeData.bannerImage ? `https://api.doorstephub.com/${storeData.bannerImage}` : 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800',
    ...serviceImages.map(img => `https://api.doorstephub.com/${img}`)
  ].filter(Boolean); // Remove any null/undefined images

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Book-now handler extracted for reuse
  const handleBookNow = () => {
    const finalServiceId = storeData.id || storeData._id || serviceId;
    if (!finalServiceId) { toast.error('Service information missing'); return; }
    localStorage.setItem('last_service_id', finalServiceId);
    if (serviceSlug) localStorage.setItem('last_service_slug', serviceSlug);
    const firstPackage = provider_rate_cards[0];
    const rawPrice = firstPackage?.price || 0;
    const cleanPrice = typeof rawPrice === 'string' ? parseInt(rawPrice.replace(/[^0-9]/g, '')) || 0 : rawPrice;
    localStorage.setItem('booking_package_details', JSON.stringify([{
      ...(firstPackage || {}),
      id: firstPackage?.id || `direct-${finalServiceId}`,
      serviceId: finalServiceId,
      serviceName: storeData.name || 'Professional Service',
      packageName: firstPackage?.title || 'Standard Package',
      price: cleanPrice,
      bookingCost: storeData.serviceBookingCost || 0,
      inspectionCost: storeData.inspectionCost || 0,
      quantity: 1
    }]));
    router.push('/appliances/address');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-20 pb-24 lg:pb-0"
    >
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(3,113,102,0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(3,113,102,0.8); }
      `}</style>

      {/* ── MOBILE: Sticky bottom Book-Now bar (hidden on lg+) ─────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-4 pb-4 pt-2"
        style={{ background: 'linear-gradient(to top, rgba(10,10,10,1) 60%, transparent)' }}
      >
        <button
          onClick={handleBookNow}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold text-base shadow-2xl shadow-[#037166]/40 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          Book Now
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <section className="relative py-6 lg:py-12">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `linear-gradient(135deg, #025a51 0%, ${accentColor} 50%, #037166 100%)` }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px]"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Back + Breadcrumb row */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-wrap items-center gap-3 mb-4"
          >
            <button
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                const catSlug = params.get('categorySlug');
                const subCatSlug = params.get('subCategorySlug');
                if (catSlug && subCatSlug) { router.push(`/${catSlug}/${subCatSlug}`); return; }
                if (catSlug) { router.push(`/${catSlug}`); return; }
                router.push('/');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="text-white/50 text-xs flex items-center gap-1.5 flex-wrap">
              <button onClick={() => { const p = new URLSearchParams(window.location.search); const c = p.get('categorySlug'); router.push(c ? `/${c}` : '/'); }} className="hover:text-[#04a99d] transition-colors truncate max-w-[100px]">{category}</button>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <button onClick={() => { const p = new URLSearchParams(window.location.search); const c = p.get('categorySlug'); const s = p.get('subCategorySlug'); if (c && s) router.push(`/${c}/${s}`); else if (c) router.push(`/${c}`); else router.push('/'); }} className="hover:text-[#04a99d] transition-colors truncate max-w-[100px]">{subCategory}</button>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-white/30 truncate max-w-[120px]">{storeData?.name}</span>
            </div>
          </motion.div>

          {/* ── MOBILE-FIRST: Info block at top on mobile, right col on desktop ── */}
          {/* On mobile this is ORDER-1, on desktop it becomes the right sticky column */}

          {/* ── Desktop 2-col grid ─────────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">

            {/* LEFT col: Gallery + Tabs (order-2 on mobile, order-none on desktop) */}
            <div className="order-2 lg:order-none space-y-6 lg:space-y-8">

              {/* Image Gallery */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="relative rounded-2xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/10">
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: '16/9' }}
                    onClick={() => { setSelectedImageIndex(currentImageIndex); setIsLightboxOpen(true); }}
                  >
                    <img
                      src={images[currentImageIndex]}
                      alt={storeData.name}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    {/* Dots indicator on mobile */}
                    {images.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 lg:hidden">
                        {images.map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-[#04a99d] w-4' : 'bg-white/40'}`} />
                        ))}
                      </div>
                    )}
                    {images.length > 1 && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all flex items-center justify-center">
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all flex items-center justify-center">
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                      </>
                    )}
                  </div>
                  {/* Thumbnails — hidden on mobile, shown on md+ */}
                  {images.length > 1 && (
                    <div className="hidden md:flex gap-2 p-3 overflow-x-auto">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setCurrentImageIndex(idx); setSelectedImageIndex(idx); setIsLightboxOpen(true); }}
                          className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all flex-shrink-0 ${currentImageIndex === idx ? 'ring-2 ring-[#037166] scale-105' : 'opacity-60 hover:opacity-100'}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Tabbed Content */}
              <div className="bg-[#1a1a1a]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                {/* Tab bar */}
                <div className="flex border-b border-white/10 overflow-x-auto scrollbar-hide">
                  {['About Service', 'Working Images', 'Ratings'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 min-w-max px-4 py-3.5 text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab
                        ? 'bg-[#037166]/20 text-[#04a99d] border-b-2 border-[#037166]'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-4 sm:p-6">
                  <AnimatePresence mode="wait">
                    {/* About Service Tab */}
                    {(activeTab === 'About Service' || activeTab === 'services') && (
                      <motion.div key="services" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-white mb-0.5">About Service</h3>
                          <p className="text-white/40 text-xs italic">Approximate service rates</p>


                        </div>
                        <div className="grid gap-3">
                          {provider_rate_cards.map((card, index) => (
                            <div key={card.id || index} className="flex items-start justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#037166]/50 transition-all group">
                              <div className="flex-1 pr-4">
                                <h6 className="text-white text-sm font-medium group-hover:text-[#04a99d] transition-colors leading-snug mb-1">{card.title}</h6>
                                {card.reason && (
                                  <p className="text-white/40 text-xs leading-relaxed">{card.reason}</p>
                                )}
                              </div>
                              <span className="text-[#04a99d] font-bold text-base whitespace-nowrap flex-shrink-0">₹{card.price}</span>
                            </div>

                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Working Images Tab */}
                    {(activeTab === 'Working Images' || activeTab === 'portfolio') && (
                      <motion.div key="portfolio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                        <h3 className="text-lg font-bold text-white mb-4">Working Images</h3>
                        {serviceImages.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {serviceImages.map((img, idx) => (
                              <div
                                key={idx}
                                onClick={() => { setSelectedImageIndex(idx + 1); setIsLightboxOpen(true); }}
                                className="aspect-square rounded-xl overflow-hidden group cursor-pointer relative border border-white/10"
                              >
                                <img src={`https://api.doorstephub.com/${img}`} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10 text-white/50 bg-white/5 rounded-xl border border-white/10 border-dashed text-sm">No portfolio images available</div>
                        )}
                      </motion.div>
                    )}

                    {/* Ratings Tab */}
                    {(activeTab === 'Ratings' || activeTab === 'reviews') && (
                      <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                        <h3 className="text-lg font-bold text-white mb-4">Ratings</h3>
                        {customerRatings.length > 0 ? (
                          <div className="space-y-3">
                            {customerRatings.slice(0, visibleReviews).map((review, idx) => (
                              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#037166]/30 transition-all">
                                <div className="flex items-start gap-3">
                                  <div className="w-9 h-9 rounded-full bg-[#037166] flex items-center justify-center font-bold text-white flex-shrink-0 text-sm">{review.name.charAt(0)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <h5 className="text-white font-bold text-sm truncate">{review.name}</h5>
                                      <span className="text-white/40 text-[10px] flex-shrink-0 ml-2">{new Date(review.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-0.5 mb-2">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-[#fbbf24] text-[#fbbf24]' : 'text-white/20'}`} />
                                      ))}
                                    </div>
                                    <p className="text-white/70 text-sm leading-relaxed">{review.comment}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {customerRatings.length > visibleReviews && (
                              <div className="flex justify-center mt-4">
                                <button onClick={() => setVisibleReviews(prev => prev + 4)} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-colors border border-white/20">Show More</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-10 text-white/50 bg-white/5 rounded-xl border border-white/10 border-dashed text-sm">No reviews available yet</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* RIGHT col / MOBILE TOP: Service Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="order-1 lg:order-none lg:sticky lg:top-28 space-y-4"
            >
              {/* Title + Rating */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-2">
                  {storeData.name}
                </h1>
                <p className="text-white/60 text-sm mb-3">Professional Service</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <Star className="w-4 h-4 fill-[#04a99d] text-[#04a99d]" />
                    <span className="text-white font-bold text-sm">{storeData.avgRating}</span>
                    <span className="text-white/50 text-xs">({storeData.totalRatings} ratings)</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">
                    {storeData.totalOrders}+ Orders
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line inline">
                  {isExpanded ? storeData.description : storeData.description?.slice(0, 125) + (storeData.description?.length > 125 ? '...' : '')}
                </p>
                {storeData.description?.length > 125 && (
                  <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#04a99d] font-bold ml-1.5 text-sm hover:underline focus:outline-none">
                    {isExpanded ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </div>

              {/* Service Highlights — 2-col compact grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: Shield, text: 'Verified & Insured' },
                  { icon: Award, text: '30-90 Day Warranty' },
                  { icon: Clock, text: 'Same-Day Service' },
                  { icon: ThumbsUp, text: 'Satisfaction Guaranteed' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${accentColor}40` }}>
                      <item.icon className="w-4 h-4" style={{ color: accentColor }} />
                    </div>
                    <span className="text-white/80 text-xs font-medium leading-tight">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Desktop Book Now button (hidden on mobile — use sticky bar) */}
              <div className="hidden lg:block">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleBookNow}
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold text-lg hover:shadow-2xl hover:shadow-[#037166]/40 transition-all flex items-center justify-center gap-3 group"
                >
                  Book Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Services Section */}
      {relatedServices.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16 border-t border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Related Services</h2>
              <p className="text-white/60">Other popular services in {subCategory}</p>
            </div>
            <button
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                const catSlug = params.get('categorySlug');
                const subCatSlug = params.get('subCategorySlug');
                if (catSlug && subCatSlug) router.push(`/${catSlug}/${subCatSlug}`);
              }}
              className="text-[#04a99d] font-semibold hover:underline flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedServices.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => router.push(`/${service.slug}`)}
                className="group cursor-pointer bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden hover:border-[#037166]/50 transition-all"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={service.mainImage ? `https://api.doorstephub.com/${service.mainImage}` : '/placeholder-service.jpg'}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
                    <Star className="w-3 h-3 fill-[#04a99d] text-[#04a99d]" />
                    <span className="text-white text-[10px] font-bold">{service.rating || '4.8'}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-white font-bold text-sm mb-1 group-hover:text-[#04a99d] transition-colors line-clamp-2">
                    {service.name}
                  </h4>
                  <p className="text-white/40 text-[10px] line-clamp-1 mb-3">{service.subcategoryName}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#04a99d] font-bold">₹{service.serviceBookingCost || service.minFare || '---'}</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#037166] transition-all">
                      <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) => (prev + 1) % images.length);
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Main Image Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center"
            >
              <img
                src={images[selectedImageIndex]}
                alt={`Gallery Image ${selectedImageIndex + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev + 1) % images.length);
                }}
                className="max-w-full max-h-full object-contain pointer-events-auto shadow-2xl rounded-lg cursor-pointer"
              />

              {/* Pagination Info */}
              <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
