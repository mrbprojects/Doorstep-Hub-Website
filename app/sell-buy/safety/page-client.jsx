'use client';

import React from 'react';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { ShieldCheck, AlertTriangle, Lock, Eye, CheckCircle2 } from 'lucide-react';

export default function SafetyCenterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-extrabold uppercase">
            <ShieldCheck className="w-4 h-4" /> Marketplace Trust & Safety
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Safety Center</h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium">
            Learn how to buy and sell securely on Sell & Buy D-Hub with complete peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Never Pay Advance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Do not transfer money via UPI, net banking, or gift cards before inspecting the product in person. Genuine sellers will allow you to examine the item first.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Meet in Public Locations</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Always schedule meetings in well-lit, public local places such as coffee shops, shopping centers, or near metro stations during daylight hours.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Look for Verified Badge</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Prioritize buyers and sellers with the D-Hub Verified Seller badge. Verified sellers have submitted official identity documentation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Protect Personal Info</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Avoid sharing sensitive financial credentials, OTPs, password tokens, or private home addresses in chat conversations.
            </p>
          </div>
        </div>
      </main>

      <SellBuyFooter />
    </div>
  );
}
