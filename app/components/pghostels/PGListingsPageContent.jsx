'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams, useParams, usePathname } from 'next/navigation';
import {
    MapPin, Star, Search, Sliders, Heart, TrendingUp, X, Wifi, Utensils,
    Shirt, Zap, Shield, ChevronRight, Award, Sparkles, ArrowLeft, Filter
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/pghostels/ui/tabs';
import { Input } from '@/components/pghostels/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/pghostels/ui/sheet';
import { Slider } from '@/components/pghostels/ui/slider';
import { EmptyState } from '@/components/ui/EmptyState';
import { resolveParam } from '@/utils/slugHelper';

const mockListings = [
    {
        id: '1',
        name: 'MAHENDRA A',
        location: 'Koramangala, Bangalore',
        rating: 4.3,
        orders: 8,
        basePrice: 175,
        monthlyPrice: 6500,
        image: 'https://images.unsplash.com/photo-1617430690223-3e165b390e25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3N0ZWwlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njg2NDU4OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        distance: 0.6,
        matchScore: 92,
        badges: ['Verified', 'Best for Students'],
        amenities: ['WiFi', 'Food', 'AC', 'Laundry'],
        availableBeds: 3,
    },
    {
        id: '2',
        name: 'GREEN VALLEY PG',
        location: 'Whitefield, Bangalore',
        rating: 4.8,
        orders: 142,
        basePrice: 250,
        monthlyPrice: 8500,
        image: 'https://images.unsplash.com/photo-1760067538068-03d10481bacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwaG9zdGVsJTIwcm9vbSUyMG1vZGVybnwxfHx8fDE3Njg2NDY3MTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
        distance: 0.8,
        matchScore: 95,
        badges: ['Verified', 'Near Metro'],
        amenities: ['WiFi', 'Food', 'AC', 'Laundry'],
        availableBeds: 2,
    },
    {
        id: '3',
        name: 'URBAN NEST CO-LIVING',
        location: 'Indiranagar, Bangalore',
        rating: 4.6,
        orders: 89,
        basePrice: 350,
        monthlyPrice: 12000,
        image: 'https://images.unsplash.com/photo-1707598973296-255b29445512?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxjb2xpdmluZyUyMHdvcmtzcGFjZSUyMGxvdW5nZXxlbnwxfHx8fDE3Njg2NDY3MTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
        distance: 1.2,
        matchScore: 88,
        badges: ['Verified', 'Premium'],
        amenities: ['WiFi', 'Food', 'AC', 'Gym'],
        availableBeds: 5,
    },
    {
        id: '4',
        name: 'SUNSHINE DORM',
        location: 'BTM Layout, Bangalore',
        rating: 4.2,
        orders: 45,
        basePrice: 150,
        monthlyPrice: 5500,
        image: 'https://images.unsplash.com/photo-1709805619372-40de3f158e83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxob3N0ZWwlMjBiZWRyb29tJTIwZG9ybWl0b3J5fGVufDF8fHx8MTc2ODY0NTg5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
        distance: 2.1,
        matchScore: 78,
        badges: ['Budget Friendly'],
        amenities: ['WiFi', 'Food'],
        availableBeds: 8,
    },
    {
        id: '5',
        name: 'ELITE WOMEN\'S HOSTEL',
        location: 'Koramangala, Bangalore',
        rating: 4.9,
        orders: 201,
        basePrice: 300,
        monthlyPrice: 10000,
        image: 'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njg2MjY5Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        distance: 0.5,
        matchScore: 97,
        badges: ['Verified', 'Top Rated', 'Near Metro'],
        amenities: ['WiFi', 'Food', 'AC', 'Laundry'],
        availableBeds: 1,
    },
    {
        id: '6',
        name: 'PREMIUM LIVING SPACES',
        location: 'HSR Layout, Bangalore',
        rating: 4.7,
        orders: 156,
        basePrice: 450,
        monthlyPrice: 15000,
        image: 'https://images.unsplash.com/photo-1581209410127-8211e90da024?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjby1saXZpbmclMjBzcGFjZSUyMGFwYXJ0bWVudHxlbnwxfHx8fDE3Njg2NDU4OTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        distance: 1.8,
        matchScore: 85,
        badges: ['Verified', 'Premium', 'Near Metro'],
        amenities: ['WiFi', 'Food', 'AC', 'Laundry', 'Gym'],
        availableBeds: 4,
    },
];

const amenityIcons = {
    WiFi: Wifi,
    Food: Utensils,
    AC: Zap,
    Laundry: Shirt,
    Gym: TrendingUp,
};

export function PGListingsPageContent({ subcategoryOverride = null }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const pathname = usePathname();

    const answers = {
        roomType: searchParams.get('roomType') || '',
        food: searchParams.get('food') || '',
        budget: searchParams.get('budget') || '',
        moveIn: searchParams.get('moveIn') || ''
    };

    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [savedItems, setSavedItems] = useState([]);
    const [compareList, setCompareList] = useState([]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
    const [filteredListings, setFilteredListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [usingFallback, setUsingFallback] = useState(false);
    const [minRating, setMinRating] = useState(0);

    const [activeTab, setActiveTab] = useState('all');
    const [categories, setCategories] = useState([]);
    const [allSubCategories, setAllSubCategories] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState(searchParams.get('categorySlug') || searchParams.get('categoryId') || null);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('pg_listings_last_tab');
            if (saved && (saved === 'all' || saved === 'nearby')) {
                setActiveTab(saved);
            } else if (searchParams.get('lat')) {
                setActiveTab('nearby');
            }
        } catch { /* ignore */ }
    }, []);

    const SERVICE_ID = '69524fb157bb211ca094e5ee';

    const mapApiResponseToListing = (item) => {
        if (!item) return null;

        const str = (val, fallback = '') => {
            if (!val) return fallback;
            if (typeof val === 'string') return val.trim() || fallback;
            if (typeof val === 'object') {
                return val.$oid || val._id || val.id || val.title || val.name || val.label || fallback;
            }
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

        const uniqueId = str(item?._id) || str(item?.id) || `temp-${Math.random()}`;

        let displayImage = mockListings[0]?.image;
        if (item?.image) displayImage = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${item.image}`;
        else if (item?.logo) displayImage = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${item.logo}`;

        const rawAmenities = item?.amenities;
        const amenities = Array.isArray(rawAmenities)
            ? rawAmenities.map(a => typeof a === 'object' ? str(a) : a).filter(Boolean)
            : ['WiFi', 'Food', 'Laundry'];

        return {
            id: uniqueId,
            name: str(item?.business_name) || str(item?.hostelName) ||
                `${str(item?.firstName)} ${str(item?.lastName)}`.trim() || 'Professional Service',
            location: str(item?.address) || str(item?.location) || str(item?.cityName, 'Unknown Location'),
            rating: num(item?.rating) || 4.5,
            orders: num(item?.totalOrders),
            basePrice: num(item?.startingAt) || num(item?.minFare) || num(item?.serviceBookingCost),
            monthlyPrice: num(item?.startingAt) || num(item?.minFare) || 6500,
            image: displayImage,
            distance: typeof item?.distance === 'string' ? parseFloat(item.distance.replace(/[^\d.]/g, '')) : (num(item?.distance) || 2.5),
            matchScore: num(item?.matchScore) || num(item?.score) || 90,
            badges: Array.isArray(item?.badges)
                ? item.badges.map(b => str(b)).filter(Boolean)
                : (item?.badges ? [str(item.badges)] : ['Verified']),
            amenities: amenities.length > 0 ? amenities : ['WiFi', 'Food', 'Laundry'],
            availableBeds: 5,
            description: str(item?.bio, ''),
            slug: str(item?.slug) || uniqueId
        };
    };

    useEffect(() => {
        const query = searchParams.get('query');
        if (query !== null && query !== searchQuery) {
            setSearchQuery(query);
        }

        const catId = searchParams.get('categorySlug') || searchParams.get('categoryId');
        if (catId && catId !== expandedCategory) {
            setExpandedCategory(catId);
        }

        const minP = searchParams.get('minPrice');
        const maxP = searchParams.get('maxPrice');

        if (minP && maxP) {
            const range = [parseInt(minP), parseInt(maxP)];
            if (range[0] !== priceRange[0] || range[1] !== priceRange[1]) {
                setPriceRange(range);
            }
        } else if (!minP && !maxP && !searchParams.get('budget')) {
            setPriceRange([0, 50000]);
        }

        const budget = searchParams.get('budget');
        if (budget) {
            const budgetMap = {
                '3-6k': [3000, 6000],
                '6-10k': [6000, 10000],
                '10-15k': [10000, 15000],
                '15k+': [15000, 50000]
            };
            if (budgetMap[budget]) {
                setPriceRange(budgetMap[budget]);
            }
        }

        const rating = searchParams.get('minRating');
        if (rating) {
            const r = parseFloat(rating);
            if (r !== minRating) setMinRating(r);
        }
    }, [searchParams]);

    useEffect(() => {
        if (params.type && (params.type === 'all' || params.type === 'nearby' || params.type === 'recommended')) {
            setActiveTab(params.type === 'all' ? 'all' : params.type);
        }
    }, [params.type]);

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                let lat = searchParams.get('lat') || "17.4483";
                let lng = searchParams.get('lng') || "78.3915";

                if (lng && lng.includes(' ')) lng = lng.split(' ')[0];
                if (lat && lat.includes(' ')) lat = lat.split(' ')[0];

                const payload = {
                    lattitude: lat,
                    longitude: lng,
                    serviceId: SERVICE_ID,
                    minPrice: searchParams.get('minPrice') || priceRange[0],
                    maxPrice: searchParams.get('maxPrice') || priceRange[1],
                    minRating: searchParams.get('minRating') || minRating,
                    searchQuery: searchParams.get('query') || searchQuery || undefined,
                    roomType: searchParams.get('roomType') || undefined,
                    food: searchParams.get('food') || undefined,
                    moveIn: searchParams.get('moveIn') || undefined,
                    ...resolveParam(subcategoryOverride?.slug || searchParams.get('subcategorySlug') || searchParams.get('subcategoryId'), 'subcategoryId', 'subcategorySlug'),
                    ...resolveParam(searchParams.get('categorySlug') || searchParams.get('categoryId'), 'categoryId', 'categorySlug')
                };

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/professional-services`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (data.success && data.professionalServices && data.professionalServices.length > 0) {
                    const mapped = data.professionalServices.map(mapApiResponseToListing);
                    setFilteredListings(mapped);
                    setUsingFallback(false);
                    setFetchError(false);
                } else {
                    setFilteredListings([]);
                    setUsingFallback(false);
                }
            } catch (error) {
                console.error('Error fetching listings:', error);
                setFilteredListings([]);
                setFetchError(true);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchListings();
        }, 100);
        return () => clearTimeout(timer);
    }, [searchParams.toString(), priceRange, minRating, subcategoryOverride]);

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

    useEffect(() => {
        const fetchSubCategories = async () => {
            if (!expandedCategory) return;
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(resolveParam(expandedCategory, 'categoryId', 'categorySlug'))
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
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            let changed = false;

            if (priceRange[0] !== 0 || priceRange[1] !== 50000) {
                if (params.get('minPrice') !== priceRange[0].toString()) {
                    params.set('minPrice', priceRange[0].toString());
                    changed = true;
                }
                if (params.get('maxPrice') !== priceRange[1].toString()) {
                    params.set('maxPrice', priceRange[1].toString());
                    changed = true;
                }
            } else if (params.has('minPrice') || params.has('maxPrice')) {
                if (!params.get('budget')) {
                    params.delete('minPrice');
                    params.delete('maxPrice');
                    changed = true;
                }
            }

            if (minRating > 0) {
                if (params.get('minRating') !== minRating.toString()) {
                    params.set('minRating', minRating.toString());
                    changed = true;
                }
            } else if (params.has('minRating')) {
                params.delete('minRating');
                changed = true;
            }

            if (changed) {
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [priceRange, minRating]);

    const toggleSave = (id) => {
        setSavedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleCompare = (id) => {
        if (compareList.includes(id)) {
            setCompareList(compareList.filter(item => item !== id));
        } else if (compareList.length < 2) {
            setCompareList([...compareList, id]);
        }
    };

    const getFilterChips = () => {
        const chips = [];
        if (answers.roomType) chips.push(answers.roomType.replace('-', ' '));
        if (answers.food) chips.push(answers.food.replace('-', ' '));
        if (answers.budget) chips.push(answers.budget);
        if (answers.moveIn) chips.push(`Move-in: ${answers.moveIn.replace('-', ' ')}`);
        return chips;
    };

    const filterChips = getFilterChips();
    const sortedListings = [...filteredListings].sort((a, b) => b.matchScore - a.matchScore);
    const recommendedListings = sortedListings.slice(0, 4);

    const updateFilter = (key, value) => {
        const currentParams = new URLSearchParams(searchParams.toString());
        if (value) {
            currentParams.set(key, value);
            if (key === 'categoryId' || key === 'subcategoryId' || key === 'categorySlug' || key === 'subcategorySlug') {
                currentParams.delete('query');
                setSearchQuery('');
            }
            if (key === 'categoryId' || key === 'categorySlug') {
                currentParams.delete('subcategoryId');
                currentParams.delete('subcategorySlug');
            }
        } else {
            currentParams.delete(key);
        }
        router.push(`${pathname}?${currentParams.toString()}`);
    };

    const FilterPanel = ({ showTitle = true }) => (
        <div className="space-y-6 text-black">
            {showTitle && (
                <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#037166]" />
                    Filters
                </h4>
            )}

            <div className="mb-8 border-b border-gray-100 pb-6">
                <h6 className="block text-gray-400 mb-4 text-[10px] font-black uppercase tracking-widest">Hostel Categories</h6>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {categories.map((cat) => (
                        <div key={cat._id} className="overflow-hidden">
                            <button
                                onClick={() => {
                                    const catKey = cat.slug || cat._id;
                                    if (expandedCategory === catKey) {
                                        setExpandedCategory(null);
                                    } else {
                                        setExpandedCategory(catKey);
                                        updateFilter('categoryId', cat._id);
                                        if (cat.slug) updateFilter('categorySlug', cat.slug);
                                    }
                                }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${expandedCategory === (cat.slug || cat._id) || (cat.slug || cat._id) === (searchParams.get('categorySlug') || searchParams.get('categoryId'))
                                        ? 'bg-[#037166]/10 text-[#037166] font-bold border border-[#037166]/20 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#037166] border border-transparent'
                                    }`}
                            >
                                <span className="truncate">{cat.name}</span>
                                {expandedCategory === cat._id ? (
                                    <ChevronRight className="w-4 h-4 rotate-90 transition-transform text-[#037166]" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 opacity-30" />
                                )}
                            </button>

                            <AnimatePresence>
                                {expandedCategory === cat._id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pl-5 pr-1 py-2 space-y-1.5 mt-1 border-l-2 border-[#037166]/20 ml-4">
                                            {allSubCategories.map(sub => (
                                                <button
                                                    key={sub._id}
                                                    onClick={() => {
                                                        const currentParams = new URLSearchParams(searchParams.toString());
                                                        currentParams.set('categoryId', cat._id);
                                                        currentParams.set('categorySlug', cat.slug || '');
                                                        currentParams.set('subcategoryId', sub._id);
                                                        currentParams.set('subcategorySlug', sub.slug || '');
                                                        currentParams.set('categoryName', cat.name);
                                                        router.push(`${pathname}?${currentParams.toString()}`);
                                                    }}
                                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all truncate ${(searchParams.get('subcategorySlug') || searchParams.get('subcategoryId')) === (sub.slug || sub._id)
                                                            ? 'bg-[#037166] text-white shadow-md shadow-[#037166]/20'
                                                            : 'text-gray-500 hover:text-[#037166] hover:bg-[#037166]/5'
                                                        }`}
                                                >
                                                    {sub.name}
                                                </button>
                                            ))}
                                            {allSubCategories.length === 0 && <span className="text-[10px] text-gray-400 italic pl-2">No options found</span>}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                    {categoriesLoading && (
                        <div className="text-center py-4">
                            <div className="w-5 h-5 border-2 border-[#037166]/20 border-t-[#037166] rounded-full animate-spin mx-auto" />
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center justify-between mb-4">
                    <h6 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Monthly Budget</h6>
                    <span className="text-[11px] font-bold text-[#037166] bg-[#037166]/10 px-2.5 py-1 rounded-full border border-[#037166]/10">₹{priceRange[1].toLocaleString('en-IN')}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6">
                    {[
                        { value: '3-6k', label: '₹3k - ₹6k', range: [3000, 6000] },
                        { value: '6-10k', label: '₹6k - ₹10k', range: [6000, 10000] },
                        { value: '10-15k', label: '₹10k - ₹15k', range: [10000, 15000] },
                        { value: '15k+', label: '₹15k+', range: [15000, 40000] }
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                const isSelected = searchParams.get('budget') === opt.value;
                                updateFilter('budget', isSelected ? '' : opt.value);
                                if (!isSelected) setPriceRange(opt.range);
                            }}
                            className={`px-2 py-2.5 rounded-xl text-[10px] font-bold text-center border-2 transition-all ${searchParams.get('budget') === opt.value
                                    ? 'bg-[#037166] text-white border-[#037166] shadow-md'
                                    : 'bg-white border-gray-50 text-gray-500 hover:border-[#037166]/20'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <div className="px-1">
                    <Slider
                        defaultValue={[5000, 20000]}
                        min={2000}
                        max={40000}
                        step={500}
                        value={priceRange}
                        onValueChange={(val) => {
                            setPriceRange(val);
                            if (searchParams.get('budget')) {
                                updateFilter('budget', '');
                            }
                        }}
                        className="mb-4"
                    />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
                    <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
                </div>
            </div>

            <div className="mb-8 border-b border-gray-100 pb-6">
                <h6 className="block text-gray-400 mb-4 text-[10px] font-black uppercase tracking-widest">Minimum Rating</h6>
                <div className="grid grid-cols-2 gap-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl transition-all border-2 ${minRating === rating
                                    ? 'bg-[#037166] border-[#037166] text-white shadow-lg shadow-[#037166]/30'
                                    : 'bg-white border-gray-100 text-gray-500 hover:border-[#037166]/20 hover:text-[#037166]'
                                }`}
                        >
                            <Star className={`w-3.5 h-3.5 ${minRating === rating ? 'fill-white text-white' : 'fill-[#F59E0B] text-[#F59E0B]'}`} />
                            <span className="text-xs font-black">{rating}+</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-8 border-b border-gray-100 pb-6">
                <h6 className="block text-gray-400 mb-4 text-[10px] font-black uppercase tracking-widest">Room Type</h6>
                <div className="grid gap-2">
                    {[
                        { value: 'single', label: 'Single Occupancy' },
                        { value: '2-sharing', label: '2 Sharing' },
                        { value: '3-sharing', label: '3 Sharing' },
                        { value: '4-sharing', label: '4+ Sharing' }
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => updateFilter('roomType', opt.value === searchParams.get('roomType') ? '' : opt.value)}
                            className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${searchParams.get('roomType') === opt.value
                                    ? 'bg-[#037166] border-[#037166] text-white shadow-sm'
                                    : 'bg-white border-gray-50 text-gray-600 hover:border-[#037166]/20'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <button
                className="w-full mt-4 bg-white border border-gray-200 text-gray-400 hover:text-[#037166] hover:border-[#037166]/30 h-11 text-[11px] font-black rounded-xl gap-2 transition-all flex items-center justify-center shadow-sm"
                onClick={() => {
                    setPriceRange([0, 50000]);
                    setMinRating(0);
                    router.push(pathname);
                }}
            >
                <X className="w-3.5 h-3.5" />
                Reset All Filters
            </button>
        </div>
    );

    const PGCard = ({ listing, isNearby, featured }) => {
        const isSaved = savedItems.includes(listing.id);
        const isComparing = compareList.includes(listing.id);
        const isClickable = !usingFallback;

        return (
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={isClickable ? { y: -6 } : {}}
                className={`group ${isClickable ? 'cursor-pointer' : 'select-none'} relative ${featured ? 'md:col-span-2' : ''}`}
            >
                <div className={`bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-200/90 transition-all duration-300 flex flex-col justify-between ${isClickable ? 'hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] hover:border-[#00796B]/50' : 'blur-[2px] opacity-80'}`}>
                    {!isClickable && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center">
                            <div className="bg-black/60 px-6 py-2 rounded-full backdrop-blur-md">
                                <span className="text-white font-bold text-lg tracking-wide">Coming Soon</span>
                            </div>
                        </div>
                    )}

                    {/* Top Image Area */}
                    <div className="relative h-44 sm:h-52 overflow-hidden bg-gray-50 shrink-0 border-b border-gray-100">
                        <div
                            className={`absolute inset-0 bg-cover bg-center ${isClickable ? 'group-hover:scale-105' : ''} transition-transform duration-700`}
                            style={{ backgroundImage: `url(${listing.image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

                        {/* Top Left: Badges */}
                        <div className="absolute top-2.5 left-2.5 z-20 flex flex-wrap gap-1">
                            {listing.badges.slice(0, 2).map((badge, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 bg-black/65 backdrop-blur-md rounded-md text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider"
                                >
                                    {badge}
                                </span>
                            ))}
                        </div>

                        {/* Top Right: Match Score */}
                        <div className="absolute top-2.5 right-2.5 z-20 bg-[#00796B] text-white px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 font-bold text-[10px] sm:text-xs">
                            <Award className="w-3 h-3 text-amber-300" />
                            <span>{listing.matchScore}%</span>
                            <span className="hidden sm:inline">match</span>
                        </div>

                        {isNearby && (
                            <div className="absolute bottom-2.5 left-2.5 z-20 px-2 py-0.5 bg-[#00796B] text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                <MapPin className="w-3 h-3" />
                                <span>{listing.distance} km away</span>
                            </div>
                        )}

                        {/* Bottom Right: Quick Save & Compare buttons */}
                        {isClickable && (
                            <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSave(listing.id);
                                    }}
                                    className="w-7 h-7 sm:w-8 sm:h-8 bg-white/90 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                    aria-label="Save"
                                >
                                    <Heart
                                        className={`w-3.5 h-3.5 transition-all ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                                    />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCompare(listing.id);
                                    }}
                                    className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all shadow-sm cursor-pointer ${isComparing
                                        ? 'bg-[#00796B] text-white'
                                        : 'bg-white/90 text-gray-900 hover:bg-white'
                                        }`}
                                >
                                    {isComparing ? '✓ Comparing' : 'Compare'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between" onClick={() => isClickable && router.push(`/pghostels/hostel/${listing.slug || listing.id}`)}>
                        <div>
                            {/* Title & Rating */}
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#00796B] transition-colors leading-snug line-clamp-1">
                                    {listing.name}
                                </h3>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 rounded-md shrink-0">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span className="font-bold text-gray-900 text-xs">{listing.rating}</span>
                                </div>
                            </div>

                            {/* Location */}
                            <p className="flex items-center text-gray-500 text-xs line-clamp-1 mb-2.5">
                                <MapPin className="w-3.5 h-3.5 mr-1 text-[#00796B] shrink-0" />
                                <span className="truncate">{listing.location}</span>
                            </p>

                            {/* Amenities Micro-chips */}
                            <div className="flex flex-wrap gap-1.5 mb-3.5">
                                {listing.amenities.slice(0, 3).map((amenity, i) => {
                                    const Icon = amenityIcons[amenity];
                                    return (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 bg-gray-50 rounded-md flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-600 border border-gray-100 font-medium"
                                        >
                                            {Icon && <Icon className="w-3 h-3 text-[#00796B]" />}
                                            <span>{amenity}</span>
                                        </span>
                                    );
                                })}
                                {listing.amenities.length > 3 && (
                                    <span className="text-[10px] text-gray-400 self-center">+{listing.amenities.length - 3}</span>
                                )}
                            </div>
                        </div>

                        {/* Pricing & Action */}
                        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-gray-100 mt-auto">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block leading-tight">Starts From</span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-base sm:text-lg font-black text-gray-900 leading-tight">₹{listing.monthlyPrice.toLocaleString('en-IN')}</span>
                                    <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium">{listing.monthlyPrice < 1000 ? '/ day' : '/ mo'}</span>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isClickable) router.push(`/pghostels/hostel/${listing.slug || listing.id}`);
                                }}
                                disabled={!isClickable}
                                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#00796B] to-[#009688] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                                <span>Book Stay</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const schemaData = sortedListings.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Hostels and PG in ${searchParams.get('query') || 'your area'}`,
        "description": `Browse through ${sortedListings.length} verified PG and hostel options.`,
        "itemListElement": sortedListings.map((listing, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": listing.name,
            "url": typeof window !== 'undefined' ? `${window.location.origin}/pghostels/hostel/${listing.slug || listing.id}` : ""
        }))
    } : null;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-16">
            {schemaData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                />
            )}

            {/* HERO BANNER SECTION (DOORSTEP HUB APPROVED TEAL GRADIENT) */}
            <div className="relative bg-gradient-to-br from-[#00473e] via-[#01655b] to-[#003932] pt-24 sm:pt-28 pb-12 sm:pb-14 overflow-hidden">
                {/* Decorative Background Concentric Circles */}
                <svg
                    className="absolute -top-10 -right-10 w-60 h-60 sm:w-72 sm:h-72 pointer-events-none opacity-20 text-teal-200"
                    viewBox="0 0 200 200"
                    fill="none"
                >
                    <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
                    <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                </svg>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Back Button */}
                    <div className="mb-3">
                        <button
                            onClick={() => router.push('/pghostels')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-gray-900 hover:bg-slate-100 transition-all text-xs font-bold shadow-md cursor-pointer"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Back</span>
                        </button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Eyebrow */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-1 bg-[#f59e0b] rounded-full" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-200">
                                Doorstep Hub • PG & Hostels
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
                            {subcategoryOverride?.name || "AC Dormitory Rooms & Booking"}
                        </h1>

                        {/* Yellow Accent Underline */}
                        <div className="w-16 h-1 bg-[#f59e0b] rounded-full mb-3" />

                        {/* Subtitle */}
                        <p className="text-white/90 text-xs sm:text-sm md:text-base max-w-2xl font-medium leading-relaxed mb-4">
                            {searchQuery ? `Verified results matching "${searchQuery}"` : 'Book verified AC dormitory beds, student hostels, and co-living stays with zero brokerage and transparent pricing.'}
                        </p>

                        {/* Trust Pills / Filter Chips */}
                        <div className="flex flex-wrap gap-2 pt-1">
                            {filterChips.length > 0 ? (
                                filterChips.map((chip, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-xs"
                                    >
                                        <span>{chip}</span>
                                        <button onClick={() => updateFilter('roomType', '')} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))
                            ) : (
                                <>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-[11px] font-semibold">
                                        <Shield className="w-3 h-3 text-teal-300" />
                                        <span>Verified Properties</span>
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-[11px] font-semibold">
                                        <Zap className="w-3 h-3 text-amber-300" />
                                        <span>Instant Confirmation</span>
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-[11px] font-semibold">
                                        <Wifi className="w-3 h-3 text-teal-300" />
                                        <span>WiFi & Food Available</span>
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-[11px] font-semibold">
                                        <Sparkles className="w-3 h-3 text-teal-300" />
                                        <span>Zero Brokerage</span>
                                    </span>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* FLOATING SEARCH & FILTER BAR */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-7 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-2.5 sm:p-3 border border-gray-100 flex items-center gap-2 sm:gap-3"
                >
                    <div className="flex-1 relative">
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
                            placeholder="Search by area, landmark, hostel name..."
                            className="pl-10 h-11 bg-gray-50 border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-[#00796B]"
                        />
                    </div>
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="flex items-center gap-1.5 px-3.5 py-2.5 sm:px-5 sm:py-2.5 bg-gray-100 hover:bg-[#00796B] hover:text-white text-gray-700 rounded-xl transition-all font-bold text-xs sm:text-sm shrink-0 cursor-pointer">
                                <Sliders className="w-4 h-4" />
                                <span>Filters</span>
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[360px] overflow-y-auto custom-scrollbar bg-white">
                            <SheetHeader className="pb-4 border-b border-gray-100">
                                <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-[#00796B]" />
                                    <span>Filter Stays</span>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="mt-4">
                                <FilterPanel showTitle={false} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </motion.div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {fetchError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                        <p className="text-red-700 text-sm font-medium">Failed to load PG listings. Please check your connection.</p>
                        <button onClick={() => { setFetchError(false); setLoading(true); }} className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">Retry</button>
                    </div>
                )}

                {/* Show Recommended ONLY if more than 5 listings to avoid repeating the exact same cards */}
                {sortedListings.length > 5 && !searchQuery && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[#00796B] to-[#004d40] rounded-xl flex items-center justify-center shadow-xs">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recommended Stays for You</h2>
                        </div>
                        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide -mx-4 px-4 sm:grid sm:grid-cols-2 xl:grid-cols-3 sm:px-0 sm:mx-0 sm:pb-0">
                            {recommendedListings.map((listing) => (
                                <div key={listing.id} className="w-[280px] sm:w-auto shrink-0">
                                    <PGCard listing={listing} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    {/* Header Controls: Tabs & Count */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-gray-200/80">
                        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl shadow-xs inline-flex">
                            <TabsTrigger value="all" className="data-[state=active]:bg-[#00796B] data-[state=active]:text-white px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all">
                                All Stays ({sortedListings.length})
                            </TabsTrigger>
                            <TabsTrigger value="nearby" className="data-[state=active]:bg-[#00796B] data-[state=active]:text-white px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all">
                                Nearby
                            </TabsTrigger>
                        </TabsList>

                        <span className="text-xs text-gray-500 font-medium">
                            Showing <strong className="text-gray-900 font-bold">{sortedListings.length}</strong> available stays
                        </span>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 items-start">
                        {/* Desktop Sidebar Filters */}
                        <div className="hidden xl:block w-72 shrink-0">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/90 sticky top-24 overflow-hidden">
                                <FilterPanel />
                            </div>
                        </div>

                        {/* Listings Grid */}
                        <div className="flex-1 w-full">
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="animate-pulse bg-white rounded-2xl p-4 border border-gray-200">
                                            <div className="bg-gray-200 h-44 rounded-xl mb-4" />
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                                        </div>
                                    ))}
                                </div>
                            ) : sortedListings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {sortedListings.map((listing) => (
                                        <PGCard key={listing.id} listing={listing} isNearby={activeTab === 'nearby'} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon="search" title="No matching stays found" description="Try adjusting your budget or room type filters." actionLabel="Reset Filters" onAction={() => { setPriceRange([0, 50000]); setMinRating(0); setSearchQuery(''); router.push(pathname); }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8" />
                            )}
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}






