'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
    Wallet,
    TrendingUp,
    Clock,
    ArrowDownRight,
    ArrowUpRight,
    RefreshCw,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Info,
    Search,
    Copy,
    Check,
    ArrowRight,
    ExternalLink,
    ShieldCheck,
    Banknote,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import {
    getProviderWalletDetails,
    getProviderWalletHistory,
    requestProviderWithdrawal,
} from '@/lib/providerAuthApi';

function formatCurrency(amount) {
    const n = Number(amount || 0);
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    } catch {
        return String(dateStr);
    }
}

export default function PartnerWalletPage() {
    const { token } = useProviderAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [walletData, setWalletData] = useState({
        walletAmount: 0,
        walletId: '',
    });
    const [credits, setCredits] = useState([]);
    const [debits, setDebits] = useState([]);
    const [activeTab, setActiveTab] = useState('credits'); // 'credits' | 'debits'
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedWalletId, setCopiedWalletId] = useState(false);
    const [copiedTxnId, setCopiedTxnId] = useState(null);

    // Withdrawal modal
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawError, setWithdrawError] = useState('');
    const [withdrawSuccess, setWithdrawSuccess] = useState('');

    const loadData = useCallback(async (isRefresh = false) => {
        if (!token) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const [detailsRes, historyRes] = await Promise.all([
                getProviderWalletDetails(token).catch(() => null),
                getProviderWalletHistory(token).catch(() => null),
            ]);

            const profileData = detailsRes?.data || detailsRes || {};
            setWalletData({
                walletAmount: Number(profileData.walletAmount || profileData.wallet || 0),
                walletId: profileData.walletId || '',
            });

            const histData = historyRes || {};
            const creditList = Array.isArray(histData.creditTransactions) ? histData.creditTransactions : [];
            const debitList = Array.isArray(histData.debitTransactions) ? histData.debitTransactions : [];

            setCredits(creditList);
            setDebits(debitList);
        } catch (err) {
            console.error('Failed to load wallet data:', err);
            toast.error('Unable to fetch latest wallet data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;
        let activeMount = true;
        Promise.all([
            getProviderWalletDetails(token).catch(() => null),
            getProviderWalletHistory(token).catch(() => null),
        ]).then(([detailsRes, historyRes]) => {
            if (!activeMount) return;
            const profileData = detailsRes?.data || detailsRes || {};
            setWalletData({
                walletAmount: Number(profileData.walletAmount || profileData.wallet || 0),
                walletId: profileData.walletId || '',
            });

            const histData = historyRes || {};
            const creditList = Array.isArray(histData.creditTransactions) ? histData.creditTransactions : [];
            const debitList = Array.isArray(histData.debitTransactions) ? histData.debitTransactions : [];

            setCredits(creditList);
            setDebits(debitList);
        }).catch((err) => {
            console.error('Failed to load wallet data:', err);
            if (activeMount) toast.error('Unable to fetch latest wallet data');
        }).finally(() => {
            if (activeMount) {
                setLoading(false);
                setRefreshing(false);
            }
        });
        return () => { activeMount = false; };
    }, [token]);

    const handleCopy = (text, type = 'wallet') => {
        if (!text) return;
        navigator.clipboard.writeText(String(text));
        if (type === 'wallet') {
            setCopiedWalletId(true);
            setTimeout(() => setCopiedWalletId(false), 2000);
            toast.success('Wallet ID copied to clipboard');
        } else {
            setCopiedTxnId(text);
            setTimeout(() => setCopiedTxnId(null), 2000);
            toast.success('Reference ID copied');
        }
    };

    const handleWithdrawSubmit = async (e) => {
        e.preventDefault();
        setWithdrawError('');
        setWithdrawSuccess('');

        const amt = parseFloat(withdrawAmount);
        if (isNaN(amt) || amt < 499) {
            setWithdrawError('Minimum withdrawal amount is ₹499');
            return;
        }

        if (amt > walletData.walletAmount) {
            setWithdrawError(`Amount exceeds available balance (${formatCurrency(walletData.walletAmount)})`);
            return;
        }

        setWithdrawLoading(true);
        try {
            const res = await requestProviderWithdrawal(token, amt);
            setWithdrawSuccess(
                res?.message || 'Withdrawal request submitted! Payout will be processed to your registered bank account in 24 hours.'
            );
            toast.success('Withdrawal request submitted successfully');
            setWithdrawAmount('');
            setTimeout(() => {
                setWithdrawOpen(false);
                setWithdrawSuccess('');
                loadData(true);
            }, 2200);
        } catch (err) {
            setWithdrawError(err.message || 'Failed to submit withdrawal request');
            toast.error(err.message || 'Withdrawal request failed');
        } finally {
            setWithdrawLoading(false);
        }
    };

    // Calculate metrics
    const totalEarnings = useMemo(() => {
        return credits
            .filter((c) => String(c.status || '').toLowerCase() === 'success')
            .reduce((sum, c) => sum + Number(c.amount || 0), 0);
    }, [credits]);

    const isToday = (iso) => {
        if (!iso) return false;
        try {
            const d = new Date(iso);
            if (isNaN(d.getTime())) return false;
            const now = new Date();
            return (
                d.getDate() === now.getDate() &&
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
            );
        } catch {
            return false;
        }
    };

    const todayEarnings = useMemo(() => {
        return credits
            .filter((c) => String(c.status || '').toLowerCase() === 'success' && isToday(c.createdAt || c.logCreatedDate))
            .reduce((sum, c) => sum + Number(c.amount || 0), 0);
    }, [credits]);

    // Filter transactions by search query
    const filteredTransactions = useMemo(() => {
        const list = activeTab === 'credits' ? credits : debits;
        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase().trim();
        return list.filter((tx) => {
            const ref = String(tx.referenceId || '').toLowerCase();
            const remark = String(tx.remark || tx.reason || '').toLowerCase();
            const amt = String(tx.amount || '');
            const status = String(tx.status || '').toLowerCase();
            return ref.includes(q) || remark.includes(q) || amt.includes(q) || status.includes(q);
        });
    }, [activeTab, credits, debits, searchQuery]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[420px] text-center p-6">
                <Loader2 className="w-10 h-10 animate-spin text-[#037166] mb-3" />
                <p className="text-gray-700 font-bold text-sm">Loading Partner Wallet...</p>
                <p className="text-gray-400 text-xs mt-1">Fetching balances, credits, and payout history</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* 1. Header Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#037166] to-[#02524a] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                My Partner Wallet
                            </h1>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                            </span>
                        </div>
                        {walletData.walletId ? (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs text-gray-500 font-medium">Wallet ID:</span>
                                <span className="text-xs font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                    {walletData.walletId}
                                </span>
                                <button
                                    onClick={() => handleCopy(walletData.walletId, 'wallet')}
                                    className="text-gray-500 hover:text-gray-800 transition p-0.5 rounded"
                                    title="Copy Wallet ID"
                                >
                                    {copiedWalletId ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-xs mt-0.5">
                                Track earnings, instant booking credits, and bank withdrawals
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2.5 sm:self-center w-full sm:w-auto">
                    <button
                        onClick={() => loadData(true)}
                        disabled={refreshing}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition shadow-sm disabled:opacity-60"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
                    </button>
                    <button
                        onClick={() => setWithdrawOpen(true)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#037166] hover:bg-[#025c53] text-white rounded-xl text-xs font-black transition shadow-sm hover:shadow"
                    >
                        <Banknote className="w-4 h-4" />
                        <span>Request Payout</span>
                    </button>
                </div>
            </motion.div>

            {/* 2. Key Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {/* Available Balance Card (High-Contrast White Typography) */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#024e47] via-[#036259] to-[#04786d] p-6 text-white shadow-md border border-emerald-900/30"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase font-black tracking-wider text-emerald-200 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                            Available Balance
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-emerald-100">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="mt-3">
                        <div className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
                            {formatCurrency(walletData.walletAmount)}
                        </div>
                        <p className="text-xs text-emerald-100 font-semibold mt-2.5 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                            <span>Ready for instant bank withdrawal</span>
                        </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-200">
                        <span>Min payout: ₹499</span>
                        <button
                            onClick={() => setWithdrawOpen(true)}
                            className="font-bold underline text-white hover:text-emerald-100 transition"
                        >
                            Withdraw now →
                        </button>
                    </div>
                </motion.div>

                {/* Total Lifetime Earnings Card */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl bg-white border border-gray-200/90 p-6 shadow-sm hover:border-gray-300 transition"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase font-bold tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                            Lifetime Earnings
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="mt-3">
                        <div className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                            {formatCurrency(totalEarnings)}
                        </div>
                        <p className="text-xs text-gray-600 font-medium mt-2.5">
                            Cumulative service payouts from completed jobs
                        </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                        <span>Credited transactions</span>
                        <span className="font-bold text-gray-800">{credits.length} credits</span>
                    </div>
                </motion.div>

                {/* Today's Earnings Card */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-2xl bg-white border border-gray-200/90 p-6 shadow-sm hover:border-gray-300 transition sm:col-span-2 lg:col-span-1"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase font-bold tracking-wider text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Today&apos;s Earnings
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="mt-3">
                        <div className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                            {formatCurrency(todayEarnings)}
                        </div>
                        <p className="text-xs text-gray-600 font-medium mt-2.5">
                            Earned today across customer service bookings
                        </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                        <span>Auto-credited on completion</span>
                        <span className="font-bold text-emerald-700">Instant</span>
                    </div>
                </motion.div>
            </div>

            {/* 3. Transactions Activity Feed */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Header Toolbar */}
                <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                        <button
                            onClick={() => setActiveTab('credits')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                                activeTab === 'credits'
                                    ? 'bg-[#037166] text-white shadow-sm'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                            <span>Earnings & Credits</span>
                            <span
                                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                    activeTab === 'credits'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {credits.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('debits')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                                activeTab === 'debits'
                                    ? 'bg-[#037166] text-white shadow-sm'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                            <span>Payouts & Deductions</span>
                            <span
                                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                    activeTab === 'debits'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {debits.length}
                            </span>
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-72 shrink-0">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by Order ID, remark..."
                            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-xl text-xs font-medium text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#037166] focus:border-transparent transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Transaction Rows */}
                <div className="divide-y divide-gray-100">
                    {filteredTransactions.length === 0 ? (
                        <div className="py-16 px-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                                <Info className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800">
                                {searchQuery ? 'No matching transactions' : 'No transactions recorded'}
                            </h3>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                                {searchQuery
                                    ? `No records found matching "${searchQuery}". Try searching for another order or reference ID.`
                                    : activeTab === 'credits'
                                    ? 'Your earnings from completed customer service bookings will appear here instantly.'
                                    : 'Your requested bank withdrawals and payout records will be listed here.'}
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mt-3 px-3 py-1.5 text-xs font-bold text-[#037166] hover:underline"
                                >
                                    Clear search filter
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredTransactions.map((tx) => {
                            const isCredit = activeTab === 'credits';
                            const statusLower = String(tx.status || 'success').toLowerCase();
                            const isSuccess = statusLower === 'success' || statusLower === 'completed';
                            const isPending = statusLower === 'pending' || statusLower === 'processing';
                            const refId = tx.referenceId || tx.tranction_id || '';
                            const isOrderRef = refId.toUpperCase().startsWith('D-HUB-');

                            return (
                                <div
                                    key={tx._id || tx.id || refId}
                                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition"
                                >
                                    {/* Left Details */}
                                    <div className="flex items-start gap-3.5 min-w-0">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                                                isCredit
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                    : 'bg-rose-50 text-rose-600 border border-rose-100'
                                            }`}
                                        >
                                            {isCredit ? (
                                                <ArrowDownRight className="w-5 h-5" />
                                            ) : (
                                                <ArrowUpRight className="w-5 h-5" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm sm:text-base font-bold text-gray-900 leading-snug break-words">
                                                {tx.remark || tx.reason || (isCredit ? 'Service Earning Credit' : 'Withdrawal Payout')}
                                            </p>

                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                {refId && (
                                                    <div className="inline-flex items-center gap-1">
                                                        {isOrderRef ? (
                                                            <Link
                                                                href={`/partner/dashboard/bookings/${refId}`}
                                                                className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#037166] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition"
                                                            >
                                                                <span>{refId}</span>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </Link>
                                                        ) : (
                                                            <span className="text-[11px] font-mono font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                                                                {refId}
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => handleCopy(refId, 'txn')}
                                                            className="text-gray-400 hover:text-gray-700 p-0.5 transition"
                                                            title="Copy Reference ID"
                                                        >
                                                            {copiedTxnId === refId ? (
                                                                <Check className="w-3 h-3 text-emerald-600" />
                                                            ) : (
                                                                <Copy className="w-3 h-3" />
                                                            )}
                                                        </button>
                                                    </div>
                                                )}

                                                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    {formatDate(tx.createdAt || tx.logCreatedDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Amount & Status Badge */}
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:text-right">
                                        <div
                                            className={`text-base sm:text-lg font-black tracking-tight ${
                                                isCredit ? 'text-emerald-700' : 'text-rose-600'
                                            }`}
                                        >
                                            {isCredit ? '+' : '-'}
                                            {formatCurrency(tx.amount)}
                                        </div>

                                        <span
                                            className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1 border ${
                                                isSuccess
                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                    : isPending
                                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}
                                        >
                                            {tx.status || (isSuccess ? 'Success' : 'Pending')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 4. Policy Notice */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
                <ShieldCheck className="w-5 h-5 text-[#037166] shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">
                        Doorstep Hub Partner Wallet Policy
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                        Customer service earnings are credited to your wallet instantly upon OTP job verification. Withdrawals are processed directly to your KYC-verified bank account within 24 business hours. Minimum payout request is ₹499.
                    </p>
                </div>
            </div>

            {/* 5. Withdrawal Modal */}
            <AnimatePresence>
                {withdrawOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative"
                        >
                            <button
                                onClick={() => setWithdrawOpen(false)}
                                className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#037166] flex items-center justify-center mb-4">
                                <Banknote className="w-6 h-6" />
                            </div>

                            <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                Request Bank Payout
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Transferred directly to your registered bank account
                            </p>

                            {/* Available Balance Box */}
                            <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                                        Available Balance
                                    </p>
                                    <p className="text-xl font-black text-emerald-900 mt-0.5">
                                        {formatCurrency(walletData.walletAmount)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setWithdrawAmount(String(Math.floor(walletData.walletAmount)))}
                                    className="text-xs font-bold text-[#037166] bg-white border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition"
                                >
                                    Withdraw All
                                </button>
                            </div>

                            {withdrawError && (
                                <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{withdrawError}</span>
                                </div>
                            )}

                            {withdrawSuccess && (
                                <div className="mt-4 p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs font-semibold text-green-700 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    <span>{withdrawSuccess}</span>
                                </div>
                            )}

                            <form onSubmit={handleWithdrawSubmit} className="mt-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                                        Enter Amount (₹)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-black text-base">
                                            ₹
                                        </span>
                                        <input
                                            type="number"
                                            min="499"
                                            step="1"
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            placeholder="Min. ₹499"
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-base font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#037166] focus:border-transparent transition"
                                            required
                                        />
                                    </div>

                                    {/* Quick chips */}
                                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                                        {[500, 1000, 2000, 5000].map((amt) => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() => setWithdrawAmount(String(amt))}
                                                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
                                            >
                                                ₹{amt.toLocaleString('en-IN')}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-2">
                                        Minimum payout amount is ₹499. No transaction processing fee.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setWithdrawOpen(false)}
                                        disabled={withdrawLoading}
                                        className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={withdrawLoading}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-[#037166] hover:bg-[#025c53] text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        {withdrawLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Confirm Payout Request</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
