'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, Star, MapPin, Clock, Heart, ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocationContext } from '@/context/LocationContext';
import { useEffect } from 'react';



const filters = [
    'All Services',
    'Highest Rated',
    'Price: Low to High',
    'Price: High to Low',
    'Nearest First',
];

export function ResultsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All Services');
    const [showFilters, setShowFilters] = useState(false);

    // Location Context
    const { location, detectLocation } = useLocationContext();

    useEffect(() => {
        // No auto-detection, let the user trigger or wait for context
    }, [location]);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                if (!location) {
                    setLoading(false);
                    return;
                }

                const lat = location.lat.toString();
                const lng = location.lng.toString();

                const subcategoryId = searchParams.get('subcategoryId') || "6957be10cc45593206b6e6c8"; // Fallback for testing
                const categoryId = searchParams.get('categoryId') || "";

                const filterMap = {
                    'All Services': '',
                    'Highest Rated': 'rating',
                    'Price: Low to High': 'price_low',
                    'Price: High to Low': 'price_high',
                    'Nearest First': 'nearest'
                };

                let currentSortBy = filterMap[selectedFilter] || '';
                if (activeTab === 'nearby') {
                    currentSortBy = 'nearest';
                }

                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/professional-services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subcategoryId: subcategoryId,
                        categoryId: categoryId,
                        serviceId: "",
                        searchQuery: searchQuery,
                        minPrice: 100,
                        maxPrice: 500000,
                        minRating: 4,
                        sortBy: currentSortBy,
                        lattitude: lat,
                        longitude: lng
                    })
                });

                const data = await response.json();

                if (data.success && data.professionalServices) {
                    const mappedServices = data.professionalServices.map(service => {
                        let distanceStr = '0.0 km';
                        if (service.location?.coordinates && lat && lng) {
                            const [sLng, sLat] = service.location.coordinates;
                            const dist = calculateDistance(parseFloat(lat), parseFloat(lng), sLat, sLng);
                            distanceStr = `${dist.toFixed(1)} km`;
                        }

                        return {
                            id: service._id,
                            name: service.business_name || `${service.firstName} ${service.lastName}`,
                            provider: service.business_name || 'Professional Service',
                            image: service.logo ? `https://api.doorstephub.com/${service.logo}` : 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37f?auto=format&fit=crop&q=80&w=800',
                            rating: parseFloat(service.rating) || 4.5,
                            reviews: service.totalOrders || 0,
                            price: service.startingAt || service.BasePrice || service.minFare || 0,
                            duration: '60 min',
                            distance: service.distance || distanceStr,
                            availability: service.badges?.[0] || 'Available',
                            isNearby: true,
                            address: service.address,
                            slug: service.slug
                        };
                    });
                    setServices(mappedServices);
                } else {
                    setServices([]);
                }
            } catch (error) {
                console.error("Error fetching spa services:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchServices();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchParams, location, activeTab, selectedFilter, searchQuery]);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const filteredServices = services.filter(service => {
        const matchesTab = activeTab === 'all' || (activeTab === 'nearby' && service.isNearby);
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.provider.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#F6F7FB] pt-20">
            {/* Header */}
            <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-xl border-b border-[#E8ECF2] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Back Button */}
                    <motion.button
                        whileHover={{ x: -5 }}
                        onClick={() => router.push('/spa-salon')}
                        className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] mb-6 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Home
                    </motion.button>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
                                Spa Services <span className="text-[#C06C84]">Matched for You</span>
                            </h1>
                            <p className="text-[#64748B]">
                                {filteredServices.length} services available
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-[#E8ECF2] rounded-xl text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:border-[#C06C84] transition-colors shadow-sm"
                            />
                        </div>

                        {/* Filter Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E8ECF2] rounded-xl text-[#0F172A] hover:border-[#C06C84] transition-colors shadow-sm"
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            Filters
                        </motion.button>
                    </div>

                    {/* Filter Chips */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-wrap gap-3 mt-6"
                        >
                            {filters.map((filter) => (
                                <motion.button
                                    key={filter}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedFilter(filter)}
                                    className={`px-4 py-2 rounded-lg border transition-all ${selectedFilter === filter
                                        ? 'bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] border-transparent text-white'
                                        : 'bg-[#F6F7FB] border-[#E8ECF2] text-[#64748B] hover:border-[#C06C84]'
                                        }`}
                                >
                                    {filter}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-4 mt-6">
                        <TabButton
                            active={activeTab === 'all'}
                            onClick={() => setActiveTab('all')}
                        >
                            All Services
                        </TabButton>

                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {!location && !loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[#E8ECF2] shadow-xl">
                        <div className="p-6 rounded-full bg-[#F6F7FB] mb-6">
                            <MapPin className="h-12 w-12 text-[#C06C84] animate-bounce" />
                        </div>
                        <h2 className="text-3xl font-bold text-[#0F172A] mb-3">Where are you?</h2>
                        <p className="text-[#64748B] text-center max-w-md mb-8 px-6 leading-relaxed">
                            Discover the best spas and salons in your neighborhood. Please set your location to continue.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => detectLocation()}
                            className="px-10 py-4 bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] text-white rounded-2xl font-bold shadow-lg shadow-[#C06C84]/30 hover:shadow-[#C06C84]/50 transition-all"
                        >
                            Find Near Me
                        </motion.button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            [1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#E8ECF2] shadow-md animate-pulse">
                                    {/* Image shimmer */}
                                    <div className="h-56 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
                                    {/* Content shimmer */}
                                    <div className="p-6">
                                        <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-2" />
                                        <div className="h-4 bg-gray-100 rounded-lg w-1/2 mb-5" />
                                        <div className="flex gap-3 mb-4">
                                            <div className="h-4 bg-gray-200 rounded-lg w-20" />
                                            <div className="h-4 bg-gray-100 rounded-lg w-16" />
                                        </div>
                                        <div className="h-4 bg-gray-100 rounded-lg w-28 mb-6" />
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                            <div className="h-7 bg-gray-200 rounded-lg w-20" />
                                            <div className="h-9 bg-gray-200 rounded-xl w-28" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : filteredServices.map((service, index) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                index={index}
                                router={router}
                            />
                        ))}
                    </div>
                )}

                {!loading && filteredServices.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-[#0F172A] mb-2">No services found</h3>
                        <p className="text-[#64748B]">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`relative px-6 py-3 rounded-lg font-medium transition-all ${active
                ? 'text-white'
                : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
        >
            {children}
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] rounded-lg -z-10"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
            )}
            {!active && (
                <div className="absolute inset-0 bg-[#F6F7FB] rounded-lg -z-10" />
            )}
        </button>
    );
}

function ServiceCard({ service, index, router }) {
    const [isWishlisted, setIsWishlisted] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            onClick={() => router.push(`/${service.slug || service.id}`)}
            className="bg-white rounded-2xl overflow-hidden border border-[#E8ECF2] cursor-pointer group shadow-md hover:shadow-xl transition-all"
        >
            {/* Image */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Wishlist Button */}
                {/* <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsWishlisted(!isWishlisted);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#C06C84] hover:bg-white transition-colors shadow-md"
                >
                    <Heart
                        className={`w-5 h-5 ${isWishlisted ? 'fill-[#C06C84] text-[#C06C84]' : ''}`}
                    />
                </motion.button> */}

                {/* Availability Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${service.availability === 'Available Today'
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-[#6C5CE7] text-white'
                    }`}>
                    {service.availability}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-semibold text-[#0F172A] mb-1">{service.name}</h3>
                <p className="text-[#64748B] text-sm mb-4">{service.provider}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-[#C06C84]">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-[#0F172A] font-medium">{service.rating}</span>
                        <span className="text-[#64748B] text-sm">({service.reviews})</span>
                    </div>
                    {/* <div className="flex items-center gap-1 text-[#64748B]">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{service.duration}</span>
                    </div> */}
                </div>

                {/* Distance */}
                {service.isNearby && (
                    <div className="flex items-center gap-1 text-[#64748B] mb-4">
                        <MapPin className="w-4 h-4 text-[#C06C84]" />
                        <span className="text-sm">{service.distance} away</span>
                    </div>
                )}

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-[#E8ECF2]">
                    <div>
                        <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mb-0.5">Starting at</p>
                        <p className="text-2xl font-bold text-[#0F172A]">₹{service.price}</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/${service.slug || service.id}`);
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#C06C84]/50 transition-all"
                    >
                        View Details
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
