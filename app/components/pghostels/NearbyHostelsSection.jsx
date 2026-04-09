'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, Heart, Wifi, Utensils, Shirt, TrendingUp, ChevronRight } from 'lucide-react';
import { useLocationContext } from '@/context/LocationContext';

export function NearbyHostelsSection({ router }) {
    const { location } = useLocationContext();
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNearbyHostels = async () => {
            if (!location?.lat || !location?.lng) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/latest_pg_hostels`);

                if (!response.ok) {
                    throw new Error('Failed to fetch hostels');
                }

                const data = await response.json();

                if (data.success && Array.isArray(data.hostels)) {
                    setHostels(data.hostels);
                } else {
                    setHostels([]);
                }

            } catch (err) {
                console.error('Error fetching hostels:', err);
                setError('Failed to load hostels');
            } finally {
                setLoading(false);
            }
        };
        fetchNearbyHostels();
    }, [location?.lat, location?.lng]);

    if (!location) {
        return (
            <section className="py-20 mt-5 bg-transparent">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#037166]/10 mb-6">
                        <MapPin className="w-8 h-8 text-[#037166]" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Location Required</h2>
                    <p className="text-gray-600 max-w-lg mx-auto mb-8">
                        Please provide your location to see the best PG hostels near you.
                    </p>
                    <button
                        onClick={() => {
                            const locationBtn = document.querySelector('[data-location-trigger]');
                            if (locationBtn) locationBtn.click();
                        }}
                        className="px-8 py-3 bg-gradient-to-r from-[#037166] to-[#04a99d] text-white rounded-full font-bold shadow-lg shadow-[#037166]/30 hover:scale-105 transition-all"
                    >
                        Select Location
                    </button>
                </div>
            </section>
        )
    }

    if (loading) {
        return (
            <section className="py-20 bg-transparent">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="mb-12">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
                        <div className="h-6 bg-gray-200 rounded w-64 animate-pulse" />
                    </div>
                    <div className="flex gap-6 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-80 h-[400px] rounded-3xl bg-gray-200 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error || hostels.length === 0) {
        return null; // Don't show section if no hostels or error
    }

    return (
        <section className="py-12 bg-transparent">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex justify-between items-end mb-8"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-3">
                            <MapPin className="w-3 h-3 text-[#037166]" />
                            <span className="text-xs font-medium text-[#037166]">NEAR YOU</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">
                            Hostels Near You
                        </h2>
                        <p className="text-lg text-gray-600">
                            {location?.city ? `Best PG hostels in ${location.city}` : 'Discover nearby accommodations'}
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/pghostels/listings/nearby')}
                        className="hidden md:flex items-center space-x-2 text-[#037166] font-semibold hover:text-[#025951] transition-colors mb-2"
                    >
                        <span>View All</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </motion.div>

                {/* Horizontal Scroll */}
                <div className="relative">
                    <div className="overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1">
                        <div className="flex gap-3 md:gap-4 pb-2">
                            {hostels.map((hostel, index) => (
                                <motion.div
                                    key={hostel._id || index}
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    onClick={() => router.push(`/pghostels/${hostel.slug || hostel._id}`)}
                                    className="group relative flex-shrink-0 w-[85vw] sm:w-[45vw] md:w-[30vw] lg:w-[calc((100%-80px)/6)] cursor-pointer py-2"
                                >
                                    <div className="relative h-[25rem] rounded-[1.5rem] overflow-hidden bg-white shadow-md">
                                        <div className="absolute inset-0">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-110"
                                                style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${hostel.image})` }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent opacity-95" />
                                        </div>

                                        {/* Top Badges */}
                                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                                            {index < 3 ? (
                                                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                                                    <TrendingUp className="w-3 h-3 text-[#ffcd3c]" />
                                                    <span className="text-[10px] font-bold text-white uppercase">Popular</span>
                                                </div>
                                            ) : <div />}

                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/90 shadow-lg">
                                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                                <span className="text-[10px] font-bold text-gray-900">{hostel.rating || 4.5}</span>
                                            </div>
                                        </div>

                                        {/* Content Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                                            <div className="flex gap-1.5 mb-3">
                                                {[Wifi, Utensils, Shirt].map((Icon, j) => (
                                                    <div key={j} className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90">
                                                        <Icon className="w-3 h-3" />
                                                    </div>
                                                ))}
                                            </div>

                                            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 leading-tight group-hover:text-[#4ddecb] transition-colors uppercase">
                                                {hostel.hostelName}
                                            </h3>

                                            <div className="flex items-center text-white/70 text-xs mb-4">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                <span className="truncate">{hostel.address || hostel.cityName}</span>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-white/60 uppercase">Starts at</span>
                                                    <span className="text-xl font-bold text-white">₹{Number(hostel.startingAt || hostel.defaultPrice || hostel.price || 0).toLocaleString()}/-</span>
                                                </div>
                                                <div className="w-10 h-10 bg-white text-[#037166] rounded-full flex items-center justify-center group-hover:bg-[#037166] group-hover:text-white transition-all shadow-lg">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
