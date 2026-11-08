'use client';

import React from 'react';
import { SkeletonBox, SkeletonText, SkeletonCircle } from './SkeletonBase';

export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="space-y-1.5">
          <SkeletonText width="w-48" height="h-8" />
          <SkeletonText width="w-72" height="h-4" />
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 space-y-8 shadow-xs">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-gray-100">
            <SkeletonCircle size="w-24 h-24" />
            <div className="space-y-2 text-center sm:text-left">
              <SkeletonBox className="w-36 h-9 rounded-xl mx-auto sm:mx-0" />
              <SkeletonText width="w-48" height="h-3.5" />
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <SkeletonText width="w-24" height="h-3.5" />
                <SkeletonBox className="w-full h-12 rounded-xl" />
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="pt-4 flex justify-end">
            <SkeletonBox className="w-36 h-11 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePageSkeleton;
