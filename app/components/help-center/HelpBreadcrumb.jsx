'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Responsive SEO-friendly Breadcrumb Component
 * @param {Array} items - [{ label, href, active }]
 */
export function HelpBreadcrumb({ items = [] }) {
    // Generate BreadcrumbList JSON-LD Schema
    const schemaData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://doorstephub.com',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Help Center',
                item: 'https://doorstephub.com/help-center',
            },
            ...items.map((item, idx) => ({
                '@type': 'ListItem',
                position: idx + 3,
                name: item.label,
                ...(item.href ? { item: `https://doorstephub.com${item.href}` } : {}),
            })),
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />
            <nav aria-label="Breadcrumb" className="w-full">
                <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                    <li className="inline-flex items-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-[#037166] transition-colors"
                        >
                            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                            <span>Home</span>
                        </Link>
                    </li>

                    <li className="inline-flex items-center">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-0.5 shrink-0" />
                        <Link
                            href="/help-center"
                            className="hover:text-[#037166] transition-colors"
                        >
                            Help Center
                        </Link>
                    </li>

                    {items.map((item, idx) => {
                        const isLast = idx === items.length - 1;
                        return (
                            <li key={idx} className="inline-flex items-center min-w-0">
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-0.5 shrink-0" />
                                {isLast || !item.href ? (
                                    <span
                                        className="text-[#037166] font-semibold truncate max-w-[200px] sm:max-w-xs md:max-w-md"
                                        aria-current="page"
                                        title={item.label}
                                    >
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className="hover:text-[#037166] transition-colors truncate max-w-[150px] sm:max-w-xs"
                                        title={item.label}
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
}
