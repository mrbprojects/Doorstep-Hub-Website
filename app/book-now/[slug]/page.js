'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
const BookingModal = dynamic(() => import('@/components/appliances/booking-flow/BookingModal').then(m => m.BookingModal), { ssr: false });
import { ChevronLeft, Star, Clock, Shield, Award, ThumbsUp, ArrowRight, Loader2, Wrench, CheckCircle2, MapPin } from 'lucide-react';
import { fetchCities, fetchCategories, fetchAllBrands } from '@/lib/api';
import { parseBookNowCityFlatPath, parseNearbyBookNowPath } from '@/lib/applianceRepairSlugs';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ApplianceHowItWorks } from '@/components/appliances/ApplianceHowItWorks';
import { ApplianceComparison } from '@/components/appliances/ApplianceComparison';
import { PaymentMethodsSection } from '@/components/appliances/PaymentMethodsSection';
import { API_BASE_URL, getImageUrl } from '@/config/env';
import { motion } from 'motion/react';
import { AdSenseUnit } from '@/components/sell-buy/ads/AdSenseUnit';
import { ADSENSE_CONFIG } from '@/config/adsense';

const appliancesTheme = {
  bgScrolled: 'bg-white/80',
  bgMobile: 'bg-white/95',
  textMain: 'text-gray-900',
  textHover: 'text-[#037166]',
  border: 'border-gray-100',
  accent: 'bg-[#037166]',
  accentGradientFrom: 'from-[#037166]',
  accentGradientTo: 'to-[#04a99d]',
  buttonBg: 'bg-gray-50',
  isLight: true
};

const footerTheme = {
  bg: 'bg-white',
  borderTop: 'border-gray-100',
  accentGlow: '#037166',
  accentColor: '#037166',
  accentHover: '#04a99d',
  accentGradientFrom: 'from-[#037166]',
  accentGradientTo: 'to-[#04a99d]',
  headingGradient: 'from-[#037166] via-gray-900 to-[#037166]',
  textMain: 'text-gray-900',
  textMuted: 'text-gray-500',
  textSubtle: 'text-gray-400',
  textLink: 'text-gray-600',
  textLinkHover: 'hover:text-[#037166]',
  groupNameColor: 'text-gray-900',
  dividerColor: 'text-gray-100',
  socialBg: 'bg-gray-50',
  socialBorder: 'border-gray-100',
  tooltipBg: 'bg-white border-[#037166]/20',
  tooltipText: 'text-gray-900',
  iconBg: 'bg-gray-50',
  iconHoverBg: 'group-hover:bg-[#037166]/10',
  isLight: true,
};

function BookNowPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const slug = params.slug;
  const cityFromPath = useMemo(() => {
    const normalizedPath = String(pathname || '').replace(/^\/+/, '');
    const nearbyParsed = parseNearbyBookNowPath(normalizedPath);
    if (nearbyParsed?.citySlug) return nearbyParsed.citySlug;
    const flatParsed = parseBookNowCityFlatPath(normalizedPath);
    return flatParsed?.citySlug || null;
  }, [pathname]);
  const citySlug = searchParams.get('city') || params.citySlug || cityFromPath;

  const [service, setService] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Fetch lookup data
        const [cities, categoriesResult, brandsResult] = await Promise.all([
          fetchCities(),
          fetchCategories().catch(() => []),
          fetchAllBrands().catch(() => [])
        ]);
        const categories = Array.isArray(categoriesResult) ? categoriesResult : [];
        const brands = Array.isArray(brandsResult) ? brandsResult : [];

        // Resolve City
        if (citySlug) {
          const match = cities.find(c => (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-') === citySlug.toLowerCase());
          if (match) {
            setSelectedCity(match);
          } else {
            // Fallback for display, BookingModal will try to resolve the ID
            setSelectedCity({ name: citySlug.charAt(0).toUpperCase() + citySlug.slice(1).replace(/-/g, ' '), slug: citySlug });
          }
        }

        // Fetch Service
        const response = await fetch(`${API_BASE_URL}/app/authorized-services/authorized_service/${slug}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        if (data.success && data.service) {
          const sData = data.service;
          const serviceCategoryIds = Array.isArray(sData.categoryId)
            ? sData.categoryId.filter(Boolean)
            : [sData.categoryId].filter(Boolean);
          const serviceCategoryNames = Array.isArray(sData.categoryName)
            ? sData.categoryName.filter(Boolean)
            : [sData.categoryName].filter(Boolean);

          const categoryMatch = categories.find((cat) =>
            serviceCategoryIds.some((id) => String(id) === String(cat._id))
          );
          const brandMatch = brands.find((b) => String(b._id) === String(sData.brandId));

          const categoryNameFromService = serviceCategoryNames[0]
            || sData.category
            || sData.serviceCategory;
          const brandNameFromService = sData.brandName || sData.brand || sData.brandTitle;
          const resolvedCategoryId = categoryMatch?._id || serviceCategoryIds[0] || null;

          setService({
            ...sData,
            _id: sData._id || sData.id,
            bookingCategoryId: resolvedCategoryId,
            categoryNames: serviceCategoryNames,
            serviceName: sData.name || sData.serviceName,
            image: sData.mainImage || sData.bannerImage || sData.image,
            // Admin CKEditor content is stored as HTML. Prefer it so the public
            // page preserves the exact authored structure and formatting.
            description: sData.description_html || sData.description || sData.seoDescription,
            categoryName: categoryMatch?.name || categoryNameFromService || 'Standard Service',
            brandName: brandMatch?.name || brandNameFromService || 'Standard Brand',
            isAuthorized: true,
            avgRating: 4.9,
            totalRatings: 150,
            workingImages: sData.workingImages || []
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, citySlug]);

  const schemaData = service ? {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.serviceName,
    "description": service.description?.replace(/<[^>]*>?/gm, '').slice(0, 160) || `Professional ${service.serviceName} by certified technicians.`,
    "provider": {
      "@type": "Organization",
      "name": "Doorstep Hub",
      "url": "https://doorstephub.com"
    },
    "areaServed": selectedCity ? {
      "@type": "City",
      "name": selectedCity.name
    } : {
      "@type": "Country",
      "name": "India"
    },
    "image": service.image ? getImageUrl(service.image) : undefined,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": service.avgRating || "4.9",
      "reviewCount": service.totalRatings || "150"
    }
  } : null;


  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 size={40} className="animate-spin text-[#037166]" />
    </div>
  );

  if (!service) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <Wrench size={64} className="text-gray-100 mb-6" />
      <h1 className="text-2xl font-black text-gray-900 mb-2">Service Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md">We couldn't find the service details for "{slug}".</p>
      <button onClick={() => router.push('/appliances')} className="px-8 py-3 rounded-2xl bg-[#037166] text-white font-bold">Explore Other Services</button>
    </div>
  );

  const imageUrl = service.image?.startsWith('http') ? service.image : `https://devapis.doorstephub.com/${service.image}`;

  return (
    <div className="min-h-screen bg-white">
      <Header theme={appliancesTheme} />
      
      <main className="w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        {schemaData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
          />
        )}
        <div className="w-full max-w-[1440px] mx-auto">

          <div className="mb-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-xs font-black uppercase tracking-wider text-gray-600 hover:text-[#037166] hover:border-[#037166]/30 transition-all focus:outline-none"
            >
              <ChevronLeft size={14} />
              Back
            </button>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(340px,460px)_minmax(0,1fr)] gap-7 lg:gap-10 xl:gap-12 items-start">
          {/* ── LEFT SECTION: IMAGE (STICKY) ── */}
          <div className="w-full max-w-[540px] mx-auto lg:max-w-none lg:mx-0 lg:sticky lg:top-28">
            <div 
              className="relative w-full group overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 shadow-sm"
            >
              {service.image ? (
                <div className="relative w-full z-10">
                  <img loading="lazy" decoding="async" 
                    src={imageUrl} 
                    alt={service.serviceName} 
                    className="block w-full h-auto object-contain object-center"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] w-full flex items-center justify-center"><Wrench size={48} className="text-gray-200" /></div>
              )}
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-transparent group-hover:bg-[#037166]/5 transition-colors z-20 rounded-2xl border border-transparent group-hover:border-[#037166]/20" />

              {/* Decorative background circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-[#037166]/5 rounded-full blur-3xl" />
            </div>
          </div>

          {/* ── RIGHT SECTION: CONTENT ── */}
          <div className="w-full min-w-0">
            <div className="flex flex-col lg:pt-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight mb-4">
                {service.serviceName}
              </h1>

              <div className="mb-2">
                <div className={`relative ckeditor-content prose prose-sm sm:prose-base text-gray-600 leading-7 sm:leading-8 max-w-none overflow-hidden transition-all duration-300 [&_p]:mb-4 [&_p]:leading-7 [&_p]:sm:leading-8 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-gray-900 [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-gray-900 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-extrabold [&_strong]:text-gray-700 [&_a]:font-semibold [&_a]:text-[#037166] [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#037166]/30 [&_blockquote]:pl-4 [&_blockquote]:italic ${showFullDescription ? 'max-h-none' : 'max-h-[18rem] sm:max-h-[20rem] pb-7'}`}>
                  <div dangerouslySetInnerHTML={{ __html: service.description }} />
                  {!showFullDescription && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white via-white/90 to-transparent" />
                  )}
                  {!showFullDescription && (
                    <button
                      onClick={() => setShowFullDescription(true)}
                      className="absolute bottom-0 right-0 text-xs font-black uppercase tracking-wider text-[#037166] hover:text-[#04a99d] transition-colors focus:outline-none"
                    >
                      ...View More
                    </button>
                  )}
                </div>
                {showFullDescription && (
                  <button
                    onClick={() => setShowFullDescription(false)}
                    className="mt-2 ml-auto block text-xs font-black uppercase tracking-wider text-[#037166] hover:text-[#04a99d] transition-colors focus:outline-none"
                  >
                    View Less
                  </button>
                )}
              </div>

              <div className="mt-5 flex justify-start z-40">
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full sm:w-auto min-w-[235px] px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_12px_24px_-5px_rgba(3,113,102,0.3)] hover:shadow-[0_18px_36px_-5px_rgba(3,113,102,0.45)] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 group"
                >
                  BOOK SERVICE NOW
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* ── RESPONSIVE ADSENSE UNIT ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
          <AdSenseUnit slotId={ADSENSE_CONFIG.slots.categoryFeed} />
        </div>

        <ApplianceHowItWorks />
        <ApplianceComparison />
        <PaymentMethodsSection />
      </main>

      <Footer theme={footerTheme} />
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedCity={selectedCity}
        selectedCategory={{
          _id: service?.bookingCategoryId,
          name: service?.categoryName,
        }}
        selectedBrand={service?.brandName}
        selectedService={service}
      />
    </div>
  );
}

export default function BookNowPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 size={40} className="animate-spin text-[#037166]" /></div>}>
      <BookNowPageContent />
    </Suspense>
  );
}
