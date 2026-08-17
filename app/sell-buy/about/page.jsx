'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { ShieldCheck, Tag, Zap, Users, Heart, ChevronRight } from 'lucide-react';

export default function SellBuyAboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/sell-buy" className="hover:text-[#037166]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold">About Sell & Buy D-Hub</span>
        </div>

        {/* Hero About */}
        <div className="bg-gradient-to-r from-[#037166] to-[#02b39a] rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-4">
          <span className="bg-white/20 text-emerald-100 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
            Our Mission & Vision
          </span>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight">
            About Sell & Buy D-Hub
          </h1>
          <p className="text-xs sm:text-base text-emerald-50 max-w-2xl font-medium leading-relaxed">
            Sell & Buy D-Hub is India’s premier local classified marketplace vertical by Doorstep Hub. Our goal is to empower millions of users to buy, sell, and rehome quality items locally with 100% zero fees.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">100% Free Forever</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No listing charges, package fees, or hidden transaction cuts. Posting ads on Sell & Buy D-Hub will always remain free.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Verified Sellers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We verify identity proof documents to ensure trusted connections between local buyers and verified sellers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Fast & Direct Chat</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect directly via instant chat or call to inspect products and finalize deals seamlessly in your local neighborhood.
            </p>
          </div>
        </div>
      </main>

      <SellBuyFooter />
    </div>
  );
}
