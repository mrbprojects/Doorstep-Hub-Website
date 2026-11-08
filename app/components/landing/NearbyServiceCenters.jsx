'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {  Navigation, Star, Clock, Loader2, ArrowRight, Check } from 'lucide-react';
import { GoogleMap, Marker, OverlayViewF, FLOAT_PANE } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/hooks/useLocation';
import { getImageUrl } from '@/config/env';
import { useMounted } from '@/hooks/useMounted';

// Stable constants — defined outside component so they never re-create on render
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const GREEN_DOT = {
  url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  scaledSize: { width: 40, height: 40 },
  anchor: { x: 20, y: 40 },
};
const YELLOW_DOT_ACTIVE = {
  url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  scaledSize: { width: 44, height: 44 },
  anchor: { x: 22, y: 44 },
};
const CENTER_LOGO = {
  url: '/servicecenterpointlogo.png',
  scaledSize: { width: 38, height: 50 },
  anchor: { x: 19, y: 50 },
};

const FALLBACK_SERVICE_IMAGES = [
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop&q=80',
];

// Light map theme for landing page
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
        { "color": "#f8fafc" }
      ]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#334155" }
      ]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [
        { "color": "#ffffff" }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
        { "color": "#eef6f5" }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        { "color": "#ffffff" }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        { "color": "#f1f5f9" }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        { "color": "#dbeafe" }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#037166" }
      ]
    },
    {
      "featureType": "poi.business",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "transit.station.bus",
      "stylers": [
        { "visibility": "off" }
      ]
    }
  ]
};

export function NearbyServiceCenters() {
  const router = useRouter();
  const isClient = useMounted();
  const { location, detectWithGPS, loading: contextLoading, isMapsLoaded } = useLocation();
  const [selectedService, setSelectedService] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);
  const mapRef = React.useRef(null);
  // Lock initial center so GoogleMap center prop never changes after mount
  const [initialCenter, setInitialCenter] = useState(() => (location ? { lat: location.lat, lng: location.lng } : null));
  if (!initialCenter && location) {
    setInitialCenter({ lat: location.lat, lng: location.lng });
  }

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
              lat: (() => { const r = parseFloat(service?.lattitude || service?.latitude); const g = parseFloat(service?.longitude); return (!isNaN(r) && r !== 0 && !isNaN(g)) ? r : location.lat + latOffset; })(),
              lng: (() => { const r = parseFloat(service?.lattitude || service?.latitude); const g = parseFloat(service?.longitude); return (!isNaN(r) && r !== 0 && !isNaN(g)) ? g : location.lng + lngOffset; })(),
              image: service.image ? getImageUrl(service.image) : null,
              logo: service.logo ? getImageUrl(service.logo) : null,
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

  const handleMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  const panToService = useCallback((svc) => {
    if (mapRef.current && svc) {
      mapRef.current.panTo({ lat: svc.lat, lng: svc.lng });
      setMapZoom(16);
    }
  }, []);

  const handleCardHover = useCallback((index) => {
    setSelectedService(index);
    if (services[index]) panToService(services[index]);
  }, [services, panToService]);

  const handleCardLeave = useCallback(() => { setSelectedService(null); }, []);

  // Handle GPS detection via Context
  const handleDetectLocation = async () => {
    try {
      await detectWithGPS();
    } catch (err) {
      console.error("Failed to detect location:", err);
    }
  };

  // (MapComponent removed — GoogleMap rendered directly inline to prevent white-flash remounts)

  // Skeleton (YOUR ORIGINAL)
  const SkeletonService = () => (
    <div className="p-4 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200 animate-pulse">
      <div className="flex items-start gap-3.5 sm:gap-4">
        <div className="w-20 h-20 sm:w-[88px] sm:h-[88px] bg-slate-200 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2.5 min-w-0">
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 bg-slate-200 rounded-full" />
            <div className="h-4 w-12 bg-slate-200 rounded" />
          </div>
          <div className="h-5 w-44 bg-slate-200 rounded" />
          <div className="h-3 w-full bg-slate-200 rounded" />
          <div className="h-3 w-2/3 bg-slate-200 rounded" />
        </div>
        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-200 rounded-2xl shrink-0 self-center" />
      </div>
    </div>
  );

  // ─── Service Card Sub-component ──────────────────────────────────────────────
  const ServiceCard = ({ service, actualIndex }) => {
    const isActive = selectedService === actualIndex;
    const fallbackImg = FALLBACK_SERVICE_IMAGES[actualIndex % FALLBACK_SERVICE_IMAGES.length];
    // Prioritize actual partner logo first, then shop image, then fallback
    const cardImage = service.logo || service.image || fallbackImg;

    return (
      <motion.div
        key={service.id}
        onMouseEnter={() => handleCardHover(actualIndex)}
        onMouseLeave={handleCardLeave}
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/service-list/${service.slug || service.id}`);
        }}
        whileHover={{ x: 6 }}
        name="service-card"
        className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-sm relative group ${isActive
          ? 'bg-gradient-to-r from-[#e6f4f1] to-[#d8efe9] border-[#7dbeb3] shadow-lg shadow-[#037166]/10'
          : 'bg-white/95 border-slate-200 hover:border-[#037166]/40 shadow-xs hover:shadow-md'
          }`}
      >
        {isActive && (
          <span className="absolute top-3 right-16 inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#037166]/35 bg-white shadow-sm z-10">
            <Check className="h-3.5 w-3.5 text-[#037166]" />
          </span>
        )}
        <div className="flex items-start gap-3.5 sm:gap-4">
          {/* Store Image / Logo */}
          <div className="relative w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0 shadow-xs mt-0.5 flex items-center justify-center">
            <Image
              src={cardImage}
              alt={service.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                // Graceful multi-tier fallback: service.image -> fallback stock image
                if (service.image && e.currentTarget.src !== service.image) {
                  e.currentTarget.src = service.image;
                } else {
                  e.currentTarget.src = fallbackImg;
                }
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
             width={500} height={300} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Top Row: Distance & Rating */}
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#cbe8e1] text-[#1f4f49] whitespace-nowrap">
                {service.distance} AWAY
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">{service.rating}</span>
              </div>
            </div>

            {/* Business Name */}
            <h4 className={`text-base sm:text-lg font-bold transition-colors leading-snug mb-1 line-clamp-1 ${isActive ? 'text-[#005a52]' : 'text-slate-900 group-hover:text-[#00796F]'}`}>
              {service.name}
            </h4>

            {/* Address */}
            <p className="text-slate-500 text-xs line-clamp-2 mb-3">
              {service.address}
            </p>

            {/* Bottom Row: Time and View Details */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-[#00796F]" />
                <span className="text-[11px] sm:text-xs font-medium tracking-wide">{service.status}</span>
              </div>
              <div className="flex items-center gap-1 text-[#00796F] font-bold text-xs group-hover:gap-1.5 transition-all">
                View Details
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Floating WhatsApp button on the RIGHT */}
          <div className="flex items-center self-center shrink-0">
            <a
              href={`https://wa.me/918886688666?text=Hi, I'm interested in ${encodeURIComponent(service.name)} service.`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={`Chat with ${service.name} on WhatsApp`}
              aria-label={`Chat with ${service.name} on WhatsApp`}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-md shadow-[#25D366]/25 hover:shadow-lg hover:shadow-[#25D366]/35 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
            >
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
            </a>
          </div>
        </div>
      </motion.div>
    );
  };

  // Hydration safe rendering
  if (!isClient) {
    return (
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f3faf8] to-white">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full">
              <defs>
                <pattern id="map-loading" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 10 10 L 90 10 L 90 90 L 10 90 Z" fill="none" stroke="rgba(3,113,102,0.16)" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="3" fill="rgba(3,113,102,0.35)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-loading)" />
            </svg>
          </div>
        </div>
        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 w-48 bg-slate-200 rounded-full mx-auto mb-8 animate-pulse" />
            <div className="h-12 w-64 bg-slate-200 rounded-xl mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 bg-slate-200 rounded mx-auto animate-pulse max-w-2xl" />
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="h-[600px] bg-gradient-to-br from-white to-[#f8fafc] border border-slate-200 rounded-3xl animate-pulse" />
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
    <section
      className="relative py-8 sm:py-10 overflow-hidden"
      onClick={() => setSelectedService(null)}
    >
      {/* Section Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f3faf8] to-white" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Gradient Orbs - Intensified */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/35 rounded-full blur-[170px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/25 rounded-full blur-[170px] pointer-events-none" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-5 sm:mb-6"
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-[#EAF9F5] border border-[#00796F]/30 rounded-full mb-2.5 shadow-xs">
            <Navigation className="w-3.5 h-3.5 text-[#00796F]" />
            <span className="text-xs sm:text-sm text-[#00796F] font-bold tracking-wide uppercase">Nearby Service Provider Locations</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#102033] tracking-tight mb-2">
            Nearby Local <span className="text-[#00796F]">Service Providers</span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Find nearby appliance service providers for ACs, refrigerators, washing machines, TVs, water purifiers and more. Compare available professionals, choose a suitable service, and book convenient doorstep repair support in {location?.shortAddress || location?.city || 'your area'}.
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
            onClick={(e) => e.stopPropagation()}
            className="relative h-[700px] rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-2xl"
          >
            {/* Loading overlay */}
            {!isMapsLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50">
                <Loader2 className="w-10 h-10 text-[#037166] animate-spin mb-3" />
                <span className="text-[#037166] text-sm font-medium animate-pulse">Loading Map...</span>
              </div>
            )}

            {/* GoogleMap rendered INLINE — never wrapped in useCallback component */}
            {isMapsLoaded && initialCenter && (
              <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={initialCenter}
                zoom={mapZoom}
                options={mapOptions}
                onLoad={handleMapLoad}
                onZoomChanged={() => {
                  if (mapRef.current) {
                    const newZoom = mapRef.current.getZoom();
                    if (newZoom !== mapZoom) setMapZoom(newZoom);
                  }
                }}
                onClick={() => setSelectedService(null)}
              >
                {location && (
                  <Marker position={{ lat: location.lat, lng: location.lng }} icon={GREEN_DOT} title="You are here" zIndex={1000} />
                )}
                {services.map((service, index) => {
                  const isAct = selectedService === index || hoveredMarker === index;
                  return (
                    <React.Fragment key={service.id}>
                      <Marker
                        position={{ lat: service.lat, lng: service.lng }}
                        title={service.businessname}
                        icon={isAct ? YELLOW_DOT_ACTIVE : CENTER_LOGO}
                        zIndex={isAct ? 999 : index + 1}
                        onClick={() => setSelectedService(index)}
                        onDblClick={() => router.push(`/service-list/${service.slug || service.id}`)}
                        onMouseOver={() => setHoveredMarker(index)}
                        onMouseOut={() => setHoveredMarker(null)}
                      />
                      {/* Permanent Mini-Label (Google style) */}
                      {!isAct && (
                        <OverlayViewF
                          position={{ lat: service.lat, lng: service.lng }}
                          mapPaneName={FLOAT_PANE}
                        >
                          <div
                            style={{ position: 'absolute', transform: 'translate(-50%, 10px)', pointerEvents: 'none' }}
                            className="bg-black/60 backdrop-blur-sm border border-white/10 rounded px-1.5 py-0.5 shadow-md"
                          >
                            <span className="text-white text-[9px] font-bold truncate max-w-[80px] block">
                              {service.name.split(' ')[0]}
                            </span>
                          </div>
                        </OverlayViewF>
                      )}

                      {hoveredMarker === index && (
                        <OverlayViewF
                          position={{ lat: service.lat, lng: service.lng }}
                          mapPaneName={FLOAT_PANE}
                        >
                          <div
                            style={{ position: 'absolute', transform: 'translate(-50%, -110%)', pointerEvents: 'none', whiteSpace: 'nowrap', color: '#ffffff' }}
                            className="bg-black/90 backdrop-blur-md border border-[#037166]/60 rounded-xl px-3 py-2 shadow-2xl flex flex-col items-center gap-1 z-50"
                          >
                            <div className="flex items-center gap-2">
                              <div className="inline-flex h-3.5 w-3.5 items-center justify-center rounded border border-[#04a99d]/60 bg-white/10">
                                <Check className="h-2.5 w-2.5 text-[#04a99d]" />
                              </div>
                              <span className="text-xs font-bold" style={{ color: '#ffffff' }}>{service.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-medium opacity-90" style={{ color: '#ffffff' }}>
                              <Navigation className="w-2.5 h-2.5" />
                              Double-click to view details
                            </div>
                            {/* Connector arrow */}
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 border-r border-b border-[#037166]/60 rotate-45" />
                          </div>
                        </OverlayViewF>
                      )}
                      {selectedService === index && hoveredMarker !== index && (
                        <OverlayViewF
                          position={{ lat: service.lat, lng: service.lng }}
                          mapPaneName={FLOAT_PANE}
                        >
                          <div
                            style={{ position: 'absolute', transform: 'translate(-50%, -140%)', pointerEvents: 'none', whiteSpace: 'nowrap' }}
                            className="bg-gradient-to-r from-[#037166] to-[#025951] border border-[#04a99d]/60 rounded-full px-4 py-2 shadow-2xl flex items-center gap-2 ring-2 ring-white/10 z-50"
                          >
                            <div className="inline-flex h-4 w-4 items-center justify-center rounded border border-white/70 bg-white/20">
                              <Check className="h-2.5 w-2.5 text-white" />
                            </div>
                            <span className="text-xs font-bold tracking-wide uppercase" style={{ color: '#ffffff' }}>{service.name}</span>
                            {/* Connector arrow */}
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#025951] border-r border-b border-[#04a99d]/60 rotate-45" />
                          </div>
                        </OverlayViewF>
                      )}
                    </React.Fragment>
                  );
                })}
              </GoogleMap>
            )}

            {/* Map legend */}
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col gap-2 text-xs text-white z-10 pointer-events-none">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-400" /><span style={{ color: '#ffffff' }}>Your Location</span></div>
              <div className="flex items-center gap-2"><Image src="/servicecenterpointlogo.png" alt="c" className="w-4 h-4 object-contain"  width={16} height={16} /><span style={{ color: '#ffffff' }}>Service Center</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400" /><span style={{ color: '#ffffff' }}>Selected</span></div>
            </div>
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
              <div className="text-center py-10 text-gray-500" suppressHydrationWarning>
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
          className="flex justify-center mt-6 sm:mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 rounded-full bg-[#00796F] hover:bg-[#00695C] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#00796F]/25 hover:shadow-xl hover:shadow-[#00796F]/35 transition-all duration-300 flex items-center gap-2 group cursor-pointer"
            onClick={() => router.push('/nearby-service-centers')}
          >
            <span>Explore Service Centers</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section >
  );
}



