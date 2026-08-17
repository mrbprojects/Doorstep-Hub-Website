'use client';

import React from 'react';
import Link from 'next/link';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import {
  Tag,
  Heart,
  MessageSquare,
  DollarSign,
  ShieldCheck,
  Eye,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';

export default function MarketplaceDashboardPage() {
  const STATS = [
    { label: 'Active Ads', count: 4, icon: Tag, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Views', count: 1240, icon: Eye, color: 'bg-blue-50 text-blue-600' },
    { label: 'Saved Favorites', count: 12, icon: Heart, color: 'bg-rose-50 text-rose-600' },
    { label: 'Unread Chats', count: 3, icon: MessageSquare, color: 'bg-purple-50 text-purple-600' },
    { label: 'Offers Received', count: 8, icon: DollarSign, color: 'bg-amber-50 text-amber-600' },
    { label: 'Verification KYC', status: 'Approved', icon: ShieldCheck, color: 'bg-teal-50 text-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Marketplace Dashboard</h1>
              <span className="bg-emerald-100 text-[#037166] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md">
                Verified Seller
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Manage your active listings, offers, chats, and seller account</p>
          </div>

          <Link
            href="/sell-buy/post-ad"
            className="bg-[#037166] hover:bg-[#025951] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>POST NEW FREE AD</span>
          </Link>
        </div>

        {/* Analytics Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {STATS.map((st) => {
            const Icon = st.icon;
            return (
              <div key={st.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${st.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{st.label}</p>
                <p className="text-xl font-black text-slate-900">{st.count !== undefined ? st.count : st.status}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link href="/sell-buy/dashboard/my-ads" className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#037166] hover:shadow-lg transition-all">
            <Tag className="w-8 h-8 text-[#037166] mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-bold text-slate-900">My Listings</h3>
            <p className="text-xs text-slate-500 mt-1">Edit, renew, or mark your advertisements as sold.</p>
          </Link>

          <Link href="/sell-buy/dashboard/favorites" className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#037166] hover:shadow-lg transition-all">
            <Heart className="w-8 h-8 text-rose-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-bold text-slate-900">Saved Favorites</h3>
            <p className="text-xs text-slate-500 mt-1">View and manage bookmarked marketplace ads.</p>
          </Link>

          <Link href="/sell-buy/chat" className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#037166] hover:shadow-lg transition-all">
            <MessageSquare className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-bold text-slate-900">Chats & Messages</h3>
            <p className="text-xs text-slate-500 mt-1">Communicate directly with interested buyers.</p>
          </Link>

          <Link href="/sell-buy/dashboard/verification" className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#037166] hover:shadow-lg transition-all">
            <ShieldCheck className="w-8 h-8 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-bold text-slate-900">Seller Verification</h3>
            <p className="text-xs text-slate-500 mt-1">Submit KYC documents to earn a trusted seller badge.</p>
          </Link>
        </div>
      </main>

      <SellBuyFooter />
    </div>
  );
}
