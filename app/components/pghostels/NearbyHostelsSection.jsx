'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Star, MapPin, Wifi, Utensils, Bed, ChevronRight, ChevronLeft, Flame, Sparkles } from 'lucide-react';
import { useLocationContext } from '@/context/LocationContext';

export function NearbyHostelsSection({ router }) {
    const { location } = useLocationContext();
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef(null);

    // Fallback listings matching the approved Hyderabad reference design
    const fallbackHostels = [
        {
            _id: 'nearby-1',
            slug: 'vara-lakshmilakshmi-pg-hostel',
            hostelName: 'VARA LAKSHMILAKSHMI PG & HOSTEL',
            address: 'SR Nagar, Hyderabad',
            cityName: 'Hyderabad',
            startingAt: 5500,
            image: '/pghostels/clean_hostel_1.png',
            rating: 4.5,
            badge: 'popular',
            isFallback: true
        },
        {
            _id: 'nearby-2',
            slug: 'rami-reddy-ladies-pg',
            hostelName: 'RAMI REDDY LADIES PG',
            address: 'Madhura Nagar, Hyderabad',
            cityName: 'Hyderabad',
            startingAt: 1299,
            image: '/pghostels/clean_hostel_2.png',
            rating: 4.3,
            badge: 'popular',
            isFallback: true
        },
        {
            _id: 'nearby-3',
            slug: 'radhe-coliving-mens-pg',
            hostelName: 'RADHE COLIVING MENS PG',
            address: 'Ayyappa Society, Hyderabad',
            cityName: 'Hyderabad',
            startingAt: 10999,
            image: '/pghostels/clean_hostel_3.png',
            rating: 4.3,
            badge: 'popular',
            isFallback: true
        },
        {
            _id: 'nearby-4',
            slug: 'svl-executive-women-hostel',
            hostelName: 'SVL EXECUTIVE WOMEN HOSTEL',
            address: 'A.S. Rao Nagar, Hyderabad',
            cityName: 'Hyderabad',
            startingAt: 5500,
            image: '/pghostels/clean_hostel_4.png',
            rating: 4.6,
            badge: 'featured',
            isFallback: true
        },
        {
            _id: 'nearby-5',
            slug: 'vijaya-deluxe-ladies-pg',
            hostelName: 'VIJAYA DELUXE LADIES PG',
            address: 'Sanjeeva Reddy Nagar, Hyderabad',
            cityName: 'Hyderabad',
            startingAt: 1299,
            image: '/pghostels/clean_hostel_5.png',
            rating: 4.3,
            badge: 'popular',
            isFallback: true
        }
    ];

    useEffect(() => {
        let isMounted = true;
        const fetchNearbyHostels = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/latest_pg_hostels`);
                if (!response.ok) {
                    throw new Error('Failed to fetch hostels');
                }
                const data = await response.json();
                if (isMounted && data.success && Array.isArray(data.hostels) && data.hostels.length > 0) {
                    setHostels(data.hostels);
                } else if (isMounted) {
                    setHostels([]);
                }
            } catch (err) {
                console.error('Error fetching nearby hostels:', err);
                if (isMounted) setHostels([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchNearbyHostels();
        return () => { isMounted = false; };
    }, [location?.lat, location?.lng]);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const amount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    const hasData = hostels && hostels.length > 0;
    const displayListings = hasData ? hostels.slice(0, 5) : fallbackHostels;
    const currentCity = location?.city || 'Hyderabad';

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#EBF9F5] via-[#F4FCF9] to-[#ECF9F5] py-7 sm:py-8 border-b border-[#DDF4EC]">
            {/* Left Decorative Teal Dot Grid */}
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 hidden xl:grid grid-cols-3 gap-1.5 opacity-30 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00796F]" />
                ))}
            </div>

            {/* Right Decorative Teal Dot Grid */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden xl:grid grid-cols-3 gap-1.5 opacity-30 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00796F]" />
                ))}
            </div>

            <div className="max-w-[1320px] mx-auto px-4 sm:px-6 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-4 sm:mb-5">
                    {/* Left: Eyebrow + Title + Subtitle */}
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DDF8F0] border border-[#BCEEDA] shadow-xs mb-1.5">
                            <MapPin className="w-3 h-3 text-[#00695C]" />
                            <span className="text-[10px] font-bold text-[#00695C] uppercase tracking-wider">
                                Near You
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#102033] tracking-tight leading-tight mb-1">
                            Hostels Near You
                        </h2>
                        <p className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed">
                            Discover the best PGs and hostels in {currentCity} with verified listings, genuine prices and comfortable stays for students and working professionals.
                        </p>
                    </div>

                    {/* Right: 500+ Verified Badge + Landmark sketch & Callout + View All Link */}
                    <div className="flex items-center gap-3 shrink-0 self-start lg:self-end">
                        {/* 500+ Verified Hostels Pill */}
                        <div className="hidden sm:flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 shadow-[0_2px_12px_rgba(0,121,111,0.06)] border border-[#E2F3EE]">
                            <div className="w-7 h-7 rounded-full bg-[#DDF8F0] flex items-center justify-center text-[#00796F] shrink-0">
                                <MapPin className="w-3.5 h-3.5 text-[#00796F]" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-xs font-black text-[#102033]">500+</span>
                                <span className="text-[9.5px] text-[#64748B] font-medium mt-0.5">Verified Hostels</span>
                            </div>
                        </div>

                        {/* Landmark Sketch & Handwritten Callout */}
                        <div className="hidden md:flex items-center gap-1.5 relative">
                            <Image
                                src="/pghostels/landmark_charminar.png"
                                alt="Hyderabad Landmark"
                                className="h-9 w-auto object-contain mix-blend-multiply opacity-90"
                             width={500} height={300} />
                            <div className="flex flex-col items-start -mt-1">
                                <span className="text-[11.5px] font-semibold text-[#00796F] italic tracking-tight font-serif whitespace-nowrap">
                                    Find great stays near you!
                                </span>
                                <svg className="w-10 h-2.5 text-[#00796F]" viewBox="0 0 60 16" fill="none">
                                    <path d="M2 3C20 12 40 14 55 5M55 5L48 2M55 5L52 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        {/* View All Button */}
                        <button
                            onClick={() => router.push('/pghostels/listings/nearby')}
                            className="inline-flex items-center gap-1 text-[#00796F] hover:text-[#005a53] font-bold text-xs sm:text-sm transition-colors py-1 pl-1"
                        >
                            <span>View All</span>
                            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                        </button>
                    </div>
                </div>

                {/* Carousel Row with 5 Columns filling desktop width */}
                <div className="relative group/carousel">
                    {/* Left Scroll Button */}
                    <button
                        onClick={() => scroll('left')}
                        aria-label="Previous hostels"
                        className="hidden md:flex absolute -left-3.5 lg:-left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-[#102033] hover:text-[#00796F] shadow-md border border-[#E2E8F0] items-center justify-center z-20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    {/* Right Scroll Button */}
                    <button
                        onClick={() => scroll('right')}
                        aria-label="Next hostels"
                        className="hidden md:flex absolute -right-3.5 lg:-right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#00796F] text-white hover:bg-[#00695C] shadow-md items-center justify-center z-20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    {/* Cards Track: 5 cards filling the desktop container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex lg:grid lg:grid-cols-5 gap-3 sm:gap-3.5 overflow-x-auto lg:overflow-visible scrollbar-hide py-1 px-0.5 scroll-smooth"
                    >
                        {loading && !hasData ? (
                            [...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-[72vw] xs:w-[65vw] sm:w-[42vw] md:w-[28vw] lg:w-auto h-[310px] sm:h-[320px] rounded-2xl bg-[#E2F0EA] animate-pulse shrink-0"
                                />
                            ))
                        ) : (
                            displayListings.map((hostel, index) => {
                                const hostelId = hostel._id || `hostel-${index}`;
                                const hostelSlug = hostel.slug || hostel.hostelSlug || hostelId;
                                const hostelName = hostel.hostelName || 'Comfort PG Stay';
                                const hostelLocation = hostel.address || hostel.cityName || 'Hyderabad';
                                const price = hostel.startingAt || hostel.defaultPrice || hostel.price || 5500;
                                const rating = hostel.rating || 4.5;
                                const isFeatured = hostel.badge === 'featured' || index === 3;
                                const isPopular = hostel.badge === 'popular' || (!isFeatured && index !== 3);

                                const imageUrl = hostel.image?.startsWith('http') || hostel.image?.startsWith('/')
                                    ? hostel.image
                                    : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${hostel.image}`;

                                const isClickable = !hostel.isFallback;

                                return (
                                    <motion.div
                                        key={hostelId}
                                        whileHover={{ y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        onClick={() => {
                                            if (isClickable) {
                                                router.push(`/pghostels/hostel/${hostelSlug}`);
                                            } else {
                                                router.push('/pghostels/listings/all');
                                            }
                                        }}
                                        className="w-[72vw] xs:w-[65vw] sm:w-[42vw] md:w-[28vw] lg:w-auto h-[310px] sm:h-[320px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-[0_4px_16px_rgba(16,32,51,0.08)] hover:shadow-[0_10px_24px_rgba(0,121,111,0.18)] transition-all duration-300 shrink-0 bg-[#0F1E2E]"
                                    >
                                        {/* Background Image */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                            style={{ backgroundImage: `url("${imageUrl}")` }}
                                        />

                                        {/* Dark Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1522] via-[#0B1522]/55 to-black/20 opacity-95" />

                                        {/* Top Badges */}
                                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                                            {/* Left Badge: Popular (Orange) or Featured (Teal) */}
                                            {isFeatured ? (
                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00796F] text-white shadow-xs">
                                                    <Sparkles className="w-2.5 h-2.5 text-white fill-white" />
                                                    <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Featured</span>
                                                </div>
                                            ) : isPopular ? (
                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF7A18] text-white shadow-xs">
                                                    <Flame className="w-2.5 h-2.5 text-white fill-white" />
                                                    <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Popular</span>
                                                </div>
                                            ) : (
                                                <div />
                                            )}

                                            {/* Right Badge: Rating Pill */}
                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 shadow-sm">
                                                <Star className="w-2.5 h-2.5 text-[#FFB800] fill-[#FFB800]" />
                                                <span className="text-[10.5px] font-black text-[#102033]">
                                                    {Number(rating).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Overlay at Bottom */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-3.5 z-10">
                                            {/* Amenity Icons */}
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <div className="w-5.5 h-5.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90">
                                                    <Wifi className="w-2.5 h-2.5" />
                                                </div>
                                                <div className="w-5.5 h-5.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90">
                                                    <Bed className="w-2.5 h-2.5" />
                                                </div>
                                                <div className="w-5.5 h-5.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90">
                                                    <Utensils className="w-2.5 h-2.5" />
                                                </div>
                                            </div>

                                            {/* Hostel Name */}
                                            <h3 className="text-[13px] sm:text-[13.5px] font-extrabold text-white mb-0.5 line-clamp-1 leading-snug tracking-tight uppercase group-hover:text-[#4ddecb] transition-colors">
                                                {hostelName}
                                            </h3>

                                            {/* Location with Pin */}
                                            <div className="flex items-center text-white/75 text-[10.5px] mb-2">
                                                <MapPin className="w-2.5 h-2.5 mr-1 text-[#4ddecb] shrink-0" />
                                                <span className="truncate">{hostelLocation}</span>
                                            </div>

                                            {/* Bottom Divider & Price Bar */}
                                            <div className="flex items-center justify-between pt-2 border-t border-white/15">
                                                <div className="flex flex-col">
                                                    <span className="text-[8.5px] text-white/60 uppercase tracking-wider font-semibold leading-none mb-0.5">Starts at</span>
                                                    <span className="text-sm sm:text-base font-black text-white leading-tight">
                                                        ₹{Number(price).toLocaleString('en-IN')}/-
                                                    </span>
                                                </div>

                                                {/* Circular Arrow Button */}
                                                <div className="w-7 h-7 rounded-full bg-white text-[#00796F] group-hover:bg-[#00796F] group-hover:text-white flex items-center justify-center shadow-md transition-all">
                                                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
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
        </section>
    );
}
