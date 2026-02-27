'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const footerLinks = {

  Quicklinks: [
    { name: 'About Us', href: '#' },
    { name: 'Careers', href: '/careers' },
    // { name: 'Press Kit', href: '#' },
    // { name: 'Contact', href: '#' },
    { name: 'Become a Service Partner', href: '/partner' },

    { name: 'Download Android App', href: 'https://play.google.com/store/apps/details?id=com.doorstephub.partner' },

    { name: 'Download Ios App', href: 'https://apps.apple.com/in/app/doorstep-hub/id6448539336' },
  ],
  Moreinfo: [
    { name: 'FAQs', href: '/faqs' },
    { name: 'Terms of Service', href: '/terms-conditions' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Help Center', href: '#' },
    // { name: 'All Services', href: '/services' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/DoorstepHub/', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com/doorstephub', label: 'Twitter' },
  { icon: Instagram, href: 'https://www.instagram.com/doorstephub_india/', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://www.youtube.com/channel/UCTn8lV-nEbdWdwXolLAsMZA', label: 'YouTube' },
];

// Hardcoded additionalServices removed as it's now dynamic

export function Footer({ theme = {} }) {
  const router = useRouter();

  // Default dark theme (landing page)
  const defaultTheme = {
    bg: 'from-[#0a0a0a] to-black',
    borderTop: 'border-white/5',
    accentGlow: '#037166',
    accentColor: '#037166',
    accentHover: '#04a99d',
    accentGradientFrom: 'from-[#037166]',
    accentGradientTo: 'to-[#04a99d]',
    headingGradient: 'from-[#037166] via-white to-[#037166]',
    textMain: 'text-white',
    textMuted: 'text-white/60',
    textSubtle: 'text-white/40',
    textLink: 'text-white/70',
    textLinkHover: 'hover:text-[#04a99d]',
    groupNameColor: 'text-white',
    dividerColor: 'text-white/20',
    socialBg: 'bg-white/5',
    socialBorder: 'border-white/10',
    tooltipBg: 'bg-[#1a1a1a] border-[#037166]/50',
    tooltipText: 'text-white',
    iconBg: 'bg-white/5',
    iconHoverBg: 'group-hover:bg-[#037166]/20',
    isLight: false,
  };

  const t = { ...defaultTheme, ...theme };

  const [serviceGroups, setServiceGroups] = useState([]);
  const [professionalServices, setProfessionalServices] = useState([]);
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
    const fetchFooterData = async () => {
      try {
        // Step 1: Fetch Appliance Categories
        const catResponse = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/getallcategorys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lattitude: '17.3850', longitude: '78.4866' })
        });
        const catData = await catResponse.json();

        if (catData.success && Array.isArray(catData.data)) {
          const groups = await Promise.all(catData.data.map(async (category) => {
            try {
              const subResponse = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/getsubcategorysbycategoryid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: category.slug })
              });
              const subData = await subResponse.json();
              return {
                id: category._id,
                name: category.name,
                slug: category.slug, // Added slug
                subcategories: subData.success && Array.isArray(subData.data) ? subData.data : []
              };
            } catch (err) {
              console.error(`Error fetching subcategories for ${category.name}:`, err);
              return { id: category._id, name: category.name, slug: category.slug, subcategories: [] };
            }
          }));
          setServiceGroups(groups);
        }

        // Step 2: Fetch Professional Services Catalog
        const profResponse = await fetch('https://api.doorstephub.com/v1/dhubApi/app/products/professional-services-catalog', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const profData = await profResponse.json();

        if (profData.success && Array.isArray(profData.data)) {
          setProfessionalServices(profData.data);
        }

        // Step 3: Fetch Global Settings
        const globalResponse = await fetch('https://api.doorstephub.com/v1/dhubApi/app/get_global_settings', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const globalData = await globalResponse.json();
        if (globalData.success && globalData.policy) {
          setGlobalSettings(globalData.policy);
        }

        // Step 4: Fetch Service Slugs
        const servicesToFetchSlugs = [
          { id: '683daaa8f261c1548bdf7442', key: 'appliances' },
          { id: '695250aa57bb211ca094e5fd', key: 'religious' },
          { id: '69524f4a57bb211ca094e5e6', key: 'spa' },
          { id: '69524fb157bb211ca094e5ee', key: 'pg' }
        ];

        const slugResults = await Promise.all(
          servicesToFetchSlugs.map(s =>
            fetch(`https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/get_slugs_by_serviceId/${s.id}`)
              .then(res => res.json())
              .then(data => data.success && data.data?.home ? { [s.key]: data.data.home } : null)
              .catch(() => null)
          )
        );

        const newSlugs = { ...serviceSlugs };
        slugResults.forEach(res => {
          if (res) Object.assign(newSlugs, res);
        });
        setServiceSlugs(newSlugs);

        // Step 5: Fetch Screen Settings
        const screenSettingsResponse = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/get-website-screen-settings');
        const screenSettingsData = await screenSettingsResponse.json();
        const isHomeEnabled = screenSettingsData.success && screenSettingsData.data?.homescreen;
        setShowHomeScreen(isHomeEnabled);

      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  const dynamicQuickLinks = [
    ...footerLinks.Quicklinks.map(link => {
      if (link.name === 'Download Android App' && globalSettings?.customerAndroidAppLink) {
        return { ...link, href: globalSettings.customerAndroidAppLink };
      }
      if (link.name === 'Download Ios App' && globalSettings?.customerIosAppLink) {
        return { ...link, href: globalSettings.customerIosAppLink };
      }
      return link;
    })
  ];

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
    const encodedSubName = encodeURIComponent(sub.name);
    const encodedCatName = category ? encodeURIComponent(category.name) : '';

    const lowerService = serviceName.toLowerCase();

    if (lowerService.includes('spa')) {
      // Route to subcategory page (shows the services inside that subcategory)
      return `/${serviceSlugs.spa}/subcategory/${sub._id}?name=${encodedSubName}&category=${encodedCatName}`;
    }
    if (lowerService.includes('pg') || lowerService.includes('hostel')) {
      return `/${serviceSlugs.pg}/listings/all`;
    }
    if (lowerService.includes('religious')) {
      return `/${serviceSlugs.religious}/subcategory/${sub._id}?name=${encodedSubName}&category=${encodedCatName}`;
    }
    return '#';
  };

  // Used for CATEGORY heading links (shows subcategories to pick from)
  const getProfessionalCategoryLink = (serviceName, category) => {
    const encodedCatName = category ? encodeURIComponent(category.name) : '';
    const catId = category?._id || '';
    const lowerService = serviceName.toLowerCase();

    if (lowerService.includes('spa')) {
      return `/${serviceSlugs.spa}/category/${catId}?name=${encodedCatName}`;
    }
    if (lowerService.includes('pg') || lowerService.includes('hostel')) {
      return `/${serviceSlugs.pg}/listings/all`;
    }
    if (lowerService.includes('religious')) {
      return `/${serviceSlugs.religious}`;
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
                            href={`/services/listing/${sub._id}?category=${encodeURIComponent(group.name)}&name=${encodeURIComponent(sub.name)}`}
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
            <div key={sIdx} className="mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h3 className={`text-xl font-bold mb-6 bg-gradient-to-r ${t.headingGradient} bg-clip-text text-transparent w-fit`}>
                  <Link href={getProfessionalServiceHomeLink(serviceName)} className="hover:opacity-80 transition-opacity">
                    {displayTitle}
                  </Link>
                </h3>
                <div className={`text-sm leading-8 ${t.textMuted}`}>
                  {section.categories.map((catGroup, groupIdx) => (
                    <span key={catGroup.category._id} className="inline mr-1">
                      <Link
                        href={getProfessionalCategoryLink(serviceName, catGroup.category)}
                        className={`${t.groupNameColor} font-bold whitespace-nowrap mr-2 hover:opacity-80 transition-opacity`}
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

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative w-48 h-14 overflow-hidden mb-6">
                <Image
                  src={globalSettings?.applicaionLogo ? `https://api.doorstephub.com/${globalSettings.applicaionLogo}` : "/d-hub-logo.png"}
                  alt={globalSettings?.applicationName || "Doorstep Hub"}
                  fill
                  sizes="192px"
                  className="object-contain object-left cursor-pointer"
                  onClick={() => router.push('/')}
                />
              </div>
              <p className={`${t.textMuted} mb-6 leading-relaxed max-w-sm`}>
                {globalSettings?.aboutus || "Your trusted partner for all home service needs. Connecting you with verified professionals for quick, reliable, and affordable solutions."}
              </p>

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

          {/* Services Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className={`${t.textMain} font-bold mb-4`}>Quick Links</h4>
            <ul className="space-y-3">
              {dynamicQuickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target={link.href?.startsWith('http') ? "_blank" : undefined}
                    rel={link.href?.startsWith('http') ? "noopener noreferrer" : undefined}
                    className={`${t.textMuted} ${t.textLinkHover} transition-colors text-sm block`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className={`${t.textMain} font-bold mb-4`}>More Info</h4>
            <ul className="space-y-3">
              {footerLinks.Moreinfo.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={`${t.textMuted} ${t.textLinkHover} transition-colors text-sm block`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              {showHomeScreen && (
                <li>
                  <a
                    href="/services"
                    className={`${t.textMuted} ${t.textLinkHover} transition-colors text-sm block`}
                  >
                    All Services
                  </a>
                </li>
              )}
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
                  className={`w-10 h-10 rounded-full ${t.socialBg} ${t.socialBorder} border flex items-center justify-center ${t.textMuted} hover:text-white transition-all`}
                  style={{ "--hover-from": t.accentColor }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              </div>
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
