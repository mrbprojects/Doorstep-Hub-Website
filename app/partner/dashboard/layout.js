'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProviderAuthProvider } from '@/context/ProviderAuthContext';
import { PartnerSidebar } from '@/components/partner/PartnerSidebar';
import { PartnerAuthGuard } from '@/components/partner/PartnerAuthGuard';

export default function PartnerDashboardLayout({ children }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <ProviderAuthProvider>
            <div className="min-h-screen bg-gradient-to-b from-[#037166]/5 via-white to-white">
                <Header />
                <PartnerAuthGuard>
                    <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-6 lg:hidden">
                                <button
                                    type="button"
                                    onClick={() => setMobileNavOpen((v) => !v)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-[#037166]"
                                >
                                    Partner Menu
                                    <span className="text-xs text-gray-500">{mobileNavOpen ? 'Hide' : 'Show'}</span>
                                </button>
                                {mobileNavOpen && (
                                    <div className="mt-3">
                                        <PartnerSidebar onNavigate={() => setMobileNavOpen(false)} />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                                <div className="hidden lg:block">
                                    <PartnerSidebar />
                                </div>
                                <div className="flex-1 min-w-0">{children}</div>
                            </div>
                        </div>
                    </main>
                </PartnerAuthGuard>
                <Footer />
            </div>
        </ProviderAuthProvider>
    );
}
