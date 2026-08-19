'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Shield, CreditCard, HelpCircle } from 'lucide-react';

export default function LegalNavTabs() {
    const pathname = usePathname();

    const tabs = [
        {
            href: '/terms-conditions',
            label: 'Terms & Conditions',
            icon: FileText,
            activeGradient: 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-lg shadow-[#037166]/25',
            inactiveStyle: 'bg-white/90 text-slate-700 hover:text-[#037166] hover:bg-teal-50/80 border-slate-200/70 hover:border-teal-200',
            iconColor: 'text-[#037166]'
        },
        {
            href: '/privacy-policy',
            label: 'Privacy Policy',
            icon: Shield,
            activeGradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25',
            inactiveStyle: 'bg-white/90 text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 border-slate-200/70 hover:border-blue-200',
            iconColor: 'text-blue-600'
        },
        {
            href: '/refund-policy',
            label: 'Refund Policy',
            icon: CreditCard,
            activeGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/25',
            inactiveStyle: 'bg-white/90 text-slate-700 hover:text-orange-600 hover:bg-orange-50/80 border-slate-200/70 hover:border-orange-200',
            iconColor: 'text-orange-500'
        },
        {
            href: '/faqs',
            label: 'FAQs',
            icon: HelpCircle,
            activeGradient: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25',
            inactiveStyle: 'bg-white/90 text-slate-700 hover:text-purple-600 hover:bg-purple-50/80 border-slate-200/70 hover:border-purple-200',
            iconColor: 'text-purple-600'
        }
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 p-2 bg-slate-100/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm w-full">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                const Icon = tab.icon;

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 hover:scale-[1.02] border ${
                            isActive
                                ? `${tab.activeGradient} border-transparent`
                                : `${tab.inactiveStyle}`
                        }`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.iconColor}`} />
                        <span>{tab.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
