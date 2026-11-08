'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { MapPin, Navigation, Star, Phone, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GoogleMap, Marker, OverlayViewF, FLOAT_PANE } from '@react-google-maps/api';
import { useLocation } from '@/hooks/useLocation';
import { toast } from 'sonner';

// ── Stable constants outside component — never re-create, prevents GoogleMap remount ──
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const MAP_OPTIONS = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
    { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#8c8c8c' }] },
    { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#333333' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2d2d2d' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1410' }] },
    { featureType: 'transit', elementType: 'geometry.fill', stylers: [{ color: '#037166' }] },
    { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit.station.bus', stylers: [{ visibility: 'off' }] },
  ],
};

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

export function NearbyServiceCenters({ onViewAll }) {
  const router = useRouter();
  const { location, detectWithGPS, error: locationError, isMapsLoaded } = useLocation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [mapZoom, setMapZoom] = useState(14);
  const mapRef = React.useRef(null);

  // Lock the initial center so GoogleMap's center prop never changes after mount
  // Store initial center in state so GoogleMap's `center` prop never changes after mount
  const [initialCenter, setInitialCenter] = useState(() => (location ? { lat: location.lat, lng: location.lng } : null));
  if (location && !initialCenter) {
    setInitialCenter({ lat: location.lat, lng: location.lng });
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
          const transformed = data.nearestServiceCenters.slice(0, 8).map((service, index) => {
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
              name: service?.name || service?.business_name || `${service?.firstName || ''} ${service?.lastName || ''}`.trim() || 'Unknown Service',
              distance: `${dist.toFixed(1)} km`,
              rating: parseFloat(service?.rating) || 4.5,
              status: service?.storeHours || 'Open Now',
              phone: service?.phone || '+91 9876543210',
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

  // ── Imperative pan/zoom — never causes map remount ──────────────────────────
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

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const navigateToService = useCallback((service) => {
    router.push(`/service-list/${service.slug || service.id}`);
  }, [router]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <section 
      id="nearby-centers" 
      className="relative py-12 overflow-hidden"
      onClick={() => setSelectedService(null)}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a1410] to-[#0a0a0a]">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full">
            <defs>
              <pattern id="map-grid-svc" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 0 25 L 50 25 M 25 0 L 25 50" stroke="rgba(3,113,102,0.2)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid-svc)" />
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
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-white/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-6 mx-auto">
            <Navigation className="w-4 h-4 text-[#037166]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent font-medium">
              Nearby Service Provider Locations
            </h6>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent">
            Nearest Appliance Service Centers
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Find expert repair centers near you for all your home appliances.
            {/* <span className="block text-sm text-white/30 mt-1">
              Hover a center to highlight it on the map · Double-click marker to open
            </span> */}
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

        {/* Map + List Grid */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── MAP — rendered directly inline, no useCallback wrapper ── */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onClick={(e) => e.stopPropagation()}
            className="relative h-[600px] rounded-3xl overflow-hidden bg-[#1a1a1a] border border-[#037166]/20 shadow-2xl"
          >
            {/* Loading overlay */}
            {!isMapsLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] z-50">
                <Loader2 className="w-10 h-10 text-[#037166] animate-spin mb-4" />
                <span className="text-[#037166] text-sm font-medium animate-pulse">Loading Map...</span>
              </div>
            )}

            {/* GoogleMap always stays mounted — only markers swap on state change */}
            {isMapsLoaded && initialCenter && (
              <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={initialCenter}
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
                {/* User location */}
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

                      {hoveredMarker === index && (
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
                              <span className="text-white text-xs font-bold">{service.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-white font-medium opacity-90">
                              <Navigation className="w-2.5 h-2.5" />
                              Double-click to view details
                            </div>
                            {/* Connector arrow */}
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 border-r border-b border-[#037166]/60 rotate-45" />
                          </div>
                        </OverlayViewF>
                      )}

                      {/* Selected label (from list hover) */}
                      {selectedService === index && hoveredMarker !== index && (
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
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col gap-2 text-xs text-white/70 z-10 pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span>Your Location</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/servicecenterpointlogo.png" alt="center" className="w-4 h-4 object-contain"  width={16} height={16} />
                <span>Service Center</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span>Selected Center</span>
              </div>
            </div>

            {/* Hint */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm border border-[#037166]/30 rounded-lg px-3 py-1.5 text-[10px] text-white/50 z-10 pointer-events-none flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-[#04a99d]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2z" />
              </svg>
              Double-click marker to open center
            </div>
          </motion.div>

          {/* ── Service List ── */}
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
                <span className="text-xs text-white/50">
                  {services.length} centers found near you 
                </span>
              </div>
            )}

            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
              ))
            ) : services.length > 0 ? (
              services.map((service, index) => {
                const isActive = selectedService === index;
                return (
                  <motion.div
                    key={service.id}
                    onMouseEnter={() => handleCardHover(index)}
                    onMouseLeave={handleCardLeave}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToService(service);
                    }}
                    whileHover={{ x: 10 }}
                    className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-sm relative ${
                      isActive
                        ? 'bg-gradient-to-r from-[#037166]/25 to-[#025951]/20 border-[#037166] shadow-lg shadow-[#037166]/20'
                        : 'bg-[#1a1a1a]/50 border-white/10 hover:border-[#037166]/30 hover:bg-[#1a1a1a]/80'
                    }`}
                  >
                    {/* Active pulse */}
                    {isActive && (
                      <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#04a99d] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#04a99d]" />
                      </span>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#037166]/20 text-[#04a99d]">
                            {service.distance} AWAY
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#04a99d] text-[#04a99d]" />
                            <span className="text-xs font-bold text-white">{service.rating}</span>
                          </div>
                        </div>
                        <h4 className={`text-xl font-bold mb-1 truncate transition-colors ${isActive ? 'text-[#04a99d]' : 'text-white'}`}>
                          {service.name}
                        </h4>
                        <p className="text-white/40 text-sm line-clamp-1">{service.address}</p>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${service.phone}`; }}
                        className="flex-shrink-0 p-3 rounded-xl bg-[#037166]/10 hover:bg-[#037166] text-[#037166] hover:text-white transition-all border border-[#037166]/20 self-start"
                      >
                        <Phone className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-green-400" />
                        {service.status}
                      </span>
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="text-[10px] text-[#037166] flex items-center gap-1 animate-pulse">
                            <MapPin className="w-3 h-3" />
                            Shown on map
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); navigateToService(service); }}
                          className="text-xs font-bold text-[#04a99d] hover:text-white flex items-center gap-1 transition-colors"
                        >
                          View Details
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
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
            className="px-8 py-4 rounded-full bg-[#037166]/5 hover:bg-[#037166]/10 border border-[#037166]/10 hover:border-[#037166]/50 text-[#037166] font-medium transition-all duration-300 flex items-center gap-2 group"
            onClick={onViewAll}
          >
            View All Stores
            <Navigation className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
