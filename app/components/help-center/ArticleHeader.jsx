'use client';

import React, { useState } from 'react';
import {
    Clock,
    Calendar,
    Share2,
    Bookmark,
    Check,
    CheckCircle2,
    Sparkles
} from 'lucide-react';

export function ArticleHeader({ article, category }) {
    const [saved, setSaved] = useState(() => {
        if (typeof window === 'undefined' || !article?.slug) return false;
        try {
            const savedList = JSON.parse(localStorage.getItem('dhub_saved_articles') || '[]');
            return savedList.includes(article.slug);
        } catch {
            return false;
        }
    });
    const [copied, setCopied] = useState(false);

    const [prevSlug, setPrevSlug] = useState(article?.slug);
    if (prevSlug !== article?.slug) {
        setPrevSlug(article?.slug);
        try {
            const savedList = JSON.parse(localStorage.getItem('dhub_saved_articles') || '[]');
            setSaved(savedList.includes(article?.slug));
        } catch {
            setSaved(false);
        }
    }

    const handleToggleSave = () => {
        if (!article?.slug) return;
        try {
            const savedList = JSON.parse(localStorage.getItem('dhub_saved_articles') || '[]');
            let updated;
            if (savedList.includes(article.slug)) {
                updated = savedList.filter(s => s !== article.slug);
                setSaved(false);
            } else {
                updated = [...savedList, article.slug];
                setSaved(true);
            }
            localStorage.setItem('dhub_saved_articles', JSON.stringify(updated));
        } catch {
            // ignore
        }
    };

    const handleShare = async () => {
        const canonicalUrl = typeof window !== 'undefined' ? window.location.href : `https://doorstephub.com/help-center/${category?.slug || 'appliance-repair'}/${article?.slug}`;
        const title = article?.title || 'Doorstep Hub Help Guide';

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Read this guide on Doorstep Hub: ${title}`,
                    url: canonicalUrl,
                });
                return;
            } catch (err) {
                // If user dismissed share, ignore
                if (err.name === 'AbortError') return;
            }
        }

        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(canonicalUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback
        }
    };

    return (
        <header className="space-y-2.5 sm:space-y-3 pb-3.5 sm:pb-4 border-b border-slate-200">
            {/* Category Pill Badge */}
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DEF2EF] border border-[#9ecbc3]/50 text-[#037166] text-[11px] font-black uppercase tracking-wider shadow-2xs">
                    <Sparkles className="w-3 h-3 text-[#037166]" />
                    {article?.category || category?.name || 'HELP GUIDE'}
                </span>
            </div>

            {/* Article Title H1 */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-black tracking-tight text-[#101B3F] leading-tight">
                {article?.title}
            </h1>

            {/* Metadata and Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 pt-0.5">
                {/* Left Meta: Read time, Date, Verified */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-slate-500 font-medium">
                    <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#037166]" />
                        <span>{article?.readTime || '5 min read'}</span>
                    </span>

                    <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Updated {article?.date || 'Recently'}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Doorstep Hub Verified</span>
                    </span>
                </div>

                {/* Right Actions: Save and Share */}
                <div className="flex items-center gap-1.5">
                    {/* Save Button */}
                    <button
                        type="button"
                        onClick={handleToggleSave}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-2xs ${
                            saved
                                ? 'bg-[#DEF2EF] border-[#037166] text-[#037166]'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-[#037166] hover:text-[#037166]'
                        }`}
                        title={saved ? 'Saved in browser' : 'Save article'}
                    >
                        <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-[#037166] text-[#037166]' : ''}`} />
                        <span>{saved ? 'Saved' : 'Save'}</span>
                    </button>

                    {/* Share Button */}
                    <button
                        type="button"
                        onClick={handleShare}
                        className="relative inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-[#037166] hover:text-[#037166] transition-all shadow-2xs"
                        title="Share article"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Share</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
