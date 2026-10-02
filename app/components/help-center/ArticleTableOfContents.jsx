'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, ListFilter } from 'lucide-react';

export function ArticleTableOfContents({ headings = [] }) {
    const [activeId, setActiveId] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!headings || headings.length === 0) return;

        // Set initial active heading
        setActiveId(headings[0].id);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-100px 0% -60% 0%',
                threshold: 0.1,
            }
        );

        headings.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [headings]);

    const handleScrollTo = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const offset = 90; // Fixed header allowance
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
            setActiveId(id);
            setMobileOpen(false);
        }
    };

    if (!headings || headings.length === 0) return null;

    return (
        <>
            {/* ========================================================= */}
            {/* MOBILE ONLY: Collapsible TOC Accordion                     */}
            {/* ========================================================= */}
            <div className="lg:hidden mb-6 bg-[#DEF2EF]/40 border border-[#9ecbc3]/50 rounded-2xl p-4">
                <button
                    type="button"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="w-full flex items-center justify-between text-left font-bold text-sm text-[#101B3F]"
                    aria-expanded={mobileOpen}
                >
                    <div className="flex items-center gap-2">
                        <ListFilter className="w-4 h-4 text-[#037166]" />
                        <span>In This Article ({headings.length} sections)</span>
                    </div>
                    <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${
                            mobileOpen ? 'rotate-180' : ''
                        }`}
                    />
                </button>

                {mobileOpen && (
                    <nav className="mt-3 pt-3 border-t border-[#9ecbc3]/40 space-y-1.5" aria-label="Mobile Table of Contents">
                        {headings.map((item, idx) => {
                            const isActive = activeId === item.id;
                            return (
                                <a
                                    key={idx}
                                    href={`#${item.id}`}
                                    onClick={(e) => handleScrollTo(e, item.id)}
                                    className={`block text-xs py-1.5 px-2.5 rounded-lg transition-colors leading-snug ${
                                        isActive
                                            ? 'bg-[#037166] text-white font-bold'
                                            : 'text-slate-700 hover:text-[#037166]'
                                    }`}
                                >
                                    {idx + 1}. {item.title}
                                </a>
                            );
                        })}
                    </nav>
                )}
            </div>

            {/* ========================================================= */}
            {/* DESKTOP ONLY: Sticky TOC Sidebar Card                     */}
            {/* ========================================================= */}
            <div className="hidden lg:block bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-sm">
                <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-slate-100">
                    <BookOpen className="w-4 h-4 text-[#037166]" />
                    <h2 className="text-sm font-bold text-[#101B3F] uppercase tracking-wider">
                        In This Article
                    </h2>
                </div>

                <nav className="space-y-1" aria-label="Table of Contents">
                    {headings.map((item, idx) => {
                        const isActive = activeId === item.id;
                        return (
                            <a
                                key={idx}
                                href={`#${item.id}`}
                                onClick={(e) => handleScrollTo(e, item.id)}
                                className={`group flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm transition-all leading-snug border-l-2 ${
                                    isActive
                                        ? 'border-[#037166] bg-[#DEF2EF]/60 text-[#037166] font-bold shadow-2xs'
                                        : 'border-transparent text-slate-600 hover:text-[#101B3F] hover:bg-slate-50'
                                }`}
                            >
                                <span className={`text-[11px] font-bold ${isActive ? 'text-[#037166]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                    {idx + 1}.
                                </span>
                                <span className="line-clamp-2">{item.title}</span>
                            </a>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
