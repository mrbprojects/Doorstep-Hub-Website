'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Calendar, ChevronRight, Headphones, Loader2, Plus, RefreshCw, Ticket } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchSupportTickets } from '@/lib/accountApi';

function isTicketOpen(status) {
    const s = String(status || '').toLowerCase();
    return !['closed', 'solved', 'resolved'].includes(s);
}

export default function SupportTicketsPage() {
    const { token } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetchSupportTickets(token);
            setTickets(res?.userRequest || []);
        } catch (e) {
            console.error('Failed to load support tickets:', e);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;
        let active = true;
        fetchSupportTickets(token)
            .then((res) => {
                if (active) setTickets(res?.userRequest || []);
            })
            .catch((e) => console.error('Failed to load support tickets:', e))
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [token]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Support Tickets</h1>
                    <p className="text-sm text-gray-500 mt-1">Raise and track order-related support requests</p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={load}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#037166] hover:bg-[#037166]/5"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                    <Link
                        href="/account/support/new"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#037166] text-white text-sm font-semibold hover:bg-[#025951] transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        New Ticket
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
                </div>
            ) : tickets.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">No support tickets yet</h3>
                    <p className="text-sm text-gray-500 mb-6">Create a ticket for booking, payment, or service issues.</p>
                    <Link
                        href="/account/support/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#037166] text-white font-semibold rounded-xl hover:bg-[#025951] transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Create Ticket
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map((ticket, idx) => {
                        const open = isTicketOpen(ticket.status);
                        return (
                            <motion.div
                                key={ticket._id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                            >
                                <Link
                                    href={`/account/support/${ticket._id}`}
                                    className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#037166]/30 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Headphones className="w-4 h-4 text-[#037166]" />
                                            <span className="text-xs font-bold font-mono text-[#037166]">{ticket.ticketId}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                                            open ? 'bg-amber-100 text-amber-700' : 'bg-[#037166]/10 text-[#037166]'
                                        }`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#037166] transition-colors">
                                        {ticket.title}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {ticket.date} {ticket.time ? `• ${ticket.time}` : ''}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#037166]" />
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
