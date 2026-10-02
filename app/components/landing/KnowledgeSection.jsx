'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { NewsletterWidget } from '@/components/shared/NewsletterWidget';
import { normalizeArticle } from '@/components/help-center/helpCenterData';

// High-fidelity fallback articles matching the visual reference truth
const REFERENCE_ARTICLES = [
  {
    id: 'ref-1',
    title: 'How Do I Contact the Pandit About Ceremony Requirements?',
    category: 'RELIGIOUS SERVICES',
    readTime: '5 min read',
    image: 'https://api.doorstephub.com/uploads/knowledge_base/WhatsApp_Image_2026-09-07_at_131445-2.webp',
    fallbackImage: '/Bharath.png',
    excerpt: 'Learn how to communicate with a pandit after booking, share your ceremony details, and ask questions...',
    slug: 'how-do-i-contact-the-pandit-about-ceremony-requirements',
    categorySlug: 'pooja-religious-services',
  },
  {
    id: 'ref-2',
    title: 'How Do I Book a Housewarming Pooja?',
    category: 'RELIGIOUS SERVICES',
    readTime: '5 min read',
    image: 'https://api.doorstephub.com/uploads/knowledge_base/WhatsApp_Image_2026-09-07_at_131445-3.webp',
    fallbackImage: '/Bharath.png',
    excerpt: 'Follow this step-by-step guide to book a Griha Pravesh or Housewarming Pooja on Doorstep Hub with ease.',
    slug: 'how-do-i-book-a-housewarming-pooja',
    categorySlug: 'pooja-religious-services',
  },
  {
    id: 'ref-3',
    title: 'What Should I Prepare Before the Pandit Arrives?',
    category: 'RELIGIOUS SERVICES',
    readTime: '5 min read',
    image: 'https://api.doorstephub.com/uploads/knowledge_base/WhatsApp_Image_2026-09-07_at_131445-4.webp',
    fallbackImage: '/Bharath.png',
    excerpt: 'A complete checklist of items, spiritual setup, and important preparations to ensure a smooth pooja service at your home.',
    slug: 'prepare-before-pandit-arrives',
    categorySlug: 'pooja-religious-services',
  },
  {
    id: 'ref-4',
    title: 'How Are Pooja Service Charges Calculated?',
    category: 'RELIGIOUS SERVICES',
    readTime: '5 min read',
    image: 'https://api.doorstephub.com/uploads/knowledge_base/WhatsApp_Image_2026-09-07_at_131445-5.webp',
    fallbackImage: '/Bharath.png',
    excerpt: "Understand how pooja service pricing is determined, what's included, and factors that may affect the cost.",
    slug: 'pooja-service-charges',
    categorySlug: 'pooja-religious-services',
  }
];

export function KnowledgeSection({ initialArticles }) {
  const [articles, setArticles] = useState(
    initialArticles && initialArticles.length >= 4 ? initialArticles.slice(0, 4) : REFERENCE_ARTICLES
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/knowledge-base?limit=100`);
        const data = await response.json();

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          // Normalize all articles with automatic category detection
          const allNormalized = data.data.map(item => normalizeArticle(item)).filter(Boolean);

          // Group articles by their business vertical categorySlug
          const grouped = {};
          allNormalized.forEach(art => {
            if (!art.slug) return;
            const cat = art.categorySlug || 'appliance-repair';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(art);
          });

          // Distinct business verticals with available articles
          const availableVerticals = Object.keys(grouped).filter(slug => grouped[slug].length > 0);

          // Shuffle verticals randomly for this refresh
          const shuffledVerticals = [...availableVerticals].sort(() => 0.5 - Math.random());

          // Select 1 random article from each distinct business vertical
          const selectedArticles = [];
          for (const vSlug of shuffledVerticals) {
            if (selectedArticles.length >= 4) break;
            const pool = grouped[vSlug];
            if (pool && pool.length > 0) {
              const randomIndex = Math.floor(Math.random() * pool.length);
              selectedArticles.push(pool[randomIndex]);
            }
          }

          // Fallback: fill remaining slots with random unselected articles if < 4 verticals
          if (selectedArticles.length < 4) {
            const remaining = allNormalized.filter(
              a => !selectedArticles.some(s => s.slug === a.slug)
            );
            const shuffledRemaining = [...remaining].sort(() => 0.5 - Math.random());
            while (selectedArticles.length < 4 && shuffledRemaining.length > 0) {
              selectedArticles.push(shuffledRemaining.pop());
            }
          }

          const mappedArticles = selectedArticles.map(normalized => ({
            id: normalized.id,
            title: normalized.title,
            category: (normalized.category || 'SERVICE').toUpperCase(),
            readTime: normalized.readTime || '5 min read',
            image: normalized.image,
            fallbackImage: '/hero-technician.jpg',
            excerpt: normalized.excerpt,
            slug: normalized.slug,
            categorySlug: normalized.categorySlug || 'appliance-repair',
          }));

          setArticles(mappedArticles);
        }
      } catch (error) {
        console.error('Error fetching Help Center articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Skeleton Card matching the 4-card grid
  const SkeletonCard = () => (
    <div className="bg-white rounded-[20px] border border-gray-100 p-4 shadow-sm animate-pulse flex flex-col justify-between h-[380px]">
      <div>
        <div className="aspect-[16/10] w-full rounded-xl bg-slate-100 mb-4" />
        <div className="h-4 w-28 bg-teal-100/60 rounded-full mb-3" />
        <div className="h-5 w-4/5 bg-slate-100 rounded mb-2" />
        <div className="h-4 w-full bg-slate-50 rounded mb-1" />
        <div className="h-4 w-2/3 bg-slate-50 rounded" />
      </div>
      <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="h-4 w-16 bg-slate-100 rounded" />
        <div className="w-8 h-8 rounded-full bg-slate-100" />
      </div>
    </div>
  );

  return (
    <section id="help-center-resources" className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#008C8008,transparent_50%),radial-gradient(circle_at_bottom_left,#008C8005,transparent_50%)] pointer-events-none" />
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,140,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,140,128,0.03)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching Visual Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-12"
        >
          {/* Badge: HELP CENTER RESOURCES */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E9F8F6] border border-[#BCE3DE] text-[#008C80] text-xs font-black uppercase tracking-wider mb-3.5 shadow-2xs">
            <BookOpen className="w-4 h-4 text-[#008C80]" />
            <span>HELP CENTER RESOURCES</span>
          </div>

          {/* Title: Help Center with mint accent marks */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#101828] mb-3 tracking-tight">
            Help{' '}
            <span className="relative inline-block text-[#008C80]">
              Center
              {/* Playful Mint Brush Accent lines above "Center" matching reference */}
              <span className="absolute -top-3.5 sm:-top-4 -right-1 flex gap-1 pointer-events-none select-none">
                <span className="w-1 h-3 sm:h-3.5 bg-[#008C80] rounded-full rotate-[25deg] transform origin-bottom opacity-90" />
                <span className="w-1 h-3 sm:h-3.5 bg-[#008C80] rounded-full rotate-[45deg] transform origin-bottom opacity-90" />
              </span>
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-[#475467] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Explore helpful guides, answers, and service information for Doorstep Hub users.
          </p>
        </motion.div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : articles.map((article, index) => {
                const articleUrl = article.slug
                  ? `/help-center/${article.categorySlug || 'appliance-repair'}/${article.slug}`
                  : '/help-center';

                return (
                  <motion.div
                    key={article.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className="h-full"
                  >
                    <Link
                      href={articleUrl}
                      className="group bg-white rounded-[20px] border border-[#E4E7EC] hover:border-[#008C80]/50 p-4 flex flex-col justify-between h-full shadow-[0_4px_20px_-2px_rgba(16,24,40,0.05)] hover:shadow-[0_12px_28px_-4px_rgba(0,140,128,0.12)] hover:-translate-y-1 transition-all duration-300 block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008C80]"
                    >
                      <div>
                        {/* Rounded Article Image */}
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 mb-3.5">
                          <ImageWithFallback
                            src={article.image}
                            alt={article.title}
                            fallbackSrc={article.fallbackImage || '/Bharath.png'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Category Badge */}
                        <div className="mb-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E9F8F6] text-[#008C80] text-[10px] font-extrabold uppercase tracking-wider">
                            {article.category || 'RELIGIOUS SERVICES'}
                          </span>
                        </div>

                        {/* Article Title */}
                        <h3 className="font-extrabold text-[#101828] text-base leading-snug mb-2 group-hover:text-[#008C80] transition-colors line-clamp-2">
                          {article.title}
                        </h3>

                        {/* Clean Excerpt (never raw HTML!) */}
                        <p className="text-[#475467] text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4">
                          {article.excerpt}
                        </p>
                      </div>

                      {/* Card Footer: Read Time + Action Arrow */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#F2F4F7] text-xs text-[#667085] font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#008C80]" />
                          <span>{article.readTime || '5 min read'}</span>
                        </div>

                        {/* Action Arrow Button */}
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E9F8F6] text-[#008C80] group-hover:bg-[#008C80] group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5 shrink-0 shadow-2xs">
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
        </div>

        {/* Explore All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10 sm:mt-12"
        >
          <Link
            href="/help-center"
            className="btn-explore-all inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 bg-[#008C80] hover:bg-[#006D65] !text-white font-extrabold text-xs sm:text-sm tracking-wider rounded-full shadow-lg shadow-[#008C80]/20 hover:shadow-xl hover:scale-105 transition-all group"
            style={{ color: '#ffffff' }}
          >
            <span className="!text-white font-bold" style={{ color: '#ffffff' }}>Explore All</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 !text-white" style={{ color: '#ffffff', stroke: '#ffffff' }} />
          </Link>
        </motion.div>

        {/* Stay Updated / Newsletter Section */}
        <div className="mt-16 sm:mt-20">
          <NewsletterWidget />
        </div>

      </div>
    </section>
  );
}

export default KnowledgeSection;
