'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft, Star, Sparkles, MapPin, Check,
    Loader2, Flower, Scissors, ShieldCheck, Heart, Clock,
    ChevronRight, ChevronLeft, X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/pghostels/ui/tabs';
import { AddonsModal } from '@/components/spasalon/AddonsModal';
import { useServiceCart } from '@/context/ServiceCartContext';
import { isObjectId } from '@/utils/slugHelper';
import DOMPurify from 'dompurify';

const amenityIcons = {
    Wifi: Sparkles,
    AC: Sparkles,
    Music: Heart,
    "Essential Oils": Flower,
    "Premium Products": ShieldCheck,
    "Towels": Check,
    "Shower": Sparkles,
};

export default function SpaServiceDetailPage({ slugOverride = null }) {
    const params = useParams();
    const router = useRouter();
    const slugOrId = slugOverride || params.slug || params.id;
    

    const [activeTab, setActiveTab] = useState('portfolio');

    const [serviceData, setServiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPackages, setSelectedPackages] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);
    const [showAddonsModal, setShowAddonsModal] = useState(false);
    const [globalSettings, setGlobalSettings] = useState(null);
    const [viewingRateCard, setViewingRateCard] = useState(null);
    const [rateCardImageIndex, setRateCardImageIndex] = useState(0);
    const { cartItems, clearCart } = useServiceCart();

    // ── Data Fetching ────────────────────────────────────────────────────────────

    useEffect(() => {
        const fetchServiceData = async () => {
            if (!slugOrId) return;
            setLoading(true);
            try {
                // Mock Support
                if (slugOrId.startsWith('mock_')) {
                    const mockData = {
                        id: slugOrId,
                        name: 'Luxe Spa Experience',
                        location: 'Home Service',
                        rating: 4.9,
                        basePrice: 999,
                        logo: '',
                        images: [''],
                        amenities: [{ icon: Flower, label: 'Aromatherapy', available: true }],
                        reviews: [],
                        packages: [
                            { _id: 'mock_pkg_1', name: 'Standard Glow', description: 'Clean up and mask', price: 999, priceUnit: 'session', image: '' },
                            { _id: 'mock_pkg_2', name: 'Premium Radiance', description: 'Full facial + massage', price: 1499, priceUnit: 'session', image: '' }
                        ],
                        about: 'Experience the Best Spa Service at Home.',
                        rules: [{ rule: 'Please provide water', allowed: true }]
                    };
                    setServiceData(mockData);
                    setSelectedPackages([mockData.packages[0]]);
                    setLoading(false);
                    return;
                }

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

                    const mappedData = {
                        id: store._id || store.id || store.providerId || slugOrId,
                        slug: store.slug,
                        name: store.business_name || `${store.firstName} ${store.lastName}`,
                        location: store.address || 'Location available on request',
                        rating: parseFloat(store.avgRating || 4.8).toFixed(1),
                        basePrice: store.BasePrice || 500,
                        logo: store.logo ? (store.logo.startsWith('http') ? store.logo : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${store.logo}`) : '',
                        images: (() => {
                            const baseUrl = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/`;
                            const toUrl = (p) => p ? (p.startsWith('http') ? p : `${baseUrl}${p}`) : null;
                            const bannerImg = toUrl(store.image);
                            const logoImg = toUrl(store.logo);
                            const extras = (data.serviceImages || []).map(toUrl).filter(Boolean);
                            const primary = bannerImg || logoImg;
                            const deduped = primary
                                ? [primary, ...extras.filter(u => u !== primary)]
                                : extras;
                            return deduped.length > 0
                                ? deduped
                                : ['https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800'];
                        })(),
                        amenities: [
                            ...(Array.isArray(data.amenities) ? data.amenities : []),
                            ...(data.otherAmenities ? data.otherAmenities.split(',').map(a => a.trim()) : ['Sanitized Tools', 'Disposable Hygiene Kit'])
                        ].map(amenity => {
                            const label = typeof amenity === 'object' ? (amenity.title || 'Amenity') : amenity;
                            return { icon: amenityIcons[label] || Sparkles, label, available: true };
                        }),
                        reviews: data.customerRatings ? data.customerRatings.map(review => ({
                            name: review.name || 'Client',
                            avatar: review.image || '👤',
                            rating: review.rating,
                            date: review.date ? new Date(review.date).toLocaleDateString() : 'Recently',
                            comment: review.comment || 'Great service.'
                        })) : [],
                        packages: data.provider_rate_cards || [],
                        about: data.aboutUs || store.bio || 'Professional spa and salon services at your doorstep.',
                        rules: [
                            { rule: 'Be ready 10 mins prior', allowed: true },
                            { rule: 'Keep pets away', allowed: true },
                        ]
                    };

                    setServiceData(mappedData);
                    if (mappedData.packages.length > 0) {
                        setSelectedPackages([mappedData.packages[0]]);
                    }

                    // Increment store views
                    try {
                        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/increment-store-views`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ professionalStoreSlug: store.slug || slugOrId })
                        });
                    } catch (e) { console.error("Error incrementing views:", e); }
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
        const fetchProviderSubcategories = async () => {
            if (!slugOrId) return;
            setLoadingSubcategories(true);
            try {
                const payload = isObjectId(slugOrId)
                    ? { providerId: slugOrId }
                    : { providerSlug: slugOrId };
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/provider-subcategories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                if (data?.success) {
                    const list = data.subcategories || data.data || [];
                    const normalized = Array.isArray(list) ? list : [];
                    setSubcategories(normalized);
                    // Default: show all (null = all)
                    setSelectedSubcategoryId(null);
                }
            } catch (error) {
                console.error('Error fetching provider subcategories:', error);
            } finally {
                setLoadingSubcategories(false);
            }
        };
        fetchProviderSubcategories();
    }, [slugOrId, serviceData?.id]);

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

    // ── Cart & Booking Handlers ──────────────────────────────────────────────────

    const togglePackage = (pkg) => {
        setSelectedPackages(prev => {
            const isSelected = prev.some(p => p._id === pkg._id);
            if (isSelected) return prev.filter(p => p._id !== pkg._id);
            return [...prev, pkg];
        });
    };

    const totalPrice = selectedPackages.reduce((sum, pkg) => sum + (parseFloat(pkg.price) || 0), 0);

    const filteredPackages = (serviceData?.packages || []).filter((pkg) => {
        if (!selectedSubcategoryId) return true;
        const pkgSubcat = pkg.subcategoryId || pkg.subCategoryId || pkg.serviceSubCategoryId || pkg.subcategory?._id;
        if (Array.isArray(pkgSubcat)) return pkgSubcat.includes(selectedSubcategoryId);
        if (pkgSubcat && typeof pkgSubcat === 'object') return pkgSubcat._id === selectedSubcategoryId || pkgSubcat.id === selectedSubcategoryId;
        return pkgSubcat === selectedSubcategoryId;
    });

    // Build multi-section groups for rate cards
    const groupedPackages = (() => {
        const allPkgs = serviceData?.packages || [];
        if (selectedSubcategoryId !== null) {
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

    const handleContinueToBook = async () => {
        if (selectedPackages.length === 0) {
            alert('Please select at least one service.');
            setActiveTab('portfolio');
            return;
        }
        const existingProviderId = cartItems.length > 0 ? cartItems[0].providerId : null;
        if (existingProviderId && existingProviderId !== (serviceData.id || slugOrId)) {
            const confirmed = window.confirm(
                `Your cart already has services from a different professional.\n\nDo you want to clear your existing cart and book with this professional instead?`
            );
            if (!confirmed) return;
            await clearCart(true);
        }
        setShowAddonsModal(true);
    };

    const handleAddonsContinue = (selectedAddons) => {
        setShowAddonsModal(false);
        const addonIds = selectedAddons.map(a => a._id).join(',');
        const packageIds = selectedPackages.map(p => p._id).join(',');
        const providerTarget = serviceData.id || slugOrId;
        router.push(`/spa-salon/booking/address?providerId=${providerTarget}&packageId=${packageIds}&addons=${addonIds}`);
    };

    // ── Loading State ────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent pb-32 pt-16 sm:pt-20 md:pt-28">
                <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.7fr_1.4fr_250px] gap-3 sm:gap-4 items-start">
                        <div className="h-48 sm:h-56 sm:col-span-2 lg:col-span-1 rounded-2xl bg-gray-200 animate-pulse border border-[#6D1357]/20 shadow-xl" />
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                            <div className="h-7 bg-gray-200 rounded w-3/4 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                            <div className="flex items-center gap-3 mt-4">
                                <div className="w-24 h-9 rounded-full bg-gray-200 animate-pulse" />
                                <div className="w-24 h-9 rounded-full bg-gray-200 animate-pulse" />
                            </div>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                            <div className="h-9 bg-gray-200 rounded animate-pulse" />
                            <div className="h-12 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!serviceData) {
        return <div className="min-h-screen bg-transparent" />;
    }

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": serviceData.name,
        "description": serviceData.about,
        "provider": {
            "@type": "LocalBusiness",
            "name": serviceData.name,
            "image": serviceData.logo || (serviceData.images.length > 0 ? serviceData.images[0] : ""),
            "address": {
                "@type": "PostalAddress",
                "streetAddress": serviceData.location,
                "addressCountry": "IN"
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": serviceData.rating,
            "reviewCount": serviceData.reviews.length || 10
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
        <div className="min-h-screen bg-transparent pb-32 pt-16 sm:pt-20 md:pt-28">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />

            {/* ── Hero Section ─────────────────────────────────────────────────────── */}
            <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
                {/* Back Button — inline, not absolute */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-3 sm:mb-4 rounded-full bg-white/95 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:text-[#6D1357] transition-all text-xs sm:text-sm font-bold shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </motion.button>

                {/* 3-card hero grid:
                    Mobile: single column stack
                    Tablet (sm): 2-col, image spans both cols
                    Desktop (lg): 3-col side by side                     */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.7fr_1.4fr_250px] gap-3 sm:gap-4 items-start"
                >
                    {/* CARD 1 — Banner Image */}
                    <div className="h-48 sm:h-56 lg:h-[220px] sm:col-span-2 lg:col-span-1 rounded-2xl overflow-hidden border border-[#6D1357]/20 shadow-xl">
                        <Image
                            src={serviceData?.images?.[0] || ''}
                            alt={serviceData.name}
                            className="w-full h-full object-cover"
                            fetchPriority="high"
                         width={500} height={300} />
                    </div>

                    {/* CARD 2 — Store Info */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-5 shadow-xl">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{serviceData.name}</h1>
                        <div className="flex items-start gap-1.5 mt-2 text-xs sm:text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-[#6D1357] shrink-0 mt-0.5" />
                            <span>{serviceData.location}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                            <Star className="w-4 h-4 fill-[#6D1357] text-[#6D1357]" />
                            <span className="font-bold text-sm sm:text-base">{serviceData.rating}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                            <a
                                href={globalSettings?.customerAndroidAppLink || "https://play.google.com/store/apps/details?id=com.doorstephub.customer"}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-center w-24 sm:w-[140px] h-9 sm:h-[52px] rounded-3xl bg-[#DEF2EF] border border-[#9ecbc3]/40 overflow-hidden p-0.5"
                            >
                                <Image src="/andriod1.png" alt="Google Play" className="h-full w-auto object-contain"  width={500} height={300} />
                            </a>
                            <a
                                href={globalSettings?.customerIosAppLink || "https://apps.apple.com/in/app/doorstep-hub/id6475340236"}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-center w-24 sm:w-[140px] h-9 sm:h-[52px] rounded-3xl bg-[#DEF2EF] border border-[#9ecbc3]/40 overflow-hidden p-0.5"
                            >
                                <Image src="/apple2.png" alt="App Store" className="h-full w-auto object-contain"  width={500} height={300} />
                            </a>
                        </div>
                    </div>

                    {/* CARD 3 — Salon Hours */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-5 shadow-xl">
                        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-xl bg-[#6D1357]/10 flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4 text-[#6D1357]" />
                            </div>
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-gray-900">Salon Hours</h3>
                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Open Now</span>
                            </div>
                        </div>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div>
                                <span className="text-gray-400 text-[10px] font-bold uppercase block">Monday - Saturday</span>
                                <span className="text-gray-800 font-extrabold">09:00 AM - 08:00 PM</span>
                            </div>
                            <div className="h-px w-full bg-gray-100" />
                            <div>
                                <span className="text-gray-400 text-[10px] font-bold uppercase block">Sunday</span>
                                <span className="text-gray-800 font-extrabold">10:00 AM - 06:00 PM</span>
                            </div>
                        </div>
                        <span className="inline-flex flex-col mt-4 rounded-xl px-3 py-2 text-white bg-gradient-to-r from-[#8A1D6E] to-[#6D1357] w-full text-center">
                            <span className="text-[10px] font-bold tracking-wide">Available For</span>
                            <span className="text-sm font-extrabold">Home/Salon Booking</span>
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
            <div className="max-w-[1400px] mx-auto px-3 sm:px-4 mt-4 sm:mt-6 text-black">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                    {/* Sticky tab bar */}
                    <div className="sticky top-16 sm:top-20 z-40 bg-gray-50/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-1.5 sm:p-2">
                        <TabsList className="bg-transparent w-full flex overflow-x-auto no-scrollbar gap-1 sm:gap-2 items-center">
                            <TabsTrigger
                                value="about"
                                className="text-gray-900 font-semibold px-3 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6D1357] data-[state=active]:to-[#6D1357] data-[state=active]:text-white rounded-xl transition-all text-xs sm:text-sm whitespace-nowrap"
                            >
                                Shortly Aboutus
                            </TabsTrigger>
                            <TabsTrigger
                                value="portfolio"
                                className="text-gray-900 font-semibold px-3 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6D1357] data-[state=active]:to-[#6D1357] data-[state=active]:text-white rounded-xl transition-all text-xs sm:text-sm whitespace-nowrap"
                            >
                                Service Rate Cards
                            </TabsTrigger>
                            <TabsTrigger
                                value="amenities"
                                className="text-gray-900 font-semibold px-3 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6D1357] data-[state=active]:to-[#6D1357] data-[state=active]:text-white rounded-xl transition-all text-xs sm:text-sm whitespace-nowrap"
                            >
                                Amenities
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="text-gray-900 font-semibold px-3 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6D1357] data-[state=active]:to-[#6D1357] data-[state=active]:text-white rounded-xl transition-all text-xs sm:text-sm whitespace-nowrap"
                            >
                                Ratings
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* ── Rate Cards Tab ──────────────────────────────────────────── */}
                    <TabsContent value="portfolio" className="space-y-3 outline-none">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Service Rate Cards</h3>

                        {/* Subcategory filter pills */}
                        {subcategories.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                {/* All button */}
                                <button
                                    onClick={() => setSelectedSubcategoryId(null)}
                                    className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap border transition-all ${selectedSubcategoryId === null
                                        ? 'bg-[#6D1357] text-white border-[#6D1357]'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#6D1357]/50'
                                        }`}
                                >
                                    All
                                </button>
                                {subcategories.map((subcat, idx) => {
                                    const id = subcat.subcategoryId || subcat._id || subcat.id;
                                    const name = subcat.subcategoryName || subcat.name || `Subcategory ${idx + 1}`;
                                    return (
                                        <button
                                            key={id || idx}
                                            onClick={() => setSelectedSubcategoryId(id)}
                                            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap border transition-all ${selectedSubcategoryId === id
                                                ? 'bg-[#6D1357] text-white border-[#6D1357]'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#6D1357]/50'
                                                }`}
                                        >
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {loadingSubcategories && (
                            <div className="text-xs text-gray-400 flex items-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" /> Loading categories…
                            </div>
                        )}

                        {serviceData.packages.length > 0 ? (
                            <div className="space-y-6">
                                {groupedPackages.map((section, sIdx) => (
                                    <div key={section.id || sIdx}>
                                        {/* Section header — shown only in "All" view */}
                                        {section.name && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <Scissors className="w-4 h-4 text-[#6D1357] shrink-0" />
                                                <h4 className="text-sm sm:text-base font-bold text-gray-800 whitespace-nowrap">{section.name}</h4>
                                                <div className="flex-1 h-px bg-gradient-to-r from-[#6D1357]/30 to-transparent" />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                                            {section.packages.map((pkg, index) => (
                                                <div
                                                    key={pkg._id || index}
                                                    onClick={() => togglePackage(pkg)}
                                                    className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer relative flex flex-row ${selectedPackages.some(p => p._id === pkg._id)
                                                        ? 'border-2 border-[#6D1357] ring-2 ring-[#6D1357]/10'
                                                        : 'border-gray-100 hover:border-[#6D1357]/30'
                                                        }`}
                                                >
                                                    {selectedPackages.some(p => p._id === pkg._id) && (
                                                        <div className="absolute top-2 right-2 z-10 bg-[#6D1357] text-white p-1 rounded-full shadow-lg">
                                                            <Check className="w-3.5 h-3.5" />
                                                        </div>
                                                    )}
                                                    {/* Thumbnail */}
                                                    <div className="w-28 sm:w-36 shrink-0 bg-gray-100 relative self-stretch min-h-[110px]">
                                                        {pkg.image ? (
                                                            <Image
                                                                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${pkg.image[0]}`}
                                                                alt={pkg.name}
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                             width={500} height={300} />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-gray-300 min-h-[110px]">
                                                                <Scissors className="w-8 h-8 opacity-20" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Content */}
                                                    <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 min-w-0">
                                                        <div className="min-w-0">
                                                            <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate mb-1">{pkg.name}</h3>
                                                            <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-snug">{pkg.description}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-50">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] text-gray-500 font-bold italic uppercase tracking-wider">Starts From</span>
                                                                <span className="text-[#6D1357] font-bold text-lg sm:text-2xl leading-tight">₹{pkg.price}</span>
                                                                {pkg.priceUnit && (
                                                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{pkg.priceUnit}</span>
                                                                )}
                                                            </div>
                                                            {pkg.banner_images && pkg.banner_images.length > 0 && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setViewingRateCard(pkg);
                                                                        setRateCardImageIndex(0);
                                                                    }}
                                                                    className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-[#6D1357]/10 text-[#6D1357] rounded-xl text-[10px] sm:text-xs font-bold hover:bg-[#6D1357] hover:text-white transition-all flex items-center gap-1"
                                                                >
                                                                    Details
                                                                    <ChevronRight className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">No packages available.</div>
                        )}
                    </TabsContent>

                    {/* ── Reviews Tab ─────────────────────────────────────────────── */}
                    <TabsContent value="reviews" className="outline-none">
                        <div className="space-y-4">
                            {serviceData.reviews.length > 0 ? (
                                serviceData.reviews.map((r, i) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">{r.avatar || '👤'}</div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
                                    <p className="text-gray-500">No reviews yet for this service.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* ── Amenities Tab ───────────────────────────────────────────── */}
                    <TabsContent value="amenities" className="outline-none">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {serviceData.amenities.map((a, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex items-start gap-3 shadow-sm">
                                    <div className="w-8 h-8 rounded-lg bg-[#C06C84]/10 flex items-center justify-center shrink-0">
                                        <a.icon className="w-4 h-4 text-[#C06C84]" />
                                    </div>
                                    <span className="text-gray-700 font-medium text-sm leading-tight pt-1">{a.label}</span>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* ── About Tab ───────────────────────────────────────────────── */}
                    <TabsContent value="about" className="outline-none">
                        <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#C06C84]" />
                                Shortly Aboutus
                            </h3>
                            <div
                                className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-break-spaces [&_a]:text-[#6D1357] [&_a]:underline"
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(serviceData.about || '', {
                                        ADD_ATTR: ['target', 'rel'],
                                    }),
                                }}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* ── Fixed Bottom CTA ─────────────────────────────────────────────────── */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50"
            >
                <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
                    <div>
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-1 font-medium">
                            {selectedPackages.length > 0 ? `${selectedPackages.length} service(s) selected` : 'No service selected'}
                        </div>
                        <div className="flex items-baseline space-x-1.5">
                            <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                                ₹{totalPrice > 0 ? totalPrice.toLocaleString('en-IN') : serviceData.basePrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] sm:text-sm text-gray-500 font-medium">/total</span>
                        </div>
                    </div>
                    <button
                        onClick={handleContinueToBook}
                        className="px-6 sm:px-12 py-3 sm:py-4 bg-[#6D1357] text-white rounded-2xl font-bold text-sm sm:text-lg hover:shadow-xl hover:shadow-[#1A0515]/40 transition-all transform hover:scale-105"
                    >
                        Book Now
                    </button>
                </div>
            </motion.div>

            <AddonsModal
                isOpen={showAddonsModal}
                onClose={() => setShowAddonsModal(false)}
                providerId={serviceData.id || slugOrId}
                selectedPackageIds={selectedPackages.map(p => p._id)}
                onContinue={handleAddonsContinue}
            />

            {/* ── Rate Card Image Modal ─────────────────────────────────────────────── */}
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
                            {/* Main Image */}
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
                                            className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${rateCardImageIndex === idx ? 'ring-2 ring-[#6D1357] scale-105 shadow-md' : 'opacity-60 hover:opacity-100'}`}
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
