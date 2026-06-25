'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trash2, ShoppingCart, Loader2, Tag, Scissors, Sparkles, Info, ShieldCheck, AlertTriangle, Store, Zap } from 'lucide-react';
import { useServiceCart } from '@/context/ServiceCartContext';

export function SpaCartPage({
    onBack,
    onProceedToAddress,
}) {
    const { cartItems, cartData, loading, removeFromCart, clearCart } = useServiceCart();

    // Detect mixed providers
    const uniqueProviders = [...new Set(cartItems.map(i => i.providerId).filter(Boolean))];
    const hasMixedProviders = uniqueProviders.length > 1;

    const handleRemove = async (serviceId) => {
        await removeFromCart(serviceId);
    };

    const handleClear = async () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            await clearCart();
        }
    };

    if (loading && cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-12 h-12 text-[#C06C84] animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-20 pb-32 bg-[#FDF8FA]"
        >
            {/* Header - Refined Premium Header */}
            <section className="sticky top-20 z-40 bg-gradient-to-r from-[#C06C84] via-[#6D1357] to-[#C06C84] border-b border-white/10 shadow-lg overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <Sparkles className="absolute top-4 left-10 w-6 h-6 text-white animate-pulse" />
                </div>

                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6 relative z-10">
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onBack}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Continue Pampering
                        </motion.button>

                        {cartItems.length > 0 && (
                            <button
                                onClick={handleClear}
                                className="text-white/60 hover:text-white text-[10px] flex items-center gap-2 transition-colors font-black uppercase tracking-widest"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Clear All
                            </button>
                        )}
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-3xl md:text-4xl font-black text-white flex items-center gap-4"
                    >
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                            <ShoppingCart className="w-8 h-8 md:w-9 md:h-9" />
                        </div>
                        Selection Hub
                        {cartItems.length > 0 && (
                            <span className="text-lg md:text-xl text-white/50 font-medium tracking-tighter">/ {cartItems.length} ITEM{cartItems.length > 1 ? 'S' : ''}</span>
                        )}
                    </motion.h1>
                </div>
            </section>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
                {cartItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-32 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm"
                    >
                        <div className="w-40 h-40 mx-auto mb-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center relative">
                            <ShoppingCart className="w-16 h-16 text-slate-300" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border border-dashed border-[#C06C84]/30 rounded-full"
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Nothing here yet</h2>
                        <p className="text-slate-500 text-lg mb-10 max-w-sm mx-auto">Your spa basket is waiting for some premium treatments. Start your glow-up now!</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onBack}
                            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] text-white font-bold text-lg shadow-xl shadow-[#C06C84]/20 hover:shadow-[#C06C84]/40 transition-all"
                        >
                            Browse Pampering Services
                        </motion.button>
                    </motion.div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-10">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* ── Mixed Provider Warning ── */}
                            {hasMixedProviders && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 flex items-start gap-4"
                                >
                                    <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-amber-300 font-bold text-sm mb-1">Services from multiple providers</p>
                                        <p className="text-amber-200/60 text-xs leading-relaxed">
                                            Your cart has services from <span className="font-bold text-amber-300">{uniqueProviders.length} different professionals</span>. Only one provider can be booked at a time. Please clear your cart before adding services from a different provider.
                                        </p>
                                        <button
                                            onClick={handleClear}
                                            className="mt-3 px-4 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors"
                                        >
                                            Clear Cart &amp; Start Fresh
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            <AnimatePresence mode="popLayout">
                                {cartItems.map((item, index) => (
                                    <motion.div
                                        key={item.itemId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: index * 0.05 }}
                                        layout
                                        className="group relative rounded-3xl p-5 bg-white border border-[#C06C84]/10 hover:border-[#C06C84]/40 hover:shadow-xl hover:shadow-[#C06C84]/5 transition-all duration-500"
                                    >
                                        <div className="flex gap-6">
                                            {/* Image - More compact */}
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#6D1357]/5 flex-shrink-0 relative border border-[#C06C84]/10">
                                                <img loading="lazy" decoding="async"
                                                    src={item.itemImage ? `https://api.doorstephub.com/${item.itemImage}` : `https://api.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg`}
                                                    alt={item.itemName}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </div>

                                            {/* Service Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <div className="min-w-0 pr-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="px-2 py-0.5 rounded-md bg-[#6D1357]/5 text-[#6D1357] text-[8px] font-black uppercase tracking-widest border border-[#6D1357]/10">
                                                                {item.itemType === 'service' || item.itemType === 'professional_service' ? 'Treatment' : 'Add-on'}
                                                            </span>
                                                            {item.providerId && (
                                                                <span className="text-slate-300 text-[8px] font-bold uppercase tracking-widest">
                                                                    ID: {item.providerId.slice(-6)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h4 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-[#6D1357] transition-colors leading-tight truncate">
                                                            {item.itemName}
                                                        </h4>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(item.itemId)}
                                                        className="p-2 rounded-xl bg-red-50 hover:bg-red-500 text-red-500 hover:text-white transition-all shadow-sm flex-shrink-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {item.description && (
                                                    <p className="text-slate-400 text-xs mb-4 line-clamp-1 italic leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#C06C84]" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                Qty: <span className="text-slate-900">{item.quantity}</span>
                                                            </span>
                                                        </div>
                                                        {item.itemType === 'addon' && item.parentServiceName && (
                                                            <div className="hidden sm:flex items-center gap-1 text-[9px] text-[#C06C84] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#C06C84]/5">
                                                                <Zap className="w-3 h-3" />
                                                                For: {item.parentServiceName.slice(0, 15)}...
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-2xl font-black text-[#6D1357] tracking-tighter shadow-sm">
                                                            ₹{item.subtotal.toFixed(2)}
                                                        </div>
                                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                                            Unit: ₹{item.price}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Price Summary - Replicated and Refined Style */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="sticky top-48 p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm overflow-hidden"
                            >
                                {/* Decoration */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C06C84]/5 rounded-full blur-3xl -mr-16 -mt-16" />

                                <h4 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Order Summary</h4>

                                <div className="space-y-4 mb-8">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                            <span>Treatments Total</span>
                                            <span className="text-slate-900 text-lg font-bold">₹{(cartData?.totalServiceCost || 0).toFixed(0)}</span>
                                        </div>
                                        <div className="h-px bg-slate-50" />
                                    </div>

                                    <div className="space-y-3.5 pt-1">
                                        {/* Platform Fee */}
                                        <div className="flex justify-between items-center text-slate-500 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span>Platform Fee</span>
                                                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 cursor-help" title="Non-refundable booking fee">?</div>
                                            </div>
                                            <span className="text-slate-900 font-semibold">₹{(cartData?.consultationFee || 0).toFixed(0)}</span>
                                        </div>

                                        {/* GST */}
                                        {/* <div className="flex justify-between items-center text-slate-500 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <span>GST (18%)</span>
                                            </div>
                                            <span className="text-slate-900 font-semibold">₹{(cartData?.gstAmount || 0).toFixed(0)}</span>
                                        </div> */}
                                    </div>

                                    <div className="h-px bg-slate-100 mt-8 mb-6" />

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Payable Now</span>
                                                <span className="text-4xl font-black text-[#C06C84] tracking-tighter">₹{(cartData?.consultationFee || 0).toFixed(0)}</span>
                                            </div>
                                            <ShieldCheck className="w-8 h-8 text-[#C06C84] opacity-50" />
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onProceedToAddress}
                                            disabled={hasMixedProviders}
                                            className={`w-full px-8 py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 ${hasMixedProviders
                                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] text-white shadow-[#C06C84]/20 hover:shadow-[#C06C84]/40'
                                                }`}
                                        >
                                            {hasMixedProviders ? 'Resolve conflicts above' : 'Book My Glow-up'}
                                            {!hasMixedProviders && <ArrowLeft className="w-6 h-6 rotate-180" />}
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-pink-50 border border-pink-100 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-[#C06C84]/10 flex items-center justify-center flex-shrink-0 text-[#C06C84]">
                                        <Scissors className="w-4 h-4" />
                                    </div>
                                    <p className="text-pink-700 text-[10px] leading-relaxed font-bold uppercase tracking-wider">
                                        Total includes booking fees. <span className="text-[#C06C84]">Service professional</span> will confirm exact details for material requirements.
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
