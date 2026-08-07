'use client';

import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronLeft,
  Search,
  Loader2,
  Snowflake,
  Monitor,
  Tv,
  Waves,
  Droplets,
  Flame,
  Microwave,
  Wrench,
  Smartphone,
  ChevronDown,
  HelpCircle,
  Laptop,
  Printer,
} from 'lucide-react';
import { fetchCategories, fetchCities, fetchServiceBanners, fetchApplianceServiceBanners } from '@/lib/api';
import { buildApplianceCategoryCityPublicPath } from '@/lib/applianceRepairSlugs';
import { ApplianceServiceBannerCarousel } from '@/components/appliances/ApplianceServiceBannerCarousel';

const DEFAULT_APP_LINKS = {
  ios: 'https://apps.apple.com/in/app/doorstep-hub/id6475340236',
  android:
    'https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share',
};

const APP_STORE_BUTTON_CLASS =
  'flex w-full items-center justify-center h-9 sm:h-10 bg-[#DEF2EF] rounded-full shadow-xl shadow-[#037166]/15 hover:shadow-2xl hover:shadow-[#037166]/25 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden border border-[#9ecbc3]';

const APP_STORE_IMAGE_CLASS =
  'h-full w-full object-cover brightness-0 invert opacity-95 hover:opacity-100 transition-opacity';

const CATEGORY_ICONS = {
  ac: Snowflake,
  computer: Monitor,
  tv: Tv,
  'washing-machine': Waves,
  refrigerator: Snowflake,
  geyser: Flame,
  oven: Microwave,
  'water-purifier': Droplets,
  microwave: Microwave,
  laptop: Laptop,
  printer: Printer,
  mobile: Smartphone,

  // Full repair slugs mapping
  'ac-repair': Snowflake,
  'computer-repair': Monitor,
  'tv-repair': Tv,
  'television-repair': Tv,
  'washing-machine-repair': Waves,
  'refrigerator-repair': Snowflake,
  'geyser-repair': Flame,
  'oven-repair': Microwave,
  'microwave-oven-repair': Microwave,
  'microwave-repair': Microwave,
  'water-purifier-repair': Droplets,
  'ro-repair': Droplets,
  'laptop-repair': Laptop,
  'printer-repair': Printer,
  'mobile-repair': Smartphone,
  'dishwasher-repair': Waves,
};

function CategoryIconBadge({ slug }) {
  const cleanSlug = String(slug || '')
    .toLowerCase()
    .replace(/-services$/, '')
    .replace(/-service$/, '')
    .trim();
  const Icon = CATEGORY_ICONS[cleanSlug] || CATEGORY_ICONS[slug] || Wrench;
  return (
    <div className="absolute -bottom-2.5 left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-[#037166] text-white shadow-md sm:-bottom-4 sm:h-10 sm:w-10 sm:border-[3px] group-hover:bg-[#04a99d] group-hover:scale-110 transition-all duration-300 ease-out">
      <Icon size={15} strokeWidth={2.2} className="sm:h-[18px] sm:w-[18px] group-hover:rotate-12 transition-transform duration-300 ease-out" />
    </div>
  );
}

function ApplianceServiceHero({ banners, bannerLoading, cityLabel, onBack, onActiveBannerChange }) {
  return (
    <section className="relative z-10 w-full bg-[#eef2f1] pt-28 sm:pt-32 pb-2">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div
          className={`relative overflow-hidden rounded-2xl bg-[#071018] sm:rounded-[20px] ${
            bannerLoading ? 'h-[150px] sm:h-[170px]' : 'h-[150px] sm:h-[170px] md:h-[180px]'
          }`}
        >
          {bannerLoading ? (
            <div className="h-full w-full animate-pulse bg-[#1a2630]" />
          ) : banners.length > 0 ? (
            <ApplianceServiceBannerCarousel
              banners={banners}
              cityLabel={cityLabel}
              onActiveBannerChange={onActiveBannerChange}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center px-4 text-center">
              <h1 className="text-lg font-bold text-white sm:text-xl md:text-2xl">
                Appliance Repair Services
              </h1>
              <p className="mt-1 text-xs font-medium text-white/70 sm:text-sm">in {cityLabel}</p>
            </div>
          )}

          <button
            type="button"
            onClick={onBack}
            className="absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#037166] shadow-md backdrop-blur-sm transition hover:bg-white sm:left-4 sm:top-4 sm:h-10 sm:w-10"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ faqs, activeIndex, onToggle }) {
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
              Quick answers about appliance repair in your city.
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

function CategoryPageContent() {
  const router = useRouter();
  const params = useParams();
  const citySlug = params.citySlug;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [faqActiveIndex, setFaqActiveIndex] = useState(null);
  const [banners, setBanners] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(null);
  const [appLinks, setAppLinks] = useState(DEFAULT_APP_LINKS);

  const handleActiveBannerChange = useCallback((banner) => {
    setActiveBanner(banner);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi';
        const res = await fetch(`${base}/app/get_global_settings`);
        const data = await res.json();
        if (data.success && data.policy) {
          setAppLinks({
            ios: data.policy.customerIosAppLink || DEFAULT_APP_LINKS.ios,
            android: data.policy.customerAndroidAppLink || DEFAULT_APP_LINKS.android,
          });
        }
      } catch {
        /* use defaults */
      }
    })();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBannerLoading(true);
        const [carouselBanners, applianceBanners] = await Promise.all([
          fetchServiceBanners(),
          fetchApplianceServiceBanners(),
        ]);

        const merged = carouselBanners.length > 0 ? carouselBanners : applianceBanners;
        if (mounted) setBanners(merged);
      } finally {
        if (mounted) setBannerLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [cities, cats] = await Promise.all([fetchCities(), fetchCategories()]);

        const match = cities.find(
          (c) =>
            (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-') ===
            citySlug.toLowerCase(),
        );
        setSelectedCity(match || { name: citySlug, slug: citySlug });

        setCategories(
          cats.map((c) => ({
            ...c,
            image: c.image
              ? c.image.startsWith('http')
                ? c.image
                : `https://api.doorstephub.com/${c.image.replace(/^\//, '')}`
              : null,
          })),
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [citySlug]);

  const filtered = useMemo(
    () => categories.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase())),
    [categories, search],
  );

  const allFaqs = useMemo(() => {
    const merged = [
      ...(selectedCity?.faqs || []),
      ...categories.flatMap((cat) => cat.faqs || []),
    ].filter((faq) => faq && (faq.question || faq.title) && (faq.answer || faq.description));

    const seen = new Set();
    return merged.filter((faq) => {
      const key = (faq.question || faq.title || '').trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [selectedCity, categories]);

  const cityLabel = selectedCity?.name || citySlug;

  const pageTitle = useMemo(() => {
    return (
      selectedCity?.title ||
      activeBanner?.title ||
      `Appliance Repair Services in ${cityLabel}`
    );
  }, [selectedCity?.title, activeBanner?.title, cityLabel]);

  const pageDescription = useMemo(() => {
    return (
      selectedCity?.description ||
      activeBanner?.description ||
      `Book expert appliance repair and maintenance services in ${cityLabel}.`
    );
  }, [selectedCity?.description, activeBanner?.description, cityLabel]);

  useEffect(() => {
    if (pageTitle) {
      document.title = pageTitle;
    }
  }, [pageTitle]);

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: pageTitle,
    description: pageDescription,
    areaServed: {
      '@type': 'City',
      name: selectedCity?.name || citySlug,
    },
    provider: {
      '@type': 'Organization',
      name: 'Doorstep Hub',
      url: 'https://doorstephub.com',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Appliance Repair Categories',
      itemListElement: categories.slice(0, 15).map((cat) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: `${cat.name} Repair in ${selectedCity?.name || citySlug}`,
          url: `https://doorstephub.com/appliances/repair-service/${citySlug}/${cat.slug}`,
        },
      })),
    },
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f0f0]">
        <Loader2 size={32} className="animate-spin text-[#037166]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef2f1] pb-8 sm:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <ApplianceServiceHero
        banners={banners}
        bannerLoading={bannerLoading}
        cityLabel={cityLabel}
        onBack={() => router.push('/appliance-repair-services')}
        onActiveBannerChange={handleActiveBannerChange}
      />

      {/* Categories — sits below hero so banner stays fully visible */}
      <div className="relative z-20 mx-auto max-w-[1400px] px-0 sm:px-4 lg:px-8">
        <div className="rounded-t-[26px] bg-white px-3 py-3 shadow-xl shadow-black/5 sm:px-6 sm:py-4 md:px-8 md:py-5">
          <div className="mb-3 sm:mb-4">
            <h1 className="px-2 text-center text-lg font-black tracking-tight text-gray-900 sm:text-2xl md:text-3xl">
              {pageTitle}
            </h1>
            {pageDescription ? (
              <p className="mt-2 hidden px-2 text-center text-sm font-medium leading-relaxed text-gray-500 sm:block sm:text-base">
                {pageDescription}
              </p>
            ) : null}
          </div>

          {/* <div className="relative mb-5 sm:mb-6">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 sm:left-4"
            />
            <input
              type="text"
              placeholder="Search for categories"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#e8eeec] bg-[#fafbfb] py-3 pl-10 pr-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-[#037166]/40 focus:bg-white sm:rounded-2xl sm:py-3.5 sm:pl-11 sm:pr-4"
            />
          </div> */}

          {/* <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
            <h2 className="text-base font-black text-[#037166] sm:text-lg md:text-xl">
              Explore Our Services
            </h2>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:text-xs md:text-sm">
              {filtered.length} {filtered.length === 1 ? 'Service' : 'Services'}
            </span>
          </div> */}

          <div className="grid grid-cols-2 gap-x-3 gap-y-5 pt-6 min-[400px]:grid-cols-3 sm:gap-x-4 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  const publicPath = buildApplianceCategoryCityPublicPath(cat.slug, citySlug);
                  router.push(publicPath || `/appliances/repair-service/${citySlug}/${cat.slug}`);
                }}
                className="group w-full text-left focus:outline-none"
              >
                <div className="relative mx-auto mb-4 w-full max-w-[180px] sm:mb-5">
                  <div className="overflow-hidden rounded-[16px] bg-[#f3f6f5] shadow-md ring-1 ring-black/5 transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:ring-[#037166]/25 sm:rounded-[22px]">
                    <div className="aspect-square w-full overflow-hidden">
                      {cat.image ? (
                        <img
                          loading="lazy"
                          decoding="async"
                          src={cat.image}
                          alt={cat.name}
                          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#eef3f1]">
                          <Wrench size={32} className="text-[#037166]/30 group-hover:rotate-12 transition-transform duration-300 ease-out" />
                        </div>
                      )}
                    </div>
                  </div>
                  <CategoryIconBadge slug={cat.slug} />
                </div>
                <p className="px-0.5 text-center text-xs font-black leading-snug text-gray-800 sm:text-sm group-hover:text-[#037166] transition-colors duration-300 ease-out">
                  {cat.name}
                </p>
                {cat.description ? (
                  <p className="mt-1 line-clamp-2 px-1 text-center text-[10px] font-medium leading-snug text-gray-500 sm:text-xs">
                    {/* {cat.description} */}
                  </p>
                ) : null}
              </button>
            ))}

            <div className="group w-full text-left">
              <div className="relative mx-auto mb-4 w-full max-w-[180px] sm:mb-5">
                <div className="flex aspect-square flex-col items-center justify-center rounded-[16px] bg-gradient-to-b from-[#e8f5f2] to-[#dff0ec] px-1.5 py-2 shadow-md ring-1 ring-[#037166]/10 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg sm:rounded-[22px] sm:px-2.5 sm:py-3">
                  <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#037166] shadow-sm sm:mb-1.5 sm:h-10 sm:w-10 sm:rounded-xl">
                    <Smartphone size={16} strokeWidth={1.8} className="sm:h-5 sm:w-5" />
                  </div>
                  <p className="text-center text-[8px] font-black leading-tight text-[#037166] sm:text-[10px]">
                    Download Apps
                  </p>
                  <p className="mt-0.5 hidden px-1 text-center text-[8px] font-medium leading-snug text-[#037166]/70 sm:block sm:text-[9px]">
                    Book faster on mobile
                  </p>
                  <div className="mt-1 flex w-full max-w-[110px] flex-col gap-1 sm:mt-1.5 sm:max-w-[130px]">
                    <a
                      href={appLinks.android}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={APP_STORE_BUTTON_CLASS}
                      title="Get it on Google Play"
                      aria-label="Get it on Google Play"
                    >
                      <img
                        src="/andriod1.png"
                        alt="Google Play"
                        className={APP_STORE_IMAGE_CLASS}
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                    <a
                      href={appLinks.ios}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={APP_STORE_BUTTON_CLASS}
                      title="Download on the App Store"
                      aria-label="Download on the App Store"
                    >
                      <img
                        src="/apple2.png"
                        alt="App Store"
                        className={APP_STORE_IMAGE_CLASS}
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs font-black leading-snug text-[#037166] sm:text-sm">
                Get the App
              </p>
            </div>
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
              <p className="text-sm font-semibold text-gray-500">No categories match your search.</p>
            </div>
          )}

          <FaqSection
            faqs={allFaqs.slice(0, 9)}
            activeIndex={faqActiveIndex}
            onToggle={setFaqActiveIndex}
          />
        </div>
      </div>
    </main>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f0f0f0]">
          <Loader2 size={32} className="animate-spin text-[#037166]" />
        </div>
      }
    >
      <CategoryPageContent />
    </Suspense>
  );
}
