'use client';

import React from 'react';
import { SkeletonBox, SkeletonText, SkeletonCircle, SkeletonBadge } from './SkeletonBase';
import { ListingGridSkeleton } from '@/components/sell-buy/cards/ListingCardSkeleton';

export function SellBuyAdDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Header */}
      <div className="bg-white border-b border-slate-200/80 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <SkeletonBox className="w-36 h-9 rounded-xl" />
          <SkeletonBox className="flex-1 max-w-md h-10 rounded-xl hidden sm:block" />
          <SkeletonBox className="w-28 h-9 rounded-xl" />
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* 2. Breadcrumbs */}
        <div className="flex items-center gap-2">
          <SkeletonBox className="w-12 h-3.5 rounded" />
          <span className="text-slate-300">/</span>
          <SkeletonBox className="w-16 h-3.5 rounded" />
          <span className="text-slate-300">/</span>
          <SkeletonBox className="w-24 h-3.5 rounded" />
          <span className="text-slate-300">/</span>
          <SkeletonBox className="w-36 h-3.5 rounded" />
        </div>

        {/* 3. Main Split Content (65% Gallery & Details + 35% Sticky Price/Seller) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Gallery + Description + Specifications */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Gallery Image Box */}
            <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden p-4 space-y-3 shadow-xs">
              <SkeletonBox className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl" />
              {/* Thumbnails strip */}
              <div className="flex gap-2.5 overflow-x-hidden pt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonBox key={i} className="w-20 h-20 rounded-xl shrink-0" />
                ))}
              </div>
            </div>

            {/* Specifications Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-xs">
              <SkeletonText width="w-36" height="h-6" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <SkeletonText width="w-16" height="h-3" />
                    <SkeletonText width="w-24" height="h-4" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3.5 shadow-xs">
              <SkeletonText width="w-40" height="h-6" />
              <div className="space-y-2 pt-1">
                <SkeletonText width="w-full" height="h-4" />
                <SkeletonText width="w-11/12" height="h-4" />
                <SkeletonText width="w-4/5" height="h-4" />
                <SkeletonText width="w-3/5" height="h-4" />
              </div>
            </div>

            {/* Safety Tips Banner */}
            <div className="p-5 rounded-3xl bg-amber-50/60 border border-amber-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <SkeletonCircle size="w-6 h-6" />
                <SkeletonText width="w-36" height="h-4" />
              </div>
              <SkeletonText width="w-4/5" height="h-3" />
            </div>
          </div>

          {/* Right Column (4 cols): Sticky Price Card + Seller Details + Actions */}
          <div className="lg:col-span-4 space-y-5 sticky top-20">
            
            {/* Price & Title Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <SkeletonText width="w-36" height="h-8" />
                <div className="flex gap-2">
                  <SkeletonCircle size="w-9 h-9" />
                  <SkeletonCircle size="w-9 h-9" />
                </div>
              </div>
              <SkeletonText width="w-4/5" height="h-5" />
              <div className="flex items-center gap-2 pt-1">
                <SkeletonCircle size="w-4 h-4" />
                <SkeletonText width="w-32" height="h-3.5" />
              </div>
            </div>

            {/* Seller Information Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-xs">
              <SkeletonText width="w-28" height="h-4" />
              <div className="flex items-center gap-3.5 pt-1">
                <SkeletonCircle size="w-14 h-14" />
                <div className="space-y-1.5 flex-1">
                  <SkeletonText width="w-32" height="h-5" />
                  <SkeletonBadge width="w-20" height="h-4" />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <SkeletonText width="w-24" height="h-3" />
                <SkeletonText width="w-20" height="h-3" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <SkeletonBox className="w-full h-12 rounded-2xl" />
              <SkeletonBox className="w-full h-12 rounded-2xl" />
              <SkeletonBox className="w-full h-12 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* 4. Similar Listings Section */}
        <section className="pt-8 space-y-5 border-t border-slate-200">
          <SkeletonText width="w-48" height="h-6" />
          <ListingGridSkeleton count={4} />
        </section>
      </main>
    </div>
  );
}

export default SellBuyAdDetailSkeleton;
