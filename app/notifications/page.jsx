'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
    Bell,
    Calendar,
    Wallet,
    Tag,
    Info,
    CheckCheck,
    Search,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '@/lib/notificationsApi';

const CATEGORIES = [
    { key: 'all', label: 'All', icon: Bell },
    { key: 'bookings', label: 'Bookings', icon: Calendar },
    { key: 'wallet', label: 'Wallet', icon: Wallet },
    { key: 'offers', label: 'Offers', icon: Tag },
    { key: 'system', label: 'System', icon: Info },
];

function formatTimeAgo(isoString) {
    if (!isoString) return '';
    try {
        const diffMs = Date.now() - new Date(isoString).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
}

export default function NotificationsPage() {
    const router = useRouter();
    const { token } = useAuth();

    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        notifications: [],
        total: 0,
        unreadCount: 0,
        totalPages: 1
    });

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchNotifications({
                token,
                category: activeCategory,
                page,
                limit: 10
            });
            setData(res);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [token, activeCategory, page]);

    useEffect(() => {
        let active = true;
        fetchNotifications({
            token,
            category: activeCategory,
            page,
            limit: 10
        })
            .then((res) => {
                if (active) {
                    setData(res);
                }
            })
            .catch((err) => {
                console.error('Failed to load notifications:', err);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [token, activeCategory, page]);

    const handleMarkAllRead = () => {
        const ids = data.notifications.map(n => n.id);
        markAllNotificationsAsRead(ids);
        loadNotifications();
    };

    const handleItemClick = (notification) => {
        markNotificationAsRead(notification.id);
        setData(prev => ({
            ...prev,
            notifications: prev.notifications.map(n =>
                n.id === notification.id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, prev.unreadCount - 1)
        }));

        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
    };

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return data.notifications;
        const q = searchQuery.toLowerCase();
        return data.notifications.filter(n =>
            n.title?.toLowerCase().includes(q) ||
            n.message?.toLowerCase().includes(q)
        );
    }, [data.notifications, searchQuery]);

    const getCategoryIcon = (category) => {
        switch (category?.toLowerCase()) {
            case 'bookings':
                return { icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
            case 'wallet':
                return { icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
            case 'offers':
                return { icon: Tag, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
            default:
                return { icon: Info, color: 'text-[#037166]', bg: 'bg-teal-50 border-teal-200' };
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-20 sm:pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-3 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 flex items-center gap-2.5">
                                <span className="p-2 rounded-2xl bg-[#037166]/10 text-[#037166]">
                                    <Bell className="w-6 h-6" />
                                </span>
                                <span>Notification Center</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                Stay updated with booking alerts, wallet top-ups, and special offers
                            </p>
                        </div>

                        {data.unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#037166] bg-teal-50 hover:bg-teal-100 border border-teal-200/80 transition-all self-start sm:self-auto"
                            >
                                <CheckCheck className="w-4 h-4" />
                                <span>Mark all as read</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-3.5 sm:p-4 mb-6 space-y-3.5">
                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = activeCategory === cat.key;
                            return (
                                <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => {
                                        setActiveCategory(cat.key);
                                        setPage(1);
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                                        isActive
                                            ? 'bg-[#037166] text-white border-[#037166] shadow-xs'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search in notifications..."
                            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-[#037166] focus:ring-2 focus:ring-[#037166]/20 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
                        <p className="text-xs font-medium">Loading notifications...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-xs">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-3 text-gray-400">
                            <Bell className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-extrabold text-gray-900">No notifications found</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                            {searchQuery
                                ? 'No notifications match your search query. Try clearing the search.'
                                : 'You are all caught up! Updates regarding bookings and offers will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredItems.map((notification) => {
                            const meta = getCategoryIcon(notification.category);
                            const Icon = meta.icon;

                            return (
                                <motion.div
                                    key={notification.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => handleItemClick(notification)}
                                    className={`relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer bg-white hover:border-[#037166]/50 hover:shadow-md ${
                                        !notification.isRead
                                            ? 'border-[#037166]/30 bg-teal-50/15 ring-1 ring-[#037166]/10'
                                            : 'border-gray-200/80 shadow-xs'
                                    }`}
                                >
                                    <div className="flex items-start gap-3.5">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg}`}>
                                            <Icon className={`w-5 h-5 ${meta.color}`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className={`text-xs sm:text-sm font-extrabold truncate ${
                                                        !notification.isRead ? 'text-gray-950' : 'text-gray-800'
                                                    }`}>
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.isRead && (
                                                        <span className="w-2 h-2 rounded-full bg-[#037166] shrink-0" />
                                                    )}
                                                </div>
                                                <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
                                                    {formatTimeAgo(notification.timestamp)}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-600 leading-relaxed mb-2.5">
                                                {notification.message}
                                            </p>

                                            {notification.actionText && (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#037166] hover:underline">
                                                    <span>{notification.actionText}</span>
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {data.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-3">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Previous</span>
                        </button>
                        <span className="text-xs font-semibold text-gray-500">
                            Page {page} of {data.totalPages}
                        </span>
                        <button
                            type="button"
                            disabled={page >= data.totalPages}
                            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
