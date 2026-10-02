'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Star, 
  Users, 
  MessageCircle, 
  Wrench,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLocationContext } from '@/context/LocationContext';
import { useGlobalSettings } from '@/context/GlobalSettingsContext';

const DEFAULT_APP_LINKS = {
  ios: 'https://apps.apple.com/in/app/doorstep-hub/id6475340236',
  android:
    'https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share',
};

const TRUST_FEATURES = [
  { icon: Shield, label: 'Verified & Insured Professionals', desc: 'All verified & Insured' },
  { icon: Zap, label: 'Same Day Service Available', desc: 'Book In 60 Seconds' },
  { icon: Star, label: '30-90 Days Service Warranty On Repairs', desc: 'On All Services' },
];

export function Hero({ onViewServices, onBookService }) {
  const { location } = useLocationContext?.() || {};
  const { globalSettings } = useGlobalSettings() || {};
  const [activeTab, setActiveTab] = useState('book'); // 'book' | 'explore'

  const currentCityName = location?.city || location?.name || 'Hyderabad';
  const whatsappNumber = globalSettings?.whatsappNumber || '918886688666';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hi Doorstep Hub, I need an appliance repair service in ${currentCityName} at my doorstep.`)}`;

  return (
    <section className="relative overflow-hidden pt-16 sm:pt-20 lg:pt-20 pb-8 sm:pb-10 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/50">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.06)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />
      <div className="pointer-events-none absolute top-10 right-10 h-[450px] w-[450px] rounded-full bg-[#037166]/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-[450px] w-[450px] rounded-full bg-[#04a99d]/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        
        {/* Main Two-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* ── LEFT COLUMN: HEADLINE, PROOF, & BOOKING CARD ── */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Tag / Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] text-[11px] sm:text-xs font-black tracking-widest uppercase mb-3 w-fit"
            >
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
              <span>HELLO INDIA · SAHI SERVICE, SAHI PRICE</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-2xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-black text-[#0f172a] tracking-tight leading-[1.12] mb-3"
            >
              Experience the best <span className="text-[#037166]">appliance repair</span> at your doorstep.
            </motion.h1>

            {/* Subheading / Value Proposition */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-xs sm:text-sm lg:text-[15px] text-slate-600 font-medium leading-relaxed mb-4 max-w-2xl"
            >
              Get an instant quote for your appliances. Genuine parts, certified technicians, doorstep service.{' '}
              <strong className="text-slate-900 font-bold">Service in 60 Mins @ your doorstep · Warranty included.</strong>
            </motion.p>

            {/* Trust Pills / Social Proof Row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-5"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-[11px] sm:text-xs font-bold text-slate-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4.8★ on Google · 3,200+ reviews</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-[11px] sm:text-xs font-bold text-slate-800">
                <Users className="w-3.5 h-3.5 text-[#037166]" />
                <span>50,000+ Happy Customers</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-[11px] sm:text-xs font-bold text-slate-800">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>30-90 Days Warranty</span>
              </div>
            </motion.div>

            {/* Interactive Booking Widget Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 p-4 sm:p-5 max-w-xl"
            >
              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-2xl mb-3.5">
                <button
                  onClick={() => setActiveTab('book')}
                  className={`py-2 text-xs sm:text-sm font-black rounded-xl transition-all ${
                    activeTab === 'book'
                      ? 'bg-white text-[#037166] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Book Repair Service
                </button>
                <button
                  onClick={() => {
                    setActiveTab('explore');
                    onViewServices?.();
                  }}
                  className={`py-2 text-xs sm:text-sm font-black rounded-xl transition-all ${
                    activeTab === 'explore'
                      ? 'bg-white text-[#037166] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Explore All Categories
                </button>
              </div>

              {/* Service Selection / Quick Action Input */}
              <div className="space-y-2.5">
                <label className="block text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                  Select Appliance or Problem
                </label>
                
                <div 
                  onClick={onBookService}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer hover:border-[#037166]/40 hover:bg-slate-100/50 transition-colors"
                >
                  <span className="flex items-center gap-2.5 text-slate-500 truncate">
                    <Wrench className="w-4 h-4 text-[#037166] shrink-0" />
                    <span className="truncate">Choose appliance (AC, Washing Machine, Fridge, TV...)</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>

                {/* Primary CTA Button */}
                <button
                  onClick={onBookService}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#037166]/30 hover:shadow-xl hover:shadow-[#037166]/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Get My Service Price & Book</span>
                </button>

                <p className="text-[10.5px] text-center text-slate-400 font-medium">
                  Instant booking · Transparent pricing · Certified technicians
                </p>
              </div>

              {/* "OR, EASIER WAY" Divider */}
              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  OR, EASIER WAY
                </span>
              </div>

              {/* WhatsApp Quick Connect Card */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl overflow-hidden border border-amber-300/80 bg-gradient-to-b from-amber-50/80 to-white shadow-sm hover:shadow-md hover:border-emerald-400 transition-all"
              >
                {/* Amber Ribbon */}
                <div className="bg-[#F59E0B] px-3 py-1 text-center text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-900 flex items-center justify-center gap-1.5">
                  <span>🎁</span>
                  <span>SAVE ₹100 EXTRA - WHATSAPP INSTANT BOOKING</span>
                </div>

                {/* WhatsApp Action */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                      <MessageCircle className="w-4.5 h-4.5 fill-white" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        Chat with us on WhatsApp
                      </h4>
                      <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Reply within 2 mins · Instant quote
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </a>

            </motion.div>

            {/* App Store / Google Play Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mt-4 flex items-center gap-2.5"
            >
              <a
                href={globalSettings?.playStore || globalSettings?.customerAndroidAppLink || DEFAULT_APP_LINKS.android}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 sm:h-10 w-28 sm:w-32 items-center justify-center overflow-hidden rounded-full border border-[#9ecbc3] bg-[#DEF2EF] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                title="Get it on Google Play"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src="/andriod1.png"
                  alt="Google Play"
                  className="h-full w-full object-cover opacity-95 brightness-0 invert"
                />
              </a>

              <a
                href={globalSettings?.appStore || globalSettings?.customerIosAppLink || DEFAULT_APP_LINKS.ios}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 sm:h-10 w-28 sm:w-32 items-center justify-center overflow-hidden rounded-full border border-[#9ecbc3] bg-[#DEF2EF] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                title="Download on App Store"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src="/apple2.png"
                  alt="App Store"
                  className="h-full w-full object-cover opacity-95 brightness-0 invert"
                />
              </a>
            </motion.div>

          </div>

          {/* ── RIGHT COLUMN: HERO APPLIANCE TECHNICIAN ILLUSTRATION WITH FEATURE BADGES ── */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full max-w-[400px] sm:max-w-[460px] lg:max-w-[520px] xl:max-w-[560px] aspect-square flex items-center justify-center"
            >
              {/* Soft ambient back-glow behind illustration */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#037166]/15 via-[#04a99d]/10 to-transparent blur-3xl -z-10 pointer-events-none" />

              {/* 1st Image: Technician with Washing Machine, Refrigerator, Microwave, and Badges */}
              <img
                src="/appliance-hero-main.png"
                alt="Doorstep Hub Verified Appliance Repair Technician & Appliances"
                className="w-full h-full object-contain drop-shadow-[0_16px_32px_rgba(3,113,102,0.12)] hover:scale-[1.02] transition-transform duration-500 select-none"
              />
            </motion.div>
          </div>

        </div>

        {/* ── BOTTOM TRUST FEATURES ROW (3 CARDS) ── */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-7 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-6">
          {TRUST_FEATURES.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 sm:p-4 shadow-sm backdrop-blur-sm transition-all hover:border-[#037166]/40 hover:shadow-md"
            >
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border border-[#037166]/20 bg-[#037166]/10 text-[#037166]">
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#037166]" />
              </div>
              <div>
                <h6 className="text-xs sm:text-[14px] lg:text-[15px] font-bold text-slate-900 leading-snug">
                  {item.label}
                </h6>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
