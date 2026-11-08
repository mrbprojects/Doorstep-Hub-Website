'use client';

import React from 'react';
import { SkeletonBox, SkeletonText, SkeletonCircle, SkeletonBadge } from './SkeletonBase';

export function HelpCenterArticleSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      {/* 1. Header & Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <SkeletonBox className="w-12 h-3.5 rounded" />
          <span className="text-gray-300">/</span>
          <SkeletonBox className="w-20 h-3.5 rounded" />
          <span className="text-gray-300">/</span>
          <SkeletonBox className="w-28 h-3.5 rounded" />
          <span className="text-gray-300">/</span>
          <SkeletonBox className="w-36 h-3.5 rounded" />
        </div>
      </div>

      {/* 2. Main Article Content (70% Article + 30% TOC & Related) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column (8 cols): Article Body */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-6">
            
            {/* Meta badges & title */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <SkeletonBadge width="w-24" height="h-6" />
                <SkeletonText width="w-28" height="h-3.5" />
              </div>
              <SkeletonText width="w-11/12" height="h-9 sm:h-11" />
              <SkeletonText width="w-4/5" height="h-9 sm:h-11" />
            </div>

            {/* Author / Date info row */}
            <div className="pt-2 pb-4 border-b border-gray-100 flex items-center gap-3">
              <SkeletonCircle size="w-10 h-10" />
              <div className="space-y-1">
                <SkeletonText width="w-28" height="h-4" />
                <SkeletonText width="w-36" height="h-3" />
              </div>
            </div>

            {/* Featured Image placeholder */}
            <SkeletonBox className="w-full aspect-[16/9] rounded-2xl" />

            {/* Article Prose Paragraphs */}
            <div className="space-y-4 pt-2">
              <SkeletonText width="w-full" height="h-4" />
              <SkeletonText width="w-full" height="h-4" />
              <SkeletonText width="w-11/12" height="h-4" />
              <SkeletonText width="w-4/5" height="h-4" />
            </div>

            {/* Section Heading & Bullets */}
            <div className="space-y-3 pt-4">
              <SkeletonText width="w-56" height="h-6" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <SkeletonCircle size="w-4 h-4" className="mt-1" />
                  <SkeletonText width="w-11/12" height="h-4" />
                </div>
              ))}
            </div>

            {/* Callout Box */}
            <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-100 space-y-2">
              <SkeletonText width="w-32" height="h-4" />
              <SkeletonText width="w-full" height="h-3.5" />
              <SkeletonText width="w-4/5" height="h-3.5" />
            </div>

            {/* Feedback / Was this helpful? */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <SkeletonText width="w-44" height="h-4" />
              <div className="flex gap-2">
                <SkeletonBox className="w-20 h-9 rounded-xl" />
                <SkeletonBox className="w-20 h-9 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Table of Contents + Related Articles */}
          <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-20">
            {/* Table of Contents */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 space-y-4 shadow-xs">
              <SkeletonText width="w-36" height="h-5" />
              <div className="space-y-2.5 pt-1">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonText key={i} width={`w-${i % 2 === 0 ? '4/5' : 'full'}`} height="h-3.5" />
                ))}
              </div>
            </div>

            {/* Related Articles */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 space-y-4 shadow-xs">
              <SkeletonText width="w-40" height="h-5" />
              <div className="space-y-3 pt-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-2xl border border-gray-100 space-y-1.5">
                    <SkeletonText width="w-full" height="h-4" />
                    <SkeletonText width="w-20" height="h-3" />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default HelpCenterArticleSkeleton;
