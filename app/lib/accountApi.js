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

export async function fetchMyOrders(token, { page = 1, limit = 10, status } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);

    const response = await fetch(`${API_BASE}/app/service-cart/get-my-orders-new?${params}`, {
        headers: bearerHeaders(token, null),
    });
    const data = await parseResponse(response);
    const payload = data?.data ?? data ?? {};
    return {
        orders: payload.orders ?? [],
        pagination: payload.pagination ?? {
            total: 0,
            page,
            limit,
            totalPages: 1,
            hasNextPage: false,
        },
    };
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
    });
    const data = await parseResponse(response);
    return data?.data ?? data;
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
