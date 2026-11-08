'use client';
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Construction } from 'lucide-react';

function ExploreServicesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get('type');

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 px-6 relative overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a] z-0" />

            <div className="max-w-7xl mx-auto relative z-10">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-20 h-20 bg-[#037166]/20 rounded-full flex items-center justify-center mb-6 border border-[#037166]/30 animate-pulse">
                        <Construction className="w-10 h-10 text-[#04a99d]" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Explore <span className="text-[#04a99d]">
                            {type === 'partner' ? 'Verified Partners' : type === 'center' ? 'Service Centers' : 'Services'}
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mb-8">
                        We are currently building this specialized section to help you find the best
                        {type === 'partner' ? ' independent professionals' : ' authorized service centers'} in your area.
                    </p>

                    <div className="p-6 rounded-2xl bg-[#1a1a1a] border border-[#333] max-w-md w-full">
                        <h3 className="font-semibold text-lg mb-2">Coming Soon</h3>
                        <p className="text-sm text-gray-500">
                            This feature is under active development. Please check back shortly for a curated list of our top-rated {type === 'partner' ? 'partners' : 'centers'}.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ExploreServicesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>}>
            <ExploreServicesContent />
        </Suspense>
    );
}
