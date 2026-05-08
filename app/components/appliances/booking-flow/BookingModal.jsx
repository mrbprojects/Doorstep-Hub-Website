'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BadgeCheck, PhoneCall, CheckCircle2 ,ChevronRight } from 'lucide-react';
import { actionTypes } from './data';

function Summary({ label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">{label}</p>
      <p className="mt-2 font-black text-gray-900 text-sm tracking-tight leading-snug">{value}</p>
    </div>
  );
}

export function BookingModal({ 
  isOpen, 
  onClose, 
  selectedCity, 
  selectedCategory, 
  selectedBrand, 
  selectedService 
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAction, setSelectedAction] = useState(actionTypes[0]);
  const [requirement, setRequirement] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Reset state when opened with a new service
  React.useEffect(() => {
    if (isOpen) {
      setConfirmed(false);
      setRequirement("");
      setSelectedAction(actionTypes[0]);
      setSubmitError("");
      setCurrentStep(1);
    }
  }, [isOpen, selectedService]);

  const handleConfirmBooking = async () => {
    const cityId = selectedCity?._id || selectedCity?.id;
    const categoryId = selectedCategory?._id || selectedService?.categoryId;
    const brandId = selectedService?.brandId;
    const authorisedServiceId = selectedService?._id;

    if (!cityId || !categoryId || !brandId || !authorisedServiceId) {
      setSubmitError("Booking details are incomplete for this service.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/autherised-booking/add_autherised_booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId,
          categoryId,
          brandId,
          authorisedServiceId,
          serviceType: selectedAction.toLowerCase(),
          description: requirement || `Need ${selectedAction.toLowerCase()} support`
        })
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to submit booking');
      }

      setConfirmed(true);
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/20 p-4 backdrop-blur-md" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.96 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 30, scale: 0.96 }} 
            className="flex flex-col max-h-[90vh] w-full max-w-2xl rounded-[2.5rem] bg-white border border-gray-100 shadow-2xl shadow-gray-200/50 relative overflow-hidden"
          >
            {/* Progress indicator (Sticky at Top) */}
            <div className="absolute top-0 left-0 right-0 h-1 z-50 flex gap-0.5">
               <div className={`h-full flex-1 transition-all duration-500 ${currentStep >= 1 ? 'bg-[#037166]' : 'bg-gray-100'}`} />
               <div className={`h-full flex-1 transition-all duration-500 ${currentStep >= 2 ? 'bg-[#037166]' : 'bg-gray-100'}`} />
            </div>

            {/* STICKY HEADER */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-50 flex items-start justify-between gap-6 bg-white shrink-0">
              <div>
                <p className="font-black uppercase tracking-[0.3em] text-[#037166] text-[10px] mb-2">
                   Step {currentStep} of 2: {currentStep === 1 ? 'Requirements' : 'Review & Confirm'}
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">{selectedService?.serviceName || 'Service Booking'}</h2>
              </div>
              <button 
                onClick={onClose} 
                className="rounded-2xl bg-gray-50 p-3 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all border border-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* SCROLLABLE CONTENT AREA */}
            <div className="flex-1 overflow-y-auto px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* STEP 1: REQUIREMENTS */}
              {currentStep === 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="py-6"
                >
                  <div className="mb-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-3 ml-1">Type of Requirement</label>
                      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                      {actionTypes.map((type) => (
                          <button 
                          key={type} 
                          onClick={() => setSelectedAction(type)} 
                          className={`rounded-2xl border-2 p-4 text-left font-black text-xs uppercase tracking-widest transition-all duration-300 ${
                              selectedAction === type 
                              ? "border-[#037166] bg-white text-[#037166] shadow-xl shadow-[#037166]/10" 
                              : "border-gray-50 bg-gray-50 text-gray-400 hover:border-[#037166]/30 hover:bg-white hover:text-gray-900"
                          }`}
                          >
                          {type}
                          </button>
                      ))}
                      </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-3 ml-1">Describe the problem</label>
                    <textarea 
                      value={requirement} 
                      onChange={(event) => setRequirement(event.target.value)} 
                      placeholder="e.g. My appliance is not turning on. Need doorstep diagnosis today evening." 
                      className="min-h-[8rem] w-full resize-none rounded-[2rem] border-2 border-gray-50 bg-gray-50 p-6 text-gray-900 font-bold outline-none transition-all focus:border-[#037166]/30 focus:bg-white placeholder-gray-300 shadow-inner text-sm" 
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: SUMMARY */}
              {currentStep === 2 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="py-6"
                >
                  <div className="rounded-[2rem] bg-gray-50 border border-gray-100 p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#037166] flex items-center justify-center text-white shadow-lg shadow-[#037166]/20">
                          <BadgeCheck size={18} />
                      </div>
                      <h3 className="text-lg font-black text-gray-900 tracking-tight">Booking Summary</h3>
                    </div>
                    <div className="grid gap-3 text-xs sm:text-sm grid-cols-1 sm:grid-cols-2">
                      <Summary label="Selected City" value={selectedCity?.name || 'Loading...'} />
                      <Summary label="Service Category" value={selectedCategory?.name || 'Standard Service'} />
                      <Summary label="Brand" value={selectedBrand || 'Standard Brand'} />
                      <Summary label="Request Type" value={selectedAction} />
                    </div>
                    <div className="mt-4 rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mb-2">Your Description</p>
                      <p className="text-xs font-bold leading-relaxed text-gray-600">
                        {requirement || "No specific requirement added."}
                      </p>
                    </div>
                  </div>

                  {confirmed && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-8 rounded-3xl border-2 border-[#037166]/20 bg-[#037166]/5 p-8 font-black text-[#037166] text-center uppercase tracking-widest text-sm flex flex-col items-center justify-center gap-4 shadow-xl shadow-[#037166]/5"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#037166] flex items-center justify-center text-white shadow-lg">
                         <BadgeCheck size={28} />
                      </div>
                      <div>
                        <p className="text-lg">Booking Confirmed!</p>
                        <p className="mt-1 text-xs opacity-70">Our coordinator will contact you shortly.</p>
                      </div>
                    </motion.div>
                  )}

                  {submitError && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-black text-red-600">
                      {submitError}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* STICKY FOOTER */}
            <div className="px-8 py-6 border-t border-gray-50 flex flex-col gap-4 sm:flex-row sm:justify-end bg-white shrink-0">
              {currentStep === 1 ? (
                <button 
                  onClick={onClose} 
                  className="rounded-full border-2 border-gray-100 bg-white px-10 py-4 font-black uppercase tracking-widest text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
                >
                  Cancel
                </button>
              ) : !confirmed && (
                <button 
                  onClick={() => setCurrentStep(1)} 
                  className="rounded-full border-2 border-gray-100 bg-white px-10 py-4 font-black uppercase tracking-widest text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
                >
                  Back to Details
                </button>
              )}

              {currentStep === 1 ? (
                <button 
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[#037166] px-12 py-4 font-black uppercase tracking-widest text-xs text-white shadow-2xl shadow-[#037166]/30 hover:bg-[#04a99d] hover:-translate-y-1 transition-all"
                >
                  Next Step <ChevronRight size={18} />
                </button>
              ) : !confirmed ? (
                <button 
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] px-12 py-4 font-black uppercase tracking-widest text-xs text-white shadow-2xl shadow-[#037166]/30 hover:shadow-[#037166]/50 hover:-translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Confirm Booking"} <PhoneCall size={18} />
                </button>
              ) : (
                <button 
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[#037166] px-12 py-4 font-black uppercase tracking-widest text-xs text-white shadow-2xl shadow-[#037166]/30 hover:bg-[#04a99d] transition-all"
                >
                  Close Window
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
