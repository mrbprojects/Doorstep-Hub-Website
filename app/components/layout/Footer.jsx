'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLocationContext } from '@/context/LocationContext';

const footerLinks = {

  Quicklinks: [
    { name: 'About Us', href: '/about-us' },
    { name: 'Contact Us', href: '/contact-us' },
    { name: 'Careers', href: '/careers' },
    { name: 'Become a Service Partner', href: '/service-partner' },
    { name: 'Book Appointment', href: '/book-appointment' },
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

// Hardcoded additionalServices removed as it's now dynamic

export function Footer({ theme = {} }) {
  const router = useRouter();
  const { location } = useLocationContext();

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
        const catResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getallcategorys`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lattitude: location?.lat || '17.3850',
            longitude: location?.lng || '78.4866'
          })
        });
        const catData = await catResponse.json();

        if (catData.success && Array.isArray(catData.data)) {
          const groups = await Promise.all(catData.data.map(async (category) => {
            try {
              const subResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/getsubcategorysbycategoryid`, {
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
        const profResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/products/professional-services-catalog`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const profData = await profResponse.json();

        if (profData.success && Array.isArray(profData.data)) {
          setProfessionalServices(profData.data);
        }

        // Step 3: Fetch Global Settings
        const globalResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/get_global_settings`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const globalData = await globalResponse.json();
        if (globalData.success && globalData.policy) {
          setGlobalSettings(globalData.policy);
        }

        // Step 4: Fetch Service Slugs (only appliance ID is supported by this endpoint)
        try {
          const slugRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/get_slugs_by_serviceId/683daaa8f261c1548bdf7442`);
          const slugData = await slugRes.json();
          if (slugData.success && slugData.data?.home) {
            setServiceSlugs(prev => ({ ...prev, appliances: slugData.data.home }));
          }
        } catch (e) { /* use default slug */ }

        // Step 5: Fetch Screen Settings
        const screenSettingsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/get-website-screen-settings`);
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
  }, [location?.lat, location?.lng]);

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

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Logo + About side by side */}
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-6">
                {/* Logo - increased size */}
                <div className="relative w-36 h-20 flex-shrink-0 overflow-hidden">
                  <Image
                    src={globalSettings?.applicaionLogo ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${globalSettings.applicaionLogo}` : "/d-hub-logo.png"}
                    alt={globalSettings?.applicationName || "Doorstep Hub"}
                    fill
                    sizes="224px"
                    className="object-contain object-left cursor-pointer"
                    onClick={() => router.push('/')}
                  />
                </div>
                {/* About text */}
                <p className={`${t.textMuted} leading-relaxed max-w-sm text-sm text-justify`}>
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

          {/* Services Links */}
          {(() => {
            const chunks = [];
            for (let i = 0; i < dynamicQuickLinks.length; i += 5) {
              chunks.push(dynamicQuickLinks.slice(i, i + 5));
            }
            return chunks.map((chunk, idx) => (
              <motion.div
                key={`quick-links-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
              >
                <h4 className={`${t.textMain} font-bold mb-4 whitespace-nowrap`}>
                  {idx === 0 ? 'Quick Links' : '\u00A0'}
                </h4>
                <ul className="space-y-3">
                  {chunk.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
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
            ));
          })()}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + (Math.ceil(dynamicQuickLinks.length / 4) * 0.1) }}
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
                    href="/appliance-repair-services"
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
                  className={`w-10 h-10 rounded-full ${t.socialBg} ${t.socialBorder} border flex items-center justify-center ${t.textMuted} hover:text-white transition-all`}
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
