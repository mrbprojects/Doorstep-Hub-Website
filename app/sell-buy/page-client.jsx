'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ListingCard } from '@/components/sell-buy/cards/ListingCard';
import { PostAdModal } from '@/components/sell-buy/PostAdModal';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyHowItWorks } from '@/components/sell-buy/SellBuyHowItWorks';
import { KnowledgeSection } from '@/components/landing/KnowledgeSection';
import {
  fetchSellBuyCategories,
  fetchSellBuyListings,
  fetchFeaturedSections,
  fetchSliders,
  fetchSystemSettings,
  getImageUrl,
} from '@/lib/sellBuyApi';
import { ChevronLeft, ChevronRight, MapPin, Search, Plus, Globe, Menu, ShoppingBag, Sparkles, Tag, ShieldCheck, Grid, Loader2, SearchX, X, ArrowRight, Navigation, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { AdSenseUnit } from '@/components/sell-buy/ads/AdSenseUnit';
import { ADSENSE_CONFIG } from '@/config/adsense';

// ─── DUAL PROMOTIONAL BANNER SECTION (MATCHING CHOTA BETA REFERENCE) ──────────
function DualBannerSection({ sliders, onPostAdClick }) {
  const bannerList = Array.isArray(sliders) && sliders.length > 0 ? sliders : [];

  if (bannerList.length === 0) return null;

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      <div className={`grid grid-cols-1 ${bannerList.length > 1 ? 'md:grid-cols-2' : ''} gap-4 sm:gap-6`}>
        {bannerList.slice(0, 2).map((banner, index) => {
          if (!banner.image) return null;

          return (
            <div
              key={banner._id || banner.id || index}
              className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex items-center bg-slate-50"
            >
              <img
                src={getImageUrl(banner.image)}
                alt={banner.title || "Promotional Banner"}
                className="w-full h-auto block object-contain"
                onError={(e) => {
                  if (e.currentTarget && e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.style.display = 'none';
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── POPULAR CATEGORIES (MATCHING IMAGE 1 BRAND/CATEGORY CARD LAYOUT) ──────
function PopularCategories({ categories, isLoading }) {
  const scrollRef = useRef(null);

  const displayCategories = categories || [];

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse shrink-0"></div>
            <div>
              <div className="w-32 h-5 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="w-48 h-3 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 sm:gap-5 overflow-hidden pb-4 pt-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gray-200 animate-pulse"></div>
              <div className="w-16 h-3 bg-gray-200 animate-pulse rounded mt-3"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (displayCategories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
      {/* Header with Icon Badge & See All */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#037166] text-white flex items-center justify-center shadow-md shrink-0">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-none">
              Shop By Category
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Explore wide range of verified categories</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/sell-buy/categories"
            className="text-xs sm:text-sm font-bold text-gray-700 hover:text-[#037166] transition-colors"
          >
            See All
          </Link>
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={scrollLeft}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#037166] hover:text-white text-gray-600 flex items-center justify-center transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#037166] hover:text-white text-gray-600 flex items-center justify-center transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Grid Cards (Rounded Square Layout as per Image 1) */}
      <div ref={scrollRef} className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide pt-1">
        {displayCategories.map((cat) => (
          <Link
            key={cat._id || cat.id || cat.slug}
            href={`/sell-buy/${cat.slug}`}
            className="flex flex-col items-center shrink-0 group"
          >
            {/* Outer Rounded Square Card Box (Steady without scale/border hover effects) */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gray-100/90 border border-gray-200/70 p-3.5 flex items-center justify-center">
              {cat.image ? (
                <img
                  src={getImageUrl(cat.image)}
                  alt={cat.name}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-white border border-gray-200/50 text-[#037166] flex items-center justify-center text-xl font-black shadow-sm">
                  {cat.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Label below Card */}
            <span className="text-xs sm:text-sm font-medium text-gray-800 text-center line-clamp-2 leading-tight max-w-[100px] mt-2.5">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── ITEM SECTION ─────────────────────────────────────────────────────────────
function ItemSection({ title, items, viewAllHref, isLoading }) {
  if (isLoading) {
    return (
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="w-48 h-6 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-2xl bg-white border border-gray-100 overflow-hidden h-[280px]">
              <div className="w-full h-36 bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="w-full h-4 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-2/3 h-4 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-1/3 h-4 bg-gray-200 animate-pulse rounded mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">{title}</h2>
        <Link href={viewAllHref} className="text-sm font-bold text-[#037166] hover:underline transition-colors">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {items.slice(0, 10).map((item) => (
          <ListingCard key={item._id || item.id} listing={item} />
        ))}
      </div>
    </section>
  );
}

// ─── INTRODUCING SELL & BUY ANNOUNCEMENT MODAL ────────────────────────────────
function IntroducingMarketplaceModal({ isOpen, onClose, onPostAdClick }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-teal-100 animate-scale-up">
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100/80 p-6 sm:p-8 text-center border-b border-teal-100/80 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 flex items-center justify-center transition-all shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-xs font-black tracking-wider uppercase mb-3 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Introducing</span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-teal-200/60 flex items-center justify-center mx-auto mb-3 text-[#037166]">
            <ShoppingBag className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Sell & Buy Marketplace 🎉
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1.5 max-w-sm mx-auto">
            Your neighborhood marketplace to buy & sell pre-owned items locally with 0% brokerage!
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="p-6 sm:p-7 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">100% Free Ad Posting</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                List mobiles, bikes, cars, furniture, appliances & fashion in under 30 seconds.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Verified Sellers & Trust</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Buy with confidence with KYC verified seller identity badges.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Direct Buyer-Seller Chat & Calls</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Connect instantly with real local buyers without any third-party fees.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 bg-[#037166] hover:bg-[#025a51] text-white rounded-xl text-sm font-bold shadow-md shadow-teal-900/10 transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onPostAdClick();
            }}
            className="w-full sm:w-auto py-3 px-5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#037166]" />
            <span>Post a Free Ad</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SellBuyHomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [sliders, setSliders] = useState([]);
  const [featuredSections, setFeaturedSections] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostAdModalOpen, setIsPostAdModalOpen] = useState(false);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the marketplace introduction popup
    const seen = typeof window !== 'undefined' ? localStorage.getItem('seen_sell_buy_intro_v2') : null;
    if (!seen) {
      const timer = setTimeout(() => setIsIntroModalOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissIntro = () => {
    setIsIntroModalOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('seen_sell_buy_intro_v2', 'true');
    }
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [catsData, slidersData, listingsData, featuredData] = await Promise.all([
          fetchSellBuyCategories(),
          fetchSliders(),
          fetchSellBuyListings({ limit: 12 }),
          fetchFeaturedSections(),
        ]);

        if (Array.isArray(catsData) && catsData.length > 0) {
          setCategories(catsData);
        }

        if (Array.isArray(slidersData) && slidersData.length > 0) {
          setSliders(slidersData);
        }

        if (listingsData?.listings) {
          setRecentListings(listingsData.listings);
        }

        if (Array.isArray(featuredData) && featuredData.length > 0) {
          setFeaturedSections(featuredData);
        }
      } catch (err) {
        console.error('Error loading sell-buy home data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenPostAdModal = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const kycStr = typeof window !== 'undefined' ? localStorage.getItem('seller_kyc_data') : null;
    let kycStatus = 'NOT_SUBMITTED';
    if (kycStr) {
      try {
        const parsed = JSON.parse(kycStr);
        kycStatus = parsed?.status || 'NOT_SUBMITTED';
      } catch (e) {}
    }

    if (!token) {
      toast.error('Please login to post an advertisement');
      router.push('/sell-buy/dashboard');
      return;
    }

    if (kycStatus !== 'APPROVED' && kycStatus !== 'VERIFIED') {
      toast.error('Verification (KYC) Required! Admin must approve your KYC before you can post ads.');
      router.push('/sell-buy/dashboard');
      return;
    }

    setIsPostAdModalOpen(true);
  };

  const allFeatured = recentListings.filter((l) => l.isFeatured || l.is_feature);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Header with DoorstepHub Logo & Categories */}
      <SellBuyHeader categories={categories} onPostAdClick={handleOpenPostAdModal} />

      {/* Dual Promotional Banner Cards */}
      <DualBannerSection sliders={sliders} onPostAdClick={handleOpenPostAdModal} />

      {/* ── PLACEMENT 1: TOP BODY UNIT ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AdSenseUnit slotId={ADSENSE_CONFIG.slots.sellBuyTop} />
      </div>

      {/* Popular Categories */}
      <PopularCategories categories={categories} isLoading={isLoading} />

      {/* Featured Sections from API */}
      {isLoading ? (
        <ItemSection isLoading={true} />
      ) : featuredSections.length > 0 ? (
        featuredSections.map((section) => (
          <ItemSection
            key={section._id || section.id || section.title}
            title={section.title || section.name || 'Featured Items'}
            items={section.section_data || []}
            viewAllHref="/sell-buy/categories"
          />
        ))
      ) : (
        allFeatured.length > 0 && (
          <ItemSection
            title="Featured Items"
            items={allFeatured}
            viewAllHref="/sell-buy/categories?featured=true"
          />
        )
      )}

      {/* ── PLACEMENT 2: IN-FEED / MID-BODY UNIT ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AdSenseUnit slotId={ADSENSE_CONFIG.slots.sellBuyFeed} />
      </div>

      {/* Fresh Recommendations / All Items */}
      <ItemSection
        title="Fresh Recommendations"
        items={recentListings}
        viewAllHref="/sell-buy/categories"
        isLoading={isLoading}
      />

      {/* Sell & Buy How It Works */}
      <SellBuyHowItWorks />

      <div className="pb-8" />

      {/* Full Marketplace Footer */}
      <KnowledgeSection vertical="sell-buy" showNewsletter={false} />

      <SellBuyFooter />

      {/* Post Ad Modal Popup */}
      <PostAdModal isOpen={isPostAdModalOpen} onClose={() => setIsPostAdModalOpen(false)} />

      {/* Introducing Marketplace Announcement Modal */}
      <IntroducingMarketplaceModal
        isOpen={isIntroModalOpen}
        onClose={handleDismissIntro}
        onPostAdClick={handleOpenPostAdModal}
      />
    </div>
  );
}
