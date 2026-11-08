'use client';

import React from 'react';
import { SkeletonBox, SkeletonText, SkeletonCircle, SkeletonBadge } from './SkeletonBase';

export function CategoryPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header Banner & Breadcrumbs */}
      <div className="bg-gradient-to-b from-slate-50 via-white to-white border-b border-gray-100 pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto space-y-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2">
            <SkeletonBox className="w-14 h-4 rounded" />
            <span className="text-gray-300">/</span>
            <SkeletonBox className="w-20 h-4 rounded" />
            <span className="text-gray-300">/</span>
            <SkeletonBox className="w-28 h-4 rounded" />
          </div>

          {/* Title & Description */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <SkeletonText width="w-64 sm:w-80" height="h-8 sm:h-10" />
              <SkeletonBadge width="w-20" height="h-6" />
            </div>
            <SkeletonText width="w-full sm:w-4/5" height="h-4" />
            <SkeletonText width="w-2/3" height="h-4" />
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-2xl">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2.5">
                <SkeletonCircle size="w-8 h-8" />
                <div className="space-y-1">
                  <SkeletonText width="w-14" height="h-4" />
                  <SkeletonText width="w-10" height="h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Subcategories Grid Skeleton */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <SkeletonText width="w-48" height="h-6" />
            <SkeletonText width="w-64" height="h-4" />
          </div>
          <SkeletonBox className="w-32 h-9 rounded-xl hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs flex flex-col justify-between space-y-3.5"
            >
              <div className="space-y-3">
                {/* Image placeholder with aspect ratio */}
                <SkeletonBox className="w-full aspect-[4/3] rounded-xl" />

                {/* Title & description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <SkeletonText width="w-3/5" height="h-5" />
                    <SkeletonBadge width="w-12" height="h-4" />
                  </div>
                  <SkeletonText width="w-full" height="h-3.5" />
                  <SkeletonText width="w-4/5" height="h-3.5" />
                </div>
              </div>

              {/* Action row */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <SkeletonText width="w-24" height="h-4" />
                <SkeletonBox className="w-20 h-7 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Comparison / FAQ Section Skeleton */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-gray-200/70 space-y-4">
          <SkeletonText width="w-56" height="h-7" />
          <SkeletonText width="w-full max-w-xl" height="h-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <SkeletonBox className="h-32 rounded-2xl" />
            <SkeletonBox className="h-32 rounded-2xl" />
            <SkeletonBox className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
