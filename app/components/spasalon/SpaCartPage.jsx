'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trash2, ShoppingCart, Loader2, Tag, Scissors, Sparkles, Info, ShieldCheck, AlertTriangle, Store } from 'lucide-react';
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
            className="min-h-screen pt-20 pb-32 bg-slate-50/50"
        >
            {/* Header - Refined Premium Header */}
            <section className="sticky top-20 z-40 bg-gradient-to-r from-[#C06C84] via-[#6C5CE7] to-[#C06C84] border-b border-white/10 shadow-lg overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <Sparkles className="absolute top-4 left-10 w-6 h-6 text-white animate-pulse" />
                </div>

                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6 relative z-10">
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onBack}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all text-sm font-bold"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Continue Pampering
                        </motion.button>

                        {cartItems.length > 0 && (
                            <button
                                onClick={handleClear}
                                className="text-white/60 hover:text-white text-sm flex items-center gap-2 transition-colors font-medium border-b border-white/10 hover:border-white/40"
                            >
                                <Trash2 className="w-4 h-4" />
                                Empty Selection
                            </button>
                        )}
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-3xl md:text-5xl font-black text-white flex items-center gap-4"
                    >
                        <ShoppingCart className="w-8 h-8 md:w-10 md:h-10" />
                        Selection Hub
                        {cartItems.length > 0 && (
                            <span className="text-lg md:text-xl text-white/60 font-medium">({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
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
                                        className="group relative rounded-3xl p-6 bg-white border border-slate-200 hover:border-[#C06C84]/30 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-8">
                                            {/* Image */}
                                            <div className="w-full sm:w-28 sm:h-28 h-48 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0 relative">
                                                <img
                                                    src={item.itemImage ? `https://api.doorstephub.com/${item.itemImage}` : `https://api.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg`}
                                                    alt={item.itemName}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>

                                            {/* Service Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-[#C06C84] transition-colors leading-tight">
                                                            {item.itemName}
                                                        </h4>
                                                        {/* Provider identity badge */}
                                                        {item.providerId && (
                                                            <p className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
                                                                <Store className="w-3 h-3 text-[#6D1357]" />
                                                                <span className="text-slate-500">Provider ID:</span>
                                                                <span className="text-[#C06C84] font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                                                                    {item.providerId}
                                                                </span>
                                                            </p>
                                                        )}
                                                        {item.itemType === 'addon' && item.parentServiceName && (
                                                            <p className="text-slate-400 text-sm flex items-center gap-1 font-medium">
                                                                <Tag className="w-3 h-3 text-[#C06C84]" />
                                                                Booster for: <span className="text-[#C06C84]">{item.parentServiceName}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(item.itemId)}
                                                        className="p-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 transition-all shadow-sm"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {item.description && (
                                                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 italic leading-relaxed">"{item.description}"</p>
                                                )}

                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-3">
                                                        <span className="px-4 py-1.5 rounded-full bg-[#C06C84]/10 text-[#C06C84] text-[10px] font-black uppercase tracking-widest border border-[#C06C84]/20">
                                                            {item.itemType === 'service' || item.itemType === 'professional_service' ? 'Expert Treatment' : 'Premium Boost'}
                                                        </span>
                                                        <span className="text-slate-400 font-bold text-sm uppercase tracking-tighter">
                                                            Quantity: {item.quantity}
                                                        </span>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-3xl font-black text-slate-900">
                                                            ₹{item.subtotal.toFixed(2)}
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-medium">
                                                            Base: ₹{item.price} {item.priceUnit}
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
                                            <span>Services Subtotal</span>
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
                                        <div className="flex justify-between items-center text-slate-500 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <span>GST (18%)</span>
                                            </div>
                                            <span className="text-slate-900 font-semibold">₹{(cartData?.gstAmount || 0).toFixed(0)}</span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100 mt-8 mb-6" />

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Payable Now</span>
                                                <span className="text-4xl font-black text-[#C06C84] tracking-tighter">₹{(cartData?.finalAmount || 0).toFixed(0)}</span>
                                            </div>
                                            <ShieldCheck className="w-8 h-8 text-[#C06C84] opacity-50" />
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onProceedToAddress}
                                            disabled={hasMixedProviders}
                                            className={`w-full px-8 py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 ${
                                                hasMixedProviders
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
