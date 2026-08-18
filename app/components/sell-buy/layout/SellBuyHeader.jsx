'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Search,
  MessageSquare,
  Heart,
  Bell,
  User,
  Plus,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { PostAdModal } from '@/components/sell-buy/PostAdModal';

export function SellBuyHeader({ onPostAdClick }) {
  const router = useRouter();
  const { user, token } = useAuth() || {};
  const { openAuthModal } = useAuthModal() || {};

  const [selectedLocation, setSelectedLocation] = useState('Bangalore, 560001');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalModalOpen, setInternalModalOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tok = token || localStorage.getItem('auth_token');
      setIsLoggedIn(!!tok);
      const stored = user || localStorage.getItem('user_details') || localStorage.getItem('user');
      if (typeof stored === 'string') {
        try {
          setActiveUser(JSON.parse(stored));
        } catch (e) {}
      } else if (typeof stored === 'object') {
        setActiveUser(stored);
      }
    }
  }, [token, user]);

  const handlePostAd = () => {
    if (onPostAdClick) {
      onPostAdClick();
    } else {
      setInternalModalOpen(true);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/sell-buy/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm font-sans">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/sell-buy" className="flex items-center gap-1 flex-shrink-0">
            <div className="relative w-40 sm:w-48 h-12">
              <Image
                src="/d-hub-logo.png"
                alt="D-Hub Doorstep Hub"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Location Selector */}
          <div className="hidden lg:flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 hover:bg-slate-100/80 transition-colors cursor-pointer text-xs font-semibold text-slate-700 flex-shrink-0">
            <MapPin className="w-4 h-4 text-[#037166]" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 font-medium leading-none">Deliver to</span>
              <span className="truncate max-w-[130px] font-bold text-slate-800">{selectedLocation}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>

          {/* Global Search Bar with Category Select */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-2xl border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#037166] focus-within:border-transparent bg-white shadow-inner">
            <input
              type="text"
              placeholder="Search for cars, mobiles, laptops and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 py-2.5 px-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <div className="h-6 w-[1px] bg-slate-200" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-600 px-3 py-2.5 focus:outline-none cursor-pointer border-none"
            >
              <option value="All Categories">All Categories</option>
              <option value="mobiles">Mobiles</option>
              <option value="cars">Cars & Bikes</option>
              <option value="property">Property</option>
              <option value="electronics">Electronics</option>
            </select>
            <button
              type="submit"
              className="bg-[#037166] hover:bg-[#025951] text-white px-4 py-2.5 flex items-center justify-center transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Action Links & CTAs */}
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            <Link href="/sell-buy/chat" className="hidden sm:flex flex-col items-center text-slate-600 hover:text-[#037166] transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-0.5">Chat</span>
            </Link>

            <Link href="/sell-buy/dashboard/favorites" className="hidden sm:flex flex-col items-center text-slate-600 hover:text-[#037166] transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-0.5">Favorites</span>
            </Link>

            <button className="hidden sm:flex flex-col items-center text-slate-600 hover:text-[#037166] transition-colors relative">
              <div className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
              </div>
              <span className="text-[10px] font-semibold mt-0.5">Notifications</span>
            </button>

            {isLoggedIn ? (
              <Link href="/sell-buy/dashboard" className="hidden sm:flex items-center gap-2 text-slate-700 hover:text-[#037166] transition-colors pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-[#037166] text-white text-xs font-black flex items-center justify-center shadow-xs">
                  {activeUser?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {activeUser?.name || 'My Account'}
                  </span>
                  <span className="text-[10px] text-[#037166] font-bold">Seller Dashboard</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => (openAuthModal ? openAuthModal() : router.push('/sell-buy/dashboard'))}
                className="hidden sm:flex items-center gap-2 text-slate-700 hover:text-[#037166] transition-colors pl-2 border-l border-slate-200 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight">Login / Register</span>
                  <span className="text-[10px] text-slate-400 font-medium">My Account</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
              </button>
            )}

            {/* SELL NOW CTA Button */}
            <button
              type="button"
              onClick={handlePostAd}
              className="bg-[#037166] hover:bg-[#025951] text-white font-extrabold text-xs tracking-wider px-5 py-2.5 rounded-md shadow-sm transition-all flex items-center gap-1.5 transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>POST AD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Navbar */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-md px-3 py-1.5 text-slate-700 font-bold transition-colors">
              <Menu className="w-4 h-4 text-[#037166]" />
              <span>Categories</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            <nav className="hidden md:flex items-center gap-6 text-slate-700">
              <Link href="/sell-buy" className="hover:text-[#037166] text-[#037166] font-bold transition-colors">Home</Link>
              <Link href="/sell-buy/categories" className="hover:text-[#037166] transition-colors">Buy</Link>
              <Link href="/sell-buy/categories" className="hover:text-[#037166] transition-colors">Latest Ads</Link>
              <Link href="/sell-buy/categories" className="hover:text-[#037166] transition-colors">Top Sellers</Link>
              <Link href="/sell-buy/help" className="hover:text-[#037166] transition-colors">Help & Support</Link>
            </nav>
          </div>
        </div>
      </div>

      <PostAdModal isOpen={internalModalOpen} onClose={() => setInternalModalOpen(false)} />
    </header>
  );
}
