'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ArrowLeft, Calendar, Clock, Loader2, MapPin, Package, Phone, User,
    CheckCircle, CreditCard, Tag, Layers, Building2, Receipt,
    ChevronDown, ChevronUp, AlertCircle, Home, Hash, Headphones, XCircle,
    AlertTriangle, Wallet, ShieldAlert, X, Wrench, MessageCircle, RefreshCw,
    ShieldCheck, Download
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

function resolveStartOtp(order, bookingId) {
    if (!order) return '';
    const serverOTP = (
        order.startOtp ||
        order.start_otp ||
        order.serviceOtp ||
        order.otp ||
        order.verificationCode ||
        order.otpCode ||
        order.premiumLeadFlow?.startOtp ||
        order.premiumLeadFlow?.otp ||
        order.premiumLeadFlow?.verificationCode ||
        order.premiumLeadFlow?.otpCode ||
        ''
    );
    if (serverOTP && String(serverOTP).trim().length >= 4) {
        return String(serverOTP).trim();
    }
    const id = String(order._id || bookingId || order.orderId || '');
    if (!id) return '';
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
    }
    return (Math.abs(hash) % 9000 + 1000).toString();
}

function fmtDateTime(d) {
    if (!d) return null;
    const date = new Date(d);
    if (isNaN(date.getTime())) return String(d);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

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
    return '₹' + n.toLocaleString('en-IN', {
        minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
        maximumFractionDigits: 2,
    });
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

function OrderTrackingTimeline({
    status = 'pending',
    history = [],
    isPlatformFeePending = false,
    order = null,
    bookingId = '',
    providerName = '',
    providerPhone = '',
    orderId = '',
}) {
    const [expanded, setExpanded] = useState(false);
    const [showFullTracking, setShowFullTracking] = useState(true);

    const normalizedStatus = String(status || order?.status || '').toLowerCase().replace(/[\s_-]/g, '');
    const isCancelled = ['cancelledbyuser', 'cancelledbyprovider', 'rejectedbyprovider', 'missed', 'cancelled'].includes(normalizedStatus);
    const isCompleted = ['workiscompleted', 'completed', 'closed', 'servicecompleted', 'workcompleted'].includes(normalizedStatus);

    const hasProviderAccepted = Boolean(
        order?.providerAcceptedAt ||
        order?.premiumLeadFlow?.providerAcceptedAt ||
        order?.premiumLeadFlow?.acceptedAt ||
        order?.providerId ||
        order?.serviceProviderId ||
        providerName ||
        providerPhone ||
        [
            'acceptedbyprovider',
            'provideraccepted',
            'appointmentconfirmedbyprovider',
            'ontheway',
            'reachedlocation',
            'workinprogress',
            'sendquotation',
            'quotationaccepted',
            'paymentrequested',
            'paymentreceived',
        ].includes(normalizedStatus)
    );

    const isProviderAssigned = Boolean(providerName || providerPhone || order?.providerId);

    // Calculate OTP using backend-compatible algorithm
    const otp = resolveStartOtp(order, bookingId);
    const otpDigits = (otp && String(otp).trim().length >= 4)
        ? String(otp).trim().slice(-4).split('')
        : ['—', '—', '—', '—'];

    // Show OTP when provider accepted and booking is not cancelled, completed, or pending platform fee
    const showOTP = !isCancelled && !isCompleted && !['pending', 'payment_pending'].includes(normalizedStatus) && (
        hasProviderAccepted ||
        Boolean(order?.startOtp || order?.serviceOtp || order?.otp)
    );

    // Calculate active step index (0 to 4)
    let currentStep = 0;
    if (status === 'payment_pending' || isPlatformFeePending) {
        currentStep = 0;
    } else if (status === 'pending') {
        currentStep = 1;
    } else if (['orderAcceptedByAdmin', 'orderAccpetedByAdmin', 'orderAcceptedBySystem', 'assignToProvider', 'acceptedByProvider', 'provideraccepted', 'appointmentConfirmedByProvider'].includes(status) || ['acceptedbyprovider', 'provideraccepted', 'assigntoprovider'].includes(normalizedStatus)) {
        currentStep = 2;
    } else if (['onTheWay', 'reachedLocation', 'workInProgress', 'sendQuotation', 'quotationAccepted', 'paymentRequested', 'paymentReceived'].includes(status) || ['ontheway', 'reachedlocation', 'workinprogress', 'sendquotation', 'quotationaccepted', 'paymentrequested', 'paymentreceived'].includes(normalizedStatus)) {
        currentStep = 3;
    } else if (isCompleted) {
        currentStep = 4;
    }

    const steps = [
        { title: 'Order Placed', desc: (status === 'payment_pending' || isPlatformFeePending) ? 'Fee pending' : 'Request logged' },
        { title: 'Booking Confirmed', desc: 'Fee verified' },
        { title: 'Partner Assigned', desc: 'Partner confirmed' },
        { title: 'In Progress', desc: 'Doorstep service' },
        { title: 'Completed', desc: 'Finished' },
    ];

    const safeHistory = history && history.length > 0 ? history : [
        {
            status: status || 'pending',
            statusTextMessage: (status === 'payment_pending' || isPlatformFeePending)
                ? 'Booking Created - Platform Fee (₹99) Pending'
                : 'Booking Placed & Confirmed',
            logCreatedDate: order?.createdAt || new Date().toISOString()
        }
    ];

    const shownHistory = expanded ? safeHistory : safeHistory.slice(-3);
    const latestTime = safeHistory[safeHistory.length - 1]?.logCreatedDate || order?.updatedAt || order?.createdAt;
    const cleanPhone = String(providerPhone || '').replace(/\D/g, '').slice(-10);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4 shadow-xs">
            {/* ── Section Title: Order Tracking ── */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h2 className="font-extrabold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#007367]" />
                    Order Tracking
                </h2>
                <span className={`text-[10px] sm:text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${getStatusStyle(status)}`}>
                    {getStatusLabel(status)}
                </span>
            </div>

            {/* Current Status Row */}
            <div className="flex items-start justify-between gap-3 pt-0.5">
                <div>
                    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Current Status</p>
                    <h3 className="text-base sm:text-lg font-black text-gray-900 mt-0.5">
                        {getStatusLabel(status)}
                    </h3>
                    {latestTime && (
                        <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                            {fmtDateTime(latestTime)}
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setShowFullTracking(v => !v)}
                    className="text-[10px] sm:text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-teal-50 text-[#007367] border border-teal-200 hover:bg-teal-100 transition-colors"
                >
                    {showFullTracking ? 'HIDE' : 'LIVE'}
                </button>
            </div>

            {/* ── SERVICE START OTP CARD (Exact Match to Mobile App) ── */}
            {showOTP && (
                <div className="bg-[#007367] rounded-xl p-3 sm:p-3.5 text-white shadow-xs flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm">🔐</span>
                            <span className="font-bold text-xs sm:text-sm text-white truncate">
                                Service Start OTP
                            </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-white/85 mt-0.5 truncate">
                            {otp ? 'Share with partner on arrival' : 'OTP sent when partner reaches location'}
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {otpDigits.map((digit, idx) => (
                            <div
                                key={idx}
                                className="w-7 h-8 sm:w-8 sm:h-9 bg-white rounded-md flex items-center justify-center font-extrabold text-sm sm:text-base text-[#007367] shadow-xs select-all"
                            >
                                {digit}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── ASSIGNED PARTNER CARD (Exact Match to Mobile App) ── */}
            {isProviderAssigned && (providerName || providerPhone) && (
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#166534]">
                            Assigned Partner
                        </p>
                        <p className="text-sm sm:text-base font-bold text-[#15803D] truncate mt-0.5">
                            {providerName || 'Service Partner'}
                        </p>
                        {providerPhone && (
                            <a
                                href={`tel:${cleanPhone || providerPhone}`}
                                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#166534] hover:underline mt-1"
                            >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{providerPhone}</span>
                            </a>
                        )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        {providerPhone && (
                            <a
                                href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${providerName || 'Partner'}, regarding my Doorstep Hub booking #${orderId || ''}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all"
                            >
                                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>WhatsApp</span>
                            </a>
                        )}
                        {providerPhone && (
                            <a
                                href={`tel:${cleanPhone || providerPhone}`}
                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#007367] hover:bg-[#005f54] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all"
                            >
                                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>Call</span>
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Toggle Full Tracking Button */}
            <button
                type="button"
                onClick={() => setShowFullTracking(v => !v)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#007367] hover:bg-[#005f54] active:scale-[0.99] text-white font-bold text-xs sm:text-sm text-center shadow-xs transition-all"
            >
                {showFullTracking ? 'Hide Full Tracking' : 'View Full Tracking'}
            </button>

            {/* Full Tracking Content: Stepper & Activity Log */}
            {showFullTracking && (
                <div className="space-y-4 pt-1">
                    {/* Stepper Progress */}
                    {isCancelled ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
                            <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-red-800">Booking Cancelled</p>
                                <p className="text-xs text-red-600">This service booking has been cancelled ({getStatusLabel(status)}).</p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-2">
                            <div className="grid grid-cols-5 relative">
                                {/* Connecting track line */}
                                <div className="absolute top-3.5 sm:top-4 left-[10%] right-[10%] h-1 bg-gray-200 -z-0">
                                    <div
                                        className="h-full bg-[#007367] transition-all duration-500"
                                        style={{ width: `${(Math.min(currentStep, 4) / 4) * 100}%` }}
                                    />
                                </div>

                                {steps.map((step, idx) => {
                                    const isDone = currentStep > idx;
                                    const isCurrent = currentStep === idx;
                                    return (
                                        <div key={idx} className="flex flex-col items-center text-center relative z-10 px-0.5">
                                            <div
                                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs transition-all ${
                                                    isDone
                                                        ? 'bg-[#007367] text-white'
                                                        : isCurrent
                                                        ? 'bg-white border-2 border-[#007367] text-[#007367] shadow-xs ring-4 ring-[#007367]/20'
                                                        : 'bg-gray-100 border-2 border-gray-200 text-gray-400'
                                                }`}
                                            >
                                                {isDone ? <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : idx + 1}
                                            </div>
                                            <p className={`text-[10px] sm:text-xs font-bold mt-1.5 sm:mt-2 leading-tight ${isCurrent ? 'text-[#007367]' : isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {step.title}
                                            </p>
                                            <p className="text-[9px] sm:text-[10px] text-gray-400 hidden sm:block mt-0.5 max-w-[90px]">
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
                                        type="button"
                                        onClick={() => setExpanded(e => !e)}
                                        className="text-xs text-[#007367] font-semibold flex items-center gap-1 hover:underline"
                                    >
                                        {expanded ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Show all ({safeHistory.length})</>}
                                    </button>
                                )}
                            </div>
                            <ol className="relative border-l-2 border-[#007367]/20 ml-2 space-y-3">
                                {shownHistory.map((h, idx) => (
                                    <li key={idx} className="ml-5 relative">
                                        <div className="absolute -left-[22px] w-3.5 h-3.5 rounded-full bg-[#007367] border-2 border-white shadow-xs top-0.5" />
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
            )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BookingDetailPage() {
    const params = useParams();
    const bookingId = params?.bookingId;
    const { token, loading: authLoading } = useAuth();
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
            } catch {}
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
                try {
                    sessionStorage.setItem('last_checkout_url', window.location.pathname + window.location.search);
                } catch {}
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
        } catch {
            toast.error('Failed to cancel booking. Please try again.');
        } finally {
            setCancelLoading(false);
        }
    };

    const doInitiateGatewayPayment = async () => {
        const finalReason = cancelReason === 'Other reason' ? customReason.trim() : cancelReason;
        setCancelLoading(true);
        try {
            try { sessionStorage.setItem(`cancel_reason_${bookingId}`, finalReason); } catch {}
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
        } catch {
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

    const isOrderLoading = authLoading || (Boolean(token) && loading);

    useEffect(() => {
        if (authLoading || !token) return;
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
        order?.partnerName ||
        order?.provider?.name ||
        order?.provider?.providerName ||
        order?.serviceProviderName ||
        order?.assignedProvider?.name ||
        order?.assignedPartner?.name ||
        (order?.providerId?.firstName
            ? `${order.providerId.firstName || ''} ${order.providerId.lastName || ''}`.trim()
            : order?.providerId?.businessName || order?.providerId?.name) ||
        null;

    const providerPhone =
        order?.providerPhone ||
        order?.providerMobile ||
        order?.partnerPhone ||
        order?.provider?.phone ||
        order?.provider?.mobile ||
        order?.assignedProvider?.phone ||
        order?.assignedPartner?.phone ||
        order?.providerId?.phone ||
        order?.providerId?.mobileNumber ||
        order?.providerId?.mobile ||
        null;
    const providerType = order?.partnerType || order?.typeProvider || null;

    // Fee breakdown (Multi-quotation aggregated)
    const rawEstimations = Array.isArray(order?.estimations) && order.estimations.length > 0
        ? order.estimations
        : (order?.estimation ? [order.estimation] : (order?.latestEstimation ? [order.latestEstimation] : []));
    const activeEstimations = rawEstimations.filter(e => !['rejected', 'quotationrejected'].includes(String(e?.status || '').toLowerCase()));
    const hasEstimations = activeEstimations.length > 0;

    // Services Subtotal (Sum of all accepted quotation base amounts, or initial services fallback)
    const servicesSubtotal = hasEstimations
        ? activeEstimations.reduce((acc, e) => acc + Number(e.baseAmount || e.totalAmount || 0), 0)
        : (services.reduce((acc, s) => acc + (s.price != null ? Number(s.price) * (s.quantity || 1) : 0), 0) || null);

    // GST Amount (Sum of all accepted quotation GSTs, or order.gstAmount fallback)
    const gstAmount = hasEstimations
        ? (activeEstimations.reduce((acc, e) => acc + Number(e.gstAmount || 0), 0) || Number(order?.gstAmount || 0))
        : (order?.gstAmount ?? null);

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
        platformFee = rawConsultation;
    } else if (platformFee && rawConsultation > 0) {
        if (!isPaidOnline && !isServiceCenter && String(paymentMethod || '').toUpperCase() === 'COD') {
            consultationFee = rawConsultation;
        }
    }

    const couponDiscount = Number(order?.couponDiscountAmount || activeEstimations[0]?.couponDiscountAmount || 0);

    // Grand Total
    let grandTotal = null;
    if (hasEstimations) {
        if (order?.totalAmount && Number(order.totalAmount) > 0) {
            grandTotal = Number(order.totalAmount);
        } else {
            const rawSum = Number(servicesSubtotal || 0) + Number(gstAmount || 0);
            grandTotal = Math.max(0, rawSum - couponDiscount);
        }
    } else {
        grandTotal = order?.totalAmount ?? null;
    }

    // Payment amounts:
    const rawPartialPaid = Number(order?.partialAmountPaid || 0);
    const rawFullPaid = Number(order?.fullAmountPaid || 0);
    const isWorkCompleted = ['workiscompleted', 'completed', 'closed'].includes(String(order?.status || '').toLowerCase());

    let advancePaid = null;
    let remainingPaid = null;
    let totalPaid = null;
    let pendingAmount = 0;

    if (hasEstimations) {
        if (rawPartialPaid > 0) {
            advancePaid = rawPartialPaid;
        } else if (activeEstimations[0]?.advanceAmount && Number(activeEstimations[0].advanceAmount) > 0) {
            advancePaid = Number(activeEstimations[0].advanceAmount);
        }

        if (rawFullPaid > 0) {
            remainingPaid = Math.max(0, Number(grandTotal || 0) - Number(advancePaid || 0));
        } else if (isWorkCompleted && grandTotal > 0) {
            remainingPaid = Math.max(0, Number(grandTotal || 0) - Number(advancePaid || 0));
        }

        if (isPaymentCompleted || isWorkCompleted) {
            totalPaid = Number(((advancePaid || 0) + (remainingPaid || 0)).toFixed(2));
            pendingAmount = 0;
        } else {
            totalPaid = advancePaid || null;
            pendingAmount = Math.max(0, Number(grandTotal || 0) - Number(totalPaid || 0));
        }
    } else {
        advancePaid = order?.partialAmountPaid ?? null;
        totalPaid = isPaymentCompleted ? (grandTotal || order?.amount || null) : null;
        pendingAmount = grandTotal != null ? Math.max(0, Number(grandTotal) - Number(totalPaid || 0)) : 0;
    }

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
            {/* Back Link & Refresh Action */}
            <div className="flex items-center justify-between gap-3">
                <Link
                    href="/account/bookings"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#037166] hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to My Bookings
                </Link>
                <button
                    type="button"
                    onClick={loadOrder}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#037166] hover:text-[#025c53] px-3 py-1.5 rounded-xl bg-white border border-[#037166]/20 shadow-xs hover:bg-[#037166]/5 active:scale-95 transition-all"
                    title="Refresh booking details"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {isOrderLoading ? (
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
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
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
                                        <p className="text-xs sm:text-sm text-amber-900 mt-1 leading-relaxed">
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
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                            <div>
                                <h1 className="text-lg sm:text-xl font-extrabold text-gray-900">
                                    {order?.serviceName || order?.firstServiceName || order?.subcategoryName || 'Booking Details'}
                                </h1>
                                {orderId && (
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Hash className="w-3.5 h-3.5 text-[#037166]" />
                                        <span className="text-xs font-mono font-bold text-[#037166]">{orderId}</span>
                                    </div>
                                )}
                                {createdAt && (
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        Booked on {fmtDateTime(createdAt) || new Date(createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                    </p>
                                )}
                            </div>
                            <span className={`text-[10px] sm:text-[11px] font-bold uppercase px-3 py-1 rounded-full ${getStatusStyle(status)} shrink-0`}>
                                {getStatusLabel(status)}
                            </span>
                        </div>

                        {/* Key Info Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-3">
                            {bookedDate && (
                                <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#037166]/10 flex items-center justify-center text-[#037166] shrink-0">
                                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</p>
                                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{bookedDate}</p>
                                    </div>
                                </div>
                            )}
                            {bookedTime && (
                                <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#037166]/10 flex items-center justify-center text-[#037166] shrink-0">
                                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Time Slot</p>
                                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{bookedTime}</p>
                                    </div>
                                </div>
                            )}
                            {customerPhone && (
                                <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#037166]/10 flex items-center justify-center text-[#037166] shrink-0">
                                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact</p>
                                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{customerPhone}</p>
                                    </div>
                                </div>
                            )}
                            {categoryName && (
                                <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#037166]/10 flex items-center justify-center text-[#037166] shrink-0">
                                        <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</p>
                                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{categoryName}</p>
                                    </div>
                                </div>
                            )}
                            {paymentMethod && (
                                <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#037166]/10 flex items-center justify-center text-[#037166] shrink-0">
                                        <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Method</p>
                                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod}</p>
                                    </div>
                                </div>
                            )}
                            {paymentStatus && (
                                <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        ['paid', 'completed'].includes(paymentStatus) ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment</p>
                                        <p className={`text-xs sm:text-sm font-bold capitalize truncate ${
                                            ['paid', 'completed'].includes(paymentStatus) ? 'text-green-700' : 'text-amber-700'
                                        }`}>{paymentStatus}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Booking Fee Paid Banner (Online / Completed) ─────────────────── */}
                    {!isPlatformFeePending && (isPaidOnline || ['paid', 'completed'].includes(String(paymentStatus || '').toLowerCase())) && (
                        <div className="bg-[#E6F4EA] border border-[#A8DAB5] rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm text-[#137333] shadow-xs">
                            <div className="flex items-center gap-2 font-bold">
                                <CheckCircle className="w-4 h-4 text-[#137333] shrink-0" />
                                <span>Booking Fee ({fmtAmount(platformFee || order?.amount || 99)}) Completed Online</span>
                            </div>
                            {walletBalance != null && (
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#137333]/90 bg-white/70 px-2.5 py-1 rounded-lg border border-[#A8DAB5]/40 shrink-0">
                                    <Wallet className="w-3.5 h-3.5 shrink-0" />
                                    <span>Remaining Wallet Balance: {fmtAmount(walletBalance)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Two-Column Layout for larger screens ────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                        {/* Left Column: Tracking + Services + Charges */}
                        <div className="lg:col-span-7 space-y-4">

                            {/* Order Tracking & Status History (with OTP & Assigned Partner) */}
                            <OrderTrackingTimeline
                                status={status}
                                history={statusHistory}
                                isPlatformFeePending={isPlatformFeePending}
                                order={order}
                                bookingId={bookingId}
                                providerName={providerName}
                                providerPhone={providerPhone}
                                orderId={orderId}
                            />

                            {/* Quotation(s) Details (Render each accepted quotation with full items and spare parts) */}
                            {hasEstimations && activeEstimations.map((est, eIdx) => {
                                const isFirst = eIdx === 0;
                                const quoteTitle = activeEstimations.length === 1
                                    ? "Approved Quotation"
                                    : (isFirst ? "Initial Quotation (#1)" : `Revised Quotation (#${eIdx + 1})`);
                                const ratedCards = Array.isArray(est.ratedCards) ? est.ratedCards : [];
                                const spareParts = Array.isArray(est.spareParts) ? est.spareParts : [];
                                const serviceCards = Array.isArray(est.serviceCards) ? est.serviceCards : [];
                                const estBase = Number(est.baseAmount || est.totalAmount || 0);
                                const estGst = Number(est.gstAmount || (estBase * 0.18));
                                const estGrand = Number(est.grandTotal || (estBase + estGst));

                                return (
                                    <div key={est._id || eIdx} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm">
                                        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-gray-100">
                                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                                <Wrench className="w-4 h-4 text-[#037166]" />
                                                {quoteTitle}
                                            </h2>
                                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                                Accepted
                                            </span>
                                        </div>

                                        <div className="divide-y divide-gray-100 text-sm">
                                            {ratedCards.map((rc, rIdx) => (
                                                <div key={rc.id || rIdx} className="flex items-center justify-between py-2">
                                                    <div className="flex-1 pr-3">
                                                        <p className="font-semibold text-gray-900">{rc.title || rc.name || 'Service Item'}</p>
                                                        {rc.quantity > 1 && <p className="text-xs text-gray-400">Qty: {rc.quantity}</p>}
                                                    </div>
                                                    <span className="font-bold text-gray-900 shrink-0">{fmtAmount(Number(rc.price || 0) * (rc.quantity || 1))}</span>
                                                </div>
                                            ))}

                                            {spareParts.map((sp, sIdx) => (
                                                <div key={sp.sparePartId || sIdx} className="flex items-center justify-between py-2">
                                                    <div className="flex-1 pr-3">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <p className="font-semibold text-gray-900">{sp.name || 'Spare Part'}</p>
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                                                Spare Part
                                                            </span>
                                                            {sp.warrantyDays > 0 && (
                                                                <span className="text-[10px] text-gray-500 font-medium">
                                                                    ({sp.warrantyDays}d warranty)
                                                                </span>
                                                            )}
                                                        </div>
                                                        {sp.quantity > 1 && <p className="text-xs text-gray-400">Qty: {sp.quantity}</p>}
                                                    </div>
                                                    <span className="font-bold text-gray-900 shrink-0">{fmtAmount(Number(sp.customer_price || sp.price || 0) * (sp.quantity || 1))}</span>
                                                </div>
                                            ))}

                                            {serviceCards.map((sc, scIdx) => (
                                                <div key={scIdx} className="flex items-center justify-between py-2">
                                                    <div className="flex-1 pr-3">
                                                        <p className="font-semibold text-gray-900">{sc.name || 'Service'}</p>
                                                        {sc.quantity > 1 && <p className="text-xs text-gray-400">Qty: {sc.quantity}</p>}
                                                    </div>
                                                    <span className="font-bold text-gray-900 shrink-0">{fmtAmount(Number(sc.price || 0) * (sc.quantity || 1))}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-2 border-t border-dashed border-gray-200 flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
                                            <span>Base: {fmtAmount(estBase)} + GST (18%): {fmtAmount(estGst)}</span>
                                            <span className="font-bold text-gray-900 text-sm">Quote Total: {fmtAmount(estGrand)}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Services Booked (Only shown if no quotations have been issued yet) */}
                            {!hasEstimations && services.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm">
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
                                                            <Image src={imageUrl} alt={service.name} className="w-full h-full object-cover"  width={500} height={300} />
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
                                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                            <Receipt className="w-4 h-4 text-[#037166]" />
                                            Bill Summary
                                        </h2>
                                        {activeEstimations.length > 1 && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#037166]/10 text-[#037166]">
                                                Combined Total
                                            </span>
                                        )}
                                    </div>

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
                                                <div>
                                                    <span className="text-gray-600">Platform Fee</span>
                                                    {isPaidOnline && (
                                                        <span className="ml-1.5 text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full font-semibold">Paid at booking</span>
                                                    )}
                                                </div>
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
                                                    <span className="text-green-600 font-semibold">Coupon Discount</span>
                                                </div>
                                                <span className="font-bold text-green-600">-{fmtAmount(couponDiscount)}</span>
                                            </div>
                                        )}

                                        {/* Grand Total */}
                                        {grandTotal != null && (
                                            <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-gray-200">
                                                <span className="font-extrabold text-gray-900">Grand Total</span>
                                                <span className="text-lg font-extrabold text-[#037166]">{fmtAmount(grandTotal)}</span>
                                            </div>
                                        )}

                                        {/* Payment Breakdown */}
                                        {(advancePaid != null || totalPaid != null) && (
                                            <div className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-2">
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Payment Breakdown</p>
                                                {advancePaid != null && Number(advancePaid) > 0 && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Advance Paid</span>
                                                        <span className="font-semibold text-green-700">{fmtAmount(advancePaid)}</span>
                                                    </div>
                                                )}
                                                {remainingPaid != null && Number(remainingPaid) > 0 && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Remaining Balance Paid</span>
                                                        <span className="font-semibold text-green-700">{fmtAmount(remainingPaid)}</span>
                                                    </div>
                                                )}
                                                {totalPaid != null && Number(totalPaid) > 0 && (
                                                    <div className="flex items-center justify-between text-sm pt-1 border-t border-gray-100">
                                                        <span className="text-gray-900 font-bold">Total Paid</span>
                                                        <span className="font-extrabold text-green-700 flex items-center gap-1">
                                                            {fmtAmount(totalPaid)}
                                                            {(isPaymentCompleted || isWorkCompleted) && (
                                                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-800">
                                                                    Paid
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {pendingAmount != null && Number(pendingAmount) > 0.5 && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600 font-medium">Pending Amount</span>
                                                        <span className="font-bold text-amber-700">{fmtAmount(pendingAmount)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Note: Order Tracking Timeline is rendered at the top of the column for immediate visibility */}
                        </div>

                        {/* Right Column: Service Address + Provider Info */}
                        <div className="lg:col-span-5 space-y-4">

                            {/* Service Address */}
                            {addressObj && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
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
                                                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                {addressObj.phone}
                                            </div>
                                        )}
                                        <div className="flex items-start gap-1.5 text-xs text-gray-700 leading-relaxed">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
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
                                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-[#037166]" />
                                        Service Provider
                                    </h2>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#037166]/10 flex items-center justify-center text-[#037166] shrink-0">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {providerName && (
                                                <p className="text-sm font-bold text-gray-900 truncate">{providerName}</p>
                                            )}
                                            {providerType && (
                                                <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#037166]/10 text-[#037166] mt-0.5">
                                                    {providerType}
                                                </span>
                                            )}
                                            {providerPhone && (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1.5">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <a href={`tel:${String(providerPhone).replace(/\D/g, '').slice(-10)}`} className="hover:underline">
                                                        {providerPhone}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {providerPhone && (
                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-2">
                                            <a
                                                href={`https://wa.me/91${String(providerPhone).replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hello ${providerName || 'Partner'}, regarding my Doorstep Hub booking #${orderId || ''}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                <span>WhatsApp</span>
                                            </a>
                                            <a
                                                href={`tel:${String(providerPhone).replace(/\D/g, '').slice(-10)}`}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#037166] hover:bg-[#025c53] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                                            >
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>Call</span>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tax Invoice Download Card */}
                            {(order.invoice || order.customerInvoice || ['workiscompleted', 'completed'].includes(String(order.status || '').toLowerCase())) && (
                                <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Receipt className="w-5 h-5 text-emerald-600" />
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">Tax Invoice</h3>
                                                <p className="text-[11px] text-gray-500">Official GST invoice copy</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {order.invoice ? 'Available' : 'Processing'}
                                        </span>
                                    </div>
                                    {order.invoice ? (
                                        <a
                                            href={resolveMediaUrl(order.invoice)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={`DoorstepHub-Invoice-${orderId || 'booking'}.pdf`}
                                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download Tax Invoice (PDF)
                                        </a>
                                    ) : (
                                        <p className="text-[11px] text-gray-500 italic">
                                            Invoice will be downloadable here once service billing is finalized.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Warranty Protection Card - strictly applicable ONLY for Appliance Repair Services */}
                            {(() => {
                                const orderHints = [
                                    order?.serviceType,
                                    order?.serviceName,
                                    order?.subcategoryName,
                                    order?.subCategoryName,
                                    order?.categoryName,
                                    order?.department,
                                    order?.serviceRole
                                ].filter(Boolean).map(s => String(s).toLowerCase());

                                const isProfessional = orderHints.some(h =>
                                    ['religious', 'religeous', 'purohit', 'pandit', 'pooja', 'puja', 'ritual', 'hostel', 'pg', 'spa', 'salon', 'saloon', 'parlour', 'parlor', 'grooming', 'pet', 'yoga', 'astrology', 'music', 'dance', 'photography', 'catering', 'event', 'wedding'].some(kw => h.includes(kw))
                                );
                                const isAppliance = !isProfessional && orderHints.some(h =>
                                    ['appliance', 'repair', 'ac', 'refrigerator', 'fridge', 'washing machine', 'microwave', 'geyser', 'ro', 'purifier', 'chimney', 'cooler', 'tv', 'television', 'electric'].some(kw => h.includes(kw))
                                );
                                const hasActiveWarranty = String(order?.warrantyStatus || order?.warrentystatus || '').toLowerCase() === 'active' || Boolean(order?.warrantyEndDate || order?.warrenty_enddate);
                                const isWarrantyApplicable = !isProfessional && isAppliance && (hasActiveWarranty || ['workiscompleted', 'completed'].includes(String(order?.status || '').toLowerCase()));

                                if (!isWarrantyApplicable) return null;

                                return (
                                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">Warranty Protection</h3>
                                                <p className="text-[11px] text-gray-500">DoorstepHub Service Assurance</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {String(order.warrantyStatus || order.warrentystatus || 'Active').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                                            <span className="text-[10px] text-gray-500 block uppercase font-semibold">Service Warranty</span>
                                            <span className="font-bold text-gray-900">{order.serviceWarrantyDays || 30} Days</span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                                            <span className="text-[10px] text-gray-500 block uppercase font-semibold">Spare Parts</span>
                                            <span className="font-bold text-gray-900">{order.sparePartWarrantyDays || 90} Days</span>
                                        </div>
                                    </div>
                                    {(order.warrantyEndDate || order.warrenty_enddate) && (
                                        <p className="text-[11px] text-gray-600 flex justify-between items-center pt-1 border-t border-gray-100">
                                            <span>Coverage Valid Until:</span>
                                            <span className="font-bold text-emerald-700">
                                                {new Date(order.warrantyEndDate || order.warrenty_enddate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </p>
                                    )}
                                </div>
                                );
                            })()}

                            {/* Quick Booking ID Card */}
                            {orderId && (
                                <div className="bg-gradient-to-br from-[#037166] to-[#04a99d] rounded-2xl p-4 text-white shadow-xs">
                                    <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">Booking Reference</p>
                                    <p className="text-base font-mono font-extrabold tracking-wide">{orderId}</p>
                                    <p className="text-[10px] text-white/70 mt-1">Share this ID with our support team for faster assistance.</p>
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
