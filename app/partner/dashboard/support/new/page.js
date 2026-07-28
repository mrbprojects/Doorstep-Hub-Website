'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, Send, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import { createProviderSupportTicket } from '@/lib/providerAuthApi';

const RELATED_OPTIONS = [
    { label: 'Booking Issue', value: 'Booking Ops' },
    { label: 'Payments & Wallet', value: 'Billing & Wallet' },
    { label: 'KYC Verification', value: 'KYC & Verification' },
    { label: 'Technical Support', value: 'Technical Support' },
    { label: 'Profile Update', value: 'Provider Support' },
    { label: 'General Support', value: 'Provider Support' },
];

const inputCls = 'w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-[#123F4A] text-sm focus:outline-none focus:ring-2 focus:ring-[#037166]/40';
const labelCls = 'block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide';

export default function PartnerCreateSupportPage() {
    const router = useRouter();
    const { token } = useProviderAuth();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('Provider Support');
    const [attachment, setAttachment] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;
        if (!title.trim() || !description.trim()) {
            toast.error('Please fill title and description');
            return;
        }
        if (!attachment) {
            toast.error('Please attach a screenshot or document');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('subject', title.trim());
            formData.append('description', description.trim());
            formData.append('priority', 'Medium');
            formData.append('department', department);
            formData.append('image', attachment);

            await createProviderSupportTicket(token, formData);
            toast.success('Support ticket created');
            router.push('/partner/dashboard/support');
        } catch (err) {
            toast.error(err.message || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Link href="/partner/dashboard/support" className="inline-flex items-center gap-2 text-sm font-semibold text-[#037166]">
                <ArrowLeft className="w-4 h-4" /> Back to Tickets
            </Link>
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Raise Support Ticket</h1>
                <p className="text-sm text-gray-500 mt-1">Our partner support team will respond shortly</p>
            </div>
            <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-5 shadow-sm">
                <div>
                    <label className={labelCls}>Category</label>
                    <select className={`${inputCls} appearance-none`} value={department} onChange={(e) => setDepartment(e.target.value)}>
                        {RELATED_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <div><label className={labelCls}>Title *</label><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                <div><label className={labelCls}>Description *</label><textarea rows={5} className={`${inputCls} resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} required /></div>
                <div>
                    <label className={labelCls}>Attachment *</label>
                    <label className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50 border border-dashed border-[#123F4A] cursor-pointer">
                        <Upload className="w-4 h-4 text-[#037166]" />
                        <span className="text-sm text-gray-600 truncate">{attachment ? attachment.name : 'Upload image or PDF'}</span>
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
                    </label>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-[#037166] text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Ticket
                </button>
            </motion.form>
        </div>
    );
}
