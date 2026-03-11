'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
    MapPin, Search, Users, Home, Bed, Sparkles, Star, ChevronRight,
    Wifi, Utensils, Shirt, Check, TrendingUp, Shield, Clock, Heart
} from 'lucide-react';
import { Input } from '@/components/pghostels/ui/input';
import { QuestionnaireModal } from '@/components/pghostels/QuestionnaireModal';
import { useLocationContext } from '@/context/LocationContext';
import { NearbyHostelsSection } from './NearbyHostelsSection';

const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi/app';
const SERVICE_ID = '69524fb157bb211ca094e5ee'; // PG Hostels Service ID

const testimonials = [
    { name: 'Priya Sharma', role: 'Software Engineer', review: 'Found my perfect PG in just 2 days! The verification process gave me confidence.', avatar: '👩‍💼', rating: 5 },
    { name: 'Rahul Kumar', role: 'Student', review: 'Great amenities and transparent pricing. Highly recommended!', avatar: '👨‍🎓', rating: 5 },
    { name: 'Sneha Patel', role: 'Designer', review: 'The co-living space is amazing. Made so many new friends here.', avatar: '👩‍🎨', rating: 5 },
];

// Helper to get the best image for the category
const getCategoryImage = (categoryName, apiImage) => {
    if (!categoryName) return 'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?q=80&w=2070&auto=format&fit=crop';

    const name = categoryName.toLowerCase();
    const images = {
        'boys': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop',
        'girls': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop',
        'womens': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop',
        'women': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop',
        'mens': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop',
        'men': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop',
        'co-living': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
        'dorm': 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2070&auto=format&fit=crop',
        'food': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1980&auto=format&fit=crop',
    };

    for (const [key, url] of Object.entries(images)) {
        if (name.includes(key)) return url;
    }

    if (apiImage) {
        return apiImage.startsWith('http') ? apiImage : `https://api.doorstephub.com/${apiImage}`;
    }

    return 'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?q=80&w=2070&auto=format&fit=crop';
};

export function PremiumHomePage() {
    const router = useRouter();
    const { location, detectWithGPS } = useLocationContext();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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

    useEffect(() => {
        if (apiCategories.length > 0) {
            const timer = setInterval(() => {
                setHeroSlideIndex((prev) => (prev + 1) % apiCategories.length);
            }, 4000);
            return () => clearInterval(timer);
        }
    }, [apiCategories.length]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/pghostels/listings/all?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

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

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Get service ID from localStorage
                const selectedService = localStorage.getItem('selectedService');
                let serviceId = SERVICE_ID; // Default fallback

                if (selectedService) {
                    try {
                        const serviceData = JSON.parse(selectedService);
                        serviceId = serviceData.id || SERVICE_ID;
                    } catch (e) {
                        console.log('Using default service ID');
                    }
                }

                const response = await fetch(`${API_BASE_URL}/professional-services-flow/public/categories`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        serviceId: serviceId
                    })
                });
                const data = await response.json();
                if (data.success && data.category) {
                    setApiCategories(data.category);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const parallaxY = useTransform(scrollY, [0, 500], [0, 150]);
    const parallaxYSpring = useSpring(parallaxY, { stiffness: 100, damping: 30 });

    const handleCategoryClick = (categoryId, categoryName) => {
        setSelectedCategory({ id: categoryId, name: categoryName });
        setIsModalOpen(true);
    };

    const scrollToCategories = () => {
        categoriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="min-h-screen bg-[#E2E6E6] overflow-hidden">
            {/* Floating Particles Background */}
            <div className="fixed inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-[#037166]/20 rounded-full"
                        animate={{
                            x: [Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920), Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920)],
                            y: [Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080), Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)],
                        }}
                        transition={{
                            duration: Math.random() * 20 + 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center pt-20">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#037166]/5 to-transparent" />

                <div className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center relative z-10">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
                        className="space-y-8"
                    >
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.2 }}
                                className="inline-block"
                            >
                                <div className="px-4 py-2 bg-gradient-to-r from-[#037166]/20 to-transparent border border-[#037166]/30 rounded-full backdrop-blur-sm">
                                    <h6 className="text-[#037166] text-sm font-semibold">✨ Find Your Perfect Stay</h6>
                                </div>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.3 }}
                                className="text-5xl md:text-7xl font-bold leading-tight"
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
                                className="text-xl text-gray-600 leading-relaxed"
                            >
                                Verified PGs, co-living spaces, and hostels near your college or office.
                            </motion.p>
                            <section className="relative md:-mt-20 mt-0 z-20">
                                <div className="max-w-2xl mr-10 px-1">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="bg-white/40 md:bg-white/80 backdrop-blur-2xl rounded-2xl shadow-xl border border-gray-200 p-3 max-w-4xl mx-auto"
                                    >
                                        <div className="flex flex-wrap items-center gap-3">
                                            {/* Search Input */}
                                            <div className="flex-1 min-w-[250px] relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="Search by area, college, landmark..."
                                                    className="pl-10 h-12 bg-white/30 md:bg-white/50 border-gray-200 focus:border-[#037166] text-sm text-black placeholder:text-gray-500 rounded-xl"
                                                />
                                            </div>

                                            {/* Filter Chips */}
                                            {/* <div className="flex flex-wrap gap-1.5 hidden md:flex">
                                {['Boys', 'Girls', 'Co-living', 'Dorm', 'With Food'].map((chip, i) => (
                                    <motion.button
                                        key={chip}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ scale: 0.95 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="px-3 py-1.5 bg-gray-100 hover:bg-[#037166] hover:text-white text-gray-700 rounded-lg text-xs font-medium transition-all"
                                    >
                                        {chip}
                                    </motion.button>
                                ))}
                            </div> */}

                                            {/* Search Button */}
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleSearch}
                                                className="px-6 py-2.5 bg-gradient-to-r from-[#037166] to-[#025951] text-white rounded-xl font-semibold shadow-lg shadow-[#037166]/20 text-sm"
                                            >
                                                Search
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </div>
                            </section>
                        </div>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.5 }}
                            className="flex flex-wrap gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(3, 113, 102, 0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/pghostels/listings/all')}
                                className="px-8 py-4 bg-gradient-to-r from-[#037166] to-[#025951] text-white rounded-2xl font-semibold shadow-2xl shadow-[#037166]/50 flex items-center space-x-2"
                            >
                                <span>Explore PGs</span>
                                <ChevronRight className="w-5 h-5" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={async () => {
                                    try {
                                        await detectWithGPS();
                                    } catch (err) {
                                        console.log('Location detection failed');
                                    } finally {
                                        setSelectedCategory({ id: '', name: '' });
                                        setIsModalOpen(true);
                                    }
                                }}
                                className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-900 rounded-2xl font-semibold hover:border-[#037166] transition-all flex items-center space-x-2"
                            >
                                <MapPin className="w-5 h-5 text-[#037166]" />
                                <span>Near Me</span>
                            </motion.button>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={isHeroInView ? { opacity: 1 } : {}}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap gap-6 pt-4"
                        >
                            {[
                                { icon: Shield, text: 'Verified Listings' },
                                { icon: Clock, text: 'Instant Booking' },
                                { icon: TrendingUp, text: 'No Brokerage' },
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center space-x-2 text-gray-600">
                                    <div className="w-10 h-10 bg-[#037166]/10 rounded-full flex items-center justify-center">
                                        <badge.icon className="w-5 h-5 text-[#037166]" />
                                    </div>
                                    <h6 className="text-sm font-medium">{badge.text}</h6>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right - Animated Card Collage */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
                        className="relative h-[550px] md:h-[650px] flex items-center justify-center p-6"
                        style={{
                            transform: typeof window !== 'undefined' ? `perspective(1000px) rotateY(${(mousePosition.x - window.innerWidth / 2) / 60}deg) rotateX(${-(mousePosition.y - window.innerHeight / 2) / 60}deg)` : 'none'
                        }}
                    >
                        {/* Main Card Slider */}
                        <motion.div
                            className="relative w-80 md:w-96 h-[450px] md:h-[550px] rounded-[2.5rem] overflow-hidden shadow-2xl z-10 bg-gray-900"
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
                                            backgroundImage: `url("${apiCategories.length > 0 ? getCategoryImage(apiCategories[heroSlideIndex]?.name, apiCategories[heroSlideIndex]?.image) : 'https://images.unsplash.com/photo-1617430690223-3e165b390e25?auto=format&fit=crop&q=80&w=1080'}")`
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
                        <motion.div
                            className="absolute top-12 left-0 md:-left-8 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/50 z-20"
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
                        <motion.div
                            className="absolute bottom-12 right-0 md:-right-8 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/50 z-20"
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
          const bgImage = getCategoryImage(cat.name, cat.image);

          return (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -12, scale: 1.03 }}
              onClick={() => handleCategoryClick(cat._id, cat.name)}
              className="group cursor-pointer relative h-96 min-w-[260px] md:min-w-0 rounded-[2.5rem] overflow-hidden shadow-xl snap-start"
            >

              {/* Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `url("${bgImage}")`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">

                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#037166] group-hover:border-[#037166] group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
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

// Near You Section Component
function NearYouSection({ listings, router }) {
    const scrollRef = useRef(null);

    return (
        <section className="py-24 bg-gradient-to-b from-transparent to-gray-50/50">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        Available near you
                    </h2>
                    <p className="text-xl text-gray-600">Top rated stays in your selected location</p>
                </motion.div>

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {listings.map((listing, i) => (
                        <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -10, rotateY: 5 }}
                            onClick={() => router.push(`/pghostels/hostel-detail/${listing.id}`)}
                            className="group flex-shrink-0 w-80 snap-start cursor-pointer"
                        >
                            <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100">
                                {/* Image */}
                                <div className="relative h-56 overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                                        style={{ backgroundImage: `url(${listing.image})` }}
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1">
                                        <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                                        <span className="font-semibold text-sm">{listing.rating}</span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-[#037166] text-white px-3 py-1 rounded-full text-sm font-medium">
                                        {listing.distance} km away
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h4 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#037166] transition-colors">
                                        {listing.name}
                                    </h4>
                                    <p className="text-gray-600 text-sm mb-4 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {listing.area}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-3xl font-bold text-gray-900">₹{listing.price.toLocaleString()}</span>
                                            <span className="text-gray-500 text-sm">/month</span>
                                        </div>
                                        <button className="px-6 py-2 bg-[#037166] text-white rounded-xl font-medium hover:bg-[#025951] transition-colors">
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
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
    const displayListings = hasData ? listings.slice(0, 4) : fallbackListings;

    return (
        <section className="py-24 bg-transparent">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex justify-between items-end mb-12"
                >
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                            Featured Hostels
                        </h2>
                        <p className="text-xl text-gray-600">Handpicked stays for you</p>
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
                    <div className="overflow-x-auto px-4 md:px-0 scrollbar-hide pb-8">
                        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 min-w-max md:min-w-full">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-gray-200 rounded-[1.5rem] h-[30rem] min-w-[280px] md:min-w-0 flex-shrink-0 animate-pulse" />
                                ))
                            ) : (
                                displayListings.map((listing, i) => {
                                    const hostelId = listing._id;
                                    const hostelName = listing.hostelName;
                                    const hostelArea = listing.address || listing.cityName;
                                    const hostelPrice = listing.startingAt || 250;
                                    const hostelImage = listing.image?.startsWith('http')
                                        ? listing.image
                                        : `https://api.doorstephub.com/${listing.image}`;
                                    const isClickable = !listing.isFallback;

                                    return (
                                        <motion.div
                                            key={hostelId}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            whileHover={isClickable ? { y: -5 } : {}}
                                            onClick={() => isClickable && router.push(`/pghostels/hostel-detail/${hostelId}`)}
                                            className={`group relative rounded-[1.5rem] overflow-hidden h-[30rem] min-w-[280px] md:min-w-0 flex-shrink-0 snap-start bg-white ${isClickable ? 'cursor-pointer' : ''}`}
                                        >
                                            <div className="absolute inset-0">
                                                <div
                                                    className="absolute inset-0 bg-[length:100%_auto] bg-top bg-no-repeat transition-all duration-700 group-hover:scale-105 group-hover:-translate-y-2"
                                                    style={{ backgroundImage: `url("${hostelImage}")` }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent opacity-90" />
                                            </div>

                                            <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                                <div className="flex justify-between items-start">
                                                    <div className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-full">
                                                        <span className="text-white text-sm font-semibold tracking-wide">Featured</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex gap-3 mb-6">
                                                        {[Wifi, Utensils, Shirt].map((Icon, j) => (
                                                            <div key={j} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90">
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <h3 className="text-base font-bold text-white mt-5 mb-1.5 leading-tight line-clamp-2 uppercase tracking-wide">{hostelName}</h3>
                                                    <div className="grid grid-cols-[auto_1fr] items-start text-white/70 text-[13px] mb-4">
                                                        <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                                                        <span className="line-clamp-2">{hostelArea}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t border-white/20">
                                                        <p className="text-white/60 text-sm italic">Starts at</p>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-3xl font-bold text-white">₹{hostelPrice.toLocaleString()}</span>
                                                            <span className="text-white/60 text-sm">/month</span>
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
