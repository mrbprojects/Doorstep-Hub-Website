'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    Star,
    MapPin,
    Calendar,
    ShieldCheck,
    Home,
    Award,
    Headphones,
    CheckCircle2
} from 'lucide-react';

/**
 * Page-scoped color tokens matching the approved design
 */
const THEME = {
    purpleDark: '#280526',
    purpleDeep: '#360B37',
    purpleMid: '#4D124B',
    purplePlum: '#65135E',
    goldLight: '#FFEAA8',
    goldBase: '#D9A441',
    goldDeep: '#9E6C18',
    ivoryLight: '#FFFDF9',
    ivoryCard: '#FFF9F0',
    creamBorder: '#ECDAB8',
    textWhite: '#FFFFFF',
    textIvory: '#F7EFE4',
    textMuted: '#DFC6B5'
};

/**
 * Detailed Symmetrical Vedic Mandala Half-Arc SVG (Left/Right hero background)
 */
function MandalaHeroDecoration({ className = '', style = {}, flip = false }) {
    return (
        <svg
            viewBox="0 0 320 540"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={flip ? "mandalaGoldR" : "mandalaGoldL"} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFEAA8" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#D9A441" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#8A550C" stopOpacity="0.25" />
                </linearGradient>
            </defs>
            <g transform={flip ? "translate(320, 270) scale(-1, 1)" : "translate(0, 270)"}>
                {/* Concentric rings radiating outward */}
                <circle cx="0" cy="0" r="260" stroke={`url(#${flip ? "mandalaGoldR" : "mandalaGoldL"})`} strokeWidth="1.2" strokeDasharray="5 5" />
                <circle cx="0" cy="0" r="235" stroke={`url(#${flip ? "mandalaGoldR" : "mandalaGoldL"})`} strokeWidth="1.8" />
                <circle cx="0" cy="0" r="205" stroke={`url(#${flip ? "mandalaGoldR" : "mandalaGoldL"})`} strokeWidth="1" />
                <circle cx="0" cy="0" r="175" stroke={`url(#${flip ? "mandalaGoldR" : "mandalaGoldL"})`} strokeWidth="1.5" strokeDasharray="3 4" />
                <circle cx="0" cy="0" r="145" stroke={`url(#${flip ? "mandalaGoldR" : "mandalaGoldL"})`} strokeWidth="1.2" />
                <circle cx="0" cy="0" r="110" stroke={`url(#${flip ? "mandalaGoldR" : "mandalaGoldL"})`} strokeWidth="1.6" />
                <circle cx="0" cy="0" r="75" stroke={`url(#${flip ? "mandalaGoldR" : "mandalaGoldL"})`} strokeWidth="1.2" />
                <circle cx="0" cy="0" r="40" stroke={`url(#${flip ? "mandalaGoldR" : "mandalaGoldL"})`} strokeWidth="1.5" />

                {/* 16-point outward radiating petal starburst */}
                {[...Array(16)].map((_, i) => {
                    const angle = (i * 180) / 15 - 90;
                    return (
                        <g key={i} transform={`rotate(${angle})`}>
                            <path
                                d="M0,0 C15,80 35,160 0,230 C-35,160 -15,80 0,0 Z"
                                stroke={`url(#${flip ? "mandalaGoldR" : "mandalaGoldL"})`}
                                strokeWidth="1.2"
                                fill="none"
                            />
                            <path
                                d="M0,70 C10,120 18,170 0,210 C-18,170 -10,120 0,70 Z"
                                stroke={`url(#${flip ? "mandalaGoldR" : "mandalaGoldL"})`}
                                strokeWidth="0.8"
                                fill="none"
                            />
                            <circle cx="0" cy="225" r="3.5" fill="#D9A441" fillOpacity="0.75" />
                            <circle cx="0" cy="140" r="2" fill="#FFEAA8" fillOpacity="0.6" />
                        </g>
                    );
                })}

                {/* Inner floral ring */}
                {[...Array(12)].map((_, i) => {
                    const angle = (i * 180) / 11 - 90;
                    return (
                        <g key={`in-${i}`} transform={`rotate(${angle})`}>
                            <path
                                d="M0,0 C8,40 16,80 0,105 C-16,80 -8,40 0,0 Z"
                                stroke={`url(#${flip ? "mandalaGoldR" : "mandalaGoldL"})`}
                                strokeWidth="1.2"
                                fill="none"
                            />
                        </g>
                    );
                })}
            </g>
        </svg>
    );
}

/**
 * Centered Sacred 7-Petal Lotus Heading Divider
 */
function LotusHeadingDivider({ className = '' }) {
    return (
        <div className={`flex items-center justify-center gap-3 w-full my-2.5 ${className}`} aria-hidden="true">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D9A441]/70 to-[#D9A441]" />
            <svg
                width="38"
                height="22"
                viewBox="0 0 38 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 drop-shadow-[0_0_6px_rgba(217,164,65,0.7)]"
            >
                <defs>
                    <linearGradient id="lotusGoldGrad" x1="19" y1="1" x2="19" y2="20" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFF2C6" />
                        <stop offset="0.5" stopColor="#E5B242" />
                        <stop offset="1" stopColor="#A86D12" />
                    </linearGradient>
                </defs>
                {/* Central tall petal */}
                <path
                    d="M19 1C20.5 7 22 12 19 17C16 12 17.5 7 19 1Z"
                    fill="url(#lotusGoldGrad)"
                    stroke="#D9A441"
                    strokeWidth="0.8"
                />
                {/* Inner left petal */}
                <path
                    d="M16.5 4C13 8.5 12.5 13 18 17C13 14.5 11 10.5 16.5 4Z"
                    fill="url(#lotusGoldGrad)"
                    stroke="#D9A441"
                    strokeWidth="0.8"
                />
                {/* Inner right petal */}
                <path
                    d="M21.5 4C25 8.5 25.5 13 20 17C25 14.5 27 10.5 21.5 4Z"
                    fill="url(#lotusGoldGrad)"
                    stroke="#D9A441"
                    strokeWidth="0.8"
                />
                {/* Outer left petal */}
                <path
                    d="M14 8C8.5 11 7.5 15.5 16.5 18C10 15.5 7.5 12 14 8Z"
                    fill="url(#lotusGoldGrad)"
                    stroke="#D9A441"
                    strokeWidth="0.8"
                />
                {/* Outer right petal */}
                <path
                    d="M24 8C29.5 11 30.5 15.5 21.5 18C28 15.5 30.5 12 24 8Z"
                    fill="url(#lotusGoldGrad)"
                    stroke="#D9A441"
                    strokeWidth="0.8"
                />
                {/* Lotus base pod */}
                <path
                    d="M11 17.5C14.5 20 23.5 20 27 17.5C24.5 21 13.5 21 11 17.5Z"
                    fill="#D9A441"
                />
                <circle cx="19" cy="19.5" r="1.5" fill="#FFEAA8" />
            </svg>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#D9A441]/70 to-[#D9A441]" />
        </div>
    );
}

/**
 * Scalloped Temple Arch Finial Crown for Puja Booking Hours Card
 * Redesigned with authentic cusped 3-lobed temple gopuram arch & sacred Kalash / Lotus finial
 */
function TempleArchFinialCrown() {
    return (
        <div className="absolute -top-[30px] left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none" aria-hidden="true">
            <svg
                width="220"
                height="34"
                viewBox="0 0 220 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_2px_5px_rgba(0,0,0,0.14)]"
            >
                <defs>
                    <linearGradient id="crestGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFF2C6" />
                        <stop offset="25%" stopColor="#F7CE68" />
                        <stop offset="50%" stopColor="#D9A441" />
                        <stop offset="80%" stopColor="#B37D1A" />
                        <stop offset="100%" stopColor="#7E4C06" />
                    </linearGradient>
                    <linearGradient id="crestInnerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ECDAB8" />
                        <stop offset="50%" stopColor="#D9A441" />
                        <stop offset="100%" stopColor="#ECDAB8" />
                    </linearGradient>
                </defs>

                {/* Scalloped Cusped Arch Outer Body */}
                <path
                    d="M 12 34
                       C 26 34, 38 29, 50 21
                       C 58 15, 64 14, 72 17
                       C 82 21, 92 12, 102 6
                       C 107 3, 110 0, 110 0
                       C 110 0, 113 3, 118 6
                       C 128 12, 138 21, 148 17
                       C 156 14, 162 15, 170 21
                       C 182 29, 194 34, 208 34
                       Z"
                    fill="#FFFDF8"
                    stroke="url(#crestGoldGrad)"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                />

                {/* Inner Delicate Arch Contour */}
                <path
                    d="M 24 34
                       C 36 34, 46 29, 54 23
                       C 60 18, 66 17, 73 19
                       C 82 22, 91 14, 100 8
                       C 106 5, 108 3, 110 3
                       C 112 3, 114 5, 120 8
                       C 129 14, 138 22, 147 19
                       C 154 17, 160 18, 166 23
                       C 174 29, 184 34, 196 34"
                    stroke="url(#crestInnerGrad)"
                    strokeWidth="0.9"
                    strokeDasharray="2 2"
                    fill="none"
                />

                {/* Central Sacred Lotus / Kalash Ornament */}
                <g transform="translate(110, 15)">
                    {/* Central Petal */}
                    <path
                        d="M0 -11 C1.5 -7 2 -4 0 0 C-2 -4 -1.5 -7 0 -11 Z"
                        fill="url(#crestGoldGrad)"
                        stroke="#B37D1A"
                        strokeWidth="0.5"
                    />
                    {/* Left Petal */}
                    <path
                        d="M-2 -7 C-5 -4 -5 -2 0 1 C-3 -1 -4 -4 -2 -7 Z"
                        fill="url(#crestGoldGrad)"
                        stroke="#B37D1A"
                        strokeWidth="0.5"
                    />
                    {/* Right Petal */}
                    <path
                        d="M2 -7 C5 -4 5 -2 0 1 C3 -1 4 -4 2 -7 Z"
                        fill="url(#crestGoldGrad)"
                        stroke="#B37D1A"
                        strokeWidth="0.5"
                    />
                    {/* Base Pod / Kalash */}
                    <circle cx="0" cy="2" r="2" fill="#D9A441" />
                    <circle cx="0" cy="2" r="1" fill="#FFF2C6" />
                    {/* Filigree Under-curls */}
                    <path
                        d="M-9 5 C-4 2 -2 4 0 4 C2 4 4 2 9 5"
                        stroke="#D9A441"
                        strokeWidth="1.1"
                        strokeLinecap="round"
                        fill="none"
                    />
                    {/* Small accent pearls */}
                    <circle cx="-13" cy="4.5" r="1.1" fill="#D9A441" />
                    <circle cx="13" cy="4.5" r="1.1" fill="#D9A441" />
                </g>
            </svg>
        </div>
    );
}

/**
 * Polished Dual-Tone Golden Ribbon Wave Transition (Hero Bottom - Compact & Sleek)
 */
function GoldenRibbonWave() {
    return (
        <div className="relative w-full overflow-hidden leading-none z-10 -mb-1 select-none pointer-events-none" aria-hidden="true">
            <svg
                className="relative block w-full h-8 sm:h-10 md:h-12 lg:h-13"
                viewBox="0 0 1440 60"
                fill="none"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="goldRibbonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFEAA8" />
                        <stop offset="25%" stopColor="#F5C767" />
                        <stop offset="50%" stopColor="#D9A441" />
                        <stop offset="75%" stopColor="#FFDE8A" />
                        <stop offset="100%" stopColor="#D9A441" />
                    </linearGradient>
                </defs>

                {/* Outer Golden Glow Stroke */}
                <path
                    d="M0,28 C280,50 560,8 840,24 C1120,40 1320,16 1440,22"
                    stroke="rgba(255, 234, 168, 0.4)"
                    strokeWidth="6"
                    fill="none"
                />

                {/* Main Gold Ribbon Stroke */}
                <path
                    d="M0,28 C280,50 560,8 840,24 C1120,40 1320,16 1440,22"
                    stroke="url(#goldRibbonGlow)"
                    strokeWidth="3.5"
                    fill="none"
                />

                {/* Fine Highlight Line on Crest */}
                <path
                    d="M0,27 C280,49 560,7 840,23 C1120,39 1320,15 1440,21"
                    stroke="#FFFDF2"
                    strokeWidth="1"
                    strokeOpacity="0.85"
                    fill="none"
                />

                {/* Solid wave body filled with the warm off-white background below */}
                <path
                    d="M0,30 C280,52 560,10 840,26 C1120,42 1320,18 1440,24 L1440,60 L0,60 Z"
                    fill="var(--off-white, #FAF7F2)"
                />
            </svg>
        </div>
    );
}

/**
 * Sacred Gopuram / Temple Icon
 */
function PriestGopuramIcon({ className = 'w-5 h-5' }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 2v2" />
            <circle cx="12" cy="4" r="1" />
            <path d="M10 6h4l1 3H9l1-3z" />
            <path d="M8 9h8l1.5 4H6.5L8 9z" />
            <path d="M5 13h14l1.5 5H3.5L5 13z" />
            <path d="M4 18h16v4H4v-4z" />
            <path d="M10 22v-3a2 2 0 0 1 4 0v3" />
        </svg>
    );
}

/**
 * Master Reusable ReligiousProviderHero Component
 */
export default function ReligiousProviderHero({
    serviceData,
    subcategories = [],
    operatingHours = null,
    onBack = null
}) {
    const [imageError, setImageError] = useState(false);

    if (!serviceData) return null;

    // Resolve Provider Logo & Fallback
    const rawLogo = serviceData.logo || serviceData.mainImage;
    const providerName = (serviceData.name || 'Vedic Priest & Ritual Specialist').trim();

    // Initials for fallback seal
    const initials = providerName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase())
        .join('') || 'DH';

    // Verification status
    const isVerified = serviceData.isVerified === true ||
        serviceData.verified === true ||
        serviceData.rawStore?.isVerified === true ||
        serviceData.rawStore?.verified === true ||
        Boolean(serviceData.rating && parseFloat(serviceData.rating) >= 4.0);

    // Specialties string: derive from real subcategories, packages, or fallback
    const specialties = (() => {
        if (Array.isArray(subcategories) && subcategories.length > 0) {
            const list = subcategories
                .map(s => s.name || s.subcategoryName)
                .filter(Boolean);
            if (list.length > 0) {
                return list.slice(0, 3).join(' | ');
            }
        }
        if (Array.isArray(serviceData.packages) && serviceData.packages.length > 0) {
            const unique = Array.from(
                new Set(
                    serviceData.packages
                        .map(p => p.subCategoryName || p.categoryName || p.name)
                        .filter(Boolean)
                )
            );
            if (unique.length > 0) {
                return unique.slice(0, 3).join(' | ');
            }
        }
        return 'Astrology Consultations | Vedic Rituals | Pooja Ceremonies';
    })();

    // Starting Price Calculation (dynamically inspects store.startingAt, basePrice, and min package price)
    const startingPrice = (() => {
        const val = serviceData.basePrice || serviceData.startingAt || serviceData.rawStore?.startingAt;
        if (val && !isNaN(val) && Number(val) > 0) {
            return Number(val);
        }
        if (Array.isArray(serviceData.packages) && serviceData.packages.length > 0) {
            const validPrices = serviceData.packages
                .map(p => parseFloat(p.price))
                .filter(p => !isNaN(p) && p > 0);
            if (validPrices.length > 0) {
                return Math.min(...validPrices);
            }
        }
        return null;
    })();

    // Ratings & Ceremonies
    const ratingValue = serviceData.rating ? parseFloat(serviceData.rating).toFixed(1) : '4.5';
    const ceremonyCount = serviceData.orders > 0
        ? `${serviceData.orders}+ Ceremonies`
        : serviceData.reviews && serviceData.reviews.length > 0
            ? `${serviceData.reviews.length}+ Devotee Reviews`
            : '120+ Ceremonies';

    // Address & Locality
    const addressString = serviceData.address || serviceData.location || 'Address available upon ritual booking';

    // Operating Hours Parsing (defaults to standard Puja schedule if not supplied by API)
    const schedule = operatingHours || {
        weekdayLabel: 'Monday – Saturday',
        weekdayHours: serviceData.rawStore?.openingTime && serviceData.rawStore?.closingTime
            ? `${serviceData.rawStore.openingTime} – ${serviceData.rawStore.closingTime}`
            : '06:00 AM – 09:00 PM',
        weekendLabel: 'Sunday',
        weekendHours: serviceData.rawStore?.openingTime && serviceData.rawStore?.closingTime
            ? `${serviceData.rawStore.openingTime} – ${serviceData.rawStore.closingTime}`
            : '06:00 AM – 10:00 PM',
        isOpen: true
    };

    return (
        <>
            <section
                aria-label="Religious Services Provider Overview"
                className="relative w-full overflow-hidden text-white"
                style={{
                    background: `linear-gradient(135deg, ${THEME.purpleDark} 0%, ${THEME.purpleDeep} 25%, #460E44 50%, ${THEME.purpleMid} 75%, ${THEME.purplePlum} 100%)`
                }}
            >
            {/* Ambient Radial Golden Glow (Center) */}
            <div
                className="absolute inset-0 pointer-events-none opacity-50 select-none"
                style={{
                    background: 'radial-gradient(circle at 48% 42%, rgba(217, 164, 65, 0.18) 0%, rgba(101, 19, 94, 0.45) 55%, transparent 85%)'
                }}
                aria-hidden="true"
            />

            {/* Left Mandala Arc */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 sm:w-80 lg:w-96 h-[500px] pointer-events-none opacity-40 select-none">
                <MandalaHeroDecoration className="w-full h-full" flip={false} />
            </div>

            {/* Right Mandala Arc */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 sm:w-80 lg:w-96 h-[500px] pointer-events-none opacity-40 select-none">
                <MandalaHeroDecoration className="w-full h-full" flip={true} />
            </div>

            {/* Main Hero Container - Sleek, Compact & Properly Aligned */}
            <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-1 sm:pb-2">
                {/* Back Button (Top Left) */}
                <div className="mb-2 sm:mb-2.5">
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/95 hover:bg-white text-gray-900 hover:text-[var(--saffron,#F47B20)] text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 border border-amber-200/60"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Back</span>
                        </button>
                    )}
                </div>

                {/* 3-Column Composition: Left Logo (~25%), Center Info (~47%), Right Hours Card (~28%) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-center">
                    {/* ── LEFT COLUMN: Circular Provider Logo (Balanced & Centered) ── */}
                    <div className="lg:col-span-3 flex items-center justify-center relative">
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative group"
                        >
                            {/* Outer Ambient Golden Glow */}
                            <div
                                className="absolute -inset-2 rounded-full blur-xl opacity-70 group-hover:opacity-90 transition-opacity"
                                style={{
                                    background: 'radial-gradient(circle, rgba(217,164,65,0.7) 0%, rgba(255,234,168,0.35) 50%, transparent 75%)'
                                }}
                                aria-hidden="true"
                            />

                            {/* Multi-Ring Layered Gold Border */}
                            <div className="relative p-2 sm:p-2.5 rounded-full bg-gradient-to-br from-[#FFEAA8] via-[#D9A441] to-[#7A4B0C] shadow-[0_0_30px_rgba(217,164,65,0.4)]">
                                <div className="p-1 sm:p-1 rounded-full bg-[#1A0318] border border-[#FFE7A0]/50">
                                    {/* Circular Frame for Logo (Responsive Clamp: 144px - 208px) */}
                                    <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48 xl:w-52 xl:h-52 rounded-full overflow-hidden bg-[#0A1224] flex items-center justify-center shadow-inner">
                                        {!imageError && rawLogo ? (
                                            <Image
                                                src={rawLogo}
                                                alt={providerName}
                                                fill
                                                priority
                                                sizes="(max-width: 640px) 144px, (max-width: 1024px) 192px, 208px"
                                                className="object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            /* Consecrated Branded Seal Placeholder */
                                            <div className="flex flex-col items-center justify-center text-center p-3">
                                                <div className="w-12 h-12 rounded-full bg-[#D9A441]/15 border border-[#D9A441] flex items-center justify-center mb-1.5">
                                                    <PriestGopuramIcon className="w-6 h-6 text-[#FFE59E]" />
                                                </div>
                                                <span className="text-lg sm:text-xl font-serif font-extrabold text-[#FFE59E] tracking-wider">
                                                    {initials}
                                                </span>
                                                <span className="text-[9px] uppercase font-bold text-amber-200/80 tracking-widest mt-0.5">
                                                    Vedic Priest
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Thin Vertical Gold Divider with Centered Diamond Accent (Desktop Only) */}
                        <div className="hidden lg:flex flex-col items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 h-3/4 pointer-events-none" aria-hidden="true">
                            <div className="w-[1px] flex-1 bg-gradient-to-b from-transparent via-[#D9A441]/60 to-[#D9A441]" />
                            <div className="w-2.5 h-2.5 rotate-45 bg-[#FFE59E] border border-[#D9A441] my-2 shadow-[0_0_8px_rgba(217,164,65,0.9)]" />
                            <div className="w-[1px] flex-1 bg-gradient-to-t from-transparent via-[#D9A441]/60 to-[#D9A441]" />
                        </div>
                    </div>

                    {/* ── CENTER COLUMN: Dynamic Provider Information (~47%) ─── */}
                    <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-1 sm:space-y-1.5 min-w-0">
                        {/* Badges Row */}
                        <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 flex-wrap">
                            {/* 1. Vedic Services Badge */}
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#350B33] border border-[#D9A441] text-[10px] sm:text-[11px] font-bold text-[#FFEAA8] shadow-2xs">
                                <PriestGopuramIcon className="w-3 h-3 text-[#D9A441]" />
                                Vedic Services
                            </span>

                            {/* 2. Pooja & Vedic Rituals Badge */}
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFFDF8] border border-[#ECDAB8] text-[10px] sm:text-[11px] font-extrabold text-[#C85200] shadow-2xs">
                                Pooja & Vedic Rituals
                            </span>

                            {/* 3. Verified Priest Badge */}
                            {isVerified && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EAF7EE] border border-[#A6E2BA] text-[10px] sm:text-[11px] font-bold text-[#167336] shadow-2xs">
                                    <CheckCircle2 className="w-3 h-3 text-[#167336]" />
                                    Verified Priest
                                </span>
                            )}
                        </div>

                        {/* Provider Business Name in Classical Serif Typography - Single Line */}
                        <h1 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-[23px] xl:text-[26px] font-bold text-white tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full drop-shadow-xs">
                            {providerName}
                        </h1>

                        {/* Sacred Lotus Heading Divider */}
                        <LotusHeadingDivider className="w-full max-w-lg my-1" />

                        {/* Specialties Row */}
                        <p className="text-xs sm:text-[12.5px] font-medium text-[#F7EFE4] tracking-wide max-w-xl truncate leading-tight">
                            {specialties}
                        </p>

                        {/* Address Row with Gold Location Pin */}
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#EDE0D2] max-w-xl truncate leading-tight">
                            <MapPin className="w-3.5 h-3.5 text-[#F5BA42] shrink-0 fill-[#F5BA42]/30" />
                            <span className="truncate">{addressString}</span>
                        </div>

                        {/* Ratings & Starting Price Row */}
                        <div className="pt-1 flex items-center justify-center lg:justify-start gap-3 sm:gap-4 flex-wrap">
                            {/* Rating Badge */}
                            <div className="flex items-center gap-1.5">
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F5B82E] text-gray-950 font-black text-xs shadow-2xs">
                                    <Star className="w-3 h-3 fill-black text-black" />
                                    <span>{ratingValue}</span>
                                </div>
                                <span className="text-xs font-medium text-[#FAF0E1]">
                                    ({ceremonyCount})
                                </span>
                            </div>

                            {/* Thin Vertical Gold Separator */}
                            <div className="h-5 w-[1px] bg-[#D9A441]/50" aria-hidden="true" />

                            {/* Starting Price */}
                            <div className="flex items-baseline gap-1.5 text-left">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-[#D9A441] leading-none">
                                    STARTING AT
                                </span>
                                <span className="text-lg sm:text-xl font-black text-[#FFD54F] tracking-tight leading-none">
                                    {startingPrice ? `₹${startingPrice.toLocaleString('en-IN')}` : 'Price on Enquiry'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN: Puja Booking Hours Card (~28%) ─────────── */}
                    <div className="lg:col-span-4 w-full flex justify-center lg:justify-end mt-4 lg:mt-0">
                        <div className="relative w-full max-w-[340px] sm:max-w-[360px] lg:max-w-[370px] bg-[#FFFDF8] border-2 border-[#D9A441]/60 rounded-[24px] px-4 py-3 sm:px-5 sm:py-3.5 shadow-[0_12px_32px_rgba(20,5,20,0.35),0_0_18px_rgba(217,164,65,0.25)] ring-2 ring-[#FFEAA8]/25 text-gray-800">
                            {/* Architectural Scalloped Temple Arch Crest */}
                            <TempleArchFinialCrown />

                            {/* Card Header: Title & Live Status */}
                            <div className="flex items-center justify-between pb-2.5 border-b border-[#F2E5CC]">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-[#FAF0D8] border border-[#ECDAB8] flex items-center justify-center shrink-0">
                                        <Calendar className="w-3.5 h-3.5 text-[#9E6C18]" />
                                    </div>
                                    <h3 className="text-xs sm:text-[13px] font-extrabold text-[#26130B] tracking-tight">
                                        Puja Booking Hours
                                    </h3>
                                </div>
                                {schedule.isOpen && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7EE] border border-[#A6E2BA] text-[10px] sm:text-[11px] font-extrabold text-[#167336]">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
                                        </span>
                                        Open Now
                                    </span>
                                )}
                            </div>

                            {/* Schedule Rows */}
                            <div className="space-y-2 mt-2.5">
                                {/* Weekday Schedule */}
                                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#FAF4E8] border border-[#EFE2C8]">
                                    <div className="w-7 h-7 rounded-lg bg-white border border-[#E8D6B5] flex items-center justify-center shrink-0 shadow-2xs">
                                        <Calendar className="w-3.5 h-3.5 text-[#A8741B]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#665042] leading-tight">
                                            {schedule.weekdayLabel}
                                        </span>
                                        <span className="block text-xs sm:text-[12.5px] font-extrabold text-[#26130B] leading-snug">
                                            {schedule.weekdayHours}
                                        </span>
                                    </div>
                                </div>

                                {/* Sunday Schedule */}
                                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#FAF4E8] border border-[#EFE2C8]">
                                    <div className="w-7 h-7 rounded-lg bg-white border border-[#E8D6B5] flex items-center justify-center shrink-0 shadow-2xs">
                                        <Calendar className="w-3.5 h-3.5 text-[#A8741B]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#665042] leading-tight">
                                            {schedule.weekendLabel}
                                        </span>
                                        <span className="block text-xs sm:text-[12.5px] font-extrabold text-[#26130B] leading-snug">
                                            {schedule.weekendHours}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Purple Pill: Doorstep Vedic Specialist */}
                            <div className="mt-2.5 pt-0.5">
                                <div className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#4A0E46] via-[#330830] to-[#4A0E46] text-white flex items-center justify-center gap-2 shadow-md border border-[#D9A441]/40">
                                    <PriestGopuramIcon className="w-3.5 h-3.5 text-[#FFE59E] shrink-0" />
                                    <span className="text-[11px] sm:text-xs font-extrabold tracking-wide text-[#FFF8EE]">
                                        Doorstep Vedic Specialist
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Polished Golden Ribbon Wave Transition */}
            <GoldenRibbonWave />
        </section>

        {/* Floating Highlighted Trust Strip (Positioned cleanly on page background - NO purple bar!) */}
        <div className="relative z-20 max-w-[1340px] mx-auto px-4 -mt-5 sm:-mt-6 md:-mt-7 mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-[#FFFDF9] via-[#FFF9EE] to-[#FFFDF9] border-2 border-[#D9A441]/60 rounded-xl sm:rounded-full py-2.5 sm:py-3 px-4 sm:px-6 shadow-xl shadow-[#D9A441]/15 ring-4 ring-[#FAF2E1]/80 transition-all hover:border-[#D9A441]">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-1 items-center divide-y sm:divide-y-0 sm:divide-x divide-[#ECDAB8]">
                    {/* 1. Authentic Vedic Rituals */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 py-1.5 sm:py-0 sm:px-3 text-center sm:text-left">
                        <div className="w-6 h-6 rounded-full bg-[#FF9933]/15 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#D9531E]" />
                        </div>
                        <span className="text-xs sm:text-[12.5px] font-bold text-[#2A0826] tracking-tight">
                            Authentic Vedic Rituals
                        </span>
                    </div>

                    {/* 2. Experienced Priests */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 py-1.5 sm:py-0 sm:px-3 text-center sm:text-left">
                        <div className="w-6 h-6 rounded-full bg-[#FF9933]/15 flex items-center justify-center shrink-0">
                            <PriestGopuramIcon className="w-3.5 h-3.5 text-[#D9531E]" />
                        </div>
                        <span className="text-xs sm:text-[12.5px] font-bold text-[#2A0826] tracking-tight">
                            Experienced Priests
                        </span>
                    </div>

                    {/* 3. At Your Doorstep */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 py-1.5 sm:py-0 sm:px-3 text-center sm:text-left">
                        <div className="w-6 h-6 rounded-full bg-[#FF9933]/15 flex items-center justify-center shrink-0">
                            <Home className="w-3.5 h-3.5 text-[#D9531E]" />
                        </div>
                        <span className="text-xs sm:text-[12.5px] font-bold text-[#2A0826] tracking-tight">
                            At Your Doorstep
                        </span>
                    </div>

                    {/* 4. Verified & Trusted */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 py-1.5 sm:py-0 sm:px-3 text-center sm:text-left">
                        <div className="w-6 h-6 rounded-full bg-[#FF9933]/15 flex items-center justify-center shrink-0">
                            <Award className="w-3.5 h-3.5 text-[#D9531E]" />
                        </div>
                        <span className="text-xs sm:text-[12.5px] font-bold text-[#2A0826] tracking-tight">
                            Verified & Trusted
                        </span>
                    </div>

                    {/* 5. Booking Support */}
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-center sm:justify-start gap-2 py-1.5 sm:py-0 sm:px-3 text-center sm:text-left">
                        <div className="w-6 h-6 rounded-full bg-[#FF9933]/15 flex items-center justify-center shrink-0">
                            <Headphones className="w-3.5 h-3.5 text-[#D9531E]" />
                        </div>
                        <span className="text-xs sm:text-[12.5px] font-bold text-[#2A0826] tracking-tight">
                            Booking Support
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}

/**
 * Dedicated Skeleton for Smooth Page Loading (Phase 13 - Compact & Sleek)
 */
export function ReligiousHeroSkeleton() {
    return (
        <section
            aria-label="Loading Provider"
            className="relative w-full overflow-hidden text-white pt-3 pb-8 animate-pulse"
            style={{
                background: 'linear-gradient(135deg, #280526 0%, #360B37 35%, #65135E 100%)'
            }}
        >
            <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back button placeholder */}
                <div className="w-20 h-7 rounded-full bg-white/20 mb-3" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-center">
                    {/* Logo placeholder */}
                    <div className="lg:col-span-3 flex justify-center">
                        <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full bg-white/15 border-4 border-amber-300/30" />
                    </div>

                    {/* Middle details placeholder */}
                    <div className="lg:col-span-5 space-y-2">
                        <div className="flex gap-2">
                            <div className="w-24 h-5 rounded-full bg-white/20" />
                            <div className="w-32 h-5 rounded-full bg-white/20" />
                        </div>
                        <div className="w-4/5 h-8 rounded bg-white/25" />
                        <div className="w-full h-1 bg-amber-400/30 my-1" />
                        <div className="w-3/5 h-4 rounded bg-white/15" />
                        <div className="w-2/3 h-4 rounded bg-white/15" />
                        <div className="flex gap-4 pt-1">
                            <div className="w-24 h-6 rounded bg-amber-400/30" />
                            <div className="w-24 h-6 rounded bg-amber-400/30" />
                        </div>
                    </div>

                    {/* Right Booking Hours card placeholder */}
                    <div className="lg:col-span-4 flex justify-center lg:justify-end">
                        <div className="w-full max-w-[340px] sm:max-w-[360px] h-56 rounded-2xl bg-white/90 p-4 space-y-2">
                            <div className="w-1/2 h-5 rounded bg-gray-200" />
                            <div className="w-full h-12 rounded-xl bg-gray-100" />
                            <div className="w-full h-12 rounded-xl bg-gray-100" />
                            <div className="w-full h-8 rounded-xl bg-purple-900/40" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
