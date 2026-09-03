'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ArrowLeft, Calendar, Clock, Loader2, MapPin, Package, Phone, User,
    CheckCircle, CreditCard, IndianRupee, Tag, Layers, Building2, Receipt,
    ChevronDown, ChevronUp, AlertCircle, Home, Hash
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchOrderDetail, resolveMediaUrl } from '@/lib/accountApi';
import { getStatusLabel, getStatusStyle, resolveEffectiveOrderStatus } from '@/lib/orderStatus';

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

// ─── Status Timeline ─────────────────────────────────────────────────────────

function StatusTimeline({ history = [] }) {
    const [expanded, setExpanded] = useState(false);
    if (!history || history.length === 0) return null;

    const shown = expanded ? history : history.slice(-3);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#037166]" />
                    Status History
                </h2>
                {history.length > 3 && (
                    <button
                        onClick={() => setExpanded(e => !e)}
                        className="text-xs text-[#037166] font-semibold flex items-center gap-1 hover:underline"
                    >
                        {expanded ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Show all ({history.length})</>}
                    </button>
                )}
            </div>
            <ol className="relative border-l-2 border-[#037166]/20 ml-2 space-y-3">
                {shown.map((h, idx) => (
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

    const isPaidOnline = ['paid', 'completed'].includes(String(paymentStatus || '').toLowerCase()) ||
        String(paymentMethod || '').toUpperCase() === 'ONLINE';
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

    const orderId = order?.orderId || '';
    const bookedDate = fmtDate(order?.bookedDate);
    const bookedTime = fmtTime(order?.bookedTime);
    const customerPhone = order?.mobileNumber || order?.userPhone || order?.phone || null;
    const statusHistory = order?.statusHistory || [];
    const createdAt = order?.createdAt || order?.logCreatedDate || null;

    const categoryName = order?.categoryName || order?.subcategoryName || null;

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

                            {/* Status History */}
                            <StatusTimeline history={statusHistory} />
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
                </div>
            )}
        </div>
    );
}
