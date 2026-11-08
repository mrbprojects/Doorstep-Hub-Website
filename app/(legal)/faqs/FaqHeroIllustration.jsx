'use client';

import React from 'react';
import { motion } from 'motion/react';

export default function FaqHeroIllustration() {
    return (
        <div className="relative w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] h-[220px] sm:h-[240px] flex items-center justify-center select-none" aria-hidden="true">
            {/* Background Ambient Glow */}
            <div className="absolute inset-0 bg-radial-gradient from-cyan-400/25 via-teal-300/10 to-transparent blur-2xl pointer-events-none" />

            {/* Handwritten "We're here to help!" Badge with curved arrow */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute top-1 sm:top-2 right-4 sm:right-6 z-20 flex flex-col items-center pointer-events-none"
            >
                <span className="text-white text-xs sm:text-sm font-semibold tracking-wide drop-shadow-md font-sans italic" style={{ transform: 'rotate(-4deg)' }}>
                    We&apos;re here to help!
                </span>
                {/* Curved Arrow Vector pointing down-left toward main bubble */}
                <svg
                    className="w-10 h-7 text-white/90 drop-shadow mt-0.5"
                    viewBox="0 0 50 35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M 42 4 C 32 18, 18 20, 8 28" />
                    <path d="M 5 20 L 7 29 L 16 28" />
                </svg>
            </motion.div>

            {/* Main Floating 3D Bubble Container */}
            <motion.div
                animate={{
                    y: [0, -6, 0],
                    rotate: [2, 3.5, 2]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative z-10 flex items-center justify-center"
            >
                {/* Big 3D Cyan-Blue Speech Bubble with Question Mark */}
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-[32px] sm:rounded-[36px] bg-gradient-to-br from-[#60d5fa] via-[#22b2f0] to-[#1e7bd6] shadow-[0_20px_40px_rgba(10,50,90,0.35),inset_0_4px_12px_rgba(255,255,255,0.7),inset_0_-8px_16px_rgba(14,65,130,0.4)] flex items-center justify-center transform -rotate-3 transition-transform">
                    {/* Top glass highlight reflection */}
                    <div className="absolute top-2 left-4 right-6 h-8 rounded-full bg-gradient-to-b from-white/70 to-white/0 opacity-80 pointer-events-none" />

                    {/* Bold 3D White Question Mark */}
                    <span className="text-white font-black text-6xl sm:text-7xl drop-shadow-[0_4px_8px_rgba(0,40,90,0.3)] tracking-tighter">
                        ?
                    </span>

                    {/* Speech Bubble Tail */}
                    <div className="absolute -bottom-3 left-6 w-7 h-7 bg-[#208ddf] rounded-bl-2xl transform rotate-45 shadow-[4px_8px_16px_rgba(10,50,90,0.25)] pointer-events-none" />
                </div>

                {/* Left Floating Mini Bubble with 3 Dots */}
                <motion.div
                    animate={{
                        y: [0, 5, 0],
                        x: [0, -2, 0]
                    }}
                    transition={{
                        duration: 3.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.4
                    }}
                    className="absolute -left-12 sm:-left-14 top-8 sm:top-10 w-16 h-14 sm:w-18 sm:h-16 rounded-2xl bg-gradient-to-br from-[#7ee7fc] to-[#38bdf8] shadow-[0_12px_24px_rgba(10,50,90,0.25),inset_0_2px_8px_rgba(255,255,255,0.8),inset_0_-4px_8px_rgba(14,75,130,0.3)] flex items-center justify-center gap-1 px-3 z-0"
                >
                    <span className="w-2 h-2 rounded-full bg-white/90 shadow-sm" />
                    <span className="w-2 h-2 rounded-full bg-white/90 shadow-sm" />
                    <span className="w-2 h-2 rounded-full bg-white/90 shadow-sm" />
                    {/* Tail */}
                    <div className="absolute -bottom-1.5 right-3 w-4 h-4 bg-[#38bdf8] rounded-br-lg transform rotate-45" />
                </motion.div>

                {/* Right Bottom Mini Bubble */}
                <motion.div
                    animate={{
                        y: [0, -4, 0],
                        x: [0, 3, 0]
                    }}
                    transition={{
                        duration: 3.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.8
                    }}
                    className="absolute -right-8 sm:-right-10 bottom-1 sm:bottom-2 w-14 h-12 rounded-xl bg-gradient-to-br from-[#38bdf8] to-[#0284c7] shadow-[0_10px_20px_rgba(10,50,90,0.25),inset_0_2px_6px_rgba(255,255,255,0.7)] flex items-center justify-center z-20"
                >
                    <div className="w-6 h-3 rounded-sm bg-white/80" />
                </motion.div>
            </motion.div>
        </div>
    );
}
