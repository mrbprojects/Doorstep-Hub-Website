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
            <div className="min-h-screen flex items-center justify-center bg-[#1a0f02]">
                <Loader2 className="w-12 h-12 text-[#ff9933] animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-20 pb-32 bg-[#0d0701]"
        >
            {/* Header - Sacred & Premium */}
            <section className="sticky top-20 z-40 bg-gradient-to-r from-[#800000] via-[#ff9933] to-[#800000] border-b border-[#ff9933]/20 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onBack}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all text-sm font-bold shadow-lg"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Keep Discovering
                        </motion.button>

                        {cartItems.length > 0 && (
                            <button
                                onClick={handleClear}
                                className="text-white/60 hover:text-white text-sm flex items-center gap-2 transition-colors font-bold uppercase tracking-widest text-[10px]"
                            >
                                <Trash2 className="w-4 h-4" />
                                Deselect All
                            </button>
                        )}
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 text-4xl md:text-5xl font-black text-white flex items-center gap-5 drop-shadow-2xl"
                    >
                        <div className="p-3 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md rotate-3">
                            <Flame className="w-8 h-8 text-[#ff9933] fill-[#ff9933]" />
                        </div>
                        Sacred Selections
                        {cartItems.length > 0 && (
                            <span className="text-xl text-white/40 font-medium">[{cartItems.length} Rite{cartItems.length > 1 ? 's' : ''}]</span>
                        )}
                    </motion.h1>
                </div>
            </section>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
                {cartItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-40 bg-gradient-to-br from-[#1a110a] to-[#0d0701] rounded-[3rem] shadow-2xl border border-[#ff9933]/10 relative overflow-hidden"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff9933]/5 rounded-full blur-[120px]" />
                        <div className="w-44 h-44 mx-auto mb-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative shadow-inner">
                            <ShoppingCart className="w-16 h-16 text-[#ff9933]/20" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border border-dashed border-[#ff9933]/30 rounded-full"
                            />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-5 tracking-tight">Your basket is empty</h2>
                        <p className="text-white/40 text-xl mb-12 max-w-lg mx-auto leading-relaxed">Seek divine blessings by adding your preferred pujas or homams to the sacred basket.</p>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onBack}
                            className="px-14 py-5 rounded-2xl bg-[#ff9933] text-white font-black text-xl hover:bg-[#e68a00] hover:shadow-2xl hover:shadow-[#ff9933]/40 transition-all flex items-center gap-3 mx-auto shadow-xl"
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
                                        className="group relative rounded-[2.5rem] p-8 bg-gradient-to-br from-[#1a110a] to-[#0d0701] border border-white/5 hover:border-[#ff9933]/40 transition-all duration-700 shadow-xl"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-10 items-center sm:items-start">
                                            {/* Image */}
                                            <div className="w-40 h-40 rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-700 flex-shrink-0">
                                                <img
                                                    src={item.itemImage ? `https://api.doorstephub.com/${item.itemImage}` : `https://api.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg`}
                                                    alt={item.itemName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Service Info */}
                                            <div className="flex-1 text-center sm:text-left">
                                                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-4 gap-4">
                                                    <div>
                                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                                            <span className="px-3 py-1 bg-[#ff9933]/10 text-[#ff9933] text-[9px] font-black uppercase tracking-[0.2em] rounded-md border border-[#ff9933]/20">
                                                                Vedic Rite
                                                            </span>
                                                            <CheckCircle className="w-3.5 h-3.5 text-green-500 opacity-50" />
                                                        </div>
                                                        <h4 className="text-3xl font-black text-white leading-tight">
                                                            {item.itemName}
                                                        </h4>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(item.itemId)}
                                                        className="p-4 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all shadow-md group/trash"
                                                    >
                                                        <Trash2 className="w-5 h-5 group-trash:scale-110" />
                                                    </button>
                                                </div>

                                                {item.description && (
                                                    <p className="text-white/40 text-base mb-8 line-clamp-2 italic leading-relaxed font-serif">"{item.description}"</p>
                                                )}

                                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <h6 className="text-white/20 font-black text-[10px] uppercase tracking-widest">
                                                            Quantity: <span className="text-white/60">{item.quantity}</span>
                                                        </h6>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-xs text-white/20 font-black tracking-widest uppercase mb-1 drop-shadow-sm">
                                                            Sacred Offering
                                                        </div>
                                                        <div className="text-4xl font-black text-white group-hover:text-[#ff9933] transition-colors tracking-tighter">
                                                            ₹{item.subtotal.toFixed(2)}
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
                                className="sticky top-48 p-10 rounded-[3rem] bg-gradient-to-br from-[#1a110a] to-[#0d0701] shadow-3xl border border-[#ff9933]/15 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff9933]/5 rounded-full blur-[80px] -mr-20 -mt-20" />

                                <h4 className="text-xl font-bold text-white mb-8 border-b border-white/5 pb-4">Order Summary</h4>

                                <div className="space-y-6 mb-12">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-white/50 text-xs font-black uppercase tracking-widest">
                                            <span>Sacred Rituals Cost</span>
                                            <span className="text-white text-lg">₹{(cartData?.totalServiceCost || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="h-px bg-white/5" />
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex justify-between items-center text-white/50 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span>Platform Sewa Fee</span>
                                                <Info className="w-3.5 h-3.5 text-[#ff9933]/50" />
                                            </div>
                                            <span className="text-white/80 font-bold">₹{(cartData?.platformFee || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-white/50 text-sm">
                                            <span>Consultation Fee</span>
                                            <span className="text-white/80 font-bold">₹{(cartData?.consultationFee || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-white/50 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <span>GST</span>
                                                <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-white/40">18%</span>
                                            </div>
                                            <span className="text-white/80 font-bold">₹{(cartData?.gstAmount || 0).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/10 mt-8 mb-6" />

                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-white/30 text-xs uppercase font-black tracking-widest">Payable Online Now</span>
                                                <span className="text-4xl font-black text-white tracking-tighter shadow-lg">₹{(cartData?.finalAmount || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <ShieldCheck className="w-6 h-6 text-green-500 opacity-80" />
                                                <span className="text-[9px] text-green-500/80 font-bold uppercase tracking-tighter">Secure Booking</span>
                                            </div>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onProceedToAddress}
                                            className="w-full px-8 py-5 rounded-2xl bg-gradient-to-r from-[#800000] to-[#ff9933] text-white font-black text-xl shadow-2xl shadow-[#ff9933]/20 hover:shadow-[#ff9933]/40 transition-all flex items-center justify-center gap-3 border border-white/10"
                                        >
                                            Confirm Rituals
                                            <ArrowLeft className="w-6 h-6 rotate-180" />
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="mt-10 p-6 rounded-3xl bg-white/5 border border-white/5 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 animate-pulse">
                                        <Flame className="w-5 h-5 text-[#ff9933]" />
                                    </div>
                                    <p className="text-white/30 text-[9px] leading-relaxed font-black uppercase tracking-[0.2em]">
                                        May the divine bless your home. <span className="text-[#ff9933]">Dakshina</span> covers Vedic Priestly expertise and basic ritual essentials.
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
