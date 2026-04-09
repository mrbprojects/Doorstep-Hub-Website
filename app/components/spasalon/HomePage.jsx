'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, Clock, Heart, ChevronRight, Sparkles, Award, Users, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QuestionnaireModal } from './QuestionnaireModal';
import { useLocationContext } from '@/context/LocationContext';
import Image from 'next/image';

const MOCK_CATEGORIES = [
    {
        _id: 'mock_haircut',
        name: 'Haircut & Styling',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwc2Fsb24lMjBzdHlsaW5nfGVufDF8fHx8MTc2ODY1MjY4N3ww&ixlib=rb-4.1.0&q=80&w=1080',
        icon: '✂️',
        description: 'Expert hair cutting & styling',
    },
    {
        _id: 'mock_facial',
        name: 'Facial & Skincare',
        image: 'https://images.unsplash.com/photo-1684014286330-ddbeb4a40c92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNpYWwlMjB0cmVhdG1lbnQlMjBza2luY2FyZXxlbnwxfHx8fDE3Njg1NTQxNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        icon: '✨',
        description: 'Glowing skin treatments',
    },
    {
        _id: 'mock_massage',
        name: 'Massage & Relaxation',
        image: 'https://images.unsplash.com/photo-1745327883508-b6cd32e5dde5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBtYXNzYWdlJTIwcmVsYXhhdGlvbnxlbnwxfHx8fDE3Njg2NTI2ODh8MA&ixlib=rb-4.1.0&q=80&w=1080',
        icon: '💆',
        description: 'Deep relaxation therapy',
    },
    {
        _id: 'mock_bridal',
        name: 'Bridal & Makeup',
        image: 'https://images.unsplash.com/photo-1625139108082-48bb424c2333?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkYWwlMjBtYWtldXAlMjBhcnRpc3R8ZW58MXx8fHwxNzY4NTQyNjYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
        icon: '💐',
        description: 'Perfect bridal looks',
    },
    {
        _id: 'mock_manicure',
        name: 'Manicure & Pedicure',
        image: 'https://images.unsplash.com/photo-1634235421135-16ebd88c13c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5pY3VyZSUyMHBlZGljdXJlJTIwbmFpbHN8ZW58MXx8fHwxNzY4NTcwMDcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        icon: '💅',
        description: 'Beautiful nail care',
    },
    {
        _id: 'mock_waxing',
        name: 'Waxing & Threading',
        image: 'https://images.unsplash.com/photo-1706973320004-98a2fe6ddb7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBzYWxvbiUyMHdheGluZ3xlbnwxfHx8fDE3Njg2NTI2ODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        icon: '🌿',
        description: 'Smooth skin solutions',
    },
];

export function HomePage() {
    const router = useRouter();
    const { location, detectWithIP } = useLocationContext();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [subcategories, setSubcategories] = useState([]);
    const [loadingSubcategories, setLoadingSubcategories] = useState(true);

    // Featured Packages State
    const [featuredPackages, setFeaturedPackages] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const [nearbyCenters, setNearbyCenters] = useState([]);
    const [loadingNearby, setLoadingNearby] = useState(true);
    const [globalSettings, setGlobalSettings] = useState(null);
    const nearbyScrollRef = useRef(null);
    const bookedScrollRef = useRef(null);
    const featuredScrollRef = useRef(null);
    const categoriesScrollRef = useRef(null);

    // Recent/Booked Near You State - This state is now replaced by featuredPackages for the scrolling section
    // const [recentStores, setRecentStores] = useState([]);
    // const [loadingRecent, setLoadingRecent] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            // ... existing category fetch
            try {
                const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/app`;
                const SERVICE_ID = '69524f4a57bb211ca094e5e6';

                const response = await fetch(`${API_BASE_URL}/professional-services-flow/public/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        serviceId: SERVICE_ID
                    })
                });

                const data = await response.json();
                if (data.success && data.category && data.category.length > 0) {
                    const mappedCategories = data.category.map(cat => ({
                        _id: cat._id,
                        slug: cat.slug,
                        name: cat.name,
                        image: cat.image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${cat.image}` : 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80',
                        icon: cat.icon || '✨',
                        description: cat.description
                    }));
                    setCategories(mappedCategories);

                    // Fetch subcategories for the first few categories as featured ones for Hero
                    try {
                        const subcatPromises = data.category.slice(0, 3).map(cat =>
                            fetch(`${API_BASE_URL}/professional-services-flow/public/subcategories`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(cat.slug ? { categorySlug: cat.slug, serviceSlug: SERVICE_SLUG } : { categoryId: cat._id })
                            }).then(res => res.json())
                        );

                        const subcatResults = await Promise.all(subcatPromises);
                        let allSubs = [];
                        subcatResults.forEach((res, index) => {
                            if (res.success && res.data) {
                                const cat = data.category[index];
                                const subsWithCat = res.data.map(s => ({ ...s, parentCategoryId: cat._id, parentCategorySlug: cat.slug }));
                                allSubs = [...allSubs, ...subsWithCat];
                            }
                        });

                        if (allSubs.length > 0) {
                            setSubcategories(allSubs.slice(0, 5));
                        }
                    } catch (e) {
                        console.error("Error fetching subcategories for hero:", e);
                    }
                } else {
                    // Fallback to MOCK only if API fails completely
                    setCategories(MOCK_CATEGORIES);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                setCategories(MOCK_CATEGORIES);
            } finally {
                setLoadingCategories(false);
                setLoadingSubcategories(false);
            }
        };

        const fetchFeaturedPackages = async () => {
            try {
                setLoadingFeatured(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/featured_spa_stores`);
                const data = await response.json();

                if (data.success && data.stores) {
                    const mappedStores = data.stores.map(store => {
                        const logo = store.logo || store.image || "";
                        const imageUrl = logo && logo.startsWith('http')
                            ? logo
                            : logo
                                ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${logo.startsWith('/') ? logo.substring(1) : logo}`
                                : 'https://images.unsplash.com/photo-1540555700478-4be289aefeba?auto=format&fit=crop&q=80&w=800';

                        return {
                            id: store._id,
                            name: store.storeName || store.business_name || store.firstName,
                            provider: store.business_name || 'Professional',
                            address: store.address || store.cityName || 'Nearby',
                            image: imageUrl,
                            rating: store.rating || store.totalRatings || 4.5,
                            reviews: store.totalOrders || store.totalRatings || 0,
                            price: store.startingAt || store.BasePrice || store.minFare || 0,
                            duration: '60 min',
                            slug: store.slug,
                            badges: store.badges || []
                        };
                    });
                    setFeaturedPackages(mappedStores);
                }
            } catch (error) {
                console.error("Failed to fetch featured packages:", error);
            } finally {
                setLoadingFeatured(false);
            }
        };

        const fetchNearbyCenters = async () => {
            try {
                setLoadingNearby(true);

                const lat = location?.coords?.latitude || "17.4483";
                const lng = location?.coords?.longitude || "78.3915";

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/nearby_spa_centers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        latitude: lat.toString(),
                        longitude: lng.toString()
                    })
                });
                const data = await response.json();

                if (data.success && data.stores) {
                    const mappedCenters = data.stores.map(center => {
                        const logo = center.logo || center.image || "";
                        const imageUrl = logo && logo.startsWith('http')
                            ? logo
                            : logo
                                ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${logo.startsWith('/') ? logo.substring(1) : logo}`
                                : 'https://images.unsplash.com/photo-1544161515-436cead60470?auto=format&fit=crop&q=80&w=800';

                        return {
                            id: center._id,
                            name: center.storeName || center.business_name || 'Premium Spa',
                            location: center.address || center.cityName || 'Nearby',
                            address: center.address || center.cityName || 'Nearby',
                            rating: center.rating || center.totalRatings || 4.5,
                            image: imageUrl,
                            distance: center.distance || '2.5 km',
                            price: center.startingAt || center.BasePrice || center.minFare || 0,
                            slug: center.slug
                        };
                    });
                    setNearbyCenters(mappedCenters);
                }
            } catch (error) {
                console.error('Error fetching nearby centers:', error);
            } finally {
                setLoadingNearby(false);
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
        fetchFeaturedPackages();
        fetchNearbyCenters();
        fetchGlobalSettings();
    }, []);

    useEffect(() => {
        if (!location) {
            detectWithIP().catch(err => console.log("Auto detect failed", err));
        }
    }, [location, detectWithIP]);

    // Auto-scroll effect for Featured Packages
    useEffect(() => {
        if (!loadingFeatured && featuredPackages.length > 0) {
            const interval = setInterval(() => {
                if (featuredScrollRef.current) {
                    const { scrollLeft, scrollWidth, clientWidth } = featuredScrollRef.current;
                    if (scrollLeft + clientWidth >= scrollWidth - 5) {
                        featuredScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        featuredScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                    }
                }
            }, 3500);
            return () => clearInterval(interval);
        }
    }, [loadingFeatured, featuredPackages]);

    // Auto-scroll effect for Nearby Centers
    useEffect(() => {
        if (!loadingNearby && nearbyCenters.length > 0) {
            const interval = setInterval(() => {
                if (nearbyScrollRef.current) {
                    const { scrollLeft, scrollWidth, clientWidth } = nearbyScrollRef.current;
                    if (scrollLeft + clientWidth >= scrollWidth - 5) {
                        nearbyScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        nearbyScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                    }
                }
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [loadingNearby, nearbyCenters]);

    // Auto-scroll effect for Categories
    useEffect(() => {
        if (!loadingCategories && categories.length > 0) {
            const interval = setInterval(() => {
                if (categoriesScrollRef.current) {
                    const { scrollLeft, scrollWidth, clientWidth } = categoriesScrollRef.current;
                    if (scrollLeft + clientWidth >= scrollWidth - 5) {
                        categoriesScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        categoriesScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                    }
                }
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [loadingCategories, categories]);

    // Auto-scroll effect for Recently Booked
    useEffect(() => {
        if (!loadingFeatured && featuredPackages.length > 0) { // Check loadingFeatured
            const interval = setInterval(() => {
                if (bookedScrollRef.current) {
                    const { scrollLeft, scrollWidth, clientWidth } = bookedScrollRef.current;
                    if (scrollLeft + clientWidth >= scrollWidth - 5) {
                        bookedScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        bookedScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                    }
                }
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [loadingFeatured, featuredPackages]); // Added loadingFeatured to dependency array

    const handleCategoryClick = (category) => {
        const target = category.slug || category._id || category.id;
        router.push(`/spa-salon/${target}`);
    };

    return (
        <div className="min-h-screen bg-transparent pt-20">
            {/* Hero Section */}
            <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-[#FBEAF0] to-[#F4F3FF]">
                {/* ... (Hero Content) ... */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Floating Service Icons - Scattered across left, right, and bottom */}
                    <div className="hidden lg:block">
                        {(subcategories.length > 0 ? subcategories : [
                            { name: 'Facial', icon: '✨', rating: 4.8 },
                            { name: 'Hair Spa', icon: '💇', rating: 4.7 },
                            { name: 'Massage', icon: '💆', rating: 4.6 },
                            { name: 'Makeup', icon: '💄', rating: 4.5 },
                            { name: 'Mani-Pedi', icon: '💅', rating: 4.4 }
                        ]).map((sub, index) => {
                            // Define scattered positions - adjusted right-side icons to be more towards the middle
                            const positions = [
                                { left: '2%', top: '35%' },      // Far Left
                                { right: '12%', top: '22%' },    // Right (Middle-Right)
                                { left: '5%', bottom: '5%' },    // Bottom Left
                                { right: '15%', bottom: '18%' }, // Bottom Right (Middle-Right)
                                { left: '50%', bottom: '2%', x: '-50%' } // Far Bottom Center
                            ];
                            const pos = positions[index % positions.length];

                            return (
                                <motion.div
                                    key={sub._id || sub.name}
                                    className="absolute cursor-pointer z-0"
                                    style={pos}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ 
                                        opacity: 1, 
                                        scale: 1,
                                        y: [0, -15, 0],
                                        rotate: [0, 1.5, 0, -1.5, 0]
                                    }}
                                    transition={{
                                        opacity: { duration: 0.8, delay: index * 0.1 },
                                        scale: { duration: 0.8, delay: index * 0.1 },
                                        y: { duration: 4 + index, repeat: Infinity, ease: "easeInOut" },
                                        rotate: { duration: 5 + index, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    onClick={() => {
                                        if (sub.slug || sub._id) {
                                            const subSlug = sub.slug || sub._id;
                                            router.push(`/spa-salon/${subSlug}`);
                                        } else {
                                            setModalOpen(true);
                                        }
                                    }}
                                    whileHover={{ scale: 1.1, zIndex: 5 }}
                                >
                                    <div className="flex items-center gap-3 transition-colors">
                                        <div className="text-3xl">
                                            {sub.image ? (
                                                <img
                                                    src={sub.image.startsWith('http') ? sub.image : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${sub.image.startsWith('/') ? sub.image.substring(1) : sub.image}`}
                                                    alt={sub.name}
                                                    className="w-10 h-10 object-cover rounded-full shadow-inner"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80&w=200';
                                                    }}
                                                />
                                            ) : (
                                                <span>{sub.icon || ['✨', '💇', '💆', '💄', '💅'][index % 5]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[#0F172A] text-xs font-bold leading-none mb-1">{sub.name}</p>
                                            <div className="flex items-center gap-0.5 text-[#FBBF24]">
                                                <Star className="w-2.5 h-2.5 fill-current" />
                                                <span className="text-[#0F172A] text-[10px] font-bold">{sub.rating || (4.8 - (index * 0.1)).toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
                    <div className="grid lg:grid-cols-2 gap-3 lg:gap-5 items-center">
                        {/* Left Side */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-[#E8ECF2] mb-5 shadow-sm"
                            >
                                <Sparkles className="w-4 h-4 text-[#C06C84] mb" />
                                <h6 className="text-[#0F172A] text-xs sm:text-sm ">Premium Wellness Services</h6>
                            </motion.div>

                            <h1 className="text-[2.45rem] sm:text-[2.9rem] md:text-[3.2rem] lg:text-[3.0rem] font-bold text-[#0F172A] mb-5 leading-[0.88]">
                                Glow Up .
                                <span className="text-[#C06C84] mb-5">Chill Out.</span>
                                <br />
                                Book in Minutes.
                            </h1>

                            <p className="text-sm sm:text-[15px] text-[#64748B] mb-5">
                                Premium salon & spa services at home or nearby centers.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setModalOpen(true);
                                    }}
                                    className="px-5 py-2 mb-5 sm:px-6 sm:py-2.5 bg-[#6d1357] text-white rounded-xl text-sm sm:text-base font-medium hover:shadow-lg hover:shadow-[#6d1357]/40 transition-all flex items-center justify-center gap-2 font-bold"
                                >
                                    Explore Spa Services
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </motion.button>

                                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                    <motion.a
                                        href={globalSettings?.appStore || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center justify-center w-28 xs:w-36 md:w-32 h-10 xs:h-11 md:h-11 bg-gradient-to-r from-[#6d1357] to-[#C06C84] rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden border border-white/10"
                                        title="Download on the App Store"
                                    >
                                        <img src="/apple2.png" alt="App Store" className="h-full w-full object-cover brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
                                    </motion.a>

                                    <motion.a
                                        href={globalSettings?.playStore || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center justify-center w-28 xs:w-36 md:w-32 h-10 xs:h-11 md:h-11 bg-gradient-to-r from-[#6d1357] to-[#C06C84] rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden border border-white/10"
                                        title="Get it on Google Play"
                                    >
                                        <img src="/andriod1.png" alt="Google Play" className="h-full w-full object-cover brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
                                    </motion.a>
                                </div>

                                {/* <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setModalOpen(true);
                                    }}
                                    className="px-8 py-4 bg-white text-[#C06C84] rounded-xl font-medium border-2 border-[#C06C84] hover:bg-[#C06C84] hover:text-white transition-all"
                                >
                                    Book Appointment Now
                                </motion.button> */}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-3">
                                <StatCard icon={<Users />} value="50K+" label="Happy Clients" />
                                <StatCard icon={<Award />} value="500+" label="Expert Staff" />
                                <StatCard icon={<Star />} value="4.9" label="Avg Rating" />
                            </div>
                        </motion.div>

                        {/* Empty right column to balance grid if needed, or we can make left side wider */}
                        <div className="hidden lg:block h-full" />
                    </div>
                </div>
            </section>

            {/* Explore Categories */}
            <section id="categories" className="py-18 mt-8 px-4 sm:px-6 lg:px-8 bg-transparent">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between mb-8"
                    >
                        <div>
                            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#0F172A] mb-2">
                                Explore <span className="text-[#C06C84]">Categories</span>
                            </h2>
                            <p className="text-sm sm:text-xl text-[#64748B]">
                                Step into different worlds of wellness
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ x: 5 }}
                            onClick={() => {
                                setSelectedCategory(null);
                                setModalOpen(true);
                            }}
                            className="text-[#C06C84] hover:text-[#6C5CE7] flex items-center gap-2 transition-colors font-semibold text-xs sm:text-base"
                        >
                            Explore Spa Services
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>
                    </motion.div>

                    <div
                        ref={categoriesScrollRef}
                        className="flex overflow-x-auto gap-6 pb-8 scroll-smooth text-[#64748B]"
                    >
                        {loadingCategories ? (
                            // Shimmer skeleton for categories
                            [1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex-shrink-0 w-64 md:w-80 relative aspect-[3/4] rounded-3xl overflow-hidden animate-pulse">
                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <div className="h-8 bg-gray-300 rounded-lg w-12 mb-3" />
                                        <div className="h-6 bg-gray-300 rounded-lg w-3/4 mb-2" />
                                        <div className="h-4 bg-gray-200 rounded-lg w-full" />
                                    </div>
                                </div>
                            ))
                        ) : categories.map((category, index) => (
                            <motion.div
                                key={category._id || category.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                onClick={() => handleCategoryClick(category)}
                                className="flex-shrink-0 w-64 md:w-80 relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer group"
                            >
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* White Glass Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#C06C84]/90 via-[#C06C84]/40 to-transparent" />

                                <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
                                    <div className="text-3xl sm:text-5xl mb-2 sm:mb-3">{category.icon}</div>
                                    <h4 className="text-lg sm:text-2xl font-bold text-[#0F172A] mb-1 sm:mb-2">{category.name}</h4>
                                    <p className="text-[#64748B] text-xs sm:text-base line-clamp-2">{category.description}</p>
                                </div>

                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-2 border-[#C06C84] rounded-3xl" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Packages */}
            <section id="featured" className="py-20 px-4 sm:px-6 lg:px-8 bg-transparent">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between mb-8"
                    >
                        <div>
                            <h2 className="text-4xl font-bold mb-2">
                                <span className="bg-gradient-to-r from-[#026b60] via-[#9b435a] to-[#026b60] bg-clip-text text-transparent">
                                    Budget Friendly
                                </span>
                            </h2>
                            <p className="text-xl text-[#64748B]">Most booked this week</p>
                        </div>
                        <motion.button
                            whileHover={{ x: 5 }}
                            onClick={() => router.push('/spa-salon/packages')}
                            className="text-[#C06C84] hover:text-[#6C5CE7] flex items-center gap-2 transition-colors font-semibold"
                        >
                            Explore All
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </motion.div>

                    <div
                        ref={featuredScrollRef}
                        className="flex overflow-x-auto gap-6 pb-8 scroll-smooth"
                    >
                        {loadingFeatured ? (
                            // Skeleton Loading
                            [1, 2, 3, 4].map((_, index) => (
                                <div key={index} className="flex-shrink-0 w-80 h-[480px] bg-gray-100 rounded-2xl animate-pulse" />
                            ))
                        ) : featuredPackages.length > 0 ? (
                            featuredPackages.map((pkg, index) => (
                                <motion.div
                                    key={pkg.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex-shrink-0 w-72 lg:w-[calc((100%-7.5rem)/6)]"
                                >
                                    <PackageCard package={pkg} index={index} router={router} />
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-gray-400">
                                <p>No featured spa packages available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Recently Booked */}
            <section className="py-18 px-4 sm:px-6 lg:px-8 bg-transparent">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-8"
                    >
                        <h2 className="text-3xl font-bold text-[#0F172A] mb-2">Recommended For You</h2>
                        <p className="text-[#64748B]">Popular choices in your area</p>
                    </motion.div>

                    <div className="flex gap-6 overflow-x-auto pb-4">
                        {loadingFeatured ? ( // Using loadingFeatured as recentStores is removed
                            [1, 2, 3].map((i) => (
                                <div key={i} className="flex-shrink-0 w-80 h-48 bg-gray-200 rounded-xl animate-pulse" />
                            ))
                        ) : featuredPackages.length > 0 ? ( // Using featuredPackages for recently booked
                            <div
                                ref={bookedScrollRef}
                                className="flex overflow-x-auto gap-6 pb-8 scroll-smooth"
                            >
                                {featuredPackages.slice(0, 8).map((pkg, index) => (
                                    <motion.div
                                        key={pkg.id}
                                        initial={{ opacity: 0, x: 30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex-shrink-0 w-64 lg:w-[calc((100%-7.5rem)/6)]"
                                    >
                                        <RecentlyBookedCard package={pkg} router={router} />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full text-center text-gray-400 py-4">
                                No recently booked services nearby.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Nearby Spa Centers */}
            <section id="nearby" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between mb-8"
                    >
                        <div>
                            <h2 className="text-3xl font-bold text-[#0F172A] mb-2">Nearby Spa Centers</h2>
                            <p className="text-[#64748B]">Top-rated centers in your city</p>
                        </div>
                        <motion.button
                            whileHover={{ x: 5 }}
                            onClick={() => router.push('/spa-salon/results')}
                            className="text-[#C06C84] hover:text-[#6C5CE7] flex items-center gap-2 transition-colors font-semibold"
                        >
                            Explore Spa Services
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </motion.div>

                    <div
                        ref={nearbyScrollRef}
                        className="flex overflow-x-auto gap-6 pb-8 scroll-smooth"
                    >
                        {loadingNearby ? (
                            // Skeleton Loading
                            [1, 2, 3, 4].map((_, index) => (
                                <div key={index} className="flex-shrink-0 w-72 h-[380px] bg-gray-100 rounded-3xl animate-pulse" />
                            ))
                        ) : nearbyCenters.length > 0 ? (
                            nearbyCenters.map((center, index) => (
                                <motion.div
                                    key={center.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex-shrink-0 w-64 lg:w-[calc((100%-7.5rem)/6)]"
                                >
                                    <NearbyCenterCard center={center} index={index} router={router} />
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-[#64748B]">
                                No spa centers found nearby
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Questionnaire Modal */}
            <QuestionnaireModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                categoryName={selectedCategory?.name || ''}
                categoryId={selectedCategory?._id || selectedCategory?.id || ''}
            />
        </div>
    );
}

// Helper Components
function StatCard({ icon, value, label }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center"
        >
            <div className="w-12 h-12 bg-gradient-to-r from-[#C06C84]/20 to-[#6C5CE7]/20 rounded-xl flex items-center justify-center text-[#C06C84] mx-auto mb-2">
                {icon}
            </div>
            <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
            <h6 className="text-sm text-[#64748B]">{label}</h6>
        </motion.div>
    );
}

function PackageCard({ package: pkg, index, router }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            onClick={() => router.push(`/spa-salon/${pkg.slug || pkg.id}`)}
            className="bg-white/30 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 cursor-pointer group shadow-lg hover:shadow-xl transition-all h-full"
        >
            <div className="relative h-52 overflow-hidden">
                <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1540555700478-4be289aefeba?auto=format&fit=crop&q=80&w=800';
                    }}
                />
                {/* Rating Badge on Image */}
                <div className="absolute bottom-0 left-0 bg-[#C06C84] text-white px-2.5 py-1 rounded-tr-xl flex items-center gap-1 text-xs font-bold shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    {pkg.rating || 4.5}
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-[#64748B] text-xs mb-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C06C84] flex-shrink-0" />
                        <span className="truncate leading-none">{pkg.address}</span>
                    </div>
                    <h4 className="text-l font-bold text-[#0F172A] mb-1 line-clamp-2">{pkg.name}</h4>
                </div>

                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Starting from</span>
                        <p className="text-xl font-bold text-[#0F172A]">₹{pkg.price}/-</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2 bg-[#6d1357] text-white rounded-xl font-bold text-xs hover:bg-[#1E293B] transition-colors"
                    >
                        Book Now
                    </motion.button>
                </div>
            </div>
        </motion.div >
    );
}

function RecentlyBookedCard({ package: pkg, router }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={() => router.push(`/spa-salon/${pkg.slug || pkg.id}`)}
            className="bg-white/30 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 cursor-pointer shadow-md hover:shadow-lg transition-all h-full"
        >
            <div className="relative h-40">
                <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1540555700478-4be289aefeba?auto=format&fit=crop&q=80&w=800';
                    }}
                />
                {/* Rating Badge on Image */}
                <div className="absolute bottom-0 left-0 bg-[#C06C84] text-white px-2 py-0.5 rounded-tr-lg flex items-center gap-0.5 text-[10px] font-bold">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    {pkg.rating || 4.5}
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                    <h5 className="text-[#0F172A] font-bold mb-0.5 line-clamp-1">{pkg.name}</h5>
                    <div className="flex items-center gap-1.5 text-[#64748B] text-[10px] mb-1 min-w-0">
                        <MapPin className="w-3 h-3 text-[#C06C84] flex-shrink-0" />
                        <span className="truncate leading-none">{pkg.address}</span>
                    </div>
                </div>
                <div className="flex items-end justify-between mt-3 gap-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Starts from</span>
                        <p className="text-lg font-bold text-[#0F172A]">₹{pkg.price}/-</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-3 py-1.5 bg-[#6d1357] text-white rounded-lg font-bold text-[10px] whitespace-nowrap"
                    >
                        Book Now
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

function NearbyCenterCard({ center, index, router }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={() => router.push(`/spa-salon/${center.slug || center.id}`)}
            className="bg-white/30 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 cursor-pointer group hover:shadow-xl transition-all h-full"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={center.image}
                    alt={center.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1544161515-436cead60470?auto=format&fit=crop&q=80&w=800';
                    }}
                />
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                    <h4 className="text-l font-bold text-[#0F172A] mb-1 line-clamp-1">{center.name}</h4>
                    <div className="flex items-center gap-2 text-[#64748B] text-xs mb-2">
                        <MapPin className="w-4 h-4 text-[#C06C84] flex-shrink-0" />
                        <span className="truncate leading-none">{center.address}</span>
                    </div>
                </div>

                <div className="mt-2">
                    <div className="flex items-end justify-between mb-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Starting from</span>
                            <p className="text-xl font-bold text-[#0F172A]">₹{center.price}/-</p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2 bg-[#6d1357] text-white rounded-xl font-bold text-xs transition-colors"
                    >
                        Book Now
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

function MoodCard({ mood, service, image, color, router }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/spa-salon')}
            className="relative h-80 rounded-2xl overflow-hidden cursor-pointer group"
        >
            <img
                src={image}
                alt={service}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div
                    className="inline-block px-4 py-2 rounded-full text-white text-sm mb-3 self-start"
                    style={{ backgroundColor: color }}
                >
                    {mood}
                </div>
                <h4 className="text-2xl font-bold text-white">{service}</h4>
            </div>
        </motion.div>
    );
}

function BlogCard({ title, image, readTime }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="bg-white/30 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 cursor-pointer shadow-md hover:shadow-lg transition-all"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-6">
                <h4 className="text-xl font-semibold text-[#0F172A] mb-3">{title}</h4>
                <div className="flex items-center gap-2 text-[#64748B]">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">{readTime}</span>
                </div>
            </div>
        </motion.div>
    );
}


