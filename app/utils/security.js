/**
 * Security Utilities
 * Production-grade security functions
 */

/**
 * Generate unique idempotency key for API requests
 */
export const generateIdempotencyKey = (prefix = 'req') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}-${timestamp}-${random}`;
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input) => {
    if (!input) return '';

    return input
        .toString()
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
};

/**
 * Sanitize HTML content
 */
export const sanitizeHTML = (html) => {
    if (!html) return '';

    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
};

/**
 * Encode for URL to prevent injection
 */
export const encodeForURL = (value) => {
    if (!value) return '';
    return encodeURIComponent(sanitizeInput(value));
};

/**
 * Generate device fingerprint
 */
export const getDeviceFingerprint = async () => {
    const components = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset(),
        screen.width,
        screen.height,
        screen.colorDepth,
        navigator.hardwareConcurrency || 0,
        navigator.deviceMemory || 0
    ];

    const fingerprint = components.join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
};

/**
 * Validate and sanitize phone number
 */
export const sanitizePhone = (phone) => {
    if (!phone) return '';

    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');

    // Remove country code if present
    const number = cleaned.startsWith('91') ? cleaned.slice(2) : cleaned;

    // Limit to 10 digits
    return number.substring(0, 10);
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email) => {
    if (!email) return '';

    return email
        .toLowerCase()
        .trim()
        .replace(/[<>'"]/g, '')
        .substring(0, 254); // RFC 5321 max length
};

/**
 * Check if request is duplicate (debouncing)
 */
export class RequestDebouncer {
    constructor(delay = 1000) {
        this.delay = delay;
        this.pendingRequests = new Map();
    }

    async execute(key, fn) {
        // Check if request is already pending
        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key);
        }

        // Execute request
        const promise = fn();
        this.pendingRequests.set(key, promise);

        try {
            const result = await promise;
            return result;
        } finally {
            // Clear after delay
            setTimeout(() => {
                this.pendingRequests.delete(key);
            }, this.delay);
        }
    }

    clear(key) {
        this.pendingRequests.delete(key);
    }

    clearAll() {
        this.pendingRequests.clear();
    }
}

/**
 * Rate limiter for preventing brute force
 */
export class RateLimiter {
    constructor(maxAttempts = 3, windowMs = 15 * 60 * 1000) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
        this.attempts = new Map();
    }

    isAllowed(key) {
        const now = Date.now();
        const record = this.attempts.get(key);

        if (!record) {
            return true;
        }

        // Check if window has expired
        if (now - record.firstAttempt > this.windowMs) {
            this.attempts.delete(key);
            return true;
        }

        // Check if max attempts exceeded
        return record.count < this.maxAttempts;
    }

    recordAttempt(key) {
        const now = Date.now();
        const record = this.attempts.get(key);

        if (!record) {
            this.attempts.set(key, {
                count: 1,
                firstAttempt: now,
                lastAttempt: now
            });
        } else {
            // Check if window has expired
            if (now - record.firstAttempt > this.windowMs) {
                this.attempts.set(key, {
                    count: 1,
                    firstAttempt: now,
                    lastAttempt: now
                });
            } else {
                record.count++;
                record.lastAttempt = now;
            }
        }
    }

    getRemainingTime(key) {
        const record = this.attempts.get(key);
        if (!record) return 0;

        const elapsed = Date.now() - record.firstAttempt;
        const remaining = this.windowMs - elapsed;
        return Math.max(0, remaining);
    }

    reset(key) {
        this.attempts.delete(key);
    }

    clear() {
        this.attempts.clear();
    }
}

/**
 * Secure storage wrapper (prevents XSS from localStorage)
 */
export const secureStorage = {
    setItem: (key, value) => {
        try {
            const sanitized = typeof value === 'string' ? sanitizeInput(value) : value;
            localStorage.setItem(key, JSON.stringify(sanitized));
        } catch (error) {
            console.error('SecureStorage setItem error:', error);
        }
    },

    getItem: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('SecureStorage getItem error:', error);
            return null;
        }
    },

    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('SecureStorage removeItem error:', error);
        }
    },

    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('SecureStorage clear error:', error);
        }
    }
};

/**
 * Format timezone-aware datetime
 */
export const formatDateTimeWithTimezone = (date, time) => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDateTime = `${date}T${time}:00`;
    const dateObj = new Date(localDateTime);

    return {
        iso: dateObj.toISOString(),
        timezone: userTimezone,
        display: `${date} ${time}`,
        timestamp: dateObj.getTime()
    };
};

/**
 * Validate slot availability timestamp
 */
export const isSlotInFuture = (date, time) => {
    const slotDateTime = new Date(`${date}T${time}:00`);
    const now = new Date();
    return slotDateTime > now;
};

/**
 * Prevent rapid successive calls (button mashing)
 */
export const createClickGuard = (delay = 1000) => {
    let lastClick = 0;

    return () => {
        const now = Date.now();
        if (now - lastClick < delay) {
            return false; // Too soon
        }
        lastClick = now;
        return true; // Allowed
    };
};

/**
 * Deep clone object safely
 */
export const safeClone = (obj) => {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (error) {
        console.error('Safe clone error:', error);
        return obj;
    }
};

/**
 * Validate price integrity
 */
export const validatePrice = (price) => {
    const num = parseFloat(price);

    if (isNaN(num) || num < 0) {
        return { valid: false, error: 'Invalid price' };
    }

    if (num > 1000000) {
        return { valid: false, error: 'Price too high' };
    }

    // Round to 2 decimal places
    const rounded = Math.round(num * 100) / 100;

    return { valid: true, value: rounded };
};

export default {
    generateIdempotencyKey,
    sanitizeInput,
    sanitizeHTML,
    encodeForURL,
    getDeviceFingerprint,
    sanitizePhone,
    sanitizeEmail,
    RequestDebouncer,
    RateLimiter,
    secureStorage,
    formatDateTimeWithTimezone,
    isSlotInFuture,
    createClickGuard,
    safeClone,
    validatePrice
};
