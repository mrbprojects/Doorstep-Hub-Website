'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ShieldCheck, Tag, LayoutGrid, Headphones } from 'lucide-react';

const BENEFITS = [
  {
    id: 'verified-pros',
    icon: ShieldCheck,
    title: 'Verified Professionals',
    description: 'Trained, background-checked and trusted experts.',
  },
  {
    id: 'transparent-pricing',
    icon: Tag,
    title: 'Transparent Pricing',
    description: 'No hidden charges. Know the cost upfront.',
  },
  {
    id: 'wide-range',
    icon: LayoutGrid,
    title: 'Wide Range of Services',
    description: 'Everything you need, right at your doorstep.',
  },
  {
    id: 'reliable-support',
    icon: Headphones,
    title: 'Reliable Support',
    description: "We're here to help, whenever you need us.",
  },
];

export function HomeWhyChooseUsSection() {
  return (
    <section id="why-choose-us" className="relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#F8FDFB] to-[#EAFBF7]/60 py-8 sm:py-10 lg:py-12 border-t border-[#E3EEEB]/50">
      {/* Decorative Mint Background Accents */}
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-[#00796F]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-1/4 w-96 h-96 bg-[#EAFBF7] rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Eyebrow, H2, and Subtitle (Centered) */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAFBF7] border border-[#00796F]/25 text-[#00796F] text-xs font-extrabold uppercase tracking-wider mb-2.5 shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00796F]" />
            <span>WHY CHOOSE DOORSTEP HUB</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-2xl sm:text-3xl lg:text-[36px] font-black text-[#102033] tracking-tight leading-[1.2] mb-2"
          >
            A Smarter Way to Get Things Done
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[#64748B] text-sm sm:text-base leading-relaxed"
          >
            Reliable services, verified professionals and a seamless booking experience — all in one place.
          </motion.p>
        </div>

        {/* Two-Column Composition: Technician Left (~26%), Benefit Cards Right (~74%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Technician Illustration */}
          <div className="lg:col-span-3 flex justify-center lg:justify-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative w-[240px] sm:w-[270px] lg:w-full max-w-[300px] flex flex-col items-center"
            >
              {/* Decorative Outline Arcs & Sparkles behind Technician */}
              <div className="absolute -top-4 -left-4 pointer-events-none select-none opacity-40" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M4 28 C 6 12, 24 4, 36 10" stroke="#00796F" strokeWidth="2" strokeLinecap="round" />
                  <path d="M10 36 C 14 20, 30 14, 38 22" stroke="#00796F" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                </svg>
              </div>

              {/* Technician Image */}
              <div className="relative w-full aspect-[3/4] overflow-visible">
                <Image
                  src="/hero-technician.png"
                  alt="Verified Doorstep Hub Professional Technician"
                  fill
                  sizes="(max-width: 768px) 240px, (max-width: 1200px) 280px, 320px"
                  className="object-contain object-bottom drop-shadow-md select-none pointer-events-none"
                  priority={false}
                />
              </div>

              {/* Floating Badge at bottom-left */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="absolute bottom-2 -left-2 sm:-left-4 z-10 inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-xl border border-slate-100 backdrop-blur-md"
              >
                <div className="w-6 h-6 rounded-lg bg-[#EAFBF7] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#00796F]" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#102033] whitespace-nowrap">
                  Verified Professionals
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column: 4 Benefit Cards (equal width in a row on desktop) */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-4 items-stretch">
              {BENEFITS.map((benefit, idx) => {
                const IconComponent = benefit.icon;
                return (
                  <motion.div
                    key={benefit.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.1 + idx * 0.08 }}
                    className="group bg-white rounded-2xl p-4 sm:p-5 border border-[#E3EEEB] shadow-xs hover:shadow-md hover:border-[#00796F]/30 hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center justify-start h-full"
                  >
                    {/* Mint Circle Icon Container */}
                    <div className="w-11 h-11 rounded-full bg-[#EAFBF7] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 text-[#00796F]">
                      <IconComponent className="w-5 h-5 stroke-[2.2]" />
                    </div>

                    {/* Benefit Title */}
                    <h3 className="text-sm sm:text-base font-black text-[#102033] mb-2 leading-snug group-hover:text-[#00796F] transition-colors">
                      {benefit.title}
                    </h3>

                    {/* Benefit Description */}
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {benefit.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeWhyChooseUsSection;

