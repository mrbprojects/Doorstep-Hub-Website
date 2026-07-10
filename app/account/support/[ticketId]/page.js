'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    Calendar,
    Loader2,
    MessageSquare,
    Send,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
    closeSupportTicket,
    fetchSupportTicketById,
    replySupportTicket,
    resolveMediaUrl,
} from '@/lib/accountApi';

function isTicketClosed(ticket) {
    const s = String(ticket?.status || '').toLowerCase();
    return ['closed', 'solved', 'resolved'].includes(s);
}

export default function SupportTicketDetailPage() {
    const { ticketId } = useParams();
    const { token } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState('');
    const [replying, setReplying] = useState(false);
    const [closing, setClosing] = useState(false);

    const load = useCallback(async () => {
        if (!token || !ticketId) return;
        setLoading(true);
        try {
            const res = await fetchSupportTicketById(token, ticketId);
            if (res?.success) {
                setTicket(res.supportTicket || res.data);
            }
        } catch (e) {
            console.error('Failed to load ticket:', e);
        } finally {
            setLoading(false);
        }
    }, [token, ticketId]);

    useEffect(() => {
        load();
    }, [load]);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!reply.trim() || !token) return;

        setReplying(true);
        try {
            const res = await replySupportTicket(token, ticketId, reply.trim());
            if (res?.success) {
                toast.success('Reply sent');
                setReply('');
                await load();
            } else {
                toast.error(res?.message || 'Failed to send reply');
            }
        } catch (err) {
            toast.error('Failed to send reply');
        } finally {
            setReplying(false);
        }
    };

    const handleClose = async () => {
        if (!window.confirm('Are you satisfied with the support? This will close the ticket.')) return;

        setClosing(true);
        try {
            const res = await closeSupportTicket(token, ticketId);
            if (res?.success) {
                toast.success('Ticket closed');
                setTicket(res.supportTicket || res.data || ticket);
                await load();
            } else {
                toast.error(res?.message || 'Failed to close ticket');
            }
        } catch (err) {
            toast.error('Failed to close ticket');
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
                <Link href="/account/support" className="text-[#037166] font-semibold hover:underline">
                    Back to tickets
                </Link>
            </div>
        );
    }

    const closed = isTicketClosed(ticket);
    const replies = ticket.replies || ticket.messages || [];

    return (
        <div className="space-y-6">
            <Link
                href="/account/support"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#037166] hover:underline"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Tickets
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                        <p className="text-xs font-bold font-mono text-[#037166] mb-1">{ticket.ticketId}</p>
                        <h1 className="text-xl font-extrabold text-gray-900">{ticket.title}</h1>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        closed ? 'bg-[#037166]/10 text-[#037166]' : 'bg-amber-100 text-amber-700'
                    }`}>
                        {ticket.status}
                    </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {ticket.date} {ticket.time ? `• ${ticket.time}` : ''}
                    </span>
                    {ticket.department && <span>Dept: {ticket.department}</span>}
                </div>

                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>

                {ticket.attachment && (
                    <a
                        href={resolveMediaUrl(ticket.attachment)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 text-sm font-semibold text-[#037166] hover:underline"
                    >
                        View Attachment
                    </a>
                )}

                {!closed && (
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={closing}
                        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-60"
                    >
                        {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Close Ticket
                    </button>
                )}
            </motion.div>

            {replies.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#037166]" />
                        <h2 className="font-bold text-gray-900">Conversation</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {replies.map((msg, idx) => (
                            <div key={msg._id || idx} className="p-4">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="text-xs font-bold text-gray-700">
                                        {msg.senderRole === 'admin' || msg.isAdmin ? 'Support Team' : 'You'}
                                    </span>
                                    <span className="text-xs text-gray-400">{msg.date || msg.createdAt || ''}</span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message || msg.reply}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!closed && (
                <form onSubmit={handleReply} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Add Reply</label>
                    <textarea
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#037166]/40 resize-none"
                        placeholder="Type your message..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={replying || !reply.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#037166] text-white text-sm font-semibold rounded-xl hover:bg-[#025951] disabled:opacity-60"
                    >
                        {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Reply
                    </button>
                </form>
            )}
        </div>
    );
}
