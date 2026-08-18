'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { FileText, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { fetchSellBuyPolicies } from '@/lib/sellBuyApi';

export default function SellBuyTermsPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchSellBuyPolicies().then((policy) => {
      if (policy?.termsAndConditions?.paragraph) {
        setContent(policy.termsAndConditions.paragraph);
        if (policy.termsAndConditions.lastUpdated) {
          setLastUpdated(new Date(policy.termsAndConditions.lastUpdated));
        }
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/sell-buy" className="hover:text-[#037166]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold">Terms &amp; Conditions</span>
        </div>

        {/* Page Title */}
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-[#037166] text-xs font-extrabold uppercase">
            <FileText className="w-4 h-4" /> Policy &amp; Guidelines
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Sell &amp; Buy D-Hub — Terms &amp; Conditions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {lastUpdated
              ? `Last updated: ${lastUpdated.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
              : 'Please read these terms carefully before posting or buying items.'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
              <span className="text-sm font-medium">Loading Terms &amp; Conditions…</span>
            </div>
          ) : content ? (
            <div
              className="prose prose-sm sm:prose max-w-none text-slate-700 leading-relaxed
                prose-headings:font-black prose-headings:text-slate-900
                prose-a:text-[#037166] prose-a:font-semibold
                prose-strong:text-slate-800 prose-li:marker:text-[#037166]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <AlertCircle className="w-8 h-8 text-amber-400" />
              <p className="text-sm font-semibold text-slate-600">Terms &amp; Conditions not yet configured.</p>
              <p className="text-xs text-slate-400">Please check back soon or contact support.</p>
            </div>
          )}
        </div>
      </main>

      <SellBuyFooter />
    </div>
  );
}
