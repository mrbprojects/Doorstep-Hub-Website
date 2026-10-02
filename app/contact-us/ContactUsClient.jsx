'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    MapPin,
    Phone,
    Mail,
    User,
    MessageSquare,
    Clock,
    Headphones,
    Send,
    CheckCircle2,
    Loader2,
    ShieldCheck,
    Lock,
    ExternalLink,
    Navigation,
    Smartphone,
    Check
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/env';
import ContactHeroIllustration from './ContactHeroIllustration';

export default function ContactUsClient({ initialSettings = null }) {
    const [settings, setSettings] = useState(initialSettings);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        iam: '',
        message: '',
        whatsappOtp: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpValues, setOtpValues] = useState(['', '', '', '']);
    const [resendCountdown, setResendCountdown] = useState(0);

    const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    // Fetch latest global settings if not provided
    useEffect(() => {
        if (!initialSettings) {
            const fetchSettings = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/app/get_global_settings`);
                    const data = await res.json();
                    if (data.success && data.policy) {
                        setSettings(data.policy);
                    }
                } catch (err) {
                    console.error('Error fetching global settings:', err);
                }
            };
            fetchSettings();
        }
    }, [initialSettings]);

    // Resend OTP countdown timer
    useEffect(() => {
        let timer;
        if (resendCountdown > 0) {
            timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCountdown]);

    // Format phone numbers
    const formatPhone = (num) => {
        if (!num) return '';
        const clean = String(num).replace(/\D/g, '');
        if (clean.length === 10) return clean;
        return num;
    };

    const officeAddress = settings?.address || 'Panjagutta, Hyderabad, Telangana, India';
    const primaryPhone = formatPhone(settings?.phone || '8886688666');
    const secondaryPhone = formatPhone(settings?.phone2 || '9515661677');
    const primaryEmail = settings?.email || 'support@doorstephub.com';
    const secondaryEmail = settings?.email2 || 'help@doorstephub.com';

    // Dynamic Android & iOS Customer App Links
    const customerAndroidLink = settings?.customerAndroidAppLink || 'https://play.google.com/store/apps/details?id=com.doorstephub.customer';
    const customerIosLink = settings?.customerIosAppLink || 'https://apps.apple.com/in/app/doorstep-hub-home-services/id6475340236';

    // Google Maps Embed & Link
    const mapEmbedUrl = settings?.map || `https://maps.google.com/maps?q=Doorstep+Hub,+Panjagutta,+Hyderabad,+Telangana&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=Doorstep+Hub+Panjagutta+Hyderabad+Telangana`;
    const viewLargerMapUrl = `https://maps.google.com/?q=Doorstep+Hub,+Panjagutta,+Hyderabad,+Telangana`;

    // Social Links
    const socialLinks = [
        {
            label: 'Facebook',
            href: settings?.facebook || 'https://www.facebook.com/DoorstepHub',
            icon: (
                <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            )
        },
        {
            label: 'Instagram',
            href: settings?.instagram || 'https://www.instagram.com/doorstephub_india',
            icon: (
                <svg className="w-3.5 h-3.5 fill-[#E4405F]" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
            )
        },
        {
            label: 'Linkedin',
            href: settings?.linkedin || 'https://www.linkedin.com/company/doorstep-hub/',
            icon: (
                <svg className="w-3.5 h-3.5 fill-[#0A66C2]" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
            )
        },
        {
            label: 'Twitter / X',
            href: settings?.twitter || 'https://x.com/doorstephub',
            icon: (
                <svg className="w-3.5 h-3.5 fill-slate-900" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            )
        },
        {
            label: 'YouTube',
            href: settings?.youtube || 'https://www.youtube.com/@doorstephub',
            icon: (
                <svg className="w-3.5 h-3.5 fill-[#FF0000]" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            )
        }
    ];

    // OTP Handlers
    const handleOtpChange = (index, value) => {
        const val = value.replace(/[^0-9]/g, '');
        const newOtp = [...otpValues];
        newOtp[index] = val.slice(-1);
        setOtpValues(newOtp);

        const joinedOtp = newOtp.join('');
        setFormData(prev => ({ ...prev, whatsappOtp: joinedOtp }));

        if (val && index < 3) {
            otpInputRefs[index + 1]?.current?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            otpInputRefs[index - 1]?.current?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
        if (pastedData) {
            const newOtp = ['', '', '', ''];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtpValues(newOtp);
            setFormData(prev => ({ ...prev, whatsappOtp: newOtp.join('') }));
            const focusIndex = Math.min(pastedData.length, 3);
            otpInputRefs[focusIndex]?.current?.focus();
        }
    };

    // Trigger Send OTP API
    const triggerSendOtp = async (phone) => {
        if (!phone || phone.length !== 10) {
            toast.error('Please enter a valid 10-digit WhatsApp number');
            return;
        }

        setSendingOtp(true);
        try {
            const response = await fetch(`${API_BASE_URL}/app/website-leads/send-otps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsapp: phone, email: formData.email || undefined })
            });

            const data = await response.json();
            if (data.success) {
                setIsOtpSent(true);
                setResendCountdown(30);
                toast.success(data.message || 'OTP has been sent to your mobile number');
                setTimeout(() => {
                    otpInputRefs[0]?.current?.focus();
                }, 100);
            } else {
                toast.error(data.message || 'Failed to send OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.error('Unable to send OTP. Please check your network connection.');
        } finally {
            setSendingOtp(false);
        }
    };

    // Client-side field validation
    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'Please enter your full name.';
        }
        if (!formData.email.trim()) {
            errors.email = 'Please enter your email address.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = 'Please enter a valid email address.';
        }
        if (!formData.whatsapp.trim()) {
            errors.whatsapp = 'Please enter your WhatsApp number.';
        } else if (formData.whatsapp.trim().length !== 10) {
            errors.whatsapp = 'Please enter a valid 10-digit WhatsApp number.';
        }
        if (!formData.iam) {
            errors.iam = 'Please select who you are.';
        }
        if (!formData.message.trim()) {
            errors.message = 'Please enter your message.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill in all required fields correctly');
            return;
        }

        if (!isOtpSent) {
            await triggerSendOtp(formData.whatsapp);
            return;
        }

        if (!formData.whatsappOtp || formData.whatsappOtp.length !== 4) {
            toast.error('Please enter the 4-digit verification OTP');
            otpInputRefs[0]?.current?.focus();
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/app/website-leads/verify-and-submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    whatsapp: formData.whatsapp.trim(),
                    iam: formData.iam,
                    message: formData.message.trim(),
                    whatsappOtp: formData.whatsappOtp.trim()
                })
            });

            const data = await response.json();
            if (data.success) {
                setSubmitted(true);
                setFormData({ name: '', email: '', whatsapp: '', iam: '', message: '', whatsappOtp: '' });
                setOtpValues(['', '', '', '']);
                setIsOtpSent(false);
                setFormErrors({});
                toast.success('Your support request has been submitted successfully!');
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

    const scrollToMap = () => {
        const el = document.getElementById('office-location-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="py-2 sm:py-4 lg:py-6 text-slate-800 font-sans w-full">
            <div className="max-w-[1280px] w-full mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 lg:space-y-9">

                {/* ── 1. HERO SECTION ── */}
                <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#F2FAF9] via-[#F8FCFB] to-white p-4 sm:p-7 lg:p-8 border border-slate-200/70 shadow-sm">
                    <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                        
                        {/* Left: Text & Trust Points */}
                        <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF8F6] border border-teal-200/60 text-[#008C80] text-[11px] font-black uppercase tracking-wider">
                                <Send className="w-3 h-3 text-[#008C80]" />
                                <span>Contact Us</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
                                Get In <span className="text-[#008C80]">Touch</span>
                            </h1>

                            <p className="text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-lg">
                                Have a question, feedback, or need support? We're here to help. Reach out through any of the channels below and we'll get back to you promptly.
                            </p>

                            {/* Trust Points */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 sm:pt-2">
                                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                                    <div className="w-7 h-7 rounded-full bg-[#EAF8F6] text-[#008C80] flex items-center justify-center flex-shrink-0">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-xs font-bold text-slate-900 truncate">Quick Response</h2>
                                        <p className="text-[10px] text-slate-500 leading-tight">We reply promptly</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                                    <div className="w-7 h-7 rounded-full bg-[#EAF8F6] text-[#008C80] flex items-center justify-center flex-shrink-0">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-xs font-bold text-slate-900 truncate">Trusted Support</h2>
                                        <p className="text-[10px] text-slate-500 leading-tight">Queries matter to us</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                                    <div className="w-7 h-7 rounded-full bg-[#EAF8F6] text-[#008C80] flex items-center justify-center flex-shrink-0">
                                        <Headphones className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-xs font-bold text-slate-900 truncate">Dedicated Team</h2>
                                        <p className="text-[10px] text-slate-500 leading-tight">Always here for you</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Compact Hero Illustration */}
                        <div className="lg:col-span-5 flex justify-center lg:justify-end">
                            <ContactHeroIllustration />
                        </div>

                    </div>
                </section>

                {/* ── 2. OFFICIAL CUSTOMER MOBILE APP BAR ── */}
                <div className="w-full rounded-2xl bg-gradient-to-r from-white via-white to-teal-50/50 border border-slate-200/80 shadow-xs p-3.5 sm:p-4.5 transition-all">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
                        
                        {/* App Info */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#EAF8F6] text-[#008C80] flex items-center justify-center flex-shrink-0 shadow-xs">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#008C80]" />
                                    <p className="text-[10px] font-black uppercase tracking-wider text-[#008C80]">
                                        Official Mobile App
                                    </p>
                                </div>
                                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
                                    Doorstep Hub Customer App
                                </h2>
                                <p className="text-[11px] text-slate-500 hidden sm:block">
                                    Book services, track technician arrival live, and get instant customer support.
                                </p>
                            </div>
                        </div>

                        {/* Store Badges with Dynamic Links */}
                        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap pt-1 md:pt-0">
                            {/* Google Play Button */}
                            <a
                                href={customerAndroidLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Download Doorstep Hub Customer App on Google Play"
                                className="group flex-1 sm:flex-initial inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090D16] hover:bg-[#111827] text-white border border-slate-800 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M3.61 1.814L13.79 12 3.61 22.186A2.38 2.38 0 0 1 3 20.572V3.428c0-.624.23-1.196.61-1.614z"/>
                                        <path fill="#FBBC04" d="M17.7 9.68L5.88 2.92 13.79 12l3.91-2.32z"/>
                                        <path fill="#EA4335" d="M3.61 1.814l10.18 10.186 3.91-2.32-11.82-6.76a2.38 2.38 0 0 0-2.27 1.1z"/>
                                        <path fill="#34A853" d="M17.7 14.32l-3.91-2.32-10.18 10.186a2.38 2.38 0 0 0 2.27 1.1l11.82-6.76z"/>
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-[7.5px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-0.5">GET IT ON</p>
                                    <p className="text-[11px] font-bold text-white tracking-tight leading-none">Google Play</p>
                                </div>
                            </a>

                            {/* Apple App Store Button */}
                            {customerIosLink && (
                                <a
                                    href={customerIosLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Download Doorstep Hub Customer App on App Store"
                                    className="group flex-1 sm:flex-initial inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090D16] hover:bg-[#111827] text-white border border-slate-800 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.55.63-1.03 1.68-.9 2.7.99.08 2.02-.45 2.63-1.2z"/>
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[7.5px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-0.5">Download on the</p>
                                        <p className="text-[11px] font-bold text-white tracking-tight leading-none">App Store</p>
                                    </div>
                                </a>
                            )}
                        </div>

                    </div>
                </div>

                {/* ── 3. THREE COMPACT CONTACT CARDS ── */}
                <section aria-label="Contact Channels">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
                        
                        {/* Card 1: Office Address */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#008C80]/40 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-full bg-[#EAF8F6] text-[#008C80] flex items-center justify-center mb-3">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">Office Address</h3>
                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3">
                                    {officeAddress}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={scrollToMap}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008C80] hover:text-[#006D65] transition-colors group mt-1"
                            >
                                <span>View on Map</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>

                        {/* Card 2: Phone */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#008C80]/40 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-full bg-[#EAF8F6] text-[#008C80] flex items-center justify-center mb-3">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">Phone</h3>
                                <div className="space-y-0.5 mb-3">
                                    <a
                                        href={`tel:${primaryPhone}`}
                                        className="block text-slate-700 hover:text-[#008C80] text-xs sm:text-sm font-semibold transition-colors"
                                    >
                                        {primaryPhone}
                                    </a>
                                    {secondaryPhone && (
                                        <a
                                            href={`tel:${secondaryPhone}`}
                                            className="block text-slate-700 hover:text-[#008C80] text-xs sm:text-sm font-semibold transition-colors"
                                        >
                                            {secondaryPhone}
                                        </a>
                                    )}
                                </div>
                            </div>
                            <a
                                href={`tel:${primaryPhone}`}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008C80] hover:text-[#006D65] transition-colors group mt-1"
                            >
                                <span>Call Now</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>

                        {/* Card 3: Email */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#008C80]/40 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-full bg-[#EAF8F6] text-[#008C80] flex items-center justify-center mb-3">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">Email</h3>
                                <div className="space-y-0.5 mb-3">
                                    <a
                                        href={`mailto:${primaryEmail}`}
                                        className="block text-slate-700 hover:text-[#008C80] text-xs sm:text-sm font-semibold transition-colors"
                                    >
                                        {primaryEmail}
                                    </a>
                                    {secondaryEmail && (
                                        <a
                                            href={`mailto:${secondaryEmail}`}
                                            className="block text-slate-700 hover:text-[#008C80] text-xs sm:text-sm font-semibold transition-colors"
                                        >
                                            {secondaryEmail}
                                        </a>
                                    )}
                                </div>
                            </div>
                            <a
                                href={`mailto:${primaryEmail}`}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008C80] hover:text-[#006D65] transition-colors group mt-1"
                            >
                                <span>Send Email</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>

                    </div>
                </section>

                {/* ── 4. MAIN SUPPORT SECTION (2 COLUMNS) ── */}
                <section aria-label="Support and Form Section">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                        
                        {/* LEFT COLUMN: We're Here to Help */}
                        <div className="lg:col-span-5 space-y-4">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF8F6] text-[#008C80] text-[11px] font-bold uppercase tracking-wider mb-2">
                                    <span>Support</span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1.5 tracking-tight">
                                    We're Here to Help
                                </h2>
                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                    Our team is available to assist you with any questions or concerns. Fill out the form and we'll respond as quickly as possible.
                                </p>
                            </div>

                            {/* 3 Information Cards */}
                            <div className="space-y-3 pt-1">
                                {/* Business Hours */}
                                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                                    <div className="w-8 h-8 rounded-full bg-[#EAF8F6] text-[#008C80] flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">Business Hours</h3>
                                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                                            Mon – Sat: 9:00 AM – 7:00 PM<br />
                                            Sun: 10:00 AM – 5:00 PM
                                        </p>
                                    </div>
                                </div>

                                {/* Customer Support */}
                                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                                    <div className="w-8 h-8 rounded-full bg-[#EAF8F6] text-[#008C80] flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Headphones className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">Customer Support</h3>
                                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mb-1.5">
                                            For urgent queries call or WhatsApp us directly at our support number.
                                        </p>
                                        <div className="flex items-center gap-2.5">
                                            <a
                                                href={`tel:${primaryPhone}`}
                                                className="text-xs font-bold text-[#008C80] hover:underline"
                                            >
                                                Call {primaryPhone}
                                            </a>
                                            <span className="text-slate-300">•</span>
                                            <a
                                                href={`https://wa.me/91${primaryPhone}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-bold text-[#008C80] hover:underline"
                                            >
                                                WhatsApp
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Response Time */}
                                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                                    <div className="w-8 h-8 rounded-full bg-[#EAF8F6] text-[#008C80] flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">Response Time</h3>
                                        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                                            We aim to respond to emails within 24 hours on business days.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Support Ticket Form */}
                        <div className="lg:col-span-7">
                            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                                
                                {submitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-8 text-center space-y-3"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-[#EAF8F6] text-[#008C80] mx-auto flex items-center justify-center">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">Your Support Request Has Been Submitted!</h3>
                                        <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                                            Our technical support team will contact you using the details you provided within 24-48 hours.
                                        </p>
                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSubmitted(false);
                                                    setIsOtpSent(false);
                                                    setFormData({ name: '', email: '', whatsapp: '', iam: '', message: '', whatsappOtp: '' });
                                                    setOtpValues(['', '', '', '']);
                                                }}
                                                className="px-5 py-2.5 bg-[#008C80] hover:bg-[#007369] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs"
                                            >
                                                Send Another Message
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                                                Raise a Ticket For Support
                                            </h3>
                                            <p className="text-slate-500 text-xs mt-0.5">
                                                Send us your query and our team will get back to you soon.
                                            </p>
                                        </div>

                                        {/* Row 1: Full Name & Email */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label htmlFor="contact-name" className="block text-xs font-bold text-slate-700 mb-1">
                                                    Full Name *
                                                </label>
                                                <div className="relative">
                                                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                    <input
                                                        id="contact-name"
                                                        type="text"
                                                        autoComplete="name"
                                                        placeholder="Your Name"
                                                        value={formData.name}
                                                        onChange={e => {
                                                            setFormData({ ...formData, name: e.target.value });
                                                            if (formErrors.name) setFormErrors(prev => ({ ...prev, name: null }));
                                                        }}
                                                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 border text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                                                            formErrors.name
                                                                ? 'border-rose-400 focus:ring-rose-400/20'
                                                                : 'border-slate-200 focus:border-[#008C80] focus:ring-[#008C80]/15'
                                                        }`}
                                                    />
                                                </div>
                                                {formErrors.name && (
                                                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 mb-1">
                                                    Email Address *
                                                </label>
                                                <div className="relative">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                    <input
                                                        id="contact-email"
                                                        type="email"
                                                        autoComplete="email"
                                                        inputMode="email"
                                                        placeholder="Enter your valid email"
                                                        value={formData.email}
                                                        onChange={e => {
                                                            setFormData({ ...formData, email: e.target.value });
                                                            if (formErrors.email) setFormErrors(prev => ({ ...prev, email: null }));
                                                        }}
                                                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 border text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                                                            formErrors.email
                                                                ? 'border-rose-400 focus:ring-rose-400/20'
                                                                : 'border-slate-200 focus:border-[#008C80] focus:ring-[#008C80]/15'
                                                        }`}
                                                    />
                                                </div>
                                                {formErrors.email && (
                                                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.email}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Row 2: WhatsApp Number & I am a */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label htmlFor="contact-whatsapp" className="block text-xs font-bold text-slate-700">
                                                        WhatsApp Number *
                                                    </label>
                                                    {isOtpSent && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsOtpSent(false);
                                                                setOtpValues(['', '', '', '']);
                                                                setFormData(prev => ({ ...prev, whatsappOtp: '' }));
                                                            }}
                                                            className="text-xs font-bold text-[#008C80] hover:underline"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                    <input
                                                        id="contact-whatsapp"
                                                        type="tel"
                                                        autoComplete="tel"
                                                        inputMode="tel"
                                                        maxLength={10}
                                                        disabled={isOtpSent}
                                                        placeholder="8886688666"
                                                        value={formData.whatsapp}
                                                        onChange={e => {
                                                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                                            setFormData({ ...formData, whatsapp: val });
                                                            if (formErrors.whatsapp) setFormErrors(prev => ({ ...prev, whatsapp: null }));
                                                        }}
                                                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 border text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                                                            isOtpSent ? 'opacity-70 bg-slate-100 cursor-not-allowed' : ''
                                                        } ${
                                                            formErrors.whatsapp
                                                                ? 'border-rose-400 focus:ring-rose-400/20'
                                                                : 'border-slate-200 focus:border-[#008C80] focus:ring-[#008C80]/15'
                                                        }`}
                                                    />
                                                </div>
                                                {formErrors.whatsapp && (
                                                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.whatsapp}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="contact-iam" className="block text-xs font-bold text-slate-700 mb-1">
                                                    I am a *
                                                </label>
                                                <div className="relative">
                                                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                    <select
                                                        id="contact-iam"
                                                        value={formData.iam}
                                                        onChange={e => {
                                                            setFormData({ ...formData, iam: e.target.value });
                                                            if (formErrors.iam) setFormErrors(prev => ({ ...prev, iam: null }));
                                                        }}
                                                        className={`w-full pl-9 pr-7 py-2.5 rounded-xl bg-slate-50/70 border text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 appearance-none cursor-pointer transition-all ${
                                                            formErrors.iam
                                                                ? 'border-rose-400 focus:ring-rose-400/20'
                                                                : 'border-slate-200 focus:border-[#008C80] focus:ring-[#008C80]/15'
                                                        }`}
                                                    >
                                                        <option value="">Select Here</option>
                                                        <option value="Customer">Customer</option>
                                                        <option value="Service Partner">Service Partner</option>
                                                        <option value="Business Owner">Business Owner</option>
                                                        <option value="Technician / Provider">Technician / Provider</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                {formErrors.iam && (
                                                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.iam}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* OTP Verification Boxes (When OTP is sent) */}
                                        <AnimatePresence>
                                            {isOtpSent && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden p-3.5 rounded-xl bg-[#EAF8F6]/60 border border-teal-200/60 space-y-2.5"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-[11px] font-bold text-[#008C80] uppercase tracking-wider">
                                                            Verification OTP *
                                                        </label>
                                                        {resendCountdown > 0 ? (
                                                            <span className="text-[10px] font-medium text-slate-500">
                                                                Resend OTP in {resendCountdown}s
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => triggerSendOtp(formData.whatsapp)}
                                                                className="text-xs font-bold text-[#008C80] hover:underline"
                                                            >
                                                                Resend OTP
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                                                        {otpValues.map((digit, idx) => (
                                                            <input
                                                                key={idx}
                                                                ref={otpInputRefs[idx]}
                                                                id={`otp-box-${idx}`}
                                                                type="text"
                                                                inputMode="numeric"
                                                                autoComplete="one-time-code"
                                                                maxLength={1}
                                                                value={digit}
                                                                onChange={e => handleOtpChange(idx, e.target.value)}
                                                                onKeyDown={e => handleOtpKeyDown(idx, e)}
                                                                className="w-10 h-10 sm:w-11 sm:h-11 text-center text-lg font-bold bg-white rounded-lg border border-teal-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008C80]/30 focus:border-[#008C80] shadow-xs transition-all"
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500">
                                                        Please enter the 4-digit verification code sent to your mobile number.
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Row 3: Message */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label htmlFor="contact-message" className="block text-xs font-bold text-slate-700">
                                                    Message *
                                                </label>
                                                <span className="text-[11px] font-medium text-slate-400">
                                                    {formData.message.length}/500
                                                </span>
                                            </div>
                                            <textarea
                                                id="contact-message"
                                                rows={3}
                                                maxLength={500}
                                                placeholder="Write your message here..."
                                                value={formData.message}
                                                onChange={e => {
                                                    setFormData({ ...formData, message: e.target.value.slice(0, 500) });
                                                    if (formErrors.message) setFormErrors(prev => ({ ...prev, message: null }));
                                                }}
                                                className={`w-full p-3 rounded-xl bg-slate-50/70 border text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 resize-none transition-all ${
                                                    formErrors.message
                                                        ? 'border-rose-400 focus:ring-rose-400/20'
                                                        : 'border-slate-200 focus:border-[#008C80] focus:ring-[#008C80]/15'
                                                }`}
                                            />
                                            {formErrors.message && (
                                                <p className="text-rose-500 text-[11px] mt-1">{formErrors.message}</p>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={submitting || sendingOtp}
                                            className="w-full py-3 rounded-xl bg-[#008C80] hover:bg-[#007369] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {sendingOtp ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Sending OTP...</span>
                                                </>
                                            ) : submitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Submitting Ticket...</span>
                                                </>
                                            ) : isOtpSent ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    <span>Verify &amp; Submit Message</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-3.5 h-3.5" />
                                                    <span>Send Message</span>
                                                </>
                                            )}
                                        </button>

                                        {/* Security / Privacy Note */}
                                        <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500 pt-0.5">
                                            <Lock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                            <span>Your information is secure with us. We never share your details with third parties.</span>
                                        </div>

                                    </form>
                                )}

                            </div>
                        </div>

                    </div>
                </section>

                {/* ── 5. OFFICE LOCATION (MAP SECTION) ── */}
                <section id="office-location-section" aria-label="Office Location">
                    <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                            
                            {/* Map Preview Column (Left) */}
                            <div className="lg:col-span-7 relative h-56 sm:h-64 lg:h-[260px] bg-slate-100">
                                <iframe
                                    src={mapEmbedUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Doorstep Hub Office Location in Panjagutta, Hyderabad"
                                    className="w-full h-full"
                                />

                                {/* View Larger Map Button Overlay */}
                                <a
                                    href={viewLargerMapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs text-slate-800 text-[11px] font-bold hover:bg-slate-50 transition-all"
                                >
                                    <span>View Larger Map</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                                </a>
                            </div>

                            {/* Office Details Column (Right) */}
                            <div className="lg:col-span-5 p-5 sm:p-6 lg:p-7 flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-white via-white to-teal-50/40">
                                <div className="absolute -bottom-8 -right-8 w-36 h-36 opacity-[0.06] pointer-events-none text-[#008C80]">
                                    <svg viewBox="0 0 100 100" fill="currentColor">
                                        <rect x="10" y="20" width="35" height="70" rx="4" />
                                        <rect x="55" y="10" width="35" height="80" rx="4" />
                                        <rect x="20" y="30" width="6" height="8" rx="1" fill="#fff" />
                                        <rect x="20" y="45" width="6" height="8" rx="1" fill="#fff" />
                                        <rect x="20" y="60" width="6" height="8" rx="1" fill="#fff" />
                                        <rect x="65" y="25" width="6" height="8" rx="1" fill="#fff" />
                                        <rect x="65" y="40" width="6" height="8" rx="1" fill="#fff" />
                                        <rect x="65" y="55" width="6" height="8" rx="1" fill="#fff" />
                                    </svg>
                                </div>

                                <div className="relative z-10 space-y-2.5">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF8F6] text-[#008C80] text-[11px] font-bold uppercase tracking-wider">
                                        <span>Our Location</span>
                                    </div>

                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        Visit Our Office
                                    </h3>

                                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                        {officeAddress}
                                    </p>

                                    <div className="pt-1">
                                        <a
                                            href={mapDirectionsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#008C80] text-[#008C80] hover:bg-[#008C80] hover:text-white font-bold text-xs transition-all shadow-xs group"
                                        >
                                            <Navigation className="w-3.5 h-3.5 text-[#008C80] group-hover:text-white transition-colors" />
                                            <span>Get Directions</span>
                                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ── 6. STAY CONNECTED (SOCIAL MEDIA) ── */}
                <section aria-label="Social Media Connections" className="relative pt-1 pb-4">
                    <div className="max-w-3xl mx-auto text-center space-y-2 relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF8F6] text-[#008C80] text-[11px] font-bold uppercase tracking-wider">
                            <span>Follow Us</span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Stay Connected
                        </h2>

                        <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
                            Follow us on social media for the latest updates, tips and offers.
                        </p>

                        {/* Social Buttons */}
                        <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Follow Doorstep Hub on ${social.label}`}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 hover:border-[#008C80]/50 hover:shadow-xs text-slate-800 text-xs font-bold transition-all hover:-translate-y-0.5"
                                >
                                    <div className="flex-shrink-0">
                                        {social.icon}
                                    </div>
                                    <span>{social.label}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
