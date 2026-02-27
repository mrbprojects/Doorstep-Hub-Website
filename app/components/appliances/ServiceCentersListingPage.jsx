'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, MapPin, ArrowRight, Filter, X, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/hooks/useLocation';

export function ServiceCentersListingPage() {
    const router = useRouter();
    const { location } = useLocation();
    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRating, setSelectedRating] = useState(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [serviceSlugs, setServiceSlugs] = useState({
        home: 'appliance-repair-services',
        serviceCenter: 'nearby-service-centers'
    });

    useEffect(() => {
        const fetchSlugs = async () => {
            try {
                const res = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/get_slugs_by_serviceId/683daaa8f261c1548bdf7442');
                const data = await res.json();
                if (data.success && data.data) {
                    setServiceSlugs(prev => ({ ...prev, ...data.data }));
                }
            } catch (error) {
                console.error("Failed to fetch slugs:", error);
            }
        };
        fetchSlugs();
    }, []);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                setIsLoading(true);
                // Use location if available, otherwise try to detect or default
                let currentLoc = location;
                if (!currentLoc) {
                    // Default to Hyderabad if detection fails or is pending (matches ViewAllPage logic)
                    currentLoc = { lat: 17.3850, lng: 78.4867 };
                }

                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/get_service_center', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        lattitude: currentLoc.lat,
                        longitude: currentLoc.lng,
                        page: 1,
                        limit: 50
                    }),
                });

                if (!response.ok) throw new Error('Failed to fetch stores');
                const result = await response.json();

                if (result.success && result.nearByServiceCenters) {
                    setStores(result.nearByServiceCenters.map(item => ({
                        id: item._id,
                        name: item.name || `${item.firstName} ${item.lastName}`,
                        address: item.address || item.cityName || 'Location not specified',
                        rating: parseFloat(item.rating) || 4.5,
                        image: item.image ? `https://api.doorstephub.com/${item.image}` : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
                        reviews: item.reviews || 'New'
                    })));
                }
            } catch (error) {
                console.error('Error fetching stores:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStores();
    }, [location]);

    const handleRatingSelect = (rating) => {
        setSelectedRating(rating === selectedRating ? null : rating);
    };

    const handleStoreClick = (storeId) => {
        router.push(`/${serviceSlugs.home}/store/${storeId}`);
    };

    const ShimmerGrid = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="group">
                        <div className="relative h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 shadow-lg">
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-shimmer" />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#0a0a0a] text-white"
        >
            {/* Header */}
            <section className="bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] text-white py-12">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
                    <button
                        onClick={() => router.push(`/${serviceSlugs.home}`)}
                        className="inline-flex items-center gap-2 mb-6 px-4 py-2 mt-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h1 className="text-4xl md:text-5xl font-bold">Nearest Appliance Service Centers</h1>

                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                            <input
                                type="text"
                                placeholder="Search by name or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid Content */}
            <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
                <div className="flex gap-8">
                    {/* Sidebar Filter - Desktop */}
                    <motion.aside
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="hidden lg:block w-80 flex-shrink-0"
                    >
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 sticky top-24">
                            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Filter className="w-5 h-5 text-[#04a99d]" />
                                Filters
                            </h4>

                            {/* Rating Filter */}
                            <div className="mb-6">
                                <h6 className="block text-white/80 mb-3 text-sm font-medium">Minimum Rating</h6>
                                <div className="space-y-2">
                                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                                        <button
                                            key={rating}
                                            onClick={() => handleRatingSelect(rating)}
                                            className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedRating === rating
                                                ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white'
                                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                                                }`}
                                        >
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="text-sm">{rating}+ Stars</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reset Button */}
                            <button
                                onClick={() => setSelectedRating(null)}
                                className="w-full mt-6 px-4 py-3 rounded-lg border border-white/20 text-white/80 hover:bg-white/5 transition-all text-sm font-medium"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </motion.aside>

                    {/* Mobile Filter Button */}
                    <button
                        onClick={() => setFilterOpen(true)}
                        className="lg:hidden fixed bottom-6 right-6 z-50 px-6 py-3 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium shadow-2xl flex items-center gap-2"
                    >
                        <Filter className="w-5 h-5" />
                        Filters
                    </button>

                    {/* Main Content */}
                    <div className="flex-1">
                        {isLoading ? (
                            <>
                                <ShimmerGrid />
                                <style jsx>{`
                                    @keyframes shimmer {
                                        0% { background-position: -200% 0; }
                                        100% { background-position: 200% 0; }
                                    }
                                    .animate-shimmer {
                                        background-size: 200% 100%;
                                        animation: shimmer 1.5s infinite;
                                        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
                                    }
                                `}</style>
                            </>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {stores
                                    .filter(s => {
                                        const matchesRating = !selectedRating || s.rating >= selectedRating;
                                        const matchesSearch = !searchQuery ||
                                            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            s.address.toLowerCase().includes(searchQuery.toLowerCase());
                                        return matchesRating && matchesSearch;
                                    })
                                    .map((store, index) => (
                                        <motion.div
                                            key={store.id || index}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ y: -8 }}
                                            onClick={() => handleStoreClick(store.id)}
                                            className="group cursor-pointer"
                                        >
                                            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-[#1a1a1a] border border-white/10 h-full flex flex-col">
                                                <div className="relative h-48 overflow-hidden">
                                                    <img
                                                        src={store.image}
                                                        alt={store.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                </div>
                                                <div className="p-6 flex flex-col flex-1">
                                                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#04a99d] transition-colors line-clamp-1">
                                                        {store.name}
                                                    </h4>
                                                    <p className="text-white/60 text-sm mb-4 flex items-center gap-2 line-clamp-1">
                                                        <MapPin className="w-4 h-4 text-[#04a99d]" />
                                                        {store.address}
                                                    </p>
                                                    <div className="flex items-center gap-1 mb-4">
                                                        <Star className="w-4 h-4 fill-[#04a99d] text-[#04a99d]" />
                                                        <span className="text-white font-medium">{store.rating}</span>
                                                        <span className="text-white/40">({store.reviews} reviews)</span>
                                                    </div>
                                                    <button className="w-full mt-auto px-4 py-3 rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium hover:shadow-lg hover:shadow-[#037166]/30 transition-all flex items-center justify-center gap-2">
                                                        View Center
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                            </div>
                        )}
                        {!isLoading && stores.length === 0 && (
                            <div className="text-center py-20 text-gray-400">
                                No service centers found nearby.
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Filter Panel */}
                <AnimatePresence>
                    {filterOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setFilterOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 30 }}
                                className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] rounded-t-3xl border-t border-white/10 p-6 lg:hidden"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Filter className="w-5 h-5 text-[#04a99d]" />
                                        Filters
                                    </h4>
                                    <button
                                        onClick={() => setFilterOpen(false)}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-6 h-6 text-white" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h6 className="block text-white/80 mb-3 text-sm font-medium">Minimum Rating</h6>
                                        <div className="space-y-2">
                                            {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                                                <button
                                                    key={rating}
                                                    onClick={() => {
                                                        handleRatingSelect(rating);
                                                        setFilterOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedRating === rating
                                                        ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white'
                                                        : 'bg-white/5 text-white/70'
                                                        }`}
                                                >
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <span className="text-sm">{rating}+ Stars</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setFilterOpen(false)}
                                        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </section>
        </motion.div>
    );
}
