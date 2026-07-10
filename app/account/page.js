'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
    CalendarCheck,
    Wallet,
    Gift,
    Headphones,
    User,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
    fetchMyOrders,
    fetchWalletBalance,
    fetchReferralDetails,
    fetchSupportTickets,
} from '@/lib/accountApi';

const QUICK_LINKS = [
    { href: '/account/bookings', label: 'My Bookings', icon: CalendarCheck, desc: 'Track service orders' },
    { href: '/account/profile', label: 'Profile', icon: User, desc: 'Update your details' },
    { href: '/account/wallet', label: 'Wallet', icon: Wallet, desc: 'Balance & transactions' },
    { href: '/account/refer-earn', label: 'Refer & Earn', icon: Gift, desc: 'Invite friends & earn' },
    { href: '/account/support', label: 'Support', icon: Headphones, desc: 'Raise & track tickets' },
];

export default function AccountDashboardPage() {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        bookings: 0,
        walletBalance: 0,
        referrals: 0,
        openTickets: 0,
    });

    useEffect(() => {
        if (!token) return;

        const load = async () => {
            setLoading(true);
            try {
                const [ordersRes, walletRes, referralRes, ticketsRes] = await Promise.all([
                    fetchMyOrders(token, { page: 1, limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
                    fetchWalletBalance(token).catch(() => null),
                    fetchReferralDetails(token).catch(() => null),
                    fetchSupportTickets(token).catch(() => null),
                ]);

                const tickets = ticketsRes?.userRequest || [];
                const openTickets = tickets.filter((t) => {
                    const s = String(t.status || '').toLowerCase();
                    return !['closed', 'solved', 'resolved'].includes(s);
                }).length;

                setStats({
                    bookings: ordersRes?.pagination?.total ?? 0,
                    walletBalance: walletRes?.wallet?.currentBalance ?? 0,
                    referrals: referralRes?.totalReferrals ?? 0,
                    openTickets,
                });
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [token]);

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm"
            >
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                    Welcome back, {user?.name?.split(' ')[0] || 'there'}!
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                    Manage your bookings, wallet, referrals, and support requests from one place.
                </p>
            </motion.div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Bookings', value: stats.bookings, href: '/account/bookings' },
                        { label: 'Wallet Balance', value: `₹${Number(stats.walletBalance).toFixed(0)}`, href: '/account/wallet' },
                        { label: 'Referrals', value: stats.referrals, href: '/account/refer-earn' },
                        { label: 'Open Tickets', value: stats.openTickets, href: '/account/support' },
                    ].map((stat) => (
                        <Link
                            key={stat.label}
                            href={stat.href}
                            className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#037166]/30 hover:shadow-md transition-all"
                        >
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{stat.label}</p>
                            <p className="text-2xl font-extrabold text-[#037166]">{stat.value}</p>
                        </Link>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUICK_LINKS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:border-[#037166]/30 hover:shadow-md transition-all"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#037166]/10 flex items-center justify-center shrink-0 group-hover:bg-[#037166]/15 transition-colors">
                                <Icon className="w-5 h-5 text-[#037166]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900">{item.label}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#037166] transition-colors" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
