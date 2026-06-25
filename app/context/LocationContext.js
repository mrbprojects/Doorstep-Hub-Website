'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { locationManager } from '@/services/locationManager';
import { LOCATION_CONFIG } from '@/config/locationConfig';

const LocationContext = createContext(null);

/**
 * Helper to load Google Maps Script
 * Why: Required for geocoding and places services
 */
/**
 * LocationProvider - Production-grade location management
 */
export function LocationProvider({ children }) {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMapsLoaded, setIsMapsLoaded] = useState(false);

    useEffect(() => {
        // 1. Event-driven Maps init — no more 100ms polling on the main thread.
        //    The Maps SDK calls window.__onGoogleMapsLoaded (defined in layout.js)
        //    which dispatches 'google-maps-loaded'. We just listen for that event.
        const initMaps = () => {
            setIsMapsLoaded(true);
            locationManager.initializeGoogleServices();
        };

        if (typeof window !== 'undefined' && window.google?.maps?.Map) {
            // Already loaded (e.g., navigating back, hot reload)
            initMaps();
        } else {
            window.addEventListener('google-maps-loaded', initMaps);
        }

        // 2. Check localStorage first (instant, no async)
        const savedLocation = locationManager.getSavedLocation();
        if (savedLocation) {
            setLocation(savedLocation);
        } else {
            // No saved location — trigger GPS → IP → Fallback chain (prompts browser location access)
            detectLocation();
        }

        return () => {
            window.removeEventListener('google-maps-loaded', initMaps);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 4. Active Cache Maintenance (Every 5 minutes)
    // Why: Ensure location data doesn't go stale while user is on the site
    useEffect(() => {
        const refreshLocation = async () => {
            // Check if current saved location is valid/fresh
            const saved = locationManager.getSavedLocation();

            if (!saved) {
                console.log('Location cache expired.');
                setLocation(null); // Force empty state on expiry
            }
        };

        // Align interval with cache duration
        const intervalId = setInterval(refreshLocation, LOCATION_CONFIG.CACHE_DURATION);

        return () => clearInterval(intervalId);
    }, []);

    /**
     * User-initiated GPS detection
     * Why: Only triggered by explicit button click
     */
    const detectWithGPS = async () => {
        setLoading(true);
        setError(null);

        try {
            const gpsLocation = await locationManager.detectWithGPS();
            setLocation(gpsLocation);
            return gpsLocation;
        } catch (err) {
            // Log as error, GPS access denied/failed
            console.warn('GPS access unavailable (Permission Denied). User must select location manually.');
            setError('Location permission denied. Please select your location manually.');

            // Explicitly Clear the location state if GPS fails and we have no fallback
            // setLocation(null); 

            // We do NOT return fallback IP anymore, enforcing exact match/manual selection
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Manual IP detection (if user wants to retry)
     * Why: Allow explicit IP-based detection
     */
    const detectWithIP = async () => {
        setLoading(true);
        setError(null);

        try {
            const ipLocation = await locationManager.detectWithIP();
            setLocation(ipLocation);
            return ipLocation;
        } catch (err) {
            console.error('IP detection failed:', err);
            setError('Unable to detect location via IP');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Unified detection helper
     */
    const detectLocation = async () => {
        try {
            return await detectWithGPS();
        } catch (err) {
            try {
                return await detectWithIP();
            } catch (ipErr) {
                // Production-grade fallback: Default to Hyderabad if all else fails
                // Why: Prevent empty UI states/blank sections for new users
                const fallbackLocation = {
                    lat: 17.3850,
                    lng: 78.4867,
                    city: 'Hyderabad',
                    area: 'Banjara Hills',
                    shortAddress: 'Hyderabad',
                    source: 'fallback'
                };
                setLocation(fallbackLocation);
                return fallbackLocation;
            }
        }
    };

    /**
     * Search for locations
     * Why: Enable manual location selection
     */
    /**
     * Search for locations
     * Why: Enable manual location selection
     */
    const searchLocation = async (query) => {
        if (!isMapsLoaded) {
            console.warn('Google Maps not loaded yet');
            return [];
        }

        try {
            console.log('Searching for:', query);
            const results = await locationManager.searchLocation(query);
            console.log('Search results:', results);
            return results;
        } catch (err) {
            console.error('Search failed:', err);
            return [];
        }
    };

    /**
     * Set location from manual selection
     * Why: Allow users to override auto-detection
     */
    const setManualLocation = async (placeId) => {
        if (!isMapsLoaded) {
            throw new Error('Google Maps not loaded yet');
        }

        setLoading(true);
        setError(null);

        try {
            const manualLocation = await locationManager.setManualLocation(placeId);
            console.log('Manual location set:', manualLocation);
            setLocation(manualLocation);
            return manualLocation;
        } catch (err) {
            console.error('Manual location setting failed:', err);
            setError('Failed to set location');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Clear saved location
     * Why: Allow users to reset and choose new location
     */
    const clearLocation = () => {
        locationManager.clearLocation();
        setLocation(null);
        setError(null);
    };

    return (
        <LocationContext.Provider
            value={{
                location,
                loading,
                error,
                detectWithGPS,
                detectWithIP,
                detectLocation,
                searchLocation,
                setManualLocation,
                clearLocation,
                isMapsLoaded
            }}
        >
            {children}
        </LocationContext.Provider>
    );
}

export const useLocationContext = () => useContext(LocationContext);
