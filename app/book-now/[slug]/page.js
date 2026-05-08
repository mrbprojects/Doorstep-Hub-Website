'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { BookingModal } from '@/components/appliances/booking-flow/BookingModal';
import { ChevronLeft, Star, Clock, Shield, Award, ThumbsUp, ArrowRight, Loader2, Wrench, CheckCircle2, MapPin } from 'lucide-react';
import { fetchCities, fetchCategories, fetchAllBrands } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'motion/react';

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
  const slug = params.slug;
  const citySlug = searchParams.get('city');

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
          if (match) setSelectedCity(match);
        }

        // Fetch Service
        const response = await fetch(`https://api.doorstephub.com/v1/dhubApi/app/authorized-services/authorized_service/${slug}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        if (data.success && data.service) {
          const sData = data.service;
          
          // Find Category and Brand names for display
          const categoryMatch = categories.find(cat => cat._id === sData.categoryId);
          const brandMatch = brands.find(b => b._id === sData.brandId);

          const categoryNameFromService = Array.isArray(sData.categoryName)
            ? sData.categoryName.find(Boolean)
            : (sData.categoryName || sData.category || sData.serviceCategory);
          const brandNameFromService = sData.brandName || sData.brand || sData.brandTitle;

          setService({
            ...sData, // Keep original IDs for booking
            _id: sData._id || sData.id,
            serviceName: sData.name || sData.serviceName,
            image: sData.mainImage || sData.bannerImage || sData.image,
            description: sData.description || sData.seoDescription,
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
    "image": service.image ? `https://api.doorstephub.com/${service.image}` : undefined,
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

  const imageUrl = service.image?.startsWith('http') ? service.image : `https://api.doorstephub.com/${service.image}`;

  return (
    <div className="min-h-screen bg-white">
      <Header theme={appliancesTheme} />
      
      <main className="w-full px-6 lg:px-8 py-12">
        {schemaData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
          />
        )}
        <div className="w-full">

          {/* Back button */}
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-[#037166] transition-colors mb-8 group"
          >
            <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            GO BACK
          </button>
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-xs font-black uppercase tracking-wider text-gray-600 hover:text-[#037166] hover:border-[#037166]/30 transition-all"
            >
              <ChevronLeft size={14} />
              Back
            </button>
          </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* ── LEFT SECTION: IMAGE (STICKY) ── */}
          <div className="w-full lg:w-[42%] lg:sticky lg:top-24">
            <div 
              className="relative aspect-[1/1] w-full group overflow-hidden rounded-3xl bg-gray-50 border border-gray-100"
            >
              {service.image ? (
                <div className="relative w-full h-full z-10">
                  <img 
                    src={imageUrl} 
                    alt={service.serviceName} 
                    className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-105" 
                  />
                </div>
              ) : (
                <Wrench size={80} className="text-gray-200" />
              )}
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-transparent group-hover:bg-[#037166]/5 transition-colors z-20 rounded-3xl border border-transparent group-hover:border-[#037166]/20" />

              {/* Decorative background circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#037166]/5 rounded-full blur-3xl" />
            </div>
          </div>

          {/* ── RIGHT SECTION: CONTENT ── */}
          <div className="w-full lg:w-[58%]">
            <div className="py-2 pb-32 lg:pb-20 flex flex-col">
              {/*
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-[#037166]/10 text-[#037166] text-[10px] font-black uppercase tracking-[0.2em]">
                  Authorized Service
                </span>
                <div className="flex items-center gap-1.5 text-amber-400 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-black text-amber-600">{service.avgRating}</span>
                </div>
              </div>
              */}

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tight">
                {service.serviceName}
              </h1>

              <div className="mb-8">
                <div className={`relative prose prose-sm sm:prose-base lg:prose-lg text-gray-600 leading-relaxed max-w-none text-justify prose-headings:font-black prose-headings:text-gray-900 prose-p:mb-6 prose-p:text-justify overflow-hidden transition-all duration-300 ${showFullDescription ? 'max-h-none' : 'max-h-[42vh] pb-10'}`}>
                  <div dangerouslySetInnerHTML={{ __html: service.description }} />
                  {!showFullDescription && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent" />
                  )}
                  {!showFullDescription && (
                    <button
                      onClick={() => setShowFullDescription(true)}
                      className="absolute bottom-0 right-0 text-sm font-black uppercase tracking-wider text-[#037166] hover:text-[#04a99d] transition-colors"
                    >
                      ...View More
                    </button>
                  )}
                </div>
                {showFullDescription && (
                  <button
                    onClick={() => setShowFullDescription(false)}
                    className="mt-4 mb-28 lg:mb-0 ml-auto block text-sm font-black uppercase tracking-wider text-[#037166] hover:text-[#04a99d] transition-colors"
                  >
                    View Less
                  </button>
                )}
              </div>

              <div className="mt-auto pt-12 sticky bottom-0 lg:bottom-10 flex justify-center z-40">
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full sm:w-auto px-12 py-5 sm:py-6 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-black text-sm sm:text-base uppercase tracking-[0.25em] shadow-[0_25px_60px_-15px_rgba(3,113,102,0.4)] hover:shadow-[0_25px_60px_-10px_rgba(3,113,102,0.6)] hover:-translate-y-1 transition-all active:scale-[0.98] flex items-center justify-center gap-4 group"
                >
                  BOOK SERVICE NOW
                  <ArrowRight size={22} className="transition-transform group-hover:translate-x-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>

      <Footer theme={footerTheme} />
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedCity={selectedCity}
        selectedCategory={{ name: service?.categoryName }}
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
