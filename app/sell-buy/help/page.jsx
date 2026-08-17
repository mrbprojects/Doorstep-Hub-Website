'use client';

import React from 'react';
import Link from 'next/link';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { HelpCircle, PlusCircle, ShieldCheck, Tag } from 'lucide-react';

export default function HelpPage() {
  const FAQS = [
    {
      q: 'Is posting an advertisement really 100% free?',
      a: 'Yes! Sell & Buy D-Hub is 100% free for all sellers and buyers. There are zero subscription packages, posting fees, or listing limits.',
    },
    {
      q: 'How long does my listing stay active?',
      a: 'Active listings remain published for 60 days. You can edit, renew, or mark your listing as sold anytime from your dashboard.',
    },
    {
      q: 'How do I get the Verified Seller Badge?',
      a: 'Go to your Marketplace Dashboard -> Seller Verification KYC, and upload your official ID proof. Once admin approves it, your badge will be displayed on all your listings.',
    },
    {
      q: 'What items are prohibited on Sell & Buy D-Hub?',
      a: 'Prohibited items include illegal substances, weapons, counterfeit products, endangered species, adult content, and fraudulent services.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold uppercase">
            <HelpCircle className="w-4 h-4" /> Help Center & Posting Guide
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Frequently Asked Questions</h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Everything you need to know about buying, selling, and managing ads on Sell & Buy D-Hub.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-base font-bold text-slate-900">{faq.q}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#037166] text-white p-8 rounded-3xl text-center space-y-4 shadow-xl">
          <h2 className="text-xl font-black">Ready to post your first listing?</h2>
          <p className="text-xs text-emerald-100 max-w-md mx-auto">
            Turn your pre-owned items into cash right now with zero fees.
          </p>
          <Link
            href="/sell-buy/post-ad"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>POST FREE AD NOW</span>
          </Link>
        </div>
      </main>

      <SellBuyFooter />
    </div>
  );
}
