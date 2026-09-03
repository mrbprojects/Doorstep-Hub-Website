'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Zap, 
  Star, 
  Search, 
  Users, 
  CheckCircle2, 
  MessageCircle, 
  Wrench,
  Clock,
  Phone
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
  const router = useRouter();
  const { location } = useLocationContext();
  const { globalSettings } = useGlobalSettings() || {};
  const [activeTab, setActiveTab] = useState('book'); // 'book' | 'explore'
  const [selectedAppliance, setSelectedAppliance] = useState('');

  const currentCityName = location?.city || location?.name || 'Hyderabad';
  const whatsappNumber = globalSettings?.whatsappNumber || '918886688666';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent('Hi Doorstep Hub, I need an appliance repair service at my doorstep.')}`;

  return (
    <section className="relative min-h-[85vh] overflow-hidden pt-28 pb-14 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/50">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.06)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />
      <div className="pointer-events-none absolute top-10 right-10 h-[450px] w-[450px] rounded-full bg-[#037166]/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-[450px] w-[450px] rounded-full bg-[#04a99d]/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        
        {/* Main Two-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ── LEFT COLUMN: HEADLINE, PROOF, & BOOKING CARD ── */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Tag / Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] text-[11px] sm:text-xs font-black tracking-widest uppercase mb-4 w-fit"
            >
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
              <span>HELLO INDIA · SAHI SERVICE, SAHI PRICE</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-[54px] font-black text-[#0f172a] tracking-tight leading-[1.1] mb-4"
            >
              Experience the best <span className="text-[#037166]">appliance repair</span> at your doorstep.
            </motion.h1>

            {/* Subheading / Value Proposition */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed mb-6 max-w-2xl"
            >
              Get an instant quote for your appliances. Genuine parts, certified technicians, doorstep service.{' '}
              <strong className="text-slate-900 font-bold">Service in 60 Mins @ your doorstep · Warranty included.</strong>
            </motion.p>

            {/* Trust Pills / Social Proof Row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-8"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4.8★ on Google · 3,200+ reviews</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-800">
                <Users className="w-3.5 h-3.5 text-[#037166]" />
                <span>50,000+ Happy Customers</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-800">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>30-90 Days Warranty</span>
              </div>
            </motion.div>

            {/* Interactive Booking Widget Card (Wisedrive Style) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 p-5 sm:p-6 max-w-xl"
            >
              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-2xl mb-4">
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
              <div className="space-y-3">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Select Appliance or Problem
                </label>
                
                <div 
                  onClick={onBookService}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 cursor-pointer hover:border-[#037166]/40 hover:bg-slate-100/50 transition-colors"
                >
                  <span className="flex items-center gap-2.5 text-slate-500">
                    <Wrench className="w-4 h-4 text-[#037166]" />
                    <span>Choose appliance (AC, Washing Machine, Fridge, TV...)</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Primary CTA Button */}
                <button
                  onClick={onBookService}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#037166]/30 hover:shadow-xl hover:shadow-[#037166]/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Get My Service Price & Book</span>
                </button>

                <p className="text-[11px] text-center text-slate-400 font-medium">
                  Instant booking · Transparent pricing · Certified technicians
                </p>
              </div>

              {/* "OR, EASIER WAY" Divider */}
              <div className="relative my-4 text-center">
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
                <div className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                      <MessageCircle className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        Chat with us on WhatsApp
                      </h4>
                      <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Reply within 2 mins · Instant quote
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
              </a>

            </motion.div>

            {/* App Store / Google Play Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mt-6 flex items-center gap-3"
            >
              <a
                href={globalSettings?.playStore || globalSettings?.customerAndroidAppLink || DEFAULT_APP_LINKS.android}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 sm:h-11 w-32 sm:w-36 items-center justify-center overflow-hidden rounded-full border border-[#9ecbc3] bg-[#DEF2EF] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
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
                className="flex h-10 sm:h-11 w-32 sm:w-36 items-center justify-center overflow-hidden rounded-full border border-[#9ecbc3] bg-[#DEF2EF] shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
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

          {/* ── RIGHT COLUMN: HIGH QUALITY HERO TECHNICIAN CARD WITH FLOATING BADGES ── */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full max-w-[440px] lg:max-w-none rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-300/80 border-4 border-white bg-slate-900 aspect-[3/4]"
            >
              {/* Technician Image */}
              <img
                src="/hero-technician.jpg"
                alt="Expert Doorstep Hub Appliance Technician"
                className="w-full h-full object-cover object-center"
              />

              {/* Gradient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

              {/* Floating Badge 1: Top Left - 100% Transparent */}
              <div className="absolute top-5 left-5 z-20">
                <div className="px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-white/40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#037166]">
                    100% TRANSPARENT
                  </p>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    Repairs done in front of you.
                  </p>
                </div>
              </div>

              {/* Floating Badge 2: Top Right - Quick in 60 Mins */}
              <div className="absolute top-5 right-5 z-20">
                <div className="px-3.5 py-2 rounded-2xl bg-[#037166] text-white shadow-lg">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-80">
                    QUICK
                  </p>
                  <p className="text-xs font-black leading-tight">
                    Service in 60 Mins
                  </p>
                </div>
              </div>

              {/* Floating Badge 3: Bottom Left - Live Bookings Pill */}
              <div className="absolute bottom-5 left-5 z-20">
                <div className="px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-white/60 flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-slate-900">42</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-[9px] font-black text-emerald-800 uppercase">
                        LIVE
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500">
                      bookings in {currentCityName} today
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* ── BOTTOM TRUST FEATURES ROW (3 CARDS) ── */}
        <div className="mt-14 pt-10 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {TRUST_FEATURES.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-[#037166]/40 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#037166]/20 bg-[#037166]/10 text-[#037166]">
                <item.icon className="h-6 w-6 text-[#037166]" />
              </div>
              <div>
                <h6 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">
                  {item.label}
                </h6>
                <p className="text-xs text-slate-500 mt-0.5">
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
