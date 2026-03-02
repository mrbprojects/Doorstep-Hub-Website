'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    MapPin, Phone, Mail, Facebook, Instagram, Linkedin,
    Twitter, Youtube, ExternalLink, Send, CheckCircle, Loader2,
    MessageSquare, Clock, Headphones
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { toast } from 'sonner';

export default function ContactUsPage() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '', email: '', whatsapp: '', iam: '', message: '', whatsappOtp: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpValues, setOtpValues] = useState(['', '', '', '']);

    const handleOtpChange = (index, value) => {
        const val = value.replace(/[^0-9]/g, '');
        const newOtp = [...otpValues];
        newOtp[index] = val.slice(-1);
        setOtpValues(newOtp);
        setFormData(prev => ({ ...prev, whatsappOtp: newOtp.join('') }));

        if (val && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const triggerSendOtp = async (phone) => {
        if (!phone || phone.length < 10) return;

        setSendingOtp(true);
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/website-leads/send-otps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsapp: phone })
            });

            const data = await response.json();
            if (data.success) {
                setIsOtpSent(true);
                toast.success('OTP sent to your WhatsApp number');
            } else {
                toast.error(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleWhatsappChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
        setFormData(prev => ({ ...prev, whatsapp: val }));

        if (val.length === 10 && !isOtpSent) {
            triggerSendOtp(val);
        }
    };

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
            bg: 'from-[#037166]/10 to-transparent',
        },
        {
            icon: Phone,
            title: 'Phone',
            lines: [
                { label: settings.phone, href: `tel:${settings.phone}` },
                settings.phone2 ? { label: settings.phone2, href: `tel:${settings.phone2}` } : null,
            ].filter(Boolean),
            type: 'link',
            bg: 'from-blue-500/10 to-transparent',
        },
        {
            icon: Mail,
            title: 'Email',
            lines: [
                { label: settings.email, href: `mailto:${settings.email}` },
                settings.email2 ? { label: settings.email2, href: `mailto:${settings.email2}` } : null,
            ].filter(Boolean),
            type: 'link',
            bg: 'from-purple-500/10 to-transparent',
        },
    ] : [];

    const handleSendOtp = async () => {
        if (!formData.whatsapp || formData.whatsapp.length < 10) {
            toast.error('Please enter a valid 10-digit WhatsApp number');
            return;
        }

        setSendingOtp(true);
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/website-leads/send-otps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsapp: formData.whatsapp })
            });

            const data = await response.json();
            if (data.success) {
                setIsOtpSent(true);
                toast.success('OTP sent to your WhatsApp number');
            } else {
                toast.error(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isOtpSent) {
            if (formData.whatsapp.length === 10) {
                triggerSendOtp(formData.whatsapp);
            } else {
                toast.error('Please enter a valid 10-digit WhatsApp number');
            }
            return;
        }

        if (!formData.whatsappOtp || formData.whatsappOtp.length < 4) {
            toast.error('Please enter the 4-digit OTP');
            return;
        }

        if (!formData.name || !formData.email || !formData.message || !formData.iam) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/website-leads/verify-and-submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                setSubmitted(true);
                setFormData({ name: '', email: '', whatsapp: '', iam: '', message: '', whatsappOtp: '' });
                setOtpValues(['', '', '', '']);
                setIsOtpSent(false);
                toast.success('Message verified and sent successfully!');
            } else {
                toast.error(data.message || 'Verification failed. Please check your OTP.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = 'w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#037166]/50 focus:border-[#037166]/50 transition-all';

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white">
                <Header />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-[#037166]/30 border-t-[#037166] rounded-full animate-spin mx-auto" />
                        <p className="text-gray-400">Loading Contact Info...</p>
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
                            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-[#04a99d] bg-[#037166]/10 border border-[#037166]/20 rounded-full tracking-wider uppercase">
                                Contact Us
                            </span>

                            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-white to-[#04a99d] bg-clip-text text-transparent">
                                Get In Touch
                            </h1>

                            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                                Have a question, feedback, or need support? We're here to help. Reach out through any of the channels below and we'll get back to you promptly.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ── Contact Cards ── */}
                <section className="py-16 px-6 border-t border-white/5">
                    <div className="max-w-6xl mx-auto">
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

                {/* ── Contact Form + Support Info ── */}
                <section className="py-16 px-6 border-t border-white/5">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-5 gap-10 items-start">

                            {/* Left: Support Info */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                className="lg:col-span-2 space-y-6"
                            >
                                <div>
                                    <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-[#04a99d] bg-[#037166]/10 border border-[#037166]/20 rounded-full uppercase tracking-wider">
                                        Support
                                    </span>
                                    <h2 className="text-3xl font-bold text-white mb-3">We're Here to Help</h2>
                                    <p className="text-gray-400 leading-relaxed">
                                        Our team is available to assist you with any questions or concerns. Fill out the form and we'll respond as quickly as possible.
                                    </p>
                                </div>

                                {[
                                    {
                                        icon: Clock,
                                        title: 'Business Hours',
                                        desc: 'Mon – Sat: 9:00 AM – 7:00 PM\nSun: 10:00 AM – 5:00 PM'
                                    },
                                    {
                                        icon: Headphones,
                                        title: 'Customer Support',
                                        desc: 'For urgent queries call or WhatsApp us directly at our support number.'
                                    },
                                    {
                                        icon: MessageSquare,
                                        title: 'Response Time',
                                        desc: 'We aim to respond to emails within 24 hours on business days.'
                                    },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        className="flex items-start gap-4 p-4 rounded-xl bg-white/3 border border-white/8"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-[#037166]/10 border border-[#037166]/20 flex items-center justify-center flex-shrink-0">
                                            <item.icon className="w-5 h-5 text-[#04a99d]" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Right: Contact Form */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="lg:col-span-3"
                            >
                                <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10">
                                    {submitted ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center justify-center py-12 text-center"
                                        >
                                            <div className="w-20 h-20 rounded-full bg-[#037166]/20 border border-[#037166]/30 flex items-center justify-center mb-6">
                                                <CheckCircle className="w-10 h-10 text-[#04a99d]" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                                            <p className="text-gray-400 max-w-sm">Thank you for reaching out. We'll get back to you within 24 hours on business days.</p>
                                            <button
                                                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                                                className="mt-8 px-6 py-3 bg-[#037166] hover:bg-[#04a99d] text-white font-bold rounded-xl transition-all"
                                            >
                                                Send Another Message
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <h3 className="text-xl font-bold text-white mb-6">Send Us a Message</h3>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Full Name *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Your Name"
                                                        className={inputCls}
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Email Address *</label>
                                                    <input
                                                        type="email"
                                                        placeholder="Enter Your Valid Email"
                                                        className={inputCls}
                                                        value={formData.email}
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <div className="flex justify-between items-center mb-1.5 ">
                                                        <label className="block text-xs font-bold text-gray-400  uppercase tracking-wide">Valid WhatsApp Number *</label>
                                                        {isOtpSent && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIsOtpSent(false);
                                                                    setOtpValues(['', '', '', '']);
                                                                    setFormData(prev => ({ ...prev, whatsappOtp: '' }));
                                                                }}
                                                                className="text-[#04a99d] text-[10px] uppercase font-bold hover:underline"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        placeholder="8886688666"
                                                        disabled={isOtpSent || sendingOtp}
                                                        className={`${inputCls} ${isOtpSent ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        value={formData.whatsapp}
                                                        onChange={handleWhatsappChange}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">I Am A *</label>
                                                    <select
                                                        className={`${inputCls} appearance-none cursor-pointer`}
                                                        value={formData.iam}
                                                        onChange={e => setFormData({ ...formData, iam: e.target.value })}
                                                        required
                                                    >
                                                        <option value="" className="bg-[#1a1a1a]">Select Here</option>
                                                        <option value="Customer" className="bg-[#1a1a1a]">Customer</option>
                                                        <option value="Business Owner" className="bg-[#1a1a1a]">Business Owner</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {isOtpSent && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden space-y-3 mt-4"
                                                    >
                                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Verification OTP *</label>
                                                        <div className="flex gap-3 max-w-[280px]">
                                                            {otpValues.map((digit, idx) => (
                                                                <input
                                                                    key={idx}
                                                                    id={`otp-${idx}`}
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    autoComplete="one-time-code"
                                                                    maxLength={1}
                                                                    className={`${inputCls} !w-12 !h-12 text-center text-xl font-bold !p-0 focus:ring-[#04a99d]/50 bg-white/10`}
                                                                    value={digit}
                                                                    onChange={e => handleOtpChange(idx, e.target.value)}
                                                                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                                                                    required
                                                                />
                                                            ))}
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 px-1 italic">Please enter the 4-digit code sent to your WhatsApp.</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Message *</label>
                                                <textarea
                                                    placeholder="Write your message here..."
                                                    rows={4}
                                                    className={`${inputCls} resize-none`}
                                                    value={formData.message}
                                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={submitting || sendingOtp}
                                                className="w-full py-4 bg-gradient-to-r from-[#037166] to-[#04a99d] hover:from-[#04a99d] hover:to-[#037166] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#037166]/20 flex items-center justify-center gap-2 active:scale-[0.98] uppercase tracking-wider text-sm"
                                            >
                                                {sendingOtp ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Sending OTP...
                                                    </>
                                                ) : submitting ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Verifying...
                                                    </>
                                                ) : isOtpSent ? (
                                                    <>
                                                        <CheckCircle className="w-5 h-5" />
                                                        Verify & Submit Message
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-5 h-5" />
                                                        Send OTP
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </motion.div>
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
            </div>

            <Footer />
        </div>
    );
}
