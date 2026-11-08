'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isObjectId } from '@/utils/slugHelper';
import { ArrowLeft, Home, Briefcase, MapPin, Plus, Check, Trash2, Edit2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { trackLeadEvent } from '@/lib/leadTracking';
import { useAuth } from '@/context/AuthContext';
import { useServiceCart } from '@/context/ServiceCartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthModal } from '@/components/auth/AuthModal';
import { locationManager } from '@/services/locationManager';
import { LocationMismatchModal } from '@/components/shared/LocationMismatchModal';
import { useMounted } from '@/hooks/useMounted';

function PGAddressContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, token, isAuthenticated } = useAuth();
    const { } = useServiceCart();

    const providerId = searchParams.get('providerId');
    const providerSlug = searchParams.get('providerSlug');
    const providerParam = providerSlug || providerId;
    const [providerResolvedId, setProviderResolvedId] = useState(providerParam);
    
    

    // BUG-11 FIX: Read user's city/state from stored location data
    const getDefaultCityState = () => {
        try {
            const stored = localStorage.getItem('user_location_data');
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    cityName: parsed.cityName || parsed.city || 'Hyderabad',
                    stateName: parsed.stateName || parsed.state || 'Telangana',
                };
            }
        } catch { /* ignore */ }
        return { cityName: 'Hyderabad', stateName: 'Telangana' };
    };

    const mounted = useMounted();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [locationMismatch, setLocationMismatch] = useState(null);
    const [newAddress, setNewAddress] = useState({
        name: '', phone: '', type: 'Home', area: '', flat: '',
        postalCode: '', addressLineOne: '', addressLineTwo: '',
        stateName: 'Telangana', cityName: 'Hyderabad', defaultAddress: false,
        latitude: 17.4126, longitude: 78.2676
    });

    const [citySuggestions, setCitySuggestions] = useState([]);
    const [isSearchingCity, setIsSearchingCity] = useState(false);

    // Debounced Search for City/Area Suggestions
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (newAddress.cityName.trim().length >= 3) {
                setIsSearchingCity(true);
                try {
                    const results = await locationManager.searchLocation(newAddress.cityName);
                    setCitySuggestions(results);
                } catch {
                    console.error('City search failed:');
                } finally {
                    setIsSearchingCity(false);
                }
            } else {
                setCitySuggestions([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [newAddress.cityName]);

    const handleSelectCitySuggestion = async (place) => {
        setIsSearchingCity(true);
        try {
            const details = await locationManager.setManualLocation(place.place_id);
            setMapCoords({ lat: details.lat, lng: details.lng });
            setMapKey(k => k + 1);
            setNewAddress(prev => ({
                ...prev,
                cityName: details.city || details.shortAddress.split(',')[0] || '',
                stateName: details.state || prev.stateName,
                area: details.area || prev.area,
                postalCode: details.postalCode || prev.postalCode,
                latitude: details.lat,
                longitude: details.lng
            }));
            setCitySuggestions([]);
        } catch {
            console.error('Failed to set city from suggestion:');
        } finally {
            setIsSearchingCity(false);
        }
    };

    // GPS / Map state
    const [gpsLoading, setGpsLoading] = useState(false);
    const [mapCoords, setMapCoords] = useState({ lat: 17.4126, lng: 78.2676 }); // Default: Hyderabad
    const [mapKey, setMapKey] = useState(0); // force iframe refresh

    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lng - 0.005}%2C${mapCoords.lat - 0.003}%2C${mapCoords.lng + 0.005}%2C${mapCoords.lat + 0.003}&layer=mapnik&marker=${mapCoords.lat}%2C${mapCoords.lng}`;

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }
        setGpsLoading(true);
        toast.info('Detecting your location…');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setMapCoords({ lat: latitude, lng: longitude });
                setMapKey(k => k + 1);

                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const data = await res.json();
                    if (data && data.address) {
                        const addr = data.address;
                        setNewAddress(prev => ({
                            ...prev,
                            area: addr.suburb || addr.neighbourhood || addr.residential || addr.road || '',
                            cityName: addr.city || addr.town || addr.village || 'Hyderabad',
                            stateName: addr.state || 'Telangana',
                            postalCode: addr.postcode || '',
                            addressLineOne: data.display_name,
                            latitude: latitude,
                            longitude: longitude
                        }));
                        toast.success('Location detected!');
                    }
                } catch (e) {
                    console.error('Reverse Geocode Error:', e);
                } finally {
                    setGpsLoading(false);
                }
            },
            () => {
                setGpsLoading(false);
                toast.error('Failed to get location. Please enter manually.');
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const fetchAddresses = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/useraddress/getuseraddress`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                setAddresses(data.data || []);
                if (!selectedAddress && data.data?.length > 0) {
                    const def = data.data.find(a => a.defaultAddress) || data.data[0];
                    setSelectedAddress(def);
                }
            }
        } catch {
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    }, [token, selectedAddress]);

    useEffect(() => {
        let isCancelled = false;
        if (isAuthenticated && token) {
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/useraddress/getuseraddress`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            })
                .then(res => res.json())
                .then(data => {
                    if (isCancelled) return;
                    if (data.success) {
                        setAddresses(data.data || []);
                        setSelectedAddress(prev => {
                            if (!prev && data.data?.length > 0) {
                                return data.data.find(a => a.defaultAddress) || data.data[0];
                            }
                            return prev;
                        });
                    }
                })
                .catch(() => {
                    if (!isCancelled) toast.error('Failed to load addresses');
                });
        } else if (!isAuthenticated) {
            const timer = setTimeout(() => {
                setShowAuthModal(true);
            }, 500);
            return () => clearTimeout(timer);
        }
        return () => { isCancelled = true; };
    }, [isAuthenticated, token]);

    const handleAddOrUpdateAddress = async () => {
        if (!newAddress.name || !newAddress.phone || !newAddress.area || !newAddress.flat || !newAddress.postalCode) {
            toast.error('Please fill in required fields');
            return;
        }
        setLoading(true);
        try {
            const url = editingAddress
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/useraddress/edituseraddress/${editingAddress._id}`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/useraddress/addaddress`;
            const method = editingAddress ? 'PUT' : 'POST';
            const payload = {
                ...newAddress,
                latitude: newAddress.latitude.toString(),
                longitude: newAddress.longitude.toString(),
                defaultAddress: addresses.length === 0 ? true : newAddress.defaultAddress
            };
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) {
                toast.success(editingAddress ? 'Address updated' : 'Address added');
                setShowAddForm(false);
                setEditingAddress(null);
                setNewAddress({
                    name: '', phone: '', type: 'Home', area: '', flat: '',
                    postalCode: '', addressLineOne: '', addressLineTwo: '',
                    stateName: 'Telangana', cityName: 'Hyderabad', defaultAddress: false,
                    latitude: 17.4126, longitude: 78.2676
                });
                fetchAddresses();
            } else {
                toast.error(data.message || 'Action failed');
            }
        } catch {
            toast.error('Error processing address');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!confirm('Delete this address?')) return;
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/useraddress/deleteuseraddress/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                toast.success('Address deleted');
                fetchAddresses();
                if (selectedAddress?._id === id) setSelectedAddress(null);
            }
        } catch { toast.error('Failed to delete'); }
        finally { setLoading(false); }
    };

    // Resolve slug to ObjectId once (backend requires providerId)
    useEffect(() => {
        const resolveProvider = async () => {
            if (!providerParam || isObjectId(providerParam)) {
                setProviderResolvedId(providerParam);
                return;
            }
            try {
                const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/single-professional-provider`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ providerSlug: providerParam })
                });
                const data = await resp.json();
                const store = data?.storeData?.[0];
                const id = store?._id || store?.providerId;
                setProviderResolvedId(id || providerParam);
            } catch {
                console.warn('Could not resolve provider slug to id for PG booking address; using slug');
                setProviderResolvedId(providerParam);
            }
        };
        resolveProvider();
    }, [providerParam]);

    const handleContinue = async () => {
        if (!selectedAddress) { toast.error('Please select an address'); return; }
        setLoading(true);
        try {
            // Preflight location verification if provider is resolved
            if (providerResolvedId && selectedAddress?._id && token) {
                try {
                    const valRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/service-cart/validate-booking-location`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            providerId: providerResolvedId,
                            serviceAddressId: selectedAddress._id
                        })
                    });
                    const valData = await valRes.json();
                    if (valData.success && valData.matched === false) {
                        setLocationMismatch({
                            userCity: valData.userCity,
                            providerCity: valData.providerCity,
                            providerName: valData.providerName || 'Selected PG / Hostel'
                        });
                        setLoading(false);
                        return;
                    }
                } catch (valErr) {
                    console.warn('Location validation check error:', valErr);
                }
            }

            sessionStorage.setItem('selected_address', JSON.stringify(selectedAddress));
            trackLeadEvent({
                eventType: 'LOCATION_ADDED',
                vertical: 'pghostels',
                city: selectedAddress.cityName,
                area: selectedAddress.area,
                pincode: selectedAddress.postalCode,
            });
            // Pass providerId so confirm page can recover cart context if needed
            const confirmUrl = providerResolvedId
                ? `/pghostels/booking/confirm?providerId=${providerResolvedId}`
                : '/pghostels/booking/confirm';
            router.push(confirmUrl);
        } catch {
            toast.error('Failed to proceed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (addr) => {
        setEditingAddress(addr);
        setNewAddress({
            name: addr.name, phone: addr.phone, type: addr.type, area: addr.area, flat: addr.flat,
            postalCode: addr.postalCode, addressLineOne: addr.addressLineOne, addressLineTwo: addr.addressLineTwo,
            stateName: addr.stateName || 'Telangana', cityName: addr.cityName || 'Hyderabad', defaultAddress: addr.defaultAddress
        });
        setShowAddForm(true);
    };

    const getIcon = (type) => {
        const lower = type?.toLowerCase() || '';
        if (lower.includes('home')) return Home;
        if (lower.includes('work') || lower.includes('office')) return Briefcase;
        return MapPin;
    };

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#037166]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden pb-32 pt-20">
            {/* Header — inline, scrolls with page */}
            <section className="bg-gradient-to-r from-[#037166] via-teal-600 to-[#04a99d] border-b border-white/10 shadow-lg overflow-x-hidden">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => providerParam
                            ? router.push(`/${providerParam}`)
                            : router.back()
                        }
                        className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </motion.button>

                    <div className="flex flex-col md:flex-row md:items-center justify-start gap-12">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3 shrink-0"
                        >
                            <MapPin className="w-8 h-8" />
                            Select Booking Address
                        </motion.h1>

                        <div className="flex-1 max-w-2xl">
                            <div className="flex items-center gap-2">
                                {['Select PG', 'Address', 'Confirm & Pay'].map((step, index) => {
                                    const isCompleted = index < 1;
                                    const isCurrent = index === 1;
                                    return (
                                        <React.Fragment key={step}>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-white shadow-md' : isCurrent ? 'bg-white ring-4 ring-white/30 scale-110 shadow-lg' : 'bg-white/30'}`}>
                                                    {isCompleted ? (
                                                        <Check className="w-5 h-5 text-[#037166]" />
                                                    ) : (
                                                        <span className={`text-sm font-bold ${isCurrent ? 'text-[#037166]' : 'text-white/60'}`}>{index + 1}</span>
                                                    )}
                                                </div>
                                                <span className={`text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all hidden sm:inline ${isCurrent ? 'text-white font-bold' : 'text-white/70'}`}>{step}</span>
                                            </div>
                                            {index < 2 && (
                                                <div className={`h-0.5 flex-1 mx-2 transition-all ${isCompleted ? 'bg-white/80' : 'bg-white/20'}`} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-[1000px] mx-auto px-6 lg:px-8 py-8">
                {loading && addresses.length === 0 ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-[#037166]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.length === 0 && !loading && (
                            <div className="text-center py-10 border-2 border-dashed border-[#123F4A] rounded-xl">
                                <p className="text-gray-500">No addresses found. Add one below.</p>
                            </div>
                        )}
                        {addresses.map((address, index) => {
                            const Icon = getIcon(address.type);
                            const isSelected = selectedAddress?._id === address._id;

                            return (
                                <motion.div
                                    key={address._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setSelectedAddress(address)}
                                    className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 ${isSelected
                                        ? 'bg-white border-2 border-[#037166] shadow-lg shadow-[#037166]/10'
                                        : 'bg-white border border-gray-200 hover:border-[#037166]/30 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex gap-6">
                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-[#037166]/10' : 'bg-gray-100'}`}>
                                            <Icon className={`w-8 h-8 ${isSelected ? 'text-[#037166]' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-bold text-gray-900 capitalize">{address.type || 'Address'}</h3>
                                                {address.defaultAddress && (
                                                    <span className="px-2 py-0.5 rounded-full bg-[#037166]/10 text-[#037166] text-xs font-bold">DEFAULT</span>
                                                )}
                                            </div>
                                            <p className="font-medium text-gray-800 mb-1">{address.name}</p>
                                            <p className="text-gray-600 text-sm">{address.flat}, {address.area}, {address.cityName}</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {isSelected && (
                                                <div className="w-8 h-8 rounded-full bg-[#037166] flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); openEditModal(address); }} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                                                <Edit2 className="w-4 h-4 text-gray-500" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address._id); }} className="p-2 rounded-lg bg-gray-50 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {!showAddForm && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                            setEditingAddress(null);
                            const { cityName, stateName } = getDefaultCityState();
                            setNewAddress({
                                name: user?.name || '', phone: user?.mobile || user?.phone || '', type: 'Home', area: '', flat: '',
                                postalCode: '', addressLineOne: '', addressLineTwo: '',
                                stateName, cityName, defaultAddress: false
                            });
                            setShowAddForm(true);
                            // Auto-trigger detection
                            setTimeout(() => handleDetectLocation(), 100);
                        }}
                        className="w-full mt-6 py-4 border-2 border-dashed border-[#123F4A] rounded-2xl flex items-center justify-center text-gray-500 hover:border-[#037166] hover:text-[#037166] transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add New Address
                    </motion.button>
                )}

                {/* Inline Add/Edit Form */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 overflow-hidden"
                        >
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">{editingAddress ? 'Edit Address' : 'Add New Details'}</h3>
                                    <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}><X className="h-5 w-5" /></Button>
                                </div>
                                <div className="space-y-4">
                                    <div className="relative w-full h-48 bg-gray-100 mb-6 rounded-xl overflow-hidden border border-gray-200">
                                        <iframe
                                            key={mapKey}
                                            src={mapSrc}
                                            className="w-full h-full border-0"
                                            title="Location Map"
                                            loading="lazy"
                                        />
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-full px-4">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={handleDetectLocation}
                                                disabled={gpsLoading}
                                                className="w-full shadow-lg border border-gray-200 flex items-center justify-center gap-2"
                                            >
                                                {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                                                {gpsLoading ? 'Detecting...' : 'Use My Current Location'}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        {['Home', 'Office', 'Friends & Relative'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setNewAddress({ ...newAddress, type })}
                                                className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${newAddress.type === type ? 'bg-[#037166] text-white border-[#037166] shadow-md' : 'text-[#037166] border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Input className="text-black" placeholder="Full Name" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} />
                                        <Input className="text-black" placeholder="Mobile Number" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                                    </div>
                                    <div className="relative">
                                        <Input className="text-black pr-24" placeholder="Flat / House No" value={newAddress.flat} onChange={e => setNewAddress({ ...newAddress, flat: e.target.value })} />
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleDetectLocation(); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#037166]/10 text-[#037166] text-[10px] font-bold rounded-md border border-[#037166]/20 hover:bg-[#037166]/20 transition-all uppercase"
                                        >
                                            {gpsLoading ? '...' : 'Detect'}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <Input className="text-black pr-12" placeholder="Area / Colony" value={newAddress.area} onChange={e => setNewAddress({ ...newAddress, area: e.target.value })} />
                                        {newAddress.area && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Auto</span>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="relative">
                                            <Input
                                                className="text-black"
                                                placeholder="City"
                                                value={newAddress.cityName}
                                                onChange={e => setNewAddress({ ...newAddress, cityName: e.target.value })}
                                            />
                                            {isSearchingCity && (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#037166]" />
                                            )}

                                            {/* Suggestions Dropdown */}
                                            {citySuggestions.length > 0 && (
                                                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                    {citySuggestions.map((p, i) => (
                                                        <button
                                                            key={i}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b last:border-0"
                                                            onClick={() => handleSelectCitySuggestion(p)}
                                                        >
                                                            <div className="font-semibold text-gray-800">{p.main_text}</div>
                                                            <div className="text-[10px] text-gray-500">{p.secondary_text}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <Input className="text-black" placeholder="State" value={newAddress.stateName} onChange={e => setNewAddress({ ...newAddress, stateName: e.target.value })} />
                                        <Input className="text-black" placeholder="Pincode" value={newAddress.postalCode} onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })} />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button variant="outline" className="flex-1 text-black" onClick={() => setShowAddForm(false)}>Cancel</Button>
                                        <Button className="flex-1 bg-[#037166] hover:bg-[#025a51] text-white" onClick={handleAddOrUpdateAddress}>
                                            {loading ? 'Saving...' : 'Save Address'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Proceed to Booking — inline */}
                <div className="mt-8">
                    <Button
                        onClick={handleContinue}
                        disabled={!selectedAddress || showAddForm || loading}
                        className="w-full h-14 text-lg bg-gradient-to-r from-[#037166] to-[#04a99d] hover:opacity-90 text-white rounded-xl shadow-lg"
                    >
                        {loading ? 'Processing...' : 'Proceed to Booking'}
                    </Button>
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => {
                    setShowAuthModal(false);
                    if (!isAuthenticated) router.back();
                }}
            />

            <LocationMismatchModal
                mismatch={locationMismatch}
                onClose={() => setLocationMismatch(null)}
                browseUrl="/pghostels"
                providerLabel="PG / Hostel"
            />
        </div>
    );
}

export default function PGAddressPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <PGAddressContent />
        </Suspense>
    );
}
