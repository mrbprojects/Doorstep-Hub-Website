'use client';

import React, {  useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
    MapPin, Search, Users, Home, Bed, Sparkles, Star, ChevronRight, ChevronLeft,
    Wifi, Utensils, Check,
    Zap, Percent
} from 'lucide-react';
import { QuestionnaireModal } from '@/components/pghostels/QuestionnaireModal';
import { useLocationContext } from '@/context/LocationContext';
import { NearbyHostelsSection } from './NearbyHostelsSection';
import { PGLifestyleSection } from './PGLifestyleSection';

import { KnowledgeSection } from '@/components/landing/KnowledgeSection';
import { AppDownload } from '@/components/landing/AppDownload';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/app`;
const SERVICE_ID = '69524fb157bb211ca094e5ee'; // PG Hostels Service ID



export function PremiumHomePage() {
    
    const { location } = useLocationContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory] = useState({ id: '', name: '' });
    const [featuredHostels, setFeaturedHostels] = useState([]);
    const router = useRouter();
    const [apiCategories, setApiCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const heroRef = useRef(null);
    const categoriesRef = useRef(null);
    const isHeroInView = useInView(heroRef, { once: true });
    

    const [searchQuery, setSearchQuery] = useState('');
    const [globalSettings, setGlobalSettings] = useState(null);


    const handleSearch = useCallback(() => {
        if (searchQuery.trim()) {
            router.push(`/pghostels/listings/all?query=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push('/pghostels/listings/all');
        }
    }, [searchQuery, router]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    // Fetch Featured Hostels
    useEffect(() => {
        const fetchFeaturedHostels = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products/featured_pg_hostels`);
                const data = await response.json();
                if (data.success && data.hostels) {
                    setFeaturedHostels(data.hostels);
                }
            } catch (error) {
                console.error('Error fetching featured hostels:', error);
            }
        };
        fetchFeaturedHostels();
    }, []);

    // Fetch Categories with serviceId in payload
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/categories`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            serviceId: SERVICE_ID
                        })
                    }
                );
                const data = await response.json();
                const categories = data.category || data.categories || data.data || [];
                if (data.success && categories.length > 0) {
                    setApiCategories(categories);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };
        const fetchGlobalSettings = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/get_global_settings`);
                const data = await response.json();
                if (data.success && data.data) {
                    setGlobalSettings(data.data);
                }
            } catch (error) {
                console.error("Error fetching global settings:", error);
            }
        };

        fetchCategories();
        fetchGlobalSettings();
    }, []);

    const schemaData = useMemo(() => ({
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                "name": `Verified PG & Hostel Accommodations in ${location?.city || 'India'}`,
                "description": `Find your perfect stay with verified PGs, co-living spaces, and hostels in ${location?.city || 'your area'}. Transparent pricing and no brokerage.`,
                "provider": {
                    "@type": "Organization",
                    "name": "Doorstep Hub",
                    "url": "https://doorstephub.com"
                },
                "areaServed": {
                    "@type": "Country",
                    "name": "India"
                }
            },
            {
                "@type": "ItemList",
                "name": "Our Lifestyle Stays",
                "itemListElement": apiCategories.length > 0
                    ? apiCategories.map((cat, index) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "name": cat.name,
                        "url": `https://doorstephub.com/pghostels/${cat.slug || cat._id}`
                    }))
                    : [
                        { "@type": "ListItem", "position": 1, "name": "Student Hostels" },
                        { "@type": "ListItem", "position": 2, "name": "Working Professional PGs" },
                        { "@type": "ListItem", "position": 3, "name": "Co-living Spaces" },
                        { "@type": "ListItem", "position": 4, "name": "Luxury Accommodations" }
                    ]
            }
        ]
    }), [location?.city, apiCategories]);

    return (
        <div className="min-h-screen bg-[#F4FCF9] overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />
            {/* Subtle static background accent */}
            <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-[#037166]/3 via-transparent to-[#037166]/5" />

            {/* Hero Section */}
            <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-r from-[#F0F9F6] via-[#F5FBF9] to-[#E8F7F3] pt-20 pb-0 border-b border-[#E2F5EE]">
                {/* Subtle Atmospheric Highlights */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#B2EEDB]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-[#C4F3E5]/25 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                        {/* Left Content - approximately 48-50% (6 cols of 12) */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="lg:col-span-6 xl:col-span-6 space-y-3.5 sm:space-y-4 py-4 lg:py-6"
                        >
                            {/* Top Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDF8F0] border border-[#BCEEDA] shadow-xs"
                            >
                                <div className="w-5 h-5 rounded-full bg-[#00796F] flex items-center justify-center text-white shrink-0">
                                    <Home className="w-3 h-3 stroke-[2.5]" />
                                </div>
                                <span className="text-xs font-semibold text-[#00695C] tracking-tight">
                                    Verified PGs & Hostels Near You
                                </span>
                            </motion.div>

                            {/* Main Headline */}
                            <motion.h1
                                initial={{ opacity: 0, y: 15 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-3xl sm:text-4xl md:text-[42px] lg:text-[44px] xl:text-[48px] font-extrabold tracking-tight leading-[1.12] text-[#102033]"
                            >
                                Find Your <span className="text-[#00796F]">Perfect Stay</span>
                                <br />
                                in Minutes.
                            </motion.h1>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0, y: 15 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-lg font-normal"
                            >
                                Comfortable, safe and affordable PGs, co-living spaces, and hostels near your college or office.
                            </motion.p>

                            {/* Search Bar */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="w-full max-w-xl bg-white rounded-full p-1.5 pl-4 sm:pl-5 shadow-[0_8px_28px_rgba(0,121,111,0.08)] border border-[#E2E8F0] flex items-center gap-2 sm:gap-3 transition-shadow hover:shadow-[0_12px_32px_rgba(0,121,111,0.12)]"
                            >
                                <MapPin className="w-5 h-5 text-[#00796F] shrink-0" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Search by area, college, landmark or city..."
                                    className="w-full bg-transparent text-sm text-[#102033] placeholder:text-[#94A3B8] font-normal outline-none focus:outline-none"
                                    aria-label="Search by area, college, landmark or city"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSearch}
                                    className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#00796F] hover:bg-[#00695C] text-white rounded-full font-semibold shadow-md shadow-[#00796F]/20 text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-colors"
                                >
                                    <Search className="w-4 h-4 text-white stroke-[2.5]" />
                                    <span>Search</span>
                                </motion.button>
                            </motion.div>

                            {/* Benefit Indicators */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="grid grid-cols-2 sm:flex sm:flex-nowrap items-center gap-3 sm:gap-4 lg:gap-5 pt-0.5"
                            >
                                {/* 1. Verified Listings */}
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#00796F] flex items-center justify-center text-white shrink-0 shadow-xs">
                                        <Check className="w-4 h-4 stroke-[2.5]" />
                                    </div>
                                    <div className="text-[11px] sm:text-xs font-bold text-[#102033] leading-tight">
                                        <div>Verified</div>
                                        <div>Listings</div>
                                    </div>
                                </div>

                                {/* 2. Instant Booking */}
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0 shadow-xs">
                                        <Zap className="w-4 h-4 text-[#D97706] fill-[#D97706]" />
                                    </div>
                                    <div className="text-[11px] sm:text-xs font-bold text-[#102033] leading-tight">
                                        <div>Instant</div>
                                        <div>Booking</div>
                                    </div>
                                </div>

                                {/* 3. No Brokerage */}
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0 shadow-xs">
                                        <Percent className="w-4 h-4 text-[#2563EB] stroke-[2.5]" />
                                    </div>
                                    <div className="text-[11px] sm:text-xs font-bold text-[#102033] leading-tight">
                                        <div>No</div>
                                        <div>Brokerage</div>
                                    </div>
                                </div>

                                {/* 4. Student Friendly */}
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#FFE4E6] flex items-center justify-center shrink-0 shadow-xs">
                                        <Users className="w-4 h-4 text-[#E11D48] stroke-[2.5]" />
                                    </div>
                                    <div className="text-[11px] sm:text-xs font-bold text-[#102033] leading-tight">
                                        <div>Student</div>
                                        <div>Friendly</div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* App Store Badges & 10,000+ Happy Students */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-1"
                            >
                                {/* Apple App Store Badge */}
                                <a
                                    href={globalSettings?.appStore || "https://apps.apple.com/in/app/doorstep-hub/id6475340236"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-black hover:bg-neutral-900 text-white rounded-lg shadow-sm transition-all hover:-translate-y-0.5 shrink-0"
                                    title="Download on the App Store"
                                >
                                    <svg className="w-5 h-5 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.86.96-2.84-.93.04-2.05.62-2.7 1.39-.58.67-1.08 1.76-.95 2.82 1.04.08 2.06-.59 2.69-1.37z"/>
                                    </svg>
                                    <div className="flex flex-col text-left leading-none">
                                        <span className="text-[7.5px] sm:text-[8px] text-gray-300">Download on the</span>
                                        <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight mt-0.5">App Store</span>
                                    </div>
                                </a>

                                {/* Google Play Store Badge */}
                                <a
                                    href={globalSettings?.playStore || "https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-black hover:bg-neutral-900 text-white rounded-lg shadow-sm transition-all hover:-translate-y-0.5 shrink-0"
                                    title="Get it on Google Play"
                                >
                                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                                        <path d="M3.608 1.636a1.442 1.442 0 0 0-.358.988v18.752c0 .385.127.733.358.988l.056.056 10.5-10.428v-.248L3.664 1.58l-.056.056Z" fill="#2196F3"/>
                                        <path d="M17.664 15.492l-3.5-3.48v-.248l3.5-3.48.08.046 4.148 2.357c1.184.673 1.184 1.774 0 2.447l-4.148 2.358-.08.046Z" fill="#FFC107"/>
                                        <path d="M14.244 11.764L3.608 22.364c.389.412 1.05.464 1.79.043l12.346-7.015-3.5-3.628Z" fill="#F44336"/>
                                        <path d="M14.244 11.764l3.5-3.628L5.398 1.121c-.74-.421-1.401-.369-1.79.043l10.636 10.6Z" fill="#4CAF50"/>
                                    </svg>
                                    <div className="flex flex-col text-left leading-none">
                                        <span className="text-[7.5px] sm:text-[8px] uppercase tracking-wider text-gray-300">GET IT ON</span>
                                        <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight mt-0.5">Google Play</span>
                                    </div>
                                </a>

                                {/* 10,000+ Happy Students */}
                                <div className="flex items-center gap-2.5 pl-1 shrink-0">
                                    <Image
                                        src="/pghostels/student-avatars-transparent.png"
                                        alt="Happy Students"
                                        className="h-7 sm:h-8 w-auto object-contain"
                                     width={500} height={300} />
                                    <div className="flex flex-col text-left leading-none">
                                        <span className="text-xs sm:text-sm font-extrabold text-[#102033]">10,000+</span>
                                        <span className="text-[10px] sm:text-[11px] font-medium text-[#64748B] mt-0.5">Happy Students</span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right Content - prominent person image filling right section (6 cols of 12) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 15 }}
                            animate={isHeroInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                            className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center lg:justify-end mt-2 lg:mt-0"
                        >
                            <div className="relative w-full flex justify-center lg:justify-end">
                                <Image
                                    src="/pghostels/hero-pg-hostel-approved.jpg"
                                    alt="Doorstep Hub PG & Hostels - Find Your Perfect Stay"
                                    className="w-full max-w-[660px] lg:max-w-[760px] xl:max-w-[820px] h-auto object-contain block"
                                 width={500} height={300} />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Quick Search Strip */}


            <div ref={categoriesRef}>
              <PGLifestyleSection
                categories={apiCategories}
                categoriesLoading={loading}
                onViewAll={() => router.push('/pghostels/listings/all')}
                onOpenCategory={(category) => router.push(`/pghostels/${category.slug || category._id}`)}
                onSubcategoryClick={(subCategory) => router.push(`/pghostels/${subCategory.slug || subCategory._id}`)}
                fetchSubcategoriesForCategory={async (category) => {
                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categorySlug: category.slug, serviceId: SERVICE_ID }),
                  });
                  const data = await response.json();
                  return data.success && Array.isArray(data.data) ? data.data : [];
                }}
              />
            </div>

            {/* Near You Section */}
            <NearbyHostelsSection router={router} />

            {/* Top Deals Section */}
            <TopDealsSection router={router} />

            {/* How It Works */}
            <HowItWorksSection />

            {/* Testimonials */}
            {/* <TestimonialsSection testimonials={testimonials} /> */}

            {/* Featured Hostels */}
            <FeaturedHostelsSection listings={featuredHostels} loading={loading} router={router} city={location?.city} />

            {/* Help Center Section - PG & Hostel Articles */}
            <KnowledgeSection vertical="pg-hostel" showNewsletter={false} />

            {/* App Download Section (same as Home page) */}
            <AppDownload />

            {/* Questionnaire Modal */}
            <QuestionnaireModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categoryName={selectedCategory.name}
                categoryId={selectedCategory.id}
                allCategories={apiCategories}
                lat={location?.lat}
                lng={location?.lng}
            />
        </div>
    );
}


// Top Deals Section (Exclusive Offers) - High Quality Native UI
function TopDealsSection({ router }) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#EBF7F4] via-[#F4FCF9] to-[#F8FCFA] py-5 sm:py-6 border-b border-[#DDF4EC]">
            <div className="max-w-[1320px] mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 mb-3.5 sm:mb-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DDF8F0] border border-[#BCEEDA] shadow-xs mb-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#00695C]" />
                            <span className="text-[10.5px] font-bold text-[#00695C] uppercase tracking-wider">
                                Top Deals
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#102033] tracking-tight leading-tight mb-0.5">
                            Exclusive Offers
                        </h2>
                        <p className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed">
                            Special pricing and curated perks just for you ✨
                        </p>
                    </div>

                    {/* Right side handwritten callout with radiant sun rays */}
                    <div className="hidden sm:flex items-center relative self-start sm:self-end pb-1">
                        <Image
                            src="/pghostels/callout_save_more_transparent.png"
                            alt="Save more on your stay!"
                            className="h-9 sm:h-11 w-auto object-contain"
                         width={500} height={300} />
                    </div>
                </div>

                {/* 3 Native High-Resolution Offer Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
                    {/* Card 1: Zero Deposit Options */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => router.push('/pghostels/listings/all')}
                        className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-r from-[#9747FF] via-[#7B3FE4] to-[#5138E8] h-[105px] sm:h-[110px] p-3 sm:p-3.5 flex items-center justify-between shadow-[0_4px_16px_rgba(151,71,255,0.22)] hover:shadow-[0_8px_24px_rgba(151,71,255,0.32)] transition-all"
                    >
                        <div className="flex items-center gap-2.5 min-w-0 pr-1 h-full">
                            {/* Student cutout & house icon */}
                            <div className="relative shrink-0 flex items-center h-full">
                                <Image
                                    src="/pghostels/girl_books_sharp.png"
                                    alt="Student"
                                    className="h-[95px] w-auto object-contain -ml-2 shrink-0 drop-shadow-sm select-none"
                                 width={500} height={300} />
                                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0 -ml-1 shadow-xs">
                                    <Home className="w-4 h-4 stroke-[2.5]" />
                                </div>
                            </div>

                            {/* Text */}
                            <div className="min-w-0 flex flex-col justify-center">
                                <span className="text-[9.5px] font-black text-white/80 uppercase tracking-wider mb-0.5 leading-none">
                                    INSTANT MOVE-IN
                                </span>
                                <h4 className="text-[15px] sm:text-[16px] font-black text-white leading-tight truncate">
                                    Zero Deposit Options
                                </h4>
                                <p className="text-[11px] text-white/90 font-medium line-clamp-1 mt-0.5">
                                    Move in without hefty deposits
                                </p>
                            </div>
                        </div>

                        <div className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center shrink-0 ml-1 group-hover:scale-105 transition-transform">
                            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5] text-[#5138E8]" />
                        </div>
                    </motion.div>

                    {/* Card 2: Without Meals PGs */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => router.push('/pghostels/listings/all')}
                        className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-r from-[#FF8B20] via-[#F57C00] to-[#E85B00] h-[105px] sm:h-[110px] p-3 sm:p-3.5 flex items-center justify-between shadow-[0_4px_16px_rgba(255,139,32,0.22)] hover:shadow-[0_8px_24px_rgba(255,139,32,0.32)] transition-all"
                    >
                        <div className="flex items-center gap-2.5 min-w-0 h-full">
                            {/* Plate icon */}
                            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0 shadow-xs">
                                <Utensils className="w-4 h-4 stroke-[2.5]" />
                            </div>

                            {/* Text */}
                            <div className="min-w-0 flex flex-col justify-center">
                                <span className="text-[9.5px] font-black text-white/80 uppercase tracking-wider mb-0.5 leading-none">
                                    SAVE BIG
                                </span>
                                <h4 className="text-[15px] sm:text-[16px] font-black text-white leading-tight truncate">
                                    Without Meals PGs
                                </h4>
                                <p className="text-[11px] text-white/90 font-medium line-clamp-1 mt-0.5">
                                    Budget-friendly flexible options
                                </p>
                            </div>
                        </div>

                        {/* Right: Food Bowls & Arrow */}
                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                            <Image
                                src="/pghostels/food_bowls_sharp.png"
                                alt="Meals"
                                className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm select-none"
                             width={500} height={300} />
                            <div className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5] text-[#E85B00]" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Best for Professionals */}
                    <motion.div
                        whileHover={{ y: -3, scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => router.push('/pghostels/listings/all')}
                        className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-r from-[#08A98F] via-[#05967E] to-[#006B61] h-[105px] sm:h-[110px] p-3 sm:p-3.5 flex items-center justify-between shadow-[0_4px_16px_rgba(8,169,143,0.22)] hover:shadow-[0_8px_24px_rgba(8,169,143,0.32)] transition-all"
                    >
                        <div className="flex items-center gap-2.5 min-w-0 pr-1 h-full">
                            {/* Desk setup photo */}
                            <Image
                                src="/pghostels/laptop_desk_sharp.png"
                                alt="Desk setup"
                                className="h-[95px] w-auto object-contain -ml-2 shrink-0 drop-shadow-sm select-none"
                             width={500} height={300} />

                            {/* Text */}
                            <div className="min-w-0 flex flex-col justify-center">
                                <span className="text-[9.5px] font-black text-white/80 uppercase tracking-wider mb-0.5 leading-none">
                                    WORK FRIENDLY
                                </span>
                                <h4 className="text-[15px] sm:text-[16px] font-black text-white leading-tight truncate">
                                    Best for Professionals
                                </h4>
                                <p className="text-[11px] text-white/90 font-medium line-clamp-1 mt-0.5">
                                    High-speed WiFi & desk setup
                                </p>
                            </div>
                        </div>

                        <div className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center shrink-0 ml-1 group-hover:scale-105 transition-transform">
                            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5] text-[#006B61]" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// How It Works Section (Book in 3 Simple Steps) - High Quality Native UI
function HowItWorksSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#F2FBF9] via-[#FAFDFD] to-[#F5FCFA] py-6 sm:py-8 border-b border-[#DDF4EC]">
            <div className="max-w-[1320px] mx-auto px-4 sm:px-6 relative z-10">
                {/* Heading */}
                <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
                    <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#102033] tracking-tight leading-tight mb-0.5">
                        Book in 3 Simple Steps
                    </h2>
                    <p className="text-xs sm:text-[13px] text-[#64748B]">
                        From search to move-in, we make it easy and hassle-free.
                    </p>
                </div>

                {/* 3 Step Cards Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-2 lg:gap-3 max-w-[1240px] mx-auto">
                    {/* Step 1: Select Category */}
                    <div className="flex-1 w-full bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E2F3EE] shadow-[0_4px_20px_rgba(0,121,111,0.06)] hover:shadow-[0_8px_28px_rgba(0,121,111,0.12)] transition-all flex items-center justify-between h-[135px] sm:h-[142px] relative overflow-hidden">
                        <div className="flex flex-col justify-center z-10 pr-2">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-6 h-6 rounded-lg bg-[#00796F] text-white font-black text-xs flex items-center justify-center shadow-xs">
                                    1
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#E6F8F3] border border-[#BCEEDA] flex items-center justify-center text-[#00796F] shadow-xs">
                                    <Search className="w-4 h-4 stroke-[2.5]" />
                                </div>
                            </div>
                            <h3 className="text-sm sm:text-[15px] font-black text-[#102033] mb-0.5">
                                Select Category
                            </h3>
                            <p className="text-[11px] sm:text-[11.5px] text-[#64748B] leading-tight">
                                Choose your preferred type of stay<br />(Hostel, PG, Dormitory, etc.)
                            </p>
                        </div>
                        <Image
                            src="/pghostels/step1_art_sharp.png"
                            alt="Select Category"
                            className="h-[125px] sm:h-[135px] w-auto object-contain -mr-1 shrink-0 select-none pointer-events-none"
                         width={500} height={300} />
                    </div>

                    {/* Dashed Arrow 1 */}
                    <div className="hidden md:flex items-center justify-center shrink-0 w-6 lg:w-8 text-[#00796F]">
                        <svg className="w-full h-3" viewBox="0 0 36 12" fill="none">
                            <line x1="2" y1="6" x2="30" y2="6" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 3" />
                            <polyline points="26,2 32,6 26,10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    {/* Step 2: Compare PGs & Hostels */}
                    <div className="flex-1 w-full bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E2F3EE] shadow-[0_4px_20px_rgba(0,121,111,0.06)] hover:shadow-[0_8px_28px_rgba(0,121,111,0.12)] transition-all flex items-center justify-between h-[135px] sm:h-[142px] relative overflow-hidden">
                        <div className="flex flex-col justify-center z-10 pr-2">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-6 h-6 rounded-lg bg-[#00796F] text-white font-black text-xs flex items-center justify-center shadow-xs">
                                    2
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#E6F8F3] border border-[#BCEEDA] flex items-center justify-center text-[#00796F] shadow-xs">
                                    <Star className="w-4 h-4 stroke-[2.5]" />
                                </div>
                            </div>
                            <h3 className="text-sm sm:text-[15px] font-black text-[#102033] mb-0.5">
                                Compare PGs & Hostels
                            </h3>
                            <p className="text-[11px] sm:text-[11.5px] text-[#64748B] leading-tight">
                                View room images, amenities,<br />ratings and prices
                            </p>
                        </div>
                        <Image
                            src="/pghostels/step2_art_sharp.png"
                            alt="Compare PGs and Hostels"
                            className="h-[125px] sm:h-[135px] w-auto object-contain -mr-1 shrink-0 select-none pointer-events-none"
                         width={500} height={300} />
                    </div>

                    {/* Dashed Arrow 2 */}
                    <div className="hidden md:flex items-center justify-center shrink-0 w-6 lg:w-8 text-[#00796F]">
                        <svg className="w-full h-3" viewBox="0 0 36 12" fill="none">
                            <line x1="2" y1="6" x2="30" y2="6" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 3" />
                            <polyline points="26,2 32,6 26,10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    {/* Step 3: Book & Move In */}
                    <div className="flex-1 w-full bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E2F3EE] shadow-[0_4px_20px_rgba(0,121,111,0.06)] hover:shadow-[0_8px_28px_rgba(0,121,111,0.12)] transition-all flex items-center justify-between h-[135px] sm:h-[142px] relative overflow-hidden">
                        <div className="flex flex-col justify-center z-10 pr-2">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-6 h-6 rounded-lg bg-[#00796F] text-white font-black text-xs flex items-center justify-center shadow-xs">
                                    3
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#E6F8F3] border border-[#BCEEDA] flex items-center justify-center text-[#00796F] shadow-xs">
                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                </div>
                                <div className="w-5 h-5 rounded-full bg-[#00796F] text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                            </div>
                            <h3 className="text-sm sm:text-[15px] font-black text-[#102033] mb-0.5">
                                Book & Move In
                            </h3>
                            <p className="text-[11px] sm:text-[11.5px] text-[#64748B] leading-tight">
                                Confirm your booking and<br />move in with confidence
                            </p>
                        </div>
                        <Image
                            src="/pghostels/step3_art_sharp.png"
                            alt="Book & Move In"
                            className="h-[125px] sm:h-[135px] w-auto object-contain -mr-1 shrink-0 select-none pointer-events-none"
                         width={500} height={300} />
                    </div>
                </div>
            </div>
        </section>
    );
}

// Featured Hostels Section
function FeaturedHostelsSection({ listings, loading, router, city }) {
    const scrollContainerRef = useRef(null);

    const fallbackListings = [
        {
            _id: 'feat-1',
            slug: 'westside-coliving',
            hostelName: 'WESTSIDE COLIVING',
            address: 'Gachibowli, Hyderabad',
            startingAt: 5500,
            image: '/pghostels/clean_feat_1.png',
            rating: 4.5,
            isFallback: true
        },
        {
            _id: 'feat-2',
            slug: 'yvr-deluxe-hostel-pg',
            hostelName: 'YVR DELUXE HOSTEL & PG',
            address: 'Tawakkal Nagar, Hyderabad',
            startingAt: 5500,
            image: '/pghostels/clean_feat_2.png',
            rating: 4.4,
            isFallback: true
        },
        {
            _id: 'feat-3',
            slug: 'shiva-nivas-deluxe-pg',
            hostelName: 'SHIVA NIVAS DELUXE PG',
            address: 'HITEC City, Hyderabad',
            startingAt: 199,
            image: '/pghostels/clean_feat_3.png',
            rating: 4.6,
            isFallback: true
        },
        {
            _id: 'feat-4',
            slug: 'prasana-womens-pg',
            hostelName: 'PRASANA WOMENS PG',
            address: 'UCO Bank Ln, Hyderabad',
            startingAt: 199,
            image: '/pghostels/clean_feat_4.png',
            rating: 4.5,
            isFallback: true
        },
        {
            _id: 'feat-5',
            slug: 'vara-lakshmilakshmi-pg-srnagar',
            hostelName: 'VARA LAKSHMILAKSHMI PG',
            address: 'SR Nagar, Hyderabad',
            startingAt: 5500,
            image: '/pghostels/clean_feat_5.png',
            rating: 4.3,
            isFallback: true
        }
    ];

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const amount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    const hasData = listings && listings.length > 0;
    const displayListings = hasData ? listings.slice(0, 5) : fallbackListings;
    const currentCity = city || 'Hyderabad';

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF9EE] via-[#FCFDFD] to-[#F2FBF8] py-7 sm:py-8 border-b border-[#E8F3EE]">
            <div className="max-w-[1320px] mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-5">
                    {/* Left: Eyebrow + Title + Subtitle */}
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF0D4] border border-[#FFE0A3] shadow-xs mb-1.5">
                            <Star className="w-3 h-3 text-[#D97706] fill-[#D97706]" />
                            <span className="text-[10px] font-black text-[#B45309] uppercase tracking-wider">
                                Handpicked
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#102033] tracking-tight leading-tight mb-1">
                            Featured Hostels
                        </h2>
                        <p className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed">
                            Top-rated PGs and hostels in {currentCity}, chosen for your comfort and convenience.
                        </p>
                    </div>

                    {/* Right: Handwritten Callout + View All Link */}
                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-end">
                        {/* Callout */}
                        <div className="hidden sm:flex items-center gap-1.5">
                            <svg className="w-7 h-3 text-[#00796F]" viewBox="0 0 32 16" fill="none">
                                <path d="M2 14C12 4 22 2 30 10M30 10L24 6M30 10L28 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-[11.5px] font-semibold text-[#00796F] italic font-serif whitespace-nowrap">
                                Our top picks for you
                            </span>
                        </div>

                        {/* View All */}
                        <button
                            onClick={() => router.push('/pghostels/listings/all')}
                            className="inline-flex items-center gap-1 text-[#00796F] hover:text-[#005a53] font-bold text-xs sm:text-sm transition-colors py-1 pl-1"
                        >
                            <span>View All</span>
                            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                        </button>
                    </div>
                </div>

                {/* Carousel Row with 5 Columns filling desktop width */}
                <div className="relative group/feat">
                    {/* Left Button */}
                    <button
                        onClick={() => scroll('left')}
                        aria-label="Previous featured hostels"
                        className="hidden md:flex absolute -left-3.5 lg:-left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-[#102033] hover:text-[#00796F] shadow-md border border-[#E2E8F0] items-center justify-center z-20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    {/* Right Button */}
                    <button
                        onClick={() => scroll('right')}
                        aria-label="Next featured hostels"
                        className="hidden md:flex absolute -right-3.5 lg:-right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#00796F] text-white hover:bg-[#00695C] shadow-md items-center justify-center z-20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    {/* Cards Track: 5 cards filling desktop width */}
                    <div
                        ref={scrollContainerRef}
                        className="flex lg:grid lg:grid-cols-5 gap-3 sm:gap-3.5 overflow-x-auto lg:overflow-visible scrollbar-hide py-1 px-0.5 scroll-smooth"
                    >
                        {loading && !hasData ? (
                            [...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-[72vw] xs:w-[65vw] sm:w-[42vw] md:w-[28vw] lg:w-auto h-[310px] sm:h-[320px] rounded-2xl bg-[#F0EBE1] animate-pulse shrink-0"
                                />
                            ))
                        ) : (
                            displayListings.map((listing, index) => {
                                const hostelId = listing._id || `feat-${index}`;
                                const hostelSlug = listing.slug || listing.hostelSlug || hostelId;
                                const hostelName = listing.hostelName || 'Featured Stay';
                                const hostelArea = listing.address || listing.cityName || 'Hyderabad';
                                const price = listing.startingAt || listing.defaultPrice || 5500;
                                const rating = listing.rating || 4.5;
                                const hostelImage = listing.image?.startsWith('http') || listing.image?.startsWith('/')
                                    ? listing.image
                                    : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${listing.image}`;
                                const isClickable = !listing.isFallback;

                                return (
                                    <motion.div
                                        key={hostelId}
                                        whileHover={{ y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        onClick={() => {
                                            if (isClickable) {
                                                router.push(`/pghostels/hostel/${hostelSlug}`);
                                            } else {
                                                router.push('/pghostels/listings/all');
                                            }
                                        }}
                                        className="w-[72vw] xs:w-[65vw] sm:w-[42vw] md:w-[28vw] lg:w-auto h-[310px] sm:h-[320px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-[0_4px_16px_rgba(16,32,51,0.08)] hover:shadow-[0_10px_24px_rgba(0,121,111,0.18)] transition-all duration-300 shrink-0 bg-[#0F1E2E]"
                                    >
                                        {/* Image */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                            style={{ backgroundImage: `url("${hostelImage}")` }}
                                        />

                                        {/* Dark Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1522] via-[#0B1522]/55 to-black/20 opacity-95" />

                                        {/* Top Badges */}
                                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                                            {/* Featured Pill (Orange) with Star icon */}
                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF7A18] text-white shadow-xs">
                                                <Star className="w-2.5 h-2.5 text-white fill-white" />
                                                <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Featured</span>
                                            </div>

                                            {/* Rating Pill */}
                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 shadow-sm">
                                                <Star className="w-2.5 h-2.5 text-[#FFB800] fill-[#FFB800]" />
                                                <span className="text-[10.5px] font-black text-[#102033]">
                                                    {Number(rating).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content at Bottom */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-3.5 z-10">
                                            {/* Amenities */}
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <div className="w-5.5 h-5.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90">
                                                    <Wifi className="w-2.5 h-2.5" />
                                                </div>
                                                <div className="w-5.5 h-5.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90">
                                                    <Bed className="w-2.5 h-2.5" />
                                                </div>
                                                <div className="w-5.5 h-5.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90">
                                                    <Utensils className="w-2.5 h-2.5" />
                                                </div>
                                            </div>

                                            {/* Hostel Name */}
                                            <h3 className="text-[13px] sm:text-[13.5px] font-extrabold text-white mb-0.5 line-clamp-1 leading-snug tracking-tight uppercase group-hover:text-[#4ddecb] transition-colors">
                                                {hostelName}
                                            </h3>

                                            {/* Location */}
                                            <div className="flex items-center text-white/75 text-[10.5px] mb-2">
                                                <MapPin className="w-2.5 h-2.5 mr-1 text-[#4ddecb] shrink-0" />
                                                <span className="truncate">{hostelArea}</span>
                                            </div>

                                            {/* Bottom Divider & Price */}
                                            <div className="flex items-center justify-between pt-2 border-t border-white/15">
                                                <div className="flex flex-col">
                                                    <span className="text-[8.5px] text-white/60 uppercase tracking-wider font-semibold leading-none mb-0.5">Starts at</span>
                                                    <span className="text-sm sm:text-base font-black text-white leading-tight">
                                                        ₹{Number(price).toLocaleString('en-IN')}/-
                                                    </span>
                                                </div>

                                                <div className="w-7 h-7 rounded-full bg-white text-[#00796F] group-hover:bg-[#00796F] group-hover:text-white flex items-center justify-center shadow-md transition-all">
                                                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}