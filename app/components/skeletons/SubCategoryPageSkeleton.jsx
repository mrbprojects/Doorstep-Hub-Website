'use client';

import React from 'react';
import { SkeletonBox, SkeletonText, SkeletonCircle, SkeletonBadge } from './SkeletonBase';

export function SubCategoryPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header Banner & Location */}
      <div className="bg-slate-50/70 border-b border-gray-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <SkeletonBox className="w-14 h-4 rounded" />
            <span className="text-gray-300">/</span>
            <SkeletonBox className="w-24 h-4 rounded" />
            <span className="text-gray-300">/</span>
            <SkeletonBox className="w-32 h-4 rounded" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="space-y-1">
              <SkeletonText width="w-64 sm:w-80" height="h-7 sm:h-8" />
              <SkeletonText width="w-48" height="h-4" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBox className="w-28 h-9 rounded-xl" />
              <SkeletonBox className="w-28 h-9 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Horizontal Scrolling Filter Chips */}
      <div className="border-b border-gray-100 bg-white sticky top-16 z-20 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto flex items-center gap-2.5 overflow-x-hidden">
          <SkeletonBox className="w-20 h-9 rounded-full shrink-0" />
          <SkeletonBox className="w-28 h-9 rounded-full shrink-0" />
          <SkeletonBox className="w-24 h-9 rounded-full shrink-0" />
          <SkeletonBox className="w-32 h-9 rounded-full shrink-0" />
          <SkeletonBox className="w-28 h-9 rounded-full shrink-0" />
          <SkeletonBox className="w-36 h-9 rounded-full shrink-0 hidden sm:block" />
        </div>
      </div>

      {/* 3. Main Listing Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Switcher Skeleton */}
        <div className="flex items-center gap-3 mb-6">
          <SkeletonBox className="w-40 h-10 rounded-xl" />
          <SkeletonBox className="w-36 h-10 rounded-xl" />
        </div>

        {/* 2-Column Responsive Service Center / Subcategory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-4"
            >
              <div className="flex gap-4">
                {/* Image / Logo Box */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0 overflow-hidden">
                  <SkeletonBox className="w-full h-full rounded-xl" />
                  <SkeletonBadge width="w-14" height="h-4" className="absolute top-1 left-1" />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <SkeletonText width="w-3/5" height="h-5" />
                    <SkeletonBadge width="w-12" height="h-5" />
                  </div>
                  <SkeletonText width="w-4/5" height="h-3.5" />
                  <SkeletonText width="w-2/3" height="h-3.5" />
                  <div className="flex items-center gap-2 pt-1">
                    <SkeletonBox className="w-16 h-5 rounded" />
                    <SkeletonBox className="w-20 h-5 rounded" />
                  </div>
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SkeletonCircle size="w-7 h-7" />
                  <SkeletonText width="w-20" height="h-3.5" />
                </div>
                <div className="flex items-center gap-2">
                  <SkeletonBox className="w-24 h-9 rounded-xl" />
                  <SkeletonBox className="w-28 h-9 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
