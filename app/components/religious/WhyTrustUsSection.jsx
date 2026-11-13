'use client';

import { Check, Award, Flower2, Heart } from 'lucide-react';

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

const TRUST_PILLARS = [
  {
    icon: Check,
    title: 'Verified Priests',
    description: 'Background checked & qualified',
    color: 'bg-[#16A34A]',
  },
  {
    icon: Award,
    title: 'Years of Experience',
    description: 'Decades of combined expertise',
    color: 'bg-[#EA580C]',
  },
  {
    icon: Flower2,
    title: 'Authentic Rituals',
    description: 'Following Vedic traditions',
    color: 'bg-[#9333EA]',
  },
  {
    icon: Heart,
    title: '50,000+ Devotees',
    description: 'Trusted by thousands',
    color: 'bg-[#E11D48]',
  },
];

export default function WhyTrustUsSection() {
  return (
    <section
      aria-label="Why Trust Us"
      className="relative w-full pt-3 pb-8 sm:pt-4 sm:pb-10 md:pt-6 md:pb-12 bg-[#FFF9EF] overflow-hidden"
    >
      {/* Background Temple Gopuram Silhouettes */}
      <div className="absolute top-1 left-4 lg:left-14 opacity-15 pointer-events-none hidden md:block">
        <TempleSilhouette className="w-20 h-28 lg:w-28 lg:h-36" />
      </div>
      <div className="absolute top-1 right-4 lg:right-14 opacity-15 pointer-events-none hidden md:block">
        <TempleSilhouette className="w-20 h-28 lg:w-28 lg:h-36" />
      </div>

      <div className="container max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Devotional Header with tight spacing */}
        <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[#E96B18] text-sm sm:text-base">🪷</span>
            <h2 className="font-serif font-bold text-xl sm:text-2xl md:text-3xl text-[#4C124D] tracking-tight">
              Why Trust <span className="text-[#E96B18]">Us</span>
            </h2>
            <span className="text-[#E96B18] text-sm sm:text-base">🪷</span>
          </div>

          <p className="text-xs sm:text-sm text-[#685D68] max-w-lg font-normal">
            Your spiritual journey in safe and trusted hands
          </p>
        </div>

        {/* 4 Trust Cards Grid: 2 per row on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {TRUST_PILLARS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group flex flex-col items-center justify-center text-center p-3 sm:p-4 md:p-5 rounded-2xl bg-white border border-[#EFE5D8] hover:border-[#E8B34E] shadow-xs hover:shadow-md transition-all duration-300"
              >
                {/* Circular Colored Icon Badge */}
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white mb-2 sm:mb-2.5 shadow-sm group-hover:scale-110 transition-transform duration-300 ${item.color}`}
                >
                  <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>

                {/* Title */}
                <h3 className="font-bold text-xs sm:text-sm md:text-[15px] text-[#30252C] group-hover:text-[#E96B18] transition-colors mb-0.5 sm:mb-1 leading-snug">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-[11px] sm:text-xs text-[#685D68] leading-tight line-clamp-2">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
