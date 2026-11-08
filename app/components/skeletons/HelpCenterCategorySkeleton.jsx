'use client';

import React from 'react';
import { SkeletonBox, SkeletonText, SkeletonCircle, SkeletonBadge } from './SkeletonBase';

export function HelpCenterCategorySkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      {/* 1. Header & Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <SkeletonBox className="w-12 h-3.5 rounded" />
          <span className="text-gray-300">/</span>
          <SkeletonBox className="w-20 h-3.5 rounded" />
          <span className="text-gray-300">/</span>
          <SkeletonBox className="w-32 h-3.5 rounded" />
        </div>
      </div>

      {/* 2. Category Hero */}
      <section className="bg-gradient-to-b from-[#037166]/10 via-slate-50/80 to-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <SkeletonCircle size="w-12 h-12" />
              <div className="space-y-1">
                <SkeletonText width="w-48 sm:w-64" height="h-8" />
                <SkeletonBadge width="w-24" height="h-5" />
              </div>
            </div>
            <SkeletonText width="w-full max-w-xl" height="h-4" />
          </div>
          <div className="w-full md:w-80">
            <SkeletonBox className="w-full h-11 rounded-xl" />
          </div>
        </div>
      </section>

      {/* 3. Main Split View: Left Sidebar Categories + Right Article Cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Category Sidebar */}
          <div className="hidden lg:block lg:col-span-4 rounded-3xl bg-white border border-gray-200/80 p-5 space-y-3 shadow-xs sticky top-20">
            <SkeletonText width="w-32" height="h-5" className="mb-2" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-3 rounded-2xl flex items-center justify-between border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <SkeletonCircle size="w-7 h-7" />
                  <SkeletonText width="w-28" height="h-4" />
                </div>
                <SkeletonBadge width="w-8" height="h-4" />
              </div>
            ))}
          </div>

          {/* Right Article Cards */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <SkeletonText width="w-36" height="h-5" />
              <SkeletonBox className="w-24 h-7 rounded-lg" />
            </div>

            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <SkeletonText width="w-3/5" height="h-5" />
                    <SkeletonBadge width="w-16" height="h-4" />
                  </div>
                  <SkeletonText width="w-full" height="h-3.5" />
                  <SkeletonText width="w-4/5" height="h-3.5" />
                </div>
                <div className="pt-2 flex items-center justify-between text-xs border-t border-gray-50">
                  <SkeletonText width="w-24" height="h-3" />
                  <SkeletonBox className="w-16 h-4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default HelpCenterCategorySkeleton;
