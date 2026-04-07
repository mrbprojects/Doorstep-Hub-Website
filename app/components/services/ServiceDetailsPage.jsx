'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Star, Clock, Shield, CheckCircle, Award, ThumbsUp, ChevronLeft, ChevronRight, ArrowRight, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

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
          
          // Pre-select the first package if none selected
          if (data.provider_rate_cards?.length > 0) {
            setSelectedCards([data.provider_rate_cards[0]]);
          }

          // Auto-enrich URL if category or subCategory is missing
          if (!category || !subCategory) {
            try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/all-services`);
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
    return <div className="min-h-screen bg-[#0a0a0a]" />;
  }

  const { storeData, provider_rate_cards = [], serviceImages = [], customerRatings = [] } = serviceDetails;

  // Prepare images list (banner + service images)
  // FIXED CODE:
  const images = [
    storeData.bannerImage ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${storeData.bannerImage}` : 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800',
    ...serviceImages.map(img => `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img}`)
  ].filter(Boolean); // Remove any null/undefined images

  const renderDescription = (htmlContent) => {
    if (!htmlContent) {
      return <p className="text-white/80 text-lg leading-relaxed">No description available.</p>;
    }

    return (
      <div
        className={`rich-text-content ${isExpanded ? '' : 'rich-text-content--collapsed'}`}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(htmlContent),
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
        const exists = prev.find(c => c._id === card._id || c.id === card.id || (c.title === card.title && c.price === card.price));
        if (exists) {
            return prev.filter(c => !(c._id === card._id || c.id === card.id || (c.title === card.title && c.price === card.price)));
        }
        return [...prev, card]; // allow unlimited multi-select or handle as per need
    });
  };

  const getRateCardImage = (card) => {
    const image = card.serviceCardImages?.[0] || card.images?.[0] || card.image;
    return image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${image}` : null;
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
        <motion.div

          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px]"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => {
              // Priority: Go back. Fallback: Services home
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/services');
              }
            }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </motion.button>

          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-sm mb-6"
          >
            {category} → {subCategory} → {storeData.name}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-start relative">
            {/* Left Column: Gallery + Tabs */}
            <div className="lg:col-span-1 space-y-8 h-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative rounded-2xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/10">
                  <div
                    className="relative aspect-video cursor-pointer"
                    onClick={() => {
                      setSelectedImageIndex(currentImageIndex);
                      setIsLightboxOpen(true);
                    }}
                  >
                    <img
                      src={images[currentImageIndex]}
                      alt={storeData.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all flex items-center justify-center"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all flex items-center justify-center"
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Navigation */}
                  {images.length > 1 && (
                    <div className="flex gap-2 p-4 overflow-x-auto">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentImageIndex(idx);
                            setSelectedImageIndex(idx);
                            setIsLightboxOpen(true);
                          }}
                          className={`relative w-20 h-20 rounded-lg overflow-hidden transition-all flex-shrink-0 ${currentImageIndex === idx
                            ? 'ring-2 ring-[#037166] scale-105'
                            : 'opacity-60 hover:opacity-100'
                            }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Tabbed Content Section (Moved Here) */}
              <div className="bg-[#1a1a1a]/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden p-6 md:p-8 mb-28">
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
                  {['About Service', 'Working Images', 'Ratings'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap text-sm tracking-wide ${activeTab === tab
                        ? 'bg-[#037166] text-white shadow-lg shadow-[#037166]/20'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {/* About Service Tab */}
                  {(activeTab === 'About Service' || activeTab === 'services') && (
                    <motion.div
                      key="services"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-1">About Service</h3>
                        <p className="text-white/40 text-xs italic">
                          Approximate service rates ({selectedCards.length} selected)
                        </p>
                      </div>
                      <div className="grid gap-4 max-h-[min(42vh,420px)] overflow-y-auto pr-2 pb-4 custom-scrollbar">
                        {provider_rate_cards.length > 0 ? provider_rate_cards.map((card, index) => {
                          const isSelected = selectedCards.some(c => c._id === card._id || c.id === card.id || (c.title === card.title && c.price === card.price));
                          const cardImage = getRateCardImage(card);
                          return (
                          <div
                            role="button"
                            tabIndex={0}
                            key={card._id || card.id || index}
                            onClick={() => toggleRateCard(card)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                toggleRateCard(card);
                              }
                            }}
                            aria-pressed={isSelected}
                            className={`w-full p-5 rounded-2xl border text-left transition-all group ${
                              isSelected
                                ? 'bg-[#037166]/15 border-[#04a99d]/70 shadow-lg shadow-[#037166]/20'
                                : 'bg-white/5 border-white/10 hover:border-[#037166]/50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                                  isSelected ? 'bg-[#037166] text-white' : 'bg-white/10 text-white/40'
                                }`}
                              >
                                {isSelected && <Check className="w-6 h-6" />}
                              </div>

                              {cardImage && (
                                <img
                                  src={cardImage}
                                  alt={card.title || 'Service rate card'}
                                  className="w-20 h-20 rounded-xl object-cover border border-white/10 flex-shrink-0"
                                />
                              )}

                              <div className="flex-1 pr-4">
                                <h6 className={`font-bold transition-colors leading-snug mb-1 ${
                                  isSelected ? 'text-[#6ed0c8]' : 'text-white group-hover:text-[#04a99d]'
                                }`}>{card.title}</h6>
                                {card.reason && (
                                  <p className="text-white/40 text-xs leading-relaxed">{card.reason}</p>
                                )}

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
                                    className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#04a99d] hover:text-[#037166] transition-colors"
                                  >
                                    See More
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <span className="text-[#04a99d] font-bold text-lg whitespace-nowrap flex-shrink-0">₹{card.price}</span>
                            </div>
                          </div>
                          );
                        }) : <div className="text-center py-12 text-white/40 border border-white/10 border-dashed rounded-2xl">No service rates available.</div>}
                      </div>
                    </motion.div>
                  )}

                  {/* Working Images Tab */}
                  {(activeTab === 'Working Images' || activeTab === 'portfolio') && (
                    <motion.div
                      key="portfolio"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-xl font-bold text-white mb-6">Working Images</h3>
                      {serviceImages.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {serviceImages.map((img, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                // The images array has [banner, ...serviceImages]
                                // So the index for the lightbox should be idx + 1
                                setSelectedImageIndex(idx + 1);
                                setIsLightboxOpen(true);
                              }}
                              className="aspect-square rounded-2xl overflow-hidden group cursor-pointer relative border border-white/10"
                            >
                              <img
                                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img}`}
                                alt={`Portfolio ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-white/60 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                          No portfolio images available
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Ratings Tab */}
                  {(activeTab === 'Ratings' || activeTab === 'reviews') && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-xl font-bold text-white mb-6">Ratings</h3>
                      {customerRatings.length > 0 ? (
                        <div className="space-y-4">
                          {customerRatings.slice(0, visibleReviews).map((review, idx) => (
                            <div
                              key={idx}
                              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#037166]/30 transition-all"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#037166] flex items-center justify-center font-bold text-white flex-shrink-0">
                                  {review.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-white font-bold">{review.name}</h5>
                                    <span className="text-white/40 text-xs">
                                      {new Date(review.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i < review.rating
                                          ? 'fill-[#fbbf24] text-[#fbbf24]'
                                          : 'text-white/20'
                                          }`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-white/80 leading-relaxed text-sm">{review.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {customerRatings.length > visibleReviews && (
                            <div className="flex justify-center mt-6">
                              <button
                                onClick={() => setVisibleReviews(prev => prev + 4)}
                                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-colors border border-white/20"
                              >
                                Show More Reviews
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-white/60 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                          No reviews available yet
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Service Info (Sticky) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1 sticky top-28"
            >
              <h1 className="text-4xl font-bold text-white mb-4">
                {storeData.name}
              </h1>
              <p className="text-white/80 text-lg mb-4">Professional Service</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-[#04a99d] text-[#04a99d]" />
                  <span className="text-white font-medium text-lg">{storeData.avgRating}</span>
                  <span className="text-white/60">({storeData.totalRatings} ratings)</span>
                </div>
                <div className="text-white/60">
                  {storeData.totalOrders}+ Orders
                </div>
              </div>

              <div className="mb-6">
                {renderDescription(storeData.description)}
                {storeData.description?.length > 250 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-[#04a99d] font-bold mt-2 hover:underline focus:outline-none inline-block"
                  >
                    {isExpanded ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </div>

              {/* Service Highlights */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, text: 'Verified & Insured Professional' },
                  { icon: Award, text: '30-90 Days Service Warranty On Repairs' },
                  { icon: Clock, text: 'Same-Day Service' },
                  { icon: ThumbsUp, text: 'Satisfaction Guaranteed' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${accentColor}40` }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: accentColor }} />
                    </div>
                    <h6 className="text-white/90 text-sm font-normal">{item.text}</h6>
                  </div>
                ))}
              </div>

              {/* Booking Button in Hero */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => {
                  const finalServiceId = storeData.id || storeData._id || serviceId;
                  if (!finalServiceId) {
                    toast.error("Service information missing");
                    return;
                  }

                  if (selectedCards.length === 0) {
                    toast.error("Please select at least one service card to proceed");
                    return;
                  }

                  localStorage.setItem('last_service_id', finalServiceId);
                  
                  const itemsToBook = selectedCards.map(card => {
                    const rawPrice = card.price || 0;
                    const cleanPrice = typeof rawPrice === 'string'
                      ? parseInt(rawPrice.replace(/[^0-9]/g, '')) || 0
                      : rawPrice;

                    return {
                      ...(card || {}),
                      id: card.id || card._id || `pkg-${Math.random()}`,
                      serviceId: finalServiceId,
                      serviceName: storeData.name || 'Professional Service',
                      packageName: card.title || 'Standard Package',
                      price: cleanPrice,
                      bookingCost: storeData.serviceBookingCost || storeData.minFare || 0,
                      inspectionCost: storeData.inspectionCost || 0,
                      quantity: 1
                    };
                  });

                  localStorage.setItem('booking_package_details', JSON.stringify(itemsToBook));
                  router.push('/appliances/address');
                }}
                className="w-full mt-6 px-10 py-4 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold text-lg hover:shadow-2xl hover:shadow-[#037166]/40 transition-all flex items-center justify-center gap-3 group"
              >
                Book This Service Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </div>
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

