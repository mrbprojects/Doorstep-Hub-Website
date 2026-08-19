import { isBookNowFlatServiceSlug } from '@/lib/applianceRepairSlugs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devapis.doorstephub.com/v1/dhubApi';

function getSessionId() {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('smart_lead_session_id');
  if (!sessionId) {
    sessionId = `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem('smart_lead_session_id', sessionId);
  }
  return sessionId;
}

export function inferVertical(pathname = '') {
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
  if (path.includes('/spa-salon')) return 'spa-salon';
  if (path.includes('/religious-services')) return 'religious';
  if (path.includes('/pghostels')) return 'pghostels';
  if (path.includes('/book-appointment')) return 'crm';
  if (path.includes('/book-now') || path.includes('/service-list/book-now') || path.includes('/nearby/') || path.includes('/repair-service')) {
    return 'authorised';
  }
  const flatBookParts = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (flatBookParts.length === 2 && isBookNowFlatServiceSlug(flatBookParts[0])) {
    return 'authorised';
  }
  if (path.includes('/services')) return 'services';
  if (path.includes('/appliances')) return 'appliances';
  return 'services';
}

function persistLeadResponse(data = {}) {
  if (data?.leadId) {
    sessionStorage.setItem('smart_lead_id', data.leadId);
  }
  if (data?.data?.continueBookingUrl) {
    sessionStorage.setItem('smart_lead_continue_url', data.data.continueBookingUrl);
  }
}

function persistResumeLead(lead = {}) {
  if (!lead || typeof lead !== 'object') return;
  sessionStorage.setItem(
    'smart_lead_resume',
    JSON.stringify({
      leadId: lead._id,
      mobile: lead.mobile,
      customerName: lead.customerName,
      serviceId: lead.serviceId,
      serviceName: lead.serviceName,
      categoryId: lead.categoryId,
      categoryName: lead.categoryName,
      subCategoryId: lead.subCategoryId,
      subCategoryName: lead.subCategoryName,
      brandId: lead.brandId,
      brandName: lead.brandName,
      problemId: lead.problemId,
      problemName: lead.problemName,
      city: lead.city,
      area: lead.area,
      pincode: lead.pincode,
      vertical: lead.vertical,
      serviceType: lead.serviceType,
      lastStep: lead.lastStep,
      continueBookingUrl: lead.continueBookingUrl,
    }),
  );
  if (lead._id) sessionStorage.setItem('smart_lead_id', lead._id);
  if (lead.continueBookingUrl) sessionStorage.setItem('smart_lead_continue_url', lead.continueBookingUrl);
}

/**
 * Attach logged-in user identity for WhatsApp recovery (Phase 1).
 */
export function getLeadUserFields(user) {
  if (!user || typeof user !== 'object') return {};
  const rawMobile = user.phone || user.mobile || user.mobileNumber || '';
  let mobile = String(rawMobile).replace(/[\s+\-()]/g, '').replace(/\D/g, '');
  if (mobile.startsWith('91') && mobile.length === 12) mobile = mobile.slice(2);
  const customerName = String(
    user.name || user.customerName || [user.firstName, user.lastName].filter(Boolean).join(' ') || '',
  ).trim();
  return {
    ...(mobile.length === 10 ? { mobile } : {}),
    ...(customerName ? { customerName } : {}),
  };
}

function isBookingFunnelPath() {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname || '';
  return /\/(appliances|services|spa-salon|religious-services|pghostels|book-appointment|book-now|nearby|repair-service|service-list)/i.test(
    path,
  );
}

/** True when user is in booking flow or already has an active lead session. */
function shouldAttachVerifiedIdentity() {
  if (typeof window === 'undefined') return false;
  if (isBookingFunnelPath()) return true;
  if (sessionStorage.getItem('smart_lead_id')) return true;
  if (sessionStorage.getItem('smart_lead_resume')) return true;
  return false;
}

/**
 * Mark lead as verified + attach mobile/name.
 * Used for: existing login session, Google/Apple login, post-profile load.
 */
export function trackVerifiedUserIdentity(user, extra = {}) {
  if (!shouldAttachVerifiedIdentity()) return null;
  const userFields = getLeadUserFields(user);
  if (!userFields.mobile) return null;
  const authMethod = extra.authMethod || 'existing_session';
  return trackLeadEvent({
    eventType: 'OTP_VERIFIED',
    ...userFields,
    ...extra,
    eventData: {
      authMethod,
      isVerified: true,
      ...(extra.eventData || {}),
    },
  });
}

/** @deprecated Use trackVerifiedUserIdentity */
export function syncLoggedInLeadIdentity(user, extra = {}) {
  return trackVerifiedUserIdentity(user, { authMethod: 'existing_session', ...extra });
}

/**
 * Fire-and-forget website lead tracking.
 * Never blocks booking or payment flows.
 */
export async function trackLeadEvent(payload = {}) {
  if (typeof window === 'undefined') return null;

  const { _user, ...rest } = payload;
  const userFields = getLeadUserFields(_user);

  try {
    const vertical = rest.vertical || inferVertical();
    const response = await fetch(`${API_BASE}/web/leads/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'website',
        sessionId: getSessionId(),
        leadId: sessionStorage.getItem('smart_lead_id') || undefined,
        vertical,
        ...userFields,
        ...rest,
      }),
      keepalive: true,
    });

    const data = await response.json().catch(() => ({}));
    persistLeadResponse(data);
    return data;
  } catch (error) {
    console.debug('[smart-leads] track skipped:', error?.message || error);
    return null;
  }
}

export async function fetchResumeLead(token) {
  const response = await fetch(`${API_BASE}/web/leads/resume/${encodeURIComponent(token)}`);
  return response.json();
}

export function trackBookingCompleted(bookingId, extra = {}) {
  return trackLeadEvent({
    eventType: 'BOOKING_COMPLETED',
    ...(bookingId ? { bookingId: String(bookingId) } : {}),
    ...extra,
  });
}

export function trackPaymentStarted(extra = {}) {
  return trackLeadEvent({
    eventType: 'PAYMENT_STARTED',
    ...extra,
  });
}

export function trackPaymentFailed(extra = {}) {
  return trackLeadEvent({
    eventType: 'PAYMENT_FAILED',
    ...extra,
    eventData: {
      reason: extra.reason || 'payment_failed',
      channel: extra.channel || 'website',
      ...(extra.eventData || {}),
    },
  });
}

export async function applyLeadToken(token) {
  if (!token) return null;
  const data = await fetchResumeLead(token);
  if (!data?.success) return data;

  const lead = data?.data?.lead;
  if (lead) persistResumeLead(lead);
  return data;
}
