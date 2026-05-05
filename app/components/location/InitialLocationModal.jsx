'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Crosshair, Search, Shield, Sparkles, Loader2, X } from 'lucide-react';
import { useLocationContext } from '@/context/LocationContext';

export function InitialLocationModal() {
    const { location, detectWithGPS, isMapsLoaded, setManualLocation, searchLocation } = useLocationContext();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [view, setView] = useState('welcome'); // 'welcome', 'search'
    const [showAllCities, setShowAllCities] = useState(false);

    const ALL_CITIES = [
        'Hyderabad', 'Bangalore', 'Mumbai', 'Chennai', 'Vijayawada', 'Pune'
    ];

    const CITY_ICONS = {
        'Hyderabad': '/Hyderabad.png',
        'Bangalore': '/Banglore.png',
        'Mumbai': '/Mumbai.png',
        'Chennai': '/chennai.png',
        // 'Delhi': '/Delhi.png',
        // 'Kolkata': '/kolkata.png',
        'Vijayawada': '/Vijayawada.png',
        'Pune': '/pune.png'
    };

    const displayedCities = showAllCities ? ALL_CITIES : ALL_CITIES.slice(0, 4);

    useEffect(() => {
        // If no location is set, show the modal
        if (!location) {
            setIsOpen(true);
            // PROACTIVE: Try to trigger GPS immediately as per user request
            // Mobile browsers/Modern Chrome might block this, but we'll try!
            const autoDetect = async () => {
                setIsDetecting(true);
                try {
                    await detectWithGPS();
                    setIsOpen(false);
                } catch (error) {
                    console.log('Auto-detection blocked or failed, user must click.');
                    // Stay on welcome screen or auto-switch to search?
                    // User said "only ask for permission... instead of showing this message"
                    // So we stay quiet and wait for them to click if auto-detect fails
                } finally {
                    setIsDetecting(false);
                }
            };

            // Wait for maps to be ready conceptually, or just fire it
            const timer = setTimeout(autoDetect, 1500);
            return () => clearTimeout(timer);
        } else {
            setIsOpen(false);
        }
    }, [location]);

    const handleDetect = async () => {
        setIsDetecting(true);
        try {
            await detectWithGPS();
            setIsOpen(false);
        } catch (error) {
            console.error('GPS Detection failed:', error);
            setView('search'); // Fallback to search if GPS fails
        } finally {
            setIsDetecting(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await searchLocation(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelect = async (placeId) => {
        setIsSearching(true);
        try {
            await setManualLocation(placeId);
            setIsOpen(false);
        } catch (error) {
            console.error('Manual selection failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectCity = async (cityName) => {
        setIsSearching(true);
        try {
            const results = await searchLocation(cityName);
            if (results && results.length > 0) {
                // Find the best match - usually the one where main_text matches cityName
                const bestMatch = results.find(r => r.main_text.toLowerCase() === cityName.toLowerCase()) || results[0];
                await setManualLocation(bestMatch.place_id);
                setIsOpen(false);
            }
        } catch (error) {
            console.error('City selection failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6"
            >
                <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
                >
                    {/* Content Container */}
                    <div className="p-8 sm:p-10 text-center relative flex-1">
                        {/* Animated Background Orbs */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                            <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#037166] rounded-full blur-[100px] animate-pulse" />
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#04a99d] rounded-full blur-[100px] animate-pulse" />
                        </div>

                        {view === 'welcome' ? (
                            <>
                                <motion.div
                                    animate={isDetecting ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="w-20 h-20 bg-[#037166]/10 rounded-full flex items-center justify-center mx-auto mb-4 relative"
                                >
                                    <div className="absolute inset-0 bg-[#037166]/20 rounded-full animate-ping" />
                                    <img 
                                        src="/servicecenterpointlogo.png" 
                                        alt="Location" 
                                        className="w-10 h-10 object-contain relative z-10"
                                    />
                                </motion.div>

                                <h2 className="text-2xl font-bold font-ubuntu text-white mb-1">
                                    Location Permission
                                </h2>
                                <p className="text-gray-400 text-xs mb-6 max-w-sm mx-auto leading-relaxed">
                                    Doorstep Hub needs your area to show available services.
                                </p>

                                <div className="space-y-6 max-w-sm mx-auto">
                                    <button
                                        onClick={handleDetect}
                                        disabled={isDetecting}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#037166] to-[#04a99d] text-white rounded-2xl font-bold text-base hover:shadow-2xl hover:shadow-[#037166]/50 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isDetecting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Allowing Access...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Crosshair className="w-5 h-5" />
                                                <span>Enable My Location</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setView('search')}
                                        disabled={!isMapsLoaded}
                                        className="text-gray-400 hover:text-white text-xs font-medium transition-colors mb-2 block mx-auto"
                                    >
                                        {isMapsLoaded ? 'Or enter area manually' : 'Initializing Maps...'}
                                    </button>

                                    {/* Popular Cities on Welcome Screen */}
                                    <div className="pt-6 border-t border-white/5">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Popular Cities</div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                'Hyderabad', 'Bangalore', 'Mumbai', 'Chennai', 
                                                'Vijayawada', 'Pune'
                                            ].map(city => (
                                                <button
                                                    key={city}
                                                    onClick={() => handleSelectCity(city)}
                                                    disabled={isSearching}
                                                    className="flex flex-col items-center overflow-hidden rounded-lg bg-white/5 border border-white/10 hover:border-[#04a99d]/50 hover:bg-[#037166]/10 transition-all group disabled:opacity-50 focus:outline-none"
                                                >
                                                    <div className="w-full h-16 sm:h-20 bg-white flex items-center justify-center overflow-hidden">
                                                        {CITY_ICONS[city] ? (
                                                            <img 
                                                                src={CITY_ICONS[city]} 
                                                                alt={city} 
                                                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                                                            />
                                                        ) : (
                                                            <MapPin className="w-4 h-4 text-gray-400 group-hover:text-[#04a99d]" />
                                                        )}
                                                    </div>
                                                    <div className="w-full py-0.5 px-1 bg-black/40 backdrop-blur-sm">
                                                        <span className="text-[9px] font-bold uppercase tracking-tight truncate block text-center text-gray-300 group-hover:text-white transition-colors">{city}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <button
                                        onClick={() => setView('welcome')}
                                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-500 hover:text-white" />
                                    </button>
                                    <h3 className="text-xl font-bold text-white">Find Your Area</h3>
                                    <div className="w-10" />
                                </div>

                                <form onSubmit={handleSearch} className="relative mb-6 text-left">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        autoFocus
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Enter your street or city..."
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 outline-none focus:outline-none focus:ring-1 focus:ring-[#037166]/30 transition-all"
                                    />
                                    {isSearching && (
                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#037166] animate-spin" />
                                    )}
                                </form>

                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-2 text-left">
                                    {searchResults.length > 0 ? (
                                        searchResults.map((place, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelect(place.place_id)}
                                                className="w-full flex items-start gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#037166]/20">
                                                    <MapPin className="w-5 h-5 text-gray-500 group-hover:text-[#04a99d]" />
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium group-hover:text-[#04a99d] transition-colors">{place.main_text}</div>
                                                    <div className="text-sm text-gray-500 truncate max-w-md">{place.secondary_text}</div>
                                                </div>
                                            </button>
                                        ))
                                    ) : searchQuery && !isSearching ? (
                                        <div className="text-center py-12 text-gray-500">No results found</div>
                                    ) : (
                                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Popular Cities</h4>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {ALL_CITIES.map(city => (
                                                    <button
                                                        key={city}
                                                        onClick={() => handleSelectCity(city)}
                                                        disabled={isSearching}
                                                        className="flex flex-col items-center overflow-hidden rounded-lg bg-white/5 border border-white/10 hover:border-[#04a99d]/50 hover:bg-[#037166]/10 transition-all group disabled:opacity-50"
                                                    >
                                                        <div className="w-full h-12 sm:h-14 bg-white flex items-center justify-center overflow-hidden">
                                                            {CITY_ICONS[city] ? (
                                                                <img 
                                                                    src={CITY_ICONS[city]} 
                                                                    alt={city} 
                                                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                                                                />
                                                            ) : (
                                                                <MapPin className="w-4 h-4 text-gray-400 group-hover:text-[#04a99d]" />
                                                            )}
                                                        </div>
                                                        <div className="w-full py-0.5 px-1 bg-black/40 backdrop-blur-sm">
                                                            <span className="text-[9px] font-bold uppercase tracking-tight truncate block text-center text-gray-300 group-hover:text-white transition-colors">{city}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
