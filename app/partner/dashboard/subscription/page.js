'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Loader2, RefreshCw, Wallet } from 'lucide-react';
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
            setPlans(parseList(plansRes));
            setHistory(parseList(historyRes, 'history'));
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
            const url = res?.paymentUrl || res?.data?.paymentUrl || res?.redirectUrl || res?.data?.redirectUrl;
            if (url) {
                window.location.href = url;
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Subscription</h1>
                    <p className="text-sm text-gray-500 mt-1">View plans and manage your subscription</p>
                </div>
                <button type="button" onClick={load} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#037166]">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            <div className="flex gap-2">
                {['plans', 'history'].map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${tab === t ? 'bg-[#037166] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#037166]" /></div>
            ) : tab === 'plans' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.length === 0 ? (
                        <p className="text-gray-500 col-span-full text-center py-12">No subscription plans available for your service.</p>
                    ) : (
                        plans.map((plan) => (
                            <motion.div key={plan._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                {plan.image && (
                                    <img src={resolveProviderMediaUrl(plan.image)} alt={plan.name} className="w-full h-32 object-cover rounded-xl mb-4" />
                                )}
                                <p className="text-xs font-bold uppercase text-[#037166] mb-1">{plan.serviceName}</p>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-3xl font-extrabold text-[#037166] mb-1">₹{Number(plan.price || 0).toFixed(0)}</p>
                                <p className="text-sm text-gray-500 mb-4">{plan.validDays || plan.planValidityDays} days validity</p>
                                {plan.description && <p className="text-sm text-gray-600 mb-4 line-clamp-3">{plan.description}</p>}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        type="button"
                                        disabled={purchasing === plan._id}
                                        onClick={() => handleWalletPurchase(plan._id)}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#037166] text-white text-sm font-semibold rounded-xl hover:bg-[#025951] disabled:opacity-60"
                                    >
                                        {purchasing === plan._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                                        Pay via Wallet
                                    </button>
                                    <button
                                        type="button"
                                        disabled={purchasing === plan._id}
                                        onClick={() => handleGatewayPurchase(plan._id)}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#037166] text-[#037166] text-sm font-semibold rounded-xl hover:bg-[#037166]/5 disabled:opacity-60"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Pay Online
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    {history.length === 0 ? (
                        <p className="text-center text-gray-500 py-12">No subscription history yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {history.map((item) => (
                                <div key={item._id} className="p-5 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-bold text-gray-900">{item.plansName || item.planName || 'Plan'}</p>
                                        <p className="text-sm text-gray-500">₹{Number(item.amount || item.price || 0).toFixed(0)}</p>
                                    </div>
                                    <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                                        String(item.status).toLowerCase() === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
