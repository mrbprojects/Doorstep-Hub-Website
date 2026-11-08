'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl, fetchSellBuyListings } from '@/lib/sellBuyApi';
import {
  X,
  Heart,
  Share2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';

export function VideoShortsModal({ isOpen, onClose, listing, allListings = [] }) {
  const router = useRouter();
  const { user, token: authContextToken } = useAuth() || {};

  const getInitialList = () => {
    let initialList = [];
    if (allListings && allListings.length > 0) initialList = [...allListings];
    if (listing) {
      const exists = initialList.some((it) => (it.slug || it._id || it.id) === (listing.slug || listing._id || listing.id));
      if (!exists) initialList = [listing, ...initialList];
    }
    return initialList;
  };

  const [items, setItems] = useState(getInitialList);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted] = useState(false);
  const [isPaused] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [favoriteMap, setFavoriteMap] = useState(() => {
    const list = getInitialList();
    const favs = {};
    list.forEach((it) => {
      const id = it._id || it.id || it.slug;
      if (id) favs[id] = !!it.is_liked || !!it.isFavorite;
    });
    return favs;
  });
  const [favLoading, setFavLoading] = useState(false);

  const [prevListing, setPrevListing] = useState(listing);
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen || prevListing !== listing) {
    setPrevOpen(isOpen);
    setPrevListing(listing);
    if (isOpen) {
      const initialList = getInitialList();
      setItems(initialList);
      const favs = {};
      initialList.forEach((it) => {
        const id = it._id || it.id || it.slug;
        if (id) favs[id] = !!it.is_liked || !!it.isFavorite;
      });
      setFavoriteMap(favs);
      if (listing) {
        const foundIdx = initialList.findIndex(
          (it) => (it.slug || it._id || it.id) === (listing.slug || listing._id || listing.id)
        );
        setCurrentIndex(foundIdx >= 0 ? foundIdx : 0);
      }
      setActiveImgIdx(0);
    }
  }

  // Drag / swipe states for fluid touch scrolling like YouTube Shorts
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef(null);
  const touchStartY = useRef(null);
  const currentDragY = useRef(0);
  const isScrollingRef = useRef(false);

  // Fetch all marketplace listings from different sellers
  useEffect(() => {
    if (!isOpen) return;

    // Fetch diverse listings across all sellers from marketplace API
    fetchSellBuyListings({ limit: 50 }).then((res) => {
      if (res.listings && res.listings.length > 0) {
        setItems((prev) => {
          const combined = listing ? [listing, ...prev, ...res.listings] : [...prev, ...res.listings];
          const seen = new Set();
          const unique = [];
          for (const item of combined) {
            const key = item.slug || item._id || item.id;
            if (key && !seen.has(key)) {
              seen.add(key);
              unique.push(item);
            }
          }
          return unique;
        });
      }
    });
  }, [isOpen, listing]);

  const currentItem = items[currentIndex] || listing;

  const rawImages = currentItem?.images || (currentItem?.gallery_images?.map((g) => g.image)) || [];
  const currentImages = rawImages.length > 0
    ? rawImages
    : [currentItem?.image || currentItem?.coverImage || '/uploads/thumbn_ph_image/default_image.jpg'];

  const videoUrl = currentItem?.video_link || currentItem?.video || currentItem?.videoUrl || null;
  const currentItemId = currentItem?._id || currentItem?.id || currentItem?.slug || '';
  const isCurrentLiked = !!favoriteMap[currentItemId];

  // Auto-slide inner images of the active listing every 2.8s
  useEffect(() => {
    if (!isOpen || isPaused || videoUrl || currentImages.length <= 1) return;

    const timer = setInterval(() => {
      setActiveImgIdx((prev) => (prev + 1) % currentImages.length);
    }, 2800);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, videoUrl, currentImages.length, currentIndex]);

  // Audio / Video Mute sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, currentIndex]);

  const handleNextShort = useCallback(() => {
    if (items.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setActiveImgIdx(0);
      setDragOffset(0);
    }
  }, [items.length]);

  const handlePrevShort = useCallback(() => {
    if (items.length > 0) {
      setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
      setActiveImgIdx(0);
      setDragOffset(0);
    }
  }, [items.length]);

  // Keyboard navigation (Up/Down arrow & Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextShort();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevShort();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNextShort, handlePrevShort, onClose]);

  // Mouse wheel scroll navigation with smooth sliding debounce
  const handleWheel = (e) => {
    if (isScrollingRef.current) return;
    if (Math.abs(e.deltaY) > 30) {
      isScrollingRef.current = true;
      if (e.deltaY > 0) {
        handleNextShort();
      } else {
        handlePrevShort();
      }
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    }
  };

  // Touch Swipe & Drag Handlers
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    currentDragY.current = 0;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === null) return;
    const diffY = e.touches[0].clientY - touchStartY.current;
    currentDragY.current = diffY;
    setDragOffset(diffY * 0.7);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (touchStartY.current === null) return;
    const diffY = currentDragY.current;
    if (diffY < -50) {
      handleNextShort();
    } else if (diffY > 50) {
      handlePrevShort();
    }
    setDragOffset(0);
    touchStartY.current = null;
    currentDragY.current = 0;
  };

  // Wishlist toggle handler with Auth verification
  const handleToggleWishlist = async (e) => {
    e.stopPropagation();

    let activeUser = user;
    if (!activeUser && typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_details') || localStorage.getItem('user');
      if (stored) {
        try { activeUser = JSON.parse(stored); } catch {}
      }
    }

    if (!activeUser) {
      toast.error('Please login to add this item to your wishlist');
      onClose();
      router.push('/login');
      return;
    }

    if (favLoading) return;
    setFavLoading(true);

    const prevStatus = !!favoriteMap[currentItemId];
    const newStatus = !prevStatus;

    setFavoriteMap((prev) => ({
      ...prev,
      [currentItemId]: newStatus,
    }));

    try {
      const currentToken = authContextToken || localStorage.getItem('auth_token') || '';
      const userId = activeUser._id || activeUser.id;
      const listingId = currentItem._id || currentItem.id || currentItemId;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sell-buy/listings/${listingId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (data.success || data.error === false) {
        const finalStatus = data.data?.isFavorite !== undefined ? data.data.isFavorite : newStatus;
        setFavoriteMap((prev) => ({
          ...prev,
          [currentItemId]: finalStatus,
        }));
        if (finalStatus) {
          toast.success('Added to your wishlist!');
        } else {
          toast.success('Removed from wishlist');
        }
      } else {
        setFavoriteMap((prev) => ({
          ...prev,
          [currentItemId]: prevStatus,
        }));
        toast.error(data.message || 'Failed to update wishlist');
      }
    } catch (err) {
      console.error(err);
      setFavoriteMap((prev) => ({
        ...prev,
        [currentItemId]: prevStatus,
      }));
      toast.error('Something went wrong');
    } finally {
      setFavLoading(false);
    }
  };

  if (!isOpen || !currentItem) return null;

  const adSlug = currentItem.slug || '';

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/sell-buy/ad/${adSlug}` : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentItem.title || currentItem.name,
          text: `Check out ${currentItem.title || currentItem.name} on DoorstepHub!`,
          url: shareUrl,
        });
      } catch {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleOpenDetailView = (itemToOpen) => {
    const targetSlug = itemToOpen?.slug || adSlug;
    onClose();
    if (targetSlug) {
      router.push(`/sell-buy/ad/${targetSlug}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18181b] p-3 sm:p-6 animate-in fade-in duration-200 select-none overflow-hidden font-sans">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Top Close Button */}
      <button
        type="button"
        onClick={onClose}
        title="Close (Esc)"
        className="absolute top-5 right-5 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-lg"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main Reel Layout: Centered Sliding Video Card + Outside Action Rail */}
      <div
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 flex items-center gap-4 sm:gap-6 max-h-[94vh]"
      >
        {/* ── CENTERED REEL CARD VIEWPORT ── */}
        <div className="relative w-[340px] sm:w-[380px] md:w-[410px] h-[84vh] max-h-[770px] min-h-[540px] bg-slate-900 rounded-[26px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-white/10">
          {/* ── VERTICAL SLIDING TRACK ── */}
          <div
            className="w-full h-full relative will-change-transform"
            style={{
              transform: `translateY(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1)',
            }}
          >
            {items.map((item, idx) => {
              const itemRawImages = item?.images || (item?.gallery_images?.map((g) => g.image)) || [];
              const itemImages = itemRawImages.length > 0
                ? itemRawImages
                : [item?.image || item?.coverImage || '/uploads/thumbn_ph_image/default_image.jpg'];

              const itemVideo = item?.video_link || item?.video || item?.videoUrl || null;
              const itemActiveImg = idx === currentIndex ? activeImgIdx : 0;
              const itemImgSrc = getImageUrl(itemImages[itemActiveImg]);

              const itemPrice = item.price
                ? new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 2,
                  }).format(item.price)
                : '₹ 0.00';

              const itemSellerName =
                item.seller?.name ||
                item.user?.name ||
                item.sellerId?.name ||
                item.seller_name ||
                'Asgar WRTeam';

              const itemSellerAvatar =
                item.seller?.avatar ||
                item.seller?.image ||
                item.user?.profile ||
                item.sellerId?.image ||
                null;

              const isNearby = Math.abs(idx - currentIndex) <= 1;

              return (
                <div
                  key={item._id || item.id || item.slug || idx}
                  className="w-full h-full relative flex flex-col justify-between overflow-hidden shrink-0 select-none"
                  style={{ height: '100%' }}
                >
                  {/* Top Story Progress Bars (If multiple images on active short) */}
                  {itemImages.length > 1 && !itemVideo && idx === currentIndex && (
                    <div className="absolute top-3 inset-x-4 z-40 flex items-center gap-1.5 pointer-events-none">
                      {itemImages.map((_, pIdx) => (
                        <div
                          key={pIdx}
                          className="h-1 flex-1 rounded-full overflow-hidden bg-white/35"
                        >
                          <div
                            className={`h-full transition-all duration-300 ${
                              pIdx === activeImgIdx
                                ? 'bg-white w-full'
                                : pIdx < activeImgIdx
                                ? 'bg-white/90 w-full'
                                : 'w-0'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Media Content Stage (Video or Auto-Sliding Images) */}
                  <div
                    onClick={() => handleOpenDetailView(item)}
                    className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden cursor-pointer group"
                  >
                    {itemVideo && isNearby ? (
                      <video
                        ref={idx === currentIndex ? videoRef : null}
                        src={itemVideo}
                        autoPlay={idx === currentIndex}
                        loop
                        muted={isMuted}
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                          src={itemImgSrc}
                          alt={item.title || 'Product'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://api.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg';
                          }}
                         width={500} height={300} />
                      </div>
                    )}

                    {/* Gradient overlay for text clarity */}
                    <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />
                  </div>

                  {/* ── BOTTOM OVERLAY (Exact Match to Screenshot) ── */}
                  <div className="absolute bottom-0 inset-x-0 z-30 p-4 sm:p-5 space-y-3 pointer-events-auto">
                    {/* Seller Pill Header */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-[#037166] text-white flex items-center justify-center text-xs font-black ring-2 ring-white shrink-0 shadow-lg">
                        {itemSellerAvatar ? (
                          <Image src={getImageUrl(itemSellerAvatar)} alt={itemSellerName} className="w-full h-full object-cover"  width={500} height={300} />
                        ) : (
                          <span>{itemSellerName?.[0]?.toUpperCase() || 'S'}</span>
                        )}
                      </div>
                      <span className="text-base font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] tracking-wide">
                        {itemSellerName}
                      </span>
                    </div>

                    {/* ── EXACT FLOATING PRODUCT CARD ── */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetailView(item);
                      }}
                      className="bg-[#ebebeb]/95 hover:bg-white backdrop-blur-md rounded-[20px] overflow-hidden flex items-stretch shadow-2xl transition-all duration-200 cursor-pointer group border border-white/40"
                    >
                      {/* Flush Left Product Thumbnail */}
                      <div className="w-24 sm:w-28 bg-slate-200 shrink-0 relative overflow-hidden flex items-center justify-center">
                        <Image
                          src={itemImgSrc}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://api.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg';
                          }}
                         width={500} height={300} />
                      </div>

                      {/* Right Title & Big Cyan/Teal Price */}
                      <div className="flex-1 min-w-0 p-3 sm:p-3.5 flex flex-col justify-center">
                        <h4 className="text-xs sm:text-[13px] font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#037166] transition-colors">
                          {item.title || item.name}
                        </h4>
                        <div className="text-base sm:text-lg font-black text-[#00a896] mt-1 tracking-tight">
                          {itemPrice}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── OUTSIDE ACTION RAIL (Right Side) ── */}
        <div className="flex flex-col items-center gap-4 sm:gap-5 text-white shrink-0">
          {/* Previous Short (Up Arrow Button) */}
          <button
            type="button"
            onClick={handlePrevShort}
            title="Previous (Arrow Up)"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-white flex items-center justify-center shadow-xl border border-white/10 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Next Short (Down Arrow Button) */}
          <button
            type="button"
            onClick={handleNextShort}
            title="Next (Arrow Down)"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-slate-100 text-slate-900 flex items-center justify-center shadow-xl transition-all active:scale-95 cursor-pointer"
          >
            <ArrowDown className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Share Button with label below */}
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center shadow-xl transition-all active:scale-95">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white/90">Share</span>
          </button>

          {/* Wishlist Button with Auth Check & User Portfolio */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            title={isCurrentLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
                isCurrentLiked
                  ? 'bg-rose-600 text-white shadow-rose-600/40 scale-105'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-transform ${
                  isCurrentLiked ? 'fill-current text-white scale-110' : 'text-slate-900'
                }`}
              />
            </div>
            <span
              className={`text-xs font-semibold ${
                isCurrentLiked ? 'text-rose-400 font-bold' : 'text-white/90'
              }`}
            >
              Wishlist
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoShortsModal;
