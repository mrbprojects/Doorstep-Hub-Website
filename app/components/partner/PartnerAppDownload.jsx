'use client';

import React from 'react';
import Image from 'next/image';
import {
  Download,
  Zap,
  Calendar,
  Star,
  ShieldCheck,
  Clock,
  LogIn,
  MapPin,
  Search,
  SlidersHorizontal,
  Bell,
  RotateCw,
  FileText,
  CalendarDays,
  BarChart3,
  User,
  Home
} from 'lucide-react';

export function PartnerAppDownload({
  appLinks = {
    android: 'https://play.google.com/store/apps/details?id=com.doorstephub.partner',
    ios: 'https://apps.apple.com/in/app/doorstep-hub-partner/id6504071357'
  },
  onPartnerLogin
}) {
  return (
    <section
      id="partner-app-download"
      className="relative overflow-hidden bg-white py-8 sm:py-12 lg:py-14 border-t border-[#E9F8F6]"
    >
      {/* ========================================================= */}
      {/* ATMOSPHERIC BACKGROUND DECORATIONS                        */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        {/* Soft mint radial gradient glow in the center-right behind phone */}
        <div className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[620px] h-[620px] rounded-full bg-[#E9F8F6] blur-3xl opacity-75" />
        <div className="absolute top-1/4 left-1/4 w-[420px] h-[420px] rounded-full bg-[#F0FAF8] blur-3xl opacity-60" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,140,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,140,128,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* Dotted decorative matrix top right */}
        <div className="hidden lg:block absolute top-12 right-12 w-28 h-20 opacity-30">
          <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="partner-dot-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#008C80" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#partner-dot-grid)" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 xl:gap-8 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: HERO CONTENT, BENEFITS, STORES, STATS        */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center text-left space-y-3.5 sm:space-y-4 lg:space-y-5">
            
            {/* 1. BADGE: DOWNLOAD OUR APP */}
            <div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#E9F8F6] border border-[#BCE3DE] shadow-2xs">
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#008C80]" />
                <span className="text-[11px] sm:text-xs font-bold text-[#008C80] tracking-wide">
                  Download Our App
                </span>
              </div>
            </div>

            {/* 2. MAIN HEADLINE */}
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black text-[#101828] tracking-tight leading-[1.12]">
                Download App now ...
                <br />
                <span className="relative inline-block text-[#008C80]">
                  Grow your business services
                  {/* Playful teal brush strokes matching reference */}
                  <span className="absolute -top-3.5 sm:-top-4 -right-1 flex gap-1 pointer-events-none select-none">
                    <span className="w-1 h-3 sm:h-3.5 bg-[#008C80] rounded-full rotate-[25deg] transform origin-bottom opacity-90" />
                    <span className="w-1 h-3 sm:h-3.5 bg-[#008C80] rounded-full rotate-[45deg] transform origin-bottom opacity-90" />
                  </span>
                </span>
              </h2>

              <p className="mt-2.5 sm:mt-3 text-[#475467] text-xs sm:text-sm lg:text-base font-normal leading-relaxed max-w-xl">
                Join the Doorstep Hub platform that helps you Earn More, Manage Work Easily, and Reach More Customers.
              </p>
            </div>

            {/* 3. THREE BENEFIT ROWS */}
            <div className="space-y-2 pt-0.5">
              {/* Benefit 1 */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0 shadow-2xs">
                  <Zap className="w-4 h-4 text-[#008C80] fill-[#008C80]" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#101828] leading-snug">
                    We bring the customers to you
                  </h4>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    Get more service requests in your area.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0 shadow-2xs">
                  <Calendar className="w-4 h-4 text-[#008C80]" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#101828] leading-snug">
                    Manage Appointments Easily
                  </h4>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    View, accept and manage bookings on the go.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0 shadow-2xs">
                  <Star className="w-4 h-4 text-[#008C80]" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#101828] leading-snug">
                    Increase Your Earnings
                  </h4>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    Grow your income with more opportunities.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. STORE BUTTONS + PARTNER LOGIN ROW */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              {/* Google Play Button */}
              {appLinks?.android && (
                <a
                  href={appLinks.android}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-store-badge inline-flex items-center gap-2.5 px-4 py-2.5 bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                  title="Download Doorstep Hub Partner App on Google Play"
                >
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
              )}

              {/* Apple App Store Button */}
              {appLinks?.ios && (
                <a
                  href={appLinks.ios}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-store-badge inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                  title="Download Doorstep Hub Partner App on the App Store"
                >
                  <svg className="w-6 h-6 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.86.96-2.84-.93.04-2.05.62-2.7 1.39-.58.67-1.08 1.76-.95 2.82 1.04.08 2.06-.59 2.69-1.37z"/>
                  </svg>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[9px] text-slate-300">Download on the</span>
                    <span className="text-sm font-bold text-white tracking-tight mt-0.5">App Store</span>
                  </div>
                </a>
              )}

              {/* Partner Login Button */}
              <button
                type="button"
                onClick={onPartnerLogin}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border-2 border-[#008C80] bg-white text-[#008C80] hover:bg-[#008C80] hover:text-white font-bold text-xs sm:text-sm shadow-2xs hover:shadow-sm transition-all active:scale-98 cursor-pointer h-[40px] sm:h-[44px]"
              >
                <LogIn className="w-4 h-4" />
                <span>Partner Login</span>
              </button>
            </div>

            {/* 5. APP STATS ROW */}
            <div className="flex items-center gap-4 sm:gap-8 pt-1.5 border-t border-slate-100">
              <div>
                <div className="flex items-center gap-1 text-xl sm:text-2xl lg:text-3xl font-black text-[#008C80] leading-none mb-0.5">
                  <span>4.8</span>
                  <Star className="w-4 h-4 fill-[#008C80] text-[#008C80]" />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-[#667085]">Google Rating</span>
              </div>

              <div className="h-7 sm:h-8 w-px bg-slate-200" />

              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#008C80] leading-none mb-0.5">
                  5K+
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-[#667085]">Downloads</span>
              </div>

              <div className="h-7 sm:h-8 w-px bg-slate-200" />

              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#008C80] leading-none mb-0.5">
                  1K+
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-[#667085]">Reviews</span>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: 3D PARTNER PHONE MOCKUP WITH 4 CALLOUT CARDS*/}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-5 relative flex items-center justify-center pt-2 pb-4 sm:pt-4 sm:pb-6 lg:py-2">
            
            {/* SVG Connector Lines (Desktop Only) */}
            <div className="hidden xl:block absolute inset-0 pointer-events-none z-10" aria-hidden="true">
              <svg className="w-full h-full" viewBox="0 0 540 600" fill="none">
                {/* Line to Top-Left: Get More Service Requests */}
                <path d="M120 170 C 140 210, 160 215, 195 218" stroke="#008C80" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7"/>
                <circle cx="120" cy="170" r="3.5" fill="#008C80"/>
                <circle cx="195" cy="218" r="3" fill="#008C80"/>

                {/* Line to Bottom-Left: Grow Your Earnings */}
                <path d="M130 380 C 150 350, 170 350, 195 365" stroke="#008C80" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7"/>
                <circle cx="130" cy="380" r="3.5" fill="#008C80"/>
                <circle cx="195" cy="365" r="3" fill="#008C80"/>

                {/* Line to Top-Right: Secure & Reliable */}
                <path d="M420 180 C 390 200, 365 190, 345 160" stroke="#008C80" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7"/>
                <circle cx="420" cy="180" r="3.5" fill="#008C80"/>
                <circle cx="345" cy="160" r="3" fill="#008C80"/>

                {/* Line to Bottom-Right: Flexible Work Schedule */}
                <path d="M420 370 C 390 350, 365 375, 345 400" stroke="#008C80" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7"/>
                <circle cx="420" cy="370" r="3.5" fill="#008C80"/>
                <circle cx="345" cy="400" r="3" fill="#008C80"/>
              </svg>
            </div>

            {/* CALLOUT CARD 1: TOP-LEFT (Get More Service Requests) */}
            <div className="hidden xl:flex app-callout-card absolute -left-12 top-16 z-20 bg-white border border-[#BCE3DE]/60 rounded-2xl p-3.5 shadow-[0_8px_24px_-4px_rgba(0,140,128,0.12)] items-center gap-3 w-56">
              <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-[#008C80]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#101828]">Get More Service Requests</h4>
                <p className="text-[11px] text-[#667085] leading-tight mt-0.5">Reach new customers in your area.</p>
              </div>
            </div>

            {/* CALLOUT CARD 2: BOTTOM-LEFT (Grow Your Earnings) */}
            <div className="hidden xl:flex app-callout-card absolute -left-10 top-72 z-20 bg-white border border-[#BCE3DE]/60 rounded-2xl p-3.5 shadow-[0_8px_24px_-4px_rgba(0,140,128,0.12)] items-center gap-3 w-52">
              <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-[#008C80]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#101828]">Grow Your Earnings</h4>
                <p className="text-[11px] text-[#667085] leading-tight mt-0.5">More jobs, more income.</p>
              </div>
            </div>

            {/* CALLOUT CARD 3: TOP-RIGHT (Secure & Reliable) */}
            <div className="hidden xl:flex app-callout-card absolute -right-12 top-20 z-20 bg-white border border-[#BCE3DE]/60 rounded-2xl p-3.5 shadow-[0_8px_24px_-4px_rgba(0,140,128,0.12)] items-center gap-3 w-52">
              <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#008C80]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#101828]">Secure &amp; Reliable</h4>
                <p className="text-[11px] text-[#667085] leading-tight mt-0.5">Your data and payments are safe.</p>
              </div>
            </div>

            {/* CALLOUT CARD 4: BOTTOM-RIGHT (Flexible Work Schedule) */}
            <div className="hidden xl:flex app-callout-card absolute -right-10 top-76 z-20 bg-white border border-[#BCE3DE]/60 rounded-2xl p-3.5 shadow-[0_8px_24px_-4px_rgba(0,140,128,0.12)] items-center gap-3 w-56">
              <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#008C80]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#101828]">Flexible Work Schedule</h4>
                <p className="text-[11px] text-[#667085] leading-tight mt-0.5">Manage your time your way.</p>
              </div>
            </div>

            {/* THE SMARTPHONE WITH PEDESTAL */}
            <div className="relative flex flex-col items-center">
              
              {/* Smartphone Frame (iPhone 16 Pro styling) */}
              <div className="relative z-10 w-[260px] xs:w-[275px] sm:w-[290px] h-[525px] xs:h-[555px] sm:h-[585px] bg-[#101828] rounded-[44px] p-2 sm:p-2.5 shadow-[0_20px_50px_-15px_rgba(0,140,128,0.25),0_10px_25px_-10px_rgba(16,24,40,0.35)] border-[3px] border-[#344054]">
                
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

                  {/* Scrollable App Body Content (Partner App UI) */}
                  <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-3 no-scrollbar">
                    
                    {/* Hero Partner Promotional Banner */}
                    <div className="relative rounded-2xl bg-gradient-to-r from-[#DEF2EF] via-[#E9F8F6] to-[#CDEAE5] p-2.5 border border-[#BCE3DE] overflow-hidden flex items-center justify-between shadow-2xs">
                      <div className="max-w-[62%] z-10">
                        <h4 className="text-[11px] font-black text-[#0A2540] leading-tight">
                          More Bookings.
                          <br />
                          More Earnings.
                          <br />
                          Grow with Doorstep Hub.
                        </h4>
                        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-[#008C80] text-white text-[8px] font-bold shadow-2xs">
                          Get Service Requests
                        </div>
                      </div>
                      <div className="relative w-16 h-20 shrink-0">
                        <Image
                          src="/Bharath.png"
                          alt="Partner Technician"
                          fill
                          sizes="64px"
                          className="object-contain object-bottom"
                        />
                      </div>
                    </div>

                    {/* Manage Your Business Header */}
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-xs font-black text-[#101828]">Manage Your Business</span>
                      <button type="button" className="text-[#008C80] p-0.5 rounded-full hover:bg-slate-100" aria-label="Refresh">
                        <RotateCw className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 4 Partner Action Tiles in 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* 1. New Requests */}
                      <div className="bg-white rounded-xl p-2.5 border border-slate-100 flex flex-col items-center text-center shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-[#DEF2EF] flex items-center justify-center mb-1 text-[#008C80]">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 leading-tight">New Requests</span>
                      </div>

                      {/* 2. My Bookings */}
                      <div className="bg-white rounded-xl p-2.5 border border-slate-100 flex flex-col items-center text-center shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-[#DEF2EF] flex items-center justify-center mb-1 text-[#008C80]">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 leading-tight">My Bookings</span>
                      </div>

                      {/* 3. Earnings */}
                      <div className="bg-white rounded-xl p-2.5 border border-slate-100 flex flex-col items-center text-center shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-[#DEF2EF] flex items-center justify-center mb-1 text-[#008C80]">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 leading-tight">Earnings</span>
                      </div>

                      {/* 4. Profile */}
                      <div className="bg-white rounded-xl p-2.5 border border-slate-100 flex flex-col items-center text-center shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-[#DEF2EF] flex items-center justify-center mb-1 text-[#008C80]">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 leading-tight">Profile</span>
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
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-[8px] font-medium mt-0.5">Earnings</span>
                    </div>
                    <div className="flex flex-col items-center text-slate-400">
                      <User className="w-4 h-4" />
                      <span className="text-[8px] font-medium mt-0.5">Profile</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* 3D MINT PEDESTAL & POTTED PLANT AT THE BASE */}
              <div className="relative -mt-9 sm:-mt-11 w-[310px] xs:w-[350px] sm:w-[390px] max-w-full h-24 pointer-events-none select-none flex items-center justify-center" aria-hidden="true">
                {/* Potted Plant emerging on the left of pedestal */}
                <div className="absolute -left-2 sm:-left-3 bottom-5 w-20 sm:w-24 h-24 sm:h-28 z-20">
                  <svg viewBox="0 0 100 120" fill="none" className="w-full h-full drop-shadow-md">
                    {/* Plant Pot */}
                    <path d="M35 85 L65 85 L60 112 L40 112 Z" fill="#F8FAFC" stroke="#BCE3DE" strokeWidth="2"/>
                    <ellipse cx="50" cy="85" rx="15" ry="3" fill="#E2E8F0"/>
                    
                    {/* Lush Green Leaves */}
                    <path d="M50 85 C 40 60, 20 50, 10 30 C 30 40, 45 60, 50 85 Z" fill="#2E7D32" opacity="0.9"/>
                    <path d="M50 85 C 45 55, 30 40, 25 15 C 42 32, 52 58, 50 85 Z" fill="#4CAF50"/>
                    <path d="M50 85 C 50 50, 52 35, 50 5 C 60 28, 62 55, 50 85 Z" fill="#66BB6A"/>
                    <path d="M50 85 C 55 55, 70 40, 75 15 C 58 32, 48 58, 50 85 Z" fill="#4CAF50"/>
                    <path d="M50 85 C 60 60, 80 50, 90 30 C 70 40, 55 60, 50 85 Z" fill="#2E7D32" opacity="0.9"/>
                  </svg>
                </div>

                {/* Pedestal Top Ellipse Platform */}
                <div className="absolute bottom-2 w-full h-14 rounded-[100%] bg-gradient-to-b from-[#BEE5DF] via-[#9FD7CD] to-[#7BC5B8] shadow-[0_12px_24px_-4px_rgba(0,140,128,0.22)] border-t border-white/60" />
                <div className="absolute bottom-3.5 w-[92%] h-10 rounded-[100%] bg-gradient-to-b from-[#DDF2EE] to-[#BEE5DF] opacity-90" />
              </div>

            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* MOBILE & TABLET ONLY: 4 CALLOUT CARDS IN 2x2 GRID         */}
        {/* (Rendered cleanly below on screens < 1280px)              */}
        {/* ========================================================= */}
        <div className="xl:hidden mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="app-callout-card bg-white border border-[#BCE3DE]/60 rounded-xl p-3 sm:p-3.5 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-[#008C80]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#101828]">Get More Service Requests</h4>
              <p className="text-[11px] text-[#667085] mt-0.5 leading-snug">Reach new customers in your area.</p>
            </div>
          </div>

          <div className="app-callout-card bg-white border border-[#BCE3DE]/60 rounded-xl p-3 sm:p-3.5 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-[#008C80]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#101828]">Grow Your Earnings</h4>
              <p className="text-[11px] text-[#667085] mt-0.5 leading-snug">More jobs, more income.</p>
            </div>
          </div>

          <div className="app-callout-card bg-white border border-[#BCE3DE]/60 rounded-xl p-3 sm:p-3.5 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#008C80]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#101828]">Secure &amp; Reliable</h4>
              <p className="text-[11px] text-[#667085] mt-0.5 leading-snug">Your data and payments are safe.</p>
            </div>
          </div>

          <div className="app-callout-card bg-white border border-[#BCE3DE]/60 rounded-xl p-3 sm:p-3.5 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#DEF2EF] border border-[#BCE3DE] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-[#008C80]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#101828]">Flexible Work Schedule</h4>
              <p className="text-[11px] text-[#667085] mt-0.5 leading-snug">Manage your time your way.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
