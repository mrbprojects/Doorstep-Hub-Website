const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi').replace(/\/+$/, '');
const IMAGE_BASE = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com').replace(/\/+$/, '');

export const getImageUrl = (path) => {
  if (!path) return 'https://api.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg';
  if (path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${IMAGE_BASE}${cleanPath}`;
};

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
    if (!res.ok) return [];
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

export const createSellBuyListing = async (formData, token = '') => {
  try {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/sell-buy/add-item`, {
      method: 'POST',
      headers,
      body: formData, // FormData (multipart)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok && !data.message) {
      return { success: false, error: true, message: `Server error (${res.status})` };
    }
    return data;
  } catch (err) {
    console.error('Error creating sell-buy listing:', err);
    return { success: false, error: true, message: err.message };
  }
};

// ─── Favorites ────────────────────────────────────────────────────────────────

export const toggleFavorite = async (listingId, userId, token = '') => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/sell-buy/listings/${listingId}/favorite`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ listingId, userId }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error toggling favorite:', err);
    return { success: false };
  }
};

export const removeFavorite = async (listingId, userId, token = '') => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/sell-buy/listings/${listingId}/favorite`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ listingId, userId }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error removing favorite:', err);
    return { success: false };
  }
};

export const fetchSellBuyFavorites = async (userId, token = '') => {
  try {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const url = userId ? `${API_BASE}/sell-buy/favorites?userId=${userId}` : `${API_BASE}/sell-buy/favorites`;
    const res = await fetch(url, { headers, cache: 'no-store' });
    const data = await res.json();
    return data?.data || [];
  } catch (err) {
    console.error('Error fetching favorites:', err);
    return [];
  }
};

// ─── System Settings ─────────────────────────────────────────────────────────

export const fetchSystemSettings = async () => {
  try {
    const res = await fetch(`${API_BASE}/sell-buy/get-system-settings`, { cache: 'no-store' });
    const data = await res.json();
    if (data.error === false && data.data) return data.data;
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

// ── Chat & Messaging API ───────────────────────────────────────────────────
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
