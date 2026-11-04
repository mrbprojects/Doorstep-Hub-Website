'use client';

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { locationManager } from '@/services/locationManager';
import { LOCATION_CONFIG } from '@/config/locationConfig';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMapsLoaded, setIsMapsLoaded] = useState(false);

    /**
     * Set location from manual selection (Google Places placeId)
     */
    const setManualLocation = useCallback(async (placeId) => {
        setLoading(true);
        setError(null);
        try {
            const manualLocation = await locationManager.setManualLocation(placeId);
            setLocation(manualLocation);
            return manualLocation;
        } catch (err) {
            console.error('Manual location setting failed:', err);
            setError('Failed to set location');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Direct City setter (e.g. clicking a city card) - Instant 0ms latency
     */
    const setCityLocation = useCallback((cityName) => {
        try {
            const cityLocation = locationManager.setManualCity(cityName);
            setLocation(cityLocation);
            return cityLocation;
        } catch (err) {
            console.error('Failed to set city location:', err);
            return null;
        }
    }, []);

    /**
     * User-initiated GPS detection
     */
    const detectWithGPS = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const gpsLocation = await locationManager.detectWithGPS();
            setLocation(gpsLocation);
            return gpsLocation;
        } catch (err) {
            console.warn('GPS detection failed, keeping existing or fallback location:', err);
            setError(err.message || 'Location permission denied');
            
            // Preserve user's existing manual city selection if present
            const existingSaved = locationManager.getSavedLocation();
            if (existingSaved && existingSaved.city) {
                setLocation(existingSaved);
                return existingSaved;
            }

            // Only fallback to IP if there is no saved location at all
            try {
                const ipLocation = await locationManager.detectWithIP();
                setLocation(ipLocation);
                return ipLocation;
            } catch (ipErr) {
                throw err;
            }
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Silent IP detection
     */
    const detectWithIP = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const ipLocation = await locationManager.detectWithIP();
            setLocation(ipLocation);
            return ipLocation;
        } catch (err) {
            console.error('IP detection failed:', err);
            const fallback = locationManager.saveLocation(
                LOCATION_CONFIG.DEFAULT_LOCATION,
                LOCATION_CONFIG.SOURCES.DEFAULT
            );
            setLocation(fallback);
            return fallback;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Privacy-friendly location detection on page load:
     * 1. Preserves existing selected city from localStorage.
     * 2. If permission was already explicitly granted in browser, reuses GPS detection.
     * 3. If permission is unset ('prompt') or denied, does NOT pop up a GPS prompt automatically.
     *    Instead, seamlessly falls back to silent IP city detection so the visitor can browse freely.
     * 4. Full browser GPS permission prompt is only invoked when the visitor explicitly clicks
     *    "Use Current Location" in the location selector.
     */
    const detectLocation = useCallback(async () => {
        try {
            // First check if user already has a valid saved location
            const existingSaved = locationManager.getSavedLocation();
            if (existingSaved && existingSaved.city) {
                setLocation(existingSaved);
                return existingSaved;
            }

            if (typeof window !== 'undefined' && navigator.permissions?.query) {
                try {
                    const perm = await navigator.permissions.query({ name: 'geolocation' });
                    if (perm.state === 'granted') {
                        return await detectWithGPS();
                    }
                } catch (e) {
                    // permissions.query not supported in all browsers
                }
            }

            // Unset or denied permission: Use non-intrusive IP detection without browser prompt
            return await detectWithIP();
        } catch (err) {
            console.warn('Initial location detection fallback:', err);
            return await detectWithIP();
        }
    }, [detectWithGPS, detectWithIP]);

    /**
     * Search locations using Places Autocomplete
     */
    const searchLocation = useCallback(async (query) => {
        try {
            return await locationManager.searchLocation(query);
        } catch (err) {
            console.error('Search failed:', err);
            return [];
        }
    }, []);

    /**
     * Clear saved location
     */
    const clearLocation = useCallback(() => {
        locationManager.clearLocation();
        setLocation(null);
        setError(null);
    }, []);

    useEffect(() => {
        // 1. Google Maps SDK listener
        const initMaps = () => {
            setIsMapsLoaded(true);
            locationManager.initializeGoogleServices();
        };

        if (typeof window !== 'undefined' && window.google?.maps?.Map) {
            initMaps();
        } else if (typeof window !== 'undefined') {
            window.addEventListener('google-maps-loaded', initMaps);
        }

        // 2. Check localStorage first (instant, 0ms)
        const savedLocation = locationManager.getSavedLocation();
        if (savedLocation) {
            setLocation(savedLocation);
        } else {
            // Automatically detect location silently via IP/GPS
            detectLocation();
        }

        // 3. Listen to cross-component location updates
        const handleLocationUpdated = () => {
            const current = locationManager.getSavedLocation();
            if (current) setLocation(current);
        };
        window.addEventListener('location-updated', handleLocationUpdated);

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('google-maps-loaded', initMaps);
                window.removeEventListener('location-updated', handleLocationUpdated);
            }
        };
    }, [detectLocation]);

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
                setCityLocation,
                clearLocation,
                isMapsLoaded
            }}
        >
            {children}
        </LocationContext.Provider>
    );
}

export const useLocationContext = () => useContext(LocationContext);
