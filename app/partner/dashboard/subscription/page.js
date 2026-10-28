'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, CreditCard, Loader2, RefreshCw, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import {
    getSubscriptionPlans,
    getSubscriptionHistory,
    purchaseSubscriptionViaWallet,
    initiateSubscriptionGateway,
    resolveProviderMediaUrl,
} from '@/lib/providerAuthApi';

function parseList(res, key = 'data') {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.[key])) return res[key];
    if (Array.isArray(res?.history)) return res.history;
    return [];
}

function formatValidity(plan) {
    const days = Number(plan?.validDays ?? plan?.planValidityDays ?? 0);
    const name = String(plan?.name || '').toLowerCase();
    if (!days || days <= 0 || name.includes('life') || name.includes('lifetime')) {
        return 'Lifetime access';
    }
    return `${days} days validity`;
}

function cleanDescription(text = '') {
    return String(text)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function formatDate(value) {
    if (!value) return '--';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '--';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isPlanActive(plan, history = []) {
    const planName = String(plan?.name || '').toLowerCase();
    return history.some((item) => {
        const status = String(item?.status || '').toLowerCase();
        const historyName = String(item?.plansName || item?.planName || '').toLowerCase();
        return status === 'active' && (historyName === planName || historyName.includes(planName));
    });
}

export default function PartnerSubscriptionPage() {
    const { token } = useProviderAuth();
    const [tab, setTab] = useState('plans');
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(null);
    const [plans, setPlans] = useState([]);
    const [history, setHistory] = useState([]);

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [plansRes, historyRes] = await Promise.all([
                getSubscriptionPlans(token),
                getSubscriptionHistory(token),
            ]);
            const rawHistory = parseList(historyRes, 'history');
            const hasActivePaid = rawHistory.some(
                (h) => String(h.status || '').toLowerCase() === 'active' &&
                       !['free', 'trial', 'welcome_bonus'].includes(String(h.type || '').toLowerCase())
            );
            const sanitizedHistory = hasActivePaid
                ? rawHistory.filter(
                      (h) => !['free', 'trial', 'welcome_bonus'].includes(String(h.type || '').toLowerCase()) &&
                             !String(h.plansName || h.planName || '').toLowerCase().includes('welcome plan')
                  )
                : rawHistory;
            setPlans(parseList(plansRes));
            setHistory(sanitizedHistory);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        load();
    }, [load]);

    const handleWalletPurchase = async (planId) => {
        setPurchasing(planId);
        try {
            const res = await purchaseSubscriptionViaWallet(token, planId);
            if (res?.success) {
                toast.success('Subscription purchased via wallet');
                load();
            } else {
                toast.error(res?.message || 'Wallet purchase failed');
            }
        } catch (err) {
            toast.error(err.message || 'Wallet purchase failed');
        } finally {
            setPurchasing(null);
        }
    };

    const handleGatewayPurchase = async (planId) => {
        setPurchasing(planId);
        try {
            const res = await initiateSubscriptionGateway(token, planId);
            const accessKey = res?.access_key || res?.accessKey || res?.data?.access_key;
            if (accessKey) {
                const paymentUrl = `https://pay.easebuzz.in/v2/pay/${accessKey}`;
                window.location.href = paymentUrl;
            } else {
                toast.error(res?.message || 'Could not initiate payment');
            }
        } catch (err) {
            toast.error(err.message || 'Payment initiation failed');
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-extrabold text-gray-900">Subscription</h1>
                    <p className="text-xs text-gray-500 mt-0.5">View plans and manage your subscription</p>
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

            <div className="inline-flex p-1 rounded-full bg-gray-100 border border-gray-200">
                {['plans', 'history'].map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
                            tab === t ? 'bg-[#037166] text-white shadow-sm' : 'text-gray-600 hover:text-[#037166]'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-7 h-7 animate-spin text-[#037166]" />
                </div>
            ) : tab === 'plans' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
                    {plans.length === 0 ? (
                        <p className="text-gray-500 col-span-full text-center py-12 bg-white border border-gray-200 rounded-xl">
                            No subscription plans available for your service.
                        </p>
                    ) : (
                        plans.map((plan, idx) => {
                            const active = isPlanActive(plan, history);
                            const description = cleanDescription(plan.description);
                            const validity = formatValidity(plan);

                            return (
                                <motion.div
                                    key={plan._id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="flex h-full"
                                >
                                    <div className="flex flex-col h-full w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        {plan.image ? (
                                            <div className="relative h-36 bg-gray-100 shrink-0">
                                                <img
                                                    src={resolveProviderMediaUrl(plan.image)}
                                                    alt={plan.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                            </div>
                                        ) : (
                                            <div className="h-3 bg-gradient-to-r from-[#037166] to-[#04a99d] shrink-0" />
                                        )}

                                        <div className="flex flex-col flex-1 p-4 sm:p-5">
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <span className="inline-flex px-2.5 py-1 rounded-full bg-[#037166]/10 text-[10px] font-bold uppercase tracking-wide text-[#037166]">
                                                    {plan.serviceName || 'Service Plan'}
                                                </span>
                                                {active && (
                                                    <span className="inline-flex px-2.5 py-1 rounded-full bg-green-100 text-[10px] font-bold uppercase text-green-700">
                                                        Active
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-base font-extrabold text-gray-900 leading-snug line-clamp-2 min-h-[2.75rem]">
                                                {plan.name}
                                            </h3>

                                            <div className="mt-3 mb-4">
                                                <p className="text-2xl sm:text-3xl font-extrabold text-[#037166]">
                                                    ₹{Number(plan.price || 0).toLocaleString('en-IN')}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{validity}</p>
                                            </div>

                                            {description ? (
                                                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 flex-1 mb-4">
                                                    {description}
                                                </p>
                                            ) : (
                                                <div className="flex-1 mb-4" />
                                            )}

                                            <div className="grid grid-cols-1 gap-2 mt-auto pt-2 border-t border-gray-100">
                                                <button
                                                    type="button"
                                                    disabled={purchasing === plan._id || active}
                                                    onClick={() => handleWalletPurchase(plan._id)}
                                                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-[#037166] text-white text-sm font-semibold rounded-lg hover:bg-[#025951] disabled:opacity-60 transition-colors"
                                                >
                                                    {purchasing === plan._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Wallet className="w-4 h-4" />
                                                    )}
                                                    {active ? 'Current Plan' : 'Pay via Wallet'}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={purchasing === plan._id || active}
                                                    onClick={() => handleGatewayPurchase(plan._id)}
                                                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 border border-[#037166] text-[#037166] text-sm font-semibold rounded-lg hover:bg-[#037166]/5 disabled:opacity-60 transition-colors"
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                    Pay Online
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {history.length === 0 ? (
                        <p className="text-center text-gray-500 py-12">No subscription history yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {history.map((item) => {
                                const status = String(item.status || 'expired').toLowerCase();
                                const isActive = status === 'active';

                                return (
                                    <div key={item._id} className="p-4 sm:p-5">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-gray-900 truncate">
                                                    {item.plansName || item.planName || 'Subscription Plan'}
                                                </p>
                                                <p className="text-lg font-extrabold text-[#037166] mt-1">
                                                    ₹{Number(item.amount || item.price || 0).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <span
                                                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                                                    isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {item.status || 'Expired'}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Started: {formatDate(item.startDate || item.createdAt)}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Expires: {formatDate(item.expiryDate || item.endDate)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
