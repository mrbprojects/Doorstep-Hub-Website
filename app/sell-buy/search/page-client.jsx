'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { ListingCard } from '@/components/sell-buy/cards/ListingCard';
import { fetchSellBuyListings } from '@/lib/sellBuyApi';
import { Search, ChevronRight, Filter } from 'lucide-react';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('query') || searchParams?.get('search') || '';

  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSearch() {
      setIsLoading(true);
      try {
        const res = await fetchSellBuyListings({ search: query });
        if (res && res.listings) {
          setListings(res.listings);
        }
      } catch (err) {
        console.error('Error fetching search listings:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Page Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <Link href="/sell-buy" className="hover:text-[#037166]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-bold">Search Results</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#0f172a] flex items-center gap-3">
            <Search className="w-8 h-8 text-[#037166]" />
            <span>Search Results for &ldquo;{query}&rdquo;</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Found {listings.length} item{listings.length === 1 ? '' : 's'} matching your search
          </p>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-slate-500 font-semibold">
            Loading search results...
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((item) => (
              <ListingCard key={item._id} listing={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">No items found</h3>
            <p className="text-xs text-slate-500">
              We couldn&apos;t find any items matching &ldquo;{query}&rdquo;. Try searching for something else.
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

      <SellBuyFooter />
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading Search...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
