'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, User, ChevronRight, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LocationBar } from '../location/LocationBar';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '@/context/AuthContext';


import { getStoredProviderSession } from '@/lib/providerAuthApi';
import { useGlobalSettings } from '@/context/GlobalSettingsContext';

export function Header({ theme = {}, navItems = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  
  const { policy: sharedGlobalPolicy } = useGlobalSettings() || {};
  const [activeDropdown, setActiveDropdown] = useState(null);

  

  // Default theme aligned with appliance service green palette
  const defaultTheme = {
    bgScrolled: 'bg-white/95',
    bgMobile: 'bg-white/98',
    textMain: 'text-[#037166]',
    textHover: 'text-[#037166]',
    border: 'border-[#037166]/25',
    accent: 'bg-[#037166]',
    accentGradientFrom: 'from-[#037166]',
    accentGradientTo: 'to-[#02b39a]',
    buttonBg: 'bg-[#eef8f6]',
    logoTextGradient: 'from-[#037166] to-[#025951]',
    isLight: true,
  };

  const currentTheme = { ...defaultTheme, ...theme };
  const authModalTheme = {
    bgMobile: 'bg-white/80',
    textMain: 'text-[#0f172a]',
    textHover: 'text-[#037166]',
    border: 'border-[#037166]/30',
    buttonBg: 'bg-[#111111]',
    accentGradientFrom: 'from-[#037166]',
    accentGradientTo: 'to-[#04a99d]',
    accent: 'bg-[#037166]'
  };


  const [apiNavItems, setApiNavItems] = useState([]);
  const [serviceSlugs, setServiceSlugs] = useState({
    appliances: 'appliance-repair-services',
    religious: 'religious-services',
    spa: 'spa-salon',
    pg: 'pghostels'
  });
  
  const [globalSettings, setGlobalSettings] = useState(() => sharedGlobalPolicy || null);
  const [prevSharedPolicy, setPrevSharedPolicy] = useState(sharedGlobalPolicy);
  if (sharedGlobalPolicy && prevSharedPolicy !== sharedGlobalPolicy) {
    setPrevSharedPolicy(sharedGlobalPolicy);
    setGlobalSettings(sharedGlobalPolicy);
  }

  // Fetch Slugs and Services for Navigation
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Slugs — only the appliance ID is supported by this endpoint
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/get_slugs_by_serviceId/683daaa8f261c1548bdf7442`);
          const data = await res.json();
          if (data.success && data.data?.home) {
            setServiceSlugs(prev => ({ ...prev, appliances: data.data.home }));
          }
        } catch { /* use default slug */ }

        // 4. Global settings — reuse shared context when available
        if (sharedGlobalPolicy) {
          setGlobalSettings(sharedGlobalPolicy);
        } else {
          const globalSettingsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/get_global_settings`);
          const globalSettingsData = await globalSettingsResponse.json();
          if (globalSettingsData.success && globalSettingsData.policy) {
            setGlobalSettings(globalSettingsData.policy);
          }
        }

        // Fetch Navbar CMS Items
        const navResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/get-website-navbar`);
        const navData = await navResponse.json();
        if (navData.success && navData.data) {
          const visibleItems = navData.data
            .filter(item => item.isVisible)
            .sort((a, b) => a.order - b.order)
            .map(item => {
              const isJoinUs = item.label === 'Join Us' || item.url === '/service-partner';
              return {
                name: isJoinUs ? 'App Download Here' : item.label,
                href: isJoinUs ? '/app' : item.url,
                originalService: null
              };
            });

          // Exclude Sell & Buy completely from header navigation
          const filteredItems = visibleItems.filter(
            item => item.href !== '/sell-buy' && item.name !== 'Sell & Buy' && !item.name?.toLowerCase().includes('sell & buy')
          );

          // Ensure Help Center is included in navigation
          if (!filteredItems.some(item => item.href === '/help-center' || item.name?.toLowerCase() === 'help center')) {
            filteredItems.splice(2, 0, {
              name: 'Help Center',
              href: '/help-center',
              originalService: null
            });
          }

          let finalNavItems = [];
          if (filteredItems.length > 6) {
            finalNavItems = filteredItems.slice(0, 6);
            finalNavItems.push({
              name: 'More',
              dropdown: filteredItems.slice(6)
            });
          } else {
            finalNavItems = filteredItems;
          }

          setApiNavItems(finalNavItems);
        } else {
          setApiNavItems([]);
        }
      } catch (error) {
        console.error("Failed to fetch nav data:", error);
      }
    };

    if (navItems.length === 0) {
      fetchData();
    }
    // Intentionally once on mount — shared global policy is applied via separate effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleServiceClick = (item) => {
    let serviceData = null;

    if (item.originalService) {
      serviceData = {
        id: item.originalService._id,
        name: item.originalService.name,
        servicetypeName: item.originalService.servicetypeName || item.originalService.name,
        image: item.originalService.image
      };
    } else {
      // Fallback for default items
      const href = item.href;
      if (href === '/appliances' || href === `/${serviceSlugs.appliances}`) {
        serviceData = { id: '683daaa8f261c1548bdf7442', name: 'Appliance Service', servicetypeName: 'SERVICES' };
      } else if (href === '/religious-services' || href === `/${serviceSlugs.religious}`) {
        serviceData = { id: '695250aa57bb211ca094e5fd', name: 'Religious Services', servicetypeName: 'Religious Services' };
      } else if (href === '/spa-salon' || href === `/${serviceSlugs.spa}`) {
        serviceData = { id: '69524f4a57bb211ca094e5e6', name: 'Spa Saloons', servicetypeName: 'Spa Saloons' };
      } else if (href === '/pghostels' || href === `/${serviceSlugs.pg}`) {
        serviceData = { id: '69524fb157bb211ca094e5ee', name: 'PG Hostels', servicetypeName: 'PG Hostels' };
      }
    }

    if (serviceData) {
      localStorage.setItem('selectedService', JSON.stringify(serviceData));
    }
  };

  // Default Navigation (Landing Page) - Moved inside to be dynamic
  

  const isComingSoonNavItem = (item) => {
    return Boolean(item?.comingSoon);
  };

  // Header is transparent only on the landing page when not scrolled
  const isLandingPage = pathname === '/';
  const isHeaderSolid = isScrolled || !isLandingPage;

  const menuItems = useMemo(() => {
    const rawMenuItems = navItems.length > 0 ? navItems : (apiNavItems.length > 0 ? apiNavItems : []);
    const items = rawMenuItems
      .filter((item) => {
        const name = (item.name || '').toLowerCase();
        
        // Keep only Become A Partner and App Download (hide faqs, careers, help center, contact us, services links, etc. on all pages)
        const isBecomePartner =
          name.includes('become a partner') ||
          name.includes('become partner');
        const isAppDownload =
          name.includes('app download') ||
          name.includes('download app') ||
          name.includes('join us') ||
          (item.href || item.path) === '/app';

        return isBecomePartner || isAppDownload;
      })
      .map((item) => {
        const name = (item.name || '').toLowerCase();
        
        const isBecomePartner =
          name.includes('become a partner') ||
          name.includes('become partner');

        if (isBecomePartner) {
          return {
            ...item,
            name: 'Become A Partner',
            isButton: true,
            buttonVariant: 'secondary',
          };
        }
        return {
          ...item,
          name: 'Download App Now',
          isButton: true,
          buttonVariant: 'primary',
        };
      });

    // Ensure both Become A Partner and Download App Now are always present
    const hasBecomePartner = items.some(i => i.buttonVariant === 'secondary');
    const hasAppDownload = items.some(i => i.buttonVariant === 'primary');

    const result = [];
    if (hasBecomePartner) {
      result.push(items.find(i => i.buttonVariant === 'secondary'));
    } else {
      result.push({
        name: 'Become A Partner',
        href: '/service-partner',
        isButton: true,
        buttonVariant: 'secondary',
      });
    }

    if (hasAppDownload) {
      result.push(items.find(i => i.buttonVariant === 'primary'));
    } else {
      result.push({
        name: 'Download App Now',
        href: '/app',
        isButton: true,
        buttonVariant: 'primary',
      });
    }

    return result;
  }, [navItems, apiNavItems]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-item-dropdown')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  //
    pathname?.includes('/listings') ||
    Object.values(serviceSlugs).some(slug => pathname?.includes(slug));

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isHeaderSolid
          ? `${currentTheme.bgScrolled} glass-premium border-b ${currentTheme.border} shadow-lg`
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Side: Logo & Location Bar */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-3.5 flex-shrink-0">
              <Link href="/" className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center relative group flex-shrink-0"
                >
                  <div className="relative h-10 sm:h-12 lg:h-14 aspect-[1.24/1] overflow-hidden flex-shrink-0">
                    <Image
                      src={globalSettings?.applicaionLogo ? (globalSettings.applicaionLogo.startsWith('http') ? globalSettings.applicaionLogo : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com'}/${globalSettings.applicaionLogo.replace(/^\/+/, '')}`) : "/d-hub-logo.png"}
                      alt={globalSettings?.applicationName || "Doorstep Hub Logo"}
                      fill
                      sizes="(max-width: 640px) 50px, (max-width: 1024px) 60px, 72px"
                      className="object-contain object-left transition-all duration-300"
                      priority
                      unoptimized
                    />
                  </div>
                </motion.div>
              </Link>

              {/* Location Bar beside Logo */}
              <div id="location-bar" className="flex-shrink-0">
                <LocationBar theme={currentTheme} />
              </div>
            </div>

            {/* Right Side: Navigation / Buttons + Profile Icon + Mobile Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Desktop Navigation / Action Buttons */}
              <nav id="navbar-services" className="hidden lg:flex items-center space-x-3 sm:space-x-4">
                {menuItems.map((item, index) => (
                  <div key={index} className="relative nav-item-dropdown">
                    {item.dropdown ? (
                      <>
                        <motion.button
                          onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                          whileHover={{ y: -2 }}
                          className={`${currentTheme.textMain || 'text-white'} ${currentTheme.textHover ? `hover:${currentTheme.textHover}` : 'hover:text-[#04a99d]'} transition-colors relative font-medium whitespace-nowrap flex items-center gap-1`}
                        >
                          {item.name}
                          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === index ? 'rotate-90' : ''}`} />
                          <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r ${currentTheme.accentGradientFrom} ${currentTheme.accentGradientTo} ${activeDropdown === index ? 'w-full' : ''} transition-all duration-300`} />
                        </motion.button>

                        {/* Dropdown */}
                        <AnimatePresence>
                          {activeDropdown === index && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className={`absolute top-full left-0 mt-2 w-48 ${currentTheme.bgMobile} backdrop-blur-xl border ${currentTheme.border} rounded-xl shadow-2xl z-50 overflow-hidden`}
                            >
                              {item.dropdown.map((subItem, idx) => (
                                <Link key={idx} href={subItem.href} onClick={() => setActiveDropdown(null)}>
                                  <span className={`block px-4 py-3 text-sm ${currentTheme.textMain} ${currentTheme.textHover ? `hover:${currentTheme.textHover}` : 'hover:text-[#037166]'} ${currentTheme.textHover ? `hover:bg-[${currentTheme.textHover.replace('text-', '').replace('[', '').replace(']', '')}]/5` : 'hover:bg-[#037166]/5'} transition-all cursor-pointer`}>
                                    {subItem.name}
                                  </span>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : isComingSoonNavItem(item) ? (
                      <span
                        className={`${currentTheme.textMain || 'text-white'} opacity-60 relative group font-medium whitespace-nowrap cursor-not-allowed inline-flex items-center gap-1.5`}
                        title="Coming Soon"
                        aria-disabled="true"
                      >
                        {item.name}
                        <span className="rounded-full bg-slate-900/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                          Soon
                        </span>
                      </span>
                    ) : item.isButton ? (
                      <Link
                        href={item.href || (item.buttonVariant === 'secondary' ? '/partner' : '/app')}
                        onClick={() => handleServiceClick(item)}
                      >
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          className={
                            item.buttonVariant === 'secondary'
                              ? "px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 border-[#037166] text-[#037166] hover:bg-[#037166] hover:text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer bg-white/80 backdrop-blur-xs"
                              : "px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] hover:from-[#04a99d] hover:to-[#037166] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#037166]/25 hover:shadow-lg hover:shadow-[#037166]/40 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          }
                        >
                          <span>{item.name}</span>
                        </motion.button>
                      </Link>
                    ) : (
                      <Link href={item.href} onClick={() => handleServiceClick(item)}>
                        <motion.span
                          className={`${
                            item.href === pathname || (item.href === '/help-center' && pathname?.startsWith('/help-center'))
                              ? '!text-[#008C80] font-bold'
                              : (currentTheme.textMain || 'text-white')
                          } ${currentTheme.textHover ? `hover:${currentTheme.textHover}` : 'hover:text-[#04a99d]'} transition-colors relative group font-medium whitespace-nowrap cursor-pointer`}
                          whileHover={{ y: -2 }}
                        >
                          {item.name}
                          <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r ${currentTheme.accentGradientFrom} ${currentTheme.accentGradientTo} ${
                            item.href === pathname || (item.href === '/help-center' && pathname?.startsWith('/help-center'))
                              ? 'w-full'
                              : 'w-0 group-hover:w-full'
                          } transition-all duration-300`} />
                        </motion.span>
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* Profile / Auth Button */}

              {/* Cart Button */}
              {/* <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (pathname.includes('/religious-services') || pathname.includes(serviceSlugs.religious)) {
                    router.push(`/${serviceSlugs.religious}/cart`);
                  } else if (pathname.includes('/spa-salon') || pathname.includes(serviceSlugs.spa)) {
                    router.push(`/${serviceSlugs.spa}/cart`);
                  } else if (pathname.includes('/pghostels') || pathname.includes(serviceSlugs.pg)) {
                    router.push(`/${serviceSlugs.pg}/cart`);
                  } else {
                    router.push(`/${serviceSlugs.appliances}/cart`);
                  }
                }}
                className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full ${currentTheme.buttonBg} ${currentTheme.textHover ? `hover:bg-[${currentTheme.textHover.replace('text-', '').replace('[', '').replace(']', '')}]/10` : 'hover:bg-[#037166]/10'} border ${currentTheme.border} transition-all relative shadow-md hover:shadow-lg`}
              >
                <ShoppingCart className={`w-5 h-5 ${currentTheme.textHover ? currentTheme.textHover : 'text-[#037166]'}`} />
                {cartItemsCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute -top-1 -right-1 w-5 h-5 ${currentTheme.isLight ? 'bg-[#C06C84]' : 'bg-[#037166]'} text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg`}
                  >
                    {cartItemsCount}
                  </motion.span>
                )}
              </motion.button> */}

              {/* Notification Center Bell */}
              <Link
                href="/notifications"
                title="Notifications"
                aria-label="View notifications"
                className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full ${currentTheme.buttonBg} hover:bg-[#037166]/10 border ${currentTheme.border} transition-all shadow-sm hover:shadow-md text-gray-700`}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 hover:text-[#037166] transition-colors" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </Link>

              {/* Auth Button with Profile Indicator */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (pathname?.startsWith('/service-partner')) {
                    const session = getStoredProviderSession();
                    if (session?.token && session?.profile) {
                      router.push('/partner/dashboard');
                    } else {
                      window.dispatchEvent(new CustomEvent('partner:open-login'));
                    }
                    setMobileMenuOpen(false);
                    return;
                  }
                  if (pathname?.startsWith('/partner')) {
                    router.push('/partner/dashboard');
                    setMobileMenuOpen(false);
                    return;
                  }
                  if (isAuthenticated) {
                    router.push('/account');
                    setMobileMenuOpen(false);
                  } else {
                    setAuthModalOpen(true);
                  }
                }}
                className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full ${currentTheme.buttonBg} ${currentTheme.textHover ? `hover:bg-[${currentTheme.textHover.replace('text-', '').replace('[', '').replace(']', '')}]/10` : 'hover:bg-[#037166]/10'} border ${currentTheme.border} transition-all overflow-hidden shadow-md hover:shadow-lg`}
              >
                {isAuthenticated && user?.image ? (
                  <Image
                    src={user.image?.startsWith('http') ? user.image : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${user.image}`}
                    alt={user.name || 'User'}
                    unoptimized
                    className="w-full h-full object-cover rounded-full"
                   width={400} height={400} />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#037166] to-[#04a99d] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Profile Incomplete Warning Badge */}
                {isAuthenticated && (!user?.name || !user?.email) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-[#0a0a0a] shadow-lg"
                    title="Complete your profile"
                  >
                    <span className="text-white text-xs font-bold">!</span>
                  </motion.div>
                )}
              </motion.button>



              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-1.5 sm:p-2 rounded-xl ${currentTheme.buttonBg} border ${currentTheme.border} ${currentTheme.textHover ? `hover:bg-[${currentTheme.textHover.replace('text-', '').replace('[', '').replace(']', '')}]/10` : 'hover:bg-[#037166]/10'} transition-all shadow-md hover:shadow-lg`}
              >
                {mobileMenuOpen ? (
                  <X className={`w-6 h-6 ${currentTheme.textHover ? currentTheme.textHover : 'text-[#037166]'}`} />
                ) : (
                  <Menu className={`w-6 h-6 ${currentTheme.textHover ? currentTheme.textHover : 'text-[#037166]'}`} />
                )}
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
              transition={{ duration: 0.2 }}
              className={`lg:hidden ${currentTheme.bgMobile} backdrop-blur-xl border-t ${currentTheme.border} shadow-lg`}
            >
              <div className="px-4 py-6 space-y-4">
                {menuItems.map((item, index) => (
                  <div key={index}>
                    {item.dropdown ? (
                      <div className="space-y-2">
                        <div className={`block py-2 px-4 ${currentTheme.textMain} font-medium text-base opacity-70`}>{item.name}</div>
                        {item.dropdown.map((subItem, idx) => (
                          <Link
                            key={idx}
                            href={subItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <motion.span
                              className={`block py-2 px-6 ${currentTheme.textMain} ${currentTheme.textHover ? `hover:${currentTheme.textHover}` : 'hover:text-[#037166]'} ${currentTheme.textHover ? `hover:bg-[${currentTheme.textHover.replace('text-', '').replace('[', '').replace(']', '')}]/10` : 'hover:bg-[#037166]/10'} rounded-xl transition-all font-medium text-sm cursor-pointer`}
                              whileTap={{ x: 10 }}
                            >
                              {subItem.name}
                            </motion.span>
                          </Link>
                        ))}
                      </div>
                    ) : isComingSoonNavItem(item) ? (
                      // Coming soon — was Link to spa/pg
                      <span
                        className={`block py-3 px-4 ${currentTheme.textMain} opacity-60 rounded-xl font-medium text-base cursor-not-allowed flex items-center justify-between`}
                        title="Coming Soon"
                        aria-disabled="true"
                      >
                        {item.name}
                        <span className="rounded-full bg-slate-900/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                          Soon
                        </span>
                      </span>
                    ) : item.isButton ? (
                      <Link
                        href={item.href || (item.buttonVariant === 'secondary' ? '/partner' : '/app')}
                        onClick={() => {
                          handleServiceClick(item);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <div
                          className={
                            item.buttonVariant === 'secondary'
                              ? "w-full text-center py-2.5 px-4 rounded-xl border-2 border-[#037166] text-[#037166] font-bold text-sm bg-[#037166]/5"
                              : "w-full text-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold text-sm shadow-md"
                          }
                        >
                          {item.name}
                        </div>
                      </Link>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => {
                          handleServiceClick(item);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <motion.span
                          className={`block py-3 px-4 ${
                            item.href === pathname || (item.href === '/help-center' && pathname?.startsWith('/help-center'))
                              ? 'bg-[#008C80]/15 !text-[#008C80] font-bold'
                              : currentTheme.textMain
                          } ${currentTheme.textHover ? `hover:${currentTheme.textHover}` : 'hover:text-[#037166]'} rounded-xl transition-all font-medium text-base cursor-pointer`}
                          whileTap={{ x: 10 }}
                        >
                          {item.name}
                        </motion.span>
                      </Link>
                    )}
                  </div>
                ))}

                {isAuthenticated && (
                  <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                    <motion.span
                      className={`block py-3 px-4 ${currentTheme.textMain} ${currentTheme.textHover ? `hover:${currentTheme.textHover}` : 'hover:text-[#037166]'} ${currentTheme.textHover ? `hover:bg-[${currentTheme.textHover.replace('text-', '').replace('[', '').replace(']', '')}]/10` : 'hover:bg-[#037166]/10'} rounded-xl transition-all font-semibold text-base cursor-pointer border border-[#037166]/20`}
                      whileTap={{ x: 10 }}
                    >
                      My Account
                    </motion.span>
                  </Link>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {!pathname?.startsWith('/service-partner') && !pathname?.startsWith('/partner') && (
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} theme={authModalTheme} />
      )}
    </>
  );
}

