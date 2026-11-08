'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isObjectId } from '@/utils/slugHelper';
import { ArrowLeft, Home, CheckCircle, Briefcase, MapPin, Plus, Check, Trash2, Edit2, Loader2, X, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { trackLeadEvent } from '@/lib/leadTracking';
import { useAuth } from '@/context/AuthContext';
import { useServiceCart } from '@/context/ServiceCartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthModal } from '@/components/auth/AuthModal';
import { locationManager } from '@/services/locationManager';
import { LocationMismatchModal, areCitiesMatching } from '@/components/shared/LocationMismatchModal';
import { useMounted } from '@/hooks/useMounted';

function SpaAddressContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, token, isAuthenticated } = useAuth();
    const { addToCart, clearCart } = useServiceCart();

    const providerIdParam = searchParams.get('providerId');
    const [providerId, setProviderId] = useState(providerIdParam);
    const packageId = searchParams.get('packageId');
    const addons = searchParams.get('addons');

    const mounted = useMounted();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [locationMismatch, setLocationMismatch] = useState(null);

    // GPS / Map state
    const [gpsLoading, setGpsLoading] = useState(false);
    const [mapCoords, setMapCoords] = useState({ lat: 17.4126, lng: 78.2676 }); // Default: Hyderabad
    const [mapKey, setMapKey] = useState(0); // force iframe refresh

    const [newAddress, setNewAddress] = useState({
        name: '', phone: '', type: 'Home', area: '', flat: '',
        plotNumber: '', postalCode: '', addressLineOne: '', addressLineTwo: '',
        stateName: 'Telangana', cityName: 'Hyderabad', defaultAddress: false
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
                } catch (error) {
                    console.error('City search failed:', error);
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
            }));
            setCitySuggestions([]);
        } catch (error) {
            console.error('Failed to set city from suggestion:', error);
        } finally {
            setIsSearchingCity(false);
        }
    };

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
                if (!selectedAddress && data.data?.length > 0) {
                    const def = data.data.find(a => a.defaultAddress) || data.data[0];
                    setSelectedAddress(def);
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
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

    // ── Auto-detect location ──────────────────────────────────────────
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
                setMapKey(k => k + 1); // refresh map iframe

                try {
                    // Reverse geocode via Nominatim (free, no API key)
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const geo = await res.json();
                    const addr = geo.address || {};

                    const localArea =
                        addr.suburb || addr.neighbourhood || addr.quarter ||
                        addr.village || addr.town || addr.county || '';
                    const city =
                        addr.city || addr.town || addr.village || addr.county || 'Hyderabad';
                    const state =
                        addr.state || 'Telangana';
                    const pincode = addr.postcode || '';
                    const road = addr.road || addr.pedestrian || addr.footway || '';

                    setNewAddress(prev => ({
                        ...prev,
                        area: localArea || prev.area,
                        cityName: city,
                        stateName: state,
                        postalCode: pincode,
                        addressLineOne: road || prev.addressLineOne,
                    }));

                    toast.success('Location detected! Please verify and fill in your flat/house number.');
                } catch (err) {
                    console.error(err);
                    toast.error('Could not fetch address details. Please fill manually.');
                } finally {
                    setGpsLoading(false);
                }
            },
            (err) => {
                setGpsLoading(false);
                if (err.code === err.PERMISSION_DENIED) {
                    toast.error('Location permission denied. Please allow access in your browser.');
                } else {
                    toast.error('Failed to detect location. Please fill manually.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // ── Save / Update Address ─────────────────────────────────────────
    const handleAddOrUpdateAddress = async () => {
        if (!newAddress.name || !newAddress.phone || !newAddress.area || !newAddress.flat || !newAddress.postalCode) {
            toast.error('Please fill in required fields (Name, Phone, Flat, Area, Pincode)');
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
                latitude: String(mapCoords.lat),
                longitude: String(mapCoords.lng),
                defaultAddress: addresses.length === 0 ? true : newAddress.defaultAddress
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.success) {
                toast.success(editingAddress ? 'Address updated' : 'Address added');
                setShowAddForm(false);
                setEditingAddress(null);
                setNewAddress({
                    name: '', phone: '', type: 'Home', area: '', flat: '',
                    plotNumber: '', postalCode: '', addressLineOne: '', addressLineTwo: '',
                    stateName: 'Telangana', cityName: 'Hyderabad', defaultAddress: false
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

    const handleContinue = async () => {
        if (!selectedAddress) {
            toast.error('Please select an address');
            return;
        }

        setLoading(true);
        try {
            let providerIdFinal = providerId;

            // Ensure we send ObjectId to cart API
            if (providerIdFinal && !isObjectId(providerIdFinal)) {
                try {
                    const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/single-professional-provider`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ providerSlug: providerIdFinal })
                    });
                    const data = await resp.json();
                    const store = data?.storeData?.[0];
                    const resolvedId = store?._id || store?.providerId;
                    if (resolvedId) {
                        providerIdFinal = resolvedId;
                        setProviderId(resolvedId);
                    }
                    const storeCity = store?.cityName || store?.city || null;
                    const userCity = selectedAddress.cityName;
                    if (storeCity && userCity && !areCitiesMatching(userCity, storeCity)) {
                        setLocationMismatch({
                            userCity: String(userCity),
                            providerCity: String(storeCity),
                            providerName: store?.businessName || store?.name || 'Selected Spa & Salon Professional'
                        });
                        setLoading(false);
                        return;
                    }
                } catch {
                    console.warn('Could not resolve provider slug during checkout, proceeding with slug');
                }
            }

            // Preflight backend location verification
            if (providerIdFinal && selectedAddress?._id && token) {
                try {
                    const valRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/service-cart/validate-booking-location`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            providerId: providerIdFinal,
                            serviceAddressId: selectedAddress._id
                        })
                    });
                    const valData = await valRes.json();
                    if (valData.success && valData.matched === false) {
                        setLocationMismatch({
                            userCity: valData.userCity,
                            providerCity: valData.providerCity,
                            providerName: valData.providerName || 'Selected Spa & Salon Professional'
                        });
                        setLoading(false);
                        return;
                    }
                } catch (valErr) {
                    console.warn('Location validation check error:', valErr);
                }
            }

            const packageIdList = packageId ? packageId.split(',') : [];
            const firstPackageId = packageIdList[0];

            if (providerIdFinal?.startsWith('mock_') || (firstPackageId && firstPackageId.startsWith('mock_'))) {
                sessionStorage.setItem('spa_booking_data', JSON.stringify({
                    providerId: providerIdFinal, packageId: packageIdList, addons: addons ? addons.split(',') : [], address: selectedAddress
                }));
                sessionStorage.setItem('selected_address', JSON.stringify(selectedAddress));
                trackLeadEvent({
                    eventType: 'LOCATION_ADDED',
                    vertical: 'spa-salon',
                    city: selectedAddress.cityName,
                    area: selectedAddress.area,
                    pincode: selectedAddress.postalCode,
                });
                router.push('/spa-salon/booking/confirm');
                return;
            }

            await clearCart(true);

            for (const pId of packageIdList) {
                const packageSuccess = await addToCart(providerIdFinal, pId, 'professional_service', 1, null, 'professional', true);
                if (!packageSuccess) {
                    toast.error(`Failed to add service ${pId} to booking`);
                    setLoading(false);
                    return;
                }
            }

            if (addons) {
                const addonList = addons.split(',');
                for (const addonId of addonList) {
                    await addToCart(providerIdFinal, addonId, 'professional_addon', 1, firstPackageId, 'professional', true);
                }
            }

            sessionStorage.setItem('spa_booking_data', JSON.stringify({
                providerId: providerIdFinal, packageId: packageIdList,
                addons: addons ? addons.split(',') : [],
                address: selectedAddress
            }));
            sessionStorage.setItem('selected_address', JSON.stringify(selectedAddress));
            trackLeadEvent({
                eventType: 'LOCATION_ADDED',
                vertical: 'spa-salon',
                city: selectedAddress.cityName,
                area: selectedAddress.area,
                pincode: selectedAddress.postalCode,
                customerName: selectedAddress.name,
                mobile: selectedAddress.phone,
            });
            router.push('/spa-salon/booking/confirm');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to proceed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (addr) => {
        setEditingAddress(addr);
        setNewAddress({
            name: addr.name, phone: addr.phone, type: addr.type, area: addr.area, flat: addr.flat,
            plotNumber: addr.plotNumber || '',
            postalCode: addr.postalCode, addressLineOne: addr.addressLineOne, addressLineTwo: addr.addressLineTwo,
            stateName: addr.stateName || 'Telangana', cityName: addr.cityName || 'Hyderabad', defaultAddress: addr.defaultAddress
        });
        // Set map to stored coords if available
        if (addr.latitude && addr.longitude) {
            setMapCoords({ lat: parseFloat(addr.latitude), lng: parseFloat(addr.longitude) });
            setMapKey(k => k + 1);
        }
        setShowAddForm(true);
    };

    // If providerId is a slug, resolve it to an _id once
    useEffect(() => {
        const resolveProvider = async () => {
            if (!providerIdParam || isObjectId(providerIdParam)) return;
            try {
                const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/single-professional-provider`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ providerSlug: providerIdParam })
                });
                const data = await resp.json();
                const store = data?.storeData?.[0];
                const id = store?._id || store?.providerId;
                if (id) setProviderId(id);
            } catch (e) {
                console.warn('Could not resolve provider slug to id, using slug', e);
            }
        };
        resolveProvider();
    }, [providerIdParam]);

    const getIcon = (type) => {
        const lower = type?.toLowerCase() || '';
        if (lower.includes('home')) return Home;
        if (lower.includes('work') || lower.includes('office')) return Briefcase;
        return MapPin;
    };

    // Map iframe URL
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lng - 0.01},${mapCoords.lat - 0.01},${mapCoords.lng + 0.01},${mapCoords.lat + 0.01}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lng}`;

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#C06C84]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-32 bg-gray-50">
            {/* Header */}
            <section className="sticky top-20 z-40 bg-gradient-to-r from-[#C06C84] via-pink-600 to-[#6C5CE7] border-b border-white/10 shadow-lg">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to options
                    </motion.button>

                    <div className="flex flex-col md:flex-row md:items-center justify-start gap-12">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3 shrink-0"
                        >
                            <MapPin className="w-8 h-8" />
                            Where should we come?
                        </motion.h1>

                        <div className="flex-1 max-w-5xl">
                            <div className="flex items-center gap-8">
                                {['Selection', 'Address', 'Confirm & Pay'].map((step, index) => {
                                    const isCompleted = index < 1;
                                    const isCurrent = index === 1;
                                    return (
                                        <React.Fragment key={step}>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-white shadow-md' : isCurrent ? 'bg-white ring-4 ring-white/30 scale-110 shadow-lg' : 'bg-white/30'}`}>
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-5 h-5 text-[#6D1357]" />
                                                    ) : (
                                                        <span className={`text-sm font-bold ${isCurrent ? 'text-[#6D1357]' : 'text-white/60'}`}>{index + 1}</span>
                                                    )}
                                                </div>
                                                <span className={`text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all hidden sm:inline ${isCurrent ? 'text-white font-bold' : 'text-white/70'}`}>{step}</span>
                                            </div>
                                            {index < 2 && (
                                                <div className={`h-0.5 flex-1 mx-12 transition-all ${isCompleted ? 'bg-white/80' : 'bg-white/20'}`} />
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
                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#6D1357]" /></div>
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
                                        ? 'bg-white border-2 border-[#6D1357] shadow-lg shadow-[#6D1357]/10'
                                        : 'bg-white border border-gray-200 hover:border-[#6D1357]/30 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex gap-6">
                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-[#6D1357]/10' : 'bg-gray-100'}`}>
                                            <Icon className={`w-8 h-8 ${isSelected ? 'text-[#6D1357]' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-black capitalize mb-1">{address.type || 'Address'}</h3>
                                            <p className="font-medium text-black mb-1">{address.name}</p>
                                            <p className="text-black/70 text-sm">{address.flat}, {address.area}, {address.cityName}</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {isSelected && <div className="w-8 h-8 rounded-full bg-[#6D1357] flex items-center justify-center"><Check className="w-5 h-5 text-white" /></div>}
                                            <button onClick={(e) => { e.stopPropagation(); openEditModal(address); }} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address._id); }} className="p-2 rounded-lg bg-gray-50 hover:bg-red-50"><Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" /></button>
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
                            setNewAddress({
                                name: user?.name || '', phone: user?.mobile || user?.phone || '', type: 'Home', area: '', flat: '',
                                postalCode: '', addressLineOne: '', addressLineTwo: '',
                                stateName: 'Telangana', cityName: 'Hyderabad', defaultAddress: false
                            });
                            setShowAddForm(true);
                            // Auto-trigger detection
                            setTimeout(() => handleDetectLocation(), 100);
                        }}
                        className="w-full mt-6 py-4 border-2 border-dashed border-[#123F4A] rounded-2xl flex items-center justify-center text-black hover:border-[#6D1357] hover:text-[#6D1357] transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add New Address
                    </motion.button>
                )}

                {/* ── Add / Edit Form ── */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 overflow-hidden"
                        >
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                                {/* ── Map ── */}
                                <div className="relative w-full h-56 bg-gray-100">
                                    <iframe
                                        key={mapKey}
                                        src={mapSrc}
                                        className="w-full h-full border-0"
                                        title="Location Map"
                                        loading="lazy"
                                        allowFullScreen
                                    />
                                    {/* GPS Detect button overlaying the map */}
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
                                        <button
                                            onClick={handleDetectLocation}
                                            disabled={gpsLoading}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-[#6D1357] text-white rounded-full shadow-lg text-sm font-semibold hover:bg-[#5A0E47] transition-all disabled:opacity-70"
                                        >
                                            {gpsLoading
                                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Detecting…</>
                                                : <><Navigation className="w-4 h-4" /> Use My Current Location</>
                                            }
                                        </button>
                                    </div>
                                </div>

                                {/* ── Form Fields ── */}
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-xl font-bold text-black">{editingAddress ? 'Edit Address' : 'Add New Details'}</h3>
                                        <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}><X className="h-5 w-5" /></Button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Address Type */}
                                        <div className="flex gap-3">
                                            {['Home', 'Office', 'Friends & Relative'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setNewAddress({ ...newAddress, type })}
                                                    className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${newAddress.type === type ? 'bg-[#6D1357] text-white border-[#6D1357] shadow-md' : 'text-black border-gray-200 hover:bg-gray-50'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Name & Phone */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input className="text-black" placeholder="Full Name *" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} />
                                            <Input className="text-black" placeholder="Mobile Number *" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                                        </div>

                                        {/* Flat & Plot Number */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <Input className="text-black pr-20" placeholder="Flat / House No *" value={newAddress.flat} onChange={e => setNewAddress({ ...newAddress, flat: e.target.value })} />
                                                <button
                                                    onClick={(e) => { e.preventDefault(); handleDetectLocation(); }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#6D1357]/10 text-[#6D1357] text-[10px] font-bold rounded-md border border-[#6D1357]/20 hover:bg-[#6D1357]/20 transition-all uppercase"
                                                >
                                                    {gpsLoading ? '...' : 'Detect'}
                                                </button>
                                            </div>
                                            <Input className="text-black" placeholder="Plot Number" value={newAddress.plotNumber} onChange={e => setNewAddress({ ...newAddress, plotNumber: e.target.value })} />
                                        </div>

                                        {/* Area/Colony — auto-filled from GPS */}
                                        <div className="relative">
                                            <Input
                                                className="text-black pr-12"
                                                placeholder="Area / Locality *"
                                                value={newAddress.area}
                                                onChange={e => setNewAddress({ ...newAddress, area: e.target.value })}
                                            />
                                            {newAddress.area && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Auto</span>
                                            )}
                                        </div>

                                        {/* City, State, Pincode — auto-filled from GPS */}
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="relative">
                                                <Input
                                                    className="text-black"
                                                    placeholder="City"
                                                    value={newAddress.cityName}
                                                    onChange={e => setNewAddress({ ...newAddress, cityName: e.target.value })}
                                                />
                                                {isSearchingCity && (
                                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#6D1357]" />
                                                )}
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
                                            <div className="relative">
                                                <Input className="text-black" placeholder="State" value={newAddress.stateName} onChange={e => setNewAddress({ ...newAddress, stateName: e.target.value })} />
                                            </div>
                                            <div className="relative">
                                                <Input className="text-black pr-2" placeholder="Pincode *" value={newAddress.postalCode} onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })} />
                                            </div>
                                        </div>

                                        {/* GPS hint */}
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Navigation className="w-3 h-3" />
                                            Tap &ldquo;Use My Current Location&rdquo; on the map to auto-fill Area, City, State & Pincode.
                                        </p>

                                        {/* Buttons */}
                                        <div className="flex gap-3 pt-2">
                                            <Button variant="outline" className="flex-1 text-black" onClick={() => setShowAddForm(false)}>Cancel</Button>
                                            <Button className="flex-1 bg-[#6D1357] hover:bg-[#5A0E47] text-white" onClick={handleAddOrUpdateAddress}>
                                                {loading ? 'Saving...' : 'Save Address'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => {
                    setShowAuthModal(false);
                    if (!isAuthenticated) router.back();
                }}
            />

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
                <div className="max-w-[1000px] mx-auto">
                    <Button
                        onClick={handleContinue}
                        disabled={!selectedAddress || showAddForm || loading}
                        className="w-full h-14 text-lg bg-[#6D1357] hover:opacity-90 text-white rounded-xl shadow-lg"
                    >
                        {loading ? 'Processing...' : 'Proceed to Payment'}
                    </Button>
                </div>
            </div>

            <LocationMismatchModal
                mismatch={locationMismatch}
                onClose={() => setLocationMismatch(null)}
                browseUrl="/spa-salon"
                providerLabel="Spa & Salon Professional"
            />
        </div>
    );
}

export default function SpaBookingAddressPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SpaAddressContent />
        </Suspense>
    );
}
