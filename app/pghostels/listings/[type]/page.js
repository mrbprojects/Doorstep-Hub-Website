'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams, useParams, usePathname } from 'next/navigation';
import {
    MapPin, Star, Search, Sliders, Heart, TrendingUp, X, Wifi, Utensils,
    Shirt, Zap, Shield, ChevronRight, Award, Sparkles, ArrowLeft, Filter,
    CheckCircle, MessageSquare
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/pghostels/ui/tabs';
import { Input } from '@/components/pghostels/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/pghostels/ui/sheet';
import { Slider } from '@/components/pghostels/ui/slider';
import { Checkbox } from '@/components/pghostels/ui/checkbox';
import { Button } from '@/components/pghostels/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
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
        image: 'https://images.unsplash.com/photo-1707598973296-255b29445512?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxjb2xpdmluZyUyMHdvcmtzcGFjZSUyMGxvdW5nZXxlbnwxfHx8fDE3Njg2NDY3MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
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

function PGListingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const pathname = usePathname();

    // Since we don't have location.state in Next.js easily on refresh, 
    // we'll try to get basic filters from URL or default to empty
    const answers = {
        // Mock data or extract from URL if needed in future
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

    // BUG-12 FIX: Restore last active tab from localStorage inside useEffect to avoid Hydration Error
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

    // PG Hostels Service ID (from PremiumHomePage) - You might want to move these to a config file
    const SERVICE_ID = '69524fb157bb211ca094e5ee';

    const mapApiResponseToListing = (item) => {
        if (!item) return null;
        
        // Robust string extractor for IDs and names
        const str = (val, fallback = '') => {
            if (!val) return fallback;
            if (typeof val === 'string') return val.trim() || fallback;
            // Handle MongoDB ObjectIDs or nested label objects
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

        // Unique ID priority: _id > id > random fallback to prevent React key collisions
        const uniqueId = str(item?._id) || str(item?.id) || `temp-${Math.random()}`;

        // Image priority: image > logo > fallback
        let displayImage = mockListings[0]?.image;
        if (item?.image) displayImage = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${item.image}`;
        else if (item?.logo) displayImage = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${item.logo}`;

        // Sanitize amenities
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
            description: str(item?.bio, '')
        };
    };


    // Sync state with URL params on navigation
    useEffect(() => {
        const query = searchParams.get('query');
        if (query !== null && query !== searchQuery) {
            setSearchQuery(query);
        }

        const catId = searchParams.get('categorySlug') || searchParams.get('categoryId');
        if (catId && catId !== expandedCategory) {
            setExpandedCategory(catId);
        }

        // Sync price range and rating from URL if present
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

        // Parse 'budget' param from Questionnaire
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

    // Sync active tab with route param
    useEffect(() => {
        if (params.type && (params.type === 'all' || params.type === 'nearby' || params.type === 'recommended')) {
            setActiveTab(params.type === 'all' ? 'all' : params.type);
        }
    }, [params.type]);

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                // Get location from URL params
                let lat = searchParams.get('lat') || "17.4483"; // Default Hyderabad
                let lng = searchParams.get('lng') || "78.3915";

                // Clean up lng/lat if they contain extra text
                if (lng && lng.includes(' ')) lng = lng.split(' ')[0];
                if (lat && lat.includes(' ')) lat = lat.split(' ')[0];

                // Construct API payload - use values prioritize searchParams
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
                    ...resolveParam(searchParams.get('subcategorySlug') || searchParams.get('subcategoryId'), 'subcategoryId', 'subcategorySlug'),
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
        }, 100); // Small debounce
        return () => clearTimeout(timer);
    }, [searchParams.toString(), priceRange, minRating]); // Reliable change detection

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

    // Sync state back to URL for deep linking and consistent filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            let changed = false;

            // Sync Price Range if changed
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
                // If it's back to default but URL still has params, clear them
                if (!params.get('budget')) { // Only clear if not a preset
                    params.delete('minPrice');
                    params.delete('maxPrice');
                    changed = true;
                }
            }

            // Sync Rating
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
        }, 500); // 500ms debounce

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

    // Sort by match score
    const sortedListings = [...filteredListings].sort((a, b) => b.matchScore - a.matchScore);
    const recommendedListings = sortedListings.slice(0, 3);

    const updateFilter = (key, value) => {
        const currentParams = new URLSearchParams(searchParams.toString());
        if (value) {
            currentParams.set(key, value);
            // Clear query search when selecting a category or subcategory
            if (key === 'categoryId' || key === 'subcategoryId' || key === 'categorySlug' || key === 'subcategorySlug') {
                currentParams.delete('query');
                setSearchQuery('');
            }
            // If selecting a category, clear subcategory
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

            {/* Categories Section (Accordion Style) */}
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
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                                    expandedCategory === (cat.slug || cat._id) || (cat.slug || cat._id) === (searchParams.get('categorySlug') || searchParams.get('categoryId'))
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
                                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all truncate ${
                                                        (searchParams.get('subcategorySlug') || searchParams.get('subcategoryId')) === (sub.slug || sub._id)
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

            {/* Price Range */}
            <div className="mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center justify-between mb-4">
                    <h6 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Monthly Budget</h6>
                    <span className="text-[11px] font-bold text-[#037166] bg-[#037166]/10 px-2.5 py-1 rounded-full border border-[#037166]/10">₹{priceRange[1].toLocaleString()}</span>
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
                            className={`px-2 py-2.5 rounded-xl text-[10px] font-bold text-center border-2 transition-all ${
                                searchParams.get('budget') === opt.value
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
                            // Clear budget preset if user moves slider
                            if (searchParams.get('budget')) {
                                updateFilter('budget', '');
                            }
                        }}
                        className="mb-4"
                    />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
            </div>

            {/* Rating Grid */}
            <div className="mb-8 border-b border-gray-100 pb-6">
                <h6 className="block text-gray-400 mb-4 text-[10px] font-black uppercase tracking-widest">Minimum Rating</h6>
                <div className="grid grid-cols-2 gap-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl transition-all border-2 ${
                                minRating === rating
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

            {/* Room Type */}
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
                            className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                                searchParams.get('roomType') === opt.value
                                ? 'bg-[#037166] border-[#037166] text-white shadow-sm'
                                : 'bg-white border-gray-50 text-gray-600 hover:border-[#037166]/20'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Food Faculty */}
            <div className="mb-8 border-b border-gray-100 pb-6">
                <h6 className="block text-gray-400 mb-4 text-[10px] font-black uppercase tracking-widest">Food Facility</h6>
                <div className="flex flex-wrap gap-2">
                    {[
                        { value: 'with-food', label: 'Food Included' },
                        { value: 'without-food', label: 'No Food' }
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => updateFilter('food', opt.value === searchParams.get('food') ? '' : opt.value)}
                            className={`px-4 py-2 rounded-full text-[10px] font-bold border-2 transition-all ${
                                searchParams.get('food') === opt.value
                                ? 'bg-[#037166] text-white border-[#037166] shadow-sm'
                                : 'bg-gray-50 border-transparent text-gray-600 hover:border-gray-200'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Move-in Filter */}
            <div className="mb-6">
                <h6 className="block text-gray-400 mb-4 text-[10px] font-black uppercase tracking-widest">Availability</h6>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { value: 'today', label: 'Available Today' },
                        { value: 'this-week', label: 'This Week' },
                        { value: 'next-week', label: 'Next Week' },
                        { value: 'flexible', label: 'Flexible' }
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => updateFilter('moveIn', opt.value === searchParams.get('moveIn') ? '' : opt.value)}
                            className={`px-2 py-2.5 rounded-xl text-[10px] font-bold text-center border-2 transition-all ${
                                searchParams.get('moveIn') === opt.value
                                ? 'bg-[#037166]/10 text-[#037166] border-[#037166]/30'
                                : 'bg-white border-gray-50 text-gray-500 hover:border-gray-100'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reset Button */}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={isClickable ? { y: -8 } : {}}
                className={`group ${isClickable ? 'cursor-pointer' : 'select-none'} relative ${featured ? 'md:col-span-2' : ''}`}
            >
                <div className={`bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-gray-100 transition-all duration-300 ${isClickable ? 'hover:shadow-2xl hover:border-[#037166]/30' : 'blur-[2px] opacity-80'}`}>
                    {/* Add Coming Soon Overlay */}
                    {!isClickable && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center">
                            <div className="bg-black/60 px-6 py-2 rounded-full backdrop-blur-md">
                                <span className="text-white font-bold text-lg tracking-wide">Coming Soon</span>
                            </div>
                        </div>
                    )}
                    {/* Image Section */}
                    <div className="relative h-48 sm:h-64 overflow-hidden">
                        <div
                            className={`absolute inset-0 bg-cover bg-center ${isClickable ? 'group-hover:scale-110' : ''} transition-transform duration-500`}
                            style={{ backgroundImage: `url(${listing.image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-wrap gap-1.5 sm:gap-2">
                            {listing.badges.map((badge, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] sm:text-xs font-semibold text-gray-900"
                                >
                                    {badge}
                                </span>
                            ))}
                            {listing.availableBeds <= 3 && (
                                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-[9px] sm:text-xs font-semibold text-white">
                                    Few beds left
                                </span>
                            )}
                        </div>

                        {/* Match Score Badge */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-gradient-to-br from-[#037166] to-[#025951] text-white px-2 py-1 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg flex items-center space-x-1 sm:space-x-1.5"
                        >
                            <Award className="w-3 h-3 sm:w-4 h-4" />
                            <span className="font-bold text-[10px] sm:text-base">{listing.matchScore}%</span>
                            <span className="text-[10px] hidden sm:inline">match</span>
                        </motion.div>

                        {/* Distance Badge (Nearby only) */}
                        {isNearby && (
                            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-[#037166] text-white rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{listing.distance} km away</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {isClickable && (
                            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex space-x-1.5">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSave(listing.id);
                                    }}
                                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                                >
                                    <Heart
                                        className={`w-4 h-4 sm:w-5 h-5 transition-all ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                            }`}
                                    />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCompare(listing.id);
                                    }}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm rounded-full text-[10px] sm:text-sm font-bold transition-all shadow-lg ${isComparing
                                        ? 'bg-[#037166] text-white'
                                        : 'bg-white/90 text-gray-900 hover:bg-white'
                                        }`}
                                >
                                    {isComparing ? '✓' : 'Compare'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-3 sm:p-6" onClick={() => isClickable && router.push(`/pghostels/${listing.slug || listing.id}`)}>
                        {/* PG Name & Location */}
                        <div className="mb-2 sm:mb-4">
                            <h3 className="text-base sm:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1 group-hover:text-[#037166] transition-colors line-clamp-1">
                                {listing.name}
                            </h3>
                            <div className="flex items-center text-gray-500 text-[10px] sm:text-sm">
                                <MapPin className="w-3 h-3 sm:w-4 h-4 mr-1 text-[#037166]/60" />
                                <span className="truncate">{listing.location}</span>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                            <div className="flex items-center space-x-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-amber-50 rounded-lg">
                                <Star className="w-3 h-3 sm:w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                                <span className="font-bold text-gray-900 text-xs sm:text-base">{listing.rating}</span>
                            </div>

                            {/* {listing.availableBeds <= 5 && (
                                <div className="flex items-center space-x-1 text-orange-600">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-sm font-medium">{listing.availableBeds} beds left</span>
                                </div>
                            )} */}
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                            {listing.amenities.slice(0, 3).map((amenity, i) => {
                                const Icon = amenityIcons[amenity];
                                return (
                                    <div
                                        key={i}
                                        className="px-2 py-1 bg-gray-50 rounded-lg flex items-center space-x-1 text-[10px] sm:text-xs text-gray-600 border border-gray-100"
                                    >
                                        {Icon && <Icon className="w-3 h-3 sm:w-3.5 h-3.5" />}
                                        <span>{amenity}</span>
                                    </div>
                                );
                            })}
                            {listing.amenities.length > 3 && (
                                <span className="text-[10px] text-gray-400 flex items-center">+{listing.amenities.length - 3} more</span>
                            )}
                        </div>

                        {/* Price & CTA */}
                        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-50">
                            <div className="min-w-0">
                                <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider font-bold mb-0.5">Starts at</div>
                                <div className="flex items-baseline space-x-0.5">
                                    <span className="text-xl sm:text-2xl font-black text-gray-900">₹{listing.monthlyPrice.toLocaleString()}</span>
                                    <span className="text-[10px] sm:text-xs text-gray-400">/mo</span>
                                </div>
                            </div>

                            <button
                                disabled={!isClickable}
                                className={`px-3 py-2 sm:px-6 sm:py-3 rounded-xl font-bold shrink-0 transition-all flex items-center space-x-1.5 ${isClickable
                                    ? 'bg-gradient-to-r from-[#037166] to-[#025951] text-white shadow-md active:scale-95'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <span className="text-xs sm:text-sm">{isClickable ? 'View Details' : 'Preview'}</span>
                                {isClickable && <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-transparent pb-16">
            {/* Header */}
            <div className="bg-[#E2E6E6]/80 border-b border-gray-300 pt-16 sm:pt-20 pb-10 sm:pb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-gray-200/50 [mask-image:linear-gradient(0deg,white,transparent)]" />
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <button
                        onClick={() => router.push('/pghostels')}
                        className="mb-6 sm:mb-8 mt-5 sm:mt-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200 hover:shadow-lg transition-all text-gray-700 hover:text-[#037166]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-gray-900"
                    >
                        <h1 className="text-xl sm:text-4xl font-black mb-1 sm:mb-2 tracking-tight">
                            PGs matched for you
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-lg mb-4 font-medium">
                            {searchQuery ? `Results for "${searchQuery}"` : 'Based on your preferences + location'}
                        </p>

                        {/* Filter Chips */}
                        {filterChips.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {filterChips.map((chip, i) => (
                                    <span
                                        key={i}
                                        className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 flex items-center space-x-2 shadow-sm"
                                    >
                                        <span>{chip}</span>
                                        <button className="hover:bg-gray-100 rounded-full p-0.5 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
                >
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSearchQuery(val);

                                    // Update URL param while preserving other params (like lat, lng)
                                    const currentParams = new URLSearchParams(searchParams.toString());
                                    if (val) {
                                        currentParams.set('query', val);
                                    } else {
                                        currentParams.delete('query');
                                    }
                                    router.replace(`${pathname}?${currentParams.toString()}`);
                                }}
                                placeholder="Search by area, landmark, hostel name..."
                                className="pl-12 h-12 bg-gray-50 border-gray-200 text-black placeholder:text-gray-400"
                            />
                        </div>
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="flex items-center space-x-2 p-3 sm:px-6 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors shrink-0">
                                    <Sliders className="w-5 h-5" />
                                    <span className="hidden md:inline font-medium">Filters</span>
                                </button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto custom-scrollbar">
                                <SheetHeader className="pb-6 border-b border-gray-100">
                                    <SheetTitle className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                        <Filter className="w-5 h-5 text-[#037166]" />
                                        Filters
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                    <FilterPanel showTitle={false} />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* API error banner with retry */}
                {fetchError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                        <p className="text-red-700 text-sm font-medium">Failed to load PG listings. Please check your connection.</p>
                        <button
                            onClick={() => { setFetchError(false); setLoading(true); }}
                            className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Recommended Section */}
                {sortedListings.length > 0 && !searchQuery && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#037166] to-[#025951] rounded-lg sm:rounded-xl flex items-center justify-center">
                                <Sparkles className="w-4 h-4 sm:w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recommended for you</h2>
                        </div>

                        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:px-0 sm:mx-0 sm:pb-0">
                            {recommendedListings.map((listing) => (
                                <div key={listing.id} className="w-[300px] sm:w-auto flex-shrink-0">
                                    <PGCard listing={listing} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => {
                        // BUG-12 FIX: Persist selected tab
                        try { localStorage.setItem('pg_listings_last_tab', value); } catch { /* ignore */ }
                        setActiveTab(value);
                        if (value === 'nearby') {
                            try {
                                const storedLocation = localStorage.getItem('user_location_data');
                                if (storedLocation) {
                                    const parsedLocation = JSON.parse(storedLocation);
                                    if (parsedLocation?.lat && parsedLocation?.lng) {
                                        router.push(`/pghostels/listings/nearby?lat=${parsedLocation.lat}&lng=${parsedLocation.lng}`);
                                        return;
                                    }
                                }
                            } catch (e) {
                                console.error("Error reading location for nearby tab", e);
                            }
                            router.push('/pghostels/listings/nearby');
                        } else {
                            router.push(`/pghostels/listings/${value === 'all' ? 'all' : value}`);
                        }
                    }}
                    className="space-y-6 text-black shadow-sm"
                >
                    <div className="flex items-center justify-between gap-4">
                        <TabsList className="bg-white border border-gray-200 p-1 shadow-sm flex-1 sm:flex-none">
                            <TabsTrigger
                                value="all"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#037166] data-[state=active]:to-[#025951] data-[state=active]:text-white px-4 sm:px-6 text-xs sm:text-sm flex-1 sm:flex-none"
                            >
                                All ({sortedListings.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="nearby"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#037166] data-[state=active]:to-[#025951] data-[state=active]:text-white px-4 sm:px-6 text-xs sm:text-sm flex-1 sm:flex-none"
                            >
                                Nearby
                            </TabsTrigger>
                        </TabsList>

                        {compareList.length === 2 && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="px-6 py-3 bg-[#037166] text-white rounded-xl font-semibold hover:bg-[#025951] transition-colors"
                            >
                                Compare {compareList.length} PGs
                            </motion.button>
                        )}
                    </div>

                    <div className="flex gap-8">
                        {/* Desktop Filter Panel */}
                        <div className="hidden lg:block w-80 flex-shrink-0">
                            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-28 overflow-hidden">
                                <FilterPanel />
                            </div>
                        </div>

                        {/* Listings Grid */}
                        <div className="flex-1">
                            <TabsContent value="all" className="mt-0">
                                {loading ? (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="bg-gray-200 h-64 rounded-2xl mb-4" />
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                                            </div>
                                        ))}
                                    </div>
                                ) : sortedListings.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        {sortedListings.map((listing) => (
                                            <PGCard key={listing.id} listing={listing} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon="search"
                                        title="No results found in your budget range"
                                        description="We couldn't find any PGs matching your criteria. Try widening your price range or exploring other categories."
                                        actionLabel="Reset Filters"
                                        onAction={() => {
                                            setPriceRange([0, 50000]);
                                            setMinRating(0);
                                            setSearchQuery('');
                                            router.push(pathname);
                                        }}
                                        className="bg-white rounded-3xl border border-gray-100 shadow-sm"
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="nearby" className="mt-0">
                                {sortedListings.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        {sortedListings
                                            .sort((a, b) => a.distance - b.distance)
                                            .map((listing) => (
                                                <PGCard key={listing.id} listing={listing} isNearby />
                                            ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon="map-pin"
                                        title="No nearby PGs found in your budget range"
                                        description="Try adjusting your filters or increasing your search radius to find more options."
                                        actionLabel="Reset Filters"
                                        onAction={() => {
                                            setPriceRange([0, 50000]);
                                            setMinRating(0);
                                            setSearchQuery('');
                                            router.push(pathname);
                                        }}
                                        className="bg-white rounded-3xl border border-gray-100 shadow-sm"
                                    />
                                )}
                            </TabsContent>
                        </div>
                    </div>
                </Tabs >
            </div >
        </div >
    );
}

export default function PGResultsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
            <PGListingsContent />
        </Suspense>
    );
}

