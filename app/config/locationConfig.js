'use client';

/**
 * Centralized location detection configuration
 * Following Swiggy/Airbnb production patterns
 */

export const LOCATION_CONFIG = {
    // localStorage key for persisting location data
    STORAGE_KEY: 'user_location_data',

    // Cache duration: 5 minutes (matches Swiggy behavior)
    // Why: Balance between fresh data and reducing API calls
    CACHE_DURATION: 5 * 60 * 1000,

    // GPS timeout: 10 seconds
    // Why: Prevent indefinite waiting, fallback to IP detection
    GPS_TIMEOUT: 10000,

    // IP geolocation service (free, no API key required)
    // Using ipwho.is - generous limits and CORS support
    IP_API_URL: 'https://ipwho.is/',

    // Default country for location searches
    DEFAULT_COUNTRY: 'IN',

    // Google Maps API key from environment
    GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,

    // Location sources for tracking
    SOURCES: {
        STORAGE: 'storage',
        GPS: 'gps',
        IP: 'ip',
        MANUAL: 'manual'
    }
};
