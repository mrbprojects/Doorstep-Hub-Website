import React, { useState } from 'react';
import { MapPin, Briefcase, Clock, Bookmark, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper to get pastel pill color based on department or role name
export function getDepartmentStyle(dept = '') {
    const lower = dept.toLowerCase();
    if (lower.includes('eng') || lower.includes('node') || lower.includes('tech') || lower.includes('qa') || lower.includes('react')) {
        return { bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]', label: 'ENGINEERING' };
    }
    if (lower.includes('product')) {
        return { bg: 'bg-[#E0F7FA]', text: 'text-[#00838F]', label: 'PRODUCT' };
    }
    if (lower.includes('operation') || lower.includes('support') || lower.includes('customer')) {
        return { bg: 'bg-[#EEF2FF]', text: 'text-[#4F46E5]', label: 'OPERATIONS' };
    }
    if (lower.includes('market') || lower.includes('content') || lower.includes('writer')) {
        return { bg: 'bg-[#F5F3FF]', text: 'text-[#7C3AED]', label: 'MARKETING' };
    }
    if (lower.includes('design') || lower.includes('ui') || lower.includes('ux') || lower.includes('graphic')) {
        return { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', label: 'DESIGN' };
    }
    if (lower.includes('data') || lower.includes('analytics')) {
        return { bg: 'bg-[#CCFBF1]', text: 'text-[#0D9488]', label: 'DATA' };
    }
    if (lower.includes('crm') || lower.includes('sales')) {
        return { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]', label: 'SALES / CRM' };
    }
    return { bg: 'bg-[#E6F7F5]', text: 'text-[#008C80]', label: dept.toUpperCase() || 'GENERAL' };
}

export function JobFilter({ activeRole, onRoleChange, roles = [] }) {
    return (
        <div className="w-full overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex items-center gap-2 min-w-max">
                <button
                    type="button"
                    onClick={() => onRoleChange(null)}
                    aria-pressed={!activeRole}
                    className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        !activeRole
                            ? 'bg-[#008C80] text-white shadow-2xs'
                            : 'bg-white text-[#475467] border border-[#D5E2E0] hover:border-[#008C80] hover:text-[#008C80]'
                    }`}
                >
                    All Roles
                </button>
                {roles.map((role) => {
                    const isSelected = activeRole === role._id;
                    return (
                        <button
                            key={role._id}
                            type="button"
                            onClick={() => onRoleChange(role._id)}
                            aria-pressed={isSelected}
                            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                                isSelected
                                    ? 'bg-[#008C80] text-white shadow-2xs'
                                    : 'bg-white text-[#475467] border border-[#D5E2E0] hover:border-[#008C80] hover:text-[#008C80]'
                            }`}
                        >
                            {role.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function JobCard({ job, onClick }) {
    const [bookmarked, setBookmarked] = useState(false);
    const deptStyle = getDepartmentStyle(job.department || (job.roleId && job.roleId.name) || '');

    const handleBookmark = (e) => {
        e.stopPropagation();
        setBookmarked(!bookmarked);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            onClick={onClick}
            className="group relative p-4 sm:p-5.5 rounded-xl sm:rounded-2xl bg-white border border-[#E5ECEB] hover:border-[#008C80]/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between h-full"
        >
            <div>
                {/* Header: Department Badge & Bookmark Button */}
                <div className="flex items-center justify-between mb-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider ${deptStyle.bg} ${deptStyle.text}`}>
                        {deptStyle.label}
                    </span>

                    <button
                        type="button"
                        onClick={handleBookmark}
                        aria-label={bookmarked ? "Unsave job" : "Save job"}
                        className={`p-1 rounded-md border transition-colors ${
                            bookmarked
                                ? 'bg-[#E6F7F5] border-[#008C80] text-[#008C80]'
                                : 'bg-transparent border-transparent text-[#98A2B3] hover:text-[#101828] hover:bg-gray-100'
                        }`}
                    >
                        <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Job Title */}
                <h3 className="text-base sm:text-lg font-bold text-[#101828] group-hover:text-[#008C80] transition-colors mb-2 leading-snug">
                    {job.title}
                </h3>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[#667085] text-xs mb-4">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#98A2B3]" />
                        <span>{job.location || 'Hyderabad'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-[#98A2B3]" />
                        <span>{job.employmentType || 'Full-time'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#98A2B3]" />
                        <span>{job.experienceLevel || '2–5 years'}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Row: View Details Link */}
            <div className="pt-3 border-t border-[#F2F4F7] flex items-center justify-between mt-auto">
                <span className="text-[#008C80] font-bold text-xs sm:text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>

                {job.openingsCount && (
                    <span className="text-[11px] text-[#98A2B3]">
                        {job.openingsCount} {job.openingsCount === 1 ? 'opening' : 'openings'}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

export function JobCardSkeleton() {
    return (
        <div className="p-4 sm:p-5.5 rounded-xl sm:rounded-2xl bg-white border border-[#E5ECEB] shadow-2xs animate-pulse flex flex-col justify-between h-[180px] sm:h-[190px]">
            <div>
                <div className="flex justify-between items-center mb-3">
                    <div className="w-20 h-5 bg-gray-200 rounded" />
                    <div className="w-5 h-5 bg-gray-200 rounded" />
                </div>
                <div className="w-2/3 h-6 bg-gray-200 rounded mb-3" />
                <div className="flex gap-3">
                    <div className="w-16 h-3.5 bg-gray-200 rounded" />
                    <div className="w-14 h-3.5 bg-gray-200 rounded" />
                    <div className="w-14 h-3.5 bg-gray-200 rounded" />
                </div>
            </div>
            <div className="pt-3 border-t border-[#F2F4F7] flex justify-between">
                <div className="w-20 h-4 bg-gray-200 rounded" />
                <div className="w-12 h-3.5 bg-gray-200 rounded" />
            </div>
        </div>
    );
}
