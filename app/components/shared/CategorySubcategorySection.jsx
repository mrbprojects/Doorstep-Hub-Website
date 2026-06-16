'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronRight, MapPin } from 'lucide-react';

function resolveImage(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${src}`;
}

function CategoryListSkeleton({ mutedCardClass }) {
  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`mobile-tab-skeleton-${index}`} className={`h-12 min-w-[120px] rounded-full animate-pulse ${mutedCardClass}`} />
        ))}
      </div>
      <div className="hidden space-y-4 lg:block">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`list-skeleton-${index}`} className={`h-[108px] rounded-[30px] animate-pulse ${mutedCardClass}`} />
        ))}
      </div>
    </>
  );
}

function ServiceGridSkeleton({ cardHeightClass }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={`grid-skeleton-${index}`} className={`${cardHeightClass} rounded-[18px] bg-white/40 animate-pulse`} />
      ))}
    </div>
  );
}

export function CategorySubcategorySection({
  categories = [],
  categoriesLoading = false,
  fetchSubcategoriesForCategory,
  onSubcategoryClick,
  onOpenCategory,
  onViewAll,
  isLocationReady = true,
  onSelectLocation,
  theme,
}) {
  const initialVisibleCount = 15;
  const [categoryCounts, setCategoryCounts] = useState({});
  const [activeCategorySlug, setActiveCategorySlug] = useState('');
  const [showAllSubcategories, setShowAllSubcategories] = useState(true);
  const [subCategories, setSubCategories] = useState([]);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [showAllVisibleCards, setShowAllVisibleCards] = useState(false);

  useEffect(() => {
    if (!categories.length) return;
    setActiveCategorySlug((current) => current || categories[0]?.slug || categories[0]?._id || '');
    setShowAllSubcategories(true);
    setShowAllVisibleCards(false);
  }, [categories]);

  useEffect(() => {
    let active = true;

    const preloadCounts = async () => {
      if (!categories.length || !fetchSubcategoriesForCategory) return;

      const uncached = categories.filter((category) => categoryCounts[category.slug || category._id] === undefined);
      if (!uncached.length) return;

      const results = await Promise.allSettled(
        uncached.map((category) => fetchSubcategoriesForCategory(category).then((items) => ({
          key: category.slug || category._id,
          count: Array.isArray(items) ? items.length : 0,
        })))
      );

      if (!active) return;

      setCategoryCounts((prev) => {
        const next = { ...prev };
        results.forEach((result, index) => {
          const key = uncached[index]?.slug || uncached[index]?._id;
          if (!key) return;
          next[key] = result.status === 'fulfilled' ? result.value.count : 0;
        });
        return next;
      });
    };

    preloadCounts();
    return () => {
      active = false;
    };
  }, [categories, categoryCounts, fetchSubcategoriesForCategory]);

  useEffect(() => {
    let active = true;

    const normalizeSubcategory = (item, category) => ({
      ...item,
      _id: item._id || item.id,
      slug: item.slug || item._id || item.id,
      name: item.name || item.subcategoryName || item.title || 'Service',
      image: resolveImage(item.image || item.category_image || item.categoryIcon),
      description:
        item.description ||
        item.title ||
        item.subcategoryDescription ||
        'Professional service by verified and experienced experts',
      categorySlug: category.slug || category._id,
    });

    const loadAllSubcategories = async () => {
      if (!categories.length || !fetchSubcategoriesForCategory) {
        if (active) setSubCategories([]);
        return;
      }

      setIsLoadingSubCategories(true);
      try {
        const results = await Promise.allSettled(
          categories.map((category) =>
            fetchSubcategoriesForCategory(category).then((items) => ({
              key: category.slug || category._id,
              category,
              items: Array.isArray(items) ? items : [],
            }))
          )
        );

        if (!active) return;

        const merged = [];
        const nextCounts = {};

        results.forEach((result) => {
          if (result.status !== 'fulfilled') return;
          const { key, category, items } = result.value;
          nextCounts[key] = items.length;
          items.forEach((item) => merged.push(normalizeSubcategory(item, category)));
        });

        setCategoryCounts((prev) => ({ ...prev, ...nextCounts }));
        setSubCategories(merged);
      } catch (error) {
        console.error('Failed to fetch subcategories:', error);
        if (active) setSubCategories([]);
      } finally {
        if (active) setIsLoadingSubCategories(false);
      }
    };

    const loadSingleCategorySubcategories = async () => {
      if (!activeCategorySlug || !fetchSubcategoriesForCategory) {
        if (active) setSubCategories([]);
        return;
      }

      const category = categories.find((item) => (item.slug || item._id) === activeCategorySlug);
      if (!category) return;

      setIsLoadingSubCategories(true);
      try {
        const items = await fetchSubcategoriesForCategory(category);
        if (!active) return;

        const normalized = (Array.isArray(items) ? items : []).map((item) => normalizeSubcategory(item, category));
        setSubCategories(normalized);
        setCategoryCounts((prev) => ({
          ...prev,
          [activeCategorySlug]: normalized.length,
        }));
      } catch (error) {
        console.error('Failed to fetch subcategories:', error);
        if (active) setSubCategories([]);
      } finally {
        if (active) setIsLoadingSubCategories(false);
      }
    };

    if (showAllSubcategories) {
      loadAllSubcategories();
    } else {
      loadSingleCategorySubcategories();
    }

    return () => {
      active = false;
    };
  }, [activeCategorySlug, categories, fetchSubcategoriesForCategory, showAllSubcategories]);

  const activeCategory = useMemo(
    () => categories.find((category) => (category.slug || category._id) === activeCategorySlug) || null,
    [categories, activeCategorySlug]
  );

  const visibleSubCategories = showAllVisibleCards
    ? subCategories
    : subCategories.slice(0, initialVisibleCount);

  const displaySubCategories = showAllSubcategories
    ? [...visibleSubCategories].sort((firstItem, secondItem) =>
        (firstItem.name || '').localeCompare(secondItem.name || '', undefined, { sensitivity: 'base' })
      )
    : visibleSubCategories;

  const handleCategorySelect = (category) => {
    setActiveCategorySlug(category.slug || category._id);
    setShowAllSubcategories(false);
    setShowAllVisibleCards(false);
  };

  return (
    <section className={`relative overflow-hidden py-12 sm:py-16 lg:py-20 ${theme.sectionClass}`}>
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <div className={`mb-3 flex items-center justify-center gap-4 ${theme.eyebrowClass}`}>
            <span className="h-px w-10 bg-current/40" />
            <span className="text-sm font-semibold tracking-[0.2em] uppercase">{theme.eyebrow}</span>
            <span className="h-px w-10 bg-current/40" />
          </div>

          <h2 className={`text-4xl font-bold tracking-tight sm:text-5xl ${theme.titleClass}`}>{theme.title}</h2>
          <p className={`mx-auto mt-4 max-w-2xl text-base leading-8 sm:text-lg ${theme.descriptionClass}`}>{theme.description}</p>

          {onViewAll ? (
            <button type="button" onClick={onViewAll} className={`mt-5 inline-flex items-center gap-2 text-lg font-semibold transition-colors ${theme.viewAllClass}`}>
              {theme.viewAllLabel || 'View all'}
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        {!isLocationReady ? (
          <div className={`rounded-[32px] px-6 py-14 text-center shadow-sm ${theme.locationBoxClass}`}>
            <MapPin className={`mx-auto mb-4 h-10 w-10 ${theme.locationIconClass}`} />
            <p className={`text-lg font-semibold ${theme.locationTitleClass}`}>{theme.locationTitle || 'Set your location to explore services near you'}</p>
            {onSelectLocation ? (
              <button type="button" onClick={onSelectLocation} className={`mt-4 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${theme.locationButtonClass}`}>
                Select Location
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[330px_minmax(0,1fr)] lg:items-start">
            <div className="lg:sticky lg:top-24">
              {categoriesLoading ? (
                <CategoryListSkeleton mutedCardClass={theme.mutedCardClass} />
              ) : (
                <>
                  <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowAllSubcategories(true);
                        setShowAllVisibleCards(false);
                      }}
                      className={`flex h-12 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition ${
                        showAllSubcategories ? theme.activeCategoryCardClass : theme.categoryCardClass
                      }`}
                    >
                      All Services
                    </motion.button>

                    {categories.map((category) => {
                      const key = category.slug || category._id;
                      const isActive = !showAllSubcategories && key === activeCategorySlug;
                      return (
                        <motion.button
                          key={`mobile-tab-${key}`}
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCategorySelect(category)}
                          className={`flex h-12 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition ${
                            isActive ? theme.activeCategoryCardClass : theme.categoryCardClass
                          } ${isActive ? theme.activeCategoryTextClass : theme.categoryTextClass}`}
                        >
                          {category.name}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="hidden gap-4 overflow-x-auto pb-2 lg:block lg:space-y-4 lg:overflow-visible lg:pb-0">
                  <motion.button
                    type="button"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAllSubcategories(true);
                      setShowAllVisibleCards(false);
                    }}
                    className={`group mb-4 h-[108px] min-w-[260px] rounded-[30px] border px-5 py-4 text-left transition-all lg:flex lg:w-full lg:min-w-0 lg:items-center lg:justify-between ${
                      showAllSubcategories ? theme.activeCategoryCardClass : theme.categoryCardClass
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl border ${showAllSubcategories ? theme.activeThumbClass : theme.thumbClass}`}>
                        <span className={`text-base font-bold ${theme.activeCategoryTextClass}`}>All</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-lg font-semibold leading-tight ${showAllSubcategories ? theme.activeCategoryTextClass : theme.categoryTextClass}`}>All Services</h3>
                        <p className={`mt-1 text-sm ${theme.countTextClass}`}>Show every subcategory</p>
                      </div>
                    </div>
                    <div className={`mt-4 flex h-11 w-11 items-center justify-center rounded-full transition-all lg:mt-0 ${showAllSubcategories ? theme.activeArrowClass : theme.arrowClass}`}>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </motion.button>

                  {categories.map((category) => {
                    const key = category.slug || category._id;
                    const isActive = !showAllSubcategories && key === activeCategorySlug;
                    const serviceCount = categoryCounts[key];
                    const categoryImage = resolveImage(category.image || category.categoryIcon || category.category_image);

                    return (
                      <motion.button
                        key={key}
                        type="button"
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCategorySelect(category)}
                        className={`group h-[108px] min-w-[260px] rounded-[30px] border px-5 py-4 text-left transition-all lg:flex lg:w-full lg:min-w-0 lg:items-center lg:justify-between ${
                          isActive ? theme.activeCategoryCardClass : theme.categoryCardClass
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl border ${isActive ? theme.activeThumbClass : theme.thumbClass}`}>
                            {categoryImage ? (
                              <img loading="lazy" decoding="async" src={categoryImage} alt={category.name} className="h-11 w-11 rounded-xl object-cover" />
                            ) : (
                              <span className={`text-lg font-bold ${isActive ? theme.activeCategoryTextClass : theme.categoryAccentTextClass}`}>{category.name?.charAt(0)}</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3 className={`text-lg font-semibold leading-tight ${isActive ? theme.activeCategoryTextClass : theme.categoryTextClass}`}>{category.name}</h3>
                            <p className={`mt-1 text-sm ${theme.countTextClass}`}>
                              {typeof serviceCount === 'number' ? `${serviceCount} Services` : 'Loading services...'}
                            </p>
                          </div>
                        </div>

                        <div className={`mt-4 flex h-11 w-11 items-center justify-center rounded-full transition-all lg:mt-0 ${isActive ? theme.activeArrowClass : theme.arrowClass}`}>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </motion.button>
                    );
                  })}
                  </div>
                </>
              )}
            </div>

            <div>
              {categoriesLoading || isLoadingSubCategories ? (
                <ServiceGridSkeleton cardHeightClass={theme.gridCardHeightClass || 'h-[190px]'} />
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
                        transition={{ delay: index * 0.04 }}
                        whileHover={{ y: -6 }}
                        onClick={() => onSubcategoryClick?.(subCategory, activeCategory)}
                        className={`group relative overflow-hidden rounded-[18px] text-left shadow-[0_12px_30px_rgba(15,23,42,0.12)] ${showAllSubcategories ? theme.gridCardHeightClass || 'h-[190px]' : 'h-[225px]'}`}
                      >
                        <div className={`absolute inset-0 ${theme.gridFallbackClass}`} />
                        {subCategory.image ? (
                          <img
                            loading="lazy"
                            decoding="async"
                            src={subCategory.image}
                            alt={subCategory.name}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : null}
                        <div className={`absolute inset-0 ${theme.gridOverlayClass}`} />
                        <div className="absolute inset-x-0 bottom-0">
                          <div className={`w-full bg-black/42 px-4 py-3 backdrop-blur-md ring-1 ring-white/12 shadow-[0_10px_25px_rgba(0,0,0,0.18)] ${theme.labelClass || ''}`}>
                            <h4 className="text-center text-[12px] font-medium leading-snug !text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] sm:text-[13px] break-words">
                              {subCategory.name}
                            </h4>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {subCategories.length > initialVisibleCount ? (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setShowAllVisibleCards((current) => !current)}
                        className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${theme.showMoreClass}`}
                      >
                        {showAllVisibleCards ? 'Show Less' : `Show More (${subCategories.length})`}
                        <ChevronRight className={`h-4 w-4 transition-transform ${showAllVisibleCards ? '-rotate-90' : 'rotate-90'}`} />
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className={`rounded-[28px] px-6 py-14 text-center shadow-sm ${theme.emptyBoxClass}`}>
                  <p className={`text-lg font-semibold ${theme.emptyTitleClass}`}>No services found for {activeCategory?.name || 'this category'}</p>
                  <p className={`mt-2 text-sm ${theme.emptyTextClass}`}>Try another category or view the full category page.</p>
                  {activeCategory && onOpenCategory ? (
                    <button
                      type="button"
                      onClick={() => onOpenCategory(activeCategory)}
                      className={`mt-5 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${theme.showMoreClass}`}
                    >
                      Open Category
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
