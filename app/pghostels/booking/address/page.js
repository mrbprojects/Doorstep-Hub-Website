'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Home, Briefcase, MapPin, Plus, Check, Trash2, Edit2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useServiceCart } from '@/context/ServiceCartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthModal } from '@/components/auth/AuthModal';

function PGAddressContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { token, isAuthenticated } = useAuth();
    const { addToCart, clearCart } = useServiceCart();

    const providerId = searchParams.get('providerId');
    const packageId = searchParams.get('packageId');
    const addons = searchParams.get('addons');

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

    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '', phone: '', type: 'Home', area: '', flat: '',
        postalCode: '', addressLineOne: '', addressLineTwo: '',
        stateName: 'Telangana', cityName: 'Hyderabad', defaultAddress: false
    });

    const fetchAddresses = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/useraddress/getuseraddress', {
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
        if (isAuthenticated) {
            fetchAddresses();
        } else {
            const timer = setTimeout(() => {
                if (!isAuthenticated) setShowAuthModal(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, fetchAddresses]);

    const handleAddOrUpdateAddress = async () => {
        if (!newAddress.name || !newAddress.phone || !newAddress.area || !newAddress.flat || !newAddress.postalCode) {
            toast.error('Please fill in required fields');
            return;
        }
        setLoading(true);
        try {
            const url = editingAddress
                ? `https://api.doorstephub.com/v1/dhubApi/app/useraddress/edituseraddress/${editingAddress._id}`
                : 'https://api.doorstephub.com/v1/dhubApi/app/useraddress/addaddress';
            const method = editingAddress ? 'PUT' : 'POST';
            const payload = {
                ...newAddress,
                latitude: "17.450123",
                longitude: "78.390456",
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
            const response = await fetch(`https://api.doorstephub.com/v1/dhubApi/app/useraddress/deleteuseraddress/${id}`, {
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
        if (!selectedAddress) { toast.error('Please select an address'); return; }
        setLoading(true);
        try {
            sessionStorage.setItem('selected_address', JSON.stringify(selectedAddress));
            // Pass providerId so confirm page can recover cart context if needed
            const confirmUrl = providerId
                ? `/pghostels/booking/confirm?providerId=${providerId}`
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

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden pb-32 pt-20">
            {/* Header — inline, scrolls with page */}
            <section className="bg-gradient-to-r from-[#037166] via-teal-600 to-[#04a99d] border-b border-white/10 shadow-lg overflow-x-hidden">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => providerId
                            ? router.push(`/pghostels/hostel-detail/${providerId}`)
                            : router.back()
                        }
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
                        Select Booking Address
                    </motion.h1>
                </div>

                {/* Progress Indicator */}
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-6">
                    <div className="flex items-center gap-2">
                        {['Select PG', 'Address', 'Confirm & Pay'].map((step, index) => {
                            const isCompleted = index < 1;
                            const isCurrent = index === 1;
                            return (
                                <React.Fragment key={step}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-white shadow-md' : isCurrent ? 'bg-white ring-4 ring-white/30 scale-110 shadow-lg' : 'bg-white/30'}`}>
                                            {isCompleted ? (
                                                <Check className="w-5 h-5 text-[#037166]" />
                                            ) : (
                                                <span className={`text-sm font-bold ${isCurrent ? 'text-[#037166]' : 'text-white/60'}`}>{index + 1}</span>
                                            )}
                                        </div>
                                        <span className={`text-xs sm:text-sm font-medium transition-all ${isCurrent ? 'text-white font-bold' : 'text-white/70'}`}>{step}</span>
                                    </div>
                                    {index < 2 && (
                                        <div className={`h-0.5 flex-1 mx-2 transition-all ${isCompleted ? 'bg-white/80' : 'bg-white/20'}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </section>

            <div className="max-w-[1000px] mx-auto px-6 lg:px-8 py-8">
                {loading && addresses.length === 0 ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-[#037166]" />
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {addresses.length === 0 && !loading && (
                            <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl">
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
                                name: '', phone: '', type: 'Home', area: '', flat: '',
                                postalCode: '', addressLineOne: '', addressLineTwo: '',
                                stateName, cityName, defaultAddress: false
                            });
                            setShowAddForm(true);
                        }}
                        className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-500 hover:border-[#037166] hover:text-[#037166] transition-colors"
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
                                    <div className="flex gap-3">
                                        {['Home', 'Office', 'Other'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setNewAddress({ ...newAddress, type })}
                                                className={`flex-1 py-2 rounded-lg font-medium border ${newAddress.type === type ? 'bg-[#037166] text-white border-[#037166]' : 'border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Input placeholder="Full Name" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} />
                                        <Input placeholder="Phone Number" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                                    </div>
                                    <Input placeholder="Flat / House No" value={newAddress.flat} onChange={e => setNewAddress({ ...newAddress, flat: e.target.value })} />
                                    <Input placeholder="Area / Colony" value={newAddress.area} onChange={e => setNewAddress({ ...newAddress, area: e.target.value })} />
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <Input placeholder="City" value={newAddress.cityName} onChange={e => setNewAddress({ ...newAddress, cityName: e.target.value })} />
                                        <Input placeholder="State" value={newAddress.stateName} onChange={e => setNewAddress({ ...newAddress, stateName: e.target.value })} />
                                        <Input placeholder="Pincode" value={newAddress.postalCode} onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })} />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>Cancel</Button>
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
