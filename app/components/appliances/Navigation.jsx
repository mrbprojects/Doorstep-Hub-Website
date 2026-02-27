'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, ShoppingCart, User, AlertTriangle, AlertCircle } from 'lucide-react';
import { LocationBar } from '@/components/location/LocationBar';

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartItems: productCartItems } = useCart();
  const { cartItems: serviceCartItems } = useServiceCart();
  const { user } = useAuth();

  const cartItemsCount = (productCartItems?.length || 0) + (serviceCartItems?.length || 0);
  const isProfileIncomplete = user && (!user.name || !user.mobile);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (pathname === '/') setActiveLink('Home');
    else if (pathname.includes('/appliances')) setActiveLink('Popular Services');
    else if (pathname.includes('/nearby')) setActiveLink('Nearby Service Centers');
    else if (pathname.includes('/selloldthings')) setActiveLink('Sell Old Things');
  }, [pathname]);

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Popular Services', href: '/appliances' },
    { name: 'Nearby Service Centers', href: '/nearby' },
    { name: 'Sell Old Things', href: '/selloldthings' }
  ];

  const handleNavigation = (href) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - FIXED */}
          <motion.button
            onClick={() => handleNavigation('/')}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 text-2xl font-bold cursor-pointer p-1 -m-1"
          >
            <Image
              src="/d-hub-logo.png"
              alt="Doorstep Hub Logo"
              width={140}
              height={40}
              priority
              className="object-contain h-10 w-auto"
            />
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {links.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavigation(link.href)}
                className="relative px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors group"
              >
                {link.name}
                {activeLink === link.name && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#037166] to-[#04a99d]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Location Bar */}
            <LocationBar />
            {/* Cart Button */}
            <motion.button
              onClick={() => handleNavigation('/appliances/cart')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-4 py-2.5 text-sm font-medium text-white/90 hover:text-white rounded-full border border-white/10 hover:border-[#037166]/50 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full flex items-center justify-center text-xs font-bold"
                  >
                    {cartItemsCount}
                  </motion.span>
                )}
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 text-sm font-medium text-white/90 hover:text-white rounded-full border border-white/10 hover:border-[#037166]/50 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
            >
              <Image
                src="/android1.png"
                alt="Android App"
                width={20}
                height={20}
                priority
              />
              Contact Us
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(3, 113, 102, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 text-sm font-medium text-white rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] hover:from-[#048a7e] hover:to-[#05bfb0] transition-all duration-300 shadow-lg shadow-[#037166]/20 flex items-center gap-2"
            >
              <Image
                src="/android1.png"
                alt="Android App"
                width={20}
                height={20}
                priority
              />
              Download
            </motion.button>

            {/* Profile Icon */}
            <button
              onClick={() => router.push('/profile')}
              className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors group"
              title={isProfileIncomplete ? "Complete Profile" : "Profile"}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#037166] to-[#04a99d] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>

              {isProfileIncomplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-black"
                >
                  <span className="text-black text-xs font-bold">!</span>
                </motion.div>
              )}

              {/* Hover Tooltip */}
              {isProfileIncomplete && (
                <div className="absolute top-full right-0 mt-2 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Complete Profile
                </div>
              )}
            </button>
          </div>

          {/* Mobile Menu Button & Cart */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => handleNavigation('/appliances/cart')}
              className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {cartItemsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <User className="w-5 h-5 text-white" />
              {isProfileIncomplete && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border border-black">
                  <span className="text-black text-[10px] font-bold">!</span>
                </div>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/5 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-2">
              {links.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link.href)}
                  className={`block w-full text-left px-4 py-3 rounded-lg transition-all ${activeLink === link.name
                    ? 'bg-[#037166]/20 text-[#04a99d]'
                    : 'text-white/80 hover:bg-white/5'
                    }`}
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-4 space-y-2">
                <button className="w-full px-5 py-3 text-sm font-medium text-white/90 rounded-lg border border-white/10 bg-white/5 flex items-center gap-2 justify-center">
                  <Image
                    src="/android1.png"
                    alt="Android App"
                    width={20}
                    height={20}
                    priority
                  />
                  Contact Us
                </button>
                <button className="w-full px-6 py-3 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] flex items-center gap-2 justify-center">
                  <Image
                    src="/android1.png"
                    alt="Android App"
                    width={20}
                    height={20}
                    priority
                  />
                  Sign In
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
