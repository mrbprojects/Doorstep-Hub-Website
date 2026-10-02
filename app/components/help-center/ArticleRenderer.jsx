'use client';

import React, { useState, useMemo } from 'react';
import {
    HelpCircle,
    ChevronDown,
    ThumbsUp,
    ThumbsDown,
    CheckCircle2,
    Sparkles,
    AlertCircle,
    Share2
} from 'lucide-react';
import DOMPurify from 'dompurify';

export function ArticleRenderer({
    contentHtml = '',
    faqs = [],
    onHeadingsExtracted
}) {
    const [faqOpenIndex, setFaqOpenIndex] = useState(null);
    const [feedbackGiven, setFeedbackGiven] = useState(null);

    // Process HTML to inject stable IDs into H2 and H3 tags and collect headings
    const { sanitizedHtml, extractedHeadings } = useMemo(() => {
        if (!contentHtml) {
            return {
                sanitizedHtml: '',
                extractedHeadings: faqs.length > 0 ? [{ id: 'frequently-asked-questions', title: 'Frequently Asked Questions' }] : []
            };
        }

        // Sanitize raw HTML from CMS
        const clean = typeof window !== 'undefined'
            ? DOMPurify.sanitize(contentHtml, {
                ADD_TAGS: ['iframe'],
                ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
            })
            : contentHtml;

        const headings = [];
        let headingCounter = 0;

        // Replace h2 and h3 with unique IDs
        const withIds = clean.replace(/<(h[23])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, innerText) => {
            const rawTitle = innerText.replace(/<[^>]*>?/gm, '').trim();
            if (!rawTitle) return match;

            headingCounter++;
            const safeSlug = rawTitle
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') || `section-${headingCounter}`;

            const id = `heading-${safeSlug}`;
            headings.push({ id, title: rawTitle, level: tag.toLowerCase() });

            return `<${tag}${attrs} id="${id}" class="article-heading scroll-mt-28">${innerText}</${tag}>`;
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
    }, [contentHtml, faqs]);

    // Send extracted headings up to parent/TOC
    React.useEffect(() => {
        if (onHeadingsExtracted && extractedHeadings.length > 0) {
            onHeadingsExtracted(extractedHeadings);
        }
    }, [extractedHeadings, onHeadingsExtracted]);

    return (
        <div className="article-body-wrapper space-y-8">
            {/* ========================================================= */}
            {/* RICH ARTICLE HTML CONTENT FROM CMS                        */}
            {/* ========================================================= */}
            <div
                className="prose prose-slate max-w-none 
                    prose-headings:text-[#101B3F] prose-headings:font-bold prose-headings:tracking-tight
                    prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:font-black prose-h1:mb-4
                    prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:font-extrabold prose-h2:mt-10 prose-h2:mb-4 prose-h2:pt-4 prose-h2:border-t prose-h2:border-slate-100
                    prose-h3:text-lg sm:prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-slate-600 prose-p:text-base sm:prose-p:text-[17px] prose-p:leading-relaxed prose-p:my-4
                    prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-li:text-slate-600 prose-li:my-1.5
                    prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-li:text-slate-600 prose-li:my-1.5
                    prose-strong:text-[#101B3F] prose-strong:font-bold
                    prose-a:text-[#037166] prose-a:font-semibold hover:prose-a:underline
                    prose-img:rounded-2xl prose-img:shadow-sm prose-img:border prose-img:border-slate-200
                    prose-table:border prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:p-3 prose-td:p-3"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />

            {/* ========================================================= */}
            {/* FREQUENTLY ASKED QUESTIONS SECTION (CMS FAQS)             */}
            {/* ========================================================= */}
            {faqs && faqs.length > 0 && (
                <section id="frequently-asked-questions" className="pt-8 border-t border-slate-200 space-y-6 scroll-mt-28">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#DEF2EF] text-[#037166] flex items-center justify-center shrink-0">
                            <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-[#101B3F] tracking-tight">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Common troubleshooting questions answered by our specialists
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, index) => {
                            const isOpen = faqOpenIndex === index;
                            return (
                                <div
                                    key={faq._id || index}
                                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                                        isOpen
                                            ? 'bg-[#F0FDF9] border-[#037166]/40 shadow-xs'
                                            : 'bg-white border-[#E4E7EC] hover:border-slate-300'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                                        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#037166]"
                                        aria-expanded={isOpen}
                                    >
                                        <span className="font-bold text-sm sm:text-base text-[#101B3F] leading-snug">
                                            {faq.question}
                                        </span>
                                        <div
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                                                isOpen
                                                    ? 'bg-[#037166] text-white rotate-180'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-[#037166]/10 pt-3">
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
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h4 className="text-sm font-bold text-[#101B3F]">
                        Was this article helpful?
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Your feedback helps us improve our repair guides and service tips.
                    </p>
                </div>

                {feedbackGiven ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Thank you for your feedback!</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setFeedbackGiven('yes')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#037166] hover:text-[#037166] text-slate-700 text-xs font-bold transition-all shadow-2xs"
                        >
                            <ThumbsUp className="w-3.5 h-3.5 text-[#037166]" />
                            <span>Yes</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFeedbackGiven('no')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-400 text-slate-700 text-xs font-bold transition-all shadow-2xs"
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
