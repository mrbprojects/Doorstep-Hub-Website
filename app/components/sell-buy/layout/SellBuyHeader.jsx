'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchSystemSettings, getImageUrl, fetchSellBuyListings, fetchSellBuyCategories } from '@/lib/sellBuyApi';
import { GOOGLE_MAPS_API_KEY } from '@/config/env';
import { ChevronLeft, ChevronRight, MapPin, Search, Plus, Globe, Menu, ShoppingBag, Sparkles, Tag, ShieldCheck, Grid, Loader2, SearchX, X, ArrowRight, Navigation, ChevronDown, Check } from 'lucide-react';
import { PostAdModal } from '@/components/sell-buy/PostAdModal';

export function SellBuyHeader({ categories: propCategories, onPostAdClick, settings: propSettings }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [activeHoverCat, setActiveHoverCat] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [systemSettings, setSystemSettings] = useState(propSettings || null);
  const [categories, setCategories] = useState(propCategories || []);
  const [internalModalOpen, setInternalModalOpen] = useState(false);

  // Live Search States
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);

  const displayCategories = categories || [];

  // Location States
  const [userLocation, setUserLocation] = useState('Hyderabad');
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tok = localStorage.getItem('auth_token');
      setAuthToken(tok);
      const savedLoc = localStorage.getItem('user_location');
      if (savedLoc) setUserLocation(savedLoc);
    }
  }, []);

  useEffect(() => {
    if (!systemSettings) {
      fetchSystemSettings().then((res) => {
        if (res) setSystemSettings(res);
      });
    }
  }, [systemSettings]);

  useEffect(() => {
    if (!propCategories || propCategories.length === 0) {
      fetchSellBuyCategories().then((res) => {
        if (res && res.length > 0) setCategories(res);
      });
    } else {
      setCategories(propCategories);
    }
  }, [propCategories]);

  // Google Maps API Live Geocoding Function
  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const key = GOOGLE_MAPS_API_KEY || systemSettings?.place_api_key || '';
          
          let detectedCity = '';

          // 1. Try Google Maps Geocoding API
          try {
            const gRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${key}`);
            const gData = await gRes.json();
            if (gData.status === 'OK' && gData.results?.[0]) {
              const comp = gData.results[0].address_components;
              const sublocality = comp.find(c => c.types.includes('sublocality') || c.types.includes('neighborhood'))?.long_name;
              const locality = comp.find(c => c.types.includes('locality'))?.long_name || comp.find(c => c.types.includes('administrative_area_level_2'))?.long_name;
              detectedCity = sublocality && locality ? `${sublocality}, ${locality}` : (locality || sublocality || '');
            }
          } catch (err) {
            console.error('Google Maps API Reverse Geocode error:', err);
          }

          // 2. Fallback to OpenStreetMap Reverse Geocoding
          if (!detectedCity) {
            const osmRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const osmData = await osmRes.json();
            const sub = osmData.address?.suburb || osmData.address?.neighbourhood || '';
            const cty = osmData.address?.city || osmData.address?.town || osmData.address?.state_district || 'Hyderabad';
            detectedCity = sub ? `${sub}, ${cty}` : cty;
          }

          const finalLocation = detectedCity || 'Hyderabad';
          setUserLocation(finalLocation);
          localStorage.setItem('user_location', finalLocation);
          localStorage.setItem('user_lat', String(latitude));
          localStorage.setItem('user_lng', String(longitude));
        } catch (err) {
          console.error('Error reverse geocoding:', err);
          setUserLocation('Hyderabad');
        } finally {
          setIsLocating(false);
          setLocationMenuOpen(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setUserLocation('Hyderabad');
        setIsLocating(false);
        setLocationMenuOpen(false);
      }
    );
  };

  const handlePostAd = () => {
    if (onPostAdClick) {
      onPostAdClick();
    } else {
      setInternalModalOpen(true);
    }
  };

  // Dynamic Logo URL from System Settings API
  const dynamicLogoPath = systemSettings?.web_header_logo || systemSettings?.header_logo || '/d-hub-logo.png';
  const logoUrl = dynamicLogoPath.startsWith('/') && !dynamicLogoPath.startsWith('/uploads') ? dynamicLogoPath : getImageUrl(dynamicLogoPath);

  // Dynamic Live Search Effect (Debounced 300ms with Location Coordinates)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchPopoverOpen(false);
      return;
    }

    setIsSearching(true);
    setSearchPopoverOpen(true);

    const timer = setTimeout(async () => {
      try {
        const lat = typeof window !== 'undefined' ? localStorage.getItem('user_lat') : null;
        const lng = typeof window !== 'undefined' ? localStorage.getItem('user_lng') : null;
        const searchParams = { search: q, limit: 6 };
        if (lat && lng) {
          searchParams.latitude = lat;
          searchParams.longitude = lng;
        }
        const res = await fetchSellBuyListings(searchParams);
        setSearchResults(res?.listings || []);
      } catch (err) {
        console.error('Live search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchPopoverOpen(false);
    router.push(`/sell-buy/categories?search=${encodeURIComponent(searchQuery)}&cat=${selectedCat}`);
  };

  const handleCategoryClick = (catSlug, subSlug = null) => {
    setCatDropdownOpen(false);
    setSearchPopoverOpen(false);
    if (subSlug) {
      router.push(`/sell-buy/${catSlug}?sub=${subSlug}`);
    } else {
      router.push(`/sell-buy/${catSlug}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-3">
          {/* Dynamic DoorstepHub Logo from System Settings */}
          <Link href="/sell-buy" className="flex-shrink-0 flex items-center gap-3">
            <div className="relative w-36 sm:w-44 h-10">
              <Image
                src={logoUrl}
                alt="DoorstepHub Logo"
                fill
                className="object-contain object-left"
                priority
                unoptimized
              />
            </div>
          </Link>

          {/* Search Form & Dynamic Live Search Popover Container */}
          <div className="relative flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#037166]">
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
                  onFocus={() => { if (searchQuery.trim().length >= 2) setSearchPopoverOpen(true); }}
                  className="flex-1 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchPopoverOpen(false); }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button type="submit" className="bg-[#037166] hover:bg-[#025850] text-white px-5 py-2.5 transition-colors font-bold text-sm">
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* DYNAMIC LIVE SEARCH DROPDOWN OVERLAY (SLEEK & NEAT DESIGN) */}
            {searchPopoverOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-xs font-sans ring-1 ring-black/5">
                {isSearching ? (
                  <div className="p-6 text-center text-slate-500 space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#037166] mx-auto" />
                    <p className="font-semibold text-xs text-slate-700">Searching marketplace for &quot;{searchQuery}&quot;...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  /* Matching Results List */
                  <div className="divide-y divide-slate-100">
                    <div className="px-4 py-2 bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 flex items-center justify-between">
                      <span>Matching Ads ({searchResults.length})</span>
                      <button onClick={() => setSearchPopoverOpen(false)} className="hover:text-slate-700 text-xs font-bold">✕ Close</button>
                    </div>
                    {searchResults.map((item) => (
                      <Link
                        key={item._id || item.id || item.slug}
                        href={`/sell-buy/ad/${item.slug}`}
                        onClick={() => setSearchPopoverOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#037166]/5 transition-colors group"
                      >
                        <img
                          src={getImageUrl(item.images?.[0] || item.coverImage || item.image)}
                          alt={item.name || item.title}
                          className="w-11 h-11 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#037166] truncate">
                            {item.name || item.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                            {item.location?.city || item.city || 'Hyderabad'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-sm text-[#037166]">₹{Number(item.price || 0).toLocaleString()}</span>
                        </div>
                      </Link>
                    ))}
                    <div className="p-2.5 bg-slate-50 text-center">
                      <button
                        onClick={handleSearch}
                        className="text-xs font-bold text-[#037166] hover:underline inline-flex items-center gap-1"
                      >
                        View all results for &quot;{searchQuery}&quot; <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* SLEEK NO RESULTS STATE + POPULAR CATEGORIES BELOW */
                  <div>
                    {/* Header Banner */}
                    <div className="p-5 text-center bg-gradient-to-b from-slate-50/80 to-white border-b border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-amber-100/80 text-amber-600 flex items-center justify-center mx-auto mb-2">
                        <SearchX className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        No results found for &quot;<span className="text-[#037166] font-black">{searchQuery}</span>&quot;
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                        We couldn&apos;t find any matching ads. Check your spelling or browse popular categories below:
                      </p>
                    </div>

                    {/* Related Categories Grid */}
                    <div className="p-4 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wide">
                          Explore Popular Categories
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Click to browse</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {displayCategories.slice(0, 6).map((cat) => (
                          <button
                            key={cat._id || cat.id || cat.slug}
                            type="button"
                            onClick={() => handleCategoryClick(cat.slug)}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white hover:bg-[#037166]/10 border border-slate-200/80 hover:border-[#037166] text-xs font-bold text-slate-800 transition-all text-left shadow-xs group"
                          >
                            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center text-[10px] font-black text-[#037166]">
                              {cat.image ? (
                                <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" />
                              ) : (
                                cat.name?.[0]?.toUpperCase()
                              )}
                            </div>
                            <span className="truncate group-hover:text-[#037166]">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Interactive Location Selector Pill Button & Dropdown */}
            <div className="relative shrink-0 font-sans">
              <button
                type="button"
                onClick={() => setLocationMenuOpen(!locationMenuOpen)}
                className="hidden md:flex items-center gap-2 bg-slate-50 hover:bg-[#037166]/10 border border-slate-200 hover:border-[#037166] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-xs group"
              >
                <MapPin className="w-4 h-4 text-[#037166] shrink-0" />
                <span className="truncate max-w-[110px]">{userLocation || 'Add Location'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#037166] transition-transform" />
              </button>

              {locationMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 p-4 space-y-3.5 text-xs ring-1 ring-black/5 font-sans">
                  {/* Header Title */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Select Your Location</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Find verified ads near your city</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocationMenuOpen(false)}
                      className="text-slate-400 hover:text-slate-700 font-bold p-1"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Search City Filter */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search city or locality..."
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-xs text-slate-800 placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  {/* Google Maps Live GPS Location Button */}
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#037166] hover:bg-[#025850] text-white font-extrabold shadow-sm transition-all text-xs"
                  >
                    <Navigation className={`w-4 h-4 shrink-0 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Detecting via Google Maps API...' : 'Use Current Location'}</span>
                  </button>

                  {/* Popular Cities Grid */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-0.5">
                      Popular Cities
                    </span>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad']
                        .filter(c => c.toLowerCase().includes(citySearchQuery.toLowerCase()))
                        .map((city) => {
                          const isSelected = userLocation.toLowerCase().includes(city.toLowerCase());
                          return (
                            <button
                              key={city}
                              type="button"
                              onClick={() => {
                                setUserLocation(city);
                                if (typeof window !== 'undefined') localStorage.setItem('user_location', city);
                                setLocationMenuOpen(false);
                              }}
                              className={`p-2.5 rounded-xl text-left font-bold text-xs flex items-center justify-between transition-all border ${
                                isSelected
                                  ? 'bg-[#037166]/10 text-[#037166] border-[#037166]'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70'
                              }`}
                            >
                              <span className="truncate">{city}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#037166] shrink-0" />}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Auth Header */}
            {authToken ? (
              <Link href="/sell-buy/dashboard" className="hidden md:flex items-center gap-2 text-sm text-gray-700 hover:text-[#037166] font-semibold transition-colors bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <div className="w-6 h-6 rounded-full bg-[#037166] text-white text-xs font-bold flex items-center justify-center">
                  ✓
                </div>
                <span className="text-xs font-bold text-gray-800">My Account</span>
              </Link>
            ) : (
              <Link href="/sell-buy/dashboard" className="hidden md:block text-sm text-gray-700 hover:text-[#037166] font-semibold transition-colors">
                Login / Register
              </Link>
            )}

            <button
              type="button"
              onClick={handlePostAd}
              className="bg-[#037166] hover:bg-[#025850] text-white font-bold text-sm px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Post a Ad</span>
            </button>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-1.5">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Category Navigation Bar with Categories Dropdown & Round Image Icons */}
      <div className="border-t border-gray-100 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-3.5">
            {/* Left Side: All Categories Popover Menu */}
            <div className="relative shrink-0" onMouseLeave={() => { setCatDropdownOpen(false); setActiveHoverCat(null); }}>
              <button
                type="button"
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                onMouseEnter={() => setCatDropdownOpen(true)}
                className="flex items-center gap-1.5 bg-[#037166]/10 text-[#037166] hover:bg-[#037166]/20 font-extrabold text-xs px-3.5 py-2 rounded-lg transition-colors border border-[#037166]/20"
              >
                <Grid className="w-4 h-4" />
                <span>Categories</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${catDropdownOpen ? 'rotate-90' : ''}`} />
              </button>

              {/* Subcategories Hover Popover (2-Panel Flyout Mega Menu) */}
              {catDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 flex bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden text-xs font-semibold text-gray-800">
                  {/* Left Panel: Primary Categories */}
                  <div className="w-60 py-2 border-r border-gray-100 bg-gray-50/50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-1.5 border-b border-gray-200/60 text-[10px] font-extrabold uppercase text-gray-400">
                      All Categories
                    </div>
                    {displayCategories.map((cat) => {
                      const isHovered = (activeHoverCat || displayCategories[0]?.slug) === cat.slug;
                      return (
                        <div
                          key={cat._id || cat.id || cat.slug}
                          onMouseEnter={() => setActiveHoverCat(cat.slug)}
                          onClick={() => handleCategoryClick(cat.slug)}
                          className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-all ${
                            isHovered
                              ? 'bg-white text-[#037166] font-extrabold shadow-sm border-l-4 border-[#037166]'
                              : 'hover:bg-gray-100/60 text-gray-700 font-semibold'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {cat.image ? (
                              <img src={getImageUrl(cat.image)} alt={cat.name} className="w-5 h-5 rounded-full object-cover shrink-0 border border-gray-200" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-[#037166]/10 text-[#037166] text-[10px] font-black flex items-center justify-center shrink-0">
                                {cat.name?.[0]}
                              </div>
                            )}
                            <span className="truncate">{cat.name}</span>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 ${isHovered ? 'text-[#037166]' : 'text-gray-400'}`} />
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Panel: Subcategories for Hovered Category */}
                  <div className="w-64 p-4 bg-white max-h-96 overflow-y-auto min-h-[260px]">
                    {(() => {
                      const selectedCatObj = displayCategories.find(
                        (c) => c.slug === (activeHoverCat || displayCategories[0]?.slug)
                      ) || displayCategories[0];

                      if (!selectedCatObj) return null;

                      // Use strictly dynamic subcategories from API
                      const subcats = selectedCatObj.subcategories || selectedCatObj.children || [];

                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <h4 className="font-extrabold text-sm text-gray-900">{selectedCatObj.name}</h4>
                            <span className="text-[10px] text-[#037166] font-extrabold uppercase">Subcategories</span>
                          </div>
                          <div className="space-y-1">
                            {subcats.length > 0 ? subcats.map((sub) => (
                              <div
                                key={sub._id || sub.id || sub.slug}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategoryClick(selectedCatObj.slug, sub.slug || sub.name);
                                }}
                                className="px-3 py-2 rounded-xl hover:bg-[#037166]/5 hover:text-[#037166] cursor-pointer transition-colors font-medium flex items-center justify-between group"
                              >
                                <span>{sub.name}</span>
                                <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-[#037166] transition-colors" />
                              </div>
                            )) : (
                              <div className="px-3 py-2 text-xs text-gray-500 font-medium">No subcategories available</div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Horizontal Categories Bar with Round Symbol Image Next to Name */}
            <div className="flex items-center gap-5 overflow-x-auto scrollbar-hide py-1 text-xs font-semibold text-gray-700">
              {displayCategories.map((cat) => (
                <button
                  key={cat._id || cat.id || cat.slug}
                  type="button"
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="whitespace-nowrap hover:text-[#037166] transition-colors flex items-center gap-2.5 shrink-0 py-1"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-[#037166]/10 flex items-center justify-center text-xs font-black text-[#037166]">
                    {cat.image ? (
                      <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      cat.name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PostAdModal isOpen={internalModalOpen} onClose={() => setInternalModalOpen(false)} />
    </header>
  );
}
