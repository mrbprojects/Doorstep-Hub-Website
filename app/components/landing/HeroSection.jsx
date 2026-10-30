'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CalendarCheck,
  Headphones,
  Wrench,
  Home,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { API_BASE_URL, getImageUrl } from '@/config/env';

/* ---------- IMAGE LOADER ---------- */
const imageLoader = ({ src }) => {
  return getImageUrl(src);
};

/* ---------- SERVICE THEMES & METADATA ---------- */
const SERVICE_CONFIG = {
  APPLIANCE: {
    title: 'Appliance Service',
    subtitle: 'Quick & Reliable Appliance Repair',
    bg: 'bg-[#E7F3F2]',
    gradient: 'from-[#E7F3F2] via-[#E7F3F2]/95 to-transparent',
    titleColor: 'text-[#0F1B3D]',
    subColor: 'text-[#00796B]',
    btnBg: 'bg-[#008C80] hover:bg-[#006D65]',
    borderColor: 'border-[#008C80]/15 hover:border-[#008C80]/40',
  },
  PG: {
    title: 'PG & Hostels',
    subtitle: 'Discover the Best PGs & Hostels',
    bg: 'bg-[#EBF6F9]',
    gradient: 'from-[#EBF6F9] via-[#EBF6F9]/95 to-transparent',
    titleColor: 'text-[#0F1B3D]',
    subColor: 'text-[#00796B]',
    btnBg: 'bg-[#008C80] hover:bg-[#006D65]',
    borderColor: 'border-[#008C80]/15 hover:border-[#008C80]/40',
  },
  SELL_BUY: {
    title: 'Sell & Buy',
    subtitle: 'Sell & Buy Old Things',
    bg: 'bg-[#FFF8E7]',
    gradient: 'from-[#FFF8E7] via-[#FFF8E7]/95 to-transparent',
    titleColor: 'text-[#0F1B3D]',
    subColor: 'text-[#8D5B00]',
    btnBg: 'bg-[#E69500] hover:bg-[#D48800]',
    borderColor: 'border-[#E69500]/15 hover:border-[#E69500]/40',
  },
  RELIGIOUS: {
    title: 'Religious Services',
    subtitle: 'Puja, Pandit & More Services',
    bg: 'bg-[#FFF6E9]',
    gradient: 'from-[#FFF6E9] via-[#FFF6E9]/95 to-transparent',
    titleColor: 'text-[#0F1B3D]',
    subColor: 'text-[#7D3F1B]',
    btnBg: 'bg-[#F57C00] hover:bg-[#E65100]',
    borderColor: 'border-[#F57C00]/15 hover:border-[#F57C00]/40',
  },
  SALON_PET: {
    title: 'Unisex & Pet Saloons',
    subtitle: 'Unisex Saloons & Pet Care Centers',
    bg: 'bg-[#F2FBF7]',
    gradient: 'from-[#F2FBF7] via-[#F2FBF7]/95 to-transparent',
    titleColor: 'text-[#0F1B3D]',
    subColor: 'text-[#007A55]',
    btnBg: 'bg-[#009E69] hover:bg-[#008457]',
    borderColor: 'border-[#009E69]/15 hover:border-[#009E69]/40',
  },
  DEFAULT: {
    title: 'Home Services',
    subtitle: 'Trusted Quality for Everyday Needs',
    bg: 'bg-[#F4F9F8]',
    gradient: 'from-[#F4F9F8] via-[#F4F9F8]/95 to-transparent',
    titleColor: 'text-[#0F1B3D]',
    subColor: 'text-[#00796B]',
    btnBg: 'bg-[#008C80] hover:bg-[#006D65]',
    borderColor: 'border-[#008C80]/15',
  },
};

function getServiceTheme(service) {
  const name = (service?.name || '').toUpperCase();
  if (name.includes('APPLIANCE')) return SERVICE_CONFIG.APPLIANCE;
  if (name.includes('PG') || name.includes('HOSTEL')) return SERVICE_CONFIG.PG;
  if (name.includes('SELL') || name.includes('BUY')) return SERVICE_CONFIG.SELL_BUY;
  if (name.includes('RELIGIOUS') || name.includes('POOJA')) return SERVICE_CONFIG.RELIGIOUS;
  if (name.includes('SPA') || name.includes('SALON') || name.includes('SALOON') || name.includes('UNISEX') || name.includes('PET')) {
    return SERVICE_CONFIG.SALON_PET;
  }
  return SERVICE_CONFIG.DEFAULT;
}

const cleanDescription = (desc) => {
  if (!desc) return '';
  return String(desc).replace(/\r\n|\r|\n/g, ' ').replace(/\s+/g, ' ').trim();
};

/* ---------- ACTIVE BUSINESS VERTICAL CARDS (ALL 5 SERVICES) ---------- */
function ServiceCategoryCards({ services = [], serviceSlugs }) {
  const router = useRouter();

  const handleCardClick = (service) => {
    const upperName = (service?.name || '').toUpperCase();

    // 1. Sell & Buy module
    if (upperName.includes('SELL') || upperName.includes('BUY')) {
      router.push('/sell-buy');
      return;
    }

    // 2. Persist selection for state continuity
    try {
      localStorage.setItem(
        'selectedService',
        JSON.stringify({
          id: service._id,
          name: service.name,
          servicetypeName: service.servicetypeName || service.name,
          image: service.image,
        })
      );
    } catch {
      // LocalStorage fallback
    }

    // 3. Routing
    let targetRoute = service.name
      ? service.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      : service._id;

    if (upperName.includes('APPLIANCE')) targetRoute = serviceSlugs.appliances;
    else if (upperName.includes('RELIGIOUS')) targetRoute = serviceSlugs.religious;
    else if (upperName.includes('SPA') || upperName.includes('SALON') || upperName.includes('SALOON') || upperName.includes('UNISEX') || upperName.includes('PET')) {
      targetRoute = serviceSlugs.spa;
    } else if (upperName.includes('PG') || upperName.includes('HOSTEL')) {
      targetRoute = serviceSlugs.pg;
    }

    router.push(`/${targetRoute}`);
  };

  if (!services || services.length === 0) return null;

  return (
    <div className="w-full max-w-full min-w-0 mx-auto mt-3 sm:mt-4 lg:mt-4 overflow-hidden sm:overflow-visible">
      {/* 
        Responsive layout for all active business verticals:
        - Mobile (< 640px): Smooth swipeable horizontal row with snap points so user can swipe through all 5 cards in 1 clean line without vertical sprawl
        - Tablet (640px - 1023px): 2 or 3 columns responsive grid
        - Desktop (>= 1024px): All 5 active business verticals displayed together in ONE single line row (lg:grid-cols-5)
      */}
      <div className="w-full max-w-full min-w-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 xl:gap-3.5">
        {services.map((service, index) => {
          const theme = getServiceTheme(service);
          // Prioritize dynamic backend title & description
          const displayTitle = service.name || theme.title;
          const displaySubtitle = cleanDescription(service.shortDescription) || theme.subtitle;

          return (
            <div
              key={service._id || index}
              onClick={() => handleCardClick(service)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(service);
                }
              }}
              className={`group relative overflow-hidden rounded-[20px] cursor-pointer ${theme.bg} ${theme.borderColor} border shadow-[0_3px_14px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 h-[146px] sm:h-[154px] lg:h-[158px] xl:h-[164px] select-none flex flex-col justify-between p-3.5 sm:p-3.5 xl:p-4 w-[78vw] max-w-[280px] shrink-0 snap-start sm:w-auto`}
            >
              {/* Full Card Background Image from Backend (object-right coverage) */}
              {service.image && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <Image
                    loader={imageLoader}
                    src={service.image}
                    alt={displayTitle}
                    fill
                    priority={index < 5}
                    sizes="(max-width: 640px) 80vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover object-right transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}

              {/* Left Gradient Scrim for Guaranteed High Contrast & Readability */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} w-[56%] sm:w-[52%] lg:w-[54%] xl:w-[50%] z-[1] pointer-events-none`}
                aria-hidden="true"
              />

              {/* Left Text Block - Constrained to prevent any overlap with right illustrations */}
              <div className="relative z-10 max-w-[54%] sm:max-w-[50%] lg:max-w-[54%] xl:max-w-[48%] text-left">
                <h3 className={`text-[13.5px] sm:text-[14px] lg:text-[13.5px] xl:text-[15.5px] font-black leading-tight tracking-tight ${theme.titleColor}`}>
                  {displayTitle}
                </h3>
                <p className={`text-[10px] sm:text-[10.5px] lg:text-[10px] xl:text-[11px] font-medium mt-1 leading-snug line-clamp-2 ${theme.subColor}`}>
                  {displaySubtitle}
                </p>
              </div>

              {/* Bottom CTA Arrow Button */}
              <div className="relative z-10 flex items-center justify-start mt-auto">
                <div
                  className={`hero-card-arrow-btn w-6 h-6 sm:w-6.5 sm:h-6.5 xl:w-7 xl:h-7 rounded-full flex items-center justify-center text-white ${theme.btnBg} shadow-sm group-hover:scale-110 transition-transform duration-200`}
                  style={{ color: '#ffffff' }}
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.5]" stroke="#ffffff" color="#ffffff" style={{ stroke: '#ffffff', color: '#ffffff' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const DEFAULT_INITIAL_SERVICES = [
  {
    _id: '683daaa8f261c1548bdf7442',
    name: 'Appliance Service',
    image: 'uploads/service/Appliance_Repair_Services.webp',
    shortDescription: 'Quick & Reliable Appliance Repair',
    priority: '1',
  },
  {
    _id: '69524fb157bb211ca094e5ee',
    name: 'PG & Hostels',
    image: 'uploads/service/1780375226268-Pg_and_Hostels.webp',
    shortDescription: 'Your Comfort, Our Priority.. Discover the Best PGs & Hostels',
    priority: '1',
  },
  {
    _id: '6a7db000a9d92694336007a0',
    name: 'Sell & Buy',
    image: 'uploads/service/Sell_and_Buy_Old_Things.webp',
    shortDescription: 'Sell & Buy Old Things',
    priority: '2',
  },
  {
    _id: '695250aa57bb211ca094e5fd',
    name: 'Religious Services',
    image: 'uploads/service/Pooja_Services.webp',
    shortDescription: 'Puja, Pandit & More Services',
    priority: '3',
  },
  {
    _id: '69524f4a57bb211ca094e5e6',
    name: 'Unisex & Pet Saloons',
    image: 'uploads/service/Unisex_Salon_Petcare.webp',
    shortDescription: 'Unisex Saloons & Pet Care Centers',
    priority: '4',
  },
];

/* ---------- MAIN HERO SECTION ---------- */
export function HeroSection() {
  const [services, setServices] = useState(DEFAULT_INITIAL_SERVICES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [serviceSlugs, setServiceSlugs] = useState({
    appliances: 'appliance-repair-services',
    religious: 'religious-services',
    spa: 'spa-salon',
    pg: 'pghostels',
  });

  const appLinks = {
    android:
      'https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share',
    ios: 'https://apps.apple.com/in/app/doorstep-hub/id6475340236',
  };

  // Fetch Service Slugs
  useEffect(() => {
    const fetchSlugs = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/app/applience-repairs-website/get_slugs_by_serviceId/683daaa8f261c1548bdf7442`
        );
        const data = await res.json();
        if (data.success && data.data?.home) {
          setServiceSlugs((prev) => ({ ...prev, appliances: data.data.home }));
        }
      } catch (e) {
        console.warn('Failed to fetch appliance slug:', e);
      }
    };
    fetchSlugs();
  }, []);

  // Fetch & Priority Sort Services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = `${API_BASE_URL}/app/applience-repairs-website/all-services`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const adminPriorityMap = {
            '683daaa8f261c1548bdf7442': 1, // Appliance Service
            '69524fb157bb211ca094e5ee': 2, // PG & Hostels
            '6a7db000a9d92694336007a0': 3, // Sell & Buy
            '695250aa57bb211ca094e5fd': 4, // Religious Services
            '69524f4a57bb211ca094e5e6': 5, // Unisex & Pet Saloons
          };

          const sorted = [...data.data].sort((a, b) => {
            const getPriority = (item) => {
              if (item.priority !== undefined && item.priority !== null && item.priority !== '') {
                const n = Number(item.priority);
                if (!isNaN(n)) return n;
              }
              const id = String(item._id || '');
              if (adminPriorityMap[id] !== undefined) return adminPriorityMap[id];
              const name = (item.name || '').toUpperCase();
              if (name.includes('APPLIANCE')) return 1;
              if (name.includes('PG') || name.includes('HOSTEL')) return 2;
              if (name.includes('SELL') || name.includes('BUY')) return 3;
              if (name.includes('RELIGIOUS') || name.includes('POOJA')) return 4;
              if (name.includes('SPA') || name.includes('SALOON') || name.includes('SALON') || name.includes('UNISEX') || name.includes('PET')) return 5;
              return 999;
            };

            return getPriority(a) - getPriority(b);
          });

          setServices(sorted);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err.message || 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="relative overflow-hidden bg-white pt-[60px] sm:pt-[64px] lg:pt-[66px] pb-3 sm:pb-4 lg:pb-5">
      {/* ========================================================= */}
      {/* 1. ATMOSPHERIC BACKGROUND (Subtle Grid + Soft Mint Glows)   */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        {/* Crisp clean white background */}
        <div className="absolute inset-0 bg-white" />

        {/* Subtle technical grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,140,128,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,140,128,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Soft mint abstract circular shapes behind left technician & right customer */}
        <div className="hidden lg:block absolute -left-12 top-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-[#E5F7F4] blur-3xl opacity-80" />
        <div className="hidden lg:block absolute -right-12 top-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-[#E5F7F4] blur-3xl opacity-80" />
      </div>

      {/* ========================================================= */}
      {/* 2. THREE-ZONE HERO SECTION (Desktop 3-Zone, Mobile Stacked)*/}
      {/* ========================================================= */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden sm:overflow-visible min-w-0">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-4 lg:gap-2">
          
          {/* ─────────────────────────────────────────────────────── */}
          {/* ZONE A: LEFT VISUAL (Professional Technician)          */}
          {/* ─────────────────────────────────────────────────────── */}
          <div className="hidden lg:flex w-[210px] xl:w-[250px] 2xl:w-[280px] flex-col justify-end relative select-none shrink-0">
            {/* Technician Real Image */}
            <div className="relative w-full h-[370px] xl:h-[420px] flex items-end justify-center">
              <Image
                src="/hero-technician.png"
                alt="Doorstep Hub appliance service professional"
                fill
                priority
                className="object-contain object-bottom pointer-events-none drop-shadow-md"
                sizes="(max-width: 1280px) 250px, 280px"
              />
            </div>

            {/* Left Trust Callout: Verified Professionals */}
            <div className="absolute left-0 bottom-4 xl:bottom-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.08)] border border-[#008C80]/20 flex items-center gap-2 pointer-events-auto">
              <div className="w-6 h-6 rounded-lg bg-[#008C80] flex items-center justify-center text-white shrink-0 shadow-xs" style={{ backgroundColor: '#008C80' }}>
                <ShieldCheck className="w-3.5 h-3.5 text-white" stroke="#ffffff" color="#ffffff" style={{ stroke: '#ffffff', color: '#ffffff' }} />
              </div>
              <span className="text-xs font-bold text-[#0F1B3D] leading-tight whitespace-nowrap">
                Verified<br />Professionals
              </span>
            </div>

            {/* Floating Dotted Trajectory & Mini Icons */}
            <div className="absolute right-1 top-8 z-20 flex flex-col items-center gap-5 pointer-events-none" aria-hidden="true">
              {/* Tool Icon */}
              <div className="w-8 h-8 rounded-full bg-white shadow-[0_3px_12px_rgba(0,140,128,0.15)] border border-[#008C80]/25 flex items-center justify-center text-[#008C80]">
                <Wrench className="w-3.5 h-3.5 text-[#008C80]" stroke="#008C80" color="#008C80" style={{ stroke: '#008C80', color: '#008C80' }} />
              </div>
              {/* Home Icon */}
              <div className="w-8 h-8 rounded-full bg-white shadow-[0_3px_12px_rgba(0,140,128,0.15)] border border-[#008C80]/25 flex items-center justify-center text-[#008C80] translate-x-2.5">
                <Home className="w-3.5 h-3.5 text-[#008C80]" stroke="#008C80" color="#008C80" style={{ stroke: '#008C80', color: '#008C80' }} />
              </div>
              {/* Shield Icon */}
              <div className="w-8 h-8 rounded-full bg-white shadow-[0_3px_12px_rgba(0,140,128,0.15)] border border-[#008C80]/25 flex items-center justify-center text-[#008C80] -translate-x-1">
                <Shield className="w-3.5 h-3.5 text-[#008C80]" stroke="#008C80" color="#008C80" style={{ stroke: '#008C80', color: '#008C80' }} />
              </div>
            </div>

            {/* Curved dashed connector line */}
            <svg
              className="absolute right-3 top-10 w-14 h-44 pointer-events-none z-10"
              viewBox="0 0 60 180"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M 25 10 C 50 55, 10 95, 30 155"
                stroke="#008C80"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.4"
              />
            </svg>
          </div>

          {/* ─────────────────────────────────────────────────────── */}
          {/* ZONE B: CENTER HERO CONTENT (Headlines, Copy, Badges)   */}
          {/* ─────────────────────────────────────────────────────── */}
          <div className="flex-1 max-w-[680px] mx-auto text-center px-2 sm:px-4 pb-1">
            
            {/* 1. Safe, Verified & Convenient Trust Badge */}
            <div className="inline-flex items-center justify-center gap-2 mb-2 sm:mb-2.5 select-none">
              {/* Left decorative spark icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#008C80]/70 shrink-0" aria-hidden="true">
                <line x1="12" y1="2" x2="12" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="2" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAF8F6] border border-[#008C80]/30 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#008C80] shrink-0" stroke="#008C80" color="#008C80" style={{ stroke: '#008C80', color: '#008C80' }} />
                <span className="text-[11.5px] sm:text-xs font-bold text-[#0F1B3D]">
                  Safe, Verified &amp; Convenient Home Services
                </span>
              </div>

              {/* Right decorative spark icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#008C80]/70 shrink-0" aria-hidden="true">
                <line x1="12" y1="2" x2="12" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="19.07" y1="4.93" x2="14.83" y2="9.17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="22" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* 2. Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-[40px] xl:text-[46px] font-black tracking-tight leading-[1.04] text-center mb-2 sm:mb-2.5">
              <span className="block text-[#0F1B3D]">
                Everything You Need,
              </span>
              <span className="block text-[#008C80] mt-0.5 sm:mt-1">
                Right at Your Doorstep
              </span>
            </h1>

            {/* 3. Concise Description */}
            <p className="text-xs sm:text-[13.5px] lg:text-[14.5px] text-[#475467] leading-relaxed max-w-lg mx-auto mb-3.5 sm:mb-4 text-center font-normal">
              From appliance repair and salon &amp; spa to PG &amp; hostel accommodations, pooja services, pet care, and buy &amp; sell — get trusted professionals, easy booking, and reliable support for all your everyday needs.
            </p>

            {/* 4. Official Customer App Store Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 relative z-20">
              {/* Google Play Badge */}
              <a
                href={appLinks.android}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download Doorstep Hub Customer App on Google Play"
                className="hero-app-badge app-store-badge inline-flex items-center gap-2.5 px-4 py-1.5 sm:py-2 bg-[#0B0F19] hover:bg-[#1A2234] text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 border border-[#1e293b] select-none"
                style={{ backgroundColor: '#0B0F19', color: '#ffffff' }}
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3.608 1.636a1.442 1.442 0 0 0-.358.988v18.752c0 .385.127.733.358.988l.056.056 10.5-10.428v-.248L3.664 1.58l-.056.056Z" fill="#2196F3"/>
                  <path d="M17.664 15.492l-3.5-3.48v-.248l3.5-3.48.08.046 4.148 2.357c1.184.673 1.184 1.774 0 2.447l-4.148 2.358-.08.046Z" fill="#FFC107"/>
                  <path d="M14.244 11.764L3.608 22.364c.389.412 1.05.464 1.79.043l12.346-7.015-3.5-3.628Z" fill="#F44336"/>
                  <path d="M14.244 11.764l3.5-3.628L5.398 1.121c-.74-.421-1.401-.369-1.79.043l10.636 10.6Z" fill="#4CAF50"/>
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="store-subtext text-[8px] sm:text-[8.5px] uppercase tracking-wider font-semibold" style={{ color: '#CBD5E1' }}>
                    GET IT ON
                  </span>
                  <span className="store-title text-xs sm:text-[13px] font-bold tracking-tight mt-0.5" style={{ color: '#FFFFFF' }}>
                    Google Play
                  </span>
                </div>
              </a>

              {/* App Store Badge */}
              <a
                href={appLinks.ios}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download Doorstep Hub Customer App on the App Store"
                className="hero-app-badge app-store-badge inline-flex items-center gap-2.5 px-4 py-1.5 sm:py-2 bg-[#0B0F19] hover:bg-[#1A2234] text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 border border-[#1e293b] select-none"
                style={{ backgroundColor: '#0B0F19', color: '#ffffff' }}
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#ffffff" style={{ fill: '#ffffff', color: '#ffffff' }} aria-hidden="true">
                  <path fill="#ffffff" style={{ fill: '#ffffff' }} d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.86.96-2.84-.93.04-2.05.62-2.7 1.39-.58.67-1.08 1.76-.95 2.82 1.04.08 2.06-.59 2.69-1.37z"/>
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="store-subtext text-[8px] sm:text-[8.5px] font-semibold" style={{ color: '#CBD5E1' }}>
                    Download on the
                  </span>
                  <span className="store-title text-xs sm:text-[13px] font-bold tracking-tight mt-0.5" style={{ color: '#FFFFFF' }}>
                    App Store
                  </span>
                </div>
              </a>
            </div>

            {/* 5. Mobile / Tablet Only: Visual Group & Trust Chips */}
            <div className="lg:hidden mt-4 flex flex-col items-center">
              {/* Responsive Human Visuals Side-by-Side */}
              <div className="flex items-end justify-center gap-2 h-[170px] sm:h-[210px] relative w-full overflow-hidden">
                {/* Soft Mint Halo */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#EAF8F6] via-transparent to-transparent rounded-2xl -z-10" />

                {/* Technician Mobile */}
                <div className="relative w-[120px] sm:w-[150px] h-full">
                  <Image
                    src="/hero-technician.png"
                    alt="Doorstep Hub technician"
                    fill
                    className="object-contain object-bottom"
                    sizes="150px"
                  />
                </div>

                {/* Customer Mobile */}
                <div className="relative w-[120px] sm:w-[150px] h-full">
                  <Image
                    src="/hero-customer.png?v=2"
                    alt="Customer using phone"
                    fill
                    className="object-contain object-bottom"
                    sizes="150px"
                  />
                </div>
              </div>

              {/* Mobile Trust Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF8F6] border border-[#008C80]/20 text-[10.5px] font-bold text-[#0F1B3D]">
                  <ShieldCheck className="w-3 h-3 text-[#008C80]" stroke="#008C80" color="#008C80" style={{ stroke: '#008C80', color: '#008C80' }} />
                  Verified Professionals
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF8F6] border border-[#008C80]/20 text-[10.5px] font-bold text-[#0F1B3D]">
                  <CalendarCheck className="w-3 h-3 text-[#008C80]" stroke="#008C80" color="#008C80" style={{ stroke: '#008C80', color: '#008C80' }} />
                  Easy Booking
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF8F6] border border-[#008C80]/20 text-[10.5px] font-bold text-[#0F1B3D]">
                  <Headphones className="w-3 h-3 text-[#008C80]" stroke="#008C80" color="#008C80" style={{ stroke: '#008C80', color: '#008C80' }} />
                  Reliable Support
                </span>
              </div>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────── */}
          {/* ZONE C: RIGHT VISUAL (Customer using phone)             */}
          {/* ─────────────────────────────────────────────────────── */}
          <div className="hidden lg:flex w-[210px] xl:w-[250px] 2xl:w-[280px] flex-col justify-end relative select-none shrink-0">
            {/* Customer Real Image */}
            <div className="relative w-full h-[360px] xl:h-[410px] flex items-end justify-center">
              <Image
                src="/hero-customer.png?v=2"
                alt="Customer booking Doorstep Hub services on her phone"
                fill
                priority
                className="object-contain object-bottom pointer-events-none drop-shadow-md"
                sizes="(max-width: 1280px) 250px, 280px"
              />
            </div>

            {/* Right Trust Callout: Easy Booking (Top-Right) */}
            <div className="absolute right-0 top-6 xl:top-8 z-20 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.08)] border border-[#008C80]/20 flex items-center gap-2 pointer-events-auto">
              <div className="w-7 h-7 rounded-xl bg-[#EAF8F6] border border-[#008C80]/20 flex items-center justify-center text-[#008C80] shrink-0">
                <CalendarCheck className="w-3.5 h-3.5 text-[#008C80]" stroke="#008C80" color="#008C80" style={{ stroke: '#008C80', color: '#008C80' }} />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-[#0F1B3D] leading-tight">
                  Easy Booking
                </h4>
              </div>
            </div>

            {/* Right Trust Callout: Reliable Support (Bottom-Right) */}
            <div className="absolute -right-1 xl:right-0 bottom-4 xl:bottom-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.08)] border border-[#008C80]/20 flex items-center gap-2 pointer-events-auto">
              <div className="w-7 h-7 rounded-xl bg-[#EAF8F6] border border-[#008C80]/20 flex items-center justify-center text-[#008C80] shrink-0">
                <Headphones className="w-3.5 h-3.5 text-[#008C80]" stroke="#008C80" color="#008C80" style={{ stroke: '#008C80', color: '#008C80' }} />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-[#0F1B3D] leading-tight">
                  Reliable Support
                </h4>
              </div>
            </div>

            {/* Decorative mint sparkles near customer */}
            <div className="absolute left-3 top-20 pointer-events-none select-none" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path d="M4 14 C 8 10, 14 18, 18 14" stroke="#008C80" strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
                <path d="M10 6 C 14 2, 20 10, 24 6" stroke="#008C80" strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
              </svg>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 3. FOUR SERVICE CATEGORY CARDS                            */}
        {/* ========================================================= */}
        {error ? (
          <div className="mt-4 text-center">
            <p className="text-red-500 text-sm mb-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[#008C80] hover:underline text-xs font-semibold"
            >
              Retry Loading Services
            </button>
          </div>
        ) : (
          <ServiceCategoryCards
            services={services}
            loading={loading}
            serviceSlugs={serviceSlugs}
          />
        )}
      </div>
    </section>
  );
}

export default HeroSection;
