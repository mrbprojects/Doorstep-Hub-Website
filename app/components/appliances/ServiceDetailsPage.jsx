'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Clock,
  ShieldCheck,
  Award,
  Check,
  Calendar,
  Layers,
  IndianRupee,
  Home,
  Volume2,
  RotateCw,
  Fan,
  Flame,
  Thermometer,
  Power,
  Droplets,
  Tv,
  Zap,
  Wrench,
  Settings,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocationContext } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import DOMPurify from 'dompurify';
import { inferVertical, trackLeadEvent } from '@/lib/leadTracking';
import { useAmcEligibility } from '@/hooks/useAmcEligibility';
import { AmcCoverageBanner } from '@/components/amc/AmcCoverageBanner';
import { API_BASE_URL, getImageUrl } from '@/config/env';
import { AdSenseUnit } from '@/components/sell-buy/ads/AdSenseUnit';
import { ADSENSE_CONFIG } from '@/config/adsense';

// Helper to intelligently match issue cards to icons
const getIssueIcon = (text = '') => {
  const t = text.toLowerCase();
  if (t.includes('noise') || t.includes('sound') || t.includes('humming') || t.includes('buzz') || t.includes('rattle') || t.includes('grind')) {
    return Volume2;
  }
  if (t.includes('turntable') || t.includes('tray') || t.includes('motor') || t.includes('rotate') || t.includes('spinning') || t.includes('drum')) {
    return RotateCw;
  }
  if (t.includes('fan') || t.includes('air') || t.includes('blower') || t.includes('cool')) {
    return Fan;
  }
  if (t.includes('spark') || t.includes('tripping') || t.includes('mcb') || t.includes('short') || t.includes('circuit') || t.includes('voltage') || t.includes('power issue')) {
    return Zap;
  }
  if (t.includes('heat') || t.includes('warm') || t.includes('burn') || t.includes('overheat')) {
    return Flame;
  }
  if (t.includes('temp') || t.includes('thermostat') || t.includes('sensor') || t.includes('cut off')) {
    return Thermometer;
  }
  if (t.includes('power') || t.includes('turning on') || t.includes('start') || t.includes('switch') || t.includes('dead') || t.includes('no response')) {
    return Power;
  }
  if (t.includes('leak') || t.includes('drip') || t.includes('water') || t.includes('drain') || t.includes('overflow')) {
    return Droplets;
  }
  if (t.includes('door') || t.includes('hinge') || t.includes('latch') || t.includes('lock')) {
    return Settings;
  }
  if (t.includes('display') || t.includes('screen') || t.includes('light') || t.includes('panel') || t.includes('black screen')) {
    return Tv;
  }
  return Wrench;
};

// Clean HTML entities for clean reading
const cleanHtmlEntities = (str = '') => {
  if (!str) return '';
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

export function ServiceDetailsPage({
  serviceId,
  serviceSlug,
  category,
  subCategory,
  subCategoryId,
  onBack
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [isExpandedDescription, setIsExpandedDescription] = useState(false);

  // Fetch Service Details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId && !serviceSlug) return;
      setLoading(true);
      try {
        let response;
        if (serviceSlug) {
          response = await fetch(`${API_BASE_URL}/app/applience-repairs-website/dhub_service_details/${serviceSlug}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });

          if (!response.ok) {
            const allRes = await fetch(`${API_BASE_URL}/app/applience-repairs-website/all-services`);
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
                response = await fetch(`${API_BASE_URL}/app/applience-repairs-website/dhub_service_details/${matchedId}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({}),
                });
              }
            }
          }
        } else if (serviceId) {
          response = await fetch(`${API_BASE_URL}/app/applience-repairs-website/dhub_service_details/${serviceId}`, {
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
              const res = await fetch(`${API_BASE_URL}/app/applience-repairs-website/all-services`);
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

          // Pre-select the first package if none selected
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
  }, [serviceId, serviceSlug, category, subCategory, subCategoryId, router, pathname, user]);

  // Fetch related services
  const [relatedServices, setRelatedServices] = useState([]);
  const { location } = useLocationContext();

  useEffect(() => {
    const fetchRelated = async () => {
      if (!subCategoryId || !location?.lat || !location?.lng) return;
      try {
        const response = await fetch(`${API_BASE_URL}/app/applience-repairs-website/services_by_subcategory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subcategoryId: subCategoryId,
            lattitude: location.lat,
            longitude: location.lng,
            cityName: location.city || '',
            city: location.city || '',
          })
        });

        const data = await response.json();
        if (data.success) {
          const filtered = (data.dhubServices || []).filter(s => s._id !== serviceId && s.slug !== serviceSlug);
          setRelatedServices(filtered.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching related services:", error);
      }
    };

    fetchRelated();
  }, [subCategoryId, location, serviceId, serviceSlug]);

  // Redirection fallback if service not found
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

  const getMetaDescription = () => {
    const store = serviceDetails?.storeData || {};
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
    return cleanHtmlEntities(cleanText) || null;
  };

  const { storeData, provider_rate_cards = [], customerRatings = [] } = serviceDetails || {};

  // Toggle rate card selection
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
      return [...prev, card];
    });
  };

  // Booking Flow Handler
  const handleBookNow = () => {
    const finalServiceId = storeData?.id || storeData?._id || serviceId;
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

  const handleBack = () => {
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
  };

  const cleanServiceName = useMemo(() => {
    return cleanHtmlEntities(storeData?.name || 'Appliance')
      .replace(/services?|repairs?/gi, '')
      .trim();
  }, [storeData?.name]);

  // Derive common issues from linked rate cards
  const commonIssuesList = useMemo(() => {
    if (provider_rate_cards && provider_rate_cards.length > 0) {
      return provider_rate_cards.map(card => {
        const cleanTitle = cleanHtmlEntities(card.title);
        const cleanReason = cleanHtmlEntities(card.reason || '');
        return {
          title: cleanTitle.replace(/Repair|Service|Services|Fix|Replacement/gi, '').trim() || cleanTitle,
          fullTitle: cleanTitle,
          reason: cleanReason,
          icon: getIssueIcon(`${cleanTitle} ${cleanReason}`)
        };
      });
    }
    return [];
  }, [provider_rate_cards]);

  // Sanitized CKEditor backend HTML content
  const storeDescription = storeData?.description;
  const sanitizedDescription = useMemo(() => {
    if (!storeDescription) return '';
    const cleaned = cleanHtmlEntities(storeDescription);
    return typeof window !== 'undefined'
      ? DOMPurify.sanitize(cleaned, {
          ADD_ATTR: ['target', 'href', 'src', 'alt', 'class', 'style']
        })
      : cleaned;
  }, [storeDescription]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="appliance-detail-page min-h-screen bg-slate-50">
        <div className="w-full bg-gradient-to-br from-[#004e46] via-[#026c61] to-[#013f38] pt-24 pb-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="h-7 w-20 bg-white/20 rounded-full animate-pulse" />
              <div className="h-9 sm:h-10 w-3/4 bg-white/20 rounded-xl animate-pulse" />
              <div className="h-1.5 w-16 bg-amber-400/40 rounded-full animate-pulse" />
              <div className="h-12 w-full max-w-xl bg-white/10 rounded-xl animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 bg-white/10 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-52 h-64 bg-white/10 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="h-56 bg-white rounded-2xl border border-slate-200 animate-pulse p-6" />
              <div className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse p-6" />
              <div className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse p-6" />
            </div>
            <div className="lg:col-span-5">
              <div className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse p-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!serviceDetails?.storeData) {
    return <div className="appliance-detail-page min-h-screen bg-white" />;
  }

  // Generate Service Schema for Technical SEO
  const schemaData = serviceDetails ? {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": cleanHtmlEntities(storeData.name),
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
      "name": cleanHtmlEntities(card.title),
      "price": card.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": typeof window !== 'undefined' ? window.location.href : ''
    }))
  } : null;

  const currentServiceName = cleanHtmlEntities(storeData.title || storeData.name || 'Appliance Repair Service');
  const metaDesc = getMetaDescription() || 'Professional repair services at your doorstep with verified technicians.';

  // Benefit indicators reusable JSX
  const benefitIndicators = (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-4 pt-1">
      {/* 1. Doorstep Service */}
      <div className="flex items-center gap-1.5 xs:gap-2 bg-white/10 sm:bg-transparent rounded-lg p-1.5 sm:p-0 min-w-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-teal-300/30 bg-teal-800/50 flex items-center justify-center text-teal-200 shrink-0 shadow-xs">
          <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <div className="!text-white text-[10px] xs:text-[11px] sm:text-xs font-semibold leading-tight min-w-0" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
          <span className="block">Doorstep</span>
          <span className="block">Service</span>
        </div>
      </div>

      <div className="hidden lg:block w-px h-7 bg-white/20" />

      {/* 2. Verified Technicians */}
      <div className="flex items-center gap-1.5 xs:gap-2 bg-white/10 sm:bg-transparent rounded-lg p-1.5 sm:p-0 min-w-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-teal-300/30 bg-teal-800/50 flex items-center justify-center text-teal-200 shrink-0 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <div className="!text-white text-[10px] xs:text-[11px] sm:text-xs font-semibold leading-tight min-w-0" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
          <span className="block">Verified</span>
          <span className="block">Technicians</span>
        </div>
      </div>

      <div className="hidden lg:block w-px h-7 bg-white/20" />

      {/* 3. 30–90 Days Service Warranty */}
      <div className="flex items-center gap-1.5 xs:gap-2 bg-white/10 sm:bg-transparent rounded-lg p-1.5 sm:p-0 min-w-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-teal-300/30 bg-teal-800/50 flex items-center justify-center text-teal-200 shrink-0 shadow-xs">
          <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <div className="!text-white text-[10px] xs:text-[11px] sm:text-xs font-semibold leading-tight min-w-0" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
          <span className="block">30–90 Days</span>
          <span className="block">Warranty</span>
        </div>
      </div>

      <div className="hidden lg:block w-px h-7 bg-white/20" />

      {/* 4. Low Cost Repairs */}
      <div className="flex items-center gap-1.5 xs:gap-2 bg-white/10 sm:bg-transparent rounded-lg p-1.5 sm:p-0 min-w-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-teal-300/30 bg-teal-800/50 flex items-center justify-center text-teal-200 shrink-0 shadow-xs">
          <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <div className="!text-white text-[10px] xs:text-[11px] sm:text-xs font-semibold leading-tight min-w-0" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
          <span className="block">Low Cost</span>
          <span className="block">Repairs</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="appliance-detail-page min-h-screen bg-white font-sans text-gray-900 pb-24 lg:pb-0">
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}

      {/* ── PHASE 2: HERO SECTION (COMPACT 40% REDUCED BANNER HEIGHT, CLEAR OF FIXED 80PX HEADER) ─────────── */}
      <section className="relative w-full bg-gradient-to-br from-[#00473e] via-[#01655b] to-[#003932] overflow-hidden pt-24 sm:pt-28 lg:pt-24 pb-4 sm:pb-6 lg:pb-8">
        {/* Concentric arc rings */}
        <svg
          className="absolute -top-10 -right-10 w-60 h-60 sm:w-72 sm:h-72 pointer-events-none opacity-20 text-teal-200"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        {/* Dot matrix pattern */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-16 grid grid-cols-4 gap-2 opacity-20 pointer-events-none hidden sm:grid">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
          ))}
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-end">

            {/* LEFT SIDE: Dynamic Content (60% on desktop) */}
            <div className="lg:col-span-7 flex flex-col justify-center">

              {/* Back Navigation Button */}
              <div className="mb-2 sm:mb-3">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-gray-900 hover:bg-slate-100 transition-all text-xs font-bold shadow-md shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  Back
                </button>
              </div>

              {/* Dynamic Service Name as primary H1 */}
              <h1
                className="text-lg xs:text-xl sm:text-2xl lg:text-[28px] xl:text-[32px] font-extrabold !text-white tracking-tight leading-snug sm:leading-[1.2] mb-2 break-words"
                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
              >
                {currentServiceName}
              </h1>

              {/* Yellow Accent Underline */}
              <div className="w-14 sm:w-20 h-1 sm:h-1.5 bg-[#f59e0b] rounded-full mb-2 sm:mb-3" />

              {/* Dynamic Service Description in Crisp Pure White (#ffffff override) */}
              <p
                className="!text-white text-xs sm:text-sm leading-relaxed max-w-2xl font-medium mb-3 sm:mb-4"
                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
              >
                {metaDesc}
              </p>

              {/* Benefit Indicators (Desktop / Tablet view) */}
              <div className="hidden lg:block">
                {benefitIndicators}
              </div>
            </div>

            {/* RIGHT SIDE: Global Technician Photograph (40% on desktop) */}
            <div className="lg:col-span-5 relative flex flex-col items-center lg:items-end justify-center lg:justify-end mt-2 sm:mt-1 lg:mt-0">
              <div className="relative flex items-end justify-center">
                {/* Luminous circular teal backdrop */}
                <div className="absolute bottom-0 right-1/2 translate-x-1/2 lg:right-2 lg:translate-x-0 w-[195px] h-[195px] xs:w-[230px] xs:h-[230px] sm:w-[250px] sm:h-[250px] lg:w-[280px] lg:h-[280px] rounded-full bg-gradient-to-tr from-[#00897b]/90 via-[#00a896]/60 to-[#26a69a]/30 pointer-events-none blur-[1px]" />

                {/* Floating Concentric Rings Behind Technician */}
                <div className="absolute top-2 right-1/4 w-16 h-16 sm:w-20 sm:h-20 border border-teal-300/20 rounded-full pointer-events-none hidden sm:block" />
                <div className="absolute top-0 right-1/4 w-24 h-24 sm:w-28 sm:h-28 border border-teal-300/10 rounded-full pointer-events-none hidden sm:block" />

                {/* Global Technician Image (+20% in mobile view) */}
                <Image
                  src="/technician-hero.png"
                  alt="Doorstep Hub Verified Professional Technician"
                  className="relative z-10 max-h-[195px] xs:max-h-[230px] sm:max-h-[250px] lg:max-h-[310px] w-auto object-contain object-bottom drop-shadow-2xl"
                  fetchPriority="high"
                 width={500} height={300} />
              </div>

              {/* Benefit Indicators (Mobile view: positioned directly below the technician) */}
              <div className="w-full mt-3 sm:mt-4 lg:hidden">
                {benefitIndicators}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Wave & Yellow Ribbon at bottom of hero */}
        <div className="absolute -bottom-1 left-0 right-0 overflow-hidden leading-none pointer-events-none z-10">
          <svg
            viewBox="0 0 1440 90"
            fill="none"
            className="w-full h-6 sm:h-8 lg:h-10 text-white"
            preserveAspectRatio="none"
          >
            <path
              d="M0,90 C450,90 850,20 1440,60 L1440,90 L0,90 Z"
              fill="currentColor"
            />
            <path
              d="M680,48 C920,10 1200,60 1440,58"
              stroke="#f59e0b"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </section>

      {/* ── PHASE 3 & 4: MAIN BODY TWO-COLUMN LAYOUT ───────────────────────── */}
      <section className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* RIGHT COLUMN ON MOBILE (order-1), DESKTOP (order-2): SERVICE RATE CARDS */}
          <div className="order-1 lg:order-2 lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
              {/* Teal Gradient Header */}
              <div className="bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] px-4 sm:px-5 py-3.5 text-white flex items-center gap-2.5 shadow-xs">
                <Layers className="w-5 h-5 !text-teal-200 shrink-0" style={{ color: '#99f6e4' }} />
                <h3
                  className="text-sm sm:text-base font-extrabold tracking-wide !text-white"
                  style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                >
                  Select Service / Rate Cards
                </h3>
              </div>

              {/* Dynamic Rate Cards List */}
              <div className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
                {provider_rate_cards.length > 0 ? (
                  provider_rate_cards.map((card, index) => {
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
                        className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer relative flex items-center gap-2.5 sm:gap-3 ${
                          isSelected
                            ? 'bg-teal-50/50 border-2 border-[#037166] shadow-xs'
                            : 'bg-white border-slate-200 hover:border-[#037166]/50'
                        }`}
                      >
                        {/* Custom Checkbox */}
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-[#037166] border-[#037166] text-white shadow-xs'
                              : 'bg-white border-slate-300 group-hover:border-[#037166]/60'
                          }`}
                        >
                          <Check
                            className={`w-3.5 h-3.5 text-white transition-transform ${
                              isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                            }`}
                            strokeWidth={3.5}
                          />
                        </div>

                        {/* Service Title and Reason */}
                        <div className="flex-1 min-w-0 pr-1">
                          <h4
                            className={`text-xs sm:text-sm font-bold transition-colors leading-snug ${
                              isSelected ? 'text-[#037166]' : 'text-gray-900'
                            }`}
                          >
                            {cleanHtmlEntities(card.title)}
                          </h4>
                          {card.reason && (
                            <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">
                              {cleanHtmlEntities(card.reason)}
                            </p>
                          )}
                        </div>

                        {/* Price Badge */}
                        <div className="bg-[#e6f7f5] border border-teal-100 rounded-lg px-2 sm:px-2.5 py-1 text-right shrink-0">
                          <span className="text-[9px] sm:text-[10px] text-gray-500 block leading-tight font-normal">
                            Starts from
                          </span>
                          <span className="text-xs sm:text-sm font-black text-[#037166] leading-tight">
                            ₹{card.price}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-gray-500 text-xs">
                    No specific rate cards available. Standard inspection and diagnosis applies.
                  </div>
                )}

                {/* AMC Banner if eligible */}
                <AmcCoverageBanner
                  eligibility={amcEligibility}
                  loading={amcLoading}
                />

                {/* Book Appointment Button */}
                <button
                  onClick={handleBookNow}
                  className="w-full py-3.5 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] hover:brightness-105 active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-between group mt-3"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-200" />
                    <span>Book Appointment Now</span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* LEFT COLUMN ON MOBILE (order-2), DESKTOP (order-1): ABOUT, ISSUES, WHY CHOOSE */}
          <div className="order-2 lg:order-1 lg:col-span-7 space-y-6 sm:space-y-8">

            {/* SECTION 1: ABOUT THIS SERVICE (CKEDITOR PRESERVED FORMATTING WITH READ MORE) */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 lg:p-7 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  About This Service
                </h2>
                <div className="w-10 h-1 bg-[#037166] rounded-full mt-1.5" />
              </div>

              {/* Exact CKEditor HTML rendering: htags, p tags, formatting */}
              <div className="relative">
                <div
                  className={`rich-text-content article-ck-content text-gray-700 text-xs sm:text-sm leading-relaxed space-y-3 [&_p]:mb-3 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-base sm:[&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-sm sm:[&_h3]:text-base [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_strong]:font-bold [&_strong]:text-gray-900 ${
                    isExpandedDescription ? '' : 'line-clamp-2 sm:line-clamp-3'
                  }`}
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                />

                {sanitizedDescription && sanitizedDescription.length > 150 && (
                  <button
                    onClick={() => setIsExpandedDescription(!isExpandedDescription)}
                    className="mt-2 text-[#037166] hover:text-[#04a99d] font-bold text-xs sm:text-sm inline-flex items-center gap-1 transition-colors focus:outline-none"
                  >
                    <span>{isExpandedDescription ? 'Read Less' : 'Read More'}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isExpandedDescription ? '-rotate-90' : 'rotate-90'
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* SECTION 2: COMMON ISSUES WE FIX */}
            {commonIssuesList.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 lg:p-7 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                    Common Issues We Fix
                  </h3>
                  <div className="w-10 h-1 bg-[#037166] rounded-full mt-1.5" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  {commonIssuesList.map((issue, idx) => {
                    const IssueIcon = issue.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-[#e6f7f5]/80 border border-teal-100 hover:border-[#037166]/40 transition-all shadow-xs"
                      >
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white border border-teal-200/60 flex items-center justify-center text-[#037166] shrink-0 shadow-xs">
                          <IssueIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-bold text-gray-900 leading-snug">
                          {issue.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 3: WHY CHOOSE DOORSTEP HUB? */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 lg:p-7 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  Why Choose Doorstep Hub?
                </h3>
                <div className="w-10 h-1 bg-[#037166] rounded-full mt-1.5" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { icon: ShieldCheck, title: 'Verified & Experienced Technicians' },
                  { icon: Award, title: '30–90 Days Service Warranty' },
                  { icon: IndianRupee, title: 'Low Cost & Transparent Pricing' },
                  { icon: Clock, title: 'On-Time Service Delivery' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center justify-center p-4 sm:p-5 rounded-2xl bg-[#e6f7f5]/70 border border-teal-100/80 gap-2.5 transition-all hover:shadow-xs"
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-teal-200/60 shadow-xs flex items-center justify-center text-[#037166]">
                      <item.icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <h5 className="text-xs sm:text-[13px] font-bold text-gray-900 leading-tight">
                      {item.title}
                    </h5>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PHASE 5: CUSTOMER REVIEWS & RATINGS STANDALONE SECTION ───────────── */}
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

        const reviewItems = [
          { name: 'Santhosh Kumar', rating: 5, date: '2 days ago', body: `Excellent doorstep ${currentServiceName} in ${currentCity}. Technician arrived within 30 minutes!` },
          { name: 'Priya Sharma', rating: 5, date: '4 days ago', body: `Very professional ${currentServiceName} in ${currentCity}. Genuine spare parts and reasonable price.` },
          { name: 'Venkatesh Rao', rating: 4, date: '1 week ago', body: `Great experience with Doorstep Hub in ${currentCity}. Quick diagnostic and polite staff.` },
          { name: 'Ananya Reddy', rating: 5, date: '1 week ago', body: `Highly recommended ${currentServiceName} near ${currentCity}. Fixed the issue on the spot.` },
          { name: 'Kiran Verma', rating: 5, date: '2 weeks ago', body: `Top class service in ${currentCity}! 90-day warranty provided on repairs.` },
          { name: 'Srinivas Rao', rating: 5, date: '3 weeks ago', body: `Punctual and honest technician in ${currentCity}. Satisfied with the service quality.` },
        ];

        return (
          <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14">
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3.5 sm:gap-4">
                <div className="max-w-xl">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                    Customer Reviews & Ratings in {currentCity}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Verified customer feedback for {currentServiceName} in {currentCity}.
                  </p>
                </div>
                <div className="inline-flex flex-wrap items-center gap-2 sm:gap-2.5 bg-emerald-50/80 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full border border-[#037166]/20 self-start sm:self-auto shrink-0 shadow-sm">
                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-black text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                    {storeData.avgRating || '4.8'}<span className="text-gray-400 font-medium text-[10px] sm:text-xs">/5.0</span>
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0 hidden xs:inline-block" />
                  <span className="text-gray-600 font-semibold text-xs sm:text-sm whitespace-nowrap">
                    {storeData.totalRatings || '1,240'} Verified Reviews
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
                        &ldquo;{rev.body}&rdquo;
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

      {/* AdSense Unit */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <AdSenseUnit slotId={ADSENSE_CONFIG.slots.categoryFeed} />
      </div>

      {/* Related Services Section */}
      {relatedServices.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 border-t border-slate-100">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Related Services</h2>
              <p className="text-gray-600 text-xs sm:text-sm">Other popular repair services in {subCategory || cleanServiceName}</p>
            </div>
            <button
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                const catSlug = params.get('categorySlug');
                const subCatSlug = params.get('subCategorySlug');
                if (catSlug && subCatSlug) router.push(`/${catSlug}/${subCatSlug}`);
              }}
              className="text-[#037166] font-semibold hover:underline flex items-center gap-1.5 text-xs sm:text-sm"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {relatedServices.map((service) => (
              <div
                key={service._id}
                onClick={() => router.push(`/${service.slug}`)}
                className="group cursor-pointer bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#037166]/50 hover:shadow-md transition-all"
              >
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <Image
                    src={service.mainImage ? getImageUrl(service.mainImage) : '/placeholder-service.jpg'}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                   width={500} height={300} />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-white text-[10px] font-bold">{service.rating || '4.8'}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-gray-900 font-bold text-sm mb-1 group-hover:text-[#037166] transition-colors line-clamp-2">
                    {service.name}
                  </h4>
                  <p className="text-gray-500 text-[10px] line-clamp-1 mb-3">{service.subcategoryName}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#037166] font-bold text-sm">₹{service.serviceBookingCost || service.minFare || '---'}</span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#037166] group-hover:text-white transition-all text-gray-400">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mobile Fixed Sticky Bottom CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider truncate">
            {selectedCards.length > 0 ? `${selectedCards.length} Service${selectedCards.length > 1 ? 's' : ''} Selected` : 'Select Rate Cards'}
          </span>
          <span className="text-sm sm:text-base font-black text-[#037166]">
            {selectedCards.length > 0
              ? `₹${selectedCards.reduce((sum, card) => sum + (Number(String(card.price).replace(/[^0-9]/g, '')) || 0), 0)}`
              : 'Choose Service'}
          </span>
        </div>
        <button
          onClick={handleBookNow}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
        >
          Book Appointment
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
