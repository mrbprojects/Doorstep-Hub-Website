'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ListingCard } from '@/components/sell-buy/cards/ListingCard';
import {
  fetchSellBuyCategories,
  fetchSellBuyListings,
  fetchFeaturedSections,
  fetchSliders,
  getImageUrl,
} from '@/lib/sellBuyApi';
import { ChevronLeft, ChevronRight, MapPin, Search, Plus, Globe, Menu } from 'lucide-react';

// ─── HEADER ─────────────────────────────────────────────────────────────────
function SellBuyTopHeader({ categories }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayCategories = categories || [];

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/sell-buy/categories?search=${encodeURIComponent(searchQuery)}&cat=${selectedCat}`);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-3">
          {/* Dynamic DoorstepHub Logo & Title */}
          <Link href="/sell-buy" className="flex-shrink-0 flex items-center gap-3">
            <div className="relative w-36 sm:w-44 h-10">
              <Image
                src="/d-hub-logo.png"
                alt="DoorstepHub Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden max-w-2xl bg-white focus-within:ring-2 focus-within:ring-[#00b2ca]">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="bg-gray-50 text-sm font-medium text-gray-700 px-3 py-2.5 border-r border-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {displayCategories.map((c) => (
                <option key={c._id || c.id || c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search for cars, mobiles, property, electronics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
            </div>
            <button type="submit" className="bg-[#00b2ca] hover:bg-[#0097ac] text-white px-5 py-2.5 transition-colors font-bold text-sm">
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#00b2ca] transition-colors font-medium">
              <MapPin className="w-4 h-4 text-[#00b2ca]" />
              <span>Add Location</span>
            </button>
            <Link href="/sell-buy/dashboard" className="hidden md:block text-sm text-gray-700 hover:text-[#00b2ca] font-semibold transition-colors">Login</Link>
            <Link href="/sell-buy/dashboard" className="hidden md:block text-sm text-gray-700 hover:text-[#00b2ca] font-semibold transition-colors">Register</Link>
            <Link
              href="/sell-buy/post-ad"
              className="bg-[#00b2ca] hover:bg-[#0097ac] text-white font-bold text-sm px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Ad Listing</span>
            </Link>
            <button className="hidden md:flex items-center gap-1 text-sm text-gray-700 font-medium border border-gray-200 rounded-md px-2 py-1.5">
              <Globe className="w-4 h-4 text-gray-500" />
              <span>en</span>
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-1.5">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Category Navigation Bar from Backend */}
      <div className="border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 overflow-x-auto py-2.5 scrollbar-hide text-sm font-medium text-gray-700">
            {displayCategories.map((cat) => (
              <Link
                key={cat._id || cat.id || cat.slug}
                href={`/sell-buy/category/${cat.slug}`}
                className="whitespace-nowrap hover:text-[#00b2ca] transition-colors flex items-center gap-1 py-1 shrink-0 font-semibold"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── HERO SLIDER (DYNAMIC BACKEND API & ADMIN CONTROLLED BANNERS) ────────────
function HeroSlider({ sliders }) {
  const [current, setCurrent] = useState(0);

  const defaultSlides = [
    { bg: '#00b2ca', image: null, title: 'Buy & Sell Anything', subtitle: 'Find great deals near you in your city', button_text: 'Post Free Ad', button_url: '/sell-buy/post-ad' },
    { bg: '#0f172a', image: null, title: 'Post Free Ads', subtitle: 'List in under 60 seconds and reach buyers instantly', button_text: 'Post Free Ad', button_url: '/sell-buy/post-ad' },
    { bg: '#1e293b', image: null, title: 'Connect Locally', subtitle: 'Trusted buyers & sellers near you', button_text: 'Post Free Ad', button_url: '/sell-buy/post-ad' },
  ];

  const slides = (sliders && sliders.length > 0) ? sliders : defaultSlides;

  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative overflow-hidden bg-gray-900 text-white" style={{ height: '420px' }}>
      {slides.map((slide, i) => {
        const bgImg = slide.image ? getImageUrl(slide.image) : null;
        return (
          <div
            key={slide.id || slide._id || i}
            className={`absolute inset-0 transition-opacity duration-700 flex items-center justify-center bg-cover bg-center ${
              i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={bgImg ? { backgroundImage: `url(${bgImg})` } : { backgroundColor: slide.bg || '#0f172a' }}
          >
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative z-10 text-center space-y-4 px-4 max-w-3xl">
              <h2 className="text-4xl sm:text-6xl font-black text-white drop-shadow-lg tracking-tight">
                {slide.title || 'Buy & Sell Anything'}
              </h2>
              <p className="text-lg sm:text-xl text-gray-200 font-medium drop-shadow">
                {slide.subtitle || 'Find great deals near you'}
              </p>
              <div className="pt-2">
                <Link
                  href={slide.button_url || slide.buttonUrl || '/sell-buy/post-ad'}
                  className="inline-flex items-center gap-2 bg-[#00b2ca] hover:bg-[#0097ac] text-white font-bold text-base px-8 py-3.5 rounded-xl transition-all shadow-xl hover:scale-105"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  {slide.button_text || slide.buttonText || 'Post Free Ad'}
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-[#00b2ca] text-white flex items-center justify-center transition-all shadow-lg z-20 backdrop-blur-md"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-[#00b2ca] text-white flex items-center justify-center transition-all shadow-lg z-20 backdrop-blur-md"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full transition-all ${i === current ? 'bg-[#00b2ca] w-7' : 'bg-white/50 w-2.5'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// ─── POPULAR CATEGORIES (DYNAMIC BACKEND API) ────────────────────────────────
function PopularCategories({ categories }) {
  const scrollRef = useRef(null);

  const displayCategories = categories || [];

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

  if (displayCategories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Popular Categories</h2>
          <p className="text-xs text-gray-500 font-medium">Browse verified listings by category</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="w-9 h-9 rounded-full bg-[#00b2ca] text-white flex items-center justify-center hover:bg-[#0097ac] transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollRight}
            className="w-9 h-9 rounded-full bg-[#00b2ca] text-white flex items-center justify-center hover:bg-[#0097ac] transition-colors shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {displayCategories.map((cat) => (
          <Link
            key={cat._id || cat.id || cat.slug}
            href={`/sell-buy/category/${cat.slug}`}
            className="flex flex-col items-center gap-3 shrink-0 group"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gray-200 p-1 bg-white group-hover:border-[#00b2ca] group-hover:scale-105 transition-all overflow-hidden flex items-center justify-center shadow-sm">
              {cat.image ? (
                <img
                  src={getImageUrl(cat.image)}
                  alt={cat.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#00b2ca]/10 text-[#00b2ca] flex items-center justify-center text-2xl font-black">
                  {cat.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm sm:text-base font-bold text-gray-800 text-center line-clamp-2 leading-tight max-w-[90px] group-hover:text-[#00b2ca] transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── ITEM SECTION ─────────────────────────────────────────────────────────────
function ItemSection({ title, items, viewAllHref }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">{title}</h2>
        <Link href={viewAllHref} className="text-sm font-bold text-[#00b2ca] hover:underline transition-colors">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {items.slice(0, 8).map((item) => (
          <ListingCard key={item._id || item.id} listing={item} />
        ))}
      </div>
    </section>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SellBuyHomePage() {
  const [categories, setCategories] = useState([]);
  const [sliders, setSliders] = useState([]);
  const [featuredSections, setFeaturedSections] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const allFeatured = recentListings.filter((l) => l.isFeatured || l.is_feature);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Header with DoorstepHub Logo & Categories */}
      <SellBuyTopHeader categories={categories} />

      {/* Dynamic Hero Slider (Admin Managed Banners) */}
      <HeroSlider sliders={sliders} />

      {/* Popular Categories */}
      <PopularCategories categories={categories} />

      {/* Featured Sections from API */}
      {featuredSections.length > 0 ? (
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

      {/* Fresh Recommendations / All Items */}
      <ItemSection
        title="Fresh Recommendations"
        items={recentListings}
        viewAllHref="/sell-buy/categories"
      />

      <div className="pb-16" />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 font-medium">
          <p>© {new Date().getFullYear()} DoorstepHub Buy & Sell Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
