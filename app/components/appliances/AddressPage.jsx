'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Home, Briefcase, MapPin, Plus, Check, X, Trash2, Edit2, Loader2, Search, Crosshair, ShieldCheck, ChevronRight } from 'lucide-react';
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
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
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

  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
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
  });
  const [detectionSuccess, setDetectionSuccess] = useState(false);
  const [hasAutoDetected, setHasAutoDetected] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    lat: Number(contextLocation?.lat) || 17.450123,
    lng: Number(contextLocation?.lng) || 78.390456
  });
  const initialCenterRef = React.useRef(null);

  // Dynamic app links for Android & iOS
  const [appLinks, setAppLinks] = useState({
    android: 'https://play.google.com/store/apps/details?id=com.doorstephub.customer',
    ios: 'https://apps.apple.com/in/app/doorstep-hub-home-services/id6475340236'
  });

  useEffect(() => {
    const fetchAppLinks = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devapis.doorstephub.com/v1/dhubApi'}/app/get_global_settings`);
        const data = await res.json();
        if (data.success && data.policy) {
          setAppLinks({
            android: data.policy.customerAndroidAppLink || data.policy.playStore || 'https://play.google.com/store/apps/details?id=com.doorstephub.customer',
            ios: data.policy.customerIosAppLink || data.policy.appStore || 'https://apps.apple.com/in/app/doorstep-hub-home-services/id6475340236'
          });
        }
      } catch (e) {
        // keep defaults
      }
    };
    fetchAppLinks();
  }, []);

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
        } catch (e) {
          console.warn("Initial reverseGeocode failed", e);
        }
      }
    };
    initLocation();
  }, [contextLocation, hasAutoDetected, addresses.length, loading]);

  const fetchAddresses = useCallback(async (selectId = null) => {
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

        if (data.data?.length > 0) {
          setShowAddForm(false);
          // Auto-select based on priority
          if (selectId) {
            const target = data.data.find(a => a._id === selectId);
            if (target) onSelectAddress(target);
          } else if (!selectedAddress) {
            const def = data.data.find(a => a.defaultAddress) || data.data[0];
            onSelectAddress(def);
          }
        } else {
          setShowAddForm(true);
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
    if (authLoading) return;

    if (isAuthenticated) {
      fetchAddresses();
    } else if (!authLoading && !isAuthenticated) {
      // Only show modal if NOT loading and NOT authenticated
      setShowAuthModal(true);
    }
  }, [isAuthenticated, fetchAddresses, authLoading]);

  // Auto-fill user details from profile if authenticated
  useEffect(() => {
    if (isAuthenticated && user && showAddForm && !editingAddress) {
      setNewAddress(prev => {
        // Only update if current fields are empty to avoid overwriting user edits
        const updates = {};
        if (!prev.name) updates.name = user.name || '';
        if (!prev.phone) updates.phone = user.mobile || user.phone || '';

        if (Object.keys(updates).length > 0) {
          return { ...prev, ...updates };
        }
        return prev;
      });
    }
  }, [isAuthenticated, user, showAddForm, editingAddress]);

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
          vertical: inferVertical(),
          city: newAddress.cityName,
          area: newAddress.area,
          pincode: newAddress.postalCode,
          customerName: newAddress.name,
          mobile: newAddress.phone,
          _user: user,
        });
        setShowAddForm(false);
        const targetId = editingAddress?._id || data.data?._id || data._id;
        setEditingAddress(null);
        fetchAddresses(targetId);
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (error) {
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
    } catch (error) {
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
    setMapCenter({
      lat: Number(address.latitude) || 17.450123,
      lng: Number(address.longitude) || 78.390456
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
      vertical: inferVertical(),
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
      className="min-h-screen bg-[#f8fafc] pt-16 sm:pt-20 pb-12"
    >
      {authLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
        </div>
      )}

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#024e46] via-[#037166] to-[#049688] border-b border-white/10 shadow-sm">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-medium border border-white/20"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Back</span>
              </button>
              <h1 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#80dfd7] flex-shrink-0" />
                <span>Manage Address</span>
              </h1>
            </div>

            {!showAddForm && (
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setNewAddress({
                    name: user?.name || '',
                    phone: user?.mobile || user?.phone || '',
                    type: 'Home',
                    area: contextLocation?.area || '',
                    flat: contextLocation?.flat || '',
                    postalCode: contextLocation?.postalCode || '',
                    addressLineOne: contextLocation?.address || '',
                    addressLineTwo: '',
                    stateName: 'Telangana',
                    cityName: contextLocation?.city || 'Hyderabad',
                    defaultAddress: false,
                    latitude: contextLocation?.lat || "17.450123",
                    longitude: contextLocation?.lng || "78.390456",
                    stateId: "680cbb3d2d42e474f451ace3",
                    cityId: "684d704faa93650a05d5ff47"
                  });
                  setMapCenter({
                    lat: Number(contextLocation?.lat) || 17.450123,
                    lng: Number(contextLocation?.lng) || 78.390456
                  });
                  setShowAddForm(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white text-[#037166] hover:bg-emerald-50 text-xs sm:text-sm font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-5">
        {loading && addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 border-3 border-[#037166]/20 border-t-[#037166] rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium text-gray-600">Loading your addresses...</p>
          </div>
        ) : (addresses.length === 0 || showAddForm) ? (
          /* ── Add / Edit Address View (Map + Form) ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Map Column */}
            <div className="lg:col-span-6 relative w-full h-[340px] sm:h-[420px] rounded-2xl overflow-hidden bg-[#f0f2f5] border border-gray-200 shadow-sm">
              {isMapsLoaded ? (
                <>
                  {locationPermission === 'denied' && showPermissionBanner && (
                    <div className="absolute top-3 left-3 right-3 z-20 bg-black/75 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg flex items-center justify-between gap-3 text-white">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <p className="text-xs">GPS disabled. Drag pin on map to your exact location.</p>
                      </div>
                      <button onClick={() => setShowPermissionBanner(false)} className="p-1 hover:bg-white/10 rounded-full">
                        <X className="w-3.5 h-3.5 text-white/60" />
                      </button>
                    </div>
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
                      } catch (error) {
                        console.error("Geocoding failed", error);
                      } finally {
                        setIsDragging(false);
                      }
                    }}
                  >
                    {/* Search Bar Overlay */}
                    <div className="absolute top-3 left-3 right-3 z-10">
                      <div className="relative">
                        <div className="w-full bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-100 p-2.5 flex items-center gap-2">
                          <Search className="w-4 h-4 text-gray-400 ml-1" />
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
                            placeholder="Search your street or area..."
                            className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-xs sm:text-sm font-medium bg-transparent"
                          />
                          {searchQuery && (
                            <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="p-1 hover:bg-gray-100 rounded-full">
                              <X className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                          )}
                        </div>

                        {searchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 max-h-52 overflow-y-auto divide-y divide-gray-50 z-50">
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
                                      }
                                    }
                                  } catch (e) {
                                    toast.error("Failed to load location");
                                  }
                                }}
                                className="w-full p-2.5 text-left hover:bg-gray-50 flex items-start gap-2.5 transition-colors"
                              >
                                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-semibold text-gray-800 line-clamp-1">{result.main_text}</p>
                                  <p className="text-[11px] text-gray-400 line-clamp-1">{result.secondary_text}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Locate Me Button */}
                    <div className="absolute bottom-4 right-4 z-20">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAutoDetect(); }}
                        disabled={isLocating}
                        className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center bg-white text-[#037166] hover:bg-gray-50 transition-all active:scale-95"
                        title="Use Current Location"
                      >
                        {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-5 h-5" />}
                      </button>
                    </div>
                  </GoogleMap>

                  {/* Fixed Center Pin Target */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <div className="relative -mt-6" style={{ transform: isDragging ? 'scale(1.1) translateY(-6px)' : 'scale(1) translateY(0)' }}>
                      <MapPin className="w-8 h-8 text-[#ea4335] drop-shadow-lg relative z-10" fill="#ea4335" />
                      <div className="w-1.5 h-1.5 bg-black/60 mx-auto rounded-full mt-0.5" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-[#037166]" />
                  <span className="text-xs">Loading Google Maps...</span>
                </div>
              )}
            </div>

            {/* Form Column */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <div>
                  <h4 className="text-base font-bold text-[#0f172a]">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h4>
                  <p className="text-gray-500 text-[11px]">Recipient & location details for service</p>
                </div>
                {addresses.length > 0 && (
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* Type Selection */}
                <div className="flex gap-2">
                  {['Home', 'Office', 'Other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewAddress({ ...newAddress, type })}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${newAddress.type === type
                        ? 'bg-gradient-to-r from-[#037166] to-[#04a99d] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <input
                      placeholder="Full Name *"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-xs text-gray-900 focus:border-[#037166] focus:ring-1 focus:ring-[#037166] outline-none"
                    />
                  </div>
                  <div>
                    <input
                      placeholder="Phone Number *"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-xs text-gray-900 focus:border-[#037166] focus:ring-1 focus:ring-[#037166] outline-none"
                    />
                  </div>
                </div>

                <div className="relative">
                  <input
                    placeholder="Flat / Plot / House No. *"
                    value={newAddress.flat}
                    onChange={(e) => setNewAddress({ ...newAddress, flat: e.target.value })}
                    className="w-full px-3 py-2 pr-20 rounded-lg bg-white border border-gray-300 text-xs text-gray-900 focus:border-[#037166] focus:ring-1 focus:ring-[#037166] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAutoDetect}
                    disabled={locationLoading}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded bg-[#037166]/10 text-[#037166] text-[10px] font-bold hover:bg-[#037166]/20 transition-all uppercase"
                  >
                    {locationLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <MapPin className="w-2.5 h-2.5" />}
                    <span>{detectionSuccess ? 'Detected' : 'Detect'}</span>
                  </button>
                </div>

                <div>
                  <input
                    placeholder="Area / Locality *"
                    value={newAddress.area}
                    onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-xs text-gray-900 focus:border-[#037166] focus:ring-1 focus:ring-[#037166] outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    placeholder="City"
                    value={newAddress.cityName}
                    onChange={(e) => setNewAddress({ ...newAddress, cityName: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-white border border-gray-300 text-xs text-gray-900 focus:border-[#037166] focus:ring-1 focus:ring-[#037166] outline-none"
                  />
                  <input
                    placeholder="State"
                    value={newAddress.stateName}
                    onChange={(e) => setNewAddress({ ...newAddress, stateName: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-white border border-gray-300 text-xs text-gray-900 focus:border-[#037166] focus:ring-1 focus:ring-[#037166] outline-none"
                  />
                  <input
                    placeholder="Pincode *"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-white border border-gray-300 text-xs text-gray-900 focus:border-[#037166] focus:ring-1 focus:ring-[#037166] outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="defaultAddr"
                    checked={newAddress.defaultAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, defaultAddress: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-[#037166] focus:ring-[#037166]"
                  />
                  <label htmlFor="defaultAddr" className="text-xs text-gray-600 cursor-pointer">
                    Set as Default Address
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddOrUpdateAddress}
                    disabled={loading}
                    className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-[#037166] to-[#04a99d] text-white text-xs font-semibold hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Main 2-Column Responsive Dashboard Layout ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

            {/* Left Column: Address Selection & Booking CTA (7 cols on Desktop) */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#0f172a] flex items-center gap-2">
                    <span>Select Service Address</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {addresses.length} saved
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500">Technician will visit the selected address</p>
                </div>
              </div>

              {/* Address Cards Grid: 2 columns on tablet/desktop, 1 on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...addresses]
                  .sort((a, b) => {
                    if (selectedAddress?._id === a._id) return -1;
                    if (selectedAddress?._id === b._id) return 1;
                    if (a.defaultAddress && !selectedAddress) return -1;
                    if (b.defaultAddress && !selectedAddress) return 1;
                    return 0;
                  })
                  .map((address) => {
                    const Icon = getIcon(address.type);
                    const isSelected = selectedAddress?._id === address._id;

                    return (
                      <div
                        key={address._id}
                        onClick={() => onSelectAddress(address)}
                        className={`relative cursor-pointer rounded-xl p-3.5 transition-all duration-200 shadow-xs flex flex-col justify-between ${isSelected
                          ? 'bg-gradient-to-br from-[#f0fbf9] to-white border-2 border-[#037166] ring-2 ring-[#037166]/10 shadow-sm'
                          : 'bg-white border border-gray-200 hover:border-[#99c8c0] hover:shadow-xs'
                          }`}
                      >
                        {/* Top: Icon + Title + Selection & Action Buttons */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected
                                ? 'bg-[#037166] text-white shadow-xs'
                                : 'bg-[#eaf5f3] text-[#037166]'
                                }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs sm:text-sm font-bold text-[#0f172a] capitalize truncate">
                                    {address.type || 'Other'}
                                  </h4>
                                  {address.defaultAddress && (
                                    <span className="px-1.5 py-0.2 rounded bg-[#037166]/15 text-[#037166] text-[9px] font-bold uppercase tracking-wider">
                                      DEFAULT
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] flex items-center justify-center text-white mr-1 shadow-xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleEditClick(address); }}
                                className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all"
                                title="Edit"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address._id); }}
                                className="p-1 rounded-md bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Recipient details */}
                          <p className="text-xs font-semibold text-gray-800 truncate mb-1">
                            {address.name || address.userName || ''}
                            {address.phone ? <span className="font-normal text-gray-500"> • {address.phone}</span> : null}
                          </p>

                          {/* Street address line */}
                          {(() => {
                            const clean = (v) => (!v || String(v).trim().toUpperCase() === 'N/A' ? null : String(v).trim());
                            const street = [clean(address.flat), clean(address.area), clean(address.addressLineOne), clean(address.addressLineTwo)].filter(Boolean);
                            const seen = new Set();
                            const unique = street.filter(s => { const k = s.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
                            return unique.length > 0 ? (
                              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{unique.join(', ')}</p>
                            ) : null;
                          })()}
                        </div>

                        {/* Bottom: City & Pin */}
                        {(() => {
                          const clean = (v) => (!v || String(v).trim().toUpperCase() === 'N/A' ? null : String(v).trim());
                          const city = [clean(address.cityName), clean(address.stateName), clean(address.postalCode)].filter(Boolean);
                          return city.length > 0 ? (
                            <p className="text-[11px] text-gray-400 mt-2 pt-1.5 border-t border-gray-100 truncate">{city.join(', ')}</p>
                          ) : null;
                        })()}
                      </div>
                    );
                  })}
              </div>

              {/* Primary Action Button: Right Below Addresses */}
              {selectedAddress && (
                <div className="pt-2">
                  <button
                    onClick={handleContinue}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#037166] via-[#028377] to-[#04a99d] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg hover:shadow-[#037166]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <span>Continue to Booking</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}

              {/* Payment Methods / Pay Your Way (Compact Guarantee Strip) */}
              <div className="rounded-xl bg-white border border-gray-200 p-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-gray-900">Pay After Service • 100% Safe</h5>
                      <p className="text-[10px] text-gray-500">Sirf service ke baad pay karein</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { label: 'UPI', color: '#6366f1', abbr: 'UP' },
                      { label: 'PhonePe', color: '#7c3aed', abbr: 'PP' },
                      { label: 'GPay', color: '#059669', abbr: 'G' },
                      { label: 'Paytm', color: '#0284c7', abbr: 'Pt' },
                      { label: 'Cards', color: '#1e40af', abbr: '💳' },
                      { label: 'Cash', color: '#0f766e', abbr: '₹' },
                    ].map(({ label, color, abbr }) => (
                      <span key={label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-[10px] font-medium text-gray-700">
                        <span className="w-3 h-3 rounded text-white text-[7px] font-bold flex items-center justify-center" style={{ backgroundColor: color }}>{abbr}</span>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Comparison Table & App Promo (5 cols on Desktop) */}
            <div className="lg:col-span-5 space-y-3.5">
              {/* Comparison Card */}
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#eef9f7] via-[#f2fbf9] to-[#e6f7f4] border-b border-[#bde5df] px-3 sm:px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#037166] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                        SIDE BY SIDE
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        Traditional Repair <span className="text-gray-400 font-normal">vs</span> <span className="text-[#037166]">Doorstep Hub</span>
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-[#037166] text-[10px] font-extrabold border border-emerald-200/80 shadow-2xs flex-shrink-0 flex items-center gap-1">
                      <span>★</span> Smart Choice
                    </span>
                  </div>

                  {/* Column Headers Perfectly Aligned With Table Columns Below */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#037166]/15">
                    <div className="w-20 sm:w-24 flex-shrink-0 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      Experience
                    </div>
                    <div className="flex-1 text-gray-700 text-[11px] sm:text-xs font-bold flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0">✕</span>
                      <span>Traditional Repair</span>
                    </div>
                    <div className="flex-1 text-[#037166] text-[11px] sm:text-xs font-extrabold flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-[#037166] flex items-center justify-center text-[9px] font-bold flex-shrink-0">✓</span>
                      <span>Doorstep Hub</span>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-100 text-xs">
                  {[
                    {
                      feature: 'Finding Help',
                      trad: 'Call around technicians yourself',
                      dhub: 'Book online in 60s, verified pro assigned'
                    },
                    {
                      feature: 'Service Visit',
                      trad: 'Carry heavy appliance to shop',
                      dhub: 'Professional technician at your doorstep'
                    },
                    {
                      feature: 'Repair Cost',
                      trad: 'Unclear pricing & extra charges',
                      dhub: 'Upfront transparent rates & approval'
                    },
                    {
                      feature: 'Your Time',
                      trad: 'Long waiting & endless follow-ups',
                      dhub: 'On-time inspection on your schedule'
                    },
                    {
                      feature: 'Warranty',
                      trad: 'No guarantee or post-repair bills',
                      dhub: '30-day Doorstep Hub service warranty'
                    }
                  ].map((row, idx) => (
                    <div key={row.feature} className={`px-3 sm:px-4 py-2.5 flex items-start gap-2 ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}>
                      <div className="w-20 sm:w-24 flex-shrink-0 font-semibold text-gray-800 text-[11px]">{row.feature}</div>
                      <div className="flex-1 text-gray-500 text-[11px] leading-tight">
                        <span className="text-red-500 font-bold mr-1">✕</span>
                        {row.trad}
                      </div>
                      <div className="flex-1 font-medium text-gray-900 text-[11px] leading-tight">
                        <span className="text-emerald-600 font-bold mr-1">✓</span>
                        {row.dhub}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-3.5 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-1.5">
                  {['🏠 At Your Doorstep', '⚡ Instant Booking', '₹ Clear Pricing', '🛡️ Service Warranty'].map((tag) => (
                    <span key={tag} className="text-[10px] font-medium text-gray-600 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* App Download Card */}
              <div className="rounded-2xl bg-gradient-to-br from-[#f0fbf9] via-white to-[#e6f7f4] border border-[#a9ded7] p-3.5 sm:p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#037166]/10 text-[#037166] text-[9px] font-bold uppercase tracking-wider mb-1">
                      Download Our App
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 leading-snug">Everything in Your Pocket</h3>
                    <p className="text-[11px] text-gray-600 mt-0.5">Access all services, track orders & manage daily needs.</p>
                  </div>
                  <div className="w-11 h-11 sm:w-11 sm:h-12 rounded-2xl bg-[] shadow-sm flex items-center justify-center p-2 flex-shrink-0 overflow-hidden">
                    <img
                      src="/d-hub-logo.png"
                      alt="Doorstep Hub"
                      className="w-full h-full object-contain brightness-0 invert"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 my-2.5">
                  {['⚡ Fast booking', '🔒 Secure & private', '🎁 Exclusive app deals'].map((feat) => (
                    <span key={feat} className="text-[10px] font-medium text-gray-700 bg-white/80 border border-[#b2ddd8] rounded-full px-2 py-0.5">
                      {feat}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#b2ddd8]/50 gap-2">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={appLinks.android}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] text-white text-[11px] font-semibold hover:bg-black transition-colors shadow-xs"
                      title="Download on Google Play"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.42.24.9.24 1.32 0l11.46-6.6-2.64-2.64L3.18 23.76zm16.8-9.72-3.12-1.8-2.88 2.88 2.88 2.88 3.12-1.8c.9-.54.9-1.62 0-2.16zM3.18.24.06 2.04C-.42 2.34-.42 3.18.06 3.48l10.14 5.88L12.84 6.6 4.5.24A1.2 1.2 0 0 0 3.18.24zm1.02 3.18L11.46 12 4.2 19.58 4.2 3.42z"/></svg>
                      <span>Google Play</span>
                    </a>
                    <a
                      href={appLinks.ios}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] text-white text-[11px] font-semibold hover:bg-black transition-colors shadow-xs"
                      title="Download on App Store"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                      <span>App Store</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                    <span><strong className="text-gray-900 font-bold">4.8★</strong> (10k+)</span>
                    <span>•</span>
                    <span><strong className="text-gray-900 font-bold">50K+</strong></span>
                  </div>
                </div>
              </div>
            </div>

          </div>
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


