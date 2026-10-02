'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Search,
    X,
    ArrowUpDown,
    HelpCircle,
    Inbox,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HelpBreadcrumb } from '@/components/help-center/HelpBreadcrumb';
import { CategoryHero } from '@/components/help-center/CategoryHero';
import { CategorySidebar } from '@/components/help-center/CategorySidebar';
import { ArticleCard } from '@/components/help-center/ArticleCard';
import { HelpPagination } from '@/components/help-center/HelpPagination';
import { API_BASE_URL } from '@/config/env';
import { normalizeArticle } from '@/components/help-center/helpCenterData';

const ARTICLES_PER_PAGE = 6;

export default function CategoryPageClient({
    categorySlug,
    initialCategory,
    initialArticles = [],
    initialCategoryCounts = {},
    initialSettings = null,
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [category] = useState(initialCategory);
    const [allArticles, setAllArticles] = useState(initialArticles);
    const [categoryCounts, setCategoryCounts] = useState(initialCategoryCounts);
    const [settings] = useState(initialSettings);
    const [loading, setLoading] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
    const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'latest' | 'oldest' | 'az'
    const [currentPage, setCurrentPage] = useState(
        parseInt(searchParams?.get('page') || '1', 10) || 1
    );

    // Support contact info from settings
    const supportPhone = settings?.phone || '+91 888 668 8666';
    const rawWhatsapp = settings?.whatsapp || settings?.phone || '918886688666';
    const whatsappClean = String(rawWhatsapp).replace(/[^0-9]/g, '');

    // Filter articles belonging to this category
    const categoryArticles = useMemo(() => {
        return allArticles.filter((art) => {
            const matchesService = art.serviceName?.toLowerCase().includes(category?.shortName?.toLowerCase());
            const matchesKeyword = category?.serviceKeywords?.some((kw) =>
                art.title.toLowerCase().includes(kw) ||
                art.category.toLowerCase().includes(kw)
            );
            // Default appliance repair gets articles if not matched elsewhere
            if (categorySlug === 'appliance-repair') {
                return true;
            }
            return matchesService || matchesKeyword;
        });
    }, [allArticles, category, categorySlug]);

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
            <main className="flex-1 pt-28 sm:pt-32 lg:pt-36 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
                    <div className="bg-white rounded-2xl border border-[#E4E7EC] p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        {/* Search Bar */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative flex-1 flex items-center"
                        >
                            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                            <input
                                type="text"
                                placeholder={`Search within ${category?.name || ''} articles...`}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#037166] focus:bg-white transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-16 p-1 text-slate-400 hover:text-slate-600 rounded-md"
                                    aria-label="Clear search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="absolute right-1.5 bg-[#037166] hover:bg-[#025951] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs"
                            >
                                Search
                            </button>
                        </form>

                        {/* Sort Dropdown */}
                        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
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
                                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-[#037166] focus:bg-white cursor-pointer"
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
                    <div id="articles-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                            {/* Results Count Banner */}
                            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 font-medium pb-2 border-b border-slate-200">
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
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="h-40 rounded-2xl bg-white border border-slate-200 p-5 flex gap-5 animate-pulse"
                                        >
                                            <div className="w-56 h-full bg-slate-200 rounded-xl shrink-0" />
                                            <div className="flex-1 space-y-3 py-2">
                                                <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                                                <div className="h-4 bg-slate-100 rounded-md w-full" />
                                                <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : paginatedArticles.length > 0 ? (
                                <>
                                    {/* Vertical Stack of Article Row Cards */}
                                    <div className="space-y-4 sm:space-y-5">
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
                                <div className="rounded-2xl bg-white border border-[#E4E7EC] p-8 sm:p-12 text-center space-y-4 shadow-sm">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                                        <Search className="w-6 h-6" />
                                    </div>
                                    <div className="max-w-md mx-auto space-y-1">
                                        <h3 className="text-lg font-bold text-[#101B3F]">
                                            No articles found for “{searchQuery}”
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-500">
                                            We couldn't find any guides matching your search in {category?.name}. Try searching with different keywords.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="px-4 py-2 rounded-xl bg-[#037166] text-white text-xs sm:text-sm font-bold hover:bg-[#025951] transition-colors"
                                        >
                                            Clear Search
                                        </button>
                                        <Link
                                            href="/contact-us"
                                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-200 transition-colors"
                                        >
                                            Contact Support
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                /* Empty Category State */
                                <div className="rounded-2xl bg-white border border-[#E4E7EC] p-8 sm:p-12 text-center space-y-4 shadow-sm">
                                    <div className="w-14 h-14 rounded-2xl bg-[#DEF2EF] text-[#037166] border border-[#9ecbc3]/50 flex items-center justify-center mx-auto">
                                        <Inbox className="w-6 h-6" />
                                    </div>
                                    <div className="max-w-md mx-auto space-y-1">
                                        <h3 className="text-lg font-bold text-[#101B3F]">
                                            No articles available yet
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-500">
                                            We're currently preparing expert guides for {category?.name}. Browse our other service categories or contact support.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                        <Link
                                            href="/help-center/appliance-repair"
                                            className="px-4 py-2 rounded-xl bg-[#037166] text-white text-xs sm:text-sm font-bold hover:bg-[#025951] transition-colors"
                                        >
                                            Browse Appliance Repair
                                        </Link>
                                        <Link
                                            href="/contact-us"
                                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-200 transition-colors"
                                        >
                                            Contact Support
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
