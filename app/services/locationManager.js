'use client';

import { LOCATION_CONFIG } from '@/config/locationConfig';

/**
 * Production-Grade Location Manager
 * Implements Swiggy/Airbnb-style location detection with strict UX rules
 * 
 * Priority Order:
 * 1. localStorage (instant)
 * 2. User-initiated GPS (explicit action only)
 * 3. IP-based fallback (silent, no popup)
 * 4. Manual search selection
 */

class LocationManager {
    constructor() {
        this.geocoder = null;
        this.autocompleteService = null;
        this.placesService = null;
    }

    /**
     * Initialize Google Maps services
     * Why: Lazy loading prevents blocking page render
     */
    initializeGoogleServices() {
        if (typeof window === 'undefined') return;

        if (window.google && window.google.maps) {
            try {
                if (!this.geocoder && window.google.maps.Geocoder) {
                    this.geocoder = new window.google.maps.Geocoder();
                }

                // Handle different availability of library namespaces
                if (window.google.maps.places) {
                    if (!this.autocompleteService && window.google.maps.places.AutocompleteService) {
                        this.autocompleteService = new window.google.maps.places.AutocompleteService();
                    }
                    if (!this.placesService && window.google.maps.places.PlacesService) {
                        const dummyNode = document.createElement('div');
                        this.placesService = new window.google.maps.places.PlacesService(dummyNode);
                    }
                }
            } catch (e) {
                console.warn("Google Maps services initialization warning:", e);
            }
        }
    }

    /**
     * Get saved location from localStorage
     * Why: Instant retrieval, no async needed
     * Returns: LocationData | null
     */
    getSavedLocation() {
        if (typeof window === 'undefined') return null;

        try {
            const stored = localStorage.getItem(LOCATION_CONFIG.STORAGE_KEY);
            if (!stored) return null;

            const parsed = JSON.parse(stored);

            // Check if cache is still fresh
            if (this.isLocationFresh(parsed)) {
                return parsed;
            }

            // Cache expired, clear it
            this.clearLocation();
            return null;
        } catch (error) {
            console.error('Error reading saved location:', error);
            return null;
        }
    }

    /**
     * Check if cached location is still valid
     * Why: Prevent stale data, re-detect after 5 minutes
     */
    isLocationFresh(locationData) {
        if (!locationData || !locationData.timestamp) return false;

        const age = Date.now() - locationData.timestamp;
        return age < LOCATION_CONFIG.CACHE_DURATION;
    }

    /**
     * Save location to localStorage
     * Why: Persist across page reloads and sessions
     */
    saveLocation(data, source) {
        if (typeof window === 'undefined') return;

        const locationData = {
            ...data,
            source,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(LOCATION_CONFIG.STORAGE_KEY, JSON.stringify(locationData));
            return locationData;
        } catch (error) {
            console.error('Error saving location:', error);
            return locationData;
        }
    }

    /**
     * Clear saved location
     * Why: Allow users to reset their location
     */
    clearLocation() {
        if (typeof window === 'undefined') return;

        try {
            localStorage.removeItem(LOCATION_CONFIG.STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing location:', error);
        }
    }

    /**
     * Reverse geocode coordinates to address
     * Why: Convert GPS coordinates to human-readable location
     */
    async reverseGeocode(lat, lng) {
        this.initializeGoogleServices();

        if (!this.geocoder) {
            throw new Error('Google Maps not loaded');
        }

        return new Promise((resolve, reject) => {
            this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const result = results[0];
                    let city = '';
                    let area = '';
                    let neighborhood = '';
                    let houseNumber = '';
                    let postalCode = '';
                    let state = '';

                    // Variables to store multi-part components
                    let houseParts = [];
                    let areaParts = [];

                    // Extract city, area, postal code, and state from address components
                    for (const component of result.address_components) {
                        const types = component.types;
                        const name = component.long_name;

                        if (types.includes('locality')) {
                            city = name;
                        }

                        // Capture all levels of sublocality and neighborhood for area
                        if (types.includes('sublocality') || types.includes('sublocality_level_1') ||
                            types.includes('sublocality_level_2') || types.includes('sublocality_level_3') ||
                            types.includes('neighborhood') || types.includes('route')) {
                            if (!areaParts.includes(name)) {
                                areaParts.push(name);
                            }
                        }

                        // Capture specific building/plot details
                        if (types.includes('premise') || types.includes('subpremise') ||
                            types.includes('street_number') || types.includes('point_of_interest') ||
                            types.includes('room') || types.includes('floor')) {
                            // Avoid duplicates in house parts
                            if (!houseParts.includes(name)) {
                                houseParts.push(name);
                            }
                        }

                        if (types.includes('postal_code')) {
                            postalCode = name;
                        }
                        if (types.includes('administrative_area_level_1')) {
                            state = name;
                        }
                    }

                    // Process specialized components
                    // In India, sometimes the order is reversed in components, so we might want to reverse houseParts
                    // but usually, more specific is first.
                    const finalHouse = houseParts.join(', ');
                    const finalArea = Array.from(new Set(areaParts)).join(', '); // Remove duplicates

                    const shortAddress = finalArea ? `${finalArea.split(',')[0]}, ${city}` : city || result.formatted_address.split(',')[0];

                    resolve({
                        lat,
                        lng,
                        city,
                        area: finalArea,
                        flat: finalHouse, // Auto-fill Plot/House details
                        postalCode,
                        state,
                        address: result.formatted_address,
                        shortAddress
                    });
                } else {
                    reject(new Error(`Geocoding failed: ${status}`));
                }
            });
        });
    }

    /**
     * Detect location using GPS
     * Why: User-initiated only, never auto-trigger
     * Returns: Promise<LocationData>
     */
    async detectWithGPS() {
        // Check if geolocation is supported
        if (typeof window === 'undefined' || !('geolocation' in navigator)) {
            throw new Error('Geolocation not supported');
        }

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('GPS timeout'));
            }, LOCATION_CONFIG.GPS_TIMEOUT);

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    clearTimeout(timeoutId);

                    try {
                        const { latitude, longitude } = position.coords;
                        const data = await this.reverseGeocode(latitude, longitude);
                        const savedData = this.saveLocation(data, LOCATION_CONFIG.SOURCES.GPS);
                        resolve(savedData);
                    } catch (error) {
                        reject(error);
                    }
                },
                (error) => {
                    clearTimeout(timeoutId);

                    // Handle different error types
                    let errorMessage = 'GPS detection failed';
                    if (error.code === error.PERMISSION_DENIED) {
                        errorMessage = 'Location permission denied';
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        errorMessage = 'Location unavailable';
                    } else if (error.code === error.TIMEOUT) {
                        errorMessage = 'GPS timeout';
                    }

                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: LOCATION_CONFIG.GPS_TIMEOUT,
                    maximumAge: 0
                }
            );
        });
    }

    /**
     * Detect location using IP address
     * Why: Silent fallback when GPS fails or unavailable
     * Returns: Promise<LocationData>
     */
    async detectWithIP() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        try {
            // ipwho.is is very CORS friendly and reliable
            const response = await fetch('https://ipwho.is/', {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('IP API failed');
            const data = await response.json();

            // Mapping for ipwho.is
            const locationData = {
                lat: Number(data.latitude) || 17.3850,
                lng: Number(data.longitude) || 78.4867,
                city: data.city || 'Hyderabad',
                area: data.region || '',
                postalCode: data.postal || '',
                state: data.region || 'Telangana',
                address: `${data.city || 'Hyderabad'}, ${data.region || ''}`,
                shortAddress: data.city || 'Hyderabad'
            };

            return this.saveLocation(locationData, LOCATION_CONFIG.SOURCES.IP);
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('IP detection failure:', error);
            // Absolute fallback to avoid crashes
            return {
                lat: 17.3850,
                lng: 78.4867,
                city: "Hyderabad",
                area: "Madhapur",
                postalCode: "500081",
                state: "Telangana",
                address: "Hyderabad, Telangana",
                shortAddress: "Hyderabad"
            };
        }
    }

    /**
     * Search for locations using Google Places Autocomplete
     * Why: Enable manual location selection without GPS
     * Returns: Promise<Prediction[]>
     */
    async searchLocation(query) {
        this.initializeGoogleServices();

        if (!query || !this.autocompleteService) {
            return [];
        }

        return new Promise((resolve) => {
            const request = {
                input: query,
                componentRestrictions: { country: LOCATION_CONFIG.DEFAULT_COUNTRY }
            };

            this.autocompleteService.getPlacePredictions(request, (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    resolve(
                        predictions.map((p) => ({
                            description: p.description,
                            place_id: p.place_id,
                            main_text: p.structured_formatting.main_text,
                            secondary_text: p.structured_formatting.secondary_text
                        }))
                    );
                } else {
                    resolve([]);
                }
            });
        });
    }

    /**
     * Set location manually from search selection
     * Why: Allow users to override auto-detection
     * Returns: Promise<LocationData>
     */
    async setManualLocation(placeId) {
        this.initializeGoogleServices();

        if (!this.placesService) {
            throw new Error('Google Maps not loaded');
        }

        return new Promise((resolve, reject) => {
            this.placesService.getDetails(
                {
                    placeId,
                    fields: ['name', 'formatted_address', 'geometry', 'address_components']
                },
                (place, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();

                        let city = '';
                        let area = '';
                        let postalCode = '';
                        let state = '';

                        if (place.address_components) {
                            for (const component of place.address_components) {
                                if (component.types.includes('locality')) {
                                    city = component.long_name;
                                }
                                if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
                                    area = component.long_name;
                                }
                                if (component.types.includes('postal_code')) {
                                    postalCode = component.long_name;
                                }
                                if (component.types.includes('administrative_area_level_1')) {
                                    state = component.long_name;
                                }
                            }
                        }

                        const shortAddress = area ? `${area}, ${city}` : city || place.name;

                        const locationData = {
                            lat,
                            lng,
                            city,
                            area,
                            postalCode,
                            state,
                            address: place.formatted_address,
                            shortAddress
                        };

                        const savedData = this.saveLocation(locationData, LOCATION_CONFIG.SOURCES.MANUAL);
                        resolve(savedData);
                    } else {
                        reject(new Error('Failed to get place details'));
                    }
                }
            );
        });
    }
}

// Export singleton instance
export const locationManager = new LocationManager();
