'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { BookOpen, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { NewsletterWidget } from '@/components/shared/NewsletterWidget';

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

export function KnowledgeSection() {
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
            image: item.coverImage?.url ? encodeURI(`https://api.doorstephub.com${item.coverImage.url}`) : 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?w=800',
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
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#03716605,transparent_50%),radial-gradient(circle_at_bottom_left,#04a99d05,transparent_50%)]" />
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-2 px-5 py-2 bg-[#037166]/5 border border-[#037166]/20 rounded-full mb-8">
            <BookOpen className="w-4 h-4 text-[#037166]" />
            <h6 className="text-xs font-black text-[#037166] uppercase tracking-[0.2em]">Insights & Stories</h6>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-[#037166]">
            Knowledge Hub
          </h2>

          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Explore insights, tips, and stories from our community of service providers and users
          </p>
        </motion.div>

        {/* Articles Grid */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-12 md:mx-0 md:px-0 md:overflow-visible">
          <div className="flex min-w-max gap-6 md:min-w-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : articles.map((article, index) => (
              <motion.div
                key={article.id || index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`group w-[280px] shrink-0 md:w-auto ${article.isDummy ? 'cursor-not-allowed grayscale-[0.5] opacity-80' : ''}`}
              >
                <Link href={article.isDummy ? '#' : `/knowledge/${article.slug}`}>
                  <motion.div
                    whileHover={article.isDummy ? {} : { y: -8 }}
                    className={`relative h-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-[#037166]/10 transition-all duration-500 ${article.isDummy ? 'pointer-events-none' : ''}`}
                  >
                    {/* Trending Badge */}
                    {article.trending && (
                      <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 rounded-full bg-[#037166] px-3 py-1.5 shadow-lg border border-white/20">
                        <TrendingUp className="w-3.5 h-3.5 text-white" />
                        <h6 className="text-[10px] font-black text-white uppercase tracking-wider">Trending</h6>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative h-44 overflow-hidden bg-gray-50">
                      <ImageWithFallback
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      {/* Removed all dark overlays */}
                      
                      {/* Category Badge */}
                      <div className="absolute bottom-4 left-4 rounded-full bg-[#037166] px-4 py-1.5 shadow-xl border border-white/10">
                        <h6 className="text-[10px] font-black text-white uppercase tracking-widest">
                          {article.category}
                        </h6>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h4 className="mb-3 line-clamp-2 text-gray-900 text-lg font-black leading-tight group-hover:text-[#037166] transition-colors">
                        {article.title}
                      </h4>
                      <p className="mb-4 line-clamp-2 text-sm text-gray-500 font-medium leading-relaxed">
                        {article.summary}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <Clock className="h-3.5 w-3.5 text-[#037166]" />
                          <span>{article.readTime}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#037166] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/knowledge">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-[#037166]/30 hover:shadow-[#037166]/50 transition-all inline-flex items-center space-x-3 group"
            >
              <span>Explore All Articles</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Newsletter Signup */}
        <div className="mt-28">
            <NewsletterWidget />
        </div>
      </div>
    </section>
  );
}

