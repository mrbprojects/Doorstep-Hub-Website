'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search,
    X,
    Filter,
    Clock,
    ChevronRight,
    Check,
    Heart,
    Phone,
    MessageCircle,
    Sparkles,
    Eye
} from 'lucide-react';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SACRED VECTOR ASSETS & ICONS
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Golden 7-Petal Sacred Lotus Flower */
function SacredLotusOrnament({ className = 'w-10 h-6' }) {
    return (
        <svg
            viewBox="0 0 40 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="lotusGold1" x1="20" y1="0" x2="20" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFF2C6" />
                    <stop offset="0.45" stopColor="#E5B242" />
                    <stop offset="1" stopColor="#8A550C" />
                </linearGradient>
            </defs>
            {/* Center tall petal */}
            <path d="M20 1C21.8 7 23 13 20 19C17 13 18.2 7 20 1Z" fill="url(#lotusGold1)" stroke="#D9A441" strokeWidth="0.7" />
            {/* Inner petals */}
            <path d="M17 4C13 8.5 12 14 18.5 19C13 16 11 11.5 17 4Z" fill="url(#lotusGold1)" stroke="#D9A441" strokeWidth="0.7" />
            <path d="M23 4C27 8.5 28 14 21.5 19C27 16 29 11.5 23 4Z" fill="url(#lotusGold1)" stroke="#D9A441" strokeWidth="0.7" />
            {/* Outer petals */}
            <path d="M14 8C8.5 12 7.5 17 17 20C10 17 7 13 14 8Z" fill="url(#lotusGold1)" stroke="#D9A441" strokeWidth="0.7" />
            <path d="M26 8C31.5 12 32.5 17 23 20C30 17 33 13 26 8Z" fill="url(#lotusGold1)" stroke="#D9A441" strokeWidth="0.7" />
            {/* Base pod */}
            <path d="M11 19.5C15 22.5 25 22.5 29 19.5C26 23.5 14 23.5 11 19.5Z" fill="#D9A441" />
            <circle cx="20" cy="21.5" r="1.3" fill="#FFEAA8" />
        </svg>
    );
}

/** Hanging Brass Diya Lamp with Chain */
function HangingDiya({ className = '', style = {} }) {
    return (
        <svg
            viewBox="0 0 36 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="hangingDiyaGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF2C6" />
                    <stop offset="50%" stopColor="#E5B242" />
                    <stop offset="100%" stopColor="#8A550C" />
                </linearGradient>
                <radialGradient id="diyaGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFEA79" stopOpacity="0.9" />
                    <stop offset="40%" stopColor="#FF9800" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#E65100" stopOpacity="0" />
                </radialGradient>
            </defs>
            {/* Top link & chain */}
            <circle cx="18" cy="4" r="3" stroke="url(#hangingDiyaGold)" strokeWidth="1.2" fill="none" />
            <line x1="18" y1="7" x2="18" y2="70" stroke="url(#hangingDiyaGold)" strokeWidth="1" strokeDasharray="3 2" />
            {/* Canopy hood */}
            <path d="M8 74 C13 70 23 70 28 74 L25 78 L11 78 Z" fill="url(#hangingDiyaGold)" />
            {/* Oil bowl */}
            <path d="M6 92 C6 104 30 104 30 92 L34 88 C34 94 30 96 26 96 L10 96 C6 96 2 94 2 88 Z" fill="url(#hangingDiyaGold)" />
            <ellipse cx="18" cy="88" rx="14" ry="4" fill="#6A3B05" stroke="url(#hangingDiyaGold)" strokeWidth="1" />
            {/* Central stem */}
            <rect x="16.5" y="78" width="3" height="10" fill="url(#hangingDiyaGold)" />
            {/* Hanging lower bell */}
            <path d="M15 103 L21 103 L23 112 L13 112 Z" fill="url(#hangingDiyaGold)" />
            <circle cx="18" cy="115" r="2" fill="url(#hangingDiyaGold)" />
            {/* Flame glow */}
            <circle cx="18" cy="81" r="9" fill="url(#diyaGlow)" />
            {/* Radiant Flame */}
            <path d="M18 73 C20 77 21 81 18 84 C15 81 16 77 18 73 Z" fill="#FFE57F" />
            <path d="M18 76 C19.2 79 19.8 81.5 18 83 C16.2 81.5 16.8 79 18 76 Z" fill="#FF6D00" />
        </svg>
    );
}

/** Majestic Temple Gopuram Silhouette for Banner Backdrop */
function TempleGopuramSilhouette({ className = '', flip = false }) {
    return (
        <svg
            viewBox="0 0 160 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{ transform: flip ? 'scaleX(-1)' : 'none' }}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="gopuramGold" x1="0" y1="0" x2="0" y2="220" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFEAA8" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#D9A441" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#D9A441" stopOpacity="0.05" />
                </linearGradient>
            </defs>
            {/* Kalasha finials at apex */}
            <path d="M80 8 L82 18 H78 L80 8 Z" fill="url(#gopuramGold)" />
            <circle cx="80" cy="6" r="2" fill="url(#gopuramGold)" />
            <circle cx="70" cy="12" r="1.5" fill="url(#gopuramGold)" />
            <circle cx="90" cy="12" r="1.5" fill="url(#gopuramGold)" />
            {/* Top Tier 1 */}
            <path d="M68 20 H92 L96 36 H64 L68 20 Z" fill="url(#gopuramGold)" />
            <rect x="76" y="24" width="8" height="8" rx="1" fill="#2C072A" fillOpacity="0.6" />
            {/* Tier 2 */}
            <path d="M58 40 H102 L108 60 H52 L58 40 Z" fill="url(#gopuramGold)" />
            <rect x="68" y="46" width="6" height="10" rx="1" fill="#2C072A" fillOpacity="0.6" />
            <rect x="86" y="46" width="6" height="10" rx="1" fill="#2C072A" fillOpacity="0.6" />
            {/* Tier 3 */}
            <path d="M48 64 H112 L120 90 H40 L48 64 Z" fill="url(#gopuramGold)" />
            <rect x="60" y="72" width="8" height="12" rx="1" fill="#2C072A" fillOpacity="0.6" />
            <rect x="76" y="72" width="8" height="12" rx="1" fill="#2C072A" fillOpacity="0.6" />
            <rect x="92" y="72" width="8" height="12" rx="1" fill="#2C072A" fillOpacity="0.6" />
            {/* Tier 4 */}
            <path d="M36 96 H124 L134 130 H26 L36 96 Z" fill="url(#gopuramGold)" />
            <rect x="52" y="106" width="10" height="16" rx="1" fill="#2C072A" fillOpacity="0.6" />
            <rect x="75" y="106" width="10" height="16" rx="1" fill="#2C072A" fillOpacity="0.6" />
            <rect x="98" y="106" width="10" height="16" rx="1" fill="#2C072A" fillOpacity="0.6" />
            {/* Base Tier 5 with Grand Gateway Arch */}
            <path d="M22 136 H138 L150 190 H10 L22 136 Z" fill="url(#gopuramGold)" />
            {/* Archway portal */}
            <path d="M64 190 V156 C64 148 72 144 80 144 C88 144 96 148 96 156 V190 Z" fill="#2C072A" fillOpacity="0.85" />
            {/* Plinth */}
            <rect x="4" y="190" width="152" height="16" rx="2" fill="url(#gopuramGold)" />
            <rect x="0" y="206" width="160" height="14" fill="url(#gopuramGold)" />
        </svg>
    );
}

/** Traditional Sacred Kalash with Coconut and Mango Leaves for Consultation Card */
function SacredKalashIllustration({ className = 'w-24 h-24' }) {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="kalashGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF2C6" />
                    <stop offset="30%" stopColor="#F5C452" />
                    <stop offset="70%" stopColor="#D9A441" />
                    <stop offset="100%" stopColor="#8A550C" />
                </linearGradient>
                <linearGradient id="leafGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7CD978" />
                    <stop offset="60%" stopColor="#2E8B29" />
                    <stop offset="100%" stopColor="#1B5E20" />
                </linearGradient>
                <radialGradient id="coconutBrown" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#A0522D" />
                    <stop offset="70%" stopColor="#5D2906" />
                    <stop offset="100%" stopColor="#3E1A04" />
                </radialGradient>
            </defs>
            {/* Aura glow */}
            <circle cx="60" cy="65" r="46" fill="#FDF3DA" />
            <circle cx="60" cy="65" r="44" stroke="#ECDAB8" strokeWidth="1" strokeDasharray="3 3" fill="none" />

            {/* Mango Leaves (5 Sacred Leaves) */}
            <path d="M60 20 C54 32 46 42 38 46 C48 40 56 32 60 20 Z" fill="url(#leafGreen)" />
            <path d="M60 20 C66 32 74 42 82 46 C72 40 64 32 60 20 Z" fill="url(#leafGreen)" />
            <path d="M60 12 C58 26 52 38 48 44 C56 38 60 26 60 12 Z" fill="url(#leafGreen)" />
            <path d="M60 12 C62 26 68 38 72 44 C64 38 60 26 60 12 Z" fill="url(#leafGreen)" />
            <path d="M60 8 C59 22 57 34 60 42 C63 34 61 22 60 8 Z" fill="url(#leafGreen)" />

            {/* Sacred Coconut (Nariyal) */}
            <ellipse cx="60" cy="38" rx="14" ry="17" fill="url(#coconutBrown)" />
            <circle cx="60" cy="27" r="1.5" fill="#FFEAA8" />
            <path d="M56 25 L60 21 L64 25" stroke="#FFEAA8" strokeWidth="1.2" strokeLinecap="round" />

            {/* Kalash Neck & Rim */}
            <ellipse cx="60" cy="50" rx="20" ry="5" fill="url(#kalashGold)" stroke="#8A550C" strokeWidth="1" />
            <path d="M44 50 L48 58 H72 L76 50 Z" fill="url(#kalashGold)" />

            {/* Kalash Pot Body */}
            <path
                d="M48 58 C34 64 32 86 44 94 C50 98 70 98 76 94 C88 86 86 64 72 58 Z"
                fill="url(#kalashGold)"
                stroke="#8A550C"
                strokeWidth="1.2"
            />

            {/* Sacred Red Mauli Thread Bands (Kankaṇa) */}
            <path d="M40 70 C48 74 72 74 80 70" stroke="#C62828" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M38 76 C46 80 74 80 82 76" stroke="#C62828" strokeWidth="2.2" strokeLinecap="round" />

            {/* Central Swastika / Auspicious Diya Emblem on Pot */}
            <circle cx="60" cy="84" r="5" fill="#C62828" />
            <circle cx="60" cy="84" r="2.5" fill="#FFEAA8" />

            {/* Base Pedestal */}
            <path d="M46 94 H74 L78 100 H42 L46 94 Z" fill="url(#kalashGold)" stroke="#8A550C" strokeWidth="0.8" />
            <ellipse cx="60" cy="100" rx="18" ry="3.5" fill="url(#kalashGold)" stroke="#8A550C" strokeWidth="0.8" />
        </svg>
    );
}

/** Symmetrical Golden Floral Filigree Divider */
function SacredOfferingsDivider() {
    return (
        <div className="flex items-center justify-center gap-3 w-full my-6 select-none" aria-hidden="true">
            {/* Left filigree wing */}
            <div className="flex items-center flex-1 max-w-sm justify-end">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D9A441]/60 to-[#D9A441]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#D9A441] ml-2" />
                <div className="w-2.5 h-2.5 rotate-45 bg-[#FFE59E] border border-[#D9A441] ml-1.5 shadow-[0_0_6px_rgba(217,164,65,0.8)]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#D9A441] ml-1.5" />
            </div>

            {/* Central Sacred Lotus */}
            <SacredLotusOrnament className="w-10 h-6 shrink-0 drop-shadow-[0_0_6px_rgba(217,164,65,0.7)]" />

            {/* Right filigree wing */}
            <div className="flex items-center flex-1 max-w-sm justify-start">
                <div className="w-1.5 h-1.5 rotate-45 bg-[#D9A441] mr-1.5" />
                <div className="w-2.5 h-2.5 rotate-45 bg-[#FFE59E] border border-[#D9A441] mr-1.5 shadow-[0_0_6px_rgba(217,164,65,0.8)]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#D9A441] mr-2" />
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#D9A441]/60 to-[#D9A441]" />
            </div>
        </div>
    );
}

/**
 * Dynamic Category Icon Resolver
 * Returns matching devotional vector icon based on category keywords
 */
function CategoryIcon({ categoryName = '', className = 'w-5 h-5' }) {
    const clean = String(categoryName || '').toLowerCase();

    // 1. All Services (4-square grid)
    if (clean.includes('all')) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                <rect x="3" y="3" width="7" height="7" rx="2" />
                <rect x="14" y="3" width="7" height="7" rx="2" />
                <rect x="3" y="14" width="7" height="7" rx="2" />
                <rect x="14" y="14" width="7" height="7" rx="2" />
            </svg>
        );
    }

    // 2. Astrology / Horoscope (Sacred Lotus / Astrological Wheel)
    if (clean.includes('astrolog') || clean.includes('horoscope') || clean.includes('kundali')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4L18.4 5.6" strokeWidth="1.2" />
                <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
            </svg>
        );
    }

    // 3. Daily Poojas (Diya / Oil Lamp)
    if (clean.includes('daily') || clean.includes('nitya') || clean.includes('pooja')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
                <path d="M5 14c0 4 3.5 6 7 6s7-2 7-6c0-1.5-3-3-7-3s-7 1.5-7 3z" />
                <path d="M12 4c2 3 2.5 5 0 7-2.5-2-2-4 0-7z" fill="currentColor" />
                <line x1="8" y1="20" x2="16" y2="20" strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    }

    // 4. Death & Rituals (Kalash / Sacred Urn)
    if (clean.includes('death') || clean.includes('apara') || clean.includes('shraddha') || clean.includes('antyesti')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
                <path d="M8 7h8v2H8z" />
                <path d="M9 9c-3 3-3 8 0 10h6c3-2 3-7 0-10H9z" />
                <path d="M12 3l2 4h-4l2-4z" fill="currentColor" />
                <line x1="7" y1="20" x2="17" y2="20" strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    }

    // 5. Dosham Remedies (Trishul / Trident)
    if (clean.includes('dosham') || clean.includes('remed') || clean.includes('nivaran') || clean.includes('rahu') || clean.includes('ketu')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
                <path d="M12 3v18" strokeWidth="2" />
                <path d="M7 6c0 4 2 6 5 6s5-2 5-6" />
                <path d="M7 6l-1-2h2l-1 2zM17 6l-1-2h2l-1 2zM12 3l-1-1h2l-1 1z" fill="currentColor" />
            </svg>
        );
    }

    // 6. Festival Poojas (Rangoli / Sacred Flower)
    if (clean.includes('festiv') || clean.includes('vrat') || clean.includes('utsav')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <path d="M12 3c-1.5 2-1.5 4 0 6 1.5-2 1.5-4 0-6z" />
                <path d="M12 15c-1.5 2-1.5 4 0 6 1.5-2 1.5-4 0-6z" />
                <path d="M3 12c2-1.5 4-1.5 6 0-2 1.5-4 1.5-6 0z" />
                <path d="M15 12c2-1.5 4-1.5 6 0-2 1.5-4 1.5-6 0z" />
            </svg>
        );
    }

    // 7. Homams / Homas (Sacred Agni Flame / Havan Kunda)
    if (clean.includes('homa') || clean.includes('havan') || clean.includes('chandi') || clean.includes('fire')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
                <path d="M4 16l3 5h10l3-5H4z" />
                <path d="M12 3c2 3 4 5 1 8 3-1 4 2 2 4-2 2-6 2-7 0 0-2 2-3 2-5-1 1-2 2-2 3-1-3 1-7 4-10z" fill="currentColor" />
            </svg>
        );
    }

    // 8. Education & Career (Grantha / Cap / Book)
    if (clean.includes('educat') || clean.includes('career') || clean.includes('saraswati') || clean.includes('vidya')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
        );
    }

    // 9. House Ceremonies (Gopuram / Sacred Home)
    if (clean.includes('house') || clean.includes('griha') || clean.includes('vastu')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
                <path d="M3 10l9-7 9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z" />
                <path d="M9 21v-6a3 3 0 016 0v6" />
                <circle cx="12" cy="7" r="1.5" fill="currentColor" />
            </svg>
        );
    }

    // 10. Marriage Ceremonies (Sacred Knot / Kalash)
    if (clean.includes('marr') || clean.includes('vivaha') || clean.includes('kalyan')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
                <circle cx="9" cy="12" r="5" />
                <circle cx="15" cy="12" r="5" />
                <path d="M12 7l1.5-2h-3L12 7z" fill="currentColor" />
            </svg>
        );
    }

    // Default Devotional Lotus
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
            <path d="M12 3c1.5 4 2 8 0 12-2-4-1.5-8 0-12z" fill="currentColor" fillOpacity="0.3" />
            <path d="M12 15c-3-2-6-1-8 2 3 1 6 0 8-2z" />
            <path d="M12 15c3-2 6-1 8 2-3 1-6 0-8-2z" />
        </svg>
    );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MASTER SACRED OFFERINGS SECTION COMPONENT
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function SacredOfferingsSection({
    packages = [],
    subcategories = [],
    selectedPackages = [],
    onTogglePackage,
    onBookNow,
    isCheckingAddons = false,
    onViewRateCard
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('all');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [favorites, setFavorites] = useState(() => new Set());
    const [showConsultationModal, setShowConsultationModal] = useState(false);

    // Toggle favorite state
    const toggleFavorite = (e, pkgId) => {
        e.stopPropagation();
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(pkgId)) next.delete(pkgId);
            else next.add(pkgId);
            return next;
        });
    };

    /**
     * Helper to match package with subcategory
     */
    const matchesCategory = (pkg, catId) => {
        if (!catId || catId === 'all') return true;
        const x = pkg.subcategoryId || pkg.subCategoryId || pkg.serviceSubCategoryId || pkg.subcategory?._id;
        if (Array.isArray(x)) return x.includes(catId);
        if (x && typeof x === 'object') return x._id === catId || x.id === catId;
        return x === catId;
    };

    /**
     * Compute Dynamic Categories List with Real Service Counts
     */
    const dynamicCategories = useMemo(() => {
        const totalCount = packages.length;
        const categoriesList = [
            {
                id: 'all',
                name: 'All Services',
                count: totalCount
            }
        ];

        // Process subcategories from provider API
        if (Array.isArray(subcategories) && subcategories.length > 0) {
            subcategories.forEach((sub, idx) => {
                const catId = sub.subcategoryId || sub._id || sub.id || `sub-${idx}`;
                const catName = sub.subcategoryName || sub.name || `Category ${idx + 1}`;
                const count = packages.filter(p => matchesCategory(p, catId)).length;
                if (count > 0) {
                    categoriesList.push({
                        id: catId,
                        name: catName,
                        count
                    });
                }
            });
        } else {
            // Derive directly from packages if subcategories list is empty
            const seen = new Map();
            packages.forEach(p => {
                const catId = p.subcategoryId || p.subCategoryId || p.categoryId || 'other';
                const catName = p.subcategoryName || p.categoryName || 'Other Services';
                seen.set(catId, { id: catId, name: catName, count: (seen.get(catId)?.count || 0) + 1 });
            });
            seen.forEach(cat => categoriesList.push(cat));
        }

        return categoriesList;
    }, [packages, subcategories]);

    /**
     * Filter Packages by Category AND Search Query
     */
    const filteredPackages = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return packages.filter(pkg => {
            // Category check
            const matchesCat = matchesCategory(pkg, selectedCategoryId);
            if (!matchesCat) return false;

            // Search query check
            if (!query) return true;
            const name = (pkg.name || '').toLowerCase();
            const desc = (pkg.description || '').toLowerCase();
            const subName = (pkg.subcategoryName || pkg.categoryName || '').toLowerCase();

            return name.includes(query) || desc.includes(query) || subName.includes(query);
        });
    }, [packages, selectedCategoryId, searchQuery]);

    // Active Category Name for display
    const activeCategoryName = useMemo(() => {
        const match = dynamicCategories.find(c => c.id === selectedCategoryId);
        return match ? match.name : 'All Services';
    }, [dynamicCategories, selectedCategoryId]);

    // Duration formatting helper
    const formatDuration = (pkg) => {
        if (pkg.duration && String(pkg.duration).trim()) {
            return String(pkg.duration).trim();
        }
        const name = (pkg.name || '').toLowerCase();
        if (name.includes('horoscope') || name.includes('kundali') || name.includes('consultation')) {
            return '30 - 60 Mins';
        }
        if (name.includes('homam') || name.includes('havan') || name.includes('chandi')) {
            return '2 - 3 Hours';
        }
        if (name.includes('shiva') || name.includes('abhishekam')) {
            return '60 - 90 Mins';
        }
        if (name.includes('antyesti') || name.includes('shraddha') || name.includes('death')) {
            return 'As per ritual';
        }
        return '60 Mins';
    };

    return (
        <section
            id="sacred-offerings"
            aria-label="Sacred Pooja and Vedic Services"
            className="relative w-full bg-[var(--off-white,#FAF7F2)] text-gray-900 pt-6 sm:pt-8 pb-16"
        >
            {/* ═════════════════════════════════════════════════════════════════════
                "OUR SACRED OFFERINGS" SECTION DIVIDER & HEADER
            ═════════════════════════════════════════════ */}
            <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
                <SacredOfferingsDivider />
                <h3 className="text-center font-serif text-2xl sm:text-3xl font-bold text-[#3B0B38] tracking-tight -mt-4 mb-1">
                    Our Sacred Offerings
                </h3>
                <p className="text-center text-xs sm:text-sm text-[#7A6455] font-medium max-w-xl mx-auto mb-2">
                    Authentic Vedic poojas, homams and rituals conducted with sacred vidhana
                </p>
            </div>

            {/* ═════════════════════════════════════════════════════════════════════
                MAIN OFFERINGS CONTENT: Left Side Menu + 4-Column Rate Cards Grid
            ═════════════════════════════════════════════ */}
            <div className="max-w-[1540px] mx-auto px-3 sm:px-6 lg:px-8">
                {/* Mobile Category Horizontal Scrollbar (Mobile Only: lg:hidden) */}
                <div className="lg:hidden flex items-center gap-2 overflow-x-auto scrollbar-hide py-1.5 px-0.5 mb-4">
                    {dynamicCategories.map(cat => {
                        const isActive = selectedCategoryId === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategoryId(cat.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 shadow-2xs ${isActive
                                    ? 'bg-gradient-to-r from-[#52104E] via-[#3B0737] to-[#52104E] text-[#FFEAA8] border border-[#D9A441] shadow-md scale-[1.02]'
                                    : 'bg-[#FFFDF9] hover:bg-[#FAF4E8] text-[#3D2517] border border-[#ECDAB8]'
                                }`}
                            >
                                <CategoryIcon categoryName={cat.name} className="w-3.5 h-3.5 shrink-0" />
                                <span>{cat.name}</span>
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${isActive ? 'bg-[#FFEAA8] text-[#3B0737]' : 'bg-[#FAF0DC] text-[#7A5021]'}`}>
                                    {cat.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col lg:flex-row items-start gap-5 lg:gap-6">
                    {/* ── LEFT SIDE MENU: Categories Sidebar (Desktop Only: lg:block) ── */}
                    <aside className="w-64 xl:w-72 shrink-0 hidden lg:block sticky top-24 space-y-4">
                        <div className="bg-[#FFFDF9] border border-[#ECDAB8] rounded-2xl shadow-sm overflow-hidden">
                            {/* Menu Header */}
                            <div className="bg-gradient-to-r from-[#4A0E46] via-[#3B0737] to-[#4A0E46] px-4 py-3 text-white flex items-center justify-between border-b border-[#D9A441]/40">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#FFEAA8]" />
                                    <h4 className="text-xs sm:text-sm font-extrabold tracking-wide uppercase text-[#FFF3D6]">
                                        Categories
                                    </h4>
                                </div>
                                <span className="text-[10px] font-bold text-[#FFEAA8] bg-white/10 px-2 py-0.5 rounded-full">
                                    {dynamicCategories.length}
                                </span>
                            </div>

                            {/* Quick Search inside Sidebar Menu */}
                            <div className="p-2.5 bg-[#FAF6EE] border-b border-[#F2E5CC]">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search offerings..."
                                        className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#ECDAB8] rounded-lg focus:outline-none focus:border-[#52104E] text-gray-800"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Category List */}
                            <div className="divide-y divide-[#F2E5CC] max-h-[500px] overflow-y-auto custom-scrollbar">
                                {dynamicCategories.map(cat => {
                                    const isActive = selectedCategoryId === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setSelectedCategoryId(cat.id)}
                                            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-all ${isActive
                                                ? 'bg-gradient-to-r from-[#FCEFD9] to-[#FFF8EE] font-bold text-[#3A0A37] border-l-4 border-[#D9A441]'
                                                : 'hover:bg-[#FAF4E8] text-[#3D2517]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isActive
                                                    ? 'bg-[#52104E] text-[#FFEAA8]'
                                                    : 'bg-[#52104E]/10 text-[#52104E]'
                                                }`}>
                                                    <CategoryIcon categoryName={cat.name} className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-semibold truncate leading-tight">
                                                    {cat.name}
                                                </span>
                                            </div>
                                            <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${isActive
                                                ? 'bg-[#52104E] text-[#FFEAA8]'
                                                : 'bg-[#FAF0DC] text-[#7A5021]'
                                            }`}>
                                                {cat.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Compact Consultation Guidance Card */}
                        <div className="bg-gradient-to-b from-[#FFFDF9] to-[#FAF3E6] border border-[#ECDAB8] rounded-2xl p-3.5 text-center shadow-xs">
                            <h5 className="font-serif text-xs sm:text-sm font-bold text-[#380B35]">
                                Need Custom Guidance?
                            </h5>
                            <p className="mt-1 text-[11px] text-[#6B5546] leading-snug">
                                Speak with our Vedic pandits for ritual recommendations.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowConsultationModal(true)}
                                className="mt-2.5 w-full py-1.5 px-3 rounded-full bg-gradient-to-r from-[#4E0E48] to-[#380833] text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all border border-[#D9A441]/40"
                            >
                                Get Consultation →
                            </button>
                        </div>
                    </aside>

                    {/* ── RIGHT COLUMN: Rate Cards Grid (4 Per Row on Desktop: lg:grid-cols-4) ── */}
                    <div className="flex-1 min-w-0">
                        {/* Active Category Status Bar */}
                        <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-[#ECDAB8]">
                            <div className="flex items-baseline gap-2 min-w-0">
                                <span className="text-sm sm:text-base font-extrabold text-[#2C0A2A] truncate">
                                    {activeCategoryName}
                                </span>
                                <span className="text-xs text-gray-500 font-medium shrink-0">
                                    ({filteredPackages.length} {filteredPackages.length === 1 ? 'offering' : 'offerings'} available)
                                </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {/* Clear Filter button if non-default */}
                                {(selectedCategoryId !== 'all' || searchQuery) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedCategoryId('all');
                                            setSearchQuery('');
                                        }}
                                        className="text-xs font-bold text-[#8A2418] hover:text-[#C62828] underline underline-offset-2 flex items-center gap-1"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Services Grid (2 Per Row on Mobile, 4 Per Row on Desktop) */}
                        {filteredPackages.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4">
                                {filteredPackages.map((pkg, idx) => {
                                    const isSelected = selectedPackages.some(p => p._id === pkg._id);
                                    const isFav = favorites.has(pkg._id);
                                    const price = Number(pkg.price) || 999;
                                    const durationText = formatDuration(pkg);

                                    // Resolve primary service image
                                    const rawImg = Array.isArray(pkg.image) && pkg.image.length > 0
                                        ? pkg.image[0]
                                        : (typeof pkg.image === 'string' ? pkg.image : null);

                                    const imageUrl = rawImg
                                        ? (rawImg.startsWith('http')
                                            ? rawImg
                                            : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${rawImg.replace(/^\//, '')}`)
                                        : 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&q=80';

                                    return (
                                        <div
                                            key={pkg._id || idx}
                                            onClick={() => onTogglePackage && onTogglePackage(pkg)}
                                            className={`group bg-[#FFFDF9] border rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer relative ${isSelected
                                                ? 'border-2 border-[#D9A441] ring-2 ring-[#D9A441]/20 shadow-md'
                                                : 'border-[#ECDAB8] hover:border-[#D9A441]'
                                                }`}
                                        >
                                            {/* Card Top: Compact Image Container */}
                                            <div className="relative w-full h-32 sm:h-38 lg:h-40 overflow-hidden bg-amber-50/50">
                                                <Image
                                                    src={imageUrl}
                                                    alt={pkg.name || 'Sacred Pooja'}
                                                    fill
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&q=80';
                                                    }}
                                                />

                                                {/* Gradient Overlay for contrast */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

                                                {/* Favorite Heart Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => toggleFavorite(e, pkg._id)}
                                                    className={`absolute top-1.5 sm:top-2 right-1.5 sm:right-2 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${isFav
                                                        ? 'bg-rose-500 text-white shadow-md scale-105'
                                                        : 'bg-black/35 hover:bg-black/55 text-white backdrop-blur-xs'
                                                        }`}
                                                    aria-label="Add to favorites"
                                                >
                                                    <Heart
                                                        className={`w-3.5 h-3.5 ${isFav ? 'fill-white stroke-white' : 'stroke-white'}`}
                                                    />
                                                </button>

                                                {/* Selected Badge */}
                                                {isSelected && (
                                                    <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 z-10 bg-[#D9A441] text-gray-950 font-bold text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                                        <Check className="w-3 h-3 stroke-[3]" />
                                                        <span>Selected</span>
                                                    </div>
                                                )}

                                                {/* Rate Card Photos Badge */}
                                                {pkg.banner_images && pkg.banner_images.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (onViewRateCard) onViewRateCard(pkg);
                                                        }}
                                                        className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 z-10 inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 rounded-md bg-black/65 hover:bg-black/85 text-white text-[8.5px] sm:text-[9.5px] font-bold backdrop-blur-xs transition-colors"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        <span>{pkg.banner_images.length} Photos</span>
                                                    </button>
                                                )}

                                                {/* Duration Pill at Bottom-Left of Image */}
                                                <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 z-10 inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-black/55 text-white text-[9px] sm:text-[10px] font-semibold backdrop-blur-xs">
                                                    <Clock className="w-3 h-3 text-[#FFEAA8]" />
                                                    <span>{durationText}</span>
                                                </div>
                                            </div>

                                            {/* Card Middle: Content */}
                                            <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-bold text-xs sm:text-[13.5px] text-[#1E110A] tracking-tight leading-snug line-clamp-1 group-hover:text-[#52104E] transition-colors" title={pkg.name}>
                                                        {pkg.name}
                                                    </h4>

                                                    <p className="mt-1 text-[10.5px] sm:text-xs text-[#6B5A4E] leading-relaxed line-clamp-2 min-h-[26px] sm:min-h-[30px]">
                                                        {pkg.description || 'Authentic Vedic ceremony performed by experienced priests according to Shastras.'}
                                                    </p>
                                                </div>

                                                {/* Card Footer: Price & Compact Book Now Button */}
                                                <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#F0E4D0] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                                                    <div className="min-w-0">
                                                        <span className="block text-[8.5px] sm:text-[9px] uppercase font-bold text-[#8C6D4F] leading-tight">
                                                            Starts at
                                                        </span>
                                                        <span className="text-xs sm:text-sm md:text-base font-extrabold text-[#2C0A2A] tracking-tight leading-none">
                                                            ₹{price.toLocaleString('en-IN')}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (onBookNow) {
                                                                onBookNow(pkg);
                                                            } else if (onTogglePackage) {
                                                                onTogglePackage(pkg);
                                                            }
                                                        }}
                                                        disabled={isCheckingAddons}
                                                        className={`w-full sm:w-auto py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all shrink-0 ${isSelected
                                                            ? 'bg-[#186832] hover:bg-[#125227] text-white shadow-emerald-900/20'
                                                            : 'bg-gradient-to-r from-[#4E0E48] via-[#350831] to-[#4E0E48] hover:from-[#65135E] hover:to-[#4A0D44] text-white shadow-[#350831]/20'
                                                            }`}
                                                    >
                                                        {isSelected ? (
                                                            <>
                                                                <Check className="w-3 h-3 stroke-[2.5]" />
                                                                <span>Selected</span>
                                                            </>
                                                        ) : (
                                                            <span>Book Now</span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* ── EMPTY STATE ── */
                            <div className="bg-[#FFFDF9] border border-[#ECDAB8] rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
                                <div className="flex justify-center mb-3">
                                    <SacredLotusOrnament className="w-16 h-10 opacity-70" />
                                </div>
                                <h4 className="font-serif text-lg sm:text-xl font-bold text-[#3B0B38]">
                                    No Matching Services Found
                                </h4>
                                <p className="mt-1.5 text-xs sm:text-sm text-[#6B5546] leading-relaxed">
                                    No services are currently available under this category.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategoryId('all');
                                        setSearchQuery('');
                                    }}
                                    className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#52104E] hover:bg-[#681864] text-white text-xs font-bold shadow-md transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reset All Filters</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════════
                MOBILE CATEGORY FILTER DRAWER / MODAL
            ═════════════════════════════════════════════ */}
            <AnimatePresence>
                {isMobileFilterOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 lg:hidden">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                        />

                        {/* Sheet Container */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-md bg-[#FFFDF9] rounded-t-3xl sm:rounded-3xl border border-[#ECDAB8] shadow-2xl max-h-[80vh] flex flex-col overflow-hidden z-10"
                        >
                            {/* Sheet Header */}
                            <div className="bg-[#440B3E] px-5 py-4 text-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-[#FFEAA8]" />
                                    <h4 className="text-sm font-bold tracking-wide uppercase text-[#FFF3D6]">
                                        Filter by Category
                                    </h4>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="p-1 rounded-full text-white/80 hover:text-white transition-colors"
                                    aria-label="Close category filter sheet"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Category List */}
                            <div className="p-3 divide-y divide-[#F2E5CC] overflow-y-auto">
                                {dynamicCategories.map(cat => {
                                    const isActive = selectedCategoryId === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCategoryId(cat.id);
                                                setIsMobileFilterOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${isActive
                                                ? 'bg-[#FCEFD9] font-bold text-[#3A0A37]'
                                                : 'hover:bg-[#FAF4E8] text-[#3D2517]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive
                                                        ? 'bg-[#52104E] text-[#FFEAA8]'
                                                        : 'bg-[#52104E]/10 text-[#52104E]'
                                                        }`}
                                                >
                                                    <CategoryIcon categoryName={cat.name} className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs sm:text-sm">{cat.name}</span>
                                            </div>
                                            <span
                                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive
                                                    ? 'bg-[#52104E] text-[#FFEAA8]'
                                                    : 'bg-[#FAF0DC] text-[#7A5021]'
                                                    }`}
                                            >
                                                {cat.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ═════════════════════════════════════════════════════════════════════
                VEDIC CONSULTATION MODAL (For "Get a Consultation" CTA)
            ═════════════════════════════════════════════ */}
            <AnimatePresence>
                {showConsultationModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowConsultationModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-sm bg-[#FFFDF9] rounded-3xl border border-[#ECDAB8] shadow-2xl p-6 text-center z-10"
                        >
                            <button
                                type="button"
                                onClick={() => setShowConsultationModal(false)}
                                className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
                                aria-label="Close consultation modal"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex justify-center mb-3">
                                <SacredKalashIllustration className="w-16 h-16" />
                            </div>

                            <h4 className="font-serif text-lg font-bold text-[#380B35]">
                                Vedic Pooja Consultation
                            </h4>
                            <p className="mt-1 text-xs text-[#6B5546] leading-relaxed">
                                Connect directly with our consecrated scholars to find the right ritual, auspicious muhurtham, and samagri list.
                            </p>

                            <div className="mt-5 space-y-2.5">
                                {/* Direct Call Option */}
                                <a
                                    href="tel:8886688666"
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#4E0E48] to-[#380833] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
                                >
                                    <Phone className="w-4 h-4 text-[#FFEAA8]" />
                                    <span>Call Support: 88866 88666</span>
                                </a>

                                {/* WhatsApp Option */}
                                <a
                                    href="https://wa.me/918886688666?text=Namaste%2C%20I%20would%20like%20guidance%20on%20choosing%20a%20Pooja%20service"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
                                >
                                    <MessageCircle className="w-4 h-4 text-white" />
                                    <span>WhatsApp Pandit Helpline</span>
                                </a>
                            </div>

                            <p className="mt-3 text-[10px] text-gray-400">
                                Operating hours: 06:00 AM – 09:00 PM (Monday – Sunday)
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
