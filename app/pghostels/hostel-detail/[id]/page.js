'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, Star, TrendingUp, DollarSign, Wifi, Utensils, Shirt, Zap,
    Car, Shield, Camera, MessageSquare, Sparkles, MapPin, Clock, Check, X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/pghostels/ui/tabs';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { AddonsModal } from '@/components/pghostels/AddonsModal';
import { useServiceCart } from '@/context/ServiceCartContext';
import { toast } from 'sonner';

const amenityIcons = {
    Wifi: Wifi,
    Food: Utensils,
    Laundry: Shirt,
    PowerBackup: Zap,
    Parking: Car,
    Security: Shield,
    AC: Sparkles,
    CCTV: Camera,
    WiFi: Wifi, // handle variations
    "High-Speed WiFi": Wifi,
};

export default function NewHostelDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const searchParams = useSearchParams();
    const fromListing = searchParams.get('fromListing') || 'all';
    const [activeTab, setActiveTab] = useState('portfolio');
    const { scrollY } = useScroll();
    const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

    const [hostelData, setHostelData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showAddonsModal, setShowAddonsModal] = useState(false);
    const [addonsData, setAddonsData] = useState(null);
    const [isCheckingAddons, setIsCheckingAddons] = useState(false);
    const { addToCart, clearCart } = useServiceCart();

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
    };

    useEffect(() => {
        const fetchHostelData = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/single-professional-provider', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        providerId: id
                    })
                });
                const data = await response.json();

                if (data.success && data.storeData && data.storeData.length > 0) {
                    const store = data.storeData[0];

                    // Map API Data to UI Model
                    const mappedData = {
                        id: id,
                        name: store.business_name || `${store.firstName} ${store.lastName}`,

                        location: store.address || 'Location not available',
                        address: store.address || 'Address not available',
                        rating: parseFloat(store.avgRating || 4.5).toFixed(1),
                        orders: store.totalOrders || 0,
                        basePrice: store.startingAt || 0,
                        bookingCost: store.startingAt || 0,
                        monthlyPrice: store.startingAt || 0, // Roughly estimating if not provided directly
                        logo: store.logo ? `https://api.doorstephub.com/${store.logo}` : 'https://images.unsplash.com/photo-1730096081994-73f1fa5f189a?fit=max&fm=jpg&w=200',
                        images: data.serviceImages && data.serviceImages.length > 0
                            ? data.serviceImages.map(img => img.startsWith('/')
                                ? `https://api.doorstephub.com${img}`
                                : `https://api.doorstephub.com/${img}`)
                            : ['https://images.unsplash.com/photo-1617430690223-3e165b390e25?fit=max&fm=jpg&w=1080'],

                        amenities: [
                            ...(Array.isArray(data.amenities) ? data.amenities : []),
                            ...(data.otherAmenities ? data.otherAmenities.split(/[\n,]/).map(a => a.trim()).filter(a => a.length > 0) : [])
                        ].map(amenity => ({
                            icon: amenityIcons[amenity] || Sparkles,
                            label: amenity,
                            available: true
                        })),

                        reviews: data.customerRatings ? data.customerRatings.map(review => ({
                            name: review.name || 'Anonymous',
                            avatar: review.image || '👤',
                            rating: review.rating,
                            date: review.date ? new Date(review.date).toLocaleDateString() : 'Recently',
                            comment: review.comment || 'No comment provided.'
                        })) : [],

                        packages: data.provider_rate_cards || [],
                        about: data.aboutUs || store.bio || 'Premium PG accommodation with all modern amenities.',
                        rules: [

                            { rule: 'No smoking inside premises', allowed: false },
                        ] // defaulting rules for now as not in API sample provided
                    };

                    setHostelData(mappedData);
                    // Select first package by default if available
                    if (mappedData.packages.length > 0) {
                        setSelectedPackage(mappedData.packages[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching hostel data:", error);
                setFetchError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchHostelData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#037166]"></div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 px-4">
                <p className="text-gray-700 text-lg font-medium text-center">Failed to load hostel details.</p>
                <p className="text-gray-400 text-sm text-center">Please check your connection and try again.</p>
                <button
                    onClick={() => { setFetchError(false); setLoading(true); }}
                    className="px-6 py-3 bg-[#037166] text-white rounded-xl font-semibold hover:bg-[#025951] transition-colors"
                >
                    Retry
                </button>
                <button
                    onClick={() => router.back()}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const handleContinueToBook = async () => {
        if (!selectedPackage) {
            toast.error("Please select a package first.");
            setActiveTab('portfolio');
            window.scrollTo({ top: 500, behavior: 'smooth' });
            return;
        }

        setIsCheckingAddons(true);
        try {
            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/professional-service-addons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceIds: [selectedPackage._id],
                    professionalProviderId: id
                })
            });
            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                const allAddons = data.data.flatMap(item => item.addons || []);
                if (allAddons.length > 0) {
                    setAddonsData(allAddons);
                    setShowAddonsModal(true);
                } else {
                    // No actual addons found in the structure
                    handleAddonsContinue([]);
                }
            } else {
                // No addons found
                handleAddonsContinue([]);
            }
        } catch (error) {
            console.error("Error checking addons:", error);
            // On error, safely proceed without addons
            handleAddonsContinue([]);
        } finally {
            setIsCheckingAddons(false);
        }
    };

    const handleAddonsContinue = async (selectedAddons) => {
        setIsCheckingAddons(true);
        try {
            setShowAddonsModal(false);

            // 1. Clear existing cart to start fresh
            await clearCart(true);

            // 2. Add Main Package
            const packageSuccess = await addToCart(
                id,
                selectedPackage._id,
                'professional_service',
                1,
                null,
                'professional',
                true
            );

            if (!packageSuccess) {
                toast.error('Failed to add package to booking');
                return;
            }

            // 3. Add Add-ons
            for (const addon of selectedAddons) {
                await addToCart(
                    id,
                    addon._id,
                    'professional_addon',
                    1,
                    selectedPackage._id,
                    'professional',
                    true
                );
            }

            // Save booking context for restoration if needed
            sessionStorage.setItem('pg_booking_data', JSON.stringify({
                providerId: id,
                packageId: selectedPackage._id,
                addons: selectedAddons.map(a => a._id)
            }));

            // Navigate to address page (params are still useful for context, but items are already in cart)
            const addonIds = selectedAddons.map(a => a._id).join(',');
            router.push(`/pghostels/booking/address?providerId=${id}&packageId=${selectedPackage._id}&addons=${addonIds}`);
        } catch (error) {
            console.error('Error during booking initiation:', error);
            toast.error('Failed to initiate booking. Please try again.');
        } finally {
            setIsCheckingAddons(false);
        }
    };

    if (!hostelData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-gray-500 text-lg">Hostel details not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-32">
            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.push(`/pghostels/listings/${fromListing}`)}
                className="fixed top-24 left-4 z-50 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors border border-gray-200"
            >
                <ArrowLeft className="w-5 h-5 text-gray-900" />
            </motion.button>

            {/* Image Gallery Slider */}
            <motion.div
                style={{ opacity: headerOpacity }}
                className="relative h-[500px] overflow-hidden"
            >
                <Slider {...sliderSettings}>
                    {hostelData.images.map((image, index) => (
                        <div key={index} className="relative h-[500px]">
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${image})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        </div>
                    ))}
                </Slider>
            </motion.div>

            {/* Hostel Header Info - Floating Card */}
            <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-8"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        {/* Left - Name & Logo */}
                        <div className="flex items-start space-x-4">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                <img
                                    src={hostelData.logo}
                                    alt={hostelData.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    {hostelData.name}
                                </h1>
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    <span>{hostelData.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right - Quick Stats */}
                        <div className="flex flex-wrap gap-4">
                            {/* Rating Card */}
                            <div className="bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 rounded-2xl p-4 border border-[#F59E0B]/20 min-w-[120px]">
                                <div className="flex items-center justify-center mb-1">
                                    <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B] mr-1" />
                                    <span className="text-2xl font-bold text-gray-900">{hostelData.rating}</span>
                                </div>
                                <div className="text-xs text-gray-500 text-center">Rating</div>
                            </div>


                            {/* Base Price Card */}
                            <div className="bg-gradient-to-br from-[#037166]/10 to-[#037166]/5 rounded-2xl p-4 border border-[#037166]/20 min-w-[120px]">
                                <div className="flex items-center justify-center mb-1">
                                    <DollarSign className="w-5 h-5 text-[#037166] mr-1" />
                                    <span className="text-2xl font-bold text-gray-900">₹{hostelData.basePrice}</span>
                                </div>
                                <div className="text-xs text-gray-500 text-center">Base Price</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tabs Section */}
            <div className="max-w-7xl mx-auto px-4 mt-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    {/* Sticky Tab Navigation */}
                    <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-2">
                        <TabsList className="bg-transparent w-full grid grid-cols-5 gap-2">
                            <TabsTrigger
                                value="portfolio"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#037166] data-[state=active]:to-[#025951] data-[state=active]:text-white text-gray-600 hover:text-gray-900 rounded-xl transition-colors"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Portfolio
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#037166] data-[state=active]:to-[#025951] data-[state=active]:text-white text-gray-600 hover:text-gray-900 rounded-xl transition-colors"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Reviews
                            </TabsTrigger>
                            <TabsTrigger
                                value="gallery"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#037166] data-[state=active]:to-[#025951] data-[state=active]:text-white text-gray-600 hover:text-gray-900 rounded-xl transition-colors"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Gallery
                            </TabsTrigger>
                            <TabsTrigger
                                value="amenities"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#037166] data-[state=active]:to-[#025951] data-[state=active]:text-white text-gray-600 hover:text-gray-900 rounded-xl transition-colors"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Amenities
                            </TabsTrigger>
                            <TabsTrigger
                                value="about"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#037166] data-[state=active]:to-[#025951] data-[state=active]:text-white text-gray-600 hover:text-gray-900 rounded-xl transition-colors"
                            >
                                <MapPin className="w-4 h-4 mr-2" />
                                About
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Portfolio Tab */}
                    <TabsContent value="portfolio" className="space-y-4">
                        <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#037166]" />
                            Please select a package to proceed:
                        </div>
                        {hostelData.packages.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {hostelData.packages.map((pkg, index) => (
                                    <div
                                        key={pkg._id || index}
                                        onClick={() => setSelectedPackage(pkg)}
                                        className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer relative ${selectedPackage?._id === pkg._id
                                            ? 'border-2 border-[#037166] ring-2 ring-[#037166]/10'
                                            : 'border-gray-100'
                                            }`}
                                    >
                                        {selectedPackage?._id === pkg._id && (
                                            <div className="absolute top-3 right-3 z-10 bg-[#037166] text-white p-1 rounded-full shadow-lg">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                        <div className="h-48 bg-gray-100 relative">
                                            {pkg.image ? (
                                                <img src={`https://api.doorstephub.com/${pkg.image}`} alt={pkg.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 mb-1">{pkg.name}</h3>
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{pkg.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[#037166] font-bold text-lg">₹{pkg.price}</span>
                                                <span className="text-xs text-gray-500">{pkg.priceUnit}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">No packages/portfolio available.</div>
                        )}
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="space-y-4">
                        {hostelData.reviews.length > 0 ? (
                            hostelData.reviews.map((review, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#037166] to-[#025951] flex items-center justify-center text-2xl flex-shrink-0 text-white">
                                            {review.avatar || review.name.charAt(0)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{review.date}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < Math.floor(review.rating)
                                                                ? 'fill-[#F59E0B] text-[#F59E0B]'
                                                                : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-500">No reviews yet.</div>
                        )}

                    </TabsContent>

                    {/* Gallery Tab */}
                    <TabsContent value="gallery" className="space-y-4">
                        {hostelData.images.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {hostelData.images.map((img, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative aspect-video rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
                                    >
                                        <img
                                            src={img}
                                            alt={`Gallery Image ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">No images available.</div>
                        )}
                    </TabsContent>

                    {/* Amenities Tab */}
                    <TabsContent value="amenities">
                        {hostelData.amenities.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {hostelData.amenities.map((amenity, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`rounded-2xl p-6 border-2 transition-all ${amenity.available
                                            ? 'bg-gradient-to-br from-[#037166]/10 to-[#037166]/5 border-[#037166]/30 hover:border-[#037166]'
                                            : 'bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${amenity.available
                                                    ? 'bg-[#037166]/20'
                                                    : 'bg-gray-200'
                                                    }`}
                                            >
                                                <amenity.icon
                                                    className={`w-6 h-6 ${amenity.available ? 'text-[#037166]' : 'text-gray-400'
                                                        }`}
                                                />
                                            </div>
                                            <div
                                                className={`w-6 h-6 rounded-full flex items-center justify-center ${amenity.available
                                                    ? 'bg-[#22C55E]/20'
                                                    : 'bg-red-100'
                                                    }`}
                                            >
                                                {amenity.available ? (
                                                    <Check className="w-4 h-4 text-[#22C55E]" />
                                                ) : (
                                                    <X className="w-4 h-4 text-red-500" />
                                                )}
                                            </div>
                                        </div>
                                        <h4
                                            className={`font-semibold ${amenity.available ? 'text-gray-900' : 'text-gray-400'
                                                }`}
                                        >
                                            {amenity.label}
                                        </h4>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">No amenities listed.</div>
                        )}
                    </TabsContent>

                    {/* About Tab */}
                    <TabsContent value="about">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Description */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">About the PG</h3>
                                <p className="text-gray-700 leading-relaxed text-lg">{hostelData.about}</p>
                            </div>

                            {/* Address */}
                            <div className="bg-gradient-to-br from-[#037166]/10 to-[#037166]/5 rounded-2xl p-8 border border-[#037166]/30">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-[#037166]" />
                                    Address
                                </h3>
                                <p className="text-gray-700 text-lg">{hostelData.address}</p>
                            </div>

                            {/* Rules */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">House Rules</h3>
                                <div className="space-y-4">
                                    {hostelData.rules.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl"
                                        >
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.allowed
                                                    ? 'bg-[#22C55E]/20'
                                                    : 'bg-red-100'
                                                    }`}
                                            >
                                                {item.allowed ? (
                                                    <Check className="w-5 h-5 text-[#22C55E]" />
                                                ) : (
                                                    <X className="w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                            <span className="text-gray-700 text-lg">{item.rule}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Fixed Bottom CTA */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50"
            >
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-500 mb-1">Booking Amount (Payable Now)</div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-3xl font-bold text-gray-900">
                                ₹{hostelData.bookingCost.toLocaleString()}
                            </span>
                        </div>
                        <div className="text-xs text-[#037166] font-medium mt-1">
                            {selectedPackage
                                ? `Total Package: ₹${selectedPackage.price.toLocaleString()} (Pay at Hostel)`
                                : 'Select a package to proceed'}
                        </div>
                    </div>

                    <button
                        onClick={handleContinueToBook}
                        disabled={isCheckingAddons}
                        className="px-12 py-4 bg-gradient-to-r from-[#037166] to-[#025951] text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-[#037166]/40 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isCheckingAddons && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                        {isCheckingAddons ? 'Checking...' : 'Continue to Book'}
                    </button>
                </div>
            </motion.div>

            {/* Add-ons Modal */}
            <AddonsModal
                isOpen={showAddonsModal}
                onClose={() => setShowAddonsModal(false)}
                providerId={id}
                selectedPackageId={selectedPackage?._id}
                onContinue={handleAddonsContinue}
                prefetchedAddons={addonsData}
            />
        </div>
    );
}
