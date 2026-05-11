'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, ChevronDown, Search, Crosshair, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from '@/hooks/useLocation';

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

export function LocationBar({ theme = {} }) {
    const { location, detectWithGPS, searchLocation, setManualLocation, loading, error } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Default Dark Theme (Fallback)
    const defaultTheme = {
        bgScrolled: 'bg-[#0a0a0a]/80',
        textMain: 'text-gray-300',
        textHover: 'text-[#037166]', // Accent color
        border: 'border-[#037166]/20',
        buttonBg: 'bg-[#1a1a1a]',
    };

    // Merge provided theme with default or use if comprehensive
    const t = typeof theme === 'object' && Object.keys(theme).length > 0 ? theme : defaultTheme;

    // Extract accent color for icons
    const accentClass = t.textHover.replace('text-', '');
    const accentText = t.textHover;
    const accentBorder = t.border;

    // Auto-search as user types (Debounced)
    useEffect(() => {
        const debounceTimer = setTimeout(async () => {
            if (searchQuery.trim().length >= 3) {
                setIsSearching(true);
                try {
                    const results = await searchLocation(searchQuery);
                    setSearchResults(results);
                } catch (error) {
                    console.error('Search failed:', error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else if (searchQuery.trim().length === 0) {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, searchLocation]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        const results = await searchLocation(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
    };

    const handleSelectLocation = async (place) => {
        setIsSearching(true);
        try {
            await setManualLocation(place.place_id);
            setIsOpen(false);
            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            console.error('Failed to set location:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleDetectCurrent = async () => {
        setIsDetecting(true);
        try {
            await detectWithGPS();
            setTimeout(() => {
                setIsOpen(false);
            }, 500);
        } catch (error) {
            console.error('GPS detection failed:', error);
        } finally {
            setIsDetecting(false);
        }
    };

    return (
        <>
            {/* Navbar Trigger */}
            <motion.button
                onClick={() => setIsOpen(true)}
                data-location-trigger
                className={`hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl glass-button-premium border transition-all group mr-2 focus:outline-none ${t.buttonBg} hover:bg-opacity-80 ${t.border}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex flex-col items-start min-w-[100px] max-w-[160px]">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold opacity-70 ${t.textMain}`}>
                        {location ? 'Your Location' : 'Location'}
                    </span>
                    <span className={`text-xs font-medium truncate w-full text-left ${t.textMain}`}>
                        {loading ? 'Detecting...' : location ? location.shortAddress : 'Select location'}
                    </span>
                </div>
                <ChevronDown className={`w-3 h-3 opacity-50 ${t.textMain} group-hover:opacity-100 transition-opacity`} />
            </motion.button>

            {/* Modal / Dropdown - Using Portal to escape Header stacking context */}
            {mounted && typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4 overflow-hidden">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />

                            {/* Modal Content */}
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                className={`relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden`}
                            >
                                {/* Header */}
                                <div className={`p-4 border-b border-gray-100 flex items-center justify-between bg-white`}>
                                    <h3 className={`text-lg font-bold text-gray-900`}>Change Location</h3>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500`}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Search Body */}
                                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-4 bg-white">
                                    {/* Search Input */}
                                    <form onSubmit={handleSearch} className="relative">
                                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search for area, street name..."
                                            className={`w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#037166]/20 transition-all`}
                                            autoFocus
                                        />
                                        {isSearching && (
                                            <Loader2 className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#037166]`} />
                                        )}
                                    </form>

                                    {/* Detect Button - Hide when searching */}
                                    {!searchQuery && (
                                        <button
                                            onClick={handleDetectCurrent}
                                            disabled={isDetecting}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group text-left border border-transparent hover:border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <div className={`w-11 h-11 rounded-full bg-[#037166]/10 flex items-center justify-center transition-colors group-hover:bg-[#037166] group-hover:text-white text-[#037166]`}>
                                                {isDetecting ? (
                                                    <Loader2 className={`w-5 h-5 animate-spin`} />
                                                ) : (
                                                    <Crosshair className={`w-5 h-5`} />
                                                )}
                                            </div>
                                            <div>
                                                <div className={`font-semibold text-gray-900 group-hover:text-[#037166] transition-colors`}>
                                                    {isDetecting ? 'Detecting location...' : 'Use current location'}
                                                </div>
                                                <div className="text-xs text-gray-500">Using GPS</div>
                                            </div>
                                        </button>
                                    )}

                                    {/* Available Cities Section - Show when NOT searching */}
                                    {!searchQuery && (
                                        <div className="mt-4">
                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Available Cities</div>
                                            <div className="grid grid-cols-4 gap-3">
                                                {[
                                                    'Hyderabad', 'Bangalore', 'Mumbai', 'Chennai', 
                                                    'Vijayawada', 'Pune'
                                                ].map((city) => (
                                                    <button
                                                        key={city}
                                                        onClick={async () => {
                                                            setIsSearching(true);
                                                            try {
                                                                const results = await searchLocation(city);
                                                                if (results && results.length > 0) {
                                                                    await handleSelectLocation(results[0]);
                                                                }
                                                            } catch (err) {
                                                                console.error('City search failed:', err);
                                                            } finally {
                                                                setIsSearching(false);
                                                            }
                                                        }}
                                                        className={`flex flex-col items-center overflow-hidden rounded-xl border border-gray-100 transition-all focus:outline-none bg-white hover:border-[#037166] hover:bg-[#037166]/5 group shadow-sm hover:shadow-md`}
                                                    >
                                                        <div className="w-full h-12 bg-white flex items-center justify-center overflow-hidden border-b border-gray-50">
                                                            {CITY_ICONS[city] ? (
                                                                <img 
                                                                    src={CITY_ICONS[city]} 
                                                                    alt={city} 
                                                                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" 
                                                                />
                                                            ) : (
                                                                <MapPin className="w-4 h-4 text-[#037166]" />
                                                            )}
                                                        </div>
                                                        <div className={`w-full py-2 px-1 bg-gray-50 group-hover:bg-[#037166]/10 transition-colors`}>
                                                            <span className={`text-[10px] font-bold uppercase tracking-tight truncate block text-center text-gray-600 group-hover:text-[#037166]`}>{city}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {searchResults.length > 0 && (
                                        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Search Results</div>
                                            {searchResults.map((place, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSelectLocation(place)}
                                                    className={`w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 text-gray-700`}
                                                >
                                                    <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{place.main_text}</div>
                                                        <div className="text-xs text-gray-500 line-clamp-2">{place.secondary_text}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {searchResults.length === 0 && searchQuery && !isSearching && (
                                        <div className="text-center py-8 text-gray-500 text-sm italic">
                                            No results found for "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
