'use client';

import React from 'react';
import { SkeletonBox, SkeletonText, SkeletonCircle, SkeletonBadge } from './SkeletonBase';

export function LandingPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header / Location Bar Skeleton */}
      <div className="w-full border-b border-gray-100 bg-white py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBox className="w-28 sm:w-36 h-9 rounded-lg" />
            <SkeletonBox className="hidden sm:block w-32 h-8 rounded-full" />
          </div>
          <div className="hidden md:flex items-center gap-4">
            <SkeletonBox className="w-64 h-9 rounded-xl" />
            <SkeletonCircle size="w-9 h-9" />
          </div>
        </div>
      </div>

      {/* 2. Hero Section Skeleton */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 pb-10 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Headlines & Booking Card */}
            <div className="lg:col-span-7 space-y-4">
              <SkeletonBadge width="w-40" height="h-7" />
              <div className="space-y-2 pt-2">
                <SkeletonText width="w-4/5" height="h-10 sm:h-12" />
                <SkeletonText width="w-3/5" height="h-10 sm:h-12" />
              </div>
              <SkeletonText width="w-full max-w-lg" height="h-5" className="pt-2" />
              <SkeletonText width="w-3/4 max-w-md" height="h-5" />

              {/* Booking Input Box Card */}
              <div className="pt-4 max-w-xl">
                <div className="p-4 sm:p-5 rounded-2xl border border-gray-200/80 bg-white shadow-xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SkeletonBox className="h-12 rounded-xl" />
                    <SkeletonBox className="h-12 rounded-xl" />
                  </div>
                  <SkeletonBox className="h-12 rounded-xl w-full" />
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap gap-4">
                <SkeletonBox className="w-36 h-8 rounded-lg" />
                <SkeletonBox className="w-40 h-8 rounded-lg" />
                <SkeletonBox className="w-36 h-8 rounded-lg" />
              </div>
            </div>

            {/* Right Column: Hero Banner Image */}
            <div className="lg:col-span-5">
              <SkeletonBox className="w-full h-72 sm:h-96 lg:h-[420px] rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Five Verticals Skeleton */}
      <section className="py-8 bg-white border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-md mx-auto mb-6 space-y-2">
            <SkeletonText width="w-48 mx-auto" height="h-6" />
            <SkeletonText width="w-64 mx-auto" height="h-4" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center space-y-3">
                <SkeletonCircle size="w-16 h-16 sm:w-20 sm:h-20" />
                <SkeletonText width="w-24" height="h-4" />
                <SkeletonText width="w-16" height="h-3" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Exclusive Offers & Coupons Skeleton */}
      <section className="py-10 bg-slate-50/60">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1.5">
              <SkeletonText width="w-44" height="h-6" />
              <SkeletonText width="w-60" height="h-4" />
            </div>
            <SkeletonBox className="w-24 h-9 rounded-xl hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-200/80 overflow-hidden shadow-xs p-4 flex flex-col justify-between h-56 space-y-3">
                <div className="flex items-center justify-between">
                  <SkeletonBadge width="w-24" height="h-6" />
                  <SkeletonBadge width="w-16" height="h-5" />
                </div>
                <div className="space-y-2">
                  <SkeletonText width="w-3/4" height="h-6" />
                  <SkeletonText width="w-full" height="h-4" />
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-dashed border-gray-100">
                  <SkeletonBox className="w-28 h-8 rounded-lg" />
                  <SkeletonBox className="w-20 h-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Trending Services Grid Skeleton */}
      <section className="py-12 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1.5">
              <SkeletonText width="w-52" height="h-7" />
              <SkeletonText width="w-72" height="h-4" />
            </div>
            <SkeletonBox className="w-28 h-9 rounded-xl" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden p-3.5 space-y-3">
                <SkeletonBox className="w-full aspect-square sm:aspect-video rounded-xl" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <SkeletonBadge width="w-12" height="h-4" />
                    <SkeletonBadge width="w-14" height="h-4" />
                  </div>
                  <SkeletonText width="w-4/5" height="h-5" />
                  <SkeletonText width="w-1/2" height="h-4" />
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                  <SkeletonText width="w-16" height="h-6" />
                  <SkeletonBox className="w-20 h-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
