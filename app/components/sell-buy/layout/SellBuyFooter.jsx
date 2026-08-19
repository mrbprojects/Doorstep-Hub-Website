'use client';

import React from 'react';
import { Tag, ShieldCheck, Lock, Zap } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export function SellBuyFooter() {
  return (
    <div>
      {/* 4 Feature Pills Row */}
      <div className="border-t border-b border-slate-200 bg-slate-50/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#037166]/10 text-[#037166] flex items-center justify-center flex-shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Free to List</h5>
                <p className="text-[11px] text-slate-500">Post your ads for free</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#037166]/10 text-[#037166] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Local &amp; Trusted</h5>
                <p className="text-[11px] text-slate-500">Verified buyers &amp; sellers</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#037166]/10 text-[#037166] flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Safe Transactions</h5>
                <p className="text-[11px] text-slate-500">Secure chat &amp; connect</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#037166]/10 text-[#037166] flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Quick &amp; Easy</h5>
                <p className="text-[11px] text-slate-500">Sell in just a few steps</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Unified Common Website Footer */}
      <Footer />
    </div>
  );
}

export default SellBuyFooter;
