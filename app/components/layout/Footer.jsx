'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useLocationContext } from '@/context/LocationContext';
import { useGlobalSettings } from '@/context/GlobalSettingsContext';
import { API_BASE_URL } from '@/config/env';

const footerLinks = {

  Quicklinks: [
    { name: 'Sell & Buy Marketplace', href: '/sell-buy' },
    { name: 'Browse Categories', href: '/sell-buy/categories' },
    { name: 'Post Free Ad', href: '/sell-buy/post-ad' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Contact Us', href: '/contact-us' },
    { name: 'Careers', href: '/careers' },
    { name: 'Become a Service Partner', href: '/service-partner' },
    { name: 'Partner Dashboard', href: '/partner/dashboard' },
    { name: 'Book Appointment', href: '/book-appointment' },
    { name: 'Book AMC Services', href: '/amc' },
    { name: 'Download Android App', href: '' },
    { name: 'Download iOS App', href: '' },
    { name: 'Download Partner Android App', href: '' },
    { name: 'Download Partner iOS App', href: '' },
  ],
  Moreinfo: [
    { name: 'FAQs', href: '/faqs' },
    { name: 'Terms of Service', href: '/terms-conditions' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Refund Policy', href: '/refund-policy' },
    { name: 'My Account', href: '/account' },
    { name: 'Account Deletion', href: '/account/deletion' },
    // { name: 'Help Center', href: '/contact-us' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '', label: 'Facebook' },
  { icon: Twitter, href: '', label: 'Twitter' },
  { icon: Instagram, href: '', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '', label: 'YouTube' },
];

/** Session-level cache so Footer does not re-hit subcategory APIs on remount / location bumps */
let footerDataCache = null;
let footerDataPromise = null;

async function loadFooterCatalog(lat, lng) {
  if (footerDataCache) return footerDataCache;
  if (footerDataPromise) return footerDataPromise;

  footerDataPromise = (async () => {
    const catResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getallcategorys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lattitude: lat || '17.3850',
        longitude: lng || '78.4866',
      }),
    });
    const catData = await catResponse.json();

    let serviceGroups = [];
    if (catData.success && Array.isArray(catData.data)) {
      serviceGroups = await Promise.all(
        catData.data.map(async (category) => {
          try {
            const subResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: category.slug }),
              }
            );
            const subData = await subResponse.json();
            return {
              id: category._id,
              name: category.name,
              slug: category.slug,
              subcategories:
                subData.success && Array.isArray(subData.data) ? subData.data : [],
            };
          } catch (err) {
            console.error(`Error fetching subcategories for ${category.name}:`, err);
            return {
              id: category._id,
              name: category.name,
              slug: category.slug,
              subcategories: [],
            };
          }
        })
      );
    }

    let professionalServices = [];
    try {
      const profResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/professional-services-catalog`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      const profData = await profResponse.json();
      if (profData.success && Array.isArray(profData.data)) {
        professionalServices = profData.data;
      }
    } catch {
      /* ignore */
    }

    let appliancesSlug = 'appliances';
    try {
      const slugRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/get_slugs_by_serviceId/683daaa8f261c1548bdf7442`
      );
      const slugData = await slugRes.json();
      if (slugData.success && slugData.data?.home) {
        appliancesSlug = slugData.data.home;
      }
    } catch {
      /* use default */
    }

    let showHomeScreen = false;
    try {
      const screenSettingsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/get-website-screen-settings`
      );
      const screenSettingsData = await screenSettingsResponse.json();
      showHomeScreen = !!(screenSettingsData.success && screenSettingsData.data?.homescreen);
    } catch {
      /* ignore */
    }

    let citiesList = [];
    try {
      const citiesResponse = await fetch(
        `${API_BASE_URL}/app/cities/cities_list`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      const citiesData = await citiesResponse.json();
      if (citiesData.success && Array.isArray(citiesData.cities)) {
        citiesList = citiesData.cities;
      }
    } catch {
      /* ignore */
    }

    let sellBuyGroups = [];
    try {
      const sbResponse = await fetch(`${API_BASE_URL}/sell-buy/get-categories`);
      const sbData = await sbResponse.json();
      if (sbData.error === false && sbData.data) {
        const inner = sbData.data;
        sellBuyGroups = Array.isArray(inner.data) ? inner.data : (Array.isArray(inner) ? inner : []);
      } else if (sbData.success && Array.isArray(sbData.data)) {
        sellBuyGroups = sbData.data;
      }
    } catch (sbErr) {
      console.error('Error fetching sell-buy categories in footer:', sbErr);
    }

    footerDataCache = {
      serviceGroups,
      professionalServices,
      sellBuyGroups,
      appliancesSlug,
      showHomeScreen,
      citiesList,
    };
    return footerDataCache;
  })().finally(() => {
    footerDataPromise = null;
  });

  return footerDataPromise;
}

// Hardcoded additionalServices removed as it's now dynamic

export function Footer({ theme = {} }) {
  const router = useRouter();
  const { location } = useLocationContext();
  const { policy: globalPolicy } = useGlobalSettings() || {};
  const fetchedRef = useRef(false);

  // Default footer theme
  const defaultTheme = {
    bg: 'from-white to-[#f8fafc]',
    borderTop: 'border-slate-200/80',
    accentGlow: '#037166',
    accentColor: '#037166',
    accentHover: '#04a99d',
    accentGradientFrom: 'from-[#037166]',
    accentGradientTo: 'to-[#04a99d]',
    headingGradient: 'from-[#037166] via-[#025951] to-[#037166]',
    textMain: 'text-[#037166]',
    textMuted: 'text-[#2f6f69]',
    textSubtle: 'text-[#5f8f89]',
    textLink: 'text-[#2f6f69]',
    textLinkHover: 'hover:text-[#04a99d]',
    groupNameColor: 'text-[#037166]',
    dividerColor: 'text-[#9bc7c1]',
    socialBg: 'bg-[#eef8f6]',
    socialBorder: 'border-[#cfe8e3]',
    tooltipBg: 'bg-white border-[#cfe8e3]',
    tooltipText: 'text-[#037166]',
    iconBg: 'bg-[#eef8f6]',
    iconHoverBg: 'group-hover:bg-[#037166]/10',
    isLight: true,
  };

  const t = { ...defaultTheme, ...theme };

  const [serviceGroups, setServiceGroups] = useState([]);
  const [professionalServices, setProfessionalServices] = useState([]);
  const [sellBuyGroups, setSellBuyGroups] = useState([]);
  const [cities, setCities] = useState([]);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [serviceSlugs, setServiceSlugs] = useState({
    appliances: 'appliances',
    religious: 'religious-services',
    spa: 'spa-salon',
    pg: 'pghostels'
  });
  const [showHomeScreen, setShowHomeScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredSocial, setHoveredSocial] = useState(null);

  useEffect(() => {
    if (globalPolicy) setGlobalSettings(globalPolicy);
  }, [globalPolicy]);

  useEffect(() => {
    if (fetchedRef.current && footerDataCache) {
      const cached = footerDataCache;
      setServiceGroups(cached.serviceGroups);
      setProfessionalServices(cached.professionalServices);
      setSellBuyGroups(cached.sellBuyGroups || []);
      setCities(cached.citiesList || []);
      setServiceSlugs((prev) => ({ ...prev, appliances: cached.appliancesSlug }));
      setShowHomeScreen(cached.showHomeScreen);
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;
    fetchedRef.current = true;

    (async () => {
      try {
        const data = await loadFooterCatalog(location?.lat, location?.lng);
        if (cancelled || !data) return;
        setServiceGroups(data.serviceGroups);
        setProfessionalServices(data.professionalServices);
        setSellBuyGroups(data.sellBuyGroups || []);
        setCities(data.citiesList || []);
        setServiceSlugs((prev) => ({ ...prev, appliances: data.appliancesSlug }));
        setShowHomeScreen(data.showHomeScreen);
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Fetch once per session — footer catalog does not need to re-run on every GPS update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dynamicQuickLinks = footerLinks.Quicklinks.map(link => {
    if (link.name === 'Download Android App' && globalSettings?.customerAndroidAppLink) {
      return { ...link, href: globalSettings.customerAndroidAppLink };
    }
    if (link.name === 'Download iOS App' && globalSettings?.customerIosAppLink) {
      return { ...link, href: globalSettings.customerIosAppLink };
    }
    if (link.name === 'Download Partner Android App' && globalSettings?.partnerAndroidAppLink) {
      return { ...link, href: globalSettings.partnerAndroidAppLink };
    }
    if (link.name === 'Download Partner iOS App' && globalSettings?.partnerIosAppLink) {
      return { ...link, href: globalSettings.partnerIosAppLink };
    }
    return link;
  });

  const dynamicSocialLinks = socialLinks.map(social => {
    const socialLabel = (social.label || '').toLowerCase();
    if (socialLabel === 'facebook' && globalSettings?.facebook) return { ...social, href: globalSettings.facebook };
    if (socialLabel === 'twitter' && globalSettings?.twitter) return { ...social, href: globalSettings.twitter };
    if (socialLabel === 'instagram' && globalSettings?.instagram) return { ...social, href: globalSettings.instagram };
    if (socialLabel === 'linkedin' && globalSettings?.linkedin) return { ...social, href: globalSettings.linkedin };
    if (socialLabel === 'youtube' && globalSettings?.youtube) return { ...social, href: globalSettings.youtube };
    return social;
  });

  // Used for SUBCATEGORY item links (shows services inside the subcategory)
  const getProfessionalLink = (serviceName, sub, category) => {
    const slug = sub.slug || sub._id;
    const lowerService = serviceName.toLowerCase();

    if (lowerService.includes('spa')) {
      return `/${serviceSlugs.spa}/${slug}`;
    }
    if (lowerService.includes('pg') || lowerService.includes('hostel')) {
      return `/${serviceSlugs.pg}/${slug}`;
    }
    if (lowerService.includes('religious')) {
      return `/${serviceSlugs.religious}/${slug}`;
    }
    return '#';
  };

  // Used for CATEGORY heading links (shows subcategories to pick from)
  const getProfessionalCategoryLink = (serviceName, category) => {
    const slug = category.slug || category._id;
    const lowerService = serviceName.toLowerCase();

    if (lowerService.includes('spa')) {
      return `/${serviceSlugs.spa}/${slug}`;
    }
    if (lowerService.includes('pg') || lowerService.includes('hostel')) {
      return `/${serviceSlugs.pg}/${slug}`;
    }
    if (lowerService.includes('religious')) {
      return `/${serviceSlugs.religious}/${slug}`;
    }
    return '#';
  };

  const getProfessionalServiceHomeLink = (serviceName) => {
    const lowerService = serviceName.toLowerCase();
    if (lowerService.includes('spa')) return `/${serviceSlugs.spa}`;
    if (lowerService.includes('pg') || lowerService.includes('hostel')) return `/${serviceSlugs.pg}`;
    if (lowerService.includes('religious')) return `/${serviceSlugs.religious}`;
    return '#';
  };

  return (
    <footer className={`relative bg-gradient-to-b ${t.bg} border-t ${t.borderTop}`}>
      {/* Background Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-t pointer-events-none" style={{ background: `linear-gradient(to top, ${t.accentGlow}08, transparent)` }} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8 py-16">
        {/* Explore Services Dynamic Section */}
        {!isLoading && serviceGroups.some(group => group.subcategories.length > 0) && (
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className={`text-xl font-bold mb-6 bg-gradient-to-r ${t.headingGradient} bg-clip-text text-transparent w-fit`}>Appliance Services</h3>
              <div className="text-sm leading-8 text-gray-400">
                {serviceGroups.map((group, groupIdx) => (
                  group.subcategories.length > 0 && (
                    <span key={group.id} className="inline mr-1">
                      {/* Group Name */}
                      <Link
                        href={`/${serviceSlugs.appliances}`}
                        className={`${t.groupNameColor} font-bold ${t.textLinkHover} transition-colors whitespace-nowrap mr-2`}
                      >
                        {group.name}:
                      </Link>

                      {/* Subcategories */}
                      {group.subcategories.map((sub, idx) => (
                        <span key={sub._id} className="inline">
                          <Link
                            href={`/${sub.slug || sub._id}`}
                            className={`${t.textLink} ${t.textLinkHover} transition-colors`}
                          >
                            {sub.name}
                          </Link>
                          {/* Separator between subcategories */}
                          {idx < group.subcategories.length - 1 && (
                            <span className={`mx-2 ${t.dividerColor}`}>|</span>
                          )}
                        </span>
                      ))}

                      {/* Separator between Groups - Render unless it's the last group */}
                      {groupIdx < serviceGroups.length - 1 && (
                        <span className="mx-4 opacity-50" style={{ color: t.accentColor }}>||</span>
                      )}
                    </span>
                  )
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Dynamic Professional Services Sections - Shown based on homescreen setting */}
        {!isLoading && showHomeScreen && professionalServices.map((section, sIdx) => {
          const serviceName = section.service.name;
          const displayTitle = serviceName.includes('Spa') ? 'Spa & Salon' :
            serviceName.includes('PG') ? 'PG & Hostels' :
              serviceName;

          return (
            <div key={sIdx} className="mb-16 relative group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6 transition-all duration-500"
              >
                <Link
                  href={getProfessionalServiceHomeLink(serviceName)}
                  className={`text-xl font-bold mb-6 bg-gradient-to-r ${t.headingGradient} bg-clip-text text-transparent w-fit block ${t.textLinkHover}`}
                >
                  {displayTitle}
                </Link>
                <div className={`text-sm leading-8 ${t.textMuted}`}>
                  {section.categories.map((catGroup, groupIdx) => (
                    <span key={catGroup.category._id} className="inline mr-1">
                      <Link
                        href={getProfessionalCategoryLink(serviceName, catGroup.category)}
                        className={`${t.groupNameColor} font-bold whitespace-nowrap mr-2 ${t.textLinkHover}`}
                      >
                        {catGroup.category.name}:
                      </Link>

                      {catGroup.subcategories.map((sub, idx) => (
                        <span key={sub._id} className="inline">
                          <Link
                            href={getProfessionalLink(serviceName, sub, catGroup.category)}
                            className={`${t.textLink} ${t.textLinkHover} transition-colors`}
                          >
                            {sub.name}
                          </Link>
                          {idx < catGroup.subcategories.length - 1 && (
                            <span className={`mx-2 ${t.dividerColor}`}>|</span>
                          )}
                        </span>
                      ))}

                      {groupIdx < section.categories.length - 1 && (
                        <span className="mx-4 opacity-50" style={{ color: t.accentColor }}>||</span>
                      )}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          );
        })}

        {/* Sell & Buy Marketplace Categories & Subcategories */}
        {!isLoading && sellBuyGroups && sellBuyGroups.length > 0 && (
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <Link
                href="/sell-buy"
                className={`text-xl font-bold mb-6 bg-gradient-to-r ${t.headingGradient} bg-clip-text text-transparent w-fit block ${t.textLinkHover}`}
              >
                Sell &amp; Buy Marketplace
              </Link>
              <div className="text-sm leading-8 text-gray-400">
                {sellBuyGroups.map((group, groupIdx) => {
                  const subList = Array.isArray(group.subcategories) ? group.subcategories : (Array.isArray(group.sub_categories) ? group.sub_categories : []);
                  return (
                    <span key={group._id || group.id || group.slug} className="inline mr-1">
                      {/* Category Name */}
                      <Link
                        href={`/sell-buy/${group.slug}`}
                        className={`${t.groupNameColor} font-bold ${t.textLinkHover} transition-colors whitespace-nowrap mr-2`}
                      >
                        {group.name || group.category_name}:
                      </Link>

                      {/* Subcategories */}
                      {subList.map((sub, idx) => (
                        <span key={sub._id || sub.id || sub.slug} className="inline">
                          <Link
                            href={`/sell-buy/${group.slug}?sub=${sub.slug}`}
                            className={`${t.textLink} ${t.textLinkHover} transition-colors`}
                          >
                            {sub.name || sub.category_name}
                          </Link>
                          {idx < subList.length - 1 && (
                            <span className={`mx-2 ${t.dividerColor}`}>|</span>
                          )}
                        </span>
                      ))}

                      {/* Separator between Groups */}
                      {groupIdx < sellBuyGroups.length - 1 && (
                        <span className="mx-4 opacity-50" style={{ color: t.accentColor }}>||</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* Services in Popular Cities Dynamic SEO Link Grid */}
        {!isLoading && cities.length > 0 && (
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className={`text-xl font-bold mb-6 bg-gradient-to-r ${t.headingGradient} bg-clip-text text-transparent w-fit`}>
                Services in Popular Cities
              </h3>
              <div className="text-sm leading-8 text-gray-400">
                {cities.map((cityObj, cityIdx) => {
                  const cityName = cityObj.name || '';
                  const citySlug = (cityObj.slug || cityName).toLowerCase().replace(/\s+/g, '-');
                  if (!citySlug) return null;

                  return (
                    <span key={cityObj._id || citySlug} className="inline mr-1">
                      {/* Main City Landing Link */}
                      <Link
                        href={`/appliances-repair-service-center-${citySlug}`}
                        className={`${t.groupNameColor} font-bold ${t.textLinkHover} transition-colors whitespace-nowrap mr-2`}
                      >
                        {cityName}:
                      </Link>

                      {/* Dynamic Category x City Links for ALL Categories in Database */}
                      <span className="inline">
                        {serviceGroups.map((cat, catIdx) => {
                          let catSlugPart = (cat.slug || cat.name || '').toLowerCase().trim();
                          if (catSlugPart.endsWith('-services')) {
                            catSlugPart = catSlugPart.slice(0, -'-services'.length);
                          }
                          if (!catSlugPart) return null;

                          const catDisplayName = cat.name
                            ? (cat.name.toLowerCase().includes('repair') || cat.name.toLowerCase().includes('service')
                              ? cat.name
                              : `${cat.name} Repair`)
                            : 'Service';

                          return (
                            <span key={cat.id || cat.slug || catIdx} className="inline">
                              <Link
                                href={`/${catSlugPart}-service-center-${citySlug}`}
                                className={`${t.textLink} ${t.textLinkHover} transition-colors`}
                              >
                                {catDisplayName} in {cityName}
                              </Link>
                              {catIdx < serviceGroups.length - 1 && (
                                <span className={`mx-2 ${t.dividerColor}`}>|</span>
                              )}
                            </span>
                          );
                        })}
                      </span>

                      {/* Separator between cities */}
                      {cityIdx < cities.length - 1 && (
                        <span className="mx-4 opacity-50" style={{ color: t.accentColor }}>||</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Logo + About text stacked below */}
              <div className="flex flex-col items-start gap-3 mb-6">
                {/* Logo */}
                <div className="relative w-36 h-16 flex-shrink-0 overflow-hidden">
                  <Image
                    src={globalSettings?.applicaionLogo ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${globalSettings.applicaionLogo}` : "/d-hub-logo.png"}
                    alt={globalSettings?.applicationName || "Doorstep Hub"}
                    fill
                    sizes="224px"
                    className="object-contain object-left cursor-pointer"
                    onClick={() => router.push('/')}
                  />
                </div>
                {/* About text below logo */}
                <p className={`${t.textMuted} leading-relaxed max-w-sm text-sm`}>
                  {globalSettings?.aboutus
                    ? globalSettings.aboutus.trim().replace(/^<p>/i, '').replace(/<\/p>$/i, '').trim()
                    : "Your trusted partner for all home service needs. Connecting you with verified professionals for quick, reliable, and affordable solutions."}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">

                <a
                  href={`mailto:${globalSettings?.email}`}
                  className={`flex items-center gap-3 ${t.textMuted} ${t.textLinkHover} transition-colors group`}
                >
                  <div className={`w-8 h-8 rounded-lg ${t.iconBg} flex items-center justify-center flex-shrink-0 ${t.iconHoverBg} transition-colors`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{globalSettings?.email || "help@doorstephub.com"}</span>
                </a>

              </div>

              <div className="space-y-4">

                <a
                  href={`mailto:${globalSettings?.email2}`}
                  className={`flex items-center gap-3 ${t.textMuted} ${t.textLinkHover} transition-colors group`}
                >
                  <div className={`w-8 h-8 rounded-lg ${t.iconBg} flex items-center justify-center flex-shrink-0 ${t.iconHoverBg} transition-colors`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{globalSettings?.email2 || "help@doorstephub.com"}</span>
                </a>

              </div>
            </motion.div>
          </div>

          {/* Company Links */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-[#04a99d] transition-colors text-sm block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div> */}

          {/* Quick Links Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className={`${t.textMain} font-bold mb-4 whitespace-nowrap`}>Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: 'About Us', href: '/about-us' },
                { name: 'Contact Us', href: '/contact-us' },
                { name: 'Careers', href: '/careers' },
                { name: 'Become a Service Partner', href: '/service-partner' },
                { name: 'Partner Dashboard', href: '/partner/dashboard' },
                { name: 'Book Appointment', href: '/book-appointment' },
                { name: 'Book AMC Services', href: '/amc' },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={`${t.textMuted} ${t.textLinkHover} transition-colors text-sm block whitespace-nowrap`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* More Info Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className={`${t.textMain} font-bold mb-4 whitespace-nowrap`}>More Info</h4>
            <ul className="space-y-3">
              {footerLinks.Moreinfo.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={`${t.textMuted} ${t.textLinkHover} transition-colors text-sm block whitespace-nowrap`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              {showHomeScreen && (
                <li>
                  <a
                    href="/appliance-repair-services"
                    className={`${t.textMuted} ${t.textLinkHover} transition-colors text-sm block whitespace-nowrap`}
                  >
                    All Services
                  </a>
                </li>
              )}
            </ul>
          </motion.div>

          {/* Download Apps Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h4 className={`${t.textMain} font-bold mb-4 whitespace-nowrap`}>Download Apps</h4>
            <ul className="space-y-3">
              {dynamicQuickLinks.filter(l => l.name.startsWith('Download')).map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href || '#'}
                    target={link.href?.startsWith('http') ? "_blank" : undefined}
                    rel={link.href?.startsWith('http') ? "noopener noreferrer" : undefined}
                    className={`${t.textMuted} ${t.textLinkHover} transition-colors text-sm block whitespace-nowrap`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>


        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={`${t.textSubtle} text-sm`}
          >
            © {new Date().getFullYear()} Doorstep Hub Pvt Ltd. All rights reserved.
          </motion.p>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            {dynamicSocialLinks.map((social, index) => (

              social.href && (
                <div key={social.label} className="relative group">
                  <AnimatePresence>
                    {hoveredSocial === social.label && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 ${t.tooltipBg} border rounded-lg ${t.tooltipText} text-xs font-medium whitespace-nowrap shadow-xl flex flex-col items-center z-50 pointer-events-none`}
                      >
                        {social.label}
                        {/* Tooltip Arrow/Tail */}
                        <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 ${t.tooltipBg} border-r border-b rotate-45`} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    onMouseEnter={() => setHoveredSocial(social.label)}
                    onMouseLeave={() => setHoveredSocial(null)}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-10 h-10 rounded-full ${t.socialBg} ${t.socialBorder} border flex items-center justify-center ${t.textMuted} hover:bg-[#037166] hover:text-white hover:border-[#037166] transition-all shadow-sm hover:shadow-md`}
                    style={{ "--hover-from": t.accentColor }}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                </div>
              )
            ))}
          </motion.div>
        </div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center mt-8"
        >

        </motion.div>
      </div>

      {/* Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${t.accentColor}80, transparent)` }} />
    </footer>
  );
}
