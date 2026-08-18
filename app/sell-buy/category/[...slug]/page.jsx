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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    const params = {
      category_slug: slug,
      sort_by: sort,
      limit: 12,
      page: page,
    };
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (selectedCondition !== 'all') params.condition = selectedCondition;

    fetchSellBuyListings(params)
      .then((res) => {
        setListings(res.listings || []);
        setTotal(res.meta?.total || res.listings?.length || 0);
        setTotalPages(res.meta?.totalPages || 1);
      })
      .catch(() => setListings([]))
      .finally(() => setIsLoading(false));
  }, [slug, sort, minPrice, maxPrice, selectedCondition, page]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/sell-buy" className="hover:text-[#037166]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/sell-buy/categories" className="hover:text-[#037166]">Categories</Link>
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
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#037166]"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#037166] text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#037166] text-white' : 'text-slate-500 hover:text-slate-800'}`}
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
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#037166]" /> Filters
                </span>
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); setSelectedCondition('all'); setPage(1); }} className="text-xs text-[#037166] font-bold hover:text-[#025951] hover:underline transition-colors">
                  Reset All
                </button>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">Price Range (₹)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#037166]/30 focus:border-[#037166] transition-all"
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#037166]/30 focus:border-[#037166] transition-all"
                  />
                </div>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">Item Condition</label>
                <div className="space-y-3 text-sm font-semibold text-slate-600">
                  {['all', 'new', 'like_new', 'good', 'used'].map((cond) => (
                    <label key={cond} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="condition"
                          checked={selectedCondition === cond}
                          onChange={() => { setSelectedCondition(cond); setPage(1); }}
                          className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-[#037166] transition-all cursor-pointer hover:border-[#037166]/50"
                        />
                        <div className="absolute w-2.5 h-2.5 bg-[#037166] rounded-full scale-0 peer-checked:scale-100 transition-transform pointer-events-none"></div>
                      </div>
                      <span className="capitalize group-hover:text-slate-900 transition-colors">{cond.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Listings Container */}
          <div className="lg:col-span-9 flex flex-col min-h-[500px]">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20">
                <div className="w-10 h-10 border-4 border-[#037166]/20 border-t-[#037166] rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold tracking-wide">Fetching listings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="flex-1 bg-white rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <Grid className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No listings found in this category</h3>
                <p className="text-sm text-slate-500 max-w-md">Try adjusting your filters or search criteria, or browse a different category to find what you're looking for.</p>
                <button
                  onClick={() => { setMinPrice(''); setMaxPrice(''); setSelectedCondition('all'); }}
                  className="mt-6 px-6 py-2.5 bg-[#037166]/10 text-[#037166] hover:bg-[#037166] hover:text-white rounded-xl font-bold transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {listings.map((item, idx) => (
                    <ListingCard key={String(item._id || item.id || idx)} listing={item} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#037166] hover:border-[#037166]/30 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const pageNum = i + 1;
                        // Show first, last, current, and adjacent pages
                        if (
                          pageNum === 1 || 
                          pageNum === totalPages || 
                          (pageNum >= page - 1 && pageNum <= page + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                                page === pageNum 
                                  ? 'bg-[#037166] text-white shadow-md shadow-[#037166]/20 border border-[#037166]' 
                                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#037166]/30 hover:text-[#037166] shadow-sm'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        
                        // Show ellipsis
                        if (
                          pageNum === page - 2 ||
                          pageNum === page + 2
                        ) {
                          return <span key={pageNum} className="w-8 text-center text-slate-400 font-bold">...</span>;
                        }
                        
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#037166] hover:border-[#037166]/30 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <SellBuyFooter />
    </div>
  );
}
