'use client';

import { LOCATION_CONFIG } from '@/config/locationConfig';

/**
 * Supported Doorstep Hub Operating Cities & Reference Coordinates
 */
const SUPPORTED_CITIES = [
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, state: 'Telangana', aliases: ['hyderabad', 'secunderabad', 'cyberabad'] },
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, state: 'Karnataka', aliases: ['bengaluru', 'bangalore'] },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu', aliases: ['chennai', 'madras'] },
    { name: 'Vijayawada', lat: 16.5062, lng: 80.6480, state: 'Andhra Pradesh', aliases: ['vijayawada', 'bezawada'] },
    { name: 'Vizag', lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh', aliases: ['vizag', 'visakhapatnam', 'waltair'] },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, state: 'Maharashtra', aliases: ['mumbai', 'bombay', 'navi mumbai', 'thane'] },
    { name: 'Pune', lat: 18.5204, lng: 73.8567, state: 'Maharashtra', aliases: ['pune', 'poona', 'pimpri'] },
    { name: 'Tirupati', lat: 13.6288, lng: 79.4192, state: 'Andhra Pradesh', aliases: ['tirupati', 'tirumala'] },
    { name: 'Delhi', lat: 28.6139, lng: 77.2090, state: 'Delhi', aliases: ['delhi', 'new delhi', 'noida', 'gurgaon', 'gurugram', 'ghaziabad', 'faridabad'] },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, state: 'Gujarat', aliases: ['ahmedabad', 'gandhinagar'] },
    { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu', aliases: ['coimbatore', 'kovai'] },
    { name: 'Kochi', lat: 9.9312, lng: 76.2673, state: 'Kerala', aliases: ['kochi', 'cochin', 'ernakulam'] },
    { name: 'Khammam', lat: 17.2473, lng: 80.1514, state: 'Telangana', aliases: ['khammam'] },
    { name: 'Amaravati', lat: 16.5735, lng: 80.3575, state: 'Andhra Pradesh', aliases: ['amaravati', 'guntur'] }
];

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function findClosestSupportedCity(lat, lng) {
    if (!lat || !lng) return SUPPORTED_CITIES[0];
    let closest = SUPPORTED_CITIES[0];
    let minDistance = Infinity;

    for (const city of SUPPORTED_CITIES) {
        const dist = calculateDistanceKm(lat, lng, city.lat, city.lng);
        if (dist < minDistance) {
            minDistance = dist;
            closest = city;
        }
    }
    return { ...closest, distanceKm: minDistance };
}

function matchCityByName(name) {
    if (!name) return null;
    const clean = String(name).trim().toLowerCase();
    for (const city of SUPPORTED_CITIES) {
        if (city.name.toLowerCase() === clean || city.aliases.some(a => clean.includes(a))) {
            return city;
        }
    }
    return null;
}

/**
 * Production-Grade Location Manager
 * Implements Swiggy/Airbnb-style location detection:
 * 1. Instant cached location (0ms)
 * 2. Silent IP auto-detection (<300ms)
 * 3. High-precision GPS on user gesture
 * 4. Fallback closest-city matching (never fails)
 */
class LocationManager {
    constructor() {
        this.geocoder = null;
        this.autocompleteService = null;
        this.placesService = null;
    }

    initializeGoogleServices() {
        if (typeof window === 'undefined') return;

        if (window.google && window.google.maps) {
            try {
                if (!this.geocoder && window.google.maps.Geocoder) {
                    this.geocoder = new window.google.maps.Geocoder();
                }
            } catch (e) {
                // Silently handle
            }
        }
    }

    getSavedLocation() {
        if (typeof window === 'undefined') return null;

        try {
            const stored = localStorage.getItem(LOCATION_CONFIG.STORAGE_KEY);
            if (!stored) return null;

            const parsed = JSON.parse(stored);
            if (this.isLocationFresh(parsed)) {
                return parsed;
            }

            // If stale but valid, renew timestamp to avoid sudden UI jarring
            if (parsed && parsed.city && parsed.lat && parsed.lng) {
                return this.saveLocation(parsed, parsed.source || LOCATION_CONFIG.SOURCES.STORAGE);
            }

            return null;
        } catch (error) {
            console.error('Error reading saved location:', error);
            return null;
        }
    }

    isLocationFresh(locationData) {
        if (!locationData || !locationData.timestamp) return false;
        if (locationData.source === LOCATION_CONFIG.SOURCES.MANUAL) return true;

        const age = Date.now() - locationData.timestamp;
        return age < LOCATION_CONFIG.CACHE_DURATION;
    }

    saveLocation(data, source) {
        if (typeof window === 'undefined') return data;

        const locationData = {
            ...data,
            source: source || data?.source || LOCATION_CONFIG.SOURCES.DEFAULT,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(LOCATION_CONFIG.STORAGE_KEY, JSON.stringify(locationData));
            window.dispatchEvent(new Event('location-updated'));
            return locationData;
        } catch (error) {
            console.error('Error saving location:', error);
            return locationData;
        }
    }

    clearLocation() {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(LOCATION_CONFIG.STORAGE_KEY);
            window.dispatchEvent(new Event('location-updated'));
        } catch (error) {
            console.error('Error clearing location:', error);
        }
    }

    async reverseGeocode(lat, lng) {
        this.initializeGoogleServices();

        // If Geocoder is not loaded yet, wait up to 2 seconds for google-maps-loaded event
        if (!this.geocoder && typeof window !== 'undefined') {
            await new Promise((resolve) => {
                if (window.google?.maps?.Geocoder) {
                    this.initializeGoogleServices();
                    return resolve();
                }
                const handler = () => {
                    this.initializeGoogleServices();
                    resolve();
                };
                window.addEventListener('google-maps-loaded', handler, { once: true });
                setTimeout(resolve, 2000);
            });
        }

        // Try Google Maps Geocoder if available
        if (this.geocoder) {
            try {
                const geoResult = await new Promise((resolve, reject) => {
                    this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                        if (status === 'OK' && results && results[0]) {
                            resolve(results[0]);
                        } else {
                            reject(new Error(`Geocoding status: ${status}`));
                        }
                    });
                });

                let city = '';
                let area = '';
                let houseNumber = '';
                let postalCode = '';
                let state = '';
                const areaParts = [];
                const houseParts = [];

                for (const component of geoResult.address_components) {
                    const types = component.types;
                    const name = component.long_name;

                    if (types.includes('locality')) {
                        city = name;
                    }
                    if (types.includes('sublocality') || types.includes('neighborhood') || types.includes('route')) {
                        if (!areaParts.includes(name)) areaParts.push(name);
                    }
                    if (types.includes('premise') || types.includes('subpremise') || types.includes('street_number')) {
                        if (!houseParts.includes(name)) houseParts.push(name);
                    }
                    if (types.includes('postal_code')) {
                        postalCode = name;
                    }
                    if (types.includes('administrative_area_level_1')) {
                        state = name;
                    }
                }

                const finalHouse = houseParts.join(', ');
                const finalArea = Array.from(new Set(areaParts)).join(', ');
                const matched = matchCityByName(city);
                const resolvedCity = matched ? matched.name : (city || findClosestSupportedCity(lat, lng).name);
                const shortAddress = finalArea ? `${finalArea.split(',')[0]}, ${resolvedCity}` : resolvedCity;

                return {
                    lat,
                    lng,
                    city: resolvedCity,
                    area: finalArea || resolvedCity,
                    flat: finalHouse,
                    postalCode,
                    state,
                    address: geoResult.formatted_address || `${resolvedCity}, ${state}, India`,
                    shortAddress
                };
            } catch (geocodeErr) {
                console.warn('Google Geocoder failed, using closest supported city fallback:', geocodeErr);
            }
        }

        // Guaranteed Fallback: Calculate closest supported operating city
        const closest = findClosestSupportedCity(lat, lng);
        return {
            lat,
            lng,
            city: closest.name,
            area: closest.name,
            flat: '',
            postalCode: '',
            state: closest.state,
            address: `${closest.name}, ${closest.state}, India`,
            shortAddress: closest.name
        };
    }

    async detectWithGPS() {
        if (typeof window === 'undefined' || !('geolocation' in navigator)) {
            throw new Error('Geolocation not supported by browser');
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
                        const closest = findClosestSupportedCity(position.coords.latitude, position.coords.longitude);
                        const fallbackData = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            city: closest.name,
                            area: closest.name,
                            shortAddress: closest.name,
                            address: `${closest.name}, ${closest.state}, India`,
                            state: closest.state
                        };
                        const savedData = this.saveLocation(fallbackData, LOCATION_CONFIG.SOURCES.GPS);
                        resolve(savedData);
                    }
                },
                (error) => {
                    clearTimeout(timeoutId);
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
                    maximumAge: 60000
                }
            );
        });
    }

    async detectWithIP() {
        const fetchWithTimeout = async (url, timeoutMs = 3500) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(timer);
                return res;
            } catch (e) {
                clearTimeout(timer);
                throw e;
            }
        };

        // Multi-provider silent IP detection
        const providers = [
            async () => {
                const res = await fetchWithTimeout('https://ipwho.is/', 3500);
                if (!res.ok) throw new Error('ipwho.is HTTP error');
                const data = await res.json();
                if (!data || !data.success) throw new Error('ipwho.is unsuccessful');
                const matched = matchCityByName(data.city);
                const city = matched ? matched.name : (data.city || 'Hyderabad');
                return {
                    lat: Number(data.latitude) || 17.3850,
                    lng: Number(data.longitude) || 78.4867,
                    city,
                    area: data.region || city,
                    postalCode: data.postal || '',
                    state: data.region || '',
                    address: `${city}, ${data.region || ''}, India`,
                    shortAddress: city
                };
            },
            async () => {
                const res = await fetchWithTimeout('https://ipinfo.io/json', 3500);
                if (!res.ok) throw new Error('ipinfo.io HTTP error');
                const data = await res.json();
                if (!data || !data.loc) throw new Error('ipinfo.io incomplete');
                const [latStr, lngStr] = (data.loc || '').split(',');
                const lat = parseFloat(latStr) || 17.3850;
                const lng = parseFloat(lngStr) || 78.4867;
                const matched = matchCityByName(data.city);
                const city = matched ? matched.name : (data.city || findClosestSupportedCity(lat, lng).name);
                return {
                    lat,
                    lng,
                    city,
                    area: data.region || city,
                    postalCode: data.postal || '',
                    state: data.region || '',
                    address: `${city}, ${data.region || ''}, India`,
                    shortAddress: city
                };
            }
        ];

        for (const provider of providers) {
            try {
                const loc = await provider();
                if (loc && loc.city && loc.lat && loc.lng) {
                    return this.saveLocation(loc, LOCATION_CONFIG.SOURCES.IP);
                }
            } catch (err) {
                // Try next provider
            }
        }

        // Final fallback: Default location (Hyderabad)
        return this.saveLocation(LOCATION_CONFIG.DEFAULT_LOCATION, LOCATION_CONFIG.SOURCES.DEFAULT);
    }

    setManualCity(cityName) {
        const matched = matchCityByName(cityName) || {
            name: cityName,
            lat: 17.3850,
            lng: 78.4867,
            state: ''
        };

        const locationData = {
            lat: matched.lat,
            lng: matched.lng,
            city: matched.name,
            area: matched.name,
            postalCode: '',
            state: matched.state,
            address: `${matched.name}, ${matched.state ? matched.state + ', ' : ''}India`,
            shortAddress: matched.name
        };

        return this.saveLocation(locationData, LOCATION_CONFIG.SOURCES.MANUAL);
    }

    async searchLocation(query) {
        if (!query || typeof window === 'undefined') {
            return [];
        }

        if (!this.autocompleteService && window.google?.maps?.places?.AutocompleteService) {
            try {
                this.autocompleteService = new window.google.maps.places.AutocompleteService();
            } catch (e) {
                return [];
            }
        }

        if (!this.autocompleteService) {
            return [];
        }

        return new Promise((resolve) => {
            const request = {
                input: query,
                componentRestrictions: { country: LOCATION_CONFIG.DEFAULT_COUNTRY }
            };

            this.autocompleteService.getPlacePredictions(request, (predictions, status) => {
                if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && predictions) {
                    resolve(
                        predictions.map((p) => ({
                            description: p.description,
                            place_id: p.place_id,
                            main_text: p.structured_formatting?.main_text || p.description,
                            secondary_text: p.structured_formatting?.secondary_text || ''
                        }))
                    );
                } else {
                    resolve([]);
                }
            });
        });
    }

    async setManualLocation(placeId) {
        if (typeof window === 'undefined') {
            throw new Error('Window not available');
        }

        if (!this.placesService && window.google?.maps?.places?.PlacesService) {
            try {
                const dummyNode = document.createElement('div');
                this.placesService = new window.google.maps.places.PlacesService(dummyNode);
            } catch (e) {
                // Ignore
            }
        }

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
                    if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && place) {
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

                        const matched = matchCityByName(city);
                        const resolvedCity = matched ? matched.name : (city || findClosestSupportedCity(lat, lng).name);
                        const shortAddress = area ? `${area}, ${resolvedCity}` : resolvedCity;

                        const locationData = {
                            lat,
                            lng,
                            city: resolvedCity,
                            area: area || resolvedCity,
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

export const locationManager = new LocationManager();
