import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Briefcase, Globe, Zap } from 'lucide-react';

export function CareersHero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0a0a0a] text-white pt-20">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-b from-purple-900/20 to-transparent blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-gradient-to-t from-blue-900/20 to-transparent blur-[120px]" />
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <FloatingParticles />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default"
                    >
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-300">We are Hiring</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight tracking-tight">
                        Build Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">Career at Doorstep Hub</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Join a team of visionaries, builders, and dreamers. We're revolutionizing the home service industry, one doorstep at a time.
                    </p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={() => document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 group"
                        >
                            View Open Roles
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => document.getElementById('life-at-doorstephub')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 rounded-full bg-white/10 border border-white/10 text-white font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-md flex items-center gap-2"
                        >
                            <Globe className="w-5 h-5" />
                            Life at Doorstep Hub
                        </button>
                    </motion.div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/10 pt-12"
                >
                    {[
                        { label: "Employees", value: "500+" },
                        { label: "Cities", value: "20+" },
                        { label: "Growth", value: "300%" },
                        { label: "Nationality", value: "10+" },
                    ].map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-500 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function FloatingParticles() {
    const [particles, setParticles] = React.useState([]);

    React.useEffect(() => {
        const newParticles = Array.from({ length: 6 }).map((_, i) => ({
            id: i,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            duration: 10 + Math.random() * 20,
            yOffset: Math.random() * -100,
            size: 16 + i * 4
        }));
        setParticles(newParticles);
    }, []);

    return (
        <>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute opacity-20"
                    initial={{
                        x: p.x,
                        y: p.y,
                        scale: 0.5
                    }}
                    animate={{
                        y: [null, p.y + p.yOffset],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <div
                        className="rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl"
                        style={{ width: p.size * 4, height: p.size * 4 }}
                    />
                </motion.div>
            ))}
        </>
    );
}
