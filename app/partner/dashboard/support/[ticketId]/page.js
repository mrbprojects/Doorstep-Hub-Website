'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Loader2, MessageSquare, Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import {
    closeProviderSupportTicket,
    formatProviderTicketStatus,
    getProviderSupportTicket,
    getProviderTicketStatusStyle,
    isProviderTicketOpen,
    replyProviderSupportTicket,
} from '@/lib/providerAuthApi';

export default function PartnerSupportDetailPage() {
    const { ticketId } = useParams();
    const { token } = useProviderAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState('');
    const [replying, setReplying] = useState(false);
    const [closing, setClosing] = useState(false);

    const load = useCallback(async () => {
        if (!token || !ticketId) return;
        setLoading(true);
        try {
            const res = await getProviderSupportTicket(token, ticketId);
            setTicket(res?.data || res?.ticket || res);
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to load ticket');
            setTicket(null);
        } finally {
            setLoading(false);
        }
    }, [token, ticketId]);

    useEffect(() => {
        load();
    }, [load]);

    const isClosed = !isProviderTicketOpen(ticket?.status);

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
        setClosing(true);
        try {
            await closeProviderSupportTicket(token, ticketId);
            toast.success('Ticket closed');
            load();
        } catch (err) {
            toast.error(err.message || 'Failed to close ticket');
        } finally {
            setClosing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500 mb-4">Ticket not found</p>
                <Link href="/partner/dashboard/support" className="text-[#037166] font-semibold hover:underline">
                    Back to tickets
                </Link>
            </div>
        );
    }

    const replies = ticket.messages || ticket.replies || [];

    return (
        <div className="space-y-6">
            <Link href="/partner/dashboard/support" className="inline-flex items-center gap-2 text-sm font-semibold text-[#037166]">
                <ArrowLeft className="w-4 h-4" /> Back to Support History
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
                <div className="flex flex-wrap justify-between gap-3 mb-4">
                    <div>
                        <p className="text-xs font-mono text-[#037166] font-bold">{ticket.ticketId}</p>
                        <h1 className="text-xl font-extrabold text-gray-900">{ticket.title}</h1>
                        {ticket.subject && ticket.subject !== ticket.title && (
                            <p className="text-sm text-gray-500 mt-1">{ticket.subject}</p>
                        )}
                    </div>
                    <span
                        className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full h-fit ${getProviderTicketStatusStyle(
                            ticket.status
                        )}`}
                    >
                        {formatProviderTicketStatus(ticket.status)}
                    </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                    {(ticket.date || ticket.createdAt) && (
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {ticket.date || new Date(ticket.createdAt).toLocaleDateString()}
                            {ticket.time ? ` • ${ticket.time}` : ''}
                        </span>
                    )}
                    {ticket.department && (
                        <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 font-semibold">
                            {ticket.department}
                        </span>
                    )}
                    {ticket.priority && (
                        <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 font-semibold">
                            Priority: {ticket.priority}
                        </span>
                    )}
                </div>

                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>

                {!isClosed && (
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={closing}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold disabled:opacity-60"
                    >
                        {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Close Ticket
                    </button>
                )}
            </motion.div>

            {replies.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#037166]" />
                        <h2 className="font-bold">Conversation</h2>
                    </div>
                    <div className="divide-y">
                        {replies.map((msg, i) => {
                            const isAdmin =
                                msg.isAdmin ||
                                msg.senderRole === 'admin' ||
                                msg.senderType === 'admin';
                            return (
                                <div key={msg._id || i} className="p-4">
                                    <p className="text-xs font-bold text-gray-600 mb-1">
                                        {isAdmin ? 'Support Team' : 'You'}
                                    </p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {msg.message || msg.reply || msg.text}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {!isClosed && (
                <form onSubmit={handleReply} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                    <textarea
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-[#123F4A] text-sm resize-none"
                        placeholder="Type your reply..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={replying}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#037166] text-white text-sm font-semibold rounded-xl disabled:opacity-60"
                    >
                        {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Reply
                    </button>
                </form>
            )}
        </div>
    );
}
