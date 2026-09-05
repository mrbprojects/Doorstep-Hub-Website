'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, Calendar, Clock, Loader2, MapPin, Package, Phone, User,
    CheckCircle, CreditCard, IndianRupee, Tag, Layers, Building2, Receipt,
    ChevronDown, ChevronUp, AlertCircle, Home, Hash, Headphones, XCircle,
    AlertTriangle, Wallet, ShieldAlert, X
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
    fetchOrderDetail,
    resolveMediaUrl,
    cancelBookingService,
    fetchWalletBalance,
    initiateCancellationFeePayment,
    reinitiateServiceBookingPayment,
    payPlatformFee
} from '@/lib/accountApi';
import { getStatusLabel, getStatusStyle, resolveEffectiveOrderStatus } from '@/lib/orderStatus';

const CANCELLATION_REASONS = [
    'Change of plans / Schedule conflict',
    'Provider delayed or not reachable',
    'Found alternative service provider',
    'Booked by mistake / duplicate booking',
    'Pricing or quotation concern',
    'Other reason'
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function resolveServices(order = {}) {
    // Prefer selectedServiceRates (most detailed)
    if (Array.isArray(order.selectedServiceRates) && order.selectedServiceRates.length > 0) {
        return order.selectedServiceRates.map((rate) => ({
            name: rate.name || 'Service',
            price: rate.price ?? null,
            quantity: rate.quantity || 1,
            image: '',
        }));
    }
    if (Array.isArray(order.services) && order.services.length > 0) {
        return order.services.map((service) => ({
            name: service.name || service.serviceName || 'Service',
            image: service.image || service.serviceImage || service.mainImage || '',
            price: service.price ?? service.servicePrice ?? service.defaultPrice ?? null,
            quantity: service.quantity || 1,
        }));
    }
    const rootName = order.firstServiceName || order.subcategoryName || order.serviceName || order.categoryName;
    if (rootName) {
        return [{
            name: rootName,
            image: order.firstServiceImage || order.serviceImage || '',
            price: null,
            quantity: 1,
        }];
    }
    return [];
}

function resolveAddress(order = {}) {
    const address = order.address || order.serviceAddressId;
    if (!address || typeof address !== 'object') return null;

    return {
        name: address.name || address.recipientName || address.customerName || '',
        type: address.type || address.addressType || '',
        phone: address.phone || address.mobileNumber || '',
        flat: address.flat || '',
        area: address.area || address.addressLineOne || '',
        lineTwo: address.addressLineTwo || '',
        city: address.cityName?.name || address.cityName || '',
        state: address.stateName?.name || address.stateName || '',
        pincode: address.postalCode || address.pinCode || '',
        fullAddress: address.fullAddress || '',
    };
}

function fmtAmount(val) {
    const n = Number(val);
    if (isNaN(n)) return '—';
    return '₹' + n.toFixed(0);
}

function fmtDate(dateStr) {
    if (!dateStr || dateStr === 'N/A') return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
    }
    return dateStr;
}

const TIME_SLOT_LABELS = {
    '09:00': '09:00 AM - 11:00 AM',
    '11:00': '11:00 AM - 01:00 PM',
    '13:00': '01:00 PM - 03:00 PM',
    '15:00': '03:00 PM - 05:00 PM',
    '17:00': '05:00 PM - 07:00 PM',
    '19:00': '07:00 PM - 09:00 PM',
};

function fmtTime(timeStr) {
    if (!timeStr || timeStr === 'N/A') return null;
    const clean = String(timeStr).trim();
    if (TIME_SLOT_LABELS[clean]) return TIME_SLOT_LABELS[clean];
    if (clean.includes('-')) return clean;

    const match = clean.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
        const hour = parseInt(match[1], 10);
        const nextHour = (hour + 2) % 24;
        const fmtHour = (h) => {
            const period = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 === 0 ? 12 : h % 12;
            return `${String(h12).padStart(2, '0')}:00 ${period}`;
        };
        return `${fmtHour(hour)} - ${fmtHour(nextHour)}`;
    }
    return clean;
}

const PAYMENT_METHOD_LABELS = {
    ONLINE: 'Online Payment',
    WALLET: 'Wallet',
    COD: 'Cash on Delivery',
    AMC: 'AMC Plan',
    cash: 'Cash',
};

// ─── Order Tracking Timeline ────────────────────────────────────────────────

function OrderTrackingTimeline({ status = 'pending', history = [], isPlatformFeePending = false }) {
    const [expanded, setExpanded] = useState(false);
    const isCancelled = ['cancelledByUser', 'cancelledByProvider', 'rejectedByProvider', 'missed'].includes(status);

    // Calculate active step index (0 to 4)
    let currentStep = 0;
    if (status === 'payment_pending' || isPlatformFeePending) {
        currentStep = 0;
    } else if (status === 'pending') {
        currentStep = 1;
    } else if (['orderAcceptedByAdmin', 'orderAccpetedByAdmin', 'orderAcceptedBySystem', 'assignToProvider', 'acceptedByProvider', 'appointmentConfirmedByProvider'].includes(status)) {
        currentStep = 2;
    } else if (['onTheWay', 'reachedLocation', 'workInProgress', 'sendQuotation', 'quotationAccepted', 'paymentRequested', 'paymentReceived'].includes(status)) {
        currentStep = 3;
    } else if (['workIsCompleted', 'completed', 'Closed', 'closed', 'serviceCompleted', 'workCompleted'].includes(status)) {
        currentStep = 4;
    }

    const steps = [
        { title: 'Order Placed', desc: (status === 'payment_pending' || isPlatformFeePending) ? 'Fee pending' : 'Request logged' },
        { title: 'Booking Confirmed', desc: 'Platform fee verified' },
        { title: 'Partner Assigned', desc: 'Service partner confirmed' },
        { title: 'In Progress', desc: 'Doorstep service ongoing' },
        { title: 'Completed', desc: 'Finished & verified' },
    ];

    const safeHistory = history && history.length > 0 ? history : [
        {
            status: status || 'pending',
            statusTextMessage: (status === 'payment_pending' || isPlatformFeePending)
                ? 'Booking Created - Platform Fee (₹99) Pending'
                : 'Booking Placed & Confirmed',
            logCreatedDate: new Date().toISOString()
        }
    ];

    const shownHistory = expanded ? safeHistory : safeHistory.slice(-3);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#037166]" />
                    Order Tracking
                </h2>
                <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${getStatusStyle(status)}`}>
                    {getStatusLabel(status)}
                </span>
            </div>

            {/* Stepper Progress */}
            {isCancelled ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-red-800">Booking Cancelled</p>
                        <p className="text-xs text-red-600">This service booking has been cancelled ({getStatusLabel(status)}).</p>
                    </div>
                </div>
            ) : (
                <div className="py-2">
                    <div className="grid grid-cols-5 relative">
                        {/* Connecting track line */}
                        <div className="absolute top-4 left-[10%] right-[10%] h-1 bg-gray-200 -z-0">
                            <div
                                className="h-full bg-[#037166] transition-all duration-500"
                                style={{ width: `${(Math.min(currentStep, 4) / 4) * 100}%` }}
                            />
                        </div>

                        {steps.map((step, idx) => {
                            const isDone = currentStep > idx;
                            const isCurrent = currentStep === idx;
                            return (
                                <div key={idx} className="flex flex-col items-center text-center relative z-10">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                            isDone
                                                ? 'bg-[#037166] text-white'
                                                : isCurrent
                                                ? 'bg-white border-2 border-[#037166] text-[#037166] shadow-md ring-4 ring-[#037166]/20'
                                                : 'bg-gray-100 border-2 border-gray-200 text-gray-400'
                                        }`}
                                    >
                                        {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                                    </div>
                                    <p className={`text-xs font-bold mt-2 ${isCurrent ? 'text-[#037166]' : isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {step.title}
                                    </p>
                                    <p className="text-[10px] text-gray-400 hidden sm:block mt-0.5 max-w-[90px]">
                                        {step.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Detailed history log */}
            {safeHistory && safeHistory.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-700">Detailed Activity Log</span>
                        {safeHistory.length > 3 && (
                            <button
                                onClick={() => setExpanded(e => !e)}
                                className="text-xs text-[#037166] font-semibold flex items-center gap-1 hover:underline"
                            >
                                {expanded ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Show all ({safeHistory.length})</>}
                            </button>
                        )}
                    </div>
                    <ol className="relative border-l-2 border-[#037166]/20 ml-2 space-y-3">
                        {shownHistory.map((h, idx) => (
                            <li key={idx} className="ml-5 relative">
                                <div className="absolute -left-[22px] w-3.5 h-3.5 rounded-full bg-[#037166] border-2 border-white shadow-sm top-0.5" />
                                <p className="text-xs font-semibold text-gray-800">{getStatusLabel(h.status) || h.status}</p>
                                {h.statusTextMessage && h.statusTextMessage !== `Status updated to ${h.status}` && (
                                    <p className="text-[10px] text-gray-500 mt-0.5">{h.statusTextMessage}</p>
                                )}
                                {h.logCreatedDate && (
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        {new Date(h.logCreatedDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BookingDetailPage() {
    const params = useParams();
    const bookingId = params?.bookingId;
    const { token, loading: authLoading } = useAuth();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Platform Fee Payment Modal State
    const [payFeeModalOpen, setPayFeeModalOpen] = useState(false);
    const [payFeeMethod, setPayFeeMethod] = useState('ONLINE'); // 'ONLINE' | 'WALLET'
    const [payFeeLoading, setPayFeeLoading] = useState(false);

    const handleOpenPayFeeModal = async () => {
        setPayFeeModalOpen(true);
        if (token) {
            try {
                setWalletLoading(true);
                const res = await fetchWalletBalance(token);
                if (res?.success) setWalletBalance(res?.data?.balance ?? res?.balance ?? 0);
            } catch (_) {}
            finally { setWalletLoading(false); }
        }
    };

    const handleExecutePlatformFeePayment = async () => {
        if (!token || !bookingId) return;
        setPayFeeLoading(true);
        try {
            if (payFeeMethod === 'WALLET') {
                const res = await payPlatformFee(token, bookingId, { paymentMethod: 'WALLET' });
                if (res?.success) {
                    toast.success(res?.message || 'Platform fee paid successfully via D-Hub Wallet! Booking confirmed.');
                    setPayFeeModalOpen(false);
                    const updated = await fetchOrderDetail(token, bookingId);
                    setOrder(updated);
                } else {
                    toast.error(res?.message || 'Failed to pay platform fee via Wallet.');
                }
            } else {
                const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
                const res = await payPlatformFee(token, bookingId, {
                    paymentMethod: 'ONLINE',
                    websiteReturnUrl: currentUrl,
                    websiteCancelUrl: currentUrl
                });
                if (res?.success && (res?.access_key || res?.paymentUrl)) {
                    toast.loading('Redirecting to payment gateway...');
                    window.location.href = res.paymentUrl || `https://pay.easebuzz.in/pay/${res.access_key}`;
                } else {
                    const fallbackRes = await reinitiateServiceBookingPayment(token, bookingId);
                    if (fallbackRes?.success && fallbackRes?.access_key) {
                        toast.loading('Redirecting to payment gateway...');
                        window.location.href = `https://pay.easebuzz.in/pay/${fallbackRes.access_key}`;
                    } else {
                        toast.error(res?.message || fallbackRes?.message || 'Failed to initiate payment.');
                    }
                }
            }
        } catch (e) {
            console.error('Pay platform fee error:', e);
            toast.error(e.message || 'Payment initiation failed. Please try again.');
        } finally {
            setPayFeeLoading(false);
        }
    };

    // ── Cancellation state ─────────────────────────────────────────────────
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    // step: 'reason' | 'fee_ack' | 'pay_choice' | 'processing'
    const [cancelStep, setCancelStep] = useState('reason');
    const [cancelReason, setCancelReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(null);
    const [walletLoading, setWalletLoading] = useState(false);

    const openCancelModal = async () => {
        setCancelStep('reason');
        setCancelReason('');
        setCustomReason('');
        setCancelModalOpen(true);
        // Pre-fetch wallet balance silently
        if (token) {
            setWalletLoading(true);
            try {
                const wb = await fetchWalletBalance(token);
                setWalletBalance(Number(wb?.balance ?? wb?.currentBalance ?? wb?.data?.currentBalance ?? 0));
            } catch { setWalletBalance(null); }
            finally { setWalletLoading(false); }
        }
    };

    const handleCancelNext = () => {
        const finalReason = cancelReason === 'Other reason' ? customReason.trim() : cancelReason;
        if (!finalReason) { toast.error('Please select or enter a reason'); return; }
        if (isPaidOnline) {
            setCancelStep('fee_ack');
        } else {
            setCancelStep('pay_choice');
        }
    };

    const doCancel = async (paymentOption) => {
        const finalReason = cancelReason === 'Other reason' ? customReason.trim() : cancelReason;
        setCancelLoading(true);
        try {
            const res = await cancelBookingService(token, bookingId, { cancelledReason: finalReason, paymentOption });
            if (res?.success) {
                toast.success(res.message || 'Booking cancelled successfully');
                setCancelModalOpen(false);
                loadOrder();
            } else if (res?.requiresFeePayment) {
                // Should not reach here via UI but handle gracefully
                setCancelStep('pay_choice');
                toast.error(res.message || 'Platform fee required');
            } else if (res?.code === 'INSUFFICIENT_WALLET') {
                toast.error(res.message || 'Insufficient wallet balance');
                setWalletBalance(Number(res.available ?? 0));
            } else {
                toast.error(res?.message || 'Failed to cancel booking');
            }
        } catch (e) {
            toast.error('Failed to cancel booking. Please try again.');
        } finally {
            setCancelLoading(false);
        }
    };

    const doInitiateGatewayPayment = async () => {
        const finalReason = cancelReason === 'Other reason' ? customReason.trim() : cancelReason;
        setCancelLoading(true);
        try {
            try { sessionStorage.setItem(`cancel_reason_${bookingId}`, finalReason); } catch (_) {}
            const res = await initiateCancellationFeePayment(token, bookingId, {
                cancelledReason: finalReason,
                websiteReturnUrl: `${window.location.origin}/account/bookings/${bookingId}?cancelled=gateway_paid`,
                websiteCancelUrl: `${window.location.origin}/account/bookings/${bookingId}`,
            });
            if (res?.success && res?.access_key) {
                window.location.href = `https://pay.easebuzz.in/pay/${res.access_key}`;
            } else {
                toast.error(res?.message || 'Failed to initiate payment. Please try again.');
            }
        } catch (e) {
            toast.error('Failed to initiate payment. Please try again.');
        } finally {
            setCancelLoading(false);
        }
    };

    const loadOrder = useCallback(async () => {
        if (!token || !bookingId) return;
        setLoading(true);
        setError('');
        try {
            const data = await fetchOrderDetail(token, bookingId);
            setOrder(data);
        } catch (e) {
            console.error('Failed to load booking detail:', e);
            setError(e?.message || 'Failed to load booking details');
            setOrder(null);
        } finally {
            setLoading(false);
        }
    }, [token, bookingId]);

    useEffect(() => {
        if (authLoading) return;
        if (!token) { setLoading(false); return; }
        loadOrder();
    }, [authLoading, token, loadOrder]);

    // Handle gateway_paid callback from Easebuzz redirect
    const searchParamsLocal = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    useEffect(() => {
        if (searchParamsLocal?.get('cancelled') === 'gateway_paid' && token && bookingId) {
            const finalReason = sessionStorage.getItem(`cancel_reason_${bookingId}`) || 'Cancelled by user';
            cancelBookingService(token, bookingId, { cancelledReason: finalReason, paymentOption: 'gateway_paid' })
                .then(res => {
                    if (res?.success) {
                        toast.success('Booking cancelled after payment.');
                        loadOrder();
                    }
                })
                .catch(() => {});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const status = order ? resolveEffectiveOrderStatus(order) : 'pending';
    const services = order ? resolveServices(order) : [];
    const addressObj = order ? resolveAddress(order) : null;

    const providerName =
        order?.providerName ||
        order?.provider?.name ||
        order?.provider?.providerName ||
        order?.serviceProviderName ||
        (order?.providerId?.firstName
            ? `${order.providerId.firstName || ''} ${order.providerId.lastName || ''}`.trim()
            : order?.providerId?.businessName) ||
        null;

    const providerPhone = order?.providerPhone || order?.provider?.phone || null;
    const providerType = order?.partnerType || order?.typeProvider || null;

    // Fee breakdown
    const estimation = order?.estimation || order?.latestEstimation || null;
    const servicesSubtotal = estimation?.baseAmount ??
        (services.reduce((acc, s) => acc + (s.price != null ? Number(s.price) * (s.quantity || 1) : 0), 0) || null);
    const gstAmount = estimation?.gstAmount ?? order?.gstAmount ?? null;

    // Platform Fee vs Consultation/Inspection Fee resolution:
    // In Service Center / prepaid flows, the customer pays the full amount online.
    // The ₹99 charge is the Platform Fee (which can be in order.platformFee or order.consultationFee).
    const rawPlatform = Number(order?.platformFee || 0);
    const rawConsultation = Number(order?.consultationFee || 0);
    const paymentStatus = order?.paymentStatus || null;
    const paymentMethod = order?.paymentMethod || null;

    const isPaymentCompleted = ['paid', 'completed'].includes(String(paymentStatus || '').toLowerCase());
    const isPaidOnline = isPaymentCompleted;
    const isServiceCenter = order?.partnerType === 'Service Center' ||
        order?.providerType === 'Service Center' ||
        order?.typeProvider === 'provider' ||
        order?.orderType === 'regular';

    let platformFee = rawPlatform > 0 ? rawPlatform : null;
    let consultationFee = null;

    if (!platformFee && rawConsultation > 0) {
        // The fee (e.g. ₹99) is the Platform Fee
        platformFee = rawConsultation;
    } else if (platformFee && rawConsultation > 0) {
        // Only consider consultation fee if not already paid in full / not service center flow
        if (!isPaidOnline && !isServiceCenter && String(paymentMethod || '').toUpperCase() === 'COD') {
            consultationFee = rawConsultation;
        }
    }

    const couponDiscount = estimation?.couponDiscountAmount ?? order?.couponDiscountAmount ?? null;
    const grandTotal = estimation?.grandTotal ?? order?.totalAmount ?? null;

    // Fallback: If platformFee is still null, but grandTotal = subtotal + gst + diff
    if (!platformFee && grandTotal != null && servicesSubtotal != null) {
        const diff = Math.round(Number(grandTotal) - Number(servicesSubtotal) - Number(gstAmount || 0) + Number(couponDiscount || 0));
        if (diff > 0 && diff <= 500) {
            platformFee = diff;
        }
    }
    const advancePaid = estimation?.advancePaid ?? order?.partialAmountPaid ?? null;
    const totalPaid = estimation?.totalPaid ?? null;
    const pendingAmount = estimation?.pendingAmount ?? null;

    const platformFeePendingAmount = Number(order?.totalAmount || order?.amount || platformFee || 99);
    const isPlatformFeePending = Boolean(order?.isPlatformFeePending) || (!isPaymentCompleted &&
        !['cancelledByUser', 'cancelledByProvider', 'cancelled', 'workIsCompleted', 'completed', 'closed'].includes(String(order?.status || '')) &&
        (String(paymentStatus || '').toLowerCase() === 'pending' || ['pending', 'payment_pending', 'missed'].includes(String(order?.status || '').toLowerCase())));

    const orderId = order?.orderId || '';
    const bookedDate = fmtDate(order?.bookedDate);
    const bookedTime = fmtTime(order?.bookedTime);
    const customerPhone = order?.mobileNumber || order?.userPhone || order?.phone || null;
    const statusHistory = order?.statusHistory || [];
    const createdAt = order?.createdAt || order?.logCreatedDate || null;

    const categoryName = order?.categoryName || order?.subcategoryName || null;

    // Statuses that allow cancellation
    const TERMINAL_STATUSES = ['cancelledByUser', 'cancelledByProvider', 'workIsCompleted', 'completed', 'Closed', 'closed', 'serviceCompleted', 'workCompleted'];
    const canCancel = order && !TERMINAL_STATUSES.includes(status);

    return (
        <div className="space-y-4">
            {/* Back Link */}
            <Link
                href="/account/bookings"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#037166] hover:underline"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to My Bookings
            </Link>

            {loading || authLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            ) : !order ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900">Booking not found</h3>
                </div>
            ) : (
                <div className="space-y-4">

                    {/* ── Pending Platform Fee Banner ─────────────────── */}
                    {isPlatformFeePending && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-base font-bold text-amber-950">Platform Fee Payment Pending</h3>
                                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">Action Required</span>
                                        </div>
                                        <p className="text-sm text-amber-900 mt-1 leading-relaxed">
                                            Your booking request is created, but the platform fee of <span className="font-extrabold text-amber-950">₹{platformFeePendingAmount}</span> has not been received yet. Complete payment now to confirm your appointment and assign our nearest verified expert technician.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleOpenPayFeeModal}
                                    disabled={payFeeLoading}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#037166] text-white font-bold text-sm shadow-md hover:bg-[#025c53] active:scale-95 transition-all disabled:opacity-60 flex-shrink-0"
                                >
                                    {payFeeLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-4 h-4" />
                                            Pay Platform Fee (₹{platformFeePendingAmount})
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Header Card ─────────────────────────────────────── */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                            <div>
                                <h1 className="text-xl font-extrabold text-gray-900">Booking Details</h1>
                                {orderId && (
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Hash className="w-3.5 h-3.5 text-[#037166]" />
                                        <span className="text-xs font-mono font-bold text-[#037166]">{orderId}</span>
                                    </div>
                                )}
                                {createdAt && (
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        Booked on {new Date(createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                    </p>
                                )}
                            </div>
                            <span className={`text-[11px] font-bold uppercase px-3 py-1 rounded-full ${getStatusStyle(status)}`}>
                                {getStatusLabel(status)}
                            </span>
                        </div>

                        {/* Key Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {bookedDate && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-[#037166]/10 flex items-center justify-center text-[#037166] flex-shrink-0">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</p>
                                        <p className="text-sm font-bold text-gray-900">{bookedDate}</p>
                                    </div>
                                </div>
                            )}
                            {bookedTime && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-[#037166]/10 flex items-center justify-center text-[#037166] flex-shrink-0">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Time Slot</p>
                                        <p className="text-sm font-bold text-gray-900">{bookedTime}</p>
                                    </div>
                                </div>
                            )}
                            {customerPhone && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-[#037166]/10 flex items-center justify-center text-[#037166] flex-shrink-0">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact</p>
                                        <p className="text-sm font-bold text-gray-900">{customerPhone}</p>
                                    </div>
                                </div>
                            )}
                            {categoryName && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-[#037166]/10 flex items-center justify-center text-[#037166] flex-shrink-0">
                                        <Tag className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</p>
                                        <p className="text-sm font-bold text-gray-900">{categoryName}</p>
                                    </div>
                                </div>
                            )}
                            {paymentMethod && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-[#037166]/10 flex items-center justify-center text-[#037166] flex-shrink-0">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment Method</p>
                                        <p className="text-sm font-bold text-gray-900">{PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod}</p>
                                    </div>
                                </div>
                            )}
                            {paymentStatus && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        ['paid', 'completed'].includes(paymentStatus) ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment Status</p>
                                        <p className={`text-sm font-bold capitalize ${
                                            ['paid', 'completed'].includes(paymentStatus) ? 'text-green-700' : 'text-amber-700'
                                        }`}>{paymentStatus}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Two-Column Layout for larger screens ────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                        {/* Left Column: Services + Charges */}
                        <div className="lg:col-span-7 space-y-4">

                            {/* Services Booked */}
                            {services.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Package className="w-4 h-4 text-[#037166]" />
                                        Services Booked
                                    </h2>
                                    <div className="divide-y divide-gray-100">
                                        {services.map((service, idx) => {
                                            const imageUrl = service.image ? resolveMediaUrl(service.image) : null;
                                            const lineTotal = service.price != null ? Number(service.price) * (service.quantity || 1) : null;
                                            return (
                                                <div key={idx} className="flex gap-3 items-center py-3 first:pt-0 last:pb-0">
                                                    <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                        {imageUrl ? (
                                                            <img src={imageUrl} alt={service.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="w-5 h-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 leading-snug">{service.name}</p>
                                                        {service.quantity > 1 && (
                                                            <p className="text-xs text-gray-500 mt-0.5">Qty: {service.quantity}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        {service.price != null ? (
                                                            <p className="text-sm font-bold text-gray-900">{fmtAmount(lineTotal ?? service.price)}</p>
                                                        ) : (
                                                            <p className="text-xs text-gray-400 italic">At doorstep</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Bill / Rate Breakdown */}
                            {(servicesSubtotal != null || gstAmount != null || platformFee != null || grandTotal != null) && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Receipt className="w-4 h-4 text-[#037166]" />
                                        Bill Summary
                                    </h2>

                                    <div className="space-y-2 text-sm">
                                        {servicesSubtotal != null && servicesSubtotal > 0 && (
                                            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                                                <span className="text-gray-600">Services Subtotal</span>
                                                <span className="font-semibold text-gray-900">{fmtAmount(servicesSubtotal)}</span>
                                            </div>
                                        )}
                                        {gstAmount != null && Number(gstAmount) > 0 && (
                                            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                                                <span className="text-gray-600">GST (18%)</span>
                                                <span className="font-semibold text-gray-900">{fmtAmount(gstAmount)}</span>
                                            </div>
                                        )}
                                        {platformFee != null && Number(platformFee) > 0 && (
                                            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                                                <span className="text-gray-600">Platform Fee</span>
                                                <span className="font-semibold text-gray-900">{fmtAmount(platformFee)}</span>
                                            </div>
                                        )}
                                        {consultationFee != null && Number(consultationFee) > 0 && (
                                            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                                                <div>
                                                    <span className="text-gray-600">Doorstep Inspection Fee</span>
                                                    <span className="ml-1.5 text-[10px] text-[#037166] bg-[#037166]/10 px-1.5 py-0.5 rounded-full">Pay at doorstep</span>
                                                </div>
                                                <span className="font-semibold text-gray-900">{fmtAmount(consultationFee)}</span>
                                            </div>
                                        )}
                                        {couponDiscount != null && Number(couponDiscount) > 0 && (
                                            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                                                <div className="flex items-center gap-1.5">
                                                    <Tag className="w-3.5 h-3.5 text-green-600" />
                                                    <span className="text-green-600">Coupon Discount</span>
                                                </div>
                                                <span className="font-semibold text-green-600">-{fmtAmount(couponDiscount)}</span>
                                            </div>
                                        )}

                                        {/* Grand Total */}
                                        {grandTotal != null && (
                                            <div className="flex items-center justify-between pt-2.5 mt-1">
                                                <span className="font-extrabold text-gray-900">Grand Total</span>
                                                <span className="text-lg font-extrabold text-[#037166]">{fmtAmount(grandTotal)}</span>
                                            </div>
                                        )}

                                        {/* Payment Breakdown */}
                                        {(advancePaid != null && Number(advancePaid) > 0) && (
                                            <div className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-2">
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Payment Breakdown</p>
                                                {Number(advancePaid) > 0 && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Advance Paid</span>
                                                        <span className="font-semibold text-green-700">{fmtAmount(advancePaid)}</span>
                                                    </div>
                                                )}
                                                {totalPaid != null && Number(totalPaid) > Number(advancePaid) && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Total Paid</span>
                                                        <span className="font-semibold text-green-700">{fmtAmount(totalPaid)}</span>
                                                    </div>
                                                )}
                                                {pendingAmount != null && Number(pendingAmount) > 0 && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Pending Amount</span>
                                                        <span className="font-semibold text-amber-700">{fmtAmount(pendingAmount)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Order Tracking & Status History */}
                            <OrderTrackingTimeline status={status} history={statusHistory} isPlatformFeePending={isPlatformFeePending} />
                        </div>

                        {/* Right Column: Service Address + Provider Info */}
                        <div className="lg:col-span-5 space-y-4">

                            {/* Service Address */}
                            {addressObj && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Home className="w-4 h-4 text-[#037166]" />
                                        Service Address
                                    </h2>
                                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-2">
                                        {(addressObj.name || addressObj.type) && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {addressObj.name && (
                                                    <p className="text-sm font-bold text-gray-900">{addressObj.name}</p>
                                                )}
                                                {addressObj.type && (
                                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#037166]/10 text-[#037166]">
                                                        {addressObj.type}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {addressObj.phone && (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                {addressObj.phone}
                                            </div>
                                        )}
                                        <div className="flex items-start gap-1.5 text-xs text-gray-700 leading-relaxed">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <span>
                                                {[
                                                    addressObj.flat,
                                                    addressObj.area,
                                                    addressObj.lineTwo,
                                                    [addressObj.city, addressObj.state].filter(Boolean).join(', '),
                                                    addressObj.pincode,
                                                ].filter(Boolean).join(', ') || addressObj.fullAddress || 'Address on file'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Provider Info */}
                            {(providerName || providerPhone || providerType) && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-[#037166]" />
                                        Service Provider
                                    </h2>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#037166]/10 flex items-center justify-center text-[#037166] flex-shrink-0">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {providerName && (
                                                <p className="text-sm font-bold text-gray-900">{providerName}</p>
                                            )}
                                            {providerType && (
                                                <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#037166]/10 text-[#037166] mt-0.5">
                                                    {providerType}
                                                </span>
                                            )}
                                            {providerPhone && (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1.5">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    {providerPhone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quick Booking ID Card */}
                            {orderId && (
                                <div className="bg-gradient-to-br from-[#037166] to-[#04a99d] rounded-2xl p-4 text-white">
                                    <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">Booking Reference</p>
                                    <p className="text-base font-mono font-extrabold tracking-wide">{orderId}</p>
                                    <p className="text-[10px] text-white/60 mt-1">Share this ID with our support team for faster assistance.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Action Buttons ─────────────────────────────────── */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                        <h2 className="font-bold text-gray-900 text-sm">Need Help?</h2>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Pay Platform Fee (if pending) */}
                            {isPlatformFeePending && (
                                <button
                                    onClick={handleOpenPayFeeModal}
                                    disabled={payFeeLoading}
                                    className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[#037166] text-white font-bold text-sm hover:bg-[#025c53] shadow-sm transition-all disabled:opacity-60"
                                >
                                    {payFeeLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-4 h-4" />
                                            Pay Platform Fee (₹{platformFeePendingAmount})
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Contact Support */}
                            <a
                                href={`/account/support/new?bookingId=${encodeURIComponent(orderId || '')}&bookingDbId=${encodeURIComponent(bookingId || '')}&category=booking`}
                                className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 border-[#037166] text-[#037166] font-bold text-sm hover:bg-[#037166]/5 transition-all"
                            >
                                <Headphones className="w-4 h-4" />
                                Contact Customer Support
                            </a>

                            {/* Cancel Service */}
                            {canCancel && (
                                <button
                                    onClick={openCancelModal}
                                    className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 border-red-400 text-red-600 font-bold text-sm hover:bg-red-50 transition-all"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Cancel My Service
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Cancellation Modal ─────────────────────────────────────── */}
            {cancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => !cancelLoading && setCancelModalOpen(false)}
                    />
                    <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-500" />
                                <span className="font-bold text-gray-900">
                                    {cancelStep === 'reason' && 'Cancel My Service'}
                                    {cancelStep === 'fee_ack' && 'Platform Fee Notice'}
                                    {cancelStep === 'pay_choice' && 'Pay Platform Fee'}
                                </span>
                            </div>
                            <button
                                onClick={() => !cancelLoading && setCancelModalOpen(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        <div className="px-5 py-4 space-y-4">

                            {/* ── Step 1: Reason ── */}
                            {cancelStep === 'reason' && (
                                <>
                                    <p className="text-sm text-gray-600">Please tell us why you want to cancel this booking.</p>
                                    <div className="space-y-2">
                                        {CANCELLATION_REASONS.map((r) => (
                                            <label
                                                key={r}
                                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                                    cancelReason === r ? 'border-[#037166] bg-[#037166]/5' : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="cancelReason"
                                                    value={r}
                                                    checked={cancelReason === r}
                                                    onChange={() => setCancelReason(r)}
                                                    className="accent-[#037166]"
                                                />
                                                <span className="text-sm font-medium text-gray-800">{r}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {cancelReason === 'Other reason' && (
                                        <textarea
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#037166]/40 focus:border-[#037166] resize-none"
                                            placeholder="Please describe your reason..."
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                        />
                                    )}
                                    <button
                                        onClick={handleCancelNext}
                                        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all text-sm"
                                    >
                                        Continue
                                    </button>
                                </>
                            )}

                            {/* ── Step 2a: Already-paid fee acknowledgement ── */}
                            {cancelStep === 'fee_ack' && (
                                <>
                                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
                                        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-amber-800 mb-1">Platform Fee is Non-Refundable</p>
                                            <p className="text-xs text-amber-700">The ₹99 platform fee paid for this booking will <strong>not be refunded</strong> as per DoorStepHub policy. Your remaining service amount (if any) will be processed per the refund policy.</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">By confirming, you agree to this policy and your booking will be cancelled immediately.</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setCancelStep('reason')}
                                            disabled={cancelLoading}
                                            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                                        >
                                            Go Back
                                        </button>
                                        <button
                                            onClick={() => doCancel('already_paid')}
                                            disabled={cancelLoading}
                                            className="flex-1 py-3 rounded-xl bg-[#037166] hover:bg-[#025a51] text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {cancelLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</> : 'I Agree'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* ── Step 2b: Unpaid fee – payment choice ── */}
                            {cancelStep === 'pay_choice' && (
                                <>
                                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3">
                                        <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-blue-800 mb-1">₹99 Platform Fee Required</p>
                                            <p className="text-xs text-blue-700">A platform fee of ₹99 must be paid to cancel this booking. Please proceed with secure online payment to complete cancellation.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {/* Payment Gateway */}
                                        <button
                                            onClick={doInitiateGatewayPayment}
                                            disabled={cancelLoading}
                                            className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-[#037166] bg-[#037166]/5 hover:bg-[#037166]/10 transition-all disabled:opacity-50"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-[#037166]/10 flex items-center justify-center flex-shrink-0">
                                                <CreditCard className="w-4 h-4 text-[#037166]" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-bold text-gray-900">Pay Online (₹99)</p>
                                                <p className="text-xs text-gray-500">Secure payment via Easebuzz Gateway</p>
                                            </div>
                                            {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />}
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setCancelStep('reason')}
                                        disabled={cancelLoading}
                                        className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                                    >
                                        Go Back
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Pay Platform Fee Modal ── */}
            {payFeeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => !payFeeLoading && setPayFeeModalOpen(false)}
                    />
                    <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#037166]" />
                                <span className="font-bold text-gray-900">Pay Platform Fee</span>
                            </div>
                            <button
                                onClick={() => !payFeeLoading && setPayFeeModalOpen(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        <div className="px-5 py-4 space-y-4">
                            <div className="rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">Required Platform Fee</p>
                                        <p className="text-2xl font-extrabold text-teal-950 mt-0.5">₹{platformFeePendingAmount || 99}</p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-teal-200 text-teal-900 text-[10px] font-bold uppercase">
                                        Confirmation Fee
                                    </span>
                                </div>
                                <p className="text-xs text-teal-700 mt-2">
                                    Paying this fee confirms your booking and automatically assigns our nearest certified technician.
                                </p>
                            </div>

                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Select Payment Method</p>

                            <div className="space-y-2.5">
                                {/* Option 1: Online Gateway */}
                                <label
                                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                        payFeeMethod === 'ONLINE'
                                            ? 'border-[#037166] bg-[#037166]/5 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payFeeMethod"
                                        value="ONLINE"
                                        checked={payFeeMethod === 'ONLINE'}
                                        onChange={() => setPayFeeMethod('ONLINE')}
                                        className="accent-[#037166]"
                                    />
                                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <CreditCard className="w-4 h-4 text-[#037166]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">Pay Online Gateway</p>
                                        <p className="text-xs text-gray-500">UPI (GPay, PhonePe), Cards & Net Banking</p>
                                    </div>
                                </label>

                                {/* Option 2: D-Hub Wallet */}
                                <label
                                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                                        walletBalance !== null && walletBalance < (platformFeePendingAmount || 99)
                                            ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-50'
                                            : payFeeMethod === 'WALLET'
                                            ? 'border-[#037166] bg-[#037166]/5 shadow-sm cursor-pointer'
                                            : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payFeeMethod"
                                        value="WALLET"
                                        checked={payFeeMethod === 'WALLET'}
                                        onChange={() => setPayFeeMethod('WALLET')}
                                        disabled={walletBalance !== null && walletBalance < (platformFeePendingAmount || 99)}
                                        className="accent-[#037166]"
                                    />
                                    <div className="w-9 h-9 rounded-xl bg-[#037166]/10 flex items-center justify-center flex-shrink-0">
                                        <Wallet className="w-4 h-4 text-[#037166]" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-gray-900">D-Hub Wallet</p>
                                            {walletBalance !== null && walletBalance < (platformFeePendingAmount || 99) && (
                                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                                    Low Balance
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {walletLoading
                                                ? 'Checking balance...'
                                                : walletBalance !== null
                                                ? `Balance: ₹${walletBalance}`
                                                : 'Balance unavailable'}
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPayFeeModalOpen(false)}
                                    disabled={payFeeLoading}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExecutePlatformFeePayment}
                                    disabled={payFeeLoading || (payFeeMethod === 'WALLET' && walletBalance !== null && walletBalance < (platformFeePendingAmount || 99))}
                                    className="flex-1 py-3 rounded-xl bg-[#037166] hover:bg-[#025a51] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {payFeeLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Proceed to Pay ₹{platformFeePendingAmount || 99}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
