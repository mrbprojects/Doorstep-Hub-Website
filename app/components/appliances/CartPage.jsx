'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trash2, ShoppingCart, Loader2, Tag, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';

export function CartPage({
  onBack,
  onProceedToAddress,
}) {
  const { cartItems, cartData, loading, removeFromCart, clearCart } = useServiceCart();

  const handleRemove = async (serviceId) => {
    await removeFromCart(serviceId);
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const inspectionCost = cartItems.reduce((acc, item) => acc + (item.inspectionCost || 0), 0);
  const platformFee = cartData?.platformFee || 0;

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      {/* Header */}
      <section className="sticky top-20 z-40 bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] border-b border-white/10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-[80px]" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Continue Service Booking
            </motion.button>

            {cartItems.length > 0 && (
              <button
                onClick={handleClear}
                className="text-white/40 hover:text-white text-[10px] flex items-center gap-2 transition-colors font-black uppercase tracking-widest"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Cart
              </button>
            )}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-3xl md:text-4xl font-black text-white flex items-center gap-4"
          >
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
              <ShoppingCart className="w-8 h-8 md:w-9 md:h-9" />
            </div>
            Doorstep Hub
            {cartItems.length > 0 && (
              <span className="text-lg md:text-xl text-white/50 font-medium tracking-tighter">/ {cartItems.length} ITEM{cartItems.length > 1 ? 's' : ''}</span>
            )}
          </motion.h1>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          // Empty Cart State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm"
          >
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
            <p className="text-slate-500 mb-8">Add some services to get started!</p>
            <button
              onClick={onBack}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium hover:shadow-lg hover:shadow-[#037166]/30 transition-all"
            >
              Browse Services
            </button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.itemId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                    className="group relative rounded-3xl p-5 bg-white border border-[#037166]/10 hover:border-[#037166]/40 hover:shadow-xl hover:shadow-[#037166]/5 transition-all duration-500"
                  >
                    <div className="flex gap-6 items-start">
                      {/* Image - Compact */}
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100">
                        <img
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
                              <span className="px-2 py-0.5 rounded-md bg-[#037166]/5 text-[#037166] text-[8px] font-black uppercase tracking-widest border border-[#037166]/10">
                                {item.itemType === 'service' ? 'Service' : 'Add-on'}
                              </span>
                            </div>
                            <h4 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-[#037166] transition-colors leading-tight truncate">
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

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-4">
                            <span className="text-slate-300 font-black text-[9px] uppercase tracking-widest">
                              Quantity: <span className="text-slate-900">{item.quantity}</span>
                            </span>
                            {item.itemType === 'addon' && item.parentServiceName && (
                              <div className="hidden sm:flex items-center gap-1 text-[9px] text-[#037166] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#037166]/5">
                                For: {item.parentServiceName.slice(0, 15)}...
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-black text-slate-900 group-hover:text-[#037166] transition-colors tracking-tighter">
                              ₹{item.subtotal.toFixed(2)}
                            </div>
                            <div className="text-[8px] text-slate-400 font-black tracking-widest uppercase">
                              Base Price
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-48 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm"
              >
                <h4 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h4>

                {/* Pricing Breakdown */}
                <div className="space-y-4 mb-6">
                  {/* Services Subtotal */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-slate-400 text-xs uppercase tracking-wider font-bold">
                      <span>Services Cost</span>
                      <span className="text-slate-900">₹{(cartData?.totalServiceCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-slate-50" />
                  </div>

                  {/* Taxes & Fees */}
                  <div className="space-y-3">
                    {(cartData?.totalServiceCost || 0) > 0 && (
                      <div className="flex justify-between items-center text-slate-600 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span>GST</span>
                          <span className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">18%</span>
                        </div>
                        <span className="text-slate-900 font-semibold">₹{((cartData?.totalServiceCost || 0) * 0.18).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-start text-slate-600 text-sm">
                      <div className="flex flex-col">
                        <span>Platform Fee</span>
                        <div className="flex items-center gap-1 text-[#04a99d] text-[10px] font-normal">
                          <Info className="w-3 h-3" />
                          <span>Payable Online</span>
                        </div>
                      </div>
                      <span className="text-slate-900 font-semibold">₹{125.00.toFixed(2)}</span>
                    </div>

                    {inspectionCost > 0 && (
                      <div className="flex flex-col gap-2 pt-1">
                        <div className="flex justify-between items-start text-slate-600 text-sm italic">
                          <span>Doorstep Inspection Fee</span>
                          <span className="text-slate-900 font-semibold">+ ₹{inspectionCost.toFixed(2)}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-orange-50/50 border border-orange-100">
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            <span className="text-orange-600 font-bold">Note:</span> Inspection fee is collected at your doorstep during the visit.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Total to Pay */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-xs uppercase font-bold">Payable Now</span>
                        <span className="text-slate-900 font-bold text-2xl">
                          ₹{((cartData?.totalServiceCost || 0) * 1.18 + 125).toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[#04a99d] text-[10px] font-bold uppercase py-1 px-2 bg-teal-50 rounded-lg border border-teal-100">
                        Secure Payment
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onProceedToAddress}
                      className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold text-lg hover:shadow-xl hover:shadow-[#037166]/30 transition-all flex items-center justify-center gap-2"
                    >
                      Proceed to Address
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </motion.button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    By proceeding, you agree to our service terms and conditions regarding scheduling and cancellations.
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
