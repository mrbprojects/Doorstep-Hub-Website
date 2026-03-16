'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trash2, ShoppingCart, Loader2, Tag } from 'lucide-react';
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
                    className="group relative rounded-2xl p-6 bg-white border border-slate-200 hover:border-[#037166]/30 hover:shadow-md transition-all duration-300"
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
                            <h4 className="text-xl font-bold text-slate-900 mb-1">
                              {item.itemName}
                            </h4>
                            {item.itemType === 'addon' && item.parentServiceName && (
                              <p className="text-slate-400 text-sm flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                Addon for: {item.parentServiceName}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemove(item.itemId)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {item.description && (
                          <p className="text-slate-500 text-sm mb-3 line-clamp-2">{item.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h6 className="px-3 py-1 rounded-full bg-[#037166]/10 border border-[#037166]/20 text-[#037166] text-xs font-semibold">
                              {item.itemType === 'service' || item.itemType === 'professional_service' ? 'Service' : 'Add-on'}
                            </h6>
                            <span className="text-slate-400 text-sm">
                              Qty: {item.quantity}
                            </span>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900">
                              ₹{item.subtotal.toFixed(2)}
                            </div>
                            <div className="text-sm text-slate-400">
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
                className="sticky top-48 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm"
              >
                <h4 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h4>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Service Cost</span>
                    <span className="font-semibold text-slate-900">₹{(cartData?.totalServiceCost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Fee</span>
                    <span className="font-semibold text-slate-900">₹{(cartData?.platformFee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Consultation Fee</span>
                    <span className="font-semibold text-slate-900">₹{(cartData?.consultationFee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST</span>
                    <span className="font-semibold text-slate-900">₹{(cartData?.gstAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex justify-between text-xl font-bold text-slate-900">
                    <span>Total</span>
                    <span className="text-[#037166]">₹{(cartData?.finalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onProceedToAddress}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium text-lg hover:shadow-lg hover:shadow-[#037166]/40 transition-all"
                >
                  Proceed to Address
                </motion.button>

                <div className="mt-6 p-4 rounded-lg bg-teal-50 border border-teal-100">
                  <p className="text-teal-700 text-sm text-center">
                    This is the online booking fee
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
