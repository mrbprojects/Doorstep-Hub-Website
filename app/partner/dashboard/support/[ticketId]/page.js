'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, MessageSquare, Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import {
    closeProviderSupportTicket,
    getProviderSupportTicket,
    replyProviderSupportTicket,
} from '@/lib/providerAuthApi';

export default function PartnerSupportDetailPage() {
    const { ticketId } = useParams();
    const { token } = useProviderAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState('');
    const [replying, setReplying] = useState(false);

    const load = useCallback(async () => {
        if (!token || !ticketId) return;
        setLoading(true);
        try {
            const res = await getProviderSupportTicket(token, ticketId);
            setTicket(res?.data || res?.ticket || res);
        } finally {
            setLoading(false);
        }
    }, [token, ticketId]);

    useEffect(() => {
        load();
    }, [load]);

    const isClosed = ['closed', 'solved', 'resolved'].includes(String(ticket?.status || '').toLowerCase());

    const handleReply = async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;
        setReplying(true);
        try {
            await replyProviderSupportTicket(token, ticketId, reply.trim());
            toast.success('Reply sent');
            setReply('');
            load();
        } catch (err) {
            toast.error(err.message || 'Failed to send reply');
        } finally {
            setReplying(false);
        }
    };

    const handleClose = async () => {
        if (!window.confirm('Close this support ticket?')) return;
        try {
            await closeProviderSupportTicket(token, ticketId);
            toast.success('Ticket closed');
            load();
        } catch (err) {
            toast.error(err.message || 'Failed to close ticket');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#037166]" /></div>;
    if (!ticket) return <p className="text-center text-gray-500">Ticket not found</p>;

    const replies = ticket.replies || ticket.messages || [];

    return (
        <div className="space-y-6">
            <Link href="/partner/dashboard/support" className="inline-flex items-center gap-2 text-sm font-semibold text-[#037166]">
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap justify-between gap-3 mb-4">
                    <div>
                        <p className="text-xs font-mono text-[#037166] font-bold">{ticket.ticketId}</p>
                        <h1 className="text-xl font-extrabold text-gray-900">{ticket.title}</h1>
                    </div>
                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-[#037166]/10 text-[#037166]">{ticket.status}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                {!isClosed && (
                    <button type="button" onClick={handleClose} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold">
                        <XCircle className="w-4 h-4" /> Close Ticket
                    </button>
                )}
            </motion.div>

            {replies.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#037166]" /><h2 className="font-bold">Conversation</h2></div>
                    <div className="divide-y">
                        {replies.map((msg, i) => (
                            <div key={msg._id || i} className="p-4">
                                <p className="text-xs font-bold text-gray-600 mb-1">{msg.isAdmin || msg.senderRole === 'admin' ? 'Support Team' : 'You'}</p>
                                <p className="text-sm text-gray-700">{msg.message || msg.reply}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isClosed && (
                <form onSubmit={handleReply} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                    <textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-sm resize-none" placeholder="Type your reply..." value={reply} onChange={(e) => setReply(e.target.value)} />
                    <button type="submit" disabled={replying} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#037166] text-white text-sm font-semibold rounded-xl disabled:opacity-60">
                        {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Reply
                    </button>
                </form>
            )}
        </div>
    );
}
