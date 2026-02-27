'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Star, MapPin, Clock, Heart, ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function FeaturedPackagesPage() {
    const router = useRouter();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');

    const filters = ['All', 'Top Rated', 'Near Me', 'Starting Price'];

    useEffect(() => {
        const fetchFeaturedStores = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/products/featured_spa_stores');
                const data = await response.json();

                if (data.success && data.stores) {
                    const mappedStores = data.stores.map(store => ({
                        id: store._id,
                        name: store.storeName || 'Spa Center',
                        image: store.image
                            ? (store.image.startsWith('http') ? store.image : `https://api.doorstephub.com/${store.image}`)
                            : 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80',
                        rating: store.totalRatings || 0,
                        price: store.startingAt || 499,
                        duration: store.duration || '60 min',
                        reviews: store.reviewsCount || 100,
                        location: store.cityName || 'Nearby',
                        address: store.address || store.cityName,
                    }));
                    setStores(mappedStores);
                }
            } catch (error) {
                console.error("Failed to fetch featured spa stores:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedStores();
    }, []);

    const filteredStores = stores
        .filter(store => {
            const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                store.location.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            // Actual Filtering
            if (selectedFilter === 'Top Rated') return store.rating >= 4.5;
            if (selectedFilter === 'Near Me') return store.location.toLowerCase() === 'hyderabad'; // Basic matching for demo

            return true;
        })
        .sort((a, b) => {
            if (selectedFilter === 'Starting Price') return a.price - b.price;
            if (selectedFilter === 'Top Rated') return b.rating - a.rating;
            return 0;
        });

    return (
        <div className="min-h-screen bg-[#F6F7FB] pt-20">
            {/* Header */}
            <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-xl border-b border-[#E8ECF2] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <motion.button
                        whileHover={{ x: -5 }}
                        onClick={() => router.push('/spa-salon')}
                        className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] mb-6 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Spa & Salon
                    </motion.button>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                <span className="bg-gradient-to-r from-[#026b60] via-[#9b435a] to-[#026b60] bg-clip-text text-transparent">
                                    Featured Packages
                                </span>
                            </h1>
                            <p className="text-[#64748B]">
                                {filteredStores.length} exclusive wellness centers available
                            </p>
                        </div>

                        <div className="flex-1 max-w-md w-full">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                                <input
                                    type="text"
                                    placeholder="Search by center name or location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-[#E8ECF2] rounded-xl text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:border-[#C06C84] transition-colors shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filter Chips */}
                    <div className="flex flex-wrap gap-3 mt-8">
                        {filters.map((filter) => (
                            <motion.button
                                key={filter}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedFilter(filter)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all shadow-sm border ${selectedFilter === filter
                                    ? 'bg-[#C06C84] border-[#C06C84] text-white shadow-[#C06C84]/20'
                                    : 'bg-white border-[#E8ECF2] text-[#64748B] hover:border-[#C06C84] hover:text-[#C06C84]'
                                    }`}
                            >
                                {filter}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-[480px] bg-gray-200 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredStores.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredStores.map((store, index) => (
                            <StoreListingCard key={store.id} store={store} index={index} router={router} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">✨</div>
                        <h3 className="text-2xl font-bold text-[#0F172A] mb-2">No packages found</h3>
                        <p className="text-[#64748B]">Try different search terms or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StoreListingCard({ store, index, router }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -10 }}
            onClick={() => router.push(`/spa-salon/detail/${store.id}`)}
            className="bg-white rounded-2xl overflow-hidden border border-[#E8ECF2] cursor-pointer group shadow-lg hover:shadow-xl transition-all h-[480px] flex flex-col"
        >
            <div className="relative h-56 overflow-hidden">
                <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {store.rating > 0 && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Star className="w-3.5 h-3.5 fill-[#C06C84] text-[#C06C84]" />
                        <span className="text-sm font-bold text-[#0F172A]">{store.rating}</span>
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                    <div className="flex items-center gap-2 text-[#64748B] text-xs mb-2">
                        <MapPin className="w-3.5 h-3.5 text-[#C06C84]" />
                        <span className="line-clamp-1">{store.address}</span>
                    </div>
                    <h4 className="text-xl font-bold text-[#0F172A] mb-3 line-clamp-2 h-14">{store.name}</h4>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-[#FBEAF0] text-[#C06C84] text-[10px] font-bold uppercase rounded">Top Choice</span>
                        <span className="px-2 py-1 bg-[#F0F3FF] text-[#6C5CE7] text-[10px] font-bold uppercase rounded">Verified</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-[#F1F5F9]">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-2xl font-bold text-[#0F172A]">₹{store.price}</p>
                            <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Starting Price</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-[#64748B]">{store.reviews} Reviews</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-[#C06C84] text-white rounded-xl font-semibold text-sm hover:bg-[#A3526D] transition-colors shadow-md"
                    >
                        Book Appointment
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
