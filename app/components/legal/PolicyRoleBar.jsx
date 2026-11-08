'use client';

import React from 'react';
import { User, Briefcase } from 'lucide-react';
import { useGlobalSettings } from '@/context/GlobalSettingsContext';

export default function PolicyRoleBar({ activeTab, setActiveTab, pageTitle = 'Policy' }) {
    const { policy } = useGlobalSettings() || {};

    const customerAndroidLink = policy?.customerAndroidAppLink || 'https://play.google.com/store/apps/details?id=com.doorstephub.customer';
    const customerIosLink = policy?.customerIosAppLink || 'https://apps.apple.com/in/app/doorstep-hub-home-services/id6475340236';
    const partnerAndroidLink = policy?.vendorAndroidAppLink || policy?.partnerAndroidAppLink || 'https://play.google.com/store/apps/details?id=com.doorstephub.partner';
    const partnerIosLink = policy?.vendorIosAppLink || policy?.partnerIosAppLink || 'https://apps.apple.com/in/app/service-partner-doorstep-hub/id6760889720';

    const isCustomer = activeTab === 'customer app';
    const currentAndroidLink = isCustomer ? customerAndroidLink : partnerAndroidLink;
    const currentIosLink = isCustomer ? customerIosLink : partnerIosLink;
    const appRoleName = isCustomer ? 'Customer App' : 'Service Partner App';

    return (
        <div className="w-full rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-4 sm:p-5 lg:p-6 transition-all duration-300">
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-5 lg:gap-6">
                
                {/* 1. Left: Role Info & Icon Badge */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 transition-all duration-300 shadow-md ${
                            isCustomer
                                ? 'bg-gradient-to-br from-[#037166] via-[#04a99d] to-teal-400 text-white shadow-[#037166]/25'
                                : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-500 text-white shadow-indigo-600/25'
                        }`}
                    >
                        {isCustomer ? <User className="w-6 h-6 sm:w-7 sm:h-7" /> : <Briefcase className="w-6 h-6 sm:w-7 sm:h-7" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-500"></span>
                            <p className={`text-[11px] font-black uppercase tracking-wider ${isCustomer ? 'text-[#037166]' : 'text-indigo-600'}`}>
                                Applicable Target Role
                            </p>
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            {isCustomer ? `Customer & User ${pageTitle}` : `Service Partner & Provider ${pageTitle}`}
                        </h2>
                    </div>
                </div>

                {/* 2. Middle: Segmented Role Switcher Tabs */}
                <div className="flex items-center justify-center p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-inner flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab('customer app')}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 ${
                            isCustomer
                                ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-md shadow-[#037166]/30 scale-[1.02]'
                                : 'text-slate-600 hover:text-[#037166] hover:bg-white/60'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        <span>Customer</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('service app')}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 ${
                            !isCustomer
                                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                                : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60'
                        }`}
                    >
                        <Briefcase className="w-4 h-4" />
                        <span>Service Partner</span>
                    </button>
                </div>

                {/* 3. Right: Modern Trending App Download Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-3 pt-4 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                    <div className="hidden 2xl:flex flex-col text-right mr-1">
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Official Mobile App</span>
                        <span className="text-xs font-black text-slate-700">{appRoleName}</span>
                    </div>

                    {/* Modern Google Play Button */}
                    <a
                        href={currentAndroidLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Download ${appRoleName} on Google Play`}
                        className="group relative flex-1 sm:flex-initial inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#090D16] hover:bg-[#111827] text-white border border-emerald-500/30 hover:border-emerald-400 shadow-md shadow-black/40 hover:shadow-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {/* 4-Color Official Google Play Vector */}
                        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                            <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M3.61 1.814L13.79 12 3.61 22.186A2.38 2.38 0 0 1 3 20.572V3.428c0-.624.23-1.196.61-1.614z"/>
                                <path fill="#FBBC04" d="M17.7 9.68L5.88 2.92 13.79 12l3.91-2.32z"/>
                                <path fill="#EA4335" d="M3.61 1.814l10.18 10.186 3.91-2.32-11.82-6.76a2.38 2.38 0 0 0-2.27 1.1z"/>
                                <path fill="#34A853" d="M17.7 14.32l-3.91-2.32-10.18 10.186a2.38 2.38 0 0 0 2.27 1.1l11.82-6.76z"/>
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] uppercase tracking-widest text-emerald-300/80 font-bold leading-none mb-1">Get it on</p>
                            <p className="text-xs sm:text-[13px] font-black text-white tracking-tight leading-none">Google Play</p>
                        </div>
                    </a>

                    {/* Modern Apple App Store Button */}
                    <a
                        href={currentIosLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Download ${appRoleName} on App Store`}
                        className="group relative flex-1 sm:flex-initial inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#090D16] hover:bg-[#111827] text-white border border-blue-500/30 hover:border-blue-400 shadow-md shadow-black/40 hover:shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {/* Official Apple Silhouette Vector */}
                        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                            <svg className="w-5 h-5 fill-white transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.55.63-1.03 1.68-.9 2.7.99.08 2.02-.45 2.63-1.2z"/>
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] uppercase tracking-widest text-cyan-300/80 font-bold leading-none mb-1">Download on the</p>
                            <p className="text-xs sm:text-[13px] font-black text-white tracking-tight leading-none">App Store</p>
                        </div>
                    </a>

                </div>

            </div>
        </div>
    );
}
