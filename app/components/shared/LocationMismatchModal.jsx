'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function normalizeCityString(cityName) {
  if (!cityName) return '';
  const str = typeof cityName === 'object' ? (cityName?.name || '') : String(cityName);
  return str
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export function areCitiesMatching(cityA, cityB) {
  const normA = normalizeCityString(cityA);
  const normB = normalizeCityString(cityB);

  if (!normA || !normB) return true;
  if (normA === normB) return true;

  const hyderabadGroup = ['hyderabad', 'secunderabad', 'cyberabad'];
  if (hyderabadGroup.includes(normA) && hyderabadGroup.includes(normB)) {
    return true;
  }

  if (normA.includes(normB) || normB.includes(normA)) {
    return true;
  }

  return false;
}

export function LocationMismatchModal({
  mismatch,
  onClose,
  onSelectAnotherAddress,
  browseUrl,
  providerLabel = 'Service Provider',
}) {
  const router = useRouter();

  if (!mismatch) return null;

  const userCity = mismatch.userCity || 'Your Location';
  const providerCity = mismatch.providerCity || 'Provider Location';
  const providerName = mismatch.providerName || `Selected ${providerLabel}`;

  const handleBrowseLocal = () => {
    if (onClose) onClose();
    if (browseUrl) {
      router.push(browseUrl);
    }
  };

  const handleChooseAnotherAddress = () => {
    if (onSelectAnotherAddress) {
      onSelectAnotherAddress();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-amber-200 relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
            <MapPin className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-extrabold text-gray-900 mb-2">Location Mismatch</h3>

          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-4 space-y-2 text-xs">
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-500 font-semibold">Your Service Address:</span>
              <span className="font-bold text-gray-900 text-right">{userCity}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-500 font-semibold">Selected {providerLabel}:</span>
              <span className="font-bold text-amber-800 text-right">
                {providerName} ({providerCity})
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Your service address is in <strong className="text-gray-900">{userCity}</strong>, but the selected {providerLabel.toLowerCase()} is located in <strong className="text-gray-900">{providerCity}</strong>. This {providerLabel.toLowerCase()} is unable to provide service at your location.
            <br /><br />
            Kindly select a {providerLabel.toLowerCase()} at your location, or choose an address in <strong className="text-gray-900">{providerCity}</strong>.
          </p>

          <div className="space-y-2.5">
            {browseUrl && (
              <button
                type="button"
                onClick={handleBrowseLocal}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#037166] to-[#04a99d] hover:brightness-105 transition-all shadow-md flex items-center justify-center gap-2"
              >
                Select {providerLabel} in {userCity}
              </button>
            )}
            <button
              type="button"
              onClick={handleChooseAnotherAddress}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-center"
            >
              Choose Another Address
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
