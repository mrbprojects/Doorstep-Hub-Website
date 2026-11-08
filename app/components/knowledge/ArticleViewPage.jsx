'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Calendar, User, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { NewsletterWidget } from '@/components/shared/NewsletterWidget';
import DOMPurify from 'dompurify';

export function ArticleViewPage({ slug, initialArticle = null, initialRelated = [] }) {
    const router = useRouter();
    const [article, setArticle] = useState(initialArticle);
    const [loading, setLoading] = useState(!initialArticle);
    const [relatedArticles, setRelatedArticles] = useState(initialRelated);

    useEffect(() => {
        if (initialArticle) return;
        const fetchArticleData = async () => {
            try {
                setLoading(true);
                // Fetch all articles to find the one matching the slug
                // In a real scenario, there should be an endpoint to fetch by slug directly
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/knowledge-base`);
                const data = await response.json();

                if (data.success && data.data) {
                    const foundArticle = data.data.find(item => item.slug === slug);

                    if (foundArticle) {
                        const rawDate = foundArticle.createdAt || foundArticle.created_at || foundArticle.date || foundArticle.updatedAt;
                        let formattedDate = 'Recently Updated';
                        if (rawDate) {
                            const parsedDate = new Date(rawDate);
                            if (!isNaN(parsedDate.getTime())) {
                                formattedDate = parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                            }
                        }

                        // Prioritize full rich text content saved from CKEditor
                        const fullContent = foundArticle.content || foundArticle.description || foundArticle.summary || 'No content available.';

                        setArticle({
                            id: foundArticle._id,
                            title: foundArticle.title,
                            category: foundArticle.subcategoryId?.name || foundArticle.categoryId?.name || 'General',
                            readTime: foundArticle.readTime ? `${foundArticle.readTime} min read` : '3 min read',
                            image: foundArticle.coverImage?.url ? encodeURI(`https://api.doorstephub.com${foundArticle.coverImage.url}`) : 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?w=800',
                            content: fullContent,
                            author: foundArticle.author || 'Doorstep Hub',
                            date: formattedDate,
                            tags: foundArticle.tags || []
                        });

                        // Filter related articles (exclude current one)
                        const others = data.data.filter(item => item.slug !== slug).slice(0, 3).map(item => ({
                            id: item._id,
                            title: item.title,
                            category: item.subcategoryId?.name || 'General',
                            image: item.coverImage?.url ? encodeURI(`https://api.doorstephub.com${item.coverImage.url}`) : 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?w=800',
                            slug: item.slug,
                            readTime: `${item.readTime} min read`
                        }));
                        setRelatedArticles(others);
                    }
                }
            } catch (error) {
                console.error('Error fetching article:', error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchArticleData();
        }
    }, [slug, initialArticle]);

    useEffect(() => {
        if (!loading && !article) {
            router.replace('/appliance-repair-services');
        }
    }, [loading, article, router]);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleShare = (platform) => {
        if (typeof window === 'undefined') return;

        let url = '';
        const text = `Check out this article: ${article?.title}`;

        switch (platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(shareUrl);
                // Ideally show a toast here
                return;
            default:
                return;
        }

        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#037166] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#037166] animate-pulse">Loading Article...</p>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-[#0a0a0a]" />
        );
    }

    return (
        <article className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
            {/* Reading Progress Bar - Could be added later */}

            {/* Hero Section */}
            <div className="relative py-12 lg:py-16 w-full bg-gradient-to-r from-[#123F4A] via-[#0f343d] to-[#037166] text-white">
                <div className="max-w-7xl mx-auto w-full px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:max-w-4xl"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-6 group bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 w-fit text-sm"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Back to Home</span>
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/30">
                                {article.category}
                            </span>
                            <div className="flex items-center gap-4 text-sm text-white/90 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-emerald-300" />
                                    {article.readTime}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-emerald-300" />
                                    {article.date}
                                </span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                            {article.title}
                        </h1>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">Written by</p>
                                <p className="text-base font-bold text-white leading-tight">{article.author}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Main Content */}
                <div className="lg:col-span-8">
                    {/* Featured Article Cover Image — Clear & Fit to Card */}
                    {article.image && (
                        <div className="mb-10 w-full overflow-hidden rounded-2xl border border-slate-200 shadow-md bg-slate-50">
                            <ImageWithFallback
                                src={article.image}
                                alt={article.title}
                                className="w-full h-auto max-h-[460px] object-cover transition-transform duration-500 hover:scale-[1.01]"
                            />
                        </div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="article-ck-content"
                    >
                        <div dangerouslySetInnerHTML={{ __html: typeof window !== 'undefined' ? DOMPurify.sanitize(article.content, { ADD_ATTR: ['target', 'href', 'src', 'alt', 'class', 'style'] }) : article.content }} />
                    </motion.div>

                    {/* Share Section */}
                    <div className="mt-16 pt-10 border-t border-gray-100">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                            <Share2 className="w-6 h-6 text-[#037166]" />
                            Share this article
                        </h3>
                        <div className="flex gap-4">
                            <button onClick={() => handleShare('facebook')} className="p-4 bg-gray-50 hover:bg-[#1877F2] hover:text-white text-[#1877F2] rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md">
                                <Facebook className="w-6 h-6" />
                            </button>
                            <button onClick={() => handleShare('twitter')} className="p-4 bg-gray-50 hover:bg-[#1DA1F2] hover:text-white text-[#1DA1F2] rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md">
                                <Twitter className="w-6 h-6" />
                            </button>
                            <button onClick={() => handleShare('linkedin')} className="p-4 bg-gray-50 hover:bg-[#0A66C2] hover:text-white text-[#0A66C2] rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md">
                                <Linkedin className="w-6 h-6" />
                            </button>
                            <button onClick={() => handleShare('copy')} className="p-4 bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-900 rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md">
                                <LinkIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-4 space-y-12">
                    {/* Newsletter Widget */}
                    <div className="bg-gray-50 rounded-3xl p-1 border border-gray-100 shadow-sm">
                        <NewsletterWidget compact />
                    </div>

                    {/* Related Articles */}
                    {relatedArticles.length > 0 && (
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-2xl font-bold mb-8 text-gray-900">Related Articles</h3>
                            <div className="space-y-8">
                                {relatedArticles.map((item) => (
                                    <Link key={item.id} href={`/knowledge/${item.slug}`} className="group block">
                                        <div className="flex gap-5">
                                            <div className="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                                                <ImageWithFallback
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs text-[#037166] font-bold uppercase tracking-wider mb-2 block">{item.category}</span>
                                                <h4 className="text-gray-900 font-bold text-lg line-clamp-2 group-hover:text-[#037166] transition-colors mb-2 leading-tight">
                                                    {item.title}
                                                </h4>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-[#037166]" />
                                                        {item.readTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </article>
    );
}

