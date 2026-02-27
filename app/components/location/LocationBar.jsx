'use client';

import React, { useState } from 'react';
import { MapPin, ChevronDown, Search, Crosshair, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from '@/hooks/useLocation';

export function LocationBar({ theme = {} }) {
    const { location, detectWithGPS, searchLocation, setManualLocation, loading, error } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);

    // Default Dark Theme (Fallback)
    const defaultTheme = {
        bgScrolled: 'bg-[#0a0a0a]/80',
        textMain: 'text-gray-300',
        textHover: 'text-[#037166]', // Accent color
        border: 'border-[#037166]/20',
        buttonBg: 'bg-[#1a1a1a]',
    };

    // Merge provided theme with default or use if comprehensive
    // If theme is passed as string 'dark'/'light' (legacy), ignore and use default, 
    // but Header passes a comprehensive object now.
    const t = typeof theme === 'object' && Object.keys(theme).length > 0 ? theme : defaultTheme;

    // Extract accent color for icons (approximation if not explicit)
    // textHover usually holds the accent color in our schema
    const accentClass = t.textHover.replace('text-', ''); // e.g., '[#037166]' or 'blue-500'
    const accentText = t.textHover;
    const accentBorder = t.border;

    const handleSearch = async (e) => {
        e.preventDefault();
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
                className={`hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl glass-button-premium border transition-all group mr-2 ${t.buttonBg} hover:bg-opacity-80 ${t.border}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <MapPin className={`w-4 h-4 ${accentText}`} />
                <div className="flex flex-col items-start min-w-[100px] max-w-[160px]">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold opacity-70 ${t.textMain}`}>
                        {location ? 'Delivering to' : 'Location'}
                    </span>
                    <span className={`text-xs font-medium truncate w-full text-left ${t.textMain}`}>
                        {loading ? 'Detecting...' : location ? location.shortAddress : 'Select location'}
                    </span>
                </div>
                <ChevronDown className={`w-3 h-3 opacity-50 ${t.textMain} group-hover:opacity-100 transition-opacity`} />
            </motion.button>

            {/* Helper for Mobile (Icon only or specific mobile bar) - Assuming GlobalNav handles mobile, we'll stick to this for now */}

            {/* Modal / Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
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
                            className={`relative w-full max-w-md ${t.bgMobile} backdrop-blur-xl border border-opacity-30 rounded-2xl shadow-2xl overflow-hidden ${t.border}`}
                        >
                            {/* Header */}
                            <div className={`p-4 border-b border-opacity-20 flex items-center justify-between ${t.buttonBg} ${t.border}`}>
                                <h3 className={`text-lg font-semibold ${t.textMain}`}>Change Location</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className={`p-1 rounded-lg hover:bg-opacity-10 transition-colors ${t.textMain} hover:${t.bgMobile}`}
                                >
                                    <X className="w-5 h-5 opacity-70" />
                                </button>
                            </div>

                            {/* Search Body */}
                            <div className="p-4 space-y-4">
                                {/* Search Input */}
                                <form onSubmit={handleSearch} className="relative">
                                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 ${t.textMain}`} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for area, street name..."
                                        className={`w-full pl-10 pr-4 py-3 ${t.buttonBg} border border-opacity-20 rounded-xl ${t.textMain} placeholder-gray-500 focus:outline-none focus:ring-1 transition-all ${t.border} focus:${t.border}`}
                                        autoFocus
                                    />
                                    {isSearching && (
                                        <Loader2 className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin ${t.textHover}`} />
                                    )}
                                </form>

                                {/* Detect Button */}
                                <button
                                    onClick={handleDetectCurrent}
                                    disabled={isDetecting}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-opacity-10 transition-colors group text-left border border-transparent hover:border-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed hover:${t.border}`}
                                >
                                    <div className={`w-10 h-10 rounded-full bg-opacity-20 flex items-center justify-center transition-colors group-hover:bg-opacity-100 ${t.accent} group-hover:${t.accent}`}>
                                        {isDetecting ? (
                                            <Loader2 className={`w-5 h-5 group-hover:text-white animate-spin ${t.textHover}`} />
                                        ) : (
                                            <Crosshair className={`w-5 h-5 group-hover:text-white ${t.textHover}`} />
                                        )}
                                    </div>
                                    <div>
                                        <div className={`font-semibold group-hover:text-white ${t.textHover}`}>
                                            {isDetecting ? 'Detecting location...' : 'Use current location'}
                                        </div>
                                        <div className="text-xs text-gray-500">Using GPS</div>
                                    </div>
                                </button>

                                {/* Results List */}
                                {searchResults.length > 0 && (
                                    <div className="mt-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search Results</div>
                                        {searchResults.map((place, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSelectLocation(place)}
                                                className={`w-full flex items-start gap-3 p-3 rounded-xl hover:bg-opacity-5 transition-colors text-left border-b border-opacity-5 last:border-0 ${t.textMain} hover:${t.textMain} border-gray-500`}
                                            >
                                                <MapPin className="w-4 h-4 opacity-50 mt-1 shrink-0" />
                                                <div>
                                                    <div className="text-sm font-medium">{place.main_text}</div>
                                                    <div className="text-xs opacity-60 line-clamp-2">{place.secondary_text}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Empty State / Suggestions */}
                                {searchResults.length === 0 && searchQuery && !isSearching && (
                                    <div className="text-center py-6 text-gray-500 text-sm">
                                        No results found for "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
