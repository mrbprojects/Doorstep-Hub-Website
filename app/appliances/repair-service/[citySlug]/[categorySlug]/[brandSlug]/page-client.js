'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Wrench, Loader2, MapPin, CheckCircle2, Star, HelpCircle, ChevronDown } from 'lucide-react';
import { fetchServicesByBrand, fetchAuthorizedServices, fetchCities, fetchCategories, fetchAllBrands } from '@/lib/api';
import {
  buildFlatBrandCityPublicPath,
  buildFlatBrandPublicPath,
  resolveBookNowNavigationPath,
  FLAT_BRAND_INTERNAL_SEGMENT,
  FLAT_BRAND_AUTO_CITY,
} from '@/lib/applianceRepairSlugs';
import { useLocation } from '@/hooks/useLocation';

function FaqSection({ faqs, activeIndex, onToggle, cityName, brandName }) {
  if (!faqs.length) return null;

  return (
    <section id="faqs" className="mt-10 scroll-mt-20 sm:mt-14 sm:scroll-mt-24">
      <div className="rounded-2xl border border-[#e8eeec] bg-gradient-to-b from-[#f7fbf9] to-white p-4 sm:rounded-[28px] sm:p-6 md:p-8">
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#037166]/10 text-[#037166] sm:h-11 sm:w-11 sm:rounded-2xl">
            <HelpCircle size={20} className="sm:h-[22px] sm:w-[22px]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black tracking-tight text-gray-900 sm:text-xl md:text-2xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">
              {brandName
                ? `Quick answers about ${brandName} repair${cityName ? ` in ${cityName}` : ''}.`
                : 'Quick answers about appliance repair in your city.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={`${faq.question || faq.title}-${index}`}
                className={`h-fit overflow-hidden rounded-xl border transition-all duration-300 sm:rounded-2xl ${
                  isOpen
                    ? 'border-[#037166]/30 bg-white shadow-sm shadow-[#037166]/5'
                    : 'border-[#e8eeec] bg-white/80 hover:border-[#037166]/15'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggle(isOpen ? null : index)}
                  className="flex w-full items-start justify-between gap-3 px-3.5 py-3.5 text-left sm:gap-4 sm:px-5 sm:py-4"
                >
                  <span className="text-xs font-bold leading-snug text-gray-900 sm:text-sm md:text-base">
                    {faq.question || faq.title}
                  </span>
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors sm:h-8 sm:w-8 ${
                      isOpen ? 'bg-[#037166] text-white' : 'bg-[#037166]/8 text-[#037166]'
                    }`}
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 sm:h-[18px] sm:w-[18px] ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-[#eef3f1] px-3.5 pb-3.5 pt-2.5 text-xs leading-relaxed text-gray-600 sm:px-5 sm:pb-4 sm:pt-3 sm:text-sm">
                    {faq.answer || faq.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StepBar({ step }) {
  const steps = ['Category', 'Brand', 'Service'];
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-300 ${
                done ? 'bg-[#037166] border-[#037166] text-white' :
                active ? 'bg-white border-[#037166] text-[#037166]' :
                'bg-white border-gray-200 text-gray-300'
              }`}>
                {done ? <CheckCircle2 size={18} /> : idx}
              </div>
              <span className={`text-xs font-black uppercase tracking-widest hidden sm:block transition-colors ${
                active ? 'text-[#037166]' : done ? 'text-[#037166]/70' : 'text-gray-300'
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 mx-4 h-0.5 transition-all duration-300 ${done ? 'bg-[#037166]' : 'bg-gray-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ServicePageContent() {
  const router = useRouter();
  const params = useParams();
  const { location } = useLocation();
  const { citySlug, categorySlug, brandSlug } = params;

  const isAutoCityRoute = citySlug === FLAT_BRAND_AUTO_CITY;
  const resolvedCitySlug = useMemo(() => {
    if (!isAutoCityRoute) return citySlug;
    if (location?.city) {
      return String(location.city).trim().toLowerCase().replace(/\s+/g, '-');
    }
    return citySlug;
  }, [isAutoCityRoute, citySlug, location?.city]);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [faqActiveIndex, setFaqActiveIndex] = useState(null);

  const isFlatBrandRoute = !categorySlug || categorySlug === FLAT_BRAND_INTERNAL_SEGMENT;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [cities, cats, brands] = await Promise.all([fetchCities(), fetchCategories(), fetchAllBrands()]);
        
        const cityMatch = cities.find(c => (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-') === resolvedCitySlug.toLowerCase());
        const catMatch = !isFlatBrandRoute && categorySlug
          ? cats.find(c => c.slug === categorySlug)
          : null;
        const brandMatch = brands.find(b => (b.slug || b.name || '').toLowerCase().replace(/\s+/g, '-') === brandSlug.toLowerCase());

        setSelectedCity(cityMatch || { name: resolvedCitySlug, slug: resolvedCitySlug });
        setSelectedCategory(catMatch || (categorySlug ? { name: categorySlug, slug: categorySlug } : null));
        setSelectedBrand(brandMatch || { name: brandSlug, slug: brandSlug });

        const brandName = brandMatch?.name || brandSlug;
        const [apiResult, authResult] = await Promise.allSettled([
          fetchServicesByBrand(brandName),
          fetchAuthorizedServices(),
        ]);

        let apiServices = apiResult.status === 'fulfilled' ? apiResult.value : [];
        let authServices = [];

        if (authResult.status === 'fulfilled' && Array.isArray(authResult.value)) {
          authServices = authResult.value
            .filter(s => {
              const bMatch = s.brandName?.toLowerCase().trim() === brandName?.toLowerCase().trim();
              if (!bMatch) return false;
              if (!catMatch?.name) return true;
              return Array.isArray(s.categoryName)
                ? s.categoryName.some(c => c?.toLowerCase() === catMatch.name?.toLowerCase())
                : s.categoryName?.toLowerCase() === catMatch?.name?.toLowerCase();
            })
            .map(s => ({
              _id: s._id,
              serviceName: s.name,
              image: s.mainImage,
              slug: s.slug,
              isAuthorized: true,
              faqs: s.faqs || [],
            }));
        }

        const combined = [...apiServices, ...authServices];
        const unique = Array.from(new Map(combined.map(i => [i.serviceName, i])).values());
        setServices(unique);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [resolvedCitySlug, categorySlug, brandSlug, isFlatBrandRoute]);

  const pageFaqs = useMemo(() => {
    const merged = [
      ...(selectedBrand?.faqs || []),
      ...services.flatMap((service) => service.faqs || []),
    ].filter((faq) => faq && (faq.question || faq.title) && (faq.answer || faq.description));

    const seen = new Set();
    return merged.filter((faq) => {
      const key = (faq.question || faq.title || '').trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [selectedBrand, services]);

  const pageTitle = selectedBrand?.title || 'Available Services';
  const pageDescription =
    selectedBrand?.description ||
    (selectedCategory?.name
      ? `${selectedCategory.name} · ${selectedBrand?.name || ''}`
      : `${selectedBrand?.name || ''} repair services in ${selectedCity?.name || resolvedCitySlug}`);

  const brandPublicPath =
    (isAutoCityRoute
      ? buildFlatBrandPublicPath(brandSlug)
      : buildFlatBrandCityPublicPath(resolvedCitySlug, brandSlug)) ||
    (categorySlug ? `/${resolvedCitySlug}/${categorySlug}/${brandSlug}` : `/${resolvedCitySlug}/${brandSlug}`);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${selectedBrand?.name} ${selectedCategory?.name} Repair in ${selectedCity?.name || resolvedCitySlug}`,
    "description": `Reliable ${selectedBrand?.name} ${selectedCategory?.name} repair and service in ${selectedCity?.name || resolvedCitySlug}. Genuine spare parts and expert technicians.`,
    "areaServed": {
      "@type": "City",
      "name": selectedCity?.name || resolvedCitySlug
    },
    "provider": {
      "@type": "Organization",
      "name": "Doorstep Hub",
      "url": "https://doorstephub.com"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${selectedBrand?.name} Repair Services`,
      "itemListElement": services.slice(0, 10).map((service, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": `${service.serviceName} in ${selectedCity?.name || resolvedCitySlug}`,
          "url": `https://doorstephub.com${resolveBookNowNavigationPath(service.slug || service._id, resolvedCitySlug)}`
        }
      }))
    }
  };


  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#037166]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-24 pt-20 sm:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="sticky top-20 z-40 border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-gray-100 text-gray-500 hover:text-[#037166] sm:h-10 sm:w-10 sm:rounded-2xl"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-gray-500 sm:text-sm">
            <MapPin size={14} className="shrink-0 text-[#037166]" />
            <span className="truncate text-[#037166]">{selectedCity?.name}</span>
            {selectedCategory?.name ? (
              <>
                <span className="shrink-0 text-gray-300">·</span>
                <span className="truncate">{selectedCategory.name}</span>
              </>
            ) : null}
            <span className="shrink-0 text-gray-300">·</span>
            <span className="truncate">{selectedBrand?.name}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-3 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mb-4 hidden sm:mb-6 sm:block">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-black uppercase tracking-wider text-gray-600 transition-all hover:border-[#037166]/30 hover:text-[#037166]"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>
        
        <div className="mb-4 w-full sm:mb-6">
          <h1 className="w-full px-2 text-center text-lg font-black leading-snug tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
            {pageTitle}
          </h1>
          <p className="mt-2 hidden w-full px-2 text-center text-sm font-medium leading-relaxed text-gray-500 sm:block sm:text-base md:text-lg">
            {pageDescription}
          </p>
        </div>

        <div className="mb-4 flex flex-wrap justify-center gap-2 sm:mb-6">
          <button
            type="button"
            onClick={() => router.push(`/appliances/repair-service/${resolvedCitySlug}`)}
            className="rounded-full border border-[#037166]/20 bg-[#037166]/5 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#037166]"
          >
            {selectedCity?.name}
          </button>
          {selectedCategory?.name ? (
            <button
              type="button"
              onClick={() => router.push(`/appliances/repair-service/${resolvedCitySlug}/${categorySlug}`)}
              className="rounded-full border border-[#037166]/20 bg-[#037166]/5 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#037166]"
            >
              {selectedCategory.name}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => router.push(brandPublicPath)}
            className="rounded-full border border-[#037166]/20 bg-[#037166]/5 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#037166]"
          >
            {selectedBrand?.name}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
          {services.map(service => {
            const sSlug = service.slug || service._id;
            return (
              <button
                key={service._id || service.serviceName}
                onClick={() => router.push(resolveBookNowNavigationPath(sSlug, resolvedCitySlug))}
                className="group relative rounded-3xl border-2 border-gray-100 bg-white overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#037166]/30 hover:shadow-2xl shadow-lg"
              >
                <div className="flex h-[150px]">
                  {/* Image section - Touching Top, Left, Bottom */}
                  <div className="w-32 sm:w-36 flex-shrink-0 h-full overflow-hidden bg-gray-50 border-r border-gray-100">
                    {service.image ? (
                      <img loading="lazy" decoding="async"
                        src={`https://api.doorstephub.com/${service.image}`}
                        alt={service.serviceName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Wrench size={32} className="text-gray-200" />
                      </div>
                    )}
                  </div>

                  {/* Content section */}
                  <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center relative min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 group-hover:text-[#037166] transition-colors tracking-tight leading-tight truncate">
                          {service.serviceName}
                        </h3>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#037166] group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                    
                    <p className="mt-2 text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed">
                      Professional doorstep {service.serviceName?.toLowerCase()} with expert technician visit, genuine spares, and transparent pricing.
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                       <div className="flex items-center gap-1 text-amber-400">
                         <Star size={12} fill="currentColor" />
                         <span className="text-[10px] font-black text-gray-900">4.9</span>
                       </div>
                       <div className="h-1 w-1 rounded-full bg-gray-200" />
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Available Now</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          {services.length === 0 && (
             <div className="rounded-2xl border-2 border-dashed border-gray-100 py-14 text-center text-gray-400 sm:rounded-3xl sm:py-20">
               <p className="text-lg font-bold text-gray-500">No services found</p>
               <p className="mt-1 text-sm text-gray-400">
                 No services are available for {selectedBrand?.name} currently.
               </p>
             </div>
          )}
        </div>

        <FaqSection
          faqs={pageFaqs.slice(0, 9)}
          activeIndex={faqActiveIndex}
          onToggle={setFaqActiveIndex}
          cityName={selectedCity?.name}
          brandName={selectedBrand?.name}
        />
      </div>
    </div>
  );
}

export default function ServicePageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#037166]" /></div>}>
      <ServicePageContent />
    </Suspense>
  );
}
