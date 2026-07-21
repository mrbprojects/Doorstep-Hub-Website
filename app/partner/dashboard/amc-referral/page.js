'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
    Gift, 
    Share2, 
    TrendingUp, 
    Users, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Loader2, 
    AlertTriangle,
    Send,
    Search,
    IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import { getAmcReferralConfig, sendAmcReferral, getMyAmcReferrals } from '@/lib/providerAuthApi';

export default function PartnerAmcReferralPage() {
    const { token } = useProviderAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [config, setConfig] = useState({ commissionType: 'percentage', commissionValue: 10, validityDays: 30, isActive: true });
    const [referrals, setReferrals] = useState([]);
    const [customerPhone, setCustomerPhone] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [configRes, referralsRes] = await Promise.all([
                getAmcReferralConfig(token).catch((err) => {
                    console.error('Error fetching config:', err);
                    return null;
                }),
                getMyAmcReferrals(token).catch((err) => {
                    console.error('Error fetching referrals:', err);
                    return null;
                })
            ]);

            if (configRes?.success && configRes?.data) {
                setConfig(configRes.data);
            }
            if (referralsRes?.success && referralsRes?.data) {
                setReferrals(referralsRes.data);
            }
        } catch (err) {
            toast.error('Failed to load referral details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token]);

    const handleReferSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;

        const phone = customerPhone.trim().replace(/\D/g, '');
        if (phone.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }

        setSubmitting(true);
        try {
            const res = await sendAmcReferral(token, phone);
            if (res?.success) {
                toast.success(res.message || 'AMC Referral successfully sent!');
                setCustomerPhone('');
                // Reload list
                const refreshed = await getMyAmcReferrals(token).catch(() => null);
                if (refreshed?.success && refreshed?.data) {
                    setReferrals(refreshed.data);
                }
            } else {
                toast.error(res?.message || 'Failed to send referral');
            }
        } catch (err) {
            toast.error(err.message || 'Server error sending referral');
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate Referral Stats
    const stats = useMemo(() => {
        let totalCommission = 0;
        let pendingCount = 0;
        let convertedCount = 0;

        referrals.forEach(ref => {
            if (ref.status === 'converted') {
                totalCommission += Number(ref.commissionEarned || 0);
                convertedCount++;
            } else if (ref.status === 'pending') {
                pendingCount++;
            }
        });

        return {
            totalCommission: totalCommission.toFixed(2),
            pendingCount,
            convertedCount,
            totalCount: referrals.length
        };
    }, [referrals]);

    // Filtered Referrals list
    const filteredReferrals = useMemo(() => {
        if (!searchQuery.trim()) return referrals;
        const query = searchQuery.toLowerCase();
        return referrals.filter(r => 
            (r.referralCode || '').toLowerCase().includes(query) ||
            (r.customerPhone || '').toLowerCase().includes(query) ||
            (r.customerName || '').toLowerCase().includes(query)
        );
    }, [referrals, searchQuery]);

    const commissionDisplay = config.commissionType === 'percentage' 
        ? `${config.commissionValue}%` 
        : `₹${config.commissionValue}`;

    return (
        <div className="space-y-6">
            {/* Header section */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                        <Gift className="w-8 h-8 text-[#037166]" /> Recommend AMC & Earn
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base">
                        Recommend Annual Maintenance Contracts (AMC) to your customers and earn <span className="font-bold text-[#037166]">{commissionDisplay}</span> commission upon subscription.
                    </p>
                </div>
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#037166] animate-spin" />
                </div>
            ) : (
                <>
                    {/* Program Inactive Warning Alert */}
                    {!config.isActive && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-red-900 text-sm">AMC Referral Program is Currently Inactive</p>
                            <p className="text-red-700 text-xs mt-1">
                              The administrator has temporarily paused the referral feature. You cannot send new referrals at this time, but you can track your existing referrals.
                            </p>
                          </div>
                        </div>
                    )}

                    {/* Stats Dashboard Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#037166]/10 flex items-center justify-center">
                                    <IndianRupee className="w-5 h-5 text-[#037166]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Total Earnings</p>
                                    <p className="text-2xl font-black text-gray-900">₹{stats.totalCommission}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Share2 className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Referrals Sent</p>
                                    <p className="text-2xl font-black text-gray-900">{stats.totalCount}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Pending Buy</p>
                                    <p className="text-2xl font-black text-gray-900">{stats.pendingCount}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Converted</p>
                                    <p className="text-2xl font-black text-gray-900">{stats.convertedCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Send Referral Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4 sticky top-28">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Recommend to Customer</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Type the customer&apos;s 10-digit mobile number. They will receive an instant notification with validity link.
                                    </p>
                                </div>

                                <form onSubmit={handleReferSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Customer Phone</label>
                                        <input
                                            type="tel"
                                            disabled={!config.isActive || submitting}
                                            maxLength={10}
                                            placeholder="Enter 10-digit number"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#037166]/40 focus:border-[#037166] disabled:opacity-50"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!config.isActive || submitting || !customerPhone}
                                        className="w-full bg-[#037166] hover:bg-[#025850] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" /> Recommend & Refer
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Referral Tracking List */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h3 className="text-lg font-bold text-gray-900">Referral Tracking</h3>
                                    
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search code or phone..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#037166]/40 focus:border-[#037166] w-full sm:w-60"
                                        />
                                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase">
                                                <th className="py-3 px-2">Referral Code</th>
                                                <th className="py-3 px-2">Customer Details</th>
                                                <th className="py-3 px-2">Commission Rate</th>
                                                <th className="py-3 px-2">Earnings</th>
                                                <th className="py-3 px-2">Status</th>
                                                <th className="py-3 px-2">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredReferrals.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-8 text-gray-400">
                                                        No referrals found matching the search.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredReferrals.map((row) => (
                                                    <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-3 px-2 font-bold text-[#037166]">
                                                            {row.referralCode}
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <div className="font-semibold text-gray-900">
                                                                {row.customerName || 'Customer'}
                                                            </div>
                                                            <div className="text-gray-400 text-[10px]">
                                                                {row.customerPhone}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-2 font-medium">
                                                            {row.commissionValue}
                                                            {row.commissionType === 'percentage' ? '%' : ' Fixed'}
                                                        </td>
                                                        <td className="py-3 px-2 font-bold text-gray-900">
                                                            ₹{row.commissionEarned || 0}
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                                                                row.status === 'converted' 
                                                                    ? 'bg-green-100 text-green-700' 
                                                                    : row.status === 'pending'
                                                                    ? 'bg-amber-100 text-amber-700'
                                                                    : 'bg-red-100 text-red-700'
                                                            }`}>
                                                                {row.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-2 text-gray-400">
                                                            {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
