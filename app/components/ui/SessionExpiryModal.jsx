'use client';

import { motion, AnimatePresence } from 'motion/react';
import { LogIn, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SessionExpiryModal({ isOpen, onLogin }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
            >
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-8 h-8 text-orange-500" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Session Expired
                </h3>

                <p className="text-gray-500 mb-8">
                    For your security, your session has timed out. Please log in again to continue where you left off.
                </p>

                <Button
                    onClick={onLogin}
                    className="w-full bg-[#037166] hover:bg-[#025951] text-white rounded-xl py-6 text-lg font-semibold flex items-center justify-center gap-2"
                >
                    <LogIn className="w-5 h-5" />
                    Log In Again
                </Button>
            </motion.div>
        </div>
    );
}
