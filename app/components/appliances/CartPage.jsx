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
      className="min-h-screen pt-20 pb-32"
    >
      {/* Header */}
      <section className="sticky top-20 z-40 bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] border-b border-white/10 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </motion.button>

            {cartItems.length > 0 && (
              <button
                onClick={handleClear}
                className="text-white/60 hover:text-red-400 text-sm flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            )}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl md:text-4xl font-bold text-white flex items-center gap-3"
          >
            <ShoppingCart className="w-8 h-8" />
            Your Service Cart
            {cartItems.length > 0 && (
              <span className="text-lg text-white/80">({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
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
            className="text-center py-20"
          >
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-white/40" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
            <p className="text-white/60 mb-8">Add some services to get started!</p>
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
                    className="group relative rounded-2xl p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 hover:border-[#037166]/30 transition-all duration-300"
                  >
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                        <img
                          src={item.itemImage ? `https://api.doorstephub.com/${item.itemImage}` : `https://api.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg`}
                          alt={item.itemName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Service Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-xl font-bold text-white mb-1">
                              {item.itemName}
                            </h4>
                            {item.itemType === 'addon' && item.parentServiceName && (
                              <p className="text-white/50 text-sm flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                Addon for: {item.parentServiceName}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemove(item.itemId)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {item.description && (
                          <p className="text-white/60 text-sm mb-3 line-clamp-2">{item.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h6 className="px-3 py-1 rounded-full bg-[#037166]/20 border border-[#037166]/30 text-[#04a99d] text-xs font-semibold">
                              {item.itemType === 'service' ? 'Service' : 'Add-on'}
                            </h6>
                            <span className="text-white/60 text-sm">
                              Qty: {item.quantity}
                            </span>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              ₹{item.subtotal.toFixed(2)}
                            </div>
                            <div className="text-sm text-white/60">
                              ₹{item.price} {item.priceUnit}
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
                className="sticky top-48 p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10"
              >
                <h4 className="text-xl font-bold text-white mb-6">Order Summary</h4>

                {/* Pricing Breakdown */}
                <div className="space-y-4 mb-6">
                  {/* Services Subtotal */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-white/50 text-xs uppercase tracking-wider font-bold">
                      <span>Services Cost</span>
                      <span>₹{(cartData?.totalServiceCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-white/5" />
                  </div>

                  {/* Taxes & Fees */}
                  <div className="space-y-3">
                    {(cartData?.totalServiceCost || 0) > 0 && (
                      <div className="flex justify-between items-center text-white/70 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span>GST</span>
                          <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10">18%</span>
                        </div>
                        <span>₹{((cartData?.totalServiceCost || 0) * 0.18).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-start text-white/70 text-sm">
                      <div className="flex flex-col">
                        <span>Online Consultation Fee</span>
                        <div className="flex items-center gap-1 text-[#04a99d] text-[10px] font-normal">
                          <Info className="w-3 h-3" />
                          <span>Payable Online</span>
                        </div>
                      </div>
                      <span>₹{(cartData?.finalAmount || 0).toFixed(2)}</span>
                    </div>

                    {inspectionCost > 0 && (
                      <div className="flex flex-col gap-2 pt-1">
                        <div className="flex justify-between items-start text-white/70 text-sm italic">
                          <span>Doorstep Inspection Fee</span>
                          <span>+ ₹{inspectionCost.toFixed(2)}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                          <p className="text-[10px] text-white/40 leading-relaxed">
                            <span className="text-[#04a99d]">Note:</span> Inspection fee is collected at your doorstep during the visit.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Total to Pay */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-white/60 text-xs uppercase font-bold">Payable Now</span>
                        <span className="text-white font-bold text-2xl">
                          ₹{((cartData?.totalServiceCost || 0) * 1.18 + (cartData?.finalAmount || 0)).toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[#04a99d] text-[10px] font-bold uppercase py-1 px-2 bg-[#04a99d]/10 rounded-lg border border-[#04a99d]/20">
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

                <div className="p-3 rounded-xl bg-[#037166]/5 border border-[#037166]/10">
                  <p className="text-[11px] text-white/60 text-center leading-relaxed">
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
