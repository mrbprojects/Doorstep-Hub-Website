'use client';

import React from 'react';
import Image from 'next/image';
import {
  Smartphone,
  Zap,
  Shield,
  Star,
  Calendar,
  Package,
  Bell,
  CreditCard,
  MapPin,
  Search,
  SlidersHorizontal,
  Wrench,
  Scissors,
  Home,
  Tag,
  User,
  ShoppingBag,
  Building2,
  Flame,
  ArrowRight
} from 'lucide-react';

export function AppDownload() {
  const googlePlayUrl = "https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share";
  const appStoreUrl = "https://apps.apple.com/in/app/doorstep-hub/id6475340236";

  return (
    <section
      id="app-download"
      className="relative overflow-hidden bg-white py-8 sm:py-10 lg:py-12 border-t border-[#E9F8F6]"
    >
      {/* ========================================================= */}
      {/* ATMOSPHERIC BACKGROUND DECORATIONS                        */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        {/* Soft mint radial gradient glow in the center-right behind phone */}
        <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#E9F8F6] blur-3xl opacity-70" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#F0FAF8] blur-3xl opacity-60" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,140,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,140,128,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* Dotted decorative matrix top center */}
        <div className="hidden lg:block absolute top-12 left-[48%] -translate-x-1/2 w-28 h-20 opacity-30">
          <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#008C80" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid)" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: HERO CONTENT, BENEFITS, STORES, STATS        */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center text-left space-y-4 sm:space-y-5">
            
            {/* 1. BADGE: DOWNLOAD OUR APP */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E9F8F6] border border-[#BCE3DE] shadow-2xs">
                <Smartphone className="w-4 h-4 text-[#008C80]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#0A2540]">
                  DOWNLOAD OUR APP
                </span>
              </div>
            </div>

            {/* 2. MAIN HEADLINE */}
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#101828] tracking-tight leading-[1.12]">
                Everything in{' '}
                <span className="relative inline-block text-[#008C80]">
                  Your Pocket
                  {/* Playful teal brush strokes matching reference */}
                  <span className="absolute -top-3 sm:-top-4 -right-1 flex gap-1 pointer-events-none select-none">
                    <span className="w-1 h-3 sm:h-3.5 bg-[#008C80] rounded-full rotate-[25deg] transform origin-bottom opacity-90" />
                    <span className="w-1 h-3 sm:h-3.5 bg-[#008C80] rounded-full rotate-[45deg] transform origin-bottom opacity-90" />
                  </span>
                </span>
              </h2>

              <p className="mt-2.5 text-[#475467] text-sm sm:text-base font-normal leading-relaxed max-w-xl">
                Access all services, book appointments, track orders, and manage your daily needs — all from one powerful app.
              </p>
            </div>

            {/* 3. THREE BENEFIT ITEMS (Horizontal on desktop, stacked on mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 sm:pt-2">
              {/* Benefit 1 */}
              <div className="flex items-start gap-3 sm:gap-2.5 xl:gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E9F8F6] border border-[#BCE3DE] flex items-center justify-center shrink-0 shadow-2xs">
                  <Zap className="w-4 h-4 text-[#008C80] fill-[#008C80]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-[#101828] leading-snug">
                    Lightning-Fast Booking
                  </h4>
                  <p className="text-xs text-[#667085] mt-0.5 leading-relaxed">
                    Book your favourite services in just a few taps.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex items-start gap-3 sm:gap-2.5 xl:gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E9F8F6] border border-[#BCE3DE] flex items-center justify-center shrink-0 shadow-2xs">
                  <Shield className="w-4 h-4 text-[#008C80]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-[#101828] leading-snug">
                    Secure &amp; Private
                  </h4>
                  <p className="text-xs text-[#667085] mt-0.5 leading-relaxed">
                    Your data and payments are always protected.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex items-start gap-3 sm:gap-2.5 xl:gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E9F8F6] border border-[#BCE3DE] flex items-center justify-center shrink-0 shadow-2xs">
                  <Star className="w-4 h-4 text-[#008C80]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-[#101828] leading-snug">
                    Exclusive App-Only Deals
                  </h4>
                  <p className="text-xs text-[#667085] mt-0.5 leading-relaxed">
                    Get special offers, discounts and early access.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. STORE BUTTONS + QR CODE ROW */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
              {/* Google Play Button */}
              <a
                href={googlePlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="app-store-badge inline-flex items-center gap-2.5 px-4 py-2.5 bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                title="Get it on Google Play"
              >
                {/* Google Play SVG Icon */}
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M3.608 1.636a1.442 1.442 0 0 0-.358.988v18.752c0 .385.127.733.358.988l.056.056 10.5-10.428v-.248L3.664 1.58l-.056.056Z" fill="#2196F3"/>
                  <path d="M17.664 15.492l-3.5-3.48v-.248l3.5-3.48.08.046 4.148 2.357c1.184.673 1.184 1.774 0 2.447l-4.148 2.358-.08.046Z" fill="#FFC107"/>
                  <path d="M14.244 11.764L3.608 22.364c.389.412 1.05.464 1.79.043l12.346-7.015-3.5-3.628Z" fill="#F44336"/>
                  <path d="M14.244 11.764l3.5-3.628L5.398 1.121c-.74-.421-1.401-.369-1.79.043l10.636 10.6Z" fill="#4CAF50"/>
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[9px] uppercase tracking-wider text-slate-300">GET IT ON</span>
                  <span className="text-sm font-bold text-white tracking-tight mt-0.5">Google Play</span>
                </div>
              </a>

              {/* Apple App Store Button */}
              <a
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="app-store-badge inline-flex items-center gap-2.5 px-4 py-2.5 bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                title="Download on the App Store"
              >
                {/* Apple SVG Icon */}
                <svg className="w-6 h-6 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.86.96-2.84-.93.04-2.05.62-2.7 1.39-.58.67-1.08 1.76-.95 2.82 1.04.08 2.06-.59 2.69-1.37z"/>
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[9px] text-slate-300">Download on the</span>
                  <span className="text-sm font-bold text-white tracking-tight mt-0.5">App Store</span>
                </div>
              </a>

              {/* QR Code Container */}
              <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-slate-200 p-1 bg-white shadow-2xs flex items-center justify-center shrink-0 relative">
                  {/* Crisp SVG QR code representation with D-hub logo in center */}
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                    {/* Corner Position Detection Squares */}
                    <rect x="6" y="6" width="26" height="26" rx="4" fill="#101828"/>
                    <rect x="11" y="11" width="16" height="16" rx="2" fill="white"/>
                    <rect x="15" y="15" width="8" height="8" rx="1.5" fill="#008C80"/>

                    <rect x="68" y="6" width="26" height="26" rx="4" fill="#101828"/>
                    <rect x="73" y="11" width="16" height="16" rx="2" fill="white"/>
                    <rect x="77" y="15" width="8" height="8" rx="1.5" fill="#008C80"/>

                    <rect x="6" y="68" width="26" height="26" rx="4" fill="#101828"/>
                    <rect x="11" y="73" width="16" height="16" rx="2" fill="white"/>
                    <rect x="15" y="77" width="8" height="8" rx="1.5" fill="#008C80"/>

                    {/* QR Matrix Dots */}
                    <rect x="38" y="8" width="5" height="5" rx="1" fill="#101828"/>
                    <rect x="48" y="8" width="5" height="5" rx="1" fill="#101828"/>
                    <rect x="58" y="14" width="5" height="5" rx="1" fill="#101828"/>
                    <rect x="38" y="24" width="5" height="5" rx="1" fill="#101828"/>
                    <rect x="48" y="24" width="5" height="5" rx="1" fill="#008C80"/>
                    <rect x="58" y="28" width="5" height="5" rx="1" fill="#101828"/>

                    <rect x="8" y="38" width="5" height="5" rx="1" fill="#101828"/>
                    <rect x="22" y="38" width="5" height="5" rx="1" fill="#101828"/>
                    <rect x="8" y="48" width="5" height="5" rx="1" fill="#008C80"/>
                    <rect x="18" y="56" width="5" height="5" rx="1" fill="#101828"/>

                    <rect x="72" y="38" width="5" height="5" rx="1" fill="#101828"/>
                    <rect x="86" y="38" width="5" height="5" rx="1" fill="#101828"/>
                    <rect x="76" y="48" width="5" height="5" rx="1" fill="#101828"/>
                    <rect x="86" y="56" width="5" height="5" rx="1" fill="#008C80"/>

                    <rect x="38" y="72" width="5" height="5" rx="1" fill="#101828"/>
                    <rect x="48" y="72" width="5" height="5" rx="1" fill="#008C80"/>
                    <rect x="58" y="78" width="5" height="5" rx="1" fill="#101828"/>
                    <rect x="38" y="86" width="5" height="5" rx="1" fill="#101828"/>
                    <rect x="48" y="86" width="5" height="5" rx="1" fill="#101828"/>
                    <rect x="78" y="82" width="5" height="5" rx="1" fill="#101828"/>
                    <rect x="86" y="88" width="5" height="5" rx="1" fill="#101828"/>

                    {/* Central Brand Pill */}
                    <rect x="33" y="38" width="34" height="24" rx="4" fill="white" stroke="#008C80" strokeWidth="1.5"/>
                    <text x="50" y="54" textAnchor="middle" fill="#008C80" fontSize="9" fontWeight="900" fontFamily="sans-serif">D-hub</text>
                  </svg>
                </div>
                <div className="flex flex-col text-left leading-snug">
                  <span className="text-xs sm:text-sm font-bold text-[#101828]">Scan QR Code</span>
                  <span className="text-[11px] sm:text-xs text-[#667085]">to Download Doorstep Hub App</span>
                </div>
              </div>
            </div>

            {/* 5. APP STATS ROW */}
            <div className="flex items-center gap-6 sm:gap-10 pt-2 border-t border-slate-100">
              <div>
                <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-black text-[#008C80] leading-none mb-1">
                  <span>4.8</span>
                  <Star className="w-5 h-5 fill-[#008C80] text-[#008C80]" />
                </div>
                <span className="text-xs font-semibold text-[#667085]">App Rating</span>
              </div>

              <div className="h-9 w-px bg-slate-200" />

              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#008C80] leading-none mb-1">
                  50K+
                </div>
                <span className="text-xs font-semibold text-[#667085]">Downloads</span>
              </div>

              <div className="h-9 w-px bg-slate-200" />

              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#008C80] leading-none mb-1">
                  10K+
                </div>
                <span className="text-xs font-semibold text-[#667085]">Reviews</span>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: 3D PHONE MOCKUP WITH 4 CALLOUT CARDS        */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-5 relative flex items-center justify-center pt-8 pb-12 sm:pt-10 sm:pb-16 lg:py-6">
            
            {/* SVG Connector Lines (Desktop Only) */}
            <div className="hidden xl:block absolute inset-0 pointer-events-none z-10" aria-hidden="true">
              <svg className="w-full h-full" viewBox="0 0 540 600" fill="none">
                {/* Line to Top-Left: Easy Booking */}
                <path d="M120 170 C 140 210, 160 215, 195 218" stroke="#008C80" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7"/>
                <circle cx="120" cy="170" r="3.5" fill="#008C80"/>
                <circle cx="195" cy="218" r="3" fill="#008C80"/>

                {/* Line to Bottom-Left: Track Orders */}
                <path d="M130 380 C 150 350, 170 350, 195 365" stroke="#008C80" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7"/>
                <circle cx="130" cy="380" r="3.5" fill="#008C80"/>
                <circle cx="195" cy="365" r="3" fill="#008C80"/>

                {/* Line to Top-Right: Smart Notifications */}
                <path d="M420 180 C 390 200, 365 190, 345 160" stroke="#008C80" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7"/>
                <circle cx="420" cy="180" r="3.5" fill="#008C80"/>
                <circle cx="345" cy="160" r="3" fill="#008C80"/>

                {/* Line to Bottom-Right: Secure Payments */}
                <path d="M420 370 C 390 350, 365 375, 345 400" stroke="#008C80" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7"/>
                <circle cx="420" cy="370" r="3.5" fill="#008C80"/>
                <circle cx="345" cy="400" r="3" fill="#008C80"/>
              </svg>
            </div>

            {/* CALLOUT CARD 1: TOP-LEFT (Easy Booking) */}
            <div className="hidden xl:flex app-callout-card absolute -left-12 top-16 z-20 bg-white border border-[#BCE3DE]/60 rounded-2xl p-3.5 shadow-[0_8px_24px_-4px_rgba(0,140,128,0.12)] items-center gap-3 w-52">
              <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#008C80]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#101828]">Easy Booking</h4>
                <p className="text-[11px] text-[#667085] leading-tight mt-0.5">Schedule services in seconds.</p>
              </div>
            </div>

            {/* CALLOUT CARD 2: BOTTOM-LEFT (Track Orders) */}
            <div className="hidden xl:flex app-callout-card absolute -left-10 top-72 z-20 bg-white border border-[#BCE3DE]/60 rounded-2xl p-3.5 shadow-[0_8px_24px_-4px_rgba(0,140,128,0.12)] items-center gap-3 w-52">
              <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-[#008C80]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#101828]">Track Orders</h4>
                <p className="text-[11px] text-[#667085] leading-tight mt-0.5">Real-time updates on your services.</p>
              </div>
            </div>

            {/* CALLOUT CARD 3: TOP-RIGHT (Smart Notifications) */}
            <div className="hidden xl:flex app-callout-card absolute -right-12 top-20 z-20 bg-white border border-[#BCE3DE]/60 rounded-2xl p-3.5 shadow-[0_8px_24px_-4px_rgba(0,140,128,0.12)] items-center gap-3 w-56">
              <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-[#008C80]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#101828]">Smart Notifications</h4>
                <p className="text-[11px] text-[#667085] leading-tight mt-0.5">Get updates and offers instantly.</p>
              </div>
            </div>

            {/* CALLOUT CARD 4: BOTTOM-RIGHT (Secure Payments) */}
            <div className="hidden xl:flex app-callout-card absolute -right-10 top-76 z-20 bg-white border border-[#BCE3DE]/60 rounded-2xl p-3.5 shadow-[0_8px_24px_-4px_rgba(0,140,128,0.12)] items-center gap-3 w-52">
              <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-[#008C80]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#101828]">Secure Payments</h4>
                <p className="text-[11px] text-[#667085] leading-tight mt-0.5">Multiple payment options.</p>
              </div>
            </div>

            {/* THE SMARTPHONE WITH PEDESTAL */}
            <div className="relative flex flex-col items-center">
              
              {/* Smartphone Frame (iPhone 16 Pro styling) */}
              <div className="relative z-10 w-[275px] xs:w-[290px] sm:w-[305px] h-[555px] xs:h-[585px] sm:h-[615px] bg-[#101828] rounded-[48px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,140,128,0.3),0_15px_30px_-10px_rgba(16,24,40,0.4)] border-[3.5px] border-[#344054]">
                
                {/* Metallic Side Highlights */}
                <div className="absolute top-24 -left-1 w-0.5 h-10 bg-[#667085] rounded-l" />
                <div className="absolute top-38 -left-1 w-0.5 h-12 bg-[#667085] rounded-l" />
                <div className="absolute top-32 -right-1 w-0.5 h-16 bg-[#667085] rounded-r" />

                {/* Inner Screen Canvas */}
                <div className="w-full h-full bg-[#F8FAFC] rounded-[38px] overflow-hidden flex flex-col justify-between relative border border-slate-200 select-none">
                  
                  {/* Dynamic Island Notch */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-end pr-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1A2E3B] border border-[#344054]/50" />
                  </div>

                  {/* Top Bar: Status + App Header */}
                  <div className="pt-2 px-4 pb-2 bg-white border-b border-slate-100 z-20">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 px-1 pt-1 pb-1.5">
                      <span>9:41</span>
                      <div className="flex items-center gap-1.5">
                        {/* Signal */}
                        <div className="flex items-end gap-0.5 h-2.5">
                          <span className="w-0.5 h-1 bg-slate-800 rounded-xs" />
                          <span className="w-0.5 h-1.5 bg-slate-800 rounded-xs" />
                          <span className="w-0.5 h-2 bg-slate-800 rounded-xs" />
                          <span className="w-0.5 h-2.5 bg-slate-800 rounded-xs" />
                        </div>
                        {/* Battery */}
                        <div className="w-4 h-2 border border-slate-800 rounded-xs p-0.5 flex items-center">
                          <div className="w-full h-full bg-slate-800 rounded-xs" />
                        </div>
                      </div>
                    </div>

                    {/* App Header: D-hub Logo + Notification Bell */}
                    <div className="flex items-center justify-between pt-1 pb-1">
                      <div className="flex-1 flex justify-center pl-6">
                        <Image
                          src="/d-hub-logo.png"
                          alt="D-hub Doorstep Hub"
                          width={95}
                          height={30}
                          className="h-6 w-auto object-contain"
                        />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center relative shrink-0">
                        <Bell className="w-3.5 h-3.5 text-slate-700" />
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      </div>
                    </div>

                    {/* Location Bar */}
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#008C80] shrink-0" />
                      <span>Hyderabad, Telangana</span>
                      <span className="text-[10px] text-slate-400">▾</span>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-2 flex items-center justify-between px-2.5 py-1.5 bg-slate-100 rounded-xl text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Search className="w-3 h-3 text-slate-400" />
                        <span>Search for services...</span>
                      </div>
                      <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>

                  {/* Scrollable App Body Content */}
                  <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-3 no-scrollbar">
                    
                    {/* Hero Promotional Banner */}
                    <div className="relative rounded-2xl bg-gradient-to-r from-[#DEF2EF] via-[#E9F8F6] to-[#CDEAE5] p-2.5 border border-[#BCE3DE] overflow-hidden flex items-center justify-between shadow-2xs">
                      <div className="max-w-[60%] z-10">
                        <h4 className="text-[11px] font-black text-[#0A2540] leading-tight">
                          Reliable Home Services at Your Doorstep
                        </h4>
                        <p className="text-[9px] text-[#475467] leading-tight mt-1">
                          Book verified professionals for all your home needs.
                        </p>
                        {/* Dots */}
                        <div className="flex items-center gap-1 mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#008C80]" />
                          <span className="w-1 h-1 rounded-full bg-[#008C80]/40" />
                          <span className="w-1 h-1 rounded-full bg-[#008C80]/40" />
                        </div>
                      </div>
                      <div className="relative w-16 h-20 shrink-0">
                        <Image
                          src="/Bharath.png"
                          alt="Technician"
                          fill
                          sizes="64px"
                          className="object-contain object-bottom"
                        />
                      </div>
                    </div>

                    {/* Services Header */}
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-xs font-black text-[#101828]">Our Services</span>
                      <span className="text-[10px] font-bold text-[#008C80] flex items-center gap-0.5">
                        View All <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>

                    {/* 6 Category Tiles */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* 1. Appliance Repair */}
                      <div className="bg-white rounded-xl p-2 border border-slate-100 flex flex-col items-center text-center shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-[#DEF2EF] flex items-center justify-center mb-1 text-[#008C80]">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">Appliance Repair</span>
                      </div>

                      {/* 2. Salon & Beauty */}
                      <div className="bg-white rounded-xl p-2 border border-slate-100 flex flex-col items-center text-center shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-[#FEE4E2] flex items-center justify-center mb-1 text-[#D92D20]">
                          <Scissors className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">Salon &amp; Beauty</span>
                      </div>

                      {/* 3. Pet Care */}
                      <div className="bg-white rounded-xl p-2 border border-slate-100 flex flex-col items-center text-center shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-[#FEF0C7] flex items-center justify-center mb-1 text-[#B54708]">
                          <span className="text-xs">🐾</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">Pet Care</span>
                      </div>

                      {/* 4. PG & Hostel */}
                      <div className="bg-white rounded-xl p-2 border border-slate-100 flex flex-col items-center text-center shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] flex items-center justify-center mb-1 text-[#0284C7]">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">PG &amp; Hostel</span>
                      </div>

                      {/* 5. Pooja Services */}
                      <div className="bg-white rounded-xl p-2 border border-slate-100 flex flex-col items-center text-center shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-[#FEF3F2] flex items-center justify-center mb-1 text-[#E04F16]">
                          <Flame className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">Pooja Services</span>
                      </div>

                      {/* 6. Buy & Sell */}
                      <div className="bg-white rounded-xl p-2 border border-slate-100 flex flex-col items-center text-center shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-[#DEF2EF] flex items-center justify-center mb-1 text-[#008C80]">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 leading-tight">Buy &amp; Sell</span>
                      </div>
                    </div>

                  </div>

                  {/* Bottom Navigation Bar */}
                  <div className="bg-white border-t border-slate-100 py-1.5 px-3 flex items-center justify-around z-20">
                    <div className="flex flex-col items-center text-[#008C80]">
                      <Home className="w-4 h-4" />
                      <span className="text-[8px] font-bold mt-0.5">Home</span>
                    </div>
                    <div className="flex flex-col items-center text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[8px] font-medium mt-0.5">Bookings</span>
                    </div>
                    <div className="flex flex-col items-center text-slate-400">
                      <Tag className="w-4 h-4" />
                      <span className="text-[8px] font-medium mt-0.5">Offers</span>
                    </div>
                    <div className="flex flex-col items-center text-slate-400">
                      <User className="w-4 h-4" />
                      <span className="text-[8px] font-medium mt-0.5">Profile</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* 3D MINT PEDESTAL & FOLIAGE AT THE BASE */}
              <div className="relative -mt-10 sm:-mt-12 w-[340px] xs:w-[380px] sm:w-[420px] max-w-full h-28 pointer-events-none select-none flex items-center justify-center" aria-hidden="true">
                {/* Foliage / Green leaves emerging on the left */}
                <div className="absolute -left-2 bottom-6 w-24 h-24">
                  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm">
                    <path d="M60 85 C 30 65, 20 40, 30 15 C 45 40, 60 55, 60 85 Z" fill="#2E7D32" opacity="0.85"/>
                    <path d="M70 90 C 45 75, 40 50, 50 25 C 62 48, 72 65, 70 90 Z" fill="#4CAF50" opacity="0.95"/>
                    <path d="M80 95 C 60 85, 60 65, 70 45 C 80 65, 85 80, 80 95 Z" fill="#81C784" opacity="0.9"/>
                  </svg>
                </div>

                {/* Foliage / Green leaves emerging on the right */}
                <div className="absolute -right-2 bottom-6 w-24 h-24">
                  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm transform -scale-x-100">
                    <path d="M60 85 C 30 65, 20 40, 30 15 C 45 40, 60 55, 60 85 Z" fill="#2E7D32" opacity="0.85"/>
                    <path d="M70 90 C 45 75, 40 50, 50 25 C 62 48, 72 65, 70 90 Z" fill="#4CAF50" opacity="0.95"/>
                    <path d="M80 95 C 60 85, 60 65, 70 45 C 80 65, 85 80, 80 95 Z" fill="#81C784" opacity="0.9"/>
                  </svg>
                </div>

                {/* Pedestal Top Ellipse Platform */}
                <div className="absolute bottom-2 w-full h-16 rounded-[100%] bg-gradient-to-b from-[#BEE5DF] via-[#9FD7CD] to-[#7BC5B8] shadow-[0_15px_30px_-5px_rgba(0,140,128,0.25)] border-t border-white/60" />
                <div className="absolute bottom-4 w-[92%] h-12 rounded-[100%] bg-gradient-to-b from-[#DDF2EE] to-[#BEE5DF] opacity-90" />
              </div>

            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* MOBILE & TABLET ONLY: 4 CALLOUT CARDS IN 2x2 GRID         */}
        {/* (Rendered cleanly below on screens < 1280px)              */}
        {/* ========================================================= */}
        <div className="xl:hidden mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="app-callout-card bg-white border border-[#BCE3DE]/60 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[#008C80]" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#101828]">Easy Booking</h4>
              <p className="text-xs text-[#667085] mt-0.5 leading-snug">Schedule services in seconds.</p>
            </div>
          </div>

          <div className="app-callout-card bg-white border border-[#BCE3DE]/60 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-[#008C80]" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#101828]">Track Orders</h4>
              <p className="text-xs text-[#667085] mt-0.5 leading-snug">Real-time updates on your services.</p>
            </div>
          </div>

          <div className="app-callout-card bg-white border border-[#BCE3DE]/60 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-[#008C80]" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#101828]">Smart Notifications</h4>
              <p className="text-xs text-[#667085] mt-0.5 leading-snug">Get updates and offers instantly.</p>
            </div>
          </div>

          <div className="app-callout-card bg-white border border-[#BCE3DE]/60 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-[#008C80]" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#101828]">Secure Payments</h4>
              <p className="text-xs text-[#667085] mt-0.5 leading-snug">Multiple payment options.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
