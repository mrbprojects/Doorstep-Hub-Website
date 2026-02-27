import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap, Users, Coffee, Rocket, Star } from 'lucide-react';
import Image from 'next/image';

const features = [
    {
        icon: Rocket,
        title: "Fast-Paced Growth",
        description: "We're expanding rapidly. Your career grows as fast as we do."
    },
    {
        icon: Users,
        title: "Collaborative Culture",
        description: "Work with smart, passionate people who lift each other up."
    },
    {
        icon: Coffee,
        title: "Work-Life Balance",
        description: "We believe in working hard and recharging harder."
    },
    {
        icon: Heart,
        title: "Impact Driven",
        description: "Your work directly affects thousands of households daily."
    }
];

export function LifeAtDoorstepHub() {
    return (
        <section id="life-at-doorstephub" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-500/5 blur-[120px] rounded-full" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
                    >
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium text-gray-300">Our Culture</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-white mb-6"
                    >
                        Life at <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Doorstep Hub</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto"
                    >
                        More than just a workplace. We are a community of innovators building the future of home services together.
                    </motion.p>
                </div>

                {/* Bento Grid Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-24">
                    {/* Large Main Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="md:col-span-8 h-[400px] relative rounded-3xl overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
                            alt="Team collaboration"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 p-8 z-20">
                            <h3 className="text-2xl font-bold text-white mb-2">Team Collaboration</h3>
                            <p className="text-gray-300">Building solutions together in our open workspace.</p>
                        </div>
                    </motion.div>

                    {/* Side Image 1 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-4 h-[400px] relative rounded-3xl overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80"
                            alt="Office Vibes"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 p-8 z-20">
                            <h3 className="text-xl font-bold text-white mb-1">Learning & Growth</h3>
                            <p className="text-sm text-gray-300">Weekly tech talks and workshops.</p>
                        </div>
                    </motion.div>

                    {/* Bottom Row */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-4 h-[300px] relative rounded-3xl overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80"
                            alt="Team Meeting"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 p-6 z-20">
                            <h3 className="text-lg font-bold text-white">Brainstorming</h3>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-4 h-[300px] relative rounded-3xl overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80"
                            alt="Celebrations"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 p-6 z-20">
                            <h3 className="text-lg font-bold text-white">Celebrations</h3>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="md:col-span-4 h-[300px] bg-[#1a1a1a] rounded-3xl border border-white/5 p-8 flex flex-col justify-center text-center group hover:bg-white/5 transition-colors"
                    >
                        <div className="mb-4 flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Heart className="w-8 h-8 text-blue-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Join Us</h3>
                        <p className="text-gray-400">Be part of our amazing journey.</p>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                        >
                            <feature.icon className="w-10 h-10 text-blue-400 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
