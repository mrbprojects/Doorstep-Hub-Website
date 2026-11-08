'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Home, Briefcase, MapPin, Plus, Check, X, Trash2, Edit2, Loader2, Search, Crosshair } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useLocationContext } from '@/context/LocationContext';
import { useServiceCart } from '@/context/ServiceCartContext';
import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/auth/AuthModal';
import { GoogleMap } from '@react-google-maps/api';
import { locationManager } from '@/services/locationManager';
import { inferVertical, trackLeadEvent } from '@/lib/leadTracking';

function areCitiesMatching(cityA, cityB) {
  if (!cityA || !cityB) return true;
  const clean = (c) => String(typeof c === 'object' ? (c?.name || '') : c || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const a = clean(cityA);
  const b = clean(cityB);
  if (!a || !b) return true;
  if (a === b) return true;
  const hyderabadGroup = ['hyderabad', 'secunderabad', 'cyberabad'];
  if (hyderabadGroup.includes(a) && hyderabadGroup.includes(b)) return true;
  if (a.includes(b) || b.includes(a)) return true;
  return false;
}


const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };
const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: 'greedy'
};

export function AddressPage({
  selectedAddress,
  onSelectAddress,
  onBack,
  onContinue,
}) {
  const { user, token, isAuthenticated } = useAuth();
  const { location: contextLocation, detectWithGPS, loading: locationLoading, isMapsLoaded } = useLocationContext();
  const router = useRouter();
  const { cartData } = useServiceCart();
  const [locationMismatch, setLocationMismatch] = useState(null);
  const mapRef = React.useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [, setDetectionSuccess] = useState(false);
  const [locationPermission, setLocationPermission] = useState('unknown');
  const [showPermissionBanner, setShowPermissionBanner] = useState(true);

  useEffect(() => {
    trackLeadEvent({ eventType: 'BOOKING_STARTED', vertical: inferVertical(), _user: user });
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);
        if (result.state === 'denied') setShowPermissionBanner(true);
        result.onchange = () => {
          setLocationPermission(result.state);
          if (result.state === 'denied') setShowPermissionBanner(true);
        };
      });
    }
  }, []);

  const [newAddress, setNewAddress] = useState(() => ({
    name: user?.name || '',
    phone: user?.mobile || user?.phone || '',
    type: 'Home',
    area: '',
    flat: '',
    postalCode: '',
    addressLineOne: '',
    addressLineTwo: '',
    stateName: 'Telangana',
    cityName: 'Hyderabad',
    defaultAddress: false,
    latitude: contextLocation?.lat || "17.450123",
    longitude: contextLocation?.lng || "78.390456",
    stateId: "680cbb3d2d42e474f451ace3",
    cityId: "684d704faa93650a05d5ff47"
  }));
  const [hasAutoDetected, setHasAutoDetected] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    lat: Number(contextLocation?.lat) || 17.450123,
    lng: Number(contextLocation?.lng) || 78.390456
  });
  const initialCenterRef = React.useRef(null);

  // Sync initial state and map center if contextLocation arrives
  useEffect(() => {
    const initLocation = async () => {
      if (contextLocation?.lat && !hasAutoDetected) {
        const lat = Number(contextLocation.lat);
        const lng = Number(contextLocation.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
          const coords = { lat, lng };
          setMapCenter(coords);
          if (!initialCenterRef.current) initialCenterRef.current = coords;
          setHasAutoDetected(true);
        }

        try {
          const data = await locationManager.reverseGeocode(lat, lng);
          setNewAddress(prev => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString(),
            area: data.area || contextLocation.area || prev.area,
            cityName: data.city || contextLocation.city || prev.cityName,
            postalCode: data.postalCode || contextLocation.postalCode || prev.postalCode,
            flat: data.flat || contextLocation.flat || prev.flat,
            addressLineOne: data.address || contextLocation.address || prev.addressLineOne,
            stateName: data.state || contextLocation.state || prev.stateName
          }));
          if (addresses.length === 0 && !loading) {
            setShowAddForm(true);
          }
        } catch (e) {
          console.warn("Initial reverseGeocode failed", e);
        }
      }
    };
    initLocation();
  }, [contextLocation, hasAutoDetected, addresses.length, loading]);

  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/useraddress/getuseraddress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setAddresses(data.data || []);
        // Auto-select default address if none selected
        if (!selectedAddress && data.data?.length > 0) {
          const def = data.data.find(a => a.defaultAddress) || data.data[0];
          onSelectAddress(def);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [token, selectedAddress, onSelectAddress]);

  useEffect(() => {
    let isCancelled = false;
    if (isAuthenticated && token) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/useraddress/getuseraddress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (isCancelled) return;
          if (data.success) {
            setAddresses(data.data || []);
            if (!selectedAddress && data.data?.length > 0) {
              const defaultAddr = data.data.find(addr => addr.defaultAddress) || data.data[0];
              onSelectAddress(defaultAddr);
            }
          }
        })
        .catch(error => {
          if (!isCancelled) {
            console.error('Error fetching addresses:', error);
            toast.error('Failed to load addresses');
          }
        });
    } else if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 500);
      return () => { isCancelled = true; clearTimeout(timer); };
    }
    return () => { isCancelled = true; };
  }, [isAuthenticated, token, selectedAddress, onSelectAddress]);

  const handleAutoDetect = async () => {
    setIsLocating(true);
    try {
      const locationData = await detectWithGPS();

      if (!locationData || !locationData.lat) {
        toast.error('Precise location unavailable. Please enable GPS or drag map.');
        return;
      }

      setNewAddress(prev => ({
        ...prev,
        area: locationData.area || '',
        cityName: locationData.city || locationData.cityName || '',
        postalCode: locationData.postalCode || '',
        stateName: locationData.state || locationData.stateName || 'Telangana',
        addressLineOne: locationData.address || '',
        flat: locationData.flat || prev.flat,
        latitude: locationData.lat.toString(),
        longitude: locationData.lng.toString()
      }));

      const lat = Number(locationData.lat);
      const lng = Number(locationData.lng);

      if (!isNaN(lat) && !isNaN(lng)) {
        const coords = { lat, lng };
        setMapCenter(coords);
        if (mapRef.current) {
          mapRef.current.panTo(coords);
          mapRef.current.setZoom(17);
        }
      }

      setShowAddForm(true);
      setDetectionSuccess(true);

      if (locationData.isEstimated) {
        toast.info('Using estimated area (GPS denied)');
      } else {
        toast.success('Location detected successfully!');
      }

      setTimeout(() => setDetectionSuccess(false), 3000);
    } catch (error) {
      console.warn('GPS failed:', error);
      toast.error('GPS access denied. Use map drag or manual entry.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleAddOrUpdateAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.area || !newAddress.flat || !newAddress.postalCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const url = editingAddress
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/edituseraddress/${editingAddress._id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/useraddress/addaddress`;

      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newAddress,
          latitude: newAddress.latitude.toString(),
          longitude: newAddress.longitude.toString(),
          defaultAddress: addresses.length === 0 ? true : newAddress.defaultAddress
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingAddress ? 'Address updated!' : 'Address added!');
        trackLeadEvent({
          eventType: 'LOCATION_ADDED',
          vertical: 'services',
          city: newAddress.cityName,
          area: newAddress.area,
          pincode: newAddress.postalCode,
          customerName: newAddress.name,
          mobile: newAddress.phone,
          _user: user,
        });
        setShowAddForm(false);
        setEditingAddress(null);
        fetchAddresses();
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/useraddress/deleteuseraddress/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Address deleted');
        fetchAddresses();
      }
    } catch {
      toast.error('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (address) => {
    setEditingAddress(address);
    setNewAddress({
      name: address.name,
      phone: address.phone,
      type: address.type,
      area: address.area,
      flat: address.flat,
      postalCode: address.postalCode,
      addressLineOne: address.addressLineOne,
      addressLineTwo: address.addressLineTwo,
      stateName: address.stateName || 'Telangana',
      cityName: address.cityName || 'Hyderabad',
      defaultAddress: address.defaultAddress,
      latitude: address.latitude || "17.450123",
      longitude: address.longitude || "78.390456",
      stateId: address.stateId || "680cbb3d2d42e474f451ace3",
      cityId: address.cityId || "684d704faa93650a05d5ff47"
    });
    setShowAddForm(true);
  };

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'home':
        return Home;
      case 'office':
        return Briefcase;
      default:
        return MapPin;
    }
  };

  const handleContinue = () => {
    if (!selectedAddress) {
      toast.error('Please select an address');
      return;
    }

    // Check if selected service center city matches customer address city
    const providerCity = cartData?.provider?.cityName;
    const userCity = selectedAddress?.cityName;
    if (providerCity && userCity && !areCitiesMatching(userCity, providerCity)) {
      const providerName = cartData?.provider?.businessName ||
        cartData?.provider?.name ||
        [cartData?.provider?.firstName, cartData?.provider?.lastName].filter(Boolean).join(' ') ||
        'Selected Service Center';

      const userCityStr = typeof userCity === 'object' ? (userCity?.name || '') : String(userCity);
      const providerCityStr = typeof providerCity === 'object' ? (providerCity?.name || '') : String(providerCity);

      setLocationMismatch({
        userCity: userCityStr,
        providerCity: providerCityStr,
        providerName
      });
      return;
    }

    // Save address to sessionStorage for other pages
    sessionStorage.setItem('selected_address', JSON.stringify(selectedAddress));
    trackLeadEvent({
      eventType: 'LOCATION_ADDED',
      vertical: 'services',
      city: selectedAddress.cityName,
      area: selectedAddress.area,
      pincode: selectedAddress.postalCode,
      customerName: selectedAddress.name,
      mobile: selectedAddress.phone,
      _user: user,
    });
    onContinue();
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-20 pb-32"
    >
      {/* Header */}
      <section className="top-20 z-40 bg-gradient-to-r from-[#025a51] via-[#037166] to-[#04a99d] border-b border-white/10 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3"
          >
            <MapPin className="w-8 h-8" />
            Manage Address
          </motion.h1>
        </div>
      </section>

      <div className="max-w-[1000px] mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Saved Addresses */}
          <AnimatePresence mode="popLayout">
            {loading && addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/40">
                <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#037166]" />
                <p>Loading your addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="relative w-full h-[400px] rounded-3xl overflow-hidden bg-[#f0f2f5] border border-gray-200/20 group">
                {/* Real-time Google Map */}
                {isMapsLoaded ? (
                  <>
                    {/* GPS Guidance Banner */}
                    {locationPermission === 'denied' && showPermissionBanner && (
                      <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-4 left-4 right-4 z-20 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-between gap-4 pointer-events-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-yellow-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">GPS matches disabled</p>
                            <p className="text-[11px] text-white/60">Drag the pin to your exact location for service.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowPermissionBanner(false)}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-white/40" />
                        </button>
                      </motion.div>
                    )}
                    <GoogleMap
                      mapContainerStyle={MAP_CONTAINER_STYLE}
                      center={mapCenter}
                      zoom={17}
                      options={MAP_OPTIONS}
                      onLoad={(map) => { mapRef.current = map; }}
                      onDragStart={() => setIsDragging(true)}
                      onDragEnd={async () => {
                        if (!mapRef.current) return;
                        const center = mapRef.current.getCenter();
                        const lat = Number(center.lat());
                        const lng = Number(center.lng());

                        if (!isNaN(lat) && !isNaN(lng)) {
                          setMapCenter({ lat, lng });
                        }

                        try {
                          const data = await locationManager.reverseGeocode(lat, lng);
                          setNewAddress(prev => ({
                            ...prev,
                            area: data.area || prev.area,
                            cityName: data.city || prev.cityName,
                            postalCode: data.postalCode || prev.postalCode,
                            stateName: data.state || prev.stateName,
                            addressLineOne: data.address,
                            flat: data.flat || prev.flat,
                            latitude: lat.toString(),
                            longitude: lng.toString()
                          }));

                          if (addresses.length === 0) {
                            setShowAddForm(true);
                          }
                        } catch (error) {
                          console.error("Geocoding failed", error);
                        } finally {
                          setIsDragging(false);
                        }
                      }}
                    >
                      {/* Search Bar Overlay */}
                      <div className="absolute top-4 left-4 right-4 z-10">
                        <div className="relative">
                          <div className="w-full bg-white rounded-xl shadow-lg shadow-black/5 p-4 flex items-center gap-3">
                            <Search className="w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => {
                                const query = e.target.value;
                                setSearchQuery(query);
                                if (query.length > 2) {
                                  locationManager.searchLocation(query).then(setSearchResults);
                                } else {
                                  setSearchResults([]);
                                }
                              }}
                              placeholder="Search for your location"
                              className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm font-medium"
                            />
                            {searchQuery && (
                              <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-4 h-4 text-gray-400" />
                              </button>
                            )}
                          </div>

                          {/* Search Results Dropdown */}
                          {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto divide-y divide-gray-50 z-50">
                              {searchResults.map((result) => (
                                <button
                                  key={result.place_id}
                                  onClick={async () => {
                                    setSearchQuery(result.description);
                                    setSearchResults([]);
                                    try {
                                      const loc = await locationManager.setManualLocation(result.place_id);
                                      const lat = Number(loc.lat);
                                      const lng = Number(loc.lng);

                                      if (!isNaN(lat) && !isNaN(lng)) {
                                        const coords = { lat, lng };
                                        setMapCenter(coords);
                                        setNewAddress(prev => ({
                                          ...prev,
                                          ...loc,
                                          latitude: lat.toString(),
                                          longitude: lng.toString()
                                        }));
                                        if (mapRef.current) {
                                          mapRef.current.panTo(coords);
                                          mapRef.current.setZoom(17);
                                          setShowAddForm(true);
                                        }
                                      }
                                    } catch {
                                      toast.error("Failed to load location");
                                    }
                                  }}
                                  className="w-full p-3 text-left hover:bg-gray-50 flex items-start gap-3 transition-colors"
                                >
                                  <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{result.main_text}</p>
                                    <p className="text-xs text-gray-400 line-clamp-1">{result.secondary_text}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Locate Me Button status-aware */}
                      <div className="absolute bottom-24 right-6 z-20">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAutoDetect(); }}
                          disabled={isLocating}
                          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 ${locationPermission === 'denied'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                            : 'bg-white text-[#037166] hover:bg-gray-50'
                            }`}
                          title={locationPermission === 'denied' ? 'Enable GPS in browser settings' : 'Use Current Location'}
                        >
                          {isLocating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : locationPermission === 'denied' ? (
                            <X className="w-5 h-5" />
                          ) : (
                            <Crosshair className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                    </GoogleMap>

                    {/* Fixed Center Pin Target */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                      <div className="relative -mt-8 transition-transform duration-200" style={{ transform: isDragging ? 'scale(1.1) translateY(-10px)' : 'scale(1) translateY(0)' }}>
                        <div className="w-4 h-4 rounded-full bg-black/20 animate-ping absolute -bottom-1 left-1/2 -translate-x-1/2" />
                        <MapPin className="w-10 h-10 text-[#ea4335] drop-shadow-xl relative z-10" fill="#ea4335" />
                        <div className="w-1 h-3 bg-black/80 mx-auto rounded-full mt-1" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-100">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#037166]" />
                    <span className="text-sm">Loading Google Maps...</span>
                  </div>
                )}
              </div>
            ) : (
              addresses.map((address, index) => {
                const Icon = getIcon(address.type);
                const isSelected = selectedAddress?._id === address._id;

                return (
                  <motion.div
                    key={address._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                    layout
                    onClick={() => onSelectAddress(address)}
                    className={`relative cursor-pointer rounded-2xl p-5 transition-all duration-300 group ${isSelected
                      ? 'bg-gradient-to-br from-[#037166]/20 to-[#04a99d]/10 border-2 border-[#037166] shadow-lg shadow-[#037166]/10'
                      : 'bg-[#1a1a1a] border border-white/5 hover:border-white/20'
                      }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected
                          ? 'bg-gradient-to-br from-[#037166] to-[#04a99d]'
                          : 'bg-white/5'
                          }`}>
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-[#04a99d]'}`} />
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditClick(address); }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-[#04a99d] transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address._id); }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h4 className="text-lg font-bold text-white capitalize">
                            {address.type || 'Other'}
                          </h4>
                          {address.defaultAddress && (
                            <span className="px-2 py-0.5 rounded-full bg-[#037166]/20 text-[#04a99d] text-[10px] font-bold tracking-wider">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        {/* Name + Phone */}
                        <p className="font-semibold text-white/90 text-sm mb-1">
                          {address.name || address.userName || ''}
                          {address.phone ? <span className="font-normal text-white/60"> &bull; {address.phone}</span> : null}
                        </p>
                        {/* Street: flat, area, addressLineOne, addressLineTwo — strip N/A */}
                        {(() => {
                          const clean = (v) => (!v || String(v).trim().toUpperCase() === 'N/A' ? null : String(v).trim());
                          const street = [clean(address.flat), clean(address.area), clean(address.addressLineOne), clean(address.addressLineTwo)].filter(Boolean);
                          const seen = new Set();
                          const unique = street.filter(s => { const k = s.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
                          return unique.length > 0 ? (
                            <p className="text-white/60 text-xs leading-relaxed mb-1 line-clamp-2">{unique.join(', ')}</p>
                          ) : null;
                        })()}
                        {/* City, State, Pincode */}
                        {(() => {
                          const clean = (v) => (!v || String(v).trim().toUpperCase() === 'N/A' ? null : String(v).trim());
                          const city = [clean(address.cityName), clean(address.stateName), clean(address.postalCode)].filter(Boolean);
                          return city.length > 0 ? (
                            <p className="text-white/40 text-[11px] font-medium uppercase tracking-tight">{city.join(', ')}</p>
                          ) : null;
                        })()}
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] flex items-center justify-center border-2 border-black z-10"
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>

          {/* Add New Address Button */}
          {!showAddForm && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => {
                setEditingAddress(null);
                setNewAddress({
                  name: user?.name || '',
                  phone: user?.mobile || user?.phone || '',
                  type: 'Home',
                  area: '',
                  flat: '',
                  postalCode: '',
                  addressLineOne: '',
                  addressLineTwo: '',
                  stateName: 'Telangana',
                  cityName: contextLocation?.city || 'Hyderabad',
                  defaultAddress: false,
                  latitude: contextLocation?.lat || "17.450123",
                  longitude: contextLocation?.lng || "78.390456",
                  area: contextLocation?.area || '',
                  postalCode: contextLocation?.postalCode || '',
                  flat: contextLocation?.flat || '',
                  addressLineOne: contextLocation?.address || ''
                });
                setShowAddForm(true);
                setTimeout(() => handleAutoDetect(), 100);
              }}
              className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#037166]/50 bg-white/5 hover:bg-[#037166]/5 transition-all group min-h-[200px]"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#037166] group-hover:border-[#037166] transition-all">
                <Plus className="w-6 h-6 text-white/40 group-hover:text-white" />
              </div>
              <span className="text-white/60 group-hover:text-white font-medium text-base">Add New Address</span>
            </motion.button>
          )}

          {/* Add Address Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="col-span-1 sm:col-span-2 lg:col-span-2"
              >
                <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-2xl font-bold text-white">
                        {editingAddress ? 'Edit Service Address' : 'New Service Address'}
                      </h4>
                      <p className="text-white/40 text-sm mt-1">Please provide accurate details for seamless service delivery</p>
                    </div>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-500 transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-3 px-1">Address Type</label>
                      <div className="flex flex-wrap gap-3">
                        {['Home', 'Office', 'Other'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setNewAddress({ ...newAddress, type })}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${newAddress.type === type
                              ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white border-transparent shadow-lg shadow-[#037166]/20'
                              : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                              }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest px-1">Contact Person</label>
                        <input
                          placeholder="Receiver Name"
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/5 text-white focus:border-[#037166] focus:bg-white/10 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest px-1">Phone Number</label>
                        <input
                          placeholder="Contact Number"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/5 text-white focus:border-[#037166] focus:bg-white/10 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5 relative">
                        <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest px-1">Flat / House / Office No.</label>
                        <input
                          placeholder="e.g. Flat 101, Plot 42"
                          value={newAddress.flat}
                          onChange={(e) => setNewAddress({ ...newAddress, flat: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/5 text-white focus:border-[#037166] focus:bg-white/10 transition-all outline-none pr-24"
                        />
                        <button
                          onClick={handleAutoDetect}
                          disabled={locationLoading}
                          className="absolute right-2 bottom-1.5 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#037166]/20 text-[#04a99d] text-[10px] font-bold border border-[#037166]/30 hover:bg-[#037166]/40 transition-all disabled:opacity-50"
                        >
                          {locationLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                          Detect
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest px-1">Area / Locality / Landmark</label>
                        <input
                          placeholder="e.g. Jubilee Hills, Near Metro"
                          value={newAddress.area}
                          onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/5 text-white focus:border-[#037166] focus:bg-white/10 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest px-1">City</label>
                        <input
                          placeholder="City Name"
                          value={newAddress.cityName}
                          onChange={(e) => setNewAddress({ ...newAddress, cityName: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/5 text-white focus:border-[#037166] focus:bg-white/10 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest px-1">State</label>
                        <input
                          placeholder="State Name"
                          value={newAddress.stateName}
                          onChange={(e) => setNewAddress({ ...newAddress, stateName: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/5 text-white focus:border-[#037166] focus:bg-white/10 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest px-1">Pincode</label>
                        <input
                          placeholder="6-digit code"
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/5 text-white focus:border-[#037166] focus:bg-white/10 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <div
                        onClick={() => setNewAddress({ ...newAddress, defaultAddress: !newAddress.defaultAddress })}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${newAddress.defaultAddress ? 'bg-[#037166]' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${newAddress.defaultAddress ? 'left-6' : 'left-1'}`} />
                      </div>
                      <span className="text-sm text-white/60 font-medium">Set as default service address</span>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 px-8 py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddOrUpdateAddress}
                        disabled={loading}
                        className="flex-[2] px-8 py-4 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold hover:shadow-xl hover:shadow-[#037166]/20 transition-all disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : editingAddress ? 'Update Address' : 'Save Address'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Continue Button */}
        {selectedAddress && !showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <button
              onClick={handleContinue}
              className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-medium text-lg hover:shadow-lg hover:shadow-[#037166]/40 transition-all"
            >
              Continue to Booking
            </button>
          </motion.div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          if (!isAuthenticated) {
            onBack();
          }
        }}
      />

      {/* Location Mismatch Alert Modal */}
      <AnimatePresence>
        {locationMismatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-amber-200 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
                <MapPin className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Location Mismatch</h3>

              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-4 space-y-2 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-gray-500 font-semibold">Your Service Address:</span>
                  <span className="font-bold text-gray-900 text-right">{locationMismatch.userCity}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-gray-500 font-semibold">Selected Service Center:</span>
                  <span className="font-bold text-amber-800 text-right">
                    {locationMismatch.providerName} ({locationMismatch.providerCity})
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Your service address is in <strong className="text-gray-900">{locationMismatch.userCity}</strong>, but the selected service center is located in <strong className="text-gray-900">{locationMismatch.providerCity}</strong>. This service center is unable to provide service at your location.
                <br /><br />
                Kindly select a service center at your location, or choose an address in <strong className="text-gray-900">{locationMismatch.providerCity}</strong>.
              </p>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setLocationMismatch(null);
                    router.push('/services/child/683dbc04b62d2a241de0f7e8?category=Services&name=Service%20Centers');
                  }}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#037166] to-[#04a99d] hover:brightness-105 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Select Service Center in {locationMismatch.userCity}
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMismatch(null)}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-center"
                >
                  Choose Another Address
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


