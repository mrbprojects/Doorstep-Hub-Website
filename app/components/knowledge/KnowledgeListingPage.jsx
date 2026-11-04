'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Filter, BookOpen, Clock, ArrowRight, User, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export function KnowledgeListingPage({ initialArticles = [] }) {
    const router = useRouter();
    const [articles, setArticles] = useState(initialArticles);
    const [loading, setLoading] = useState(initialArticles.length === 0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState(['All', 'Home Care', 'Appliance Repair', 'Cleaning', 'Pest Control', 'General']);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                if (initialArticles.length === 0) setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/knowledge-base`);
                const data = await response.json();

                if (data.success && data.data) {
                    const mappedArticles = data.data.map(item => {
                        const rawDate = item.createdAt || item.created_at || item.date || item.updatedAt;
                        let formattedDate = 'Recently Updated';
                        if (rawDate) {
                            const parsedDate = new Date(rawDate);
                            if (!isNaN(parsedDate.getTime())) {
                                formattedDate = parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                            }
                        }

                        return {
                            id: item._id,
                            title: item.title,
                            category: item.subcategoryId?.name || item.categoryId?.name || item.serviceId?.name || 'General',
                            readTime: item.readTime ? `${item.readTime} min read` : '3 min read',
                            image: item.coverImage?.url ? encodeURI(`https://api.doorstephub.com${item.coverImage.url}`) : 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?w=800',
                            summary: item.summary || item.description?.substring(0, 100) + '...',
                            author: item.author || 'Doorstep Hub',
                            date: formattedDate,
                            slug: item.slug,
                            isTrending: item.isTrending
                        };
                    });
                    setArticles(mappedArticles);

                    // Extract unique categories dynamically if needed
                    const dynamicCategories = new Set(['All', ...mappedArticles.map(a => a.category)]);
                    setCategories(Array.from(dynamicCategories));
                }
            } catch (error) {
                console.error('Error fetching articles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.summary.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
            {/* Header Section */}
            <div className="relative py-20 px-6 lg:px-8 border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-b from-[#037166]/20 to-transparent pointer-events-none" />
                <div className="relative max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-[#037166] bg-clip-text text-transparent">
                            Knowledge Hub
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                            Discover expert tips, guides, and insights to help you maintain your home and appliances.
                        </p>
                    </motion.div>

                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-[#037166] transition-all text-white placeholder-gray-500"
                            />
                        </div>
                        {/* Simple Category Dropdown for Mobile or Tabs for Desktop could go here */}
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                    ? 'bg-[#037166] text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Articles Grid */}
            <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-16">
                {loading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[320px] overflow-hidden rounded-2xl border border-white/5 bg-[#1a1a1a] animate-pulse" />
                        ))}
                    </div>
                ) : filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                        {filteredArticles.map((article, index) => (
                            <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/knowledge/${article.slug}`} className="group block h-full">
                                    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] transition-all duration-300 hover:border-[#037166]/50 hover:shadow-2xl hover:shadow-[#037166]/20">

                                        {/* Image */}
                                        <div className="relative h-40 overflow-hidden">
                                            <ImageWithFallback
                                                src={article.image}
                                                alt={article.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />

                                            <div className="absolute top-3 left-3 rounded-lg border border-[#037166]/20 bg-black/60 px-2.5 py-1 text-[11px] font-medium text-[#037166] backdrop-blur-md">
                                                {article.category}
                                            </div>

                                            {article.isTrending && (
                                                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-[#037166] px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                                                    <TrendingUp className="w-3 h-3" />
                                                    Trending
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-1 flex-col p-4">
                                            <h3 className="mb-2 line-clamp-2 text-base font-bold text-white transition-colors group-hover:text-[#037166]">
                                                {article.title}
                                            </h3>
                                            <p className="mb-3 flex-1 line-clamp-3 text-xs text-gray-400">
                                                {article.summary}
                                            </p>

                                            <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-[#037166]" />
                                                    {article.readTime}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3 h-3" />
                                                    {article.author}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No articles found matching your criteria.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                            className="mt-4 px-6 py-2 bg-[#037166] text-white rounded-full hover:bg-[#025951] transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

