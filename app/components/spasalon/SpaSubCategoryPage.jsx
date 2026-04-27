'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Clock, ChevronRight, ShieldCheck, Heart, Filter, X, MapPin, Search, Sliders } from 'lucide-react';
import { Button } from '@/components/pghostels/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocationContext } from '@/context/LocationContext';
import { Slider } from '@/components/pghostels/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/pghostels/ui/sheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/pghostels/ui/input';
import { isObjectId, resolveParam } from '@/utils/slugHelper';

export default function SpaSubCategoryPage({ slugOverride = null, initialData = null }) {
    const router = useRouter();
    const params = useParams();
    const slugOrId = slugOverride || params.slug || params.id;
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const categoryName = searchParams.get('category') || initialData?.categoryName || 'Services';
    const subCategoryName = searchParams.get('name') || initialData?.name || 'Service List';
    const categoryUniqueId = searchParams.get('categoryId') || initialData?.categoryId || null;

    const { location, detectLocation } = useLocationContext();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
    
    const [categories, setCategories] = useState([]);
    const [allSubCategories, setAllSubCategories] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState(categoryUniqueId);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // Filter State
    const [priceRange, setPriceRange] = useState([200, 5000]);
    const [minRating, setMinRating] = useState(0);

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
    useEffect(() => {
        const catId = searchParams.get('categoryId');
        if (catId && catId !== expandedCategory) {
            setExpandedCategory(catId);
        }

        const minP = searchParams.get('minPrice');
        const maxP = searchParams.get('maxPrice');
        if (minP && maxP) setPriceRange([parseInt(minP), parseInt(maxP)]);

        const rating = searchParams.get('minRating');
        if (rating) setMinRating(parseFloat(rating));
    }, [searchParams]);

    // Update URL when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentParams = new URLSearchParams(searchParams.toString());
            if (priceRange[0] !== 200 || priceRange[1] !== 5000) {
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
                    <h6 className="block text-gray-400 mb-4 text-[10px] font-black uppercase tracking-widest">Service Categories</h6>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {categories.map((cat) => {
                            const catTarget = cat.slug || cat._id;
                            return (
                                <div key={cat._id} className="overflow-hidden">
                                    <button
                                        onClick={() => {
                                            if (expandedCategory === catTarget) setExpandedCategory(null);
                                            else setExpandedCategory(catTarget);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                                            expandedCategory === catTarget || catTarget === searchParams.get('categoryId')
                                            ? 'bg-[#C06C84]/10 text-[#C06C84] font-bold border border-[#C06C84]/20 shadow-sm' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#C06C84] border border-transparent'
                                        }`}
                                    >
                                        <span className="truncate">{cat.name}</span>
                                        {expandedCategory === catTarget ? (
                                            <ChevronRight className="w-4 h-4 rotate-90 transition-transform text-[#C06C84]" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 opacity-30" />
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
                                                <div className="pl-5 pr-1 py-2 space-y-1.5 mt-1 border-l-2 border-[#C06C84]/20 ml-4">
                                                    {allSubCategories.map(sub => {
                                                        const subTarget = sub.slug || sub._id;
                                                        return (
                                                            <button
                                                                key={sub._id}
                                                                onClick={() => {
                                                                    // domain + slug
                                                                    router.push(`/spa-salon/${subTarget}`);
                                                                }}
                                                                className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all truncate ${
                                                                    slugOrId === subTarget
                                                                    ? 'bg-[#C06C84] text-white shadow-md shadow-[#C06C84]/20'
                                                                    : 'text-gray-500 hover:text-[#C06C84] hover:bg-[#C06C84]/5'
                                                                }`}
                                                            >
                                                                {sub.name}
                                                            </button>
                                                        );
                                                    })}
                                                    {allSubCategories.length === 0 && (
                                                        <div className="text-center py-2">
                                                            <div className="w-4 h-4 border-2 border-[#C06C84]/20 border-t-[#C06C84] rounded-full animate-spin mx-auto" />
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
                                <div className="w-5 h-5 border-2 border-[#C06C84]/20 border-t-[#C06C84] rounded-full animate-spin mx-auto" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Price Range */}
                <div className="mb-8 border-b border-gray-100 pb-6">
                    <h6 className="block text-gray-400 mb-4 text-[10px] font-black uppercase tracking-widest">Price Range</h6>
                    <div className="px-1">
                        <Slider
                            defaultValue={[200, 5000]}
                            min={100}
                            max={10000}
                            step={100}
                            value={priceRange}
                            onValueChange={setPriceRange}
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
                                    : 'bg-white border-gray-100 text-gray-400 hover:border-amber-200 shadow-sm'
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
                    className="w-full mt-4 border border-gray-200 text-gray-400 hover:text-[#C06C84] hover:border-[#C06C84]/30 h-10 text-[10px] font-black rounded-xl gap-2 transition-all flex items-center justify-center shadow-sm"
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
        <div className="min-h-screen bg-[#F6F7FB]">
            {schemaData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                />
            )}
            <div className="bg-[#1A0515] pt-24 pb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#C06C84]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.button
                        whileHover={{ x: -10 }}
                        onClick={() => router.push('/spa-salon')}
                        className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-all text-xs font-black uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Spa & Salon
                    </motion.button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <p className="text-[#C06C84] text-xs font-black uppercase tracking-[0.2em] mb-3">{categoryName}</p>
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">{subCategoryName}</h1>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl">
                            <span className="text-white/80 text-sm font-black">{sortedServices.length} Experts Available</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl p-4 border border-gray-100 flex items-center gap-4"
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
                            placeholder="Search in this category..."
                            className="pl-12 h-12 bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 rounded-2xl"
                        />
                    </div>
                    
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="flex items-center space-x-2 px-6 h-12 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors shrink-0 lg:hidden text-black">
                                <Sliders className="w-5 h-5" />
                                <span className="font-black text-xs uppercase">Filters</span>
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex gap-10">
                    <div className="hidden lg:block w-80 flex-shrink-0">
                        <div className="bg-white rounded-[20px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-28">
                            <FilterPanel />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
                            <div className="flex bg-white p-1.5 rounded-[20px] border border-gray-200 shadow-sm w-full sm:w-auto">
                                <button 
                                    onClick={() => setActiveTab('all')}
                                    className={`flex-1 sm:flex-none px-8 py-3 rounded-[15px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-[#1A0515] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    All
                                </button>
                                <button 
                                    onClick={() => setActiveTab('nearby')}
                                    className={`flex-1 sm:flex-none px-8 py-3 rounded-[15px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'nearby' ? 'bg-[#1A0515] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Nearby
                                </button>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest hidden sm:block">Sort By:</span>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-700 outline-none focus:border-[#C06C84] transition-all cursor-pointer shadow-sm flex-1 sm:flex-none"
                                >
                                    {sortOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden animate-pulse h-[450px]" />
                                ))}
                            </div>
                        ) : sortedServices.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedServices.map((service, index) => (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ y: -8 }}
                                        onClick={() => router.push(`/spa-salon/${service.slug || service.id}`)}
                                        className="bg-white rounded-[20px] overflow-hidden border border-gray-100 cursor-pointer group shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            {service.image ? (
                                                <img
                                                    src={service.image}
                                                    alt={service.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                                    <Heart className="w-12 h-12 text-[#C06C84]/10" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-black text-gray-900 group-hover:text-[#C06C84] transition-colors line-clamp-1">{service.name}</h3>
                                                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100 shrink-0">
                                                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                                    <span className="text-xs font-black text-amber-700">{service.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.15em] mb-4">{service.provider || 'Premium Partner'}</p>

                                            <div className="flex-1">
                                                {service.address && (
                                                    <div className="flex items-start gap-2 text-gray-500 mb-4">
                                                        <MapPin className="w-4 h-4 text-[#C06C84] mt-0.5 shrink-0" />
                                                        <p className="text-xs font-medium leading-relaxed line-clamp-2">{service.address}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Price starts</p>
                                                    <p className="text-2xl font-black text-gray-900">₹{service.price.toLocaleString()}</p>
                                                </div>
                                                <Button className="px-5 py-4 bg-[#1A0515] hover:bg-[#C06C84] text-white rounded-[15px] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#1A0515]/10">
                                                    Book Now
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
                                        setPriceRange([200, 5000]);
                                        setMinRating(0);
                                        router.push(pathname);
                                    }}
                                    className="bg-white rounded-[40px] border border-gray-100 shadow-sm"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

