'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Search, Calendar, Check, Sparkles } from 'lucide-react';

const STEPS = [
  {
    number: 1,
    icon: Search,
    title: 'Search & Explore',
    description: 'Choose your service, compare options and check details.',
  },
  {
    number: 2,
    icon: Calendar,
    title: 'Book & Schedule',
    description: 'Select a convenient date and time that works for you.',
  },
  {
    number: 3,
    icon: Check,
    title: 'Get It Done',
    description: 'Our verified professionals arrive and get the job done.',
  },
];

export function HomeHowItWorksSection() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-gradient-to-b from-[#F2FBF9] via-[#EAFBF7] to-[#FFFFFF] py-8 sm:py-10 lg:py-12 border-t border-[#E3EEEB]/60">
      {/* Decorative Dot Matrix on Left Edge */}
      <div className="absolute left-4 top-8 sm:left-8 sm:top-12 pointer-events-none select-none opacity-25" aria-hidden="true">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <pattern id="dot-matrix" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.5" fill="#00796F" />
          </pattern>
          <rect width="72" height="72" fill="url(#dot-matrix)" />
        </svg>
      </div>

      {/* Subtle Mint Glow Orbs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#00796F]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-[#EAFBF7] rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column (Cards & Copy) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center">
            {/* Eyebrow Label */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 self-start px-3.5 py-1 rounded-full bg-[#EAFBF7] border border-[#00796F]/25 text-[#00796F] text-xs font-extrabold uppercase tracking-wider mb-2.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00796F]" />
              <span>HOW IT WORKS</span>
            </motion.div>

            {/* H2 Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-2xl sm:text-3xl lg:text-[36px] font-black text-[#102033] tracking-tight leading-[1.2] mb-2"
            >
              Get the Services You Need <br className="hidden sm:inline" />
              in 3 Simple Steps
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[#64748B] text-sm sm:text-base max-w-xl leading-relaxed mb-5 sm:mb-6"
            >
              From searching to booking, Doorstep Hub makes it simple, fast and hassle-free.
            </motion.p>

            {/* 3 Step Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 lg:gap-3 relative items-stretch">
              {STEPS.map((step, idx) => {
                const IconComponent = step.icon;
                return (
                  <React.Fragment key={step.number}>
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: 0.15 + idx * 0.1 }}
                      className="group relative bg-white rounded-2xl p-4 sm:p-5 border border-[#E3EEEB] shadow-xs hover:shadow-md hover:border-[#00796F]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Icon Container with Badge */}
                        <div className="relative w-11 h-11 rounded-full bg-[#EAFBF7] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                          <IconComponent className="w-6 h-6 text-[#00796F] stroke-[2.2]" />
                          {/* Step Number Badge */}
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00796F] text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                            {step.number}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-black text-[#102033] leading-snug mb-1.5 group-hover:text-[#00796F] transition-colors">
                          {step.title}
                        </h3>

                        {/* Description */}
                        <p className="text-[#64748B] text-xs sm:text-[13px] leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>

                    {/* Connector Arrow for Desktop between step 1 & 2, and 2 & 3 */}
                    {idx < STEPS.length - 1 && (
                      <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 pointer-events-none select-none z-10"
                           style={{ left: idx === 0 ? '31.5%' : '65%' }}>
                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                          <path d="M2 8 C 8 2, 16 14, 22 8" stroke="#00796F" strokeWidth="1.8" strokeDasharray="3 3" strokeLinecap="round" opacity="0.65" />
                          <path d="M17 5 L 22 8 L 18 12" stroke="#00796F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Right Column: Woman Illustration */}
          <div className="lg:col-span-5 xl:col-span-4 relative flex items-center justify-center mt-6 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full max-w-[360px] sm:max-w-[400px] lg:max-w-[440px] flex flex-col items-center"
            >
              {/* Decorative Swirl Lines in background */}
              <div className="absolute -top-6 -right-2 pointer-events-none select-none opacity-40" aria-hidden="true">
                <svg width="48" height="64" viewBox="0 0 48 64" fill="none">
                  <path d="M10 4 C 30 16, 20 44, 40 60" stroke="#00796F" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4 20 C 18 30, 14 50, 28 62" stroke="#00796F" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                </svg>
              </div>

              {/* Main Illustration */}
              <div className="relative w-full aspect-[6/5] flex items-center justify-center">
                <Image
                  src="/how-it-works-woman-trans.png"
                  alt="Young woman pointing to Doorstep Hub booking steps"
                  fill
                  sizes="(max-width: 768px) 360px, (max-width: 1200px) 440px, 480px"
                  className="object-contain object-bottom pointer-events-none select-none"
                  quality={95}
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHowItWorksSection;
