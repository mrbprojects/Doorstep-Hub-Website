'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Calendar, User, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { NewsletterWidget } from '@/components/shared/NewsletterWidget';

export function ArticleViewPage({ slug }) {
    const router = useRouter();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedArticles, setRelatedArticles] = useState([]);

    useEffect(() => {
        const fetchArticleData = async () => {
            try {
                setLoading(true);
                // Fetch all articles to find the one matching the slug
                // In a real scenario, there should be an endpoint to fetch by slug directly
                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/knowledge-base');
                const data = await response.json();

                if (data.success && data.data) {
                    const foundArticle = data.data.find(item => item.slug === slug);

                    if (foundArticle) {
                        setArticle({
                            id: foundArticle._id,
                            title: foundArticle.title,
                            category: foundArticle.subcategoryId?.name || foundArticle.categoryId?.name || 'General',
                            readTime: `${foundArticle.readTime} min read`,
                            image: foundArticle.coverImage?.url ? encodeURI(`https://api.doorstephub.com${foundArticle.coverImage.url}`) : 'https://images.unsplash.com/photo-1582498674105-ad104fcc5784?w=800',
                            content: foundArticle.description || foundArticle.content || 'No content available.',
                            author: foundArticle.author || 'Doorstep Hub', // Assuming author field exists or default
                            date: new Date(foundArticle.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
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
    }, [slug]);

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
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
                <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
                <p className="text-gray-400 mb-8">The article you are looking for does not exist or has been removed.</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-[#037166] hover:bg-[#025951] rounded-full transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
            {/* Reading Progress Bar - Could be added later */}

            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-[500px] w-full">
                <div className="absolute inset-0">
                    <ImageWithFallback
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                </div>

                <div className="absolute inset-0 flex flex-col justify-end pb-20">
                    <div className="max-w-4xl mx-auto w-full px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-white/80 hover:text-[#037166] transition-colors mb-6 group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                Back to Home
                            </Link>

                            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm font-medium">
                                <span className="px-3 py-1 bg-[#037166] text-white rounded-full">
                                    {article.category}
                                </span>
                                <span className="flex items-center gap-1 text-white/80">
                                    <Clock className="w-4 h-4" />
                                    {article.readTime}
                                </span>
                                <span className="flex items-center gap-1 text-white/80">
                                    <Calendar className="w-4 h-4" />
                                    {article.date}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                {article.title}
                            </h1>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#037166]/20 flex items-center justify-center border border-[#037166]/50">
                                    <User className="w-5 h-5 text-[#037166]" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Written by</p>
                                    <p className="text-[#037166]">{article.author}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Main Content */}
                <div className="lg:col-span-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="prose prose-invert prose-lg max-w-none"
                    >
                        {/* 
                           We are dangerously setting HTML here assuming the API returns HTML content.
                           If it returns plain text, we would render differently or use a markdown parser.
                           Sanitization should ideally happen on the server or use a library like DOMPurify.
                        */}
                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
                    </motion.div>

                    {/* Share Section */}
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-[#037166]" />
                            Share this article
                        </h3>
                        <div className="flex gap-4">
                            <button onClick={() => handleShare('facebook')} className="p-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] rounded-full transition-colors">
                                <Facebook className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleShare('twitter')} className="p-3 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-full transition-colors">
                                <Twitter className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleShare('linkedin')} className="p-3 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] rounded-full transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleShare('copy')} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
                                <LinkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-4 space-y-8">
                    {/* Newsletter Widget */}
                    <NewsletterWidget compact />

                    {/* Related Articles */}
                    {relatedArticles.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-2">Related Articles</h3>
                            <div className="space-y-6">
                                {relatedArticles.map((item) => (
                                    <Link key={item.id} href={`/knowledge/${item.slug}`} className="group block">
                                        <div className="flex gap-4">
                                            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
                                                <ImageWithFallback
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs text-[#037166] font-medium mb-1 block">{item.category}</span>
                                                <h4 className="text-white font-medium line-clamp-2 group-hover:text-[#037166] transition-colors mb-2">
                                                    {item.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {item.readTime}
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
