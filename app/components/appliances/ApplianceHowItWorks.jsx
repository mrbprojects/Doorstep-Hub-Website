'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarCheck, 
  UserCheck, 
  FileSpreadsheet, 
  ShieldCheck, 
  Lightbulb, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const steps = [
  {
    stepNumber: '01',
    flowLabel: 'Book',
    title: 'Book Your Service',
    description: 'Choose your appliance, select the problem and share your location.',
    tip: 'Add the brand, model or a photo if available.',
    icon: CalendarCheck,
    accentColor: 'from-[#037166] to-[#04a99d]',
    lightBg: 'bg-[#037166]/5',
    borderColor: 'border-[#037166]/20',
    tipBg: 'bg-emerald-50/80 border-emerald-200/60 text-emerald-900',
    tipIconColor: 'text-[#037166]'
  },
  {
    stepNumber: '02',
    flowLabel: 'Inspect',
    title: 'Technician Visits You',
    description: 'A service professional visits your home, checks the appliance and finds the issue.',
    tip: 'Keep the appliance easily accessible.',
    icon: UserCheck,
    accentColor: 'from-[#0284c7] to-[#38bdf8]',
    lightBg: 'bg-[#0284c7]/5',
    borderColor: 'border-[#0284c7]/20',
    tipBg: 'bg-sky-50/80 border-sky-200/60 text-sky-900',
    tipIconColor: 'text-[#0284c7]'
  },
  {
    stepNumber: '03',
    flowLabel: 'Approve',
    title: 'Know the Problem & Cost',
    description: 'The technician explains the issue, required repair and applicable charges before proceeding.',
    tip: 'Ask about parts, repair work and cost before approval.',
    icon: FileSpreadsheet,
    accentColor: 'from-[#d97706] to-[#fbbf24]',
    lightBg: 'bg-[#d97706]/5',
    borderColor: 'border-[#d97706]/20',
    tipBg: 'bg-amber-50/80 border-amber-200/60 text-amber-900',
    tipIconColor: 'text-[#d97706]'
  },
  {
    stepNumber: '04',
    flowLabel: 'Repair',
    title: 'Repair & Confirm',
    description: 'Once the repair is completed, test your appliance and confirm the service.',
    tip: 'Check that the original problem is solved before closing the booking.',
    icon: ShieldCheck,
    accentColor: 'from-[#059669] to-[#34d399]',
    lightBg: 'bg-[#059669]/5',
    borderColor: 'border-[#059669]/20',
    tipBg: 'bg-teal-50/80 border-teal-200/60 text-teal-900',
    tipIconColor: 'text-[#059669]'
  }
];

export function ApplianceHowItWorks() {
  return (
    <section className="relative py-8 sm:py-10 lg:py-12 overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-[#037166]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-[#04a99d]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-7xl mx-auto mb-5 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#037166]/10 border border-[#037166]/20 text-[#037166] text-xs md:text-sm font-bold tracking-widest uppercase mb-2.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>HOW IT WORKS</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight"
          >
            Four Simple Steps. Less Hassle.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-2 text-sm sm:text-base text-gray-600 font-medium"
          >
            From Booking to Doorstep Repair.
          </motion.p>

          {/* Flow Indicator Pill Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 sm:mt-5 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-2 rounded-2xl border border-gray-200/80 shadow-sm"
          >
            {steps.map((s, idx) => (
              <React.Fragment key={s.stepNumber}>
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-800">
                  <span className="w-5 h-5 rounded-full bg-[#037166] text-white flex items-center justify-center text-[10px] font-extrabold">
                    {idx + 1}
                  </span>
                  {s.flowLabel}
                </span>
                {idx < steps.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#037166]" />
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 relative">
          
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-[72px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-[#037166]/20 via-[#0284c7]/20 to-[#059669]/20 -z-0" />

          {steps.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.stepNumber}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="group relative flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-[#037166]/10 hover:border-[#037166]/30 transition-all duration-300"
              >
                {/* Step Top Header: Number & Icon */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#037166] to-[#025951] text-white shadow-lg shadow-[#037166]/25 group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex items-center gap-1.5 bg-gray-50 group-hover:bg-[#037166]/5 px-3 py-1 rounded-xl border border-gray-100 group-hover:border-[#037166]/20 transition-colors">
                      <span className="text-xs font-bold text-gray-400 group-hover:text-[#037166]">STEP</span>
                      <span className="text-lg font-black text-gray-900 group-hover:text-[#037166]">
                        {item.stepNumber}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-2.5 group-hover:text-[#037166] transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal mb-5">
                    {item.description}
                  </p>
                </div>

                {/* Tip Box */}
                <div className={`mt-auto pt-3 rounded-2xl p-3.5 border text-xs sm:text-[13px] leading-relaxed ${item.tipBg}`}>
                  <div className="flex items-start gap-2">
                    <Lightbulb className={`w-4 h-4 flex-shrink-0 mt-0.5 ${item.tipIconColor}`} />
                    <div>
                      <span className="font-bold">Tip: </span>
                      <span>{item.tip}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
