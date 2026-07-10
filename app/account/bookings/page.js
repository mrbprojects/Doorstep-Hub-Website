'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Calendar, Clock, Loader2, Package, RefreshCw } from 'lucide-react';
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

export default function MyBookingsPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const loadOrders = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetchMyOrders(token, { page, limit: 10 });
            setOrders(res.orders || []);
            setPagination(res.pagination);
        } catch (e) {
            console.error('Failed to load bookings:', e);
        } finally {
            setLoading(false);
        }
    }, [token, page]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const filteredOrders = orders.filter((order) => {
        const status = resolveEffectiveOrderStatus(order);
        return matchesOrderFilter(status, filter);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">My Bookings</h1>
                    <p className="text-sm text-gray-500 mt-1">View and track all your service orders</p>
                </div>
                <button
                    type="button"
                    onClick={loadOrders}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#037166] hover:bg-[#037166]/5 transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            filter === f.key
                                ? 'bg-[#037166] text-white shadow-md'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#037166]/30'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-sm text-gray-500 mb-6">You haven&apos;t booked any services yet.</p>
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
                        const status = resolveEffectiveOrderStatus(order);
                        const firstService = order.services?.[0];
                        const serviceName =
                            firstService?.name ||
                            order.firstServiceName ||
                            order.serviceName ||
                            order.subcategoryName ||
                            'Service';
                        const imagePath = firstService?.image || order.firstServiceImage;
                        const imageUrl = imagePath ? resolveMediaUrl(imagePath) : null;

                        return (
                            <motion.div
                                key={order._id || order.orderId || idx}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all"
                            >
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={serviceName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-gray-900 truncate">{serviceName}</h3>
                                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${getStatusStyle(status)}`}>
                                                {getStatusLabel(status)}
                                            </span>
                                        </div>
                                        <p className="text-xs font-mono text-[#037166] mb-3">{order.orderId}</p>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            {order.bookedDate && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    {order.bookedDate}
                                                </span>
                                            )}
                                            {order.bookedTime && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    {order.bookedTime}
                                                </span>
                                            )}
                                        </div>
                                        {order.providerName && (
                                            <p className="text-xs text-gray-500 mt-2">Provider: {order.providerName}</p>
                                        )}
                                        {order.totalAmount != null && (
                                            <p className="text-sm font-bold text-gray-900 mt-2">₹{Number(order.totalAmount).toFixed(0)}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {pagination?.hasNextPage && (
                <div className="flex justify-center pt-4">
                    <button
                        type="button"
                        onClick={() => setPage((p) => p + 1)}
                        className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-[#037166] hover:bg-[#037166]/5"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}
