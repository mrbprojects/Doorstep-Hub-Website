'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Phone,
    User,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Copy,
    Check,
    Download,
    FileText,
    ExternalLink,
    IndianRupee,
    CreditCard,
    ShieldCheck,
    MessageCircle,
    Navigation,
    Wrench,
    Receipt,
    Loader2,
    AlertTriangle,
    Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import { getProviderBookingDetails, resolveInvoiceUrl } from '@/lib/providerAuthApi';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(raw) {
    if (!raw) return '—';
    try {
        const d = new Date(raw);
        if (isNaN(d.getTime())) return String(raw);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return String(raw);
    }
}

function formatBookingDate(raw) {
    if (!raw) return 'Flexible';
    try {
        const parts = String(raw).split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
            }
        }
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        }
    } catch { }
    return String(raw);
}

function formatTime(raw) {
    if (!raw) return 'Flexible';
    try {
        const m = String(raw).match(/^(\d{1,2}):(\d{2})/);
        if (m) {
            let h = parseInt(m[1]);
            const min = m[2];
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            return `${String(h).padStart(2, '0')}:${min} ${ampm}`;
        }
    } catch { }
    return String(raw);
}

function statusInfo(status, leadStatus) {
    const st = String(status || '').toLowerCase().replace(/[\s_-]/g, '');
    const ls = String(leadStatus || '').toLowerCase();
    if (['cancelledbyuser', 'cancelledbyprovider', 'rejectedbyprovider', 'cancelled', 'lost', 'rejected'].includes(st)) {
        return { label: 'Cancelled', step: 0, cls: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', Icon: XCircle };
    }
    if (['workiscompleted', 'completed', 'servicecompleted', 'bookingcompleted', 'closed'].includes(st)) {
        return { label: 'Completed', step: 5, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', Icon: CheckCircle2 };
    }
    if (['workinprogress', 'in-progress', 'inprogress', 'ongoing', 'paymentreceived'].includes(st)) {
        return { label: 'In Progress', step: 4, cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', Icon: Wrench };
    }
    if (['reachedlocation', 'atlocation', 'ontheway', 'started'].includes(st)) {
        return { label: 'On The Way', step: 3, cls: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500', Icon: Navigation };
    }
    if (['acceptedbyprovider', 'accepted', 'appointmentconfirmedbyprovider', 'confirmed'].includes(st)) {
        return { label: 'Accepted', step: 2, cls: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500', Icon: CheckCircle2 };
    }
    if (ls === 'follow - up' || ls === 'follow-up') {
        return { label: 'Follow-Up', step: 2, cls: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', Icon: RefreshCw };
    }
    return { label: 'New Lead', step: 1, cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', Icon: Clock };
}

function CopyBtn({ text, label = 'Copy' }) {
    const [copied, setCopied] = useState(false);
    const copy = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success(`${label} copied to clipboard`);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    };
    return (
        <button
            onClick={copy}
            type="button"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#037166] transition p-1 rounded hover:bg-gray-100"
            title={`Copy ${label}`}
        >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
}

// ── Lead Workflow Stepper ──────────────────────────────────────────────────────
function ServiceWorkflowTracker({ currentStep, isCancelled }) {
    const steps = [
        { num: 1, title: 'Lead Received', desc: 'Assigned to Partner' },
        { num: 2, title: 'Accepted / Scheduled', desc: 'Appointment Fixed' },
        { num: 3, title: 'At Location', desc: 'Partner Reached' },
        { num: 4, title: 'In Progress', desc: 'Service / Quotation' },
        { num: 5, title: 'Completed', desc: 'Job Done & Invoice' },
    ];

    if (isCancelled) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <XCircle className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-red-900">Lead Cancelled</h4>
                    <p className="text-xs text-red-700 mt-0.5">This service booking was marked as cancelled or closed.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm overflow-x-auto">
            <div className="min-w-[560px]">
                <div className="flex items-center justify-between relative">
                    {/* Connecting Bar */}
                    <div className="absolute top-4 left-6 right-6 h-1 bg-gray-100 -z-0" />
                    <div
                        className="absolute top-4 left-6 h-1 bg-gradient-to-r from-[#037166] to-[#04a99d] transition-all duration-500 -z-0"
                        style={{
                            width: `${Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100))}%`,
                        }}
                    />

                    {steps.map((st) => {
                        const isDone = currentStep >= st.num;
                        const isCurrent = currentStep === st.num;
                        return (
                            <div key={st.num} className="relative z-10 flex flex-col items-center text-center w-28">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                        isDone
                                            ? 'bg-[#037166] text-white shadow-md shadow-[#037166]/30'
                                            : 'bg-white border-2 border-gray-200 text-gray-400'
                                    } ${isCurrent ? 'ring-4 ring-[#037166]/20' : ''}`}
                                >
                                    {isDone && !isCurrent ? <Check className="w-4 h-4 stroke-[3]" /> : st.num}
                                </div>
                                <span className={`text-xs font-bold mt-2 ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {st.title}
                                </span>
                                <span className="text-[10px] text-gray-400 hidden sm:block mt-0.5">{st.desc}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ── Lead Single View Page Component ───────────────────────────────────────────
export default function SingleLeadDetailsPage() {
    const params = useParams();
    const { token } = useProviderAuth();
    const bookingId = params?.id;

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState(null);

    const loadBooking = useCallback(async () => {
        if (!token || !bookingId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getProviderBookingDetails(token, bookingId);
            if (data && (data._id || data.id || data.orderId)) {
                setBooking(data);
            } else {
                throw new Error('Booking details not found');
            }
        } catch (err) {
            console.error('Failed to load lead details:', err);
            setError(err.message || 'Failed to fetch lead details');
        } finally {
            setLoading(false);
        }
    }, [token, bookingId]);

    useEffect(() => {
        loadBooking();
    }, [loadBooking]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="w-10 h-10 animate-spin text-[#037166] mb-4" />
                <p className="text-sm font-semibold text-gray-600">Loading lead details...</p>
                <p className="text-xs text-gray-400 mt-1">Fetching live booking and customer information</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-8">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-4">
                    <AlertTriangle className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Lead Information Unavailable</h2>
                <p className="text-sm text-gray-500 mb-6">{error || 'Could not locate this booking record.'}</p>
                <div className="flex flex-wrap gap-3 justify-center">
                    <button
                        onClick={loadBooking}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#037166] text-white text-sm font-bold hover:bg-[#025f56] transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                    <Link
                        href="/partner/dashboard/bookings"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Leads
                    </Link>
                </div>
            </div>
        );
    }

    // ── Data Extraction ────────────────────────────────────────────────────────
    const orderId = String(booking.orderId || booking.order_id || booking.id || booking._id || '').toUpperCase();
    const customerName = booking.customerName || booking.userName || booking.user_name || 'Customer';
    const customerMobile = booking.mobileNumber || booking.userMobile || booking.user_mobile || booking.phone || '';
    const customerEmail = booking.userEmail || booking.email || booking.customerEmail || '';
    const scheduledDate = booking.bookedDate || booking.booking_date || booking.date || '';
    const scheduledTime = booking.bookedTime || booking.booking_time || booking.time || '';
    const serviceName = booking.serviceName || booking.serviceNameOriginal || booking.categoryName || 'Service Request';

    const addrObj = booking.user_address || booking.userAddress || booking.address;
    const address = typeof addrObj === 'object' && addrObj
        ? addrObj.address || [addrObj.flat, addrObj.area, addrObj.cityName || addrObj.city, addrObj.stateName || addrObj.state].filter(Boolean).join(', ')
        : [booking.addressFlat, booking.addressLineOne, booking.addressArea, booking.addressCityName || booking.cityName, booking.addressStateName].filter(Boolean).join(', ') || booking.location || 'Address on file';

    const mapQuery = encodeURIComponent(`${address}`);

    // Rates & Estimations
    const rates = Array.isArray(booking.selectedServiceRates) ? booking.selectedServiceRates
        : Array.isArray(booking.ratecards) ? booking.ratecards
        : Array.isArray(booking.ratecardDetails) ? booking.ratecardDetails : [];

    const spareParts = Array.isArray(booking.estimationSpareParts) ? booking.estimationSpareParts
        : Array.isArray(booking.spareParts) ? booking.spareParts : [];

    const serviceSubtotal = rates.reduce((s, r) => s + (Number(r.price || r.customer_price || 0) * (Number(r.quantity || r.qty) || 1)), 0);
    const sparesSubtotal = spareParts.reduce((s, p) => s + (Number(p.customer_price || p.price || 0) * (Number(p.quantity || p.qty) || 1)), 0);
    const baseItemsTotal = serviceSubtotal + sparesSubtotal || Number(booking.amount || booking.totalAmount || 0);

    const totalEarnings = Number(booking.providerPayout || booking.providerPayoutAmount || baseItemsTotal || 0);
    const gstAmount = Number(booking.gstAmount || booking.estimationGstAmount || 0);
    const rawPlatformFee = Number(booking.platformFee != null ? booking.platformFee : (booking.consultationFee != null ? booking.consultationFee : 0));
    const paymentRaw = String(booking.paymentMethod || booking.payment_method || 'COD').toUpperCase();
    const isCOD = paymentRaw === 'COD';
    const orderTotal = Number(booking.totalAmount || booking.total_amount || booking.grandTotal || 0) || (baseItemsTotal + gstAmount + (isCOD ? 0 : rawPlatformFee));

    const { label: statusLabel, step: workflowStep, cls: statusCls, Icon: StatusIcon } = statusInfo(booking.status, booking.leadStatus);
    const isCancelled = ['cancelledbyuser', 'cancelledbyprovider', 'rejectedbyprovider', 'cancelled', 'lost', 'rejected'].includes(
        String(booking.status || '').toLowerCase().replace(/[\s_-]/g, '')
    );
    const isCompleted = ['workiscompleted', 'completed', 'servicecompleted', 'bookingcompleted', 'closed'].includes(
        String(booking.status || '').toLowerCase().replace(/[\s_-]/g, '')
    );

    const receivedAt = formatDate(booking.logCreatedDate || booking.createdAt);
    const partnerNotes = Array.isArray(booking.notes) ? booking.notes : [];
    const customerNotes = booking.remarks || booking.addMoreInfo || booking.description || '';
    const cancellationReason = booking.cancelledReason || booking.rejectedReason || '';

    // Invoices
    const providerInvoicePath = booking.providerInvoice || booking.provider_invoice || '';
    const customerInvoicePath = booking.invoice || booking.customerInvoice || booking.customer_invoice || '';

    const providerInvoiceUrl = providerInvoicePath ? resolveInvoiceUrl(providerInvoicePath) : '';
    const customerInvoiceUrl = customerInvoicePath ? resolveInvoiceUrl(customerInvoicePath) : '';

    const triggerDownload = (url, fallbackName = 'invoice.pdf') => {
        if (!url) {
            toast.info('Invoice Pending', { description: 'Invoice is generated automatically upon service completion.' });
            return;
        }
        try {
            const a = document.createElement('a');
            a.href = url;
            a.download = fallbackName;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success('Download initiated');
        } catch {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            {/* ── Top Header / Breadcrumbs & Back ────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Link
                        href="/partner/dashboard/bookings"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-[#037166] transition mb-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to My Business Leads
                    </Link>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200">
                            ORDER: {orderId}
                        </span>
                        <CopyBtn text={orderId} label="Order ID" />
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${statusCls}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusLabel}
                        </span>
                        {booking.leadStatus && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                Lead: {booking.leadStatus}
                            </span>
                        )}
                    </div>
                </div>

                {/* Quick Top Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    {customerMobile && (
                        <>
                            <a
                                href={`tel:${customerMobile}`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition"
                            >
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                Call Customer
                            </a>
                            <a
                                href={`https://wa.me/91${customerMobile.replace(/\D/g, '').slice(-10)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 text-xs font-bold border border-green-200 transition"
                            >
                                <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                                WhatsApp
                            </a>
                        </>
                    )}
                    <button
                        onClick={loadBooking}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition"
                        title="Refresh details"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Main Hero Card ────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-sm"
            >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#037166] uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4" />
                            Verified Customer Request
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 leading-snug">
                            {serviceName}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>Received: <strong className="text-gray-700">{receivedAt}</strong></span>
                            <span>Scheduled: <strong className="text-gray-700">{formatBookingDate(scheduledDate)} {scheduledTime ? `• ${formatTime(scheduledTime)}` : ''}</strong></span>
                        </p>
                    </div>

                    {/* Partner Earnings Pill */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-[#037166] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#037166]/20">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                                Partner Earnings
                            </span>
                            <div className="text-2xl sm:text-3xl font-black text-slate-900">
                                ₹{Number(totalEarnings).toLocaleString('en-IN')}
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-700">
                                {isCOD ? 'Cash Collection on Site' : 'Online Prepaid via D-Hub'}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Workflow Stepper ──────────────────────────────────────── */}
            <ServiceWorkflowTracker currentStep={workflowStep} isCancelled={isCancelled} />

            {/* ── Main Two-Column Layout ────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ── Left Column: Customer, Location & Schedule (7 cols) ── */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Customer Information Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-[#037166]/10 text-[#037166] flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Customer Details</h3>
                                    <p className="text-[11px] text-gray-500">Contact & job address</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                Verified Customer
                            </span>
                        </div>

                        <div className="space-y-3.5 pt-1">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Full Name</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{customerName}</p>
                                </div>
                                {customerMobile && (
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Phone Number</p>
                                        <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                                            <a
                                                href={`tel:${customerMobile}`}
                                                className="text-sm font-bold text-[#037166] hover:underline"
                                            >
                                                +91 {customerMobile}
                                            </a>
                                            <CopyBtn text={customerMobile} label="Phone number" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {customerEmail && (
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email Address</p>
                                    <p className="text-xs font-medium text-gray-700 mt-0.5">{customerEmail}</p>
                                </div>
                            )}

                            {/* Service Address */}
                            <div className="pt-2 border-t border-gray-100">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-[#037166]" />
                                        Service Location
                                    </p>
                                    <CopyBtn text={address} label="Address" />
                                </div>
                                <p className="text-sm text-gray-800 font-medium mt-1 leading-relaxed">
                                    {address}
                                </p>
                                <div className="mt-3">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200 transition"
                                    >
                                        <Navigation className="w-3.5 h-3.5 text-[#037166]" />
                                        Open in Google Maps / Directions
                                        <ExternalLink className="w-3 h-3 text-gray-400" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule & Appointment Details Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Appointment & Timing</h3>
                                <p className="text-[11px] text-gray-500">Service slot schedule</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-[11px] font-semibold text-gray-500 block">Scheduled Date</span>
                                <span className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-[#037166]" />
                                    {formatBookingDate(scheduledDate)}
                                </span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-[11px] font-semibold text-gray-500 block">Preferred Time Slot</span>
                                <span className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-[#037166]" />
                                    {scheduledTime ? formatTime(scheduledTime) : 'Anytime (Flexible)'}
                                </span>
                            </div>
                        </div>

                        {/* Start OTP if available */}
                        {(booking.startOtp || booking.otp || booking.serviceOtp) && (
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-amber-900 block">Service Verification OTP</span>
                                    <span className="text-xs text-amber-700">Enter this code before commencing service work</span>
                                </div>
                                <span className="text-lg font-mono font-black tracking-widest text-amber-900 bg-white px-3 py-1 rounded-lg border border-amber-300 shadow-2xs">
                                    {booking.startOtp || booking.otp || booking.serviceOtp}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Customer Notes & Issues Card */}
                    {customerNotes && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#037166]" />
                                Customer Remarks & Problem Description
                            </h3>
                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">
                                {customerNotes}
                            </div>
                        </div>
                    )}

                    {/* Cancellation details if cancelled */}
                    {cancellationReason && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-2">
                            <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-600" />
                                Cancellation Reason
                            </h3>
                            <p className="text-xs sm:text-sm text-red-800 font-medium">{cancellationReason}</p>
                        </div>
                    )}

                    {/* Partner Notes Log */}
                    {partnerNotes.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-purple-600" />
                                Partner Activity & Notes ({partnerNotes.length})
                            </h3>
                            <div className="space-y-2">
                                {partnerNotes.map((n, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                                        <p className="text-xs font-medium text-purple-900">{n.note || n.text || '—'}</p>
                                        <p className="text-[10px] text-purple-500 mt-1">
                                            {formatDate(n.createdAt)} • {n.createdBy || 'Partner'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right Column: Invoices & Financials (5 cols) ────────── */}
                <div className="lg:col-span-5 space-y-6">
                    {/* ── INVOICES & DOCUMENTS (Primary requirement) ───────── */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#037166] flex items-center justify-center">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Invoices & Bills</h3>
                                    <p className="text-[11px] text-gray-500">Download settlement & tax bills</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-[#037166] bg-teal-50 px-2 py-0.5 rounded-full uppercase">
                                PDF Format
                            </span>
                        </div>

                        <div className="space-y-3.5">
                            {/* 1. Partner Settlement Invoice */}
                            <div className="p-4 rounded-xl border border-gray-200 bg-slate-50/70 hover:bg-slate-50 transition space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-[#037166]/10 text-[#037166] flex items-center justify-center">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-900">Partner Settlement Invoice</h4>
                                            <p className="text-[10px] text-gray-500">Your payout & service earnings</p>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            providerInvoicePath
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : isCompleted
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        {providerInvoicePath ? 'Generated' : isCompleted ? 'Processing' : 'Pending'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    {providerInvoicePath ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => triggerDownload(providerInvoiceUrl, `Partner-Invoice-${orderId}.pdf`)}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#037166] text-white text-xs font-bold hover:bg-[#025f56] shadow-sm transition"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                Download PDF
                                            </button>
                                            <a
                                                href={providerInvoiceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 transition"
                                                title="View in new tab"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </a>
                                        </>
                                    ) : (
                                        <p className="text-[11px] text-gray-500 italic">
                                            {isCompleted
                                                ? 'Invoice will be generated shortly by the system.'
                                                : 'Available once this service job is completed.'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 2. Customer Tax Invoice */}
                            <div className="p-4 rounded-xl border border-gray-200 bg-slate-50/70 hover:bg-slate-50 transition space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Receipt className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-900">Customer Tax Invoice</h4>
                                            <p className="text-[10px] text-gray-500">Official GST invoice copy</p>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            customerInvoicePath
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : isCompleted
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        {customerInvoicePath ? 'Generated' : isCompleted ? 'Processing' : 'Pending'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    {customerInvoicePath ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => triggerDownload(customerInvoiceUrl, `Customer-Invoice-${orderId}.pdf`)}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 shadow-sm transition"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                Download PDF
                                            </button>
                                            <a
                                                href={customerInvoiceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 transition"
                                                title="View in new tab"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </a>
                                        </>
                                    ) : (
                                        <p className="text-[11px] text-gray-500 italic">
                                            {isCompleted
                                                ? 'Customer invoice will be generated upon final bill generation.'
                                                : 'Generated once service is finished.'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Warranty Assurance Card (when completed or warranty exists) */}
                    {(isCompleted || booking.warrantyStatus || booking.warrentystatus) && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    Warranty Assurance
                                </h3>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                    String(booking.warrantyStatus || booking.warrentystatus || 'active').toLowerCase() === 'active'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : String(booking.warrantyStatus || booking.warrentystatus || '').toLowerCase() === 'in_service'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}>
                                    {String(booking.warrantyStatus || booking.warrentystatus || 'Active').toUpperCase()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                    <span className="text-gray-500 block text-[10px] font-semibold uppercase">Service Warranty</span>
                                    <span className="font-bold text-gray-900">{booking.serviceWarrantyDays || 30} Days</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                    <span className="text-gray-500 block text-[10px] font-semibold uppercase">Spare Parts</span>
                                    <span className="font-bold text-gray-900">{booking.sparePartWarrantyDays || 90} Days</span>
                                </div>
                            </div>

                            {(booking.warrantyEndDate || booking.warrenty_enddate) && (
                                <p className="text-xs text-gray-600 flex items-center justify-between pt-1">
                                    <span>Coverage Valid Until:</span>
                                    <span className="font-bold text-emerald-700">
                                        {formatDate(booking.warrantyEndDate || booking.warrenty_enddate)}
                                    </span>
                                </p>
                            )}

                            {booking.warrantyReschedule?.isWarrantyCall && booking.warrantyReschedule.resolutionStatus !== 'resolved' && (
                                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                                    <p className="font-bold flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                        Warranty Recall Visit Scheduled
                                    </p>
                                    <p className="text-[11px]">
                                        Scheduled Date: {booking.warrantyReschedule.rescheduledDate} {booking.warrantyReschedule.rescheduledTime}
                                    </p>
                                    {booking.warrantyReschedule.adminRemarks && (
                                        <p className="text-[11px] text-amber-700 italic">
                                            Note: {booking.warrantyReschedule.adminRemarks}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Booked Services & Price Breakdown Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#037166]" />
                                Service & Payment Breakdown
                            </h3>
                            <span
                                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                    isCOD
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                            >
                                {isCOD ? 'Cash on Service' : 'Online Paid'}
                            </span>
                        </div>

                        {/* Line Items List */}
                        <div className="space-y-2.5">
                            {rates.length > 0 ? (
                                rates.map((r, i) => (
                                    <div key={i} className="flex justify-between items-start text-xs text-gray-700">
                                        <span className="font-medium pr-2">
                                            {r.name || r.title || r.serviceName || 'Service'}
                                            {(r.quantity || r.qty) ? ` (x${r.quantity || r.qty})` : ''}
                                        </span>
                                        <span className="font-bold text-gray-900 shrink-0">
                                            ₹{(Number(r.price || r.customer_price || 0) * (Number(r.quantity || r.qty) || 1)).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex justify-between items-start text-xs text-gray-700">
                                    <span className="font-medium">{serviceName}</span>
                                    <span className="font-bold text-gray-900">
                                        ₹{Number(baseItemsTotal).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            )}

                            {/* Spare parts if added */}
                            {spareParts.length > 0 && (
                                <div className="pt-2 border-t border-dashed border-gray-200 space-y-1.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Spare Parts Added</p>
                                    {spareParts.map((sp, idx) => (
                                        <div key={idx} className="flex justify-between text-xs text-gray-700">
                                            <span>+ {sp.name || sp.title || 'Part'}{sp.quantity ? ` (x${sp.quantity})` : ''}</span>
                                            <span className="font-semibold text-gray-900">
                                                ₹{(Number(sp.customer_price || sp.price || 0) * (Number(sp.quantity) || 1)).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Financial totals */}
                            <div className="pt-3 border-t border-gray-100 space-y-2">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Services Subtotal</span>
                                    <span>₹{Number(baseItemsTotal).toLocaleString('en-IN')}</span>
                                </div>
                                {gstAmount > 0 && (
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>GST (18%)</span>
                                        <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                {rawPlatformFee > 0 && !isCOD && (
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Platform Consultation Fee</span>
                                        <span>₹{rawPlatformFee.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-200 pt-2">
                                    <span>Customer Total Bill</span>
                                    <span>₹{Number(orderTotal).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {/* Partner Net Settlement Box */}
                            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#037166]/10 to-[#04a99d]/10 border border-[#037166]/20">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 block">
                                            Your Net Payout Earning
                                        </span>
                                        <span className="text-[10px] text-gray-500">
                                            Credited to your partner wallet
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-[#037166]">
                                            ₹{Number(totalEarnings).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
