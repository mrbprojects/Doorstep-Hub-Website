'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  MapPin,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Home,
  Shield,
  Heart,
  Truck,
  Receipt,
  Headphones,
  Tv,
  Volume2,
  Cpu,
  Power,
  Wrench,
  Sparkles,
  Calendar,
  Coins,
  Clock,
  Award,
  Laptop,
  Snowflake,
  Droplets,
  RotateCcw,
  Flame
} from 'lucide-react';
import { useLocationContext } from '@/context/LocationContext';
import { imageLoader } from '@/lib/api';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi').replace(/\/+$/, '');

// Utility to clean raw HTML tags (e.g. <p>, <br>, &nbsp;) into clean readable text
function cleanDescription(html) {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function ServicesListingPage({ category, subCategory, subCategoryId, childCategoryId, slug }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { location } = useLocationContext();

  // Active tab: 'services' (All Services) by default, or 'centers' (Nearby Centers)
  const [activeTab, setActiveTab] = useState('services');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest', 'rating', 'orders'
  const [minRating, setMinRating] = useState(parseFloat(searchParams.get('rating')) || 0);

  const [services, setServices] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('dhub_favorite_partners') || '[]');
    } catch {
      return [];
    }
  });

  // Categories & Subcategories State
  const [allCategories, setAllCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categorySubcats, setCategorySubcats] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(false);
  const fetchedCatsRef = useRef(new Set());

  // Dynamic Service / Category identification
  const currentSlug = slug || 'lcd-tv-repair';
  const isLaptop = currentSlug.includes('laptop') || currentSlug.includes('computer');
  const isTv = currentSlug.includes('tv');

  // Metadata State
  const initialTitle = subCategory || (isLaptop ? 'Laptop Repair Service' : isTv ? 'LCD TV Repair' : 'Appliance Repair Service');
  const [pageTitle, setPageTitle] = useState(initialTitle);
  const [categoryName, setCategoryName] = useState(category || (isLaptop ? 'Computer Repair' : isTv ? 'TV Repair' : 'Appliance Repair'));
  const [categorySlug, setCategorySlug] = useState(isLaptop ? 'computer-repair-services' : isTv ? 'tv-repair-services' : 'appliances');
  const [customDescription, setCustomDescription] = useState('');
  const [categoryFaqs, setCategoryFaqs] = useState([]);
  const [faqActiveIndex, setFaqActiveIndex] = useState(null);

  // Dynamic city from location context
  const cityName = useLocationContext()?.location?.city || (isLaptop ? 'Hyderabad' : 'Vijayawada');

  useEffect(() => {
    if (subCategory) setPageTitle(subCategory);
    if (category) {
      if (category.toLowerCase().includes('tv')) {
        setCategoryName('TV Repair');
        setCategorySlug('tv-repair-services');
      } else if (category.toLowerCase().includes('computer') || category.toLowerCase().includes('laptop')) {
        setCategoryName('Computer Repair');
        setCategorySlug('computer-repair-services');
      } else {
        setCategoryName(category);
      }
    }
  }, [category, subCategory]);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('dhub_favorite_partners', JSON.stringify(next));
      } catch (err) {}
      return next;
    });
  };

  const isFavorite = (id) => favorites.includes(id);

  // Fetch Services & Centers from real backend API
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const apiUrl = `${API_BASE}/app/applience-repairs-website/services_by_subcategory`;
        const body = {
          lattitude: location?.lat || (isLaptop ? '17.3850' : '16.5062'),
          longitude: location?.lng || (isLaptop ? '78.4867' : '80.6480'),
          cityName: location?.city || cityName,
          city: location?.city || cityName,
          slug: currentSlug
        };

        if (subCategoryId) body.subcategoryId = subCategoryId;
        if (childCategoryId) body.childcategoryId = childCategoryId;
        if (minRating > 0) body.minRating = minRating;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setServices(data.dhubServices || []);
            const rawCenters = data.nearByServiceCenters || data.nearbyServiceCenters || data.serviceCenters || [];
            setCenters(rawCenters);

            if (data.categoryFaqs && data.categoryFaqs.length > 0) {
              setCategoryFaqs(data.categoryFaqs);
            } else if (data.faqs && data.faqs.length > 0) {
              setCategoryFaqs(data.faqs);
            }

            if (data.categoryDescription) setCustomDescription(data.categoryDescription);
            if (data.categoryTitle && !subCategory) setPageTitle(data.categoryTitle);
          } else {
            setServices([]);
            setCenters([]);
          }
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setServices([]);
        setCenters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [subCategoryId, childCategoryId, currentSlug, location?.lat, location?.lng, location?.city, minRating, cityName, isLaptop]);

  // Fetch All Categories for Sidebar
  useEffect(() => {
    const fetchAllCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch(`${API_BASE}/app/applience-repairs-website/getallcategorys`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lattitude: location?.lat || '16.5062',
            longitude: location?.lng || '80.6480',
          })
        });

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setAllCategories(data.data);

          // Find matching category to expand
          const targetCat = data.data.find(c => {
            if (isLaptop && (c.name?.toLowerCase().includes('computer') || c.slug?.includes('computer'))) return true;
            if (isTv && (c.name?.toLowerCase().includes('tv') || c.slug?.includes('tv'))) return true;
            if (category && (c.name?.toLowerCase() === category.toLowerCase() || c.slug === category)) return true;
            return false;
          }) || data.data.find(c => c.name?.toLowerCase().includes('tv'));

          if (targetCat) {
            setExpandedCategory(targetCat._id);
            fetchSubcategories(targetCat._id, targetCat.slug);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchAllCategories();
  }, [location?.lat, location?.lng, isLaptop, isTv, category]);

  const fetchSubcategories = async (catId, catSlug) => {
    if (fetchedCatsRef.current.has(catId) || categorySubcats[catId]) return;
    fetchedCatsRef.current.add(catId);

    try {
      const response = await fetch(`${API_BASE}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: catSlug })
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setCategorySubcats(prev => ({ ...prev, [catId]: data.data }));
      }
    } catch (e) {
      console.error("Error fetching subcats:", e);
    }
  };

  const handleRatingChange = (rating) => {
    const newRating = rating === minRating ? 0 : rating;
    setMinRating(newRating);

    const params = new URLSearchParams(searchParams.toString());
    if (newRating > 0) {
      params.set('rating', newRating.toString());
    } else {
      params.delete('rating');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const resetFilters = () => {
    setMinRating(0);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('rating');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Sorting and Filtering Centers
  const sortedCenters = useMemo(() => {
    let list = [...centers];

    // Filter by min rating
    if (minRating > 0) {
      list = list.filter(c => (parseFloat(c.rating) || 0) >= minRating);
    }

    if (sortBy === 'nearest') {
      return list.sort((a, b) => {
        const distA = parseFloat(a.distance || a.distanceInKm) || 999;
        const distB = parseFloat(b.distance || b.distanceInKm) || 999;
        return distA - distB;
      });
    }
    if (sortBy === 'rating') {
      return list.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    }
    if (sortBy === 'orders') {
      return list.sort((a, b) => (parseInt(b.totalOrders || b.orders) || 0) - (parseInt(a.totalOrders || a.orders) || 0));
    }
    return list;
  }, [centers, sortBy, minRating]);

  // Sorting and Filtering Services
  const sortedServices = useMemo(() => {
    let list = [...services];
    if (minRating > 0) {
      list = list.filter(s => (parseFloat(s.rating || 5)) >= minRating);
    }
    return list;
  }, [services, minRating]);

  // Open Location Modal
  const openLocationModal = () => {
    if (typeof document !== 'undefined') {
      const desktopBtn = document.querySelector('[data-location-trigger]');
      if (desktopBtn) {
        desktopBtn.click();
        return;
      }
      const mobileBtn = document.querySelector('[data-location-trigger-mobile]');
      if (mobileBtn) mobileBtn.click();
    }
  };

  const handleBack = () => {
    if (categorySlug) {
      router.push(`/${categorySlug}`);
    } else {
      router.push('/appliances');
    }
  };

  // Dynamic description & fallback FAQs
  const pageDescription = customDescription
    ? cleanDescription(customDescription)
    : isLaptop
      ? 'Professional laptop repair and maintenance at your doorstep. Get expert service, genuine parts, and reliable support for all major brands.'
      : `Doorstep Hub provides reliable ${pageTitle} for all major brands and models. Our experienced technicians diagnose and repair hardware faults, motherboard issues, display problems, software errors, and performance glitches at your home across ${cityName}.`;

  const faqsToDisplay = categoryFaqs.length > 0 ? categoryFaqs : [
    {
      question: `What ${pageTitle} does Doorstep Hub provide?`,
      answer: `We provide complete doorstep ${pageTitle}, including diagnostics, chip-level motherboard repair, component replacement, software troubleshooting, preventive maintenance, and genuine parts with warranty.`
    },
    {
      question: `Do you service all brands and models?`,
      answer: `Yes, our certified technicians service all leading brands including Dell, HP, Lenovo, Apple, Asus, Acer, Sony, Samsung, LG, and more.`
    },
    {
      question: `How fast can a technician arrive at my doorstep?`,
      answer: `In ${cityName}, our verified technicians typically arrive within 60 to 90 minutes of booking confirmation.`
    }
  ];

  // Dynamic category label (e.g. DOORSTEP HUB • COMPUTER REPAIR SERVICES)
  const rawCategory = (categoryName || category || (isLaptop ? 'Computer Repair' : 'Appliance Repair')).toUpperCase().replace(/REPAIR$/, 'REPAIR SERVICES').replace(/SERVICES SERVICES$/, 'SERVICES');
  const categoryHeaderLabel = `DOORSTEP HUB • ${rawCategory.includes('SERVICES') ? rawCategory : `${rawCategory} SERVICES`}`;

  // Dynamic category feature capsules mapping
  const getCategoryFeaturePills = (catName, pTitle) => {
    const lower = `${catName || ''} ${pTitle || ''}`.toLowerCase();
    if (lower.includes('laptop') || lower.includes('computer')) {
      return [
        { icon: Laptop, label: 'Display & Screen Issues', iconColor: 'text-[#00B8A9]' },
        { icon: Volume2, label: 'Sound Problems', iconColor: 'text-[#00B8A9]' },
        { icon: Cpu, label: 'Motherboard Repair', iconColor: 'text-[#00B8A9]' },
        { icon: ShieldCheck, label: '30 to 90 Days Service Warranty on Repairs', iconColor: 'text-[#FFC928]' },
      ];
    }
    if (lower.includes('tv') || lower.includes('television')) {
      return [
        { icon: Tv, label: 'Display & Screen Issues', iconColor: 'text-[#00B8A9]' },
        { icon: Volume2, label: 'Sound Problems', iconColor: 'text-[#00B8A9]' },
        { icon: Cpu, label: 'Motherboard Repair', iconColor: 'text-[#00B8A9]' },
        { icon: ShieldCheck, label: '30 to 90 Days Service Warranty on Repairs', iconColor: 'text-[#FFC928]' },
      ];
    }
    if (lower.includes('ac') || lower.includes('air conditioner')) {
      return [
        { icon: Snowflake, label: 'Cooling Problems', iconColor: 'text-[#00B8A9]' },
        { icon: Droplets, label: 'Gas Leakage', iconColor: 'text-[#00B8A9]' },
        { icon: Cpu, label: 'PCB Repair', iconColor: 'text-[#00B8A9]' },
        { icon: ShieldCheck, label: '30 to 90 Days Service Warranty on Repairs', iconColor: 'text-[#FFC928]' },
      ];
    }
    if (lower.includes('washing') || lower.includes('dryer')) {
      return [
        { icon: RotateCcw, label: 'Spin Problems', iconColor: 'text-[#00B8A9]' },
        { icon: Droplets, label: 'Water Leakage', iconColor: 'text-[#00B8A9]' },
        { icon: Cpu, label: 'Motor & PCB Repair', iconColor: 'text-[#00B8A9]' },
        { icon: ShieldCheck, label: '30 to 90 Days Service Warranty on Repairs', iconColor: 'text-[#FFC928]' },
      ];
    }
    if (lower.includes('refrigerator') || lower.includes('fridge')) {
      return [
        { icon: Snowflake, label: 'Cooling Issues', iconColor: 'text-[#00B8A9]' },
        { icon: Cpu, label: 'Compressor Repair', iconColor: 'text-[#00B8A9]' },
        { icon: Droplets, label: 'Gas Leakage', iconColor: 'text-[#00B8A9]' },
        { icon: ShieldCheck, label: '30 to 90 Days Service Warranty on Repairs', iconColor: 'text-[#FFC928]' },
      ];
    }
    if (lower.includes('geyser') || lower.includes('heater')) {
      return [
        { icon: Flame, label: 'Heating Problems', iconColor: 'text-[#00B8A9]' },
        { icon: Wrench, label: 'Thermostat Repair', iconColor: 'text-[#00B8A9]' },
        { icon: Droplets, label: 'Water Leakage', iconColor: 'text-[#00B8A9]' },
        { icon: ShieldCheck, label: '30 to 90 Days Service Warranty on Repairs', iconColor: 'text-[#FFC928]' },
      ];
    }
    return [
      { icon: Wrench, label: 'Expert At-Home Diagnosis', iconColor: 'text-[#00B8A9]' },
      { icon: Cpu, label: 'Genuine Component Replacement', iconColor: 'text-[#00B8A9]' },
      { icon: Sparkles, label: 'Complete Maintenance Check', iconColor: 'text-[#00B8A9]' },
      { icon: ShieldCheck, label: '30 to 90 Days Service Warranty on Repairs', iconColor: 'text-[#FFC928]' },
    ];
  };

  const featurePills = getCategoryFeaturePills(categoryName, pageTitle);

  const handleHeroBookService = () => {
    const gridEl = document.getElementById('services-listing-grid');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (sortedServices.length > 0 && sortedServices[0].slug) {
      router.push(`/${sortedServices[0].slug}`);
    } else {
      router.push('/book-appointment');
    }
  };

  return (
    <div className="bg-white min-h-screen text-gray-900 overflow-x-hidden pt-24 sm:pt-28 lg:pt-20">
      {/* =========================================================================
          HERO SECTION — IMAGE-FREE TEAL-GREEN DESIGN (PER USER SPECIFICATION)
      ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#004D49] via-[#005B54] to-[#006B62] text-white">
        {/* Ambient SVG Waves, Glowing Ribbons & Decorative Matrices */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Radial color glows */}
          <div className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-[#00B8A9]/15 rounded-full blur-[110px]" />
          <div className="absolute -bottom-32 -left-32 w-[550px] h-[550px] bg-[#00B8A9]/10 rounded-full blur-[110px]" />

          {/* Flowing Teal Waves & Golden Yellow Ribbon (Matching Screenshot) */}
          <svg
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 1440 380"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Luminous teal waves */}
            <path
              d="M-80 240C220 340 500 160 880 150C1180 140 1340 30 1550 -10"
              stroke="url(#hero-teal-wave-1)"
              strokeWidth="1.5"
            />
            <path
              d="M-40 330C280 410 620 230 960 190C1240 160 1400 80 1600 20"
              stroke="url(#hero-teal-wave-2)"
              strokeWidth="2"
            />
            <path
              d="M200 370C520 400 780 290 1140 250C1320 230 1480 180 1640 130"
              stroke="url(#hero-teal-wave-1)"
              strokeWidth="1"
              strokeOpacity="0.3"
            />

            {/* Glowing Golden Yellow Curved Ribbon */}
            <path
              d="M640 320C780 290 920 340 1080 320C1160 310 1240 270 1340 230"
              stroke="url(#hero-gold-ribbon)"
              strokeWidth="7"
              strokeLinecap="round"
            />

            <defs>
              <linearGradient id="hero-teal-wave-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00B8A9" stopOpacity="0" />
                <stop offset="50%" stopColor="#00B8A9" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="hero-teal-wave-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#004D49" stopOpacity="0.1" />
                <stop offset="60%" stopColor="#00B8A9" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="hero-gold-ribbon" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFC928" stopOpacity="0.1" />
                <stop offset="25%" stopColor="#FFC928" stopOpacity="0.95" />
                <stop offset="75%" stopColor="#FFB300" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#FFC928" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Dotted Matrix 1: Top Right of center */}
          <div className="absolute top-8 right-[32%] hidden md:grid grid-cols-6 gap-2 opacity-35" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-teal-200" />
            ))}
          </div>

          {/* Dotted Matrix 2: Bottom Right */}
          <div className="absolute bottom-6 right-8 hidden sm:grid grid-cols-6 gap-2 opacity-25" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-teal-200" />
            ))}
          </div>
        </div>

        <div className="relative max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-9 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 xl:gap-10 items-center">
            {/* Left Section — approximately 70% */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-teal-100/80 mb-2 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5" aria-label="Breadcrumb">
                <Link href="/appliances" className="hover:text-white transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-3 h-3 text-teal-200/50 shrink-0" />
                <Link href={`/${categorySlug}`} className="hover:text-white transition-colors">
                  {categoryName || 'Appliance Repair'}
                </Link>
                <ChevronRight className="w-3 h-3 text-teal-200/50 shrink-0" />
                <span className="text-white font-medium">{pageTitle}</span>
              </nav>

              {/* Dynamic Category Pill Label */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 sm:w-6 h-1 sm:h-1.5 rounded-full bg-[#FFC928] shrink-0" />
                <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold tracking-wider text-white uppercase">
                  {categoryHeaderLabel}
                </span>
              </div>

              {/* Dynamic Service H1 with Yellow Curved Underline Accent */}
              <div className="relative inline-block mb-2">
                <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-[40px] font-black text-white tracking-tight leading-[1.18]">
                  {pageTitle}
                </h1>
                {/* Yellow curved accent below heading matching screenshot */}
                <svg
                  className="w-36 sm:w-56 h-2 sm:h-2.5 text-[#FFC928] mt-0.5"
                  viewBox="0 0 240 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M2 10C55 2 185 2 238 10C170 4.5 70 4.5 2 10Z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              {/* Dynamic Service Description — Pure White, readable, aligned */}
              <p
                className="!text-white text-xs sm:text-[14px] lg:text-[15px] leading-relaxed max-w-2xl mb-3.5 font-medium"
                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
              >
                {pageDescription}
              </p>

              {/* Trust Indicators Grid / Row */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-x-5 sm:gap-y-2 text-xs sm:text-sm text-white mb-3.5">
                <div className="flex items-center gap-1.5 font-bold" style={{ color: '#ffffff' }}>
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#FFC928] text-[#FFC928] shrink-0" />
                  <span className="text-white text-[11px] sm:text-xs">4.6/5 (10K+ Reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-white" style={{ color: '#ffffff' }}>
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00B8A9] shrink-0" />
                  <span className="text-white text-[11px] sm:text-xs">Verified Technicians</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-white" style={{ color: '#ffffff' }}>
                  <Home className="w-3.5 h-3.5 text-[#00B8A9] shrink-0" />
                  <span className="text-white text-[11px] sm:text-xs">At-Home Service</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-white" style={{ color: '#ffffff' }}>
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00B8A9] shrink-0" />
                  <span className="text-white text-[11px] sm:text-xs">Genuine Spare Parts</span>
                </div>
              </div>

              {/* Bottom Actions Area: Primary CTA & Benefit Capsules */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5 mb-2 lg:mb-0">
                {/* Primary CTA: Book a Service */}
                <button
                  onClick={handleHeroBookService}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white text-[#004D49] hover:bg-slate-50 text-xs sm:text-sm font-bold shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#004D49]" />
                  <span>Book a Service</span>
                </button>

                {/* Benefit Capsule 1: Low Cost Repairs */}
                <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#003833]/70 backdrop-blur-md border border-[#00B8A9]/50 text-white text-[11px] sm:text-xs font-semibold shadow-xs">
                  <Coins className="w-3.5 h-3.5 text-[#FFC928]" />
                  <span>Low Cost Repairs</span>
                </div>

                {/* Benefit Capsule 2: On-Time Service Delivery */}
                <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#003833]/70 backdrop-blur-md border border-[#00B8A9]/50 text-white text-[11px] sm:text-xs font-semibold shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-[#FFC928]" />
                  <span>On-Time Service Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Section — 4 Rounded Feature Capsules (Compact 2x2 grid on mobile, vertical stack on desktop) */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-center items-end mt-2 lg:mt-0">
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:flex lg:flex-col lg:gap-3 w-full max-w-[340px] xl:max-w-[360px]">
                {featurePills.map((pill, idx) => {
                  const PillIcon = pill.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 sm:gap-3.5 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-full bg-[#002D2A]/85 backdrop-blur-md border border-[#00B8A9]/60 hover:border-[#00B8A9] shadow-md transition-all text-white min-h-[42px] sm:min-h-[50px]"
                    >
                      <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shrink-0">
                        <PillIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-5 ${pill.iconColor || 'text-[#00B8A9]'}`} />
                      </div>
                      <span className="text-[11px] sm:text-xs lg:text-[13px] font-semibold tracking-wide text-white leading-tight">
                        {pill.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAIN TWO-COLUMN CONTENT SECTION: LEFT SIDEBAR + RIGHT PARTNER/SERVICES
      ========================================================================= */}
      <section className="relative max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* =====================================================================
              LEFT SIDEBAR — DESKTOP FILTER CARD (270px - 280px)
          ===================================================================== */}
          <aside className="hidden lg:block w-[270px] xl:w-[280px] shrink-0 self-start">
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#00796B]" />
                  <span>Filters</span>
                </h3>
                {minRating > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-[#00796B] font-semibold hover:underline cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Section 1: Categories */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                  Categories
                </h4>

                <div className="space-y-1.5">
                  {loadingCategories ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-6 bg-gray-100 rounded-md" />
                      <div className="h-6 bg-gray-100 rounded-md" />
                      <div className="h-6 bg-gray-100 rounded-md" />
                    </div>
                  ) : (
                    allCategories.map((cat) => {
                      const isCurrentCat =
                        cat.name === categoryName ||
                        cat.slug === categorySlug ||
                        (isLaptop && (cat.name?.toLowerCase().includes('computer') || cat.slug?.includes('computer'))) ||
                        (isTv && (cat.name?.toLowerCase().includes('tv') || cat.slug?.includes('tv')));

                      const isExpanded = expandedCategory === cat._id || isCurrentCat;
                      const subcats = categorySubcats[cat._id] || (isTv ? [
                        { name: 'LCD TV Repair', slug: 'lcd-tv-repair', count: 4 },
                        { name: 'LED TV Repair', slug: 'led-tv-repair', count: 6 },
                        { name: 'Smart Android TV Repair', slug: 'smart-android-tv-repair', count: 5 },
                        { name: 'TV Installation / Wall Mounting', slug: 'tv-installation-wall-mounting', count: 3 }
                      ] : isLaptop ? [
                        { name: 'Laptop Repair Service', slug: 'laptop-repair-service', count: 14 },
                        { name: 'Desktop PC Repair Services', slug: 'desktop-pc-repair-services', count: 6 }
                      ] : []);

                      return (
                        <div key={cat._id} className="overflow-hidden">
                          {/* Category Header Row */}
                          <div
                            onClick={() => {
                              setExpandedCategory(expandedCategory === cat._id ? null : cat._id);
                              fetchSubcategories(cat._id, cat.slug);
                            }}
                            className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                          >
                            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-700 group-hover:text-gray-900">
                              <span
                                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${
                                  isCurrentCat
                                    ? 'bg-[#00796B] border-[#00796B] text-white'
                                    : 'border-gray-300 bg-white group-hover:border-gray-400'
                                }`}
                              >
                                {isCurrentCat && (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                              <span className="truncate">{cat.name}</span>
                            </label>
                            <span className="text-[11px] text-gray-400 font-medium">
                              ({isTv && cat.name === 'TV Repair' ? 18 : isLaptop && cat.name === 'Computer Repair' ? 20 : cat.name === 'AC Repair' ? 12 : cat.name === 'Geyser Repair' ? 6 : cat.name === 'Oven Repair' ? 4 : cat.name === 'Refrigerator Repair' ? 10 : cat.name === 'Washing Machine Repair' ? 9 : 8})
                            </span>
                          </div>

                          {/* Subcategories */}
                          {isExpanded && subcats.length > 0 && (
                            <div className="pl-6 pr-1 py-1 space-y-1 mt-0.5">
                              {subcats.map((sub) => {
                                const isCurrent = currentSlug === sub.slug || currentSlug === sub.id;

                                return (
                                  <div
                                    key={sub.slug || sub.id}
                                    onClick={() => router.push(`/${sub.slug}`)}
                                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                      isCurrent
                                        ? 'bg-[#E6F7F5] text-[#00796B] font-bold shadow-2xs'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                          isCurrent ? 'border-[#00796B]' : 'border-gray-300'
                                        }`}
                                      >
                                        {isCurrent && <span className="w-2 h-2 rounded-full bg-[#00796B]" />}
                                      </span>
                                      <span className="truncate">{sub.name}</span>
                                    </div>
                                    <span className={`text-[11px] shrink-0 ml-1.5 ${isCurrent ? 'text-[#00796B]' : 'text-gray-400'}`}>
                                      ({sub.count || (sub.slug === currentSlug ? (activeTab === 'centers' ? sortedCenters.length : sortedServices.length) : 4)})
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4" />

              {/* Section 2: Minimum Rating */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                  Minimum Rating
                </h4>

                <div className="space-y-1.5">
                  {[
                    { label: '4.5+ Stars', value: 4.5, count: 10 },
                    { label: '4+ Stars', value: 4.0, count: 14 }
                  ].map((rate) => {
                    const isSelected = minRating === rate.value;

                    return (
                      <div
                        key={rate.value}
                        onClick={() => handleRatingChange(rate.value)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#E6F7F5] text-[#00796B] font-bold shadow-2xs'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#00796B]' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-[#00796B]" />}
                          </span>
                          <span>{rate.label}</span>
                        </div>
                        <span className={`text-[11px] ${isSelected ? 'text-[#00796B]' : 'text-gray-400'}`}>
                          ({rate.count})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* =====================================================================
              RIGHT CONTENT AREA — HEADER + PARTNERS / SERVICES CARDS
          ===================================================================== */}
          <main id="services-listing-grid" className="flex-1 min-w-0">
            {/* Header row: Title + Segmented Tab Switch + Sort Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 mb-4 border-b border-gray-100">
              <div className="flex flex-col gap-2.5">
                <h2 className="text-lg sm:text-xl lg:text-[22px] font-bold text-gray-900 tracking-tight flex items-center flex-wrap gap-1.5">
                  <span>{activeTab === 'centers' ? 'Service Partners' : 'Available Services'} for {pageTitle} in</span>
                  <button
                    onClick={openLocationModal}
                    className="text-[#00796B] inline-flex items-center gap-1 hover:underline cursor-pointer font-bold focus:outline-none"
                    title="Change Location"
                  >
                    <span>{cityName}</span>
                    <ChevronDown className="w-4 h-4 text-[#00796B]" />
                  </button>
                </h2>

                {/* Segmented Switch: All Services vs Nearby Centers */}
                <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200 self-start">
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'services'
                        ? 'bg-white text-[#00796B] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All Services ({services.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('centers')}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'centers'
                        ? 'bg-white text-[#00796B] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Nearby Centers ({centers.length})
                  </button>
                </div>
              </div>

              {/* Sort by Dropdown */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold text-gray-800 bg-white border border-gray-200 rounded-xl shadow-2xs hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00796B] cursor-pointer"
                >
                  <option value="nearest">Nearest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="orders">Most Reviewed</option>
                </select>
              </div>
            </div>

            {/* Mobile Filter Trigger Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setFilterOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-white shadow-xs text-xs font-bold text-gray-800 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Filter className="w-4 h-4 text-[#00796B]" />
                <span>Filters {minRating > 0 ? `(Rating ${minRating}+)` : ''}</span>
              </button>
            </div>

            {/* Content Switcher: Nearby Centers vs All Services */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : activeTab === 'centers' ? (
              /* Nearby Centers Grid */
              sortedCenters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                  {sortedCenters.map((center, index) => {
                    const centerImg = center.logo || center.image || center.banner;
                    const parsedDist = center.distance || center.distanceInKm || (index === 0 ? '2.4' : index === 1 ? '2.8' : index === 2 ? '3.9' : null);
                    const orderCount = center.totalOrders || center.orders || (index === 0 ? 500 : index === 1 ? 100 : index === 2 ? 65 : 80);
                    const ratingVal = center.rating || (index === 0 ? '4.6' : index === 1 ? '4.3' : index === 2 ? '4.5' : '4.6');

                    return (
                      <div
                        key={center._id || index}
                        className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-[#00796B]/30 transition-all p-4 flex flex-col justify-between"
                      >
                        {/* Top row: Image & Center details */}
                        <div className="flex gap-3.5">
                          {/* Center Logo container with Open Now badge */}
                          <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl border border-gray-100 bg-white flex items-center justify-center overflow-hidden shrink-0">
                            {/* Open Now badge overlapping top */}
                            <span className="absolute top-1 left-1 px-2 py-0.5 rounded-full bg-[#00796B] text-white text-[9px] font-bold shadow-xs z-10">
                              Open Now
                            </span>
                            <img
                              loading="lazy"
                              decoding="async"
                              src={centerImg ? imageLoader({ src: centerImg }) : '/servicecenterpointlogo.png'}
                              alt={center.business_name || center.name || 'Service Partner'}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/servicecenterpointlogo.png';
                              }}
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            {/* Header: Title + Favorite Heart */}
                            <div className="flex items-start justify-between gap-1.5">
                              <h3
                                onClick={() => router.push(`/service-list/${center.slug || center._id}`)}
                                className="text-sm sm:text-base font-bold text-gray-900 leading-snug hover:text-[#00796B] transition-colors line-clamp-2 cursor-pointer"
                              >
                                {center.business_name || center.name}
                              </h3>
                              <button
                                onClick={(e) => toggleFavorite(center._id, e)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-0.5 shrink-0 cursor-pointer"
                                aria-label="Save to favorites"
                              >
                                <Heart className={`w-4 h-4 ${isFavorite(center._id) ? 'fill-red-500 text-red-500' : ''}`} />
                              </button>
                            </div>

                            {/* Address */}
                            <p className="text-xs text-gray-500 leading-tight mt-1.5 flex items-start gap-1 line-clamp-2">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                              <span>{center.address || `Authorized Service Center, ${cityName}`}</span>
                            </p>

                            {/* Rating & Distance Row */}
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <div className="flex items-center gap-1 font-bold text-gray-900">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{ratingVal}</span>
                                <span className="text-gray-400 font-normal">({orderCount} orders)</span>
                              </div>
                              {parsedDist && (
                                <div className="flex items-center gap-1 text-gray-500 font-medium">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span>{String(parsedDist).includes('km') ? parsedDist : `${parsedDist} km`} away</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions Row */}
                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => router.push('/book-appointment')}
                            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#e89117] to-[#00796B] text-white text-xs font-bold shadow-xs hover:shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Book Service</span>
                            <span>→</span>
                          </button>
                          <button
                            onClick={() => router.push(`/service-list/${center.slug || center._id}`)}
                            className="w-full py-2 px-3 rounded-xl border border-[#00796B] bg-white text-[#00796B] hover:bg-[#E6F7F5] text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                          >
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 p-8">
                  <p className="text-gray-600 font-medium text-sm">
                    No service partners found matching the selected rating in {cityName}.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#00796B] text-white text-xs font-bold hover:bg-[#00605A] transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )
            ) : (
              /* =================================================================
                  ALL SERVICES GRID — GOOGLE-STYLE REDESIGN WITH PROPER VISIBILITY
              ================================================================= */
              sortedServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sortedServices.map((service, index) => {
                    const cleanDesc = cleanDescription(service.description) || `Reliable ${service.name} doorstep repair and diagnostic service in ${cityName}.`;
                    const serviceImg = service.mainImage || service.image || service.itemImage;
                    const ratingVal = service.rating || (index % 2 === 0 ? '4.8' : '4.7');
                    const orderCount = service.totalOrders || service.orders || (index % 3 === 0 ? 95 : 55);
                    const inspectionFeeVal = Number(
                      service.inspectionCost !== undefined && service.inspectionCost !== null && service.inspectionCost !== ''
                        ? service.inspectionCost
                        : service.serviceBookingCost !== undefined && service.serviceBookingCost !== null && service.serviceBookingCost !== ''
                        ? service.serviceBookingCost
                        : service.minFare || 125
                    );
                    const originalFeeVal = service.originalPrice
                      ? Number(service.originalPrice)
                      : (service.serviceCharge ? inspectionFeeVal + Number(service.serviceCharge) : null);

                    return (
                      <div
                        key={service._id || index}
                        onClick={() => router.push(`/${service.slug || 'book-appointment'}`)}
                        className="group relative bg-white rounded-2xl border border-gray-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:border-[#00796B]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                      >
                        {/* Top Image: Clean 16:10 aspect with subtle zoom */}
                        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-gray-50 border-b border-gray-100">
                          <img
                            loading="lazy"
                            decoding="async"
                            src={serviceImg ? imageLoader({ src: serviceImg }) : '/electric-appliance.png'}
                            alt={service.name || 'Service'}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/electric-appliance.png';
                            }}
                          />
                          {/* Rating Pill overlay (Google Material style) */}
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-semibold shadow-xs">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{ratingVal}</span>
                            <span className="text-white/75 font-normal">({orderCount}+ orders)</span>
                          </div>

                          {/* Doorstep Tag overlay */}
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00796B] text-white text-[10px] font-bold shadow-xs uppercase tracking-wider">
                            <span>Doorstep</span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                          <div>
                            {/* Service Title */}
                            <h3 className="text-base sm:text-[17px] font-bold text-gray-900 group-hover:text-[#00796B] transition-colors leading-snug line-clamp-1 mb-1.5">
                              {service.name}
                            </h3>

                            {/* Clean Description — NO HTML TAGS */}
                            <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-3.5">
                              {cleanDesc}
                            </p>

                            {/* Google Material Micro-chips */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50/70 border border-emerald-100/80 text-[11px] font-semibold text-[#00796B]">
                                <ShieldCheck className="w-3 h-3 text-[#00796B]" />
                                <span>30-Day Warranty</span>
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-[11px] font-medium text-gray-600">
                                <Home className="w-3 h-3 text-gray-400" />
                                <span>At-Home Service</span>
                              </span>
                            </div>
                          </div>

                          {/* Pricing & CTA Button Row */}
                          <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between gap-3 mt-auto">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block leading-tight">
                                Inspection Fee
                              </span>
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                                  ₹{inspectionFeeVal}
                                </span>
                                {originalFeeVal && originalFeeVal > inspectionFeeVal && (
                                  <span className="text-[11px] text-gray-400 line-through">
                                    ₹{originalFeeVal}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push('/book-appointment');
                              }}
                              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#e89117] to-[#00796B] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <span>Book Service</span>
                              <span>→</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 p-8">
                  <p className="text-gray-600 font-medium text-sm">No services found for {pageTitle}.</p>
                </div>
              )
            )}
          </main>
        </div>

        {/* =====================================================================
            SERVICE BENEFITS STRIP — 4 COLUMNS IN SOFT MINT BACKGROUND
        ===================================================================== */}
        <div className="bg-[#EAFBF7] border border-[#00796B]/15 rounded-2xl p-4 sm:p-5 mt-10 mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Benefit 1 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-[#00796B]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <Truck className="w-5 h-5 text-[#00796B]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">At-Home Service</h4>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-tight mt-0.5">Convenient & Hassle-free</p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-[#00796B]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-[#00796B]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Verified Partners</h4>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-tight mt-0.5">Background checked</p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-[#00796B]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <Receipt className="w-5 h-5 text-[#00796B]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Transparent Pricing</h4>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-tight mt-0.5">No hidden charges</p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-[#00796B]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <Headphones className="w-5 h-5 text-[#00796B]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Support</h4>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-tight mt-0.5">Quick assistance</p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            FREQUENTLY ASKED QUESTIONS — 3 ACCORDION CARDS IN A ROW
        ===================================================================== */}
        <div className="mt-8 mb-6">
          <div className="mb-5">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Find quick answers to common questions about {pageTitle} services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
            {faqsToDisplay.slice(0, 3).map((faq, index) => {
              const isOpen = faqActiveIndex === index;

              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#00796B]/30 transition-all flex flex-col justify-between"
                >
                  <button
                    onClick={() => setFaqActiveIndex(isOpen ? null : index)}
                    className="w-full text-left flex items-start justify-between gap-2.5 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-bold text-gray-900 leading-snug">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 shrink-0 mt-0.5 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#00796B]' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-gray-600 leading-relaxed pt-3 border-t border-gray-100 mt-3">
                          {faq.answer || faq.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          MOBILE FILTER DRAWER / BOTTOM SHEET
      ========================================================================= */}
      <AnimatePresence>
        {filterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl border-t border-gray-200 p-6 lg:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#00796B]" />
                  <span>Filters</span>
                </h3>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
                  Categories
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {allCategories.map((cat) => {
                    const isSelected = cat.name === categoryName || cat.slug === categorySlug;
                    return (
                      <div
                        key={cat._id}
                        onClick={() => {
                          router.push(`/${cat.slug}`);
                          setFilterOpen(false);
                        }}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 text-xs text-gray-700 cursor-pointer"
                      >
                        <span className="font-medium">{cat.name}</span>
                        {isSelected && <span className="text-[#00796B] font-bold text-[11px]">(Selected)</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="mb-6 border-t border-gray-100 pt-3">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
                  Minimum Rating
                </h4>
                <div className="space-y-1.5">
                  {[4.5, 4.0].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(rating)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer ${
                        minRating === rating ? 'bg-[#E6F7F5] text-[#00796B] font-bold' : 'text-gray-700 hover:bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rating}+ Stars</span>
                      </div>
                      {minRating === rating && <span className="w-2 h-2 rounded-full bg-[#00796B]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    resetFilters();
                    setFilterOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#e89117] to-[#00796B] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ServicesListingPage;
