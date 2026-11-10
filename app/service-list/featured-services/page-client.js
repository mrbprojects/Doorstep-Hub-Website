'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    Filter,
    X,
    Star,
    SlidersHorizontal,
    Check,
    Search,
    Sparkles,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { fetchFeaturedServices } from '@/lib/api';

const SORT_OPTIONS = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Customer Rating: High to Low' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
];

const appliancesTheme = {
    bgScrolled: 'bg-white/80',
    bgMobile: 'bg-white/95',
    textMain: 'text-[#037166]',
    textHover: 'text-[#037166]',
    border: 'border-gray-100',
    accent: 'bg-[#037166]',
    accentGradientFrom: 'from-[#037166]',
    accentGradientTo: 'to-[#04a99d]',
    buttonBg: 'bg-gray-50',
    isLight: true,
};

const footerTheme = {
    bg: 'from-white to-[#f8fafc]',
    borderTop: 'border-slate-200/80',
    accentGlow: '#037166',
    accentColor: '#037166',
    accentHover: '#04a99d',
    accentGradientFrom: 'from-[#037166]',
    accentGradientTo: 'to-[#04a99d]',
    headingGradient: 'from-[#037166] via-[#025951] to-[#037166]',
    textMain: 'text-[#037166]',
    textMuted: 'text-[#2f6f69]',
    textSubtle: 'text-[#5f8f89]',
    textLink: 'text-[#2f6f69]',
    textLinkHover: 'hover:text-[#04a99d]',
    groupNameColor: 'text-[#037166]',
    dividerColor: 'text-[#9bc7c1]',
    socialBg: 'bg-[#eef8f6]',
    socialBorder: 'border-[#cfe8e3]',
    tooltipBg: 'bg-white border-[#cfe8e3]',
    tooltipText: 'text-[#037166]',
    iconBg: 'bg-[#eef8f6]',
    iconHoverBg: 'group-hover:bg-[#037166]/10',
    isLight: true,
};

export default function FeaturedServicesPageClient() {
    const router = useRouter();

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedCity, setSelectedCity] = useState('all');
    const [minRating, setMinRating] = useState(0);
    const [maxPrice, setMaxPrice] = useState(5000);
    const [sortBy, setSortBy] = useState('popular');
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    useEffect(() => {
        let active = true;
        fetchFeaturedServices()
            .then((data) => {
                if (active) {
                    setServices(Array.isArray(data) ? data : []);
                }
            })
            .catch((err) => {
                console.error('Error fetching featured services:', err);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    // Extract unique categories & cities
    const categories = useMemo(() => {
        const set = new Set();
        services.forEach((s) => {
            const cat = s.categoryName || s.category;
            if (cat) set.add(cat);
        });
        return ['all', ...Array.from(set)];
    }, [services]);

    const cities = useMemo(() => {
        const set = new Set();
        services.forEach((s) => {
            const city = s.cityName || s.city;
            if (city) set.add(city);
        });
        return ['all', ...Array.from(set)];
    }, [services]);

    // Filter & Sort
    const filteredServices = useMemo(() => {
        return services
            .filter((s) => {
                // Category filter
                if (selectedCategory !== 'all') {
                    const cat = s.categoryName || s.category;
                    if (cat !== selectedCategory) return false;
                }

                // City filter
                if (selectedCity !== 'all') {
                    const c = s.cityName || s.city;
                    if (c && c !== selectedCity) return false;
                }

                // Rating filter
                const rating = Number(s.rating || 4.5);
                if (minRating > 0 && rating < minRating) return false;

                // Price filter
                const price = Number(s.price || s.startingPrice || s.serviceCost || 99);
                if (price > maxPrice) return false;

                // Search query
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    const title = (s.serviceName || s.title || '').toLowerCase();
                    const desc = (s.description || '').toLowerCase();
                    const cat = (s.categoryName || '').toLowerCase();
                    if (!title.includes(q) && !desc.includes(q) && !cat.includes(q)) return false;
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'rating') {
                    return Number(b.rating || 4.5) - Number(a.rating || 4.5);
                }
                if (sortBy === 'price_asc') {
                    const pA = Number(a.price || a.startingPrice || a.serviceCost || 99);
                    const pB = Number(b.price || b.startingPrice || b.serviceCost || 99);
                    return pA - pB;
                }
                if (sortBy === 'price_desc') {
                    const pA = Number(a.price || a.startingPrice || a.serviceCost || 99);
                    const pB = Number(b.price || b.startingPrice || b.serviceCost || 99);
                    return pB - pA;
                }
                return 0; // default popular
            });
    }, [services, selectedCategory, selectedCity, minRating, maxPrice, searchQuery, sortBy]);

    const handleServiceClick = (service) => {
        if (service.slug) {
            router.push(`/${service.slug}`);
            return;
        }
        const serviceId = service._id || service.id;
        const cat = encodeURIComponent(service.categoryName || 'Appliance Repair');
        const sub = encodeURIComponent(service.subcategoryName || 'General');
        router.push(`/appliances/detail/${serviceId}?category=${cat}&subCategory=${sub}`);
    };

    const resetFilters = () => {
        setSelectedCategory('all');
        setSelectedCity('all');
        setMinRating(0);
        setMaxPrice(5000);
        setSortBy('popular');
        setSearchQuery('');
    };

    const hasActiveFilters =
        selectedCategory !== 'all' ||
        selectedCity !== 'all' ||
        minRating > 0 ||
        maxPrice < 5000 ||
        searchQuery.trim() !== '';

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Header theme={appliancesTheme} />

            <main className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
                {/* Hero / Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
                                <Sparkles className="w-3.5 h-3.5 text-[#037166]" />
                                <span>Verified Doorstep Professionals</span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black text-gray-950">
                                Featured Services
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
                                Explore top-rated repair, maintenance, and installation services with guaranteed background-verified technicians and standard pricing.
                            </p>
                        </div>

                        {/* Search & Mobile Filter Toggle */}
                        <div className="flex items-center gap-2.5 w-full md:w-auto">
                            <div className="relative flex-1 md:w-72">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search featured services..."
                                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white focus:border-[#037166] focus:ring-2 focus:ring-[#037166]/20 focus:outline-none transition-all shadow-xs"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setMobileFilterOpen(true)}
                                className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold shadow-xs active:scale-95"
                            >
                                <Filter className="w-4 h-4 text-[#037166]" />
                                <span>Filters</span>
                                {hasActiveFilters && (
                                    <span className="w-2 h-2 rounded-full bg-[#037166]" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Quick Category Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 scrollbar-none">
                        {categories.map((cat) => {
                            const isSelected = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                                        isSelected
                                            ? 'bg-[#037166] text-white border-[#037166] shadow-xs'
                                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                                    }`}
                                >
                                    {cat === 'all' ? 'All Categories' : cat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content: Sidebar Filter (Desktop) + Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Desktop Sidebar Filter */}
                    <aside className="hidden lg:block lg:col-span-1 space-y-6 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs h-fit sticky top-28">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-[#037166]" />
                                <span>Filter Services</span>
                            </h3>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="text-xs font-semibold text-[#037166] hover:underline"
                                >
                                    Reset All
                                </button>
                            )}
                        </div>

                        {/* Sort By */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-gray-50 focus:border-[#037166] focus:outline-none"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* City Filter */}
                        {cities.length > 2 && (
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    City / Location
                                </label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-gray-50 focus:border-[#037166] focus:outline-none"
                                >
                                    {cities.map((city) => (
                                        <option key={city} value={city}>
                                            {city === 'all' ? 'All Cities' : city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Rating Filter */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Customer Rating
                            </label>
                            <div className="space-y-1.5">
                                {[4.5, 4.0, 3.5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setMinRating(minRating === star ? 0 : star)}
                                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all border ${
                                            minRating === star
                                                ? 'bg-amber-50/70 border-amber-300 text-amber-900 ring-1 ring-amber-300'
                                                : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                                        }`}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                            <span>{star} &amp; above</span>
                                        </span>
                                        {minRating === star && <Check className="w-3.5 h-3.5 text-amber-700" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Max Price
                                </label>
                                <span className="text-xs font-extrabold text-[#037166]">₹{maxPrice}</span>
                            </div>
                            <input
                                type="range"
                                min="99"
                                max="5000"
                                step="100"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="w-full accent-[#037166]"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>₹99</span>
                                <span>₹5,000+</span>
                            </div>
                        </div>
                    </aside>

                    {/* Services Grid */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-gray-500">
                                Showing {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
                            </span>
                        </div>

                        {loading ? (
                            <div className="py-24 flex flex-col items-center justify-center text-gray-400 space-y-3">
                                <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
                                <p className="text-xs font-semibold">Loading featured services...</p>
                            </div>
                        ) : filteredServices.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center shadow-xs">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-3 text-gray-400">
                                    <Sparkles className="w-7 h-7 text-[#037166]" />
                                </div>
                                <h3 className="text-base font-extrabold text-gray-900">
                                    No services match your filters
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-4">
                                    Try clearing selected filters or searching for another term.
                                </p>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="px-4 py-2 rounded-xl bg-[#037166] text-white text-xs font-bold hover:bg-[#025c53] transition-all"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredServices.map((service) => {
                                    const title = service.serviceName || service.title || 'Appliance Service';
                                    const category = service.categoryName || 'Appliance Repair';
                                    const price = service.price || service.startingPrice || service.serviceCost || 99;
                                    const rating = service.rating || 4.8;
                                    const image = service.mainImage
                                        ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.mainImage}`
                                        : service.image || 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=500';

                                    return (
                                        <motion.div
                                            key={service._id || service.id || title}
                                            layout
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#037166]/40 transition-all flex flex-col justify-between"
                                        >
                                            <div
                                                onClick={() => handleServiceClick(service)}
                                                className="cursor-pointer"
                                            >
                                                {/* Image Container */}
                                                <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100">
                                                    <Image
                                                        src={image}
                                                        alt={title}
                                                        fill
                                                        unoptimized
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                                                        {category}
                                                    </span>
                                                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-gray-900 text-[11px] font-extrabold flex items-center gap-1 shadow-xs">
                                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                        <span>{rating}</span>
                                                    </div>
                                                </div>

                                                {/* Card Content */}
                                                <div className="p-4 space-y-2">
                                                    <h3 className="text-sm font-extrabold text-gray-900 line-clamp-1 group-hover:text-[#037166] transition-colors">
                                                        {title}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 line-clamp-2">
                                                        {service.description || 'Doorstep inspection, genuine spare parts, and 30-day service warranty.'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Footer / CTA */}
                                            <div className="p-4 pt-2 border-t border-gray-100 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] text-gray-400 font-medium block">Starting from</span>
                                                    <span className="text-base font-black text-gray-950">₹{price}</span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleServiceClick(service)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#037166] hover:bg-[#025c53] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                                                >
                                                    <span>Book</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Mobile Filter Sheet */}
            <AnimatePresence>
                {mobileFilterOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileFilterOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                            className="relative bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 space-y-5 shadow-2xl z-10"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <h3 className="text-base font-extrabold text-gray-950 flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-[#037166]" />
                                    <span>Filter &amp; Sort</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setMobileFilterOpen(false)}
                                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Sort Options */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Sort By
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SORT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setSortBy(opt.value)}
                                            className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                                                sortBy === opt.value
                                                    ? 'bg-[#037166] text-white border-[#037166]'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Apply Button */}
                            <div className="pt-2 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMobileFilterOpen(false)}
                                    className="flex-1 py-3 rounded-xl bg-[#037166] text-white text-xs font-bold shadow-md"
                                >
                                    Apply ({filteredServices.length})
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer theme={footerTheme} />
        </div>
    );
}
