import { API_BASE_URL } from '@/config/env';

const BASE_URL = `${API_BASE_URL}/service-provider`;

function headers(token, json = true) {
  const nextHeaders = {};
  if (json) nextHeaders["Content-Type"] = "application/json";
  if (token) nextHeaders.Authorization = `Bearer ${token}`;
  return nextHeaders;
}

function getMessage(payload, fallback) {
  return payload?.message || payload?.error || fallback;
}

function parseList(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.country)) return payload.country;
  if (Array.isArray(payload?.countries)) return payload.countries;
  if (Array.isArray(payload?.countrys)) return payload.countrys;
  if (Array.isArray(payload?.states)) return payload.states;
  if (Array.isArray(payload?.cities)) return payload.cities;
  if (Array.isArray(payload?.zones)) return payload.zones;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.subcategories)) return payload.subcategories;
  if (Array.isArray(payload?.services)) return payload.services;
  return [];
}

function normalizeOption(item, index) {
  const id = String(
    item?._id ??
      item?.id ??
      item?.countryId ??
      item?.countryid ??
      item?.stateId ??
      item?.stateid ??
      item?.cityId ??
      item?.cityid ??
      item?.zoneId ??
      item?.zoneid ??
      item?.serviceId ??
      item?.categoryId ??
      item?.subcategoryId ??
      index
  );
  const label =
    item?.name ||
    item?.label ||
    item?.title ||
    item?.countryName ||
    item?.stateName ||
    item?.cityName ||
    item?.zoneName ||
    item?.serviceName ||
    item?.categoryName ||
    item?.subcategoryName ||
    "Unnamed";
  return { id, label, raw: item };
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    cache: "no-store",
    ...options,
  });
  const payload = await response
    .json()
    .catch(() => ({ success: false, message: "Invalid server response" }));
  if (!response.ok) {
    const error = new Error(getMessage(payload, "Request failed"));
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function postWithGetFallback(path, token, body = {}) {
  try {
    return await request(path, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify(body),
    });
  } catch {
    return request(path, {
      method: "GET",
      headers: headers(token, false),
    });
  }
}

export async function sendWhatsAppOtp(phone) {
  const normalizedPhone = String(phone || "").replace(/\D/g, "").slice(-10);
  return request("/auth/sendWhatsAppOtp", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      phone: normalizedPhone,
      mobile: normalizedPhone,
    }),
  });
}

export async function verifyProviderOtp(phone, otp) {
  const normalizedPhone = String(phone || "").replace(/\D/g, "").slice(-10);
  const normalizedOtp = String(otp || "").replace(/\D/g, "").slice(0, 6);
  const payload = await request("/unified/verifyOTP", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      phone: normalizedPhone,
      mobile: normalizedPhone,
      otp: normalizedOtp,
      OTP: normalizedOtp,
      fcmtoken: "1234",
    }),
  });
  const token =
    payload?.token ||
    payload?.accessToken ||
    payload?.authToken ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    null;
  const userId =
    payload?.userId ||
    payload?.providerId ||
    payload?._id ||
    payload?.id ||
    payload?.data?.userId ||
    payload?.data?.providerId ||
    payload?.data?.id ||
    payload?.data?._id ||
    payload?.data?.user?._id ||
    payload?.data?.user?.id ||
    payload?.data?.provider?._id ||
    payload?.data?.provider?.id ||
    null;
  return { payload, token, userId };
}

export async function registerProvider(token, formData) {
  return request("/unified/register", {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(formData),
  });
}

export async function getProviderProfile(token, userId) {
  const payload = await request("/auth/getprofile", {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({
      userId: userId,
      uid: userId,
    }),
  });
  return payload?.data || payload?.profile || payload?.user || null;
}

export async function getServices() {
  const payload = await request("/unified/services", {
    method: "GET",
    headers: headers(undefined, false),
  });
  return parseList(payload).map(normalizeOption);
}

export async function getCategories(serviceId) {
  const payload = await request(`/unified/categories/${serviceId}`, {
    method: "GET",
    headers: headers(undefined, false),
  });
  return parseList(payload).map(normalizeOption);
}

export async function getSubcategories(categoryId) {
  const payload = await request(`/unified/subcategories/${categoryId}`, {
    method: "GET",
    headers: headers(undefined, false),
  });
  return parseList(payload).map(normalizeOption);
}

export async function getCountries(token) {
  const payload = await postWithGetFallback("/auth/getallcountrys", token, {});
  return parseList(payload).map(normalizeOption);
}

export async function getStates(token, countryId) {
  const payload = await postWithGetFallback("/auth/getstatesbycountryid", token, {
    countryId,
    countryid: countryId,
    country_id: countryId,
  });
  return parseList(payload).map(normalizeOption);
}

export async function getCities(token, countryId, stateId) {
  const payload = await postWithGetFallback("/auth/get-cities", token, {
    countryId,
    countryid: countryId,
    country_id: countryId,
    stateId,
    stateid: stateId,
    state_id: stateId,
  });
  return parseList(payload).map(normalizeOption);
}

export async function getZones(token, cityId) {
  const payload = await postWithGetFallback("/auth/getzonesbycityId", token, {
    cityId,
    cityid: cityId,
  });
  return parseList(payload).map(normalizeOption);
}

export const PROVIDER_SESSION_KEY = "provider_partner_session";

export function getStoredProviderSession() {
  if (typeof window === "undefined") return null;
  try {
    let raw = sessionStorage.getItem(PROVIDER_SESSION_KEY);
    if (!raw) {
      raw = localStorage.getItem(PROVIDER_SESSION_KEY);
      if (raw) {
        sessionStorage.setItem(PROVIDER_SESSION_KEY, raw);
        localStorage.removeItem(PROVIDER_SESSION_KEY);
      }
    }
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredProviderSession(data) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PROVIDER_SESSION_KEY, JSON.stringify(data));
  localStorage.removeItem(PROVIDER_SESSION_KEY);
}

export function clearStoredProviderSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PROVIDER_SESSION_KEY);
  localStorage.removeItem(PROVIDER_SESSION_KEY);
}

export function resolveProviderMediaUrl(path = "") {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  if (String(path).includes("default_image.jpg")) return "";
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "https://api.doorstephub.com";
  return `${base.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
}

export async function checkKycStatus(token) {
  return request("/auth/check-provider-kyc-status", {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({}),
  });
}

export async function getKyc(token) {
  return request("/auth/get-kyc", {
    method: "GET",
    headers: headers(token, false),
  });
}

export async function updateKycDocuments(token, formData) {
  const response = await fetch(`${BASE_URL}/auth/update-provider-documents`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(getMessage(payload, "KYC upload failed"));
  return payload;
}

export async function updateProviderProfile(token, formData) {
  const response = await fetch(`${BASE_URL}/auth/update-provider-to-register`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(getMessage(payload, "Profile update failed"));
  return payload;
}

export async function getSubscriptionPlans(token) {
  return request("/subscription/plans/getall", {
    method: "GET",
    headers: headers(token, false),
  });
}

export async function getSubscriptionHistory(token) {
  return request("/subscription/plans/get-history", {
    method: "GET",
    headers: headers(token, false),
  });
}

export async function purchaseSubscriptionViaWallet(token, planId) {
  return request("/subscription-purchase/purchase-via-wallet", {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ planId, plansId: planId }),
  });
}

export async function initiateSubscriptionGateway(token, planId) {
  return request("/subscription-purchase/initiate-via-gateway", {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ planId, plansId: planId }),
  });
}

export async function getProviderWalletDetails(token) {
  return request("/auth/providerHomeScreenProfile", {
    method: "GET",
    headers: headers(token, false),
  });
}

export async function getProviderWalletHistory(token) {
  return request("/wallet/getall-wallet-history", {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({}),
  });
}

export async function requestProviderWithdrawal(token, amount, bankId) {
  return request("/wallet/addwithdraw", {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ amount, bankId }),
  });
}

export function isProviderTicketOpen(status) {
  const value = String(status || "").toLowerCase();
  return !["closed", "solved", "resolved"].includes(value);
}

export function formatProviderTicketStatus(status) {
  const value = String(status || "pending").toLowerCase();
  if (value === "in-progress") return "In Progress";
  if (value === "waiting-provider") return "Awaiting Support";
  if (value === "waiting-customer") return "Awaiting Reply";
  if (value === "pending" || value === "open") return "Pending";
  if (value === "solved" || value === "resolved") return "Resolved";
  if (value === "closed") return "Closed";
  return String(status || "Pending");
}

export function getProviderTicketStatusStyle(status) {
  const value = String(status || "pending").toLowerCase();
  if (["closed", "solved", "resolved"].includes(value)) {
    return "bg-[#037166]/10 text-[#037166]";
  }
  if (value === "in-progress") {
    return "bg-blue-100 text-blue-700";
  }
  if (["waiting-provider", "waiting-customer"].includes(value)) {
    return "bg-purple-100 text-purple-700";
  }
  return "bg-amber-100 text-amber-700";
}

function normalizeProviderSupportTicket(ticket, index = 0) {
  if (!ticket || typeof ticket !== "object") return null;

  const createdAt = ticket.createdAt || ticket.logCreatedDate || "";
  const date =
    ticket.date ||
    (createdAt
      ? new Date(createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "");

  return {
    _id: String(ticket._id || ticket.id || index),
    ticketId: ticket.ticketId || ticket._id || "",
    title: ticket.title || ticket.subject || "Support Request",
    subject: ticket.subject || ticket.title || "",
    description: ticket.description || "",
    status: ticket.status || "pending",
    priority: ticket.priority || "Medium",
    department: ticket.department || "",
    date,
    time: ticket.time || "",
    createdAt,
    logCreatedDate: ticket.logCreatedDate || "",
    logModifiedDate: ticket.logModifiedDate || "",
  };
}

export function normalizeProviderSupportTickets(payload) {
  const raw = Array.isArray(payload)
    ? payload
    : [
        ...(Array.isArray(payload?.data) ? payload.data : []),
        ...(Array.isArray(payload?.tickets) ? payload.tickets : []),
        ...(Array.isArray(payload?.providerRequest) ? payload.providerRequest : []),
      ];

  const seen = new Set();
  return raw
    .map((ticket, index) => normalizeProviderSupportTicket(ticket, index))
    .filter((ticket) => {
      if (!ticket?._id || seen.has(ticket._id)) return false;
      seen.add(ticket._id);
      return true;
    });
}

export async function getProviderSupportTickets(token) {
  try {
    const payload = await request("/support-ticket/all-tickets", {
      method: "GET",
      headers: headers(token, false),
    });
    const tickets = normalizeProviderSupportTickets(payload);
    if (tickets.length > 0) {
      return { success: true, data: tickets, message: payload?.message || "" };
    }
  } catch (error) {
    if (error?.status && error.status !== 404) throw error;
  }

  const legacy = await request("/support/getallmysupport", {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({}),
  });
  return {
    success: true,
    data: normalizeProviderSupportTickets(legacy),
    message: legacy?.message || "",
  };
}

export async function getProviderSupportTicket(token, ticketId) {
  try {
    const payload = await request(`/support-ticket/ticket/${ticketId}`, {
      method: "GET",
      headers: headers(token, false),
    });
    return payload;
  } catch (error) {
    const legacy = await request("/support/getsupportbyid", {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify({ id: ticketId }),
    });
    const ticket = legacy?.data || legacy?.ticket;
    if (!ticket) throw error;
    return {
      success: true,
      data: {
        ...normalizeProviderSupportTicket(ticket),
        replies: legacy?.supportTicketChats || ticket.replies || [],
        messages: legacy?.supportTicketChats || ticket.messages || [],
      },
    };
  }
}

export async function createProviderSupportTicket(token, formData) {
  const response = await fetch(`${BASE_URL}/support-ticket/raiseTicket`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(getMessage(payload, "Failed to create ticket"));
  return payload;
}

export async function replyProviderSupportTicket(token, ticketId, message) {
  return request(`/support-ticket/ticket/${ticketId}/reply`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ message, reply: message }),
  });
}

export async function closeProviderSupportTicket(token, ticketId) {
  return request(`/support-ticket/ticket/${ticketId}/close`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({}),
  });
}

export async function requestProviderDeleteAccount(token, payload) {
  return request("/auth/request-delete-account", {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
}

export async function getMyProviderCategories(token) {
  return request("/my/categories", {
    method: "GET",
    headers: headers(token, false),
  });
}

export async function getAmcReferralConfig(token) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.doorstephub.com/v1/dhubApi";
  const response = await fetch(`${baseUrl}/app/amc-referral/config`, {
    method: "GET",
    headers: headers(token, false),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || "Failed to load AMC referral config");
  return payload;
}

export async function sendAmcReferral(token, customerId) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.doorstephub.com/v1/dhubApi";
  const response = await fetch(`${baseUrl}/app/amc-referral/send`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ customerId }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || "Failed to send AMC referral");
  return payload;
}

export async function getMyAmcReferrals(token) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.doorstephub.com/v1/dhubApi";
  const response = await fetch(`${baseUrl}/app/amc-referral/my-referrals`, {
    method: "GET",
    headers: headers(token, false),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || "Failed to load referrals list");
  return payload;
}

export async function getProviderBookings(token) {
  return request("/homescreen/get-all-my-provider-bookings", {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({}),
  });
}

export async function getProviderBookingDetails(token, bookingId) {
  const payload = await request("/services-booking/getmyproviderbookingbyid", {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ id: bookingId }),
  });
  return payload?.booking || payload?.data?.booking || payload?.data || payload;
}

export function resolveInvoiceUrl(path = "") {
  if (!path) return "";
  const trimmed = String(path).trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const base = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.doorstephub.com")
    .replace(/\/+$/, "")
    .replace(/\/v1\/dhubApi$/, "");
  return `${base}/${trimmed.replace(/^\/+/, "")}`;
}


