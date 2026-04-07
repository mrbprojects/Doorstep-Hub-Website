'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronRight, MapPin, Loader2, AlertCircle, ShieldCheck, Star, Filter } from 'lucide-react';
import { resolveParam } from '@/utils/slugHelper';

const SERVICE_ID = '69524fb157bb211ca094e5ee'; // PG & Hostels service

const bgTexture = "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.08), transparent 35%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.05), transparent 25%)";

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

    const pill = (label, value) => (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 text-sm text-gray-700 border border-white/60 shadow-sm">
            <span className="font-semibold text-gray-900">{value}</span>
            <span className="uppercase tracking-[0.15em] text-xs text-gray-500">{label}</span>
        </div>
    );

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
        const params = new URLSearchParams();
        params.set('categoryId', categoryId || categoryKey);
        if (categorySlug) params.set('categorySlug', categorySlug);
        params.set('categoryName', categoryName);
        params.set('subcategoryId', subcat._id);
        if (subcat.slug) params.set('subcategorySlug', subcat.slug);
        params.set('subcategoryName', subcat.name);
        router.push(`/pghostels/listings/all?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-[#0b0f14] text-white">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f3b36] via-[#0b6b60] to-[#0b0f14]" />
                <div className="absolute inset-0" style={{ backgroundImage: bgTexture }} />

                <div className="max-w-6xl mx-auto px-4 pt-24 pb-12 relative">
                    <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-white/80">
                        <span className="font-semibold tracking-[0.18em] uppercase">PG & Hostels</span>
                        <span className="opacity-60">•</span>
                        <span className="font-medium">Category</span>
                    </div>

                    <div className="flex flex-wrap items-start gap-6 justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-sm">{categoryName}</h1>
                            <p className="text-white/80 mt-3 max-w-2xl">Pick a subcategory to narrow down stays that actually fit your lifestyle. No questionnaires—just straight to matching rooms.</p>

                            <div className="flex flex-wrap gap-3 mt-6">
                                {pill('rooms', subcategories.length || '—')}
                                {pill('service', 'PG & Hostel')}
                                {pill('match', 'Smart Filters')}
                            </div>
                        </div>

                        <div className="bg-white/10 border border-white/15 rounded-2xl px-5 py-4 shadow-lg backdrop-blur">
                            <div className="flex items-center gap-3 text-sm text-white/80">
                                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                                <span>Verified listings only</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/80 mt-2">
                                <Star className="w-4 h-4 text-amber-200" />
                                <span>Community-rated stays</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/80 mt-2">
                                <Filter className="w-4 h-4 text-sky-200" />
                                <span>Filters continue on listings page</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-16 -mt-10 relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-8">
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#0E8F83] font-bold">Subcategory List</p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-1">Choose your room style</h2>
                        </div>
                        {loading && (
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading…</span>
                            </div>
                        )}
                        {!loading && subcategories.length > 0 && (
                            <div className="text-sm text-gray-600">
                                Showing <span className="font-semibold text-gray-900">{subcategories.length}</span> options
                            </div>
                        )}
                    </div>

                    {!loading && error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!loading && !error && subcategories.length === 0 && (
                        <div className="text-gray-600 bg-gray-50 border border-gray-100 rounded-xl px-4 py-4">No subcategories found for this category.</div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                        {subcategories.map((sub, i) => (
                            <motion.button
                                key={sub._id}
                                whileHover={{ y: -6, boxShadow: '0 20px 45px -22px rgba(0,0,0,0.3)' }}
                                transition={{ type: 'spring', stiffness: 220, damping: 18, delay: i * 0.02 }}
                                onClick={() => goToListings(sub)}
                                className="w-full text-left bg-gradient-to-br from-white to-[#f7fbfa] rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 group"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#0E8F83] font-bold">Subcategory</p>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0E8F83] transition-colors">
                                            {sub.name}
                                        </h3>
                                    </div>
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E8F83]/10 text-[#0E8F83]">
                                        <ChevronRight className="w-5 h-5" />
                                    </span>
                                </div>
                                {sub.description && <p className="text-sm text-gray-600 line-clamp-2">{sub.description}</p>}
                                {sub.address && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-4 h-4" /> {sub.address}
                                    </p>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PGSubcategoryPage() {
    return <PGSubcategoryContent />;
}
