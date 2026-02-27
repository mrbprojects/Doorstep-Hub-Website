'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowLeft, Star, MapPin, Clock, Filter, X, Zap, RotateCcw } from 'lucide-react';
import { useLocationContext } from '@/context/LocationContext';

export function PartnersListingPage({ category, subCategory, childCategoryId }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [filterOpen, setFilterOpen] = useState(false);
    const [minRating, setMinRating] = useState(parseFloat(searchParams.get('rating')) || 0);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const { location } = useLocationContext();

    const handleRatingChange = (rating) => {
        const newRating = rating === minRating ? 0 : rating;
        setMinRating(newRating);

        const params = new URLSearchParams(searchParams.toString());
        if (newRating > 0) {
            params.set('rating', newRating.toString());
        } else {
            params.delete('rating');
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const resetFilters = () => {
        setMinRating(0);
        const params = new URLSearchParams(searchParams.toString());
        params.delete('rating');
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
        const fetchServices = async () => {
            if (!childCategoryId || !location?.lat || !location?.lng) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const body = {
                    lattitude: location.lat,
                    longitude: location.lng
                };

                if (minRating > 0) {
                    body.minRating = minRating;
                }

                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/services_by_childcategory', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (!response.ok) throw new Error('Failed to fetch data');

                const data = await response.json();
                if (data.success && data.dhubServices && data.dhubServices.length > 0) {
                    // Fetch all services for slug enrichment
                    const allRes = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/all-services');
                    const allData = await allRes.json();
                    const allServices = allData.success && Array.isArray(allData.data) ? allData.data : [];

                    const enriched = data.dhubServices.map(service => {
                        // Standardized slug generation to handle missing API slugs
                        const slug = service.slug || allServices.find(as => as._id === service._id)?.slug || service.serviceName?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || 'service';
                        return { ...service, slug };
                    });
                    setServices(enriched);
                } else {
                    setServices([]);
                }
            } catch (error) {
                console.error("Error fetching services:", error);
                setServices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [childCategoryId, location?.lat, location?.lng, minRating]);

    const filteredServices = services.filter(service => (service.rating || 0) >= minRating);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen pt-20"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] border-b border-white/10 shadow-lg">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                            {subCategory}
                        </h1>
                        <p className="text-white/80">{category} • Professional Service Partners</p>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Filter */}
                    <motion.aside
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden lg:block w-80 flex-shrink-0"
                    >
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 sticky top-24">
                            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Filter className="w-5 h-5 text-[#04a99d]" />
                                Filters
                            </h4>

                            <div className="mb-6">
                                <h6 className="block text-white/80 mb-3 text-sm font-medium">Minimum Rating</h6>
                                <div className="space-y-2">
                                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                                        <button
                                            key={rating}
                                            onClick={() => handleRatingChange(rating)}
                                            className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${minRating === rating
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

                            <button
                                onClick={resetFilters}
                                className="w-full mt-6 px-4 py-3 rounded-lg border border-white/20 text-white/80 hover:bg-white/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset Filters
                            </button>
                        </div>
                    </motion.aside>

                    {/* Service Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />
                                ))
                            ) : filteredServices.length > 0 ? (
                                filteredServices.map((service, index) => (
                                    <motion.div
                                        key={service._id || index}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        className="group cursor-pointer"
                                        onClick={() => router.push(`/${service.slug}`)}
                                    >
                                        <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 hover:border-[#037166]/50 transition-all duration-300">
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={service.mainImage ? `https://api.doorstephub.com/${service.mainImage}` : 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400'}
                                                    alt={service.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
                                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white text-xs font-bold flex items-center gap-1">
                                                    <Zap className="w-3 h-3" />
                                                    Verified
                                                </div>

                                                {/* Rating Badge - Bottom Left Flush */}
                                                <div className="absolute bottom-0 left-0 z-20">
                                                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-tr-xl bg-black/60 backdrop-blur-md border-t border-r border-white/10">
                                                        <Star className="w-4 h-4 fill-[#04a99d] text-[#04a99d]" />
                                                        <span className="text-sm font-bold text-white">{service.rating || '4.8'}</span>
                                                        {service.totalOrders > 0 && <span className="text-white/40 text-xs">({service.totalOrders})</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#04a99d] transition-colors line-clamp-1">
                                                    {service.name}
                                                </h4>
                                                <p className="text-white/60 text-sm mb-4 line-clamp-2">{service.description}</p>

                                                <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium hover:shadow-lg transition-all">
                                                    Book Now
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 text-white/60 bg-white/5 rounded-3xl border border-white/5">
                                    🥺 No verified partners found in this area.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filters */}
            <button
                onClick={() => setFilterOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-50 px-6 py-3 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium shadow-2xl flex items-center gap-2"
            >
                <Filter className="w-5 h-5" />
                Filters
            </button>

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
                            className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-3xl p-6 lg:hidden"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-xl font-bold text-white">Filters</h4>
                                <button onClick={() => setFilterOpen(false)}><X className="w-6 h-6" /></button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h6 className="text-white/80 mb-3 text-sm">Minimum Rating</h6>
                                    <div className="flex flex-wrap gap-2">
                                        {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                                            <button
                                                key={rating}
                                                onClick={() => {
                                                    handleRatingChange(rating);
                                                    setFilterOpen(false);
                                                }}
                                                className={`px-4 py-2 rounded-lg text-sm ${minRating === rating ? 'bg-[#037166] text-white' : 'bg-white/5 text-white/70'}`}
                                            >
                                                {rating}+ Stars
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setFilterOpen(false)}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
