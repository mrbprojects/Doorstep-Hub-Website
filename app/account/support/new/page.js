'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, Send, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { createSupportTicket } from '@/lib/accountApi';

const RELATED_OPTIONS = [
    { label: 'Booking Issue', value: 'Booking Ops' },
    { label: 'Payment / Refund', value: 'Billing & Wallet' },
    { label: 'Wallet Issue', value: 'Billing & Wallet' },
    { label: 'Service Quality', value: 'Customer Support' },
    { label: 'Address Issue', value: 'Customer Support' },
    { label: 'Technical Support', value: 'Technical Support' },
    { label: 'General Support', value: 'Customer Support' },
];

const inputCls =
    'w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#037166]/40 focus:border-[#037166] transition-all';
const labelCls = 'block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide';

export default function CreateSupportTicketPage() {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('Customer Support');
    const [attachment, setAttachment] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;

        if (!title.trim() || !description.trim()) {
            toast.error('Please fill in title and description');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            formData.append('subject', title.trim());
            formData.append('department', department);
            if (attachment) formData.append('attachment', attachment);

            const res = await createSupportTicket(token, formData);
            if (res?.success) {
                toast.success('Support ticket created successfully');
                router.push('/account/support');
            } else {
                toast.error(res?.message || 'Failed to create ticket');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Link
                href="/account/support"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#037166] hover:underline"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Tickets
            </Link>

            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Raise Support Ticket</h1>
                <p className="text-sm text-gray-500 mt-1">Describe your booking or service issue</p>
            </div>

            <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-5"
            >
                <div>
                    <label className={labelCls}>Issue Category *</label>
                    <select
                        className={`${inputCls} appearance-none cursor-pointer`}
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                    >
                        {RELATED_OPTIONS.map((opt) => (
                            <option key={opt.value + opt.label} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelCls}>Title *</label>
                    <input
                        type="text"
                        className={inputCls}
                        placeholder="Brief summary of your issue"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className={labelCls}>Description *</label>
                    <textarea
                        rows={5}
                        className={`${inputCls} resize-none`}
                        placeholder="Provide details about your booking, order ID, or issue..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className={labelCls}>Attachment (optional)</label>
                    <label className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50 border border-dashed border-gray-300 cursor-pointer hover:border-[#037166]/40 transition-all">
                        <Upload className="w-4 h-4 text-[#037166]" />
                        <span className="text-sm text-gray-600 truncate">
                            {attachment ? attachment.name : 'Upload image or PDF'}
                        </span>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold rounded-xl shadow-lg shadow-[#037166]/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Ticket
                </button>
            </motion.form>
        </div>
    );
}
