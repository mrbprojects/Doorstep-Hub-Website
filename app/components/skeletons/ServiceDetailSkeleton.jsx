'use client';

import React from 'react';
import { SkeletonBox, SkeletonText, SkeletonCircle, SkeletonBadge } from './SkeletonBase';

export function ServiceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* 1. Breadcrumb bar */}
      <div className="bg-white border-b border-gray-100 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto flex items-center gap-2">
          <SkeletonBox className="w-12 h-4 rounded" />
          <span className="text-gray-300">/</span>
          <SkeletonBox className="w-20 h-4 rounded" />
          <span className="text-gray-300">/</span>
          <SkeletonBox className="w-24 h-4 rounded" />
          <span className="text-gray-300">/</span>
          <SkeletonBox className="w-36 h-4 rounded" />
        </div>
      </div>

      {/* 2. Main Detail Split Layout */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (65%): Gallery, Details, Inclusions, FAQs */}
          <div className="lg:col-span-8 space-y-6">

            {/* Main Service Hero Image Gallery */}
            <div className="relative w-full h-64 sm:h-96 rounded-3xl overflow-hidden shadow-xs border border-gray-100 bg-white">
              <SkeletonBox className="w-full h-full rounded-3xl" />
              <div className="absolute top-4 left-4 flex gap-2">
                <SkeletonBadge width="w-24" height="h-7" />
                <SkeletonBadge width="w-28" height="h-7" />
              </div>
            </div>

            {/* Title, Rating & Key Highlights */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SkeletonBadge width="w-28" height="h-6" />
                <div className="flex items-center gap-2">
                  <SkeletonBox className="w-16 h-6 rounded-md" />
                  <SkeletonText width="w-24" height="h-4" />
                </div>
              </div>

              <div className="space-y-2">
                <SkeletonText width="w-4/5" height="h-8 sm:h-9" />
                <SkeletonText width="w-3/5" height="h-5" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <SkeletonCircle size="w-9 h-9" />
                    <div className="space-y-1">
                      <SkeletonText width="w-16" height="h-3.5" />
                      <SkeletonText width="w-20" height="h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included / Excluded Checklist */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <SkeletonText width="w-48" height="h-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60 space-y-3">
                  <SkeletonBadge width="w-28" height="h-5" />
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <SkeletonCircle size="w-4 h-4" />
                      <SkeletonText width="w-4/5" height="h-3.5" />
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-2xl bg-red-50/40 border border-red-100/60 space-y-3">
                  <SkeletonBadge width="w-28" height="h-5" />
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <SkeletonCircle size="w-4 h-4" />
                      <SkeletonText width="w-4/5" height="h-3.5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Common Issues Fixed Skeleton */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <SkeletonText width="w-52" height="h-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div className="space-y-1">
                      <SkeletonText width="w-36" height="h-4" />
                      <SkeletonText width="w-24" height="h-3" />
                    </div>
                    <SkeletonBox className="w-16 h-6 rounded" />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (35%): Sticky Price & Booking Card */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-sm space-y-5">
              {/* Price Block */}
              <div className="space-y-2 pb-4 border-b border-gray-100">
                <div className="flex items-baseline justify-between">
                  <SkeletonText width="w-28" height="h-9" />
                  <SkeletonBadge width="w-16" height="h-6" />
                </div>
                <SkeletonText width="w-40" height="h-4" />
              </div>

              {/* Slot / Date Preview */}
              <div className="space-y-2">
                <SkeletonText width="w-32" height="h-4" />
                <div className="grid grid-cols-3 gap-2">
                  <SkeletonBox className="h-11 rounded-xl" />
                  <SkeletonBox className="h-11 rounded-xl" />
                  <SkeletonBox className="h-11 rounded-xl" />
                </div>
              </div>

              {/* Booking CTA Button */}
              <SkeletonBox className="w-full h-13 rounded-2xl" />

              {/* Trust Badges */}
              <div className="pt-2 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <SkeletonCircle size="w-5 h-5" />
                  <SkeletonText width="w-48" height="h-3.5" />
                </div>
                <div className="flex items-center gap-2.5">
                  <SkeletonCircle size="w-5 h-5" />
                  <SkeletonText width="w-40" height="h-3.5" />
                </div>
                <div className="flex items-center gap-2.5">
                  <SkeletonCircle size="w-5 h-5" />
                  <SkeletonText width="w-52" height="h-3.5" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
