'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'motion/react';
import { useRouter, useSearchParams, useParams, usePathname } from 'next/navigation';
import {
    MapPin, Star, Search, Sliders, Heart, TrendingUp, X, Wifi, Utensils,
    Shirt, Zap, Shield, ChevronRight, Award, Sparkles, ArrowLeft
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/pghostels/ui/tabs';
import { Input } from '@/components/pghostels/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/pghostels/ui/sheet';
import { Slider } from '@/components/pghostels/ui/slider';
import { Checkbox } from '@/components/pghostels/ui/checkbox';
import { EmptyState } from '@/components/ui/EmptyState';

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

    const [priceRange, setPriceRange] = useState([5000, 20000]);
    const [savedItems, setSavedItems] = useState([]);
    const [compareList, setCompareList] = useState([]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
    const [filteredListings, setFilteredListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [usingFallback, setUsingFallback] = useState(false);
    const [minRating, setMinRating] = useState(0);

    // BUG-12 FIX: Restore last active tab from localStorage so back-navigation preserves the user's tab
    const getInitialTab = () => {
        if (searchParams.get('lat')) return 'nearby';
        try {
            const saved = localStorage.getItem('pg_listings_last_tab');
            if (saved) return saved;
        } catch { /* ignore */ }
        return 'all';
    };
    const [activeTab, setActiveTab] = useState(getInitialTab);

    // PG Hostels Service ID (from PremiumHomePage) - You might want to move these to a config file
    const SERVICE_ID = '69524fb157bb211ca094e5ee';
    const CATEGORY_ID = '65b2f234567890abcdef456'; // Replace with actual Category ID if known
    const SUBCATEGORY_ID = '65b2f34567890abcdef789'; // Replace with actual Subcategory ID if known

    const mapApiResponseToListing = (item) => {
        if (!item) return null;
        // Helper to safely extract a string from a value that might be an object
        const str = (val, fallback = '') => {
            if (!val) return fallback;
            if (typeof val === 'string') return val || fallback;
            if (typeof val === 'object') return val.title || val.name || val.label || fallback;
            return String(val) || fallback;
        };
        const num = (val, fallback = 0) => {
            if (!val) return fallback;
            if (typeof val === 'number') return val;
            if (typeof val === 'object') return val.amount || val.value || fallback;
            return parseFloat(val) || fallback;
        };
        // Sanitize amenities: each item may be {_id, title, image} — extract the string
        const rawAmenities = item?.amenities;
        const amenities = Array.isArray(rawAmenities)
            ? rawAmenities.map(a => str(a, '')).filter(Boolean)
            : ['WiFi', 'Food', 'Laundry'];
        return {
            id: str(item?._id, 'unknown'),
            name: str(item?.business_name || item?.hostelName) ||
                `${str(item?.firstName)} ${str(item?.lastName)}`.trim() || 'Professional Service',
            location: str(item?.address || item?.cityName, 'Unknown Location'),
            rating: num(item?.rating) || 4.5,
            orders: num(item?.totalOrders),
            basePrice: num(item?.startingAt || item?.minFare),
            monthlyPrice: num(item?.startingAt || item?.minFare) || 6500,
            image: item?.logo ? `https://api.doorstephub.com/${item.logo}` : mockListings[0]?.image,
            distance: parseFloat(str(item?.distance, '2.5').replace(' km', '')) || 2.5,
            matchScore: num(item?.matchScore) || 90,
            badges: Array.isArray(item?.badges)
                ? item.badges.map(b => str(b, '')).filter(Boolean)
                : ['Verified'],
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
    }, [searchParams]);

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                // Get location from URL params or localStorage
                let lat = searchParams.get('lat') || "17.4483"; // Default Hyderabad
                let lng = searchParams.get('lng') || "78.3915";

                // If not in URL, try localStorage
                if (!searchParams.get('lat') && typeof window !== 'undefined') {
                    try {
                        const storedLocation = localStorage.getItem('user_location_data');
                        if (storedLocation) {
                            const parsedLocation = JSON.parse(storedLocation);
                            if (parsedLocation?.lat && parsedLocation?.lng) {
                                lat = parsedLocation.lat.toString();
                                lng = parsedLocation.lng.toString();
                            }
                        }
                    } catch (e) {
                        console.error("Error parsing stored location", e);
                    }
                }

                // Construct API payload matching your Curl request
                const payload = {
                    lattitude: lat,
                    longitude: lng,
                    searchQuery: searchQuery || undefined,
                    serviceId: SERVICE_ID,
                    categoryId: CATEGORY_ID,
                    subcategoryId: SUBCATEGORY_ID,
                    minPrice: priceRange?.[0] || 0,
                    maxPrice: priceRange?.[1] || 100000,
                    minRating: minRating || 0
                };


                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/professional-services', {
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
                    // No results — show EmptyState instead of fake mock data
                    setFilteredListings([]);
                    setUsingFallback(false);
                }
            } catch (error) {
                console.error('Error fetching listings:', error);
                // On error — show EmptyState with error message, NOT fake Bangalore data
                setFilteredListings([]);
                setFetchError(true);
                setUsingFallback(false);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [searchQuery, priceRange, minRating]); // Re-run when filters change

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

    const FilterPanel = () => (
        <div className="space-y-6 shadow-sm text-black">
            <div>
                <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
                <Slider
                    defaultValue={[5000, 20000]}
                    min={3000}
                    max={25000}
                    step={500}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-2 text-black"
                />
                <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-gray-900 mb-3">Minimum Rating</h3>
                <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                        <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                            <Checkbox
                                checked={minRating === rating}
                                onCheckedChange={(checked) => setMinRating(checked ? rating : 0)}
                            />
                            <div className="flex items-center">
                                <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B] mr-1" />
                                <span className="text-sm text-gray-700">{rating}+ stars</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
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
                    <div className="relative h-64 overflow-hidden">
                        <div
                            className={`absolute inset-0 bg-cover bg-center ${isClickable ? 'group-hover:scale-110' : ''} transition-transform duration-500`}
                            style={{ backgroundImage: `url(${listing.image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            {listing.badges.map((badge, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900"
                                >
                                    {badge}
                                </span>
                            ))}
                            {listing.availableBeds <= 3 && (
                                <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                                    Few beds left
                                </span>
                            )}
                        </div>

                        {/* Match Score Badge */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="absolute top-4 right-4 bg-gradient-to-br from-[#037166] to-[#025951] text-white px-4 py-2 rounded-2xl shadow-lg flex items-center space-x-2"
                        >
                            <Award className="w-4 h-4" />
                            <span className="font-bold">{listing.matchScore}%</span>
                            <span className="text-xs">match</span>
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
                            <div className="absolute bottom-4 right-4 flex space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSave(listing.id);
                                    }}
                                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                                >
                                    <Heart
                                        className={`w-5 h-5 transition-all ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                            }`}
                                    />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCompare(listing.id);
                                    }}
                                    className={`px-4 py-2 backdrop-blur-sm rounded-full text-sm font-semibold transition-all shadow-lg ${isComparing
                                        ? 'bg-[#037166] text-white'
                                        : 'bg-white/90 text-gray-900 hover:bg-white'
                                        }`}
                                >
                                    {isComparing ? '✓ Compare' : 'Compare'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-6" onClick={() => isClickable && router.push(`/pghostels/hostel-detail/${listing.id}?fromListing=${params.type}`)}>
                        {/* PG Name & Location */}
                        <div className="mb-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#037166] transition-colors">
                                {listing.name}
                            </h3>
                            <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{listing.location}</span>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center space-x-1">
                                <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
                                <span className="font-bold text-gray-900">{listing.rating}</span>
                            </div>

                            {/* {listing.availableBeds <= 5 && (
                                <div className="flex items-center space-x-1 text-orange-600">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-sm font-medium">{listing.availableBeds} beds left</span>
                                </div>
                            )} */}
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {listing.amenities.map((amenity, i) => {
                                const Icon = amenityIcons[amenity];
                                return (
                                    <div
                                        key={i}
                                        className="px-3 py-1.5 bg-gray-100 rounded-lg flex items-center space-x-1.5 text-sm text-gray-700"
                                    >
                                        {Icon && <Icon className="w-4 h-4" />}
                                        <span>{amenity}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Price & CTA */}
                        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Starting from</div>
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-3xl font-bold text-gray-900">₹{listing.monthlyPrice.toLocaleString()}</span>
                                    <span className="text-sm text-gray-500">/month</span>
                                </div>
                            </div>

                            <button
                                disabled={!isClickable}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 ${isClickable
                                    ? 'bg-gradient-to-r from-[#037166] to-[#025951] text-white hover:shadow-lg hover:shadow-[#037166]/30'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <span>{isClickable ? 'View Details' : 'Preview Only'}</span>
                                {isClickable && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-16">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#037166] to-[#025951] pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4">
                    <button
                        onClick={() => router.back()}
                        className="mb-8 mt-4 flex items-center text-white/80 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </button>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            PGs matched for you
                        </h1>
                        <p className="text-white/90 text-lg mb-4">
                            {searchQuery ? `Results for "${searchQuery}"` : 'Based on your preferences + location'}
                        </p>

                        {/* Filter Chips */}
                        {filterChips.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {filterChips.map((chip, i) => (
                                    <span
                                        key={i}
                                        className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm font-medium flex items-center space-x-2"
                                    >
                                        <span>{chip}</span>
                                        <button className="hover:bg-white/10 rounded-full p-0.5">
                                            <X className="w-3.5 h-3.5" />
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
                                <button className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                    <Sliders className="w-5 h-5" />
                                    <span className="hidden md:inline font-medium">Filters</span>
                                </button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Filter Options</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                    <FilterPanel />
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
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#037166] to-[#025951] rounded-xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {recommendedListings.map((listing) => (
                                <PGCard key={listing.id} listing={listing} />
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
                    <div className="flex items-center justify-between">
                        <TabsList className="bg-white border border-gray-200 p-1 shadow-sm">
                            <TabsTrigger
                                value="all"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#037166] data-[state=active]:to-[#025951] data-[state=active]:text-white px-6"
                            >
                                All PGs ({sortedListings.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="nearby"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#037166] data-[state=active]:to-[#025951] data-[state=active]:text-white px-6"
                            >
                                Nearby PGs
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
                            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <Sliders className="w-5 h-5 mr-2 text-[#037166]" />
                                    Filters
                                </h2>
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
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {sortedListings.map((listing) => (
                                            <PGCard key={listing.id} listing={listing} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon="search"
                                        title="No PGs found"
                                        description="We couldn't find any PGs matching your criteria. Try adjusting your price range or filters."
                                        actionLabel="Reset Filters"
                                        onAction={() => {
                                            setPriceRange([5000, 20000]);
                                            setSearchQuery('');
                                        }}
                                        className="bg-white rounded-3xl border border-gray-100 shadow-sm"
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="nearby" className="mt-0">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {sortedListings
                                        .sort((a, b) => a.distance - b.distance)
                                        .map((listing) => (
                                            <PGCard key={listing.id} listing={listing} isNearby />
                                        ))}
                                </div>
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
