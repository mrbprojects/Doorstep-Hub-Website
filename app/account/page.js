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
    Shield,
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
    { href: '/account/amc', label: 'Book AMC Services', icon: Shield, desc: 'Annual maintenance packages' },
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
                    bookings: ordersRes?.pagination?.total ?? ordersRes?.orders?.length ?? 0,
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
        <div className="space-y-4 sm:space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 md:p-8 shadow-xs"
            >
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-1.5 sm:mb-2">
                    Welcome back, {user?.name?.split(' ')[0] || 'there'}!
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
                    Manage your bookings, wallet, referrals, and support requests from one place.
                </p>
            </motion.div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[
                        { label: 'Total Bookings', value: stats.bookings, href: '/account/bookings' },
                        { label: 'Wallet Balance', value: `₹${Number(stats.walletBalance).toFixed(0)}`, href: '/account/wallet' },
                        { label: 'Referrals', value: stats.referrals, href: '/account/refer-earn' },
                        { label: 'Open Tickets', value: stats.openTickets, href: '/account/support' },
                    ].map((stat) => (
                        <Link
                            key={stat.label}
                            href={stat.href}
                            className="bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-5 hover:border-[#037166]/30 hover:shadow-md transition-all active:scale-[0.99]"
                        >
                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 sm:mb-2 truncate">{stat.label}</p>
                            <p className="text-lg sm:text-2xl font-extrabold text-[#037166]">{stat.value}</p>
                        </Link>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {QUICK_LINKS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 hover:border-[#037166]/30 hover:shadow-md transition-all active:scale-[0.99]"
                        >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#037166]/10 flex items-center justify-center shrink-0 group-hover:bg-[#037166]/15 transition-colors">
                                <Icon className="w-5 h-5 text-[#037166]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-bold text-sm sm:text-base text-gray-900">{item.label}</p>
                                    {item.href === '/account/support' && stats.openTickets > 0 && (
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                            {stats.openTickets} Pending
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">{item.desc}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-[#037166] transition-colors shrink-0" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
