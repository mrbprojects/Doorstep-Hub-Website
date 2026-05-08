import React from 'react';
import { Building2, Shield, Clock, ArrowUpRight } from 'lucide-react';

export function FranchiseSection() {
  const items = [
    { 
      icon: <Building2 className="text-white" size={24} />, 
      title: "Franchise Model", 
      text: "City-level partner onboarding with brand standards, service workflow, and booking dashboard." 
    },
    { 
      icon: <Shield className="text-white" size={24} />, 
      title: "Authorised Centers", 
      text: "Verified D-Hub centers with trained technicians, SLA-based jobs, and expert customer support." 
    },
    { 
      icon: <Clock className="text-white" size={24} />, 
      title: "Fast Booking Flow", 
      text: "Simple selection path from city to category to brand to final booking confirmation." 
    },
  ];

  return (
    <section id="franchise" className="relative max-w-[1400px] mx-auto px-6 lg:px-8 pb-24">
      {/* Subtle Divider */}
      <div className="flex items-center gap-4 mb-16">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">The D-Hub Advantage</p>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="group relative rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-[#037166]/20">
            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#037166]/5 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#037166] to-[#04a99d] shadow-xl shadow-[#037166]/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                {item.icon}
              </div>
              <div className="p-3 rounded-full bg-gray-50 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                <ArrowUpRight className="text-[#037166]" size={18} />
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight group-hover:text-[#037166] transition-colors">{item.title}</h3>
            <p className="text-gray-600 leading-relaxed font-medium text-base group-hover:text-gray-700 transition-colors">{item.text}</p>
            
            <div className="mt-8 pt-6 border-t border-gray-50 overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-black text-[#037166] tracking-tighter">
                <span className="w-1.5 h-1.5 rounded-full bg-[#04a99d]" />
                LEARN MORE
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
