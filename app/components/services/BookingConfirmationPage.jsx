'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, MapPin, User, CheckCircle, Sparkles, CreditCard, Wallet, Truck, Info } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { BookingSteps, FLOW_TYPES } from '@/components/shared/BookingSteps';
import { generateIdempotencyKey, formatDateTimeWithTimezone, validatePrice } from '@/utils/security';

export function BookingConfirmationPage({
  address,
  onBack,
  onConfirmBooking,
}) {
  const { user, token, isAuthenticated } = useAuth();
  const { cartItems: contextCartItems, cartTotal: contextCartTotal, clearCart } = useCart();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [technicianPreference, setTechnicianPreference] = useState('any');
  const [isConfirming, setIsConfirming] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [directBookingItems, setDirectBookingItems] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);

  // Race condition protection
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const idempotencyKeyRef = useRef(null);

  // Fetch Wallet Balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!token) return;
      setWalletLoading(true);
      try {
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/wallet/balance', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success && data.wallet) {
          setWalletBalance(data.wallet.currentBalance || 0);
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      } finally {
        setWalletLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchWalletBalance();
    }
  }, [token, isAuthenticated]);

  React.useEffect(() => {
    const stored = localStorage.getItem('booking_package_details');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        setDirectBookingItems(Array.isArray(items) ? items : [items]);
      } catch (e) {
        console.error('Failed to parse direct booking items');
      }
    }
  }, []);

  const cartItems = (directBookingItems && directBookingItems.length > 0) ? directBookingItems : (contextCartItems || []);
  const subtotal = (directBookingItems && directBookingItems.length > 0)
    ? directBookingItems.reduce((acc, item) => acc + (item.price || 0), 0)
    : (contextCartTotal || 0);

  const bookingCost = (directBookingItems && directBookingItems.length > 0)
    ? directBookingItems.reduce((acc, item) => acc + (item.bookingCost || 0), 0)
    : 0;
  const inspectionCost = (directBookingItems && directBookingItems.length > 0)
    ? directBookingItems.reduce((acc, item) => acc + (item.inspectionCost || 0), 0)
    : 0;

  const total = bookingCost;
  const tax = 0;

  // Service window: 9 AM to 9 PM (9:00 to 21:00)
  const SERVICE_START_HOUR = 9;
  const SERVICE_END_HOUR = 21;
  const BUFFER_HOURS = 3;

  // Smart date availability logic
  const getAvailableDates = () => {
    const now = new Date();
    const dates = [];

    // Check cutoff time (6 PM) for today
    const todayCutoff = new Date();
    todayCutoff.setHours(SERVICE_END_HOUR - BUFFER_HOURS, 0, 0, 0); // 18:00 (6 PM)

    // Determine starting day index (0 = Today, 1 = Tomorrow)
    const startDayIndex = (now > todayCutoff) ? 1 : 0; // If past 6 PM, start from tomorrow

    // Generate 7 days of availability
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + startDayIndex + i);

      // Calculate the actual offset for labeling
      const actualOffset = startDayIndex + i;

      dates.push({
        value: date.toISOString().split('T')[0],
        label: actualOffset === 0 ? 'Today' : actualOffset === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
      });
    }
    return dates;
  };

  // Smart time slot availability based on selected date
  const getAvailableTimes = (selectedDateValue) => {
    const now = new Date();
    const selectedDate = new Date(selectedDateValue);

    // Time slots (2-hour windows)
    const allTimeSlots = [
      { label: '09:00 AM - 11:00 AM', value: '09:00', startHour: 9, endHour: 11 },
      { label: '11:00 AM - 01:00 PM', value: '11:00', startHour: 11, endHour: 13 },
      { label: '01:00 PM - 03:00 PM', value: '13:00', startHour: 13, endHour: 15 },
      { label: '03:00 PM - 05:00 PM', value: '15:00', startHour: 15, endHour: 17 },
      { label: '05:00 PM - 07:00 PM', value: '17:00', startHour: 17, endHour: 19 },
      { label: '07:00 PM - 09:00 PM', value: '19:00', startHour: 19, endHour: 21 },
    ];

    // If today and past cutoff time, filter available slots
    if (selectedDate.toDateString() === now.toDateString()) {
      const currentHour = now.getHours();
      const cutoffHour = SERVICE_END_HOUR - BUFFER_HOURS; // 6 PM cutoff

      if (currentHour >= cutoffHour) {
        return []; // No slots available today
      }

      return allTimeSlots.filter(slot => slot.startHour > currentHour);
    }

    return allTimeSlots;
  };

  const availableDates = getAvailableDates();
  const availableTimesForSelectedDate = getAvailableTimes(selectedDate);

  // Set initial default date based on availability
  useEffect(() => {
    const dates = getAvailableDates();
    if (dates.length > 0) {
      const todayValue = dates[0].value;
      const todayTimes = getAvailableTimes(todayValue);

      if (todayTimes.length > 0) {
        setSelectedDate(todayValue);
      } else if (dates.length > 1) {
        setSelectedDate(dates[1].value);
      }
    }
  }, []);

  // Reset time when date changes
  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate]);

  const handleConfirm = async () => {
    // Prevent duplicate clicks (race condition protection)
    if (isProcessing || processingRef.current) {
      console.log('Booking already in progress, ignoring duplicate click');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to book a service');
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    // Validate price integrity
    const priceValidation = validatePrice(total);
    if (!priceValidation.valid) {
      toast.error('Invalid booking amount. Please refresh and try again.');
      return;
    }

    // Set processing flags
    setIsProcessing(true);
    processingRef.current = true;
    setIsConfirming(true);

    // Generate idempotency key for this booking
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = generateIdempotencyKey('booking');
    }

    try {
      const storedServiceId = localStorage.getItem('last_service_id');
      const serviceId = storedServiceId || cartItems[0]?.serviceId || cartItems[0]?.productId || cartItems[0]?.id || cartItems[0]?._id;

      if (!serviceId) {
        throw new Error('Service identifier missing. Please return to service details and try again.');
      }

      // Format date/time with timezone
      const dateTimeInfo = formatDateTimeWithTimezone(selectedDate, selectedTime);

      const bookingData = {
        serviceId: serviceId,
        serviceAddressId: address._id || address.id,
        sourceOfLead: 'website',
        addMoreInfo: `Technician Preference: ${technicianPreference}. Payment: ${paymentMethod}. Packages: ${cartItems.map(i => i.packageName || i.serviceName).join(', ')}`,
        bookedDate: selectedDate,
        bookedTime: selectedTime,
        bookedDateTime: dateTimeInfo.iso, // ISO 8601 format with timezone
        timezone: dateTimeInfo.timezone,
        totalAmount: priceValidation.value.toString() // Use validated price
      };

      if (paymentMethod === 'COD' || paymentMethod === 'wallet') {
        // Use provider-flow/BookService for both COD and wallet
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/provider-flow/BookService', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Idempotency-Key': idempotencyKeyRef.current // Prevent duplicate bookings
          },
          body: JSON.stringify({
            ...bookingData,
            paymentMethod: paymentMethod === 'COD' ? 'COD' : 'wallet'
          })
        });

        const data = await response.json();
        if (data.success) {
          toast.success('Booking confirmed successfully!');
          cleanup();
          onConfirmBooking(data);
        } else {
          throw new Error(data.message || 'Booking failed');
        }
      } else if (paymentMethod === 'online') {
        // Online payment uses separate payment gateway endpoint
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/initiate-service-booking-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Idempotency-Key': idempotencyKeyRef.current // Prevent duplicate payments
          },
          body: JSON.stringify(bookingData)
        });

        const data = await response.json();

        if (data.success && data.access_key) {
          toast.success('Redirecting to payment gateway...', {
            duration: 2000
          });

          // Fixed Easebuzz URL format
          const easebuzzUrl = `https://testpay.easebuzz.in/pay/${data.access_key}`;
          cleanup();
          window.location.href = easebuzzUrl;
        } else {
          throw new Error(data.message || 'Failed to initiate online payment');
        }
      }
    } catch (error) {
      console.error('Booking Error:', error);
      toast.error(error.message || 'Failed to confirm booking. Please try again.');

      // Reset idempotency key on error to allow retry
      idempotencyKeyRef.current = null;
    } finally {
      setIsConfirming(false);
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const cleanup = () => {
    if (!directBookingItems) {
      clearCart();
    }
    localStorage.removeItem('booking_package_details');
    localStorage.removeItem('last_service_id');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-20 pb-32"
    >
      {/* Header */}
      <section className=" top-20 z-40 bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] border-b border-white/10 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Address
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3"
          >
            <Sparkles className="w-8 h-8" />
            Confirm Your Booking
          </motion.h1>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-6">
          <BookingSteps
            flowType={directBookingItems ? FLOW_TYPES.NORMAL : FLOW_TYPES.SERVICE_CENTER}
            currentStep="confirm"
            serviceSlug="services"
          />
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10"
            >
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#04a99d]" />
                Select Date
              </h4>
              {availableDates.length === 0 ? (
                <p className="text-white/70 text-sm">No dates available at this time</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableDates.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => setSelectedDate(date.value)}
                      className={`p-4 rounded-xl font-medium transition-all ${selectedDate === date.value
                        ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-lg shadow-[#037166]/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                        }`}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Time Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10"
            >
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#04a99d]" />
                Select Time Slot
              </h4>
              {availableTimesForSelectedDate.length === 0 ? (
                <p className="text-white/70 text-sm">
                  {selectedDate
                    ? 'No time slots available for selected date'
                    : 'Please select a date first'
                  }
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {availableTimesForSelectedDate.map((time) => (
                    <button
                      key={time.value}
                      onClick={() => setSelectedTime(time.value)}
                      className={`p-4 rounded-xl font-medium transition-all ${selectedTime === time.value
                        ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-lg shadow-[#037166]/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                        }`}
                    >
                      {time.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Rest of the sections remain the same */}
            {/* Technician Preference */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10"
            >
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#04a99d]" />
                Technician Preference (Optional)
              </h4>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { value: 'any', label: 'Any Available' },
                  { value: 'senior', label: 'Senior Technician' },
                  { value: 'same', label: 'Same as Last Time' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTechnicianPreference(option.value)}
                    className={`p-4 rounded-xl font-medium transition-all ${technicianPreference === option.value
                      ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10"
            >
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#04a99d]" />
                Select Payment Method
              </h4>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  {
                    id: 'COD',
                    label: 'Cash on Service Delivery',
                    icon: Truck,
                    disabled: true,
                    tooltip: 'For Premium Subscribers Only'
                  },
                  {
                    id: 'wallet',
                    label: 'Wallet Pay',
                    icon: Wallet,
                    disabled: true,
                    tooltip: 'Redeemable after service completion only',
                    showBalance: true
                  },
                  {
                    id: 'online',
                    label: 'Online Payment',
                    icon: CreditCard,
                    disabled: false
                  },
                ].map((method) => (
                  <div key={method.id} className="relative group h-full">
                    <button
                      onClick={() => !method.disabled && setPaymentMethod(method.id)}
                      disabled={method.disabled}
                      className={`w-full h-full p-5 rounded-xl flex flex-col items-center justify-center gap-2 transition-all min-h-[140px] ${paymentMethod === method.id
                        ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-lg'
                        : method.disabled
                          ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                        }`}
                    >
                      <div className={`w-6 h-6 flex items-center justify-center ${paymentMethod === method.id ? 'text-white' : method.disabled ? 'text-white/10' : 'text-[#04a99d]'}`}>
                        {method.id === 'wallet' && !walletLoading && walletBalance > 0 ? (
                          <span className="text-sm font-bold">₹{walletBalance}</span>
                        ) : (
                          <method.icon className="w-6 h-6" />
                        )}
                      </div>

                      <h6 className="text-sm font-medium">{method.label}</h6>

                      {method.id === 'wallet' && (
                        <i className="text-[9px] text-white/40 block mt-0.5 leading-tight">
                          Wallet Usable After Service Completion Only
                        </i>
                      )}
                    </button>

                    {/* Simple Tooltip on Top */}
                    {method.disabled && method.tooltip && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 px-2 py-1 bg-black/90 text-white text-[12px] rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45 border-r border-b border-white/10" />
                        {method.tooltip}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Service Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10"
            >
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#04a99d]" />
                Service Address
              </h4>
              {address ? (
                <div className="p-4 rounded-lg bg-white/5">
                  <h6 className="text-white font-medium mb-1">{address.name}</h6>
                  <p className="text-white/80">{address.flat}, {address.area}</p>
                  <p className="text-white/60">{address.cityName || address.city}, {address.postalCode}</p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-white/60">No address selected</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Summary Sidebar - SAME AS BEFORE */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky top-48 p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10"
            >
              <h4 className="text-xl font-bold text-white mb-4">Booking Summary</h4>

              {/* Services */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item, idx) => (
                  <div key={item.id || item._id || idx} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <h6 className="text-white/90 font-bold">{item.serviceName || 'Service'}</h6>
                      <p className="text-[#04a99d] text-xs font-semibold uppercase tracking-wider mb-1">
                        {item.packageName || item.title || 'Standard Package'}
                      </p>
                      <p className="text-white/40 text-[10px]">
                        Qty: {item.quantity || 1}
                      </p>
                    </div>
                    {/* Item cost is effectively 0 for immediate payment */}
                    {/* <span className="text-white/90 font-medium">
                      ₹0
                    </span> */}
                  </div>
                ))}
              </div>

              <div className="h-px bg-white/10 mb-4" />

              {/* Price Breakdown */}
              <div className="space-y-2 mb-2">
                {bookingCost > 0 && (
                  <div className="flex justify-between items-start text-white/80">
                    <div className="flex flex-col">
                      <span>Online Consultation Fee</span>
                      <div className="flex items-center gap-1 text-[#04a99d] text-xs font-normal">
                        <Info className="w-3 h-3" />
                        <span>pay online</span>
                      </div>
                    </div>
                    <span>₹{bookingCost}</span>
                  </div>
                )}
                {/* Hidden inspection cost for summary since subtotal is zero logic applies */}
                {inspectionCost > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start text-white/80">
                      <div className="flex flex-col">
                        <span>Doorstep Inspection Fee</span>
                        <div className="flex items-center gap-1 text-[#04a99d] text-xs font-normal">
                          <Info className="w-3 h-3" />
                          <span>pay at Doorstep</span>
                        </div>
                      </div>
                      <span>₹{inspectionCost}</span>
                    </div>
                    <div className="flex items-start gap-2 text-[10px] text-white/50 bg-white/5 p-2 rounded">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#04a99d]" />
                      <p>Note: This is the online consultation fee only. The Doorstep Inspection Fee will be collected at Doorstep.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px bg-white/10 mb-4" />

              <div className="flex justify-between text-xl font-bold text-white mb-6">
                <span>Total</span>
                <span>₹{total}</span>
              </div>



              {/* Selected Date/Time Preview */}
              {selectedDate && selectedTime && (
                <div className="p-4 rounded-lg bg-[#037166]/10 border border-[#037166]/20 mb-6">
                  <p className="text-white/80 text-sm mb-2">Scheduled for:</p>
                  <p className="text-white font-medium">
                    {availableDates.find(d => d.value === selectedDate)?.label}
                  </p>
                  <p className="text-white font-medium">
                    {availableTimesForSelectedDate.find(t => t.value === selectedTime)?.label}
                  </p>
                </div>
              )}

              {/* Confirm Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={isConfirming || !selectedDate || !selectedTime}
                className={`w-full px-6 py-4 rounded-xl font-medium text-lg transition-all ${isConfirming || !selectedDate || !selectedTime
                  ? 'bg-white/20 text-white/60 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white hover:shadow-lg hover:shadow-[#037166]/40'
                  }`}
              >
                {isConfirming ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming...
                  </div>
                ) : (
                  'Confirm Booking'
                )}
              </motion.button>

              <p className="text-white/60 text-xs text-center mt-4">
                You'll receive a confirmation email and SMS
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
