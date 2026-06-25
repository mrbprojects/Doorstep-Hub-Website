const BASE_URL = "https://api.doorstephub.com/v1/dhubApi/service-provider";

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
