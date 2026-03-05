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
        // 1. Wait for Google Maps (already loading in layout.js)
        const checkGoogleMaps = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.Map) {
                setIsMapsLoaded(true);
                locationManager.initializeGoogleServices();
                clearInterval(checkGoogleMaps);
            }
        }, 100);

        // 2. Check localStorage first (instant, no async)
        const savedLocation = locationManager.getSavedLocation();
        if (savedLocation) {
            setLocation(savedLocation);
            return () => clearInterval(checkGoogleMaps);
        }

        // 3. No IP Silencing
        // We only rely on stored location or explicitly requested GPS/Manual input

        return () => clearInterval(checkGoogleMaps);
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
