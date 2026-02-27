'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Sparkles, Flower2, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocationContext } from '@/context/LocationContext';

function ReligiousCategoryContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const categoryName = searchParams.get('name') || 'Category';

    const { location, detectWithIP } = useLocationContext();
    const [subCategories, setSubCategories] = useState([]);
    const [services, setServices] = useState([]); // Fallback services
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('loading'); // 'loading', 'subcategories', 'services', 'empty'

    useEffect(() => {
        if (!location) {
            detectWithIP().catch(err => console.log("Auto detect failed", err));
        }
    }, [location]);

    // Fetch DATA
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Try Fetching Sub-Categories
                // Using the Professional Services Flow Subcategory API (Same as PG Hostels)
                const subCatResponse = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/subcategories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categoryId: params.id })
                });

                let subCats = [];
                if (subCatResponse.ok) {
                    const subCatData = await subCatResponse.json();
                    if (subCatData.success && Array.isArray(subCatData.data)) {
                        subCats = subCatData.data;
                    }
                }

                if (subCats.length > 0) {
                    setSubCategories(subCats);
                    setViewMode('subcategories');
                    setLoading(false);
                    return;
                }

                // 2. If No Sub-Categories, Fetch Direct Services (Fallback to old behavior)
                const userLocationData = localStorage.getItem('user_location_data');
                const locationData = userLocationData ? JSON.parse(userLocationData) : null;
                const lat = locationData?.lat || 17.3850;
                const lng = locationData?.lng || 78.4867;

                // Get religious services serviceId from localStorage, fallback to hardcoded ID
                const RELIGIOUS_SERVICE_ID = '695250aa57bb211ca094e5fd';
                let serviceId = RELIGIOUS_SERVICE_ID;
                try {
                    const savedService = localStorage.getItem('selectedService');
                    if (savedService) {
                        const parsed = JSON.parse(savedService);
                        if (parsed?.id) serviceId = parsed.id;
                    }
                } catch (e) { /* use fallback */ }

                const servicesResponse = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/professional-services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lattitude: lat,
                        longitude: lng,
                        categoryId: params.id,
                        serviceId
                    })
                });

                const servicesData = await servicesResponse.json();
                if (servicesData.success && servicesData.professionalServices && servicesData.professionalServices.length > 0) {
                    setServices(servicesData.professionalServices);
                    setViewMode('services');
                } else {
                    setViewMode('empty');
                }

            } catch (error) {
                console.error("Error fetching category data:", error);
                setViewMode('empty');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [location, params.id]);

    const handleSubCategoryClick = (subCat) => {
        router.push(`/religious-services/subcategory/${subCat._id}?category=${encodeURIComponent(categoryName)}&name=${encodeURIComponent(subCat.name)}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--off-white)] pt-24 pb-10 flex flex-col items-center justify-center">
                <Sparkles className="w-10 h-10 text-[var(--saffron)] animate-spin mb-4" />
                <p className="text-[var(--deep-charcoal)]">Loading Divine Options...</p>
            </div>
        );
    }

    // RENDER SUB-CATEGORIES LIST
    if (viewMode === 'subcategories') {
        return (
            <div className="min-h-screen bg-[var(--off-white)]">
                {/* Hero Header */}
                <div className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-[var(--divine-maroon)] via-[var(--temple-red)] to-[var(--saffron)]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
                        <Sparkles className="w-64 h-64 text-white" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/10 backdrop-blur-md inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white mb-6 cursor-pointer hover:bg-white/20 transition-colors"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">Back to Categories</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
                        >
                            {categoryName}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-white/90 max-w-2xl mx-auto font-light"
                        >
                            Select a specific ritual or service type to continue your spiritual journey.
                        </motion.p>
                    </div>
                </div>

                {/* Subcategories Grid */}
                <div className="container mx-auto px-4 -mt-16 pb-24 relative z-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {subCategories.map((subCat, index) => (
                            <motion.div
                                key={subCat._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleSubCategoryClick(subCat)}
                                className="group cursor-pointer relative"
                            >
                                <div className="absolute inset-0 bg-[var(--saffron)] rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition-opacity top-4"></div>
                                <div className="bg-white rounded-[2rem] p-4 border border-gray-100 relative overflow-hidden h-full shadow-xl hover:-translate-y-2 transition-transform duration-300">
                                    <div className="relative h-56 rounded-[1.5rem] overflow-hidden mb-6 bg-gray-100">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                                        {subCat.image ? (
                                            <img
                                                src={`https://api.doorstephub.com/${subCat.image}`}
                                                alt={subCat.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[var(--off-white)]">
                                                <Flower2 className="w-20 h-20 text-[var(--saffron)]/30" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-4 left-4 right-4 z-20">
                                            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[var(--saffron)] transition-colors">
                                                {subCat.name}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="px-2 pb-2">
                                        <p className="text-gray-600 line-clamp-2 mb-4 text-sm leading-relaxed">
                                            {subCat.description || `Experience divine ${subCat.name} services with our expert priests.`}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-[var(--saffron)] text-sm font-semibold">
                                                <Sparkles className="w-4 h-4" />
                                                <span>Recommended</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-[var(--off-white)] flex items-center justify-center group-hover:bg-[var(--saffron)] group-hover:text-white transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // RENDER DIRECT SERVICES (Fallback - Original Logic)
    if (viewMode === 'services') {
        return (
            <div className="min-h-screen bg-[var(--off-white)] pt-24 pb-10">
                <div className="container mx-auto px-4">
                    <div className="mb-8 flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-6 w-6 text-[var(--deep-charcoal)]" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--deep-charcoal)]">{categoryName} Services</h1>
                            <p className="text-gray-500">Book trusted professionals</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, i) => (
                            <Card
                                key={service._id || i}
                                className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer border-none shadow-md"
                                onClick={() => router.push(`/religious-services/service/${service._id}`)}
                            >
                                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[var(--warm-beige)] to-[var(--soft-cream)]">
                                    <img
                                        src={service.logo ? `https://api.doorstephub.com/${service.logo}` : 'https://images.unsplash.com/photo-1762090420353-47d4a0b3f6af?auto=format&fit=crop&q=80'}
                                        alt={service.business_name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold text-[var(--deep-charcoal)] mb-2 group-hover:text-[var(--saffron)] transition-colors">
                                        {service.business_name || `${service.firstName} ${service.lastName}`}
                                    </h3>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-2xl font-bold text-[var(--saffron)]">₹{(service.BasePrice || service.minFare || 1100).toLocaleString()}</span>
                                        <Button size="sm" className="bg-[var(--saffron)] hover:bg-[var(--temple-red)] text-white">
                                            Book Now
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // EMPTY
    return (
        <div className="min-h-screen bg-[var(--off-white)] pt-24 pb-10 flex flex-col items-center justify-center">
            <div className="text-4xl mb-4">🙏</div>
            <h1 className="text-2xl font-bold text-[var(--deep-charcoal)]">No Services Found</h1>
            <p className="text-gray-500 mt-2">We couldn't find any services for this category.</p>
            <Button variant="outline" className="mt-6" onClick={() => router.back()}>Go Back</Button>
        </div>
    );
}

export default function ReligiousCategoryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">Loading...</div>}>
            <ReligiousCategoryContent />
        </Suspense>
    );
}
