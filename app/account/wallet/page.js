'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    CreditCard,
    Layers,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    Sparkles,
    Wallet,
    X,
    XCircle,
    Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
    fetchWalletBalance,
    fetchWalletTransactions,
    initiateWalletTopup,
    fetchWalletTopupStatus,
} from '@/lib/accountApi';

const PRESET_AMOUNTS = [100, 200, 500, 1000, 2000];

function getEventMeta(event, isCredit, rawRemark) {
    const ev = String(event || '').toLowerCase().trim();

    switch (ev) {
        case 'wallet_topup':
            return {
                title: 'Wallet Recharge',
                category: 'Top-up',
                defaultDesc: 'Money added to wallet via payment gateway',
            };
        case 'order_payment':
            return {
                title: 'Service Booking Payment',
                category: 'Booking',
                defaultDesc: 'Payment used for doorstep service booking',
            };
        case 'quotation_payment':
            return {
                title: 'Quotation Payment',
                category: 'Service',
                defaultDesc: 'Payment for service quote or spare parts',
            };
        case 'refund':
            return {
                title: 'Booking Refund',
                category: 'Refund',
                defaultDesc: 'Refund credited back to wallet',
            };
        case 'referral_reward':
            return {
                title: 'Referral Bonus',
                category: 'Reward',
                defaultDesc: 'Bonus credited for inviting friends',
            };
        case 'bonus':
            return {
                title: 'Promotional Bonus',
                category: 'Bonus',
                defaultDesc: 'Promotional reward credited to wallet',
            };
        case 'cashback':
            return {
                title: 'Cashback Credited',
                category: 'Cashback',
                defaultDesc: 'Cashback reward on service order',
            };
        case 'cancellation_fee':
            return {
                title: 'Cancellation Platform Fee',
                category: 'Fee',
                defaultDesc: 'Fee deducted for booking cancellation',
            };
        case 'admin_credit':
            return {
                title: 'Admin Adjustment (Credit)',
                category: 'Support',
                defaultDesc: 'Balance credited by support team',
            };
        case 'admin_debit':
            return {
                title: 'Admin Adjustment (Debit)',
                category: 'Support',
                defaultDesc: 'Balance adjusted by support team',
            };
        default:
            return {
                title: rawRemark || (isCredit ? 'Wallet Credit' : 'Wallet Debit'),
                category: isCredit ? 'Credit' : 'Debit',
                defaultDesc: isCredit ? 'Amount credited to wallet' : 'Amount deducted from wallet',
            };
    }
}

function normalizeTransactions(data) {
    const raw =
        data?.transactions ||
        data?.wallets ||
        data?.creditTransactions ||
        [];

    if (!Array.isArray(raw)) return [];

    return raw.map((t) => {
        const event = String(t.event ?? '').toLowerCase();
        const remark = t.remark ?? t.reason ?? t.description ?? '';
        const isCredit =
            t.transactionType === 'credit' ||
            t.type === 'credit' ||
            ['wallet_topup', 'service_earning', 'bonus', 'cashback', 'referral_reward', 'admin_credit', 'refund'].includes(event);

        const meta = getEventMeta(event, isCredit, remark);

        return {
            id: t.transactionId ?? t._id ?? t.generateId ?? String(Math.random()),
            referenceId: t.referenceId || t.txnid || '',
            type: event === 'wallet_topup' ? 'topup' : isCredit ? 'credit' : 'debit',
            isCredit,
            event,
            category: meta.category,
            title: meta.title,
            description: remark || meta.defaultDesc,
            amount: Math.abs(Number(t.amount ?? 0)),
            balanceBefore: t.balanceBefore != null ? Number(t.balanceBefore) : null,
            balanceAfter: t.balanceAfter != null ? Number(t.balanceAfter) : null,
            date: t.createdAt ?? t.logCreatedDate ?? '',
            status: String(t.status ?? 'success').toLowerCase(),
        };
    });
}

function formatDateTime(value) {
    if (!value) return { date: '--', time: '' };
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return { date: String(value), time: '' };

    const date = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const time = d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return { date, time };
}

function formatCurrency(num) {
    const n = Number(num || 0);
    return n.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function WalletPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [balance, setBalance] = useState(0);
    const [walletId, setWalletId] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [tab, setTab] = useState('all'); // 'all' | 'credits' | 'debits'
    const [searchQuery, setSearchQuery] = useState('');

    // Top-up Modal State
    const [topupModalOpen, setTopupModalOpen] = useState(false);
    const [topupAmount, setTopupAmount] = useState('500');
    const [topupLoading, setTopupLoading] = useState(false);
    const [copiedWalletId, setCopiedWalletId] = useState(false);
    const [resultModal, setResultModal] = useState(null);

    const load = useCallback(
        async (isManualRefresh = false) => {
            if (!token) return;
            if (isManualRefresh) setRefreshing(true);
            else setLoading(true);

            try {
                const [balRes, txRes] = await Promise.all([
                    fetchWalletBalance(token).catch(() => null),
                    fetchWalletTransactions(token).catch(() => null),
                ]);

                if (balRes?.success && balRes.wallet) {
                    setBalance(Number(balRes.wallet.currentBalance ?? 0));
                    setWalletId(balRes.wallet.walletId || '');
                }

                if (txRes?.success) {
                    setTransactions(normalizeTransactions(txRes));
                }
            } catch (err) {
                console.error('Wallet load error:', err);
                toast.error('Failed to load wallet data');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [token]
    );

    useEffect(() => {
        if (!token) return;
        let active = true;
        Promise.all([
            fetchWalletBalance(token).catch(() => null),
            fetchWalletTransactions(token).catch(() => null),
        ])
            .then(([balRes, txRes]) => {
                if (!active) return;
                if (balRes?.success && balRes.wallet) {
                    setBalance(Number(balRes.wallet.currentBalance ?? 0));
                    setWalletId(balRes.wallet.walletId || '');
                }
                if (txRes?.success) {
                    setTransactions(normalizeTransactions(txRes));
                }
            })
            .catch((err) => {
                if (active) {
                    console.error('Wallet load error:', err);
                    toast.error('Failed to load wallet data');
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                    setRefreshing(false);
                }
            });
        return () => {
            active = false;
        };
    }, [token]);

    // Handle payment return status from Easebuzz gateway
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        const txnid = params.get('txnid') || params.get('orderId');

        if (!status) return;

        window.history.replaceState({}, '', window.location.pathname);

        if (status === 'success') {
            if (token && txnid) {
                fetchWalletTopupStatus(token, txnid).catch(() => null);
            }
            queueMicrotask(() => {
                load(true);
                setResultModal({
                    type: 'success',
                    title: 'Top-up Successful!',
                    desc: 'Your wallet has been credited successfully.',
                    txnid
                });
            });
        } else if (status === 'cancelled' || status === 'cancel') {
            queueMicrotask(() => {
                setResultModal({
                    type: 'cancelled',
                    title: 'Payment Cancelled',
                    desc: 'You cancelled the transaction at the payment gateway. No money was deducted from your account.',
                    txnid
                });
            });
        } else if (status === 'failure' || status === 'failed') {
            queueMicrotask(() => {
                setResultModal({
                    type: 'failure',
                    title: 'Top-up Failed',
                    desc: 'Payment could not be completed by your bank/gateway. If any money was deducted, it will be refunded within 3-5 working days.',
                    txnid
                });
            });
        } else if (status === 'pending') {
            queueMicrotask(() => {
                setResultModal({
                    type: 'pending',
                    title: 'Payment Verification in Progress',
                    desc: 'Your payment is being confirmed with the bank. Your balance will update automatically once verified.',
                    txnid
                });
            });
        }
    }, [token, load]);

    // Copy Wallet ID
    const handleCopyWalletId = () => {
        if (!walletId) return;
        navigator.clipboard.writeText(walletId);
        setCopiedWalletId(true);
        toast.success('Wallet ID copied to clipboard');
        setTimeout(() => setCopiedWalletId(false), 2000);
    };

    // Calculate Summary Metrics
    const metrics = useMemo(() => {
        let totalCredits = 0;
        let totalDebits = 0;
        let creditCount = 0;
        let debitCount = 0;

        for (const t of transactions) {
            if (t.isCredit) {
                totalCredits += t.amount;
                creditCount += 1;
            } else {
                totalDebits += t.amount;
                debitCount += 1;
            }
        }

        return {
            totalCredits,
            totalDebits,
            creditCount,
            debitCount,
            totalCount: transactions.length,
        };
    }, [transactions]);

    // Filter Transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            if (tab === 'credits' && !t.isCredit) return false;
            if (tab === 'debits' && t.isCredit) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchTitle = t.title.toLowerCase().includes(q);
                const matchDesc = t.description.toLowerCase().includes(q);
                const matchRef = t.referenceId.toLowerCase().includes(q);
                const matchCat = t.category.toLowerCase().includes(q);
                return matchTitle || matchDesc || matchRef || matchCat;
            }

            return true;
        });
    }, [transactions, tab, searchQuery]);

    // Handle Initiate Topup via Easebuzz
    const handleInitiateTopup = async (e) => {
        e.preventDefault();
        const amt = Number(topupAmount);

        if (!amt || isNaN(amt) || amt < 10) {
            toast.error('Please enter a valid amount (Minimum ₹10)');
            return;
        }

        if (amt > 50000) {
            toast.error('Maximum top-up limit per transaction is ₹50,000');
            return;
        }

        setTopupLoading(true);
        try {
            const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/account/wallet` : '';
            const res = await initiateWalletTopup(token, amt, returnUrl);
            if (res?.success && res.access_key) {
                try {
                    sessionStorage.setItem('last_checkout_url', '/account/wallet');
                } catch {}
                toast.success('Redirecting to secure Easebuzz payment gateway...');
                const easebuzzUrl = res.paymentUrl || `https://pay.easebuzz.in/pay/${res.access_key}`;
                window.location.href = easebuzzUrl;
            } else {
                toast.error(res?.message || 'Failed to initiate recharge. Please try again.');
            }
        } catch (err) {
            console.error('Wallet topup error:', err);
            toast.error(err?.message || 'Payment initiation error');
        } finally {
            setTopupLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight flex items-center gap-2.5">
                        <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-[#037166]" />
                        D-Hub Wallet
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Instant payment, hassle-free booking checkout, and seamless automatic refunds.
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => load(true)}
                        disabled={refreshing || loading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 text-xs sm:text-sm font-bold text-gray-700 transition-all shadow-2xs disabled:opacity-60"
                        title="Refresh wallet balance and transaction list"
                    >
                        <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin text-[#037166]' : ''}`} />
                        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setTopupModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#037166] hover:bg-[#025c53] active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add Money</span>
                    </button>
                </div>
            </div>

            {/* Hero Available Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#004D40] via-[#037166] to-[#048679] p-5 sm:p-7 md:p-8 text-white shadow-lg border border-teal-800"
            >
                {/* Decorative background glows */}
                <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-teal-300/15 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between gap-6">
                    {/* Top Row: Verified Badge & Wallet ID */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-2xs">
                            <ShieldCheck className="w-4 h-4 text-emerald-300" />
                            <span>Verified Customer Wallet</span>
                        </div>
                        {walletId && (
                            <button
                                type="button"
                                onClick={handleCopyWalletId}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/30 backdrop-blur-xs text-white/90 text-xs font-mono font-medium transition-colors border border-white/15 active:scale-95"
                                title="Click to copy Wallet ID"
                            >
                                <span>ID: {walletId.slice(-10)}</span>
                                {copiedWalletId ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5 text-white/80" />
                                )}
                            </button>
                        )}
                    </div>

                    {/* Middle Row: Balance Display */}
                    <div className="space-y-1 sm:space-y-2">
                        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                            Total Available Balance
                        </p>
                        {loading ? (
                            <div className="flex items-center gap-3 py-2">
                                <Loader2 className="w-8 h-8 animate-spin text-white" />
                                <span className="text-sm font-medium text-white/80">Fetching balance...</span>
                            </div>
                        ) : (
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
                                    ₹{formatCurrency(balance)}
                                </span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                                    Active &amp; Ready
                                </span>
                            </div>
                        )}
                        <p className="text-xs sm:text-sm text-emerald-50/90 font-medium pt-1">
                            Use wallet balance directly during checkout on any home, appliance, or personal service booking.
                        </p>
                    </div>

                    {/* Bottom Row: Quick Action CTA & Badges */}
                    <div className="pt-2 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => setTopupModalOpen(true)}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#037166] hover:bg-emerald-50 active:scale-95 font-bold text-xs sm:text-sm shadow-md transition-all"
                            >
                                <Plus className="w-4 h-4 stroke-[3]" />
                                <span>Recharge Wallet</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => load(true)}
                                disabled={refreshing}
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                                <span className="hidden xs:inline">Check Balance</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold text-emerald-100 flex-wrap">
                            <span className="inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                                100% Usable on Bookings
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                                Instant Checkout
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Total Credited */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                        <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 truncate">
                            Total Credited
                        </p>
                        <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-emerald-700 truncate">
                            +₹{formatCurrency(metrics.totalCredits)}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium">
                            {metrics.creditCount} credit {metrics.creditCount === 1 ? 'event' : 'events'}
                        </p>
                    </div>
                </div>

                {/* Total Spent */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                        <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 truncate">
                            Total Spent
                        </p>
                        <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 truncate">
                            -₹{formatCurrency(metrics.totalDebits)}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium">
                            {metrics.debitCount} debit {metrics.debitCount === 1 ? 'event' : 'events'}
                        </p>
                    </div>
                </div>

                {/* Total Activity */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-[#037166] shrink-0">
                        <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 truncate">
                            Activity History
                        </p>
                        <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 truncate">
                            {metrics.totalCount} {metrics.totalCount === 1 ? 'Record' : 'Records'}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium">
                            All wallet logs
                        </p>
                    </div>
                </div>
            </div>

            {/* Transaction Statement Card */}
            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
                {/* Statement Header */}
                <div className="p-4 sm:p-5 md:p-6 border-b border-gray-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-gray-950 flex items-center gap-2">
                                <span>Statement &amp; History</span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                    {filteredTransactions.length}
                                </span>
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                Real-time statement of credits, debits, recharges, and refunds
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search statement..."
                                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#037166]/20 focus:border-[#037166] text-gray-900 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                        {[
                            { key: 'all', label: 'All Transactions', count: metrics.totalCount },
                            { key: 'credits', label: 'Credits & Top-ups', count: metrics.creditCount },
                            { key: 'debits', label: 'Debits & Payments', count: metrics.debitCount },
                        ].map((item) => {
                            const active = tab === item.key;
                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => setTab(item.key)}
                                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 active:scale-95 ${
                                        active
                                            ? 'bg-[#037166] text-white shadow-2xs'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                    <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                                            active
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}
                                    >
                                        {item.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Transaction Rows */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#037166] mb-3" />
                        <p className="text-sm font-bold text-gray-900">Loading transactions...</p>
                        <p className="text-xs text-gray-500">Fetching your secure transaction logs</p>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="py-16 px-4 text-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 mx-auto">
                            <Wallet className="w-7 h-7" />
                        </div>
                        <p className="text-base font-bold text-gray-900">
                            {searchQuery ? 'No matching transactions found' : 'No transactions recorded yet'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                            {searchQuery
                                ? `No results found for "${searchQuery}". Try searching with another term.`
                                : 'When you recharge your wallet or book services, your detailed transaction statements will appear here.'}
                        </p>
                        {!searchQuery && (
                            <button
                                type="button"
                                onClick={() => setTopupModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#037166] text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-[#025c53] transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Recharge Wallet</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredTransactions.map((tx) => {
                            const { date, time } = formatDateTime(tx.date);
                            const isCredit = tx.isCredit;

                            return (
                                <div
                                    key={tx.id}
                                    className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                                >
                                    {/* Left: Icon & Description */}
                                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                        <div
                                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                                                isCredit
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}
                                        >
                                            {isCredit ? (
                                                <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                                            ) : (
                                                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1 space-y-1">
                                            {/* Title & Tag */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-sm sm:text-base font-bold text-gray-950 truncate">
                                                    {tx.title}
                                                </h3>
                                                <span
                                                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                                        isCredit
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {tx.category}
                                                </span>
                                            </div>

                                            {/* Description / Remark */}
                                            {tx.description && (
                                                <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 leading-snug">
                                                    {tx.description}
                                                </p>
                                            )}

                                            {/* Metadata: Date, Time & Reference ID */}
                                            <div className="flex items-center gap-2.5 flex-wrap pt-0.5 text-xs text-gray-500 font-medium">
                                                <span className="inline-flex items-center gap-1 text-gray-600">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span>{date}</span>
                                                    {time && <span className="text-gray-400">• {time}</span>}
                                                </span>

                                                {tx.referenceId && (
                                                    <span className="font-mono text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold">
                                                        Ref: {tx.referenceId}
                                                    </span>
                                                )}

                                                {tx.balanceAfter != null && (
                                                    <span className="text-[11px] text-gray-500 hidden md:inline">
                                                        Bal: ₹{formatCurrency(tx.balanceAfter)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Amount & Status Badge */}
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pl-14 sm:pl-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                        <div
                                            className={`text-base sm:text-lg font-black tracking-tight ${
                                                isCredit ? 'text-emerald-700' : 'text-gray-950'
                                            }`}
                                        >
                                            {isCredit ? '+' : '-'}₹{formatCurrency(tx.amount)}
                                        </div>

                                        {/* Status Pill */}
                                        <div className="mt-0.5 sm:mt-1">
                                            {tx.status === 'success' ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    <span>Success</span>
                                                </span>
                                            ) : tx.status === 'pending' ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                                    <Clock className="w-3 h-3 text-amber-600" />
                                                    <span>Pending</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                                    <XCircle className="w-3 h-3 text-rose-600" />
                                                    <span>{tx.status}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Wallet Advantages / Educational Info */}
            <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
                <h3 className="text-sm sm:text-base font-extrabold text-gray-950 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#037166]" />
                    Why use D-Hub Wallet?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-1">
                        <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#037166]" />
                            1-Click Fast Checkout
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            No OTP waiting or net banking delays. Seamlessly pay for bookings with 1-click debit.
                        </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-1">
                        <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#037166]" />
                            Instant Refunds
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Any cancellation or quotation adjustments credit straight back to your wallet instantly.
                        </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-1">
                        <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-[#037166]" />
                            Combine with Cards / UPI
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Use partial wallet balance and pay the remainder seamlessly with online payment.
                        </p>
                    </div>
                </div>
            </div>

            {/* Add Money / Top-up Modal */}
            <AnimatePresence>
                {topupModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-white">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-[#037166]/10 flex items-center justify-center text-[#037166]">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base sm:text-lg font-extrabold text-gray-950">
                                            Recharge Wallet
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            Add money to your D-Hub account
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setTopupModalOpen(false)}
                                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleInitiateTopup} className="p-5 sm:p-6 space-y-5">
                                {/* Current Balance Indicator */}
                                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-600">Current Balance</span>
                                    <span className="text-sm font-extrabold text-[#037166]">
                                        ₹{formatCurrency(balance)}
                                    </span>
                                </div>

                                {/* Amount Input */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="wallet-topup-input"
                                        className="block text-xs font-bold uppercase tracking-wider text-gray-700"
                                    >
                                        Enter Amount (₹)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-extrabold text-gray-400 pointer-events-none">
                                            ₹
                                        </span>
                                        <input
                                            id="wallet-topup-input"
                                            type="number"
                                            min="10"
                                            max="50000"
                                            step="1"
                                            value={topupAmount}
                                            onChange={(e) => setTopupAmount(e.target.value)}
                                            placeholder="500"
                                            className="w-full pl-9 pr-4 py-3 text-xl font-black text-gray-950 rounded-xl border border-gray-200 focus:border-[#037166] focus:ring-2 focus:ring-[#037166]/20 focus:outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500">
                                        Min ₹10 • Max ₹50,000 per recharge
                                    </p>
                                </div>

                                {/* Preset Amount Buttons */}
                                <div className="space-y-1.5">
                                    <span className="text-xs font-semibold text-gray-600">Popular amounts:</span>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {PRESET_AMOUNTS.map((amt) => {
                                            const isSelected = Number(topupAmount) === amt;
                                            return (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => setTopupAmount(String(amt))}
                                                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all active:scale-95 ${
                                                        isSelected
                                                            ? 'bg-[#037166] text-white border-[#037166] shadow-xs'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    +₹{amt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Security Note */}
                                <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100 flex items-start gap-2.5 text-xs text-teal-900">
                                    <ShieldCheck className="w-4 h-4 text-[#037166] shrink-0 mt-0.5" />
                                    <span>
                                        Protected by 256-bit encryption. UPI, Credit/Debit cards, Net Banking &amp; Wallets supported via Easebuzz.
                                    </span>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2 flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTopupModalOpen(false)}
                                        className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-50 active:scale-95 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={topupLoading || !Number(topupAmount)}
                                        className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#037166] hover:bg-[#025c53] active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all disabled:opacity-60"
                                    >
                                        {topupLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Connecting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4 stroke-[3]" />
                                                <span>Pay ₹{topupAmount || '0'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Gateway Result Modal */}
                {resultModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                            onClick={() => setResultModal(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-gray-100 p-6 sm:p-7 text-center space-y-4"
                        >
                            <div className="mx-auto flex items-center justify-center">
                                {resultModal.type === 'success' && (
                                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                )}
                                {resultModal.type === 'cancelled' && (
                                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                        <XCircle className="w-10 h-10" />
                                    </div>
                                )}
                                {resultModal.type === 'failure' && (
                                    <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                        <XCircle className="w-10 h-10" />
                                    </div>
                                )}
                                {resultModal.type === 'pending' && (
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Clock className="w-10 h-10" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <h3 className="text-xl font-black text-gray-950">
                                    {resultModal.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                    {resultModal.desc}
                                </p>
                                {resultModal.txnid && (
                                    <p className="text-[11px] font-mono text-gray-400 pt-1">
                                        Ref: {resultModal.txnid}
                                    </p>
                                )}
                            </div>

                            <div className="pt-2 flex items-center gap-2.5">
                                {(resultModal.type === 'cancelled' || resultModal.type === 'failure') ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setResultModal(null)}
                                            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-50 active:scale-95 transition-all"
                                        >
                                            Back to Wallet
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setResultModal(null);
                                                setTopupModalOpen(true);
                                            }}
                                            className="flex-1 py-3 px-4 rounded-xl bg-[#037166] text-white font-extrabold text-xs sm:text-sm shadow-md hover:bg-[#025c53] active:scale-95 transition-all"
                                        >
                                            Retry Top-up
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setResultModal(null)}
                                        className="w-full py-3 px-4 rounded-xl bg-[#037166] text-white font-extrabold text-xs sm:text-sm shadow-md hover:bg-[#025c53] active:scale-95 transition-all"
                                    >
                                        Back to Wallet
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
