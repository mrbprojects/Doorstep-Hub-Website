'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight, Loader2, RefreshCw, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchWalletBalance, fetchWalletTransactions } from '@/lib/accountApi';

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
            t.type === 'credit' ||
            t.transactionType === 'credit' ||
            ['wallet_topup', 'service_earning', 'bonus', 'cashback', 'referral_reward'].includes(event);

        return {
            id: t.transactionId ?? t._id ?? t.generateId ?? Math.random().toString(),
            type: event === 'wallet_topup' ? 'topup' : isCredit ? 'credit' : 'debit',
            amount: Number(t.amount ?? 0),
            description: remark,
            date: t.createdAt ?? t.logCreatedDate ?? '',
            status: t.status ?? 'success',
        };
    });
}

function formatDate(value) {
    if (!value) return '--';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function WalletPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [walletId, setWalletId] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [tab, setTab] = useState('all');

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = transactions.filter((t) => {
        if (tab === 'credits') return t.type === 'credit' || t.type === 'topup';
        if (tab === 'debits') return t.type === 'debit';
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">D-Hub Wallet</h1>
                    <p className="text-sm text-gray-500 mt-1">Your balance and transaction history</p>
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

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#037166] to-[#04a99d] p-6 md:p-8 text-white shadow-xl"
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                        <Wallet className="w-5 h-5 opacity-80" />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Available Balance</span>
                    </div>
                    {loading ? (
                        <Loader2 className="w-8 h-8 animate-spin opacity-80" />
                    ) : (
                        <p className="text-4xl md:text-5xl font-extrabold">₹{balance.toFixed(2)}</p>
                    )}
                    {walletId && (
                        <p className="text-xs opacity-70 mt-4 font-mono">Wallet ID: **** {walletId.split('-').pop()}</p>
                    )}
                    <p className="text-xs opacity-70 mt-2">Use wallet balance during checkout on any service booking</p>
                </div>
            </motion.div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'credits', label: 'Credits' },
                        { key: 'debits', label: 'Debits' },
                    ].map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                tab === t.key ? 'bg-[#037166] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 text-sm">No transactions yet</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filtered.map((tx) => {
                            const isCredit = tx.type === 'credit' || tx.type === 'topup';
                            return (
                                <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        isCredit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm truncate">
                                            {tx.description || (isCredit ? 'Credit' : 'Debit')}
                                        </p>
                                        <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
                                    </div>
                                    <p className={`font-bold text-sm shrink-0 ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                        {isCredit ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
