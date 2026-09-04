'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    CalendarCheck,
    User,
    Headphones,
    Trash2,
    Gift,
    Wallet,
    Shield,
    ChevronRight,
    LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchSupportTickets } from '@/lib/accountApi';

const NAV_ITEMS = [
    { href: '/account', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/account/bookings', label: 'My Bookings', icon: CalendarCheck },
    { href: '/account/amc', label: 'Book AMC Services', icon: Shield },
    { href: '/account/profile', label: 'Profile', icon: User },
    { href: '/account/wallet', label: 'Wallet', icon: Wallet },
    { href: '/account/refer-earn', label: 'Refer & Earn', icon: Gift },
    { href: '/account/support', label: 'Support Tickets', icon: Headphones },
    { href: '/account/deletion', label: 'Delete Account', icon: Trash2 },
];

export function AccountSidebar({ onNavigate }) {
    const pathname = usePathname();
    const { user, logout, token } = useAuth();
    const [pendingTicketsCount, setPendingTicketsCount] = useState(0);

    useEffect(() => {
        if (!token) return;
        fetchSupportTickets(token)
            .then((res) => {
                const tickets = res?.userRequest || [];
                const count = tickets.filter((t) => {
                    const s = String(t.status || '').toLowerCase();
                    return !['closed', 'solved', 'resolved'].includes(s);
                }).length;
                setPendingTicketsCount(count);
            })
            .catch(() => setPendingTicketsCount(0));
    }, [token]);

    const isActive = (item) => {
        if (item.exact) return pathname === item.href;
        return pathname === item.href || pathname.startsWith(`${item.href}/`);
    };

    return (
        <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden sticky top-28">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-[#037166]/5 to-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#037166] to-[#04a99d] flex items-center justify-center overflow-hidden shrink-0">
                            {user?.image ? (
                                <img
                                    src={user.image.startsWith('http') ? user.image : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${user.image}`}
                                    alt={user.name || 'User'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{user?.name || 'Customer'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.phone || user?.mobile || user?.email}</p>
                        </div>
                    </div>
                </div>

                <nav className="p-3 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onNavigate}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                                        ? 'bg-[#037166] text-white shadow-md shadow-[#037166]/20'
                                        : 'text-gray-700 hover:bg-[#037166]/5 hover:text-[#037166]'
                                    }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="flex-1">{item.label}</span>
                                {item.href === '/account/support' && pendingTicketsCount > 0 && (
                                    <span
                                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                            active
                                                ? 'bg-white text-[#037166]'
                                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                                        }`}
                                    >
                                        {pendingTicketsCount}
                                    </span>
                                )}
                                {active && <ChevronRight className="w-4 h-4 opacity-70" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => {
                            logout();
                            onNavigate?.();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
}
