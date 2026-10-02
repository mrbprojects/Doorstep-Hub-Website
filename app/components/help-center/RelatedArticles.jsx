'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { ArticleCard } from './ArticleCard';

export function RelatedArticles({ articles = [], categorySlug = 'appliance-repair' }) {
    if (!articles || articles.length === 0) return null;

    return (
        <section className="pt-6 sm:pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3.5 sm:mb-4">
                <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DEF2EF] border border-[#9ecbc3]/50 text-[#037166] text-[11px] font-black uppercase tracking-wider shadow-2xs mb-1.5">
                        <Sparkles className="w-3 h-3 text-[#037166]" />
                        <span>Recommended Guides</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-[#101B3F] tracking-tight">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {articles.slice(0, 3).map((item) => (
                    <ArticleCard
                        key={item.id || item.slug}
                        article={item}
                        categorySlug={categorySlug}
                        layout="vertical"
                    />
                ))}
            </div>

            <div className="sm:hidden pt-3 text-center">
                <Link
                    href={`/help-center/${categorySlug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#037166]"
                >
                    <span>View all articles in this category →</span>
                </Link>
            </div>
        </section>
    );
}
