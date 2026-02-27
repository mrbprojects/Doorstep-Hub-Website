'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, Star, TrendingUp, DollarSign, Wifi, Utensils, Shirt, Zap,
    Car, Shield, Camera, MessageSquare, Sparkles, MapPin, Clock, Check, X,
    Calendar, Flower2, Loader2, CheckCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/pghostels/ui/tabs'; // Reuse UI components if available, otherwise generic
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { AddonsModal } from '@/components/religious/AddonsModal';

const amenityIcons = {
    Wifi: Wifi,
    Food: Utensils,
    Laundry: Shirt,
    PowerBackup: Zap,
    Parking: Car,
    Security: Shield,
    AC: Sparkles,
    CCTV: Camera,
    "Pooja Items": Flower2,
    "Prasad": Utensils,
    "Dakshina": DollarSign,
};

export default function ReligiousServiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const searchParams = useSearchParams();
    const subcategoryId = searchParams.get('subcategoryId');
    const subCategoryName = searchParams.get('subCategoryName');
    const categoryName = searchParams.get('categoryName');
    const [activeTab, setActiveTab] = useState('portfolio');
    const { scrollY } = useScroll();
    const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

    const [serviceData, setServiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showAddonsModal, setShowAddonsModal] = useState(false);

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
        const fetchServiceData = async () => {
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

                    // Map API Data to UI Model (Religious Context)
                    const mappedData = {
                        id: id,
                        name: store.business_name || `${store.firstName} ${store.lastName}`,
                        location: store.address || 'Location available on request',
                        address: store.address || 'Address provided upon booking',
                        rating: parseFloat(store.avgRating || 4.8).toFixed(1),
                        orders: store.totalOrders || 120,
                        basePrice: store.startingAt || 1100,
                        monthlyPrice: store.startingAt || 1100,
                        logo: store.logo ? `https://api.doorstephub.com/${store.logo}` : 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&q=80',
                        images: data.serviceImages && data.serviceImages.length > 0
                            ? data.serviceImages.map(img => `https://api.doorstephub.com${img}`)
                            : [
                                'https://images.unsplash.com/photo-1582344795368-b3d9016c68cb?auto=format&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1609139003551-ee404a3b090b?auto=format&fit=crop&q=80'
                            ],

                        amenities: [
                            ...(Array.isArray(data.amenities) ? data.amenities : []),
                            ...(data.otherAmenities ? data.otherAmenities.split(',').map(a => a.trim()) : ['Pooja Items', 'Prasad'])
                        ].map(amenity => ({
                            icon: amenityIcons[amenity] || Flower2,
                            label: amenity,
                            available: true
                        })),

                        reviews: data.customerRatings ? data.customerRatings.map(review => ({
                            name: review.name || 'Devotee',
                            avatar: review.image || '🙏',
                            rating: review.rating,
                            date: review.date ? new Date(review.date).toLocaleDateString() : 'Recently',
                            comment: review.comment || 'Blessed experience.'
                        })) : [],

                        packages: data.provider_rate_cards || [],
                        about: data.aboutUs || store.bio || 'Expert Vedic Priests and religious service providers ensuring divine experiences.',
                        rules: [
                            { rule: 'Traditional attire requested', allowed: true },
                            { rule: 'Materials provided by priest', allowed: true },
                        ]
                    };

                    setServiceData(mappedData);
                    if (mappedData.packages.length > 0) {
                        setSelectedPackage(mappedData.packages[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching service data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServiceData();
    }, [id]);

    const handleContinueToBook = () => {
        if (!selectedPackage) {
            alert("Please select a service package from the Portfolio tab.");
            setActiveTab('portfolio');
            window.scrollTo({ top: 500, behavior: 'smooth' });
            return;
        }
        setShowAddonsModal(true);
    };

    const handleAddonsContinue = (selectedAddons) => {
        setShowAddonsModal(false);
        const addonIds = selectedAddons.map(a => a._id).join(',');
        router.push(`/religious-services/booking/address?providerId=${id}&packageId=${selectedPackage._id}&addons=${addonIds}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--off-white)]">
                <Loader2 className="w-12 h-12 text-[var(--saffron)] animate-spin" />
            </div>
        );
    }

    if (!serviceData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--off-white)]">
                <p className="text-gray-500 text-lg">Service details not found. 🙏</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--off-white)] pb-32">
            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => {
                    if (subcategoryId) {
                        router.push(`/religious-services/subcategory/${subcategoryId}?category=${encodeURIComponent(categoryName)}&name=${encodeURIComponent(subCategoryName)}`);
                    } else {
                        router.back();
                    }
                }}
                className="fixed top-24 left-4 z-50 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors border border-gray-200"
            >
                <ArrowLeft className="w-5 h-5 text-[var(--deep-charcoal)]" />
            </motion.button>

            {/* Slider */}
            <motion.div
                style={{ opacity: headerOpacity }}
                className="relative h-[500px] overflow-hidden"
            >
                <Slider {...sliderSettings}>
                    {serviceData.images.map((image, index) => (
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

            {/* Header Info */}
            <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-8"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[var(--saffron)] flex-shrink-0">
                                <img
                                    src={serviceData.logo}
                                    alt={serviceData.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)] mb-2">
                                    {serviceData.name}
                                </h1>
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="w-4 h-4 mr-1 text-[var(--saffron)]" />
                                    <span>{serviceData.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="bg-[var(--saffron)]/10 rounded-2xl p-4 border border-[var(--saffron)]/20 min-w-[120px]">
                                <div className="flex items-center justify-center mb-1">
                                    <Star className="w-5 h-5 fill-[var(--saffron)] text-[var(--saffron)] mr-1" />
                                    <span className="text-2xl font-bold text-[var(--deep-charcoal)]">{serviceData.rating}</span>
                                </div>
                                <div className="text-xs text-gray-500 text-center">Rating</div>
                            </div>

                            <div className="bg-[var(--temple-red)]/5 rounded-2xl p-4 border border-[var(--temple-red)]/20 min-w-[120px]">
                                <div className="flex items-center justify-center mb-1">
                                    <DollarSign className="w-5 h-5 text-[var(--temple-red)] mr-1" />
                                    <span className="text-2xl font-bold text-[var(--deep-charcoal)]">₹{serviceData.basePrice}</span>
                                </div>
                                <div className="text-xs text-gray-500 text-center">Starts From</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 mt-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="sticky top-20 z-40 bg-[var(--off-white)]/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-2">
                        <TabsList className="bg-transparent w-full grid grid-cols-4 gap-2">
                            <TabsTrigger
                                value="portfolio"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--saffron)] data-[state=active]:to-[var(--temple-red)] data-[state=active]:text-white rounded-xl"
                            >
                                <Flower2 className="w-4 h-4 mr-2" />
                                Services
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--saffron)] data-[state=active]:to-[var(--temple-red)] data-[state=active]:text-white rounded-xl"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Reviews
                            </TabsTrigger>
                            <TabsTrigger
                                value="amenities"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--saffron)] data-[state=active]:to-[var(--temple-red)] data-[state=active]:text-white rounded-xl"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Amenities
                            </TabsTrigger>
                            <TabsTrigger
                                value="about"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--saffron)] data-[state=active]:to-[var(--temple-red)] data-[state=active]:text-white rounded-xl"
                            >
                                <MapPin className="w-4 h-4 mr-2" />
                                About
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="portfolio" className="space-y-4">
                        <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[var(--saffron)]" />
                            Please select a sacred offering to proceed:
                        </div>
                        {serviceData.packages.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {serviceData.packages.map((pkg, index) => (
                                    <div
                                        key={pkg._id || index}
                                        onClick={() => setSelectedPackage(pkg)}
                                        className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer relative ${selectedPackage?._id === pkg._id
                                            ? 'border-2 border-[var(--saffron)] ring-2 ring-[var(--saffron)]/10'
                                            : 'border-gray-100'
                                            }`}
                                    >
                                        {selectedPackage?._id === pkg._id && (
                                            <div className="absolute top-3 right-3 z-10 bg-[var(--saffron)] text-white p-1 rounded-full shadow-lg">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                        <div className="h-48 bg-gray-100 relative">
                                            {pkg.image ? (
                                                <img src={`https://api.doorstephub.com/${pkg.image}`} alt={pkg.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                                                    <Flower2 className="w-12 h-12 opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-[var(--deep-charcoal)] mb-1">{pkg.name}</h3>
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{pkg.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[var(--saffron)] font-bold text-lg">₹{pkg.price}</span>
                                                <span className="text-xs text-gray-500">{pkg.priceUnit}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">No services available.</div>
                        )}
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-4">
                        {serviceData.reviews.length > 0 ? (
                            serviceData.reviews.map((review, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-[var(--saffron)] text-white flex items-center justify-center text-xl">
                                            {review.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--deep-charcoal)]">{review.name}</h4>
                                            <div className="flex text-[var(--saffron)] text-sm mb-2">
                                                {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />)}
                                            </div>
                                            <p className="text-gray-600 text-sm">{review.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : <div className="text-center py-10 text-gray-400">No reviews yet.</div>}
                    </TabsContent>

                    <TabsContent value="amenities">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {serviceData.amenities.map((amenity, i) => {
                                const Icon = amenity.icon;
                                return (
                                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--saffron)]/10 flex items-center justify-center text-[var(--saffron)]">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-[var(--deep-charcoal)]">{amenity.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="about">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-[var(--deep-charcoal)] mb-2">About Service</h3>
                                <p className="text-gray-600 leading-relaxed">{serviceData.about}</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[var(--deep-charcoal)] mb-2">Prerequisites</h3>
                                <ul className="space-y-2">
                                    {serviceData.rules.map((rule, i) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-[var(--saffron)]" />
                                            {rule.rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Bottom CTA */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50"
            >
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Total Quote</div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-3xl font-bold text-[var(--deep-charcoal)]">
                                {selectedPackage
                                    ? `₹${selectedPackage.price.toLocaleString()}`
                                    : `₹${serviceData.basePrice.toLocaleString()}`}
                            </span>
                            <span className="text-sm text-gray-500">
                                {selectedPackage ? `/${selectedPackage.priceUnit}` : '/service'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleContinueToBook}
                        className="px-12 py-4 bg-gradient-to-r from-[var(--saffron)] to-[var(--temple-red)] text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-[var(--saffron)]/40 transition-all transform hover:scale-105"
                    >
                        Book Now
                    </button>
                </div>
            </motion.div>

            <AddonsModal
                isOpen={showAddonsModal}
                onClose={() => setShowAddonsModal(false)}
                providerId={id}
                selectedPackageId={selectedPackage?._id}
                onContinue={handleAddonsContinue}
            />
        </div>
    );
}
