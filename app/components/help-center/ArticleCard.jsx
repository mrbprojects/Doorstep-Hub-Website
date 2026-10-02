'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { extractCleanExcerpt } from './helpCenterData';

export function ArticleCard({ article, categorySlug = 'appliance-repair', layout = 'auto' }) {
    if (!article) return null;

    const articleUrl = `/help-center/${categorySlug}/${article.slug}`;
    const isVertical = layout === 'vertical';
    const cleanExcerpt = article.excerpt || extractCleanExcerpt(article.summary || article.content || '', 140, article.slug);

    return (
        <article className="group bg-white rounded-xl sm:rounded-2xl border border-[#E4E7EC] hover:border-[#008C80]/50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 overflow-hidden h-full">
            <Link
                href={articleUrl}
                className={`flex ${isVertical ? 'flex-col' : 'flex-col sm:flex-row'} items-stretch p-3 sm:p-4 gap-3 sm:gap-4.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008C80] rounded-xl sm:rounded-2xl h-full justify-between`}
            >
                {/* Thumbnail Image Container */}
                <div className={`relative w-full ${isVertical ? 'aspect-[16/9] h-auto' : 'sm:w-44 md:w-52 aspect-[16/9] sm:aspect-auto sm:h-32 md:h-36'} rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 shrink-0`}>
                    <ImageWithFallback
                        src={article.image || '/hero-technician.jpg'}
                        alt={article.title}
                        fallbackSrc="/hero-technician.jpg"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Category Pill Badge (Overlay on Mobile when horizontal) */}
                    {!isVertical && (
                        <div className="absolute top-2 left-2 sm:hidden z-10">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-[#9ecbc3]/50 text-[#008C80] text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                                {article.category || 'GUIDE'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Card Content */}
                <div className="flex-1 flex flex-col justify-between gap-2.5 min-w-0">
                    <div className="space-y-1.5">
                        {/* Category Badge */}
                        <div className={`${isVertical ? 'flex' : 'hidden sm:flex'} items-center gap-2`}>
                            <span className="inline-block px-2 py-0.5 rounded-full bg-[#E9F8F6] border border-[#9ecbc3]/40 text-[#008C80] text-[10px] font-extrabold uppercase tracking-wider">
                                {article.category || 'GUIDE'}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-base lg:text-[17px] font-bold text-[#101B3F] group-hover:text-[#008C80] transition-colors leading-snug line-clamp-2">
                            {article.title}
                        </h3>

                        {/* Clean Excerpt (Never Raw HTML) */}
                        {cleanExcerpt && (
                            <p className="text-slate-600 text-xs sm:text-[13px] line-clamp-2 leading-relaxed">
                                {cleanExcerpt}
                            </p>
                        )}
                    </div>

                    {/* Card Footer: Metadata & Arrow */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#008C80]" />
                                <span>{article.readTime || '5 min read'}</span>
                            </span>
                            {article.date && (
                                <span className="inline-flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{article.date}</span>
                                </span>
                            )}
                        </div>

                        {/* Action Arrow Icon Button */}
                        <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-[#E9F8F6] group-hover:bg-[#008C80] group-hover:text-white text-[#008C80] flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5 shrink-0">
                            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
}
