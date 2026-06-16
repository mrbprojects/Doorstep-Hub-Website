'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight, MapPin } from 'lucide-react';
import { useLocationContext } from '@/context/LocationContext';
import { fetchCategories, fetchSubcategoriesByCategorySlug } from '@/lib/api';

const sectionCopy = {
  eyebrow: 'Categories',
  title: 'Top Categories',
  description:
    'Discover a wide range of essential home and professional services, carefully categorized to help you find exactly what you need, faster and easier.',
};

function resolveImage(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${src}`;
}

function CategoryListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`list-skeleton-${index}`}
          className="h-[84px] rounded-[30px] border border-[#eef0f2] bg-white/90 animate-pulse"
        />
      ))}
    </div>
  );
}

function ServiceGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={`grid-skeleton-${index}`}
          className="h-[225px] rounded-[18px] bg-[#dfe6ea] animate-pulse"
        />
      ))}
    </div>
  );
}

export function TopCategories({ onViewAll }) {
  const initialVisibleCount = 15;
  const router = useRouter();
  const { location } = useLocationContext();
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [activeCategorySlug, setActiveCategorySlug] = useState('');
  const [showAllSubcategories, setShowAllSubcategories] = useState(true);
  const [subCategories, setSubCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [showAllVisibleCards, setShowAllVisibleCards] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      if (!location?.lat || !location?.lng) {
        if (isMounted) {
          setCategories([]);
          setSubCategories([]);
          setIsLoadingCategories(false);
        }
        return;
      }

      setIsLoadingCategories(true);

      try {
        const data = await fetchCategories(location);
        if (!isMounted) return;

        const mapped = data.map((item) => ({
          _id: item._id,
          name: item.name,
          slug: item.slug,
          image: resolveImage(item.image),
        }));

        setCategories(mapped);
        setActiveCategorySlug((current) => current || mapped[0]?.slug || '');
        setShowAllSubcategories(true);
        setShowAllVisibleCards(false);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        if (isMounted) {
          setCategories([]);
          setSubCategories([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [location?.lat, location?.lng]);

  useEffect(() => {
    let isMounted = true;

    const preloadCounts = async () => {
      if (!categories.length || !location?.lat || !location?.lng) return;

      const uncached = categories.filter((category) => categoryCounts[category.slug] === undefined);
      if (!uncached.length) return;

      const results = await Promise.allSettled(
        uncached.map((category) =>
          fetchSubcategoriesByCategorySlug(category.slug, location).then((items) => ({
            slug: category.slug,
            count: items.length,
          }))
        )
      );

      if (!isMounted) return;

      setCategoryCounts((prev) => {
        const next = { ...prev };

        results.forEach((result, index) => {
          const slug = uncached[index]?.slug;
          if (!slug) return;

          next[slug] = result.status === 'fulfilled' ? result.value.count : 0;
        });

        return next;
      });
    };

    preloadCounts();

    return () => {
      isMounted = false;
    };
  }, [categories, categoryCounts, location]);

  useEffect(() => {
    let isMounted = true;

    const loadAllSubcategories = async () => {
      if (!categories.length || !location?.lat || !location?.lng) {
        if (isMounted) setSubCategories([]);
        return;
      }

      setIsLoadingSubCategories(true);

      try {
        const results = await Promise.allSettled(
          categories.map((category) =>
            fetchSubcategoriesByCategorySlug(category.slug, location).then((items) => ({
              categorySlug: category.slug,
              items,
            }))
          )
        );

        if (!isMounted) return;

        const nextCounts = {};
        const merged = [];

        results.forEach((result) => {
          if (result.status !== 'fulfilled') return;

          const items = result.value.items || [];
          nextCounts[result.value.categorySlug] = items.length;

          items.forEach((item) => {
            merged.push({
              _id: item._id,
              name: item.name,
              slug: item.slug || item._id,
              image: resolveImage(item.image),
              description:
                item.title ||
                item.description ||
                'Professional service by verified and experienced technicians',
              categorySlug: result.value.categorySlug,
            });
          });
        });

        setCategoryCounts((prev) => ({ ...prev, ...nextCounts }));
        setSubCategories(merged);
      } catch (error) {
        console.error('Failed to fetch all subcategories:', error);
        if (isMounted) setSubCategories([]);
      } finally {
        if (isMounted) setIsLoadingSubCategories(false);
      }
    };

    const loadSubcategories = async () => {
      if (!activeCategorySlug) {
        if (isMounted) setSubCategories([]);
        return;
      }

      setIsLoadingSubCategories(true);

      try {
        const data = await fetchSubcategoriesByCategorySlug(activeCategorySlug, location);
        if (!isMounted) return;

        const mapped = data.map((item) => ({
          _id: item._id,
          name: item.name,
          slug: item.slug || item._id,
          image: resolveImage(item.image),
          description:
            item.title ||
            item.description ||
            'Professional service by verified and experienced technicians',
        }));

        setSubCategories(mapped);
        setCategoryCounts((prev) => ({
          ...prev,
          [activeCategorySlug]: mapped.length,
        }));
      } catch (error) {
        console.error('Failed to fetch subcategories:', error);
        if (isMounted) {
          setSubCategories([]);
          setCategoryCounts((prev) => ({
            ...prev,
            [activeCategorySlug]: 0,
          }));
        }
      } finally {
        if (isMounted) {
          setIsLoadingSubCategories(false);
        }
      }
    };

    if (showAllSubcategories) {
      loadAllSubcategories();
    } else {
      loadSubcategories();
    }

    return () => {
      isMounted = false;
    };
  }, [activeCategorySlug, categories, location, showAllSubcategories]);

  const activeCategory = useMemo(
    () => categories.find((category) => category.slug === activeCategorySlug) || null,
    [categories, activeCategorySlug]
  );

  const handleCategorySelect = (category) => {
    setActiveCategorySlug(category.slug);
    setShowAllSubcategories(false);
    setShowAllVisibleCards(false);
  };

  const visibleSubCategories = showAllVisibleCards
    ? subCategories
    : subCategories.slice(0, initialVisibleCount);
  const displaySubCategories = showAllSubcategories
    ? [...visibleSubCategories].sort((firstItem, secondItem) =>
        (firstItem.name || '').localeCompare(secondItem.name || '', undefined, { sensitivity: 'base' })
      )
    : visibleSubCategories;

  return (
    <section className="relative overflow-hidden bg-[#fbfbfa] py-12 sm:py-16 lg:py-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-[#037166]/6 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[#f0b16f]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <div className="mb-3 flex items-center justify-center gap-4 text-[#d38b46]">
            <span className="h-px w-10 bg-current/40" />
            <span className="text-sm font-semibold tracking-[0.2em] uppercase !text-[#037166]">{sectionCopy.eyebrow}</span>
            <span className="h-px w-10 bg-current/40" />
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-[#0c7b78] sm:text-5xl">
            {sectionCopy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#6b7280] sm:text-lg">
            {sectionCopy.description}
          </p>

          <button
            type="button"
            onClick={onViewAll}
            className="mt-5 inline-flex items-center gap-2 text-lg font-semibold !text-[#037166] transition-colors hover:text-[#c97832]"
          >
            View all
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {!location?.lat || !location?.lng ? (
          <div className="rounded-[32px] border border-[#e8ebed] bg-white/90 px-6 py-14 text-center shadow-sm">
            <MapPin className="mx-auto mb-4 h-10 w-10 text-[#037166]/50" />
            <p className="text-lg font-semibold text-[#1f2937]">Set your location to explore services near you</p>
            <button
              type="button"
              onClick={() => document.querySelector('[data-location-trigger]')?.click()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#037166] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#025951]"
            >
              Select Location
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[330px_minmax(0,1fr)] lg:items-start">
            <div className="lg:sticky lg:top-24">
              {isLoadingCategories ? (
                <CategoryListSkeleton />
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 lg:block lg:space-y-4 lg:overflow-visible lg:pb-0">
                  <motion.button
                    type="button"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAllSubcategories(true);
                      setShowAllVisibleCards(false);
                    }}
                    className={`group mb-4 h-[108px] min-w-[260px] rounded-[30px] border px-5 py-4 text-left transition-all lg:flex lg:w-full lg:min-w-0 lg:items-center lg:justify-between ${
                      showAllSubcategories
                        ? 'border-[#b7ddd8] bg-gradient-to-r from-[#eefaf8] via-white to-[#f3fffd] shadow-[0_20px_40px_rgba(3,113,102,0.14)]'
                        : 'border-[#eef0f2] bg-white hover:border-[#b7ddd8] hover:bg-gradient-to-r hover:from-[#f4fffd] hover:to-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl border ${
                        showAllSubcategories ? 'border-[#b7ddd8] bg-white shadow-sm' : 'border-[#eceff1] bg-[#f9fafb]'
                      }`}>
                        <span className="text-base font-bold text-[#037166]">All</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-lg font-semibold leading-tight ${showAllSubcategories ? 'text-[#037166]' : 'text-[#1f2937]'}`}>
                          All Services
                        </h3>
                        <p className="mt-1 text-sm text-[#6b7280]">Show every subcategory</p>
                      </div>
                    </div>
                    <div className={`mt-4 flex h-11 w-11 items-center justify-center rounded-full transition-all lg:mt-0 ${
                      showAllSubcategories
                        ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-[0_10px_24px_rgba(3,113,102,0.28)]'
                        : 'bg-[#fafafa] text-[#9ca3af] group-hover:bg-gradient-to-r group-hover:from-[#037166] group-hover:to-[#04a99d] group-hover:text-white'
                    }`}>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </motion.button>
                  {categories.map((category) => {
                    const isActive = !showAllSubcategories && category.slug === activeCategorySlug;
                    const serviceCount = categoryCounts[category.slug];

                    return (
                      <motion.button
                        key={category._id || category.slug}
                        type="button"
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCategorySelect(category)}
                        className={`group h-[108px] min-w-[260px] rounded-[30px] border px-5 py-4 text-left transition-all lg:flex lg:w-full lg:min-w-0 lg:items-center lg:justify-between ${
                          isActive
                            ? 'border-[#b7ddd8] bg-gradient-to-r from-[#eefaf8] via-white to-[#f3fffd] shadow-[0_20px_40px_rgba(3,113,102,0.14)]'
                            : 'border-[#eef0f2] bg-white hover:border-[#b7ddd8] hover:bg-gradient-to-r hover:from-[#f4fffd] hover:to-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl border ${
                              isActive ? 'border-[#b7ddd8] bg-white shadow-sm' : 'border-[#eceff1] bg-[#f9fafb]'
                            }`}
                          >
                            {category.image ? (
                              <img
                                loading="lazy"
                                decoding="async"
                                src={category.image}
                                alt={category.name}
                                className="h-11 w-11 rounded-xl object-cover"
                              />
                            ) : (
                              <span className="text-lg font-bold text-[#037166]">
                                {category.name?.charAt(0)}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3
                              className={`text-lg font-semibold leading-tight ${
                                isActive ? 'text-[#037166]' : 'text-[#1f2937]'
                              }`}
                            >
                              {category.name}
                            </h3>
                            <p className="mt-1 text-sm text-[#6b7280]">
                              {typeof serviceCount === 'number'
                                ? `${serviceCount} Services`
                                : 'Loading services...'}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`mt-4 flex h-11 w-11 items-center justify-center rounded-full transition-all lg:mt-0 ${
                            isActive
                              ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-[0_10px_24px_rgba(3,113,102,0.28)]'
                              : 'bg-[#fafafa] text-[#9ca3af] group-hover:bg-gradient-to-r group-hover:from-[#037166] group-hover:to-[#04a99d] group-hover:text-white'
                          }`}
                        >
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              {isLoadingCategories || isLoadingSubCategories ? (
                <ServiceGridSkeleton />
              ) : subCategories.length > 0 ? (
                <div>
                  <div className={`grid gap-4 ${showAllSubcategories ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' : 'sm:grid-cols-2 xl:grid-cols-4'}`}>
                    {displaySubCategories.map((subCategory, index) => (
                      <motion.button
                        key={subCategory._id || subCategory.slug || index}
                        type="button"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -6 }}
                        onClick={() => router.push(`/${subCategory.slug}`)}
                        className={`group relative overflow-hidden rounded-[18px] text-left shadow-[0_12px_30px_rgba(15,23,42,0.12)] ${showAllSubcategories ? 'h-[190px]' : 'h-[225px]'}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#d8dee4] to-[#f2f4f7]" />
                        {subCategory.image ? (
                          <img
                            loading="lazy"
                            decoding="async"
                            src={subCategory.image}
                            alt={subCategory.name}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#0f766e] to-[#1f2937]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/92 via-[#111827]/30 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0">
                          <div className="w-full rounded-none bg-black/42 px-4 py-3 backdrop-blur-md ring-1 ring-white/12 shadow-[0_10px_25px_rgba(0,0,0,0.18)]">
                            <h4 className="text-center text-[12px] font-medium leading-snug !text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] sm:text-[13px] break-words">
                              {subCategory.name}
                            </h4>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {subCategories.length > initialVisibleCount && (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setShowAllVisibleCards((current) => !current)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#d6e5e2] px-5 py-3 text-sm font-semibold text-[#037166] transition hover:bg-[#f6fbfa]"
                      >
                        {showAllVisibleCards ? 'Show Less' : `Show More (${subCategories.length})`}
                        <ChevronRight className={`h-4 w-4 transition-transform ${showAllVisibleCards ? '-rotate-90' : 'rotate-90'}`} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-[28px] border border-[#edf0f2] bg-white px-6 py-14 text-center shadow-sm">
                  <p className="text-lg font-semibold text-[#1f2937]">
                    No services found for {activeCategory?.name || 'this category'}
                  </p>
                  <p className="mt-2 text-sm text-[#6b7280]">
                    Try another category or view the full category page.
                  </p>
                  {activeCategory?.slug && (
                    <button
                      type="button"
                      onClick={() => router.push(`/${activeCategory.slug}`)}
                      className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#d6e5e2] px-5 py-3 text-sm font-semibold text-[#037166] transition hover:bg-[#f6fbfa]"
                    >
                      Open Category
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
