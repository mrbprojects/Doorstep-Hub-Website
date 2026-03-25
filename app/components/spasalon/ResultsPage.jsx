'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, Star, MapPin, Clock, Heart, ChevronLeft, Filter, ChevronRight, X, CheckCircle, Sliders } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useLocationContext } from '@/context/LocationContext';
import { Input } from '@/components/pghostels/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/pghostels/ui/sheet';
import { Slider } from '@/components/pghostels/ui/slider';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/pghostels/ui/button';



const filters = [
    'All Services',
    'Highest Rated',
    'Price: Low to High',
    'Price: High to Low',
    'Nearest First',
];

export function ResultsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { location, detectLocation } = useLocationContext();

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
    const [selectedFilter, setSelectedFilter] = useState('All Services');
    const [showFilters, setShowFilters] = useState(true);

    // New state for filters
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [minRating, setMinRating] = useState(0);
    const [categories, setCategories] = useState([]);
    const [allSubCategories, setAllSubCategories] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState(searchParams.get('categoryId') || null);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // Sync state with URL params
    useEffect(() => {
        const query = searchParams.get('query') || searchParams.get('name') || '';
        setSearchQuery(query);

        const budget = searchParams.get('budget');
        if (budget) {
            const budgetOpt = [
                { value: '499-999', range: [499, 999] },
                { value: '999-1999', range: [999, 1999] },
                { value: '1999+', range: [1999, 50000] }
            ].find(opt => opt.value === budget);
            
            if (budgetOpt) {
                setPriceRange(budgetOpt.range);
            }
        } else {
            setPriceRange([0, 50000]);
        }
        
        if (searchParams.get('categoryId')) {
            setExpandedCategory(searchParams.get('categoryId'));
        }
    }, [searchParams]);

    useEffect(() => {
        // No auto-detection, let the user trigger or wait for context
    }, [location]);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                if (!location) {
                    setLoading(false);
                    return;
                }

                const lat = location.lat.toString();
                const lng = location.lng.toString();

                const subcategoryId = searchParams.get('subcategoryId') || searchParams.get('subCategoryId') || "";
                const categoryId = searchParams.get('categoryId') || "";

                const filterMap = {
                    'All Services': '',
                    'Highest Rated': 'rating',
                    'Price: Low to High': 'price_low',
                    'Price: High to Low': 'price_high',
                    'Nearest First': 'nearest'
                };

                let currentSortBy = filterMap[selectedFilter] || '';
                if (activeTab === 'nearby') {
                    currentSortBy = 'nearest';
                }

                const payload = {
                    serviceId: '69524f4a57bb211ca094e5e6',
                    categoryId: categoryId || undefined,
                    subcategoryId: subcategoryId || undefined, // Standardized to lowercase c
                    searchQuery: searchQuery || undefined,
                    sortBy: currentSortBy || undefined,
                    lattitude: lat, // Standardized to double t
                    longitude: lng,
                    minPrice: priceRange[0],
                    maxPrice: priceRange[1],
                    minRating: minRating || undefined
                };

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/professional-services`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (data.success && data.professionalServices) {
                    const mappedServices = data.professionalServices.map(service => {
                        let distanceStr = '0.0 km';
                        if (service.location?.coordinates && lat && lng) {
                            const [sLng, sLat] = service.location.coordinates;
                            const dist = calculateDistance(parseFloat(lat), parseFloat(lng), sLat, sLng);
                            distanceStr = `${dist.toFixed(1)} km`;
                        }

                        const logo = service.logo || service.image || service.storeImage || "";
                        const imageUrl = logo && logo.startsWith('http')
                            ? logo
                            : logo
                                ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${logo}`
                                : 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80&w=800';

                        return {
                            id: service._id,
                            name: service.business_name || `${service.firstName} ${service.lastName}`,
                            provider: service.business_name || 'Professional Service',
                            image: imageUrl,
                            rating: parseFloat(service.rating) || 4.5,
                            reviews: service.totalOrders || 0,
                            price: service.startingAt || service.BasePrice || service.minFare || 0,
                            duration: '60 min',
                            distance: service.distance || distanceStr,
                            availability: service.badges?.[0] || 'Available',
                            isNearby: true,
                            address: service.address,
                            slug: service.slug
                        };
                    });
                    setServices(mappedServices);
                } else {
                    setServices([]);
                }
            } catch (error) {
                console.error("Error fetching spa services:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchServices();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchParams, location, activeTab, selectedFilter, searchQuery, priceRange, minRating]);

    // Fetch Categories and Subcategories
    useEffect(() => {
        const fetchCategories = async () => {
            setCategoriesLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serviceId: '69524f4a57bb211ca094e5e6' })
                });
                const data = await response.json();
                if (data.success) {
                    setCategories(data.category || []);
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const updateFilters = (updates) => {
        const currentParams = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                currentParams.set(key, value);
            } else {
                currentParams.delete(key);
            }
        });
        router.push(`${pathname}?${currentParams.toString()}`);
    };

    const sortedServices = useMemo(() => {
        let result = [...services];
        
        // Apply Rating Filter if set manually via state
        if (minRating > 0) {
            result = result.filter(s => s.rating >= minRating);
        }

        return result;
    }, [services, minRating]);

    const FilterPanel = ({ showTitle = true }) => {
        return (
            <div className="space-y-6 text-black">
                {showTitle && (
                    <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#C06C84]" />
                        Filters
                    </h4>
                )}

                {/* Categories Section */}
                <div className="mb-8 border-b border-gray-100 pb-6">
                    <h6 className="block text-gray-400 mb-4 text-[10px] font-black uppercase tracking-widest">Spa Categories</h6>
                    <div className="space-y-1">
                        {categoriesLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />)}
                            </div>
                        ) : categories.map((cat) => (
                            <div key={cat._id} className="mb-1">
                                <button
                                    onClick={() => {
                                        // Update filters immediately for category
                                        updateFilters({
                                            categoryId: cat._id,
                                            subcategoryId: '',
                                            categoryName: cat.name,
                                            name: cat.name
                                        });

                                        if (expandedCategory === cat._id) {
                                            setExpandedCategory(null);
                                        } else {
                                            setExpandedCategory(cat._id);
                                            // Fetch subcategories
                                            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ categoryId: cat._id })
                                            })
                                            .then(res => res.json())
                                            .then(data => {
                                                if (data.success) {
                                                    setAllSubCategories(prev => {
                                                        const otherSubs = prev.filter(s => s.categoryId !== cat._id);
                                                        return [...otherSubs, ...data.data.map(s => ({ ...s, categoryId: cat._id }))];
                                                    });
                                                }
                                            });
                                        }
                                    }}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                        searchParams.get('categoryId') === cat._id 
                                        ? 'bg-[#C06C84]/10 text-[#C06C84] font-bold' 
                                        : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                                >
                                    <span className="text-sm">{cat.name}</span>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${expandedCategory === cat._id ? 'rotate-90' : ''}`} />
                                </button>
                                
                                <AnimatePresence>
                                    {expandedCategory === cat._id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-4 pr-1 mt-1 space-y-1"
                                        >
                                            {allSubCategories
                                                .filter(s => s.categoryId === cat._id)
                                                .map(sub => (
                                                    <button
                                                        key={sub._id}
                                                        onClick={() => {
                                                            updateFilters({
                                                                categoryId: cat._id,
                                                                subcategoryId: sub._id,
                                                                categoryName: cat.name,
                                                                name: sub.name
                                                            });
                                                        }}
                                                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-all ${
                                                            searchParams.get('subcategoryId') === sub._id
                                                            ? 'text-[#C06C84] font-bold bg-[#C06C84]/5'
                                                            : 'text-gray-500 hover:text-[#C06C84] hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {sub.name}
                                                    </button>
                                                ))
                                            }
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Budget */}
                <div className="mb-6">
                    <h6 className="block text-gray-400 mb-4 text-[10px] font-black uppercase tracking-widest">Quick Budget</h6>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { value: '499-999', label: '₹499 - ₹999', range: [499, 999] },
                            { value: '999-1999', label: '₹999 - ₹1,999', range: [999, 1999] },
                            { value: '1999+', label: '₹1,999+', range: [1999, 50000] }
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    const isSelected = searchParams.get('budget') === opt.value;
                                    updateFilters({ budget: isSelected ? '' : opt.value });
                                    if (!isSelected) setPriceRange(opt.range);
                                }}
                                className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                    searchParams.get('budget') === opt.value
                                    ? 'bg-[#C06C84] border-[#C06C84] text-white shadow-md'
                                    : 'bg-white border-gray-100 text-gray-600 hover:border-[#C06C84]/30'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Range Slider */}
                <div className="mb-8 border-b border-gray-100 pb-6">
                    <h6 className="block text-gray-400 mb-4 text-[10px] font-black uppercase tracking-widest">Price Range Slider</h6>
                    <div className="px-1">
                        <Slider
                            defaultValue={[0, 50000]}
                            min={0}
                            max={50000}
                            step={100}
                            value={priceRange}
                            onValueChange={(val) => {
                                setPriceRange(val);
                                // Clear budget preset if user moves slider
                                if (searchParams.get('budget')) {
                                    updateFilters({ budget: '' });
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

                {/* Minimum Rating */}
                <div className="mb-8 border-b border-gray-100 pb-6">
                    <h6 className="block text-gray-400 mb-4 text-[10px] font-black uppercase tracking-widest">Minimum Rating</h6>
                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                                key={rating}
                                onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                                className={`h-10 rounded-xl flex items-center justify-center border transition-all ${
                                    minRating === rating
                                    ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                                    : 'bg-white border-gray-100 text-gray-400 hover:border-amber-200'
                                }`}
                            >
                                <span className="font-black text-sm">{rating}</span>
                                <Star className={`w-3 h-3 ml-1 ${minRating === rating ? 'fill-white' : 'fill-gray-300'} text-transparent`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reset Button */}
                <button 
                    className="w-full mt-4 border border-gray-200 text-gray-400 hover:text-[#C06C84] hover:border-[#C06C84]/30 h-10 text-[10px] font-black rounded-xl gap-2 transition-all flex items-center justify-center"
                    onClick={() => {
                        setPriceRange([200, 5000]);
                        setMinRating(0);
                        router.push(pathname);
                    }}
                >
                    <X className="w-3.5 h-3.5" />
                    Reset All Filters
                </button>
            </div>
        );
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const filteredServices = services.filter(service => {
        const matchesTab = activeTab === 'all' || (activeTab === 'nearby' && service.isNearby);
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.provider.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#F6F7FB]">
            {/* Header / Hero Section */}
            <div className="bg-gradient-to-br from-[#C27393] to-[#6D1357] pt-24 pb-20 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#C06C84]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6C5CE7]/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.button
                        whileHover={{ x: -5 }}
                        onClick={() => router.push('/spa-salon')}
                        className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors text-sm font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Spa & Salon
                    </motion.button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight drop-shadow-lg">
                                Spas Matched <span className="text-white/80">for You</span>
                            </h1>
                            <p className="text-white/90 text-lg font-medium">
                                {searchQuery ? `Searching for "${searchQuery}"` : 'Premium treatments designed for your relaxation and beauty.'}
                            </p>
                        </motion.div>

                        <div className="flex items-center gap-3">
                            <div className="h-12 bg-white/10 backdrop-blur-md rounded-2xl px-4 flex items-center border border-white/10">
                                <span className="text-white/80 text-sm font-bold">{sortedServices.length} Results</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Mobile Filter Bar */}
            <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100 flex items-center gap-4"
                >
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                            placeholder="Find treatments, salons, or experts..."
                            className="pl-12 h-12 bg-gray-50 border-gray-200 text-black placeholder:text-gray-400"
                        />
                    </div>
                    
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="flex items-center space-x-2 px-6 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors shrink-0 lg:hidden">
                                <Sliders className="w-5 h-5" />
                                <span className="font-bold text-sm">Filters</span>
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto custom-scrollbar">
                            <SheetHeader className="pb-6 border-b border-gray-100">
                                <SheetTitle className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-[#C06C84]" />
                                    Filters
                                </SheetTitle>
                            </SheetHeader>
                            <div className="mt-6">
                                <FilterPanel showTitle={false} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block w-80 flex-shrink-0">
                        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-28">
                            <FilterPanel />
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        {!location && !loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[#E8ECF2] shadow-xl">
                                <div className="p-6 rounded-full bg-[#F6F7FB] mb-6">
                                    <MapPin className="h-12 w-12 text-[#C06C84] animate-bounce" />
                                </div>
                                <h2 className="text-3xl font-bold text-[#0F172A] mb-3">Where are you?</h2>
                                <p className="text-[#64748B] text-center max-w-md mb-8 px-6 leading-relaxed">
                                    Discover the best spas and salons in your neighborhood. Please set your location to continue.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => detectLocation()}
                                    className="px-10 py-4 bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] text-white rounded-2xl font-bold shadow-lg shadow-[#C06C84]/30 hover:shadow-[#C06C84]/50 transition-all font-bold"
                                >
                                    Find Near Me
                                </motion.button>
                            </div>
                        ) : (
                            <>
                                {/* Tab Row */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
                                        <button 
                                            onClick={() => setActiveTab('all')}
                                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-[#6D1357] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            All Services
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('nearby')}
                                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'nearby' ? 'bg-[#6D1357] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            Nearby
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest hidden sm:block">Sort By:</span>
                                        <select 
                                            value={selectedFilter}
                                            onChange={(e) => setSelectedFilter(e.target.value)}
                                            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-700 outline-none focus:border-[#C06C84] transition-all cursor-pointer shadow-sm"
                                        >
                                            {filters.map(f => (
                                                <option key={f} value={f}>{f}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {loading ? (
                                        [1, 2, 4, 5].map((i) => (
                                            <div key={i} className="bg-white rounded-3xl overflow-hidden border border-[#E8ECF2] shadow-md animate-pulse h-[400px]" />
                                        ))
                                    ) : sortedServices.length > 0 ? (
                                        sortedServices.map((service, index) => (
                                            <ServiceCard
                                                key={service.id}
                                                service={service}
                                                index={index}
                                                router={router}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full">
                                            <EmptyState 
                                                icon="search"
                                                title="No services found in your budget range"
                                                description="We couldn't find any services matching your criteria. Try widening your price range or exploring other categories."
                                                actionLabel="Reset All Filters"
                                                onAction={() => {
                                                    setPriceRange([0, 50000]);
                                                    setMinRating(0);
                                                    router.push(pathname);
                                                }}
                                                className="bg-white rounded-[32px] border border-gray-100 shadow-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`relative px-6 py-3 rounded-lg font-medium transition-all ${active
                ? 'text-white'
                : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
        >
            {children}
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] rounded-lg -z-10"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
            )}
            {!active && (
                <div className="absolute inset-0 bg-[#F6F7FB] rounded-lg -z-10" />
            )}
        </button>
    );
}

function ServiceCard({ service, index, router }) {
    const [isWishlisted, setIsWishlisted] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            onClick={() => router.push(`/spa-salon/detail/${service.id}`)}
            className="bg-white rounded-[32px] overflow-hidden border border-gray-100 cursor-pointer group shadow-sm hover:shadow-2xl transition-all duration-500"
        >
            {/* Image */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80&w=800';
                    }}
                />

                {/* Wishlist Button */}
                {/* <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsWishlisted(!isWishlisted);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#C06C84] hover:bg-white transition-colors shadow-md"
                >
                    <Heart
                        className={`w-5 h-5 ${isWishlisted ? 'fill-[#C06C84] text-[#C06C84]' : ''}`}
                    />
                </motion.button> */}

                {/* Availability Badge */}
                <div className={`absolute top-5 left-5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md ${
                    service.availability === 'Available Today'
                    ? 'bg-green-500/90 text-white shadow-green-500/20'
                    : 'bg-[#C06C84]/90 text-white shadow-[#C06C84]/20'
                    }`}>
                    {service.availability}
                </div>
            </div>

            {/* Content */}
            <div className="p-7">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-[#C06C84] transition-colors">{service.name}</h3>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-black text-amber-700">{service.rating}</span>
                    </div>
                </div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">{service.provider}</p>

                {/* Distance */}
                {service.isNearby && (
                    <div className="flex items-center gap-1.5 text-gray-400 mb-6 bg-gray-50 w-fit px-3 py-1.5 rounded-full">
                        <MapPin className="w-3.5 h-3.5 text-[#C06C84]" />
                        <span className="text-[10px] font-black uppercase tracking-wider">{service.distance} away</span>
                    </div>
                )}

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Starting at</p>
                        <p className="text-2xl font-black text-gray-900">₹{service.price.toLocaleString()}</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/spa-salon/detail/${service.id}`);
                        }}
                        className="px-6 py-3 bg-[#6D1357] text-white rounded-xl text-sm font-black hover:bg-[#C06C84] transition-all shadow-lg shadow-[#6D1357]/10"
                    >
                        Book Now
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

