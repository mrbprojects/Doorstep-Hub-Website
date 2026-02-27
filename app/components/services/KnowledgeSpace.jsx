'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';

export function KnowledgeSpace() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/knowledge-base');
        const data = await response.json();

        if (data.success && data.data) {
          // Transform API data to match component structure
          const transformedArticles = data.data.slice(0, 4).map(article => {
            // Determine the best image to use
            let imageUrl = article.coverImage.url;



            // Ensure full URL
            const fullImageUrl = imageUrl.startsWith('http')
              ? imageUrl
              : `https://api.doorstephub.com/${imageUrl.replace(/^\//, '')}`;

            return {
              id: article._id,
              image: fullImageUrl,
              title: article.title,
              excerpt: article.summary,
              readTime: `${article.readTime} min read`,
              category: article.serviceId?.name || article.categoryId?.name || 'General',
              slug: article.slug,
              isTrending: article.isTrending
            };
          });
          setArticles(transformedArticles);
        }
      } catch (error) {
        console.error('Error fetching knowledge base articles:', error);
        // Fallback to empty array on error
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#037166] rounded-full blur-[150px]"
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 mb-4"
          >
            <BookOpen className="w-3 h-3 text-[#04a99d]" />
            <h6 className="text-sm font-medium text-[#04a99d]">LEARN & EXPLORE</h6>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent"
          >
            Knowledge Space
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl"
          >
            Expert tips and guides to help you maintain your home
          </motion.p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 backdrop-blur-sm animate-pulse">
                <div className="h-56 bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-5/6" />
                </div>
              </div>
            ))
          ) : articles.length > 0 ? (
            articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, rotateZ: index % 2 === 0 ? 1 : -1 }}
                className="group cursor-pointer"
              >
                <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 backdrop-blur-sm">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
                      <h6 className="text-xs font-medium text-[#04a99d]">{article.category}</h6>
                    </div>

                    {/* Trending Badge */}
                    {article.isTrending && (
                      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-[#037166]/80 backdrop-blur-md border border-[#037166]">
                        <h6 className="text-xs font-medium text-white">Trending</h6>
                      </div>
                    )}

                    {/* Hover Glow */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-[#037166]/30 to-transparent"
                    />

                    {/* Sketch Line Accent */}
                    <motion.svg
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileHover={{ pathLength: 1, opacity: 0.3 }}
                      transition={{ duration: 0.8 }}
                      className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                      viewBox="0 0 300 60"
                    >
                      <motion.path
                        d="M0,30 Q75,10 150,30 T300,30"
                        stroke="#04a99d"
                        strokeWidth="2"
                        fill="none"
                      />
                    </motion.svg>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h4 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-[#04a99d] transition-colors leading-snug">
                      {article.title}
                    </h4>
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>

                    {/* Read Time & CTA */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/50">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{article.readTime}</span>
                      </div>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-1 text-[#04a99d] font-medium text-sm"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Glass Border on Hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 rounded-2xl border-2 border-[#037166]/50 pointer-events-none"
                  />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-white/60">
              No articles available at the moment.
            </div>
          )}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#037166]/50 text-white font-medium transition-all duration-300 flex items-center gap-2 group"
          >
            Explore All Articles
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
