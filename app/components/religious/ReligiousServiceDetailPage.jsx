'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, Star, DollarSign, Wifi, Utensils, Shirt, Zap,
    Car, Shield, Camera, MessageSquare, Sparkles, MapPin, Clock, Check, X, Flower2, Loader2, CheckCircle, ChevronRight, ChevronLeft
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/pghostels/ui/tabs';
import 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { AddonsModal } from '@/components/religious/AddonsModal';
import { isObjectId } from '@/utils/slugHelper';
import DOMPurify from 'dompurify';

const amenityIcons = {
    Wifi: Wifi,
    Food: Utensils,
    Laundry: Shirt,
    PowerBackup: Zap,
    Parking: Car,
    Security: Shield,
    AC: Sparkles,
    CCTV: Camera,
    "Pooja Items": Flower2,
    "Prasad": Utensils,
    "Dakshina": DollarSign,
};

export default function ReligiousServiceDetailPage({ slugOverride = null }) {
    const router = useRouter();
    const params = useParams();
    
    const slugOrId = slugOverride || params.slug || params.id;
    const searchParams = useSearchParams();

    const [context] = useState(() => {
        const initial = {
            subcategoryId: searchParams.get('subcategoryId'),
            subCategoryName: searchParams.get('subCategoryName'),
            categoryName: searchParams.get('categoryName'),
            categoryId: searchParams.get('categoryId')
        };
        if (typeof window === 'undefined') return initial;
        try {
            const stored = sessionStorage.getItem('religious_service_context');
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    subcategoryId: parsed.subcategoryId || initial.subcategoryId,
                    subCategoryName: parsed.subCategoryName || initial.subCategoryName,
                    categoryName: parsed.categoryName || initial.categoryName,
                    categoryId: parsed.categoryId || initial.categoryId
                };
            }
        } catch {
            // ignore
        }
        return initial;
    });

    const { subcategoryId } = context;

    const [activeTab, setActiveTab] = useState('portfolio');
    
    

    const [serviceData, setServiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPackages, setSelectedPackages] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('all');
    const [showAddonsModal, setShowAddonsModal] = useState(false);
    const [isCheckingAddons, setIsCheckingAddons] = useState(false);
    const [globalSettings, setGlobalSettings] = useState(null);
    const [viewingRateCard, setViewingRateCard] = useState(null);
    const [rateCardImageIndex, setRateCardImageIndex] = useState(0);

    const togglePackage = (pkg) => {
        setSelectedPackages(prev => {
            const isSelected = prev.some(p => p._id === pkg._id);
            if (isSelected) {
                return prev.filter(p => p._id !== pkg._id);
            } else {
                return [...prev, pkg];
            }
        });
    };

    const totalPrice = selectedPackages.reduce((sum, pkg) => sum + (parseFloat(pkg.price) || 0), 0);

    const renderSanitizedHtml = (htmlContent) => ({
        __html: DOMPurify.sanitize(htmlContent || '', {
            USE_PROFILES: { html: true },
        }),
    });

    useEffect(() => {
        if (!loading && !serviceData) {
            router.replace('/appliance-repair-services');
        }
    }, [loading, serviceData, router]);

    useEffect(() => {
        const fetchServiceData = async () => {
            if (!slugOrId) return;
            setLoading(true);
            try {
                const isId = isObjectId(slugOrId);
                const apiPayload = isId ? { providerId: slugOrId } : { providerSlug: slugOrId };
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/single-professional-provider`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(apiPayload)
                });
                const data = await response.json();

                if (data.success && data.storeData && data.storeData.length > 0) {
                    const store = data.storeData[0];
                    const getFullUrl = (path, defaultUrl) => {
                        if (!path) return defaultUrl;
                        if (path.startsWith('http')) return path;
                        return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${path}`;
                    };
                    const mappedData = {
                        id: store._id || slugOrId,
                        slug: store.slug || slugOrId,
                        name: store.business_name || `${store.firstName} ${store.lastName}`,
                        location: store.address || 'Location available on request',
                        mainImage: getFullUrl(store.image, 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&q=80'),
                        address: store.address || 'Address provided upon booking',
                        rating: parseFloat(store.avgRating || 4.8).toFixed(1),
                        orders: store.totalOrders || 120,
                        basePrice: store.startingAt || 1100,
                        monthlyPrice: store.startingAt || 1100,
                        logo: getFullUrl(store.logo, 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&q=80'),
                        images: data.serviceImages && data.serviceImages.length > 0
                            ? data.serviceImages.map(img => `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img.replace(/^\//, '')}`)
                            : [
                                'https://images.unsplash.com/photo-1582344795368-b3d9016c68cb?auto=format&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1609139003551-ee404a3b090b?auto=format&fit=crop&q=80'
                            ],
                        amenities: [
                            ...(Array.isArray(data.amenities) ? data.amenities : []),
                            ...(data.otherAmenities ? data.otherAmenities.split(',').map(a => a.trim()) : ['Pooja Items', 'Prasad'])
                        ].map(amenity => ({
                            icon: amenityIcons[amenity] || Flower2,
                            label: amenity,
                            available: true
                        })),
                        reviews: data.customerRatings ? data.customerRatings.map(review => ({
                            name: review.name || 'Devotee',
                            avatar: review.image || '🙏',
                            rating: review.rating,
                            date: review.date ? new Date(review.date).toLocaleDateString() : 'Recently',
                            comment: review.comment || 'Blessed experience.'
                        })) : [],
                        packages: data.provider_rate_cards || [],
                        about: data.aboutUs || store.bio || 'Expert Vedic Priests and religious service providers ensuring divine experiences.',
                        rules: [
                            { rule: 'Traditional attire requested', allowed: true },
                            { rule: 'Materials provided by priest', allowed: true },
                        ]
                    };
                    setServiceData(mappedData);
                    if (isId && mappedData.slug && mappedData.slug !== slugOrId) {
                        router.replace(`/religious-services/${mappedData.slug}`);
                    }
                    if (mappedData.packages.length > 0) {
                        setSelectedPackages([mappedData.packages[0]]);
                    }
                } else {
                    router.replace(`/religious-services/${slugOrId}`);
                }
            } catch (error) {
                console.error("Error fetching service data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServiceData();
    }, [slugOrId, router]);

    useEffect(() => {
        const run = async () => {
            if (!slugOrId) return;
            try {
                const payload = isObjectId(slugOrId) ? { providerId: slugOrId } : { providerSlug: slugOrId };
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/dhubApi/app/professional-services-flow/public/provider-subcategories`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data?.success) setSubcategories(Array.isArray(data.subcategories || data.data) ? (data.subcategories || data.data) : []);
            } catch (e) { console.error('Error fetching provider subcategories:', e); }
        };
        run();
    }, [slugOrId]);

    useEffect(() => {
        const fetchGlobalSettings = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/get_global_settings`);
                const data = await response.json();
                if (data.success && data.policy) {
                    setGlobalSettings(data.policy);
                }
            } catch (error) {
                console.error('Error fetching global settings:', error);
            }
        };
        fetchGlobalSettings();
    }, []);

    const handleContinueToBook = async () => {
        if (!selectedPackages || selectedPackages.length === 0) {
            alert("Please select at least one service package from the Portfolio tab.");
            setActiveTab('portfolio');
            window.scrollTo({ top: 500, behavior: 'smooth' });
            return;
        }
        setIsCheckingAddons(true);
        try {
            const currentId = serviceData.id;
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/professional-service-addons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceIds: selectedPackages.map(p => p._id),
                    professionalProviderId: currentId
                })
            });
            const data = await response.json();
            if (data.success && data.data && data.data.length > 0) {
                const allAddons = data.data.flatMap(item => item.addons || []);
                if (allAddons.length > 0) {
                    setShowAddonsModal(true);
                    return;
                }
            }
            handleAddonsContinue([]);
        } catch (error) {
            console.error("Error checking add-ons:", error);
            handleAddonsContinue([]);
        } finally {
            setIsCheckingAddons(false);
        }
    };

    const handleAddonsContinue = (selectedAddons) => {
        setShowAddonsModal(false);
        const addonIds = selectedAddons.map(a => a._id).join(',');
        const packageIds = selectedPackages.map(p => p._id).join(',');
        router.push(`/religious-services/booking/address?providerId=${serviceData.id}&packageId=${packageIds}&addons=${addonIds}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--off-white)]">
                <Loader2 className="w-12 h-12 text-[var(--saffron)] animate-spin" />
            </div>
        );
    }

    if (!serviceData) {
        return <div className="min-h-screen bg-[var(--off-white)]" />;
    }

    const filteredPackages = (serviceData.packages || []).filter((pkg) => {
        if (selectedSubcategoryId === 'all') return true;
        const x = pkg.subcategoryId || pkg.subCategoryId || pkg.serviceSubCategoryId || pkg.subcategory?._id;
        if (Array.isArray(x)) return x.includes(selectedSubcategoryId);
        if (x && typeof x === 'object') return x._id === selectedSubcategoryId || x.id === selectedSubcategoryId;
        return x === selectedSubcategoryId;
    });

    // Build multi-section groups for rate cards
    const groupedPackages = (() => {
        const allPkgs = serviceData.packages || [];
        if (selectedSubcategoryId !== 'all') {
            return [{ id: selectedSubcategoryId, name: null, packages: filteredPackages }];
        }
        if (subcategories.length === 0) {
            return [{ id: null, name: null, packages: allPkgs }];
        }
        const sections = [];
        const usedIds = new Set();
        for (const subcat of subcategories) {
            const id = subcat.subcategoryId || subcat._id || subcat.id;
            const name = subcat.subcategoryName || subcat.name || '';
            const pkgs = allPkgs.filter(pkg => {
                const x = pkg.subcategoryId || pkg.subCategoryId || pkg.serviceSubCategoryId || pkg.subcategory?._id;
                if (Array.isArray(x)) return x.includes(id);
                if (x && typeof x === 'object') return x._id === id || x.id === id;
                return x === id;
            });
            pkgs.forEach(p => usedIds.add(p._id));
            if (pkgs.length > 0) sections.push({ id, name, packages: pkgs });
        }
        const uncategorized = allPkgs.filter(p => !usedIds.has(p._id));
        if (uncategorized.length > 0) sections.push({ id: 'other', name: 'Other Services', packages: uncategorized });
        return sections.length > 0 ? sections : [{ id: null, name: null, packages: allPkgs }];
    })();

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": serviceData.name,
        "description": serviceData.about,
        "provider": {
            "@type": "LocalBusiness",
            "name": serviceData.name,
            "image": serviceData.logo || serviceData.mainImage,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": serviceData.location,
                "addressCountry": "IN"
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": serviceData.rating,
            "reviewCount": serviceData.orders || 10
        },
        "offers": serviceData.packages.map(pkg => ({
            "@type": "Offer",
            "name": pkg.name,
            "price": pkg.price,
            "priceCurrency": "INR",
            "description": pkg.description
        }))
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-[var(--off-white)] pb-36 pt-16 sm:pt-20 md:pt-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />

            <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                        const targetSubcat = subcategoryId || context.subcategoryId;
                        if (targetSubcat) {
                            router.push(`/religious-services/${targetSubcat}`);
                        } else {
                            router.back();
                        }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-3 sm:mb-4 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[var(--saffron)] transition-all text-xs sm:text-sm font-bold shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </motion.button>

                {/* ── Hero 3-Card Section ────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-stretch mb-4 sm:mb-6"
                >
                    {/* CARD 1: Properly Fitted Sacred Banner/Logo Image */}
                    <div className="md:col-span-4 lg:col-span-4 rounded-2xl overflow-hidden border border-amber-200/70 shadow-md bg-stone-950 relative flex items-center justify-center min-h-[220px] sm:min-h-[240px] group">
                        {/* Ambient blurred backdrop so any aspect ratio fills naturally without harsh borders */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <Image
                                src={serviceData.mainImage || serviceData.logo}
                                alt={serviceData.name}
                                fill
                                className="object-cover blur-lg opacity-40 scale-110"
                                aria-hidden="true"
                            />
                            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
                        </div>

                        {/* Unclipped, 100% visible sharp image */}
                        <div className="relative w-full h-full min-h-[220px] sm:min-h-[240px] flex items-center justify-center p-3">
                            <Image
                                src={serviceData.mainImage || serviceData.logo}
                                alt={serviceData.name}
                                fill
                                priority
                                className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 420px"
                            />
                        </div>

                        {/* Spiritual Badge */}
                        <div className="absolute top-3 left-3 z-10 pointer-events-none">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/40 text-[10px] font-bold text-amber-300 tracking-wide shadow-sm">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                Vedic Services
                            </span>
                        </div>
                    </div>

                    {/* CARD 2: Store Info with Perfect Alignment & Typography */}
                    <div className="md:col-span-5 lg:col-span-5 bg-white border border-amber-200/70 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between min-h-[220px] sm:min-h-[240px]">
                        <div>
                            {/* Badges */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-[var(--saffron)] border border-amber-200 text-[11px] font-extrabold uppercase tracking-wider">
                                    <Flower2 className="w-3 h-3" />
                                    Pooja & Vedic Rituals
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                    Verified Priest
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-lg sm:text-xl font-extrabold text-[var(--deep-charcoal)] leading-tight tracking-tight">
                                {serviceData.name}
                            </h1>

                            {/* Location */}
                            <div className="flex items-start gap-1.5 mt-2 text-xs sm:text-[13px] text-gray-600">
                                <MapPin className="w-3.5 h-3.5 text-[var(--saffron)] shrink-0 mt-0.5" />
                                <span className="line-clamp-2 leading-relaxed">{serviceData.location}</span>
                            </div>
                        </div>

                        {/* Pricing & Ratings */}
                        <div>
                            <div className="pt-2.5 mt-2.5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white font-extrabold text-xs shadow-xs">
                                        <Star className="w-3 h-3 fill-white" />
                                        <span>{serviceData.rating}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {serviceData.orders > 0 ? `${serviceData.orders}+ Ceremonies` : 'Highly Rated'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block leading-none">Starting At</span>
                                    <span className="text-sm sm:text-base font-black text-emerald-700 leading-tight">
                                        ₹{serviceData.basePrice}
                                    </span>
                                </div>
                            </div>

                            {/* App Download Pills */}
                            <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider shrink-0 mr-1">Book on App:</span>
                                <a
                                    href={globalSettings?.customerAndroidAppLink || "https://play.google.com/store/apps/details?id=com.doorstephub.customer"}
                                    target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all shadow-xs"
                                    title="Get it on Google Play"
                                >
                                    <Image src="/andriod1.png" alt="Google Play" className="h-4 w-auto object-contain" width={70} height={20} />
                                </a>
                                <a
                                    href={globalSettings?.customerIosAppLink || "https://apps.apple.com/in/app/doorstep-hub/id6475340236"}
                                    target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all shadow-xs"
                                    title="Download on the App Store"
                                >
                                    <Image src="/apple2.png" alt="App Store" className="h-4 w-auto object-contain" width={70} height={20} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: Puja Booking Hours — Equal Height & Cohesive Design */}
                    <div className="md:col-span-3 lg:col-span-3 bg-white border border-amber-200/70 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between min-h-[220px] sm:min-h-[240px]">
                        <div>
                            {/* Header */}
                            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                        <Clock className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">Puja Booking Hours</h3>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 shrink-0">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                    </span>
                                    Open Now
                                </span>
                            </div>

                            {/* Hours Details */}
                            <div className="space-y-2 mt-2.5">
                                <div className="bg-amber-50/40 rounded-xl p-2 border border-amber-100">
                                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Monday - Saturday</span>
                                    <span className="text-gray-900 font-extrabold text-xs sm:text-[13px] block">06:00 AM - 09:00 PM</span>
                                </div>
                                <div className="bg-amber-50/40 rounded-xl p-2 border border-amber-100">
                                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Sunday</span>
                                    <span className="text-gray-900 font-extrabold text-xs sm:text-[13px] block">06:00 AM - 10:00 PM</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Tag */}
                        <div className="mt-2.5 pt-2 border-t border-gray-100 text-center">
                            <span className="text-[11px] text-amber-800 font-semibold inline-flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[var(--saffron)]" />
                                Doorstep Vedic Specialist
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* ── Tabs ─────────────────────────────────────────────────────────── */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <div className="sticky top-16 sm:top-20 z-40 bg-[var(--off-white)]/90 backdrop-blur-xl rounded-2xl shadow-md border border-gray-200 p-1.5 sm:p-2">
                        <TabsList className="bg-transparent w-full flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                            <TabsTrigger
                                value="portfolio"
                                className="py-2 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--saffron)] data-[state=active]:to-[var(--temple-red)] data-[state=active]:text-white rounded-xl flex items-center justify-center shadow-sm"
                            >
                                <Flower2 className="w-4 h-4 mr-1.5 shrink-0" />
                                Spiritual Rate Cards
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="py-2 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--saffron)] data-[state=active]:to-[var(--temple-red)] data-[state=active]:text-white rounded-xl flex items-center justify-center shadow-sm"
                            >
                                <MessageSquare className="w-4 h-4 mr-1.5 shrink-0" />
                                Ratings
                            </TabsTrigger>
                            <TabsTrigger
                                value="about"
                                className="py-2 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--saffron)] data-[state=active]:to-[var(--temple-red)] data-[state=active]:text-white rounded-xl flex items-center justify-center shadow-sm"
                            >
                                <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                                About Provider
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* ── Rate Cards Tab ─────────────────────────────────────────── */}
                    <TabsContent value="portfolio" className="space-y-3 outline-none">
                        {/* Subcategory Filter Pills */}
                        {subcategories.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                <button
                                    onClick={() => setSelectedSubcategoryId('all')}
                                    className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap border transition-all ${selectedSubcategoryId === 'all'
                                        ? 'bg-[var(--saffron)] text-white border-[var(--saffron)]'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-[var(--saffron)]/50'
                                        }`}
                                >
                                    All
                                </button>
                                {subcategories.map((s, i) => {
                                    const id = s.subcategoryId || s._id || s.id;
                                    const name = s.subcategoryName || s.name || `Subcategory ${i + 1}`;
                                    return (
                                        <button
                                            key={id || i}
                                            onClick={() => setSelectedSubcategoryId(id)}
                                            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap border transition-all ${selectedSubcategoryId === id
                                                ? 'bg-[var(--saffron)] text-white border-[var(--saffron)]'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-[var(--saffron)]/50'
                                                }`}
                                        >
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Sparkles className="w-4 h-4 text-[var(--saffron)] shrink-0" />
                            <span>Please select a sacred offering to proceed:</span>
                        </div>

                        {serviceData.packages.length > 0 ? (
                            <div className="space-y-6">
                                {groupedPackages.map((section, sIdx) => (
                                    <div key={section.id || sIdx}>
                                        {/* Section header when in "All" view */}
                                        {section.name && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <Flower2 className="w-4 h-4 text-[var(--saffron)] shrink-0" />
                                                <h4 className="text-sm sm:text-base font-bold text-[var(--deep-charcoal)] whitespace-nowrap">{section.name}</h4>
                                                <div className="flex-1 h-px bg-gradient-to-r from-[var(--saffron)]/40 to-transparent" />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                                            {section.packages.map((pkg, index) => {
                                                const isSelected = selectedPackages.some(p => p._id === pkg._id);
                                                return (
                                                    <div
                                                        key={pkg._id || index}
                                                        onClick={() => togglePackage(pkg)}
                                                        className={`bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer relative flex flex-row ${isSelected
                                                            ? 'border-2 border-[var(--saffron)] ring-2 ring-[var(--saffron)]/10 shadow-md'
                                                            : 'border-gray-100 hover:border-[var(--saffron)]/30'
                                                            }`}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2 z-10 bg-[var(--saffron)] text-white p-1 rounded-full shadow-lg">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                        {/* Thumbnail */}
                                                        <div className="w-28 sm:w-36 shrink-0 bg-gray-100 relative self-stretch min-h-[110px]">
                                                            {pkg.image ? (
                                                                <Image
                                                                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${pkg.image}`}
                                                                    alt={pkg.name}
                                                                    className="absolute inset-0 w-full h-full object-cover"
                                                                 width={500} height={300} />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-gray-300">
                                                                    <Flower2 className="w-8 h-8 opacity-30" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Content */}
                                                        <div className="p-3 sm:p-4 flex-1 min-w-0 flex flex-col justify-between">
                                                            <div>
                                                                <div className="flex justify-between items-start gap-2 mb-1.5">
                                                                    <h3 className="text-sm sm:text-base font-bold text-[var(--deep-charcoal)] leading-tight">{pkg.name}</h3>
                                                                    <div className="flex flex-col items-end shrink-0">
                                                                        <span className="text-[9px] text-gray-400 italic uppercase tracking-wider">Starts</span>
                                                                        <span className="text-[var(--saffron)] font-bold text-base sm:text-lg leading-tight">₹{pkg.price}</span>
                                                                    </div>
                                                                </div>
                                                                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{pkg.description}</p>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-50">
                                                                {pkg.banner_images && pkg.banner_images.length > 0 ? (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setViewingRateCard(pkg);
                                                                            setRateCardImageIndex(0);
                                                                        }}
                                                                        className="text-[10px] sm:text-xs font-bold text-[var(--saffron)] bg-[var(--saffron)]/10 px-2.5 py-1 rounded-lg border border-[var(--saffron)]/20 hover:bg-[var(--saffron)]/20 transition-all flex items-center gap-1"
                                                                    >
                                                                        View Details <ChevronRight className="w-3 h-3" />
                                                                    </button>
                                                                ) : <span />}
                                                                {isSelected && (
                                                                    <span className="text-[var(--saffron)] text-[10px] sm:text-xs font-bold flex items-center gap-1">
                                                                        <CheckCircle className="w-3 h-3" /> Selected
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">No services available.</div>
                        )}
                    </TabsContent>

                    {/* ── Reviews Tab ───────────────────────────────────────────── */}
                    <TabsContent value="reviews" className="space-y-4 outline-none">
                        <h3 className="text-xl font-bold text-[var(--deep-charcoal)]">Like our Devotees say&apos;s</h3>
                        {serviceData.reviews.length > 0 ? (
                            serviceData.reviews.map((review, i) => (
                                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-[var(--saffron)] text-white flex items-center justify-center text-lg shrink-0">
                                            {review.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--deep-charcoal)]">{review.name}</h4>
                                            <div className="flex text-[var(--saffron)] text-sm mb-2">
                                                {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />)}
                                            </div>
                                            <p className="text-gray-600 text-sm">{review.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : <div className="text-center py-10 text-gray-400">No reviews yet.</div>}
                    </TabsContent>

                    {/* ── About Tab ─────────────────────────────────────────────── */}
                    <TabsContent value="about" className="outline-none">
                        <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-[var(--deep-charcoal)] mb-2">About Service</h3>
                                <div
                                    className="text-gray-600 leading-relaxed whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={renderSanitizedHtml(serviceData.about)}
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[var(--deep-charcoal)] mb-2">Prerequisites</h3>
                                <ul className="space-y-2">
                                    {serviceData.rules.map((rule, i) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-[var(--saffron)]" />
                                            {rule.rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* ── Fixed Bottom CTA ──────────────────────────────────────────────────── */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50"
            >
                <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
                    <div>
                        <div className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
                            {selectedPackages.length > 0
                                ? `${selectedPackages.length} ${selectedPackages.length === 1 ? 'service' : 'services'} selected`
                                : 'Total Quote'}
                        </div>
                        <div className="flex items-baseline space-x-1 sm:space-x-2">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--deep-charcoal)]">
                                ₹{totalPrice > 0 ? totalPrice.toLocaleString('en-IN') : serviceData.basePrice.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleContinueToBook}
                        disabled={isCheckingAddons || selectedPackages.length === 0}
                        className="px-6 sm:px-12 py-2.5 sm:py-3.5 bg-gradient-to-r from-[var(--saffron)] to-[var(--temple-red)] text-white rounded-full font-bold text-sm sm:text-lg hover:shadow-xl flex items-center gap-2 hover:shadow-[var(--saffron)]/40 transition-all transform active:scale-95 disabled:opacity-75 disabled:scale-100 disabled:cursor-not-allowed shadow-md"
                    >
                        {isCheckingAddons ? (
                            <>
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <span>Book Now {selectedPackages.length > 1 ? `(${selectedPackages.length})` : ''}</span>
                        )}
                    </button>
                </div>
            </motion.div>

            <AddonsModal
                isOpen={showAddonsModal}
                onClose={() => setShowAddonsModal(false)}
                providerId={serviceData.id}
                selectedPackageIds={selectedPackages.map(p => p._id)}
                onContinue={handleAddonsContinue}
            />

            {/* ── Rate Card Image Modal ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {viewingRateCard && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingRateCard(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-white z-10">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{viewingRateCard.name}</h3>
                                    {viewingRateCard.banner_images?.length > 1 && (
                                        <p className="text-xs text-gray-500 mt-0.5">Image {rateCardImageIndex + 1} of {viewingRateCard.banner_images.length}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {viewingRateCard.banner_images?.length > 1 && (
                                        <div className="flex items-center bg-gray-100 rounded-full p-1 mr-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setRateCardImageIndex(prev => (prev - 1 + viewingRateCard.banner_images.length) % viewingRateCard.banner_images.length); }}
                                                className="p-1.5 rounded-full hover:bg-white transition-colors"
                                            >
                                                <ChevronLeft className="w-5 h-5 text-gray-700" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setRateCardImageIndex(prev => (prev + 1) % viewingRateCard.banner_images.length); }}
                                                className="p-1.5 rounded-full hover:bg-white transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5 text-gray-700" />
                                            </button>
                                        </div>
                                    )}
                                    <button onClick={() => setViewingRateCard(null)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                        <X className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                            {/* Image */}
                            <div className="flex-1 overflow-hidden bg-gray-50 flex items-center justify-center p-4 min-h-[260px]">
                                <motion.img
                                    key={rateCardImageIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${viewingRateCard.banner_images[rateCardImageIndex]}`}
                                    alt={viewingRateCard.name}
                                    className="max-w-full max-h-[65vh] object-contain shadow-lg rounded-xl"
                                />
                            </div>
                            {/* Thumbnails */}
                            {viewingRateCard.banner_images?.length > 1 && (
                                <div className="p-3 sm:p-4 bg-white border-t overflow-x-auto flex gap-2 justify-center">
                                    {viewingRateCard.banner_images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setRateCardImageIndex(idx)}
                                            className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${rateCardImageIndex === idx ? 'ring-2 ring-[var(--saffron)] scale-105 shadow-md' : 'opacity-60 hover:opacity-100'}`}
                                        >
                                            <Image src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img}`} className="w-full h-full object-cover" alt=""  width={500} height={300} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
