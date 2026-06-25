'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles, Scissors, Wind, User,
    Calendar, Shield, Award, Heart,
    MapPin, Star, CheckCircle, ArrowRight
} from 'lucide-react';
import { useLocationContext } from '@/context/LocationContext';
import { resolveParam } from '@/utils/slugHelper';
import { CategorySubcategorySection } from '@/components/shared/CategorySubcategorySection';

// Section wrapper
function SectionReveal({ children, delay = 0 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

// Mock Categories for Fallback (If API ID is missing)
const MOCK_CATEGORIES = [
    { _id: 'mock_hair', name: 'Hair Services', image: 'uploads/spa/hair.jpg', description: 'Cuts, styling, and treatments' },
    { _id: 'mock_skin', name: 'Skin Care', image: 'uploads/spa/facial.jpg', description: 'Facials and cleanups' },
    { _id: 'mock_massage', name: 'Massage Therapy', image: 'uploads/spa/massage.jpg', description: 'Relaxing body massages' },
    { _id: 'mock_makeup', name: 'Makeup & Styling', image: 'uploads/spa/makeup.jpg', description: 'Party and bridal makeup' },
];

export function SpaLandingPage() {
    const router = useRouter();
    const { location, detectWithIP } = useLocationContext();
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    useEffect(() => {
        if (!location) {
            detectWithIP().catch(err => console.log("Auto detect failed", err));
        }
    }, [location]);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const selectedService = localStorage.getItem('selectedService');
                let serviceId = null;
                if (selectedService) {
                    try {
                        const sData = JSON.parse(selectedService);
                        serviceId = sData.id;
                    } catch (e) { }
                }

                // Use Real API
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        serviceId: serviceId || '69524f4a57bb211ca094e5e6'
                    })
                });
                const data = await response.json();
                if (data.success && data.category && data.category.length > 0) {
                    setCategories(data.category);
                } else {
                    // Fallback to Mock if API returns empty (likely due to invalid ID)
                    // This ensures visual completeness for the demo
                    setCategories(MOCK_CATEGORIES);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategories(MOCK_CATEGORIES);
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="min-h-screen bg-[var(--off-white)]">
            {/* HERO SECTION */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FBEAF0] to-[#F4F3FF]" />

                {/* Animated Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-[#C06C84]/20 blur-xl pointer-events-none"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.5, 1], x: (i * 13) % 100, y: (i * 19) % 100 }}
                            transition={{ duration: 5 + (i * 3) % 7, repeat: Infinity }}
                            style={{ left: `${(i * 17) % 100}%`, top: `${(i * 23) % 100}%`, width: '100px', height: '100px' }}
                        />
                    ))}
                </div>

                <div className="container relative mx-auto px-4 py-20 z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur border border-[#C06C84]/20 shadow-sm mb-6"
                    >
                        <Sparkles className="h-4 w-4 text-[#C06C84]" />
                        <h6 className="text-sm font-medium text-[#C06C84]">Premium Wellness at Your Doorstep</h6>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 leading-tight"
                    >
                        Discover Your <br />
                        <span className="bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] bg-clip-text text-transparent">
                            Inner Radiance
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto"
                    >
                        Expert salon and spa services delivered to your home with care and safety.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Button
                            onClick={() => {
                                const el = document.getElementById('spa-categories');
                                el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            size="lg"
                            className="bg-[#6d1357] text-white hover:opacity-90 shadow-xl px-10 py-6 text-lg rounded-full"
                        >
                            Book a Service
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* CATEGORIES */}
            <SectionReveal>
                <div id="spa-categories">
                    <CategorySubcategorySection
                        categories={categories}
                        categoriesLoading={categoriesLoading}
                        isLocationReady={true}
                        onViewAll={() => router.push('/spa-salon/packages')}
                        onOpenCategory={(category) => router.push(`/spa-salon/${category.slug || category._id}`)}
                        onSubcategoryClick={(subCategory) => router.push(`/spa-salon/${subCategory.slug || subCategory._id}`)}
                        fetchSubcategoriesForCategory={async (category) => {
                            if ((category.slug || category._id || '').startsWith('mock_')) {
                                return [
                                    { _id: 'mock_sub_1', name: 'Premium Cut', description: 'Includes wash and styling', slug: 'premium-cut' },
                                    { _id: 'mock_sub_2', name: 'Coloring', description: 'Global and highlights', slug: 'coloring' },
                                    { _id: 'mock_sub_3', name: 'Spa Treatment', description: 'Deep conditioning', slug: 'spa-treatment' },
                                ];
                            }
                            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ categorySlug: category.slug, serviceSlug: 'spa-salon' }),
                            });
                            const data = await response.json();
                            return data.success && Array.isArray(data.data) ? data.data : [];
                        }}
                        theme={{
                            eyebrow: 'Wellness',
                            title: 'Spa Categories',
                            description: 'Choose a treatment family, then jump into the exact salon or spa service you want to book.',
                            viewAllLabel: 'View all',
                            sectionClass: 'bg-gradient-to-b from-white via-[#fff6fb] to-[#fdf2f8]',
                            eyebrowClass: 'text-[#C06C84]',
                            titleClass: 'text-[#6d1357]',
                            descriptionClass: 'text-[#7b7280]',
                            viewAllClass: 'text-[#C06C84] hover:text-[#a6506b]',
                            locationBoxClass: 'border border-[#f2d7e2] bg-white/90',
                            locationIconClass: 'text-[#C06C84]/60',
                            locationTitleClass: 'text-[#3f2d3a]',
                            locationButtonClass: 'bg-[#6d1357] text-white hover:bg-[#571046]',
                            mutedCardClass: 'border border-[#f4dde6] bg-white/80',
                            categoryCardClass: 'border-[#f3e5eb] bg-white hover:border-[#e7bfd0] hover:bg-gradient-to-r hover:from-[#fff8fb] hover:to-white',
                            activeCategoryCardClass: 'border-[#e7bfd0] bg-gradient-to-r from-[#fff0f5] via-white to-[#fff6fa] shadow-[0_20px_40px_rgba(192,108,132,0.16)]',
                            thumbClass: 'border-[#f0e4e9] bg-[#fff8fb]',
                            activeThumbClass: 'border-[#e7bfd0] bg-white shadow-sm',
                            categoryTextClass: 'text-[#2f2430]',
                            activeCategoryTextClass: 'text-[#6d1357]',
                            categoryAccentTextClass: 'text-[#C06C84]',
                            countTextClass: 'text-[#8b7c86]',
                            arrowClass: 'bg-[#faf6f8] text-[#b4a3ad] group-hover:bg-gradient-to-r group-hover:from-[#C06C84] group-hover:to-[#6C5CE7] group-hover:text-white',
                            activeArrowClass: 'bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] text-white shadow-[0_10px_24px_rgba(192,108,132,0.28)]',
                            gridCardHeightClass: 'h-[190px]',
                            gridFallbackClass: 'bg-gradient-to-br from-[#f7dbe6] to-[#eadffd]',
                            gridOverlayClass: 'bg-gradient-to-t from-[#2d1326]/92 via-[#2d1326]/30 to-transparent',
                            showMoreClass: 'border-[#e7bfd0] text-[#6d1357] hover:bg-[#fff3f8]',
                            emptyBoxClass: 'border border-[#f1dde6] bg-white',
                            emptyTitleClass: 'text-[#332633]',
                            emptyTextClass: 'text-[#8b7c86]',
                        }}
                    />
                </div>
            </SectionReveal>
        </div>
    );
}


