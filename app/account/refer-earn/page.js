'use client';

import { useEffect, useState, useCallback } from 'react';
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

function getStatusStyle(status = '') {
    const normalized = String(status).toLowerCase();
    if (normalized.includes('credited')) return 'bg-green-100 text-green-700';
    if (normalized.includes('completed')) return 'bg-blue-100 text-blue-700';
    return 'bg-amber-100 text-amber-700';
}

export default function ReferEarnPage() {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const load = useCallback(() => {
        if (!token) return;
        setLoading(true);
        fetchReferralDetails(token)
            .then((details) => {
                setData(details);
            })
            .catch((e) => {
                console.error('Failed to load referral details:', e);
                toast.error('Failed to load referral details');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [token]);

    useEffect(() => {
        if (!token) return;
        let active = true;
        fetchReferralDetails(token)
            .then((details) => {
                if (active) setData(details);
            })
            .catch((e) => {
                console.error('Failed to load referral details:', e);
                toast.error('Failed to load referral details');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [token]);

    const referralCode =
        (String(data?.referralCode || user?.referalCode || user?.referralCode || user?.phone || '')
            .trim()
            .match(/^[A-Za-z0-9_-]+/)?.[0] || ''
        ).toUpperCase();

    const rewardAmount = Number.isFinite(Number(data?.rewardAmount)) ? Number(data.rewardAmount) : 99;
    const referrals = Array.isArray(data?.referrals) ? data.referrals : [];
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
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-extrabold text-gray-900">Refer & Earn</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Invite friends and earn rewards on their first booking</p>
                </div>
                <button
                    type="button"
                    onClick={load}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#037166] hover:bg-[#037166]/5"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-7 h-7 animate-spin text-[#037166]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-4 h-4 text-[#037166]" />
                            <h2 className="text-sm font-bold text-gray-900">Your Referral Code</h2>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                            Share your code. Earn Rs {rewardAmount} after each referred customer completes their first successful booking.
                        </p>

                        <div className="bg-[#037166]/5 border border-[#037166]/20 rounded-xl p-3 text-center mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Referral Code</p>
                            <p className="text-2xl font-extrabold text-[#037166] tracking-wider font-mono">
                                {referralCode || '---'}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={handleWhatsApp}
                                className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border border-[#037166]/30 text-[#037166] text-xs font-semibold hover:bg-[#037166]/5 transition-all"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                WhatsApp
                            </button>
                            <button
                                type="button"
                                onClick={handleShare}
                                className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-[#037166] text-white text-xs font-semibold hover:bg-[#025951] transition-all"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                                Share
                            </button>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-all"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                Copy
                            </button>
                        </div>
                    </motion.div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white border border-gray-200 rounded-xl p-3">
                                <IndianRupee className="w-4 h-4 text-[#037166] mb-1.5" />
                                <p className="text-lg font-extrabold text-gray-900">₹{Number(data?.totalEarnings ?? 0).toFixed(2)}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">Total Earnings</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-3">
                                <Users className="w-4 h-4 text-[#037166] mb-1.5" />
                                <p className="text-lg font-extrabold text-gray-900">{data?.totalReferrals ?? 0}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">Referred Users</p>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900">Referral History</h3>
                                <span className="text-[11px] font-semibold text-gray-500">{referrals.length} total</span>
                            </div>

                            {!referrals.length ? (
                                <div className="px-4 py-8 text-center">
                                    <Gift className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-gray-900 mb-0.5">No referrals yet</p>
                                    <p className="text-xs text-gray-500">Share your code to start earning rewards.</p>
                                </div>
                            ) : (
                                <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
                                    {referrals.map((item, idx) => (
                                        <div key={item.id || item._id || idx} className="px-4 py-3">
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                                        {item.name || 'Customer'}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500">{item.phone || 'No phone'}</p>
                                                </div>
                                                <span
                                                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${getStatusStyle(item.status)}`}
                                                >
                                                    {item.status || 'Pending'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-gray-500">
                                                <span>Reward: ₹{Number(item.rewardAmount || 0).toFixed(2)}</span>
                                                <span>Earned: ₹{Number(item.earnedAmount || 0).toFixed(2)}</span>
                                                <span>Joined: {formatDate(item.appliedAt)}</span>
                                                <span>Qualified: {formatDate(item.firstQualifiedAt)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
