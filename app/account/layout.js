'use client';

import { useState } from 'react';
import { Menu, X, ChevronDown, ChevronUp, User } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { AccountAuthGuard } from '@/components/account/AccountAuthGuard';

export default function AccountLayout({ children }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#037166]/5 via-white to-white">
            <Header />
            <AccountAuthGuard>
                <main className="pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-4 sm:mb-6 lg:hidden">
                            <button
                                type="button"
                                onClick={() => setMobileNavOpen((v) => !v)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 shadow-xs active:scale-[0.99] transition-all"
                            >
                                <span className="flex items-center gap-2 text-[#037166]">
                                    <Menu className="w-4 h-4" />
                                    <span>Account Menu</span>
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#037166]/10 text-[#037166]">
                                    <span>{mobileNavOpen ? 'Hide' : 'Show'}</span>
                                    {mobileNavOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </span>
                            </button>
                            {mobileNavOpen && (
                                <div className="mt-3">
                                    <AccountSidebar onNavigate={() => setMobileNavOpen(false)} />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                            <div className="hidden lg:block">
                                <AccountSidebar />
                            </div>
                            <div className="flex-1 min-w-0">{children}</div>
                        </div>
                    </div>
                </main>
            </AccountAuthGuard>
            <Footer />
        </div>
    );
}
