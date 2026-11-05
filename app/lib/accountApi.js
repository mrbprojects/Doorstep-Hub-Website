import { API_BASE_URL as API_BASE } from '@/config/env';

function bearerHeaders(token, contentType = 'application/json') {
    const headers = { Authorization: `Bearer ${token}` };
    if (contentType) headers['Content-Type'] = contentType;
    return headers;
}

async function parseResponse(response) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
        const err = new Error('Unauthorized');
        err.status = 401;
        throw err;
    }
    return data;
}

function resolveFirstServiceName(json = {}) {
    return (
        json.firstServiceName ||
        json.subcategoryName ||
        json.subCategoryName ||
        json.serviceName ||
        json.categoryName ||
        json.service_name ||
        json.name ||
        null
    );
}

function resolveServiceItemName(service = {}) {
    return (
        service.name ||
        service.serviceName ||
        service.subcategoryName ||
        service.categoryName ||
        service.title ||
        ''
    );
}

function resolveServiceItemImage(service = {}) {
    return service.image || service.serviceImage || service.logo || service.thumbnail || service.photo || '';
}

export function parseOrder(json = {}) {
    const rawServices = Array.isArray(json.services) ? json.services : [];
    const rootName = resolveFirstServiceName(json);
    const services =
        rawServices.length > 0
            ? rawServices.map((service) => ({
                  id: service.id || service.serviceId || '',
                  name: resolveServiceItemName(service),
                  image: resolveServiceItemImage(service),
                  price: service.price ?? service.servicePrice ?? 'N/A',
                  quantity: service.quantity || 1,
              }))
            : rootName
              ? [
                    {
                        id: '',
                        name: rootName,
                        image: json.firstServiceImage || json.serviceImage || '',
                        price: 'N/A',
                        quantity: 1,
                    },
                ]
              : [];

    return {
        bookingId: String(json.bookingId || json._id || ''),
        orderId: json.orderId || '',
        status: json.status || json.orderStatus || 'pending',
        partnerType: json.partnerType || '',
        providerName: json.providerName || json.provider?.name || json.provider?.providerName || null,
        providerPhone: json.providerPhone || json.provider?.phone || null,
        providerLogo: json.providerLogo || json.provider?.logo || null,
        mobileNumber: json.mobileNumber || '',
        bookedDate: json.bookedDate || null,
        bookedTime: json.bookedTime || null,
        createdAt: json.createdAt || null,
        advancePaid: Number(json.advancePaid || 0),
        pendingAmount: Number(json.pendingAmount || 0),
        totalAmount: json.payment?.totalAmount ?? json.totalAmount ?? null,
        services,
        paymentRequest: json.paymentRequest || null,
    };
}

function normalizePagination(pagination = {}, page, limit, totalFallback = 0) {
    return {
        total: pagination.totalOrders ?? pagination.total ?? totalFallback,
        page: pagination.currentPage ?? pagination.page ?? page,
        limit: pagination.limit ?? limit,
        totalPages: pagination.totalPages ?? 1,
        hasNextPage: Boolean(pagination.hasNextPage),
        hasPrevPage: Boolean(pagination.hasPrevPage),
    };
}

export async function fetchMyOrders(token, { page = 1, limit = 10, status } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);

    const response = await fetch(`${API_BASE}/app/service-cart/get-my-orders-new?${params}`, {
        headers: bearerHeaders(token, null),
        cache: 'no-store',
    });
    const data = await parseResponse(response);
    if (!response.ok || data?.success === false) {
        throw new Error(data?.message || 'Failed to fetch orders');
    }
    const payload = data?.data ?? data ?? {};
    const rawOrders = Array.isArray(payload.orders) ? payload.orders : Array.isArray(data.orders) ? data.orders : [];

    return {
        orders: rawOrders.map(parseOrder),
        pagination: normalizePagination(payload.pagination ?? data.pagination, page, limit, rawOrders.length),
    };
}

export async function fetchOrderDetail(token, bookingId) {
    const response = await fetch(`${API_BASE}/app/service-cart/get-order-detail-by-booking-id/${bookingId}`, {
        headers: bearerHeaders(token, null),
        cache: 'no-store',
    });
    const data = await parseResponse(response);
    if (!response.ok || data?.success === false) {
        throw new Error(data?.message || 'Failed to fetch order details');
    }
    const payload = data?.data ?? data ?? {};
    return payload.order || payload.booking || payload;
}

export async function cancelBookingService(token, bookingId, { cancelledReason, paymentOption = '' }) {
    const response = await fetch(`${API_BASE}/app/servicebooking/cancel-booking/${bookingId}`, {
        method: 'POST',
        headers: bearerHeaders(token),
        body: JSON.stringify({ cancelledReason, paymentOption }),
    });
    return parseResponse(response);
}

export async function initiateCancellationFeePayment(token, bookingId, { cancelledReason, websiteReturnUrl, websiteCancelUrl }) {
    const response = await fetch(`${API_BASE}/app/servicebooking/initiate-cancellation-fee/${bookingId}`, {
        method: 'POST',
        headers: bearerHeaders(token),
        body: JSON.stringify({ cancelledReason, websiteReturnUrl, websiteCancelUrl }),
    });
    return parseResponse(response);
}

export async function fetchWalletBalance(token) {
    const response = await fetch(`${API_BASE}/app/wallet/balance`, {
        headers: bearerHeaders(token, null),
    });
    return parseResponse(response);
}

export async function fetchWalletTransactions(token) {
    const response = await fetch(`${API_BASE}/app/wallet/transactions`, {
        headers: bearerHeaders(token, null),
    });
    return parseResponse(response);
}

export async function initiateWalletTopup(token, amount, returnUrl) {
    const response = await fetch(`${API_BASE}/app/wallet/topup/initiate`, {
        method: 'POST',
        headers: bearerHeaders(token, 'application/json'),
        body: JSON.stringify({
            amount: Number(amount),
            returnUrl: returnUrl || (typeof window !== 'undefined' ? `${window.location.origin}/account/wallet` : ''),
        }),
    });
    return parseResponse(response);
}

export async function fetchWalletTopupStatus(token, txnid) {
    const response = await fetch(`${API_BASE}/app/wallet/topup/status/${txnid}`, {
        headers: bearerHeaders(token, null),
    });
    return parseResponse(response);
}

export async function fetchReferralDetails(token) {
    const response = await fetch(`${API_BASE}/app/referrals/me`, {
        headers: bearerHeaders(token, null),
        cache: 'no-store',
    });
    const data = await parseResponse(response);
    const payload = data?.data ?? data ?? {};
    const referrals = Array.isArray(payload.referrals) ? payload.referrals : [];

    return {
        referralCode: payload.referralCode || '',
        rewardAmount: Number(payload.rewardAmount ?? 99),
        totalEarnings: Number(payload.totalEarnings ?? 0),
        totalReferrals: Number(payload.totalReferrals ?? referrals.length ?? 0),
        canApplyReferral: Boolean(payload.canApplyReferral),
        referredByCode: payload.referredByCode || '',
        referrals: referrals.map((item, idx) => ({
            id: item.id || item._id || `referral-${idx}`,
            name: item.name || item.referredName || 'Customer',
            phone: item.phone || item.referredPhone || '',
            status: item.status || 'Pending',
            rewardAmount: Number(item.rewardAmount || 0),
            earnedAmount: Number(item.earnedAmount || 0),
            appliedAt: item.appliedAt || null,
            firstQualifiedAt: item.firstQualifiedAt || null,
        })),
    };
}

export async function fetchSupportTickets(token) {
    const response = await fetch(`${API_BASE}/app/usersupport/getalluserrequest`, {
        method: 'POST',
        headers: bearerHeaders(token),
        body: JSON.stringify({}),
    });
    return parseResponse(response);
}

export async function fetchSupportTicketById(token, ticketId) {
    const response = await fetch(`${API_BASE}/app/usersupport/getusersupportbyid/${ticketId}`, {
        method: 'POST',
        headers: bearerHeaders(token),
        body: JSON.stringify({}),
    });
    return parseResponse(response);
}

export async function createSupportTicket(token, formData) {
    const response = await fetch(`${API_BASE}/app/usersupport/addusersupport`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    return parseResponse(response);
}

export async function replySupportTicket(token, ticketId, message) {
    const response = await fetch(`${API_BASE}/app/usersupport/replyusersupport/${ticketId}`, {
        method: 'POST',
        headers: bearerHeaders(token),
        body: JSON.stringify({ message }),
    });
    return parseResponse(response);
}

export async function closeSupportTicket(token, ticketId) {
    const response = await fetch(`${API_BASE}/app/usersupport/closeusersupport/${ticketId}`, {
        method: 'POST',
        headers: bearerHeaders(token),
        body: JSON.stringify({}),
    });
    return parseResponse(response);
}

export async function submitAccountDeletionRequest(payload) {
    const response = await fetch(`${API_BASE}/web/account-deletion/verify-and-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return response.json();
}

export async function sendAccountDeletionOtp(mobileNumber) {
    const response = await fetch(`${API_BASE}/web/account-deletion/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber }),
    });
    return response.json();
}

export function resolveMediaUrl(path = '') {
    if (!path) return '';
    if (String(path).startsWith('http')) return path;
    const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com';
    return `${base.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
}

export async function reinitiateServiceBookingPayment(token, bookingId) {
    const response = await fetch(`${API_BASE}/app/applience-repairs-website/reinitiate-service-booking-payment`, {
        method: 'POST',
        headers: bearerHeaders(token),
        body: JSON.stringify({ bookingId }),
    });
    return parseResponse(response);
}

export async function payPlatformFee(token, bookingId, { paymentMethod = 'ONLINE', websiteReturnUrl, websiteCancelUrl } = {}) {
    const response = await fetch(`${API_BASE}/app/servicebooking/pay-platform-fee/${bookingId}`, {
        method: 'POST',
        headers: bearerHeaders(token),
        body: JSON.stringify({ paymentMethod, websiteReturnUrl, websiteCancelUrl }),
    });
    return parseResponse(response);
}

/**
 * Authoritatively verifies booking payment status with backend.
 * Uses authenticated orderId and txnid references; never trusts client-only parameters.
 */
export async function verifyBookingPaymentStatus(token, { orderId, txnid } = {}) {
    if (!token) {
        return { success: false, status: 'unauthorized', message: 'Authentication required to verify payment' };
    }
    if (!orderId && !txnid) {
        return { success: false, status: 'missing_reference', message: 'No booking or transaction reference found' };
    }

    try {
        // Priority 1: Check by txnid if available (this also invokes live backend Easebuzz reconciliation if needed)
        if (txnid) {
            try {
                const txnRes = await fetch(`${API_BASE}/app/service-cart/payment-status/${encodeURIComponent(txnid)}`, {
                    headers: bearerHeaders(token, null),
                    cache: 'no-store'
                });
                if (txnRes.ok) {
                    const data = await parseResponse(txnRes);
                    if (data?.success) {
                        const isPaid = Boolean(data.paid || ['paid', 'completed'].includes(String(data.status || '').toLowerCase()));
                        return {
                            success: true,
                            isPaid,
                            status: isPaid ? 'paid' : (data.status || 'pending'),
                            orderId: data.orderId || orderId,
                            totalAmount: data.totalAmount,
                            reconciled: Boolean(data.reconciled)
                        };
                    }
                } else if (txnRes.status === 401 || txnRes.status === 403) {
                    return { success: false, status: 'unauthorized', message: 'Session expired or unauthorized' };
                }
            } catch (txnErr) {
                console.warn('payment-status by txnid failed, falling back to orderId check', txnErr);
            }
        }

        // Priority 2: Check by orderId
        if (orderId) {
            const orderRes = await fetch(`${API_BASE}/app/service-cart/payment-status-by-order/${encodeURIComponent(orderId)}`, {
                headers: bearerHeaders(token, null),
                cache: 'no-store'
            });
            if (orderRes.ok) {
                const data = await parseResponse(orderRes);
                if (data?.success) {
                    const isPaid = Boolean(data.isPaid || ['paid', 'completed'].includes(String(data.paymentStatus || '').toLowerCase()));
                    return {
                        success: true,
                        isPaid,
                        status: isPaid ? 'paid' : (data.paymentStatus || data.orderStatus || 'pending'),
                        orderId: data.orderId || orderId
                    };
                }
            } else if (orderRes.status === 401 || orderRes.status === 403) {
                return { success: false, status: 'unauthorized', message: 'Session expired or unauthorized' };
            }

            // Fallback: Fetch order details directly via get-order-detail-by-booking-id
            const detailRes = await fetch(`${API_BASE}/app/service-cart/get-order-detail-by-booking-id/${encodeURIComponent(orderId)}`, {
                headers: bearerHeaders(token, null),
                cache: 'no-store'
            });
            if (detailRes.ok) {
                const data = await parseResponse(detailRes);
                const order = data?.data?.order || data?.data?.booking || data?.order || data?.booking || data?.data || data;
                if (order && (order._id || order.orderId)) {
                    const paymentStatus = String(order.paymentStatus || '').toLowerCase();
                    const isPaid = ['paid', 'completed'].includes(paymentStatus);
                    return {
                        success: true,
                        isPaid,
                        status: isPaid ? 'paid' : (order.paymentStatus || order.status || 'pending'),
                        orderId: order.orderId || order._id
                    };
                }
            } else if (detailRes.status === 401 || detailRes.status === 403) {
                return { success: false, status: 'unauthorized', message: 'Session expired or unauthorized' };
            }
        }

        return { success: false, status: 'not_found', message: 'Payment record not found for this account' };
    } catch (err) {
        console.error('Error verifying payment status:', err);
        return { success: false, status: 'network_error', message: err?.message || 'Unable to connect to verification server' };
    }
}



