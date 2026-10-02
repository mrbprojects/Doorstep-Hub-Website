'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CareersHero } from '@/components/careers/CareersHero';
import { ValuesSection } from '@/components/careers/ValuesSection';
import { LifeAtDoorstepHub } from '@/components/careers/LifeAtDoorstepHub';
import { BenefitsSection } from '@/components/careers/BenefitsSection';
import { JobFilter, JobCard, JobCardSkeleton } from '@/components/careers/JobComponents';
import { GeneralTalentCTA } from '@/components/careers/GeneralTalentCTA';
import { JobApplicationForm } from '@/components/careers/JobApplicationForm';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Briefcase, RefreshCw, X } from 'lucide-react';

export default function CareersPage() {
    const [jobs, setJobs] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRole, setActiveRole] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false);

    // Fetch Roles for Filter
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/careers/get-roles`);
                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                    setRoles(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch career roles:", error);
            }
        };

        fetchRoles();
    }, []);

    // Fetch Open Jobs
    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/careers/open-jobs`;
                if (activeRole) {
                    url += `?roleId=${activeRole}`;
                }

                const response = await fetch(url);
                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                    setJobs(data.data);
                } else {
                    setJobs([]);
                }
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [activeRole]);

    // Client-side search filtering across title, department, skills, and description
    const filteredJobs = useMemo(() => {
        if (!searchQuery.trim()) return jobs;
        const q = searchQuery.toLowerCase().trim();
        return jobs.filter((job) => {
            const titleMatch = (job.title || '').toLowerCase().includes(q);
            const deptMatch = (job.department || '').toLowerCase().includes(q);
            const roleNameMatch = (job.roleId?.name || '').toLowerCase().includes(q);
            const locationMatch = (job.location || '').toLowerCase().includes(q);
            const skillsMatch = Array.isArray(job.skills) && job.skills.some(s => (s || '').toLowerCase().includes(q));
            return titleMatch || deptMatch || roleNameMatch || locationMatch || skillsMatch;
        });
    }, [jobs, searchQuery]);

    const handleClearFilters = () => {
        setActiveRole(null);
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-[#F8FCFB] text-[#101828] selection:bg-[#008C80]/20 selection:text-[#008C80]">
            <Header />

            <main>
                {/* 1. Hero Section */}
                <CareersHero
                    onOpenPositionsClick={() => {
                        const el = document.getElementById('open-positions');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    onCultureClick={() => {
                        const el = document.getElementById('life-at-doorstep-hub');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                />

                {/* 2. Our Values Section */}
                <ValuesSection />

                {/* 3. Life at Doorstep Hub / Culture Gallery */}
                <LifeAtDoorstepHub />

                {/* 4. Why Join Us / Perks Section */}
                <BenefitsSection />

                {/* 5. Open Positions Section */}
                <section id="open-positions" className="py-8 sm:py-12 bg-white relative scroll-mt-24 sm:scroll-mt-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        
                        {/* Section Header with Search */}
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-5 sm:mb-6">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F7F5] border border-[#BCEAE3] text-[#008C80] text-xs font-semibold mb-2 sm:mb-2.5 shadow-2xs">
                                    <Briefcase className="w-3.5 h-3.5 text-[#008C80]" />
                                    <span>Open Positions</span>
                                </div>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#101828] tracking-tight mb-1.5">
                                    Find Your Perfect Role
                                </h2>
                                <p className="text-xs sm:text-sm text-[#475467]">
                                    Explore exciting opportunities and be part of our growing team.
                                </p>
                            </div>

                            {/* Job Search Input */}
                            <div className="w-full lg:max-w-sm">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        aria-label="Search open positions by title, department or keyword"
                                        placeholder="Search jobs by title, department or keyword..."
                                        className="w-full pl-3.5 pr-9 py-2.5 rounded-full bg-[#F8FCFB] border border-[#D5E2E0] text-xs sm:text-sm text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#008C80] focus:ring-1 focus:ring-[#008C80] focus:bg-white transition-all shadow-2xs"
                                    />
                                    {searchQuery ? (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            aria-label="Clear search query"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#101828] p-0.5 cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    ) : (
                                        <Search className="w-3.5 h-3.5 text-[#98A2B3] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Filter Chips Bar */}
                        <div className="mb-5 sm:mb-6">
                            <JobFilter
                                activeRole={activeRole}
                                onRoleChange={setActiveRole}
                                roles={roles}
                            />
                        </div>

                        {/* Job Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 min-h-[220px]">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    // Skeletons
                                    [...Array(6)].map((_, i) => (
                                        <JobCardSkeleton key={`skeleton-${i}`} />
                                    ))
                                ) : filteredJobs.length > 0 ? (
                                    filteredJobs.map((job) => (
                                        <JobCard
                                            key={job._id}
                                            job={job}
                                            onClick={() => setSelectedJob(job)}
                                        />
                                    ))
                                ) : (
                                    /* Empty State */
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="col-span-full py-12 px-4 text-center rounded-2xl bg-[#F8FCFB] border border-[#E5ECEB]"
                                    >
                                        <div className="w-12 h-12 bg-[#E6F7F5] rounded-full flex items-center justify-center mx-auto mb-3 text-[#008C80]">
                                            <Search className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-[#101828] mb-1.5">
                                            No positions found
                                        </h3>
                                        <p className="text-xs sm:text-sm text-[#475467] max-w-sm mx-auto mb-5">
                                            {searchQuery || activeRole
                                                ? "We couldn't find any roles matching your current search criteria. Try a different keyword or reset filters."
                                                : "We're always growing and adding new opportunities. Send us your resume for upcoming openings."}
                                        </p>
                                        <div className="flex flex-wrap items-center justify-center gap-2.5">
                                            {(searchQuery || activeRole) && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearFilters}
                                                    className="px-4 py-2 rounded-full bg-white border border-[#D5E2E0] text-xs sm:text-sm font-semibold text-[#101828] hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <RefreshCw className="w-3 h-3" />
                                                    <span>Clear Filters</span>
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setIsGeneralModalOpen(true)}
                                                className="px-4 py-2 rounded-full bg-[#008C80] text-white text-xs sm:text-sm font-semibold hover:bg-[#007369] transition-colors shadow-2xs cursor-pointer"
                                            >
                                                Send Your Resume →
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </section>

                {/* 6. General Talent CTA Banner */}
                <GeneralTalentCTA onSendResume={() => setIsGeneralModalOpen(true)} />
            </main>

            <Footer />

            {/* Application Modal */}
            <AnimatePresence>
                {(selectedJob || isGeneralModalOpen) && (
                    <JobApplicationForm
                        job={selectedJob || { title: 'General Application', department: 'All Departments' }}
                        isGeneralApplication={isGeneralModalOpen}
                        onClose={() => {
                            setSelectedJob(null);
                            setIsGeneralModalOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
