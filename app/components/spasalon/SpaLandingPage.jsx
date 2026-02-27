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
                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/categories', {
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
                            className="absolute rounded-full bg-[#C06C84]/20 blur-xl"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.5, 1], x: Math.random() * 100, y: Math.random() * 100 }}
                            transition={{ duration: 5 + Math.random() * 5, repeat: Infinity }}
                            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: '100px', height: '100px' }}
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
                            className="bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] text-white hover:opacity-90 shadow-xl px-10 py-6 text-lg rounded-full"
                        >
                            Book a Service
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* CATEGORIES */}
            <SectionReveal>
                <section id="spa-categories" className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
                            <p className="text-lg text-gray-500">Curated treatments for your beauty and wellness</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {categoriesLoading ? (
                                [1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
                                ))
                            ) : categories.map((cat, index) => (
                                <motion.div
                                    key={cat._id || index}
                                    whileHover={{ y: -10 }}
                                    onClick={() => router.push(`/spa-salon/category/${cat._id}?name=${encodeURIComponent(cat.name)}`)}
                                    className="group cursor-pointer"
                                >
                                    <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all overflow-hidden">
                                        <div className="h-48 relative overflow-hidden bg-gray-100">
                                            {cat.image && !cat.image.includes('mock') ? (
                                                <img src={`https://api.doorstephub.com/${cat.image}`} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-[#FBEAF0]">
                                                    <Scissors className="w-12 h-12 text-[#C06C84]" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                            <h4 className="absolute bottom-4 left-4 text-xl font-bold text-white group-hover:text-[#FBEAF0] transition-colors">
                                                {cat.name}
                                            </h4>
                                        </div>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-500">{cat.description || 'Premium spa service'}</p>
                                            <div className="mt-4 flex items-center text-[#C06C84] font-medium text-sm group-hover:translate-x-1 transition-transform">
                                                View Options <ArrowRight className="ml-1 w-4 h-4" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </SectionReveal>
        </div>
    );
}
