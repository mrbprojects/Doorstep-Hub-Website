'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, PlusSquare, IndianRupee, CheckSquare, Search, Phone, Mail, User } from 'lucide-react';
import Image from 'next/image';

const STEPS = [
    {
        id: 'appointment',
        title: 'Appointment',
        subtitle: 'Please Enter Your Details',
        icon: ClipboardList,
    },
    {
        id: 'services',
        title: 'Services',
        subtitle: 'Choose / Select Services, Confirm your convenient Date & Time',
        icon: PlusSquare,
    },
    {
        id: 'payment',
        title: 'Payment',
        subtitle: 'Pay Cash on Service Delivery',
        icon: IndianRupee,
    },
    {
        id: 'review',
        title: 'Review',
        subtitle: 'Please Review your Booking Details',
        icon: CheckSquare,
    }
];

export function BookAppointmentPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    });

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans relative">
            {/* Left Section - Form */}
            <div className="flex-1 p-8 md:px-20 md:py-16 flex flex-col relative z-20">
                {/* Logo */}
                <div className="mb-14">
                    <img
                        src="/d-hub-logo.png"
                        alt="D-hub Doorstep Hub"
                        className="h-24 w-auto"
                    />
                </div>

                <div className="max-w-2xl w-full">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 px-1">
                            Book Your Appointment
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input
                                type="text"
                                placeholder="First Name"
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all text-gray-500 text-lg shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all text-gray-500 text-lg shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="tel"
                                placeholder="+91 8886688666"
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all text-gray-500 text-lg shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Your E-Mail ID"
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all text-gray-500 text-lg shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <p className="text-gray-500 text-sm font-medium mt-6 px-1">
                            Click Next & Your Required Services
                        </p>
                    </div>
                </div>

                {/* Note */}
                <div className="mt-8 mb-10">
                    <p className="text-[12px] text-gray-400 leading-relaxed max-w-2xl px-1">
                        Note : Service Available Cities are Hyderabad, Bangalore & Vizag ( Mumbai, Pune, Chennai & Vijayawada Started Shortly
                    </p>
                </div>

                {/* Next Button */}
                <div className="mt-4">
                    <button className="px-12 py-3.5 bg-[#ffcc00] hover:bg-[#ffdb4d] text-[#5a014a] font-bold rounded-xl transition-all shadow-lg active:scale-95 text-lg">
                        Next
                    </button>
                </div>
            </div>

            {/* Right Section - Purple Steps */}
            <div className="w-full md:w-[400px] lg:w-[480px] bg-[#5a014a] min-h-screen flex flex-col justify-center">
                <div className="space-y-16">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="relative flex items-center pl-24 pr-12">
                            {/* Protruding Tab Effect */}
                            <div className="absolute -left-12 flex items-center">
                                {index === 0 ? (
                                    // Active Step: Yellow circle protruding
                                    <div className="w-20 h-20 bg-[#ffcc00] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)] z-30">
                                        <step.icon className="w-9 h-9 text-[#5a014a]" strokeWidth={2.5} />
                                    </div>
                                ) : (
                                    // Inactive Steps: White tab-like protruding shape
                                    <div className="relative flex items-center justify-end w-20 h-16 pointer-events-none">
                                        {/* The protruding white semi-circle/tab */}
                                        <div className="absolute right-0 w-16 h-16 bg-white rounded-l-full shadow-lg z-10 translate-x-4 flex items-center justify-center">
                                            <step.icon className="w-5 h-5 text-[#888] ml-4" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={`transition-all duration-500 ${index === 0 ? 'opacity-100' : 'opacity-40'}`}>
                                <h3 className="text-2xl font-bold text-white mb-2 leading-none">
                                    {step.title}
                                </h3>
                                <p className="text-white/70 text-[13px] leading-snug font-medium max-w-[280px]">
                                    {step.subtitle}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
