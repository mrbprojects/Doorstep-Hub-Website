'use client';

import React from 'react';
import Image from 'next/image';
import { BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

export function CategoryHero({ category, articleCount = 0 }) {
    const heroImage = category?.heroImage || '/hero-technician.jpg';

    return (
        <section className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#ECF9F7] via-white to-[#F0FDF9] border border-[#E4E7EC] p-4 sm:p-5 lg:p-6 shadow-2xs transition-all">
            {/* Subtle decorative background glow */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-[#037166]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
                {/* Left Column: Category Info */}
                <div className="lg:col-span-7 space-y-2 sm:space-y-3">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DEF2EF] border border-[#9ecbc3]/50 text-[#037166] text-[11px] font-black tracking-wider uppercase shadow-2xs">
                        <Sparkles className="w-3 h-3 text-[#037166]" />
                        <span>{category?.badge || 'HELP CENTER CATEGORY'}</span>
                    </div>

                    {/* Category Title */}
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[#101B3F] leading-tight">
                        {category?.name || 'Help Center Articles'}
                    </h1>

                    {/* Description */}
                    <p className="text-slate-600 text-xs sm:text-sm lg:text-[15px] leading-relaxed max-w-2xl font-normal line-clamp-3 sm:line-clamp-none">
                        {category?.description ||
                            'Find expert guides, troubleshooting checklists, and step-by-step solutions verified by Doorstep Hub technicians.'}
                    </p>

                    {/* Dynamic Article Count & Service Trust Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E4E7EC] text-slate-800 text-xs font-bold shadow-2xs">
                            <BookOpen className="w-3.5 h-3.5 text-[#037166]" />
                            <span>
                                {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                            </span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 border border-emerald-200/60 text-emerald-800 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Doorstep Hub Verified</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Hero Visual Graphic */}
                <div className="lg:col-span-5 relative">
                    <div className="relative mx-auto max-w-full sm:max-w-md lg:max-w-none rounded-xl overflow-hidden border border-[#E4E7EC] bg-white shadow-2xs group">
                        <div className="relative aspect-[16/9] sm:aspect-[16/10] lg:aspect-[4/3] w-full max-h-[190px] sm:max-h-none overflow-hidden bg-slate-100">
                            <Image
                                src={heroImage}
                                alt={`${category?.name || 'Doorstep Hub'} Technician Guide`}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                            {/* Bottom gradient overlay for contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                            {/* Floating technician badge */}
                            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                                <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-[11px] font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Verified D-Hub Technicians</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
