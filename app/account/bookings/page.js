'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Calendar, ChevronRight, Clock, Loader2, Package, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchMyOrders, resolveMediaUrl } from '@/lib/accountApi';
import {
    getStatusLabel,
    getStatusStyle,
    matchesOrderFilter,
    resolveEffectiveOrderStatus,
} from '@/lib/orderStatus';

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
];

const TIME_SLOT_LABELS = {
    '09:00': '09:00 AM - 11:00 AM',
    '11:00': '11:00 AM - 01:00 PM',
    '13:00': '01:00 PM - 03:00 PM',
    '15:00': '03:00 PM - 05:00 PM',
    '17:00': '05:00 PM - 07:00 PM',
    '19:00': '07:00 PM - 09:00 PM',
};

function formatBookedTime(timeStr) {
    if (!timeStr || timeStr === 'N/A') return null;
    const clean = String(timeStr).trim();
    if (TIME_SLOT_LABELS[clean]) return TIME_SLOT_LABELS[clean];
    if (clean.includes('-')) return clean;

    const match = clean.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
        const hour = parseInt(match[1], 10);
        const nextHour = (hour + 2) % 24;
        const fmtHour = (h) => {
            const period = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 === 0 ? 12 : h % 12;
            return `${String(h12).padStart(2, '0')}:00 ${period}`;
        };
        return `${fmtHour(hour)} - ${fmtHour(nextHour)}`;
    }
    return clean;
}

function formatBookedDate(value) {
    if (!value || value === 'N/A') return null;
    return value;
}

export default function MyBookingsPage() {
    const { token, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const loadOrders = useCallback(
        async (targetPage = 1, append = false) => {
            if (!token) return;

            if (targetPage === 1 && !append) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            setError('');

            try {
                const res = await fetchMyOrders(token, { page: targetPage, limit: 20 });
                setOrders((prev) => (append ? [...prev, ...res.orders] : res.orders));
                setPagination(res.pagination);
                setPage(targetPage);
            } catch (e) {
                console.error('Failed to load bookings:', e);
                setError(e?.message || 'Failed to load bookings');
                if (!append) setOrders([]);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [token]
    );

    useEffect(() => {
        if (authLoading) return;
        if (!token) {
            setLoading(false);
            setOrders([]);
            return;
        }
        loadOrders(1, false);
    }, [authLoading, token, loadOrders]);

    const ordersWithStatus = useMemo(
        () =>
            orders.map((order) => ({
                ...order,
                effectiveStatus: resolveEffectiveOrderStatus(order),
            })),
        [orders]
    );

    const filteredOrders = useMemo(
        () => ordersWithStatus.filter((order) => matchesOrderFilter(order.effectiveStatus, filter)),
        [ordersWithStatus, filter]
    );

    const filterCounts = useMemo(() => {
        const counts = { all: ordersWithStatus.length, active: 0, completed: 0, cancelled: 0 };
        ordersWithStatus.forEach((order) => {
            if (matchesOrderFilter(order.effectiveStatus, 'active')) counts.active += 1;
            if (matchesOrderFilter(order.effectiveStatus, 'completed')) counts.completed += 1;
            if (matchesOrderFilter(order.effectiveStatus, 'cancelled')) counts.cancelled += 1;
        });
        return counts;
    }, [ordersWithStatus]);

    const handleLoadMore = () => {
        if (!pagination?.hasNextPage || loadingMore) return;
        loadOrders(page + 1, true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">My Bookings</h1>
                    <p className="text-sm text-gray-500 mt-1">View and track all your service orders</p>
                </div>
                <button
                    type="button"
                    onClick={() => loadOrders(1, false)}
                    disabled={loading || !token}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#037166] hover:bg-[#037166]/5 transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => setFilter(f.key)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            filter === f.key
                                ? 'bg-[#037166] text-white shadow-md'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#037166]/30'
                        }`}
                    >
                        {f.label}
                        {filterCounts[f.key] > 0 && (
                            <span
                                className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                                    filter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {filterCounts[f.key]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading || authLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">
                        {filter === 'all' ? 'No bookings found' : `No ${filter} bookings`}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        {filter === 'all'
                            ? orders.length === 0
                                ? "You haven't booked any services yet."
                                : 'Try viewing all bookings.'
                            : 'Try viewing all bookings.'}
                    </p>
                    {filter !== 'all' ? (
                        <button
                            type="button"
                            onClick={() => setFilter('all')}
                            className="inline-flex px-6 py-3 bg-white border border-gray-200 text-[#037166] font-semibold rounded-xl hover:bg-[#037166]/5 transition-all mr-3"
                        >
                            View All
                        </button>
                    ) : null}
                    <Link
                        href="/"
                        className="inline-flex px-6 py-3 bg-[#037166] text-white font-semibold rounded-xl hover:bg-[#025951] transition-all"
                    >
                        Book a Service
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order, idx) => {
                        const status = order.effectiveStatus;
                        const firstService = order.services?.[0];
                        const serviceName = firstService?.name || 'Service';
                        const imagePath = firstService?.image;
                        const imageUrl = imagePath ? resolveMediaUrl(imagePath) : null;
                        const bookedDate = formatBookedDate(order.bookedDate);
                        const totalAmount =
                            order.totalAmount != null
                                ? Number(order.totalAmount)
                                : order.advancePaid > 0 || order.pendingAmount > 0
                                  ? order.advancePaid + order.pendingAmount
                                  : null;

                        return (
                            <motion.div
                                key={order.bookingId || order.orderId || idx}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                            >
                                <Link
                                    href={order.bookingId ? `/account/bookings/${order.bookingId}` : '#'}
                                    className="block bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-[#037166]/20 transition-all group"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={serviceName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-gray-900 truncate">{serviceName}</h3>
                                                    {order.partnerType && (
                                                        <p className="text-[11px] font-semibold text-[#037166] mt-0.5">
                                                            {order.partnerType}
                                                        </p>
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${getStatusStyle(status)}`}
                                                >
                                                    {getStatusLabel(status)}
                                                </span>
                                            </div>
                                            <p className="text-xs font-mono text-[#037166] mb-3">{order.orderId}</p>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                {bookedDate && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        {bookedDate}
                                                    </span>
                                                )}
                                                {formatBookedTime(order.bookedTime) && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        {formatBookedTime(order.bookedTime)}
                                                    </span>
                                                )}
                                            </div>
                                            {order.providerName && (
                                                <p className="text-xs text-gray-500 mt-2">Provider: {order.providerName}</p>
                                            )}
                                            {order.services.length > 1 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    +{order.services.length - 1} more service
                                                    {order.services.length - 1 > 1 ? 's' : ''}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mt-3">
                                                {totalAmount != null && !Number.isNaN(totalAmount) && (
                                                    <p className="text-sm font-bold text-gray-900">₹{totalAmount.toFixed(0)}</p>
                                                )}
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#037166] group-hover:gap-2 transition-all ml-auto">
                                                    View details
                                                    <ChevronRight className="w-4 h-4" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {pagination?.hasNextPage && !loading && (
                <div className="flex justify-center pt-4">
                    <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-[#037166] hover:bg-[#037166]/5 disabled:opacity-50"
                    >
                        {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}
