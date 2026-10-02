'use client';

import React from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Clock,
    Sparkles,
    PhoneCall
} from 'lucide-react';

export function BookServiceCard({ bookingRoute = '/book-appointment', categoryName = 'Appliance' }) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#DEF2EF]/80 via-white to-[#ECF9F7] border border-[#9ecbc3]/60 p-6 shadow-sm">
            {/* Top decorative accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#037166]/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative space-y-4">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#9ecbc3]/50 text-[#037166] text-xs font-black tracking-wider uppercase shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#037166]" />
                    <span>Instant Doorstep Help</span>
                </div>

                {/* Heading & Subtitle */}
                <div>
                    <h3 className="text-xl font-black text-[#101B3F] tracking-tight">
                        Still facing issues?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        Book a verified {categoryName} technician at your doorstep in 60 seconds.
                    </p>
                </div>

                {/* Primary CTA Button */}
                <Link
                    href={bookingRoute}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#037166] hover:bg-[#025951] text-white text-sm font-bold py-3 px-5 rounded-xl transition-all shadow-md shadow-[#037166]/25 group"
                >
                    <span>Book a Service</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Value Propositions / Trust Checklist */}
                <div className="pt-3 border-t border-slate-200/70 space-y-2.5">
                    <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-[#037166] shrink-0" />
                        <span>Verified & Background-Checked Technicians</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-[#037166] shrink-0" />
                        <span>100% Upfront Transparent Pricing</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <Clock className="w-4 h-4 text-[#037166] shrink-0" />
                        <span>Up to 30 to 90 Days Service Warranty</span>
                    </div>
                </div>

                {/* Instant Call Option */}
                <div className="pt-1">
                    <a
                        href="tel:8886688666"
                        className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-white/80 border border-slate-200 hover:border-[#037166] text-slate-700 hover:text-[#037166] text-xs font-semibold transition-colors"
                    >
                        <PhoneCall className="w-3.5 h-3.5 text-[#037166]" />
                        <span>Helpline: +91 888 668 8666</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
