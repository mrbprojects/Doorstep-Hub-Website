'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  GraduationCap,
  Heart,
  Home,
  Calendar,
  Landmark,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Shield,
  Sparkles,
} from 'lucide-react';

// Resolves backend relative image URLs to absolute CDN URLs
function resolveImage(src) {
  if (!src) return '';
  if (typeof src !== 'string') return '';
  if (src.startsWith('http')) return src;
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com';
  return `${baseUrl}/${src.replace(/^\//, '')}`;
}

// Map of curated fallback images from the approved reference artwork
const REFERENCE_FALLBACKS = [
  { keywords: ['astrology', 'jyotish', 'horoscope', 'kundali'], image: '/religious/categories/astrology-consultation.webp' },
  { keywords: ['birth', 'namakaran', 'cradle', 'baby'], image: '/religious/categories/birth-ceremonies.webp' },
  { keywords: ['daily', 'nitya', 'regular'], image: '/religious/categories/daily-poojas.webp' },
  { keywords: ['dosham', 'nivaran', 'shanti', 'remedy', 'remedies', 'graha'], image: '/religious/categories/dosham-remedies.webp' },
  { keywords: ['festival', 'utsav', 'ganesh', 'diwali', 'navratri', 'shiva'], image: '/religious/categories/festival-poojas.webp' },
  { keywords: ['homam', 'havan', 'yagya', 'yagnam'], image: '/religious/categories/homams-dosham-nivaran.webp' },
  { keywords: ['education', 'career', 'vidya', 'saraswati', 'exam'], image: '/religious/categories/education-career.webp' },
  { keywords: ['health', 'ayush', 'dhanvantari', 'mrityunjaya'], image: '/religious/categories/homams-health.webp' },
  { keywords: ['prosperity', 'lakshmi', 'kubera', 'wealth'], image: '/religious/categories/homams-prosperity.webp' },
  { keywords: ['horoscope', 'jathakam', 'chart'], image: '/religious/categories/horoscope-services.webp' },
  { keywords: ['house', 'griha', 'vastu', 'pravesh'], image: '/religious/categories/house-ceremonies.webp' },
  { keywords: ['marriage', 'wedding', 'vivah', 'kalyanam'], image: '/religious/categories/marriage-ceremonies.webp' },
  { keywords: ['muhurtham', 'panchangam', 'timing'], image: '/religious/categories/muhurtham-fixing.webp' },
  { keywords: ['special', 'occasion', 'anniversary'], image: '/religious/categories/special-occasion-poojas.webp' },
  { keywords: ['temple', 'mandir', 'at home'], image: '/religious/categories/temple-style-poojas.webp' },
];

function getCategoryFallbackImage(name = '', slug = '', index = 0) {
  const query = `${name} ${slug}`.toLowerCase();
  for (const item of REFERENCE_FALLBACKS) {
    if (item.keywords.some(kw => query.includes(kw))) {
      return item.image;
    }
  }
  return REFERENCE_FALLBACKS[index % REFERENCE_FALLBACKS.length].image;
}

// -------------------------------------------------------------
// EXACT DEVOTIONAL OUTLINE ICONS MATCHING APPROVED REFERENCE
// -------------------------------------------------------------

// 1. 4-Squares Grid Icon (for "All Services")
function FourSquaresOutlineIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
    </svg>
  );
}

// 2. Traditional Diya Oil Lamp Icon (for "All Poojas")
function DevotionalDiyaOutlineIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Flame */}
      <path d="M12 2C12 2 10.2 4.2 10.2 6C10.2 7 11 7.8 12 7.8C13 7.8 13.8 7 13.8 6C13.8 4.2 12 2 12 2Z" fill="currentColor" fillOpacity="0.15" />
      {/* Lamp bowl */}
      <path d="M4 11.5C4 15 7.5 17 12 17C16.5 17 20 15 20 11.5H4Z" />
      {/* Stem & base */}
      <path d="M12 17V20M8 22H16" />
    </svg>
  );
}

// 3. Astrology Chakra Mandala Wheel (for "Astrology & Religious Consultation")
function AstrologyChakraOutlineIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <line x1="12" y1="2.5" x2="12" y2="7.5" />
      <line x1="12" y1="16.5" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="7.5" y2="12" />
      <line x1="16.5" y1="12" x2="21.5" y2="12" />
      <circle cx="6.5" cy="6.5" r="0.8" fill="currentColor" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
      <circle cx="6.5" cy="17.5" r="0.8" fill="currentColor" />
      <circle cx="17.5" cy="17.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

// 4. Devotee Couple Outline Icon (for "Life Event Ceremonies")
function DevoteeCoupleOutlineIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="7" r="3" />
      <circle cx="16" cy="7" r="3" />
      <path d="M4 19C4 16 6 14 8.5 14C9.5 14 10.3 14.4 11 15" />
      <path d="M20 19C20 16 18 14 15.5 14C14.5 14 13.7 14.4 13 15" />
      <path d="M9.5 19V21.5M14.5 19V21.5" />
    </svg>
  );
}

// 5. Sacred Homam Agni Flame Icon (for "Homam / Yagnam")
function SacredAgniOutlineIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2C12 2 8 6.5 8 12C8 16.5 10 20 12 21C14 20 16 16.5 16 12C16 6.5 12 2 12 2Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 8.5C6 11 5 13.5 5 15.5C5 18 7 20 9 20" />
      <path d="M16 8.5C18 11 19 13.5 19 15.5C19 18 17 20 15 20" />
    </svg>
  );
}

// Category outline icon selector
function getDevotionalIcon(title = '') {
  const text = (title || '').toLowerCase();
  if (text.includes('astrology') || text.includes('horoscope') || text.includes('kundali') || text.includes('jyotish')) {
    return AstrologyChakraOutlineIcon;
  }
  if (text.includes('pooja') || text.includes('puja') || text.includes('daily') || text.includes('festival')) {
    return DevotionalDiyaOutlineIcon;
  }
  if (text.includes('homam') || text.includes('havan') || text.includes('yagnam') || text.includes('yagya')) {
    return SacredAgniOutlineIcon;
  }
  if (text.includes('birth') || text.includes('marriage') || text.includes('ceremonies') || text.includes('life event')) {
    return DevoteeCoupleOutlineIcon;
  }
  if (text.includes('education') || text.includes('career') || text.includes('vidya')) {
    return GraduationCap;
  }
  if (text.includes('house') || text.includes('griha') || text.includes('vastu')) {
    return Home;
  }
  if (text.includes('muhurtham') || text.includes('date') || text.includes('calendar')) {
    return Calendar;
  }
  if (text.includes('temple') || text.includes('mandir')) {
    return Landmark;
  }
  if (text.includes('health') || text.includes('ayush')) {
    return Heart;
  }
  if (text.includes('dosham') || text.includes('remedy') || text.includes('shield')) {
    return Shield;
  }
  if (text.includes('prosperity') || text.includes('wealth')) {
    return Sparkles;
  }
  return DevotionalDiyaOutlineIcon;
}

// Hanging brass bell at corners
function HangingBell({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none flex flex-col items-center ${className}`}>
      <div className="w-[1.5px] h-14 sm:h-20 bg-gradient-to-b from-[#C99632] via-[#E7AD65] to-[#B87D20]" />
      <div className="w-2.5 h-2.5 rounded-full border border-[#D9550A] bg-[#FFF2D4] -mt-0.5" />
      <svg width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm -mt-0.5">
        <path d="M12 2C8.5 2 6 5.5 6 9.5C6 14 3.5 16 2 17.5H22C20.5 16 18 14 18 9.5C18 5.5 15.5 2 12 2Z" fill="url(#bellGrad)" stroke="#B87D20" strokeWidth="1" />
        <ellipse cx="12" cy="18" rx="10" ry="2.5" fill="#E7AD65" />
        <circle cx="12" cy="22" r="2.5" fill="#C98618" stroke="#7A4E12" strokeWidth="0.8" />
        <defs>
          <linearGradient id="bellGrad" x1="6" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFE7A3" />
            <stop offset="0.5" stopColor="#F5BF50" />
            <stop offset="1" stopColor="#C98618" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Delicate temple gopuram silhouette
function TempleSilhouette({ className = '' }) {
  return (
    <svg viewBox="0 0 140 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={`pointer-events-none select-none ${className}`}>
      <path d="M70 12 L73 18 L67 18 Z" fill="#F0C67C" />
      <circle cx="70" cy="10" r="2" fill="#F0C67C" />
      <path d="M60 22 H80 L76 34 H64 Z" fill="#F6DCA8" fillOpacity="0.4" />
      <path d="M55 36 H85 L81 50 H59 Z" fill="#F6DCA8" fillOpacity="0.45" />
      <path d="M50 52 H90 L86 68 H54 Z" fill="#F6DCA8" fillOpacity="0.5" />
      <path d="M45 70 H95 L91 88 H49 Z" fill="#F6DCA8" fillOpacity="0.55" />
      <path d="M40 90 H100 L95 110 H45 Z" fill="#F6DCA8" fillOpacity="0.6" />
      <path d="M35 112 H105 L100 135 H40 Z" fill="#F6DCA8" fillOpacity="0.65" />
      <path d="M28 137 H112 V175 H28 Z" fill="#F6DCA8" fillOpacity="0.7" />
      <path d="M56 175 V148 Q70 142 84 148 V175 Z" fill="#FFF9F0" />
    </svg>
  );
}

// Golden lotus motif
function GoldenLotusIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 3C12 3 14 7 14 10C14 12 13 13.5 12 14C11 13.5 10 12 10 10C10 7 12 3 12 3Z" fill="#D9550A" />
      <path d="M12 14C13.5 13.5 17 11 18 8C19 11 17.5 14 15.5 15C14 15.8 12.8 14.8 12 14Z" fill="#EA7D25" />
      <path d="M12 14C10.5 13.5 7 11 6 8C5 11 6.5 14 8.5 15C10 15.8 11.2 14.8 12 14Z" fill="#EA7D25" />
      <path d="M12 14C14 14.5 19 14.5 21 12C20.5 15 17.5 17 15 17C13.5 17 12.5 15.5 12 14Z" fill="#F5B242" />
      <path d="M12 14C10 14.5 5 14.5 3 12C3.5 15 6.5 17 9 17C10.5 17 11.5 15.5 12 14Z" fill="#F5B242" />
      <path d="M7 18C10 20 14 20 17 18C15 19 9 19 7 18Z" fill="#B87D20" />
    </svg>
  );
}

// -------------------------------------------------------------
// EXACT ARCHED CROWN HEADER FOR "BROWSE CATEGORIES" SIDEBAR
// -------------------------------------------------------------
function BrowseCategoriesArchedHeader() {
  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox="0 0 480 155"
        className="w-full h-auto block drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="headerPurpleGrad" x1="240" y1="0" x2="240" y2="155" gradientUnits="userSpaceOnUse">
            <stop stopColor="#55113B" />
            <stop offset="0.5" stopColor="#6E174E" />
            <stop offset="1" stopColor="#55113B" />
          </linearGradient>
          <linearGradient id="archGoldGrad" x1="0" y1="0" x2="480" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E5B573" />
            <stop offset="0.5" stopColor="#FFDE99" />
            <stop offset="1" stopColor="#E5B573" />
          </linearGradient>
        </defs>

        {/* Outer Temple Arch Shape */}
        <path
          d="M 0,155 L 0,68 C 0,50 15,44 38,44 L 140,44 C 170,44 185,28 205,18 C 220,10 230,4 240,4 C 250,4 260,10 275,18 C 295,28 310,44 340,44 L 442,44 C 465,44 480,50 480,68 L 480,155 Z"
          fill="url(#headerPurpleGrad)"
        />

        {/* Inner Gold Arch Trim */}
        <path
          d="M 5,155 L 5,70 C 5,54 18,48 40,48 L 138,48 C 168,48 183,32 203,22 C 218,14 228,9 240,9 C 252,9 262,14 277,22 C 297,32 312,48 342,48 L 440,48 C 462,48 475,54 475,70 L 475,155"
          stroke="url(#archGoldGrad)"
          strokeWidth="1.8"
        />

        {/* Golden Lotus in Peak */}
        <g transform="translate(240, 27) scale(1.15)">
          <path d="M0 -10 C0 -10 3 -4 3 0 C3 3 1.5 5 0 5 C-1.5 5 -3 3 -3 0 C-3 -4 0 -10 0 -10 Z" fill="#F3C54A" />
          <path d="M0 5 C3 4 8 2 10 -1 C11 2 9 6 7 7 C5 8 3 7 0 5 Z" fill="#F3C54A" />
          <path d="M0 5 C-3 4 -8 2 -10 -1 C-11 2 -9 6 -7 7 C-5 8 -3 7 0 5 Z" fill="#F3C54A" />
          <path d="M0 5 C4 6 10 6 13 3 C12 7 9 9 7 9 C5 9 4 7 0 5 Z" fill="#E5B573" />
          <path d="M0 5 C-4 6 -10 6 -13 3 C-12 7 -9 9 -7 9 C-5 9 -4 7 0 5 Z" fill="#E5B573" />
          <path d="M-6 10 C-2 12 2 12 6 10 C4 11 -4 11 -6 10 Z" fill="#D9550A" />
        </g>

        {/* 4-Squares Gold Outline Icon */}
        <g transform="translate(86, 88)">
          <rect x="0" y="0" width="13" height="13" rx="3.5" fill="none" stroke="#F3C54A" strokeWidth="2.4" />
          <rect x="17" y="0" width="13" height="13" rx="3.5" fill="none" stroke="#F3C54A" strokeWidth="2.4" />
          <rect x="0" y="17" width="13" height="13" rx="3.5" fill="none" stroke="#F3C54A" strokeWidth="2.4" />
          <rect x="17" y="17" width="13" height="13" rx="3.5" fill="none" stroke="#F3C54A" strokeWidth="2.4" />
        </g>

        {/* "Browse Categories" Header Text */}
        <text
          x="138"
          y="112"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="29"
          fontWeight="700"
          letterSpacing="0.2"
        >
          Browse Categories
        </text>
      </svg>
    </div>
  );
}

// Card image wrapper with fallback support
function CardImage({ src, fallbackSrc, alt }) {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = hasError || !src ? fallbackSrc : src;

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      onError={() => setHasError(true)}
    />
  );
}

// Approved core categories fallback list matching reference design
const APPROVED_REFERENCE_CATEGORIES = [
  { slug: 'all-poojas', name: 'All Poojas', defaultCount: 16 },
  { slug: 'astrology-religious-consultation', name: 'Astrology & Religious Consultation', defaultCount: 6 },
  { slug: 'life-event-ceremonies', name: 'Life Event Ceremonies', defaultCount: 4 },
  { slug: 'homam-yagnam', name: 'Homam / Yagnam', defaultCount: 4 },
];

export default function SacredServiceCategoriesSection({
  categories = [],
  categoriesLoading = false,
  fetchSubcategoriesForCategory,
  onOpenCategory,
  onSubcategoryClick,
  onViewAll,
}) {
  // 'all' represents "All Services" (active by default)
  const [selectedKey, setSelectedKey] = useState('all');
  const [subcategoriesByCat, setSubcategoriesByCat] = useState({});
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [isLoadingSubcats, setIsLoadingSubcats] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [visibleLimit, setVisibleLimit] = useState(15);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const containerRef = useRef(null);

  // Normalize subcategory object
  const normalizeSubcategory = useCallback((item, parentCat) => ({
    _id: item._id || item.id,
    slug: item.slug || item._id || item.id,
    name: item.name || item.subcategoryName || item.title || 'Sacred Service',
    image: resolveImage(item.image || item.category_image || item.categoryIcon),
    description: item.description || item.subcategoryDescription || '',
    categorySlug: parentCat?.slug || parentCat?._id || '',
    parentName: parentCat?.name || '',
  }), []);

  // Preload subcategories for all parent categories
  useEffect(() => {
    let active = true;

    if (!categories.length || !fetchSubcategoriesForCategory) {
      return;
    }

    queueMicrotask(() => {
      if (!active) return;
      setIsLoadingSubcats(true);
      setFetchError(null);
    });

    Promise.allSettled(
      categories.map(async (category) => {
        const items = await fetchSubcategoriesForCategory(category);
        return {
          key: category.slug || category._id,
          category,
          items: Array.isArray(items) ? items : [],
        };
      })
    )
      .then((results) => {
        if (!active) return;
        const byCatMap = {};
        const countsMap = {};
        const mergedAll = [];

        results.forEach((res) => {
          if (res.status === 'fulfilled') {
            const { key, category, items } = res.value;
            const normalized = items.map((it) => normalizeSubcategory(it, category));
            byCatMap[key] = normalized;
            countsMap[key] = normalized.length;
            normalized.forEach((item) => mergedAll.push(item));
          }
        });

        countsMap['all'] = mergedAll.length;

        setSubcategoriesByCat(byCatMap);
        setCategoryCounts(countsMap);
        setAllSubcategories(mergedAll);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Error preloading subcategories for religious services:', err);
        setFetchError('Unable to load categories right now.');
      })
      .finally(() => {
        if (active) setIsLoadingSubcats(false);
      });

    return () => {
      active = false;
    };
  }, [categories, fetchSubcategoriesForCategory, normalizeSubcategory, reloadTrigger]);

  // Combined categories list for sidebar: uses backend categories, or fallback reference categories
  const sidebarCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories;
    }
    return APPROVED_REFERENCE_CATEGORIES;
  }, [categories]);

  // Determine which subcategories to show based on selectedKey
  const activeCards = useMemo(() => {
    if (selectedKey === 'all') {
      return allSubcategories;
    }
    return subcategoriesByCat[selectedKey] || [];
  }, [selectedKey, allSubcategories, subcategoriesByCat]);

  // Visible cards slice (leave slot for 1 "View All Categories" card in desktop 4x4 layout)
  const displayedCards = useMemo(() => {
    return activeCards.slice(0, visibleLimit);
  }, [activeCards, visibleLimit]);

  // Handle parent category click
  const handleSelectCategory = (key) => {
    setSelectedKey(key);
    setVisibleLimit(15);
  };

  // Handle card click
  const handleCardClick = (subcat) => {
    if (onSubcategoryClick) {
      onSubcategoryClick(subcat);
    } else if (onOpenCategory) {
      onOpenCategory(subcat);
    }
  };

  // Handle "View All"
  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    }
  };

  return (
    <section
      ref={containerRef}
      aria-label="Sacred Pooja Services"
      className="relative w-full pt-4 pb-6 sm:pt-6 sm:pb-8 md:pt-8 md:pb-10 bg-[#FFF9F0] overflow-hidden"
    >
      {/* Devotional Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#E8CFA8_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Hanging Golden Bells (Top Left & Top Right) */}
      <div className="absolute top-0 left-6 sm:left-12 lg:left-20 z-10 hidden sm:block">
        <HangingBell />
      </div>
      <div className="absolute top-0 right-6 sm:right-12 lg:right-20 z-10 hidden sm:block">
        <HangingBell />
      </div>

      {/* Temple Gopuram Silhouettes (Background flanking heading) */}
      <div className="absolute top-4 left-[10%] lg:left-[16%] opacity-15 pointer-events-none hidden md:block">
        <TempleSilhouette className="w-28 h-36 lg:w-36 lg:h-44" />
      </div>
      <div className="absolute top-4 right-[10%] lg:right-[16%] opacity-15 pointer-events-none hidden md:block">
        <TempleSilhouette className="w-28 h-36 lg:w-36 lg:h-44" />
      </div>

      <div className="container max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ========================================================= */}
        {/* TOP SECTION: Devotional Heading & Decorative Elements    */}
        {/* ========================================================= */}
        <div className="flex flex-col items-center text-center mb-5 sm:mb-8">
          {/* Small Decorative Label */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#FFF2DE] border border-[#F2D1A0] text-[#D9550A] text-xs sm:text-sm font-semibold mb-3.5 shadow-sm">
            <span className="w-6 h-[1px] bg-[#E5B573] inline-block" />
            <GoldenLotusIcon className="w-4 h-4 text-[#D9550A]" />
            <span className="tracking-wide">Explore & Book</span>
            <span className="w-6 h-[1px] bg-[#E5B573] inline-block" />
          </div>

          {/* Main Heading: Deep Purple + Saffron */}
          <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[44px] text-[#4C124D] tracking-tight leading-tight mb-2 sm:mb-3">
            Sacred Service <span className="text-[#D9550A]">Categories</span>
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-[#725C61] max-w-2xl font-normal leading-relaxed mb-3 sm:mb-4">
            Browse divine categories and find the exact ritual or spiritual service you need.
          </p>

          {/* Centered Golden Lotus Divider */}
          <div className="flex items-center justify-center gap-3 w-48 sm:w-64">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#E7AD65] to-[#D9550A]" />
            <GoldenLotusIcon className="w-5 h-5 text-[#D9550A]" />
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#E7AD65] to-[#D9550A]" />
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN BODY: Left Category Sidebar + Right 4-Column Grid   */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6 lg:gap-8">
          {/* ======================================================= */}
          {/* LEFT SIDEBAR: Browse Categories Exact Reference Design  */}
          {/* ======================================================= */}
          <aside className="w-full lg:w-[320px] xl:w-[340px] shrink-0">
            <div className="rounded-[28px] sm:rounded-[32px] overflow-hidden border-2 border-[#E2C4A2] bg-[#FFFDF7] shadow-[0_12px_36px_rgba(89,19,63,0.08)]">
              {/* Arched Temple Crown Header */}
              <BrowseCategoriesArchedHeader />

              {/* Sidebar Content Area */}
              <div className="p-3 sm:p-4 flex flex-col justify-between lg:min-h-[500px]">
                {/* Category Options List */}
                <div className="space-y-1">
                  {/* 1. "All Services" Row */}
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('all')}
                    className={`w-full group flex items-center justify-between px-3.5 py-3.5 rounded-2xl text-left transition-all duration-200 border ${selectedKey === 'all'
                        ? 'bg-[#FFEBD4] border-[#F4C290] shadow-sm'
                        : 'bg-transparent hover:bg-[#FFF5E8] border-transparent border-b border-[#F0E5D8]'
                      }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <FourSquaresOutlineIcon
                        className={`w-5 h-5 shrink-0 transition-colors ${selectedKey === 'all' ? 'text-[#D9550A]' : 'text-[#5A1643] group-hover:text-[#D9550A]'
                          }`}
                      />
                      <span
                        className={`text-[15px] sm:text-[16px] truncate ${selectedKey === 'all' ? 'text-[#42143F] font-bold' : 'text-[#3D0B2E] font-bold'
                          }`}
                      >
                        All Services
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span
                        className={`text-xs sm:text-sm px-2.5 py-0.5 rounded-full font-bold ${selectedKey === 'all'
                            ? 'bg-[#FFF3E3] border border-[#F4D2B2] text-[#C8500C]'
                            : 'bg-[#F4ECE3] text-[#5C2042]'
                          }`}
                      >
                        {categoryCounts['all'] !== undefined && categoryCounts['all'] > 0
                          ? `${categoryCounts['all']}+`
                          : '120+'}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-200 ${selectedKey === 'all'
                            ? 'text-[#C8500C] translate-x-0.5'
                            : 'text-[#5C2042] group-hover:text-[#C8500C] group-hover:translate-x-0.5'
                          }`}
                      />
                    </div>
                  </button>

                  {/* Skeletons while categories load */}
                  {categoriesLoading && (
                    <div className="space-y-2.5 pt-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={`cat-skel-${i}`}
                          className="h-12 rounded-2xl bg-[#F6EDE0] animate-pulse"
                        />
                      ))}
                    </div>
                  )}

                  {/* 2. Dynamic or Reference Parent Categories */}
                  {!categoriesLoading &&
                    sidebarCategories.map((cat, idx) => {
                      const catKey = cat.slug || cat._id || `cat-${idx}`;
                      const isSelected = selectedKey === catKey;
                      const dynamicCount = categoryCounts[catKey];
                      const displayCount = dynamicCount !== undefined && dynamicCount > 0
                        ? dynamicCount
                        : cat.defaultCount || (idx === 0 ? 16 : idx === 1 ? 6 : 4);
                      const IconComponent = getDevotionalIcon(cat.name);

                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => handleSelectCategory(catKey)}
                          className={`w-full group flex items-center justify-between px-3.5 py-3.5 rounded-2xl text-left transition-all duration-200 border ${isSelected
                              ? 'bg-[#FFEBD4] border-[#F4C290] shadow-sm'
                              : 'bg-transparent hover:bg-[#FFF5E8] border-transparent border-b border-[#F0E5D8]/80'
                            }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <IconComponent
                              className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-colors ${isSelected ? 'text-[#D9550A]' : 'text-[#5A1643] group-hover:text-[#D9550A]'
                                }`}
                            />
                            <span
                              className={`text-[15px] sm:text-[16px] leading-snug line-clamp-2 ${isSelected ? 'text-[#42143F] font-bold' : 'text-[#3D0B2E] font-bold'
                                }`}
                            >
                              {cat.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span
                              className={`text-xs sm:text-sm px-2.5 py-0.5 rounded-full font-bold ${isSelected
                                  ? 'bg-[#FFF3E3] border border-[#F4D2B2] text-[#C8500C]'
                                  : 'bg-[#F4ECE3] text-[#5C2042]'
                                }`}
                            >
                              {displayCount}
                            </span>
                            <ChevronRight
                              className={`w-4 h-4 transition-transform duration-200 ${isSelected
                                  ? 'text-[#C8500C] translate-x-0.5'
                                  : 'text-[#5C2042] group-hover:text-[#C8500C] group-hover:translate-x-0.5'
                                }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                </div>

                {/* Bottom Diya & Floral Decoration Matching Reference (Desktop Only to keep Mobile Compact) */}
                <div className="hidden lg:block pt-6 pb-2 select-none pointer-events-none">
                  {/* Subtle lotus flourish line */}
                  <div className="flex items-center justify-center mb-3 opacity-60">
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#E2C4A2] to-transparent" />
                    <GoldenLotusIcon className="w-3.5 h-3.5 text-[#D9550A] mx-2" />
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#E2C4A2] to-transparent" />
                  </div>

                  {/* High Resolution Brass Diya with Jasmine & Pink Lotus */}
                  <div className="relative w-full max-w-[280px] h-32 sm:h-36 mx-auto">
                    <Image
                      src="/religious/categories/sidebar-diya-lotus.webp"
                      alt="Traditional Brass Diya with Jasmine and Pink Lotus"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ======================================================= */}
          {/* RIGHT GRID: 4-Column Category Image Cards               */}
          {/* ======================================================= */}
          <main className="flex-1 w-full min-w-0">
            {/* Header / Count info bar */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-[#74164D]">
                  {selectedKey === 'all'
                    ? 'All Sacred Offerings'
                    : sidebarCategories.find((c) => (c.slug || c._id) === selectedKey)?.name || 'Category Offerings'}
                </span>
                {activeCards.length > 0 && (
                  <span className="text-xs bg-[#FFE5B2] text-[#42143F] font-semibold px-2 py-0.5 rounded-full">
                    {activeCards.length} services
                  </span>
                )}
              </div>

              {selectedKey !== 'all' && (
                <button
                  type="button"
                  onClick={() => handleSelectCategory('all')}
                  className="text-xs text-[#D9550A] hover:text-[#74164D] font-semibold hover:underline"
                >
                  Show all categories
                </button>
              )}
            </div>

            {/* Loading Skeleton */}
            {isLoadingSubcats && activeCards.length === 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={`grid-skel-${i}`}
                    className="flex flex-col rounded-2xl overflow-hidden bg-white/70 border border-[#EAD8C3] shadow-sm animate-pulse"
                  >
                    <div className="w-full aspect-[16/10] bg-[#F4E9DC]" />
                    <div className="p-3 bg-[#FFFBF4] space-y-2">
                      <div className="h-4 bg-[#EAD8C3] rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {fetchError && (
              <div className="p-8 text-center rounded-2xl bg-[#FFF6F2] border border-[#F4C4B4] space-y-3">
                <p className="text-sm font-medium text-[#74164D]">{fetchError}</p>
                <button
                  type="button"
                  onClick={() => setReloadTrigger((prev) => prev + 1)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D9550A] text-white text-xs font-semibold hover:bg-[#B84205] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingSubcats && !fetchError && activeCards.length === 0 && (
              <div className="p-10 text-center rounded-2xl bg-white/80 border border-[#EAD8C3] space-y-3">
                <GoldenLotusIcon className="w-8 h-8 mx-auto text-[#D9550A]" />
                <p className="text-base font-semibold text-[#42143F]">
                  {selectedKey === 'all'
                    ? 'No sacred service categories are currently available.'
                    : 'No categories found for this selection.'}
                </p>
                {selectedKey !== 'all' && (
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('all')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFE5B2] text-[#42143F] text-xs font-bold hover:bg-[#F3C54A] transition-colors"
                  >
                    View all offerings
                  </button>
                )}
              </div>
            )}

            {/* Category Cards Grid */}
            {!fetchError && activeCards.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {displayedCards.map((subcat, idx) => {
                  const fallback = getCategoryFallbackImage(subcat.name, subcat.slug, idx);
                  const Icon = getDevotionalIcon(subcat.name);

                  return (
                    <article
                      key={subcat._id || subcat.slug || idx}
                      onClick={() => handleCardClick(subcat)}
                      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#FFFBF4] border border-[#EAD8C3] hover:border-[#D9550A] shadow-sm hover:shadow-[0_12px_28px_rgba(217,85,10,0.14)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D9550A]"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCardClick(subcat);
                        }
                      }}
                    >
                      {/* Top Image Part */}
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#FFE7C8] to-[#FFD5BA]">
                        <CardImage
                          src={subcat.image}
                          fallbackSrc={fallback}
                          alt={subcat.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                      </div>

                      {/* Bottom Ivory Label Panel */}
                      <div className="flex items-center gap-2.5 px-3 py-2.5 sm:px-3.5 sm:py-3 bg-[#FFFBF4] border-t border-[#F0E2D2] min-h-[52px]">
                        <div className="shrink-0 text-[#D9550A]">
                          <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-[#42143F] leading-snug line-clamp-2 text-left group-hover:text-[#D9550A] transition-colors">
                          {subcat.name}
                        </h4>
                      </div>
                    </article>
                  );
                })}

                {/* 16th Card: "View All Categories" Card */}
                <div
                  onClick={handleViewAll}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleViewAll();
                    }
                  }}
                  className="group flex flex-col items-center justify-center text-center p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#F6F0F8] via-[#FAF4FD] to-[#FFF8F0] border-2 border-dashed border-[#B89CB8] hover:border-[#74164D] hover:bg-[#F2E8F6] shadow-sm hover:shadow-[0_12px_28px_rgba(116,22,77,0.12)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer min-h-[140px] sm:min-h-[160px]"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#EDE1F2] group-hover:bg-[#74164D] text-[#74164D] group-hover:text-white flex items-center justify-center mb-2.5 transition-colors duration-300">
                    <FourSquaresOutlineIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#4C124D] leading-tight mb-1.5">
                    View All Categories
                  </h4>
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#D9550A] group-hover:text-[#74164D] transition-colors">
                    <span>Explore more</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
