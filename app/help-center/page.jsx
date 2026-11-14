'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Tv,
  Scissors,
  PawPrint,
  Building2,
  Landmark,
  ShoppingCart,
  ArrowRight,
  Plus,
  Minus,
  MessageCircle,
  Phone,
  Mail,
  Headphones,
  ShieldCheck,
  FileText,
  Truck,
  Award,
  HelpCircle,
  Wrench,
  X
} from 'lucide-react';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useGlobalSettings } from '@/context/GlobalSettingsContext';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { NewsletterWidget } from '@/components/shared/NewsletterWidget';
import { normalizeArticle } from '@/components/help-center/helpCenterData';

// Baseline category specifications matching design requirements
const BASELINE_HELP_CATEGORIES = [
  {
    id: 'appliance-repair',
    title: 'Appliance Repair',
    description: 'Guides for TV, AC, Fridge, Washing Machine, Microwave and other appliances.',
    baselineCount: 24,
    icon: Tv,
    iconBg: 'bg-[#fee2e2] text-[#e11d48]',
    route: '/help-center/appliance-repair',
    keywords: ['appliance', 'ac', 'tv', 'fridge', 'refrigerator', 'washing', 'microwave', 'repair'],
  },
  {
    id: 'salon-beauty-services',
    title: 'Salon & Beauty Services',
    description: 'Booking, services, pricing and technician details.',
    baselineCount: 12,
    icon: Scissors,
    iconBg: 'bg-[#fce7f3] text-[#db2777]',
    route: '/help-center/salon-beauty-services',
    keywords: ['salon', 'beauty', 'spa', 'facial', 'waxing', 'hair'],
  },
  {
    id: 'pet-care-services',
    title: 'Pet Care Services',
    description: 'Grooming, vaccination, booking process and care tips.',
    baselineCount: 10,
    icon: PawPrint,
    iconBg: 'bg-[#ffedd5] text-[#d97706]',
    route: '/help-center/pet-care-services',
    keywords: ['pet', 'dog', 'cat', 'grooming', 'vet'],
  },
  {
    id: 'pg-hostel',
    title: 'PG & Hostel',
    description: 'Booking, property details, facilities and policies.',
    baselineCount: 8,
    icon: Building2,
    iconBg: 'bg-[#e0f2fe] text-[#0284c7]',
    route: '/help-center/pg-hostel',
    keywords: ['pg', 'hostel', 'coliving', 'rent', 'room'],
  },
  {
    id: 'pooja-religious-services',
    title: 'Pooja & Religious Services',
    description: 'Pandit booking, rituals, packages and guidelines.',
    baselineCount: 11,
    icon: Landmark,
    iconBg: 'bg-[#fef3c7] text-[#b45309]',
    route: '/help-center/pooja-religious-services',
    keywords: ['pooja', 'puja', 'religious', 'pandit', 'havan', 'homa', 'ritual'],
  },
  {
    id: 'buy-sell-old-things',
    title: 'Buy & Sell Old Things',
    description: 'Posting ads, buying, selling and safety tips.',
    baselineCount: 9,
    icon: ShoppingCart,
    iconBg: 'bg-[#ccfbf1] text-[#0f766e]',
    route: '/help-center/buy-sell-old-things',
    keywords: ['buy', 'sell', 'used', 'second-hand', 'old', 'scrap', 'resell'],
  },
];

// Featured articles matching visual reference
const INITIAL_FEATURED_GUIDES = [
  {
    id: 'g1',
    title: 'Why is My AC Not Cooling? Causes & Solutions',
    category: 'AC REPAIR',
    image: '/help-center/guide-ac.jpg',
    fallbackImage: '/help-center/guide-ac.jpg',
    excerpt: 'Common reasons for poor cooling and how to fix them.',
    slug: 'why-is-my-ac-not-cooling-causes-and-solutions',
    categorySlug: 'appliance-repair',
  },
  {
    id: 'g2',
    title: 'How to Maintain Your Refrigerator for Longer Life',
    category: 'REFRIGERATOR',
    image: '/help-center/guide-fridge.jpg',
    fallbackImage: '/help-center/guide-fridge.jpg',
    excerpt: 'Simple tips to keep your fridge working efficiently.',
    slug: 'how-to-maintain-your-refrigerator-for-longer-life',
    categorySlug: 'appliance-repair',
  },
  {
    id: 'g3',
    title: "Washing Machine Not Spinning? Here's What to Do",
    category: 'WASHING MACHINE',
    image: '/help-center/guide-washer.jpg',
    fallbackImage: '/help-center/guide-washer.jpg',
    excerpt: 'Step-by-step troubleshooting guide.',
    slug: 'washing-machine-not-spinning-troubleshooting-guide',
    categorySlug: 'appliance-repair',
  },
  {
    id: 'g4',
    title: 'LED TV Black Screen – Possible Causes and Fixes',
    category: 'TV & LAPTOP',
    image: '/help-center/guide-laptop.jpg',
    fallbackImage: '/help-center/guide-laptop.jpg',
    excerpt: 'How to identify and fix common screen issues.',
    slug: 'led-tv-black-screen-possible-causes-and-fixes',
    categorySlug: 'appliance-repair',
  },
];

// Core FAQs
const FAQS = [
  {
    question: 'How can I book a service?',
    answer:
      'You can book a service directly through the Doorstep Hub website or mobile app. Simply select your appliance or home service, choose your preferred date and time slot, enter your address, and confirm. A verified technician will arrive at your doorstep on time.',
  },
  {
    question: 'Can I reschedule or cancel my booking?',
    answer:
      'Yes, you can easily reschedule or cancel your appointment free of charge before the technician arrives at your home. Simply go to your Account Dashboard or call our support line at +91 809 695 9696.',
  },
  {
    question: 'Do you provide warranty on repairs?',
    answer:
      'Yes! Most appliance repair services completed by Doorstep Hub verified experts include up to 30 to 90 days service and spare parts warranty depending on the service category.',
  },
  {
    question: 'How are service charges calculated?',
    answer:
      'We follow 100% transparent pricing. Our charges consist of a standard diagnostic inspection fee, plus standardized part/labor rates if you choose to proceed with the repair. No hidden fees or surprise charges.',
  },
  {
    question: 'Are your technicians verified?',
    answer:
      'Yes, 100% of our technicians undergo rigorous identity verification, criminal background checks, and practical skills evaluations to ensure safe, professional service at your home.',
  },
  {
    question: 'In which cities are your services available?',
    answer:
      'Doorstep Hub operates across major metropolitan areas and tier-1/tier-2 cities across India, including Bangalore, Hyderabad, Mumbai, Delhi-NCR, Chennai, Pune, Vizag, and Vijayawada.',
  },
];

const POPULAR_SEARCHES = [
  'Appliance Repair',
  'AMC Plans',
  'Booking Guide',
  'Pricing & Warranty',
  'Technician',
  'Payments',
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [featuredArticles] = useState(INITIAL_FEATURED_GUIDES);
  const [apiArticles, setApiArticles] = useState([]);
  const [categories, setCategories] = useState(BASELINE_HELP_CATEGORIES);
  const [loadingArticles, setLoadingArticles] = useState(false);

  const { policy: contextPolicy } = useGlobalSettings() || {};
  const supportPhone = contextPolicy?.phone || '+91 88866 88666';
  const supportEmail = contextPolicy?.email || 'support@doorstephub.com';
  const whatsappClean = String(contextPolicy?.whatsapp || '918886688666').replace(/[^0-9]/g, '');

  // Fetch real articles and calculate dynamic category counts
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoadingArticles(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/knowledge-base?limit=100`);
        const data = await res.json();

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          // Normalize all articles with auto-detected business vertical
          const normalizedList = data.data.map(item => normalizeArticle(item)).filter(Boolean);
          setApiArticles(normalizedList);

          // Calculate dynamic category counts
          const dynamicCategories = BASELINE_HELP_CATEGORIES.map(cat => {
            const matches = normalizedList.filter(art => art.categorySlug === cat.id);
            // Show real count if greater than baseline, otherwise preserve baseline
            const count = Math.max(cat.baselineCount, matches.length);
            return {
              ...cat,
              articleCount: count,
            };
          });
          setCategories(dynamicCategories);
        }
      } catch (err) {
        console.error('Error fetching dynamic help articles:', err);
      } finally {
        setLoadingArticles(false);
      }
    };

    fetchArticles();
  }, []);

  // Filter FAQs based on search query
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQS;
    const q = searchQuery.toLowerCase().trim();
    return FAQS.filter(
      (faq) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filter Guides based on search query
  const searchedArticles = useMemo(() => {
    if (!searchQuery.trim()) return featuredArticles;
    const q = searchQuery.toLowerCase().trim();
    const allCandidates = [...featuredArticles, ...apiArticles];
    const seen = new Set();
    const unique = [];
    for (const art of allCandidates) {
      const key = art.slug || art.title;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(art);
      }
    }
    return unique.filter(
      (art) =>
        art.title.toLowerCase().includes(q) ||
        (art.excerpt && art.excerpt.toLowerCase().includes(q)) ||
        (art.category && art.category.toLowerCase().includes(q))
    );
  }, [searchQuery, featuredArticles, apiArticles]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const section = document.getElementById('articles-section') || document.getElementById('faqs-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePillClick = (term) => {
    setSearchQuery(term);
    const section = document.getElementById('articles-section') || document.getElementById('faqs-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col antialiased">
      <Header />

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION
          ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#ebf7f5] via-[#f7fcfb] to-white pt-28 pb-14 sm:pt-32 sm:pb-20 border-b border-teal-100/50">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-[350px] h-[350px] bg-emerald-100/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 text-left"
            >
              {/* Eyebrow Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#008C80]/10 border border-[#008C80]/20 text-[#008C80] text-xs font-bold uppercase tracking-wider mb-5">
                <Wrench className="w-3.5 h-3.5 text-[#008C80]" />
                <span>DOORSTEP HUB HELP CENTER</span>
              </div>

              {/* H1 Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black text-gray-900 leading-[1.12] mb-4 tracking-tight">
                How can we <span className="text-[#008C80]">help you</span> today?
              </h1>

              {/* Subtitle */}
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-8 max-w-xl leading-relaxed font-normal">
                Find answers, guides and step-by-step solutions for appliance repairs, home maintenance, AMC plans, bookings and more.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center bg-white rounded-full shadow-[0_10px_35px_rgba(0,140,128,0.08)] border border-gray-200/90 p-1.5 sm:p-2 max-w-xl mb-4 focus-within:border-[#008C80] focus-within:ring-2 focus-within:ring-[#008C80]/20 transition-all"
              >
                <Search className="w-5 h-5 text-gray-400 ml-3.5 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for articles, guides and FAQs..."
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm sm:text-base outline-none pr-3"
                  aria-label="Search articles, guides and FAQs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1 text-gray-400 hover:text-gray-600 mr-2 rounded-full"
                    aria-label="Clear search query"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-[#008C80] hover:bg-[#006D65] text-white px-7 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all shrink-0"
                >
                  Search
                </button>
              </form>

              {/* Popular Searches */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-gray-800 mr-1">Popular searches:</span>
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handlePillClick(term)}
                    className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-700 text-xs font-medium hover:border-[#008C80] hover:text-[#008C80] shadow-2xs hover:shadow-xs transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Right Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 relative flex justify-center"
            >
              <div className="relative w-full max-w-[480px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 bg-white">
                <Image
                  src="/help-center/hero-technician.jpg"
                  alt="Doorstep Hub Verified Professional Technician"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover object-center"
                />

                {/* Floating Benefit Card (Top Right) */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-xl border border-gray-100 z-20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <ShieldCheck className="w-4 h-4 text-[#008C80]" />
                    <span>Verified Technicians</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <FileText className="w-4 h-4 text-[#008C80]" />
                    <span>Transparent Pricing</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <Truck className="w-4 h-4 text-[#008C80]" />
                    <span>Doorstep Service</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <Award className="w-4 h-4 text-[#008C80]" />
                    <span>Service Warranty</span>
                  </div>
                </div>

                {/* Floating Trust Badge (Bottom Left) */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-xl border border-teal-100 z-20 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#008C80] flex items-center justify-center text-white shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 leading-tight">Trusted Home Services</div>
                    <div className="text-[10px] text-gray-500 font-medium">Professional. Safe. Reliable.</div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. BROWSE HELP TOPICS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-18 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#008C80] mb-2">
              BROWSE HELP TOPICS
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2.5 tracking-tight">
              Find the help you need
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Explore help topics by choosing a category below
            </p>
          </div>

          {/* 6 Category Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {categories.map((cat, index) => {
              const IconComp = cat.icon;
              const count = cat.articleCount || cat.baselineCount;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="h-full"
                >
                  <Link
                    href={cat.route}
                    className="h-full bg-white rounded-2xl border border-gray-200/90 p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 hover:border-[#008C80]/50 transition-all duration-300 group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008C80]"
                  >
                    <div>
                      {/* Round Icon */}
                      <div className={`w-14 h-14 rounded-full ${cat.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                        <IconComp className="w-6 h-6 stroke-[2.2]" />
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-gray-900 text-sm sm:text-base mb-2 group-hover:text-[#008C80] transition-colors leading-snug">
                        {cat.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
                        {cat.description}
                      </p>
                    </div>

                    {/* Bottom Count & Arrow */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs font-semibold text-gray-600 group-hover:text-[#008C80] transition-colors">
                      <span>{count} articles</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. POPULAR GUIDES & FEATURED ARTICLES (VISUAL REFERENCE)
          ───────────────────────────────────────────────────────────── */}
      <section id="articles-section" className="py-14 sm:py-18 bg-[#f9fbfb] border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#008C80] mb-1">
                POPULAR GUIDES & ARTICLES
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 tracking-tight">
                Step-by-step guides for you
              </h2>
              <p className="text-gray-500 text-sm">
                Read our most helpful articles and tutorials
              </p>
            </div>
            <Link
              href="/help-center/appliance-repair"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#008C80] hover:underline shrink-0"
            >
              <span>View All Articles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Article Cards Grid Matching Reference */}
          {loadingArticles ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-[20px] border border-gray-100 p-4 shadow-sm animate-pulse flex flex-col justify-between h-[360px]">
                  <div>
                    <div className="aspect-[16/10] w-full rounded-xl bg-slate-100 mb-4" />
                    <div className="h-4 w-28 bg-teal-100/60 rounded-full mb-3" />
                    <div className="h-5 w-4/5 bg-slate-100 rounded mb-2" />
                    <div className="h-4 w-full bg-slate-50 rounded mb-1" />
                    <div className="h-4 w-2/3 bg-slate-50 rounded" />
                  </div>
                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="h-4 w-20 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchedArticles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-lg mx-auto">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-gray-800 mb-1">No articles found for &ldquo;{searchQuery}&rdquo;</h4>
              <p className="text-xs text-gray-500 mb-4">Try another search term or browse our categories above.</p>
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-5 py-2 rounded-full bg-[#008C80] text-white text-xs font-bold hover:bg-[#006D65] transition-all"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {searchedArticles.slice(0, 4).map((guide, idx) => {
                const articleUrl = guide.slug
                  ? `/help-center/${guide.categorySlug || 'appliance-repair'}/${guide.slug}`
                  : '/help-center';

                return (
                  <motion.div
                    key={guide.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                    className="h-full"
                  >
                    <Link
                      href={articleUrl}
                      className="bg-white rounded-[20px] overflow-hidden border border-[#E4E7EC] hover:border-[#008C80]/50 p-4 flex flex-col justify-between h-full shadow-[0_4px_20px_-2px_rgba(16,24,40,0.05)] hover:shadow-[0_12px_28px_-4px_rgba(0,140,128,0.12)] hover:-translate-y-1 transition-all duration-300 group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008C80]"
                    >
                      <div>
                        {/* Rounded Article Image */}
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 mb-3.5">
                          <ImageWithFallback
                            src={guide.image}
                            alt={guide.title}
                            fallbackSrc={guide.fallbackImage || '/help-center/guide-ac.jpg'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Category Badge */}
                        <div className="mb-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E9F8F6] text-[#008C80] text-[10px] font-extrabold uppercase tracking-wider">
                            {guide.category}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-extrabold text-[#101828] text-sm sm:text-base leading-snug mb-2 group-hover:text-[#008C80] transition-colors line-clamp-2">
                          {guide.title}
                        </h3>

                        {/* Clean Excerpt */}
                        <p className="text-[#475467] text-xs sm:text-sm leading-relaxed line-clamp-2 mb-4">
                          {guide.excerpt}
                        </p>
                      </div>

                      {/* Card Footer: Read Article Link */}
                      <div className="pt-3 border-t border-[#F2F4F7] text-xs sm:text-sm font-bold text-[#008C80] inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. FREQUENTLY ASKED QUESTIONS
          ───────────────────────────────────────────────────────────── */}
      <section id="faqs-section" className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#EAF8F6] border border-[#CDEAE5] rounded-[32px] p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-sm">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Heading, Button, 3D Assistant Illustration */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#008C80] mb-2">
                  <Wrench className="w-4 h-4 text-[#008C80]" />
                  <span>FREQUENTLY ASKED QUESTIONS</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight tracking-tight">
                  Quick Answers to Common Questions
                </h2>

                <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-sm leading-relaxed">
                  Get instant answers to the most common questions about Doorstep Hub services.
                </p>

                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === null ? 0 : null)}
                  className="inline-flex items-center gap-2 bg-[#008C80] hover:bg-[#006D65] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all mb-6 lg:mb-8"
                >
                  <span>View All FAQs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 3D Character Avatar */}
                <div className="relative w-48 sm:w-56 lg:w-60 h-48 sm:h-56 lg:h-60 mt-auto">
                  <Image
                    src="/help-center/faq-avatar.png"
                    alt="Doorstep Hub Customer Support FAQ Assistant"
                    fill
                    sizes="(max-width: 640px) 192px, (max-width: 1024px) 224px, 240px"
                    className="object-contain drop-shadow-lg"
                  />
                </div>
              </div>

              {/* Right Column: Accessible FAQ Accordion */}
              <div className="lg:col-span-7 space-y-3">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <motion.div
                      key={index}
                      initial={false}
                      className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden transition-all duration-200 hover:border-[#008C80]/40"
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008C80]"
                      >
                        <span className="font-extrabold text-sm sm:text-base text-gray-900 leading-snug">
                          {faq.question}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isOpen ? 'bg-[#008C80] text-white' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. BOTTOM SUPPORT & CONTACT CARDS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Chat with Support */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#008C80]/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#008C80] flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-base mb-1">Chat with Support</h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Get quick help from our support team.
                </p>
              </div>
              <a
                href={`https://wa.me/${whatsappClean}?text=Hi%20Doorstep%20Hub%20Support`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#008C80] inline-flex items-center gap-1.5 hover:underline"
              >
                <span>Start Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Card 2: Call Us */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#008C80]/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#008C80] flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-base mb-1">Call Us</h3>
                <a
                  href={`tel:${supportPhone.replace(/\s+/g, '')}`}
                  className="text-sm font-black text-[#008C80] block mb-1 hover:underline"
                >
                  {supportPhone}
                </a>
                <p className="text-xs text-gray-500">Mon - Sat, 9 AM - 7 PM</p>
              </div>
            </div>

            {/* Card 3: Email Support */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#008C80]/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#008C80] flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-base mb-1">Email Support</h3>
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-sm font-black text-[#008C80] block mb-1 hover:underline truncate"
                >
                  {supportEmail}
                </a>
                <p className="text-xs text-gray-500">We&apos;ll respond within 24 hours.</p>
              </div>
            </div>

            {/* Card 4: Request a Callback */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#008C80]/40 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#008C80] flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-base mb-1">Request a Callback</h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Prefer a call? We&apos;ll call you back at your convenience.
                </p>
              </div>
              <Link
                href="/book-appointment"
                className="text-xs font-bold text-[#008C80] inline-flex items-center gap-1.5 hover:underline"
              >
                <span>Request Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. NEWSLETTER / STAY UPDATED SECTION
          ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterWidget />
        </div>
      </section>

      <Footer />
    </div>
  );
}
