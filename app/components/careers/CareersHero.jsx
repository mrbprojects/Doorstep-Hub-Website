import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Rocket, Play, ArrowRight, Users, Building2, LayoutGrid, HeartHandshake } from 'lucide-react';

export function CareersHero({ onOpenPositionsClick, onCultureClick }) {
    const scrollToPositions = () => {
        if (onOpenPositionsClick) {
            onOpenPositionsClick();
        } else {
            const el = document.getElementById('open-positions');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToCulture = () => {
        if (onCultureClick) {
            onCultureClick();
        } else {
            const el = document.getElementById('life-at-doorstep-hub');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative pt-24 sm:pt-26 md:pt-28 lg:pt-28 pb-8 sm:pb-12 overflow-hidden bg-gradient-to-b from-[#F2FAF8] via-[#F8FCFB] to-white">
            {/* Subtle decorative background glow */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#008C80]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 left-0 w-72 h-72 bg-[#00A896]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
                    
                    {/* Left Column: Headline, Copy, Actions, Proof */}
                    <div className="lg:col-span-6 flex flex-col items-start text-left">
                        {/* Hero Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F7F5] border border-[#BCEAE3] text-[#008C80] text-xs font-semibold mb-3 sm:mb-4 shadow-2xs"
                        >
                            <Rocket className="w-3.5 h-3.5 text-[#008C80]" />
                            <span>Join Our Team</span>
                        </motion.div>

                        {/* Main Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="text-[30px] sm:text-[40px] lg:text-[50px] font-extrabold text-[#101828] leading-[1.1] tracking-tight mb-3 sm:mb-4"
                        >
                            Build a Better <br className="hidden sm:inline" />
                            Tomorrow with <br className="hidden sm:inline" />
                            <span className="text-[#008C80]">Doorstep Hub</span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="text-sm sm:text-base text-[#475467] leading-relaxed max-w-lg mb-5 sm:mb-6"
                        >
                            More than just a workplace. We are a community of innovators building the future of home services together.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 mb-6 sm:mb-7 w-full sm:w-auto"
                        >
                            <button
                                type="button"
                                onClick={scrollToPositions}
                                className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-full bg-[#008C80] hover:bg-[#007369] text-white text-sm font-semibold transition-all shadow-xs hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                <span>View Open Positions</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                type="button"
                                onClick={scrollToCulture}
                                className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-full bg-white hover:bg-[#F2F8F7] text-[#1D2939] border border-[#D5E2E0] text-sm font-semibold transition-all shadow-2xs active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                <div className="w-5 h-5 rounded-full bg-[#E6F7F5] flex items-center justify-center text-[#008C80] group-hover:scale-110 transition-transform">
                                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                </div>
                                <span>Watch Our Culture</span>
                            </button>
                        </motion.div>

                        {/* Team Proof */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex items-center gap-3 pt-2.5 border-t border-[#E5ECEB]/80 w-full"
                        >
                            <div className="flex -space-x-2 overflow-hidden flex-shrink-0">
                                <Image
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                                    alt="Team member"
                                    width={32}
                                    height={32}
                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                                />
                                <Image
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                                    alt="Team member"
                                    width={32}
                                    height={32}
                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                                />
                                <Image
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                                    alt="Team member"
                                    width={32}
                                    height={32}
                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                                />
                                <Image
                                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                                    alt="Team member"
                                    width={32}
                                    height={32}
                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                                />
                            </div>

                            <p className="text-xs sm:text-sm text-[#475467] font-medium leading-tight">
                                Join <span className="text-[#101828] font-bold">100+</span> talented people making an impact nationwide.
                            </p>
                        </motion.div>
                    </div>

                    {/* Right Column: Hero Image with Floating Culture Card & Stats Overlay */}
                    <div className="lg:col-span-6 relative mt-4 lg:mt-0">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#DCE8E6] bg-white shadow-lg aspect-[16/11] sm:aspect-[16/11] max-w-[560px] mx-auto"
                        >
                            {/* Hero Image */}
                            <Image
                                src="/careers-hero-team.jpg"
                                alt="Doorstep Hub Team Collaborating"
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover"
                            />

                            {/* Top Right Floating Badge: People First / Culture Always */}
                            <div className="absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl shadow-md border border-white/60 flex items-center gap-2 z-10 transition-transform hover:scale-105">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#E6F7F5] flex items-center justify-center text-[#008C80]">
                                    <HeartHandshake className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left">
                                    <div className="text-[11px] sm:text-xs font-bold text-[#101828] leading-tight">People First</div>
                                    <div className="text-[9px] sm:text-[10px] text-[#667085] leading-tight">Culture Always</div>
                                </div>
                            </div>

                            {/* Bottom Floating Stats Bar */}
                            <div className="absolute bottom-2.5 sm:bottom-3.5 left-2.5 sm:left-3.5 right-2.5 sm:right-3.5 bg-white/95 backdrop-blur-md border border-white/80 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-between gap-1.5 sm:gap-3 z-10">
                                {/* D-hub Brand mark */}
                                <div className="flex items-center gap-1.5 sm:gap-2 pr-1.5 sm:pr-2.5 border-r border-[#E5ECEB]">
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#008C80] flex items-center justify-center text-white font-black text-[10px] sm:text-xs">
                                        D
                                    </div>
                                    <div className="hidden xs:block sm:block text-left">
                                        <div className="text-[10px] sm:text-xs font-bold text-[#101828] leading-tight">D-hub</div>
                                        <div className="text-[8px] sm:text-[9px] text-[#667085] leading-tight">Doorstep Hubs</div>
                                    </div>
                                </div>

                                {/* Stats List */}
                                <div className="flex-1 grid grid-cols-3 gap-1 text-center">
                                    <div className="flex flex-col items-center">
                                        <Users className="w-3 h-3 text-[#008C80] mb-0.5" />
                                        <div className="text-xs sm:text-sm font-extrabold text-[#101828] leading-tight">100+</div>
                                        <div className="text-[9px] sm:text-[10px] text-[#667085] leading-tight truncate">Members</div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <Building2 className="w-3 h-3 text-[#008C80] mb-0.5" />
                                        <div className="text-xs sm:text-sm font-extrabold text-[#101828] leading-tight">10+</div>
                                        <div className="text-[9px] sm:text-[10px] text-[#667085] leading-tight truncate">Cities</div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <LayoutGrid className="w-3 h-3 text-[#008C80] mb-0.5" />
                                        <div className="text-xs sm:text-sm font-extrabold text-[#101828] leading-tight">5+</div>
                                        <div className="text-[9px] sm:text-[10px] text-[#667085] leading-tight truncate">Categories</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
