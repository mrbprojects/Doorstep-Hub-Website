'use client';

/**
 * Centralized location detection configuration
 * Production patterns: Instant cached load, silent IP detection, GPS on demand
 */

import { GOOGLE_MAPS_API_KEY } from '@/config/env';

export const LOCATION_CONFIG = {
    // localStorage key for persisting location data
    STORAGE_KEY: 'user_location_data',

    // Cache duration: 24 hours
    // Why: Prevent constant cache eviction and blank location states for returning users
    CACHE_DURATION: 24 * 60 * 60 * 1000,

    // GPS timeout: 12 seconds (indoor mobile users on weak signal need longer)
    GPS_TIMEOUT: 12000,

    // Primary IP geolocation service
    IP_API_URL: 'https://ipwho.is/',

    // Fallback IP geolocation service
    IP_FALLBACK_URL: 'https://ipinfo.io/json',

    // Default country for location searches
    DEFAULT_COUNTRY: 'IN',

    // Google Maps API key from environment
    GOOGLE_MAPS_API_KEY: GOOGLE_MAPS_API_KEY,

    // Default fallback location when all else fails (Doorstep Hub Headquarters)
    DEFAULT_LOCATION: {
        lat: 17.3850,
        lng: 78.4867,
        city: 'Hyderabad',
        area: 'Banjara Hills',
        shortAddress: 'Hyderabad',
        address: 'Hyderabad, Telangana, India',
        state: 'Telangana',
        source: 'default'
    },

    // Location sources for tracking
    SOURCES: {
        STORAGE: 'storage',
        GPS: 'gps',
        IP: 'ip',
        MANUAL: 'manual',
        DEFAULT: 'default'
    }
};
