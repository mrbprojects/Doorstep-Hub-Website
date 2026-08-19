import { API_BASE_URL as API_BASE, IMAGE_BASE_URL as IMAGE_BASE, getImageUrl, GOOGLE_MAPS_API_KEY } from '@/config/env';

export { getImageUrl, API_BASE, IMAGE_BASE };

/**
 * Normalize category response from either:
 *  - eclassify format:  { error: false, data: { data: [...] } }
 *  - native format:     { success: true, data: [...] }
 */
const normalizeCategoryResponse = (data) => {
  if (!data) return [];
  // eclassify format
  if (data.error === false && data.data) {
    const inner = data.data;
    if (Array.isArray(inner.data)) return inner.data;
    if (Array.isArray(inner)) return inner;
  }
  // native format
  if (data.success && data.data) {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.data?.data)) return data.data.data;
  }
  return [];
};

/**
 * Normalize listing response from either:
 *  - eclassify format:  { error: false, data: { current_page, data: [...], total, last_page } }
 *  - native format:     { success: true, data: [...], meta: { total, page, limit, totalPages } }
 */
const normalizeListingResponse = (data) => {
  if (!data) return { listings: [], meta: {} };
  // eclassify format
  if (data.error === false && data.data) {
    const inner = data.data;
    if (Array.isArray(inner.data)) {
      return {
        listings: inner.data,
        meta: {
          total: inner.total || 0,
          page: inner.current_page || 1,
          limit: 20,
          totalPages: inner.last_page || 1,
        },
      };
    }
  }
  // native format
  if (data.success && data.data) {
    const listings = Array.isArray(data.data) ? data.data : [];
    return {
      listings,
      meta: data.meta || {},
    };
  }
  return { listings: [], meta: {} };
};

// ─── Categories ──────────────────────────────────────────────────────────────

export const fetchSellBuyCategories = async () => {
  try {
    const res = await fetch(`${API_BASE}/sell-buy/get-categories`, { cache: 'no-store' });
    const data = await res.json();
    return normalizeCategoryResponse(data);
  } catch (err) {
    console.error('Error fetching sell-buy categories:', err);
    return [];
  }
};

export const fetchSellBuyCategoryBySlug = async (slug) => {
  try {
    const res = await fetch(`${API_BASE}/sell-buy/categories/${slug}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success && data.data) return data.data;
    return null;
  } catch (err) {
    console.error('Error fetching sell-buy category by slug:', err);
    return null;
  }
};

// ─── Listings ─────────────────────────────────────────────────────────────────

export const fetchSellBuyListings = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE}/sell-buy/get-item${query ? `?${query}` : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    return normalizeListingResponse(data);
  } catch (err) {
    console.error('Error fetching sell-buy listings:', err);
    return { listings: [], meta: {} };
  }
};

export const fetchSellBuyListingBySlug = async (slug) => {
  try {
    // Try native endpoint first (returns listing + seller + similar)
    const res = await fetch(`${API_BASE}/sell-buy/listings/${slug}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success && data.data) return data.data;
    // Fallback: try eclassify get-item?slug=
    const res2 = await fetch(`${API_BASE}/sell-buy/get-item?slug=${slug}`, { cache: 'no-store' });
    const data2 = await res2.json();
    const normalized = normalizeListingResponse(data2);
    if (normalized.listings.length > 0) {
      return { listing: normalized.listings[0], sellerProfile: null, otherListings: [], similarListings: [] };
    }
    return null;
  } catch (err) {
    console.error('Error fetching sell-buy listing detail:', err);
    return null;
  }
};

export const fetchFeaturedSections = async () => {
  try {
    const res = await fetch(`${API_BASE}/sell-buy/get-featured-section`, { cache: 'no-store' });
    const data = await res.json();
    if (data.error === false && Array.isArray(data.data)) return data.data;
    if (data.success && Array.isArray(data.data)) return data.data;
    return [];
  } catch (err) {
    console.error('Error fetching featured sections:', err);
    return [];
  }
};

// ─── Post / Create Listing ────────────────────────────────────────────────────

export const createSellBuyListing = async (formData) => {
  try {
    const res = await fetch(`${API_BASE}/sell-buy/add-item`, {
      method: 'POST',
      body: formData, // FormData (multipart)
    });
    return await res.json();
  } catch (err) {
    console.error('Error creating sell-buy listing:', err);
    return { success: false, error: true, message: err.message };
  }
};

// ─── Favorites ────────────────────────────────────────────────────────────────

export const toggleFavorite = async (listingId, userId) => {
  try {
    const res = await fetch(`${API_BASE}/sell-buy/manage-favourite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, userId }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error toggling favorite:', err);
    return { success: false };
  }
};

export const updateSellBuyListing = async (id, payload, token = '') => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/sell-buy/listings/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error('Error updating sell-buy listing:', err);
    return { success: false, message: err.message };
  }
};

// ─── System Settings ─────────────────────────────────────────────────────────

export const fetchSystemSettings = async () => {
  try {
    const res = await fetch(`${API_BASE}/app/get_global_settings`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success && data.policy) {
      const p = data.policy;
      return {
        ...p,
        company_email: p.email,
        company_phone: p.phone,
        company_address: p.address,
        about_us: data.websiteAboutus?.largeDescription || data.websiteAboutus?.description || p.aboutus || '',
        facebook_link: p.facebook,
        instagram_link: p.instagram,
        youtube_link: p.youtube,
        twitter_link: p.twitter,
        place_api_key: GOOGLE_MAPS_API_KEY || ''
      };
    }
    return {};
  } catch (err) {
    console.error('Error fetching system settings:', err);
    return {};
  }
};

export const fetchSliders = async () => {
  try {
    const res = await fetch(`${API_BASE}/sell-buy/get-slider`, { cache: 'no-store' });
    const data = await res.json();
    if (data.error === false && Array.isArray(data.data)) return data.data;
    if (data.success && Array.isArray(data.data)) return data.data;
    return [];
  } catch (err) {
    console.error('Error fetching hero sliders:', err);
    return [];
  }
};

export const submitSellerVerification = async (payload) => {
  try {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    const body = isFormData ? payload : JSON.stringify(payload);

    const res = await fetch(`${API_BASE}/sell-buy/verification`, {
      method: 'POST',
      headers,
      body,
    });
    return await res.json();
  } catch (err) {
    console.error('Error submitting seller verification:', err);
    return { success: false, message: err.message };
  }
};

export const fetchSellerVerificationStatus = async (userId) => {
  try {
    const res = await fetch(`${API_BASE}/sell-buy/verification-status?userId=${userId}`, { cache: 'no-store' });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching seller verification status:', err);
    return { success: false };
  }
};

export const fetchSellerProfile = async (slug) => {
  try {
    const res = await fetch(`${API_BASE}/sell-buy/seller/${slug}`, { cache: 'no-store' });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching seller profile:', err);
    return { success: false };
  }
};

// ── Chat & Messaging API ───────────────────────────────────────────────────
export const getOrCreateConversation = async (buyerId, listingId) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/sell-buy/conversations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ buyerId, listingId }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error init conversation:', err);
    return { success: false };
  }
};

export const fetchConversations = async (userId) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/sell-buy/conversations?userId=${userId || ''}`, { headers, cache: 'no-store' });
    const data = await res.json();
    return data.success && Array.isArray(data.data) ? data.data : [];
  } catch (err) {
    console.error('Error fetching conversations:', err);
    return [];
  }
};

export const fetchMessages = async (conversationId) => {
  try {
    if (!conversationId) return [];
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/sell-buy/conversations/${conversationId}/messages`, { headers, cache: 'no-store' });
    const data = await res.json();
    return data.success && Array.isArray(data.data) ? data.data : [];
  } catch (err) {
    console.error('Error fetching messages:', err);
    return [];
  }
};

export const sendChatMessageApi = async ({ conversationId, text, senderId }) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/sell-buy/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ conversationId, text, senderId }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error sending chat message:', err);
    return { success: false, message: err.message };
  }
};

// ─── Sell-Buy Policies (T&C + Privacy) ───────────────────────────────────────

export const fetchSellBuyPolicies = async () => {
  try {
    const res = await fetch(
      `${API_BASE}/admin/policyBundle/sell-buy`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.policy) return data.policy;
    return null;
  } catch (err) {
    console.error('Error fetching sell-buy policies:', err);
    return null;
  }
};

export const getOrCreateConversationApi = async ({ listingId, buyerId }) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/sell-buy/conversations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ listingId, buyerId }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error in getOrCreateConversation:', err);
    return { success: false };
  }
};
