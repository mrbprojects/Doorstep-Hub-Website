export const ORDER_STATUS_LABELS = {
    pending: 'Pending',
    orderAcceptedByAdmin: 'Accepted',
    orderAccpetedByAdmin: 'Accepted',
    orderAcceptedBySystem: 'Auto Accepted',
    assignToProvider: 'Assigned',
    acceptedByProvider: 'Provider Accepted',
    rejectedByProvider: 'Rejected',
    appointmentConfirmedByProvider: 'Confirmed',
    onTheWay: 'On The Way',
    reachedLocation: 'Reached Location',
    workInProgress: 'In Progress',
    workIsCompleted: 'Completed',
    cancelledByUser: 'User Cancelled',
    cancelledByProvider: 'Provider Cancelled',
    rescheduleByProvider: 'Rescheduled',
    missed: 'Missed',
    sendQuotation: 'Quoted',
    quotationAccepted: 'Quote Accepted',
    quotationRejected: 'Quote Rejected',
    paymentRequested: 'Payment Requested',
    paymentReceived: 'Payment Paid',
};

export const ACTIVE_STATUSES = [
    'pending', 'orderAcceptedByAdmin', 'orderAccpetedByAdmin', 'orderAcceptedBySystem',
    'assignToProvider', 'acceptedByProvider', 'appointmentConfirmedByProvider',
    'onTheWay', 'reachedLocation', 'workInProgress', 'rescheduleByProvider',
    'sendQuotation', 'quotationAccepted', 'paymentRequested', 'paymentReceived',
];

export const COMPLETED_STATUSES = ['workIsCompleted', 'quotationRejected'];
export const CANCELLED_STATUSES = ['cancelledByUser', 'cancelledByProvider', 'rejectedByProvider'];

export function getStatusLabel(status) {
    return ORDER_STATUS_LABELS[status] || 'Pending';
}

export function getStatusStyle(status) {
    const styles = {
        pending: 'bg-amber-100 text-amber-700',
        workIsCompleted: 'bg-green-100 text-green-700',
        paymentReceived: 'bg-green-100 text-green-700',
        cancelledByUser: 'bg-red-100 text-red-700',
        cancelledByProvider: 'bg-red-100 text-red-700',
        rejectedByProvider: 'bg-red-100 text-red-700',
        missed: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-[#037166]/10 text-[#037166]';
}

export function resolveEffectiveOrderStatus(order) {
    const raw = order?.status ?? order?.orderStatus ?? 'pending';
    const paymentRequestStatus = String(order?.paymentRequest?.status || '').toLowerCase();
    if (raw === 'paymentRequested' && ['paid', 'completed'].includes(paymentRequestStatus)) {
        return 'paymentReceived';
    }
    return raw;
}

export function matchesOrderFilter(status, filter) {
    if (filter === 'all') return true;
    if (filter === 'active') return ACTIVE_STATUSES.includes(status);
    if (filter === 'completed') return COMPLETED_STATUSES.includes(status);
    if (filter === 'cancelled') return CANCELLED_STATUSES.includes(status);
    return true;
}
