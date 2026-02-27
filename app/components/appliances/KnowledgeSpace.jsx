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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/knowledge-base');
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          const mappedArticles = data.data.slice(0, 4).map(item => ({
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
    <div className="h-full rounded-3xl overflow-hidden bg-[#1a1a1a] border mb-3 border-white/5">
      <div className="h-48 bg-white/5 animate-pulse" />
      <div className="p-6 space-y-4">
        <div className="h-6 w-3/4 bg-white/5 rounded animate-pulse" />
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-12 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative py-18 overflow-hidden">
      {/* Architectural World Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d12] to-[#0a0a0a]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Gradient Orbs - Intensified */}
        <motion.div
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#037166]/40 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: -mousePosition.x * 0.02,
            y: -mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#025951]/40 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-white/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-6">
            <BookOpen className="w-4 h-4 text-[#037166]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent font-medium">Creative Studio Cards</h6>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent">Knowledge Hub</span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore insights, tips, and stories from our community of service providers and users
          </p>
        </motion.div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : articles.map((article, index) => (
              <motion.div
                key={article.id || index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`group ${article.isDummy ? 'cursor-not-allowed grayscale-[0.5] opacity-80' : ''}`}
              >
                <Link href={article.isDummy ? '#' : `/knowledge/${article.slug}`}>
                  {/* Studio Card */}
                  <motion.div
                    whileHover={article.isDummy ? {} : { y: -10 }}
                    className={`relative h-full bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl border border-[#037166]/20 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#037166]/20 transition-all duration-300 ${article.isDummy ? 'pointer-events-none' : ''}`}
                  >
                    {/* Trending Badge */}
                    {article.trending && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 px-8 py-1 bg-gradient-to-r from-[#037166] via-white to-[#037166] backdrop-blur-md rounded-lg rounded-t-none border border-t-0 border-[#037166]/30 shadow-lg whitespace-nowrap flex items-center space-x-2">
                        <TrendingUp className="w-3 h-3 text-[#037166]" />
                        <h6 className="text-xs font-bold text-[#037166]">Trending</h6>
                      </div>
                    )}


                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

                      {/* Category Badge */}
                      <div className="absolute bottom-4 left-4 px-3 py-1 bg-[#037166]/80 backdrop-blur-md rounded-full">
                        <h6 className="text-xs font-semibold text-white uppercase tracking-wider">
                          {article.category}
                        </h6>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h4 className="text-lg font-bold bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent mb-2 leading-snug line-clamp-1">
                        {article.title}
                      </h4>
                      <p className="text-white/60 text-sm mb-4 line-clamp-2">
                        {article.summary}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4 text-[#037166]" />
                          <span>{article.readTime}</span>
                        </div>


                      </div>
                    </div>

                    {/* Hover Glow */}
                    {!article.isDummy && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#037166]/0 via-[#037166]/20 to-[#037166]/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/knowledge">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-[#037166] to-[#025951] rounded-full text-white font-semibold shadow-xl shadow-[#037166]/40 hover:shadow-2xl hover:shadow-[#037166]/50 transition-all inline-flex items-center space-x-2"
            >
              <span>Explore All Articles</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Newsletter Signup */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 max-w-3xl mx-auto p-8 bg-gradient-to-r from-[#1a1a1a]/80 via-[#1a1a1a]/90 to-[#1a1a1a]/80 backdrop-blur-xl border-2 border-[#037166]/30 rounded-3xl"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
            <p className="text-gray-400">Get the latest articles and exclusive insights delivered to your inbox</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-[#0a0a0a]/80 border border-[#037166]/30 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#037166] transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gradient-to-r from-[#037166] to-[#025951] rounded-full text-white font-semibold shadow-lg shadow-[#037166]/40 hover:shadow-xl hover:shadow-[#037166]/50 transition-all whitespace-nowrap"
            >
              Subscribe Now
            </motion.button>
          </div>
        </motion.div> */}
      </div>
    </section>
  );
}
