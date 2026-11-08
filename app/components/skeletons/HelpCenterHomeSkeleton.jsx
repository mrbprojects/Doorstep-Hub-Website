'use client';

import React from 'react';
import { SkeletonBox, SkeletonText, SkeletonCircle, SkeletonBadge } from './SkeletonBase';

export function HelpCenterHomeSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/60 font-sans">
      {/* 1. Header */}
      <div className="bg-white border-b border-gray-100 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <SkeletonBox className="w-36 h-9 rounded-xl" />
          <div className="flex items-center gap-3">
            <SkeletonBox className="w-24 h-9 rounded-xl hidden sm:block" />
            <SkeletonCircle size="w-9 h-9" />
          </div>
        </div>
      </div>

      {/* 2. Hero Search Banner */}
      <section className="bg-gradient-to-b from-[#037166]/10 via-slate-50 to-slate-50 pt-12 pb-14 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <SkeletonBadge width="w-28 mx-auto" height="h-7" />
          <SkeletonText width="w-4/5 mx-auto" height="h-9 sm:h-11" />
          <SkeletonText width="w-3/5 mx-auto" height="h-4 sm:h-5" />

          {/* Search Bar Skeleton */}
          <div className="pt-4 max-w-2xl mx-auto">
            <SkeletonBox className="w-full h-14 rounded-2xl shadow-sm" />
          </div>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonBox key={i} className="w-24 h-7 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Help Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <SkeletonText width="w-48 mx-auto" height="h-7" />
          <SkeletonText width="w-72 mx-auto" height="h-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-gray-200/80 p-6 space-y-4 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <SkeletonCircle size="w-12 h-12" />
                  <SkeletonBadge width="w-16" height="h-6" />
                </div>
                <SkeletonText width="w-3/4" height="h-6" />
                <SkeletonText width="w-full" height="h-3.5" />
                <SkeletonText width="w-4/5" height="h-3.5" />
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <SkeletonText width="w-24" height="h-4" />
                <SkeletonCircle size="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Popular FAQs Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <SkeletonText width="w-44 mx-auto" height="h-7" className="mb-6" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <SkeletonText width="w-4/5" height="h-5" />
              <SkeletonCircle size="w-5 h-5" />
            </div>
          </div>
        ))}
      </section>

      {/* 5. Contact Support Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-8 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-6">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <SkeletonText width="w-48 mx-auto" height="h-6" />
            <SkeletonText width="w-64 mx-auto" height="h-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-gray-100 flex items-center gap-4">
                <SkeletonCircle size="w-12 h-12" />
                <div className="space-y-1.5 flex-1">
                  <SkeletonText width="w-24" height="h-4" />
                  <SkeletonText width="w-32" height="h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HelpCenterHomeSkeleton;
