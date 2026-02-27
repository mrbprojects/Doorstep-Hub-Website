'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, User, Sparkles } from 'lucide-react';
import { LocationBar } from '@/components/location/LocationBar';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';

const navLinks = [
    { label: 'Home', path: '/religious-services' },
    { label: 'Pujas & Rituals', path: '/religious-services' },
    { label: 'Pandit Booking', path: '/religious-services' },
];

const moreItems = [
    { label: 'Temple Services', path: '/religious-services' },
    { label: 'Astrology', path: '/religious-services' },
    { label: 'Vastu Consultation', path: '/religious-services' },
];

export function ReligiousNavbar() {
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
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${isScrolled
                ? 'border-border/40 bg-white/95 backdrop-blur shadow-sm'
                : 'border-transparent bg-white/95'
                }`}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo Section */}
                <div className="flex items-center space-x-6">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--saffron)] to-[var(--divine-maroon)] shadow-lg group-hover:shadow-[var(--saffron)]/30 transition-all">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-semibold bg-gradient-to-r from-[var(--divine-maroon)] to-[var(--saffron)] bg-clip-text text-transparent">
                            Divine Services
                        </span>
                    </Link>

                    {/* Location Bar (Hidden on small screens) */}
                    <div className="hidden lg:block">
                        <LocationBar theme="light" />
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    {navLinks.map((link, i) => (
                        <Link
                            key={i}
                            href={link.path}
                            className="text-sm font-medium transition-colors hover:text-[var(--saffron)] text-[var(--deep-charcoal)]"
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* More Dropdown */}
                    <div className="relative">
                        <button
                            onMouseEnter={() => setShowMoreDropdown(true)}
                            onMouseLeave={() => setShowMoreDropdown(false)}
                            className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-[var(--saffron)] text-[var(--deep-charcoal)]"
                        >
                            <span>More</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                            {showMoreDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    onMouseEnter={() => setShowMoreDropdown(true)}
                                    onMouseLeave={() => setShowMoreDropdown(false)}
                                    className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-border/40 overflow-hidden"
                                >
                                    {moreItems.map((item, i) => (
                                        <Link
                                            key={i}
                                            href={item.path}
                                            className="block px-4 py-3 text-sm text-[var(--deep-charcoal)] hover:bg-[var(--saffron)]/5 hover:text-[var(--saffron)] transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-4">
                    {/* "Book Now" Button (As requested) */}
                    <Button
                        onClick={() => router.push('/religious-services')}
                        className="hidden sm:flex bg-gradient-to-r from-[var(--divine-maroon)] to-[var(--temple-red)] text-white hover:opacity-90 transition-opacity rounded-full px-6"
                    >
                        Book Now
                    </Button>

                    {/* Profile Button */}
                    <button
                        onClick={() => setAuthModalOpen(true)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 hover:bg-[var(--saffron)]/10 text-gray-600 hover:text-[var(--saffron)] transition-all border border-gray-200 hover:border-[var(--saffron)]/30"
                    >
                        {isAuthenticated && user?.image ? (
                            <img
                                src={user.image?.startsWith('http') ? user.image : `https://api.doorstephub.com/${user.image}`}
                                alt={user.name}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <User className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} theme="light" />
        </motion.header>
    );
}
