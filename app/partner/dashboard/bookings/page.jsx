'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import { getProviderBookings } from '@/lib/providerAuthApi';

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(raw) {
    if (!raw) return '—';
    try {
        const d = new Date(raw);
        if (isNaN(d.getTime())) return raw;
        return d.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch { return raw; }
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
    if (['cancelledbyuser', 'cancelledbyprovider', 'cancelled', 'lost', 'rejected'].includes(st))
        return { label: 'Cancelled', cls: 'bg-red-100 text-red-700 border-red-200', Icon: XCircle };
    if (['workiscompleted', 'completed', 'servicecompleted'].includes(st))
        return { label: 'Completed', cls: 'bg-green-100 text-green-700 border-green-200', Icon: CheckCircle2 };
    if (ls === 'follow - up' || ls === 'follow-up')
        return { label: 'Follow-Up', cls: 'bg-blue-100 text-blue-700 border-blue-200', Icon: RefreshCw };
    if (['acceptedbyprovider', 'accepted'].includes(st))
        return { label: 'Accepted', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle2 };
    return { label: 'New Lead', cls: 'bg-amber-100 text-amber-700 border-amber-200', Icon: Clock };
}

function TabBtn({ label, count, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                active
                    ? 'bg-[#037166] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            {label}{count !== undefined && count > 0 && <span className="ml-1.5 text-xs opacity-80">({count})</span>}
        </button>
    );
}

function CopyBtn({ text }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try { await navigator.clipboard.writeText(text); } catch { }
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };
    return (
        <button onClick={copy} className="ml-1 text-gray-400 hover:text-[#037166]" title="Copy">
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </button>
    );
}

// ── Booking Card ───────────────────────────────────────────────────────────────
function BookingCard({ booking }) {
    const [expanded, setExpanded] = useState(false);

    const orderId = String(booking.orderId || booking.order_id || booking.id || booking._id || '').toUpperCase();
    const customerName = booking.customerName || booking.userName || booking.user_name || 'Customer';
    const customerMobile = booking.mobileNumber || booking.userMobile || booking.user_mobile || booking.phone || '';
    const scheduledDate = booking.bookedDate || booking.date || '';
    const scheduledTime = booking.bookedTime || booking.time || '';
    const serviceName = booking.serviceName || booking.serviceNameOriginal || '—';
    const addrObj = booking.user_address || booking.userAddress || booking.address;
    const address = typeof addrObj === 'object' && addrObj
        ? addrObj.address || [addrObj.flat, addrObj.area, addrObj.cityName || addrObj.city].filter(Boolean).join(', ')
        : [booking.addressFlat, booking.addressArea, booking.cityName || booking.userCityName].filter(Boolean).join(', ') || 'Hyderabad';

    const rates = Array.isArray(booking.selectedServiceRates) ? booking.selectedServiceRates
        : Array.isArray(booking.ratecards) ? booking.ratecards : [];
    const serviceSubtotal = rates.reduce((s, r) => s + (Number(r.price || 0) * (Number(r.quantity) || 1)), 0);
    const totalEarnings = serviceSubtotal || Number(booking.amount || booking.totalAmount || 0);
    const gstAmount = Number(booking.gstAmount || 0);
    const rawPlatformFee = Number(booking.platformFee != null ? booking.platformFee : (booking.consultationFee != null ? booking.consultationFee : 0));
    const paymentRaw = String(booking.paymentMethod || booking.payment_method || 'COD').toUpperCase();
    const isCOD = paymentRaw === 'COD';
    const orderTotal = Number(booking.totalAmount || booking.total_amount || 0) || (totalEarnings + gstAmount + (isCOD ? 0 : rawPlatformFee));
    const feeDifference = orderTotal > (totalEarnings + gstAmount)
        ? Math.round((orderTotal - (totalEarnings + gstAmount)) * 100) / 100 : 0;
    const platformFee = rawPlatformFee > 0 ? rawPlatformFee : feeDifference;
    const showPlatformFee = platformFee > 0 && !isCOD;
    const customerTotal = isCOD ? (totalEarnings + gstAmount) : orderTotal;

    const { label: statusLabel, cls: statusCls, Icon: StatusIcon } = statusInfo(booking.status, booking.leadStatus);
    const receivedAt = formatDate(booking.logCreatedDate || booking.createdAt);
    const notes = Array.isArray(booking.notes) ? booking.notes : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
            {/* Card Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-gray-500 truncate">ORDER: {orderId}</span>
                    <CopyBtn text={orderId} />
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${statusCls}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusLabel}
                </span>
            </div>

            {/* Card Body */}
            <div className="px-5 py-4 space-y-3">
                <div>
                    <p className="text-sm font-extrabold text-gray-900 leading-tight">{serviceName}</p>
                    <p className="text-sm text-gray-600 mt-0.5">
                        Customer: <span className="font-semibold text-gray-900">{customerName}</span>
                    </p>
                    {customerMobile && (
                        <a href={`tel:${customerMobile}`} className="inline-flex items-center gap-1 text-sm text-[#037166] font-bold mt-1 hover:underline">
                            <Phone className="w-3.5 h-3.5" />+91 {customerMobile}
                        </a>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="line-clamp-1">{address}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Scheduled</p>
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                            <Calendar className="w-3 h-3 text-[#037166]" />
                            {formatBookingDate(scheduledDate)}{scheduledTime ? ` • ${formatTime(scheduledTime)}` : ''}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Received At</p>
                        <p className="text-xs text-gray-700">{receivedAt}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Partner Earning</p>
                        <div className="flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5 text-[#037166]" />
                            <span className="text-sm font-extrabold text-[#037166]">
                                {Number(totalEarnings).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Payment</p>
                        <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isCOD ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                            {isCOD ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                            {isCOD ? 'Cash on Service' : 'Online Paid'}
                        </div>
                    </div>
                </div>

                {booking.leadStatus && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                        <RefreshCw className="w-3 h-3" />
                        Lead Status: <span className="font-bold ml-1">{booking.leadStatus}</span>
                    </div>
                )}

                <button
                    onClick={() => setExpanded(v => !v)}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#037166] pt-1"
                >
                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {expanded ? 'Hide Details' : 'View Full Details'}
                </button>

                {expanded && (
                    <div className="pt-3 border-t border-gray-100 space-y-3">
                        {rates.length > 0 && (
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Booked Services</p>
                                <div className="space-y-1">
                                    {rates.map((r, i) => (
                                        <div key={i} className="flex justify-between text-xs text-gray-700">
                                            <span>• {r.name || r.title || 'Service'}{r.quantity ? ` (x${r.quantity})` : ''}</span>
                                            <span className="font-semibold">₹{Number(r.price || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-xs text-gray-500 border-t border-gray-100 pt-1 mt-1">
                                        <span>Service Subtotal</span>
                                        <span>₹{totalEarnings.toLocaleString('en-IN')}</span>
                                    </div>
                                    {gstAmount > 0 && (
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>GST (18%)</span>
                                            <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    {showPlatformFee && (
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Platform Fee</span>
                                            <span>₹{platformFee.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm font-extrabold text-[#037166] border-t border-[#037166]/20 pt-1.5 mt-1.5">
                                        <span>Customer Total</span>
                                        <span>₹{customerTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(booking.remarks || booking.addMoreInfo) && (
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Customer Notes</p>
                                <p className="text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                                    {booking.remarks || booking.addMoreInfo}
                                </p>
                            </div>
                        )}

                        {notes.length > 0 && (
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Partner Notes ({notes.length})</p>
                                <div className="space-y-1.5">
                                    {notes.map((n, i) => (
                                        <div key={i} className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                                            <p className="text-xs text-purple-800">{n.note || n.text || '—'}</p>
                                            {n.createdAt && (
                                                <p className="text-[10px] text-purple-400 mt-0.5">{formatDate(n.createdAt)} · {n.createdBy || 'Partner'}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {booking.cancelledReason && (
                            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                <p className="text-xs font-bold text-red-700 mb-0.5">Cancellation Reason</p>
                                <p className="text-xs text-red-600">{booking.cancelledReason}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PartnerBookingsPage() {
    const { token } = useProviderAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [newLeads, setNewLeads] = useState([]);
    const [followUp, setFollowUp] = useState([]);
    const [completed, setCompleted] = useState([]);
    const [cancelled, setCancelled] = useState([]);

    const load = async () => {
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
                if (!seen.has(id)) { seen.add(id); unique.push(item); }
            }

            const nL = [], aJ = [], cJ = [], canJ = [];
            for (const item of unique) {
                const st = String(item?.status || '').toLowerCase().replace(/[\s_-]/g, '');
                const ls = String(item?.leadStatus || '').trim();
                if (['cancelledbyuser', 'cancelledbyprovider', 'rejectedbyprovider', 'cancelled', 'lost', 'rejected'].includes(st)) {
                    canJ.push(item);
                } else if (['workiscompleted', 'completed', 'servicecompleted', 'bookingcompleted', 'closed'].includes(st)) {
                    cJ.push(item);
                } else if (ls === 'Follow - Up') {
                    aJ.push(item);
                } else {
                    nL.push(item);
                }
            }
            setNewLeads(nL); setFollowUp(aJ); setCompleted(cJ); setCancelled(canJ);
        } catch (e) {
            setError(e?.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [token]);

    const tabs = [
        { key: 'all', label: 'All', count: newLeads.length + followUp.length + completed.length + cancelled.length },
        { key: 'new', label: 'New Leads', count: newLeads.length },
        { key: 'followup', label: 'Follow-Up', count: followUp.length },
        { key: 'completed', label: 'Completed', count: completed.length },
        { key: 'cancelled', label: 'Cancelled', count: cancelled.length },
    ];

    const currentList =
        activeTab === 'new' ? newLeads
        : activeTab === 'followup' ? followUp
        : activeTab === 'completed' ? completed
        : activeTab === 'cancelled' ? cancelled
        : [...newLeads, ...followUp, ...completed, ...cancelled];

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#037166]/10 flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-[#037166]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-gray-900">My Bookings</h1>
                            <p className="text-sm text-gray-500">All professional bookings assigned to you</p>
                        </div>
                    </div>
                    <button
                        onClick={load}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#037166] text-white rounded-xl text-sm font-bold hover:bg-[#025f56] transition disabled:opacity-60"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {!loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-100">
                        {[
                            { label: 'New Leads', value: newLeads.length, color: 'text-amber-600' },
                            { label: 'Follow-Up', value: followUp.length, color: 'text-blue-600' },
                            { label: 'Completed', value: completed.length, color: 'text-green-600' },
                            { label: 'Cancelled', value: cancelled.length, color: 'text-red-600' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-gray-500 font-semibold mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            <div className="flex flex-wrap gap-2">
                {tabs.map(t => (
                    <TabBtn key={t.key} label={t.label} count={t.count} active={activeTab === t.key} onClick={() => setActiveTab(t.key)} />
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-700 font-semibold">{error}</p>
                    <button onClick={load} className="mt-3 text-sm text-red-600 underline hover:no-underline">Try again</button>
                </div>
            ) : currentList.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                    <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">No bookings found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {currentList.map(b => (
                        <BookingCard key={b._id || b.id || b.orderId} booking={b} />
                    ))}
                </div>
            )}
        </div>
    );
}
