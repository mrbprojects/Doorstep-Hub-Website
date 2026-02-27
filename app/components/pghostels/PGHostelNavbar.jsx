'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, User } from 'lucide-react';
import { LocationBar } from '@/components/location/LocationBar';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

const navLinks = [
    { label: 'Home', path: '/pghostels' },
    { label: 'All Listings', path: '/pghostels/listings/all' },
    { label: 'Co-living', path: '/pghostels/listings/coliving' },
    { label: 'Student PGs', path: '/pghostels/listings/student' },
];

const moreItems = [
    { label: 'Women\'s Hostels', path: '/pghostels/listings/women' },
    { label: 'Men\'s Hostels', path: '/pghostels/listings/men' },
    { label: 'Dormitory', path: '/pghostels/listings/dorm' },
    { label: 'Premium Stays', path: '/pghostels/listings/premium' },
];

export function PGHostelNavbar() {
    const [showMoreDropdown, setShowMoreDropdown] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/80 backdrop-blur-xl shadow-sm'
                : 'bg-white'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Location */}
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#037166] to-[#0B0F14] flex items-center justify-center">
                                <span className="text-white font-bold text-xl">PG</span>
                            </div>
                            <span className="hidden sm:block text-lg font-bold text-gray-900">PG & Hostels</span>
                        </Link>

                        {/* Location Bar */}
                        <div className="hidden sm:block">
                            <LocationBar theme="light" />
                        </div>
                    </div>

                    {/* Center Nav Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                href={link.path}
                                className="relative text-sm font-medium text-gray-700 hover:text-[#037166] transition-colors group"
                            >
                                {link.label}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#037166] group-hover:w-full transition-all duration-300" />
                            </Link>
                        ))}

                        <div className="relative">
                            <button
                                onMouseEnter={() => setShowMoreDropdown(true)}
                                onMouseLeave={() => setShowMoreDropdown(false)}
                                className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-[#037166] transition-colors"
                            >
                                <span>More</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                                {showMoreDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        onMouseEnter={() => setShowMoreDropdown(true)}
                                        onMouseLeave={() => setShowMoreDropdown(false)}
                                        className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                                    >
                                        {moreItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                href={item.path}
                                                className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#037166]/5 hover:text-[#037166] transition-colors"
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Side - Profile */}
                    <div className="flex items-center space-x-3">
                        {/* Auth Button */}
                        <button
                            onClick={() => setAuthModalOpen(true)}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-[#037166]/10 hover:text-[#037166] transition-all overflow-hidden border border-transparent hover:border-[#037166]/20"
                        >
                            {isAuthenticated && user?.image ? (
                                <img
                                    src={user.image?.startsWith('http') ? user.image : `https://api.doorstephub.com/${user.image}`}
                                    alt={user.name}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <User className="w-5 h-5 text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} theme="light" />
        </motion.nav>
    );
}
