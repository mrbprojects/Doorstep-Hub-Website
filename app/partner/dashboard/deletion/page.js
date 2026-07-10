'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, CheckCircle, Loader2, ShieldAlert, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import { getMyProviderCategories, requestProviderDeleteAccount } from '@/lib/providerAuthApi';

const REASONS = [
    'Joining other platform',
    'Poor lead quality',
    'App is too complicated',
    'Moving to another location',
    'Personal reasons',
    'Other',
];

export default function PartnerDeletionPage() {
    const { token, logout } = useProviderAuth();
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [reason, setReason] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!token) return;
        getMyProviderCategories(token)
            .then((res) => {
                const data = res?.data || res?.result || res || [];
                setCategories(Array.isArray(data) ? data : []);
            })
            .catch(console.error)
            .finally(() => setFetching(false));
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCategory) return toast.error('Please select a service category');
        if (!reason) return toast.error('Please select a reason');

        setLoading(true);
        try {
            const res = await requestProviderDeleteAccount(token, {
                serviceCategory: selectedCategory,
                reason,
                comment,
            });
            if (res?.success !== false) {
                setSubmitted(true);
                toast.success('Account deletion request submitted');
            } else {
                toast.error(res?.message || 'Failed to submit request');
            }
        } catch (err) {
            toast.error(err.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#037166]" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Account Deletion</h1>
                <p className="text-sm text-gray-500 mt-1">Request permanent deletion of your partner account (processed by admin within 14 days)</p>
            </div>

            <AnimatePresence mode="wait">
                {submitted ? (
                    <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#037166]/20 rounded-2xl p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-[#037166] mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Request Submitted</h2>
                        <p className="text-gray-600 text-sm max-w-md mx-auto mb-4">
                            Your account deletion request has been stored and will be reviewed by our admin team. Processing typically takes up to 14 days.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#037166]/10 text-[#037166] text-sm font-semibold">
                            <Clock className="w-4 h-4" /> Admin review in progress
                        </div>
                        <button type="button" onClick={logout} className="mt-6 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl">Sign Out</button>
                    </motion.div>
                ) : (
                    <motion.form key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-5 shadow-sm">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700">Deletion is permanent. Wallet balance, bookings history, and profile data will be removed after admin approval.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Service Category *</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.length === 0 ? (
                                    <p className="text-sm text-gray-500">No categories found on your account.</p>
                                ) : (
                                    categories.map((item, i) => {
                                        const name = item.categoryName || item.name || item.categoryId?.name;
                                        if (!name) return null;
                                        const selected = selectedCategory === name;
                                        return (
                                            <button key={i} type="button" onClick={() => setSelectedCategory(name)} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${selected ? 'bg-[#037166] text-white border-[#037166]' : 'bg-white text-gray-700 border-gray-200'}`}>
                                                {name}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Reason *</label>
                            <div className="space-y-2">
                                {REASONS.map((r) => (
                                    <label key={r} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                                        <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-[#037166]" />
                                        <span className="text-sm text-gray-800">{r}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Additional Comments</label>
                            <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-sm resize-none" placeholder="Optional details..." value={comment} onChange={(e) => setComment(e.target.value)} />
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Submit Deletion Request
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
