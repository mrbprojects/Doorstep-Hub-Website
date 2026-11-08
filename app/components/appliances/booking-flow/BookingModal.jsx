'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BadgeCheck, PhoneCall, ChevronRight, MapPin, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { actionTypes } from './data';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/context/AuthContext';
import { trackBookingCompleted, trackLeadEvent, getLeadUserFields } from '@/lib/leadTracking';
import { fetchCities, fetchAuthorizedServicesByFilters } from '@/lib/api';
import { citiesMatchBySlugOrName } from '@/lib/applianceRepairSlugs';
import { useAmcEligibility } from '@/hooks/useAmcEligibility';
import { AmcCoverageBanner } from '@/components/amc/AmcCoverageBanner';

function resolveBookingEntityId(value) {
  if (value == null || value === '') return null;
  if (Array.isArray(value)) {
    const match = value.find((item) => item != null && String(item).trim());
    return match ? String(match) : null;
  }
  return String(value);
}

function resolveCategoryIdForBooking(selectedCategory, selectedService) {
  const fromCategory = resolveBookingEntityId(selectedCategory?._id || selectedCategory?.id);
  if (fromCategory) return fromCategory;

  const fromService = resolveBookingEntityId(selectedService?.bookingCategoryId);
  if (fromService) return fromService;

  const categoryIds = Array.isArray(selectedService?.categoryId)
    ? selectedService.categoryId
    : [selectedService?.categoryId].filter(Boolean);
  const categoryNames = Array.isArray(selectedService?.categoryNames)
    ? selectedService.categoryNames
    : Array.isArray(selectedService?.categoryName)
      ? selectedService.categoryName
      : [selectedService?.categoryName].filter(Boolean);

  const targetName = String(selectedCategory?.name || '').trim().toLowerCase();
  if (targetName && categoryNames.length) {
    const idx = categoryNames.findIndex(
      (name) => String(name || '').trim().toLowerCase() === targetName
    );
    if (idx >= 0 && categoryIds[idx]) {
      return String(categoryIds[idx]);
    }
  }

  return resolveBookingEntityId(categoryIds);
}

function getCitySlugFromCity(city) {
  return String(city?.slug || city?.name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

/** Check service.cityName / service.cityId against selected city. null = needs API lookup */
function checkServiceCityFromServiceData(selectedService, displayCity) {
  if (!selectedService || !displayCity) return null;

  const cityNames = (Array.isArray(selectedService.cityName)
    ? selectedService.cityName
    : [selectedService.cityName]
  ).filter(Boolean);

  if (cityNames.length > 0) {
    return cityNames.some((name) => citiesMatchBySlugOrName(displayCity, name));
  }

  const cityIds = (Array.isArray(selectedService.cityId)
    ? selectedService.cityId
    : [selectedService.cityId]
  ).filter(Boolean);
  const selectedCityId = displayCity._id || displayCity.id;

  if (cityIds.length > 0 && selectedCityId) {
    return cityIds.some((id) => String(id) === String(selectedCityId));
  }

  return null;
}

function matchesServiceInCityList(selectedService, cityServices = []) {
  const serviceId = selectedService?._id || selectedService?.id;
  const serviceSlug = selectedService?.slug;

  return cityServices.some((service) => {
    if (serviceId && String(service._id || service.id) === String(serviceId)) return true;
    if (serviceSlug && service.slug === serviceSlug) return true;
    return false;
  });
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '').slice(-10);
}

function buildCustomerPayload(customerDetails, user, location) {
  const leadFields = getLeadUserFields(user);
  const phone = normalizePhone(customerDetails.phone) || leadFields.mobile || '';
  const customerName = String(customerDetails.customerName || leadFields.customerName || '').trim();
  const email = String(customerDetails.email || user?.email || '').trim();
  const address = String(customerDetails.address || location?.address || '').trim();
  const pincode = String(
    customerDetails.pincode || location?.postalCode || location?.pincode || '',
  ).trim();
  const customerId = user?._id || user?.id;

  return {
    ...(customerName ? { customerName } : {}),
    ...(phone ? { phone, mobile: phone } : {}),
    ...(email ? { email } : {}),
    ...(address ? { address } : {}),
    ...(pincode ? { pincode } : {}),
    ...(location?.area || location?.city
      ? { location: String(location.area || location.city).trim() }
      : {}),
    ...(customerId ? { customerId } : {}),
  };
}

async function verifyServiceAvailableInCity(selectedService, displayCity) {
  const embeddedCheck = checkServiceCityFromServiceData(selectedService, displayCity);
  if (embeddedCheck === true) return true;
  if (embeddedCheck === false) return false;

  const citySlug = getCitySlugFromCity(displayCity);
  if (!citySlug) return false;

  const cityServices = await fetchAuthorizedServicesByFilters({ citySlug });
  return matchesServiceInCityList(selectedService, cityServices);
}

function Summary({ label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">{label}</p>
      <p className="mt-2 font-black text-gray-900 text-sm tracking-tight leading-snug">{value}</p>
    </div>
  );
}

function CitySummarySelect({ label, cities, selectedCity, onChange, loading }) {
  const selectedId = (() => {
    if (!selectedCity || !cities.length) return '';
    const direct = cities.find(
      (city) => (city._id || city.id) === (selectedCity._id || selectedCity.id)
    );
    if (direct) return direct._id || direct.id;
    const matched = cities.find((city) => citiesMatchBySlugOrName(city, selectedCity));
    return matched ? (matched._id || matched.id) : '';
  })();

  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">{label}</p>
      <select
        value={selectedId}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading || !cities.length}
        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-black text-gray-900 outline-none transition-all focus:border-[#037166]/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {!selectedId && <option value="">Select city</option>}
        {cities.map((city) => (
          <option key={city._id || city.id} value={city._id || city.id}>
            {city.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function BookingModal({ 
  isOpen, 
  onClose, 
  selectedCity: propCity, 
  selectedCategory, 
  selectedBrand, 
  selectedService 
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { location } = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAction, setSelectedAction] = useState(actionTypes[0]);
  const [requirement, setRequirement] = useState("");
  const [customerDetails, setCustomerDetails] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    pincode: '',
  });
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [displayCity, setDisplayCity] = useState(propCity || (location?.city ? { name: location.city } : null));
  const [prevCityProps, setPrevCityProps] = useState({ propCity, city: location?.city });
  if (prevCityProps.propCity !== propCity || prevCityProps.city !== location?.city) {
    setPrevCityProps({ propCity, city: location?.city });
    setDisplayCity(propCity || (location?.city ? { name: location.city } : null));
  }
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [serviceAvailableInCity, setServiceAvailableInCity] = useState(null);

  const bookingServiceId = selectedService?._id || selectedService?.id;
  const bookingCategoryId = resolveCategoryIdForBooking(selectedCategory, selectedService);
  const bookingSubcategoryId =
    selectedService?.subcategoryId ||
    selectedService?.subCategoryId ||
    selectedService?.bookingSubcategoryId ||
    null;

  const { eligibility: amcEligibility } = useAmcEligibility({
    serviceId: bookingServiceId,
    categoryId: bookingCategoryId,
    subcategoryId: bookingSubcategoryId,
    enabled: isOpen && !confirmed,
  });

  const locationMismatch = useMemo(() => {
    if (!displayCity || !location?.city) return null;
    if (citiesMatchBySlugOrName(displayCity, location.city)) return null;

    const serviceCityName = displayCity.name || displayCity.slug || 'this city';
    const currentCityName = location.city;

    return {
      serviceCityName,
      currentCityName,
      message: `You selected ${serviceCityName} for service, but your current location is ${currentCityName}. Please select your current city from the dropdown to continue booking.`,
    };
  }, [displayCity, location?.city]);

  const canSubmitBooking =
    !locationMismatch &&
    serviceAvailableInCity === true &&
    !checkingAvailability &&
    Boolean(displayCity) &&
    Boolean(customerDetails.customerName.trim()) &&
    normalizePhone(customerDetails.phone).length === 10;

  const serviceUnavailableMessage = useMemo(() => {
    if (!displayCity?.name) return 'Please select a city to continue.';
    if (serviceAvailableInCity !== false) return '';

    const serviceLabel =
      selectedService?.serviceName || selectedService?.name || 'This service';
    return `${serviceLabel} is not available in ${displayCity.name}. Please select another city.`;
  }, [serviceAvailableInCity, displayCity?.name, selectedService]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    (async () => {
      setCitiesLoading(true);
      try {
        const list = await fetchCities();
        if (!cancelled) setCities(list);
      } catch (error) {
        console.error('Failed to load cities for booking:', error);
      } finally {
        if (!cancelled) setCitiesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const isCityCheckEligible = isOpen && currentStep === 2 && Boolean(displayCity) && Boolean(selectedService);
  const [prevCheckEligible, setPrevCheckEligible] = useState(isCityCheckEligible);
  if (prevCheckEligible !== isCityCheckEligible) {
    setPrevCheckEligible(isCityCheckEligible);
    if (!isCityCheckEligible) {
      setServiceAvailableInCity(null);
    }
  }

  useEffect(() => {
    if (!isOpen || currentStep !== 2 || !displayCity || !selectedService) {
      return;
    }

    let cancelled = false;
    (async () => {
      setCheckingAvailability(true);
      try {
        const available = await verifyServiceAvailableInCity(selectedService, displayCity);
        if (!cancelled) setServiceAvailableInCity(available);
      } catch (error) {
        console.error('Failed to check service availability:', error);
        if (!cancelled) setServiceAvailableInCity(false);
      } finally {
        if (!cancelled) setCheckingAvailability(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, currentStep, displayCity, selectedService]);

  const handleCityChange = (cityId) => {
    const city = cities.find((item) => (item._id || item.id) === cityId);
    if (!city) return;
    setDisplayCity(city);
    setSubmitError('');
    setServiceAvailableInCity(null);
  };

  // Handle redirect after confirmation
  useEffect(() => {
    if (confirmed) {
      const timer = setTimeout(() => {
        onClose();
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmed, router, onClose]);

  // Reset state when opened with a new service
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setConfirmed(false);
      setRequirement("");
      setSelectedAction(actionTypes[0]);
      setSubmitError("");
      setCurrentStep(1);
      setServiceAvailableInCity(null);

      const leadFields = getLeadUserFields(user);
      setCustomerDetails({
        customerName: leadFields.customerName || '',
        phone: leadFields.mobile || '',
        email: user?.email || '',
        address: location?.address || '',
        pincode: location?.postalCode || location?.pincode || '',
      });
    }
  }

  const handleConfirmBooking = async () => {
    if (locationMismatch) {
      setSubmitError(locationMismatch.message);
      return;
    }

    if (serviceAvailableInCity !== true) {
      setSubmitError(
        serviceUnavailableMessage ||
          'Please wait until we verify this service is available in your selected city.'
      );
      return;
    }

    let cityId = displayCity?._id || displayCity?.id;
    const categoryId = resolveCategoryIdForBooking(selectedCategory, selectedService);
    const brandId = resolveBookingEntityId(selectedService?.brandId);
    const authorisedServiceId = resolveBookingEntityId(selectedService?._id || selectedService?.id);

    if (!requirement.trim()) {
      setSubmitError("Please provide a description of your requirement.");
      return;
    }

    if (!customerDetails.customerName.trim()) {
      setSubmitError("Please enter your name.");
      return;
    }

    if (normalizePhone(customerDetails.phone).length !== 10) {
      setSubmitError("Please enter a valid 10-digit mobile number.");
      return;
    }

    const customerPayload = buildCustomerPayload(customerDetails, user, location);

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // If cityId is missing but we have a city name, try to resolve it from the cities list
      if (!cityId && displayCity?.name) {
        try {
          const { fetchCities } = await import('@/lib/api');
          const cities = await fetchCities();
          const match = cities.find(c => 
            c.name?.toLowerCase() === displayCity.name.toLowerCase() ||
            (c.slug || '').toLowerCase() === (displayCity.slug || '').toLowerCase()
          );
          if (match) {
            cityId = match._id || match.id;
          }
        } catch (e) {
          console.error("Failed to resolve city ID during booking:", e);
        }
      }

      if (!cityId || !categoryId || !brandId || !authorisedServiceId) {
        console.error("Missing IDs for booking:", { cityId, categoryId, brandId, authorisedServiceId });
        throw new Error("Booking details are incomplete. Please ensure a valid city is selected.");
      }

      const stillAvailable = await verifyServiceAvailableInCity(selectedService, displayCity);
      if (!stillAvailable) {
        setServiceAvailableInCity(false);
        throw new Error(
          `${selectedService?.serviceName || selectedService?.name || 'This service'} is not available in ${displayCity?.name || 'the selected city'}. Please choose another city.`
        );
      }

      const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/autherised-booking/add_autherised_booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId,
          categoryId,
          brandId,
          authorisedServiceId,
          serviceType: selectedAction.toLowerCase(),
          description: requirement.trim(),
          ...customerPayload,
        })
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to submit booking');
      }

      trackLeadEvent({
        eventType: 'BOOKING_COMPLETED',
        vertical: 'authorised',
        categoryId,
        brandId,
        serviceId: authorisedServiceId,
        serviceName: selectedService?.name || '',
        categoryName: selectedCategory?.name || '',
        brandName: selectedService?.brandName || '',
        problemName: requirement.trim(),
        serviceType: selectedAction,
        customerName: customerPayload.customerName,
        mobile: customerPayload.phone,
        email: customerPayload.email,
        city: displayCity?.name || '',
        area: customerPayload.location || location?.area || '',
        pincode: customerPayload.pincode,
      });
      trackBookingCompleted(data.bookingId || data.data?._id, { vertical: 'authorised' });

      setConfirmed(true);
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!customerDetails.customerName.trim()) {
        setSubmitError("Please enter your name before proceeding.");
        return;
      }
      if (normalizePhone(customerDetails.phone).length !== 10) {
        setSubmitError("Please enter a valid 10-digit mobile number.");
        return;
      }
      if (!requirement.trim()) {
        setSubmitError("Please describe your problem before proceeding.");
        return;
      }
      setSubmitError("");
      setCurrentStep(2);
    }
  };

  const updateCustomerField = (field, value) => {
    setCustomerDetails((prev) => ({ ...prev, [field]: value }));
    if (submitError) setSubmitError("");
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
            {!confirmed && (
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
            )}

            {/* SCROLLABLE CONTENT AREA */}
            <div className={`flex-1 overflow-y-auto px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${confirmed ? 'flex items-center justify-center py-12' : ''}`}>
              {confirmed ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-[2.5rem] border-2 border-[#037166]/20 bg-[#037166]/5 p-12 font-black text-[#037166] text-center uppercase tracking-widest text-sm flex flex-col items-center justify-center gap-6 shadow-xl shadow-[#037166]/5 w-full"
                >
                  <div className="w-20 h-20 rounded-full bg-[#037166] flex items-center justify-center text-white shadow-lg">
                    <BadgeCheck size={44} />
                  </div>
                  <div>
                    <p className="text-2xl tracking-tighter">Booking Confirmed!</p>
                    <p className="mt-2 text-xs opacity-70">Our coordinator will contact you shortly.</p>
                    <div className="mt-8 flex items-center justify-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#037166] animate-pulse" />
                       <p className="text-[10px] text-gray-400 font-bold">Redirecting to home page...</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <>
                  {amcEligibility?.amcApplicable || amcEligibility?.limitExhausted ? (
                    <div className="pt-5 pb-1">
                      <AmcCoverageBanner eligibility={amcEligibility} />
                    </div>
                  ) : null}

                  {/* STEP 1: REQUIREMENTS */}
                  {currentStep === 1 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="py-6"
                    >
                      <div className="mb-6">
                        <label className="mb-3 ml-1 block text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                          Your Details
                        </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 ml-1 block text-[9px] font-black uppercase tracking-widest text-gray-400">
                              Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={customerDetails.customerName}
                              onChange={(event) => updateCustomerField('customerName', event.target.value)}
                              placeholder="Enter your name"
                              className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-4 py-3.5 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300 focus:border-[#037166]/30 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="mb-2 ml-1 block text-[9px] font-black uppercase tracking-widest text-gray-400">
                              Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              inputMode="numeric"
                              maxLength={10}
                              value={customerDetails.phone}
                              onChange={(event) => updateCustomerField('phone', event.target.value.replace(/\D/g, '').slice(0, 10))}
                              placeholder="10-digit mobile number"
                              className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-4 py-3.5 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300 focus:border-[#037166]/30 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="mb-2 ml-1 block text-[9px] font-black uppercase tracking-widest text-gray-400">
                              Email
                            </label>
                            <input
                              type="email"
                              value={customerDetails.email}
                              onChange={(event) => updateCustomerField('email', event.target.value)}
                              placeholder="Email address (optional)"
                              className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-4 py-3.5 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300 focus:border-[#037166]/30 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="mb-2 ml-1 block text-[9px] font-black uppercase tracking-widest text-gray-400">
                              Pincode
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={customerDetails.pincode}
                              onChange={(event) => updateCustomerField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="Pincode (optional)"
                              className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-4 py-3.5 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300 focus:border-[#037166]/30 focus:bg-white"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="mb-2 ml-1 block text-[9px] font-black uppercase tracking-widest text-gray-400">
                            Address
                          </label>
                          <input
                            type="text"
                            value={customerDetails.address}
                            onChange={(event) => updateCustomerField('address', event.target.value)}
                            placeholder="Service address (optional)"
                            className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-4 py-3.5 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300 focus:border-[#037166]/30 focus:bg-white"
                          />
                        </div>
                      </div>

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
                        <div className="flex items-center justify-between mb-3 ml-1">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block">Describe the problem</label>
                          <span className="text-[9px] font-black uppercase tracking-widest text-red-500  px-2 py-0.5 rounded-md">*</span>
                        </div>
                        <textarea 
                          value={requirement} 
                          onChange={(event) => {
                            setRequirement(event.target.value);
                            if (event.target.value.trim()) setSubmitError("");
                          }} 
                          placeholder="e.g. My appliance is not turning on. Need doorstep diagnosis today evening." 
                          className={`min-h-[8rem] w-full resize-none rounded-[2rem] border-2 bg-gray-50 p-6 text-gray-900 font-bold outline-none transition-all focus:bg-white placeholder-gray-300 shadow-inner text-sm ${submitError && !requirement.trim() ? 'border-red-200 focus:border-red-300' : 'border-gray-50 focus:border-[#037166]/30'}`} 
                        />
                        {submitError && !requirement.trim() && (
                          <p className="mt-2 ml-4 text-[10px] font-black text-red-500 uppercase tracking-widest">Description is required</p>
                        )}
                      </div>

                      {submitError && currentStep === 1 && (
                        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-black text-red-600">
                          {submitError}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* STEP 2: SUMMARY */}
                  {currentStep === 2 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="py-6"
                    >
                      {locationMismatch && (
                        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                              <AlertTriangle size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-amber-900">Location mismatch</p>
                              <p className="mt-1 text-sm font-medium leading-relaxed text-amber-800">
                                {locationMismatch.message}
                              </p>
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-amber-700">
                                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 border border-amber-100">
                                  <MapPin size={12} />
                                  Service city: {locationMismatch.serviceCityName}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 border border-amber-100">
                                  <MapPin size={12} />
                                  Your location: {locationMismatch.currentCityName}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {serviceUnavailableMessage && (
                        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                              <AlertTriangle size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-red-900">Service not available</p>
                              <p className="mt-1 text-sm font-medium leading-relaxed text-red-800">
                                {serviceUnavailableMessage}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="rounded-[2rem] bg-gray-50 border border-gray-100 p-6">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#037166] flex items-center justify-center text-white shadow-lg shadow-[#037166]/20">
                              <BadgeCheck size={18} />
                          </div>
                          <h3 className="text-lg font-black text-gray-900 tracking-tight">Booking Summary</h3>
                        </div>
                        <div className="grid gap-3 text-xs sm:text-sm grid-cols-1 sm:grid-cols-2">
                          <CitySummarySelect
                            label="Selected City"
                            cities={cities}
                            selectedCity={displayCity}
                            onChange={handleCityChange}
                            loading={citiesLoading}
                          />
                          <Summary label="Service Category" value={selectedCategory?.name || 'Standard Service'} />
                          <Summary label="Brand" value={selectedBrand || 'Standard Brand'} />
                          <Summary label="Request Type" value={selectedAction} />
                        </div>
                        <div className="mt-3 grid gap-3 text-xs sm:text-sm grid-cols-1 sm:grid-cols-2">
                          <Summary label="Customer Name" value={customerDetails.customerName || '—'} />
                          <Summary label="Mobile Number" value={customerDetails.phone || '—'} />
                          {customerDetails.email ? (
                            <Summary label="Email" value={customerDetails.email} />
                          ) : null}
                          {customerDetails.pincode ? (
                            <Summary label="Pincode" value={customerDetails.pincode} />
                          ) : null}
                        </div>
                        {customerDetails.address ? (
                          <div className="mt-3 rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mb-2">Service Address</p>
                            <p className="text-xs font-bold leading-relaxed text-gray-600">{customerDetails.address}</p>
                          </div>
                        ) : null}
                        {checkingAvailability && (
                          <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Verifying service availability in {displayCity?.name || 'selected city'}...
                          </p>
                        )}
                        {!checkingAvailability && serviceAvailableInCity === true && displayCity?.name && (
                          <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#037166]">
                            Service is available in {displayCity.name}
                          </p>
                        )}
                        <div className="mt-4 rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
                          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mb-2">Your Description</p>
                          <p className="text-xs font-bold leading-relaxed text-gray-600">
                            {requirement}
                          </p>
                        </div>
                      </div>

                      {submitError && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-black text-red-600">
                          {submitError}
                        </div>
                      )}
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* STICKY FOOTER */}
            {!confirmed && (
              <div className="px-8 py-6 border-t border-gray-50 flex flex-col gap-4 sm:flex-row sm:justify-end bg-white shrink-0">
                {currentStep === 1 ? (
                  <button 
                    onClick={onClose} 
                    className="rounded-full border-2 border-gray-100 bg-white px-10 py-4 font-black uppercase tracking-widest text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                ) : (
                  <button 
                    onClick={() => setCurrentStep(1)} 
                    className="rounded-full border-2 border-gray-100 bg-white px-10 py-4 font-black uppercase tracking-widest text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
                  >
                    Back to Details
                  </button>
                )}

                {currentStep === 1 ? (
                  <button 
                    onClick={handleNextStep}
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-[#037166] px-12 py-4 font-black uppercase tracking-widest text-xs text-white shadow-2xl shadow-[#037166]/30 hover:bg-[#04a99d] hover:-translate-y-1 transition-all"
                  >
                    Next Step <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting || !canSubmitBooking}
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] px-12 py-4 font-black uppercase tracking-widest text-xs text-white shadow-2xl shadow-[#037166]/30 hover:shadow-[#037166]/50 hover:-translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Confirm Booking"} <PhoneCall size={18} />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
