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
    CheckCircle2,
    AlertCircle,
    Phone,
    Mail,
    MapPin,
    ClipboardList,
    Wallet,
    ArrowRight,
    Gift,
    AlertTriangle,
    Clock,
    Wrench,
} from 'lucide-react';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import {
    checkKycStatus,
    getSubscriptionHistory,
    getProviderSupportTickets,
    normalizeProviderSupportTickets,
    isProviderTicketOpen,
    getProviderWalletDetails,
    getProviderBookings,
} from '@/lib/providerAuthApi';

function formatCurrency(amount) {
    const n = Number(amount || 0);
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(raw) {
    if (!raw) return '—';
    try {
        const d = new Date(raw);
        if (isNaN(d.getTime())) return String(raw);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return String(raw);
    }
}

const BUSINESS_HUB_ITEMS = [
    {
        href: '/partner/dashboard/bookings',
        label: 'My Business Leads',
        icon: ClipboardList,
        desc: 'Review received leads, call customers & download invoices',
        badge: 'Leads',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        href: '/partner/dashboard/wallet',
        label: 'My Partner Wallet',
        icon: Wallet,
        desc: 'Check available balance, job credits & request bank payout',
        badge: 'Payouts',
        color: 'from-teal-600 to-cyan-700',
    },
    {
        href: '/partner/dashboard/kyc',
        label: 'KYC Verification',
        icon: ShieldCheck,
        desc: 'Upload Aadhaar, PAN & verify bank account for withdrawals',
        badge: 'Mandatory',
        color: 'from-blue-600 to-indigo-600',
    },
    {
        href: '/partner/dashboard/subscription',
        label: 'Subscription Plans',
        icon: CreditCard,
        desc: 'Flexible lead plans, active validity & recharge packages',
        badge: 'Plans',
        color: 'from-violet-600 to-purple-600',
    },
    {
        href: '/partner/dashboard/amc-referral',
        label: 'AMC Referral & Earn',
        icon: Gift,
        desc: 'Refer customers to Doorstep Hub AMC and earn referral commissions',
        badge: 'Earn Extra',
        color: 'from-amber-500 to-orange-600',
    },
    {
        href: '/partner/dashboard/support',
        label: 'Vendor Support Desk',
        icon: Headphones,
        desc: 'Raise assistance tickets, track resolution & reach helpdesk',
        badge: 'Help',
        color: 'from-rose-500 to-red-600',
    },
    {
        href: '/partner/dashboard/profile',
        label: 'Business Profile',
        icon: User,
        desc: 'Update registered services, operational zones & contact details',
        badge: 'Account',
        color: 'from-slate-700 to-gray-900',
    },
];

function kycBadge(status) {
    const s = String(status || 'not_applied').toLowerCase();
    if (s === 'approved') {
        return {
            label: 'KYC Verified',
            cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            dot: 'bg-emerald-500',
            icon: CheckCircle2,
            isVerified: true,
        };
    }
    if (s === 'applied') {
        return {
            label: 'Under Review',
            cls: 'bg-amber-50 text-amber-800 border-amber-200',
            dot: 'bg-amber-500',
            icon: Clock,
            isVerified: false,
        };
    }
    if (s === 'rejected') {
        return {
            label: 'KYC Rejected',
            cls: 'bg-rose-50 text-rose-800 border-rose-200',
            dot: 'bg-rose-500',
            icon: AlertTriangle,
            isVerified: false,
        };
    }
    return {
        label: 'Not Submitted',
        cls: 'bg-gray-100 text-gray-700 border-gray-200',
        dot: 'bg-gray-400',
        icon: AlertCircle,
        isVerified: false,
    };
}

export default function PartnerDashboardPage() {
    const { token, profile } = useProviderAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        kycStatus: 'not_applied',
        activePlan: 'None',
        openTickets: 0,
        walletBalance: 0,
        totalLeads: 0,
        newLeadsCount: 0,
        completedLeadsCount: 0,
        recentBookings: [],
    });

    useEffect(() => {
        if (!token) return;
        let activeMount = true;
        Promise.all([
            checkKycStatus(token).catch(() => null),
            getSubscriptionHistory(token).catch(() => null),
            getProviderSupportTickets(token).catch(() => null),
            getProviderWalletDetails(token).catch(() => null),
            getProviderBookings(token).catch(() => null),
        ]).then(([kycRes, historyRes, ticketsRes, walletRes, bookingsRes]) => {
            if (!activeMount) return;
            const kycStatus =
                kycRes?.kyc_status ||
                kycRes?.data?.kyc_status ||
                profile?.kyc_status ||
                'not_applied';

            const history = historyRes?.history || historyRes?.data || [];
            const activePaid = Array.isArray(history)
                ? history.find(
                      (h) =>
                          String(h.status || '').toLowerCase() === 'active' &&
                          !['free', 'trial', 'welcome_bonus'].includes(String(h.type || '').toLowerCase()) &&
                          !String(h.plansName || h.planName || '').toLowerCase().includes('welcome plan')
                  )
                : null;
            const active =
                activePaid ||
                (Array.isArray(history)
                    ? history.find((h) => String(h.status || '').toLowerCase() === 'active')
                    : null);

            const tickets = normalizeProviderSupportTickets(ticketsRes);
            const openTickets = tickets.filter((t) => isProviderTicketOpen(t.status)).length;

            const profileWalletData = walletRes?.data || walletRes || {};
            const walletBalance = Number(profileWalletData.walletAmount || profileWalletData.wallet || 0);

            const allBookings = Array.isArray(bookingsRes?.bookings)
                ? bookingsRes.bookings
                : Array.isArray(bookingsRes?.data?.bookings)
                ? bookingsRes.data.bookings
                : [];

            const totalLeads = allBookings.length;
            const newLeadsCount = allBookings.filter((b) => {
                const s = String(b.bookingStatus || b.status || '').toLowerCase();
                return ['received', 'assigned', 'pending', 'new'].includes(s);
            }).length;
            const completedLeadsCount = allBookings.filter((b) => {
                const s = String(b.bookingStatus || b.status || '').toLowerCase();
                return ['completed', 'settled'].includes(s);
            }).length;

            setStats({
                kycStatus,
                activePlan: active?.plansName || active?.planName || 'None',
                openTickets,
                walletBalance,
                totalLeads,
                newLeadsCount,
                completedLeadsCount,
                recentBookings: allBookings.slice(0, 3),
            });
        }).finally(() => {
            if (activeMount) setLoading(false);
        });
        return () => { activeMount = false; };
    }, [token, profile]);

    const kyc = kycBadge(stats.kycStatus);
    const KycIcon = kyc.icon;
    const fullName =
        profile?.name ||
        `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() ||
        'Partner';
    const businessName = profile?.businessName || profile?.companyName || '--';
    const phone = profile?.phone || profile?.mobile || profile?.whatsappNumber || '--';
    const email = profile?.email || '--';
    const city = profile?.cityName || profile?.city || '--';
    const serviceName = profile?.serviceName || profile?.categoryName || '--';

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* 1. Partner Profile Hero Banner */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-sm relative overflow-hidden"
            >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Avatar & Identity */}
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#037166] via-[#048275] to-[#02524a] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 shadow-md">
                            {fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                    {fullName}
                                </h1>
                                <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${kyc.cls}`}
                                >
                                    <KycIcon className="w-3.5 h-3.5" />
                                    <span>{kyc.label}</span>
                                </span>
                            </div>

                            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                                {businessName !== '--' ? businessName : 'Doorstep Hub Service Partner'}
                            </p>

                            {/* Tags row */}
                            <div className="flex items-center gap-3 sm:gap-4 mt-2.5 flex-wrap text-xs text-gray-600 font-medium">
                                <span className="inline-flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-[#037166]" />
                                    <span>{phone}</span>
                                </span>
                                {email !== '--' && (
                                    <span className="inline-flex items-center gap-1.5 truncate max-w-[220px]">
                                        <Mail className="w-3.5 h-3.5 text-[#037166]" />
                                        <span className="truncate">{email}</span>
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-[#037166]" />
                                    <span>{city}</span>
                                </span>
                                {serviceName !== '--' && (
                                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                                        <Wrench className="w-3 h-3 text-[#037166]" />
                                        <span>{serviceName}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Quick CTA */}
                    <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
                        <Link
                            href="/partner/dashboard/profile"
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition shadow-xs"
                        >
                            <User className="w-3.5 h-3.5 text-gray-500" />
                            <span>Edit Profile</span>
                        </Link>
                        <Link
                            href="/partner/dashboard/bookings"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#037166] hover:bg-[#025c53] text-white rounded-xl text-xs font-bold transition shadow-xs"
                        >
                            <ClipboardList className="w-3.5 h-3.5" />
                            <span>View Leads</span>
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* 2. KYC Action Notice Banner (If KYC is pending or not verified) */}
            {!kyc.isVerified && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="w-5 h-5 text-amber-700" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-amber-950">
                                {stats.kycStatus === 'applied'
                                    ? 'Your KYC documents are currently under review'
                                    : 'Complete your KYC verification to unlock instant withdrawals'}
                            </h3>
                            <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                                {stats.kycStatus === 'applied'
                                    ? 'Our compliance team is verifying your Aadhaar and PAN details. This usually takes under 24 business hours.'
                                    : 'Upload your Aadhaar card and PAN card to get verified partner badge and enjoy seamless unlimited wallet withdrawals.'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/partner/dashboard/kyc"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold transition shrink-0 shadow-xs"
                    >
                        <span>{stats.kycStatus === 'applied' ? 'Check KYC Status' : 'Complete KYC Now'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </motion.div>
            )}

            {/* 3. Core Business Performance Metrics (4-Card Responsive Grid) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Business Leads */}
                <Link
                    href="/partner/dashboard/bookings"
                    className="group bg-white border border-gray-200/90 hover:border-[#037166]/40 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            Business Leads
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#037166] flex items-center justify-center group-hover:scale-105 transition">
                            <ClipboardList className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="mt-3">
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        ) : (
                            <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                {stats.totalLeads}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {stats.newLeadsCount > 0 ? (
                                <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    {stats.newLeadsCount} New Active
                                </span>
                            ) : (
                                <span className="text-[11px] text-gray-500 font-medium">
                                    {stats.completedLeadsCount} completed
                                </span>
                            )}
                        </div>
                    </div>
                </Link>

                {/* 2. Wallet Balance */}
                <Link
                    href="/partner/dashboard/wallet"
                    className="group bg-white border border-gray-200/90 hover:border-[#037166]/40 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            Wallet Balance
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#037166] flex items-center justify-center group-hover:scale-105 transition">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="mt-3">
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        ) : (
                            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                                {formatCurrency(stats.walletBalance)}
                            </div>
                        )}
                        <p className="text-[11px] text-gray-500 font-medium mt-2 flex items-center gap-1">
                            <span>Ready to withdraw</span>
                            <ArrowRight className="w-3 h-3 text-[#037166]" />
                        </p>
                    </div>
                </Link>

                {/* 3. Subscription Plan */}
                <Link
                    href="/partner/dashboard/subscription"
                    className="group bg-white border border-gray-200/90 hover:border-[#037166]/40 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            Active Plan
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
                            <CreditCard className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="mt-3">
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        ) : (
                            <div className="text-base sm:text-lg font-black text-gray-900 truncate tracking-tight">
                                {stats.activePlan}
                            </div>
                        )}
                        <p className="text-[11px] text-purple-700 font-bold mt-2 flex items-center gap-1">
                            <span>Manage Plan</span>
                            <ChevronRight className="w-3 h-3" />
                        </p>
                    </div>
                </Link>

                {/* 4. Support Tickets */}
                <Link
                    href="/partner/dashboard/support"
                    className="group bg-white border border-gray-200/90 hover:border-[#037166]/40 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            Open Tickets
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition">
                            <Headphones className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="mt-3">
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        ) : (
                            <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                {stats.openTickets}
                            </div>
                        )}
                        <p className="text-[11px] text-gray-500 font-medium mt-2">
                            {stats.openTickets === 0 ? 'No pending issues' : 'Tickets in progress'}
                        </p>
                    </div>
                </Link>
            </div>

            {/* 4. Recent Business Leads Preview (If Available) */}
            {stats.recentBookings.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-wrap gap-2">
                        <div>
                            <h2 className="text-base font-extrabold text-gray-900">Recent Business Leads</h2>
                            <p className="text-xs text-gray-500">Quick access to latest assigned customer leads</p>
                        </div>
                        <Link
                            href="/partner/dashboard/bookings"
                            className="text-xs font-bold text-[#037166] hover:underline flex items-center gap-1"
                        >
                            <span>View All Leads</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="divide-y divide-gray-100 mt-1">
                        {stats.recentBookings.map((b) => {
                            const orderId = b.orderId || b.bookingId || b._id;
                            const customerName = b.userId?.name || b.customerName || 'Customer';
                            const service = b.serviceName || b.categoryName || 'Service Booking';
                            const status = b.bookingStatus || b.status || 'Received';
                            const date = b.bookingDate || b.createdAt;

                            return (
                                <Link
                                    key={orderId}
                                    href={`/partner/dashboard/bookings/${orderId}`}
                                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-gray-50/70 -mx-3 px-3 rounded-xl transition group"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-mono font-bold text-[#037166] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                {orderId}
                                            </span>
                                            <span className="text-xs font-bold text-gray-900 truncate">
                                                {service}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Customer: <strong className="text-gray-700">{customerName}</strong>
                                            {date && ` • ${formatDate(date)}`}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">
                                            {status}
                                        </span>
                                        <span className="text-xs font-bold text-[#037166] group-hover:translate-x-0.5 transition hidden sm:inline-flex items-center gap-0.5">
                                            Details →
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 5. Business Operations Hub (Navigation Tiles Grid) */}
            <div>
                <div className="mb-3.5 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-extrabold text-gray-900">Partner Business Hub</h2>
                        <p className="text-xs text-gray-500">Access all your partner operations, tools & services</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                    {BUSINESS_HUB_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group bg-white border border-gray-200/90 rounded-2xl p-5 hover:border-[#037166]/40 hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3.5">
                                        <div
                                            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full group-hover:bg-[#037166]/10 group-hover:text-[#037166] transition">
                                            {item.badge}
                                        </span>
                                    </div>
                                    <h3 className="font-extrabold text-gray-900 group-hover:text-[#037166] transition text-sm sm:text-base">
                                        {item.label}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#037166]">
                                    <span>Open section</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
