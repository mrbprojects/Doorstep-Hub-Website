import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Users, Lightbulb, Heart, TrendingUp, Compass } from 'lucide-react';

const valuesData = [
    {
        icon: Rocket,
        title: "Customer First",
        description: "We solve real problems for real people.",
        iconBg: "bg-[#E6F7F5]",
        iconColor: "text-[#008C80]"
    },
    {
        icon: Users,
        title: "Team Together",
        description: "We grow stronger when we work together.",
        iconBg: "bg-[#E0F2FE]",
        iconColor: "text-[#0284C7]"
    },
    {
        icon: Lightbulb,
        title: "Innovation Always",
        description: "We embrace new ideas and better solutions.",
        iconBg: "bg-[#ECFDF5]",
        iconColor: "text-[#059669]"
    },
    {
        icon: Heart,
        title: "Do The Right Thing",
        description: "We act with honesty and integrity.",
        iconBg: "bg-[#FFE4E6]",
        iconColor: "text-[#E11D48]"
    },
    {
        icon: TrendingUp,
        title: "Make An Impact",
        description: "We create meaningful change in communities.",
        iconBg: "bg-[#CCFBF1]",
        iconColor: "text-[#0D9488]"
    }
];

export function ValuesSection() {
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
                        <Compass className="w-3.5 h-3.5 text-[#008C80]" />
                        <span>Our Values</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#101828] tracking-tight mb-2"
                    >
                        What Drives Us
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                        className="text-xs sm:text-sm text-[#475467] leading-relaxed"
                    >
                        Our values shape everything we do — from how we work together to how we serve millions of customers across India.
                    </motion.p>
                </div>

                {/* Values Cards Grid: 2 cols on mobile, 3 on md, 5 on lg */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                    {valuesData.map((item, index) => {
                        const Icon = item.icon;
                        const isLastOnMobile = index === 4;
                        return (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35, delay: index * 0.05 }}
                                className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-[#E5ECEB] shadow-2xs hover:shadow-md hover:border-[#008C80]/30 transition-all duration-200 flex flex-col items-center text-center group h-full justify-start ${
                                    isLastOnMobile ? 'col-span-2 md:col-span-1' : ''
                                }`}
                            >
                                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs sm:text-sm font-bold text-[#101828] mb-1.5 leading-snug">
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
