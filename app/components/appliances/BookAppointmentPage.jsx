'use client';

import React, { useState, useEffect } from 'react';
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
    const [currentStep, setCurrentStep] = useState(0);
    const [agreed, setAgreed] = useState(false);
    const [location, setLocation] = useState({ latitude: '', longitude: '' });
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', phone: '', email: '',
        categoryId: '', categoryName: '', subcategoryId: '', subcategoryName: '', serviceId: '', serviceName: '',
        bookingDate: '', bookingTime: '', message: '',
        payAtServiceDelivery: true
    });

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [services, setServices] = useState([]);

    // Get location from localStorage on component mount
    useEffect(() => {
        const getLocationFromStorage = () => {
            try {
                // Try to get from various possible storage keys
                const possibleKeys = ['userLocation', 'location', 'userCoordinates', 'latitude', 'longitude'];
                let lat = '';
                let lng = '';

                for (const key of possibleKeys) {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            if (parsed.latitude || parsed.lat) {
                                lat = parsed.latitude || parsed.lat;
                                lng = parsed.longitude || parsed.lng || parsed.lon;
                                break;
                            }
                        } catch {
                            // If not JSON, check if it's a direct coordinate
                            if (key === 'latitude') lat = stored;
                            if (key === 'longitude') lng = stored;
                        }
                    }
                }

                setLocation({ latitude: lat, longitude: lng });
                console.log('Location retrieved from localStorage:', { lat, lng });
            } catch (error) {
                console.error('Error reading location from localStorage:', error);
            }
        };

        getLocationFromStorage();
    }, []);

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/getallcategorys', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}) // Emtpy payload as requested
                });
                const data = await res.json();
                if (data.success) {
                    setCategories(data.data || []);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = async (e) => {
        const selectedId = e.target.value;
        const selectedCat = categories.find(c => c._id === selectedId);

        setFormData(prev => ({
            ...prev,
            categoryId: selectedId,
            categoryName: selectedCat ? selectedCat.name : '',
            subcategoryId: '', subcategoryName: '',
            serviceId: '', serviceName: ''
        }));
        setSubcategories([]);
        setServices([]);

        if (!selectedId) return;

        try {
            const res = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/getsubcategorysbycategoryid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryId: selectedId })
            });
            const data = await res.json();
            if (data.success) {
                setSubcategories(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching subcategories:', err);
        }
    };

    const handleSubcategoryChange = async (e) => {
        const selectedId = e.target.value;
        const selectedSub = subcategories.find(s => s._id === selectedId);

        setFormData(prev => ({
            ...prev,
            subcategoryId: selectedId,
            subcategoryName: selectedSub ? selectedSub.name : '',
            serviceId: '', serviceName: ''
        }));
        setServices([]);

        if (!selectedId) return;

        try {
            const res = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/services_by_subcategory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subcategoryId: selectedId })
            });
            const data = await res.json();
            if (data.success) {
                setServices(data.data || data.services || []);
            }
        } catch (err) {
            console.error('Error fetching services:', err);
        }
    };

    const handleServiceChange = (e) => {
        const selectedId = e.target.value;
        const selectedService = services.find(s => s._id === selectedId);
        setFormData(prev => ({
            ...prev,
            serviceId: selectedId,
            serviceName: selectedService ? selectedService.name : ''
        }));
    };

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        if (!agreed) {
            alert('Please agree to terms and conditions');
            return;
        }

        // Prepare the payload with location data
        const payload = {
            ...formData,
            subcategoryId: formData.subcategoryId, // Ensuring subcategoryId is included
            subcategoryName: formData.subcategoryName,
            countryId: "IN",
            countryName: "India",
            stateId: "TG",
            stateName: "Telangana",
            cityId: "HYD",
            cityName: "Hyderabad",
            // Add location data to payload
            latitude: location.latitude || '',
            longitude: location.longitude || '',
            // You can also add a combined location object if needed
            location: {
                lat: location.latitude,
                lng: location.longitude
            }
        };

        console.log('Submitting payload with location:', payload);

        try {
            const res = await fetch('https://api.doorstephub.com/v1/dhubApi/web/crm-booking/submit-crm-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert('Booking Successful!');
                window.location.reload();
            } else {
                alert('Booking Failed: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred during booking.');
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="text" placeholder="First Name" className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-200 text-gray-500 text-lg shadow-[0_2px_10px_rgba(0,0,0,0.02)]" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                            <input type="text" placeholder="Last Name" className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-200 text-gray-500 text-lg shadow-[0_2px_10px_rgba(0,0,0,0.02)]" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                        </div>
                        <input type="tel" placeholder="+91 8886688666" className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-200 text-gray-500 text-lg shadow-[0_2px_10px_rgba(0,0,0,0.02)]" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        <input type="email" placeholder="Your E-Mail ID" className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-200 text-gray-500 text-lg shadow-[0_2px_10px_rgba(0,0,0,0.02)]" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        <p className="text-gray-500 text-sm font-medium mt-6 px-1">Click Next & Your Required Services</p>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <select
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl text-gray-500 text-lg appearance-none focus:outline-none focus:ring-1 focus:ring-gray-200"
                                value={formData.categoryId || ''}
                                onChange={handleCategoryChange}
                            >
                                <option value="">Select Category</option>
                                {categories?.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>

                            <select
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl text-gray-500 text-lg appearance-none focus:outline-none focus:ring-1 focus:ring-gray-200"
                                value={formData.subcategoryId || ''}
                                onChange={handleSubcategoryChange}
                                disabled={!subcategories.length}
                            >
                                <option value="">Select Subcategory</option>
                                {subcategories?.map(s => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                            </select>

                            <select
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl text-gray-500 text-lg appearance-none focus:outline-none focus:ring-1 focus:ring-gray-200 text-ellipsis overflow-hidden whitespace-nowrap"
                                value={formData.serviceId || ''}
                                onChange={handleServiceChange}
                                disabled={!services.length}
                            >
                                <option value="">Select Service</option>
                                {services?.map(srv => (
                                    <option key={srv._id || srv.serviceId} value={srv._id || srv.serviceId}>{srv.name || srv.serviceName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="date" className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl text-gray-500 text-lg" value={formData.bookingDate} onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })} />
                            <input type="time" className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl text-gray-500 text-lg" value={formData.bookingTime} onChange={(e) => setFormData({ ...formData, bookingTime: e.target.value })} />
                        </div>
                        <textarea placeholder="Message (e.g. loud noise)" className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl text-gray-500 text-lg h-32" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="radio" checked={formData.payAtServiceDelivery} onChange={() => setFormData({ ...formData, payAtServiceDelivery: true })} className="w-4 h-4 text-[#ffcc00] focus:ring-[#ffcc00] border-gray-300" />
                            <span className="text-gray-700 text-lg font-medium">Pay At Service Delievery.</span>
                        </label>
                        <div className="space-y-4 pt-4 text-gray-500 text-sm font-medium">
                            <p>1. Visiting, Home Inspection & Cost Estimation Charges INR 299.00</p>
                            <p>2. Free Inspection Charges with Repair & Services</p>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-bold text-gray-800 mb-2">Personal Details</h3>
                            <p className="text-gray-500 text-sm">Name : {formData.firstName} {formData.lastName}</p>
                            <p className="text-gray-500 text-sm">Contact : {formData.phone}</p>
                            <p className="text-gray-500 text-sm">Email : {formData.email}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 mb-2">Appointment Details</h3>
                            <p className="text-gray-500 text-sm">Category : {formData.categoryName || "Appliance Repair Service"}</p>
                            <p className="text-gray-500 text-sm">Subcategory : {formData.subcategoryName || "Not Selected"}</p>
                            <p className="text-gray-500 text-sm">Service : {formData.serviceName || "Geyser Repair Services"}</p>
                            <p className="text-gray-500 text-sm">City : Hyderabad</p>
                            <p className="text-gray-500 text-sm">Additional Message : {formData.message}</p>
                            {location.latitude && location.longitude && (
                                <p className="text-gray-500 text-sm">Location : {location.latitude}, {location.longitude}</p>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 mb-2">Payment Details</h3>
                            <p className="text-gray-500 text-sm">Mode of Payment : During Visit</p>
                        </div>
                        <p className="text-gray-500 text-sm mt-4">We will contact you about the time slot on a particular day as per your availability.</p>
                        <label className="flex items-center space-x-2 mt-4 cursor-pointer">
                            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="rounded border-gray-300 text-[#ffcc00] focus:ring-[#ffcc00]" />
                            <span className="text-gray-600 text-sm font-medium">I agree to the terms and conditions.</span>
                        </label>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans relative">
            <div className="flex-1 p-8 md:px-20 md:py-16 mt-1 flex flex-col relative z-20">

                <div className="max-w-2xl w-full">
                    {currentStep === 0 && (
                        <div className="mb-10 mt-10">
                            <h2 className="text-3xl font-bold text-gray-800 px-1 leading-tight">Book Your<br />Appointment</h2>
                        </div>
                    )}
                    {currentStep === 1 && (
                        <div className="mb-10 mt-10">
                            <h2 className="text-3xl font-bold text-gray-800 px-1 leading-tight">Select<br />Services</h2>
                        </div>
                    )}
                    {currentStep === 2 && (
                        <div className="mb-10 mt-10">
                            <h2 className="text-3xl font-bold text-gray-800 px-1 leading-tight">Mode of<br />Payment</h2>
                        </div>
                    )}
                    {currentStep === 3 && (
                        <div className="mb-10 mt-10">
                            <h2 className="text-3xl font-bold text-gray-800 px-1 leading-tight">Review<br />details</h2>
                        </div>
                    )}

                    {renderStepContent()}

                    {currentStep === 0 && (
                        <div className="mt-8 mb-10">
                            <p className="text-[12px] text-gray-400 leading-relaxed max-w-2xl px-1">Note : Service Available Cities are Hyderabad, Bangalore & Vizag ( Mumbai, Pune, Chennai & Vijayawada Started Shortly )</p>
                        </div>
                    )}

                    <div className="mt-8 flex gap-4">
                        {currentStep > 0 && (
                            <button onClick={handleBack} className="px-12 py-3.5 bg-[#ffcc00] hover:bg-[#ffdb4d] text-[#5a014a] font-bold rounded-xl transition-all shadow-lg active:scale-95 text-lg">
                                Back
                            </button>
                        )}
                        {currentStep < 3 ? (
                            <button onClick={handleNext} className="px-12 py-3.5 bg-[#ffcc00] hover:bg-[#ffdb4d] text-[#5a014a] font-bold rounded-xl transition-all shadow-lg active:scale-95 text-lg">
                                Next
                            </button>
                        ) : (
                            <button onClick={handleSubmit} className="px-12 py-3.5 bg-[#ffcc00] hover:bg-[#ffdb4d] text-[#5a014a] font-bold rounded-xl transition-all shadow-lg active:scale-95 text-lg">
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Section - Purple Steps */}
            <div className="w-full md:w-[400px] lg:w-[480px] bg-[#5a014a] min-h-screen flex flex-col justify-center">
                <div className="space-y-16">
                    {STEPS.map((step, index) => {
                        const isActiveOrCompleted = index <= currentStep;
                        return (
                            <div key={step.id} className="relative flex items-center pl-24 pr-12">
                                <div className="absolute -left-12 flex items-center">
                                    {isActiveOrCompleted ? (
                                        <div className="w-20 h-20 bg-[#ffcc00] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)] z-30">
                                            <step.icon className="w-9 h-9 text-[#5a014a]" strokeWidth={2.5} />
                                        </div>
                                    ) : (
                                        <div className="relative flex items-center justify-end w-20 h-16 pointer-events-none">
                                            <div className="absolute right-0 w-16 h-16 bg-white rounded-l-full shadow-lg z-10 translate-x-4 flex items-center justify-center">
                                                <step.icon className="w-5 h-5 text-[#888] ml-4" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={`transition-all duration-500 ${isActiveOrCompleted ? 'opacity-100' : 'opacity-40'}`}>
                                    <h3 className="text-2xl font-bold text-white mb-2 leading-none">{step.title}</h3>
                                    <p className="text-white/70 text-[13px] leading-snug font-medium max-w-[280px]">{step.subtitle}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}