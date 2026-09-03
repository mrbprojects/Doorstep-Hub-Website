'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { SellBuyHowItWorks } from '@/components/sell-buy/SellBuyHowItWorks';
import { ListingCard, ListingGridSkeleton } from '@/components/sell-buy/cards/ListingCard';
import { fetchSellBuyListings } from '@/lib/sellBuyApi';
import { Grid, ChevronRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import { AdSenseUnit } from '@/components/sell-buy/ads/AdSenseUnit';
import { ADSENSE_CONFIG } from '@/config/adsense';

export default function CategoryClient({ slug }) {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState(slug.replace(/-/g, ' '));

  useEffect(() => {
    async function loadCategory() {
      setIsLoading(true);
      try {
        const res = await fetchSellBuyListings({ category_slug: slug });
        if (res && res.listings) {
          setListings(res.listings);
        }
      } catch (err) {
        console.error('Error fetching category listings:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategory();
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Page Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <Link href="/sell-buy" className="hover:text-[#037166]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/sell-buy/categories" className="hover:text-[#037166]">Categories</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-bold capitalize">{categoryName}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#0f172a] flex items-center gap-3 capitalize">
            <Grid className="w-8 h-8 text-[#037166]" />
            <span>{categoryName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isLoading ? (
              <span className="inline-block w-32 h-4 bg-slate-200 animate-pulse rounded" />
            ) : (
              `Found ${listings.length} item${listings.length === 1 ? '' : 's'} in this category`
            )}
          </p>
        </div>

        {/* ── PLACEMENT 1: CATEGORY TOP RESPONSIVE UNIT ── */}
        <AdSenseUnit slotId={ADSENSE_CONFIG.slots.categoryTop} />

        {/* Listings Grid */}
        {isLoading ? (
          <ListingGridSkeleton count={8} />
        ) : listings.length > 0 ? (
          <>
            {/* First Batch of Listings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {listings.slice(0, 8).map((item) => (
                <ListingCard key={item._id} listing={item} />
              ))}
            </div>

            {/* ── PLACEMENT 2: IN-FEED UNIT (Rendered only if >= 6 listings) ── */}
            {listings.length >= 6 && (
              <AdSenseUnit slotId={ADSENSE_CONFIG.slots.categoryFeed} />
            )}

            {/* Remaining Listings */}
            {listings.length > 8 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {listings.slice(8).map((item) => (
                  <ListingCard key={item._id} listing={item} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">No items found</h3>
            <p className="text-xs text-slate-500">
              We couldn&apos;t find any active listings in the <span className="capitalize font-bold">{categoryName}</span> category right now.
            </p>
            <Link
              href="/sell-buy/categories"
              className="inline-block bg-[#037166] text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-[#025951] transition-colors"
            >
              Browse All Categories
            </Link>
          </div>
        )}
      </main>

      {/* How It Works Section */}
      <SellBuyHowItWorks />

      <SellBuyFooter />
    </div>
  );
}
