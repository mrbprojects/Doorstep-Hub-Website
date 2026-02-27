'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Star, Phone, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useLocation } from '@/hooks/useLocation';
import { toast } from 'sonner';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    { "featureType": "all", "elementType": "geometry", "stylers": [{ "color": "#1a1a1a" }] },
    { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#8c8c8c" }] },
    { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "color": "#000000" }] },
    { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#2a2a2a" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#333333" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#2d2d2d" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0a1410" }] },
    { "featureType": "transit", "elementType": "geometry.fill", "stylers": [{ "color": "#037166" }] }
  ]
};



export function NearbyServiceCenters({ onViewAll }) {
  const router = useRouter();
  const { location, detectWithGPS, error: locationError, isMapsLoaded } = useLocation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(0);

  // Fetch nearest service centers
  useEffect(() => {
    const fetchNearestServiceCenters = async () => {
      if (!location) return;

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
          const transformedServices = data.nearestServiceCenters.slice(0, 8).map((service, index) => {
            const angle = (index / 5) * 2 * Math.PI;
            const dist = 0.3 + index * 0.4;
            const latOffset = (dist / 111) * Math.cos(angle);
            const lngOffset = (dist / 111) * Math.sin(angle) / Math.cos(location.lat * Math.PI / 180);

            return {
              id: service?._id || index,
              name: service?.name || service?.business_name || `${service?.firstName || ''} ${service?.lastName || ''}` || 'Unknown Service',
              distance: `${dist.toFixed(1)} km`,
              rating: parseFloat(service?.rating) || 4.5,
              status: service?.storeHours || 'Open Now',
              phone: service?.phone || '+91 9876543210',
              address: service?.address || service?.cityName || 'Hyderabad, Telangana',
              lat: location.lat + latOffset,
              lng: location.lng + lngOffset,
              image: service?.image ? `https://api.doorstephub.com/${service.image}` : null,
              logo: service?.logo ? `https://api.doorstephub.com/${service.logo}` : null,
            };
          });

          setServices(transformedServices);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error('Error fetching service centers:', err);
        setError('Failed to load nearby services');
        toast.error('Failed to load nearby services');
      } finally {
        setLoading(false);
      }
    };

    fetchNearestServiceCenters();
  }, [location]);

  const MapComponent = React.useCallback(() => {
    if (!isMapsLoaded || !location) return null;

    return (
      <div className="absolute inset-0 w-full h-full">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat: location.lat, lng: location.lng }}
          zoom={14}
          options={mapOptions}
        >
          <Marker
            position={{ lat: location.lat, lng: location.lng }}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: { width: 40, height: 40 },
              anchor: { x: 20, y: 40 }
            }}
            title="You are here"
          />

          {services.map((service, index) => (
            <Marker
              key={service.id}
              position={{ lat: service.lat, lng: service.lng }}
              title={service.name}
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



  return (
    <section id="nearby-centers" className="relative py-12 overflow-hidden">
      {/* Dark Map Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a1410] to-[#0a0a0a]">
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
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#037166]/10 via-white/10 to-[#037166]/10 border border-[#037166]/30 rounded-full mb-6 mx-auto">
            <Navigation className="w-4 h-4 text-[#037166]" />
            <h6 className="text-sm bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent font-medium">Live Location Services</h6>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#037166] via-white to-[#037166] bg-clip-text text-transparent">
            Nearest Appliance Service Centers
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Find expert repair centers near you for all your home appliances.
          </p>

          {!location && (
            <div className="mt-8 flex flex-col items-center">
              <button
                onClick={detectWithGPS}
                className="px-8 py-3 bg-gradient-to-r from-[#037166] to-[#04a99d] hover:from-[#025951] text-white rounded-2xl font-medium transition-all shadow-lg shadow-[#037166]/30"
              >
                🔍 Detect My Location
              </button>
              {locationError && (
                <p className="text-red-400 mt-2 text-sm max-w-md">{locationError}</p>
              )}
            </div>
          )}
        </motion.div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 🎯 DARK MAP - LOADS INSTANTLY */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 border border-[#037166]/20 shadow-2xl"
          >
            <MapComponent />

            {!isMapsLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a]/95 backdrop-blur-sm z-50">
                <Loader2 className="w-10 h-10 text-[#037166] animate-spin mb-4" />
                <span className="text-[#037166] text-sm font-medium animate-pulse">Loading Map...</span>
              </div>
            )}
          </motion.div>

          {/* Service List */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
              ))
            ) : services.length > 0 ? (
              services.map((service, index) => (
                <motion.div
                  key={service.id}
                  onClick={() => setSelectedService(index)}
                  whileHover={{ x: 10 }}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-sm ${selectedService === index
                    ? 'bg-gradient-to-r from-[#037166]/20 to-[#025951]/20 border-[#037166] shadow-lg shadow-[#037166]/10'
                    : 'bg-[#1a1a1a]/50 border-white/10 hover:border-[#037166]/30'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#037166]/20 text-[#04a99d]">
                          {service.distance} AWAY
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[#04a99d] text-[#04a99d]" />
                          <span className="text-xs font-bold text-white">{service.rating}</span>
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-1 group-hover:text-[#04a99d] transition-colors">
                        {service.name}
                      </h4>
                      <p className="text-white/40 text-sm line-clamp-1">{service.address}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${service.phone}`;
                      }}
                      className="p-3 rounded-xl bg-[#037166]/10 hover:bg-[#037166] text-[#037166] hover:text-white transition-all border border-[#037166]/20"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-green-400" />
                      {service.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/appliances/store/${service.id}`);
                      }}
                      className="text-xs font-bold text-[#04a99d] hover:text-white flex items-center gap-1"
                    >
                      View Details
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-700 rounded-3xl">
                <p>No service centers found nearby</p>
                <button onClick={detectWithGPS} className="mt-4 px-6 py-2 bg-[#037166] text-white rounded-xl">Retry Detection</button>
              </div>
            )}
          </motion.div>
        </div>

        {/* View All Button */}
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
            onClick={onViewAll}
          >
            View All Stores
            <Navigation className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </section>
  );
}
