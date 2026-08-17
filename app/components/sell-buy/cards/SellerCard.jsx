'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

export function SellerCard({ seller }) {
  const [following, setFollowing] = useState(false);

  if (!seller) return null;

  const {
    slug = 'seller-profile',
    name,
    location = 'Bangalore, KA',
    rating = 4.8,
    reviewsCount = 120,
    adsCount = 120,
    icon: IconComponent,
  } = seller;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 text-center flex flex-col items-center space-y-2 hover:shadow-md transition-all">
      {/* Circle Icon Avatar */}
      <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center mb-1">
        {IconComponent ? <IconComponent className="w-7 h-7" /> : <div className="font-bold text-lg">{name?.[0]}</div>}
      </div>

      {/* Name */}
      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{name}</h4>

      {/* Location */}
      <p className="text-[11px] text-slate-500">{location}</p>

      {/* Rating & Ads Count */}
      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span>{rating}</span>
        <span className="text-slate-400 font-normal">({reviewsCount})</span>
      </div>

      <p className="text-[11px] text-slate-400 font-medium">{adsCount} Ads</p>

      {/* Follow Button */}
      <button
        onClick={() => setFollowing(!following)}
        className={`w-full py-1.5 px-4 rounded-md text-xs font-semibold border transition-all mt-2 ${
          following
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
        }`}
      >
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}
