'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Home, Briefcase, MapPin, Plus, Check, Trash2, Edit2, Loader2, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useServiceCart } from '@/context/ServiceCartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthModal } from '@/components/auth/AuthModal';

function SpaAddressContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { token, isAuthenticated } = useAuth();
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
                    stateName: 'Telangana', cityName: 'Hyderabad', defaultAddress: false
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
            const response = await fetch(`https://api.doorstephub.com/v1/dhubApi/app/useraddress/deleteuseraddress/${id}`, {
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
            const packageIdList = packageId ? packageId.split(',') : [];
            const firstPackageId = packageIdList[0];

            // Mock Skip
            if (providerId?.startsWith('mock_') || (firstPackageId && firstPackageId.startsWith('mock_'))) {
                sessionStorage.setItem('spa_booking_data', JSON.stringify({
                    providerId, packageId: packageIdList, addons: addons ? addons.split(',') : [], address: selectedAddress
                }));
                sessionStorage.setItem('selected_address', JSON.stringify(selectedAddress));
                router.push('/spa-salon/booking/confirm');
                return;
            }

            // 1. Clear Cart
            await clearCart(true);

            // 2. Add All Packages
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
                    toast.error(`Failed to add service ${pId} to booking`);
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
                        firstPackageId, // Link addons to the first package
                        'professional',
                        true // suppressToast
                    );
                }
            }

            // Save booking context
            sessionStorage.setItem('spa_booking_data', JSON.stringify({
                providerId,
                packageId: packageIdList,
                addons: addons ? addons.split(',') : [],
                address: selectedAddress
            }));
            sessionStorage.setItem('selected_address', JSON.stringify(selectedAddress));

            router.push('/spa-salon/booking/confirm');
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

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3"
                    >
                        <MapPin className="w-8 h-8" />
                        Where should we come?
                    </motion.h1>
                </div>
            </section>

            <div className="max-w-[1000px] mx-auto px-6 lg:px-8 py-8">
                {loading && addresses.length === 0 ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#C06C84]" /></div>
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
                                        ? 'bg-white border-2 border-[#C06C84] shadow-lg shadow-[#C06C84]/10'
                                        : 'bg-white border border-gray-200 hover:border-[#C06C84]/30 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex gap-6">
                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-[#C06C84]/10' : 'bg-gray-100'}`}>
                                            <Icon className={`w-8 h-8 ${isSelected ? 'text-[#C06C84]' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 capitalize mb-1">{address.type || 'Address'}</h3>
                                            <p className="font-medium text-gray-800 mb-1">{address.name}</p>
                                            <p className="text-gray-600 text-sm">{address.flat}, {address.area}, {address.cityName}</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {isSelected && <div className="w-8 h-8 rounded-full bg-[#C06C84] flex items-center justify-center"><Check className="w-5 h-5 text-white" /></div>}
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
                                name: '', phone: '', type: 'Home', area: '', flat: '',
                                postalCode: '', addressLineOne: '', addressLineTwo: '',
                                stateName: 'Telangana', cityName: 'Hyderabad', defaultAddress: false
                            });
                            setShowAddForm(true);
                        }}
                        className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-500 hover:border-[#C06C84] hover:text-[#C06C84] transition-colors"
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
                                                className={`flex-1 py-2 rounded-lg font-medium border ${newAddress.type === type ? 'bg-[#C06C84] text-white border-[#C06C84]' : 'border-gray-200 hover:bg-gray-50'}`}
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
                                        <Button className="flex-1 bg-[#C06C84] hover:bg-[#A0556C] text-white" onClick={handleAddOrUpdateAddress}>
                                            {loading ? 'Saving...' : 'Save Address'}
                                        </Button>
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
                        className="w-full h-14 text-lg bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] hover:opacity-90 text-white rounded-xl shadow-lg"
                    >
                        {loading ? 'Processing...' : 'Proceed to Payment'}
                    </Button>
                </div>
            </div>
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
