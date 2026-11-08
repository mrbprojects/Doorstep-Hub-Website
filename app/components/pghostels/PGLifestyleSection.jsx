'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Bed,
  Users,
  User,
  LayoutGrid,
  Building2
} from 'lucide-react';

function resolveImage(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${src}`;
}

const fallbackRoomImages = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
];

function getCategoryIcon(name, index) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('dorm')) {
    return { bg: 'bg-[#EBF3FE]', icon: <Bed className="w-5 h-5 text-[#2563EB]" /> };
  }
  if (lower.includes('co-living') || lower.includes('coliving') || lower.includes('community')) {
    return { bg: 'bg-[#FEF3C7]', icon: <Users className="w-5 h-5 text-[#D97706]" /> };
  }
  if (lower.includes('women') || lower.includes('female') || lower.includes('girl')) {
    return { bg: 'bg-[#FCE7F3]', icon: <User className="w-5 h-5 text-[#DB2777]" /> };
  }
  if (lower.includes('men') || lower.includes('boy')) {
    return { bg: 'bg-[#EDE9FE]', icon: <User className="w-5 h-5 text-[#7C3AED]" /> };
  }
  const palettes = [
    { bg: 'bg-[#EBF3FE]', icon: <Bed className="w-5 h-5 text-[#2563EB]" /> },
    { bg: 'bg-[#FEF3C7]', icon: <Users className="w-5 h-5 text-[#D97706]" /> },
    { bg: 'bg-[#FCE7F3]', icon: <User className="w-5 h-5 text-[#DB2777]" /> },
    { bg: 'bg-[#EDE9FE]', icon: <User className="w-5 h-5 text-[#7C3AED]" /> },
  ];
  return palettes[index % palettes.length];
}

function getSubcategoryIcon(name) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('women') || lower.includes('female') || lower.includes('girl')) {
    return <User className="w-3.5 h-3.5 text-pink-300" />;
  }
  if (lower.includes('shared') || lower.includes('co-living') || lower.includes('community')) {
    return <Users className="w-3.5 h-3.5 text-teal-300" />;
  }
  return <Bed className="w-3.5 h-3.5 text-teal-300" />;
}

function getSubtitle(name, desc) {
  if (desc && desc.length > 5 && desc !== 'Professional service by verified and experienced experts') {
    return desc;
  }
  const lower = (name || '').toLowerCase();
  if (lower.includes('ac dorm') && !lower.includes('non')) return 'Clean, comfortable & affordable';
  if (lower.includes('non-ac') || lower.includes('non ac')) return 'Budget-friendly shared rooms';
  if (lower.includes('women') || lower.includes('female') || lower.includes('girl')) return 'Safe & comfortable stays for women';
  if (lower.includes('furnished')) return 'Move-in ready with modern amenities';
  if (lower.includes('private')) return 'Your own space, your comfort';
  if (lower.includes('shared')) return 'Affordable living with great company';
  if (lower.includes('dorm')) return 'Comfortable & budget friendly';
  if (lower.includes('co-living') || lower.includes('coliving')) return 'Modern community living';
  return 'Modern spaces for a better stay';
}

export function PGLifestyleSection({
  categories = [],
  categoriesLoading = false,
  fetchSubcategoriesForCategory,
  onSubcategoryClick,
  onViewAll,
}) {
  const [categoryCounts, setCategoryCounts] = useState({});
  const [activeCategorySlug, setActiveCategorySlug] = useState(() => (categories.length > 0 ? (categories[0]?.slug || categories[0]?._id || '') : ''));
  const [showAllSubcategories, setShowAllSubcategories] = useState(true);
  const [subCategories, setSubCategories] = useState([]);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);

  const [prevCategoriesLen, setPrevCategoriesLen] = useState(categories.length);
  if (prevCategoriesLen !== categories.length) {
    setPrevCategoriesLen(categories.length);
    if (categories.length > 0 && !activeCategorySlug) {
      setActiveCategorySlug(categories[0]?.slug || categories[0]?._id || '');
      setShowAllSubcategories(true);
    }
  }

  // Preload and cache subcategory counts
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

  // Fetch subcategories based on selection
  useEffect(() => {
    let active = true;

    const normalizeSubcategory = (item, category) => ({
      ...item,
      _id: item._id || item.id,
      slug: item.slug || item._id || item.id,
      name: item.name || item.subcategoryName || item.title || 'Accommodation',
      image: resolveImage(item.image || item.category_image || item.categoryIcon),
      description: item.description || item.title || item.subcategoryDescription || '',
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

  const displaySubCategories = useMemo(() => {
    if (!subCategories.length) return [];
    return showAllSubcategories
      ? [...subCategories].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
      : subCategories;
  }, [subCategories, showAllSubcategories]);

  const handleCategorySelect = (category) => {
    setActiveCategorySlug(category.slug || category._id);
    setShowAllSubcategories(false);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EBF8F4] via-[#F5FCF9] to-[#E8F7F3] py-14 sm:py-16 lg:py-20 border-b border-[#DDF0E9]">
      {/* ========================================================= */}
      {/* ATMOSPHERIC BACKGROUND DECORATIONS                        */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        {/* Soft mint radial glow in center */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[#D4F4EA]/40 blur-3xl" />

        {/* Decorative Confetti & Strokes Top Left (matching reference) */}
        <div className="absolute top-10 left-12 sm:left-24 opacity-80">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Curved mint squiggle */}
            <path d="M10 38C13 32 17 31 20 37C23 43 27 42 30 36" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round"/>
            {/* Two teal confetti lines */}
            <path d="M26 8L34 18" stroke="#00796F" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M42 12L38 22" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Dotted Decorative Matrix Top Right (matching reference) */}
        <div className="absolute top-12 right-10 sm:right-20 opacity-35 hidden sm:block">
          <svg width="100" height="60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="lifestyle-dots" x="0" y="0" width="16" height="15" patternUnits="userSpaceOnUse">
                <circle cx="2.5" cy="2.5" r="2" fill="#00796F" />
              </pattern>
            </defs>
            <rect width="100" height="60" fill="url(#lifestyle-dots)" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 z-10">
        {/* ========================================================= */}
        {/* SECTION HEADER                                            */}
        {/* ========================================================= */}
        <div className="mx-auto max-w-3xl text-center mb-10 sm:mb-12 lg:mb-14">
          {/* Eyebrow Label */}
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-[#DDF8F0] border border-[#BCEEDA] text-[#00695C] text-xs font-bold tracking-widest uppercase mb-3 shadow-2xs">
            EXPLORE YOUR STAY
          </div>

          {/* Main H2 Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#102033] leading-[1.15]">
            Find a Stay That Fits Your <span className="text-[#00796F]">Lifestyle</span>
          </h2>

          {/* Description */}
          <p className="mt-3.5 text-sm sm:text-base md:text-[17px] text-[#64748B] leading-relaxed max-w-2xl mx-auto font-normal">
            Discover PGs, hostels, dormitories, private rooms and shared accommodation tailored to your comfort, preferences and budget. Explore room types and find the right place to call home.
          </p>

          {/* Action Link: Explore All Stays */}
          {onViewAll ? (
            <button
              type="button"
              onClick={onViewAll}
              className="mt-4 inline-flex items-center gap-1.5 text-base sm:text-lg font-bold text-[#00796F] hover:text-[#00695C] transition-colors group cursor-pointer"
            >
              <span>Explore All Stays</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          ) : null}
        </div>

        {/* ========================================================= */}
        {/* MAIN TWO-COLUMN CONTENT                                   */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 xl:gap-8 items-start">
          
          {/* ======================================================= */}
          {/* LEFT: CATEGORY NAVIGATION (~25% width)                  */}
          {/* ======================================================= */}
          <div className="lg:col-span-3 xl:col-span-3 min-w-0">
            {categoriesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={`cat-skel-${i}`} className="h-[76px] rounded-[24px] bg-white/70 animate-pulse border border-white/50" />
                ))}
              </div>
            ) : (
              <>
                {/* Mobile Horizontally Scrollable Category Tabs */}
                <div className="flex gap-2.5 overflow-x-auto pb-3 lg:hidden w-full scrollbar-hide select-none">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowAllSubcategories(true)}
                    className={`flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-bold transition-all border ${
                      showAllSubcategories
                        ? 'bg-[#00796F] text-white border-[#00796F] shadow-sm'
                        : 'bg-white text-[#102033] border-[#E2EAE7]'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>All Services</span>
                  </motion.button>

                  {categories.map((category) => {
                    const key = category.slug || category._id;
                    const isActive = !showAllSubcategories && key === activeCategorySlug;
                    return (
                      <motion.button
                        key={`mob-tab-${key}`}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleCategorySelect(category)}
                        className={`flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-bold transition-all border ${
                          isActive
                            ? 'bg-[#00796F] text-white border-[#00796F] shadow-sm'
                            : 'bg-white text-[#102033] border-[#E2EAE7]'
                        }`}
                      >
                        <span>{category.name}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Desktop Vertically Stacked Category Cards */}
                <div className="hidden lg:flex lg:flex-col gap-3">
                  {/* "All Services" Card */}
                  <motion.button
                    type="button"
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAllSubcategories(true)}
                    className={`group w-full rounded-[22px] p-3 pl-3.5 pr-4 text-left transition-all flex items-center justify-between border cursor-pointer ${
                      showAllSubcategories
                        ? 'bg-[#EDFAF5] border-2 border-[#00796F] shadow-[0_8px_20px_rgba(0,121,111,0.1)]'
                        : 'bg-white border-[#E5ECE9] hover:border-[#B2DFD8] hover:shadow-[0_6px_20px_rgba(0,0,0,0.04)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#D4F4EA] flex items-center justify-center text-[#00796F] shrink-0 shadow-2xs">
                        <LayoutGrid className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-[15px] font-bold leading-tight ${showAllSubcategories ? 'text-[#00796F]' : 'text-[#102033]'}`}>
                          All Services
                        </h3>
                        <p className="text-xs text-[#64748B] font-medium mt-0.5 truncate">
                          Show every subcategory
                        </p>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      showAllSubcategories
                        ? 'bg-[#00796F] text-white shadow-xs'
                        : 'bg-[#F1F5F4] text-[#94A3B8] group-hover:bg-[#00796F] group-hover:text-white'
                    }`}>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </motion.button>

                  {/* Individual Categories from API */}
                  {categories.map((category, index) => {
                    const key = category.slug || category._id;
                    const isActive = !showAllSubcategories && key === activeCategorySlug;
                    const count = categoryCounts[key];
                    const categoryImage = resolveImage(category.image || category.categoryIcon || category.category_image);
                    const themedIcon = getCategoryIcon(category.name, index);

                    return (
                      <motion.button
                        key={key}
                        type="button"
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCategorySelect(category)}
                        className={`group w-full rounded-[22px] p-3 pl-3.5 pr-4 text-left transition-all flex items-center justify-between border cursor-pointer ${
                          isActive
                            ? 'bg-[#EDFAF5] border-2 border-[#00796F] shadow-[0_8px_20px_rgba(0,121,111,0.1)]'
                            : 'bg-white border-[#E5ECE9] hover:border-[#B2DFD8] hover:shadow-[0_6px_20px_rgba(0,0,0,0.04)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs overflow-hidden ${themedIcon.bg}`}>
                            {categoryImage ? (
                              <Image
                                src={categoryImage}
                                alt={category.name}
                                className="w-7 h-7 object-contain"
                               width={28} height={28} />
                            ) : (
                              themedIcon.icon
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className={`text-[15px] font-bold leading-tight truncate ${isActive ? 'text-[#00796F]' : 'text-[#102033] group-hover:text-[#00796F]'}`}>
                              {category.name}
                            </h3>
                            <p className="text-xs text-[#64748B] font-medium mt-0.5">
                              {typeof count === 'number' ? `${count} Services` : 'Loading...'}
                            </p>
                          </div>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-[#00796F] text-white shadow-xs'
                            : 'bg-[#F1F5F4] text-[#94A3B8] group-hover:bg-[#00796F] group-hover:text-white'
                        }`}>
                          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* ======================================================= */}
          {/* RIGHT: ACCOMMODATION GRID (~75% width)                  */}
          {/* ======================================================= */}
          <div className="lg:col-span-9 xl:col-span-9 min-w-0">
            {categoriesLoading || isLoadingSubCategories ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={`grid-skel-${i}`} className="h-[190px] sm:h-[210px] rounded-[22px] bg-white/60 animate-pulse border border-white/50" />
                ))}
              </div>
            ) : displaySubCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4.5">
                {displaySubCategories.map((subCategory, index) => {
                  const fallbackImg = fallbackRoomImages[index % fallbackRoomImages.length];
                  const imgSrc = subCategory.image || fallbackImg;
                  const subtitle = getSubtitle(subCategory.name, subCategory.description);

                  return (
                    <motion.button
                      key={subCategory._id || subCategory.slug || index}
                      type="button"
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (index % 8) * 0.04, duration: 0.4 }}
                      whileHover={{ y: -5 }}
                      onClick={() => onSubcategoryClick?.(subCategory, activeCategory)}
                      className="group relative h-[190px] sm:h-[205px] xl:h-[215px] w-full rounded-[22px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(0,121,111,0.18)] transition-all text-left bg-gray-900 border border-white/40 cursor-pointer"
                    >
                      {/* Background Accommodation Image */}
                      <Image
                        src={imgSrc}
                        alt={subCategory.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                       width={500} height={300} />

                      {/* Dark Gradient Overlay for optimal readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,28,25,0.92)] via-[rgba(6,28,25,0.4)] to-transparent pointer-events-none" />

                      {/* Bottom Info Bar matching approved design */}
                      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5 flex items-center justify-between gap-2 z-10">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded-md bg-white/15 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                            {getSubcategoryIcon(subCategory.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-[13px] font-bold text-white tracking-tight leading-tight truncate drop-shadow-sm">
                              {subCategory.name}
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-[#A7F3D0] truncate font-normal leading-tight mt-0.5">
                              {subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Circular Action Button */}
                        <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-[#00897B]/85 group-hover:bg-[#00796F] flex items-center justify-center text-white shrink-0 shadow-sm transition-colors">
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              /* Empty Category State */
              <div className="rounded-[24px] px-6 py-14 text-center bg-white/80 border border-[#DDF0E9] shadow-xs">
                <Building2 className="w-10 h-10 text-[#00796F]/60 mx-auto mb-3" />
                <p className="text-base sm:text-lg font-bold text-[#102033]">
                  No stays available in this category yet.
                </p>
                <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
                  Explore all our verified PGs, hostels and co-living spaces.
                </p>
                {onViewAll ? (
                  <button
                    type="button"
                    onClick={onViewAll}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00796F] hover:bg-[#00695C] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                  >
                    <span>Explore All Stays</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

