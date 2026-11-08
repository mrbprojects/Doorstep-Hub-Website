'use client';

import React from 'react';
import { SkeletonBox, SkeletonText, SkeletonCircle } from './SkeletonBase';
import { ListingGridSkeleton } from '@/components/sell-buy/cards/ListingCardSkeleton';

export function SellBuyHomeSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* 1. Header Skeleton */}
      <div className="bg-white border-b border-slate-200/80 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SkeletonBox className="w-32 sm:w-40 h-9 rounded-xl" />
            <SkeletonBox className="hidden md:block w-48 h-9 rounded-xl" />
          </div>
          <div className="flex-1 max-w-lg hidden sm:block">
            <SkeletonBox className="w-full h-10 rounded-xl" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBox className="w-24 h-9 rounded-xl hidden sm:block" />
            <SkeletonBox className="w-32 h-10 rounded-xl" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* 2. Dual Promotional Banner Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <SkeletonBox className="w-full h-44 sm:h-56 lg:h-64 rounded-3xl" />
          <SkeletonBox className="w-full h-44 sm:h-56 lg:h-64 rounded-3xl hidden md:block" />
        </section>

        {/* 3. Popular Categories Skeleton */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkeletonCircle size="w-9 h-9" />
              <div className="space-y-1.5">
                <SkeletonText width="w-36" height="h-5" />
                <SkeletonText width="w-48" height="h-3.5" />
              </div>
            </div>
            <SkeletonBox className="w-20 h-7 rounded-lg" />
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-2 p-2">
                <SkeletonBox className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl" />
                <SkeletonText width="w-14" height="h-3" />
              </div>
            ))}
          </div>
        </section>

        {/* 4. Featured Listings Grid Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SkeletonCircle size="w-8 h-8" />
              <SkeletonText width="w-40" height="h-6" />
            </div>
            <SkeletonBox className="w-20 h-7 rounded-lg" />
          </div>
          <ListingGridSkeleton count={8} />
        </section>

        {/* 5. In-Feed Banner Skeleton */}
        <div className="py-2">
          <SkeletonBox className="w-full h-28 sm:h-36 rounded-2xl" />
        </div>

        {/* 6. Fresh Recommendations Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SkeletonCircle size="w-8 h-8" />
              <SkeletonText width="w-48" height="h-6" />
            </div>
            <SkeletonBox className="w-20 h-7 rounded-lg" />
          </div>
          <ListingGridSkeleton count={8} />
        </section>
      </main>
    </div>
  );
}

export default SellBuyHomeSkeleton;
