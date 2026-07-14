/**
 * Public AMC API helpers for the website.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

async function parseJsonResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  if (!contentType.includes('application/json')) {
    throw new Error(
      res.status === 404
        ? 'AMC API not available on this server yet. Please deploy the latest backend.'
        : `AMC API returned non-JSON (HTTP ${res.status}).`
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid AMC API response');
  }
}

export async function fetchAmcPlans() {
  if (!API_BASE) throw new Error('API base URL is not configured');
  const res = await fetch(`${API_BASE}/app/amc/plans`, { cache: 'no-store' });
  const json = await parseJsonResponse(res);
  if (!json?.success) throw new Error(json?.message || 'Failed to load AMC plans');
  return Array.isArray(json.plans) ? json.plans : Array.isArray(json.data) ? json.data : [];
}

export async function fetchAmcPlanBySlug(slug) {
  if (!API_BASE) throw new Error('API base URL is not configured');
  const res = await fetch(`${API_BASE}/app/amc/plans/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  const json = await parseJsonResponse(res);
  if (!json?.success) throw new Error(json?.message || 'AMC plan not found');
  return json.plan || json.data || null;
}

/**
 * Fetch logged-in user's AMC purchases (active + history).
 * GET /app/amc/my
 */
export async function fetchMyAmcPurchases({ userId, phone, token } = {}) {
  if (!API_BASE) {
    return { success: false, hasActiveAmc: false, active: [], purchases: [] };
  }

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const params = new URLSearchParams();
  if (userId) params.set('userId', String(userId));
  if (phone) params.set('phone', String(phone).replace(/\D/g, '').slice(-10));

  const qs = params.toString();
  try {
    const res = await fetch(`${API_BASE}/app/amc/my${qs ? `?${qs}` : ''}`, {
      headers,
      cache: 'no-store',
    });
    const json = await parseJsonResponse(res);
    if (!json?.success) {
      return { success: false, hasActiveAmc: false, active: [], purchases: [] };
    }
    return {
      success: true,
      hasActiveAmc: !!json.hasActiveAmc,
      active: Array.isArray(json.active) ? json.active : [],
      purchases: Array.isArray(json.purchases) ? json.purchases : [],
      history: Array.isArray(json.history) ? json.history : [],
    };
  } catch {
    return { success: false, hasActiveAmc: false, active: [], purchases: [] };
  }
}

export async function submitAmcEnquiry(payload) {
  if (!API_BASE) throw new Error('API base URL is not configured');
  const res = await fetch(`${API_BASE}/app/amc/enquiry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await parseJsonResponse(res);
  if (!json?.success) throw new Error(json?.message || 'Could not submit enquiry');
  return json;
}

export async function initiateAmcPayment(payload, token) {
  if (!API_BASE) throw new Error('API base URL is not configured');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/app/amc/initiate-payment`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const json = await parseJsonResponse(res);
  if (!json?.success || !json?.access_key) {
    throw new Error(json?.message || 'Could not start AMC payment');
  }
  return json;
}

/**
 * Check if a logged-in user's active AMC covers the selected on-demand service.
 * POST /app/amc/check-eligibility
 */
export async function checkAmcEligibility({
  userId,
  serviceId,
  categoryId,
  subcategoryId,
  phone,
  token,
} = {}) {
  if (!API_BASE) return { success: false, amcApplicable: false };
  if ((!userId && !phone) || !serviceId) {
    return {
      success: false,
      amcApplicable: false,
      message: 'userId/phone and serviceId are required',
    };
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}/app/amc/check-eligibility`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        phone,
        serviceId,
        ondemandServiceId: serviceId,
        ...(categoryId ? { categoryId } : {}),
        ...(subcategoryId ? { subcategoryId } : {}),
      }),
      cache: 'no-store',
    });
    const json = await parseJsonResponse(res);
    return {
      success: !!json?.success,
      amcApplicable: !!json?.amcApplicable,
      limitExhausted: !!json?.limitExhausted,
      purchaseId: json?.purchaseId || null,
      planName: json?.planName || '',
      benefitTitle: json?.benefitTitle || '',
      remaining: json?.remaining ?? null,
      total: json?.total ?? null,
      used: json?.used ?? null,
      unlimited: !!json?.unlimited,
      message: json?.message || '',
    };
  } catch {
    return { success: false, amcApplicable: false, limitExhausted: false };
  }
}

export function formatInr(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}
