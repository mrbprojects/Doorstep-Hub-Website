'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Search,
    X,
    ArrowUpDown,
    Inbox,
    ArrowRight,
    Headphones,
    PhoneCall,
    MessageCircle
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HelpBreadcrumb } from '@/components/help-center/HelpBreadcrumb';
import { CategoryHero } from '@/components/help-center/CategoryHero';
import { CategorySidebar } from '@/components/help-center/CategorySidebar';
import { ArticleCard } from '@/components/help-center/ArticleCard';
import { HelpPagination } from '@/components/help-center/HelpPagination';

const ARTICLES_PER_PAGE = 6;

export default function CategoryPageClient({
    categorySlug,
    initialCategory,
    initialArticles = [],
    initialCategoryCounts = {},
    initialSettings = null,
}) {
    const searchParams = useSearchParams();

    const [category] = useState(initialCategory);
    const [allArticles] = useState(initialArticles);
    const [categoryCounts] = useState(initialCategoryCounts);
    const [settings] = useState(initialSettings);
    const [loading] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
    const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'latest' | 'oldest' | 'az'
    const [currentPage, setCurrentPage] = useState(
        parseInt(searchParams?.get('page') || '1', 10) || 1
    );

    // Support contact info from settings
    const supportPhone = settings?.phone || '+91 88866 88666';
    const rawWhatsapp = settings?.whatsapp || settings?.phone || '918886688666';
    const whatsappClean = String(rawWhatsapp).replace(/[^0-9]/g, '');

    // Filter articles belonging strictly to this category
    const categoryArticles = useMemo(() => {
        return allArticles.filter((art) => art.categorySlug === categorySlug);
    }, [allArticles, categorySlug]);

    // Apply search filter
    const searchedArticles = useMemo(() => {
        if (!searchQuery.trim()) return categoryArticles;
        const q = searchQuery.toLowerCase().trim();
        return categoryArticles.filter(
            (art) =>
                art.title.toLowerCase().includes(q) ||
                art.excerpt.toLowerCase().includes(q) ||
                art.category.toLowerCase().includes(q)
        );
    }, [categoryArticles, searchQuery]);

    // Apply sorting
    const sortedArticles = useMemo(() => {
        const list = [...searchedArticles];
        switch (sortBy) {
            case 'latest':
                return list.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
            case 'oldest':
                return list.sort((a, b) => new Date(a.publishedAt || 0) - new Date(b.publishedAt || 0));
            case 'az':
                return list.sort((a, b) => a.title.localeCompare(b.title));
            case 'popular':
            default:
                return list.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        }
    }, [searchedArticles, sortBy]);

    // Pagination calculations
    const totalPages = Math.ceil(sortedArticles.length / ARTICLES_PER_PAGE);
    const paginatedArticles = useMemo(() => {
        const start = (currentPage - 1) * ARTICLES_PER_PAGE;
        return sortedArticles.slice(start, start + ARTICLES_PER_PAGE);
    }, [sortedArticles, currentPage]);

    // Handle Page Change with smooth scroll
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        const section = document.getElementById('articles-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Handle Search Submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col antialiased">
            <Header />

            {/* Main Content Area */}
            <main className="flex-1 pt-20 sm:pt-24 lg:pt-26 pb-10 sm:pb-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5 sm:space-y-4 lg:space-y-5">
                    {/* ========================================================= */}
                    {/* BREADCRUMB                                                */}
                    {/* ========================================================= */}
                    <HelpBreadcrumb
                        items={[
                            {
                                label: category?.name || 'Category',
                                href: `/help-center/${categorySlug}`,
                            },
                        ]}
                    />

                    {/* ========================================================= */}
                    {/* CATEGORY HERO                                             */}
                    {/* ========================================================= */}
                    <CategoryHero
                        category={category}
                        articleCount={categoryArticles.length}
                    />

                    {/* ========================================================= */}
                    {/* SEARCH + SORT TOOLBAR                                     */}
                    {/* ========================================================= */}
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E4E7EC] p-2.5 sm:p-3 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 sm:gap-3">
                        {/* Search Bar */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative flex-1 flex items-center"
                        >
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                            <input
                                type="text"
                                placeholder={`Search within ${category?.name || ''} articles...`}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 pr-22 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#037166] focus:bg-white transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-16 p-1 text-slate-400 hover:text-slate-600 rounded-md"
                                    aria-label="Clear search"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="absolute right-1 bg-[#037166] hover:bg-[#025951] text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors shadow-2xs"
                            >
                                Search
                            </button>
                        </form>

                        {/* Sort Dropdown */}
                        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-1.5 md:pt-0 border-t md:border-t-0 border-slate-100">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0">
                                <ArrowUpDown className="w-3.5 h-3.5 text-[#037166]" />
                                <span>Sort by:</span>
                            </span>
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#037166] focus:bg-white cursor-pointer"
                                aria-label="Sort articles"
                            >
                                <option value="popular">Most Popular</option>
                                <option value="latest">Latest</option>
                                <option value="oldest">Oldest</option>
                                <option value="az">A–Z</option>
                            </select>
                        </div>
                    </div>

                    {/* ========================================================= */}
                    {/* TWO-COLUMN LAYOUT: SIDEBAR + ARTICLE GRID                 */}
                    {/* ========================================================= */}
                    <div id="articles-section" className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 lg:gap-7 items-start">
                        {/* Left Sidebar (280px / 4 cols on lg) */}
                        <div className="lg:col-span-4 xl:col-span-3">
                            <CategorySidebar
                                currentCategorySlug={categorySlug}
                                categoryCounts={categoryCounts}
                                supportPhone={supportPhone}
                                whatsappClean={whatsappClean}
                            />
                        </div>

                        {/* Right Main Article Content (8 cols on lg) */}
                        <div className="lg:col-span-8 xl:col-span-9 space-y-3 sm:space-y-3.5">
                            {/* Results Count Banner */}
                            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 font-medium pb-1.5 border-b border-slate-200">
                                <span>
                                    Showing{' '}
                                    <strong className="text-[#101B3F]">
                                        {searchedArticles.length === 0 ? 0 : (currentPage - 1) * ARTICLES_PER_PAGE + 1}
                                        -
                                        {Math.min(currentPage * ARTICLES_PER_PAGE, searchedArticles.length)}
                                    </strong>{' '}
                                    of <strong className="text-[#101B3F]">{searchedArticles.length}</strong> articles
                                    {searchQuery && (
                                        <span> for “<span className="text-[#037166] font-semibold">{searchQuery}</span>”</span>
                                    )}
                                </span>

                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="text-xs text-[#037166] font-bold hover:underline"
                                    >
                                        Clear filter
                                    </button>
                                )}
                            </div>

                            {/* Loading State Skeleton */}
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="h-32 rounded-xl bg-white border border-slate-200 p-4 flex gap-4 animate-pulse"
                                        >
                                            <div className="w-48 h-full bg-slate-200 rounded-lg shrink-0" />
                                            <div className="flex-1 space-y-2.5 py-1">
                                                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                                                <div className="h-3.5 bg-slate-100 rounded-md w-full" />
                                                <div className="h-3.5 bg-slate-100 rounded-md w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : paginatedArticles.length > 0 ? (
                                <>
                                    {/* Vertical Stack of Article Row Cards */}
                                    <div className="space-y-2.5 sm:space-y-3">
                                        {paginatedArticles.map((article) => (
                                             <ArticleCard
                                                key={article.id || article.slug}
                                                article={article}
                                                categorySlug={categorySlug}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    <HelpPagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            ) : searchQuery ? (
                                /* Empty Search Results State */
                                <div className="rounded-xl bg-white border border-[#E4E7EC] p-6 sm:p-8 text-center space-y-3 shadow-2xs">
                                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <div className="max-w-md mx-auto space-y-1">
                                        <h3 className="text-base font-bold text-[#101B3F]">
                                            No articles found for “{searchQuery}”
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            We couldn&apos;t find any guides matching your search in {category?.name}. Try searching with different keywords.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="px-3.5 py-1.5 rounded-lg bg-[#037166] text-white text-xs font-bold hover:bg-[#025951] transition-colors"
                                        >
                                            Clear Search
                                        </button>
                                        <Link
                                            href="/contact-us"
                                            className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                                        >
                                            Contact Support
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                /* Empty Category State */
                                <div className="rounded-xl bg-white border border-[#E4E7EC] p-6 sm:p-8 text-center space-y-3 shadow-2xs">
                                    <div className="w-12 h-12 rounded-xl bg-[#DEF2EF] text-[#037166] border border-[#9ecbc3]/50 flex items-center justify-center mx-auto">
                                        <Inbox className="w-5 h-5" />
                                    </div>
                                    <div className="max-w-md mx-auto space-y-1">
                                        <h3 className="text-base font-bold text-[#101B3F]">
                                            No articles available yet
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            We&apos;re currently preparing expert guides for {category?.name}. Browse our other service categories or contact support.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                                        <Link
                                            href="/help-center/appliance-repair"
                                            className="px-3.5 py-1.5 rounded-lg bg-[#037166] text-white text-xs font-bold hover:bg-[#025951] transition-colors"
                                        >
                                            Browse Appliance Repair
                                        </Link>
                                        <Link
                                            href="/contact-us"
                                            className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                                        >
                                            Contact Support
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Mobile Only: Compact Need Help Card below articles */}
                            <div className="lg:hidden mt-5 bg-gradient-to-br from-[#DEF2EF]/70 via-[#F0FDF9] to-[#ECF9F7] rounded-xl border border-[#9ecbc3]/50 p-4 shadow-2xs">
                                <div className="flex items-start gap-3 mb-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-[#037166] text-white flex items-center justify-center shrink-0 shadow-xs shadow-[#037166]/20">
                                        <Headphones className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#101B3F]">
                                            Still need help?
                                        </h3>
                                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                            Can&apos;t find what you&apos;re looking for? Our support team is here 24/7.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-0.5">
                                    <Link
                                        href="/contact-us"
                                        className="w-full inline-flex items-center justify-center gap-1.5 bg-[#037166] hover:bg-[#025951] text-white text-xs font-bold py-2 px-3 rounded-lg transition-all shadow-xs group"
                                    >
                                        <span>Contact Support</span>
                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                                    </Link>

                                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                        <a
                                            href={`tel:${supportPhone.replace(/\s+/g, '')}`}
                                            className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-md bg-white border border-[#9ecbc3]/50 text-slate-700 hover:text-[#037166] text-[11px] font-semibold transition-colors shadow-2xs"
                                        >
                                            <PhoneCall className="w-3 h-3 text-[#037166]" />
                                            <span>Call Us</span>
                                        </a>

                                        <a
                                            href={`https://wa.me/${whatsappClean}?text=Hi%20Doorstep%20Hub,%20I%20need%20help%20with%20my%20service`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-md bg-white border border-[#9ecbc3]/50 text-slate-700 hover:text-emerald-700 text-[11px] font-semibold transition-colors shadow-2xs"
                                        >
                                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                                            <span>WhatsApp</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
