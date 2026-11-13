'use client';

import { Search, Calendar, User, Home, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '1',
    title: '1. Search Service',
    description: 'Find the pooja or ritual you need',
    icon: Search,
    iconBg: 'bg-[#FEF3C7] text-[#D97706]',
  },
  {
    step: '2',
    title: '2. Choose Date & Time',
    description: 'Select a convenient slot',
    icon: Calendar,
    iconBg: 'bg-[#FFEDD5] text-[#EA580C]',
  },
  {
    step: '3',
    title: '3. Book a Priest',
    description: 'Choose a verified priest or provider',
    icon: User,
    iconBg: 'bg-[#FEF3C7] text-[#D97706]',
  },
  {
    step: '4',
    title: '4. Service at Home',
    description: 'Ritual performed at your doorstep',
    icon: Home,
    iconBg: 'bg-[#FEF08A] text-[#CA8A04]',
  },
];

export default function HowItWorksSection() {
  return (
    <section aria-label="How It Works" className="w-full pt-4 pb-6 sm:pt-6 sm:pb-8 md:pt-8 md:pb-10 bg-[#FFF9EF]">
      <div className="container max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Devotional Header */}
        <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[#E96B18] text-sm sm:text-base">🪷</span>
            <h2 className="font-serif font-bold text-xl sm:text-2xl md:text-3xl text-[#4C124D] tracking-tight">
              How It <span className="text-[#E96B18]">Works</span>
            </h2>
            <span className="text-[#E96B18] text-sm sm:text-base">🪷</span>
          </div>

          <p className="text-xs sm:text-sm text-[#685D68] max-w-xl font-normal">
            Book your religious or spiritual service in just a few simple steps
          </p>
        </div>

        {/* 4 Connected Step Cards Container */}
        <div className="rounded-2xl sm:rounded-[32px] border border-[#EAD8C3] bg-[#FFFDF9] p-4 sm:p-6 lg:p-8 shadow-[0_8px_24px_rgba(101,11,80,0.03)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-4 relative">
            {STEPS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="flex items-center relative">
                  {/* Step Card Content */}
                  <div className="flex items-center gap-3 sm:gap-3.5 w-full">
                    {/* Circular Icon */}
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 shadow-xs ${item.iconBg}`}
                    >
                      <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>

                    {/* Step Text */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xs sm:text-sm md:text-base text-[#30252C] leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#685D68] mt-0.5 leading-tight">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Connecting Arrow between steps (desktop only, except after step 4) */}
                  {idx < 3 && (
                    <div className="hidden lg:flex items-center justify-center text-[#E96B18] shrink-0 px-2 opacity-70">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
