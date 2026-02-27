'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Check, Loader2, Sparkles, Flower2 } from 'lucide-react';

export function AddonsModal({ isOpen, onClose, providerId, selectedPackageId, onContinue }) {
    const [addons, setAddons] = useState([]);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && providerId && selectedPackageId) {
            fetchAddons();
        } else {
            // Reset state when closed
            setAddons([]);
            setSelectedAddons([]);
            setLoading(true);
        }
    }, [isOpen, providerId, selectedPackageId]);

    const fetchAddons = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/professional-service-addons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceIds: [selectedPackageId],
                    professionalProviderId: providerId
                })
            });
            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                const allAddons = data.data.flatMap(item => item.addons || []);
                setAddons(allAddons);
            } else {
                setAddons([]);
            }
        } catch (err) {
            console.error("Error fetching add-ons:", err);
            setError("Failed to load add-ons.");
        } finally {
            setLoading(false);
        }
    };

    const toggleAddon = (addonId) => {
        setSelectedAddons(prev =>
            prev.includes(addonId)
                ? prev.filter(id => id !== addonId)
                : [...prev, addonId]
        );
    };

    const handleContinue = () => {
        const selectedAddonObjects = addons.filter(addon => selectedAddons.includes(addon._id));
        onContinue(selectedAddonObjects);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-[var(--saffron)]/20"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[var(--saffron)]/10 flex items-center justify-between bg-gradient-to-r from-[var(--off-white)] to-white">
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--deep-charcoal)] flex items-center gap-2">
                                    <Flower2 className="w-6 h-6 text-[var(--saffron)]" />
                                    Enhance Your Service
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Add extra sacred offerings or materials</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-[var(--saffron)]/10 transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500 hover:text-[var(--saffron)]" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <Loader2 className="w-10 h-10 text-[var(--saffron)] animate-spin" />
                                    <p className="text-gray-500 animate-pulse">Finding available add-ons...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12 text-red-500 bg-red-50 rounded-2xl">
                                    {error}
                                </div>
                            ) : addons.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 bg-[var(--off-white)] rounded-2xl flex flex-col items-center border border-dashed border-gray-300">
                                    <Flower2 className="w-12 h-12 text-gray-300 mb-4" />
                                    <p className="font-medium">No add-ons available for this service.</p>
                                    <p className="text-sm">You can proceed with the standard booking.</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {addons.map((addon) => {
                                        const isSelected = selectedAddons.includes(addon._id);
                                        return (
                                            <div
                                                key={addon._id}
                                                onClick={() => toggleAddon(addon._id)}
                                                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${isSelected
                                                    ? 'border-[var(--saffron)] bg-[var(--saffron)]/5 shadow-sm'
                                                    : 'border-gray-100 hover:border-[var(--saffron)]/30 hover:shadow-md'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Image or Icon */}
                                                    <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${isSelected ? 'ring-2 ring-[var(--saffron)] ring-offset-2' : 'bg-gray-100'}`}>
                                                        {addon.image ? (
                                                            <img
                                                                src={`https://api.doorstephub.com/${addon.image}`}
                                                                alt={addon.childServiceName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-[var(--off-white)] text-[var(--saffron)]/40">
                                                                <Flower2 className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <h3 className={`font-semibold text-sm truncate pr-2 ${isSelected ? 'text-[var(--saffron)]' : 'text-[var(--deep-charcoal)]'}`}>
                                                                {addon.childServiceName}
                                                            </h3>
                                                            {isSelected && (
                                                                <div className="w-5 h-5 bg-[var(--saffron)] rounded-full flex items-center justify-center shrink-0">
                                                                    <Check className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                            {addon.description}
                                                        </p>

                                                        <div className="mt-2 flex items-center gap-1">
                                                            <span className="font-bold text-[var(--deep-charcoal)]">₹{addon.price}</span>
                                                            <span className="text-[10px] text-gray-500 uppercase">{addon.priceUnit}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[var(--saffron)]/10 bg-[var(--off-white)] flex items-center justify-between">
                            <div className="text-sm">
                                <span className="text-gray-500">Selected: </span>
                                <span className="font-bold text-[var(--deep-charcoal)]">{selectedAddons.length}</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleContinue}
                                    disabled={loading && addons.length > 0}
                                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[var(--saffron)] to-[var(--temple-red)] text-white font-bold shadow-lg hover:shadow-[var(--saffron)]/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {addons.length === 0 && !loading ? 'Skip & Continue' : 'Continue'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
