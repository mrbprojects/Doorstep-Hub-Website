'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ChevronRight,
    Headphones,
    PhoneCall,
    MessageCircle,
    ArrowRight
} from 'lucide-react';
import {
    HELP_CATEGORIES,
    CATEGORY_ICON_MAP
} from './helpCenterData';

export function CategorySidebar({
    currentCategorySlug,
    categoryCounts = {},
    supportPhone = '+91 888 668 8666',
    whatsappClean = '918886688666'
}) {
    const router = useRouter();

    return (
        <aside className="w-full space-y-6">
            {/* ========================================================= */}
            {/* MOBILE ONLY: Horizontal Chips Category Switcher           */}
            {/* ========================================================= */}
            <div className="lg:hidden w-full">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Help Topics
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                        Swipe to browse
                    </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none no-scrollbar">
                    {HELP_CATEGORIES.map((cat) => {
                        const Icon = CATEGORY_ICON_MAP[cat.iconName] || CATEGORY_ICON_MAP.Wrench;
                        const isActive = cat.slug === currentCategorySlug;
                        const count = categoryCounts[cat.slug] ?? 0;

                        return (
                            <Link
                                key={cat.slug}
                                href={`/help-center/${cat.slug}`}
                                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all border min-h-[44px] ${
                                    isActive
                                        ? 'bg-[#DEF2EF] border-[#037166] text-[#037166] shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-700 hover:border-[#037166]/40 hover:bg-slate-50'
                                }`}
                            >
                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#037166]' : 'text-slate-500'}`} />
                                <span>{cat.name}</span>
                                {count > 0 && (
                                    <span
                                        className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                                            isActive
                                                ? 'bg-[#037166] text-white'
                                                : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* ========================================================= */}
            {/* DESKTOP ONLY: Vertical Sidebar Card                       */}
            {/* ========================================================= */}
            <div className="hidden lg:block bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-sm">
                <div className="pb-3.5 mb-3.5 border-b border-slate-100">
                    <h2 className="text-base font-bold text-[#101B3F] tracking-tight">
                        Help Topics
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Browse articles by category
                    </p>
                </div>

                <nav className="space-y-1.5" aria-label="Help Center Categories">
                    {HELP_CATEGORIES.map((cat) => {
                        const Icon = CATEGORY_ICON_MAP[cat.iconName] || CATEGORY_ICON_MAP.Wrench;
                        const isActive = cat.slug === currentCategorySlug;
                        const count = categoryCounts[cat.slug] ?? 0;

                        return (
                            <Link
                                key={cat.slug}
                                href={`/help-center/${cat.slug}`}
                                className={`group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all border ${
                                    isActive
                                        ? 'bg-[#DEF2EF] border-[#037166]/50 text-[#037166] shadow-2xs'
                                        : 'border-transparent text-slate-700 hover:bg-slate-50 hover:text-[#037166] hover:border-slate-200'
                                }`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <div className="flex items-center gap-3 min-w-0 pr-2">
                                    <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                            isActive
                                                ? 'bg-[#037166] text-white shadow-2xs'
                                                : 'bg-slate-100 text-slate-500 group-hover:bg-[#DEF2EF] group-hover:text-[#037166]'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="truncate text-sm">{cat.name}</span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {count > 0 && (
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                                isActive
                                                    ? 'bg-[#037166]/15 text-[#037166]'
                                                    : 'bg-slate-100 text-slate-500 group-hover:bg-[#DEF2EF] group-hover:text-[#037166]'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    )}
                                    <ChevronRight
                                        className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                                            isActive ? 'text-[#037166]' : 'text-slate-400 group-hover:text-[#037166]'
                                        }`}
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* ========================================================= */}
            {/* NEED HELP CARD (Desktop & Mobile)                        */}
            {/* ========================================================= */}
            <div className="bg-gradient-to-br from-[#DEF2EF]/70 via-[#F0FDF9] to-[#ECF9F7] rounded-2xl border border-[#9ecbc3]/50 p-5 sm:p-6 shadow-sm">
                <div className="flex items-start gap-3.5 mb-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#037166] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#037166]/20">
                        <Headphones className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-[#101B3F]">
                            Still need help?
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                            Can't find what you're looking for? Our customer support team is here 24/7.
                        </p>
                    </div>
                </div>

                <div className="space-y-2 pt-1">
                    <Link
                        href="/contact-us"
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#037166] hover:bg-[#025951] text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-[#037166]/20 group"
                    >
                        <span>Contact Support</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                            href={`tel:${supportPhone.replace(/\s+/g, '')}`}
                            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-[#9ecbc3]/50 text-slate-700 hover:text-[#037166] text-xs font-semibold transition-colors shadow-2xs"
                        >
                            <PhoneCall className="w-3.5 h-3.5 text-[#037166]" />
                            <span>Call Us</span>
                        </a>

                        <a
                            href={`https://wa.me/${whatsappClean}?text=Hi%20Doorstep%20Hub,%20I%20need%20help%20with%20my%20service`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-[#9ecbc3]/50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-colors shadow-2xs"
                        >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>
        </aside>
    );
}
