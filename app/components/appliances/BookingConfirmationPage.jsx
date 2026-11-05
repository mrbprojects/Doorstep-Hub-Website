'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, MapPin, User, CheckCircle, Sparkles, CreditCard, Info, Wallet, HelpCircle, Shield, Home, Briefcase, ShieldCheck, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { useServiceCart } from '@/context/ServiceCartContext';
import { BookingSteps, FLOW_TYPES } from '@/components/shared/BookingSteps';
import { generateIdempotencyKey, formatDateTimeWithTimezone, validatePrice } from '@/utils/security';
import { inferVertical, trackBookingCompleted, trackPaymentStarted } from '@/lib/leadTracking';
import { useAmcEligibility } from '@/hooks/useAmcEligibility';
import { AmcCoverageBanner } from '@/components/amc/AmcCoverageBanner';
import { verifyBookingPaymentStatus } from '@/lib/accountApi';

function normalizeCityString(cityName) {
  if (!cityName) return '';
  const str = typeof cityName === 'object' ? (cityName?.name || '') : String(cityName);
  return str
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function areCitiesMatching(cityA, cityB) {
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

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.doorstephub.com/v1/dhubApi';

export function BookingConfirmationPage({
  address,
  onBack,
  onChangeAddress,
  onConfirmBooking,
}) {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const { cartItems: contextCartItems, cartData, clearCart } = useServiceCart();
  const contextCartTotal = cartData?.finalAmount || 0;
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [technicianPreference, setTechnicianPreference] = useState('any');
  const [isConfirming, setIsConfirming] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletData, setWalletData] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [directBookingItems, setDirectBookingItems] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'failure' | 'pending' | null
  const [locationMismatch, setLocationMismatch] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

  // Race condition protection
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const idempotencyKeyRef = useRef(null);

  const performPaymentVerification = React.useCallback(async () => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');

    if (!statusParam) return;

    const pendingRaw = sessionStorage.getItem('pending_booking');
    if (!pendingRaw) {
      if (statusParam === 'success') {
        console.warn('[Payment] Blocked unverified success callback: No pending booking session found in storage');
      }
      return;
    }

    let pending = {};
    try {
      pending = JSON.parse(pendingRaw);
    } catch (e) {
      console.error('Failed to parse pending booking', e);
    }

    const orderRef = pending.orderId || urlParams.get('orderId');
    const txnRef = pending.txnid || urlParams.get('txnid');

    if (!orderRef && !txnRef) {
      console.warn('[Payment] Blocked unverified callback: Missing orderId and txnid references');
      return;
    }

    if (!token || !isAuthenticated) {
      setVerificationError('Please sign in to verify your payment status.');
      return;
    }

    setVerifyingPayment(true);
    setVerificationError(null);

    try {
      const verification = await verifyBookingPaymentStatus(token, { orderId: orderRef, txnid: txnRef });

      if (verification.isPaid) {
        setPaymentStatus('success');
        clearCart();
        localStorage.removeItem('booking_package_details');
        localStorage.removeItem('last_service_id');
        sessionStorage.removeItem('pending_booking');
        toast.success('Payment verified! Booking confirmed.');
        if (onConfirmBooking) {
          onConfirmBooking({
            orderId: verification.orderId || orderRef,
            bookedDate: pending.bookedDate,
            bookedTime: pending.bookedTime
          });
        }
      } else if (verification.status === 'pending' || verification.status === 'payment_pending') {
        setPaymentStatus('pending');
        toast.info('Payment is being confirmed by your bank. Please wait a moment or click recheck.');
      } else if (verification.status === 'failed' || verification.status === 'missed' || statusParam === 'failure' || statusParam === 'cancelled') {
        setPaymentStatus('failure');
        toast.error('Payment was not completed by the bank. Your booking details are preserved — please try again.');
      } else if (verification.status === 'unauthorized' || verification.status === 'not_found') {
        setVerificationError('Unable to verify booking for this account. Please verify with Doorstep Hub support.');
        setPaymentStatus('failure');
      } else {
        setVerificationError('Could not confirm payment status with server. Please click below to recheck.');
      }
    } catch (err) {
      console.error('[Payment] Verification error:', err);
      setVerificationError('Network error during verification. Please click below to recheck.');
    } finally {
      setVerifyingPayment(false);
    }
  }, [token, isAuthenticated, clearCart, onConfirmBooking]);

  React.useEffect(() => {
    // 1. Load saved booking items from localStorage
    const stored = localStorage.getItem('booking_package_details');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        setDirectBookingItems(Array.isArray(items) ? items : [items]);
      } catch (e) {
        console.error('Failed to parse direct booking items');
      }
    }

    // 2. Load wallet balance
    const fetchWalletBalance = async () => {
      if (!token || !isAuthenticated) return;
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
          setWalletData(data.wallet);
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

    // 3. Authoritatively verify payment with backend
    performPaymentVerification();
  }, [token, isAuthenticated, performPaymentVerification]);

  const cartItems = (directBookingItems && directBookingItems.length > 0) ? directBookingItems : (contextCartItems || []);

  // Use the platform fees once per booking (not summed per item)
  const rawBookingCost = cartItems.length > 0 ? Number(cartItems[0].bookingCost || 0) : 0;
  const inspectionCost = cartItems.length > 0 ? Number(cartItems[0].inspectionCost || 0) : 0;

  const amcServiceId = useMemo(() => {
    if (typeof window === 'undefined') return cartItems[0]?.serviceId || cartItems[0]?.id || cartItems[0]?._id || '';
    return (
      localStorage.getItem('last_service_id') ||
      cartItems[0]?.serviceId ||
      cartItems[0]?.productId ||
      cartItems[0]?.id ||
      cartItems[0]?._id ||
      ''
    );
  }, [cartItems]);

  const amcCategoryId = cartItems[0]?.categoryId || cartItems[0]?.bookingCategoryId || null;
  const amcSubcategoryId = cartItems[0]?.subcategoryId || cartItems[0]?.subCategoryId || null;

  const { eligibility: amcEligibility, amcApplicable } = useAmcEligibility({
    serviceId: amcServiceId,
    categoryId: amcCategoryId,
    subcategoryId: amcSubcategoryId,
    enabled: Boolean(amcServiceId) && isAuthenticated,
  });

  const amcApplies = amcApplicable && paymentMethod === 'amc';
  const bookingCost = amcApplies ? 0 : rawBookingCost;
  const total = bookingCost;
  const tax = 0;

  useEffect(() => {
    if (!amcApplicable && paymentMethod === 'amc') {
      setPaymentMethod('online');
    }
  }, [amcApplicable, paymentMethod]);

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

  // Set initial default date based on availability or pending booking
  useEffect(() => {
    let pendingDate = null;
    let pendingTime = null;

    try {
      const pendingData = sessionStorage.getItem('pending_booking');
      if (pendingData) {
        const parsed = JSON.parse(pendingData);
        if (parsed.bookedDate) pendingDate = parsed.bookedDate;
        if (parsed.bookedTime) pendingTime = parsed.bookedTime;
      }
    } catch (e) {
      console.error('Failed to parse pending booking', e);
    }

    const dates = getAvailableDates();
    if (dates.length > 0) {
      if (pendingDate && dates.some(d => d.value === pendingDate)) {
        setSelectedDate(pendingDate);
        if (pendingTime) {
          setSelectedTime(pendingTime);
        }
      } else {
        const todayValue = dates[0].value;
        const todayTimes = getAvailableTimes(todayValue);

        if (todayTimes.length > 0) {
          setSelectedDate(todayValue);
        } else if (dates.length > 1) {
          setSelectedDate(dates[1].value);
        }
      }
    }
  }, []);

  // Reset time when date changes, but not if we just restored it
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Don't reset time on the very first render if we restored it
      return;
    }
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

      const dateTimeInfo = formatDateTimeWithTimezone(selectedDate, selectedTime);

      /* PREVIOUS BOOKING DATA (BEFORE ONDEMAND SPEC UPDATE):
      const bookingData = {
        serviceId: serviceId,
        serviceAddressId: address._id || address.id,
        sourceOfLead: 'website',
        addMoreInfo: `Technician Preference: ${technicianPreference}. Payment: ${paymentMethod}. Packages: ${cartItems.map(i => i.packageName || i.serviceName).join(', ')}`,
        bookedDate: selectedDate,
        bookedTime: selectedTime,
        bookedDateTime: dateTimeInfo.iso,
        timezone: dateTimeInfo.timezone,
        totalAmount: priceValidation.value.toString()
      };
      */

      const selectedServiceRates = cartItems.map(item => ({
        id: item.id || item._id,
        name: (item.packageName || item.title || item.name || item.serviceName || "Standard Service").trim(),
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1
      })).filter(rate => rate.name);

      const getTrustedBaseUrl = () => {
        if (typeof window === 'undefined') return 'https://doorstephub.com';
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return `${window.location.protocol}//${window.location.host}`;
        }
        return 'https://doorstephub.com';
      };
      const currentUrl = `${getTrustedBaseUrl()}${typeof window !== 'undefined' ? window.location.pathname : '/appliances/booking'}`;

      const bookingData = {
        serviceId: serviceId,
        serviceAddressId: address._id || address.id,
        sourceOfLead: 'website',
        addMoreInfo: `Technician Preference: ${technicianPreference}. Payment: ${paymentMethod}.`,
        bookedDate: selectedDate,
        bookedTime: selectedTime,
        bookedDateTime: dateTimeInfo.iso,
        timezone: dateTimeInfo.timezone,
        totalAmount: priceValidation.value.toString(),
        selectedServiceRates: selectedServiceRates,
        returnUrl: currentUrl,
        surl: `${currentUrl}?status=success`,
        furl: `${currentUrl}?status=failure`
      };

      // Preflight validation: Verify customer address city matches provider location if provider is specified
      const providerCity = cartData?.provider?.cityName || cartItems?.[0]?.providerCity || cartItems?.[0]?.cityName || null;
      const userCity = address?.cityName ? (typeof address.cityName === 'object' ? address.cityName?.name : address.cityName) : null;
      if (providerCity && userCity && !areCitiesMatching(userCity, providerCity)) {
        const providerName = cartData?.provider?.businessName ||
          cartData?.provider?.name ||
          cartItems?.[0]?.providerName ||
          'Selected Service Provider';
        setLocationMismatch({
          userCity: String(userCity),
          providerCity: String(providerCity),
          providerName
        });
        setIsConfirming(false);
        setIsProcessing(false);
        processingRef.current = false;
        return;
      }

      // Save address to sessionStorage for Thank You page redirect/persistence
      sessionStorage.setItem('selected_address', JSON.stringify(address));

      if (paymentMethod === 'amc') {
        if (!amcApplicable) {
          throw new Error('This service is not covered under your active AMC.');
        }
        const response = await fetch(`${API_BASE}/app/provider-flow/BookService`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Idempotency-Key': idempotencyKeyRef.current,
          },
          body: JSON.stringify({
            ...bookingData,
            amount: 0,
            totalAmount: '0',
            paymentMethod: 'AMC',
            useAmc: true,
            amcPurchaseId: amcEligibility?.purchaseId || undefined,
          }),
        });
        const data = await response.json();
        if (data.success) {
          toast.success('AMC booking confirmed — no payment needed.');
          trackBookingCompleted(data.bookingId || data?.data?.booking?._id, {
            vertical: inferVertical(),
          });
          cleanup();
          const selectedDateLabel = availableDates.find(d => d.value === selectedDate)?.label || selectedDate;
          const selectedTimeLabel = availableTimesForSelectedDate.find(t => t.value === selectedTime)?.label || selectedTime;
          onConfirmBooking({
            bookingId: data.bookingId || data?.data?.booking?._id,
            bookedDate: selectedDateLabel,
            bookedTime: selectedTimeLabel,
          });
        } else {
          if (data.code === 'LOCATION_MISMATCH') {
            setLocationMismatch({
              userCity: data.userCity || (typeof address?.cityName === 'object' ? address.cityName?.name : address?.cityName) || 'Your Location',
              providerCity: data.providerCity || 'Provider Location',
              providerName: data.providerName || 'Selected Service Provider'
            });
            return;
          }
          throw new Error(data.message || 'AMC booking failed');
        }
      } else if (paymentMethod === 'COD' || paymentMethod === 'wallet') {
        // Use provider-flow/BookService for both COD and wallet
        const response = await fetch(`${API_BASE}/app/provider-flow/BookService`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Idempotency-Key': idempotencyKeyRef.current // Prevent duplicate bookings
          },
          body: JSON.stringify({
            ...bookingData,
            amount: priceValidation.value,
            paymentMethod: paymentMethod === 'COD' ? 'COD' : 'wallet'
          })
        });

        const data = await response.json();
        if (data.success) {
          toast.success('Booking confirmed successfully!');
          trackBookingCompleted(data.bookingId, { vertical: inferVertical() });
          cleanup();
          const selectedDateLabel = availableDates.find(d => d.value === selectedDate)?.label || selectedDate;
          const selectedTimeLabel = availableTimesForSelectedDate.find(t => t.value === selectedTime)?.label || selectedTime;
          onConfirmBooking({
            bookingId: data.bookingId,
            bookedDate: selectedDateLabel,
            bookedTime: selectedTimeLabel
          });
        } else {
          if (data.code === 'LOCATION_MISMATCH') {
            setLocationMismatch({
              userCity: data.userCity || (typeof address?.cityName === 'object' ? address.cityName?.name : address?.cityName) || 'Your Location',
              providerCity: data.providerCity || 'Provider Location',
              providerName: data.providerName || 'Selected Service Provider'
            });
            return;
          }
          // Handle wallet specific error if present in response
          if (paymentMethod === 'wallet' && data.required !== undefined) {
            const available = data.available || 0;
            const required = data.required;
            throw new Error(`Insufficient wallet balance. Required: ₹${Number(required).toFixed(2)}, Available Balance: ₹${Number(available).toFixed(2)}`);
          }
          throw new Error(data.message || 'Booking failed');
        }
      } else if (paymentMethod === 'online') {
        if (Number(priceValidation.value) <= 0) {
          throw new Error('Payable amount is ₹0. Choose “Use AMC cover” to book without payment gateway.');
        }
        // Online payment uses separate payment gateway endpoint
        const response = await fetch(`${API_BASE}/app/applience-repairs-website/initiate-service-booking-payment`, {
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
          trackPaymentStarted({
            vertical: inferVertical(),
            bookingId: data.bookingId || data.orderId,
            _user: user,
            eventData: { amount: priceValidation.value, paymentMethod: 'online' },
          });
          toast.success('Redirecting to payment gateway...', {
            duration: 2000
          });

          // Save booking state to sessionStorage so it survives the redirect
          // DO NOT clear localStorage/cart here — data must be preserved until payment is confirmed
          sessionStorage.setItem('pending_booking', JSON.stringify({
            bookedDate: selectedDate,
            bookedTime: selectedTime,
            address,
            orderId: data.bookingId || data.orderId || null,
            txnid: data.txnid || null
          }));

          const easebuzzUrl = `https://pay.easebuzz.in/pay/${data.access_key}`;
          // Redirect — cleanup will happen on return when ?status=success is detected
          window.location.href = easebuzzUrl;
        } else {
          if (data.code === 'LOCATION_MISMATCH') {
            setLocationMismatch({
              userCity: data.userCity || (typeof address?.cityName === 'object' ? address.cityName?.name : address?.cityName) || 'Your Location',
              providerCity: data.providerCity || 'Provider Location',
              providerName: data.providerName || 'Selected Service Provider'
            });
            return;
          }
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

  // cleanup() is called ONLY after confirmed payment (COD/wallet success, or on return with ?status=success)
  const cleanup = () => {
    clearCart();
    localStorage.removeItem('booking_package_details');
    localStorage.removeItem('last_service_id');
    sessionStorage.removeItem('pending_booking');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#f8fafc] pt-16 sm:pt-20 pb-16"
    >
      {/* Sleek Compact Header */}
      <section className="sticky top-16 sm:top-20 z-40 bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all text-xs font-semibold flex-shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </motion.button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                  <span>Confirm Your Booking</span>
                </h1>
                <p className="text-white/80 text-[11px] hidden sm:block">
                  Select your preferred date, time slot & payment method
                </p>
              </div>
            </div>

            {/* Progress Stepper */}
            <div className="scale-90 sm:scale-95 origin-left md:origin-right py-1">
              <BookingSteps
                flowType={directBookingItems ? FLOW_TYPES.NORMAL : FLOW_TYPES.SERVICE_CENTER}
                currentStep="confirm"
                serviceSlug="appliances"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* Verification Status Banners */}
        {verifyingPayment && (
          <div className="mb-4 p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[#037166] animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#037166]">Verifying Payment with Server</p>
              <p className="text-xs text-gray-600">Please wait while we authoritatively confirm your transaction with the bank.</p>
            </div>
          </div>
        )}

        {verificationError && !verifyingPayment && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">Payment Verification Pending</p>
                <p className="text-xs text-gray-600">{verificationError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={performPaymentVerification}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0"
            >
              <span>Retry Verification</span>
            </button>
          </div>
        )}

        {paymentStatus === 'pending' && !verifyingPayment && (
          <div className="mb-4 p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-800">Payment Processing at Bank</p>
                <p className="text-xs text-gray-600">Your bank is confirming the transaction. Your booking and cart items remain safely preserved.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={performPaymentVerification}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0"
            >
              <span>Recheck Status</span>
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* Left Column: Form Cards */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* 1. Schedule Service (Date & Time unified) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-4 sm:p-5"
            >
              <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#037166] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#0f172a] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#037166]" />
                      <span>Schedule Service</span>
                    </h3>
                    <p className="text-[11px] text-gray-500">Pick preferred appointment date and time</p>
                  </div>
                </div>
                {selectedDate && selectedTime && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    <Check className="w-3.5 h-3.5" /> Slot Picked
                  </span>
                )}
              </div>

              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Choose Date
                </label>
                {availableDates.length === 0 ? (
                  <p className="text-gray-500 text-xs">No dates available at this time</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {availableDates.map((date) => {
                      const isSelected = selectedDate === date.value;
                      return (
                        <button
                          key={date.value}
                          type="button"
                          onClick={() => setSelectedDate(date.value)}
                          className={`px-2 py-2 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-0.5 border ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#037166] to-[#04a99d] text-white border-[#037166] shadow-sm ring-2 ring-[#037166]/20'
                              : 'bg-gray-50 hover:bg-white text-gray-700 hover:text-gray-900 border-gray-200 hover:border-[#037166]/50'
                          }`}
                        >
                          <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {date.label.split(' ')[0]}
                          </span>
                          <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                            {date.label.split(' ').slice(1).join(' ') || date.value.slice(5)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Time Slot Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Choose Time Slot
                  </label>
                  {selectedTime && (
                    <span className="text-[11px] text-[#037166] font-semibold">
                      2-Hour Arrival Window
                    </span>
                  )}
                </div>

                {availableTimesForSelectedDate.length === 0 ? (
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center text-xs text-gray-500">
                    {selectedDate ? 'No time slots available for this date. Please pick another date.' : 'Please select a date above to view available time slots'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableTimesForSelectedDate.map((time) => {
                      const isSelected = selectedTime === time.value;
                      return (
                        <button
                          key={time.value}
                          type="button"
                          onClick={() => setSelectedTime(time.value)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white border-[#037166] shadow-sm ring-2 ring-[#037166]/20'
                              : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-[#037166]/50'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#037166]'}`} />
                            {time.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* 2. Technician Preference (Optional) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-4 sm:p-5"
            >
              <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-gray-100">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0f172a] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#037166]" />
                    <span>Technician Preference</span>
                    <span className="text-[11px] font-normal text-gray-400">(Optional)</span>
                  </h3>
                  <p className="text-[11px] text-gray-500">Choose who performs your appliance service</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { value: 'any', label: 'Any Available', sub: 'Fastest dispatch (Recommended)' },
                  { value: 'senior', label: 'Senior Technician', sub: '5+ yrs verified experience' },
                  { value: 'same', label: 'Same as Last Time', sub: 'Preferred technician' },
                ].map((option) => {
                  const isSelected = technicianPreference === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTechnicianPreference(option.value)}
                      className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#f0fbf9] border-[#037166] text-[#037166] ring-1 ring-[#037166]'
                          : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{option.label}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#037166] bg-[#037166]' : 'border-gray-300'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1">{option.sub}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* 3. Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-4 sm:p-5"
            >
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    3
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#0f172a] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#037166]" />
                      <span>Select Payment Method</span>
                    </h3>
                    <p className="text-[11px] text-gray-500">Pay platform booking fee securely</p>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Safe
                </span>
              </div>

              {(amcApplicable || amcEligibility?.limitExhausted) && (
                <div className="mb-3">
                  <AmcCoverageBanner
                    eligibility={amcEligibility}
                    compact
                    className="!mb-0"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* AMC Cover Card */}
                {amcApplicable && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('amc')}
                    className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between col-span-full ${
                      paymentMethod === 'amc'
                        ? 'bg-[#f0fbf9] border-[#037166] text-[#037166] ring-1 ring-[#037166]'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentMethod === 'amc' ? 'bg-[#037166] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900">Use AMC Cover</h4>
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            {amcEligibility?.benefitTitle
                              ? `${amcEligibility.benefitTitle} • ₹0 • No Gateway`
                              : '₹0 booking fee • Instant Confirmation'}
                          </span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'amc' ? 'border-[#037166] bg-[#037166]' : 'border-gray-300'}`}>
                        {paymentMethod === 'amc' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                )}

                {/* Online Payment Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('online')}
                  className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                    paymentMethod === 'online'
                      ? 'bg-[#f0fbf9] border-[#037166] text-[#037166] ring-1 ring-[#037166]'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentMethod === 'online' ? 'bg-[#037166] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900">Online Payment</h4>
                        <span className="text-[10px] text-emerald-600 font-semibold">Recommended • Instant Confirmation</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'online' ? 'border-[#037166] bg-[#037166]' : 'border-gray-300'}`}>
                      {paymentMethod === 'online' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium text-gray-700">UPI</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium text-gray-700">PhonePe</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium text-gray-700">GPay</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium text-gray-700">Cards</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium text-gray-700">NetBanking</span>
                  </div>
                </button>

                {/* Wallet Pay Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                    paymentMethod === 'wallet'
                      ? 'bg-[#f0fbf9] border-[#037166] text-[#037166] ring-1 ring-[#037166]'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentMethod === 'wallet' ? 'bg-[#037166] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900">D-Hub Wallet</h4>
                        <span className="text-[10px] text-gray-500">
                          Available: <strong className="text-gray-900 font-bold">₹{Number(walletBalance || 0).toFixed(2)}</strong>
                        </span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-[#037166] bg-[#037166]' : 'border-gray-300'}`}>
                      {paymentMethod === 'wallet' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 italic pt-2 border-t border-gray-100">
                    Pay directly using Doorstep Hub wallet balance
                  </p>
                </button>
              </div>

              {/* Active Wallet Details Box */}
              {paymentMethod === 'wallet' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-4 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-emerald-200 font-bold">D-Hub Active Wallet</span>
                      <p className="text-xl !text-white font-extrabold mt-0.5">₹{Number(walletBalance || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono tracking-widest text-emerald-100">
                        {walletData?.walletId ? `**** ${walletData.walletId.split('-').pop()}` : 'DH PAY'}
                      </span>
                      <span className="block text-[9px] text-emerald-200/80">Account Active</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2 text-[11px] text-emerald-100">
                    <Info className="w-3.5 h-3.5 text-emerald-200 flex-shrink-0" />
                    <span>Refer friends & family and earn cashback up to ₹99 credited after booking.</span>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* 4. Service Address */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-white border border-gray-200/90 shadow-xs p-4 sm:p-5"
            >
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    4
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#0f172a] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#037166]" />
                      <span>Service Address</span>
                    </h3>
                    <p className="text-[11px] text-gray-500">Technician will visit this location</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onChangeAddress || onBack || (() => router.push('/appliances/address'))}
                  className="text-xs font-bold text-[#037166] hover:text-[#025a51] hover:underline transition-colors"
                >
                  Change Address
                </button>
              </div>

              {(() => {
                if (!address) {
                  return (
                    <div className="p-3.5 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-center">
                      <p className="text-xs text-gray-500 mb-2">No service address selected</p>
                      <button
                        type="button"
                        onClick={onChangeAddress || onBack || (() => router.push('/appliances/address'))}
                        className="px-3 py-1.5 rounded-lg bg-[#037166] text-white text-xs font-semibold hover:bg-[#025a51] transition-all"
                      >
                        Select Address
                      </button>
                    </div>
                  );
                }

                const clean = (v) => (!v || String(v).trim().toUpperCase() === 'N/A' || String(v).trim().toUpperCase() === 'UNDEFINED' || String(v).trim().toUpperCase() === 'NULL' ? null : String(v).trim());

                const streetParts = [
                  clean(address.flat),
                  clean(address.area),
                  clean(address.addressLineOne),
                  clean(address.addressLineTwo),
                ].filter(Boolean);

                const seen = new Set();
                const uniqueStreet = streetParts.filter(s => {
                  const k = s.toLowerCase();
                  if (seen.has(k)) return false;
                  seen.add(k);
                  return true;
                });

                const regionParts = [
                  clean(address.cityName || address.city),
                  clean(address.stateName || address.state),
                  clean(address.postalCode || address.pincode),
                ].filter(Boolean);

                const addrType = clean(address.type)?.toLowerCase();

                return (
                  <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-gray-200/80">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-1.5 font-bold text-[#0f172a] text-sm">
                        {addrType === 'home' ? (
                          <Home className="w-3.5 h-3.5 text-[#037166]" />
                        ) : addrType === 'office' ? (
                          <Briefcase className="w-3.5 h-3.5 text-[#037166]" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-[#037166]" />
                        )}
                        <span>{clean(address.name) || clean(address.userName) || 'Customer'}</span>
                      </div>
                      {clean(address.type) && (
                        <span className="px-2 py-0.5 rounded-full bg-[#037166]/10 text-[#037166] text-[10px] font-bold uppercase tracking-wider">
                          {clean(address.type)}
                        </span>
                      )}
                      {address.defaultAddress && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    {clean(address.phone) && (
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Phone: <span className="font-semibold text-gray-900">{clean(address.phone)}</span>
                      </p>
                    )}

                    {uniqueStreet.length > 0 ? (
                      <p className="text-xs text-gray-700 leading-relaxed font-normal">
                        {uniqueStreet.join(', ')}
                      </p>
                    ) : clean(address.address) ? (
                      <p className="text-xs text-gray-700 leading-relaxed font-normal">
                        {clean(address.address)}
                      </p>
                    ) : null}

                    {regionParts.length > 0 && (
                      <p className="text-xs font-medium text-gray-500 mt-0.5">
                        {regionParts.join(', ')}
                      </p>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </div>

          {/* Right Column: Booking Summary Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-28 space-y-3.5">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-2xl bg-white border border-gray-200/90 shadow-sm p-4 sm:p-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">Booking Summary</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {cartItems.length} {cartItems.length === 1 ? 'service' : 'services'}
                  </span>
                </div>

                {/* Items list */}
                <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1 my-1.5">
                  {cartItems.map((item, idx) => (
                    <div key={item.id || item._id || idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate leading-snug">{item.serviceName || item.packageName || item.title || 'Professional Service'}</h4>
                        {(item.packageName || item.title) && (
                          <span className="inline-block text-[10px] text-[#037166] font-semibold uppercase tracking-wider mt-0.5">
                            {item.packageName || item.title}
                          </span>
                        )}
                        {item.price && (
                          <p className="text-gray-400 text-[10px] flex items-center gap-1 mt-1">
                            <Info className="w-3 h-3 text-gray-400" />
                            Rates approx. from ₹{item.price}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-gray-600">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">Platform Fee</span>
                      <span className="text-[10px] text-gray-400">
                        {amcApplies ? 'Covered by AMC' : 'Pay Online Now'}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {amcApplies ? (
                        <>
                          <span className="line-through text-gray-400 font-medium mr-1">₹{rawBookingCost}</span>
                          <span className="text-emerald-700">₹0</span>
                        </>
                      ) : (
                        `₹${bookingCost}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">Doorstep Inspection Fee</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        {amcApplies ? 'Covered by AMC' : 'Pay at doorstep to technician'}
                      </span>
                    </div>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {amcApplies ? (
                        <>
                          <span className="line-through text-gray-400 font-medium mr-1">₹{inspectionCost}</span>
                          <span>₹0</span>
                        </>
                      ) : (
                        `₹${inspectionCost}`
                      )}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f1faf8] border border-[#cde9e4] text-[10px] text-[#475569] leading-relaxed">
                    {amcApplies ? (
                      <p>
                        AMC cover selected — booking fee is ₹0 (no payment gateway). Spare parts may be extra as per plan terms.
                      </p>
                    ) : amcApplicable ? (
                      <p>
                        AMC is available for this service. Choose <span className="text-[#037166] font-bold">Use AMC cover</span> for ₹0, or pay normally.
                      </p>
                    ) : (
                      <p>
                        Only the <span className="text-[#037166] font-bold">Platform Fee</span> is charged now to confirm your booking. Final service charges will be shared after on-site inspection.
                      </p>
                    )}
                  </div>
                </div>

                {/* Total Payable Now */}
                <div className="mt-3 pt-3 border-t-2 border-dashed border-gray-200">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Payable Now Online</span>
                      <h3 className="text-2xl font-black text-gray-900 leading-tight">₹{total}</h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                      {amcApplies ? 'Covered by AMC' : 'All Inclusive'}
                    </span>
                  </div>
                  {!amcApplies && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      *Inspection fee of ₹{inspectionCost} will be collected after on-site inspection.
                    </p>
                  )}
                </div>

                {/* Scheduled Slot Chip */}
                {selectedDate && selectedTime && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      {availableDates.find(d => d.value === selectedDate)?.label} • {availableTimesForSelectedDate.find(t => t.value === selectedTime)?.label}
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-emerald-200/60 px-1.5 py-0.5 rounded text-emerald-800">Selected</span>
                  </div>
                )}

                {/* Primary Action Button */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isConfirming || !selectedDate || !selectedTime}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-sm ${
                      isConfirming || !selectedDate || !selectedTime
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#037166] to-[#04a99d] hover:from-[#025a51] hover:to-[#038e83] text-white hover:shadow-md hover:shadow-[#037166]/20 active:scale-[0.99]'
                    }`}
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming Booking...</span>
                      </>
                    ) : !selectedDate || !selectedTime ? (
                      <span>Select Date & Time Slot Above</span>
                    ) : amcApplies ? (
                      <>
                        <span>Confirm AMC Booking (₹0)</span>
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </>
                    ) : (
                      <>
                        <span>Confirm & Pay ₹{total}</span>
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[#6b7280] text-[10px] text-center mt-3">
                  By booking, you agree to our Terms & Cancellation Policy.
                </p>

                {/* Trust and Policy micro-strip */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-3 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Safe Checkout</span>
                  </span>
                  <span>•</span>
                  <span>Verified Pros</span>
                  <span>•</span>
                  <span>RBI Compliant</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Mismatch Alert Modal */}
      <AnimatePresence>
        {locationMismatch && (
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
                  <span className="font-bold text-gray-900 text-right">{locationMismatch.userCity}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-gray-500 font-semibold">Selected Provider:</span>
                  <span className="font-bold text-amber-800 text-right">
                    {locationMismatch.providerName} ({locationMismatch.providerCity})
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Your service address is in <strong className="text-gray-900">{locationMismatch.userCity}</strong>, but the selected provider is located in <strong className="text-gray-900">{locationMismatch.providerCity}</strong>. This provider is unable to provide service at your location.
                <br /><br />
                Kindly select a provider at your location, or choose an address in <strong className="text-gray-900">{locationMismatch.providerCity}</strong>.
              </p>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setLocationMismatch(null);
                    router.push('/appliances');
                  }}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#037166] to-[#04a99d] hover:brightness-105 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Select Provider in {locationMismatch.userCity}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLocationMismatch(null);
                    if (onBack) onBack();
                  }}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-center"
                >
                  Choose Another Address
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
