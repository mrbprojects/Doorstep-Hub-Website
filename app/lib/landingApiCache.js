const memoryCache = new Map();

function getSessionCache(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() > parsed.expiresAt) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

function setSessionCache(key, value, ttlMs) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(
      key,
      JSON.stringify({ value, expiresAt: Date.now() + ttlMs })
    );
  } catch {
    // ignore storage errors
  }
}

export async function fetchLandingJson(cacheKey, url, options = {}, ttlMs = 5 * 60 * 1000) {
  const now = Date.now();
  const memoryEntry = memoryCache.get(cacheKey);

  if (memoryEntry && memoryEntry.data && memoryEntry.expiresAt > now) {
    return memoryEntry.data;
  }

  const sessionData = getSessionCache(cacheKey);
  if (sessionData) {
    memoryCache.set(cacheKey, { data: sessionData, expiresAt: now + ttlMs });
    return sessionData;
  }

  if (memoryEntry && memoryEntry.promise) {
    return memoryEntry.promise;
  }

  const requestPromise = fetch(url, options).then(async (res) => {
    const data = await res.json();
    memoryCache.set(cacheKey, { data, expiresAt: Date.now() + ttlMs });
    setSessionCache(cacheKey, data, ttlMs);
    return data;
  }).finally(() => {
    const latest = memoryCache.get(cacheKey);
    if (latest && latest.promise) {
      memoryCache.set(cacheKey, { data: latest.data, expiresAt: latest.expiresAt });
    }
  });

  memoryCache.set(cacheKey, { promise: requestPromise, expiresAt: now + ttlMs });
  return requestPromise;
}
