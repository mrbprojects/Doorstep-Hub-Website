'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HelpBreadcrumb } from '@/components/help-center/HelpBreadcrumb';
import { ArticleHeader } from '@/components/help-center/ArticleHeader';
import { ArticleRenderer } from '@/components/help-center/ArticleRenderer';
import { ArticleTableOfContents } from '@/components/help-center/ArticleTableOfContents';
import { BookServiceCard } from '@/components/help-center/BookServiceCard';
import { RelatedArticles } from '@/components/help-center/RelatedArticles';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { normalizeArticle } from '@/components/help-center/helpCenterData';

export default function ArticlePageClient({
    categorySlug,
    initialCategory,
    initialArticle,
    initialRelated = [],
    initialHeadings = [],
}) {
    const [category] = useState(initialCategory);
    const [article] = useState(initialArticle);
    const [relatedArticles, setRelatedArticles] = useState(initialRelated);
    const [headings, setHeadings] = useState(initialHeadings);

    // Ensure fresh randomized related articles from THIS VERTICAL ONLY on every client refresh
    React.useEffect(() => {
        const randomizeRelated = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/knowledge-base?limit=100`);
                const data = await res.json();
                if (data?.success && Array.isArray(data.data)) {
                    const normalizedAll = data.data.map(item => normalizeArticle(item)).filter(Boolean);
                    const sameVertical = normalizedAll.filter(
                        item => item.categorySlug === categorySlug && item.slug !== article?.slug
                    );
                    if (sameVertical.length > 0) {
                        const shuffled = [...sameVertical].sort(() => 0.5 - Math.random());
                        setRelatedArticles(shuffled.slice(0, 3));
                    }
                }
            } catch (err) {
                console.error('Error fetching random related articles:', err);
            }
        };

        randomizeRelated();
    }, [categorySlug, article?.slug]);

    if (!article) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col antialiased">
            <Header />

            {/* Main Article Container */}
            <main className="flex-1 pt-20 sm:pt-24 lg:pt-26 pb-14 sm:pb-18">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5 sm:space-y-4">
                    {/* ========================================================= */}
                    {/* BREADCRUMB                                                */}
                    {/* ========================================================= */}
                    <HelpBreadcrumb
                        items={[
                            {
                                label: category?.name || 'Category',
                                href: `/help-center/${categorySlug}`,
                            },
                            {
                                label: article.title,
                                href: null,
                            },
                        ]}
                    />

                    {/* Back to category button */}
                    <div>
                        <Link
                            href={`/help-center/${categorySlug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#037166] transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to {category?.name || 'Category'} Articles</span>
                        </Link>
                    </div>

                    {/* ========================================================= */}
                    {/* ARTICLE HEADER                                            */}
                    {/* ========================================================= */}
                    <ArticleHeader article={article} category={category} />

                    {/* ========================================================= */}
                    {/* HERO IMAGE                                                */}
                    {/* ========================================================= */}
                    <div className="w-full rounded-xl sm:rounded-2xl overflow-hidden border border-[#E4E7EC] shadow-2xs bg-white">
                        <ImageWithFallback
                            src={article.image || '/hero-technician.jpg'}
                            alt={article.title}
                            className="w-full h-auto block object-contain"
                            priority
                        />
                    </div>

                    {/* ========================================================= */}
                    {/* TWO-COLUMN LAYOUT: MAIN CONTENT + SIDEBAR                 */}
                    {/* ========================================================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start pt-1">
                        {/* Main Article Content (Left Column: 8 cols) */}
                        <div className="lg:col-span-8 min-w-0 space-y-5 sm:space-y-6">
                            {/* Table of Contents for Mobile View */}
                            <ArticleTableOfContents headings={headings} variant="mobile" />

                            {/* Rich Article Body & FAQs from CKEditor */}
                            <ArticleRenderer
                                contentHtml={article.contentHtml}
                                faqs={article.faqs}
                                articleTitle={article.title}
                                onHeadingsExtracted={setHeadings}
                            />

                            {/* Related Articles Section */}
                            <RelatedArticles
                                articles={relatedArticles}
                                categorySlug={categorySlug}
                            />
                        </div>

                        {/* Sticky Right Sidebar (4 cols) */}
                        <aside className="lg:col-span-4 space-y-4 sm:space-y-5 lg:sticky lg:top-24">
                            {/* Table of Contents for Desktop */}
                            <ArticleTableOfContents headings={headings} variant="desktop" />

                            {/* Service CTA Card */}
                            <BookServiceCard
                                bookingRoute={category?.bookingRoute || '/book-appointment'}
                                categoryName={category?.name || 'Appliance'}
                            />
                        </aside>
                    </div>
                </div>
            </main>

            {/* ========================================================= */}
            {/* MOBILE BOTTOM STICKY ACTION BAR                           */}
            {/* ========================================================= */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3.5 py-2.5 shadow-md pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))]">
                <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-[#101B3F] truncate">
                            Need technician help?
                        </p>
                        <p className="text-[11px] text-slate-500">
                            Book verified expert at doorstep
                        </p>
                    </div>

                    <Link
                        href={category?.bookingRoute || '/book-appointment'}
                        className="inline-flex items-center gap-1.5 bg-[#037166] hover:bg-[#025951] text-white text-xs font-bold py-2 px-3.5 rounded-lg transition-all shadow-xs shrink-0"
                    >
                        <span>Book a Service</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    );
}
