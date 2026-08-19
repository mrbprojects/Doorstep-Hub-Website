'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Tag,
  ShieldCheck,
  Lock,
  Zap,
  Mail,
  PhoneCall,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Twitter
} from 'lucide-react';
import { fetchSellBuyCategories, fetchSystemSettings } from '@/lib/sellBuyApi';

export function SellBuyFooter() {
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSellBuyCategories().then(cats => {
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
    });
    fetchSystemSettings().then(setSettings);
  }, []);

  const displayCategories = categories.slice(0, 6);

  const email = settings?.company_email || 'support@dhub.com';
  const phone = settings?.company_phone || '+91 88866 88666';
  const address = settings?.company_address || 'Bangalore, Karnataka, India';
  
  const facebook = settings?.facebook_link || '#';
  const instagram = settings?.instagram_link || '#';
  const youtube = settings?.youtube_link || '#';
  const twitter = settings?.twitter_link || '#';

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 font-sans">
      {/* 4 Feature Pills Row */}
      <div className="border-b border-slate-200 bg-slate-50/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#037166]/10 text-[#037166] flex items-center justify-center flex-shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Free to List</h5>
                <p className="text-[11px] text-slate-500">Post your ads for free</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#037166]/10 text-[#037166] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Local & Trusted</h5>
                <p className="text-[11px] text-slate-500">Verified buyers & sellers</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#037166]/10 text-[#037166] flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Safe Transactions</h5>
                <p className="text-[11px] text-slate-500">Secure chat & connect</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#037166]/10 text-[#037166] flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Quick & Easy</h5>
                <p className="text-[11px] text-slate-500">Sell in just a few steps</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="relative w-40 h-12">
              <Image src="/d-hub-logo.png" alt="D-Hub" fill className="object-contain object-left" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              D-Hub is your trusted local marketplace to buy, sell and connect with people around you. Simple, safe & smart.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a href={facebook} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-[#037166] hover:text-white transition-colors"><Facebook className="w-3.5 h-3.5" /></a>
              <a href={instagram} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-[#037166] hover:text-white transition-colors"><Instagram className="w-3.5 h-3.5" /></a>
              <a href={youtube} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-[#037166] hover:text-white transition-colors"><Youtube className="w-3.5 h-3.5" /></a>
              <a href={twitter} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-[#037166] hover:text-white transition-colors"><Twitter className="w-3.5 h-3.5" /></a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-4">Explore</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link href="/sell-buy/categories" className="hover:text-[#037166] transition-colors">All Categories</Link></li>
              {displayCategories.map(cat => (
                <li key={cat.slug || cat._id}>
                  <Link href={`/sell-buy/${cat.slug}`} className="hover:text-[#037166] transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-4">Account</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link href="/sell-buy/dashboard" className="hover:text-[#037166] transition-colors">My Dashboard</Link></li>
              <li><Link href="/sell-buy/dashboard/my-ads" className="hover:text-[#037166] transition-colors">My Ads</Link></li>
              <li><Link href="/sell-buy/dashboard/favorites" className="hover:text-[#037166] transition-colors">Favorites</Link></li>
              <li><Link href="/sell-buy/chat" className="hover:text-[#037166] transition-colors">Messages</Link></li>
              <li><Link href="/sell-buy/dashboard" className="hover:text-[#037166] transition-colors">My Profile</Link></li>
              <li><Link href="/sell-buy/help" className="hover:text-[#037166] transition-colors">Help & Support</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link href="/sell-buy/about" className="hover:text-[#037166] transition-colors">About Us</Link></li>
              <li><Link href="/sell-buy/contact-us" className="hover:text-[#037166] transition-colors">Contact Us</Link></li>
              <li><Link href="/sell-buy/help" className="hover:text-[#037166] transition-colors">How it Works</Link></li>
              <li><Link href="/sell-buy/terms" className="hover:text-[#037166] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/sell-buy/privacy-policy" className="hover:text-[#037166] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/sell-buy/safety" className="hover:text-[#037166] transition-colors">Safety Tips</Link></li>
            </ul>
          </div>

          {/* Connect with Us */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 mb-4">Connect with Us</h4>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Mail className="w-4 h-4 text-[#037166]" />
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <PhoneCall className="w-4 h-4 text-[#037166]" />
              <span>{phone}</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-[#037166] flex-shrink-0 mt-0.5" />
              <span>{address}</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-200 mt-10 pt-6 text-center text-xs text-slate-400 font-medium">
          © 2025 D-Hub Doorstep Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
