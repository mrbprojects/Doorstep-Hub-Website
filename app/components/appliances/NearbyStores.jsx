'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { Navigation, Star, Clock, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GoogleMap, Marker, OverlayViewF, OVERLAY_MOUSE_TARGET, FLOAT_PANE } from '@react-google-maps/api';
import { useLocation } from '@/hooks/useLocation';
import { toast } from 'sonner';

// ── Keep these outside component so they never re-create and cause map remount ──
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const MAP_OPTIONS = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e9e9e9' }, { lightness: 17 }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }, { lightness: 20 }] },
    { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }, { lightness: 17 }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { lightness: 18 }] },
    { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { lightness: 16 }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }, { lightness: 21 }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dedede' }, { lightness: 21 }] },
    { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }] },
    { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ saturation: 36 }, { color: '#333333' }, { lightness: 40 }] },
    { featureType: 'all', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#f2f2f2' }, { lightness: 19 }] },
    { featureType: 'administrative', elementType: 'geometry.fill', stylers: [{ color: '#fefefe' }, { lightness: 20 }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#fefefe' }, { lightness: 17 }, { weight: 1.2 }] }
  ],
};

const GREEN_DOT = {
  url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  scaledSize: { width: 44, height: 44 },
  anchor: { x: 22, y: 44 },
};

const YELLOW_DOT_ACTIVE = {
  url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  scaledSize: { width: 48, height: 48 },
  anchor: { x: 24, y: 48 },
};

const CENTER_LOGO = {
  url: '/servicecenterpointlogo.png',
  scaledSize: { width: 38, height: 50 },
  anchor: { x: 19, y: 50 },
};

export function NearbyServiceCenters({ onViewAll }) {
  const router = useRouter();
  const { location, detectWithGPS, error: locationError, isMapsLoaded } = useLocation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [mapZoom, setMapZoom] = useState(14);
  const mapRef = React.useRef(null);

  // Store initial center in a ref so GoogleMap's `center` prop never changes after mount
  const initialCenterRef = React.useRef(null);
  if (location && !initialCenterRef.current) {
    initialCenterRef.current = { lat: location.lat, lng: location.lng };
  }

  // ── Fetch nearest service centers ───────────────────────────────────────────
  useEffect(() => {
    const fetchNearestServiceCenters = async () => {
      if (!location) return;
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/nearest_service_centers`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lattitude: location.lat, longitude: location.lng }),
          }
        );
        if (!response.ok) throw new Error('Failed to fetch service centers');
        const data = await response.json();

        if (data.success && data.nearestServiceCenters) {
          const transformed = data.nearestServiceCenters.slice(0, 6).map((service, index) => {
            const rawLat = parseFloat(service?.lattitude || service?.latitude);
            const rawLng = parseFloat(service?.longitude);
            const hasRealCoords = !isNaN(rawLat) && !isNaN(rawLng) && rawLat !== 0 && rawLng !== 0;

            const angle = (index / 5) * 2 * Math.PI;
            const dist = 0.3 + index * 0.4;
            const latOffset = (dist / 111) * Math.cos(angle);
            const lngOffset = (dist / 111) * Math.sin(angle) / Math.cos(location.lat * Math.PI / 180);

            return {
              id: service?._id || index,
              slug: service?.slug,
              name: service?.business_name,
              distance: `${dist.toFixed(1)} km`,
              rating: parseFloat(service?.rating) || 4.5,
              status: service?.storeHours || 'Open Now',
              address: service?.address || service?.cityName || 'Hyderabad, Telangana',
              lat: hasRealCoords ? rawLat : location.lat + latOffset,
              lng: hasRealCoords ? rawLng : location.lng + lngOffset,
            };
          });
          setServices(transformed);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error('Error fetching service centers:', err);
        toast.error('Failed to load nearby services');
      } finally {
        setLoading(false);
      }
    };
    fetchNearestServiceCenters();
  }, [location]);

  // ── Imperatively pan — never causes GoogleMap remount ───────────────────────
  const panToService = useCallback((service) => {
    if (mapRef.current && service) {
      mapRef.current.panTo({ lat: service.lat, lng: service.lng });
      setMapZoom(16);
    }
  }, []);

  const handleCardHover = useCallback((index) => {
    setSelectedService(index);
    if (services[index]) panToService(services[index]);
  }, [services, panToService]);

  const handleCardLeave = useCallback(() => {
    setSelectedService(null);
  }, []);

  const navigateToService = useCallback((service) => {
    router.push(`/service-list/${service.slug || service.id}`);
  }, [router]);

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // ── Service Card ─────────────────────────────────────────────────────────────
  const ServiceCard = ({ service, actualIndex }) => {
    const isActive = selectedService === actualIndex;
    return (
      <motion.div
        onMouseEnter={() => handleCardHover(actualIndex)}
        onMouseLeave={handleCardLeave}
        onClick={(e) => {
          e.stopPropagation();
          navigateToService(service);
        }}
        whileHover={{ x: 0 }}
        className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-sm relative overflow-hidden ${isActive
            ? 'bg-gradient-to-r from-[#037166]/10 to-[#04a99d]/5 border-[#037166] shadow-xl shadow-[#037166]/10'
            : 'bg-white border-gray-100 hover:border-[#037166]/30 hover:bg-gray-50/50 shadow-sm'
          }`}
      >
        {/* Pulse indicator */}
        {isActive && (
          <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#037166] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#037166]" />
          </span>
        )}

        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#037166]/10 text-[#037166]">
                {service.distance} AWAY
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-[#037166] text-[#037166]" />
                <span className="text-xs font-bold text-gray-900">{service.rating}</span>
              </div>
            </div>
            <h4 className={`text-base sm:text-lg font-black mb-1 truncate transition-colors ${isActive ? 'text-[#037166]' : 'text-gray-900'}`}>
              {service.name}
            </h4>
            <p className="text-gray-500 text-sm line-clamp-1 mb-3">{service.address}</p>
          </div>

          {/* WhatsApp button */}
          <a
            href={`https://wa.me/918886688666?text=Hi, I'm interested in ${service.name} service.`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#25D366] text-white transition-all border border-[#25D366] shadow-lg shadow-[#25D366]/20 hover:scale-105 self-start"
            aria-label={`Chat on WhatsApp about ${service.name}`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
          </a>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-[#037166]" />
            {service.status}
          </span>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            {isActive && (
              <span className="text-[10px] text-[#037166] font-black uppercase hidden sm:flex items-center gap-1 animate-pulse">
                <MapPin className="w-3 h-3" />
                Shown on map
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); navigateToService(service); }}
              className="text-xs font-black text-[#037166] hover:text-[#04a99d] flex items-center gap-1 transition-colors uppercase tracking-widest"
            >
              Details
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <section 
      id="nearby-centers" 
      className="relative pt-10 pb-28 md:py-12 overflow-hidden"
      onClick={() => setSelectedService(null)}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f9fcfb] via-white to-[#f6fbfa]">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full">
            <defs>
              <pattern id="map-grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 0 25 L 50 25 M 25 0 L 25 50" stroke="rgba(3,113,102,0.2)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-10"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-[#037166]/10 via-white/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-4 md:mb-6 mx-auto">
            <Navigation className="w-4 h-4 text-[#037166]" />
            <h6 className="text-xs md:text-sm bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent font-medium">
              Live Location Services
            </h6>
          </div>

          <h2 className="text-2xl sm:text-5xl font-bold mb-3 md:mb-4 text-[#0f172a] leading-tight">
            Nearest Appliance Service Centers
          </h2>

          <p className="text-[#475569] text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Find expert repair centers near you for all your home appliances.
            <span className="hidden sm:block text-sm text-[#64748b] mt-1">
              Hover a center to highlight it on the map · Double-click marker to open
            </span>
          </p>

          {!location && (
            <div className="mt-8 flex flex-col items-center">
              <button
                onClick={detectWithGPS}
                className="px-8 py-3 bg-gradient-to-r from-[#037166] to-[#04a99d] hover:from-[#025951] text-white rounded-2xl font-medium transition-all shadow-lg shadow-[#037166]/30"
              >
                🔍 Detect My Location
              </button>
              {locationError && <p className="text-red-400 mt-2 text-sm max-w-md">{locationError}</p>}
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <div>
          <div className="grid lg:grid-cols-2 gap-5 lg:gap-8">

            {/* ── MAP — rendered directly (no useCallback wrapper) ── */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-[320px] sm:h-[420px] lg:h-[600px] rounded-2xl md:rounded-3xl overflow-hidden bg-white border border-[#cfe7e2] shadow-xl"
            >
              {/* Loading overlay */}
              {!isMapsLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#eef7f5] z-50">
                  <Loader2 className="w-10 h-10 text-[#037166] animate-spin mb-4" />
                  <span className="text-[#037166] text-sm font-medium animate-pulse">Loading Map...</span>
                </div>
              )}

              {/* GoogleMap — always mounted when isMapsLoaded, never wrapped in a useCallback component */}
              {isMapsLoaded && initialCenterRef.current && (
                <GoogleMap
                  mapContainerStyle={MAP_CONTAINER_STYLE}
                  center={initialCenterRef.current}
                  zoom={mapZoom}
                  options={MAP_OPTIONS}
                  onLoad={handleMapLoad}
                  onZoomChanged={() => {
                    if (mapRef.current) {
                      const newZoom = mapRef.current.getZoom();
                      if (newZoom !== mapZoom) setMapZoom(newZoom);
                    }
                  }}
                  onClick={() => setSelectedService(null)}
                >
                  {/* User marker */}
                  {location && (
                    <Marker
                      position={{ lat: location.lat, lng: location.lng }}
                      icon={GREEN_DOT}
                      title="You are here"
                      zIndex={1000}
                    />
                  )}

                  {/* Service center markers */}
                  {services.map((service, index) => {
                    const isSelected = selectedService === index;
                    const isHoveredOnMap = hoveredMarker === index;
                    const isActive = isSelected || isHoveredOnMap;

                    return (
                      <React.Fragment key={service.id}>
                        <Marker
                          position={{ lat: service.lat, lng: service.lng }}
                          title={service.name}
                          icon={isActive ? YELLOW_DOT_ACTIVE : CENTER_LOGO}
                          zIndex={isActive ? 999 : index + 1}
                          onClick={() => setSelectedService(index)}
                          onDblClick={() => navigateToService(service)}
                          onMouseOver={() => setHoveredMarker(index)}
                          onMouseOut={() => setHoveredMarker(null)}
                        />

                        {/* Permanent Mini-Label (Google style) */}
                        {!isActive && (
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

                        {/* Hover tooltip: path/directions icon */}
                        {isHoveredOnMap && (
                          <OverlayViewF
                            position={{ lat: service.lat, lng: service.lng }}
                            mapPaneName={FLOAT_PANE}
                          >
                            <div
                              style={{ position: 'absolute', transform: 'translate(-50%, -110%)', pointerEvents: 'none', whiteSpace: 'nowrap' }}
                              className="bg-black/90 backdrop-blur-md border border-[#037166]/60 rounded-xl px-3 py-2 shadow-2xl flex flex-col items-center gap-1 z-50"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#04a99d] shadow-[0_0_8px_#04a99d]" />
                                <span className="text-white text-xs font-bold" style={{ color: '#ffffff' }}>{service.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-white font-medium opacity-90" style={{ color: '#ffffff' }}>
                                <Navigation className="w-2.5 h-2.5" />
                                Double-click to view details
                              </div>
                              {/* Connector arrow */}
                              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 border-r border-b border-[#037166]/60 rotate-45" />
                            </div>
                          </OverlayViewF>
                        )}

                        {/* Selected label (from list hover) */}
                        {isSelected && !isHoveredOnMap && (
                          <OverlayViewF
                            position={{ lat: service.lat, lng: service.lng }}
                            mapPaneName={FLOAT_PANE}
                          >
                            <div
                              style={{ position: 'absolute', transform: 'translate(-50%, -140%)', pointerEvents: 'none', whiteSpace: 'nowrap' }}
                              className="bg-gradient-to-r from-[#037166] to-[#025951] border border-[#04a99d]/60 rounded-full px-4 py-2 shadow-2xl flex items-center gap-2 ring-2 ring-white/10 z-50"
                            >
                              <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
                              <span className="!text-white text-xs font-bold tracking-wide uppercase">{service.name}</span>
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

              {/* Map Legend */}
              <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-white/95 backdrop-blur-md border border-[#cfe7e2] rounded-xl p-2 md:p-3 flex flex-col gap-1.5 md:gap-2 text-[10px] md:text-xs text-[#334155] z-10 pointer-events-none shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span>Your Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/servicecenterpointlogo.png" alt="center" className="w-4 h-4 object-contain" />
                  <span>Service Center</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span>Selected Center</span>
                </div>
              </div>

              {/* Double-click hint */}
              <div className="hidden sm:flex absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-[#cfe7e2] rounded-lg px-3 py-1.5 text-[10px] text-[#475569] z-10 pointer-events-none items-center gap-1.5 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-[#04a99d]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2z" />
                </svg>
                Double-click marker to open center
              </div>
            </motion.div>

            {/* ── Service List (first 4) ── */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onClick={(e) => e.stopPropagation()}
            className="space-y-4"
            >
              {!loading && services.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#04a99d] animate-pulse" />
                  <span className="text-xs text-[#64748b]">
                    {services.length} centers found near you · Hover to highlight on map
                  </span>
                </div>
              )}

              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
                ))
              ) : services.length > 0 ? (
                services.slice(0, 4).map((service, index) => (
                  <ServiceCard key={service.id} service={service} actualIndex={index} />
                ))
              ) : (
                <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-700 rounded-3xl">
                  <p>No service centers found nearby</p>
                  <button onClick={detectWithGPS} className="mt-4 px-6 py-2 bg-[#037166] text-white rounded-xl">
                    Retry Detection
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Last 2 centers below */}
          {!loading && services.length >= 6 && (
            <div 
              className="grid lg:grid-cols-2 gap-8 mt-8"
              onClick={(e) => e.stopPropagation()}
            >
              {services.slice(4, 6).map((service, index) => (
                <ServiceCard key={service.id} service={service} actualIndex={index + 4} />
              ))}
            </div>
          )}
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full bg-[#037166] hover:bg-[#037166]/10 border border-white/10 hover:border-[#037166]/50 text-white font-medium transition-all duration-300 flex items-center gap-2 group"
            onClick={onViewAll}
          >
            Explore Service Centers
            <Navigation className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

