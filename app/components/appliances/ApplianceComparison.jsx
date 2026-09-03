'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, Home, CheckCircle, IndianRupee, Wrench } from 'lucide-react';

const comparisonData = [
  {
    experience: 'Finding Help',
    traditional: 'Call around and search for a technician when something goes wrong.',
    doorstepHub: 'Book an appliance service online and request help from one place.'
  },
  {
    experience: 'Service Visit',
    traditional: 'You may need to carry the appliance or arrange the repair yourself.',
    doorstepHub: 'A service professional visits your location and checks the appliance at your doorstep.'
  },
  {
    experience: 'Understanding the Issue',
    traditional: 'Sometimes the problem and required repair may not be clearly explained.',
    doorstepHub: 'Know the appliance issue and required repair before proceeding.'
  },
  {
    experience: 'Repair Cost',
    traditional: 'Extra work or parts can sometimes make the final amount unclear.',
    doorstepHub: 'Understand the applicable service, repair and parts charges before approving the work.'
  },
  {
    experience: 'Your Time',
    traditional: 'Travel, waiting and repeated follow-ups can take up your time.',
    doorstepHub: 'Get the appliance checked at home while you continue with your day.'
  },
  {
    experience: 'Service Details',
    traditional: 'Bills, technician details or previous service information may be difficult to keep track of.',
    doorstepHub: 'Your booking and service details stay connected to your Doorstep Hub service request.'
  }
];

const bottomHighlights = [
  { icon: Home, text: 'At Your Doorstep', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { icon: CheckCircle, text: 'Simple Service Booking', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { icon: IndianRupee, text: 'Clear Repair Guidance', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { icon: Wrench, text: 'Appliance Service Support', color: 'text-teal-600 bg-teal-50 border-teal-100' }
];

export function ApplianceComparison() {
  return (
    <section className="relative py-14 md:py-24 bg-gradient-to-b from-white via-gray-50/40 to-white overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-[#2563EB] mb-2"
          >
            SIDE BY SIDE
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight"
          >
            Traditional Repair <span className="text-gray-400 font-medium">vs</span> <span className="text-[#037166]">Doorstep Hub</span>
          </motion.h2>
        </div>

        {/* Comparison Table / Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl sm:rounded-[2rem] border border-gray-200/90 shadow-2xl shadow-gray-200/60 overflow-hidden"
        >
          {/* Desktop & Tablet Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  <th className="py-5 px-6 lg:px-8 text-xs font-black uppercase tracking-widest text-gray-300 w-1/4">
                    EXPERIENCE
                  </th>
                  <th className="py-5 px-6 lg:px-8 text-xs font-black uppercase tracking-widest text-gray-300 w-[37.5%]">
                    TRADITIONAL REPAIR
                  </th>
                  <th className="py-5 px-6 lg:px-8 text-xs font-black uppercase tracking-widest text-[#38bdf8] w-[37.5%]">
                    DOORSTEP HUB
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparisonData.map((row, index) => (
                  <tr 
                    key={row.experience}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Experience Column */}
                    <td className="py-5 px-6 lg:px-8 font-bold text-gray-900 text-sm lg:text-base align-top">
                      {row.experience}
                    </td>

                    {/* Traditional Repair Column */}
                    <td className="py-5 px-6 lg:px-8 text-sm lg:text-[15px] text-gray-500 leading-relaxed align-top">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-xs mt-0.5">
                          ✕
                        </span>
                        <span>{row.traditional}</span>
                      </div>
                    </td>

                    {/* Doorstep Hub Column */}
                    <td className="py-5 px-6 lg:px-8 text-sm lg:text-[15px] text-gray-900 font-medium leading-relaxed align-top bg-emerald-50/20">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mt-0.5">
                          ✓
                        </span>
                        <span>{row.doorstepHub}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="block md:hidden divide-y divide-gray-100">
            <div className="bg-[#0f172a] text-white p-4 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-gray-300">
                EXPERIENCE COMPARISON
              </span>
            </div>

            {comparisonData.map((row) => (
              <div key={row.experience} className="p-5 space-y-3.5">
                <h3 className="font-black text-gray-900 text-base">
                  {row.experience}
                </h3>

                {/* Traditional */}
                <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100/70">
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                    <span>✕</span>
                    <span>Traditional Repair</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {row.traditional}
                  </p>
                </div>

                {/* Doorstep Hub */}
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-[#037166] uppercase tracking-wider">
                    <span>✓</span>
                    <span>Doorstep Hub</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-900 font-medium leading-relaxed">
                    {row.doorstepHub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Highlights Pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          {bottomHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.text}
                className="flex items-center gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white border border-gray-200/90 shadow-md shadow-gray-200/40 text-xs sm:text-sm font-bold text-gray-800 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center border ${item.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span>{item.text}</span>
              </div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
