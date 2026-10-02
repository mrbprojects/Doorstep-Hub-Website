'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export function ArticleCard({ article, categorySlug = 'appliance-repair' }) {
    if (!article) return null;

    const articleUrl = `/help-center/${categorySlug}/${article.slug}`;

    return (
        <article className="group bg-white rounded-2xl border border-[#E4E7EC] hover:border-[#037166]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden">
            <Link
                href={articleUrl}
                className="flex flex-col sm:flex-row items-stretch p-4 sm:p-5 gap-4 sm:gap-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#037166] rounded-2xl"
            >
                {/* Thumbnail Image Container */}
                <div className="relative w-full sm:w-48 md:w-56 aspect-[16/10] sm:aspect-auto sm:h-36 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <ImageWithFallback
                        src={article.image || '/hero-technician.jpg'}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Category / Subcategory Pill Badge (Overlay on Mobile, Clean above title on desktop) */}
                    <div className="absolute top-2.5 left-2.5 sm:hidden z-10">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-[#9ecbc3]/50 text-[#037166] text-[11px] font-extrabold uppercase tracking-wider shadow-2xs">
                            {article.category || 'GUIDE'}
                        </span>
                    </div>
                </div>

                {/* Card Content */}
                <div className="flex-1 flex flex-col justify-between gap-3 min-w-0">
                    <div className="space-y-2">
                        {/* Category Badge (Desktop) */}
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#DEF2EF] border border-[#9ecbc3]/40 text-[#037166] text-[11px] font-extrabold uppercase tracking-wider">
                                {article.category || 'GUIDE'}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#101B3F] group-hover:text-[#037166] transition-colors leading-snug line-clamp-2">
                            {article.title}
                        </h3>

                        {/* Excerpt */}
                        {article.excerpt && (
                            <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                                {article.excerpt}
                            </p>
                        )}
                    </div>

                    {/* Card Footer: Metadata & Arrow */}
                    <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#037166]" />
                                <span>{article.readTime || '5 min read'}</span>
                            </span>
                            {article.date && (
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{article.date}</span>
                                </span>
                            )}
                        </div>

                        {/* Action Arrow Icon Button */}
                        <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-[#DEF2EF] group-hover:text-[#037166] text-slate-400 flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 shrink-0">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
}
