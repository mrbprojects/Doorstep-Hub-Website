'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, Heart, Wifi, Utensils, Shirt, TrendingUp } from 'lucide-react';
import { useLocationContext } from '@/context/LocationContext';

export function NearbyHostelsSection({ router }) {
    const { location } = useLocationContext();
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNearbyHostels = async () => {
            setLoading(true);
            try {
                // Using 'latest_pg_hostels' as requested for the nearby section
                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/products/latest_pg_hostels');

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
    }, []);

    if (loading) {
        return (
            <section className="py-20 bg-gray-50/50">
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
        <section className="py-20 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-4">
                        <MapPin className="w-3 h-3 text-[#037166]" />
                        <span className="text-xs font-medium text-[#037166]">NEAR YOU</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        Hostels Near You
                    </h2>
                    <p className="text-xl text-gray-600">
                        {location?.city ? `Best PG hostels in ${location.city}` : 'Discover nearby accommodations'}
                    </p>
                </motion.div>

                {/* Horizontal Scroll */}
                <div className="relative">
                    <div className="overflow-x-auto scrollbar-hide pb-4">
                        <div className="flex gap-6 min-w-max">
                            {hostels.map((hostel, index) => (
                                <motion.div
                                    key={hostel._id || index}
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -12, scale: 1.02 }}
                                    onClick={() => router.push(`/pghostels/hostel-detail/${hostel._id}`)}
                                    className="group relative flex-shrink-0 w-[22rem] cursor-pointer pl-2 py-4"
                                >
                                    <div className="relative h-[30rem] rounded-[2.5rem] overflow-hidden bg-white">
                                        <div className="absolute inset-0">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                                style={{ backgroundImage: `url("https://api.doorstephub.com/${hostel.image}")` }}
                                            />
                                            {/* Grey Finish Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-90" />
                                        </div>

                                        {/* Top Badges */}
                                        <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
                                            {index < 3 ? (
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-lg">
                                                    <TrendingUp className="w-3.5 h-3.5 text-[#ffcd3c]" />
                                                    <span className="text-xs font-bold text-white tracking-wide uppercase">Popular</span>
                                                </div>
                                            ) : <div />}

                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-lg">
                                                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                                <span className="text-xs font-bold text-gray-900">{hostel.rating || 4.5}</span>
                                            </div>
                                        </div>

                                        {/* Content Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                            {/* Amenities Row */}
                                            <div className="flex gap-2 mb-4">
                                                {[Wifi, Utensils, Shirt].map((Icon, j) => (
                                                    <div key={j} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90">
                                                        <Icon className="w-3.5 h-3.5" />
                                                    </div>
                                                ))}
                                            </div>

                                            <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1 leading-tight group-hover:text-[#4ddecb] transition-colors">
                                                {hostel.hostelName}
                                            </h3>

                                            <div className="flex items-center text-white/70 text-sm mb-6">
                                                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                                                <span className="truncate">{hostel.address || hostel.cityName}</span>
                                            </div>

                                            {/* Price & Action */}
                                            <div className="flex items-center justify-between pt-4 border-t border-white/10">


                                                <div className="w-12 h-12 bg-white text-[#037166] rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-[#037166] group-hover:text-white transition-all shadow-lg">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
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
