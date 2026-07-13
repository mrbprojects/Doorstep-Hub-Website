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

export function formatInr(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}
