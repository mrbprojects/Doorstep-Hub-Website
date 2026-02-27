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

        // 3. Silent IP-based detection as fallback (only if no saved location)
        const detectIPLocation = async () => {
            try {
                setLoading(true);
                const ipLocation = await locationManager.detectWithIP();
                setLocation(ipLocation);
            } catch (err) {
                console.error('IP detection failed:', err);
            } finally {
                setLoading(false);
            }
        };

        detectIPLocation();
        return () => clearInterval(checkGoogleMaps);
    }, []);

    // 4. Active Cache Maintenance (Every 5 minutes)
    // Why: Ensure location data doesn't go stale while user is on the site
    useEffect(() => {
        const refreshLocation = async () => {
            // Check if current saved location is valid/fresh
            const saved = locationManager.getSavedLocation();

            if (!saved) {
                console.log('Location cache expired, performing silent refresh...');
                try {
                    // Silent update (bypass setLoading to avoid UI flicker)
                    const ipLocation = await locationManager.detectWithIP();
                    setLocation(ipLocation);
                } catch (err) {
                    console.warn('Silent location refresh failed:', err);
                }
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
            // Log as warning instead of error for "denied" which is a common user action
            console.warn('GPS access unavailable (Permission Denied), falling back to Network Location.');

            // Fallback to IP detection on GPS failure
            try {
                const ipLocation = await locationManager.detectWithIP();

                // CRITICAL FIX: Since IP detection is vague (city-level), 
                // we perform a reverse geocode on the IP coords to fill details properly.
                try {
                    const detailedData = await locationManager.reverseGeocode(ipLocation.lat, ipLocation.lng);
                    const processedLoc = {
                        ...ipLocation,
                        ...detailedData,
                        isEstimated: true,
                        lat: ipLocation.lat, // Keep original IP lat/lng
                        lng: ipLocation.lng
                    };
                    setLocation(processedLoc);
                    return processedLoc;
                } catch (geoErr) {
                    const processedLoc = { ...ipLocation, isEstimated: true };
                    setLocation(processedLoc);
                    return processedLoc;
                }
            } catch (ipErr) {
                console.error('Total location failure:', ipErr);
                setError('Unable to detect location. Please search manually.');
                return null;
            }
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
