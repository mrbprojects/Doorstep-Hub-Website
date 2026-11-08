'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
    Loader2,
    ClipboardList,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    Phone,
    MapPin,
    Calendar,
    IndianRupee,
    CreditCard,
    Banknote,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    ArrowRight,
    Search,
    Download,
    Wrench,
    Navigation,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import { getProviderBookings, resolveInvoiceUrl } from '@/lib/providerAuthApi';

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(raw) {
    if (!raw) return '—';
    try {
        const d = new Date(raw);
        if (isNaN(d.getTime())) return raw;
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return raw;
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
        return { label: 'Cancelled', cls: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', Icon: XCircle };
    }
    if (['workiscompleted', 'completed', 'servicecompleted', 'bookingcompleted', 'closed'].includes(st)) {
        return { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', Icon: CheckCircle2 };
    }
    if (['workinprogress', 'in-progress', 'inprogress', 'ongoing', 'paymentreceived'].includes(st)) {
        return { label: 'In Progress', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', Icon: Wrench };
    }
    if (['reachedlocation', 'atlocation', 'ontheway', 'started'].includes(st)) {
        return { label: 'On The Way', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500', Icon: Navigation };
    }
    if (['acceptedbyprovider', 'accepted', 'appointmentconfirmedbyprovider', 'confirmed'].includes(st)) {
        return { label: 'Accepted', cls: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500', Icon: CheckCircle2 };
    }
    if (ls === 'follow - up' || ls === 'follow-up') {
        return { label: 'Follow-Up', cls: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', Icon: RefreshCw };
    }
    return { label: 'New Lead', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', Icon: Clock };
}

function TabBtn({ label, count, active, onClick }) {
    return (
        <button
            onClick={onClick}
            type="button"
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                active
                    ? 'bg-[#037166] text-white shadow-md shadow-[#037166]/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
        >
            <span>{label}</span>
            {count !== undefined && (
                <span
                    className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                        active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    {count}
                </span>
            )}
        </button>
    );
}

function CopyBtn({ text }) {
    const [copied, setCopied] = useState(false);
    const copy = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Order ID copied');
            setTimeout(() => setCopied(false), 1800);
        } catch { }
    };
    return (
        <button
            onClick={copy}
            type="button"
            className="p-1 rounded text-gray-400 hover:text-[#037166] hover:bg-gray-100 transition"
            title="Copy Order ID"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
}

// ── Redesigned Lead Card ───────────────────────────────────────────────────────
function BusinessLeadCard({ booking }) {
    const [expanded, setExpanded] = useState(false);

    const bookingRawId = booking._id || booking.id || booking.orderId;
    const orderId = String(booking.orderId || booking.order_id || booking.id || booking._id || '').toUpperCase();
    const customerName = booking.customerName || booking.userName || booking.user_name || 'Customer';
    const customerMobile = booking.mobileNumber || booking.userMobile || booking.user_mobile || booking.phone || '';
    const scheduledDate = booking.bookedDate || booking.booking_date || booking.date || '';
    const scheduledTime = booking.bookedTime || booking.booking_time || booking.time || '';
    const serviceName = booking.serviceName || booking.serviceNameOriginal || booking.categoryName || 'Service Request';

    const addrObj = booking.user_address || booking.userAddress || booking.address;
    const address = typeof addrObj === 'object' && addrObj
        ? addrObj.address || [addrObj.flat, addrObj.area, addrObj.cityName || addrObj.city].filter(Boolean).join(', ')
        : [booking.addressFlat, booking.addressArea, booking.cityName || booking.userCityName].filter(Boolean).join(', ') || booking.location || 'Location on file';

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

    const { label: statusLabel, cls: statusCls, Icon: StatusIcon } = statusInfo(booking.status, booking.leadStatus);
    const isCompleted = ['workiscompleted', 'completed', 'servicecompleted', 'bookingcompleted', 'closed'].includes(
        String(booking.status || '').toLowerCase().replace(/[\s_-]/g, '')
    );
    const receivedAt = formatDate(booking.logCreatedDate || booking.createdAt);

    // Invoice handling
    const invoicePath = booking.providerInvoice || booking.provider_invoice || booking.invoice || booking.customerInvoice || '';
    const invoiceUrl = invoicePath ? resolveInvoiceUrl(invoicePath) : '';

    const handleInvoiceDownload = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!invoiceUrl) {
            toast.info('Invoice Pending', { description: 'Invoice is available upon service completion.' });
            return;
        }
        window.open(invoiceUrl, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 hover:border-[#037166]/40 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
        >
            {/* ── Card Header ────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 bg-slate-50/50">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-gray-600 truncate">ORDER: {orderId}</span>
                    <CopyBtn text={orderId} />
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusCls}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusLabel}
                </span>
            </div>

            {/* ── Card Body ──────────────────────────────────────── */}
            <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div>
                    {/* Service & Customer */}
                    <div className="space-y-1">
                        <Link
                            href={`/partner/dashboard/bookings/${bookingRawId}`}
                            className="text-base font-extrabold text-gray-900 leading-snug hover:text-[#037166] transition line-clamp-2"
                        >
                            {serviceName}
                        </Link>
                        <p className="text-xs sm:text-sm text-gray-600">
                            Customer: <span className="font-bold text-gray-900">{customerName}</span>
                        </p>
                    </div>

                    {/* Contact & Location */}
                    <div className="pt-2 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs">
                        {customerMobile && (
                            <a
                                href={`tel:${customerMobile}`}
                                className="inline-flex items-center gap-1 text-[#037166] font-bold hover:underline"
                            >
                                <Phone className="w-3.5 h-3.5" />
                                +91 {customerMobile}
                            </a>
                        )}
                        <div className="flex items-center gap-1 text-gray-500 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[240px] sm:max-w-xs">{address}</span>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-gray-100">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                                Scheduled
                            </span>
                            <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                                <Calendar className="w-3.5 h-3.5 text-[#037166] shrink-0" />
                                <span className="truncate">{formatBookingDate(scheduledDate)}</span>
                            </div>
                            {scheduledTime && (
                                <span className="text-[11px] text-gray-500 block ml-4">
                                    {formatTime(scheduledTime)}
                                </span>
                            )}
                        </div>

                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                                Received At
                            </span>
                            <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="truncate">{receivedAt}</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                                Partner Earning
                            </span>
                            <div className="flex items-center gap-0.5">
                                <IndianRupee className="w-3.5 h-3.5 text-[#037166]" />
                                <span className="text-base font-black text-[#037166]">
                                    {Number(totalEarnings).toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                                Payment Mode
                            </span>
                            <div
                                className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                                    isCOD
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                            >
                                {isCOD ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                                <span>{isCOD ? 'Cash on Service' : 'Online Paid'}</span>
                            </div>
                        </div>
                    </div>

                    {booking.leadStatus && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50/70 border border-blue-100 px-3 py-1.5 rounded-xl">
                            <RefreshCw className="w-3 h-3 shrink-0" />
                            <span>Lead Status: <strong className="ml-0.5">{booking.leadStatus}</strong></span>
                        </div>
                    )}
                </div>

                {/* Inline Collapsible Preview */}
                {expanded && (
                    <div className="pt-3 border-t border-gray-100 space-y-2.5 text-xs bg-slate-50/60 p-3 rounded-xl mt-2">
                        {rates.length > 0 && (
                            <div>
                                <p className="font-bold text-gray-600 mb-1">Services List:</p>
                                <div className="space-y-1">
                                    {rates.map((r, i) => (
                                        <div key={i} className="flex justify-between text-gray-700">
                                            <span className="truncate">• {r.name || r.title || 'Service'}{r.quantity ? ` (x${r.quantity})` : ''}</span>
                                            <span className="font-semibold ml-2">₹{Number(r.price || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1 mt-1">
                                        <span>Order Total:</span>
                                        <span>₹{Number(orderTotal).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {(booking.remarks || booking.addMoreInfo) && (
                            <div>
                                <p className="font-bold text-gray-600 mb-0.5">Customer Notes:</p>
                                <p className="text-gray-700 bg-white p-2 rounded border border-gray-200">
                                    {booking.remarks || booking.addMoreInfo}
                                </p>
                            </div>
                        )}
                        {booking.cancelledReason && (
                            <div className="text-red-700 bg-red-50 p-2 rounded border border-red-200">
                                <strong>Reason: </strong>{booking.cancelledReason}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Action Buttons Footer ──────────────────────────── */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 mt-auto">
                    {/* Toggle quick summary */}
                    <button
                        type="button"
                        onClick={() => setExpanded((v) => !v)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition py-1"
                    >
                        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>{expanded ? 'Hide Summary' : 'Summary'}</span>
                    </button>

                    <div className="flex items-center gap-2 ml-auto">
                        {/* Direct Invoice Download button if completed */}
                        {isCompleted && invoiceUrl && (
                            <button
                                type="button"
                                onClick={handleInvoiceDownload}
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-2xs"
                                title="Download Invoice PDF"
                            >
                                <Download className="w-3.5 h-3.5 text-[#037166]" />
                                <span className="hidden sm:inline">Invoice</span>
                            </button>
                        )}

                        {/* View Details Lead Button */}
                        <Link
                            href={`/partner/dashboard/bookings/${bookingRawId}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#037166] text-white text-xs font-bold hover:bg-[#025f56] shadow-sm shadow-[#037166]/20 transition active:scale-98"
                        >
                            <span>View Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ── Main Bookings Page ─────────────────────────────────────────────────────────
export default function PartnerBookingsPage() {
    const { token } = useProviderAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [newLeads, setNewLeads] = useState([]);
    const [followUp, setFollowUp] = useState([]);
    const [completed, setCompleted] = useState([]);
    const [cancelled, setCancelled] = useState([]);

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getProviderBookings(token);
            const payload = res?.data && !Array.isArray(res?.data) ? res.data : res;
            const newRaw = Array.isArray(payload?.newbookings) ? payload.newbookings
                : Array.isArray(payload?.newBookings) ? payload.newBookings : [];
            const completedRaw = Array.isArray(payload?.workIsCompleted) ? payload.workIsCompleted
                : Array.isArray(payload?.completedBookings) ? payload.completedBookings : [];
            const cancelledRaw = Array.isArray(payload?.cancelledBookings) ? payload.cancelledBookings : [];
            const lostRaw = Array.isArray(payload?.lostbookings) ? payload.lostbookings
                : Array.isArray(payload?.lostBookings) ? payload.lostBookings : [];

            let rawList = Array.isArray(res) ? res
                : Array.isArray(res?.data) ? res.data
                : Array.isArray(res?.bookings) ? res.bookings
                : [...newRaw, ...completedRaw, ...cancelledRaw, ...lostRaw];

            const allItems = [...rawList, ...newRaw, ...completedRaw, ...cancelledRaw, ...lostRaw];
            const seen = new Set();
            const unique = [];
            for (const item of allItems) {
                if (!item) continue;
                const id = String(item._id || item.id || item.orderId || Math.random());
                if (!seen.has(id)) {
                    seen.add(id);
                    unique.push(item);
                }
            }

            const nL = [], aJ = [], cJ = [], canJ = [];
            for (const item of unique) {
                const st = String(item?.status || '').toLowerCase().replace(/[\s_-]/g, '');
                const ls = String(item?.leadStatus || '').trim();
                if (['cancelledbyuser', 'cancelledbyprovider', 'rejectedbyprovider', 'cancelled', 'lost', 'rejected'].includes(st)) {
                    canJ.push(item);
                } else if (['workiscompleted', 'completed', 'servicecompleted', 'bookingcompleted', 'closed'].includes(st)) {
                    cJ.push(item);
                } else if (ls === 'Follow - Up' || ls === 'follow - up') {
                    aJ.push(item);
                } else {
                    nL.push(item);
                }
            }
            setNewLeads(nL);
            setFollowUp(aJ);
            setCompleted(cJ);
            setCancelled(canJ);
        } catch (e) {
            setError(e?.message || 'Failed to load business leads');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;
        let activeMount = true;
        getProviderBookings(token)
            .then((res) => {
                if (!activeMount) return;
                const payload = res?.data && !Array.isArray(res?.data) ? res.data : res;
                const newRaw = Array.isArray(payload?.newbookings) ? payload.newbookings
                    : Array.isArray(payload?.newBookings) ? payload.newBookings : [];
                const completedRaw = Array.isArray(payload?.workIsCompleted) ? payload.workIsCompleted
                    : Array.isArray(payload?.completedBookings) ? payload.completedBookings : [];
                const cancelledRaw = Array.isArray(payload?.cancelledBookings) ? payload.cancelledBookings : [];
                const lostRaw = Array.isArray(payload?.lostbookings) ? payload.lostbookings
                    : Array.isArray(payload?.lostBookings) ? payload.lostBookings : [];

                let rawList = Array.isArray(res) ? res
                    : Array.isArray(res?.data) ? res.data
                    : Array.isArray(res?.bookings) ? res.bookings
                    : [...newRaw, ...completedRaw, ...cancelledRaw, ...lostRaw];

                const allItems = [...rawList, ...newRaw, ...completedRaw, ...cancelledRaw, ...lostRaw];
                const seen = new Set();
                const unique = [];
                for (const item of allItems) {
                    if (!item) continue;
                    const id = String(item._id || item.id || item.orderId || Math.random());
                    if (!seen.has(id)) {
                        seen.add(id);
                        unique.push(item);
                    }
                }

                const nL = [], aJ = [], cJ = [], canJ = [];
                for (const item of unique) {
                    const st = String(item?.status || '').toLowerCase().replace(/[\s_-]/g, '');
                    const ls = String(item?.leadStatus || '').trim();
                    if (['cancelledbyuser', 'cancelledbyprovider', 'rejectedbyprovider', 'cancelled', 'lost', 'rejected'].includes(st)) {
                        canJ.push(item);
                    } else if (['workiscompleted', 'completed', 'servicecompleted', 'bookingcompleted', 'closed'].includes(st)) {
                        cJ.push(item);
                    } else if (ls === 'Follow - Up' || ls === 'follow - up') {
                        aJ.push(item);
                    } else {
                        nL.push(item);
                    }
                }
                setNewLeads(nL);
                setFollowUp(aJ);
                setCompleted(cJ);
                setCancelled(canJ);
            })
            .catch((e) => {
                if (activeMount) setError(e?.message || 'Failed to load business leads');
            })
            .finally(() => {
                if (activeMount) setLoading(false);
            });
        return () => { activeMount = false; };
    }, [token]);

    const totalCount = newLeads.length + followUp.length + completed.length + cancelled.length;

    const tabs = [
        { key: 'all', label: 'All', count: totalCount },
        { key: 'new', label: 'New Leads', count: newLeads.length },
        { key: 'followup', label: 'Follow-Up', count: followUp.length },
        { key: 'completed', label: 'Completed', count: completed.length },
        { key: 'cancelled', label: 'Cancelled', count: cancelled.length },
    ];

    const currentTabList = useMemo(() => {
        if (activeTab === 'new') return newLeads;
        if (activeTab === 'followup') return followUp;
        if (activeTab === 'completed') return completed;
        if (activeTab === 'cancelled') return cancelled;
        return [...newLeads, ...followUp, ...completed, ...cancelled];
    }, [activeTab, newLeads, followUp, completed, cancelled]);

    // Search Filtering
    const filteredList = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return currentTabList;
        return currentTabList.filter((b) => {
            const orderId = String(b.orderId || b.id || b._id || '').toLowerCase();
            const customer = String(b.customerName || b.userName || '').toLowerCase();
            const phone = String(b.mobileNumber || b.userMobile || b.phone || '').toLowerCase();
            const service = String(b.serviceName || b.categoryName || '').toLowerCase();
            const loc = String(b.address || b.addressArea || b.cityName || '').toLowerCase();
            return (
                orderId.includes(q) ||
                customer.includes(q) ||
                phone.includes(q) ||
                service.includes(q) ||
                loc.includes(q)
            );
        });
    }, [currentTabList, searchQuery]);

    return (
        <div className="space-y-6 pb-12">
            {/* ── Top Header Hero ────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-5"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#037166]/10 text-[#037166] flex items-center justify-center shrink-0">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                My Business Leads
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                All verified customer leads and service bookings assigned to you
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={load}
                        disabled={loading}
                        type="button"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#037166] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#025f56] transition shadow-sm disabled:opacity-60 shrink-0"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh Leads</span>
                    </button>
                </div>

                {/* Stats Counters */}
                {!loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                        {[
                            { label: 'New Leads', value: newLeads.length, color: 'text-amber-600', bg: 'bg-amber-50/60' },
                            { label: 'Follow-Up', value: followUp.length, color: 'text-blue-600', bg: 'bg-blue-50/60' },
                            { label: 'Completed', value: completed.length, color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
                            { label: 'Cancelled', value: cancelled.length, color: 'text-red-600', bg: 'bg-red-50/60' },
                        ].map((s) => (
                            <div key={s.label} className={`p-3.5 rounded-xl border border-gray-100 text-center ${s.bg}`}>
                                <p className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-gray-600 font-bold mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* ── Filters & Search Bar ───────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {tabs.map((t) => (
                        <TabBtn
                            key={t.key}
                            label={t.label}
                            count={t.count}
                            active={activeTab === t.key}
                            onClick={() => setActiveTab(t.key)}
                        />
                    ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-80 shrink-0">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search lead or order ID..."
                        className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#037166]/30 focus:border-[#037166] text-gray-900 placeholder:text-gray-400 transition"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Leads List View ────────────────────────────────────────── */}
            {loading ? (
                <div className="min-h-[40vh] flex flex-col items-center justify-center py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#037166] mb-3" />
                    <p className="text-sm font-bold text-gray-600">Loading your leads...</p>
                    <p className="text-xs text-gray-400 mt-0.5">Fetching latest leads and bookings</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
                    <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-red-900">Failed to load leads</h3>
                    <p className="text-xs text-red-700 mt-1">{error}</p>
                    <button
                        onClick={load}
                        type="button"
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            ) : filteredList.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                        <ClipboardList className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">No leads found</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        {searchQuery
                            ? `No business leads match your search "${searchQuery}". Try a different keyword.`
                            : `There are currently no leads in the "${activeTab}" category.`}
                    </p>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="text-xs font-bold text-[#037166] hover:underline"
                        >
                            Clear search filter
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                    {filteredList.map((b) => (
                        <BusinessLeadCard key={b._id || b.id || b.orderId} booking={b} />
                    ))}
                </div>
            )}
        </div>
    );
}
