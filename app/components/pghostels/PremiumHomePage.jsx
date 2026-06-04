'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useScroll, useInView, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
    MapPin, Search, Users, Home, Bed, Sparkles, Star, ChevronRight,
    Wifi, Utensils, Shirt, Check, TrendingUp, Shield, Clock, Heart
} from 'lucide-react';
import { Input } from '@/components/pghostels/ui/input';
import { QuestionnaireModal } from '@/components/pghostels/QuestionnaireModal';
import { useLocationContext } from '@/context/LocationContext';
import { NearbyHostelsSection } from './NearbyHostelsSection';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/app`;
const SERVICE_ID = '69524fb157bb211ca094e5ee'; // PG Hostels Service ID

const getImageUrl = (image) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${image}`;
};

const testimonials = [
    { name: 'Priya Sharma', role: 'Software Engineer', review: 'Found my perfect PG in just 2 days! The verification process gave me confidence.', avatar: '👩‍💼', rating: 5 },
    { name: 'Rahul Kumar', role: 'Student', review: 'Great amenities and transparent pricing. Highly recommended!', avatar: '👨‍🎓', rating: 5 },
    { name: 'Sneha Patel', role: 'Designer', review: 'The co-living space is amazing. Made so many new friends here.', avatar: '👩‍🎨', rating: 5 },
];



export function PremiumHomePage() {
    const router = useRouter();
    const { location, detectWithGPS } = useLocationContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState({ id: '', name: '' });
    const [featuredHostels, setFeaturedHostels] = useState([]);
    const [apiCategories, setApiCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { scrollY } = useScroll();
    const heroRef = useRef(null);
    const categoriesRef = useRef(null);
    const isHeroInView = useInView(heroRef, { once: true });
    const isCategoriesInView = useInView(categoriesRef, { once: true });

    const [searchQuery, setSearchQuery] = useState('');
    const [heroSlideIndex, setHeroSlideIndex] = useState(0);
    const [globalSettings, setGlobalSettings] = useState(null);

    useEffect(() => {
        if (apiCategories.length > 0) {
            const timer = setInterval(() => {
                setHeroSlideIndex((prev) => (prev + 1) % apiCategories.length);
            }, 4000);
            return () => clearInterval(timer);
        }
    }, [apiCategories.length]);


    const handleSearch = useCallback(() => {
        if (searchQuery.trim()) {
            router.push(`/pghostels/listings/all?query=${encodeURIComponent(searchQuery)}`);
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

    const handleCategoryClick = useCallback((categoryId, categoryName, categorySlug) => {
        if (categorySlug) {
            router.push(`/pghostels/${categorySlug}`);
        } else {
            console.warn('Category slug is missing');
        }
    }, [router]);

    const scrollToCategories = useCallback(() => {
        categoriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        <div className="min-h-screen bg-[#E2E6E6] overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />
            {/* Subtle static background accent */}
            <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-[#037166]/3 via-transparent to-[#037166]/5" />

            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-[70vh] flex items-center pt-20">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#037166]/5 to-transparent" />

                <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 grid md:grid-cols-2 gap-6 md:gap-8 items-center relative z-10">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
                        className="space-y-4"
                    >
                        <div className="space-y-3 sm:space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.2 }}
                                className="inline-block"
                            >
                                <div className="px-3 py-1.5 sm:px-4 sm:py-1.5 bg-gradient-to-r from-[#037166]/20 to-transparent border border-[#037166]/30 rounded-full backdrop-blur-sm">
                                    <h6 className="text-[#037166] text-xs sm:text-sm font-semibold">✨ Find Your Perfect Stay</h6>
                                </div>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.3 }}
                                className="text-[2.75rem] sm:text-4xl md:text-5xl font-bold leading-[0.98]"
                            >
                                <span className="bg-gradient-to-r from-gray-900 to-[#037166] bg-clip-text text-transparent">
                                    Find your next stay
                                </span>
                                <span>{" "}</span>
                                <span className="text-gray-900">in minutes.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.4 }}
                                className="text-base sm:text-lg text-gray-600 leading-relaxed"
                            >
                                Verified PGs, co-living spaces, and hostels near your college or office.
                            </motion.p>

                            <section className="relative md:-mt-4 mt-0 z-20">
                                <div className="max-w-4xl px-1">
                                    <div className="flex flex-col md:flex-row items-center gap-2.5">
                                                {/* Search Bar */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    className="flex-1 bg-white/40 md:bg-white/80 backdrop-blur-2xl rounded-2xl shadow-xl border border-gray-200 p-2 w-full"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 relative">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <Input
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                onKeyDown={handleKeyDown}
                                                                placeholder="Search by area, college, landmark..."
                                                                className="pl-10 h-9 sm:h-10 bg-white/30 md:bg-white/50 border-transparent focus:border-[#037166] text-sm text-black placeholder:text-gray-500 rounded-xl"
                                                            />
                                                        </div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handleSearch}
                                                            className="px-4 py-2 bg-gradient-to-r from-[#037166] to-[#025951] text-white rounded-xl font-semibold shadow-lg shadow-[#037166]/20 text-sm hidden sm:block"
                                                        >
                                                            Search
                                                        </motion.button>
                                                    </div>
                                                </motion.div>

                                                {/* Explore PGs Button - Beside Search Bar */}
                                                <motion.button
                                                    initial={{ opacity: 0, x: 20 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(3, 113, 102, 0.3)" }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => router.push('/pghostels/listings/all')}
                                                    className="px-5 py-2 bg-[#037166] text-white rounded-2xl font-bold shadow-xl shadow-[#037166]/30 flex items-center gap-2 whitespace-nowrap h-[46px] text-sm"
                                                >
                                                    <span>Explore PGs</span>
                                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </motion.button>
                                    </div>

                                    {/* App Buttons below search bar */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                                        transition={{ delay: 0.5 }}
                                        className="flex flex-wrap justify-center sm:justify-start gap-2.5 mt-4"
                                    >
                                        <motion.a
                                            href={globalSettings?.appStore || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center justify-center w-28 xs:w-36 md:w-32 h-10 xs:h-11 md:h-11 bg-gradient-to-r from-[#037166] to-[#025951] rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden border border-white/10"
                                            title="Download on the App Store"
                                        >
                                            <img src="/apple2.png" alt="App Store" className="h-full w-full object-cover brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" loading="lazy" decoding="async" />
                                        </motion.a>

                                        <motion.a
                                            href={globalSettings?.playStore || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center justify-center w-28 xs:w-36 md:w-32 h-10 xs:h-11 md:h-11 bg-gradient-to-r from-[#037166] to-[#025951] rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden border border-white/10"
                                            title="Get it on Google Play"
                                        >
                                            <img src="/andriod1.png" alt="Google Play" className="h-full w-full object-cover brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" loading="lazy" decoding="async" />
                                        </motion.a>
                                    </motion.div>
                                </div>
                            </section>
                        </div>

                        {/* Trust Badges */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={isHeroInView ? { opacity: 1 } : {}}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap gap-3 sm:gap-4 pt-1"
                        >
                            {[
                                { icon: Shield, text: 'Verified Listings' },
                                { icon: Clock, text: 'Instant Booking' },
                                { icon: TrendingUp, text: 'No Brokerage' },
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center space-x-2 text-gray-600">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#037166]/10 rounded-full flex items-center justify-center">
                                        <badge.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#037166]" />
                                    </div>
                                    <h6 className="text-xs sm:text-sm font-medium">{badge.text}</h6>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right - Animated Card Collage */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
                        className="relative h-[390px] md:h-[470px] flex items-center justify-center p-3 md:p-4"
                    >
                        {/* Main Card Slider */}
                        <motion.div
                            className="relative w-56 md:w-72 h-[340px] md:h-[430px] rounded-[2.75rem] overflow-hidden shadow-2xl z-10 bg-gray-900"
                            animate={{
                                y: [0, -15, 0],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={heroSlideIndex}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.8 }}
                                    className="absolute inset-0"
                                >
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] hover:scale-110"
                                        style={{
                                            backgroundImage: (apiCategories[heroSlideIndex]?.category_image || apiCategories[heroSlideIndex]?.image)
                                                ? `url("${getImageUrl(apiCategories[heroSlideIndex]?.category_image || apiCategories[heroSlideIndex]?.image)}")`
                                                : 'none'
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    {/* Category Info Overlay */}
                                    <div className="absolute bottom-10 left-8 right-8">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="space-y-2"
                                        >
                                            <div className="w-12 h-1 bg-[#037166] rounded-full" />
                                            <h3 className="text-3xl font-bold text-white mb-1">
                                                {apiCategories.length > 0 ? apiCategories[heroSlideIndex]?.name : 'Modern Stay'}
                                            </h3>
                                            <div className="flex items-center text-white/80 text-sm">
                                                <Users className="w-4 h-4 mr-2" />
                                                <span>Verified Listings</span>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        {/* Floating Price Card */}
                        <motion.div initial={false}
                            className="absolute top-12 left-0 md:-left-8 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/50 z-20 pointer-events-none"
                            animate={{
                                y: [0, 10, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                            }}
                        >
                            <div className="text-sm text-gray-500 font-medium">Starting from</div>
                            <div className="text-3xl font-bold text-[#037166]">₹8,500</div>
                            <div className="text-xs text-gray-400">/month</div>
                        </motion.div>

                        {/* Floating Rating Card */}
                        <motion.div initial={false}
                            className="absolute bottom-12 right-0 md:-right-8 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/50 z-20 pointer-events-none"
                            animate={{
                                y: [0, -10, 0],
                            }}
                            transition={{
                                duration: 4.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1
                            }}
                        >
                            <div className="flex items-center space-x-2">
                                <div className="p-1 bg-amber-100 rounded-lg">
                                    <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
                                </div>
                                <span className="text-2xl font-bold text-gray-900">4.8</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2 font-medium flex items-center">
                                <MapPin className="w-3 h-3 mr-1 text-[#037166]" />
                                0.8 km away
                            </div>
                        </motion.div>

                        {/* Glow Effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#037166]/10 blur-[120px] rounded-full pointer-events-none" />
                    </motion.div>
                </div>
            </section>

            {/* Quick Search Strip */}


            {/* Featured Categories Grid */}
           <section ref={categoriesRef} className="py-15 relative">
  <div className="max-w-7xl mx-auto px-4">

    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12"
    >
      <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
        Browse by lifestyle
      </h2>
      <p className="text-lg md:text-xl text-gray-600">
        Choose what fits your comfort & budget
      </p>
    </motion.div>

    {/* Container */}
    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 px-1 md:px-0 hide-scrollbar scroll-smooth">

      {loading ? (
        [...Array(4)].map((_, i) => (
          <div
            key={i}
            className="relative h-80 min-w-[260px] md:min-w-0 rounded-3xl overflow-hidden bg-gray-200 animate-pulse"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-300 to-gray-200" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <div className="w-14 h-14 bg-gray-300 rounded-2xl mb-4" />
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
        ))
      ) : (
        apiCategories.map((cat, i) => {
          const bgImage = cat.image
            ? getImageUrl(cat.image)
            : cat.categoryIcon
            ? getImageUrl(cat.categoryIcon)
            : '';

          const iconImg = cat.categoryIcon
            ? getImageUrl(cat.categoryIcon)
            : null;

          return (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -12, scale: 1.03 }}
              onClick={() => handleCategoryClick(cat._id, cat.name, cat.slug)}
              className="group cursor-pointer relative h-96 min-w-[260px] md:min-w-0 rounded-[2.5rem] overflow-hidden shadow-xl snap-start"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `url("${bgImage}")`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                {/* Category Icon */}
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#037166] group-hover:border-[#037166] group-hover:scale-110 transition-all duration-300 shadow-lg overflow-hidden">
                  {iconImg ? (
                    <img loading="lazy" decoding="async"
                      src={iconImg}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-2xl"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <Users className="w-8 h-8 text-white" />
                  )}
                </div>

                <h4 className="text-xl font-bold text-white mb-3 tracking-tight">
                  {cat.name}
                </h4>

                <div className="h-1 w-12 bg-[#037166] rounded-full group-hover:w-24 transition-all duration-300" />
              </div>

              {/* Hover Border Glow */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#037166]/50 rounded-[2.5rem] transition-colors duration-300" />
            </motion.div>
          );
        })
      )}

    </div>
  </div>
</section>

            {/* Near You Section */}
            <NearbyHostelsSection router={router} />

            {/* Top Deals Section */}
            <TopDealsSection router={router} />

            {/* How It Works */}
            <HowItWorksSection />

            {/* Testimonials */}
            {/* <TestimonialsSection testimonials={testimonials} /> */}

            {/* Featured Hostels */}
            <FeaturedHostelsSection listings={featuredHostels} loading={loading} router={router} />

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


// Top Deals Section
function TopDealsSection({ router }) {
    const deals = [
        {
            title: 'Zero Deposit Options',
            desc: 'Move in without hefty deposits',
            gradient: 'from-purple-500 to-pink-500',
            icon: '🏠',
        },
        {
            title: 'Without Meals PGs',
            desc: 'Home-cooked food included',
            gradient: 'from-orange-500 to-red-500',
            icon: '🍽️',
        },
        {
            title: 'Best for Professionals',
            desc: 'Premium co-working spaces',
            gradient: 'from-blue-500 to-cyan-500',
            icon: '💼',
        },
    ];

    return (
        <section className="py-15 bg-transparent">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-black mb-2">
                        Top Deals
                    </h2>
                    <p className="text-xl text-gray-600">Exclusive offers just for you</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {deals.map((deal, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className={`relative h-50 rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-br ${deal.gradient} p-8 flex flex-col justify-between`}
                        >
                            <div>
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="text-6xl mb-4"
                                >
                                    {deal.icon}
                                </motion.div>
                                <h4 className="text-2xl font-bold text-white mb-2">{deal.title}</h4>
                                <p className="text-white/90">{deal.desc}</p>
                            </div>
                            {/* <button className="self-start px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-colors border border-white/30">
                                Explore
                            </button> */}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// How It Works Section
function HowItWorksSection() {
    const steps = [
        { icon: Search, title: 'Select Category', desc: 'Choose your Preferred type of stay' },
        { icon: Star, title: 'Compare PGs & Hostels', desc: 'View Room Images, Amenities, and Prices' },
        { icon: Check, title: 'Book & Move In', desc: 'Confirm booking and move in hassle-free' },
    ];

    return (
<section className="py-14 md:py-24 bg-transparent">
  <div className="max-w-7xl mx-auto px-4">

    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-10 md:mb-16"
    >
      <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
        Book in 3 simple steps
      </h2>
    </motion.div>

    {/* Steps */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.2 }}
          className="text-center relative"
        >

          {/* Icon */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#037166] to-[#025951] rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg shadow-[#037166]/30"
          >
            <step.icon className="w-7 h-7 md:w-10 md:h-10 text-white" />
          </motion.div>

          {/* Title */}
          <h4 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-3">
            {step.title}
          </h4>

          {/* Description */}
          <p className="text-gray-600 text-sm md:text-base max-w-xs mx-auto">
            {step.desc}
          </p>

          {/* Desktop connector line */}
          {i < steps.length - 1 && (
            <div className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] bg-gradient-to-r from-[#037166]/30 to-transparent" />
          )}

        </motion.div>
      ))}

    </div>

  </div>
</section>
    );
}

// Testimonials Section
function TestimonialsSection({ testimonials }) {
    // Double the testimonials for seamless infinite loop
    const doubledTestimonials = [...testimonials, ...testimonials, ...testimonials];

    return (
        <section className="py-15 overflow-hidden bg-transparent relative">
            <div className="max-w-7xl mx-auto px-4 mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Why users love us
                    </h2>
                    <p className="text-xl text-gray-600">Join thousands of happy residents</p>
                </motion.div>
            </div>

            {/* Marquee Container */}
            <div className="flex relative overflow-hidden group">
                {/* Initial Scroller */}
                <motion.div
                    animate={{
                        x: [0, -1920], // Adjust based on content width
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="flex gap-6 whitespace-nowrap"
                >
                    {doubledTestimonials.map((test, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-[400px] bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#037166] to-[#025951] rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-[#037166]/20">
                                    {test.avatar}
                                </div>
                                <div>
                                    <h5 className="font-bold text-gray-900 whitespace-normal">{test.name}</h5>
                                    <p className="text-sm text-gray-500">{test.role}</p>
                                </div>
                            </div>
                            <div className="flex mb-4">
                                {[...Array(test.rating)].map((_, j) => (
                                    <Star key={j} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                                ))}
                            </div>
                            <p className="text-gray-700 leading-relaxed whitespace-normal italic">"{test.review}"</p>
                            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center text-sm text-[#037166] font-medium">
                                <div className="w-2 h-2 bg-[#037166] rounded-full mr-2" />
                                <span>Verified Resident</span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Fading Edges Overlay */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#E2E6E6] to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#E2E6E6] to-transparent z-10" />
        </section>
    );
}

// Featured Hostels Section
function FeaturedHostelsSection({ listings, loading, router }) {
    const fallbackListings = [
        {
            _id: 'fallback-1',
            hostelName: 'Premium Student Living',
            address: 'North Campus, Delhi',
            defaultPrice: '12500',
            image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2070&auto=format&fit=crop',
            rating: 4.8,
            reviews: 120,
            isFallback: true
        },
        {
            _id: 'fallback-2',
            hostelName: 'Urban Co-living Space',
            address: 'Koramangala, Bangalore',
            defaultPrice: '15000',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
            rating: 4.5,
            reviews: 85,
            isFallback: true
        },
        {
            _id: 'fallback-3',
            hostelName: 'Elite Ladies Hostel',
            address: 'Hitech City, Hyderabad',
            defaultPrice: '11000',
            image: 'https://images.unsplash.com/photo-1626015504767-542e58e4585c?q=80&w=1956&auto=format&fit=crop',
            rating: 4.9,
            reviews: 200,
            isFallback: true
        },
        {
            _id: 'fallback-4',
            hostelName: 'Scholars Inn',
            address: 'Anna Nagar, Chennai',
            defaultPrice: '9500',
            image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop',
            rating: 4.2,
            reviews: 50,
            isFallback: true
        }
    ];

    const hasData = listings && listings.length > 0;
    const displayListings = hasData ? listings.slice(0, 12) : fallbackListings;

    return (
        <section className="py-12 bg-transparent">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex justify-between items-end mb-8"
                >
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">
                            Featured Hostels
                        </h2>
                        <p className="text-lg text-gray-600">Handpicked stays for you</p>
                    </div>
                    <button
                        onClick={() => router.push('/pghostels/listings/all')}
                        className="hidden md:flex items-center space-x-2 text-[#037166] font-semibold hover:text-[#025951] transition-colors"
                    >
                        <span>View All</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </motion.div>

                <div className="relative">
                    <div className="overflow-x-auto px-1 md:px-0 scrollbar-hide pb-4 -mx-1 px-1">
                        <div className="flex gap-3 md:gap-4 pb-2">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-gray-200 rounded-[1.5rem] h-[25rem] min-w-[280px] md:min-w-0 flex-shrink-0 animate-pulse" />
                                ))
                            ) : (
                                displayListings.map((listing, i) => {
                                    const hostelId = listing._id;
                                    const hostelSlug = listing.slug || listing.hostelSlug || hostelId;
                                    const hostelName = listing.hostelName;
                                    const hostelArea = listing.address || listing.cityName;
                                    const hostelPrice = listing.startingAt || (listing.defaultPrice ? parseInt(listing.defaultPrice) : 8500);
                                    const hostelImage = listing.image?.startsWith('http')
                                        ? listing.image
                                        : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${listing.image}`;
                                    const isClickable = !listing.isFallback;

                                    return (
                                        <motion.div
                                            key={hostelId}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            whileHover={isClickable ? { y: -8 } : {}}
                                            onClick={() => isClickable && router.push(`/pghostels/hostel/${hostelSlug}`)}
                                            className={`group relative rounded-[1.5rem] overflow-hidden h-[25rem] w-[85vw] sm:w-[45vw] md:w-[30vw] lg:w-[calc((100%-80px)/6)] flex-shrink-0 snap-start bg-white shadow-md ${isClickable ? 'cursor-pointer' : ''}`}
                                        >
                                            <div className="absolute inset-0">
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-110"
                                                    style={{ backgroundImage: `url("${hostelImage}")` }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent opacity-90" />
                                            </div>

                                            <div className="absolute inset-0 p-5 flex flex-col justify-between">
                                                <div className="flex justify-between items-start">
                                                    <div className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-full">
                                                        <span className="text-white text-[10px] font-semibold tracking-wide uppercase">Featured</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex gap-1.5 mb-3">
                                                        {[Wifi, Utensils, Shirt].map((Icon, j) => (
                                                            <div key={j} className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90">
                                                                 <Icon className="w-3.5 h-3.5" />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <h3 className="text-base font-bold text-white mb-1 line-clamp-2 uppercase tracking-wide leading-tight">{hostelName}</h3>
                                                    <div className="flex items-center text-white/70 text-[11px] mb-4">
                                                        <MapPin className="w-3.5 h-3.5 mr-1" />
                                                        <span className="truncate">{hostelArea}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-3 border-t border-white/20">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-white/60 uppercase">Starts at</span>
                                                            <span className="text-xl font-bold text-white">₹{Number(hostelPrice || 0).toLocaleString()}/-</span>
                                                        </div>
                                                        <div className="w-10 h-10 bg-white text-[#037166] rounded-full flex items-center justify-center group-hover:bg-[#037166] group-hover:text-white transition-all shadow-lg">
                                                            <ChevronRight className="w-5 h-5" />
                                                        </div>
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
            </div>
        </section>
    );
}


