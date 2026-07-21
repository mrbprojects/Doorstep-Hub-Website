'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShieldCheck,
    CreditCard,
    User,
    Headphones,
    Trash2,
    LogOut,
    ChevronRight,
    Gift,
} from 'lucide-react';
import { useProviderAuth } from '@/context/ProviderAuthContext';

const NAV_ITEMS = [
    { href: '/partner/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/partner/dashboard/kyc', label: 'KYC', icon: ShieldCheck },
    { href: '/partner/dashboard/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/partner/dashboard/amc-referral', label: 'AMC Referral & Earn', icon: Gift },
    { href: '/partner/dashboard/profile', label: 'My Profile', icon: User },
    { href: '/partner/dashboard/support', label: 'Vendor Support', icon: Headphones },
    { href: '/partner/dashboard/deletion', label: 'Account Deletion', icon: Trash2 },
];

export function PartnerSidebar({ onNavigate }) {
    const pathname = usePathname();
    const { profile, phone, logout } = useProviderAuth();

    const displayName = profile?.name || profile?.fullName || profile?.firstName || 'Partner';
    const displayPhone = profile?.phone || profile?.mobile || profile?.whatsappNumber || phone;

    const isActive = (item) => {
        if (item.exact) return pathname === item.href;
        return pathname === item.href || pathname.startsWith(`${item.href}/`);
    };

    return (
        <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden sticky top-28">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-[#037166]/5 to-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#037166] to-[#04a99d] flex items-center justify-center overflow-hidden shrink-0">
                            {profile?.image ? (
                                <img
                                    src={profile.image.startsWith('http') ? profile.image : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${profile.image}`}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{displayName}</p>
                            <p className="text-xs text-gray-500 truncate">{displayPhone}</p>
                            {profile?.kyc_status && (
                                <p className="text-[10px] font-bold uppercase text-[#037166] mt-0.5">
                                    KYC: {profile.kyc_status}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <nav className="p-3 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onNavigate}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    active
                                        ? 'bg-[#037166] text-white shadow-md shadow-[#037166]/20'
                                        : 'text-gray-700 hover:bg-[#037166]/5 hover:text-[#037166]'
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="flex-1">{item.label}</span>
                                {active && <ChevronRight className="w-4 h-4 opacity-70" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => {
                            logout();
                            onNavigate?.();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
}
