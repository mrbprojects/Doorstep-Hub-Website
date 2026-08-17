'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { ListingCard } from '@/components/sell-buy/cards/ListingCard';
import { fetchSellBuyListings } from '@/lib/sellBuyApi';
import { Filter, SlidersHorizontal, Grid, List, ChevronRight } from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const slugParts = params?.slug ? (Array.isArray(params.slug) ? params.slug : [params.slug]) : ['all'];
  const slug = slugParts[0]; // first segment = category slug
  const categoryName = slug.replace(/-/g, ' ').toUpperCase();

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    const params = {
      category_slug: slug,
      sort_by: sort,
      limit: 20,
    };
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (selectedCondition !== 'all') params.condition = selectedCondition;

    fetchSellBuyListings(params)
      .then((res) => {
        setListings(res.listings || []);
        setTotal(res.meta?.total || res.listings?.length || 0);
      })
      .catch(() => setListings([]))
      .finally(() => setIsLoading(false));
  }, [slug, sort, minPrice, maxPrice, selectedCondition]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/sell-buy" className="hover:text-[#00b2ca]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/sell-buy/categories" className="hover:text-[#00b2ca]">Categories</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 capitalize font-bold">{slug.replace('-', ' ')}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] capitalize">
              {categoryName} Listings
            </h1>
            <p className="text-xs text-slate-500 mt-1">Browse verified products and ads in this category</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00b2ca]"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#00b2ca] text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#00b2ca] text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filter Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#00b2ca]" /> Filters
                </span>
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); setSelectedCondition('all'); }} className="text-[11px] text-[#00b2ca] font-bold hover:underline">
                  Reset All
                </button>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Price Range (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-800"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Item Condition</label>
                <div className="space-y-2 text-xs font-medium text-slate-600">
                  {['all', 'new', 'like_new', 'good', 'used'].map((cond) => (
                    <label key={cond} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                      <input
                        type="radio"
                        name="condition"
                        checked={selectedCondition === cond}
                        onChange={() => setSelectedCondition(cond)}
                        className="text-[#00b2ca] focus:ring-[#00b2ca]"
                      />
                      <span className="capitalize">{cond.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Listings Container */}
          <div className="lg:col-span-9">
            {isLoading ? (
              <div className="text-center py-20 text-slate-500 font-semibold text-sm">Loading listings...</div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <p className="text-sm font-bold text-slate-700">No listings found in this category.</p>
                <p className="text-xs text-slate-500 mt-1">Try a different category or check back later.</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {listings.map((item, idx) => (
                  <ListingCard key={String(item._id || item.id || idx)} listing={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <SellBuyFooter />
    </div>
  );
}
