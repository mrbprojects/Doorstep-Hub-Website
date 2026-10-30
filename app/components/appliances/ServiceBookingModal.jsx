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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getallcategorys`, {
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
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
                // Navigate to the category page using slug
                onClose();
                router.push(`/${category.slug}`);
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

        // Redirect to dedicated root-level appliance listing page
        const subCategorySlug = subCategory.slug || subCategory._id;
        if (subCategorySlug) {
            router.push(`/${subCategorySlug}`);
        } else {
            router.push('/appliance-repair-services');
        }
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
                    className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm pointer-events-none"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[85vh] border border-gray-100"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-4">
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-[#037166] hover:bg-[#037166]/5 transition-all"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
                                    <Sparkles className="w-6 h-6 text-[#037166]" />
                                    {step === 1 ? "Help with repairs?" : "Which specific service?"}
                                </h3>
                                <p className="text-gray-500 font-medium">
                                    {step === 1 ? "Choose a category to get started" : `Select a service under ${selectedCategory?.name}`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-6 bg-white sticky top-0 z-10 border-b border-gray-50">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={step === 1 ? "Search categories (e.g. AC, TV, Fridge)..." : "Search specific services..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent rounded-[1.25rem] py-4 pl-12 pr-6 text-gray-900 font-bold placeholder-gray-400 focus:outline-none focus:border-[#037166]/20 focus:bg-white transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Content Area - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#037166]" />
                                <p className="font-bold uppercase tracking-widest text-xs">Fetching Options...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {step === 1 ? (
                                    // Categories Grid
                                    filteredCategories.map((cat) => (
                                        <motion.button
                                            key={cat._id}
                                            onClick={() => handleCategorySelect(cat)}
                                            whileHover={{ y: -5 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="group flex items-center gap-4 p-5 rounded-[1.5rem] bg-white border border-gray-100 hover:border-[#037166]/30 hover:shadow-2xl hover:shadow-gray-200/50 transition-all text-left"
                                        >
                                            <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 group-hover:border-[#037166]/20 transition-colors">
                                                <img loading="lazy" decoding="async"
                                                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${cat.image}`}
                                                    alt={cat.name}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-black text-gray-900 group-hover:text-[#037166] transition-colors tracking-tight">{cat.name}</h4>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Explore All</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#037166] group-hover:text-white transition-all">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </motion.button>
                                    ))
                                ) : (
                                    // Subcategories Grid
                                    filteredSubCategories.map((sub) => (
                                        <motion.button
                                            key={sub._id}
                                            onClick={() => handleSubCategorySelect(sub)}
                                            whileHover={{ y: -5 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="group flex items-center gap-4 p-5 rounded-[1.5rem] bg-white border border-gray-100 hover:border-[#037166]/30 hover:shadow-2xl hover:shadow-gray-200/50 transition-all text-left"
                                        >
                                            <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 group-hover:border-[#037166]/20 transition-colors">
                                                <img loading="lazy" decoding="async"
                                                    src={sub.image?.startsWith('http') ? sub.image : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${sub.image}`}
                                                    alt={sub.name}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-50"><svg class="w-8 h-8 text-[#037166]/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></div>';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-black text-gray-900 group-hover:text-[#037166] transition-colors tracking-tight">{sub.name}</h4>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Book Now</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#037166] group-hover:text-white transition-all">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </motion.button>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Empty States */}
                        {!loading && step === 1 && filteredCategories.length === 0 && (
                            <div className="text-center py-20">
                                <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold">No categories found matching "{searchQuery}"</p>
                            </div>
                        )}
                        {!loading && step === 2 && filteredSubCategories.length === 0 && (
                            <div className="text-center py-20">
                                <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold">No services found matching "{searchQuery}"</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Progress */}
                    <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between text-xs font-black text-gray-400">
                        <span className="uppercase tracking-widest">Selection Step {step} of 2</span>
                        <div className="flex gap-2">
                            <div className={`h-2 w-16 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-[#037166]' : 'bg-gray-200'}`} />
                            <div className={`h-2 w-16 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-[#037166]' : 'bg-gray-200'}`} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
