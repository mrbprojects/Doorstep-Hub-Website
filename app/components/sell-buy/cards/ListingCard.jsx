'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Heart } from 'lucide-react';
import { getImageUrl } from '@/lib/sellBuyApi';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return 'Today';
}

export function ListingCard({ listing }) {
  const { user, token: authContextToken } = useAuth() || {};
  
  if (!listing) return null;

  const {
    slug, _id, id,
    title, name,
    price,
    image, coverImage, images, gallery_images,
    location, city,
    isFeatured, is_feature,
    is_liked,
    created_at, createdAt,
  } = listing;

  const listingId = _id || id;
  const [liked, setLiked] = useState(is_liked || false);
  const [loading, setLoading] = useState(false);

  const displayTitle = title || name || 'Untitled Item';
  const displayImage = coverImage || image || images?.[0] || gallery_images?.[0]?.image;
  const displayCity = location?.area
    ? `${location.area}, ${location.city || city || ''}`
    : location?.city || city || '';
  const displayPrice = price
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)
    : 'Contact for Price';
  const timeAgo = formatTimeAgo(createdAt || created_at);
  const featured = isFeatured || is_feature;

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    let activeUser = user;
    if (!activeUser && typeof window !== 'undefined') {
       const stored = localStorage.getItem('user_details') || localStorage.getItem('user');
       if (stored) {
         try { activeUser = JSON.parse(stored); } catch(err) {}
       }
    }

    if (!activeUser) {
      toast.error('Please login to add to wishlist');
      return;
    }

    if (loading) return;
    setLoading(true);

    // Optimistic update
    const prevLiked = liked;
    setLiked(!prevLiked);

    try {
      const currentToken = authContextToken || localStorage.getItem('auth_token') || '';
      const userId = activeUser._id || activeUser.id;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sell-buy/listings/${listingId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (data.success || data.error === false) {
        setLiked(data.data?.isFavorite);
        if (data.data?.isFavorite) {
          toast.success('Added to wishlist');
        } else {
          toast.success('Removed from wishlist');
        }
      } else {
        // Revert on failure
        setLiked(prevLiked);
        toast.error(data.message || 'Failed to update wishlist');
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setLiked(prevLiked);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      href={`/sell-buy/ad/${slug}`}
      className={`group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col ${
        featured 
          ? 'border-[1.5px] border-amber-400 shadow-sm shadow-amber-100/50 relative' 
          : 'border border-gray-200'
      }`}
    >
      {/* Subtle background glow for featured */}
      {featured && (
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/30 to-transparent pointer-events-none z-0" />
      )}

      {/* Image */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden z-10">
        {displayImage ? (
          <img
            src={getImageUrl(displayImage)}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-0 left-0 bg-[#037166] text-white text-xs font-semibold px-2.5 py-1 rounded-br-lg flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Featured
          </div>
        )}

        {/* Heart Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={loading}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#037166] hover:text-red-500 transition-colors disabled:opacity-50"
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''} ${loading ? 'animate-pulse' : ''}`} />
        </button>

        {/* Time overlay bottom-right */}
        {timeAgo && (
          <div className="absolute bottom-2 right-2 text-[10px] text-white bg-black/40 px-1.5 py-0.5 rounded">
            {timeAgo}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        {/* Price & Date Row */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-base font-bold text-gray-900 leading-tight">
            {displayPrice}
          </span>
          <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">{timeAgo}</span>
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-gray-700 line-clamp-1">{displayTitle}</p>

        {/* Location */}
        {displayCity && (
          <p className="text-xs text-gray-400 line-clamp-1">{displayCity}</p>
        )}
      </div>
    </Link>
  );
}
