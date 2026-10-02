'use client';

import React from 'react';
import { motion } from 'motion/react';

export default function ContactHeroIllustration() {
    return (
        <div className="relative w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[380px] h-[180px] sm:h-[210px] lg:h-[230px] flex items-center justify-center select-none" aria-hidden="true">
            {/* Background Circular Mint Glow */}
            <div className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-[#E6F7F5] via-[#D0F0EB] to-[#BFECE4] opacity-90 blur-sm pointer-events-none" />

            {/* Decorative Palm / Mint Leaves at bottom-right */}
            <svg
                className="absolute -bottom-2 right-2 sm:right-4 w-20 sm:w-24 h-20 sm:h-24 text-[#80D2C8] opacity-80 pointer-events-none"
                viewBox="0 0 120 120"
                fill="currentColor"
            >
                <path d="M100 120 C 80 80, 50 60, 10 70 C 40 90, 70 110, 100 120 Z" fill="#6EC7BD" />
                <path d="M110 100 C 85 60, 55 40, 20 40 C 50 65, 80 85, 110 100 Z" fill="#99E2D8" opacity="0.9" />
                <path d="M115 70 C 80 40, 50 20, 20 10 C 50 40, 80 55, 115 70 Z" fill="#B2ECE4" opacity="0.8" />
            </svg>

            {/* Small decorative leaf on left */}
            <svg
                className="absolute bottom-6 left-4 w-9 h-9 text-[#99E2D8] opacity-70 pointer-events-none"
                viewBox="0 0 50 50"
                fill="currentColor"
            >
                <path d="M10 50 C 15 30, 25 15, 45 10 C 35 25, 25 40, 10 50 Z" />
            </svg>

            {/* Floating Top-Left Mini Chat Bubble */}
            <motion.div
                animate={{
                    y: [0, -4, 0],
                    x: [0, 2, 0]
                }}
                transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-3 left-4 sm:left-6 w-12 h-9 sm:w-13 sm:h-10 rounded-xl bg-[#36B3A8] shadow-md shadow-[#008C80]/20 flex items-center justify-center gap-1 px-2.5 z-20"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                <div className="absolute -bottom-1 left-3 w-2.5 h-2.5 bg-[#36B3A8] rounded-bl-sm transform rotate-45" />
            </motion.div>

            {/* Floating Top-Right Green Paper Airplane */}
            <motion.div
                animate={{
                    y: [0, -6, 0],
                    rotate: [0, 3, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                }}
                className="absolute top-2 right-8 sm:right-10 z-20 text-[#008C80]"
            >
                <svg className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
                <svg className="absolute -bottom-4 -left-6 w-9 h-6 text-[#008C80]/40 pointer-events-none" viewBox="0 0 50 30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3">
                    <path d="M 2 28 C 15 20, 30 18, 48 5" />
                </svg>
            </motion.div>

            {/* Floating Bottom-Right Phone Badge */}
            <motion.div
                animate={{
                    y: [0, 4, 0]
                }}
                transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8
                }}
                className="absolute bottom-10 right-3 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#DCE5E8] shadow-md flex items-center justify-center text-[#008C80] z-20"
            >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.02l-2.23 2.09z" />
                </svg>
            </motion.div>

            {/* Main Central Open Envelope */}
            <motion.div
                animate={{
                    y: [0, -4, 0]
                }}
                transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative z-10 flex items-center justify-center"
            >
                <div className="relative w-44 sm:w-48 h-28 sm:h-32">
                    {/* Inner Letter Paper */}
                    <motion.div
                        animate={{
                            y: [0, -5, 0]
                        }}
                        transition={{
                            duration: 4.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 w-32 sm:w-36 h-22 sm:h-24 bg-white rounded-lg shadow-md border border-slate-200/90 p-2.5 space-y-1.5 z-0"
                    >
                        <div className="w-9 h-1.5 rounded bg-slate-200" />
                        <div className="w-full h-1 rounded bg-slate-100" />
                        <div className="w-5/6 h-1 rounded bg-slate-100" />
                        <div className="w-4/6 h-1 rounded bg-slate-100" />
                        <div className="w-3/6 h-1 rounded bg-teal-100" />
                    </motion.div>

                    {/* Envelope Body */}
                    <div className="absolute inset-0 bg-[#007A6F] rounded-xl shadow-lg shadow-[#008C80]/20" />

                    {/* Open Envelope Top Flap Vector */}
                    <svg className="absolute -top-1 left-0 w-full h-12 pointer-events-none" viewBox="0 0 240 60" fill="none">
                        <polygon points="0,0 120,50 240,0" fill="#006D63" opacity="0.6" />
                    </svg>

                    {/* Envelope Front Left & Right Fold Panels */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 240 160" preserveAspectRatio="none">
                        <polygon points="0,0 120,95 0,160" fill="#008C80" />
                        <polygon points="240,0 120,95 240,160" fill="#007F74" />
                        <polygon points="0,160 120,80 240,160" fill="#009A8D" />
                    </svg>

                    {/* Floating Circular Paper Plane Badge */}
                    <div className="absolute -bottom-1 -right-3 sm:-right-4 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#00D1B2] to-[#008C80] shadow-md shadow-[#008C80]/40 flex items-center justify-center text-white border-2 border-white z-20">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 transform -rotate-12 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
