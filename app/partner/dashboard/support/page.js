'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Headphones,
    Loader2,
    Plus,
    RefreshCw,
    Ticket,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import {
    formatProviderTicketStatus,
    getProviderSupportTickets,
    getProviderTicketStatusStyle,
    isProviderTicketOpen,
} from '@/lib/providerAuthApi';

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Open' },
    { id: 'closed', label: 'Closed' },
];

export default function PartnerSupportPage() {
    const { token } = useProviderAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await getProviderSupportTickets(token);
            setTickets(res?.data || []);
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'Failed to load support tickets');
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;
        let activeMount = true;
        getProviderSupportTickets(token)
            .then((res) => {
                if (activeMount) setTickets(res?.data || []);
            })
            .catch((e) => {
                console.error(e);
                if (activeMount) {
                    toast.error(e.message || 'Failed to load support tickets');
                    setTickets([]);
                }
            })
            .finally(() => {
                if (activeMount) setLoading(false);
            });
        return () => { activeMount = false; };
    }, [token]);

    const stats = useMemo(() => {
        const open = tickets.filter((ticket) => isProviderTicketOpen(ticket.status)).length;
        return {
            total: tickets.length,
            open,
            closed: tickets.length - open,
        };
    }, [tickets]);

    const filteredTickets = useMemo(() => {
        if (filter === 'open') {
            return tickets.filter((ticket) => isProviderTicketOpen(ticket.status));
        }
        if (filter === 'closed') {
            return tickets.filter((ticket) => !isProviderTicketOpen(ticket.status));
        }
        return tickets;
    }, [tickets, filter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Vendor Support</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Raise tickets for booking, KYC, payment, or technical issues
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={load}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#037166] hover:bg-[#037166]/5"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                    <Link
                        href="/partner/dashboard/support/new"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#037166] text-white text-sm font-semibold hover:bg-[#025951] transition-all"
                    >
                        <Plus className="w-4 h-4" /> New Ticket
                    </Link>
                </div>
            </div>

            {!loading && tickets.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                            <Ticket className="w-3.5 h-3.5" />
                            Total Tickets
                        </div>
                        <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-700 mb-1">
                            <Clock3 className="w-3.5 h-3.5" />
                            Open
                        </div>
                        <p className="text-2xl font-extrabold text-amber-700">{stats.open}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#037166] mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Closed
                        </div>
                        <p className="text-2xl font-extrabold text-[#037166]">{stats.closed}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
                </div>
            ) : tickets.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">No support tickets</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Create a ticket to get help with bookings, KYC, payments, or technical issues.
                    </p>
                    <Link
                        href="/partner/dashboard/support/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#037166] text-white font-semibold rounded-xl hover:bg-[#025951] transition-all"
                    >
                        <Plus className="w-4 h-4" /> Create Ticket
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h2 className="text-lg font-extrabold text-gray-900">Support History</h2>
                        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
                            {FILTERS.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setFilter(item.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        filter === item.id
                                            ? 'bg-[#037166] text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredTickets.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-500">
                            No {filter === 'open' ? 'open' : 'closed'} tickets found.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTickets.map((ticket, idx) => (
                                <motion.div
                                    key={ticket._id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                >
                                    <Link
                                        href={`/partner/dashboard/support/${ticket._id}`}
                                        className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#037166]/30 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Headphones className="w-4 h-4 text-[#037166] shrink-0" />
                                                <span className="text-xs font-bold font-mono text-[#037166] truncate">
                                                    {ticket.ticketId}
                                                </span>
                                            </div>
                                            <span
                                                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${getProviderTicketStatusStyle(
                                                    ticket.status
                                                )}`}
                                            >
                                                {formatProviderTicketStatus(ticket.status)}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#037166] transition-colors">
                                            {ticket.title}
                                        </h3>
                                        {ticket.subject && ticket.subject !== ticket.title && (
                                            <p className="text-sm text-gray-500 mb-2 line-clamp-1">{ticket.subject}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {ticket.date}
                                                {ticket.time ? ` • ${ticket.time}` : ''}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#037166]" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
