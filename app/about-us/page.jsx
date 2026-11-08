'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
    MapPin, Phone, Mail, Facebook, Instagram, Linkedin,
    Twitter, Youtube, ExternalLink, Users, ShoppingBag, Briefcase, Star
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { API_BASE_URL } from '@/config/env';

export default function AboutUsPage() {
    const [settings, setSettings] = useState(null);       // data.policy
    const [aboutData, setAboutData] = useState(null);     // data.websiteAboutus
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/app/get_global_settings`);
                const data = await res.json();
                if (data.success) {
                    if (data.policy) setSettings(data.policy);
                    if (data.websiteAboutus) setAboutData(data.websiteAboutus);
                }
            } catch (err) {
                console.error('Error fetching global settings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const socialLinks = settings ? [
        { icon: Facebook, href: settings.facebook, label: 'Facebook', color: 'hover:text-blue-600 hover:border-blue-500/40' },
        { icon: Instagram, href: settings.instagram, label: 'Instagram', color: 'hover:text-pink-600 hover:border-pink-500/40' },
        { icon: Linkedin, href: settings.linkedin, label: 'LinkedIn', color: 'hover:text-blue-600 hover:border-blue-400/40' },
        { icon: Twitter, href: settings.twitter, label: 'Twitter / X', color: 'hover:text-sky-500 hover:border-sky-400/40' },
        { icon: Youtube, href: settings.youtube, label: 'YouTube', color: 'hover:text-red-600 hover:border-red-500/40' },
    ].filter(s => s.href) : [];

    const contactCards = settings ? [
        {
            icon: MapPin,
            title: 'Office Address',
            lines: [settings.address, settings.address2 !== settings.address ? settings.address2 : null].filter(Boolean),
            type: 'text',
        },
        {
            icon: Phone,
            title: 'Phone',
            lines: [
                { label: settings.phone, href: `tel:${settings.phone}` },
                settings.phone2 ? { label: settings.phone2, href: `tel:${settings.phone2}` } : null,
            ].filter(Boolean),
            type: 'link',
        },
        {
            icon: Mail,
            title: 'Email',
            lines: [
                { label: settings.email, href: `mailto:${settings.email}` },
                settings.email2 ? { label: settings.email2, href: `mailto:${settings.email2}` } : null,
            ].filter(Boolean),
            type: 'link',
        },
    ] : [];

    // Stats from websiteAboutus
    const stats = aboutData ? [
        { icon: Users, label: 'Verified Service Centers', value: aboutData.totalCustomers > 0 ? `${(aboutData.totalCustomers / 1000).toFixed(0)}K+` : '10 K+' },
        { icon: Briefcase, label: 'Certified Service Partners', value: aboutData.totalVendors > 0 ? `${aboutData.totalVendors.toLocaleString('en-IN')}+` : '1,000+' },
        { icon: ShoppingBag, label: 'Bookings Completed', value: aboutData.totalSales > 0 ? `${(aboutData.totalSales / 1000).toFixed(0)}K+` : '36 Lakh+' },
        { icon: Star, label: 'Cities Served', value: '10+' },
    ] : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-white text-slate-900 font-sans">
                <Header />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center space-y-4">
                        <div className="w-14 h-14 border-4 border-[#037166]/20 border-t-[#037166] rounded-full animate-spin mx-auto" />
                        <p className="text-slate-500 font-semibold text-sm">Loading About Us...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <Header />

            <div>
                {/* ── Hero ── */}
                <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-10 overflow-hidden bg-gradient-to-b from-[#f3faf8] via-white to-white">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-[#037166]/5 rounded-full blur-[150px]" />
                        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#04a99d]/5 rounded-full blur-[120px]" />
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="grid lg:grid-cols-2 gap-12 items-center"
                        >
                            {/* Left: Text */}
                            <div>
                                <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold text-[#037166] bg-[#037166]/10 border border-[#037166]/20 rounded-full tracking-wider uppercase">
                                    About Us
                                </span>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight text-slate-900">
                                    Mr. Bharath <br />
                                    <span className="text-[#037166] text-2xl sm:text-3xl font-extrabold">Founder &amp; CEO</span>
                                </h1>
                                <p className="text-slate-700 leading-relaxed text-sm sm:text-base mb-4">
                                    Doorstep Hub is led by its visionary Founder &amp; CEO, Mr. Bharath, an entrepreneur driven by innovation and service excellence. With a strong passion for building customer-centric businesses, he established Doorstep Hub in 2016 with a focus on organized, professional home services.
                                </p>
                                <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                                    Under his leadership, Doorstep Hub has grown from a local appliance repair service into a multi-city platform and is now expanding into a nationwide digital service ecosystem. His vision is to create a one-stop solution for essential home, lifestyle, and religious services across India.
                                </p>

                                {/* Stats row */}
                                {stats.length > 0 && (
                                    <div className="grid grid-cols-2 gap-4 mt-8">
                                        {stats.map((stat, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + i * 0.1 }}
                                                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-[#037166]/10 border border-[#037166]/20 flex items-center justify-center flex-shrink-0">
                                                    <stat.icon className="w-5 h-5 text-[#037166]" />
                                                </div>
                                                <div>
                                                    <div className="text-xl font-black text-slate-900">{stat.value}</div>
                                                    <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Image */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#037166]/15 to-[#04a99d]/10 rounded-3xl blur-2xl pointer-events-none" />
                                <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50 aspect-[4/3] sm:aspect-square md:aspect-[4/3] lg:aspect-square bg-slate-100">
                                    <Image
                                        src="/Bharath.png"
                                        alt="Mr. Bharath Ch - Founder & CEO"
                                        className="w-full h-full object-cover rounded-3xl object-top"
                                     width={500} height={300} />
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Rich Description (HTML from API) ── */}
                {aboutData?.description && (
                    <section className="py-16 px-4 sm:px-6 lg:px-10 border-t border-slate-100 bg-white">
                        <div className="max-w-7xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div
                                    className="about-content prose-custom max-w-none text-slate-800"
                                    dangerouslySetInnerHTML={{ __html: aboutData.description }}
                                />
                            </motion.div>
                        </div>
                    </section>
                )}

                {/* ── Contact Info ── */}
                <section className="py-16 px-4 sm:px-6 lg:px-10 border-t border-slate-100 bg-slate-50/60">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-3 py-1 mb-3 text-xs font-bold text-[#037166] bg-[#037166]/10 border border-[#037166]/20 rounded-full uppercase tracking-wider">
                                Contact Us
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Get In Touch</h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {contactCards.map((card, i) => (
                                <motion.div
                                    key={card.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#037166]/50 hover:shadow-md transition-all"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#037166]/10 border border-[#037166]/20 flex items-center justify-center mb-4">
                                        <card.icon className="w-6 h-6 text-[#037166]" />
                                    </div>
                                    <h3 className="text-slate-900 font-black text-lg mb-2">{card.title}</h3>
                                    {card.type === 'text' ? (
                                        card.lines.map((line, j) => (
                                            <p key={j} className="text-slate-600 text-sm leading-relaxed">{line}</p>
                                        ))
                                    ) : (
                                        card.lines.map((link, j) => (
                                            <a key={j} href={link.href} className="text-slate-600 text-sm hover:text-[#037166] font-medium transition-colors block mb-1">
                                                {link.label}
                                            </a>
                                        ))
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Google Map ── */}
                {settings?.map && (
                    <section className="py-16 px-4 sm:px-6 lg:px-10 border-t border-slate-100 bg-white">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-10">
                                <span className="inline-block px-3 py-1 mb-3 text-xs font-bold text-[#037166] bg-[#037166]/10 border border-[#037166]/20 rounded-full uppercase tracking-wider">
                                    Our Location
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Find Us Here</h2>
                            </div>
                            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg shadow-slate-200/50 h-80 md:h-[420px]">
                                <iframe
                                    src={settings.map}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Doorstep Hub Location"
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Social Media ── */}
                {socialLinks.length > 0 && (
                    <section className="py-16 px-4 sm:px-6 lg:px-10 border-t border-slate-100 bg-slate-50/60">
                        <div className="max-w-7xl mx-auto text-center">
                            <span className="inline-block px-3 py-1 mb-3 text-xs font-bold text-[#037166] bg-[#037166]/10 border border-[#037166]/20 rounded-full uppercase tracking-wider">
                                Follow Us
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8">Stay Connected</h2>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                {socialLinks.map((social) => (
                                    <motion.a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ y: -3, scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className={`flex items-center gap-3 px-5 py-3 rounded-xl bg-white border border-slate-200 shadow-xs text-slate-700 text-sm font-semibold transition-all ${social.color}`}
                                    >
                                        <social.icon className="w-5 h-5" />
                                        <span>{social.label}</span>
                                        <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── App Download ── */}
                {(settings?.customerAndroidAppLink || settings?.customerIosAppLink) && (
                    <section className="py-16 px-4 sm:px-6 lg:px-10 bg-white">
                        <div className="max-w-7xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] text-center overflow-hidden shadow-2xl shadow-[#037166]/25"
                            >
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-black text-white mb-3 relative z-10">
                                    Download the {settings?.applicationName || 'Doorstep Hub'} App
                                </h2>
                                <p className="text-white/90 mb-8 max-w-xl mx-auto relative z-10 text-sm sm:text-base">
                                    Book services, track your order and manage everything from your mobile. Available on Android &amp; iOS.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 font-sans">
                                    {settings?.customerAndroidAppLink && (
                                        <a
                                            href={settings.customerAndroidAppLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-900 px-6 py-2.5 rounded-xl transition-all shadow-xl hover:scale-105 border border-transparent"
                                        >
                                            <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M5.53982 3.16104C5.23982 3.48104 5.05981 4.02104 5.05981 4.70104V19.291C5.05981 19.981 5.23982 20.511 5.53982 20.841L5.61981 20.911L14.0798 12.451V12.281L5.61981 3.82104L5.53982 3.16104Z" fill="#2196F3" />
                                                <path d="M16.8898 15.261L14.0798 12.451V12.281L16.8998 9.47101L16.9798 9.53101L20.3198 11.431C21.2698 11.971 21.2698 12.761 20.3198 13.311L16.9798 15.211L16.8898 15.261Z" fill="#FFC107" />
                                                <path d="M16.9798 15.211L14.0798 12.331L5.53979 20.871C5.84979 21.201 6.36979 21.241 6.96979 20.891L16.9798 15.211Z" fill="#F44336" />
                                                <path d="M16.9798 9.53101L6.96979 3.84102C6.36979 3.50102 5.84979 3.54102 5.53979 3.87102L14.0798 12.421L16.9798 9.53101Z" fill="#4CAF50" />
                                            </svg>
                                            <div className="flex flex-col items-start leading-none">
                                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">GET IT ON</span>
                                                <span className="text-base sm:text-lg font-black text-slate-900">Google Play</span>
                                            </div>
                                        </a>
                                    )}
                                    {settings?.customerIosAppLink && (
                                        <a
                                            href={settings.customerIosAppLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-3 bg-slate-950 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl border border-white/20 transition-all shadow-xl hover:scale-105"
                                        >
                                            <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.24-1.99 1.1-3.14-1.02.04-2.26.67-3 1.54-.66.76-1.24 1.88-1.08 3 1.14.08 2.27-.58 2.98-1.4z" />
                                            </svg>
                                            <div className="flex flex-col items-start leading-none font-sans">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Download on the</span>
                                                <span className="text-base sm:text-lg font-black text-white">App Store</span>
                                            </div>
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </section>
                )}
            </div>

            <Footer />

            {/* ── Prose Styles for HTML description ── */}
            <style jsx global>{`
                .about-content h1,
                .about-content h2 {
                    font-size: 1.6rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                }
                .about-content h3 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #037166;
                    margin-top: 1.75rem;
                    margin-bottom: 0.6rem;
                }
                .about-content h4 {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-top: 1.25rem;
                    margin-bottom: 0.4rem;
                }
                .about-content p {
                    color: #334155;
                    line-height: 1.8;
                    margin-bottom: 0.95rem;
                    font-size: 0.975rem;
                }
                .about-content ul {
                    list-style: disc;
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .about-content ul li {
                    color: #334155;
                    font-size: 0.95rem;
                    padding: 0.25rem 0;
                }
                .about-content strong {
                    color: #0f172a;
                    font-weight: 700;
                }
                .about-content a {
                    color: #037166;
                    font-weight: 600;
                    text-decoration: underline;
                }
                .about-content a:hover {
                    color: #025951;
                }
            `}</style>
        </div>
    );
}
