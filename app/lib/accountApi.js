const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi';

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
