'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Shield, RotateCcw, HelpCircle } from 'lucide-react';

export default function LegalNavTabs() {
    const pathname = usePathname();

    const tabs = [
        {
            href: '/terms-conditions',
            label: 'Terms & Conditions',
            icon: FileText,
            activeGradient: 'bg-gradient-to-r from-[#008C80] to-[#04a99d] text-white shadow-md shadow-[#008C80]/20',
            inactiveStyle: 'bg-white text-slate-700 hover:text-[#008C80] hover:bg-teal-50/60 border-slate-200/80 hover:border-teal-200',
            iconColor: 'text-[#008C80]'
        },
        {
            href: '/privacy-policy',
            label: 'Privacy Policy',
            icon: Shield,
            activeGradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20',
            inactiveStyle: 'bg-white text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 border-slate-200/80 hover:border-blue-200',
            iconColor: 'text-blue-600'
        },
        {
            href: '/refund-policy',
            label: 'Refund Policy',
            icon: RotateCcw,
            activeGradient: 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20',
            inactiveStyle: 'bg-white text-slate-700 hover:text-rose-600 hover:bg-rose-50/60 border-slate-200/80 hover:border-rose-200',
            iconColor: 'text-rose-500'
        },
        {
            href: '/faqs',
            label: 'FAQs',
            icon: HelpCircle,
            activeGradient: 'bg-gradient-to-r from-[#008C80] to-[#04a99d] text-white shadow-md shadow-[#008C80]/25',
            inactiveStyle: 'bg-white text-slate-700 hover:text-[#008C80] hover:bg-teal-50/60 border-slate-200/80 hover:border-teal-200',
            iconColor: 'text-[#008C80]'
        }
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 p-1.5 sm:p-2 bg-slate-100/80 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm w-full">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                const Icon = tab.icon;

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex items-center justify-center gap-2 sm:gap-2.5 py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-[1.01] border ${
                            isActive
                                ? `${tab.activeGradient} border-transparent`
                                : `${tab.inactiveStyle}`
                        }`}
                    >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : tab.iconColor}`} />
                        <span className="truncate">{tab.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
