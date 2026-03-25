'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, Star, TrendingUp, DollarSign, Wifi, Utensils, Shirt, Zap,
    Car, Shield, Camera, MessageSquare, Sparkles, MapPin, Clock, Check, X, ChevronRight, Home, ChevronLeft
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
    const [activeTab, setActiveTab] = useState('roomTypes');
    const [viewingRateCard, setViewingRateCard] = useState(null);
    const [rateCardImageIndex, setRateCardImageIndex] = useState(0);
    const [viewingGalleryIndex, setViewingGalleryIndex] = useState(null);
    const [galleryAutoPlay, setGalleryAutoPlay] = useState(true);
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
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/single-professional-provider`, {
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
                        logo: store.logo ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${store.logo}` : 'https://images.unsplash.com/photo-1730096081994-73f1fa5f189a?fit=max&fm=jpg&w=200',
                        image: store.image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${store.image}` : 'https://images.unsplash.com/photo-1617430690223-3e165b390e25?fit=max&fm=jpg&w=1080',
                        images: data.serviceImages && data.serviceImages.length > 0
                            ? data.serviceImages.map(img => img.startsWith('/')
                                ? `https://api.doorstephub.com${img}`
                                : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img}`)
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

    // Immediate redirection logic
    useEffect(() => {
        if (!loading && (fetchError || !hostelData)) {
            router.replace('/book-appointment');
        }
    }, [loading, fetchError, hostelData, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#037166]"></div>
            </div>
        );
    }

    if (fetchError || !hostelData) {
        return <div className="min-h-screen bg-white" />;
    }

    const handleContinueToBook = async () => {
        if (!selectedPackage) {
            toast.error("Please select a package first.");
            setActiveTab('roomTypes');
            window.scrollTo({ top: 500, behavior: 'smooth' });
            return;
        }

        setIsCheckingAddons(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/professional-service-addons`, {
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


    return (
        <div className="min-h-screen bg-transparent pb-32">
            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.push(`/pghostels/listings/${fromListing}`)}
                className="fixed top-24 left-4 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors border border-gray-200"
            >
                <ArrowLeft className="w-5 h-5 text-gray-900" />
            </motion.button>

            {/* Image Gallery Slider */}
            <motion.div
                style={{ opacity: headerOpacity }}
                className="relative h-[500px] overflow-hidden"
            >
                <div
                    className="absolute inset-0 bg-fit bg-center"
                    style={{
                        backgroundImage: `url(${hostelData.image})`
                    }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </motion.div>

            {/* Hostel Header Info - Floating Card */}
            <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-5 sm:p-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-4">
                        {/* Left - Name & Logo */}
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-gray-100 flex-shrink-0 shadow-sm">
                                <img
                                    src={hostelData.logo}
                                    alt={hostelData.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 line-clamp-1 leading-tight mb-0.5 sm:mb-1">
                                    {hostelData.name}
                                </h1>
                                <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                                    <MapPin className="w-3.5 h-3.5 mr-1 text-[#037166]/60" />
                                    <span className="truncate">{hostelData.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right - Quick Stats */}
                        <div className="flex flex-row items-center gap-2 sm:gap-4 flex-shrink-0">
                            {/* Rating pill */}
                            <div className="flex-1 sm:flex-none bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 rounded-2xl p-2.5 sm:p-4 border border-[#F59E0B]/20 min-w-[90px] sm:min-w-[120px] text-center shadow-sm">
                                <div className="flex items-center justify-center mb-0.5">
                                    <Star className="w-3.5 h-3.5 sm:w-4 h-4 fill-[#F59E0B] text-[#F59E0B] mr-1" />
                                    <span className="text-lg sm:text-2xl font-bold text-gray-900">{hostelData.rating}</span>
                                </div>
                                <div className="text-[9px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Rating</div>
                            </div>

                            {/* Base Price pill */}
                            <div className="flex-1 sm:flex-none bg-gradient-to-br from-[#037166]/10 to-[#037166]/5 rounded-2xl p-2.5 sm:p-4 border border-[#037166]/20 min-w-[90px] sm:min-w-[120px] text-center shadow-sm">
                                <div className="flex items-center justify-center mb-0.5">
                                    <span className="text-lg sm:text-2xl font-bold text-gray-900">₹{hostelData.basePrice}</span>
                                </div>
                                <div className="text-[9px] sm:text-xs text-[#037166] font-bold uppercase tracking-wider whitespace-nowrap">/Month</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tabs Section */}
            <div className="max-w-7xl mx-auto px-4 mt-8 relative">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    {/* Sticky Tab Navigation */}
                    <div className="sticky top-[80px] sm:top-[90px] z-40 bg-white shadow-xl shadow-black/5 rounded-2xl border border-gray-100 p-1.5 overflow-hidden">
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .hide-scrollbar::-webkit-scrollbar { display: none; }
                            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                        ` }} />
                        <TabsList className="bg-transparent w-full flex flex-row items-center gap-1 sm:gap-3 overflow-x-auto flex-nowrap hide-scrollbar h-12 sm:h-14">
                            <TabsTrigger
                                value="roomTypes"
                                className="flex-shrink-0 data-[state=active]:bg-[#037166] data-[state=active]:text-white text-gray-700 hover:bg-gray-50 rounded-xl transition-all whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 font-bold flex items-center h-full border-none shadow-none"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                <span>Room Sharings</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="flex-shrink-0 data-[state=active]:bg-[#037166] data-[state=active]:text-white text-gray-700 hover:bg-gray-50 rounded-xl transition-all whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 font-bold flex items-center h-full border-none shadow-none"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                <span>Reviews</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="gallery"
                                className="flex-shrink-0 data-[state=active]:bg-[#037166] data-[state=active]:text-white text-gray-700 hover:bg-gray-50 rounded-xl transition-all whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 font-bold flex items-center h-full border-none shadow-none"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                <span>Gallery</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="amenities"
                                className="flex-shrink-0 data-[state=active]:bg-[#037166] data-[state=active]:text-white text-gray-700 hover:bg-gray-50 rounded-xl transition-all whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 font-bold flex items-center h-full border-none shadow-none"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                <span>Amenities</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="about"
                                className="flex-shrink-0 data-[state=active]:bg-[#037166] data-[state=active]:text-white text-gray-700 hover:bg-gray-50 rounded-xl transition-all whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 font-bold flex items-center h-full border-none shadow-none"
                            >
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>About</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Room Types Tab */}
                    <TabsContent value="roomTypes" className="space-y-4">
                        <div className="mb-4 text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 h-4 text-[#037166]" />
                            Please select a room type to proceed:
                        </div>
                        {hostelData.packages.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {hostelData.packages.map((pkg, index) => (
                                    <div
                                        key={pkg._id || index}
                                        onClick={() => setSelectedPackage(pkg)}
                                        className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer relative flex flex-row h-auto min-h-[130px] sm:min-h-[160px] ${selectedPackage?._id === pkg._id
                                            ? 'border-2 border-[#037166] ring-2 ring-[#037166]/10'
                                            : 'border-gray-100'
                                            }`}
                                    >
                                        {selectedPackage?._id === pkg._id && (
                                            <div className="absolute top-2 right-2 z-10 bg-[#037166] text-white p-1 rounded-full shadow-lg">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                        <div className="w-24 sm:w-48 h-auto sm:h-full bg-gray-100 relative flex-shrink-0">
                                            {pkg.image ? (
                                                <img src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${pkg.image}`} alt={pkg.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                                            )}
                                        </div>
                                        <div className="p-3.5 sm:p-5 flex flex-col justify-between flex-1 min-w-0">
                                            <div className="min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{pkg.name}</h3>
                                                </div>
                                                <p className="text-gray-500 text-xs sm:text-sm mb-2 line-clamp-2 leading-snug">{pkg.description}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                                                <div className="flex flex-col">
                                                    <span className="text-[#037166] font-bold text-xl sm:text-2xl">₹{pkg.price}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{pkg.priceUnit || 'per month'}</span>
                                                </div>

                                                {pkg.banner_images && pkg.banner_images.length > 0 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setViewingRateCard(pkg);
                                                            setRateCardImageIndex(0);
                                                        }}
                                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#037166]/10 text-[#037166] rounded-xl text-[10px] sm:text-xs font-bold hover:bg-[#037166] hover:text-white transition-all flex items-center gap-1"
                                                    >
                                                        Details
                                                        <ChevronRight className="w-3 h-3 sm:w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">No room types available.</div>
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
                                        onClick={() => setViewingGalleryIndex(index)}
                                        className="relative aspect-video rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group cursor-pointer"
                                    >
                                        <img
                                            src={img}
                                            alt={`Gallery Image ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <Sparkles className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
                                        </div>
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
                        className="px-6 sm:px-12 py-3.5 sm:py-4 bg-gradient-to-r from-[#037166] to-[#025951] text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:shadow-xl hover:shadow-[#037166]/40 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isCheckingAddons && <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>}
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

            {/* Rate Card Gallery Modal */}
            <AnimatePresence>
                {viewingRateCard && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingRateCard(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            {/* Navigation Header */}
                            <div className="p-4 border-b flex items-center justify-between bg-white z-10">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">
                                        {viewingRateCard.name}
                                    </h3>
                                    {viewingRateCard.banner_images?.length > 1 && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Image {rateCardImageIndex + 1} of {viewingRateCard.banner_images.length}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {viewingRateCard.banner_images?.length > 1 && (
                                        <div className="flex items-center bg-gray-100 rounded-full p-1 mr-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRateCardImageIndex(prev => (prev - 1 + viewingRateCard.banner_images.length) % viewingRateCard.banner_images.length);
                                                }}
                                                className="p-1.5 rounded-full hover:bg-white transition-colors"
                                            >
                                                <ChevronLeft className="w-5 h-5 text-gray-700" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRateCardImageIndex(prev => (prev + 1) % viewingRateCard.banner_images.length);
                                                }}
                                                className="p-1.5 rounded-full hover:bg-white transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5 text-gray-700" />
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setViewingRateCard(null)}
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Image Container */}
                            <div className="flex-1 overflow-hidden bg-gray-50 flex items-center justify-center p-4 min-h-[300px]">
                                <motion.img
                                    key={rateCardImageIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${viewingRateCard.banner_images[rateCardImageIndex]}`}
                                    alt={viewingRateCard.name}
                                    className="max-w-full max-h-[70vh] object-contain shadow-lg rounded-xl"
                                />
                            </div>

                            {/* Thumbnail bar if multiple images */}
                            {viewingRateCard.banner_images?.length > 1 && (
                                <div className="p-4 bg-white border-t overflow-x-auto flex gap-2 justify-center">
                                    {viewingRateCard.banner_images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setRateCardImageIndex(idx)}
                                            className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${rateCardImageIndex === idx ? 'ring-2 ring-[#037166] scale-105 shadow-md' : 'opacity-60 hover:opacity-100'}`}
                                        >
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img}`}
                                                className="w-full h-full object-cover"
                                                alt=""
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Gallery Fullscreen Modal */}
            <AnimatePresence>
                {viewingGalleryIndex !== null && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingGalleryIndex(null)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full h-full sm:max-h-[90vh] max-w-6xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
                                <div className="text-white">
                                    <h3 className="text-lg font-bold">Hostel Gallery</h3>
                                    <p className="text-sm opacity-70">Image {viewingGalleryIndex + 1} of {hostelData.images.length}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setGalleryAutoPlay(!galleryAutoPlay)}
                                        className={`p-2 rounded-full transition-colors ${galleryAutoPlay ? 'bg-[#037166] text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                        title={galleryAutoPlay ? "Pause Slideshow" : "Play Slideshow"}
                                    >
                                        {galleryAutoPlay ? <Clock className="w-5 h-5 animate-pulse" /> : <TrendingUp className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => setViewingGalleryIndex(null)}
                                        className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Main Slider */}
                            <div className="flex-1 flex items-center justify-center relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingGalleryIndex(prev => (prev - 1 + hostelData.images.length) % hostelData.images.length);
                                    }}
                                    className="absolute left-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>

                                <motion.div
                                    key={viewingGalleryIndex}
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    className="w-full h-full flex items-center justify-center p-4 sm:p-12"
                                >
                                    <img
                                        src={hostelData.images[viewingGalleryIndex]}
                                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                                        alt=""
                                    />
                                </motion.div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingGalleryIndex(prev => (prev + 1) % hostelData.images.length);
                                    }}
                                    className="absolute right-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </div>

                            {/* Thumbnails */}
                            <div className="p-6 bg-black/20 backdrop-blur-sm overflow-x-auto flex gap-3 justify-center hide-scrollbar">
                                {hostelData.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setViewingGalleryIndex(idx)}
                                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all ${viewingGalleryIndex === idx ? 'ring-2 ring-[#037166] scale-110 shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AutoPlay Script Effect */}
            <AutoPlayHelper
                active={galleryAutoPlay && viewingGalleryIndex !== null}
                onNext={() => setViewingGalleryIndex(prev => (prev + 1) % hostelData.images.length)}
                interval={4000}
            />
        </div >
    );
}

// Internal component to handle interval cleanup easily
function AutoPlayHelper({ active, onNext, interval }) {
    useEffect(() => {
        if (!active) return;
        const timer = setInterval(onNext, interval);
        return () => clearInterval(timer);
    }, [active, onNext, interval]);
    return null;
}
