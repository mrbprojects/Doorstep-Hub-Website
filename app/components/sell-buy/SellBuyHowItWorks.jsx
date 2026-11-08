'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  Sparkles } from 'lucide-react';

const steps = [
  {
    stepNumber: '01',
    flowLabel: 'List / Discover',
    title: 'List or Find an Item',
    lines: [
      { role: 'Selling?', text: 'Create your ad with clear photos, price and item details.' },
      { role: 'Buying?', text: 'Browse categories and search for what you need.' }
    ],
    tip: 'Add accurate information so buyers can understand the item easily.',
    icon: PlusCircle,
    badgeBg: 'bg-[#037166]',
    tipBg: 'bg-emerald-50/90 border-emerald-200/70 text-emerald-950',
    tipIconColor: 'text-[#037166]'
  },
  {
    stepNumber: '02',
    flowLabel: 'Connect',
    title: 'Connect Directly',
    description: 'Interested buyers can contact sellers through the available contact or chat options and ask questions about the item.',
    tip: 'Confirm the item condition, price, location and availability before moving ahead.',
    icon: MessageSquare,
    badgeBg: 'bg-[#0284c7]',
    tipBg: 'bg-sky-50/90 border-sky-200/70 text-sky-950',
    tipIconColor: 'text-[#0284c7]'
  },
  {
    stepNumber: '03',
    flowLabel: 'Verify',
    title: 'Check & Finalize',
    description: 'Discuss the price, inspect the item where appropriate and agree on how the item will be handed over.',
    tip: 'Never rush a purchase. Check the product properly before confirming the deal.',
    icon: ShieldCheck,
    badgeBg: 'bg-[#d97706]',
    tipBg: 'bg-amber-50/90 border-amber-200/70 text-amber-950',
    tipIconColor: 'text-[#d97706]'
  },
  {
    stepNumber: '04',
    flowLabel: 'Complete',
    title: 'Complete the Deal',
    description: 'Once both buyer and seller are satisfied, complete the transaction and hand over or collect the item as mutually agreed.',
    tip: 'Complete payment only after confirming the item and agreed deal details.',
    icon: CheckCircle2,
    badgeBg: 'bg-[#059669]',
    tipBg: 'bg-teal-50/90 border-teal-200/70 text-teal-950',
    tipIconColor: 'text-[#059669]'
  }
];

export function SellBuyHowItWorks() {
  return (
    <section className="relative py-12 md:py-20 bg-gradient-to-b from-white via-slate-50/50 to-white overflow-hidden border-t border-slate-100">
      {/* Ambient background decoration */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-[#037166]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#04a99d]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-7xl mx-auto mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#037166]/10 border border-[#037166]/20 text-[#037166] text-xs sm:text-sm font-black tracking-widest uppercase mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>HOW IT WORKS</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight"
          >
            Buy What You Need. Sell What You Don’t.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-base sm:text-lg md:text-xl text-slate-600 font-medium"
          >
            A simple way to connect buyers and sellers through Doorstep Hub.
          </motion.p>

          {/* Bottom Process Line / Flow Tracker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2.5 rounded-2xl border border-slate-200/90 shadow-sm"
          >
            {steps.map((s, idx) => (
              <React.Fragment key={s.stepNumber}>
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-[#037166] text-white flex items-center justify-center text-[10px] font-black">
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
                className="group relative flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-[#037166]/10 hover:border-[#037166]/40 transition-all duration-300"
              >
                <div>
                  {/* Step Header: Icon & Step Number */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#037166] to-[#025951] text-white shadow-lg shadow-[#037166]/25 group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-50 group-hover:bg-[#037166]/5 px-3 py-1 rounded-xl border border-slate-100 group-hover:border-[#037166]/20 transition-colors">
                      <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#037166]">STEP</span>
                      <span className="text-lg font-black text-slate-900 group-hover:text-[#037166]">
                        {item.stepNumber}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3 group-hover:text-[#037166] transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.lines ? (
                    <div className="space-y-2 mb-5 text-sm text-slate-600 leading-relaxed font-medium">
                      {item.lines.map((line) => (
                        <p key={line.role}>
                          <span className="font-bold text-slate-800">{line.role} </span>
                          <span>{line.text}</span>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed font-medium mb-5">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Tip Box */}
                <div className={`mt-auto rounded-2xl p-3.5 border text-xs sm:text-[13px] leading-relaxed ${item.tipBg}`}>
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
