import React, { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Building2, Laptop, Award, Users } from 'lucide-react';

const cultureItems = [
    {
        title: "Team Collaboration",
        caption: "Building solutions together in an open workspace.",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=80",
        icon: Building2,
        iconBg: "bg-[#E0F2FE]",
        iconColor: "text-[#0284C7]"
    },
    {
        title: "Learning & Growth",
        caption: "Weekly tech talks and workshops.",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80",
        icon: Laptop,
        iconBg: "bg-[#ECFDF5]",
        iconColor: "text-[#059669]"
    },
    {
        title: "Celebrations",
        caption: "We celebrate wins, big and small.",
        image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=700&q=80",
        icon: Award,
        iconBg: "bg-[#FFF7ED]",
        iconColor: "text-[#EA580C]"
    },
    {
        title: "Beyond Work",
        caption: "Team outings, fun events and meaningful connections.",
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80",
        icon: Users,
        iconBg: "bg-[#E0F2FE]",
        iconColor: "text-[#0284C7]"
    }
];

export function LifeAtDoorstepHub() {
    const scrollContainerRef = useRef(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    return (
        <section id="life-at-doorstep-hub" className="py-8 sm:py-12 bg-white overflow-hidden scroll-mt-24 sm:scroll-mt-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header with Left Content & Right Controls */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-7 gap-3">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F7F5] border border-[#BCEAE3] text-[#008C80] text-xs font-semibold mb-2 sm:mb-2.5 shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 text-[#008C80]" />
                            <span>Life at Doorstep Hub</span>
                        </div>

                        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#101828] tracking-tight mb-1.5">
                            A Glimpse Into Our Culture
                        </h2>

                        <p className="text-xs sm:text-sm text-[#475467] max-w-xl">
                            From brainstorming to celebrations, here&apos;s what makes working at Doorstep Hub special.
                        </p>
                    </div>

                    {/* Navigation Carousel Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                            type="button"
                            onClick={scrollLeft}
                            aria-label="Previous culture slide"
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#D5E2E0] bg-white text-[#344054] hover:bg-[#F2F8F7] hover:text-[#101828] flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={scrollRight}
                            aria-label="Next culture slide"
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#008C80] text-white hover:bg-[#007369] flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Culture Cards Horizontal Grid / Slider */}
                <div
                    ref={scrollContainerRef}
                    className="flex md:grid md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 overflow-x-auto pb-3 md:pb-0 scroll-smooth snap-x snap-mandatory scrollbar-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {cultureItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35, delay: index * 0.05 }}
                                className="min-w-[240px] sm:min-w-[270px] md:min-w-0 flex-1 snap-start bg-[#F8FCFB] rounded-xl sm:rounded-2xl border border-[#E5ECEB] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between h-full"
                            >
                                {/* Card Image Container */}
                                <div className="relative aspect-[16/11] overflow-hidden bg-gray-100">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width: 768px) 75vw, 25vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className={`w-6 h-6 rounded-md ${item.iconBg} ${item.iconColor} flex items-center justify-center flex-shrink-0`}>
                                                <Icon className="w-3.5 h-3.5" />
                                            </div>
                                            <h3 className="text-sm sm:text-base font-bold text-[#101828] leading-tight">
                                                {item.title}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-[#475467] leading-relaxed">
                                            {item.caption}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
