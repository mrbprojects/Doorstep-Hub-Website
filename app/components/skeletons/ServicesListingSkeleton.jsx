'use client';

import React from 'react';
import { SkeletonBox, SkeletonText, SkeletonCircle, SkeletonBadge } from './SkeletonBase';

export function ServicesListingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header Banner */}
      <div className="bg-slate-50 border-b border-gray-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <SkeletonBox className="w-12 h-4 rounded" />
            <span className="text-gray-300">/</span>
            <SkeletonBox className="w-20 h-4 rounded" />
            <span className="text-gray-300">/</span>
            <SkeletonBox className="w-32 h-4 rounded" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <SkeletonText width="w-72" height="h-8" />
              <SkeletonText width="w-48" height="h-4" />
            </div>
            <div className="flex items-center gap-3">
              <SkeletonBox className="w-36 h-9 rounded-xl sm:hidden" />
              <SkeletonBox className="w-44 h-9 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Sidebar + Services List) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Filter Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 rounded-2xl border border-gray-200/80 bg-white p-5 space-y-6 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <SkeletonText width="w-20" height="h-5" />
              <SkeletonBox className="w-14 h-4 rounded" />
            </div>

            {/* Price Filter Skeleton */}
            <div className="space-y-3">
              <SkeletonText width="w-24" height="h-4" />
              <SkeletonBox className="w-full h-4 rounded-full" />
              <div className="flex items-center justify-between gap-2">
                <SkeletonBox className="w-20 h-8 rounded-lg" />
                <SkeletonBox className="w-20 h-8 rounded-lg" />
              </div>
            </div>

            {/* Rating Filter Skeleton */}
            <div className="space-y-2.5 pt-2">
              <SkeletonText width="w-28" height="h-4" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <SkeletonBox className="w-4 h-4 rounded" />
                  <SkeletonText width="w-24" height="h-3.5" />
                </div>
              ))}
            </div>

            {/* Checkbox Attributes */}
            <div className="space-y-2.5 pt-2">
              <SkeletonText width="w-32" height="h-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <SkeletonBox className="w-4 h-4 rounded" />
                  <SkeletonText width="w-28" height="h-3.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Services List */}
          <div className="lg:col-span-9 space-y-4">
            {/* Top Sort Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <SkeletonText width="w-36" height="h-4" />
              <SkeletonBox className="w-36 h-8 rounded-lg" />
            </div>

            {/* Service Cards */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row gap-5 items-start justify-between"
              >
                {/* Image on Mobile / Left */}
                <div className="relative w-full sm:w-44 h-44 sm:h-36 rounded-xl overflow-hidden shrink-0">
                  <SkeletonBox className="w-full h-full rounded-xl" />
                  <SkeletonBadge width="w-20" height="h-5" className="absolute top-2 left-2" />
                </div>

                {/* Middle: Content details */}
                <div className="flex-1 space-y-2.5 w-full">
                  <div className="flex items-center gap-2">
                    <SkeletonBadge width="w-16" height="h-5" />
                    <SkeletonBadge width="w-24" height="h-5" />
                  </div>
                  <SkeletonText width="w-4/5" height="h-6" />
                  <SkeletonText width="w-full" height="h-3.5" />
                  <SkeletonText width="w-3/4" height="h-3.5" />

                  {/* Feature Bullets */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2">
                      <SkeletonCircle size="w-3.5 h-3.5" />
                      <SkeletonText width="w-48" height="h-3" />
                    </div>
                    <div className="flex items-center gap-2">
                      <SkeletonCircle size="w-3.5 h-3.5" />
                      <SkeletonText width="w-56" height="h-3" />
                    </div>
                  </div>
                </div>

                {/* Right: Price & CTA */}
                <div className="sm:border-l sm:border-gray-100 sm:pl-5 sm:min-w-[170px] w-full sm:w-auto flex sm:flex-col justify-between sm:justify-center items-end sm:items-start pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <SkeletonText width="w-20" height="h-6" />
                      <SkeletonText width="w-12" height="h-4" />
                    </div>
                    <SkeletonBadge width="w-16" height="h-4" />
                  </div>
                  <SkeletonBox className="w-28 sm:w-full h-10 rounded-xl" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
