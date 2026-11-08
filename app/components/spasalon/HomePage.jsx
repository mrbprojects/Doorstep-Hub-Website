'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Star, MapPin,PawPrint  ,ShieldCheck ,Clock3 ,CalendarCheck2 , ChevronRight, Sparkles, Award, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QuestionnaireModal } from './QuestionnaireModal';
import { useLocationContext } from '@/context/LocationContext';
import { CategorySubcategorySection } from '@/components/shared/CategorySubcategorySection';
import { KnowledgeSection } from '@/components/landing/KnowledgeSection';
import { AppDownload } from '@/components/landing/AppDownload';

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
    const SERVICE_SLUG = 'spa-salon';
    const { location, detectWithIP } = useLocationContext();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [, setSubcategories] = useState([]);
    const [, setLoadingSubcategories] = useState(true);
    const [, setGlobalSettings] = useState(null);

    // Featured Packages State
    const [featuredPackages, setFeaturedPackages] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const [nearbyCenters, setNearbyCenters] = useState([]);
    const [loadingNearby, setLoadingNearby] = useState(true);
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
    }, [location?.coords?.latitude, location?.coords?.longitude]);

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

    const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                "name": "Premium Spa & Salon Services",
                "description": "Professional beauty and wellness services at home or nearby centers. Includes haircuts, facials, massages, and more.",
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
                "name": "Our Beauty & Wellness Categories",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Haircut & Styling" },
                    { "@type": "ListItem", "position": 2, "name": "Facial & Skincare" },
                    { "@type": "ListItem", "position": 3, "name": "Massage & Relaxation" },
                    { "@type": "ListItem", "position": 4, "name": "Bridal & Makeup" },
                    { "@type": "ListItem", "position": 5, "name": "Manicure & Pedicure" }
                ]
            }
        ]
    };

    return (
        <div className="min-h-screen bg-transparent pt-16 sm:pt-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#fff8fb] via-white to-[#f7f4ff] py-3 sm:py-5 lg:py-6">

    {/* Soft Background */}
    <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-pink-200/20 blur-3xl rounded-full" />
    <div className="absolute bottom-[-100px] right-[-100px] w-[320px] h-[320px] bg-violet-200/20 blur-3xl rounded-full" />

    <div className="relative z-10 max-w-[1400px] mx-auto px-5 lg:px-8">

        {/* ================= HERO ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.02fr] items-center gap-6 lg:gap-4">

            {/* ================= LEFT SIDE ================= */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="max-w-[620px] text-center lg:text-left mx-auto lg:mx-0"
            >

                {/* Badge */}
                <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-white border border-[#f2dce6] shadow-sm mb-3 sm:mb-4 px-3 py-1.5 sm:px-4 sm:py-2 mx-auto lg:mx-0">
                    <Sparkles className="w-4 h-4 text-[#c06c84] flex-shrink-0" />

                    <span className="text-[#111827] text-xs sm:text-sm font-medium">
                        Premium Salon & Pet Salon Services
                    </span>
                </div>

                {/* Heading */}
                <h1 className="mx-auto lg:mx-0 max-w-full text-2xl sm:text-4xl lg:text-[2.65rem] xl:text-[3rem] leading-[1.15] sm:leading-[1.18] font-extrabold tracking-tight text-[#0f172a]">
                    <span className="block">
                        Style That{" "}
                        <span className="bg-gradient-to-r from-[#c06c84] to-[#c05cff] bg-clip-text text-transparent">
                            Shine.
                        </span>
                    </span>
                    <span className="block mt-1 sm:mt-1.5">
                        Care That Makes Them{" "}
                        <span className="bg-gradient-to-r from-[#c06c84] to-[#c05cff] bg-clip-text text-transparent">
                            Happy.
                        </span>
                    </span>
                </h1>

                {/* Description */}
                <p className="mx-auto lg:mx-0 mt-2.5 sm:mt-3 max-w-md sm:max-w-xl text-sm sm:text-base leading-relaxed text-[#64748b]">
                    Hair, beauty & grooming experts for you and your pets.
                    At home or nearby centers.
                </p>

                {/* CTA */}
                <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5">

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setSelectedCategory(null);
                            setModalOpen(true);
                        }}
                        className="flex h-11 sm:h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#741b5d] to-[#c7378f] px-6 sm:px-8 text-sm sm:text-base font-semibold text-white shadow-[0_10px_25px_rgba(199,55,143,0.25)] hover:shadow-lg transition-all"
                    >
                        Explore Services
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>

                    <div className="flex items-center gap-2">
                        {/* App Store */}
                        <motion.a
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            href="https://apps.apple.com/app/id6475340236"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-10 sm:h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#7b1c63] to-[#d06297] px-3 shadow-md hover:shadow-lg transition-all"
                        >
                            <Image
                                src="/apple2.png"
                                alt="App Store"
                                className="h-8 sm:h-9 object-contain brightness-0 invert"
                             width={500} height={300} />
                        </motion.a>

                        {/* Play Store */}
                        <motion.a
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            href="https://play.google.com/store/apps/details?id=com.doorstephub.customer"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-10 sm:h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#7b1c63] to-[#d06297] px-3 shadow-md hover:shadow-lg transition-all"
                        >
                            <Image
                                src="/andriod1.png"
                                alt="Google Play"
                                className="h-8 sm:h-9 object-contain brightness-0 invert"
                             width={500} height={300} />
                        </motion.a>
                    </div>
                </div>

                {/* ================= STATS ================= */}
                <div className="mt-5 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">

                    {[
                        {
                            icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
                            value: '50K+',
                            label: 'Happy Clients',
                            color: 'from-pink-500 to-pink-400'
                        },
                        {
                            icon: <Award className="w-4 h-4 sm:w-5 sm:h-5" />,
                            value: '500+',
                            label: 'Expert Staff',
                            color: 'from-violet-500 to-fuchsia-400'
                        },
                        {
                            icon: <Star className="w-4 h-4 sm:w-5 sm:h-5" />,
                            value: '4.9',
                            label: 'Avg Rating',
                            color: 'from-rose-500 to-pink-400'
                        },
                        {
                            icon: <PawPrint className="w-4 h-4 sm:w-5 sm:h-5" />,
                            value: '10K+',
                            label: 'Pets Groomed',
                            color: 'from-purple-500 to-pink-400'
                        }
                    ].map((item, i) => (
                        <div key={i} className="min-w-0 rounded-2xl bg-white/80 border border-[#f5edf3] sm:border-0 p-2.5 sm:p-0 text-center lg:text-left sm:bg-transparent shadow-sm sm:shadow-none">

                            <div className={`mx-auto lg:mx-0 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-md mb-1.5 sm:mb-2`}>
                                {item.icon}
                            </div>

                            <h3 className="text-xl sm:text-2xl lg:text-[1.85rem] leading-tight font-bold text-[#0f172a]">
                                {item.value}
                            </h3>

                            <p className="mt-0.5 text-[11px] sm:text-xs text-[#64748b] font-medium leading-tight">
                                {item.label}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ================= RIGHT SIDE ================= */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="relative flex items-center justify-center lg:justify-end mt-4 lg:mt-0"
            >
              <div className="relative mx-auto h-[230px] w-full max-w-[340px] sm:h-[340px] sm:max-w-[480px] lg:h-[440px] lg:w-[580px]">

                {/* Main Generated Right Image */}
                <Image
                  src="/right-side-image.png"
                  alt="Salon and Pet Grooming"
                  className="h-full w-full object-contain"
                 width={500} height={300} />

                {/* Floating Hair Salon Card */}
                <motion.div initial={false}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute left-1 top-1 z-20 flex items-center gap-2 rounded-xl sm:rounded-2xl border border-[#f3dce5] bg-white/95 px-2 py-1 shadow-lg backdrop-blur-md pointer-events-none sm:left-auto sm:right-2 sm:top-4 sm:gap-2.5 sm:px-3 sm:py-2"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-pink-100 flex items-center justify-center text-base sm:text-xl">
                    💇🏻‍♀️
                  </div>

                  <div>
                    <h4 className="text-[#111827] font-semibold text-xs sm:text-sm leading-tight">
                      Hair Salon
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5 text-amber-500 text-[10px] sm:text-xs font-semibold">
                      ⭐ 4.8
                    </div>
                  </div>
                </motion.div>

                {/* Floating Pet Grooming Card */}
                <motion.div initial={false}
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                  className="absolute bottom-2 right-1 z-20 flex items-center gap-2 rounded-xl sm:rounded-2xl border border-[#f3dce5] bg-white/95 px-2 py-1 shadow-lg backdrop-blur-md pointer-events-none sm:bottom-auto sm:right-0 sm:top-28 sm:gap-2.5 sm:px-3 sm:py-2"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-100 flex items-center justify-center text-base sm:text-xl">
                    🐶
                  </div>

                  <div>
                    <h4 className="text-[#111827] font-semibold text-xs sm:text-sm leading-tight">
                      Pet Grooming
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5 text-amber-500 text-[10px] sm:text-xs font-semibold">
                      ⭐ 4.7
                    </div>
                  </div>
                </motion.div>

              </div>
            </motion.div>
        </div>

        {/* ================= FEATURES ================= */}
        <div className="mt-4 sm:mt-5 bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-[#f5edf3] shadow-[0_10px_30px_rgba(0,0,0,0.04)] px-3.5 py-3 sm:px-6 sm:py-4">

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">

                {[
                    {
                        icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />,
                        title: 'Verified Experts',
                        desc: 'Certified professionals'
                    },
                    {
                        icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />,
                        title: 'Hygiene Assured',
                        desc: 'Clean premium products'
                    },
                    {
                        icon: <Clock3 className="w-5 h-5 sm:w-6 sm:h-6" />,
                        title: 'On-time Service',
                        desc: 'Reliable & punctual'
                    },
                    {
                        icon: <CalendarCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />,
                        title: 'Easy Booking',
                        desc: 'Book in few taps'
                    }
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">

                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#fff2f7] flex items-center justify-center text-[#d946ef] flex-shrink-0">
                            {item.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h4 className="text-[#111827] text-xs sm:text-sm lg:text-base font-bold truncate">
                                {item.title}
                            </h4>

                            <p className="text-[#64748b] text-[10px] sm:text-xs mt-0.5 truncate">
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
</section>
            {/* Explore Categories */}
            <section id="categories" className="mt-4 sm:mt-6">
                <CategorySubcategorySection
                    categories={categories}
                    categoriesLoading={loadingCategories}
                    isLocationReady={true}
                    onViewAll={() => {
                        setSelectedCategory(null);
                        setModalOpen(true);
                    }}
                    onOpenCategory={(category) => handleCategoryClick(category)}
                    onSubcategoryClick={(subCategory) => router.push(`/spa-salon/${subCategory.slug || subCategory._id}`)}
                    fetchSubcategoriesForCategory={async (category) => {
                        if ((category.slug || category._id || '').startsWith('mock_')) {
                            return [
                                { _id: 'mock_sub_1', name: 'Premium Cut', description: 'Includes wash and styling', slug: 'premium-cut' },
                                { _id: 'mock_sub_2', name: 'Coloring', description: 'Global and highlights', slug: 'coloring' },
                                { _id: 'mock_sub_3', name: 'Spa Treatment', description: 'Deep conditioning', slug: 'spa-treatment' },
                            ];
                        }
                        const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/app`;
                        const response = await fetch(`${API_BASE_URL}/professional-services-flow/public/subcategories`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(category.slug ? { categorySlug: category.slug, serviceSlug: SERVICE_SLUG } : { categoryId: category._id }),
                        });
                        const data = await response.json();
                        return data.success && Array.isArray(data.data) ? data.data : [];
                    }}
                    theme={{
                        eyebrow: 'Wellness',
                        title: 'Explore Categories',
                        description: 'Step into different worlds of wellness and jump straight into the exact salon or spa service you want.',
                        viewAllLabel: 'Explore Spa Services',
                        sectionClass: 'bg-transparent',
                        eyebrowClass: 'text-[#C06C84]',
                        titleClass: 'text-[#0F172A]',
                        descriptionClass: 'text-[#64748B]',
                        viewAllClass: 'text-[#C06C84] hover:text-[#6C5CE7]',
                        locationBoxClass: 'border border-[#f2dce6] bg-white/90',
                        locationIconClass: 'text-[#C06C84]/60',
                        locationTitleClass: 'text-[#0F172A]',
                        locationButtonClass: 'bg-[#6d1357] text-white hover:bg-[#571046]',
                        mutedCardClass: 'border border-[#f4dde6] bg-white/80',
                        categoryCardClass: 'border-[#f3e5eb] bg-white hover:border-[#e7bfd0] hover:bg-gradient-to-r hover:from-[#fff8fb] hover:to-white',
                        activeCategoryCardClass: 'border-[#e7bfd0] bg-gradient-to-r from-[#fff0f5] via-white to-[#fff6fa] shadow-[0_20px_40px_rgba(192,108,132,0.16)]',
                        thumbClass: 'border-[#f0e4e9] bg-[#fff8fb]',
                        activeThumbClass: 'border-[#e7bfd0] bg-white shadow-sm',
                        categoryTextClass: 'text-[#2f2430]',
                        activeCategoryTextClass: 'text-[#6d1357]',
                        categoryAccentTextClass: 'text-[#C06C84]',
                        countTextClass: 'text-[#8b7c86]',
                        arrowClass: 'bg-[#faf6f8] text-[#b4a3ad] group-hover:bg-gradient-to-r group-hover:from-[#C06C84] group-hover:to-[#6C5CE7] group-hover:text-white',
                        activeArrowClass: 'bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] text-white shadow-[0_10px_24px_rgba(192,108,132,0.28)]',
                        gridCardHeightClass: 'h-[190px]',
                        gridFallbackClass: 'bg-gradient-to-br from-[#f7dbe6] to-[#eadffd]',
                        gridOverlayClass: 'bg-gradient-to-t from-[#2d1326]/92 via-[#2d1326]/30 to-transparent',
                        showMoreClass: 'border-[#e7bfd0] text-[#6d1357] hover:bg-[#fff3f8]',
                        emptyBoxClass: 'border border-[#f1dde6] bg-white',
                        emptyTitleClass: 'text-[#332633]',
                        emptyTextClass: 'text-[#8b7c86]',
                    }}
                />
            </section>

            {/* Featured Packages */}
            <section id="featured" className="py-6 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between mb-4 sm:mb-6 gap-2"
                    >
                        <div>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight mb-0.5 sm:mb-1">
                                <span className="bg-gradient-to-r from-[#026b60] via-[#9b435a] to-[#026b60] bg-clip-text text-transparent">
                                    Budget Friendly
                                </span>
                            </h2>
                            <p className="text-xs sm:text-sm lg:text-base text-[#64748B]">Most booked this week</p>
                        </div>
                        <motion.button
                            whileHover={{ x: 5 }}
                            onClick={() => router.push('/spa-salon/packages')}
                            className="text-[#C06C84] hover:text-[#6C5CE7] flex items-center gap-1 sm:gap-1.5 transition-colors font-semibold text-xs sm:text-sm whitespace-nowrap"
                        >
                            Explore All
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>
                    </motion.div>

                    <div
                        ref={featuredScrollRef}
                        className="flex overflow-x-auto gap-3.5 sm:gap-5 pb-3 scroll-smooth scrollbar-hide"
                    >
                        {loadingFeatured ? (
                            // Skeleton Loading
                            [1, 2, 3, 4].map((_, index) => (
                                <div key={index} className="flex-shrink-0 w-[260px] sm:w-72 lg:w-[calc((100%-7.5rem)/6)] bg-white/30 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 animate-pulse flex flex-col h-[360px] sm:h-[400px]">
                                    <div className="h-44 sm:h-52 bg-gray-200 w-full" />
                                    <div className="p-4 sm:p-6 flex flex-col flex-1 justify-between">
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <div className="w-3.5 h-3.5 bg-gray-200 rounded-full" />
                                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                            </div>
                                            <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mb-1" />
                                            <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/2" />
                                        </div>
                                        <div className="mt-3 sm:mt-4 flex flex-col gap-2">
                                            <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
                                            <div className="h-5 sm:h-6 bg-gray-200 rounded w-24" />
                                            <div className="h-8 sm:h-9 bg-gray-200 rounded-xl w-full mt-1" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : featuredPackages.length > 0 ? (
                            featuredPackages.map((pkg, index) => (
                                <motion.div
                                    key={pkg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.08 }}
                                    className="flex-shrink-0 w-[260px] sm:w-72 lg:w-[calc((100%-7.5rem)/6)]"
                                >
                                    <PackageCard package={pkg} index={index} router={router} />
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-6 text-gray-400">
                                <p>No featured spa packages available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Recently Booked */}
            <section className="py-6 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-4 sm:mb-6"
                    >
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-0.5 sm:mb-1">Recommended For You</h2>
                        <p className="text-xs sm:text-sm lg:text-base text-[#64748B]">Popular choices in your area</p>
                    </motion.div>

                    <div className="flex gap-3.5 sm:gap-5 overflow-x-auto pb-3 scrollbar-hide">
                        {loadingFeatured ? (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="flex-shrink-0 w-[240px] sm:w-64 lg:w-[calc((100%-7.5rem)/6)] bg-white/30 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 animate-pulse flex flex-col h-[280px]">
                                    <div className="h-36 sm:h-40 bg-gray-200 w-full" />
                                    <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
                                        <div>
                                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-3 h-3 bg-gray-200 rounded-full" />
                                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-between mt-3 gap-2">
                                            <div>
                                                <div className="h-2.5 bg-gray-200 rounded w-12 mb-1" />
                                                <div className="h-5 bg-gray-200 rounded w-16" />
                                            </div>
                                            <div className="h-7 bg-gray-200 rounded-lg w-16" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : featuredPackages.length > 0 ? (
                            <div
                                ref={bookedScrollRef}
                                className="flex overflow-x-auto gap-3.5 sm:gap-5 pb-3 scroll-smooth scrollbar-hide"
                            >
                                {featuredPackages.slice(0, 8).map((pkg, index) => (
                                    <motion.div
                                        key={pkg.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.08 }}
                                        className="flex-shrink-0 w-[240px] sm:w-64 lg:w-[calc((100%-7.5rem)/6)]"
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
            <section id="nearby" className="py-6 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between mb-4 sm:mb-6 gap-2"
                    >
                        <div>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-0.5 sm:mb-1">Nearby Spa Centers</h2>
                            <p className="text-xs sm:text-sm lg:text-base text-[#64748B]">Top-rated centers in your city</p>
                        </div>
                        <motion.button
                            whileHover={{ x: 5 }}
                            onClick={() => router.push('/spa-salon/results')}
                            className="text-[#C06C84] hover:text-[#6C5CE7] flex items-center gap-1 sm:gap-1.5 transition-colors font-semibold text-xs sm:text-sm whitespace-nowrap"
                        >
                            Explore Centers
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>
                    </motion.div>

                    <div
                        ref={nearbyScrollRef}
                        className="flex overflow-x-auto gap-3.5 sm:gap-5 pb-3 scroll-smooth scrollbar-hide"
                    >
                        {loadingNearby ? (
                            // Skeleton Loading
                            [1, 2, 3, 4].map((_, index) => (
                                <div key={index} className="flex-shrink-0 w-[250px] sm:w-64 lg:w-[calc((100%-7.5rem)/6)] bg-white/30 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 animate-pulse flex flex-col h-[320px] sm:h-[340px]">
                                    <div className="h-40 sm:h-48 bg-gray-200 w-full" />
                                    <div className="p-4 sm:p-6 flex flex-col flex-1 justify-between">
                                        <div>
                                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-gray-200 rounded-full" />
                                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <div className="flex items-end justify-between mb-2">
                                                <div>
                                                    <div className="h-2.5 bg-gray-200 rounded w-16 mb-1" />
                                                    <div className="h-5 bg-gray-200 rounded w-20" />
                                                </div>
                                            </div>
                                            <div className="h-8 bg-gray-200 rounded-xl w-full" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : nearbyCenters.length > 0 ? (
                            nearbyCenters.map((center, index) => (
                                <motion.div
                                    key={center.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.08 }}
                                    className="flex-shrink-0 w-[250px] sm:w-64 lg:w-[calc((100%-7.5rem)/6)]"
                                >
                                    <NearbyCenterCard center={center} index={index} router={router} />
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-8 text-center text-[#64748B]">
                                No spa centers found nearby
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Help Center Section - Spa, Salon & Pet Care Articles */}
            <KnowledgeSection vertical="spa-salon" showNewsletter={false} />

            {/* App Download Section (same as Home page) */}
            <AppDownload />

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


function PackageCard({ package: pkg, router }) {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            onClick={() => router.push(`/spa-salon/${pkg.slug || pkg.id}`)}
            className="bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden border border-[#f5edf3] cursor-pointer group shadow-md hover:shadow-xl transition-all h-full flex flex-col"
        >
            <div className="relative h-44 sm:h-52 overflow-hidden bg-gray-100">
                <Image
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1540555700478-4be289aefeba?auto=format&fit=crop&q=80&w=800';
                    }}
                 width={500} height={300} />
                {/* Rating Badge on Image */}
                <div className="absolute bottom-0 left-0 bg-[#C06C84] text-white px-2.5 py-1 rounded-tr-xl flex items-center gap-1 text-xs font-bold shadow-md">
                    <Star className="w-3 h-3 fill-current" />
                    {pkg.rating || 4.5}
                </div>
            </div>

            <div className="p-3.5 sm:p-5 flex flex-col flex-1 justify-between">
                <div>
                    <div className="flex items-center gap-1.5 text-[#64748B] text-xs mb-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C06C84] flex-shrink-0" />
                        <span className="truncate leading-none">{pkg.address}</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-[#0F172A] mb-1 line-clamp-2 leading-snug">{pkg.name}</h4>
                </div>

                <div className="mt-2.5 flex flex-col gap-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Starting from</span>
                        <p className="text-lg sm:text-xl font-bold text-[#0F172A] leading-tight">₹{pkg.price}/-</p>
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
            className="bg-white/80 backdrop-blur-md rounded-xl overflow-hidden border border-[#f5edf3] cursor-pointer shadow-sm hover:shadow-md transition-all h-full flex flex-col"
        >
            <div className="relative h-36 sm:h-40 bg-gray-100">
                <Image
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1540555700478-4be289aefeba?auto=format&fit=crop&q=80&w=800';
                    }}
                 width={500} height={300} />
                {/* Rating Badge on Image */}
                <div className="absolute bottom-0 left-0 bg-[#C06C84] text-white px-2 py-0.5 rounded-tr-lg flex items-center gap-0.5 text-[10px] font-bold shadow-sm">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    {pkg.rating || 4.5}
                </div>
            </div>

            <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                <div>
                    <h5 className="text-[#0F172A] font-bold text-xs sm:text-sm mb-0.5 line-clamp-1">{pkg.name}</h5>
                    <div className="flex items-center gap-1 text-[#64748B] text-[10px] mb-1 min-w-0">
                        <MapPin className="w-3 h-3 text-[#C06C84] flex-shrink-0" />
                        <span className="truncate leading-none">{pkg.address}</span>
                    </div>
                </div>
                <div className="flex items-end justify-between mt-2.5 gap-2">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-[#64748B] uppercase tracking-wider font-semibold">Starts from</span>
                        <p className="text-base sm:text-lg font-bold text-[#0F172A] leading-tight">₹{pkg.price}/-</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-3 py-1.5 bg-[#6d1357] text-white rounded-lg font-bold text-[10px] whitespace-nowrap hover:bg-[#1E293B] transition-colors"
                    >
                        Book Now
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

function NearbyCenterCard({ center, router }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={() => router.push(`/spa-salon/${center.slug || center.id}`)}
            className="bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden border border-[#f5edf3] cursor-pointer group hover:shadow-xl transition-all h-full flex flex-col"
        >
            <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100">
                <Image
                    src={center.image}
                    alt={center.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1544161515-436cead60470?auto=format&fit=crop&q=80&w=800';
                    }}
                 width={500} height={300} />
            </div>

            <div className="p-3.5 sm:p-5 flex flex-col flex-1 justify-between">
                <div>
                    <h4 className="text-sm sm:text-base font-bold text-[#0F172A] mb-1 line-clamp-1">{center.name}</h4>
                    <div className="flex items-center gap-1.5 text-[#64748B] text-xs mb-2">
                        <MapPin className="w-3.5 h-3.5 text-[#C06C84] flex-shrink-0" />
                        <span className="truncate leading-none">{center.address}</span>
                    </div>
                </div>

                <div className="mt-2">
                    <div className="flex items-end justify-between mb-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Starting from</span>
                            <p className="text-lg sm:text-xl font-bold text-[#0F172A] leading-tight">₹{center.price}/-</p>
                        </div>
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
        </motion.div>
    );
}






