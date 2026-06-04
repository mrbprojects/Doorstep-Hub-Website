'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Sparkles, Filter, CheckCircle, Clock, Sliders, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocationContext } from '@/context/LocationContext';
import { Slider } from '@/components/pghostels/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/pghostels/ui/sheet';
import { isObjectId, resolveParam } from '@/utils/slugHelper';

const RELIGIOUS_SERVICE_SLUG = 'rituals-and-religious-services';
const RELIGIOUS_SERVICE_ID = '695250aa57bb211ca094e5fd';

function SubCategoryServicesContent() {
    const router = useRouter();
    const params = useParams();
    const slugOrId = params.slug || params.id;
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Context from URL or Storage
    const [context, setContext] = useState({
        categoryName: searchParams.get('category') || 'Services',
        subCategoryName: searchParams.get('name') || searchParams.get('subCategoryName') || 'Available Services',
        categoryId: (searchParams.get('categoryId') && searchParams.get('categoryId') !== 'null') ? searchParams.get('categoryId') : null
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('religious_subcategory_context');
            if (stored) {
                const parsed = JSON.parse(stored);
                setContext(prev => ({
                    ...prev,
                    categoryName: parsed.categoryName || prev.categoryName,
                    subCategoryName: parsed.subCategoryName || prev.subCategoryName,
                    categoryId: parsed.categoryId || prev.categoryId
                }));
                if (parsed.budget && !searchParams.get('budget')) {
                    if (parsed.budget === '5000+') {
                        setPriceRange([5000, 50000]);
                    } else if (parsed.budget.includes('-')) {
                        const [min, max] = parsed.budget.split('-').map(Number);
                        if (!isNaN(min) && !isNaN(max)) {
                            setPriceRange([min, max]);
                        }
                    }
                }
            }
        }
    }, [searchParams]);

    const { categoryName, subCategoryName, categoryId } = context;
    const categoryUniqueId = categoryId;

    const { location, detectWithIP } = useLocationContext();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [minRating, setMinRating] = useState(0);

    // Sync filters from URL
    useEffect(() => {
        const budget = searchParams.get('budget');
        const rating = searchParams.get('minRating');

        if (budget) {
            if (budget === '5000+') {
                setPriceRange([5000, 50000]);
            } else if (budget.includes('-')) {
                const [min, max] = budget.split('-').map(Number);
                if (!isNaN(min) && !isNaN(max)) {
                    setPriceRange([min, max]);
                }
            }
        }
        if (rating) {
            setMinRating(parseFloat(rating));
        }
    }, [searchParams]);

    const [expandedCategory, setExpandedCategory] = useState(categoryUniqueId);
    const [activeCategoryName, setActiveCategoryName] = useState(categoryName);
    const [categories, setCategories] = useState([]);
    const [allSubCategories, setAllSubCategories] = useState([]);

    useEffect(() => {
        if (categoryUniqueId) {
            setExpandedCategory(categoryUniqueId);
            const currentCat = categories.find(c => (c.slug === categoryUniqueId || c._id === categoryUniqueId));
            if (currentCat) {
                setActiveCategoryName(currentCat.name);
            }
        }
    }, [categoryUniqueId, categories]);

    useEffect(() => {
        if (!location) {
            detectWithIP().catch(err => console.log("Auto detect failed", err));
        }
    }, [location]);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serviceId: RELIGIOUS_SERVICE_ID })
                });
                const data = await response.json();
                if (data.success && data.category) {
                    setCategories(data.category);
                }
            } catch (e) { console.log(e); }
        };
        fetchCategories();
    }, []);

    // Fetch Subcategories for active category
    useEffect(() => {
        const fetchSubCategories = async () => {
            if (!expandedCategory || expandedCategory === 'null') return;
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
            } catch (e) { console.log(e); }
        };
        fetchSubCategories();
    }, [expandedCategory]);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const lat = location?.lat || 17.3850;
                const lng = location?.lng || 78.4867;

                const subCategoryParam = resolveParam(slugOrId, 'subcategoryId', 'subcategorySlug');
                const serviceParam = { serviceId: RELIGIOUS_SERVICE_ID };

                const payload = {
                    ...serviceParam,
                    ...subCategoryParam,
                    lattitude: lat,
                    longitude: lng,
                    minPrice: priceRange[0],
                    maxPrice: priceRange[1],
                    minRating: minRating || undefined,
                };

                if (categoryUniqueId) {
                    const catParam = resolveParam(categoryUniqueId, 'categoryId', 'categorySlug');
                    Object.assign(payload, catParam);
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/professional-services`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();

                if (data.success && data.professionalServices) {
                    setServices(data.professionalServices);
                }
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [location, slugOrId, categoryUniqueId, searchParams]);

    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const rawPrice = service.startingAt || service.BasePrice || service.minFare || 1100;
            const price = Number(rawPrice);
            const rating = Number(service.avgRating || 4.8);
            
            const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
            const matchesRating = rating >= minRating;
            
            return matchesPrice && matchesRating;
        });
    }, [services, priceRange, minRating]);

    const FilterPanel = ({ className = "" }) => (
        <div className={`space-y-6 ${className}`}>
            <h4 className="text-xl font-black text-[var(--deep-charcoal)] mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5 text-[var(--saffron)]" />
                Filters
            </h4>

            {/* Categories Filter */}
            <div className="mb-8 border-b border-orange-100 pb-6">
                <h6 className="block text-gray-400 mb-4 text-[10px] font-black uppercase tracking-widest">Ritual Categories</h6>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {categories.map((cat) => {
                        const catTarget = cat.slug || cat._id;
                        return (
                        <div key={cat._id} className="overflow-hidden">
                            <button
                                onClick={() => {
                                    if (expandedCategory === catTarget) setExpandedCategory(null);
                                    else {
                                        setExpandedCategory(catTarget);
                                        setActiveCategoryName(cat.name);
                                    }
                                }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                                    expandedCategory === catTarget || catTarget === categoryUniqueId
                                    ? 'bg-[var(--saffron)]/10 text-[var(--saffron)] font-bold border border-[var(--saffron)]/20 shadow-sm' 
                                    : 'text-gray-600 hover:bg-orange-50/50 hover:text-[var(--saffron)] border border-transparent'
                                }`}
                            >
                                <span className="truncate">{cat.name}</span>
                                {expandedCategory === catTarget ? (
                                    <ChevronRight className="w-4 h-4 rotate-90 transition-transform text-[var(--saffron)]" />
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
                                        <div className="pl-5 pr-1 py-2 space-y-1.5 mt-1 border-l-2 border-orange-100 ml-4">
                                            {allSubCategories.map(sub => {
                                                const subTarget = sub.slug || sub._id;
                                                return (
                                                <button
                                                    key={sub._id}
                                                    onClick={() => {
                                                        if (typeof window !== 'undefined') {
                                                            sessionStorage.setItem('religious_subcategory_context', JSON.stringify({
                                                                categoryId: catTarget,
                                                                categoryName: activeCategoryName || cat.name,
                                                                subCategoryName: sub.name
                                                            }));
                                                        }
                                                        router.push(`/religious-services/${subTarget}`);
                                                    }}
                                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all truncate ${
                                                        slugOrId === subTarget
                                                        ? 'bg-[var(--saffron)] text-white shadow-md shadow-[var(--saffron)]/20'
                                                        : 'text-gray-500 hover:text-[var(--saffron)] hover:bg-orange-50'
                                                    }`}
                                                >
                                                    {sub.name}
                                                </button>
                                            )})}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )})}
                </div>
            </div>

            {/* Price Filter */}
            <div className="mb-8 border-b border-orange-100 pb-6">
                <div className="flex items-center justify-between mb-6">
                    <h6 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Offering Range</h6>
                    <span className="text-[11px] font-bold text-[var(--saffron)] bg-[var(--saffron)]/10 px-2.5 py-1 rounded-full border border-[var(--saffron)]/10">
                        ₹{mounted ? priceRange[1].toLocaleString() : priceRange[1]}
                    </span>
                </div>
                <div className="px-1">
                    <Slider
                        defaultValue={[0, 50000]}
                        min={0}
                        max={100000}
                        step={500}
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

            {/* Rating Filter */}
            <div className="mb-6">
                <h6 className="block text-gray-400 mb-4 text-[10px] font-black uppercase tracking-widest">Devotee Rating</h6>
                <div className="grid grid-cols-2 gap-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl transition-all border-2 ${
                                minRating === rating
                                ? 'bg-[var(--saffron)] border-[var(--saffron)] text-white shadow-lg shadow-[var(--saffron)]/30'
                                : 'bg-white border-gray-100 text-gray-500 hover:border-orange-200 hover:text-[var(--saffron)]'
                            }`}
                        >
                            <Star className={`w-3.5 h-3.5 ${minRating === rating ? 'fill-white text-white' : 'fill-[var(--saffron)] text-[var(--saffron)]'}`} />
                            <span className="text-xs font-black">{rating}+</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Reset Button */}
            <Button 
                variant="outline" 
                className="w-full mt-4 bg-white border-gray-100 text-gray-400 hover:text-[var(--saffron)] hover:border-[var(--saffron)]/20 h-11 text-[11px] font-black rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                onClick={() => {
                    setPriceRange([500, 50000]);
                    setMinRating(0);
                    setExpandedCategory(categoryUniqueId);
                }}
            >
                <X className="w-3.5 h-3.5" />
                Reset All Filters
            </Button>
        </div>
    );

    const schemaData = filteredServices.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `${subCategoryName} Experts in ${location?.city || 'your area'}`,
        "description": `Book verified priests and scholars for ${subCategoryName}.`,
        "itemListElement": filteredServices.map((service, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": service.business_name || `${service.firstName} ${service.lastName}`,
            "url": typeof window !== 'undefined' ? `${window.location.origin}/religious-services/${service.slug || service._id}` : ""
        }))
    } : null;

    return (
        <div className="min-h-screen bg-[var(--off-white)] pt-24 pb-16">
            {schemaData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                />
            )}
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (categoryUniqueId) {
                                router.push(`/religious-services/${categoryUniqueId}`);
                            } else {
                                router.push('/religious-services');
                            }
                        }}
                        className="mb-6 text-gray-500 hover:text-[var(--saffron)] transition-all hover:translate-x-[-4px]"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Categories
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--saffron)]/10 text-[var(--saffron)] text-xs font-bold uppercase tracking-widest mb-3">
                                <Sparkles className="w-3 h-3 mr-2" />
                                {categoryName}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-[var(--deep-charcoal)] mb-3 tracking-tight">{subCategoryName}</h1>
                            <p className="text-gray-500 text-lg">Verified priests and sacred services curated for your {subCategoryName.toLowerCase()} ceremonies.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="lg:hidden bg-white border-gray-200 hover:border-[var(--saffron)]/30 gap-2 h-10 px-4 rounded-xl text-sm font-bold">
                                        <Sliders className="w-4 h-4" />
                                        Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[310px] bg-[var(--off-white)] border-r border-orange-100 p-0 overflow-y-auto custom-scrollbar">
                                    <SheetHeader className="p-6 border-b border-orange-50 bg-white">
                                        <SheetTitle className="text-2xl font-black text-[var(--deep-charcoal)] flex items-center gap-2">
                                            <Filter className="w-5 h-5 text-[var(--saffron)]" />
                                            Filters
                                        </SheetTitle>
                                    </SheetHeader>
                                    <div className="p-4 bg-[var(--off-white)]">
                                        <FilterPanel />
                                    </div>
                                </SheetContent>
                            </Sheet>
                            <Badge className="bg-white text-[var(--deep-charcoal)] border-gray-200 px-4 py-2 text-sm font-bold shadow-sm rounded-xl">
                                {filteredServices.length} Results
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="hidden lg:block w-80 shrink-0">
                        <div className="sticky top-28">
                            <FilterPanel className="p-7 rounded-[32px] bg-white border border-orange-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden" />
                        </div>
                    </div>

                    {/* Services List View */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 text-[var(--saffron)] bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <motion.div
                                    animate={{ 
                                        rotate: [0, 360],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="mb-4"
                                >
                                    <Sparkles className="w-16 h-16 opacity-20" />
                                </motion.div>
                                <p className="text-xl font-bold tracking-tight">Finding Divine Services...</p>
                                <p className="text-gray-400 mt-2">Preparing the sacred space for you</p>
                            </div>
                        ) : filteredServices.length > 0 ? (
                            <div className="space-y-6">
                                <AnimatePresence mode="popLayout">
                                    {filteredServices.map((service, i) => {
                                        const target = service.slug || service._id;
                                        return (
                                        <motion.div
                                            key={service._id || i}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.05 }}
                                            layout
                                        >
                                            <Card
                                                className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-transparent hover:border-[var(--saffron)]/20 bg-white shadow-sm relative"
                                                onClick={() => {
                                                    if (typeof window !== 'undefined') {
                                                        sessionStorage.setItem('religious_service_context', JSON.stringify({
                                                            subcategoryId: slugOrId,
                                                            subCategoryName: subCategoryName,
                                                            categoryName: categoryName,
                                                            categoryId: categoryUniqueId
                                                        }));
                                                    }
                                                    router.push(`/religious-services/${target}`);
                                                }}
                                            >
                                                <div className="flex flex-col md:flex-row h-full">
                                                    {/* Image Section */}
                                                    <div className="relative w-full md:w-52 h-40 md:h-auto overflow-hidden shrink-0">
                                                        <img loading="lazy" decoding="async"
                                                            src={service.image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.image}` : 'https://images.unsplash.com/photo-1762090420353-47d4a0b3f6af?auto=format&fit=crop&q=80'}
                                                            alt={service.business_name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-0 bg-black/5 md:hidden" />
                                                        
                                                        {/* Floating Rating on Image */}
                                                        <div className="absolute top-2 left-2">
                                                            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-gray-900 shadow-sm">
                                                                <Star className="h-2.5 w-2.5 fill-[var(--saffron)] text-[var(--saffron)]" />
                                                                {service.avgRating || 4.8}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Content Section */}
                                                    <CardContent className="flex-1 p-4 md:p-5 flex flex-col justify-between">
                                                        <div className="flex flex-col h-full">
                                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <Badge variant="secondary" className="bg-[var(--saffron)]/10 text-[var(--saffron)] border-none font-bold uppercase tracking-wider text-[8px] h-4">
                                                                            Verified Expert
                                                                        </Badge>
                                                                        {service.totalOrders > 50 && (
                                                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[8px] h-4">
                                                                                Top Rated
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <h3 className="text-lg md:text-xl font-black text-[var(--deep-charcoal)] mb-0.5 group-hover:text-[var(--saffron)] transition-colors tracking-tight truncate">
                                                                        {service.business_name || `${service.firstName} ${service.lastName}`}
                                                                    </h3>
                                                                    <div className="flex items-start text-[10px] font-medium text-gray-400 gap-1 mt-1 transition-colors group-hover:text-gray-500">
                                                                        <MapPin className="h-3 w-3 text-[var(--saffron)] shrink-0" />
                                                                        <span className="line-clamp-1">{service.address ? service.address : 'Available at Your Doorstep'}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="hidden md:flex flex-col items-end">
                                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">From</span>
                                                                    <div className="text-xl font-black text-[var(--saffron)] tracking-tighter leading-none">
                                                                        ₹{(service.startingAt || service.BasePrice || service.minFare || 1100).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-1">
                                                                {service.description || service.bio || 'Experience divine blessings with our expert Vedic priests.'}
                                                            </p>

                                                            <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                                                                        On-time Visit
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                                        <Clock className="w-3 h-3 text-orange-400" />
                                                                        Fast Response
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                     {/* Mobile Price */}
                                                                    <div className="md:hidden text-right">
                                                                        <span className="text-[14px] font-bold text-[var(--saffron)]">₹{(service.startingAt || service.BasePrice || service.minFare || 1100).toLocaleString()}</span>
                                                                    </div>
                                                                    <Button className="bg-[var(--saffron)] hover:bg-[var(--temple-red)] text-white px-4 h-8 rounded text-[11px] font-bold shadow-sm transition-all group/btn">
                                                                        Book Now
                                                                        <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    )})}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="mb-6 inline-flex p-6 rounded-full bg-gray-50"
                                >
                                    <Sparkles className="w-16 h-16 text-gray-200" />
                                </motion.div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">No results found in your budget range</h3>
                                <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">Try widening your price range or exploring other divine categories to find the right priest for your ceremony.</p>
                                <Button 
                                    onClick={() => {
                                        setPriceRange([0, 50000]);
                                        setMinRating(0);
                                        router.push(pathname);
                                    }}
                                    className="bg-white border-2 border-gray-200 text-gray-900 hover:border-[var(--saffron)] hover:text-[var(--saffron)] hover:bg-white"
                                >
                                    Reset All Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SubCategoryServicesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">Loading...</div>}>
            <SubCategoryServicesContent />
        </Suspense>
    );
}

