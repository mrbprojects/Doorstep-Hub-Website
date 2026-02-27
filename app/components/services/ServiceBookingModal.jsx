'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ArrowLeft, CheckCircle, Search, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocationContext } from '@/context/LocationContext';

export function ServiceBookingModal({ isOpen, onClose }) {
    const router = useRouter();
    const { location } = useLocationContext();
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedCategory(null);
            setSubCategories([]);
            setSearchQuery('');
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const body = location?.lat && location?.lng
                ? { lattitude: location.lat, longitude: location.lng }
                : {};

            // Using the same endpoint as Hero.jsx
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/getallcategorys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (data.success && data.data) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = async (category) => {
        setSelectedCategory(category);
        setLoading(true);
        try {
            const body = {
                slug: category.slug,
                ...(location?.lat && location?.lng ? { lattitude: location.lat, longitude: location.lng } : {})
            };

            // Fetch subcategories
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/getsubcategorysbycategoryid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (data.success && data.data) {
                setSubCategories(data.data);
                setStep(2); // Move to next step
            } else {
                // Direct redirect if no subcategories found (fallback)
                router.push(`/${category.slug}`);
                onClose();
            }
        } catch (error) {
            console.error('Failed to fetch subcategories:', error);
            // Fallback redirect
            router.push(`/${category.slug}`);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleSubCategorySelect = (subCategory) => {
        // Store selection for persistence if needed
        localStorage.setItem('selectedService', JSON.stringify({
            id: subCategory._id,
            name: subCategory.name,
            servicetypeName: subCategory.servicetypeName || subCategory.name,
            image: subCategory.image
        }));

        // Redirect to listing page
        router.push(`/appliances/listing/${subCategory.slug}?category=${encodeURIComponent(selectedCategory.name)}&name=${encodeURIComponent(subCategory.name)}`);
        onClose();
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSubCategories = subCategories.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#333] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-[#333] flex items-center justify-between bg-[#111]">
                        <div className="flex items-center gap-3">
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="p-2 rounded-full hover:bg-[#222] text-gray-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#037166]" />
                                    {step === 1 ? "What do you need help with?" : "Which specific service?"}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {step === 1 ? "Choose a category to get started" : `Select a service under ${selectedCategory?.name}`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-[#222] text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-4 bg-[#0a0a0a] sticky top-0 z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder={step === 1 ? "Search categories..." : "Search services..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#037166] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Content Area - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#037166]" />
                                <p>Loading options...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {step === 1 ? (
                                    // Categories Grid
                                    filteredCategories.map((cat) => (
                                        <motion.button
                                            key={cat._id}
                                            onClick={() => handleCategorySelect(cat)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="group flex items-center gap-4 p-4 rounded-xl bg-[#1a1a1a] border border-[#333] hover:border-[#037166] hover:bg-[#037166]/10 transition-all text-left"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-[#222] overflow-hidden flex-shrink-0 border border-[#333] group-hover:border-[#037166]/30">
                                                <img
                                                    src={`https://api.doorstephub.com/${cat.image}`}
                                                    alt={cat.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-white group-hover:text-[#04a99d] transition-colors">{cat.name}</h4>
                                                <p className="text-xs text-gray-500">View all services</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#037166] group-hover:translate-x-1 transition-all" />
                                        </motion.button>
                                    ))
                                ) : (
                                    // Subcategories Grid
                                    filteredSubCategories.map((sub) => (
                                        <motion.button
                                            key={sub._id}
                                            onClick={() => handleSubCategorySelect(sub)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="group flex items-center gap-4 p-4 rounded-xl bg-[#1a1a1a] border border-[#333] hover:border-[#037166] hover:bg-[#037166]/10 transition-all text-left"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-[#222] overflow-hidden flex-shrink-0 border border-[#333] group-hover:border-[#037166]/30">
                                                <img
                                                    src={sub.image?.startsWith('http') ? sub.image : `https://api.doorstephub.com/${sub.image}`}
                                                    alt={sub.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"/></svg></div>';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-white group-hover:text-[#04a99d] transition-colors">{sub.name}</h4>
                                                <p className="text-xs text-gray-500">Book Now</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#037166] group-hover:translate-x-1 transition-all" />
                                        </motion.button>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Empty States */}
                        {!loading && step === 1 && filteredCategories.length === 0 && (
                            <div className="text-center py-10 text-gray-500">No categories found matching "{searchQuery}"</div>
                        )}
                        {!loading && step === 2 && filteredSubCategories.length === 0 && (
                            <div className="text-center py-10 text-gray-500">No services found matching "{searchQuery}"</div>
                        )}
                    </div>

                    {/* Footer Progress */}
                    <div className="p-4 bg-[#111] border-t border-[#333] flex items-center justify-between text-xs text-gray-500">
                        <span>Step {step} of 2</span>
                        <div className="flex gap-1">
                            <div className={`h-1.5 w-12 rounded-full ${step >= 1 ? 'bg-[#037166]' : 'bg-[#333]'}`} />
                            <div className={`h-1.5 w-12 rounded-full ${step >= 2 ? 'bg-[#037166]' : 'bg-[#333]'}`} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
