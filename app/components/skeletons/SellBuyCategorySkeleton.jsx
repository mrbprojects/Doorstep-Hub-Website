'use client';

import React from 'react';
import { SkeletonBox, SkeletonText } from './SkeletonBase';
import { ListingGridSkeleton } from '@/components/sell-buy/cards/ListingCardSkeleton';

export function SellBuyCategorySkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Header Skeleton */}
      <div className="bg-white border-b border-slate-200/80 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <SkeletonBox className="w-36 h-9 rounded-xl" />
          <SkeletonBox className="flex-1 max-w-md h-10 rounded-xl hidden sm:block" />
          <SkeletonBox className="w-28 h-9 rounded-xl" />
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* 2. Breadcrumbs & Header Bar */}
        <div className="border-b border-slate-200 pb-6 space-y-3">
          <div className="flex items-center gap-2">
            <SkeletonBox className="w-12 h-3.5 rounded" />
            <span className="text-slate-300">/</span>
            <SkeletonBox className="w-20 h-3.5 rounded" />
            <span className="text-slate-300">/</span>
            <SkeletonBox className="w-32 h-3.5 rounded" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <SkeletonBox className="w-10 h-10 rounded-xl" />
              <div className="space-y-1.5">
                <SkeletonText width="w-48 sm:w-64" height="h-8" />
                <SkeletonText width="w-28" height="h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <SkeletonBox className="w-32 h-9 rounded-xl" />
              <SkeletonBox className="w-28 h-9 rounded-xl" />
            </div>
          </div>
        </div>

        {/* 3. Top Banner / Ad placeholder */}
        <SkeletonBox className="w-full h-24 sm:h-28 rounded-2xl" />

        {/* 4. Product Listings Grid (8 cards) */}
        <ListingGridSkeleton count={8} />

        {/* 5. Pagination / Load more skeleton */}
        <div className="flex justify-center pt-6 pb-12">
          <SkeletonBox className="w-40 h-11 rounded-2xl" />
        </div>
      </main>
    </div>
  );
}

export default SellBuyCategorySkeleton;
