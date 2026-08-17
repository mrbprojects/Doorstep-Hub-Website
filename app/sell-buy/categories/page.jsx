'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { fetchSellBuyCategories, getImageUrl } from '@/lib/sellBuyApi';
import {
  Smartphone,
  Car,
  Home,
  Tv,
  Armchair,
  Shirt,
  BookOpen,
  Briefcase,
  Wrench,
  ChevronRight,
  Grid,
  Tag
} from 'lucide-react';

const ICON_MAP = {
  Smartphone: Smartphone,
  Car: Car,
  Home: Home,
  Tv: Tv,
  Armchair: Armchair,
  Shirt: Shirt,
  BookOpen: BookOpen,
  Briefcase: Briefcase,
  Wrench: Wrench,
  Tag: Tag,
};

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
            <Link href="/sell-buy" className="hover:text-[#00b2ca]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-bold">All Categories</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#0f172a]">
            Browse Marketplace Categories & Subcategories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore items by category or list your items under the right category for free
          </p>
        </div>

        {/* Categories Tree Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const IconComp = ICON_MAP[cat.icon] || Tag;
            const catKey = String(cat.id || cat._id || cat.slug);
            const catSlug = cat.slug || String(cat.id || cat._id);
            const subcats = cat.subcategories || [];
            return (
              <div key={catKey} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-[#00b2ca] flex items-center justify-center overflow-hidden shrink-0">
                    {cat.image ? (
                      <img src={getImageUrl(cat.image)} alt={cat.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <IconComp className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <Link href={`/sell-buy/category/${catSlug}`} className="text-base font-black text-slate-900 hover:text-[#00b2ca] transition-colors">
                      {cat.name}
                    </Link>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {subcats.length} Subcategories
                    </p>
                  </div>
                </div>

                {/* Subcategories list */}
                <div className="space-y-1.5 text-xs font-medium text-slate-600 pl-1">
                  {subcats.map((sub) => {
                    const subKey = String(sub.id || sub._id || sub.slug);
                    const subSlug = sub.slug || String(sub.id || sub._id);
                    return (
                      <Link
                        key={subKey}
                        href={`/sell-buy/category/${catSlug}/${subSlug}`}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-cyan-50/50 hover:text-[#00b2ca] transition-all group"
                      >
                        <span className="font-semibold">{sub.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#00b2ca] group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <SellBuyFooter />
    </div>
  );
}
