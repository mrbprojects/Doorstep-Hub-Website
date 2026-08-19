'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trash2, ShoppingCart, Loader2, Home, MapPin, Building2, ShieldCheck, Info, Sparkles, Store } from 'lucide-react';
import { useServiceCart } from '@/context/ServiceCartContext';

export function PGCartPage({
    onBack,
    onProceedToAddress,
}) {
    const { cartItems, cartData, loading, removeFromCart, clearCart } = useServiceCart();

    const handleRemove = async (serviceId) => {
        await removeFromCart(serviceId);
    };

    const handleClear = async () => {
        if (window.confirm('Are you sure you want to clear your stay selection?')) {
            await clearCart();
        }
    };

    if (loading && cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-12 h-12 text-[#037166] animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-20 pb-32 bg-slate-50/50"
        >
            <section className="sticky top-20 z-40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/5 shadow-lg overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#037166]/10 rounded-full -mr-32 -mt-32 blur-[80px]" />

                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6 relative z-10">
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onBack}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/80 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Explore More Stays
                        </motion.button>

                        {cartItems.length > 0 && (
                            <button
                                onClick={handleClear}
                                className="text-white/40 hover:text-red-400 text-[10px] flex items-center gap-2 transition-colors font-black uppercase tracking-widest"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Clear Portfolio
                            </button>
                        )}
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-3xl md:text-4xl font-black text-white flex items-center gap-5"
                    >
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
                            <Home className="w-8 h-8 md:w-9 md:h-9 text-[#037166]" />
                        </div>
                        Stay Portfolio
                        {cartItems.length > 0 && (
                            <span className="text-lg md:text-xl text-white/30 font-medium tracking-tighter">/ {cartItems.length} PROPERTY</span>
                        )}
                    </motion.h1>
                </div>
            </section>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-14">
                {cartItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-40 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-96 bg-gradient-to-b from-slate-50 via-transparent to-transparent -mt-32" />
                        <div className="w-48 h-48 mx-auto mb-10 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative">
                            <Building2 className="w-16 h-16 text-slate-200" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-5 tracking-tight">Looking for a place to stay?</h2>
                        <p className="text-slate-500 text-xl mb-12 max-w-lg mx-auto leading-relaxed font-medium">Your stay selection is empty. Browse through our verified premium PG and hostel listings.</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onBack}
                            className="px-14 py-6 rounded-2xl bg-[#037166] text-white font-black text-xl hover:shadow-2xl hover:shadow-[#037166]/40 transition-all flex items-center gap-3 mx-auto shadow-xl"
                        >
                            Discover Properties
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
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: index * 0.05 }}
                                        layout
                                        className="group relative rounded-[2rem] p-5 bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/5 hover:border-[#037166]/40 transition-all duration-500 shadow-xl overflow-hidden"
                                    >
                                        <div className="flex gap-6 items-start relative z-10">
                                            {/* Image - Compact */}
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-700">
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
                                                            <span className="px-2 py-0.5 bg-green-500/10 text-[#04a99d] text-[8px] font-black uppercase tracking-widest rounded-md border border-[#04a99d]/20">
                                                                Verified Property
                                                            </span>
                                                            <ShieldCheck className="w-3.5 h-3.5 text-green-500/50" />
                                                        </div>
                                                        <h4 className="text-lg md:text-xl font-black text-white group-hover:text-[#037166] transition-colors leading-tight truncate">
                                                            {item.itemName}
                                                        </h4>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(item.itemId)}
                                                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all shadow-md"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {item.description && (
                                                    <p className="text-white/30 text-xs mb-4 line-clamp-1 italic font-medium leading-relaxed pl-3 border-l-2 border-[#037166]/20">
                                                        {item.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-3 h-3 text-[#037166]" />
                                                            <span className="text-white/40 font-black text-[9px] uppercase tracking-widest">
                                                                {item.quantity} Admit(s)
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-2xl font-black text-white group-hover:text-[#037166] transition-colors tracking-tighter">
                                                            ₹{item.subtotal.toFixed(0)}
                                                        </div>
                                                        <div className="text-[8px] text-white/20 font-black tracking-widest uppercase">
                                                            Premium Stay
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Price Summary - Sticky on Desktop */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="sticky top-48 p-8 rounded-[2rem] bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] text-white shadow-3xl relative border border-white/10 overflow-hidden shadow-gray-900/50"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-[#037166]/5 rounded-full blur-[80px] -mr-20 -mt-20" />

                                <h4 className="text-xl font-bold text-white mb-8 border-b border-white/5 pb-4">Order Summary</h4>

                                <div className="space-y-4 mb-2">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-white/50 text-[10px] font-black uppercase tracking-widest">
                                            <span>Monthly Rent</span>
                                            <span className="text-white text-lg">₹{(cartData?.totalServiceCost || 0).toFixed(0)}</span>
                                        </div>
                                        <div className="h-px bg-white/5" />
                                    </div>

                                    <div className="space-y-3.5 pt-1">


                                        {/* GST */}
                                        <div className="flex justify-between items-center text-white/40 text-sm">
                                            <span>GST (18%)</span>
                                            <span className="text-white/70 font-semibold">₹{(cartData?.gstAmount || 0).toFixed(0)}</span>
                                        </div>
                                        {/* Platform Fee */}
                                        <div className="flex justify-between items-center text-white/40 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span>Platform Fee</span>
                                                <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/40 cursor-help" title="Non-refundable booking fee">?</div>
                                            </div>
                                            <span className="text-white/70 font-semibold">₹{(cartData?.consultationFee || 0).toFixed(0)}</span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/10 mt-8 mb-6" />

                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-white/30 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Payable Now</span>
                                                <span className="text-4xl font-black text-white tracking-tighter">₹{(cartData?.finalAmount || 0).toFixed(0)}</span>
                                            </div>
                                            <ShieldCheck className="w-8 h-8 text-[#037166] opacity-50" />
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onProceedToAddress}
                                            className="w-full px-6 py-5 rounded-2xl bg-[#037166] text-white font-black text-xl shadow-2xl shadow-[#037166]/20 hover:shadow-[#037166]/40 transition-all flex items-center justify-center gap-3 border border-white/10"
                                        >
                                            Confirm Stay Booking
                                            <ArrowLeft className="w-6 h-6 rotate-180" />
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="mt-8 p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-3">
                                    <p className="text-white/40 text-[9px] leading-relaxed font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                        Monthly rent is <span className="text-white">Pay at Hostel</span> <Store className="w-3 h-3 text-[#037166]" />
                                    </p>
                                    <p className="text-white/20 text-[8px] leading-relaxed font-medium uppercase tracking-widest text-center">
                                        verified by DoorstepHub Safety
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
