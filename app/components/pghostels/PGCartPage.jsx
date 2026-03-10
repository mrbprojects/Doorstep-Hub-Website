'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trash2, ShoppingCart, Loader2, Home, MapPin, Building2, ShieldCheck, Info, Sparkles } from 'lucide-react';
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
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="w-12 h-12 text-[#037166] animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-20 pb-32 bg-[#0a0a0a]"
        >
            {/* Header - Refined Premium Header */}
            <section className="sticky top-20 z-40 bg-gradient-to-r from-[#0f1614] via-[#025a51] to-[#037166] border-b border-white/5 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-[80px]" />

                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onBack}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all text-sm font-bold shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Explore More Listings
                        </motion.button>

                        {cartItems.length > 0 && (
                            <button
                                onClick={handleClear}
                                className="text-white/40 hover:text-red-400 text-sm flex items-center gap-2 transition-colors font-black uppercase tracking-widest text-[10px]"
                            >
                                <Trash2 className="w-4 h-4" />
                                Deselect Stay
                            </button>
                        )}
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-4xl md:text-5xl font-black text-white flex items-center gap-6"
                    >
                        <div className="p-4 bg-white rounded-3xl shadow-xl shadow-[#025a51]/30">
                            <Home className="w-10 h-10 text-[#037166]" />
                        </div>
                        <span>Stay Portfolio</span>
                        {cartItems.length > 0 && (
                            <span className="text-xl text-[#04a99d] font-black tracking-tighter self-end mb-2">/ REVIEW BOOKING</span>
                        )}
                    </motion.h1>
                </div>
            </section>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-14">
                {cartItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-40 bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-96 bg-gradient-to-b from-[#037166]/5 via-transparent to-transparent -mt-32" />
                        <div className="w-48 h-48 mx-auto mb-10 rounded-[2.5rem] bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center relative shadow-inner">
                            <Building2 className="w-16 h-16 text-white/10" />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-5 tracking-tight">Looking for a place to stay?</h2>
                        <p className="text-white/40 text-xl mb-12 max-w-lg mx-auto leading-relaxed font-medium">Your stay selection is empty. Browse through our verified premium PG and hostel listings.</p>
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
                                        className="group relative rounded-[2.5rem] p-8 bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/5 hover:border-[#037166]/40 transition-all duration-700 shadow-xl overflow-hidden"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-10 items-center sm:items-start relative z-10">
                                            {/* Image */}
                                            <div className="w-44 h-44 rounded-3xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-700">
                                                <img
                                                    src={item.itemImage ? `https://api.doorstephub.com/${item.itemImage}` : `https://api.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg`}
                                                    alt={item.itemName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Service Info */}
                                            <div className="flex-1 text-center sm:text-left">
                                                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-5 gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-center sm:justify-start gap-2">
                                                            <span className="px-3 py-1 bg-green-500/10 text-[#04a99d] text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-[#04a99d]/20">
                                                                Verified Property
                                                            </span>
                                                            <ShieldCheck className="w-4 h-4 text-green-500/50" />
                                                        </div>
                                                        <h4 className="text-3xl font-black text-white group-hover:text-[#037166] transition-colors leading-tight">
                                                            {item.itemName}
                                                        </h4>
                                                        <p className="text-white/40 text-sm font-bold flex items-center justify-center sm:justify-start gap-2">
                                                            <MapPin className="w-4 h-4 text-[#037166]" />
                                                            Premium Locale
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(item.itemId)}
                                                        className="p-4 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all shadow-md group/trash"
                                                    >
                                                        <Trash2 className="w-5 h-5 group-trash:scale-110" />
                                                    </button>
                                                </div>

                                                {item.description && (
                                                    <p className="text-white/40 text-base mb-8 line-clamp-2 leading-relaxed font-medium italic border-l-4 border-[#037166]/20 pl-4">{item.description}</p>
                                                )}

                                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-[#037166]/10 flex items-center justify-center">
                                                            <Building2 className="w-5 h-5 text-[#037166]" />
                                                        </div>
                                                        <span className="text-white/20 font-black text-xs uppercase tracking-widest">
                                                            Booked For: <span className="text-white font-black">{item.quantity} Admit(s)</span>
                                                        </span>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-xs text-white/20 font-black tracking-widest uppercase mb-1 drop-shadow-sm">
                                                            Booking Intent Amount
                                                        </div>
                                                        <div className="text-4xl font-black text-white group-hover:text-[#037166] transition-colors tracking-tighter shadow-white/5">
                                                            ₹{item.subtotal.toFixed(0)}
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
                                className="sticky top-48 p-12 rounded-[3.5rem] bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] text-white shadow-3xl relative border border-white/10 overflow-hidden shadow-gray-900/50"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-[#037166]/5 rounded-full blur-[80px] -mr-20 -mt-20" />

                                <h4 className="text-xl font-bold text-white mb-8 border-b border-white/5 pb-4">Order Summary</h4>

                                <div className="space-y-6 mb-12">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-white/50 text-xs font-black uppercase tracking-widest">
                                            <span>Stay Package Cost</span>
                                            <span className="text-white text-lg">₹{(cartData?.totalServiceCost || 0).toFixed(0)}</span>
                                        </div>
                                        <div className="h-px bg-white/5" />
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex justify-between items-center text-white/50 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span>Admin Charges</span>
                                                <Info className="w-3.5 h-3.5 text-[#037166]/50" />
                                            </div>
                                            <span className="text-white/80 font-bold">₹{(cartData?.platformFee || 0).toFixed(0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-white/50 text-sm">
                                            <span>Verification Fee</span>
                                            <span className="text-white/80 font-bold">₹{(cartData?.consultationFee || 0).toFixed(0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-white/50 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <span>GST</span>
                                                <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-white/40">18%</span>
                                            </div>
                                            <span className="text-white/80 font-bold">₹{(cartData?.gstAmount || 0).toFixed(0)}</span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/10 mt-8 mb-6" />

                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-white/30 text-xs uppercase font-black tracking-widest">Payable Online Now</span>
                                                <span className="text-4xl font-black text-white tracking-tighter shadow-lg">₹{(cartData?.finalAmount || 0).toFixed(0)}</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <ShieldCheck className="w-6 h-6 text-green-500 opacity-80" />
                                                <span className="text-[9px] text-green-500/80 font-bold uppercase tracking-tighter">Verified Stay</span>
                                            </div>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onProceedToAddress}
                                            className="w-full px-8 py-5 rounded-2xl bg-[#037166] text-white font-black text-xl shadow-2xl shadow-[#037166]/20 hover:shadow-[#037166]/40 transition-all flex items-center justify-center gap-3 border border-white/10"
                                        >
                                            Confirm Stay Booking
                                            <ArrowLeft className="w-6 h-6 rotate-180" />
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="mt-12 p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex flex-col gap-4 text-center">
                                    <p className="text-white/30 text-[9px] leading-relaxed font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                                        Verified property by <span className="text-white">DoorstepHub Safety</span> <ShieldCheck className="w-4 h-4 text-[#037166]" />
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
