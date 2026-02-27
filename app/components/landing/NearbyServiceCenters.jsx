'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Star, Phone, Clock, Loader2, ArrowRight } from 'lucide-react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/hooks/useLocation';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// DARK MODE MAP OPTIONS - Instant dark theme
const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      "featureType": "all",
      "elementType": "geometry",
      "stylers": [
        { "color": "#1a1a1a" }
      ]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#8c8c8c" }
      ]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [
        { "color": "#000000" }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
        { "color": "#2a2a2a" }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        { "color": "#333333" }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        { "color": "#2d2d2d" }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        { "color": "#0a1410" }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#037166" }
      ]
    }
  ]
};

export function NearbyServiceCenters() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { location, detectWithGPS, loading: contextLoading, isMapsLoaded } = useLocation();
  const [selectedService, setSelectedService] = useState(0);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch service centers
  useEffect(() => {
    const fetchNearestServiceCenters = async () => {
      // Use location from context or fallback to Punjagutta for initial view if needed, 
      // but logic relies on location being present to fetch "nearest".
      // If no location, we don't fetch.
      if (!location || !isClient) return;

      try {
        setLoading(true);
        const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/nearest_service_centers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lattitude: location.lat,
            longitude: location.lng,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch service centers');
        }

        const data = await response.json();

        if (data.success && data.nearestServiceCenters) {
          const transformedServices = data.nearestServiceCenters.map((service, index) => {
            // Generate map coordinates
            const angle = (index / 5) * 2 * Math.PI;
            const distance = 0.3 + index * 0.4;
            const latOffset = (distance / 111) * Math.cos(angle);
            const lngOffset = (distance / 111) * Math.sin(angle) / Math.cos(location.lat * Math.PI / 180);

            return {
              id: service._id,
              name: service.business_name || service.name || `${service.firstName} ${service.lastName}`,
              distance: `${distance.toFixed(1)} km`,
              rating: parseFloat(service.rating) || 4.5,
              status: service.storeHours ? service.storeHours : 'Open',
              phone: service.phone || '+91XXXXXXXXXX',
              description: service.description || 'No description available',
              businessname: service.business_name || 'No business name available',
              address: service.address || service.cityName || 'Hyderabad',
              lat: location.lat + latOffset,
              lng: location.lng + lngOffset,
              image: service.image && !service.image.startsWith('u')
                ? `https://api.doorstephub.com/${service.image}`
                : service.image ? `https://api.doorstephub.com/${service.image}` : `https://images.unsplash.com/photo-${index + 1}?w=400`,
              logo: service.logo
                ? `https://api.doorstephub.com/${service.logo}`
                : null,
            };
          });

          setServices(transformedServices.slice(0, 6));
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error('Error fetching service centers:', err);
        setError('Failed to load nearby services');
      } finally {
        setLoading(false);
      }
    };

    fetchNearestServiceCenters();
  }, [location, isClient]);

  // Handle GPS detection via Context
  const handleDetectLocation = async () => {
    try {
      await detectWithGPS();
    } catch (err) {
      console.error("Failed to detect location:", err);
    }
  };

  // Map Component - PERFECT FIT WITH DARK MODE
  const MapComponent = useCallback(() => {
    if (!isMapsLoaded || !location) return null;

    return (
      <div className="absolute inset-0 w-full h-full">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat: location.lat, lng: location.lng }}
          zoom={14}
          options={mapOptions} // DARK MODE APPLIED HERE
        >
          {/* You - Green marker */}
          <Marker
            position={{ lat: location.lat, lng: location.lng }}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: { width: 40, height: 40 },
              anchor: { x: 20, y: 40 }
            }}
            title="You are here"
          />

          {/* Services - Red/Yellow markers */}
          {services.map((service, index) => (
            <Marker
              key={service.id}
              position={{ lat: service.lat, lng: service.lng }}
              title={service.businessname}
              icon={{
                url: selectedService === index
                  ? 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                  : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: { width: 36, height: 36 },
                anchor: { x: 18, y: 36 }
              }}
              onClick={() => setSelectedService(index)}
            />
          ))}
        </GoogleMap>
      </div>
    );
  }, [isMapsLoaded, location, services, selectedService]);

  // Skeleton (YOUR ORIGINAL)
  const SkeletonService = () => (
    <div className="p-6 rounded-2xl bg-[#1a1a1a]/50 backdrop-blur-sm border border-[#037166]/20 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 bg-[#2a2a2a] rounded" />
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-[#2a2a2a] rounded-full" />
              <div className="h-3 w-12 bg-[#2a2a2a] rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#2a2a2a] rounded-full" />
          <div className="h-4 w-20 bg-[#2a2a2a] rounded" />
        </div>
        <div className="h-10 w-20 bg-[#2a2a2a] rounded-lg" />
      </div>
    </div>
  );

  // Hydration safe rendering
  if (!isClient) {
    return (
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a1410] to-[#0a0a0a]">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full">
              <defs>
                <pattern id="map-loading" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 10 10 L 90 10 L 90 90 L 10 90 Z" fill="none" stroke="rgba(3,113,102,0.3)" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="3" fill="rgba(3,113,102,0.5)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-loading)" />
            </svg>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 w-48 bg-[#2a2a2a] rounded-full mx-auto mb-8 animate-pulse" />
            <div className="h-12 w-64 bg-[#2a2a2a] rounded-xl mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 bg-[#2a2a2a] rounded mx-auto animate-pulse max-w-2xl" />
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="h-[500px] bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 border border-[#037166]/20 rounded-3xl animate-pulse" />
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => <SkeletonService key={i} />)}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // YOUR EXACT ORIGINAL UI WITH DARK MAP & INSTANT LOAD
  return (
    <section className="relative py-12 overflow-hidden">
      {/* Architectural World Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d12] to-[#0a0a0a]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Gradient Orbs - Intensified */}
        <motion.div
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#037166]/40 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: -mousePosition.x * 0.02,
            y: -mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#025951]/40 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-white/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-6">
            <Navigation className="w-4 h-4 text-[#037166]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent font-medium">Live Location Services</h6>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent">
              Nearby Appliance Service Centers
            </span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real-time availability of service centers near {location ? (location.shortAddress || 'you') : 'you'}
          </p>

          {/* <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/appliances/centers')}
            className="mt-8 px-8 py-3 bg-gradient-to-r from-[#037166] to-[#04a99d] text-white rounded-full font-medium shadow-lg hover:shadow-[#037166]/30 transition-all flex items-center gap-2 mx-auto"
          >
            Explore Service Centers
            <ArrowRight className="w-4 h-4" />
          </motion.button> */}

          {!location && (
            <div className="mt-4">
              <button
                onClick={handleDetectLocation}
                disabled={contextLoading}
                className="px-6 py-2 bg-[#037166] hover:bg-[#025951] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-all flex items-center justify-center gap-2 mx-auto"
              >
                {contextLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                {contextLoading ? 'Detecting...' : 'Detect My Location'}
              </button>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 🎯 DARK MAP - LOADS INSTANTLY */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 border border-[#037166]/20 shadow-2xl"
          >
            {/* Map fills entire card perfectly - DARK MODE */}
            <MapComponent />

            {/* Simple FAST FALLBACK */}
            {!isMapsLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a]/95 backdrop-blur-sm z-50">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="w-10 h-10 text-[#037166] animate-spin" />
                  <span className="text-[#037166] text-sm font-medium animate-pulse">
                    Loading Map...
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Service List - First 4 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {loading ? (
              Array(3).fill(0).map((_, i) => <SkeletonService key={i} />)
            ) : services.length > 0 ? (
              services.slice(0, 4).map((service, index) => (
                <motion.div
                  key={service.id}
                  onClick={() => setSelectedService(index)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${selectedService === index
                    ? 'bg-gradient-to-r from-[#037166]/20 to-[#025951]/20 border-2 border-[#037166]'
                    : 'bg-[#1a1a1a]/50 border border-[#037166]/20'
                    }`}
                >
                  <h4 className="text-xl font-bold bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent transition-colors">{service.name}</h4>
                  <p className="text-gray-400 text-sm">{service.address}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="flex items-center text-[#037166] text-sm"><Star className="w-4 h-4 mr-1" /> {service.rating}</span>
                    <h6 className="text-sm text-gray-400 font-normal">{service.status}</h6>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                {location ? 'No service centers found in your area.' : 'Please detect your location to find nearby centers.'}
              </div>
            )}
          </motion.div>
        </div>

        {/* Last 2 Service Centers - Side by Side Below Map */}
        {!loading && services.length >= 6 && (
          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {services.slice(4, 6).map((service, index) => {
              const actualIndex = index + 4;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  onClick={() => setSelectedService(actualIndex)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${selectedService === actualIndex
                    ? 'bg-gradient-to-r from-[#037166]/20 to-[#025951]/20 border-2 border-[#037166]'
                    : 'bg-[#1a1a1a]/50 border border-[#037166]/20'
                    }`}
                >
                  <h4 className="text-xl font-bold bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent transition-colors">{service.name}</h4>
                  <p className="text-gray-400 text-sm">{service.address}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="flex items-center text-[#037166] text-sm"><Star className="w-4 h-4 mr-1" /> {service.rating}</span>
                    <h6 className="text-sm text-gray-400 font-normal">{service.status}</h6>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Explore Stores Button - Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#037166]/50 text-white font-medium transition-all duration-300 flex items-center gap-2 group"
            onClick={() => router.push('/nearby-service-centers')}
          >
            Explore Service Centers
            <Navigation className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section >
  );
}
