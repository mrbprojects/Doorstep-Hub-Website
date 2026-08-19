'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { ChevronRight, Loader2, MapPin, Phone, Mail, ExternalLink, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { fetchSystemSettings } from '@/lib/sellBuyApi';

export default function SellBuyContactUsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const email = settings?.company_email || 'support@dhub.com';
  const phone = settings?.company_phone || '+91 88866 88666';
  const address = settings?.company_address || 'Bangalore, Karnataka, India';
  
  const facebook = settings?.facebook_link || '#';
  const instagram = settings?.instagram_link || '#';
  const youtube = settings?.youtube_link || '#';
  const twitter = settings?.twitter_link || '#';

  const socialLinks = [
    { icon: Facebook, href: facebook, label: 'Facebook', color: 'hover:text-blue-600 hover:border-blue-600' },
    { icon: Instagram, href: instagram, label: 'Instagram', color: 'hover:text-pink-600 hover:border-pink-600' },
    { icon: Twitter, href: twitter, label: 'Twitter', color: 'hover:text-sky-500 hover:border-sky-500' },
    { icon: Youtube, href: youtube, label: 'YouTube', color: 'hover:text-red-600 hover:border-red-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/sell-buy" className="hover:text-[#037166]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold">Contact Us</span>
        </div>

        {/* Hero Contact */}
        <div className="bg-gradient-to-r from-[#037166] to-[#02b39a] rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-4">
          <span className="bg-white/20 text-emerald-100 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight">
            Contact Sell & Buy Support
          </h1>
          <p className="text-xs sm:text-base text-emerald-50 max-w-2xl font-medium leading-relaxed">
            Have a question, feedback, or need help with a local listing? Reach out to our dedicated support team using the contact information below.
          </p>
        </div>

        {/* Dynamic Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-3xl border border-slate-200 text-slate-400 py-10 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm font-medium">Loading contact details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#037166] flex items-center justify-center mb-2">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Office Address</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">{address}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Phone Support</h3>
              <a href={`tel:${phone}`} className="text-sm text-[#037166] font-bold hover:underline leading-relaxed block">{phone}</a>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Email Us</h3>
              <a href={`mailto:${email}`} className="text-sm text-[#037166] font-bold hover:underline leading-relaxed block">{email}</a>
            </div>
          </div>
        )}

        {/* Social Media Links */}
        {!loading && (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Stay Connected</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-semibold transition-all ${social.color}`}
                >
                  <social.icon className="w-5 h-5" />
                  <span className="text-sm">{social.label}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                </a>
              ))}
            </div>
          </div>
        )}

      </main>

      <SellBuyFooter />
    </div>
  );
}
