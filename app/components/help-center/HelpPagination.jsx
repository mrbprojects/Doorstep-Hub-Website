'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function HelpPagination({ currentPage = 1, totalPages = 1, onPageChange }) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <nav aria-label="Article list pagination" className="flex items-center justify-center gap-1.5 sm:gap-2 pt-8 pb-4">
            {/* Previous Button */}
            <button
                type="button"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-[#037166] hover:text-[#037166] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-700 transition-colors shadow-2xs"
                aria-label="Previous page"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page Number Buttons */}
            {pages.map((p, index) => {
                if (p === '...') {
                    return (
                        <span
                            key={`dots-${index}`}
                            className="w-8 h-10 inline-flex items-center justify-center text-slate-400 font-bold"
                        >
                            ...
                        </span>
                    );
                }

                const isActive = p === currentPage;

                return (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-2xs ${
                            isActive
                                ? 'bg-[#037166] text-white border border-[#037166] shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-700 hover:border-[#037166] hover:text-[#037166]'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={`Page ${p}`}
                    >
                        {p}
                    </button>
                );
            })}

            {/* Next Button */}
            <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-[#037166] hover:text-[#037166] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-700 transition-colors shadow-2xs"
                aria-label="Next page"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </nav>
    );
}
