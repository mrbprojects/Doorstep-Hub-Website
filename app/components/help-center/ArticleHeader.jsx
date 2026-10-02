'use client';

import React, { useState, useEffect } from 'react';
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
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    // Sync saved status from localStorage
    useEffect(() => {
        if (!article?.slug) return;
        try {
            const savedList = JSON.parse(localStorage.getItem('dhub_saved_articles') || '[]');
            setSaved(savedList.includes(article.slug));
        } catch {
            // ignore
        }
    }, [article?.slug]);

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
        <header className="space-y-4 pb-6 border-b border-slate-200">
            {/* Category Pill Badge */}
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DEF2EF] border border-[#9ecbc3]/50 text-[#037166] text-xs font-black uppercase tracking-wider shadow-2xs">
                    <Sparkles className="w-3 h-3 text-[#037166]" />
                    {article?.category || category?.name || 'HELP GUIDE'}
                </span>
            </div>

            {/* Article Title H1 */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black tracking-tight text-[#101B3F] leading-[1.2]">
                {article?.title}
            </h1>

            {/* Metadata and Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                {/* Left Meta: Read time, Date, Verified */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#037166]" />
                        <span>{article?.readTime || '5 min read'}</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Updated {article?.date || 'Recently'}</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Doorstep Hub Verified</span>
                    </span>
                </div>

                {/* Right Actions: Save and Share */}
                <div className="flex items-center gap-2">
                    {/* Save Button */}
                    <button
                        type="button"
                        onClick={handleToggleSave}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border shadow-2xs ${
                            saved
                                ? 'bg-[#DEF2EF] border-[#037166] text-[#037166]'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-[#037166] hover:text-[#037166]'
                        }`}
                        title={saved ? 'Saved in browser' : 'Save article'}
                    >
                        <Bookmark className={`w-4 h-4 ${saved ? 'fill-[#037166] text-[#037166]' : ''}`} />
                        <span>{saved ? 'Saved' : 'Save'}</span>
                    </button>

                    {/* Share Button */}
                    <button
                        type="button"
                        onClick={handleShare}
                        className="relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:border-[#037166] hover:text-[#037166] transition-all shadow-2xs"
                        title="Share article"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="w-4 h-4 text-slate-500" />
                                <span>Share</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
