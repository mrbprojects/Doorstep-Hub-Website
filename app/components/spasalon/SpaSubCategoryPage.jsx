'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, ChevronRight, ShieldCheck, Filter, X, MapPin, Search, Sliders, Sparkles, Award, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/pghostels/ui/button';
import { useLocationContext } from '@/context/LocationContext';
import { Slider } from '@/components/pghostels/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/pghostels/ui/sheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/pghostels/ui/input';
import {  resolveParam } from '@/utils/slugHelper';

export default function SpaSubCategoryPage({ slugOverride = null, initialData = null }) {
    const router = useRouter();
    const params = useParams();
    const slugOrId = slugOverride || params.slug || params.id;
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const categoryName = searchParams.get('category') || initialData?.categoryName || 'Services';
    const subCategoryName = searchParams.get('name') || initialData?.name || 'Service List';
    const categoryUniqueId = searchParams.get('categoryId') || initialData?.categoryId || null;

    const { location } = useLocationContext();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
    
    const [categories, setCategories] = useState([]);
    const [allSubCategories, setAllSubCategories] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState(categoryUniqueId);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // Filter State
    const [priceRange, setPriceRange] = useState(() => {
        const minP = searchParams.get('minPrice');
        const maxP = searchParams.get('maxPrice');
        return minP && maxP ? [parseInt(minP), parseInt(maxP)] : [0, 5000];
    });
    const [minRating, setMinRating] = useState(() => {
        const rating = searchParams.get('minRating');
        return rating ? parseFloat(rating) : 0;
    });

    const sortOptions = [
        'Recommended',
        'Highest Rated',
        'Price: Low to High',
        'Price: High to Low'
    ];
    const [sortBy, setSortBy] = useState('Recommended');

    const SERVICE_ID = '69524f4a57bb211ca094e5e6';
    const SERVICE_SLUG = 'spa-salon'; // Shared slug identifier

    // Sync state with URL params on navigation
    const [prevSearchParamsStr, setPrevSearchParamsStr] = useState(searchParams.toString());
    const currentParamsStr = searchParams.toString();
    if (prevSearchParamsStr !== currentParamsStr) {
        setPrevSearchParamsStr(currentParamsStr);
        const catId = searchParams.get('categoryId');
        if (catId && catId !== expandedCategory) {
            setExpandedCategory(catId);
        }
        const minP = searchParams.get('minPrice');
        const maxP = searchParams.get('maxPrice');
        if (minP && maxP) {
            setPriceRange([parseInt(minP), parseInt(maxP)]);
        }
        const rating = searchParams.get('minRating');
        if (rating) {
            setMinRating(parseFloat(rating));
        }
    }

    // Update URL when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentParams = new URLSearchParams(searchParams.toString());
            if (priceRange[0] !== 0 || priceRange[1] !== 5000) {
                currentParams.set('minPrice', priceRange[0]);
                currentParams.set('maxPrice', priceRange[1]);
            }
            if (minRating > 0) currentParams.set('minRating', minRating);
            
            const newSearch = currentParams.toString();
            if (newSearch !== searchParams.toString()) {
                router.replace(`${pathname}?${newSearch}`, { scroll: false });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [priceRange, minRating, pathname, router, searchParams]);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            setCategoriesLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serviceId: SERVICE_ID })
                });
                const data = await response.json();
                if (data.success && data.category) {
                    setCategories(data.category);
                }
            } catch (e) { console.error("Error fetching categories:", e); }
            finally { setCategoriesLoading(false); }
        };
        fetchCategories();
    }, []);

    // Fetch Subcategories for active category
    useEffect(() => {
        const fetchSubCategories = async () => {
            if (!expandedCategory) return;
            try {
                const apiPayload = resolveParam(expandedCategory, 'categoryId', 'categorySlug');
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(apiPayload)
                });
                const data = await response.json();
                if (data.success && data.data) {
                    setAllSubCategories(data.data);
                }
            } catch (e) { console.error("Error fetching subcategories:", e); }
        };
        fetchSubCategories();
    }, [expandedCategory]);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const lat = location?.lat?.toString() || "17.4483";
                const lng = location?.lng?.toString() || "78.3915";

                const subCategoryParam = resolveParam(slugOrId, 'subcategoryId', 'subcategorySlug');
                const serviceParam = { serviceSlug: SERVICE_SLUG };

                const payload = {
                    ...serviceParam,
                    ...subCategoryParam,
                    latitude: lat,
                    longitude: lng,
                    minPrice: priceRange[0],
                    maxPrice: priceRange[1],
                    minRating: minRating || undefined,
                    searchQuery: searchQuery || "",
                    sortBy: sortBy === 'Highest Rated' ? 'rating' : sortBy === 'Price: Low to High' ? 'price_low' : sortBy === 'Price: High to Low' ? 'price_high' : ''
                };

                if (searchParams.get('categoryId') || searchParams.get('categorySlug')) {
                    const catVal = searchParams.get('categoryId') || searchParams.get('categorySlug');
                    const catParam = resolveParam(catVal, 'categoryId', 'categorySlug');
                    Object.assign(payload, catParam);
                }

                // Add all other questionnaire answers
                searchParams.forEach((value, key) => {
                    if (!['categoryId', 'categorySlug', 'subcategoryId', 'subcategorySlug', 'minPrice', 'maxPrice', 'minRating', 'query', 'sortBy'].includes(key)) {
                        payload[key] = value;
                    }
                });

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/professional-services`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && Array.isArray(data.professionalServices)) {
                        const str = (val, fallback = '') => {
                            if (!val) return fallback;
                            if (typeof val === 'string') return val.trim() || fallback;
                            if (typeof val === 'object') return val.$oid || val._id || val.id || val.title || val.name || val.label || fallback;
                            return String(val) || fallback;
                        };

                        const num = (val, fallback = 0) => {
                            if (val === 0) return 0;
                            if (!val) return fallback;
                            if (typeof val === 'number') return val;
                            if (typeof val === 'object') return val.amount || val.value || fallback;
                            const parsed = parseFloat(val);
                            return isNaN(parsed) ? fallback : parsed;
                        };

                        setServices(data.professionalServices.map(s => {
                            const uniqueId = str(s?._id) || str(s?.id) || `srv-${Math.random()}`;
                            const img = s.image || s.logo || '';
                            const displayImage = img ? (img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img}`) : null;

                            return {
                                id: uniqueId,
                                slug: s.slug || uniqueId,
                                name: str(s.business_name) || str(s.serviceName) || `${str(s.firstName)} ${str(s.lastName)}`.trim() || 'Professional Expert',
                                provider: str(s.business_name) || 'Certified Partner',
                                price: num(s.startingAt) || num(s.minFare) || num(s.price) || 499,
                                rating: num(s.rating) || num(s.avgRating) || 4.8,
                                image: displayImage,
                                address: str(s.address) || str(s.location),
                                reviews: num(s.totalOrders)
                            };
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchServices();
        }, 500);
        return () => clearTimeout(timer);
    }, [slugOrId, location, priceRange, minRating, searchQuery, sortBy, searchParams]);

    const sortedServices = useMemo(() => {
        let result = [...services];
        if (minRating > 0) {
            result = result.filter(s => s.rating >= minRating);
        }
        return result;
    }, [services, minRating]);

    const renderFilterPanel = (showTitle = true) => {
        return (
            <div className="space-y-6 text-gray-900">
                {showTitle && (
                    <h4 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[#00796B]" />
                        <span>Filters</span>
                    </h4>
                )}

                {/* Categories Section */}
                <div className="mb-6 border-b border-gray-100 pb-5">
                    <h6 className="block text-gray-500 mb-3 text-xs font-bold uppercase tracking-wider">Service Categories</h6>
                    <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                        {categories.map((cat) => {
                            const catTarget = cat.slug || cat._id;
                            const isCatActive = expandedCategory === catTarget || catTarget === searchParams.get('categoryId');
                            return (
                                <div key={cat._id} className="overflow-hidden">
                                    <button
                                        onClick={() => {
                                            if (expandedCategory === catTarget) setExpandedCategory(null);
                                            else setExpandedCategory(catTarget);
                                        }}
                                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all duration-200 ${
                                            isCatActive
                                            ? 'bg-[#00796B]/10 text-[#00796B] font-bold border border-[#00796B]/30 shadow-sm' 
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-[#00796B] border border-transparent font-medium'
                                        }`}
                                    >
                                        <span className="truncate">{cat.name}</span>
                                        {expandedCategory === catTarget ? (
                                            <ChevronRight className="w-4 h-4 rotate-90 transition-transform text-[#00796B] shrink-0" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {expandedCategory === catTarget && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pl-4 pr-1 py-1.5 space-y-1 mt-1 border-l-2 border-[#00796B]/20 ml-3">
                                                    {allSubCategories.map(sub => {
                                                        const subTarget = sub.slug || sub._id;
                                                        const isSubActive = slugOrId === subTarget;
                                                        return (
                                                            <button
                                                                key={sub._id}
                                                                onClick={() => {
                                                                    router.push(`/spa-salon/${subTarget}`);
                                                                }}
                                                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all truncate ${
                                                                    isSubActive
                                                                    ? 'bg-[#00796B] text-white shadow-sm'
                                                                    : 'text-gray-600 hover:text-[#00796B] hover:bg-[#00796B]/5'
                                                                }`}
                                                            >
                                                                {sub.name}
                                                            </button>
                                                        );
                                                    })}
                                                    {allSubCategories.length === 0 && (
                                                        <div className="text-center py-2">
                                                            <div className="w-4 h-4 border-2 border-[#00796B]/20 border-t-[#00796B] rounded-full animate-spin mx-auto" />
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                        {categoriesLoading && (
                            <div className="text-center py-4">
                                <div className="w-5 h-5 border-2 border-[#00796B]/20 border-t-[#00796B] rounded-full animate-spin mx-auto" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Price Range */}
                <div className="mb-6 border-b border-gray-100 pb-5">
                    <h6 className="block text-gray-500 mb-3 text-xs font-bold uppercase tracking-wider">Price Range</h6>
                    <div className="px-1">
                        <Slider
                            defaultValue={[0, 5000]}
                            min={0}
                            max={10000}
                            step={100}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            className="mb-3.5 [&_[data-slot=slider-track]]:bg-gray-200 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-[#00796B] [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-[#00796B] [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-md"
                        />
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600">
                        <span>Min ₹{priceRange[0].toLocaleString('en-IN')}</span>
                        <span>Max ₹{priceRange[1].toLocaleString('en-IN')}</span>
                    </div>
                </div>

                {/* Minimum Rating */}
                <div className="mb-6 border-b border-gray-100 pb-5">
                    <h6 className="block text-gray-500 mb-3 text-xs font-bold uppercase tracking-wider">Minimum Rating</h6>
                    <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                                key={rating}
                                onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                                className={`h-9 rounded-xl flex items-center justify-center border transition-all text-xs font-bold ${
                                    minRating === rating 
                                    ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300 shadow-xs'
                                }`}
                            >
                                <span>{rating}</span>
                                <Star className={`w-3 h-3 ml-0.5 ${minRating === rating ? 'fill-white' : 'fill-amber-400 text-amber-400'}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reset Button */}
                <button 
                    className="w-full mt-3 border border-gray-200 text-gray-600 hover:text-[#00796B] hover:border-[#00796B]/30 hover:bg-[#00796B]/5 h-9 text-xs font-bold rounded-xl gap-2 transition-all flex items-center justify-center shadow-xs"
                    onClick={() => {
                        setPriceRange([0, 5000]);
                        setMinRating(0);
                        router.push(pathname);
                    }}
                >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                </button>
            </div>
        );
    };

    const schemaData = sortedServices.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `${subCategoryName} Experts in ${location?.city || 'Your Area'}`,
        "description": `Top-rated ${subCategoryName} specialists and salon packages.`,
        "itemListElement": sortedServices.map((service, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": service.name,
            "url": typeof window !== 'undefined' ? `${window.location.origin}/spa-salon/${service.slug || service.id}` : ""
        }))
    } : null;

    return (
        <div className="min-h-screen bg-[#F6F7FB] overflow-x-hidden w-full max-w-full">
            {schemaData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                />
            )}
            <div className="bg-gradient-to-br from-[#00473e] via-[#01655b] to-[#003932] pt-24 sm:pt-28 pb-12 sm:pb-16 relative overflow-hidden text-white shadow-inner w-full">
                {/* Decorative background circles */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute top-1/2 right-12 w-80 h-80 rounded-full border border-dashed border-white/10 pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    {/* Back button */}
                    <div className="mb-4 sm:mb-6">
                        <button
                            onClick={() => router.push('/spa-salon')}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-gray-900 hover:bg-slate-100 text-xs font-bold shadow-md transition-all group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                            <span>Back to Spa & Salon</span>
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="max-w-3xl">
                            {/* Category Eyebrow */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-teal-100 mb-3">
                                <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                                <span>DOORSTEP HUB • {categoryName.toUpperCase()}</span>
                            </div>

                            {/* Service / Subcategory Title */}
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                                {subCategoryName}
                            </h1>
                            <div className="w-16 h-1 bg-[#f59e0b] rounded-full mt-2.5 mb-3" />

                            <p className="text-white/85 text-xs sm:text-sm max-w-2xl leading-relaxed mb-5">
                                Verified salon specialists, doorstep beauty care, and salon treatments at transparent rates with hygienic equipment.
                            </p>

                            {/* 4 Trust Badges */}
                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 text-white/90">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-[11px] sm:text-xs">
                                    <ShieldCheck className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                                    <span>Verified Specialists</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-[11px] sm:text-xs">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                                    <span>At-Home & Salon</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-[11px] sm:text-xs">
                                    <Award className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                                    <span>Genuine Products</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-[11px] sm:text-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                                    <span>Transparent Pricing</span>
                                </span>
                            </div>
                        </div>

                        {/* Count Pill */}
                        <div className="self-start lg:self-end">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl flex items-center gap-2.5 shadow-lg">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="text-white text-xs sm:text-sm font-bold">
                                    {sortedServices.length} {sortedServices.length === 1 ? 'Expert' : 'Experts'} Available
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-4 -mt-6 sm:-mt-7 relative z-20 w-full">
                <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-3 border border-gray-100 flex items-center gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);
                                const currentParams = new URLSearchParams(searchParams.toString());
                                if (val) currentParams.set('query', val);
                                else currentParams.delete('query');
                                router.replace(`${pathname}?${currentParams.toString()}`);
                            }}
                            placeholder="Search specialists, treatments..."
                            className="pl-10 h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#00796B] focus:ring-1 focus:ring-[#00796B] text-xs sm:text-sm w-full"
                        />
                    </div>
                    
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="flex items-center gap-1.5 px-3 sm:px-4 h-11 bg-[#00796B]/10 hover:bg-[#00796B]/20 text-[#00796B] rounded-xl transition-colors shrink-0 lg:hidden font-bold text-xs border border-[#00796B]/20">
                                <Sliders className="w-4 h-4" />
                                <span>Filters</span>
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto custom-scrollbar">
                            <SheetHeader className="pb-4 border-b border-gray-100">
                                <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-[#00796B]" />
                                    <span>Filters</span>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="mt-5">
                                {renderFilterPanel(false)}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 w-full">
                <div className="flex gap-8">
                    <div className="hidden lg:block w-72 shrink-0">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-150 sticky top-28">
                            {renderFilterPanel(true)}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-5 gap-2 w-full">
                            <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-xs shrink-0">
                                <button 
                                    onClick={() => setActiveTab('all')}
                                    className={`px-3.5 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-[#00796B] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    All
                                </button>
                                <button 
                                    onClick={() => setActiveTab('nearby')}
                                    className={`px-3.5 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'nearby' ? 'bg-[#00796B] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Nearby
                                </button>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                <span className="text-xs font-semibold text-gray-500 hidden sm:block">Sort By:</span>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-white border border-gray-200 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-gray-800 outline-none focus:border-[#00796B] focus:ring-1 focus:ring-[#00796B] transition-all cursor-pointer shadow-xs max-w-[145px] sm:max-w-none truncate"
                                >
                                    {sortOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden animate-pulse flex flex-col">
                                        <div className="bg-gray-200 h-44 w-full" />
                                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                                                    <div className="h-5 bg-gray-200 rounded w-10" />
                                                </div>
                                                <div className="h-3 bg-gray-200 rounded w-1/3 mb-4" />
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div>
                                                    <div className="h-2.5 bg-gray-200 rounded w-12 mb-1" />
                                                    <div className="h-6 bg-gray-200 rounded w-20" />
                                                </div>
                                                <div className="h-9 bg-gray-200 rounded-xl w-24" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : sortedServices.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {sortedServices.map((service, index) => (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.04 }}
                                        whileHover={{ y: -4 }}
                                        onClick={() => router.push(`/spa-salon/${service.slug || service.id}`)}
                                        className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 cursor-pointer group shadow-xs hover:shadow-xl hover:border-[#00796B]/50 transition-all flex flex-col"
                                    >
                                        <div className="relative h-44 sm:h-48 overflow-hidden bg-gray-100">
                                            {service.image ? (
                                                <Image
                                                    src={service.image}
                                                    alt={service.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                 width={500} height={300} />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center">
                                                    <Sparkles className="w-10 h-10 text-teal-300" />
                                                </div>
                                            )}
                                            {/* Provider tag */}
                                            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-700 shadow-xs border border-gray-100">
                                                {service.provider || 'Doorstep Hub Partner'}
                                            </div>
                                        </div>

                                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#00796B] transition-colors line-clamp-1">
                                                        {service.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/70 shrink-0">
                                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                        <span className="text-xs font-bold text-amber-800">{service.rating}</span>
                                                    </div>
                                                </div>

                                                {service.address && (
                                                    <div className="flex items-center gap-1.5 text-gray-500 mb-3">
                                                        <MapPin className="w-3.5 h-3.5 text-[#00796B] shrink-0" />
                                                        <p className="text-xs text-gray-600 line-clamp-1">{service.address}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-gray-100">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Starts From</p>
                                                    <p className="text-xl font-extrabold text-gray-900">₹{service.price.toLocaleString('en-IN')}</p>
                                                </div>
                                                <Button className="px-4 py-2 bg-gradient-to-r from-[#00796B] to-[#009688] hover:from-[#00695c] hover:to-[#00796B] text-white rounded-xl text-xs font-bold shadow-xs group-hover:shadow-md transition-all flex items-center gap-1">
                                                    <span>Book Now</span>
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="col-span-full">
                                <EmptyState 
                                    icon="search"
                                    title="No specialists found"
                                    description="We couldn't find any experts matching your criteria in this category. Try adjusting your filters."
                                    actionLabel="Reset All Filters"
                                    onAction={() => {
                                        setPriceRange([0, 5000]);
                                        setMinRating(0);
                                        router.push(pathname);
                                    }}
                                    className="bg-white rounded-3xl border border-gray-150 shadow-xs"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

