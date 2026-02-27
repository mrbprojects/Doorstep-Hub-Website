import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, RefreshCw, CreditCard, XCircle, ArrowLeft } from 'lucide-react';

export function PaymentFailureModal({ isOpen, onRetry, onChangeMethod, onClose }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center overflow-hidden"
                >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 via-red-500 to-red-500/50" />
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                            className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20"
                        >
                            <XCircle className="w-10 h-10 text-red-500" />
                        </motion.div>

                        <h3 className="text-2xl font-bold text-white mb-2">
                            Payment Failed
                        </h3>

                        <p className="text-white/60 mb-8 leading-relaxed">
                            We couldn't process your payment. This might be due to insufficient funds or a network issue. You haven't been charged.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={onRetry}
                                className="w-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#037166]/20 transition-all active:scale-[0.98]"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Try Again
                            </button>

                            <button
                                onClick={onChangeMethod}
                                className="w-full bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-xl py-4 font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                <CreditCard className="w-5 h-5" />
                                Change Payment Method
                            </button>

                            <button
                                onClick={onClose}
                                className="text-sm text-white/40 hover:text-white/60 mt-4 flex items-center justify-center gap-1 mx-auto transition-colors"
                            >
                                <ArrowLeft className="w-3 h-3" />
                                Return to Checkout
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
