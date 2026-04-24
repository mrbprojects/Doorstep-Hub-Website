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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/nearest_service_centers`, {
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
              slug: service.slug,
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
                ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.image}`
                : service.image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.image}` : `https://images.unsplash.com/photo-${index + 1}?w=400`,
              logo: service.logo
                ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.logo}`
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

  // ─── Service Card Sub-component ──────────────────────────────────────────────
  const ServiceCard = ({ service, actualIndex }) => (
    <motion.div
      key={service.id}
      onClick={() => router.push(`/service-list/${service.slug || service.id}`)}
      whileHover={{ y: -5 }}
      name="service-card"
      className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-sm relative group ${selectedService === actualIndex
        ? 'bg-gradient-to-r from-[#037166]/20 to-[#025951]/20 border-[#037166] shadow-lg shadow-[#037166]/10'
        : 'bg-[#1a1a1a]/50 border-white/10 hover:border-[#037166]/30'
        }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Top Row: Distance & Rating */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#037166]/20 text-[#04a99d] whitespace-nowrap">
              {service.distance} AWAY
            </span>
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-[#04a99d] text-[#04a99d]" />
              <span className="text-sm font-bold text-white/90">{service.rating}</span>
            </div>
          </div>

          {/* Business Name */}
          <h4 className="text-xl font-bold text-white group-hover:text-[#04a99d] transition-colors leading-tight mb-1.5">
            {service.name}
          </h4>

          {/* Address */}
          <p className="text-white/40 text-sm line-clamp-2 mb-4">
            {service.address}
          </p>

          {/* Bottom Row: Time and View Details */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 text-white/60">
              <Clock className="w-4 h-4 text-[#04a99d]" />
              <span className="text-xs font-medium tracking-wide">{service.status}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#04a99d] font-bold text-xs group-hover:gap-2 transition-all">
              View Details
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Floating WhatsApp button on the RIGHT */}
        <div className="flex items-center self-center">
          <a
            href={`https://wa.me/918886688666?text=Hi, I'm interested in ${service.name} service.`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-[#25D366] text-white/60 hover:text-white transition-all border border-white/10 hover:border-[#25D366] shadow-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
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
                <ServiceCard key={service.id} service={service} actualIndex={index} />
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
            {services.slice(4, 6).map((service, index) => (
              <ServiceCard key={service.id} service={service} actualIndex={index + 4} />
            ))}
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

