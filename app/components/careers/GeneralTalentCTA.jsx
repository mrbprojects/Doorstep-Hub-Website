import React from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export function GeneralTalentCTA({ onSendResume }) {
    return (
        <section className="py-8 sm:py-12 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Dark Teal Curved Card */}
                <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#003531] via-[#004D47] to-[#005851] text-white p-5 sm:p-8 lg:p-10 shadow-lg overflow-hidden">
                    
                    {/* Background Paper Plane & Trajectory Pattern */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M 100 180 Q 300 40 550 120 T 900 60"
                                fill="none"
                                stroke="#4ECCA3"
                                strokeWidth="2"
                                strokeDasharray="6 6"
                            />
                        </svg>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                        
                        {/* Left Content */}
                        <div className="lg:col-span-7 flex flex-col items-start text-left">
                            {/* Pill Badge */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#A7F3D0] text-xs font-semibold mb-3 backdrop-blur-md">
                                <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
                                <span>Can&apos;t Find the Right Role?</span>
                            </div>

                            {/* Headline */}
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2 leading-tight">
                                We&apos;re Always Looking for <br className="hidden sm:inline" />
                                Great Talent
                            </h2>

                            {/* Description */}
                            <p className="text-xs sm:text-sm text-gray-200/90 leading-relaxed max-w-md mb-5 sm:mb-6">
                                Send us your resume and we&apos;ll keep you in mind for future opportunities across all departments.
                            </p>

                            {/* CTA Button */}
                            <button
                                type="button"
                                onClick={onSendResume}
                                className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-full bg-white hover:bg-gray-100 text-[#004D47] font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                <span>Send Your Resume</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Right Content: Team Photo with D-hub Logo */}
                        <div className="lg:col-span-5 flex justify-center lg:justify-end mt-2 lg:mt-0">
                            <div className="relative w-full max-w-[360px] aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-[#003834]">
                                <Image
                                    src="/careers-talent-team.jpg"
                                    alt="Doorstep Hub Culture & Team"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 35vw"
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                                {/* D-hub bottom badge */}
                                <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                                    <div className="w-5 h-5 rounded-md bg-[#008C80] flex items-center justify-center text-white font-black text-[9px]">
                                        D
                                    </div>
                                    <span className="text-[11px] font-bold text-[#101828]">D-hub Careers</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
