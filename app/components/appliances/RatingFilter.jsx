'use client';

import React from 'react';
import { Star, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function RatingFilter({ selectedRating, onSelectRating }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const ratings = [4.5, 4.0, 3.5, 3.0];

    return (
        <div className="relative z-20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-sm text-white backdrop-blur-sm"
            >
                <Star className="w-4 h-4 text-[#04a99d] fill-[#04a99d]" />
                <span>{selectedRating ? `${selectedRating}+ Rating` : 'All Ratings'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-2 w-48 bg-[#0a0a0a] border border-[#037166]/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-xl"
                    >
                        <div className="p-2 space-y-1">
                            <button
                                onClick={() => {
                                    onSelectRating(null);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${!selectedRating ? 'bg-[#037166]/20 text-[#04a99d]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <span className="text-sm font-medium">All Ratings</span>
                                {!selectedRating && <Check className="w-3 h-3" />}
                            </button>
                            {ratings.map((rating) => (
                                <button
                                    key={rating}
                                    onClick={() => {
                                        onSelectRating(rating);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${selectedRating === rating ? 'bg-[#037166]/20 text-[#04a99d]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span className="text-sm font-medium">{rating}+</span>
                                    </div>
                                    {selectedRating === rating && <Check className="w-3 h-3" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
