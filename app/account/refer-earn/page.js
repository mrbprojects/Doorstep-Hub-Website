'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Gift, IndianRupee, Loader2, MessageCircle, RefreshCw, Share2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { fetchReferralDetails } from '@/lib/accountApi';

function formatDate(value) {
    if (!value) return '--';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '--';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReferEarnPage() {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const details = await fetchReferralDetails(token);
            setData(details);
        } catch (e) {
            console.error('Failed to load referral details:', e);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        load();
    }, [load]);

    const referralCode =
        (String(data?.referralCode || user?.referalCode || user?.referralCode || user?.phone || '').trim().match(/^[A-Za-z0-9_-]+/)?.[0] || '').toUpperCase();

    const rewardAmount = Number.isFinite(Number(data?.rewardAmount)) ? Number(data.rewardAmount) : 99;
    const inviteLink = `https://doorstephub.com?ref=${referralCode || user?.phone || ''}`;

    const shareMessage =
        `Join Doorstep Hub with my referral code ${referralCode}. ` +
        `You can earn Rs ${rewardAmount} after your first successful booking.\n\n` +
        `Sign up here: ${inviteLink}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        toast.success('Referral link copied!');
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Doorstep Hub Referral', text: shareMessage, url: inviteLink });
                return;
            } catch {
                /* fall through */
            }
        }
        handleCopy();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Refer & Earn</h1>
                    <p className="text-sm text-gray-500 mt-1">Invite friends and earn rewards on their first booking</p>
                </div>
                <button
                    type="button"
                    onClick={load}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#037166] hover:bg-[#037166]/5"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
                </div>
            ) : (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Gift className="w-6 h-6 text-[#037166]" />
                            <h2 className="text-lg font-bold text-gray-900">Your Referral Code</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Share your code. Earn Rs {rewardAmount} after each referred customer completes their first successful booking.
                        </p>

                        <div className="bg-[#037166]/5 border border-[#037166]/20 rounded-2xl p-6 text-center mb-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Referral Code</p>
                            <p className="text-3xl md:text-4xl font-extrabold text-[#037166] tracking-wider font-mono">
                                {referralCode || '---'}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={handleWhatsApp}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#037166]/30 text-[#037166] font-semibold hover:bg-[#037166]/5 transition-all"
                            >
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                            </button>
                            <button
                                type="button"
                                onClick={handleShare}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#037166] text-white font-semibold hover:bg-[#025951] transition-all"
                            >
                                <Share2 className="w-4 h-4" />
                                Share Link
                            </button>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                            >
                                <Copy className="w-4 h-4" />
                                Copy Link
                            </button>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <IndianRupee className="w-5 h-5 text-[#037166] mb-3" />
                            <p className="text-2xl font-extrabold text-gray-900">₹{(data?.totalEarnings ?? 0).toFixed(2)}</p>
                            <p className="text-sm text-gray-500 mt-1">Total Earnings</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <Users className="w-5 h-5 text-[#037166] mb-3" />
                            <p className="text-2xl font-extrabold text-gray-900">{data?.totalReferrals ?? 0}</p>
                            <p className="text-sm text-gray-500 mt-1">Referred Users</p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Referral History</h3>
                        </div>
                        {!data?.referrals?.length ? (
                            <div className="p-12 text-center">
                                <Gift className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="font-semibold text-gray-900 mb-1">No referrals yet</p>
                                <p className="text-sm text-gray-500">Share your code to start earning rewards.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {data.referrals.map((item) => (
                                    <div key={item.id} className="p-5">
                                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-900">{item.name || 'Customer'}</p>
                                                <p className="text-xs text-gray-500">{item.phone || 'No phone'}</p>
                                            </div>
                                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[#037166]/10 text-[#037166]">
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                            <span>Reward: ₹{Number(item.rewardAmount || 0).toFixed(2)}</span>
                                            <span>Earned: ₹{Number(item.earnedAmount || 0).toFixed(2)}</span>
                                            <span>Joined: {formatDate(item.appliedAt)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
