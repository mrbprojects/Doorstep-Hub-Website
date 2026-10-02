'use client';

import React from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Sparkles,
    PhoneCall
} from 'lucide-react';

export function BookServiceCard({ bookingRoute = '/book-appointment', categoryName = 'Appliance' }) {
    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#DEF2EF]/80 via-white to-[#ECF9F7] border border-[#9ecbc3]/60 p-4 sm:p-5 shadow-2xs">
            {/* Top decorative accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#037166]/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative space-y-3">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#9ecbc3]/50 text-[#037166] text-[11px] font-black tracking-wider uppercase shadow-2xs">
                    <Sparkles className="w-3 h-3 text-[#037166]" />
                    <span>Instant Doorstep Help</span>
                </div>

                {/* Heading & Subtitle */}
                <div>
                    <h3 className="text-base sm:text-lg font-black text-[#101B3F] tracking-tight">
                        Still facing issues?
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Book a verified {categoryName} technician at your doorstep in 60 seconds.
                    </p>
                </div>

                {/* Primary CTA Button */}
                <Link
                    href={bookingRoute}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-[#037166] hover:bg-[#025951] text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-lg transition-all shadow-xs group"
                >
                    <span>Book a Service</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>

                {/* Value Propositions / Trust Checklist */}
                <div className="pt-2.5 border-t border-slate-200/70 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#037166] shrink-0" />
                        <span>Verified & Background-Checked Technicians</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#037166] shrink-0" />
                        <span>100% Upfront Transparent Pricing</span>
                    </div>
                </div>

                {/* Contact & Support Actions: Call & WhatsApp */}
                <div className="pt-2 border-t border-slate-200/70 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <a
                            href="tel:8886688666"
                            className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-white border border-[#9ecbc3]/60 hover:border-[#037166] hover:bg-[#DEF2EF]/40 text-[#101B3F] hover:text-[#037166] text-xs font-bold transition-all shadow-2xs group"
                            title="Call 88866 88666"
                        >
                            <PhoneCall className="w-3.5 h-3.5 text-[#037166] group-hover:scale-110 transition-transform shrink-0" />
                            <span className="truncate">Call Now</span>
                        </a>

                        <a
                            href="https://api.whatsapp.com/send/?phone=918886688666&text=Hi%2C%20I%20need%20doorstep%20service%20support&type=phone_number&app_absent=0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#075E54] hover:text-[#054C44] text-xs font-bold transition-all shadow-2xs group"
                            title="Chat on WhatsApp"
                        >
                            <svg className="w-3.5 h-3.5 text-[#25D366] fill-current shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                            </svg>
                            <span className="truncate">WhatsApp</span>
                        </a>
                    </div>

                    <div className="text-center pt-0.5">
                        <a
                            href="tel:8886688666"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#101B3F] hover:text-[#037166] transition-colors"
                        >
                            <PhoneCall className="w-3 h-3 text-[#037166]" />
                            <span>Helpline: +91 88866 88666</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
