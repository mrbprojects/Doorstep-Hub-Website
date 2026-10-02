'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles, BookOpen } from 'lucide-react';
import { ArticleCard } from './ArticleCard';

export function RelatedArticles({ articles = [], categorySlug = 'appliance-repair' }) {
    if (!articles || articles.length === 0) return null;

    return (
        <section className="pt-12 sm:pt-16 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DEF2EF] border border-[#9ecbc3]/50 text-[#037166] text-xs font-black uppercase tracking-wider shadow-2xs mb-2">
                        <Sparkles className="w-3 h-3 text-[#037166]" />
                        <span>Recommended Guides</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#101B3F] tracking-tight">
                        Related Articles & Guides
                    </h2>
                </div>

                <Link
                    href={`/help-center/${categorySlug}`}
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#037166] hover:underline"
                >
                    <span>View all articles</span>
                    <ArrowUpRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.slice(0, 3).map((item) => (
                    <ArticleCard
                        key={item.id || item.slug}
                        article={item}
                        categorySlug={categorySlug}
                    />
                ))}
            </div>

            <div className="sm:hidden pt-4 text-center">
                <Link
                    href={`/help-center/${categorySlug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#037166]"
                >
                    <span>View all articles in this category →</span>
                </Link>
            </div>
        </section>
    );
}
