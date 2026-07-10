'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Calendar, ChevronRight, Headphones, Loader2, Plus, RefreshCw, Ticket } from 'lucide-react';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import { getProviderSupportTickets } from '@/lib/providerAuthApi';

export default function PartnerSupportPage() {
    const { token } = useProviderAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await getProviderSupportTickets(token);
            setTickets(res?.data || res?.tickets || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Vendor Support</h1>
                    <p className="text-sm text-gray-500 mt-1">Raise tickets for booking, KYC, payment, or technical issues</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={load} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#037166]">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                    <Link href="/partner/dashboard/support/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#037166] text-white text-sm font-semibold">
                        <Plus className="w-4 h-4" /> New Ticket
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#037166]" /></div>
            ) : tickets.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">No support tickets</h3>
                    <Link href="/partner/dashboard/support/new" className="inline-flex items-center gap-2 px-6 py-3 bg-[#037166] text-white font-semibold rounded-xl mt-4">
                        <Plus className="w-4 h-4" /> Create Ticket
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map((ticket, idx) => (
                        <motion.div key={ticket._id || idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            <Link href={`/partner/dashboard/support/${ticket._id}`} className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#037166]/30 hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Headphones className="w-4 h-4 text-[#037166]" />
                                        <span className="text-xs font-bold font-mono text-[#037166]">{ticket.ticketId || ticket._id}</span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[#037166]/10 text-[#037166]">{ticket.status}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-[#037166]">{ticket.title}</h3>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {ticket.date || (ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '')}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#037166]" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
