'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Wrench } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HelpBreadcrumb } from '@/components/help-center/HelpBreadcrumb';
import { ArticleHeader } from '@/components/help-center/ArticleHeader';
import { ArticleRenderer } from '@/components/help-center/ArticleRenderer';
import { ArticleTableOfContents } from '@/components/help-center/ArticleTableOfContents';
import { BookServiceCard } from '@/components/help-center/BookServiceCard';
import { RelatedArticles } from '@/components/help-center/RelatedArticles';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export default function ArticlePageClient({
    categorySlug,
    articleSlug,
    initialCategory,
    initialArticle,
    initialRelated = [],
    initialHeadings = [],
}) {
    const [category] = useState(initialCategory);
    const [article] = useState(initialArticle);
    const [relatedArticles] = useState(initialRelated);
    const [headings, setHeadings] = useState(initialHeadings);

    if (!article) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col antialiased">
            <Header />

            {/* Main Article Container */}
            <main className="flex-1 pt-28 sm:pt-32 lg:pt-36 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#037166] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
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
                    <div className="relative aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E4E7EC] shadow-sm bg-slate-100">
                        <ImageWithFallback
                            src={article.image || '/hero-technician.jpg'}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* ========================================================= */}
                    {/* TWO-COLUMN LAYOUT: MAIN CONTENT + SIDEBAR                 */}
                    {/* ========================================================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-2">
                        {/* Main Article Content (Left Column: 8 cols) */}
                        <div className="lg:col-span-8 min-w-0 space-y-8">
                            {/* Table of Contents for Mobile View */}
                            <ArticleTableOfContents headings={headings} />

                            {/* Rich Article Body & FAQs */}
                            <ArticleRenderer
                                contentHtml={article.contentHtml}
                                faqs={article.faqs}
                                onHeadingsExtracted={setHeadings}
                            />

                            {/* Related Articles Section */}
                            <RelatedArticles
                                articles={relatedArticles}
                                categorySlug={categorySlug}
                            />
                        </div>

                        {/* Sticky Right Sidebar (4 cols) */}
                        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
                            {/* Table of Contents for Desktop */}
                            <ArticleTableOfContents headings={headings} />

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
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
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
                        className="inline-flex items-center gap-1.5 bg-[#037166] hover:bg-[#025951] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-[#037166]/20 shrink-0"
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
