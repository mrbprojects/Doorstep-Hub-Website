'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Home, Briefcase, CheckCircle, MapPin, Plus, Check, Trash2, Edit2, Loader2, X, Flower2 } from 'lucide-react';
import { toast } from 'sonner';
import { trackLeadEvent } from '@/lib/leadTracking';
import { useAuth } from '@/context/AuthContext';
import { useServiceCart } from '@/context/ServiceCartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthModal } from '@/components/auth/AuthModal';
import { locationManager } from '@/services/locationManager';
import { LocationMismatchModal, areCitiesMatching } from '@/components/shared/LocationMismatchModal';

const clean = (v) => {
    if (!v) return null;
    const s = String(v).trim();
    if (!s || s.toUpperCase() === 'N/A' || s === ',' || s === '-') return null;
    return s;
};

const formatFullAddress = (addr) => {
    if (!addr) return { street: '', cityState: '', postalCode: '', hasDetails: false };

    const streetParts = [
        clean(addr.flat),
        clean(addr.area),
        clean(addr.addressLineOne),
        clean(addr.addressLineTwo)
    ].filter(Boolean);

    // Deduplicate identical parts (e.g. if flat or area is in addressLineOne)
    const seen = new Set();
    const uniqueStreet = streetParts.filter(part => {
        const lower = part.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
    });

    const cityParts = [
        clean(addr.cityName),
        clean(addr.stateName)
    ].filter(Boolean);

    const pin = clean(addr.postalCode);

    return {
        street: uniqueStreet.join(', '),
        cityState: cityParts.join(', '),
        postalCode: pin,
        hasDetails: uniqueStreet.length > 0 || cityParts.length > 0
    };
};

function ReligiousAddressContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, token, isAuthenticated } = useAuth();
    const { addToCart, clearCart } = useServiceCart();

    const providerId = searchParams.get('providerId');
    const packageId = searchParams.get('packageId');
    const addons = searchParams.get('addons');

    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [locationMismatch, setLocationMismatch] = useState(null);
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
        latitude: 17.4126,
        longitude: 78.2676
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
                latitude: details.lat,
                longitude: details.lng
            }));
            setCitySuggestions([]);
        } catch (error) {
            console.error('Failed to set city from suggestion:', error);
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
            (error) => {
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
        if (isAuthenticated) {
            fetchAddresses();
        } else {
            const timer = setTimeout(() => {
                if (!isAuthenticated) setShowAuthModal(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, fetchAddresses]);

    // Auto-fill user details from profile if authenticated
    useEffect(() => {
        if (isAuthenticated && user && showAddForm && !editingAddress) {
            setNewAddress(prev => {
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
                    postalCode: '', addressLineOne: '', addressLineTwo: '',
                    stateName: 'Telangana', cityName: 'Hyderabad', defaultAddress: false,
                    latitude: 17.4126, longitude: 78.2676
                });
                fetchAddresses();
            } else {
                toast.error(data.message || 'Action failed');
            }
        } catch (error) {
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
        } catch (e) { toast.error('Failed to delete'); }
        finally { setLoading(false); }
    };

    const handleContinue = async () => {
        if (!selectedAddress) {
            toast.error("Please select an address");
            return;
        }

        setLoading(true);
        try {
            // Preflight backend location verification
            if (providerId && selectedAddress?._id && token) {
                try {
                    const valRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/service-cart/validate-booking-location`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            providerId,
                            serviceAddressId: selectedAddress._id
                        })
                    });
                    const valData = await valRes.json();
                    if (valData.success && valData.matched === false) {
                        setLocationMismatch({
                            userCity: valData.userCity,
                            providerCity: valData.providerCity,
                            providerName: valData.providerName || 'Selected Priest / Ritual Specialist'
                        });
                        setLoading(false);
                        return;
                    }
                } catch (valErr) {
                    console.warn('Location validation check error:', valErr);
                }
            }

            // 1. Clear Cart
            await clearCart(true);

            // 2. Add Main Packages (Professional Service)
            const packageIdList = packageId ? packageId.split(',') : [];
            const firstPackageId = packageIdList[0];

            for (const pId of packageIdList) {
                const packageSuccess = await addToCart(
                    providerId,
                    pId,
                    'professional_service',
                    1,
                    null,
                    'professional',
                    true // suppressToast
                );

                if (!packageSuccess) {
                    toast.error('Failed to add service to booking');
                    setLoading(false);
                    return;
                }
            }

            // 3. Add Addons
            if (addons) {
                const addonList = addons.split(',');
                for (const addonId of addonList) {
                    await addToCart(
                        providerId,
                        addonId,
                        'professional_addon',
                        1,
                        firstPackageId, // Linked to first package
                        'professional',
                        true // suppressToast
                    );
                }
            }

            // Save booking context (backup)
            sessionStorage.setItem('religious_booking_data', JSON.stringify({
                providerId,
                packageId: packageIdList.length > 1 ? packageIdList : packageId,
                addons: addons ? addons.split(',') : [],
                address: selectedAddress
            }));

            // Save address for Confirm Page
            sessionStorage.setItem('religious_booking_address', JSON.stringify(selectedAddress));
            sessionStorage.setItem('selected_address', JSON.stringify(selectedAddress));
            trackLeadEvent({
                eventType: 'LOCATION_ADDED',
                vertical: 'religious',
                city: selectedAddress.cityName,
                area: selectedAddress.area,
                pincode: selectedAddress.postalCode,
            });

            router.push('/religious-services/booking/confirm');
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Failed to proceed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (addr) => {
        setEditingAddress(addr);
        setNewAddress({
            name: addr.name,
            phone: addr.phone,
            type: addr.type,
            area: addr.area,
            flat: addr.flat,
            postalCode: addr.postalCode,
            addressLineOne: addr.addressLineOne,
            addressLineTwo: addr.addressLineTwo,
            stateName: addr.stateName || 'Telangana',
            cityName: addr.cityName || 'Hyderabad',
            defaultAddress: addr.defaultAddress
        });
        setShowAddForm(true);
    };

    const getIcon = (type) => {
        const lower = type?.toLowerCase() || '';
        if (lower.includes('home')) return Home;
        if (lower.includes('work') || lower.includes('office')) return Briefcase;
        return MapPin;
    };

    return (
        <div className="min-h-screen pt-16 sm:pt-20 pb-28 bg-[var(--off-white)]">
            {/* Header matching Religious colors with compact height */}
            <section className="sticky top-16 sm:top-20 z-40 bg-gradient-to-r from-[var(--saffron)] via-[var(--temple-red)] to-[var(--deep-charcoal)] border-b border-white/10 shadow-md">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white hover:bg-white/25 transition-all text-xs font-semibold"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Service</span>
                        </motion.button>
                        <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                            <span className="hidden sm:inline">Ritual Services:</span>
                            <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
                                {packageId ? packageId.split(',').length : 1} Selected
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-amber-200" />
                                Select Ritual Location
                            </h1>
                            <p className="text-white/80 text-xs mt-0.5">
                                Priest / Vedic specialist will visit this location for the ceremonies
                            </p>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            {['Selection', 'Address', 'Confirm & Pay'].map((step, index) => (
                                <React.Fragment key={step}>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                            index === 0 ? 'bg-white text-[var(--saffron)]' :
                                            index === 1 ? 'bg-amber-300 text-gray-900 ring-2 ring-white/40 font-extrabold' :
                                            'bg-white/20 text-white/60'
                                        }`}>
                                            {index === 0 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : index + 1}
                                        </div>
                                        <span className={`text-[11px] font-bold uppercase tracking-wider transition-all hidden md:inline ${
                                            index === 1 ? 'text-white' : 'text-white/70'
                                        }`}>
                                            {step}
                                        </span>
                                    </div>
                                    {index < 2 && <div className="w-6 sm:w-8 h-0.5 bg-white/25" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-[var(--deep-charcoal)] flex items-center gap-2">
                            <span>Saved Addresses</span>
                            {addresses.length > 0 && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                    {addresses.length}
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-gray-500">Choose the address where the ritual should take place</p>
                    </div>

                    {!showAddForm && (
                        <button
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
                                    cityName: 'Hyderabad',
                                    defaultAddress: false
                                });
                                setShowAddForm(true);
                                setTimeout(() => handleDetectLocation(), 100);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[var(--saffron)]/40 bg-[var(--saffron)]/10 text-[var(--saffron)] hover:bg-[var(--saffron)]/20 text-xs font-bold transition-all shadow-xs"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Address</span>
                        </button>
                    )}
                </div>

                {loading && addresses.length === 0 ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--saffron)]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {addresses.length === 0 && !loading && (
                            <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-white p-6">
                                <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-50" />
                                <p className="text-gray-600 font-semibold text-sm">No saved addresses found</p>
                                <p className="text-gray-400 text-xs mt-0.5 mb-4">Please add an address to continue with your booking</p>
                                <button
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
                                            cityName: 'Hyderabad',
                                            defaultAddress: false
                                        });
                                        setShowAddForm(true);
                                        setTimeout(() => handleDetectLocation(), 100);
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--saffron)] text-white text-xs font-bold hover:bg-[var(--temple-red)] transition-all shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add Your First Address
                                </button>
                            </div>
                        )}

                        {addresses.map((address, index) => {
                            const Icon = getIcon(address.type);
                            const isSelected = selectedAddress?._id === address._id;
                            const { street, cityState, postalCode } = formatFullAddress(address);

                            return (
                                <motion.div
                                    key={address._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedAddress(address)}
                                    className={`relative cursor-pointer rounded-2xl p-4 sm:p-4.5 transition-all duration-200 flex flex-col justify-between ${
                                        isSelected
                                            ? 'bg-gradient-to-br from-amber-50/50 via-white to-white border-2 border-[var(--saffron)] ring-2 ring-[var(--saffron)]/15 shadow-md'
                                            : 'bg-white border border-gray-200 hover:border-[var(--saffron)]/40 hover:shadow-xs'
                                    }`}
                                >
                                    <div>
                                        {/* Card Top: Type, Default Badge, Select Icon & Action Buttons */}
                                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-100">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                                    isSelected ? 'bg-[var(--saffron)] text-white shadow-xs' : 'bg-amber-50 text-[var(--saffron)]'
                                                }`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex items-center gap-1.5">
                                                    <h3 className="text-sm font-bold text-[var(--deep-charcoal)] capitalize truncate">
                                                        {address.type || 'Address'}
                                                    </h3>
                                                    {address.defaultAddress && (
                                                        <span className="px-1.5 py-0.5 rounded bg-[var(--saffron)]/15 text-[var(--saffron)] text-[9px] font-extrabold uppercase tracking-wider">
                                                            DEFAULT
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {isSelected && (
                                                    <div className="w-5 h-5 rounded-full bg-[var(--saffron)] flex items-center justify-center text-white mr-1 shadow-xs">
                                                        <Check className="w-3 h-3 stroke-[3]" />
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); openEditModal(address); }}
                                                    className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                                                    title="Edit Address"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address._id); }}
                                                    className="p-1.5 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Delete Address"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Recipient details */}
                                        <div className="mb-2">
                                            <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                                {address.name || 'Recipient'}
                                                {address.phone && (
                                                    <span className="font-normal text-gray-500 text-xs"> • {address.phone}</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Complete Street Address Details */}
                                        {street ? (
                                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-1.5">
                                                {street}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic mb-1.5">Street address not specified</p>
                                        )}
                                    </div>

                                    {/* Card Bottom: City, State, Pincode */}
                                    {(cityState || postalCode) && (
                                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                                            <div className="flex items-center gap-1 truncate text-gray-700">
                                                <MapPin className="w-3 h-3 text-[var(--saffron)] shrink-0" />
                                                <span className="truncate">{cityState || 'Location'}</span>
                                            </div>
                                            {postalCode && (
                                                <span className="text-gray-600 shrink-0 font-semibold bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                                                    PIN: {postalCode}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Add New Address Button */}
                {!showAddForm && addresses.length > 0 && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
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
                                cityName: 'Hyderabad',
                                defaultAddress: false
                            });
                            setShowAddForm(true);
                            setTimeout(() => handleDetectLocation(), 100);
                        }}
                        className="w-full mt-4 py-3 px-4 border border-dashed border-[var(--saffron)]/40 rounded-xl flex items-center justify-center gap-2 text-[var(--saffron)] bg-amber-50/20 hover:bg-amber-50/50 hover:border-[var(--saffron)] text-xs sm:text-sm font-semibold transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Another Address
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
                                    <h3 className="text-xl font-bold text-[var(--deep-charcoal)]">{editingAddress ? 'Edit Address' : 'Add New Details'}</h3>
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
                                        {['Home', 'Office', 'Friends & Relatives'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setNewAddress({ ...newAddress, type })}
                                                className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${newAddress.type === type ? 'bg-[var(--saffron)] text-white border-[var(--saffron)] shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
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
                                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[var(--saffron)]/10 text-[var(--saffron)] text-[10px] font-bold rounded-md border border-[var(--saffron)]/20 hover:bg-[var(--saffron)]/20 transition-all uppercase"
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
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[var(--saffron)]" />
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
                                        <Input className="text-black" placeholder="State" value={newAddress.stateName} onChange={e => setNewAddress({ ...newAddress, stateName: e.target.value })} />
                                        <Input className="text-black" placeholder="Pincode" value={newAddress.postalCode} onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })} />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button variant="outline" className="flex-1 text-black" onClick={() => setShowAddForm(false)}>Cancel</Button>
                                        <Button className="flex-1 bg-[var(--saffron)] hover:bg-[var(--temple-red)] text-white" onClick={handleAddOrUpdateAddress}>
                                            {loading ? 'Saving...' : 'Save Address'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => {
                    setShowAuthModal(false);
                    if (!isAuthenticated) router.back();
                }}
            />

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3 px-4 sm:px-6 z-50 shadow-lg">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600">
                        {selectedAddress ? (
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-gray-500">Selected Location:</span>
                                <span className="font-bold text-gray-900 capitalize">{selectedAddress.type || 'Address'}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-700 font-medium truncate max-w-sm">
                                    {selectedAddress.name} ({selectedAddress.cityName})
                                </span>
                            </div>
                        ) : (
                            <span className="text-amber-600 font-medium">Please select an address to proceed</span>
                        )}
                    </div>
                    <Button
                        onClick={handleContinue}
                        disabled={!selectedAddress || showAddForm || loading}
                        className="w-full sm:w-auto min-w-[220px] h-11 sm:h-12 text-sm sm:text-base font-bold bg-gradient-to-r from-[var(--saffron)] to-[var(--temple-red)] hover:shadow-lg hover:shadow-[var(--saffron)]/30 text-white rounded-xl transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                            </div>
                        ) : (
                            <span>Proceed to Payment</span>
                        )}
                    </Button>
                </div>
            </div>

            <LocationMismatchModal
                mismatch={locationMismatch}
                onClose={() => setLocationMismatch(null)}
                browseUrl="/religious-services"
                providerLabel="Priest / Ritual Specialist"
            />
        </div>
    );
}

export default function ReligiousAddressPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ReligiousAddressContent />
        </Suspense>
    );
}
