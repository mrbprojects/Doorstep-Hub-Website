'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CareersHero } from '@/components/careers/CareersHero';
import { JobFilter, JobCard } from '@/components/careers/JobComponents';
import { JobApplicationForm } from '@/components/careers/JobApplicationForm';
import { LifeAtDoorstepHub } from '@/components/careers/LifeAtDoorstepHub';
import { AnimatePresence, motion } from 'framer-motion';

export default function CareersPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRole, setActiveRole] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                let url = 'https://api.doorstephub.com/v1/dhubApi/app/careers/open-jobs';
                if (activeRole) {
                    url += `?roleId=${activeRole}`;
                }

                const response = await fetch(url);
                const data = await response.json();
                if (data.success && data.data) {
                    setJobs(data.data);
                } else {
                    setJobs([]);
                }
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [activeRole]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
            <Header />

            <main>
                <CareersHero />
                <LifeAtDoorstepHub />

                <section id="open-positions" className="py-20 bg-[#0a0a0a] relative min-h-screen">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black mb-4">Open Positions</h2>
                            <p className="text-xl text-gray-400">Find your place in our growing team</p>
                        </div>

                        <JobFilter activeRole={activeRole} onRoleChange={setActiveRole} />

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    // Loading Skeletons
                                    [...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={`skeleton-${i}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="h-[300px] rounded-3xl bg-white/5 animate-pulse border border-white/5"
                                        />
                                    ))
                                ) : jobs.length > 0 ? (
                                    jobs.map((job) => (
                                        <JobCard
                                            key={job._id}
                                            job={job}
                                            onClick={() => setSelectedJob(job)}
                                        />
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="col-span-full py-20 text-center"
                                    >
                                        <h3 className="text-2xl font-bold text-gray-500">No positions found</h3>
                                        <p className="text-gray-600">Try adjusting your filters or check back later.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />

            <AnimatePresence>
                {selectedJob && (
                    <JobApplicationForm
                        job={selectedJob}
                        onClose={() => setSelectedJob(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
