'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
    ShieldCheck,
    CreditCard,
    User,
    Headphones,
    ChevronRight,
    Loader2,
    CheckCircle,
    AlertCircle,
    Phone,
    Mail,
    MapPin,
    Building2,
    ClipboardList,
} from 'lucide-react';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import { checkKycStatus, getSubscriptionHistory, getProviderSupportTickets, normalizeProviderSupportTickets, isProviderTicketOpen } from '@/lib/providerAuthApi';

const QUICK_LINKS = [
    { href: '/partner/dashboard/bookings', label: 'My Bookings', icon: ClipboardList, desc: 'View & track your bookings' },
    { href: '/partner/dashboard/kyc', label: 'KYC Verification', icon: ShieldCheck, desc: 'Upload & track documents' },
    { href: '/partner/dashboard/subscription', label: 'Subscription', icon: CreditCard, desc: 'Plans & billing history' },
    { href: '/partner/dashboard/profile', label: 'My Profile', icon: User, desc: 'Business & contact details' },
    { href: '/partner/dashboard/support', label: 'Vendor Support', icon: Headphones, desc: 'Raise & track tickets' },
];

function kycBadge(status) {
    const s = String(status || 'not_applied').toLowerCase();
    if (s === 'approved') return { label: 'Approved', cls: 'bg-green-100 text-green-700', icon: CheckCircle };
    if (s === 'applied') return { label: 'Under Review', cls: 'bg-amber-100 text-amber-700', icon: AlertCircle };
    if (s === 'rejected') return { label: 'Rejected', cls: 'bg-red-100 text-red-700', icon: AlertCircle };
    return { label: 'Not Submitted', cls: 'bg-gray-100 text-gray-600', icon: AlertCircle };
}

export default function PartnerDashboardPage() {
    const { token, profile } = useProviderAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ kycStatus: 'not_applied', activePlan: 'None', openTickets: 0 });

    useEffect(() => {
        if (!token) return;
        const load = async () => {
            setLoading(true);
            try {
                const [kycRes, historyRes, ticketsRes] = await Promise.all([
                    checkKycStatus(token).catch(() => null),
                    getSubscriptionHistory(token).catch(() => null),
                    getProviderSupportTickets(token).catch(() => null),
                ]);

                const kycStatus =
                    kycRes?.kyc_status ||
                    kycRes?.data?.kyc_status ||
                    profile?.kyc_status ||
                    'not_applied';

                const history = historyRes?.history || historyRes?.data || [];
                const active = Array.isArray(history)
                    ? history.find((h) => String(h.status || '').toLowerCase() === 'active')
                    : null;

                const tickets = normalizeProviderSupportTickets(ticketsRes);
                const openTickets = tickets.filter((t) => isProviderTicketOpen(t.status)).length;

                setStats({
                    kycStatus,
                    activePlan: active?.plansName || active?.planName || 'None',
                    openTickets,
                });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [token, profile]);

    const kyc = kycBadge(stats.kycStatus);
    const KycIcon = kyc.icon;
    const fullName = profile?.name || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Partner';
    const businessName = profile?.businessName || profile?.companyName || '--';
    const phone = profile?.phone || profile?.mobile || profile?.whatsappNumber || '--';
    const email = profile?.email || '--';
    const city = profile?.cityName || profile?.city || '--';
    const serviceName = profile?.serviceName || profile?.categoryName || '--';

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm"
            >
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Partner Dashboard</h1>
                <p className="text-gray-600 text-sm md:text-base">
                    Welcome back, {fullName}. Manage KYC, subscription, profile, and support from your vendor portal.
                </p>
            </motion.div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Partner Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3">
                        <User className="w-4 h-4 text-[#037166] mt-0.5" />
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-500">Name</p>
                            <p className="font-semibold text-gray-900">{fullName}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Building2 className="w-4 h-4 text-[#037166] mt-0.5" />
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-500">Business</p>
                            <p className="font-semibold text-gray-900">{businessName}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-[#037166] mt-0.5" />
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-500">Phone</p>
                            <p className="font-semibold text-gray-900">{phone}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-[#037166] mt-0.5" />
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-500">Email</p>
                            <p className="font-semibold text-gray-900 break-all">{email}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-[#037166] mt-0.5" />
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-500">City</p>
                            <p className="font-semibold text-gray-900">{city}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="w-4 h-4 text-[#037166] mt-0.5" />
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-500">Service</p>
                            <p className="font-semibold text-gray-900">{serviceName}</p>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link href="/partner/dashboard/kyc" className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#037166]/30 hover:shadow-md transition-all">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">KYC Status</p>
                        <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-2.5 py-1 rounded-full ${kyc.cls}`}>
                            <KycIcon className="w-3.5 h-3.5" />
                            {kyc.label}
                        </span>
                    </Link>
                    <Link href="/partner/dashboard/subscription" className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#037166]/30 hover:shadow-md transition-all">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Active Plan</p>
                        <p className="text-lg font-extrabold text-[#037166] truncate">{stats.activePlan}</p>
                    </Link>
                    <Link href="/partner/dashboard/support" className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#037166]/30 hover:shadow-md transition-all">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Open Tickets</p>
                        <p className="text-2xl font-extrabold text-[#037166]">{stats.openTickets}</p>
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUICK_LINKS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:border-[#037166]/30 hover:shadow-md transition-all"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#037166]/10 flex items-center justify-center shrink-0">
                                <Icon className="w-5 h-5 text-[#037166]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900">{item.label}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#037166]" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
