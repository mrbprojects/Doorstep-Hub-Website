'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Sparkles, Flower, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocationContext } from '@/context/LocationContext';

function SpaCategoryContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const categoryName = searchParams.get('name') || 'Category';

    const { location, detectWithIP } = useLocationContext();
    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!location) {
            detectWithIP().catch(err => console.log("Auto detect failed", err));
        }
    }, [location]);

    // Fetch Sub-Categories
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Mock ID fix (if categoryId is mock)
                if (params.id.startsWith('mock_')) {
                    // Return Mock Subcats
                    setSubCategories([
                        { _id: 'mock_sub_1', name: 'Premium Cut', description: 'Includes wash and styling', image: '' },
                        { _id: 'mock_sub_2', name: 'Coloring', description: 'Global and highlights', image: '' },
                        { _id: 'mock_sub_3', name: 'Spa Treatment', description: 'Deep conditioning', image: '' },
                    ]);
                    setLoading(false);
                    return;
                }

                const subCatResponse = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/subcategories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categoryId: params.id })
                });

                if (subCatResponse.ok) {
                    const subCatData = await subCatResponse.json();
                    if (subCatData.success && Array.isArray(subCatData.data)) {
                        setSubCategories(subCatData.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching subcategories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [location, params.id]);

    const handleSubCategoryClick = (subCat) => {
        router.push(`/spa-salon/subcategory/${subCat._id}?category=${encodeURIComponent(categoryName)}&name=${encodeURIComponent(subCat.name)}&categoryId=${params.id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white pt-24 pb-10 flex flex-col items-center justify-center">
                <Sparkles className="w-10 h-10 text-[#C06C84] animate-spin mb-4" />
                <p className="text-gray-500">Loading Wellness Options...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header */}
            <div className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-[#C06C84] to-[#6C5CE7]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
                    <Flower className="w-64 h-64 text-white" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/10 backdrop-blur-md inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white mb-6 cursor-pointer hover:bg-white/20 transition-colors"
                        onClick={() => router.push('/spa-salon')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Services</span>
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
                        Premium treatments designed for your relaxation and beauty.
                    </motion.p>
                </div>
            </div>

            {/* Subcategories Grid */}
            <div className="container mx-auto px-4 -mt-16 pb-24 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {subCategories.length > 0 ? (
                        subCategories.map((subCat, index) => (
                            <motion.div
                                key={subCat._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleSubCategoryClick(subCat)}
                                className="group cursor-pointer relative"
                            >
                                <div className="absolute inset-0 bg-[#C06C84] rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition-opacity top-4"></div>
                                <div className="bg-white rounded-[2rem] p-4 border border-gray-100 relative overflow-hidden h-full shadow-xl hover:-translate-y-2 transition-transform duration-300">
                                    <div className="relative h-56 rounded-[1.5rem] overflow-hidden mb-6 bg-gray-100">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                                        {subCat.image ? (
                                            <img
                                                src={`https://api.doorstephub.com/${subCat.image}`}
                                                alt={subCat.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-pink-50">
                                                <Flower className="w-20 h-20 text-[#C06C84]/30" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-4 left-4 right-4 z-20">
                                            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-pink-200 transition-colors">
                                                {subCat.name}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="px-2 pb-2">
                                        <p className="text-gray-600 line-clamp-2 mb-4 text-sm leading-relaxed">
                                            {subCat.description || `Experience premium ${subCat.name} services.`}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-[#C06C84] text-sm font-semibold">
                                                <Sparkles className="w-4 h-4" />
                                                <span>Top Rated</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#C06C84] group-hover:text-white transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <p className="text-gray-500">No services found in this category.</p>
                            <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SpaCategoryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
            <SpaCategoryContent />
        </Suspense>
    );
}
