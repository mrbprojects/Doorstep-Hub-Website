'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Loader2, AlertCircle, Sparkles, Home } from 'lucide-react';
import { resolveParam } from '@/utils/slugHelper';

const SERVICE_ID = '69524fb157bb211ca094e5ee'; // PG & Hostels service

function PGSubcategoryContent() {
    const { slug } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const categoryId = searchParams.get('categoryId');
    const categorySlug = searchParams.get('categorySlug');
    const categoryName = searchParams.get('categoryName') || 'PG & Hostels';
    const categoryKey = categorySlug || categoryId || slug;

    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSubcats = async () => {
            if (!categoryKey) return;
            setLoading(true);
            setError('');
            try {
                const payload = {
                    ...resolveParam(categoryKey, 'categoryId', 'categorySlug'),
                    serviceId: SERVICE_ID,
                };
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (data.success && Array.isArray(data.data) && data.data.length) {
                    setSubcategories(data.data);
                } else {
                    setSubcategories([]);
                }
            } catch (e) {
                console.error('Failed to fetch PG subcategories', e);
                setError('Unable to load subcategories right now.');
            } finally {
                setLoading(false);
            }
        };
        fetchSubcats();
    }, [categoryKey]);

    const goToListings = (subcat) => {
        router.push(`/pghostels/${subcat.slug || subcat._id}`);
    };

    const getImageUrl = (subcat) => {
        const image = subcat.image || subcat.categoryIcon || subcat.icon;
        if (!image) return null;
        return image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${image}`;
    };

    const schemaData = subcategories.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `${categoryName} Options`,
        "description": `Verified ${categoryName} and accommodations.`,
        "itemListElement": subcategories.map((sub, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": sub.name,
            "url": typeof window !== 'undefined' ? `${window.location.origin}/pghostels/${sub.slug || sub._id}` : ""
        }))
    } : null;

    return (
        <div className="min-h-screen bg-[#fffdf7] text-gray-950">
            {schemaData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                />
            )}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3c36] via-[#147469] to-[#f0a64c] pt-32 pb-24">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0d3c36] via-[#147469] to-[#f0a64c] opacity-10" />
                <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
                    <Home className="h-64 w-64 text-white" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
                    <motion.button
                        type="button"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => router.push('/pghostels')}
                        className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Categories
                    </motion.button>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mx-auto max-w-5xl text-4xl font-black tracking-tight text-white drop-shadow-lg md:text-6xl"
                    >
                        {categoryName}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/90 md:text-xl"
                    >
                        Select a stay type to continue to verified PG and hostel listings near you.
                    </motion.p>
                </div>
            </section>

            <section className="relative z-20 mx-auto -mt-16 max-w-7xl px-4 pb-24">
                {loading && (
                    <div className="flex min-h-[240px] items-center justify-center rounded-[2rem] bg-white shadow-xl">
                        <div className="flex items-center gap-3 text-[#147469]">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="font-semibold">Loading room styles...</span>
                        </div>
                    </div>
                )}

                {!loading && error && (
                    <div className="flex items-center gap-3 rounded-[2rem] border border-red-100 bg-white px-6 py-5 text-red-600 shadow-xl">
                        <AlertCircle className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                )}

                {!loading && !error && subcategories.length === 0 && (
                    <div className="rounded-[2rem] border border-gray-100 bg-white px-6 py-8 text-center text-gray-600 shadow-xl">
                        No subcategories found for this category.
                    </div>
                )}

                {!loading && !error && subcategories.length > 0 && (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {subcategories.map((sub, index) => {
                            const imageUrl = getImageUrl(sub);
                            return (
                                <motion.div
                                    key={sub._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.08 }}
                                    onClick={() => goToListings(sub)}
                                    className="group relative cursor-pointer"
                                >
                                    <div className="absolute inset-0 top-4 rounded-[2rem] bg-[#f0a64c] opacity-20 blur transition-opacity group-hover:opacity-40" />
                                    <div className="relative h-full overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-4 shadow-xl transition-transform duration-300 group-hover:-translate-y-2">
                                        <div className="relative mb-6 h-56 overflow-hidden rounded-[1.5rem] bg-[#eef3f2]">
                                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/65 to-transparent" />
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={sub.name}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-[#eef3f2]">
                                                    <Home className="h-20 w-20 text-[#147469]/30" />
                                                </div>
                                            )}
                                            <div className="absolute bottom-4 left-4 right-4 z-20">
                                                <h3 className="text-2xl font-black text-white transition-colors group-hover:text-[#f0c56b]">
                                                    {sub.name}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="px-2 pb-2">
                                            <p className="mb-6 line-clamp-2 text-sm leading-7 text-gray-600">
                                                {sub.description || `Explore ${sub.name} stays with verified PG and hostel listings.`}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm font-bold text-[#147469]">
                                                    <Sparkles className="h-4 w-4" />
                                                    <span>Recommended</span>
                                                </div>
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fffdf7] text-[#147469] transition-colors group-hover:bg-[#147469] group-hover:text-white">
                                                    <ChevronRight className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

export default function PGSubcategoryPage() {
    return <PGSubcategoryContent />;
}
