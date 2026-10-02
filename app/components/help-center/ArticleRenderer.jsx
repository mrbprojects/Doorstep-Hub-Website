'use client';

import React, { useState, useMemo } from 'react';
import {
    HelpCircle,
    ChevronDown,
    ThumbsUp,
    ThumbsDown,
    CheckCircle2
} from 'lucide-react';
import DOMPurify from 'dompurify';

export function ArticleRenderer({
    contentHtml = '',
    faqs = [],
    articleTitle = '',
    onHeadingsExtracted
}) {
    const [faqOpenIndex, setFaqOpenIndex] = useState(null);
    const [feedbackGiven, setFeedbackGiven] = useState(null);

    // Process HTML to inject stable IDs into H1, H2, H3 tags, remove redundant duplicate title, wrap tables, and collect headings
    const { sanitizedHtml, extractedHeadings } = useMemo(() => {
        if (!contentHtml) {
            return {
                sanitizedHtml: '',
                extractedHeadings: faqs.length > 0 ? [{ id: 'frequently-asked-questions', title: 'Frequently Asked Questions' }] : []
            };
        }

        // Sanitize raw HTML from CKEditor CMS
        let clean = typeof window !== 'undefined'
            ? DOMPurify.sanitize(contentHtml, {
                ADD_TAGS: ['iframe'],
                ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target']
            })
            : contentHtml;

        // If the very first element in content is an H1 that duplicates the article title, strip it to avoid duplicate title
        clean = clean.replace(/^\s*<h1[^>]*>([\s\S]*?)<\/h1>/i, (match, inner) => {
            const textOnly = inner.replace(/<[^>]*>/g, '').trim().toLowerCase();
            const titleOnly = (articleTitle || '').trim().toLowerCase();
            if (titleOnly && (textOnly === titleOnly || textOnly.includes(titleOnly) || titleOnly.includes(textOnly))) {
                return '';
            }
            return match;
        });

        // Wrap raw tables in responsive overflow container so CKEditor tables never break mobile screens
        clean = clean.replace(/<table([\s\S]*?)<\/table>/gi, (match) => {
            return `<div class="overflow-x-auto w-full my-3 -mx-1 px-1"><table class="w-full text-left border-collapse border border-slate-200 text-xs sm:text-sm"${match.slice(6)}</div>`;
        });

        const headings = [];
        let headingCounter = 0;

        // Replace h1, h2, h3, h4 with unique IDs for Table of Contents navigation
        const withIds = clean.replace(/<(h[1-4])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, innerText) => {
            const rawTitle = innerText.replace(/<[^>]*>?/gm, '').trim();
            if (!rawTitle) return match;

            headingCounter++;
            const safeSlug = rawTitle
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') || `section-${headingCounter}`;

            const id = `heading-${safeSlug}`;
            headings.push({ id, title: rawTitle, level: tag.toLowerCase() });

            return `<${tag}${attrs} id="${id}" class="article-heading scroll-mt-24">${innerText}</${tag}>`;
        });

        // Add FAQ heading if FAQs exist
        if (faqs && faqs.length > 0) {
            headings.push({
                id: 'frequently-asked-questions',
                title: 'Frequently Asked Questions',
                level: 'h2'
            });
        }

        return { sanitizedHtml: withIds, extractedHeadings: headings };
    }, [contentHtml, faqs, articleTitle]);

    // Send extracted headings up to parent/TOC
    React.useEffect(() => {
        if (onHeadingsExtracted && extractedHeadings.length > 0) {
            onHeadingsExtracted(extractedHeadings);
        }
    }, [extractedHeadings, onHeadingsExtracted]);

    return (
        <div className="article-body-wrapper space-y-6">
            {/* ========================================================= */}
            {/* RICH ARTICLE HTML CONTENT FROM CKEDITOR                   */}
            {/* ========================================================= */}
            <div
                className="article-ck-content rich-text-content w-full break-words overflow-hidden text-slate-700
                    [&_h1]:text-xl sm:[&_h1]:text-2xl lg:[&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-[#101B3F] [&_h1]:mt-5 [&_h1]:mb-2.5 [&_h1]:leading-tight
                    [&_h2]:text-lg sm:[&_h2]:text-xl lg:[&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-[#101B3F] [&_h2]:mt-5 [&_h2]:mb-2 sm:[&_h2]:mt-6 sm:[&_h2]:mb-2.5 [&_h2]:leading-snug
                    [&_h3]:text-base sm:[&_h3]:text-lg lg:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[#101B3F] [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:leading-snug
                    [&_h4]:text-sm sm:[&_h4]:text-base lg:[&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-[#101B3F] [&_h4]:mt-3.5 [&_h4]:mb-1.5 [&_h4]:leading-snug
                    [&_h5]:text-xs sm:[&_h5]:text-sm [&_h5]:font-bold [&_h5]:text-[#101B3F] [&_h5]:mt-3 [&_h5]:mb-1
                    [&_h6]:text-xs [&_h6]:font-bold [&_h6]:text-slate-600 [&_h6]:mt-2.5 [&_h6]:mb-1
                    [&_p]:text-xs sm:[&_p]:text-sm md:[&_p]:text-[15px] [&_p]:text-slate-700 [&_p]:leading-relaxed [&_p]:mb-3 [&_p]:mt-0
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2.5 [&_ul]:space-y-1 [&_ul]:text-xs sm:[&_ul]:text-sm md:[&_ul]:text-[15px] [&_ul]:text-slate-700
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2.5 [&_ol]:space-y-1 [&_ol]:text-xs sm:[&_ol]:text-sm md:[&_ol]:text-[15px] [&_ol]:text-slate-700
                    [&_li]:text-slate-700 [&_li]:leading-relaxed
                    [&_li_span]:text-slate-700
                    [&_strong]:font-bold [&_strong]:text-[#101B3F]
                    [&_b]:font-bold [&_b]:text-[#101B3F]
                    [&_a]:text-[#037166] [&_a]:font-semibold [&_a]:underline hover:[&_a]:text-[#025951]
                    [&_blockquote]:border-l-3 sm:[&_blockquote]:border-l-4 [&_blockquote]:border-[#037166] [&_blockquote]:pl-3 sm:[&_blockquote]:pl-4 [&_blockquote]:py-1.5 [&_blockquote]:my-3 [&_blockquote]:bg-[#DEF2EF]/30 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:text-slate-700 [&_blockquote]:text-xs sm:[&_blockquote]:text-sm
                    [&_img]:rounded-xl [&_img]:max-w-full [&_img]:h-auto [&_img]:block [&_img]:mx-auto [&_img]:object-contain [&_img]:my-3.5 [&_img]:shadow-2xs
                    [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:my-3
                    [&_th]:bg-slate-50 [&_th]:p-2.5 [&_th]:border [&_th]:border-slate-200 [&_th]:font-bold [&_th]:text-[#101B3F] [&_th]:text-xs sm:[&_th]:text-sm
                    [&_td]:p-2.5 [&_td]:border [&_td]:border-slate-200 [&_td]:text-xs sm:[&_td]:text-sm"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />

            {/* ========================================================= */}
            {/* FREQUENTLY ASKED QUESTIONS SECTION (CMS FAQS)             */}
            {/* ========================================================= */}
            {faqs && faqs.length > 0 && (
                <section id="frequently-asked-questions" className="pt-5 sm:pt-6 border-t border-slate-200 space-y-4 scroll-mt-24">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#DEF2EF] text-[#037166] flex items-center justify-center shrink-0">
                            <HelpCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-[#101B3F] tracking-tight">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                                Common troubleshooting questions answered by our specialists
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 sm:space-y-2.5">
                        {faqs.map((faq, index) => {
                            const isOpen = faqOpenIndex === index;
                            return (
                                <div
                                    key={faq._id || index}
                                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                                        isOpen
                                            ? 'bg-[#F0FDF9] border-[#037166]/40 shadow-2xs'
                                            : 'bg-white border-[#E4E7EC] hover:border-slate-300'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                                        className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#037166]"
                                        aria-expanded={isOpen}
                                    >
                                        <span className="font-bold text-xs sm:text-sm text-[#101B3F] leading-snug">
                                            {faq.question}
                                        </span>
                                        <div
                                            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-transform duration-200 ${
                                                isOpen
                                                    ? 'bg-[#037166] text-white rotate-180'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 text-slate-600 text-xs sm:text-[13px] leading-relaxed border-t border-[#037166]/10 pt-2.5">
                                            <p>{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ========================================================= */}
            {/* WAS THIS ARTICLE HELPFUL? FEEDBACK WIDGET                 */}
            {/* ========================================================= */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#101B3F]">
                        Was this article helpful?
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                        Your feedback helps us improve our repair guides and service tips.
                    </p>
                </div>

                {feedbackGiven ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Thank you for your feedback!</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setFeedbackGiven('yes')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#037166] hover:text-[#037166] text-slate-700 text-xs font-bold transition-all shadow-2xs"
                        >
                            <ThumbsUp className="w-3.5 h-3.5 text-[#037166]" />
                            <span>Yes</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFeedbackGiven('no')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-slate-700 text-xs font-bold transition-all shadow-2xs"
                        >
                            <ThumbsDown className="w-3.5 h-3.5 text-slate-400" />
                            <span>No</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
