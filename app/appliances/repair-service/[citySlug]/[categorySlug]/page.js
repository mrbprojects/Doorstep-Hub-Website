'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Loader2, MapPin, CheckCircle2, HelpCircle, ChevronDown, Star } from 'lucide-react';
import { fetchAllBrands, fetchCities, fetchCategories } from '@/lib/api';
import { buildFlatBrandCityPublicPath, getCityReviewers } from '@/lib/applianceRepairSlugs';
import { ApplianceHowItWorks } from '@/components/appliances/ApplianceHowItWorks';
import { ApplianceComparison } from '@/components/appliances/ApplianceComparison';
import { PaymentMethodsSection } from '@/components/appliances/PaymentMethodsSection';

function FaqSection({ faqs, activeIndex, onToggle, cityName, categoryName }) {
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
              {categoryName
                ? `Quick answers about ${categoryName} repair${cityName ? ` in ${cityName}` : ''}.`
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

function BrandPageContent() {
  const router = useRouter();
  const params = useParams();
  const { citySlug, categorySlug } = params;

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [faqActiveIndex, setFaqActiveIndex] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [cities, cats] = await Promise.all([fetchCities(), fetchCategories()]);
        
        const cityMatch = cities.find(c => (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-') === citySlug.toLowerCase());
        setSelectedCity(cityMatch || { name: citySlug, slug: citySlug });

        const catMatch = cats.find(c => c.slug === categorySlug);
        setSelectedCategory(catMatch || { name: categorySlug, slug: categorySlug });
        
        const catId = catMatch?._id || catMatch?.id || '';
        const brandData = await fetchAllBrands(catId, '');
        setBrands(brandData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [citySlug, categorySlug]);

  const categoryFaqs = useMemo(() => {
    const merged = [
      ...(selectedCategory?.faqs || []),
      ...(selectedCategory?.categoryFaqs || []),
      ...(selectedCity?.faqs || []),
    ].filter((faq) => faq && (faq.question || faq.title) && (faq.answer || faq.description));

    const seen = new Set();
    return merged.filter((faq) => {
      const key = (faq.question || faq.title || '').trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [selectedCategory, selectedCity]);

  const reviewsData = useMemo(() => {
    const list = getCityReviewers(selectedCity?.name || citySlug, selectedCategory?.name);
    return list.slice(0, 2);
  }, [selectedCity, selectedCategory, citySlug]);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${selectedCategory?.name} Repair in ${selectedCity?.name || citySlug}`,
    "description": `Professional ${selectedCategory?.name} repair and maintenance services in ${selectedCity?.name || citySlug}. Certified technicians for all major brands.`,
    "areaServed": {
      "@type": "City",
      "name": selectedCity?.name || citySlug
    },
    "provider": {
      "@type": "Organization",
      "name": "Doorstep Hub",
      "url": "https://doorstephub.com"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1240"
    },
    "review": reviewsData.map((r, i) => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": r.name },
      "datePublished": i === 0 ? "2026-07-28" : "2026-07-27",
      "reviewBody": r.body,
      "reviewRating": { "@type": "Rating", "ratingValue": String(r.rating) }
    })),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${selectedCategory?.name} Brand Services`,
      "itemListElement": brands.slice(0, 15).map((brand, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": `${brand.name || brand} ${selectedCategory?.name} Repair in ${selectedCity?.name || citySlug}`,
          "url": `https://doorstephub.com/${citySlug}/${categorySlug}/${(brand.slug || brand.name || brand).toLowerCase().trim().replace(/\s+/g, '-')}`
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
    <main className="min-h-screen bg-white pb-12 pt-20 sm:pt-22 sm:pb-8">
      {/* SEO Schema */}
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
            <span className="shrink-0 text-gray-300">·</span>
            <span className="truncate">{selectedCategory?.name}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
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
            {selectedCategory?.title || selectedCategory?.categoryTitle || 'Select Appliance Brand'}
          </h1>
          <p className="mt-2 hidden w-full px-2 text-center text-sm font-medium leading-relaxed text-gray-500 sm:block sm:text-base md:text-lg">
            {selectedCategory?.description ||
              selectedCategory?.categoryDescription ||
              `Category: ${selectedCategory?.name || ''}`}
          </p>
        </div>

        <div className="mb-4 flex flex-wrap justify-center gap-2 sm:mb-6">
          <button
            onClick={() => router.push(`/appliances/repair-service/${citySlug}`)}
            className="px-4 py-2 rounded-full border border-[#037166]/20 bg-[#037166]/5 text-[#037166] text-xs font-black uppercase tracking-wider"
          >
            {selectedCategory?.name}
          </button>
        </div>

        {brands.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 min-[400px]:grid-cols-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9">
            {brands.map((brand) => {
              const bSlug = (brand.slug || brand.name || '').toLowerCase().trim().replace(/\s+/g, '-');
              const logo = brand.image || brand.logo || brand.brandLogo;
              return (
                <button
                  key={brand.name || brand}
                  type="button"
                  onClick={() => {
                    const publicPath = buildFlatBrandCityPublicPath(citySlug, bSlug, { trusted: true });
                    router.push(
                      publicPath
                      || `/appliances/repair-service/${citySlug}/${categorySlug}/${bSlug}`,
                    );
                  }}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-100 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#037166]/30 hover:shadow-xl hover:ring-2 hover:ring-[#037166]/10 sm:rounded-2xl focus:outline-none"
                >
                  <div className="flex h-16 items-center justify-center overflow-hidden p-2.5 sm:h-20 md:h-24">
                    {logo ? (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={logo.startsWith('http') ? logo : `https://api.doorstephub.com/${logo}`}
                        alt={brand.name}
                        className="h-full w-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="text-base font-black text-gray-200 sm:text-lg">
                        {(brand.name || brand)?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 py-14 text-center sm:rounded-3xl sm:py-20">
            <p className="text-lg font-bold text-gray-500">No brands found</p>
            <p className="mt-1 text-sm text-gray-400">
              There are no brands available under the {selectedCategory?.name} category currently.
            </p>
          </div>
        )}

        <ApplianceHowItWorks />
        <ApplianceComparison />

        <CustomerReviewsSection
          cityName={selectedCity?.name || citySlug}
          categoryName={selectedCategory?.name}
        />

        <FaqSection
          faqs={categoryFaqs.slice(0, 9)}
          activeIndex={faqActiveIndex}
          onToggle={setFaqActiveIndex}
          cityName={selectedCity?.name}
          categoryName={selectedCategory?.name}
        />

        <PaymentMethodsSection />
      </div>
    </main>
  );
}

function CustomerReviewsSection({ cityName, categoryName }) {
  const currentCity = cityName || 'Your City';
  const currentCategory = categoryName || 'Appliance Repair';

  const reviewItems = getCityReviewers(currentCity, currentCategory);

  return (
    <section id="reviews" className="mt-12 pt-8 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3.5 sm:gap-4">
        <div className="max-w-xl">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">
            Customer Reviews & Ratings in {currentCity}
          </h3>
          <p className="text-gray-600 text-xs sm:text-base">
            Verified customer feedback for {currentCategory} in {currentCity}.
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
    </section>
  );
}

export default function BrandPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#037166]" /></div>}>
      <BrandPageContent />
    </Suspense>
  );
}

