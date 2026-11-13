'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
    DollarSign, Wifi, Utensils, Shirt, Zap,
    Car, Shield, Camera, Sparkles, MapPin, X, Flower2, Loader2, CheckCircle, CheckCircle2, ChevronRight, ChevronLeft,
    ShieldCheck, Award, BookOpen, HeartHandshake
} from 'lucide-react';
import 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { AddonsModal } from '@/components/religious/AddonsModal';
import ReligiousProviderHero, { ReligiousHeroSkeleton } from '@/components/religious/ReligiousProviderHero';
import SacredOfferingsSection from '@/components/religious/SacredOfferingsSection';
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

    const [serviceData, setServiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPackages, setSelectedPackages] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [showAddonsModal, setShowAddonsModal] = useState(false);
    const [isCheckingAddons, setIsCheckingAddons] = useState(false);
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

    const renderAboutContent = () => {
        const rawAbout = serviceData?.about || '';
        // Clean trailing artifacts like ".666" or random numbers appended to text
        const cleaned = typeof rawAbout === 'string'
            ? rawAbout.replace(/\.666+$/, '.').replace(/\s*666\s*$/, '').trim()
            : rawAbout;

        const isHtml = /<[a-z][\s\S]*>/i.test(cleaned);
        if (isHtml) {
            return (
                <div
                    className="text-gray-700 leading-relaxed text-sm sm:text-base prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={renderSanitizedHtml(cleaned)}
                />
            );
        }

        // Plain text: split into paragraphs if multiple double newlines exist
        const paragraphs = cleaned.split(/\n\s*\n/).filter(Boolean);
        if (paragraphs.length > 1) {
            return (
                <div className="space-y-3.5 text-gray-700 text-sm sm:text-[15px] leading-relaxed">
                    {paragraphs.map((p, idx) => (
                        <p key={idx}>{p.trim()}</p>
                    ))}
                </div>
            );
        }

        // If it's a long continuous text block (e.g. >= 4 sentences), split into 2 readable paragraphs for better typography
        const sentences = cleaned.match(/[^.!?]+[.!?]+(\s+|$)/g);
        if (sentences && sentences.length >= 4) {
            const mid = Math.ceil(sentences.length / 2);
            const part1 = sentences.slice(0, mid).join('').trim();
            const part2 = sentences.slice(mid).join('').trim();
            return (
                <div className="space-y-3.5 text-gray-700 text-sm sm:text-[15px] leading-relaxed">
                    <p>{part1}</p>
                    <p>{part2}</p>
                </div>
            );
        }

        return (
            <p className="text-gray-700 text-sm sm:text-[15px] leading-relaxed">
                {cleaned}
            </p>
        );
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
                if (!response.ok) {
                    setLoading(false);
                    return;
                }
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
                        rawStore: store,
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
        let isMounted = true;
        const run = async () => {
            if (!slugOrId) return;
            try {
                const payload = isObjectId(slugOrId) ? { providerId: slugOrId } : { providerSlug: slugOrId };
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/provider-subcategories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) return;
                const contentType = res.headers.get('content-type') || '';
                if (!contentType.includes('application/json')) return;
                const data = await res.json();
                if (isMounted && data?.success) {
                    setSubcategories(Array.isArray(data.subcategories || data.data) ? (data.subcategories || data.data) : []);
                }
            } catch (e) {
                console.warn('Unable to load provider subcategories:', e?.message || e);
            }
        };
        run();
        return () => { isMounted = false; };
    }, [slugOrId]);

    const handleContinueToBook = async (packagesToBook = null) => {
        const pkgs = packagesToBook || selectedPackages;
        if (!pkgs || pkgs.length === 0) {
            alert("Please select at least one sacred offering to proceed.");
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
                    serviceIds: pkgs.map(p => p._id),
                    professionalProviderId: currentId
                })
            });
            if (!response.ok) {
                handleAddonsContinue([], pkgs);
                return;
            }
            const data = await response.json();
            if (data.success && data.data && data.data.length > 0) {
                const allAddons = data.data.flatMap(item => item.addons || []);
                if (allAddons.length > 0) {
                    setShowAddonsModal(true);
                    return;
                }
            }
            handleAddonsContinue([], pkgs);
        } catch (error) {
            console.error("Error checking add-ons:", error);
            handleAddonsContinue([], pkgs);
        } finally {
            setIsCheckingAddons(false);
        }
    };

    const handleAddonsContinue = (selectedAddons, pkgs = null) => {
        setShowAddonsModal(false);
        const addonIds = selectedAddons.map(a => a._id).join(',');
        const activePkgs = pkgs || selectedPackages;
        const packageIds = activePkgs.map(p => p._id).join(',');
        router.push(`/religious-services/booking/address?providerId=${serviceData.id}&packageId=${packageIds}&addons=${addonIds}`);
    };

    const handleCardBookNow = (pkg) => {
        setSelectedPackages([pkg]);
        handleContinueToBook([pkg]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--off-white)] pb-36 pt-16 sm:pt-20">
                <ReligiousHeroSkeleton />
                <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 mt-8 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-[var(--saffron)] animate-spin" />
                </div>
            </div>
        );
    }

    if (!serviceData) {
        return <div className="min-h-screen bg-[var(--off-white)]" />;
    }

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
        <div className="min-h-screen overflow-x-hidden bg-[var(--off-white)] pb-36 pt-16 sm:pt-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />

            {/* Global Reusable Religious Services Provider Hero */}
            <ReligiousProviderHero
                serviceData={serviceData}
                subcategories={subcategories}
                onBack={() => {
                    const targetSubcat = subcategoryId || context.subcategoryId;
                    if (targetSubcat) {
                        router.push(`/religious-services/${targetSubcat}`);
                    } else {
                        router.back();
                    }
                }}
            />

            {/* ── Redesigned Sacred Offerings Section (Approved Pixel-Accurate UI) ── */}
            <SacredOfferingsSection
                packages={serviceData.packages || []}
                subcategories={subcategories}
                selectedPackages={selectedPackages}
                onTogglePackage={togglePackage}
                onBookNow={handleCardBookNow}
                isCheckingAddons={isCheckingAddons}
                onViewRateCard={(pkg) => {
                    setViewingRateCard(pkg);
                    setRateCardImageIndex(0);
                }}
            />

            {/* ── About Pandit & Sacred Practice (Redesigned) ── */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12 mb-8">
                <div className="bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF6EF] rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-sm border border-[#E8DCC8] relative overflow-hidden">
                    {/* Decorative subtle ambient warm glow in top-right */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-b from-[#FF9933]/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                    {/* Section Header */}
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 pb-5 border-b border-[#F0E5D3]">
                        <div className="flex items-center gap-3 sm:gap-3.5">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#FF9933] via-[#D9531E] to-[#7B1113] flex items-center justify-center text-white shadow-md shadow-[#FF9933]/25 ring-4 ring-[#FFF4E5] shrink-0">
                                <Flower2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-2xl font-bold text-[#2A0826] font-serif tracking-tight">
                                    About the Priest & Sacred Practice
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                    Authentic traditions, lineage & devotee guidelines
                                </p>
                            </div>
                        </div>

                        <div className="self-start sm:self-auto">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF5EB] border border-[#E8DCC8] text-xs font-semibold text-[#7B1113] shadow-2xs">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                                Verified Authentic Lineage
                            </span>
                        </div>
                    </div>

                    {/* Main Content Grid: Balanced 12-column layout */}
                    <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                        {/* Left Column: Priest / Institution Bio & Trust Highlights */}
                        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-between space-y-4 sm:space-y-5">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <h3 className="text-sm sm:text-base font-bold text-[#2A0826] flex items-center gap-2">
                                        <Award className="w-4 h-4 text-[#FF9933] shrink-0" />
                                        Priest / Institution Profile
                                    </h3>
                                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                        Vetted Provider
                                    </span>
                                </div>

                                <div className="bg-white/85 rounded-2xl p-4 sm:p-5 border border-[#E8DCC8]/70 shadow-2xs">
                                    {renderAboutContent()}
                                </div>
                            </div>

                            {/* Trust Highlights Strip */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-[#E8DCC8]/70 shadow-2xs">
                                    <div className="w-8 h-8 rounded-lg bg-[#FF9933]/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-4 h-4 text-[#D9531E]" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-[#2A0826] truncate">Vetted Astrologers</div>
                                        <div className="text-[11px] text-gray-500 truncate">Background verified</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-[#E8DCC8]/70 shadow-2xs">
                                    <div className="w-8 h-8 rounded-lg bg-[#107A48]/10 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-4 h-4 text-[#107A48]" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-[#2A0826] truncate">Vedic Vidhana</div>
                                        <div className="text-[11px] text-gray-500 truncate">Strict Shastra rituals</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-[#E8DCC8]/70 shadow-2xs">
                                    <div className="w-8 h-8 rounded-lg bg-[#7B1113]/10 flex items-center justify-center shrink-0">
                                        <Sparkles className="w-4 h-4 text-[#7B1113]" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-[#2A0826] truncate">Pure Samagri</div>
                                        <div className="text-[11px] text-gray-500 truncate">Sacred materials</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Ritual Guidelines & Service Location Sidebar */}
                        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between gap-3.5 sm:gap-4 bg-gradient-to-b from-[#FAF6EF] to-[#F5EFE3] rounded-2xl p-4 sm:p-5 border border-[#E8DCC8] shadow-2xs">
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC8]/80">
                                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#7B1113] flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-[#FF9933] shrink-0" />
                                        Ritual Guidelines
                                    </h3>
                                    <span className="text-[10px] font-semibold text-[#8A550C] bg-[#FFEAA8]/60 px-2 py-0.5 rounded-full border border-[#D9A441]/30">
                                        Devotee Protocol
                                    </span>
                                </div>

                                <ul className="space-y-2">
                                    {(serviceData.rules && serviceData.rules.length > 0 ? serviceData.rules : [
                                        { rule: 'Traditional attire requested', allowed: true },
                                        { rule: 'Materials provided by priest', allowed: true }
                                    ]).map((rule, i) => (
                                        <li key={i} className="flex items-start gap-2.5 p-2.5 bg-white/90 rounded-xl border border-[#E8DCC8]/60 text-xs sm:text-sm text-gray-800 shadow-2xs">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <span className="font-medium leading-snug">{rule.rule}</span>
                                        </li>
                                    ))}
                                </ul>

                                {serviceData.location && (
                                    <div className="p-3 bg-white/90 rounded-xl border border-[#E8DCC8]/60 space-y-1 shadow-2xs">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2A0826]">
                                            <MapPin className="w-3.5 h-3.5 text-[#D9531E] shrink-0" />
                                            <span>Service Location / Ashram</span>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed pl-5 break-words">
                                            {serviceData.location}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Devotee Assistance Note */}
                            <div className="p-3 bg-[#FFF9F0] rounded-xl border border-[#ECDAB8]/80 flex items-start gap-2.5 text-xs text-[#6A3B05]">
                                <HeartHandshake className="w-4 h-4 text-[#D9531E] shrink-0 mt-0.5" />
                                <p className="text-[11px] sm:text-xs leading-normal">
                                    <strong>Devotee Care:</strong> Have custom gotra, nakshatra, or sankalpa requirements? Coordinate directly with your priest upon booking.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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
                                            <Image src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img}`} className="w-full h-full object-cover" alt="" width={500} height={300} />
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
