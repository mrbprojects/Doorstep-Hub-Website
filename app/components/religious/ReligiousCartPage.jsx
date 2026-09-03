'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trash2, ShoppingCart, Loader2, Info, Flame, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { useServiceCart } from '@/context/ServiceCartContext';

export function ReligiousCartPage({
    onBack,
    onProceedToAddress,
}) {
    const { cartItems, cartData, loading, removeFromCart, clearCart } = useServiceCart();

    const handleRemove = async (serviceId) => {
        await removeFromCart(serviceId);
    };

    const handleClear = async () => {
        if (window.confirm('Are you sure you want to empty your sacred basket?')) {
            await clearCart();
        }
    };

    if (loading && cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--off-white)]">
                <Loader2 className="w-12 h-12 text-[var(--saffron)] animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-20 pb-32 bg-[var(--off-white)]"
        >
            {/* Header - Sacred & Premium */}
            <section className="sticky top-20 z-40 bg-gradient-to-r from-[var(--saffron)] via-[var(--temple-red)] to-[var(--deep-charcoal)] border-b border-orange-100 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6 relative z-10">
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onBack}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Seek More Rituals
                        </motion.button>

                        {cartItems.length > 0 && (
                            <button
                                onClick={handleClear}
                                className="text-white/80 hover:text-white text-[10px] flex items-center gap-2 transition-colors font-black uppercase tracking-widest"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Clear Sacred Basket
                            </button>
                        )}
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 text-3xl md:text-4xl font-black text-white flex items-center gap-5"
                    >
                        <div className="p-3 bg-white/20 border border-white/30 rounded-2xl backdrop-blur-md rotate-3 shadow-xl">
                            <Flame className="w-7 h-7 text-[var(--saffron)] fill-[var(--saffron)]" />
                        </div>
                        Sacred Hub
                        {cartItems.length > 0 && (
                            <span className="text-lg md:text-xl text-white/50 font-medium tracking-tighter">/ {cartItems.length} RITE{cartItems.length > 1 ? 'S' : ''}</span>
                        )}
                    </motion.h1>
                </div>
            </section>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
                {cartItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-40 bg-white rounded-[3rem] shadow-xl border border-orange-100 relative overflow-hidden"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--saffron)]/5 rounded-full blur-[120px]" />
                        <div className="w-44 h-44 mx-auto mb-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center relative shadow-inner">
                            <ShoppingCart className="w-16 h-16 text-[var(--saffron)]/20" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border border-dashed border-[var(--saffron)]/30 rounded-full"
                            />
                        </div>
                        <h2 className="text-4xl font-black text-[var(--deep-charcoal)] mb-5 tracking-tight">Your basket is empty</h2>
                        <p className="text-gray-400 text-xl mb-12 max-w-lg mx-auto leading-relaxed">Seek divine blessings by adding your preferred pujas or homams to the sacred basket.</p>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onBack}
                            className="px-14 py-5 rounded-2xl bg-[var(--saffron)] text-white font-black text-xl hover:bg-[var(--temple-red)] shadow-xl shadow-[var(--saffron)]/20 hover:shadow-[var(--saffron)]/40 transition-all flex items-center gap-3 mx-auto"
                        >
                            Explore Pujas
                            <ArrowLeft className="w-6 h-6 rotate-180" />
                        </motion.button>
                    </motion.div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-8">
                            <AnimatePresence mode="popLayout">
                                {cartItems.map((item, index) => (
                                    <motion.div
                                        key={item.itemId}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 100 }}
                                        transition={{ delay: index * 0.05 }}
                                        layout
                                        className="group relative rounded-[2rem] p-5 bg-white border border-orange-50 hover:border-[var(--saffron)]/40 transition-all duration-500 shadow-sm hover:shadow-lg"
                                    >
                                        <div className="flex gap-6 items-start">
                                            {/* Image - Compact */}
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-orange-50 shadow-sm group-hover:scale-105 transition-transform duration-500 flex-shrink-0">
                                                <img loading="lazy" decoding="async"
                                                    src={item.itemImage ? `https://devapis.doorstephub.com/${item.itemImage}` : `https://devapis.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg`}
                                                    alt={item.itemName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Service Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <div className="min-w-0 pr-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="px-2 py-0.5 bg-[var(--saffron)]/10 text-[var(--saffron)] text-[8px] font-black uppercase tracking-widest rounded-md border border-[var(--saffron)]/20">
                                                                Vedic Rite
                                                            </span>
                                                            <CheckCircle className="w-3 h-3 text-emerald-500/50" />
                                                        </div>
                                                        <h4 className="text-lg md:text-xl font-black text-[var(--deep-charcoal)] leading-tight group-hover:text-[var(--saffron)] transition-colors truncate">
                                                            {item.itemName}
                                                        </h4>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(item.itemId)}
                                                        className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {item.description && (
                                                    <p className="text-gray-400 text-xs mb-4 line-clamp-1 italic leading-relaxed font-serif">
                                                        "{item.description}"
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-gray-300 font-black text-[9px] uppercase tracking-widest">
                                                            Quantity: <span className="text-gray-500">{item.quantity}</span>
                                                        </span>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-2xl font-black text-[var(--deep-charcoal)] group-hover:text-[var(--saffron)] transition-colors tracking-tighter">
                                                            ₹{item.subtotal.toFixed(0)}
                                                        </div>
                                                        <div className="text-[8px] text-gray-400 font-black tracking-widest uppercase">
                                                            Sacred Offering
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Price Summary - Replicated and refined for Religious */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="sticky top-48 p-10 rounded-[3rem] bg-white shadow-2xl border border-orange-100 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--saffron)]/5 rounded-full blur-[80px] -mr-20 -mt-20" />

                                <h4 className="text-xl font-bold text-[var(--deep-charcoal)] mb-8 border-b border-orange-50 pb-4">Order Summary</h4>

                                <div className="space-y-4 mb-10">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                            <span>Sacred Rituals Cost</span>
                                            <span className="text-[var(--deep-charcoal)] text-lg font-bold">₹{(cartData?.totalServiceCost || 0).toFixed(0)}</span>
                                        </div>
                                        <div className="h-px bg-orange-50" />
                                    </div>

                                    <div className="space-y-3.5 pt-1">
                                        {/* Platform Fee */}
                                        <div className="flex justify-between items-center text-gray-500 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span>Platform Fee</span>
                                                <div className="w-4 h-4 rounded-full bg-orange-50 flex items-center justify-center text-[10px] text-gray-400 cursor-help" title="Non-refundable booking fee">?</div>
                                            </div>
                                            <span className="text-[var(--deep-charcoal)] font-semibold">₹{(cartData?.consultationFee || 0).toFixed(0)}</span>
                                        </div>

                                        {/* GST */}
                                        <div className="flex justify-between items-center text-gray-500 text-sm">
                                            <span>GST (18%)</span>
                                            <span className="text-[var(--deep-charcoal)] font-semibold">₹{(cartData?.gstAmount || 0).toFixed(0)}</span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-orange-100 mt-8 mb-6" />

                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Payable Now</span>
                                                <span className="text-4xl font-black text-[var(--deep-charcoal)] tracking-tighter">₹{(cartData?.finalAmount || 0).toFixed(0)}</span>
                                            </div>
                                            <ShieldCheck className="w-8 h-8 text-[var(--saffron)] opacity-40" />
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onProceedToAddress}
                                            className="w-full px-8 py-5 rounded-2xl bg-gradient-to-r from-[var(--temple-red)] to-[var(--saffron)] text-white font-black text-xl shadow-xl shadow-orange-200 hover:shadow-orange-300 transition-all flex items-center justify-center gap-3 border border-white/20"
                                        >
                                            Confirm Rituals
                                            <ArrowLeft className="w-6 h-6 rotate-180" />
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="mt-10 p-6 rounded-3xl bg-orange-50/50 border border-orange-100 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <Flame className="w-5 h-5 text-[var(--saffron)]" />
                                    </div>
                                    <p className="text-gray-400 text-[9px] leading-relaxed font-black uppercase tracking-[0.2em]">
                                        May the divine bless your home. <span className="text-[var(--saffron)]">Dakshina</span> covers Vedic Priestly expertise and basic ritual essentials.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
