'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    MapPin, Star, Search, Sliders, Heart, TrendingUp, X, Wifi, Utensils,
    Shirt, Zap, Award, Sparkles, ChevronRight, Check
} from 'lucide-react';
import { Input } from '@/components/pghostels/ui/input';
import { useLocationContext } from '@/context/LocationContext';

const amenityIcons = {
    WiFi: Wifi,
    Food: Utensils,
    AC: Zap,
    Laundry: Shirt,
    Gym: TrendingUp,
};

function PGResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { location, detectWithIP } = useLocationContext();

    // Params
    const categoryName = searchParams.get('categoryName');
    const subcategoryId = searchParams.get('subcategoryId');
    const roomType = searchParams.get('roomType');
    const budget = searchParams.get('budget');
    const duration = searchParams.get('duration');
    const food = searchParams.get('food');
    const moveIn = searchParams.get('moveIn');

    // State
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedItems, setSavedItems] = useState([]);
    const [showNearby, setShowNearby] = useState(false);
    const [error, setError] = useState(null);

    // Initial load
    useEffect(() => {
        // If no location, try to detect it
        if (!location) {
            detectWithIP().catch(err => console.log("Auto detect failed", err));
        }
    }, [location]);

    // Fetch listings
    useEffect(() => {
        const fetchListings = async () => {
            if (!subcategoryId) return; // Wait for subcategoryId (or handle 'all' case later)

            setLoading(true);
            try {
                // Default to Hyderabad coords if location is missing (or handle gracefully)


                const userLocationData = localStorage.getItem('user_location_data');
                const locationData = JSON.parse(userLocationData);


                console.log("locationData", locationData)


                const lat = locationData?.lat;
                const lng = locationData?.lng;

                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/professional-services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lattitude: lat, // Note: API uses 'lattitude' with double 't'
                        longitude: lng,
                        subcategoryId: subcategoryId,
                        // Include questionnaire responses
                        roomType,
                        budget,
                        duration,
                        food,
                        moveIn
                    })
                });

                const data = await response.json();

                if (data.success && data.professionalServices) {
                    // map API data to our UI model
                    const mappedListings = data.professionalServices.map(service => ({
                        id: service._id,
                        name: service.business_name || `${service.firstName || ''} ${service.lastName || ''}`.trim(),
                        location: service.address,
                        address: service.address,
                        rating: parseFloat(service.rating) || 4.5,
                        orders: service.totalOrders || 0,
                        // startingAt is the real price; minFare is booking cost — use startingAt first
                        monthlyPrice: parseFloat(service.startingAt || service.minFare) || 5000,
                        image: service.logo ? `https://api.doorstephub.com/${service.logo}` : 'https://images.unsplash.com/photo-1617430690223-3e165b390e25?auto=format&fit=crop&q=80',
                        distance: service.distance || 'N/A',
                        matchScore: service.matchScore || 90,
                        badges: Array.isArray(service.badges) && service.badges.length > 0
                            ? service.badges.map(b => b.charAt(0).toUpperCase() + b.slice(1))
                            : ['Verified'],
                        amenities: service.amenities && service.amenities.length > 0
                            ? service.amenities.map(a => typeof a === 'object' ? (a.title || 'Amenity') : a)
                            : ['WiFi', 'Food', 'AC'],
                        availableBeds: Math.floor(Math.random() * 5) + 1,
                        bio: service.bio
                    }));
                    setListings(mappedListings);
                } else {
                    setListings([]);
                }
            } catch (err) {
                console.error("Error fetching listings", err);
                setError("Failed to load listings. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [subcategoryId, location]); // Re-fetch if location updates

    const toggleSave = (id) => {
        setSavedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const filterChips = [];
    if (roomType) filterChips.push(roomType.replace('-', ' '));
    if (budget) filterChips.push(budget);

    const sortedListings = [...listings].sort((a, b) => b.matchScore - a.matchScore);
    const recommendedListings = sortedListings.slice(0, 3);
    const displayListings = showNearby
        ? [...sortedListings] // In real app, re-sort by distance
        : sortedListings;

    const PGCard = ({ listing, isNearby }) => {
        const isSaved = savedItems.includes(listing.id);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer relative"
            >
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-[#037166]/30">
                    {/* Image Section */}
                    <div className="relative h-64 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                            style={{ backgroundImage: `url(${listing.image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            {listing.badges.map((badge, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900"
                                >
                                    {badge}
                                </span>
                            ))}
                            {listing.availableBeds <= 3 && (
                                <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                                    Few beds left
                                </span>
                            )}
                        </div>

                        {/* Match Score Badge */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="absolute top-4 right-4 bg-gradient-to-br from-[#037166] to-[#025951] text-white px-4 py-2 rounded-2xl shadow-lg flex items-center space-x-2"
                        >
                            <Award className="w-4 h-4" />
                            <span className="font-bold">{listing.matchScore}%</span>
                            <span className="text-xs">match</span>
                        </motion.div>

                        {/* Distance Badge */}
                        {isNearby && (
                            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-[#037166] text-white rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{listing.distance} km away</span>
                            </div>
                        )}

                        {/* Save Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleSave(listing.id);
                            }}
                            className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                        >
                            <Heart
                                className={`w-5 h-5 transition-all ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-6" onClick={() => router.push(`/pghostels/hostel-detail/${listing.id}`)}>
                        {/* PG Name & Location */}
                        <div className="mb-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#037166] transition-colors line-clamp-1">
                                {listing.name}
                            </h3>
                            <div className="flex items-center text-gray-600 overflow-hidden">
                                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{listing.location}</span>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center space-x-1">
                                <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
                                <span className="font-bold text-gray-900">{listing.rating.toFixed(1)}</span>
                            </div>

                            {listing.availableBeds <= 5 && (
                                <div className="flex items-center space-x-1 text-[#037166]">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-sm font-medium">{listing.availableBeds} beds left</span>
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 mb-4 h-8 overflow-hidden">
                            {listing.amenities.slice(0, 3).map((amenity, i) => {
                                const amenityLabel = typeof amenity === 'object' ? (amenity.title || 'Amenity') : amenity;
                                const Icon = amenityIcons[amenityLabel] || Check;
                                return (
                                    <div
                                        key={i}
                                        className="px-3 py-1.5 bg-gray-100 rounded-lg flex items-center space-x-1.5 text-sm text-gray-700"
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{amenityLabel}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Price & CTA */}
                        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Starting at</div>
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-3xl font-bold text-gray-900">₹{listing.monthlyPrice.toLocaleString()}</span>
                                    {/* <span className="text-sm text-gray-500">/month</span> */}
                                </div>
                            </div>

                            <button className="px-6 py-3 bg-gradient-to-r from-[#037166] to-[#025951] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#037166]/30 transition-all flex items-center space-x-2">
                                <span>View Details</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-16">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#037166] to-[#025951] py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            {categoryName ? `${categoryName} Results` : 'PGs matched for you'}
                        </h1>
                        <p className="text-white/90 text-lg mb-4">
                            Based on your preferences + location
                        </p>

                        {/* Filter Chips */}
                        {filterChips.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {filterChips.map((chip, i) => (
                                    <span
                                        key={i}
                                        className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm font-medium flex items-center space-x-2"
                                    >
                                        <span>{chip}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
                >
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search by area, landmark, hostel name..."
                                className="pl-12 h-12 bg-gray-50 border-gray-200"
                            />
                        </div>
                        <button className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                            <Sliders className="w-5 h-5" />
                            <span className="hidden md:inline font-medium">Filters</span>
                        </button>
                    </div>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#037166]"></div>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-gray-600">No listings found in this category.</h2>
                        <p className="text-gray-500 mt-2">Try changing location or filters.</p>
                    </div>
                ) : (
                    <>
                        {/* Recommended Section (show first 3) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12"
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#037166] to-[#025951] rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {recommendedListings.map((listing) => (
                                    <PGCard key={listing.id} listing={listing} />
                                ))}
                            </div>
                        </motion.div>

                        {/* Tabs */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                                <button
                                    onClick={() => setShowNearby(false)}
                                    className={`px-6 py-2 rounded-lg font-medium transition-all ${!showNearby
                                        ? 'bg-gradient-to-r from-[#037166] to-[#025951] text-white'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    All PGs ({sortedListings.length})
                                </button>
                                <button
                                    onClick={() => setShowNearby(true)}
                                    className={`px-6 py-2 rounded-lg font-medium transition-all ${showNearby
                                        ? 'bg-gradient-to-r from-[#037166] to-[#025951] text-white'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Nearby PGs
                                </button>
                            </div>
                        </div>

                        {/* Listings Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {displayListings.map((listing) => (
                                <PGCard key={listing.id} listing={listing} isNearby={showNearby} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PGResultsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
            <PGResultsContent />
        </Suspense>
    );
}
