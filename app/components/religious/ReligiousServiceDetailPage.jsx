'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, Star, TrendingUp, DollarSign, Wifi, Utensils, Shirt, Zap,
    Car, Shield, Camera, MessageSquare, Sparkles, MapPin, Clock, Check, X,
    Calendar, Flower2, Loader2, CheckCircle, ChevronRight, ChevronLeft
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/pghostels/ui/tabs'; // Reuse UI components if available, otherwise generic
import Slider from 'react-slick';
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
    const params = useParams();
    const router = useRouter();
    const slugOrId = slugOverride || params.slug || params.id;
    const searchParams = useSearchParams();

    // Context handling
    const [context, setContext] = useState({
        subcategoryId: searchParams.get('subcategoryId'),
        subCategoryName: searchParams.get('subCategoryName'),
        categoryName: searchParams.get('categoryName'),
        categoryId: searchParams.get('categoryId')
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('religious_service_context');
            if (stored) {
                const parsed = JSON.parse(stored);
                setContext(prev => ({
                    ...prev,
                    subcategoryId: parsed.subcategoryId || prev.subcategoryId,
                    subCategoryName: parsed.subCategoryName || prev.subCategoryName,
                    categoryName: parsed.categoryName || prev.categoryName,
                    categoryId: parsed.categoryId || prev.categoryId
                }));
            }
        }
    }, []);

    const { subcategoryId, subCategoryName, categoryName, categoryId } = context;

    const [activeTab, setActiveTab] = useState('portfolio');
    const { scrollY } = useScroll();
    const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

    const [serviceData, setServiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('all');
    const [showAddonsModal, setShowAddonsModal] = useState(false);
    const [isCheckingAddons, setIsCheckingAddons] = useState(false);
    const [globalSettings, setGlobalSettings] = useState(null);
    const [viewingRateCard, setViewingRateCard] = useState(null);
    const [rateCardImageIndex, setRateCardImageIndex] = useState(0);
    const renderSanitizedHtml = (htmlContent) => ({
        __html: DOMPurify.sanitize(htmlContent || '', {
            USE_PROFILES: { html: true },
        }),
    });

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
    };

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

                    // Map API Data to UI Model (Religious Context)
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
                        // Main profile image
                        mainImage: getFullUrl(store.image, 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&q=80'),
                        address: store.address || 'Address provided upon booking',
                        rating: parseFloat(store.avgRating || 4.8).toFixed(1),
                        orders: store.totalOrders || 120,
                        basePrice: store.startingAt || 1100,
                        monthlyPrice: store.startingAt || 1100,
                        // Logo with religious fallback
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

                    // If user entered an ObjectId but a slug exists, normalize URL to slug
                    if (isId && mappedData.slug && mappedData.slug !== slugOrId) {
                        router.replace(`/religious-services/${mappedData.slug}`);
                    }
                    if (mappedData.packages.length > 0) {
                        setSelectedPackage(mappedData.packages[0]);
                    }
                } else {
                    // If no provider found, redirect to category page for this slug
                    router.replace(`/religious-services/${slugOrId}`);
                }
            } catch (error) {
                console.error("Error fetching service data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServiceData();
    }, [slugOrId]);
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
        if (!selectedPackage) {
            alert("Please select a service package from the Portfolio tab.");
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
                    serviceIds: [selectedPackage._id],
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
            // If no addons or API fails to return addons, proceed without them
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
        router.push(`/religious-services/booking/address?providerId=${serviceData.id}&packageId=${selectedPackage._id}&addons=${addonIds}`);
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
        <div className="min-h-screen overflow-x-hidden bg-[var(--off-white)] pb-36 pt-20 md:pt-28">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />
            <div className="max-w-[1400px] mx-auto px-4 lg:px-6 relative z-10">
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
                    className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[var(--saffron)] transition-all text-xs sm:text-sm font-bold shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </motion.button>

                {/* Hero 3 Cards Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid min-w-0 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)_250px] gap-4 sm:gap-5 items-stretch mb-6 sm:mb-8">
                    {/* CARD 1: BANNER IMAGE */}
                    <div className="relative w-full h-28 sm:h-44 md:col-span-2 lg:col-span-1 lg:h-[230px] rounded-2xl overflow-hidden border border-[var(--saffron)]/30 shadow-lg bg-white flex items-center justify-center">
                        <img src={serviceData.mainImage || serviceData.logo} alt={serviceData.name} loading="eager" decoding="sync" fetchpriority="high" className="w-full h-full object-cover" />
                    </div>

                    {/* CARD 2: STORE INFO */}
                    <div className="relative w-full min-w-0 h-auto md:h-[230px] overflow-hidden bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col justify-between">
                        <div>
                            <h1 className="break-words text-lg sm:text-xl font-extrabold text-[var(--deep-charcoal)] leading-tight">{serviceData.name}</h1>
                            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-600">
                                <MapPin className="w-3.5 h-3.5 text-[var(--saffron)] shrink-0" />
                                <span className="line-clamp-2">{serviceData.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-2">
                                <Star className="w-3.5 h-3.5 fill-[var(--saffron)] text-[var(--saffron)] shrink-0" />
                                <span className="font-bold text-xs sm:text-sm text-gray-900">{serviceData.rating}</span>
                                <span className="text-[11px] text-gray-500 ml-1">Starts from ₹{serviceData.basePrice}</span>
                            </div>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-2.5 mt-3">
                                <a href={globalSettings?.customerAndroidAppLink || "https://play.google.com/store/apps/details?id=com.doorstephub.customer"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-24 sm:w-28 md:w-32 h-9 sm:h-10 rounded-full bg-[#DEF2EF] hover:bg-[#cbece6] transition-all border border-[#9ecbc3]/50 shadow-sm overflow-hidden p-0.5" title="Get it on Google Play">
                                    <img src="/andriod1.png" alt="Google Play" loading="lazy" decoding="async" className="h-full w-auto object-contain" />
                                </a>
                                <a href={globalSettings?.customerIosAppLink || "https://apps.apple.com/in/app/doorstep-hub/id6475340236"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-24 sm:w-28 md:w-32 h-9 sm:h-10 rounded-full bg-[#DEF2EF] hover:bg-[#cbece6] transition-all border border-[#9ecbc3]/50 shadow-sm overflow-hidden p-0.5" title="Download on the App Store">
                                    <img src="/apple2.png" alt="App Store" loading="lazy" decoding="async" className="h-full w-auto object-contain" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: PUJA BOOKING HOURS */}
                  <div className="relative w-full min-w-0 h-auto md:h-[230px] overflow-hidden bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col justify-between">
    <div>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-gray-100">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--saffron)]/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[var(--saffron)]" />
            </div>

            <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight truncate">
                    Puja Booking Hours
                </h3>

                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>

                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                        Open Now
                    </span>
                </div>
            </div>
        </div>

        {/* Booking Hours */}
        <div className="flex items-center w-full lg:flex-col lg:items-stretch">
            {/* Monday - Saturday */}
            <div className="flex-1 pr-4 lg:pr-0 lg:pb-3">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                    Monday - Saturday
                </span>

                <span className="text-gray-800 font-extrabold text-xs sm:text-sm block whitespace-nowrap">
                    06:00 AM - 09:00 PM
                </span>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200 shrink-0 lg:h-px lg:w-full"></div>

            {/* Sunday */}
            <div className="flex-1 pl-4 lg:pl-0 lg:pt-3">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                    Sunday
                </span>

                <span className="text-gray-800 font-extrabold text-xs sm:text-sm block whitespace-nowrap">
                    06:00 AM - 10:00 PM
                </span>
            </div>
        </div>
    </div>
</div>
                </motion.div>
            </div>

            {/* Tabs Navigation */}
            <div className="max-w-[1400px] mx-auto px-4 lg:px-6 mt-6 sm:mt-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                                Shortly Aboutus
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="portfolio" className="space-y-4">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            <button onClick={() => setSelectedSubcategoryId('all')} className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap border ${selectedSubcategoryId === 'all' ? 'bg-[var(--saffron)] text-white border-[var(--saffron)]' : 'bg-white text-gray-700 border-gray-200'}`}>All</button>
                            {subcategories.map((s, i) => {
                                const id = s.subcategoryId || s._id || s.id;
                                const name = s.subcategoryName || s.name || `Subcategory ${i + 1}`;
                                return <button key={id || i} onClick={() => setSelectedSubcategoryId(id)} className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap border ${selectedSubcategoryId === id ? 'bg-[var(--saffron)] text-white border-[var(--saffron)]' : 'bg-white text-gray-700 border-gray-200'}`}>{name}</button>;
                            })}
                        </div>
                        <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[var(--saffron)]" />
                            Please select a sacred offering to proceed:
                        </div>
                        {serviceData.packages.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                {filteredPackages.map((pkg, index) => (
                                    <div
                                        key={pkg._id || index}
                                        onClick={() => setSelectedPackage(pkg)}
                                        className={`bg-white rounded-xl sm:rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer relative flex flex-row h-full ${selectedPackage?._id === pkg._id
                                            ? 'border-2 border-[var(--saffron)] ring-2 ring-[var(--saffron)]/10'
                                            : 'border-gray-100'
                                            }`}
                                    >
                                        {selectedPackage?._id === pkg._id && (
                                            <div className="absolute top-2 right-2 z-10 bg-[var(--saffron)] text-white p-1 rounded-full shadow-lg">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                        <div className="w-36 sm:w-48 h-36 sm:h-auto bg-gray-100 relative flex-shrink-0">
                                            {pkg.image ? (
                                                <img src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${pkg.image}`} alt={pkg.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                                                    <Flower2 className="w-12 h-12 opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 sm:p-6 flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-lg sm:text-xl font-bold text-[var(--deep-charcoal)] leading-tight">{pkg.name}</h3>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-gray-500 italic uppercase tracking-wider">Starts From</span>
                                                        <span className="text-[var(--saffron)] font-bold text-xl">₹{pkg.price}</span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 md:line-clamp-none">
                                                    {pkg.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto pt-1">
                                                <div className="flex items-center gap-4">
                                                    {pkg.banner_images && pkg.banner_images.length > 0 && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setViewingRateCard(pkg);
                                                                setRateCardImageIndex(0);
                                                            }}
                                                            className="text-[11px] sm:text-xs font-bold text-[var(--saffron)] bg-[var(--saffron)]/10 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[var(--saffron)]/20 hover:bg-[var(--saffron)]/20 transition-all flex items-center gap-1"
                                                        >
                                                            View Details
                                                            <ChevronRight className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                {selectedPackage?._id === pkg._id && (
                                                    <span className="text-[var(--saffron)] text-xs font-bold flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Selected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">No services available.</div>
                        )}
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-4">
                        <h3 className="text-xl font-bold text-[var(--deep-charcoal)]">Like our Devotees say&apos;s</h3>
                        {serviceData.reviews.length > 0 ? (
                            serviceData.reviews.map((review, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-[var(--saffron)] text-white flex items-center justify-center text-xl">
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

                    <TabsContent value="about">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
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

            {/* Bottom CTA */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50"
            >
                <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
                    <div>
                        <div className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">Total Quote</div>
                        <div className="flex items-baseline space-x-1 sm:space-x-2">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--deep-charcoal)]">
                                {selectedPackage
                                    ? `₹${selectedPackage.price.toLocaleString('en-IN')}`
                                    : `₹${serviceData.basePrice.toLocaleString('en-IN')}`}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleContinueToBook}
                        disabled={isCheckingAddons}
                        className="px-6 sm:px-12 py-2.5 sm:py-3.5 bg-gradient-to-r from-[var(--saffron)] to-[var(--temple-red)] text-white rounded-full font-bold text-sm sm:text-lg hover:shadow-xl flex items-center gap-2 hover:shadow-[var(--saffron)]/40 transition-all transform active:scale-95 disabled:opacity-75 disabled:scale-100 disabled:cursor-not-allowed shadow-md"
                    >
                        {isCheckingAddons ? (
                            <>
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <span>Book Now</span>
                        )}
                    </button>
                </div>
            </motion.div>

            <AddonsModal
                isOpen={showAddonsModal}
                onClose={() => setShowAddonsModal(false)}
                providerId={serviceData.id}
                selectedPackageId={selectedPackage?._id}
                onContinue={handleAddonsContinue}
            />

            {/* Rate Card Gallery Modal */}
            <AnimatePresence>
                {viewingRateCard && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
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
                            {/* Navigation Header */}
                            <div className="p-4 border-b flex items-center justify-between bg-white z-10">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">
                                        {viewingRateCard.name}
                                    </h3>
                                    {viewingRateCard.banner_images?.length > 1 && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Image {rateCardImageIndex + 1} of {viewingRateCard.banner_images.length}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {viewingRateCard.banner_images?.length > 1 && (
                                        <div className="flex items-center bg-gray-100 rounded-full p-1 mr-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRateCardImageIndex(prev => (prev - 1 + viewingRateCard.banner_images.length) % viewingRateCard.banner_images.length);
                                                }}
                                                className="p-1.5 rounded-full hover:bg-white transition-colors"
                                            >
                                                <ChevronLeft className="w-5 h-5 text-gray-700" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRateCardImageIndex(prev => (prev + 1) % viewingRateCard.banner_images.length);
                                                }}
                                                className="p-1.5 rounded-full hover:bg-white transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5 text-gray-700" />
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setViewingRateCard(null)}
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Image Container */}
                            <div className="flex-1 overflow-hidden bg-gray-50 flex items-center justify-center p-4 min-h-[300px]">
                                <motion.img
                                    key={rateCardImageIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${viewingRateCard.banner_images[rateCardImageIndex]}`}
                                    alt={viewingRateCard.name}
                                    className="max-w-full max-h-[70vh] object-contain shadow-lg rounded-xl"
                                />
                            </div>

                            {/* Thumbnail bar if multiple images */}
                            {viewingRateCard.banner_images?.length > 1 && (
                                <div className="p-4 bg-white border-t overflow-x-auto flex gap-2 justify-center">
                                    {viewingRateCard.banner_images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setRateCardImageIndex(idx)}
                                            className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${rateCardImageIndex === idx ? 'ring-2 ring-[var(--saffron)] scale-105 shadow-md' : 'opacity-60 hover:opacity-100'}`}
                                        >
                                            <img loading="lazy" decoding="async"
                                                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img}`}
                                                className="w-full h-full object-cover"
                                                alt=""
                                            />
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
