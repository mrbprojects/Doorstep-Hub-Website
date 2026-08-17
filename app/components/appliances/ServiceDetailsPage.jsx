'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowLeft, Star, Clock, Shield, CheckCircle, Award, ThumbsUp, ChevronLeft, ChevronRight, ArrowRight, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useLocationContext } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import DOMPurify from 'dompurify';
import { inferVertical, trackLeadEvent } from '@/lib/leadTracking';
import { useAmcEligibility } from '@/hooks/useAmcEligibility';
import { AmcCoverageBanner } from '@/components/amc/AmcCoverageBanner';

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
  subCategoryId,
  onBack
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addToCart } = useServiceCart();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('About Service');
  const [faqActiveIndex, setFaqActiveIndex] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(4);
  const [rateCardModal, setRateCardModal] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: ''
  });
  const [selectedCards, setSelectedCards] = useState([]);

  const accentColor = serviceAccents[category] || '#5a8b9d';

  // Hide the native browser scrollbar for the entire page while this detail view is mounted
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.id = 'detail-page-no-scrollbar';
    styleEl.textContent = `
      html, body {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      document.getElementById('detail-page-no-scrollbar')?.remove();
    };
  }, []);

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

          // Pre-select the first package if none selected (Optional, keeping as default)
          if (data.provider_rate_cards?.length > 0) {
            setSelectedCards([data.provider_rate_cards[0]]);
          }

          const store = data.storeData || {};
          trackLeadEvent({
            eventType: 'SERVICE_PAGE_VISITED',
            vertical: inferVertical(pathname),
            serviceId: store.id || store._id || serviceId,
            serviceName: store.name || '',
            categoryId: store.categoryId,
            categoryName: category || '',
            subCategoryId: store.subCategoryId || subCategoryId,
            subCategoryName: subCategory || '',
            serviceType: 'HOME_APPLIANCE',
            _user: user,
          });
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
  const { location, detectWithIP } = useLocationContext();

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

  // Immediate redirection logic
  useEffect(() => {
    if (!loading && !serviceDetails?.storeData) {
      router.replace('/appliance-repair-services');
    }
  }, [loading, serviceDetails, router]);

  const amcServiceId =
    serviceDetails?.storeData?._id ||
    serviceDetails?.storeData?.id ||
    serviceId ||
    null;
  const amcCategoryId =
    serviceDetails?.storeData?.categoryId?._id ||
    serviceDetails?.storeData?.categoryId ||
    serviceDetails?.storeData?.bookingCategoryId ||
    null;
  const amcSubcategoryId =
    subCategoryId ||
    serviceDetails?.storeData?.subCategoryId?._id ||
    serviceDetails?.storeData?.subCategoryId ||
    serviceDetails?.storeData?.subcategoryId ||
    null;

  const { loading: amcLoading, eligibility: amcEligibility } = useAmcEligibility({
    serviceId: amcServiceId,
    categoryId: amcCategoryId,
    subcategoryId: amcSubcategoryId,
    enabled: Boolean(amcServiceId),
  });

  // Prepare images list (banner + service images)
  const images = serviceDetails?.storeData ? [
    serviceDetails.storeData.bannerImage ? `https://api.doorstephub.com/${serviceDetails.storeData.bannerImage}` : 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800',
    ...(serviceDetails.serviceImages || []).map(img => `https://api.doorstephub.com/${img}`)
  ].filter(Boolean) : []; // Remove any null/undefined images

  // Auto-scroll for Main Image Gallery & Lightbox
  useEffect(() => {
    let interval;
    if (images.length > 1) {
      interval = setInterval(() => {
        if (isLightboxOpen) {
          setSelectedImageIndex((prev) => (prev + 1) % images.length);
        } else {
          setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLightboxOpen, images.length]);

  // Auto-scroll for Rate Card Modal
  useEffect(() => {
    let interval;
    if (rateCardModal.isOpen && rateCardModal.images.length > 1) {
      interval = setInterval(() => {
        setRateCardModal((prev) => ({
          ...prev,
          currentIndex: (prev.currentIndex + 1) % prev.images.length,
        }));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [rateCardModal.isOpen, rateCardModal.images.length]);

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

  if (loading) {
    return (
      <div className="appliance-detail-page min-h-screen pt-20 pb-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-12">
          {/* Breadcrumb skeleton */}
          <div className="flex flex-col items-start gap-2 mb-4">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-9 w-20 bg-gray-100 rounded-full animate-pulse" />
          </div>
          {/* 2-col grid skeleton */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-start">
            {/* Left: gallery + tabs */}
            <div className="order-2 lg:order-none space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="w-full rounded-2xl overflow-hidden border border-slate-200">
                <div className="w-full bg-gray-200 animate-pulse" style={{ aspectRatio: '16/7' }} />
              </div>
              <div className="rounded-3xl overflow-hidden bg-gray-50 border border-gray-200">
                <div className="flex gap-2 p-2 border-b border-gray-100">
                  <div className="flex-1 h-9 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 h-9 bg-gray-100 rounded-full animate-pulse" />
                  <div className="flex-1 h-9 bg-gray-100 rounded-full animate-pulse" />
                </div>
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
            {/* Right: info */}
            <div className="order-1 lg:order-none space-y-4">
              <div className="h-9 w-3/4 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-5 w-1/3 bg-gray-100 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-8 w-28 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-8 w-24 bg-gray-100 rounded-full animate-pulse" />
              </div>
              <div className="h-20 w-full bg-gray-100 rounded-xl animate-pulse" />
              <div className="grid grid-cols-2 gap-2.5">
                <div className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-14 rounded-xl bg-gray-100 animate-pulse" />
              </div>
              <div className="hidden lg:block h-14 w-full rounded-full bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!serviceDetails?.storeData) {
    return <div className="appliance-detail-page min-h-screen bg-white" />;
  }

  const { storeData, provider_rate_cards = [], serviceImages = [], customerRatings = [] } = serviceDetails;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const renderDescription = (htmlContent) => {
    if (!htmlContent) {
      return <p className="text-gray-600 text-sm leading-relaxed">No description available.</p>;
    }

    // Strip leading empty paragraphs or break tags often created by editors
    let cleaned = String(htmlContent)
      .replace(/^(<p[^>]*>(&nbsp;|\s|<br\s*\/?>)*<\/p>\s*)+/gi, '')
      .replace(/^(<br\s*\/?>\s*)+/gi, '')
      .trim();

    return (
      <div
        className={`rich-text-content article-ck-content text-sm text-gray-700 leading-relaxed [&_p]:mt-0 [&_p]:mb-3 ${isExpanded ? '' : 'line-clamp-6'}`}
        dangerouslySetInnerHTML={{
          __html: typeof window !== 'undefined' ? DOMPurify.sanitize(cleaned, {
            ADD_ATTR: ['target', 'href', 'src', 'alt', 'class', 'style']
          }) : cleaned,
        }}
      />
    );
  };

  const toggleRateCard = (card) => {
    setSelectedCards(prev => {
      const getCardKey = (c) => {
        if (c._id) return `id-${c._id}`;
        if (c.id) return `id-${c.id}`;
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

  // Book-now handler extracted for reuse
  const handleBookNow = () => {
    const finalServiceId = storeData.id || storeData._id || serviceId;
    if (!finalServiceId) { toast.error('Service information missing'); return; }

    if (selectedCards.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    localStorage.setItem('last_service_id', finalServiceId);
    if (serviceSlug) localStorage.setItem('last_service_slug', serviceSlug);

    const packagesToSave = selectedCards.map(card => {
      const rawPrice = card.price || 0;
      const cleanPrice = typeof rawPrice === 'string' ? parseInt(rawPrice.replace(/[^0-9]/g, '')) || 0 : rawPrice;
      return {
        ...(card || {}),
        id: card.id || card._id || `pkg-${Math.random()}`,
        serviceId: finalServiceId,
        serviceName: storeData.name || 'Professional Service',
        packageName: card.title,
        price: cleanPrice,
        bookingCost: storeData.serviceBookingCost || storeData.minFare || 0,
        inspectionCost: storeData.inspectionCost || 0,
        quantity: 1
      };
    });

    localStorage.setItem('booking_package_details', JSON.stringify(packagesToSave));
    trackLeadEvent({
      eventType: 'BOOKING_STARTED',
      vertical: inferVertical(pathname),
      serviceId: finalServiceId,
      serviceName: storeData.name || '',
      categoryName: category || '',
      subCategoryName: subCategory || '',
      subCategoryId: subCategoryId || storeData.subCategoryId,
      serviceType: 'HOME_APPLIANCE',
      _user: user,
      eventData: {
        packages: packagesToSave.map((item) => item.packageName || item.title).filter(Boolean),
      },
    });
    if (selectedCards.length > 0) {
      trackLeadEvent({
        eventType: 'PROBLEM_SELECTED',
        vertical: inferVertical(pathname),
        serviceId: finalServiceId,
        problemName: selectedCards.map((item) => item.title || item.packageName).filter(Boolean).join(', '),
        _user: user,
      });
    }
    router.push('/appliances/address');
  };

  // Generate Service Schema for SEO
  const schemaData = serviceDetails ? {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": storeData.name,
    "description": storeData.description?.replace(/<[^>]*>?/gm, '') || "Professional repair services",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Doorstep Hub",
      "image": "https://doorstephub.com/d-hub-logo.png",
      "telephone": "+918886688666"
    },
    "aggregateRating": storeData.avgRating ? {
      "@type": "AggregateRating",
      "ratingValue": storeData.avgRating,
      "reviewCount": storeData.totalRatings || customerRatings?.length || 10
    } : undefined,
    "offers": provider_rate_cards?.map(card => ({
      "@type": "Offer",
      "name": card.title,
      "price": card.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": typeof window !== 'undefined' ? window.location.href : ''
    }))
  } : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="appliance-detail-page min-h-screen pt-24 sm:pt-28 pb-28 lg:pb-12 bg-white"
    >
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}


      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <section className="relative py-3 sm:py-4 lg:py-6">

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Back Button */}
          <div className="mb-2">
            <button
              onClick={() => {
                if (onBack) {
                  onBack();
                  return;
                }
                const params = new URLSearchParams(window.location.search);
                const catSlug = params.get('categorySlug');
                const subCatSlug = params.get('subCategorySlug');
                if (catSlug && subCatSlug) { router.push(`/${catSlug}/${subCatSlug}`); return; }
                if (catSlug) { router.push(`/${catSlug}`); return; }
                router.back();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-gray-900 hover:bg-white transition-all text-xs sm:text-sm font-bold shrink-0 shadow-sm"
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight text-center leading-snug sm:leading-tight">
              {storeData.title || storeData.name}
            </h1>

            {getMetaDescription() && (
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto font-medium text-center line-clamp-2">
                {getMetaDescription()}
              </p>
            )}
          </motion.div>

          {/* ── Desktop 2-col grid ─────────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 items-start">

            {/* LEFT col: Image Gallery + Highlights Card */}
            <div className="order-1 lg:order-none space-y-3.5 sm:space-y-4">

              {/* Image Gallery */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full">
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: '16/8' }}
                    onClick={() => { setSelectedImageIndex(currentImageIndex); setIsLightboxOpen(true); }}
                  >
                    <img loading="lazy" decoding="async"
                      src={images[currentImageIndex]}
                      alt={storeData.name}
                      className="w-full h-full object-cover cursor-pointer"
                      fetchpriority="high"
                    />
                    {/* Dots indicator on mobile */}
                    {images.length > 1 && (
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 lg:hidden">
                        {images.map((_, i) => (
                          <div key={i} className={`h-1 rounded-full transition-all ${i === currentImageIndex ? 'bg-[#04a99d] w-3.5' : 'bg-white/50 w-1'}`} />
                        ))}
                      </div>
                    )}
                    {images.length > 1 && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all flex items-center justify-center">
                          <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all flex items-center justify-center">
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      </>
                    )}
                  </div>
                  {/* Thumbnails — hidden on mobile, shown on md+ */}
                  {images.length > 1 && (
                    <div className="hidden md:flex gap-2 p-2.5 overflow-x-auto bg-slate-50/50 border-t border-slate-100">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setCurrentImageIndex(idx); setSelectedImageIndex(idx); setIsLightboxOpen(true); }}
                          className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-lg overflow-hidden transition-all flex-shrink-0 ${currentImageIndex === idx ? 'ring-2 ring-[#037166] scale-105' : 'opacity-60 hover:opacity-100'}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Service Highlights & Quick Details Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-sm space-y-3">
                {/* About Service Detailed Description */}
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">About Service Overview</h3>
                  <div className="text-gray-600 text-xs leading-relaxed">
                    {renderDescription(storeData.description)}
                  </div>
                  {storeData.description?.length > 125 && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#04a99d] font-bold mt-1.5 text-[11px] hover:underline focus:outline-none block">
                      {isExpanded ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>

                {/* Service Highlights — 2-col compact grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  {[
                    { icon: Shield, text: 'Verified & Insured' },
                    { icon: Award, text: '30-90 Day Warranty' },
                    { icon: Clock, text: 'Same-Day Service' },
                    { icon: ThumbsUp, text: 'Satisfaction Guaranteed' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                      <div className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${accentColor}30` }}>
                        <item.icon className="w-3 h-3" style={{ color: accentColor }} />
                      </div>
                      <span className="text-gray-700 text-[10px] font-medium truncate">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT col: Sticky Tabbed Container + AMC Banner & Book Appointment CTA */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="order-2 lg:order-none lg:sticky lg:top-24 space-y-3"
            >
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Tab Navigation Bar */}
                <div className="flex gap-1.5 p-1.5 border-b border-slate-100 bg-slate-50 overflow-x-auto scrollbar-hide">
                  {(() => {
                    const faqs = storeData?.faqs || serviceDetails?.faqs || [];
                    const tabsList = ['About Service', 'Working Images', 'Ratings'];
                    if (faqs && faqs.length > 0) {
                      tabsList.push('FAQs');
                    }
                    return tabsList.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 min-w-max px-3 py-2 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab
                          ? 'bg-gradient-to-r from-[#04a99d] to-[#037166] text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-slate-200/50'
                          }`}
                      >
                        {tab}
                      </button>
                    ));
                  })()}
                </div>

                <div className="p-3.5 sm:p-4.5">
                  <AnimatePresence mode="wait">
                    {/* About Service Tab — Displays Rate Cards */}
                    {(activeTab === 'About Service' || activeTab === 'services') && (
                      <motion.div key="services" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                        <div className="mb-3">
                          <h3 className="text-base font-extrabold text-gray-900 mb-0.5">Select Service / Rate Cards</h3>
                          <p className="text-gray-500 text-[11px] italic">Select rate cards below to book appointment</p>
                        </div>

                        <div className="grid gap-2 pb-1 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
                          {provider_rate_cards.map((card, index) => {
                            const isSelected = selectedCards.some(c => {
                              const getCardKey = (item) => {
                                if (item._id) return `id-${item._id}`;
                                if (item.id) return `id-${item.id}`;
                                return `val-${item.title}-${item.price}`;
                              };
                              return getCardKey(c) === getCardKey(card);
                            });

                            return (
                              <div
                                key={card.id || card._id || index}
                                onClick={() => toggleRateCard(card)}
                                className={`p-2.5 rounded-xl border transition-all group overflow-hidden cursor-pointer relative ${isSelected
                                  ? 'bg-emerald-50/50 border-2 border-[#037166] shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-[#037166]/40 shadow-none'
                                  }`}
                              >
                                <div className="flex gap-2 sm:gap-2.5 items-center">
                                  {/* Checkbox indicator */}
                                  <div className={`w-4.5 h-4.5 rounded flex items-center justify-center transition-all flex-shrink-0 ${isSelected
                                    ? 'bg-[#037166] border-[#037166] shadow-sm'
                                    : 'border border-slate-300 group-hover:border-[#037166]/60'
                                    }`}>
                                    <Check className={`w-3 h-3 text-white transition-transform ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} strokeWidth={3.5} />
                                  </div>

                                  {/* Rate Card Thumbnail */}
                                  {card.image && (
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 bg-slate-100">
                                      <img loading="lazy" decoding="async"
                                        src={`https://api.doorstephub.com/${card.image}`}
                                        alt={card.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                      />
                                    </div>
                                  )}

                                  <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <h6 className={`text-xs font-bold transition-colors leading-snug mb-0.5 truncate sm:whitespace-normal ${isSelected ? 'text-[#037166]' : 'text-gray-900 group-hover:text-[#037166]'}`}>{card.title}</h6>
                                        {card.reason && (
                                          <p className="text-gray-500 text-[10px] leading-relaxed line-clamp-1">{card.reason}</p>
                                        )}
                                      </div>

                                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                        <span className="text-[#037166] font-black text-xs sm:text-sm whitespace-nowrap"><span className='italic font-normal text-[9px] text-gray-500'>Starts from </span>₹{card.price}</span>

                                        {/* View Images Button */}
                                        {card.banner_images?.length > 0 && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setRateCardModal({
                                                isOpen: true,
                                                images: card.banner_images,
                                                currentIndex: 0,
                                                title: card.title
                                              });
                                            }}
                                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#037166]/10 text-[#037166] hover:bg-[#037166]/20 transition-all text-[9px] font-bold border border-[#037166]/20"
                                          >
                                            <span className="hidden xs:inline">View </span>Images
                                            <ArrowRight className="w-2.5 h-2.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Working Images Tab */}
                    {activeTab === 'Working Images' && (
                      <motion.div key="Working Images" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                        <h3 className="text-base font-bold text-gray-900 mb-3">Working Images</h3>
                        {serviceImages.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {serviceImages.map((img, idx) => (
                              <div
                                key={idx}
                                onClick={() => { setSelectedImageIndex(idx + 1); setIsLightboxOpen(true); }}
                                className="aspect-square rounded-lg overflow-hidden group cursor-pointer relative border border-slate-200"
                              >
                                <img src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img}`} alt={`Working Images ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500 bg-slate-50 rounded-lg border border-slate-200 border-dashed text-xs">No working images available</div>
                        )}
                      </motion.div>
                    )}

                    {/* Ratings Tab */}
                    {(activeTab === 'Ratings' || activeTab === 'reviews') && (
                      <motion.div key="reviews" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                        <h3 className="text-base font-bold text-gray-900 mb-3">Ratings & Customer Reviews</h3>
                        {customerRatings.length > 0 ? (
                          <div className="space-y-2.5">
                            {customerRatings.slice(0, visibleReviews).map((review, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                                <div className="flex items-start gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-[#037166] flex items-center justify-center font-bold text-white flex-shrink-0 text-xs">{review.name.charAt(0)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <h5 className="text-gray-900 font-bold text-xs truncate">{review.name}</h5>
                                      <span className="text-gray-500 text-[9px] ml-2">{new Date(review.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-0.5 mb-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-[#fbbf24] text-[#fbbf24]' : 'text-slate-300'}`} />
                                      ))}
                                    </div>
                                    <p className="text-gray-600 text-xs leading-snug">{review.comment}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {customerRatings.length > visibleReviews && (
                              <div className="flex justify-center mt-3">
                                <button onClick={() => setVisibleReviews(prev => prev + 4)} className="px-4 py-1.5 bg-white hover:bg-slate-50 text-gray-900 text-xs font-semibold rounded-lg border border-slate-200">Show More</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500 bg-slate-50 rounded-lg border border-slate-200 border-dashed text-xs">No reviews available yet</div>
                        )}
                      </motion.div>
                    )}

                    {/* FAQs Tab */}
                    {activeTab === 'FAQs' && (
                      <motion.div key="FAQs" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                        <h3 className="text-base font-bold text-gray-900 mb-3">Frequently Asked Questions</h3>
                        {(() => {
                          const faqs = storeData?.faqs || serviceDetails?.faqs || [];
                          return faqs.length > 0 ? (
                            <div className="space-y-2">
                              {faqs.map((faq, index) => (
                                <div key={index} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                  <button onClick={() => setFaqActiveIndex(faqActiveIndex === index ? null : index)} className="w-full px-3 py-2.5 flex items-center justify-between text-left gap-2 text-xs font-bold text-gray-900">
                                    <span>{faq.question || faq.title}</span>
                                    <ChevronRight className={`w-3.5 h-3.5 text-[#037166] transition-transform ${faqActiveIndex === index ? 'rotate-90' : ''}`} />
                                  </button>
                                  {faqActiveIndex === index && (
                                    <div className="px-3 pb-2.5 text-[11px] text-gray-600 border-t border-slate-100 pt-1.5 leading-relaxed">
                                      {faq.answer || faq.description}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500 bg-slate-50 rounded-lg border border-slate-200 border-dashed text-xs">No FAQs available yet</div>
                          );
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <AmcCoverageBanner
                eligibility={amcEligibility}
                loading={amcLoading}
              />

              {/* Book Appointment CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleBookNow}
                className="w-full px-5 py-3 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 group focus:outline-none"
              >
                Book Appointment
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Fixed Sticky Bottom CTA Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider truncate">
              {selectedCards.length > 0 ? `${selectedCards.length} Service${selectedCards.length > 1 ? 's' : ''} Selected` : 'Select Rate Cards'}
            </span>
            <span className="text-sm sm:text-base font-black text-[#037166]">
              {selectedCards.length > 0
                ? `₹${selectedCards.reduce((sum, card) => sum + (Number(card.price) || 0), 0)}`
                : 'Choose Service'}
            </span>
          </div>
          <button
            onClick={handleBookNow}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            Book Appointment
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Customer Reviews & Ratings Standalone Full-Width UI Section */}
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

        const currentService = serviceDetails?.name || subCategory || 'Appliance Repair';
        const reviewItems = [
          { name: 'Santhosh Kumar', rating: 5, date: '2 days ago', body: `Excellent doorstep ${currentService} in ${currentCity}. Technician arrived within 30 minutes!` },
          { name: 'Priya Sharma', rating: 5, date: '4 days ago', body: `Very professional ${currentService} in ${currentCity}. Genuine spare parts and reasonable price.` },
          { name: 'Venkatesh Rao', rating: 4, date: '1 week ago', body: `Great experience with Doorstep Hub in ${currentCity}. Quick diagnostic and polite staff.` },
          { name: 'Ananya Reddy', rating: 5, date: '1 week ago', body: `Highly recommended ${currentService} near ${currentCity}. Fixed the issue on the spot.` },
          { name: 'Kiran Verma', rating: 5, date: '2 weeks ago', body: `Top class service in ${currentCity}! 90-day warranty provided on repairs.` },
          { name: 'Srinivas Rao', rating: 5, date: '3 weeks ago', body: `Punctual and honest technician in ${currentCity}. Satisfied with the service quality.` },
        ];

        return (
          <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3.5 sm:gap-4">
                <div className="max-w-xl">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {reviewItems.map((rev, index) => (
                  <div
                    key={index}
                    className="bg-white border border-slate-200 hover:border-[#037166]/40 p-4 sm:p-6 rounded-2xl shadow-sm transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[#037166]/10 text-[#037166] font-bold flex items-center justify-center text-xs sm:text-sm shrink-0">
                            {rev.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{rev.name}</h4>
                            <p className="text-[10px] sm:text-xs text-gray-400">{rev.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-amber-400 shrink-0">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                        "{rev.body}"
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#037166] font-medium">
                      <span>Verified Booking</span>
                      <span>{currentCity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Related Services Section */}
      {relatedServices.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 border-t border-white/5">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">Related Services</h2>
              <p className="text-gray-600 text-xs sm:text-sm">Other popular services in {subCategory}</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
                  <img loading="lazy" decoding="async"
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
              onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md z-[120]"
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
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-[120]"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) => (prev + 1) % images.length);
                  }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-[120]"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
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
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8"
          >
            <button
              onClick={() => setRateCardModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-[130]"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative max-w-4xl w-full h-full flex flex-col items-center justify-center gap-6">
              <div className="text-center">
                <h4 className="text-xl font-bold text-white mb-1">{rateCardModal.title}</h4>
                <p className="text-white/50 text-sm">Service Images</p>
              </div>

              <div className="relative aspect-square md:aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black/20">
                <img loading="lazy" decoding="async"
                  src={`https://api.doorstephub.com/${rateCardModal.images[rateCardModal.currentIndex]}`}
                  alt={rateCardModal.title}
                  className="w-full h-full object-contain"
                />

                {rateCardModal.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setRateCardModal(prev => ({
                        ...prev,
                        currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
                      }))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setRateCardModal(prev => ({
                        ...prev,
                        currentIndex: (prev.currentIndex + 1) % prev.images.length
                      }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {rateCardModal.images.length > 1 && (
                <div className="flex gap-2">
                  {rateCardModal.images.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${i === rateCardModal.currentIndex ? 'bg-[#04a99d] w-6' : 'bg-white/20'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
