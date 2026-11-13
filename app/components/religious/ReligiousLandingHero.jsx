'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Search, Sparkles, ShieldCheck, Home, CalendarCheck } from 'lucide-react';

/* ─── Sacred SVG Icons for Category Tiles (Matched to Image 2) ─────────── */

/* 1. Astrology Consultation (Deep Purple/Violet #4A154B) */
function AstrologyWheelIcon({ className = 'w-5 h-5 sm:w-6 sm:h-6' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="13" stroke="#4A154B" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="8.5" stroke="#4A154B" strokeWidth="1" />
      <circle cx="16" cy="16" r="2.8" stroke="#4A154B" strokeWidth="1.2" fill="#FFF9EC" />
      <line x1="16" y1="3" x2="16" y2="29" stroke="#4A154B" strokeWidth="1.2" />
      <line x1="3" y1="16" x2="29" y2="16" stroke="#4A154B" strokeWidth="1.2" />
      <line x1="6.8" y1="6.8" x2="25.2" y2="25.2" stroke="#4A154B" strokeWidth="1.2" />
      <line x1="25.2" y1="6.8" x2="6.8" y2="25.2" stroke="#4A154B" strokeWidth="1.2" />
      <path d="M14 6.5 L16 8.5 L18 6.5" stroke="#4A154B" strokeWidth="1" strokeLinecap="round" />
      <path d="M14 25.5 L16 23.5 L18 25.5" stroke="#4A154B" strokeWidth="1" strokeLinecap="round" />
      <path d="M6.5 14 L8.5 16 L6.5 18" stroke="#4A154B" strokeWidth="1" strokeLinecap="round" />
      <path d="M25.5 14 L23.5 16 L25.5 18" stroke="#4A154B" strokeWidth="1" strokeLinecap="round" />
      <circle cx="16" cy="16" r="1" fill="#4A154B" />
    </svg>
  );
}

/* 2. Daily Poojas (Warm Copper #B85822) */
function DailyDiyaIcon({ className = 'w-5 h-5 sm:w-6 sm:h-6' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <ellipse cx="16" cy="27" rx="6" ry="1.8" stroke="#B85822" strokeWidth="1.3" />
      <line x1="16" y1="22" x2="16" y2="25.2" stroke="#B85822" strokeWidth="1.4" />
      <path d="M7 19 C7 24 25 24 25 19 C23 16 9 16 7 19 Z" stroke="#B85822" strokeWidth="1.3" />
      <ellipse cx="16" cy="18" rx="8" ry="2" stroke="#B85822" strokeWidth="1" />
      <path d="M16 4 C13 8 13.5 13 16 16 C18.5 13 19 8 16 4 Z" stroke="#B85822" strokeWidth="1.4" fill="#FFF2D6" />
      <path d="M16 8 C15 10.5 15.2 13 16 14.5 C16.8 13 17 10.5 16 8 Z" stroke="#B85822" strokeWidth="0.9" />
    </svg>
  );
}

/* 3. Death & Rituals (Terracotta/Rust #9B332B) */
function TempleGopuramIcon({ className = 'w-5 h-5 sm:w-6 sm:h-6' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 3 L16 5.5 M14.5 5.5 L17.5 5.5" stroke="#9B332B" strokeWidth="1.2" />
      <path d="M13 6 L19 6 L20 9.5 L12 9.5 Z" stroke="#9B332B" strokeWidth="1.3" />
      <path d="M11 10 L21 10 L22.5 14.5 L9.5 14.5 Z" stroke="#9B332B" strokeWidth="1.3" />
      <path d="M8.5 15 L23.5 15 L25.5 20 L6.5 20 Z" stroke="#9B332B" strokeWidth="1.3" />
      <path d="M5.5 20.5 L26.5 20.5 L26.5 28 L5.5 28 Z" stroke="#9B332B" strokeWidth="1.3" />
      <path d="M13 28 L13 24 C13 22.5 19 22.5 19 24 L19 28" stroke="#9B332B" strokeWidth="1.3" />
      <line x1="8" y1="18" x2="24" y2="18" stroke="#9B332B" strokeWidth="0.8" />
    </svg>
  );
}

/* 4. Dosham Remedies (Warm Copper #B85822) */
function TrishulRemediesIcon({ className = 'w-5 h-5 sm:w-6 sm:h-6' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 3 L17.5 9 L16 14.5 L14.5 9 Z" stroke="#B85822" strokeWidth="1.3" />
      <path d="M8 8 C8 13.5 14 14.5 16 14.5" stroke="#B85822" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 8 L6.5 10" stroke="#B85822" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 8 C24 13.5 18 14.5 16 14.5" stroke="#B85822" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M24 8 L25.5 10" stroke="#B85822" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="13.5" y1="16" x2="18.5" y2="16" stroke="#B85822" strokeWidth="1.3" />
      <line x1="16" y1="16" x2="16" y2="28" stroke="#B85822" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* 5. Festival Poojas (Warm Copper #B85822) */
function SacredLotusIcon({ className = 'w-5 h-5 sm:w-6 sm:h-6' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 6 C13 11 13 18 16 22 C19 18 19 11 16 6 Z" stroke="#B85822" strokeWidth="1.3" />
      <path d="M16 22 C11 20 8 15 9.5 10 C12.5 12 14.5 16 16 22 Z" stroke="#B85822" strokeWidth="1.3" />
      <path d="M16 22 C21 20 24 15 22.5 10 C19.5 12 17.5 16 16 22 Z" stroke="#B85822" strokeWidth="1.3" />
      <path d="M16 22 C9 22 5 17 6.5 14 C9 15 13 18 16 22 Z" stroke="#B85822" strokeWidth="1.2" />
      <path d="M16 22 C23 22 27 17 25.5 14 C23 15 19 18 16 22 Z" stroke="#B85822" strokeWidth="1.2" />
      <path d="M12 24 C14 25.5 18 25.5 20 24" stroke="#B85822" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* 6. Homams (Warm Copper #B85822) */
function HavanKundIcon({ className = 'w-5 h-5 sm:w-6 sm:h-6' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 4 C13.5 8 13.5 13 16 16 C18.5 13 18.5 8 16 4 Z" stroke="#B85822" strokeWidth="1.4" fill="#FFF2D6" />
      <path d="M12 9 C10 11.5 11 14.5 13.5 16" stroke="#B85822" strokeWidth="1.3" />
      <path d="M20 9 C22 11.5 21 14.5 18.5 16" stroke="#B85822" strokeWidth="1.3" />
      <path d="M16 9 C15 11 15 13 16 14.5" stroke="#B85822" strokeWidth="0.9" />
      <path d="M6 18 L26 18 L24 21 L8 21 Z" stroke="#B85822" strokeWidth="1.2" />
      <path d="M8 21 L24 21 L22 26 L10 26 Z" stroke="#B85822" strokeWidth="1.2" />
      <line x1="8" y1="27" x2="24" y2="27" stroke="#B85822" strokeWidth="1.3" />
    </svg>
  );
}

/* 7. Education & Career (Deep Purple/Violet #4A154B) */
function EducationCareerIcon({ className = 'w-5 h-5 sm:w-6 sm:h-6' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 6 L28 12 L16 18 L4 12 Z" stroke="#4A154B" strokeWidth="1.4" />
      <path d="M8 14.5 L8 22 C8 22.5 7 23 6.5 23" stroke="#4A154B" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="6.5" cy="23.5" r="1" fill="#4A154B" />
      <path d="M9 15.5 L9 20 C9 23 23 23 23 20 L23 15.5" stroke="#4A154B" strokeWidth="1.3" />
    </svg>
  );
}

/* 8. All Services (Warm Copper #B85822) */
function AllServicesGridIcon({ className = 'w-5 h-5 sm:w-6 sm:h-6' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="5.5" y="5.5" width="8.5" height="8.5" rx="2" stroke="#B85822" strokeWidth="1.3" />
      <rect x="18" y="5.5" width="8.5" height="8.5" rx="2" stroke="#B85822" strokeWidth="1.3" />
      <rect x="5.5" y="18" width="8.5" height="8.5" rx="2" stroke="#B85822" strokeWidth="1.3" />
      <rect x="18" y="18" width="8.5" height="8.5" rx="2" stroke="#B85822" strokeWidth="1.3" />
    </svg>
  );
}

/* ─── Hanging Golden Diya with Chain & Flame ────────────────────────────── */

function HangingDiya({ chainLength = 120, delay = 0, style = {} }) {
  return (
    <motion.div
      initial={{ rotate: -1.5 }}
      animate={{ rotate: [ -1.5, 1.5, -1.5 ] }}
      transition={{
        duration: 6.5 + (delay % 2),
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      style={{
        transformOrigin: 'top center',
        ...style,
      }}
      className="absolute pointer-events-none select-none z-10 flex flex-col items-center"
    >
      {/* Golden Chain Links */}
      <div
        style={{ height: `${chainLength}px` }}
        className="w-[1.5px] bg-gradient-to-b from-[#F3C54A]/30 via-[#F3C54A] to-[#D4A346] relative"
      >
        <div className="absolute top-1/4 -left-[1.5px] w-1 h-1 rounded-full bg-[#FFE28A]" />
        <div className="absolute top-2/4 -left-[1.5px] w-1 h-1 rounded-full bg-[#FFE28A]" />
        <div className="absolute top-3/4 -left-[1.5px] w-1 h-1 rounded-full bg-[#FFE28A]" />
      </div>

      {/* Hanging Brass Diya Body */}
      <div className="relative -mt-0.5 flex flex-col items-center">
        <motion.div
          animate={{
            scale: [ 1, 1.1, 0.96, 1.05, 1 ],
            opacity: [ 0.9, 1, 0.85, 1, 0.9 ],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: delay * 0.4,
          }}
          className="relative -mb-1 z-20 flex flex-col items-center"
        >
          <div className="w-2.5 h-3.5 bg-gradient-to-t from-[#F47B20] via-[#FFD700] to-[#FFFFFF] rounded-full blur-[0.5px] shadow-[0_0_10px_#F47B20,0_0_20px_rgba(255,215,0,0.6)]" />
          <div className="w-1 h-1.5 bg-white rounded-full -mt-2 blur-[0.2px]" />
        </motion.div>

        <svg width="24" height="18" viewBox="0 0 28 20" fill="none" className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
          <ellipse cx="14" cy="4" rx="12" ry="2.5" fill="#FFE28A" stroke="#B3802A" strokeWidth="0.8" />
          <path d="M2 4 C2 13 26 13 26 4 C24 14 17 17 14 17 C11 17 4 14 2 4 Z" fill="url(#brassDiyaGrad)" stroke="#B3802A" strokeWidth="0.8" />
          <circle cx="14" cy="18.5" r="1.5" fill="#FFE28A" stroke="#B3802A" strokeWidth="0.5" />
          <defs>
            <linearGradient id="brassDiyaGrad" x1="2" y1="4" x2="26" y2="17" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D4A346" />
              <stop offset="35%" stopColor="#FFE599" />
              <stop offset="70%" stopColor="#C89228" />
              <stop offset="100%" stopColor="#7E540E" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}

/* ─── Corner Mango Leaves Garland ───────────────────────────────────────── */

function CornerMangoLeaves({ side = 'left' }) {
  const isLeft = side === 'left';
  return (
    <div
      className={`absolute top-0 ${isLeft ? 'left-0' : 'right-0'} pointer-events-none select-none z-10 w-28 sm:w-36 md:w-44 h-24 sm:h-28 opacity-90`}
      style={{ transform: isLeft ? 'none' : 'scaleX(-1)' }}
    >
      <svg viewBox="0 0 160 110" fill="none" className="w-full h-full">
        <path d="M-10 10 Q 50 15 110 5 Q 140 0 160 -10" stroke="#3D2817" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M15 12 Q 25 35 20 65 Q 10 38 15 12 Z" fill="#2E6B34" stroke="#1D4A23" strokeWidth="0.6" />
        <path d="M35 13 Q 55 42 60 75 Q 40 45 35 13 Z" fill="#3D8B44" stroke="#255C2C" strokeWidth="0.6" />
        <path d="M60 12 Q 85 35 105 55 Q 80 40 60 12 Z" fill="#2E6B34" stroke="#1D4A23" strokeWidth="0.6" />
        <path d="M85 8 Q 115 25 140 38 Q 110 25 85 8 Z" fill="#3D8B44" stroke="#255C2C" strokeWidth="0.6" />
        <circle cx="36" cy="15" r="3.5" fill="#F47B20" />
        <circle cx="36" cy="15" r="1.8" fill="#FFE28A" />
        <circle cx="85" cy="10" r="3.5" fill="#F47B20" />
        <circle cx="85" cy="10" r="1.8" fill="#FFE28A" />
      </svg>
    </div>
  );
}

/* ─── Center Lotus Ornamental Divider ───────────────────────────────────── */

function LotusOrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-1.5 sm:my-2">
      <div className="h-[1px] w-12 sm:w-20 md:w-24 bg-gradient-to-r from-transparent via-[#F3C54A] to-[#F3C54A]" />
      <div className="w-1 h-1 bg-[#F3C54A] rotate-45" />

      {/* Golden Lotus Blossom Center */}
      <svg width="28" height="16" viewBox="0 0 34 20" fill="none" className="shrink-0 drop-shadow-[0_2px_6px_rgba(243,197,74,0.4)]">
        <path d="M17 2 C14.5 6 14.5 12 17 15 C19.5 12 19.5 6 17 2 Z" fill="#F3C54A" stroke="#D4A346" strokeWidth="0.5" />
        <path d="M17 15 C13 13.5 10.5 9 12 5.5 C14 7.5 15.5 11 17 15 Z" fill="#E8BD65" />
        <path d="M17 15 C21 13.5 23.5 9 22 5.5 C20 7.5 18.5 11 17 15 Z" fill="#E8BD65" />
        <path d="M17 15 C10.5 15 7 11 8.5 8 C11 9.5 14 12 17 15 Z" fill="#D4A346" />
        <path d="M17 15 C23.5 15 27 11 25.5 8 C23 9.5 20 12 17 15 Z" fill="#D4A346" />
        <path d="M12 17 C15 18.5 19 18.5 22 17" stroke="#F3C54A" strokeWidth="1.2" strokeLinecap="round" />
      </svg>

      <div className="w-1 h-1 bg-[#F3C54A] rotate-45" />
      <div className="h-[1px] w-12 sm:w-20 md:w-24 bg-gradient-to-l from-transparent via-[#F3C54A] to-[#F3C54A]" />
    </div>
  );
}

/* ─── Arch Crest Golden Lotus Finial (Image 2 Mughal/Temple Arch) ─────── */

function ArchLotusFinial() {
  return (
    <div className="relative -mt-6 sm:-mt-7 mb-1 flex justify-center pointer-events-none select-none">
      <div className="relative">
        {/* Arch Crest SVG Silhouette */}
        <svg width="220" height="38" viewBox="0 0 240 42" fill="none" className="drop-shadow-[0_4px_12px_rgba(243,197,74,0.35)]">
          <path
            d="M 10,42 C 30,42 45,34 60,34 C 75,34 85,22 105,14 C 112,11 120,6 120,6 C 120,6 128,11 135,14 C 155,22 165,34 180,34 C 195,34 210,42 230,42 Z"
            fill="#FFF9EE"
            stroke="#E8C87A"
            strokeWidth="1.5"
          />
          <path
            d="M 22,42 C 40,42 52,36 65,36 C 78,36 88,25 106,17 C 113,14 120,10 120,10 C 120,10 127,14 134,17 C 152,25 162,36 175,36 C 188,36 200,42 218,42"
            stroke="#F4DC9E"
            strokeWidth="1"
            fill="none"
          />
        </svg>

        {/* Radiant Blooming Golden Lotus Finial at Apex */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#FFE066] blur-md rounded-full opacity-60 scale-125" />
            <svg width="38" height="22" viewBox="0 0 42 24" fill="none" className="relative z-10 drop-shadow-[0_2px_6px_rgba(243,197,74,0.6)]">
              <path d="M21 2 C18 6 18 14 21 17 C24 14 24 6 21 2 Z" fill="url(#crestGoldGrad2)" stroke="#B3802A" strokeWidth="0.6" />
              <path d="M21 17 C16 15 13 10 15 6.5 C17.5 9 19.5 13 21 17 Z" fill="#E8BD65" />
              <path d="M21 17 C26 15 29 10 27 6.5 C24.5 9 22.5 13 21 17 Z" fill="#E8BD65" />
              <path d="M21 17 C13 17 9 12 11 8 C14 10 17 14 21 17 Z" fill="#D4A346" />
              <path d="M21 17 C29 17 33 12 31 8 C28 10 25 14 21 17 Z" fill="#D4A346" />
              <path d="M14 19 C18 21 24 21 28 19" stroke="#B3802A" strokeWidth="1" strokeLinecap="round" />
              <defs>
                <linearGradient id="crestGoldGrad2" x1="21" y1="2" x2="21" y2="17" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFF275" />
                  <stop offset="45%" stopColor="#F3C54A" />
                  <stop offset="100%" stopColor="#B3802A" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Flanking Ornamental Scrolls with Diamond Accents */}
          <div className="flex items-center gap-1 -mt-0.5">
            <div className="flex items-center gap-0.5 text-[#D4A346]">
              <span className="text-[9px] leading-none">—</span>
              <div className="w-1 h-1 bg-[#D4A346] rotate-45" />
            </div>
            <div className="w-1.5" />
            <div className="flex items-center gap-0.5 text-[#D4A346]">
              <div className="w-1 h-1 bg-[#D4A346] rotate-45" />
              <span className="text-[9px] leading-none">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 8 Sacred Category Tiles Data (Exact Order as Image 2) ─────────────── */

const SACRED_TILES = [
  /* Row 1 */
  {
    id: 'astrology',
    title: 'Astrology Consultation',
    keywords: [ 'astrolog', 'horoscope', 'kundali', 'jyotish', 'birth' ],
    icon: <AstrologyWheelIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    id: 'daily-poojas',
    title: 'Daily Poojas',
    keywords: [ 'daily', 'pooja', 'nithya', 'archana', 'morning' ],
    icon: <DailyDiyaIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    id: 'death-rituals',
    title: 'Death & Rituals',
    keywords: [ 'death', 'antyesti', 'shraddha', 'grieving', 'last', 'shraadh', 'rites' ],
    icon: <TempleGopuramIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    id: 'dosham-remedies',
    title: 'Dosham Remedies',
    keywords: [ 'dosham', 'dosha', 'remed', 'pariharam', 'shanti', 'graha', 'kala' ],
    icon: <TrishulRemediesIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  /* Row 2 */
  {
    id: 'festival-poojas',
    title: 'Festival Poojas',
    keywords: [ 'festival', 'vratham', 'utsav', 'special', 'navratri', 'diwali', 'varalakshmi' ],
    icon: <SacredLotusIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    id: 'homams',
    title: 'Homams',
    keywords: [ 'homam', 'havan', 'homa', 'yajna', 'ganapathi', 'sudharshana', 'chandi' ],
    icon: <HavanKundIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    id: 'education-career',
    title: 'Education & Career',
    keywords: [ 'education', 'career', 'vidya', 'saraswati', 'hayagriva', 'job', 'success' ],
    icon: <EducationCareerIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    id: 'all-services',
    title: 'All Services',
    keywords: [ 'all', 'view-all', 'browse' ],
    icon: <AllServicesGridIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
];

/* ─── Main Hero Component ────────────────────────────────────────────────── */

export default function ReligiousLandingHero({
  categories = [],
  onOpenCategory,
  onViewAll,
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      const target = document.getElementById('sacred-categories');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Match category locally if available
    if (Array.isArray(categories) && categories.length > 0) {
      const qLower = query.toLowerCase();
      const matched = categories.find((cat) => {
        const name = (cat.name || '').toLowerCase();
        const slug = (cat.slug || '').toLowerCase();
        return name.includes(qLower) || slug.includes(qLower);
      });

      if (matched) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('religious_category', JSON.stringify({ name: matched.name }));
        }
        router.push(`/religious-services/${matched.slug || matched._id}`);
        return;
      }
    }

    // Default: navigate to all-services with search query
    router.push(`/religious-services/all-services?search=${encodeURIComponent(query)}`);
  };

  // Handle Category Tile Click
  const handleTileClick = (tile) => {
    if (tile.id === 'all-services') {
      if (onViewAll) {
        onViewAll();
      } else {
        const target = document.getElementById('sacred-categories');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        } else {
          router.push('/religious-services/category');
        }
      }
      return;
    }

    // Look for a matching category from the API response
    if (Array.isArray(categories) && categories.length > 0) {
      const matched = categories.find((cat) => {
        const catName = (cat.name || '').toLowerCase();
        const catSlug = (cat.slug || '').toLowerCase();
        return tile.keywords.some((kw) => catName.includes(kw) || catSlug.includes(kw));
      });

      if (matched) {
        if (onOpenCategory) {
          onOpenCategory(matched);
        } else {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('religious_category', JSON.stringify({ name: matched.name }));
          }
          router.push(`/religious-services/${matched.slug || matched._id}`);
        }
        return;
      }
    }

    // Fallback: route with query or smooth scroll to category section
    const target = document.getElementById('sacred-categories');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/religious-services/category?serviceType=${encodeURIComponent(tile.id)}`);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#3A0F34] select-none text-white">
      {/* ── Background Temple & Purple Devotional Image ──────────────────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/religious/hero-temple-bg.webp"
          alt="Sacred Temple Gopuram Sunset Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top brightness-105"
        />
        {/* Soft Radial Ambient Devotional Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
          style={{
            background: 'radial-gradient(circle at 18% 60%, rgba(255, 180, 50, 0.35) 0%, transparent 55%), radial-gradient(circle at 82% 40%, rgba(130, 30, 95, 0.4) 0%, transparent 60%)'
          }}
        />
      </div>

      {/* ── Hanging Golden Diyas on Chains (Positioned to hang below the 80px fixed header) ── */}
      <div className="hidden md:block pointer-events-none">
        <HangingDiya chainLength={135} delay={0.2} style={{ left: '3%', top: 0 }} />
        <HangingDiya chainLength={100} delay={1.4} style={{ left: '6.5%', top: 0 }} />
        <HangingDiya chainLength={95} delay={0.9} style={{ right: '5.5%', top: 0 }} />
        <HangingDiya chainLength={130} delay={2.1} style={{ right: '2%', top: 0 }} />
      </div>

      {/* ── Corner Mango Leaf Garlands ─────────────────────────────────── */}
      <CornerMangoLeaves side="left" />
      <CornerMangoLeaves side="right" />

      {/* ── Main Hero Content Grid ──────────────────────────────────────────
          pt-24 (96px on mobile) and sm:pt-28 lg:pt-28 (112px on desktop)
          guarantees complete clearance below the 80px (h-20) fixed top header.
          pb-4 sm:pb-6 lg:pb-8 maintains compact vertical layout without empty space.
      ────────────────────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-28 pb-4 sm:pb-6 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-3 items-center">
          
          {/* ════ LEFT Devotional Artwork (~24% allocation, cols 1-3) ════ */}
          <div className="lg:col-span-3 order-2 lg:order-1 flex justify-center lg:justify-start items-end self-end">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: [0, -4, 0] }}
              transition={{
                opacity: { duration: 0.8, delay: 0.2 },
                y: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="relative w-full max-w-[220px] sm:max-w-[260px] lg:max-w-[280px] xl:max-w-[310px] mx-auto lg:mx-0"
            >
              <Image
                src="/religious/hero-kalash-thali.webp"
                alt="Sacred Golden Kalash with Diyas and Lotus on Golden Pooja Thali"
                width={440}
                height={370}
                priority
                className="w-full h-auto object-contain filter drop-shadow-[0_12px_24px_rgba(255,160,20,0.25)]"
              />
            </motion.div>
          </div>

          {/* ════ CENTER Hero Heading & Search (~38% allocation, cols 4-7) ═══ */}
          <div className="lg:col-span-4 xl:col-span-4 order-1 lg:order-2 text-center flex flex-col items-center justify-center self-center">
            
            {/* Trust Pill Badge (Safely below fixed header with clear margin) */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-1 px-3 py-0.5 sm:py-1 rounded-full bg-[#FFF9EE] border border-[#F5D898] shadow-sm mb-2"
            >
              <Sparkles className="w-3 h-3 text-[#F47B20] fill-[#F47B20]" />
              <span className="text-[11px] sm:text-xs font-semibold text-[#D96B27] tracking-tight">
                Trusted by 50,000+ Devotees
              </span>
            </motion.div>

            {/* Main Headline (Decreased Text Size, 2 lines matching reference) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-0"
            >
              <h1
                style={{ fontFamily: "Georgia, 'Cinzel', 'Playfair Display', Cambria, serif" }}
                className="text-xl sm:text-2xl md:text-[26px] lg:text-[28px] xl:text-[32px] font-bold tracking-tight text-white leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
              >
                Book Trusted Religious &amp;
              </h1>
              <div
                style={{ fontFamily: "Georgia, 'Cinzel', 'Playfair Display', Cambria, serif" }}
                className="text-xl sm:text-2xl md:text-[26px] lg:text-[28px] xl:text-[32px] font-bold tracking-tight text-[#F3C54A] leading-tight drop-shadow-[0_2px_10px_rgba(243,197,74,0.35)]"
              >
                Spiritual Services
              </div>
            </motion.div>

            {/* Gold Lotus Ornamental Divider */}
            <LotusOrnamentalDivider />

            {/* Subtitle (Decreased Text Size) */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[11px] sm:text-xs md:text-[13px] text-[#FFF6E8]/90 font-normal max-w-sm sm:max-w-md mx-auto leading-snug px-2 mb-2.5 sm:mb-3"
            >
              Discover and book authentic poojas, homams, rituals and Vedic ceremonies from verified priests at your doorstep.
            </motion.p>

            {/* Search Bar (Compact & Sleek) */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              onSubmit={handleSearchSubmit}
              className="w-full max-w-sm sm:max-w-md mx-auto bg-white rounded-full p-1 pl-3.5 sm:pl-4 shadow-[0_8px_24px_rgba(30,5,25,0.35)] border border-[#F3C54A]/40 flex items-center gap-1.5 transition-all focus-within:ring-2 focus-within:ring-[#F3C54A]"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5A1C4E] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for pooja, homam, ritual or service..."
                className="w-full bg-transparent outline-none text-[#330F2F] placeholder:text-[#8D7687] text-[11px] sm:text-xs font-normal pr-1"
              />
              <button
                type="submit"
                className="shrink-0 bg-gradient-to-r from-[#4A1545] to-[#360B39] hover:from-[#5C1B56] hover:to-[#45103E] text-white font-semibold text-[11px] sm:text-xs px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-md transition-all active:scale-95"
              >
                Search
              </button>
            </motion.form>
          </div>

          {/* ════ RIGHT Sacred Categories Panel (~38% allocation, cols 8-12) ═ */}
          {/* Exact 4 Columns x 2 Rows Card Matching Image 2 */}
          <div className="lg:col-span-5 xl:col-span-5 order-3 lg:order-3 flex justify-center lg:justify-end self-center mt-2 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative w-full max-w-[430px] sm:max-w-[460px] lg:max-w-[450px] xl:max-w-[480px] pt-4"
            >
              {/* Arch Crest Golden Lotus Finial (Image 2 Mughal/Temple Arch) */}
              <ArchLotusFinial />

              {/* Card Body Container */}
              <div className="relative bg-[#FFF9EE] border-[1.5px] border-[#E8C87A] rounded-2xl sm:rounded-3xl shadow-[0_12px_32px_rgba(30,10,25,0.22)] p-2 sm:p-2.5 pt-1">
                
                {/* Title Header with Gold Wings */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-[#D4A346]" />
                  <h3
                    style={{ fontFamily: "Georgia, 'Cinzel', 'Playfair Display', Cambria, serif" }}
                    className="text-xs sm:text-[13px] font-bold tracking-wide text-[#3D113C] select-none"
                  >
                    Explore Sacred Services
                  </h3>
                  <div className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-[#D4A346]" />
                </div>

                {/* 4 Columns x 2 Rows Grid of 8 White Tiles (Exact Match to Image 2) */}
                <div className="grid grid-cols-4 gap-1 sm:gap-2">
                  {SACRED_TILES.map((tile) => (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => handleTileClick(tile)}
                      className="group relative flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-white hover:bg-[#FFF9EC] border border-[#F2E5CE] hover:border-[#DFB559] transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:-translate-y-0.5 text-center active:scale-95 h-[70px] sm:h-[80px]"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center transition-transform group-hover:scale-105">
                        {tile.icon}
                      </div>
                      <span className="text-[9.5px] sm:text-[10.5px] font-bold text-[#3D113C] mt-1 leading-[1.15] line-clamp-2">
                        {tile.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ── Floating 4-Item Trust Strip (Overlapping Bottom Wave) ────────── */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 -mt-2 sm:-mt-3 mb-2 sm:mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-[#FFFDF9] border border-[#F2DCAB] rounded-[18px] sm:rounded-full shadow-[0_8px_20px_rgba(40,10,30,0.12)] py-2 sm:py-2.5 px-3 sm:px-6"
        >
          {/* Desktop 4-in-a-row | Mobile 2x2 Grid */}
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-around gap-2 sm:gap-4 text-center">
            
            {/* Item 1: Verified Priests */}
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6D1B53] shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold text-[#42143F] whitespace-nowrap">
                Verified Priests
              </span>
            </div>

            <div className="hidden sm:block h-4 w-[1px] bg-[#EADBBE]" />

            {/* Item 2: Authentic Vedic Rituals */}
            <div className="flex items-center justify-center gap-1.5">
              <SacredLotusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4A346] shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold text-[#42143F] whitespace-nowrap">
                Authentic Vedic Rituals
              </span>
            </div>

            <div className="hidden sm:block h-4 w-[1px] bg-[#EADBBE]" />

            {/* Item 3: At Your Doorstep */}
            <div className="flex items-center justify-center gap-1.5">
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6D1B53] shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold text-[#42143F] whitespace-nowrap">
                At Your Doorstep
              </span>
            </div>

            <div className="hidden sm:block h-4 w-[1px] bg-[#EADBBE]" />

            {/* Item 4: Instant Booking */}
            <div className="flex items-center justify-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4A346] shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold text-[#42143F] whitespace-nowrap">
                Instant Booking
              </span>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Decorative Gold & Warm Ivory Bottom Transition */}
      <div className="w-full h-2 bg-gradient-to-b from-transparent to-[#FFF8E7]/40 pointer-events-none" />
    </section>
  );
}
