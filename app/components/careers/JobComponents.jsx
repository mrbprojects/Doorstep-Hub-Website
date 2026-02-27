import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function JobFilter({ activeRole, onRoleChange }) {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/careers/get-roles');
                const data = await response.json();
                if (data.success) {
                    setRoles(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch roles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    return (
        <div className="sticky top-24 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-y border-white/10 py-6 mb-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    {/* Horizontal Scrollable Categories */}
                    <div className="w-full overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        <div className="flex gap-3">
                            <button
                                onClick={() => onRoleChange(null)}
                                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${!activeRole
                                        ? 'bg-white text-black shadow-lg shadow-white/20'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                                    }`}
                            >
                                All Roles
                            </button>
                            {roles.map((role) => (
                                <button
                                    key={role._id}
                                    onClick={() => onRoleChange(role._id)}
                                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeRole === role._id
                                            ? 'bg-white text-black shadow-lg shadow-white/20'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                                        }`}
                                >
                                    {role.name}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export function JobCard({ job, onClick }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onClick={onClick}
            className="group relative p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="inline-block px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
                            {job.department}
                        </span>
                        <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                            {job.title}
                        </h3>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-8">
                    <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {job.experienceLevel}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {job.employmentType}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] bg-gray-700 flex items-center justify-center text-[10px] text-white">
                                <Filter className="w-3 h-3" />
                            </div>
                        ))}
                    </div>
                    <span className="text-white font-medium group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                        View Details <span className="text-xl">→</span>
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
