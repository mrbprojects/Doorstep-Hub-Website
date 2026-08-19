'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Star, Clock, Shield, CheckCircle, Award, ThumbsUp, ChevronLeft, ChevronRight, ArrowRight, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import { inferVertical, trackLeadEvent } from '@/lib/leadTracking';
import { AmcServiceCoverage } from '@/components/amc/AmcServiceCoverage';
import { API_BASE_URL } from '@/config/env';

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

const relatedServices = [
  {
    id: 101,
    title: 'Oven Deep Cleaning',
    price: 29,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
  },
  {
    id: 102,
    title: 'Appliance Maintenance',
    price: 39,
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400',
  },
  {
    id: 103,
    title: 'Extended Warranty',
    price: 49,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
  },
];

export function ServiceDetailsPage({
  serviceId,
  category,
  subCategory,
  subCategoryId
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('About Service');
  const [visibleReviews, setVisibleReviews] = useState(4);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [rateCardModal, setRateCardModal] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: ''
  });
  const [selectedCards, setSelectedCards] = useState([]);
  const accentColor = serviceAccents[category] || '#5a8b9d';

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) return;
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/dhub_service_details/${serviceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) throw new Error('Failed to fetch details');

        const data = await response.json();
        if (data.success) {
          setServiceDetails(data);
          
          const store = data.storeData || {};
          trackLeadEvent({
            eventType: 'SERVICE_PAGE_VISITED',
            vertical: 'services',
            serviceId: store.id || store._id || serviceId,
            serviceName: store.name || '',
            categoryId: store.categoryId,
            categoryName: category || '',
            subCategoryId: store.subCategoryId,
            subCategoryName: subCategory || '',
            serviceType: 'HOME_APPLIANCE',
          });

          // Removed auto-selection of the first package for manual selection
          /*
          if (data.provider_rate_cards?.length > 0) {
            setSelectedCards([data.provider_rate_cards[0]]);
          }
          */

          // Auto-enrich URL if category or subCategory is missing
          if (!category || !subCategory) {
            try {
              const res = await fetch(`${API_BASE_URL}/app/applience-repairs-website/all-services`);
              const allServicesData = await res.json();
              if (allServicesData.success && Array.isArray(allServicesData.data)) {
                let foundCat = '';
                let foundSub = '';

                for (const cat of allServicesData.data) {
                  const subContent = cat.subcategories || [];
                  for (const sub of subContent) {
                    if (sub._id === data.storeData?.subCategoryId) {
                      foundCat = cat.name;
                      foundSub = sub.name;
                      break;
                    }
                  }
                  if (foundCat) break;
                }

                if (foundCat && foundSub) {
                  const params = new URLSearchParams(window.location.search);
                  params.set('category', foundCat);
                  params.set('subCategory', foundSub);
                  router.replace(`${window.location.pathname}?${params.toString()}`);
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
  }, [serviceId, category, subCategory, router]);

  useEffect(() => {
    if (!loading && !serviceDetails?.storeData) {
      router.replace('/book-appointment');
    }
  }, [loading, serviceDetails, router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="h-10 w-40 rounded-full bg-white/5 animate-pulse mb-6" />
          <div className="h-4 w-64 rounded bg-white/5 animate-pulse mb-6" />
          
          <div className="grid lg:grid-cols-2 gap-8 items-start relative">
            <div className="lg:col-span-1 space-y-8 h-auto">
              <div className="aspect-video w-full rounded-2xl bg-white/5 animate-pulse" />
              <div className="h-[400px] w-full rounded-3xl bg-white/5 animate-pulse" />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="h-10 w-3/4 rounded-xl bg-white/5 animate-pulse" />
              <div className="h-6 w-1/3 rounded bg-white/5 animate-pulse" />
              <div className="h-6 w-1/2 rounded bg-white/5 animate-pulse" />
              
              <div className="h-24 w-full rounded-xl bg-white/5 animate-pulse" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 rounded-lg bg-white/5 animate-pulse" />
                <div className="h-16 rounded-lg bg-white/5 animate-pulse" />
                <div className="h-16 rounded-lg bg-white/5 animate-pulse" />
                <div className="h-16 rounded-lg bg-white/5 animate-pulse" />
              </div>
              
              <div className="h-14 w-full rounded-full bg-white/5 animate-pulse mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!serviceDetails?.storeData) {
    return <div className="min-h-screen bg-[#0a0a0a]" />;
  }

  const { storeData, provider_rate_cards = [], serviceImages = [], customerRatings = [] } = serviceDetails;

  const amcServiceId = storeData.id || storeData._id || serviceId || null;
  const amcCategoryId =
    storeData.categoryId?._id ||
    storeData.categoryId ||
    storeData.bookingCategoryId ||
    null;
  const amcSubcategoryId =
    subCategoryId ||
    storeData.subCategoryId?._id ||
    storeData.subCategoryId ||
    storeData.subcategoryId ||
    null;

  // Prepare images list (banner + service images)
  // FIXED CODE:
  const images = [
    storeData.bannerImage ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${storeData.bannerImage}` : 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800',
    ...serviceImages.map(img => `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img}`)
  ].filter(Boolean); // Remove any null/undefined images

  const renderDescription = (htmlContent) => {
    if (!htmlContent) {
      return <p className="text-gray-600 text-sm leading-relaxed">No description available.</p>;
    }

    return (
      <div
        className={`rich-text-content article-ck-content text-sm text-gray-700 leading-relaxed ${isExpanded ? '' : 'line-clamp-6'}`}
        dangerouslySetInnerHTML={{
          __html: typeof window !== 'undefined' ? DOMPurify.sanitize(htmlContent, {
            ADD_ATTR: ['target', 'href', 'src', 'alt', 'class', 'style']
          }) : htmlContent,
        }}
      />
    );
  };

  const nextImage = (event) => {
    event?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (event) => {
    event?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleRateCard = (card) => {
    setSelectedCards(prev => {
        // Use a more specific key for comparison
        const getCardKey = (c) => {
            if (c._id) return `id-${c._id}`;
            if (c.id) return `id-${c.id}`;
            // If no ID, use title and price as a combined key
            return `val-${c.title}-${c.price}`;
        };

        const targetKey = getCardKey(card);
        const isAlreadySelected = prev.some(c => getCardKey(c) === targetKey);

        if (isAlreadySelected) {
            return prev.filter(c => getCardKey(c) !== targetKey);
        }
        return [...prev, card]; // Multi-selection enabled
    });
  };

  const getMetaDescription = () => {
    const store = serviceDetails?.storeData || {};
    // Check root seo object and storeData for Admin Panel SEO Description (NO FALLBACKS)
    const text =
      serviceDetails?.seo?.description ||
      store.seoDescription ||
      serviceDetails?.seoDescription ||
      store.seo_description ||
      serviceDetails?.seo_description ||
      serviceDetails?.seoData?.seoDescription ||
      serviceDetails?.seoSettings?.seoDescription ||
      '';
    if (!text || typeof text !== 'string') return null;
    const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
    return cleanText || null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-20"
    >
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(3, 113, 102, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(3, 113, 102, 0.8);
        }
      `}</style>
      {/* Hero Section with Service Accent Color */}
      <section className="relative py-12">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(135deg, #025a51 0%, ${accentColor} 50%, #037166 100%)`,
          }}
        />

        {/* Animated glow orb */}
        <motion.div initial={false}

          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-2">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/services');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all text-xs sm:text-sm font-bold shrink-0 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* Top Center-Aligned Header: H1 Title & SEO Description */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center max-w-4xl mx-auto mb-6 px-2 space-y-2"
          >
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight truncate text-center">
              {storeData.name || storeData.title}
            </h1>

            {getMetaDescription() && (
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto font-medium text-center line-clamp-2">
                {getMetaDescription()}
              </p>
            )}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 items-start">
            {/* LEFT Column: Image Gallery + Service Highlights Card */}
            <div className="lg:col-span-1 space-y-4">
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full"
              >
                <div className="relative rounded-2xl overflow-hidden bg-[#1a1a1a]/40 backdrop-blur-xl border border-white/10 p-2 shadow-xl">
                  <div
                    className="relative w-full rounded-xl overflow-hidden shadow-inner"
                    style={{ aspectRatio: '16/8' }}
                    onClick={() => {
                      setSelectedImageIndex(currentImageIndex);
                      setIsLightboxOpen(true);
                    }}
                  >
                    <img loading="lazy" decoding="async"
                      src={images[currentImageIndex]}
                      alt={storeData.name}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                      fetchpriority="high"
                    />

                    {/* Image Counter Badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10">
                      {currentImageIndex + 1} / {images.length}
                    </div>

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition-all flex items-center justify-center text-white border border-white/10"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition-all flex items-center justify-center text-white border border-white/10"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {images.length > 1 && (
                    <div className="flex gap-2 mt-2 p-1 overflow-x-auto">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentImageIndex(idx);
                            setSelectedImageIndex(idx);
                            setIsLightboxOpen(true);
                          }}
                          className={`relative w-12 h-12 rounded-lg overflow-hidden transition-all flex-shrink-0 border-2 ${currentImageIndex === idx
                            ? 'border-[#037166] scale-105 shadow-md'
                            : 'border-white/10 opacity-60 hover:opacity-100'
                            }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Service Info & Details Card */}
              <div className="bg-[#1a1a1a]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
                {/* About Service Detailed Description */}
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">About Service Overview</h3>
                  <div className="text-white/80 text-xs leading-relaxed">
                    {renderDescription(storeData.description)}
                  </div>
                  {storeData.description?.length > 125 && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#04a99d] font-bold mt-1.5 text-[11px] hover:underline focus:outline-none block">
                      {isExpanded ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  {[
                    { icon: Shield, text: 'Verified & Insured' },
                    { icon: Award, text: '30-90 Day Warranty' },
                    { icon: Clock, text: 'Same-Day Service' },
                    { icon: ThumbsUp, text: 'Satisfaction Guaranteed' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[#04a99d]/20">
                        <item.icon className="w-3.5 h-3.5 text-[#04a99d]" />
                      </div>
                      <span className="text-white/90 text-[10px] font-medium truncate">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT Column: Sticky Tabbed Content Section + AMC Banner & Book Appointment CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-1 sticky top-24 space-y-3"
            >
              <div className="bg-[#1a1a1a]/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden p-4 sm:p-5 mb-2">
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 border-b border-white/10 pb-3 overflow-x-auto">
                  {['About Service', 'Working Images', 'Ratings'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-full font-semibold transition-all whitespace-nowrap text-xs tracking-wide ${activeTab === tab
                        ? 'bg-[#037166] text-white shadow-md shadow-[#037166]/20'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {/* About Service Tab — Displays Rate Cards */}
                  {(activeTab === 'About Service' || activeTab === 'services') && (
                    <motion.div
                      key="services"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="mb-4" id="rate-cards-section">
                        <h3 className="text-base font-bold text-white mb-0.5">Select Service / Rate Cards</h3>
                        <p className="text-white/40 text-[11px] italic">
                          Approximate service rates ({selectedCards.length} selected)
                        </p>
                      </div>
                      <div className="grid gap-2.5 max-h-[440px] overflow-y-auto pr-2 pb-4 custom-scrollbar">
                         {provider_rate_cards.length > 0 ? provider_rate_cards.map((card, index) => {
                          const isSelected = selectedCards.some(c => {
                            const getCardKey = (item) => {
                              if (item._id) return `id-${item._id}`;
                              if (item.id) return `id-${item.id}`;
                              return `val-${item.title}-${item.price}`;
                            };
                            return getCardKey(c) === getCardKey(card);
                          });
                           const cardImage = getRateCardImage(card);
                           return (
                             <div
                               role="button"
                               tabIndex={0}
                               key={card._id || card.id || index}
                               onClick={() => toggleRateCard(card)}
                               aria-pressed={isSelected}
                               className={`w-full p-3.5 rounded-xl border text-left transition-all group ${
                                 isSelected
                                   ? 'bg-[#037166]/30 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] ring-1 ring-white/40'
                                   : 'bg-white/5 border-white/10 hover:border-[#037166]/50'
                               }`}
                             >
                               <div className="flex items-center gap-3">
                                 <div
                                   className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                                     isSelected ? 'bg-[#037166] text-white' : 'bg-white/10 text-white/40'
                                   }`}
                                 >
                                   {isSelected && <Check className="w-4 h-4" />}
                                 </div>

                                 {cardImage && (
                                   <img loading="lazy" decoding="async"
                                     src={cardImage}
                                     alt={card.title || 'Service rate card'}
                                     className="w-14 h-14 rounded-lg object-cover border border-white/10 flex-shrink-0"
                                   />
                                 )}

                                 <div className="flex-1 pr-2 min-w-0">
                                   <h6 className={`font-bold transition-colors leading-snug mb-0.5 text-xs truncate ${
                                     isSelected ? 'text-[#6ed0c8]' : 'text-white group-hover:text-[#04a99d]'
                                   }`}>{card.title}</h6>
                                   {card.reason && (
                                     <p className="text-white/40 text-[10px] leading-relaxed line-clamp-1">{card.reason}</p>
                                   )}
                                 </div>

                                 <div className="flex flex-col items-end justify-between flex-shrink-0">
                                   <div className="text-[#04a99d] font-black text-sm whitespace-nowrap">
                                     <span className="text-white/40 text-[9px] block font-normal italic">Starts from</span>
                                     ₹{card.price}+
                                   </div>

                                   {/* See More Button if images exist */}
                                   {(card.serviceCardImages?.length > 0 || card.images?.length > 0) && (
                                     <button
                                       type="button"
                                       onClick={(event) => {
                                         event.stopPropagation();
                                         setRateCardModal({
                                           isOpen: true,
                                           images: card.serviceCardImages || card.images,
                                           currentIndex: 0,
                                           title: card.title
                                         });
                                       }}
                                       className="flex items-center gap-1 px-2 py-0.5 rounded border border-white/10 text-[9px] font-bold uppercase tracking-wider text-[#04a99d] hover:bg-[#037166] hover:text-white transition-all bg-white/5 backdrop-blur-sm shadow-sm mt-1"
                                     >
                                       Images
                                       <ArrowRight className="w-2.5 h-2.5" />
                                     </button>
                                   )}
                                 </div>
                               </div>
                             </div>
                           );
                         }) : <div className="text-center py-8 text-white/40 border border-white/10 border-dashed rounded-xl text-xs">No service rates available.</div>}
                      </div>
                    </motion.div>
                  )}

                  {/* Working Images Tab */}
                  {activeTab === 'Working Images' && (
                    <motion.div
                      key="portfolio"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <h3 className="text-base font-bold text-white mb-4">Working Images</h3>
                      {serviceImages.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {serviceImages.map((img, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedImageIndex(idx + 1);
                                setIsLightboxOpen(true);
                              }}
                              className="aspect-square rounded-xl overflow-hidden group cursor-pointer relative border border-white/10"
                            >
                              <img loading="lazy" decoding="async"
                                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img}`}
                                alt={`Portfolio ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-white/60 bg-white/5 rounded-xl border border-white/10 border-dashed text-xs">
                          No portfolio images available
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Ratings Tab */}
                  {(activeTab === 'Ratings' || activeTab === 'reviews') && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <h3 className="text-base font-bold text-white mb-4">Ratings & Customer Reviews</h3>
                      {customerRatings.length > 0 ? (
                        <div className="space-y-3">
                          {customerRatings.slice(0, visibleReviews).map((review, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#037166]/30 transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#037166] flex items-center justify-center font-bold text-white flex-shrink-0 text-xs">
                                  {review.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="text-white font-bold text-xs">{review.name}</h5>
                                    <span className="text-white/40 text-[10px]">
                                      {new Date(review.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-0.5 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${i < review.rating
                                          ? 'fill-[#fbbf24] text-[#fbbf24]'
                                          : 'text-white/20'
                                          }`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-white/80 text-xs leading-relaxed">{review.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {customerRatings.length > visibleReviews && (
                            <div className="flex justify-center mt-4">
                              <button
                                onClick={() => setVisibleReviews(prev => prev + 4)}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors border border-white/20"
                              >
                                Show More Reviews
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-white/60 bg-white/5 rounded-xl border border-white/10 border-dashed text-xs">
                          No reviews available yet
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-3">
                <AmcServiceCoverage
                  eligibility={amcEligibility}
                  loading={amcLoading}
                  onSubscribeClick={handleAmcSubscribeClick}
                  planPrice={amcPlanPrice}
                />
              </div>

              <button
                type="button"
                onClick={handleBookAppointment}
                className="w-full mt-3 px-5 py-3 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 group focus:outline-none"
              >
                Book Appointment
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Fixed Sticky Bottom CTA Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121212]/95 backdrop-blur-md border-t border-white/10 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">
              {selectedCards.length > 0 ? `${selectedCards.length} Selected` : storeData.name || storeData.title}
            </span>
            <span className="text-sm font-black text-[#04a99d]">
              {selectedCards.length > 0
                ? `₹${selectedCards.reduce((sum, card) => sum + (Number(card.price) || 0), 0)}`
                : 'Select Service Rate Cards'}
            </span>
          </div>
          <button
            onClick={handleBookAppointment}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-extrabold text-xs uppercase tracking-wider shadow-md active:scale-95 flex items-center gap-1.5"
          >
            Book Appointment
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

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
              <img loading="lazy" decoding="async"
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
      {/* Rate Card Images Modal */}
      <AnimatePresence>
        {rateCardModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 sm:p-8"
          >
            {/* Close Button */}
            <button
              onClick={() => setRateCardModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md z-[120]"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Service Title */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center w-full px-12 z-[120]">
              <h4 className="text-lg sm:text-2xl font-bold text-white mb-1 drop-shadow-lg">
                {rateCardModal.title}
              </h4>
              <p className="text-white/40 text-xs sm:text-sm uppercase tracking-widest font-medium">Service Reference</p>
            </div>

            {/* Navigation Arrows */}
            {rateCardModal.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRateCardModal(prev => ({
                      ...prev,
                      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
                    }));
                  }}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/20 transition-all z-[120]"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRateCardModal(prev => ({
                      ...prev,
                      currentIndex: (prev.currentIndex + 1) % prev.images.length
                    }));
                  }}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/20 transition-all z-[120]"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Main Image Container */}
            <motion.div
              layoutId={`rate-card-image-${rateCardModal.currentIndex}`}
              className="relative max-w-4xl w-full h-[60vh] sm:h-[70vh] flex items-center justify-center rounded-3xl overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={rateCardModal.currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${rateCardModal.images[rateCardModal.currentIndex]}`}
                  alt={rateCardModal.title}
                  className="w-full h-full object-contain shadow-2xl"
                />
              </AnimatePresence>

              {/* Counter Indicator */}
              {rateCardModal.images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-white/80 text-xs font-bold flex gap-2">
                  {rateCardModal.images.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === rateCardModal.currentIndex ? 'bg-[#04a99d] w-4' : 'bg-white/20'}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

