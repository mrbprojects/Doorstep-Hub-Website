'use client';

import React from 'react';

export function SkeletonBox({ className = '', style }) {
  return (
    <div
      className={`bg-gray-200/80 animate-pulse rounded-xl ${className}`}
      style={style}
    />
  );
}

export function SkeletonText({ className = '', width = 'w-full', height = 'h-4' }) {
  return (
    <div
      className={`bg-gray-200/80 animate-pulse rounded-md ${width} ${height} ${className}`}
    />
  );
}

export function SkeletonCircle({ size = 'w-12 h-12', className = '' }) {
  return (
    <div
      className={`bg-gray-200/80 animate-pulse rounded-full flex-shrink-0 ${size} ${className}`}
    />
  );
}

export function SkeletonBadge({ className = '', width = 'w-20', height = 'h-6' }) {
  return (
    <div
      className={`bg-gray-200/80 animate-pulse rounded-full ${width} ${height} ${className}`}
    />
  );
}
