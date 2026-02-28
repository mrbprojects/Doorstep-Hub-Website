'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
    MapPin, Phone, Mail, Facebook, Instagram, Linkedin,
    Twitter, Youtube, ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function AboutUsPage() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('https://api.doorstephub.com/v1/dhubApi/app/get_global_settings');
                const data = await res.json();
                if (data.success && data.policy) {
                    setSettings(data.policy);
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
        { icon: Facebook, href: settings.facebook, label: 'Facebook', color: 'hover:text-blue-500 hover:border-blue-500/40' },
        { icon: Instagram, href: settings.instagram, label: 'Instagram', color: 'hover:text-pink-500 hover:border-pink-500/40' },
        { icon: Linkedin, href: settings.linkedin, label: 'LinkedIn', color: 'hover:text-blue-400 hover:border-blue-400/40' },
        { icon: Twitter, href: settings.twitter, label: 'Twitter / X', color: 'hover:text-sky-400 hover:border-sky-400/40' },
        { icon: Youtube, href: settings.youtube, label: 'YouTube', color: 'hover:text-red-500 hover:border-red-500/40' },
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white">
                <Header />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-[#037166]/30 border-t-[#037166] rounded-full animate-spin mx-auto" />
                        <p className="text-gray-400">Loading About Us...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Header />

            <div>
                {/* ── Hero ── */}
                <section className="relative pt-36 pb-24 px-6 overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#037166]/12 rounded-full blur-[140px]" />
                        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#04a99d]/8 rounded-full blur-[120px]" />
                    </div>

                    <div className="max-w-5xl mx-auto text-center relative z-10">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            {/* Logo */}
                            {/* {settings?.applicaionLogo && (
                                <div className="relative w-40 h-16 mx-auto mb-8">
                                    <Image
                                        src={`https://api.doorstephub.com/${settings.applicaionLogo}`}
                                        alt={settings.applicationName || 'Doorstep Hub'}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )} */}

                            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-[#04a99d] bg-[#037166]/10 border border-[#037166]/20 rounded-full tracking-wider uppercase">
                                About {settings?.applicationName || 'Doorstep Hub'}
                            </span>

                            <h1 className="text-5xl md:text-6xl font-extrabold mb-8 leading-tight bg-gradient-to-r from-white via-white to-[#04a99d] bg-clip-text text-transparent">
                                {settings?.applicationName || 'Doorstep Hub'}
                            </h1>

                            {/* About Us text from API */}
                            <div className="max-w-3xl mx-auto">
                                <p className="text-xl text-gray-300 leading-relaxed">
                                    {settings?.aboutus}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Contact Info ── */}
                <section className="py-16 px-6 border-t border-white/5">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-[#04a99d] bg-[#037166]/10 border border-[#037166]/20 rounded-full uppercase tracking-wider">
                                Contact Us
                            </span>
                            <h2 className="text-3xl font-bold text-white">Get In Touch</h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {contactCards.map((card, i) => (
                                <motion.div
                                    key={card.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 hover:border-[#037166]/40 hover:shadow-lg hover:shadow-[#037166]/10 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#037166]/10 border border-[#037166]/20 flex items-center justify-center mb-4">
                                        <card.icon className="w-6 h-6 text-[#04a99d]" />
                                    </div>
                                    <h3 className="text-white font-bold mb-3">{card.title}</h3>
                                    {card.type === 'text' ? (
                                        card.lines.map((line, j) => (
                                            <p key={j} className="text-gray-400 text-sm leading-relaxed">{line}</p>
                                        ))
                                    ) : (
                                        card.lines.map((link, j) => (
                                            <a key={j} href={link.href} className="text-gray-400 text-sm hover:text-[#04a99d] transition-colors block mb-1">
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
                    <section className="py-16 px-6">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-10">
                                <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-[#04a99d] bg-[#037166]/10 border border-[#037166]/20 rounded-full uppercase tracking-wider">
                                    Our Location
                                </span>
                                <h2 className="text-3xl font-bold text-white">Find Us Here</h2>
                            </div>
                            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-[#037166]/10 h-80 md:h-[420px]">
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
                    <section className="py-16 px-6 border-t border-white/5">
                        <div className="max-w-4xl mx-auto text-center">
                            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-[#04a99d] bg-[#037166]/10 border border-[#037166]/20 rounded-full uppercase tracking-wider">
                                Follow Us
                            </span>
                            <h2 className="text-3xl font-bold text-white mb-10">Stay Connected</h2>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                {socialLinks.map((social) => (
                                    <motion.a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ y: -4, scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-medium transition-all ${social.color}`}
                                    >
                                        <social.icon className="w-5 h-5" />
                                        <span>{social.label}</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── App Download ── */}
                {(settings?.customerAndroidAppLink || settings?.customerIosAppLink) && (
                    <section className="py-16 px-6">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative p-10 rounded-3xl bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] text-center overflow-hidden shadow-2xl shadow-[#037166]/30"
                            >
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-white mb-3 relative z-10">
                                    Download the {settings?.applicationName} App
                                </h2>
                                <p className="text-white/80 mb-8 max-w-xl mx-auto relative z-10">
                                    Book services, track your order and manage everything from your mobile. Available on Android & iOS.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                                    {settings?.customerAndroidAppLink && (
                                        <a
                                            href={settings.customerAndroidAppLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-8 py-3.5 bg-white text-[#037166] font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg inline-flex items-center gap-2"
                                        >
                                            📱 Google Play
                                        </a>
                                    )}
                                    {settings?.customerIosAppLink && (
                                        <a
                                            href={settings.customerIosAppLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-8 py-3.5 bg-white/15 border border-white/30 text-white font-bold rounded-xl hover:bg-white/25 transition-all inline-flex items-center gap-2"
                                        >
                                            🍎 App Store
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </section>
                )}
            </div>

            <Footer />
        </div>
    );
}
