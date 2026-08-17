'use client';

import React from 'react';
import Link from 'next/link';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { ShieldCheck, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export default function SellBuyTermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/sell-buy" className="hover:text-[#037166]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold">Marketplace Terms & Conditions</span>
        </div>

        {/* Page Title */}
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-[#037166] text-xs font-extrabold uppercase">
            <FileText className="w-4 h-4" /> Policy & Guidelines
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Sell & Buy D-Hub Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Effective Date: January 1, 2026. Please read these terms carefully before posting or buying items.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#037166]" /> 1. Free Advertisement Policy
            </h2>
            <p>
              Sell & Buy D-Hub is a 100% free classified marketplace. Posting advertisements, contacting sellers, submitting offers, and browsing listings carry zero platform fees, commissions, or mandatory subscription plans.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#037166]" /> 2. User Responsibilities & Verification
            </h2>
            <p>
              Users posting advertisements represent that they own or have the legal authority to sell the listed item. Sellers are encouraged to complete Seller Verification KYC to obtain the Verified Seller badge. Providing false identity documents or listing stolen property will result in immediate marketplace termination and legal escalation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#037166]" /> 3. Prohibited Products & Content
            </h2>
            <p>
              The following products are strictly prohibited on Sell & Buy D-Hub:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 font-medium text-slate-600">
              <li>Illegal substances, narcotics, prescription medicines</li>
              <li>Weapons, firearms, explosives, or hazardous materials</li>
              <li>Stolen goods, counterfeit products, or infringed trademarks</li>
              <li>Adult material, offensive content, or hate speech</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#037166]" /> 4. Transaction Safety Disclaimer
            </h2>
            <p>
              Sell & Buy D-Hub acts solely as a communication platform connecting local buyers and sellers. All negotiations, inspections, and financial payments occur directly between the buyer and seller. Sell & Buy D-Hub does not hold escrow or process marketplace product payments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#037166]" /> 5. Account Moderation & Suspension
            </h2>
            <p>
              Sell & Buy D-Hub reserves the right to review, edit, suspend, or remove any listing or user account violating platform policies without prior notice.
            </p>
          </section>
        </div>
      </main>

      <SellBuyFooter />
    </div>
  );
}
