'use client';

import React from 'react';

export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm flex flex-col">
      {/* Image Skeleton with Shimmer */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
        
        {/* Placeholder for top-right heart icon */}
        <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm shadow-sm" />
      </div>

      {/* Content Area Skeleton */}
      <div className="p-3.5 flex flex-col gap-2.5 flex-1 bg-white">
        {/* Price & Date Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="h-5 w-24 bg-slate-200 rounded-md animate-pulse" />
          <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-1.5 mt-0.5">
          <div className="h-3.5 w-11/12 bg-slate-200 rounded animate-pulse" />
          <div className="h-3.5 w-3/4 bg-slate-100 rounded animate-pulse" />
        </div>

        {/* Location Row */}
        <div className="flex items-center gap-1.5 mt-auto pt-1">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-200 animate-pulse shrink-0" />
          <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ListingCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default ListingCardSkeleton;
