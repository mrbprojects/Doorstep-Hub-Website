'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { BookOpen, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

const dummyArticles = [
  {
    id: 'dummy-1',
    title: '5 Tips for Home Maintenance',
    category: 'Home Care',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1581578731117-10d52143b1e5?auto=format&fit=crop&q=80&w=1080',
    trending: true,
    summary: 'Essential maintenance tips to keep your home engaging and comfortable year-round.',
    isDummy: true
  },
  {
    id: 'dummy-2',
    title: 'Understanding AC Servicing',
    category: 'Appliance Repair',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1621905476017-60f38c3d79f0?auto=format&fit=crop&q=80&w=1080',
    trending: false,
    summary: 'Why regular AC servicing is crucial for longevity and efficiency.',
    isDummy: true
  },
  {
    id: 'dummy-3',
    title: 'Kitchen Cleaning Hacks',
    category: 'Cleaning',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1080',
    trending: true,
    summary: 'Quick and effective hacks to keep your kitchen sparkling clean.',
    isDummy: true
  },
  {
    id: 'dummy-4',
    title: 'The Guide to Pest Control',
    category: 'Pest Control',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1633535978184-a1415f368f56?auto=format&fit=crop&q=80&w=1080',
    trending: false,
    summary: 'How to identify and manage common household pests effectively.',
    isDummy: true
  }
];

export function KnowledgeSpace() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/knowledge-base`);
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          const mappedArticles = data.data.slice(0, 6).map(item => ({
            id: item._id,
            title: item.title,
            category: item.subcategoryId?.name || item.categoryId?.name || item.serviceId?.name || 'General',
            readTime: `${item.readTime} min read`,
            image: item.coverImage?.url ? encodeURI(`https://devapis.doorstephub.com${item.coverImage.url}`) : 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?w=800',
            trending: item.isTrending,
            summary: item.summary,
            slug: item.slug,
            isDummy: false
          }));
          setArticles(mappedArticles);
        } else {
          setArticles(dummyArticles);
        }
      } catch (error) {
        console.error('Error fetching knowledge base:', error);
        setArticles(dummyArticles);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Skeleton Card
  const SkeletonCard = () => (
    <div className="w-[240px] shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-[#1a1a1a] md:w-full">
      <div className="h-36 bg-white/5 animate-pulse" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 rounded bg-white/5 animate-pulse" />
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-12 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Architectural Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] via-white to-[#f8fafc]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-3 px-5 py-2.5 bg-[#037166]/5 border border-[#037166]/10 rounded-full mb-8 shadow-sm">
            <BookOpen className="w-5 h-5 text-[#037166]" />
            <h6 className="text-sm text-[#037166] font-bold uppercase tracking-widest">Knowledge Base</h6>
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight">
              <span className="text-gray-900">Expert Insights & </span>
              <span className="text-[#037166]">Knowledge Hub</span>
          </h2>

          <p className="text-gray-500 text-xl max-w-3xl mx-auto leading-relaxed">
            Master your home maintenance with professional tips, technical insights, and stories from our expert community.
          </p>
        </motion.div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : articles.slice(0, 4).map((article, index) => (
              <motion.div
                key={article.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`group ${article.isDummy ? 'cursor-not-allowed grayscale-[0.5] opacity-60' : ''}`}
              >
                <Link href={article.isDummy ? '#' : `/knowledge/${article.slug}`}>
                  <motion.div
                    whileHover={article.isDummy ? {} : { y: -6 }}
                    className={`relative h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:border-[#037166]/30 ${article.isDummy ? 'pointer-events-none' : ''}`}
                  >
                    {/* Trending Badge */}
                    {article.trending && (
                      <div className="absolute top-3 right-3 z-20 flex items-center space-x-1.5 rounded-md bg-[#037166] px-3 py-1 shadow-md">
                        <TrendingUp className="w-3.5 h-3.5 text-white" />
                        <h6 className="text-[10px] font-bold uppercase tracking-wider text-white">Trending</h6>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      <ImageWithFallback
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Category Badge */}
                      <div className="absolute bottom-3 left-3 rounded-md bg-[#037166] px-3 py-1 shadow-sm">
                        <h6 className="text-[10px] font-bold text-white uppercase tracking-wider">
                          {article.category}
                        </h6>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h4 className="mb-2 line-clamp-2 text-gray-900 text-base font-bold leading-snug group-hover:text-[#037166] transition-colors">
                        {article.title}
                      </h4>
                      <p className="mb-4 line-clamp-2 text-xs text-gray-500 leading-relaxed">
                        {article.summary}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-1.5 text-xs text-gray-500 font-semibold">
                          <Clock className="h-3.5 w-3.5 text-[#037166]" />
                          <span>{article.readTime}</span>
                        </div>
                        
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#037166] transition-colors">
                          <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/knowledge">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 mb-5 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-black text-xl shadow-2xl shadow-[#037166]/30 hover:shadow-[#037166]/50 transition-all duration-300 inline-flex items-center gap-4 group"
            >
              <span>Explore All Articles</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

