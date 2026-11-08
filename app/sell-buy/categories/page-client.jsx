'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { fetchSellBuyCategories, getImageUrl } from '@/lib/sellBuyApi';
import { ChevronRight, Loader2, Grip } from 'lucide-react';
import { SubcategoryIcon } from '@/components/sell-buy/SubcategoryIcon';

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCats() {
      setIsLoading(true);
      try {
        const data = await fetchSellBuyCategories();
        if (data && data.length > 0) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Page Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <Link href="/sell-buy" className="hover:text-[#037166]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-bold">All Categories</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f172a]">
            Browse Marketplace Categories & Subcategories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore items by category or list your items under the right category for free
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm font-medium">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-medium">
            No categories found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const catKey = String(cat.id || cat._id || cat.slug);
              const catSlug = cat.slug || String(cat.id || cat._id);
              const subcats = cat.subcategories || [];

              return (
                <div key={catKey} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#037166]/30 transition-all flex flex-col h-full group/card">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#037166]/10 text-[#037166] flex items-center justify-center shrink-0">
                      {cat.image ? (
                        <Image src={getImageUrl(cat.image)} alt={cat.name} className="w-8 h-8 object-contain"  width={32} height={32} />
                      ) : (
                        <SubcategoryIcon icon={cat.icon} name={cat.name} className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <Link href={`/sell-buy/${catSlug}`} className="text-[15px] font-bold text-slate-900 hover:text-[#037166] transition-colors leading-tight line-clamp-2">
                        {cat.name}
                      </Link>
                      <p className="text-[10px] text-[#037166] font-bold mt-1 uppercase tracking-wider">
                        {subcats.length} SUBCATEGORIES
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    {subcats.slice(0, 6).map((sub) => {
                      const subKey = String(sub.id || sub._id || sub.slug);
                      const subSlug = sub.slug || String(sub.id || sub._id);
                      return (
                        <Link
                          key={subKey}
                          href={`/sell-buy/${catSlug}/${subSlug}`}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-transparent hover:bg-[#037166]/5 text-slate-500 hover:text-[#037166] transition-all group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <SubcategoryIcon icon={sub.icon} name={sub.name} className="w-4 h-4 text-slate-400 group-hover:text-[#037166] flex-shrink-0 transition-colors" />
                            <span className="text-[13px] font-semibold truncate group-hover:font-bold">{sub.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#037166] transition-all shrink-0 ml-2" />
                        </Link>
                      );
                    })}
                    
                    {subcats.length > 6 && (
                      <Link
                        href={`/sell-buy/${catSlug}`}
                        className="text-[12px] font-bold text-[#037166] hover:text-[#025951] mt-2 py-2.5 px-3 bg-[#037166]/5 hover:bg-[#037166]/10 rounded-xl transition-colors flex items-center justify-center gap-1"
                      >
                        <Grip className="w-3.5 h-3.5" />
                        View all {subcats.length} subcategories
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Features Banner */}
        <div className="mt-12 bg-gradient-to-r from-[#f0f9f8] to-[#e6f7f5] rounded-3xl p-6 lg:p-8 flex items-center justify-between flex-wrap gap-6 border border-[#037166]/10">
          <div className="flex items-center gap-4 min-w-[200px]">
            <div className="w-12 h-12 rounded-full bg-white text-[#037166] shadow-sm flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Free to List</h4>
              <p className="text-xs text-slate-500 font-medium">Post your ads for free</p>
            </div>
          </div>
          <div className="flex items-center gap-4 min-w-[200px]">
            <div className="w-12 h-12 rounded-full bg-white text-[#037166] shadow-sm flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Local & Trusted</h4>
              <p className="text-xs text-slate-500 font-medium">Verified buyers & sellers</p>
            </div>
          </div>
          <div className="flex items-center gap-4 min-w-[200px]">
            <div className="w-12 h-12 rounded-full bg-white text-[#037166] shadow-sm flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Safe Transactions</h4>
              <p className="text-xs text-slate-500 font-medium">Secure chat & connect</p>
            </div>
          </div>
          <div className="flex items-center gap-4 min-w-[200px]">
            <div className="w-12 h-12 rounded-full bg-white text-[#037166] shadow-sm flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Quick & Easy</h4>
              <p className="text-xs text-slate-500 font-medium">Sell in just a few steps</p>
            </div>
          </div>
        </div>
      </main>

      <SellBuyFooter />
    </div>
  );
}
