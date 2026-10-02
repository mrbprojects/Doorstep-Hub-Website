import React from 'react';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Clock, Users, Sprout, Gift, Award } from 'lucide-react';

const benefits = [
    {
        title: "Health & Wellness",
        description: "Comprehensive health insurance for you and your family.",
        icon: Heart,
        iconBg: "bg-[#EFF6FF]",
        iconColor: "text-[#2563EB]"
    },
    {
        title: "Learning Budget",
        description: "Access to courses, certifications and skill development.",
        icon: BookOpen,
        iconBg: "bg-[#F0FDF4]",
        iconColor: "text-[#16A34A]"
    },
    {
        title: "Flexible Work",
        description: "Work-life balance with flexible hours and hybrid options.",
        icon: Clock,
        iconBg: "bg-[#ECFEFF]",
        iconColor: "text-[#0891B2]"
    },
    {
        title: "Inclusive Culture",
        description: "A diverse and supportive workplace for everyone.",
        icon: Users,
        iconBg: "bg-[#FAF5FF]",
        iconColor: "text-[#9333EA]"
    },
    {
        title: "Growth Opportunities",
        description: "Clear career paths and internal mobility.",
        icon: Sprout,
        iconBg: "bg-[#ECFDF5]",
        iconColor: "text-[#059669]"
    },
    {
        title: "Fun & Celebrations",
        description: "Team events, festivals and recognition programs.",
        icon: Gift,
        iconBg: "bg-[#FFF7ED]",
        iconColor: "text-[#EA580C]"
    }
];

export function BenefitsSection() {
    return (
        <section className="py-8 sm:py-12 bg-[#FAFCFB] border-t border-b border-[#E8F0EE]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F7F5] border border-[#BCEAE3] text-[#008C80] text-xs font-semibold mb-2 sm:mb-2.5 shadow-2xs"
                    >
                        <Award className="w-3.5 h-3.5 text-[#008C80]" />
                        <span>Why Join Us</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#101828] tracking-tight mb-2"
                    >
                        Perks That Power Your Journey
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                        className="text-xs sm:text-sm text-[#475467] leading-relaxed"
                    >
                        We take care of our people so they can do their best work.
                    </motion.p>
                </div>

                {/* 6 Benefits Grid: 2 cols on mobile, 3 on tablet, 6 on desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4">
                    {benefits.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35, delay: index * 0.04 }}
                                className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#E5ECEB] shadow-2xs hover:shadow-md hover:border-[#008C80]/30 transition-all duration-200 flex flex-col items-center text-center justify-start h-full group"
                            >
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <h3 className="text-xs sm:text-sm font-bold text-[#101828] mb-1 leading-snug">
                                    {item.title}
                                </h3>
                                <p className="text-[11px] sm:text-xs text-[#475467] leading-relaxed">
                                    {item.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
