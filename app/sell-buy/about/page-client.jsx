'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { ChevronRight, Loader2 } from 'lucide-react';
import { fetchSystemSettings } from '@/lib/sellBuyApi';

export default function SellBuyAboutPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/sell-buy" className="hover:text-[#037166]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold">About Us</span>
        </div>

        {/* Hero About */}
        <div className="bg-gradient-to-r from-[#037166] to-[#02b39a] rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-4">
          <span className="bg-white/20 text-emerald-100 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
            Our Mission & Vision
          </span>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight">
            About Sell & Buy
          </h1>
          <p className="text-xs sm:text-base text-emerald-50 max-w-2xl font-medium leading-relaxed">
            Welcome to D-Hub&apos;s local classified marketplace. Discover our story and what drives us to provide a 100% free and trusted platform for you.
          </p>
        </div>

        {/* Dynamic Content */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm font-medium">Loading content...</p>
            </div>
          ) : settings?.about_us ? (
            <div 
              className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700
                         prose-headings:font-bold prose-headings:text-slate-900 
                         prose-a:text-[#037166] hover:prose-a:text-[#025951]
                         prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: settings.about_us }} 
            />
          ) : (
            <div className="text-center text-slate-500 py-10 font-medium">
              Information not available at the moment.
            </div>
          )}
        </div>
      </main>

      <SellBuyFooter />
    </div>
  );
}
