'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, Star, DollarSign, Sparkles, MapPin, Check,
    Loader2, Flower, Scissors, ShieldCheck, Heart, Clock
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/pghostels/ui/tabs'; // Reusing tabs
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { AddonsModal } from '@/components/spasalon/AddonsModal';
import { useServiceCart } from '@/context/ServiceCartContext';

const amenityIcons = {
    Wifi: Sparkles,
    AC: Sparkles,
    Music: Heart,
    "Essential Oils": Flower,
    "Premium Products": ShieldCheck,
    "Towels": Check,
    "Shower": Sparkles,
};

export default function SpaServiceDetailPage() {
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
    const [selectedPackages, setSelectedPackages] = useState([]);
    const [showAddonsModal, setShowAddonsModal] = useState(false);
    const { cartItems, clearCart } = useServiceCart();

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
        if (!loading && !serviceData) {
            router.replace('/book-appointment');
        }
    }, [loading, serviceData, router]);

    useEffect(() => {
        const fetchServiceData = async () => {
            if (!id) return;

            setLoading(true);
            try {
                // Mock Support
                if (id.startsWith('mock_')) {
                    const mockData = {
                        id: id,
                        name: 'Luxe Spa Experience',
                        location: 'Home Service',
                        rating: 4.9,
                        basePrice: 999,
                        logo: '',
                        images: [''],
                        amenities: [{ icon: Flower, label: 'Aromatherapy', available: true }],
                        reviews: [],
                        packages: [
                            { _id: 'mock_pkg_1', name: 'Standard Glow', description: 'Clean up and mask', price: 999, priceUnit: 'session', image: '' },
                            { _id: 'mock_pkg_2', name: 'Premium Radiance', description: 'Full facial + massage', price: 1499, priceUnit: 'session', image: '' }
                        ],
                        about: 'Experience the best spa service at home.',
                        rules: [{ rule: 'Please provide water', allowed: true }]
                    };
                    setServiceData(mockData);
                    setSelectedPackages([mockData.packages[0]]);
                    setLoading(false);
                    return;
                }

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

                    const mappedData = {
                        id: id,
                        name: store.business_name || `${store.firstName} ${store.lastName}`,
                        location: store.address || 'Location available on request',
                        rating: parseFloat(store.avgRating || 4.8).toFixed(1),
                        basePrice: store.BasePrice || 500,
                        logo: store.logo ? (store.logo.startsWith('http') ? store.logo : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${store.logo}`) : '',
                        images: (() => {
                            // Strictly use the "image" key from the backend as the primary banner
                            const baseUrl = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/`;
                            const toUrl = (p) => p ? (p.startsWith('http') ? p : `${baseUrl}${p}`) : null;

                            const bannerImg = toUrl(store.image);      // primary from "image" key
                            const logoImg   = toUrl(store.logo);       // fallback
                            const extras    = (data.serviceImages || []).map(toUrl).filter(Boolean);

                            const primary = bannerImg || logoImg;
                            const deduped = primary
                                ? [primary, ...extras.filter(u => u !== primary)]
                                : extras;

                            return deduped.length > 0
                                ? deduped
                                : ['https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800'];
                        })(),

                        amenities: [
                            ...(Array.isArray(data.amenities) ? data.amenities : []),
                            ...(data.otherAmenities ? data.otherAmenities.split(',').map(a => a.trim()) : ['Sanitized Tools', 'Disposable Hygiene Kit'])
                        ].map(amenity => {
                            const label = typeof amenity === 'object' ? (amenity.title || 'Amenity') : amenity;
                            return { icon: amenityIcons[label] || Sparkles, label, available: true };
                        }),

                        reviews: data.customerRatings ? data.customerRatings.map(review => ({
                            name: review.name || 'Client',
                            avatar: review.image || '👤',
                            rating: review.rating,
                            date: review.date ? new Date(review.date).toLocaleDateString() : 'Recently',
                            comment: review.comment || 'Great service.'
                        })) : [],

                        packages: data.provider_rate_cards || [],
                        about: data.aboutUs || store.bio || 'Professional spa and salon services at your doorstep.',
                        rules: [
                            { rule: 'Be ready 10 mins prior', allowed: true },
                            { rule: 'Keep pets away', allowed: true },
                        ]
                    };

                    setServiceData(mappedData);
                    if (mappedData.packages.length > 0) {
                        setSelectedPackages([mappedData.packages[0]]);
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

    const togglePackage = (pkg) => {
        setSelectedPackages(prev => {
            const isSelected = prev.some(p => p._id === pkg._id);
            if (isSelected) {
                return prev.filter(p => p._id !== pkg._id);
            } else {
                return [...prev, pkg];
            }
        });
    };

    const totalPrice = selectedPackages.reduce((sum, pkg) => sum + (parseFloat(pkg.price) || 0), 0);

    const handleContinueToBook = async () => {
        if (selectedPackages.length === 0) {
            alert('Please select at least one service.');
            setActiveTab('portfolio');
            return;
        }

        // ── Provider conflict check ──
        const existingProviderId = cartItems.length > 0 ? cartItems[0].providerId : null;
        if (existingProviderId && existingProviderId !== id) {
            const confirmed = window.confirm(
                `Your cart already has services from a different professional.\n\nDo you want to clear your existing cart and book with this professional instead?`
            );
            if (!confirmed) return;
            await clearCart(true); // clear old provider's cart silently
        }

        setShowAddonsModal(true);
    };

    const handleAddonsContinue = (selectedAddons) => {
        setShowAddonsModal(false);
        const addonIds = selectedAddons.map(a => a._id).join(',');
        const packageIds = selectedPackages.map(p => p._id).join(',');
        router.push(`/spa-salon/booking/address?providerId=${id}&packageId=${packageIds}&addons=${addonIds}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-32">
                {/* Banner shimmer */}
                <div className="h-[420px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                {/* Header card shimmer */}
                <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
                    <div className="bg-white/95 rounded-3xl shadow-2xl border border-gray-200 p-8 animate-pulse">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-gray-200" />
                            <div className="space-y-3 flex-1">
                                <div className="h-8 bg-gray-200 rounded-lg w-1/2" />
                                <div className="h-5 bg-gray-100 rounded-lg w-1/3" />
                            </div>
                            <div className="h-16 w-28 bg-gray-200 rounded-2xl" />
                        </div>
                        <div className="h-12 bg-gray-100 rounded-2xl mb-8" />
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-gray-100 rounded-2xl overflow-hidden">
                                    <div className="h-48 bg-gray-200" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                                        <div className="h-4 bg-gray-100 rounded w-full" />
                                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!serviceData) {
        return <div className="min-h-screen bg-gray-50" />;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Back Button — sits just below the fixed site header */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => {
                    if (subcategoryId) {
                        router.push(`/spa-salon/subcategory/${subcategoryId}?category=${encodeURIComponent(categoryName)}&name=${encodeURIComponent(subCategoryName)}`);
                    } else {
                        router.back();
                    }
                }}
                className="fixed top-20 mt-5 left-4 z-50 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors border border-gray-200"
            >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
            </motion.button>

            {/* Banner Image Slider */}
            <motion.div
                style={{ opacity: headerOpacity }}
                className="relative h-[420px] overflow-hidden bg-gray-900"
            >
                <Slider {...sliderSettings} className="h-full">
                    {serviceData.images.map((img, idx) => (
                        <div key={idx} className="relative h-[420px]">
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${img})`,
                                    height: "420px",
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            </div>
                        </div>
                    ))}
                </Slider>
            </motion.div>

            {/* Header Info */}
            <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-5 md:p-8"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-[#C06C84] flex-shrink-0">
                                {serviceData.logo ? (
                                    <img src={serviceData.logo} alt={serviceData.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-pink-50 flex items-center justify-center"><Scissors className="w-8 h-8 text-[#C06C84]" /></div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl md:text-4xl font-bold text-gray-900 mb-1 leading-tight">
                                    {serviceData.name}
                                </h1>
                                <div className="flex items-start text-gray-600 text-sm md:text-base">
                                    <MapPin className="w-4 h-4 mr-2 text-[#C06C84] mt-1 shrink-0" />
                                    <span className="leading-relaxed">{serviceData.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 w-full md:w-auto">
                            <div className="bg-[#6D1357]/10 rounded-2xl p-3 md:p-4 border border-[#6D1357]/20 min-w-[100px] md:min-w-[120px] flex flex-col items-center">
                                <div className="flex items-center justify-center mb-0.5">
                                    <Star className="w-4 h-4 md:w-5 md:h-5 fill-[#6D1357] text-[#6D1357] mr-1" />
                                    <span className="text-xl md:text-2xl font-bold text-gray-900">{serviceData.rating}</span>
                                </div>
                                <div className="text-[10px] md:text-xs text-gray-500 text-center uppercase font-semibold">Rating</div>
                            </div>
                            {/* <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 min-w-[120px]">
                                <div className="flex items-center justify-center mb-1">
                                    <DollarSign className="w-5 h-5 text-purple-600 mr-1" />
                                    <span className="text-2xl font-bold text-gray-900">₹{serviceData.basePrice}</span>
                                </div>
                                <div className="text-xs text-gray-500 text-center">Starts From</div>
                            </div> */}
                        </div>
                    </div>
                </motion.div>
            </div >

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 mt-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="sticky top-[72px] z-40 bg-gray-50/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-1.5 md:p-2 overflow-hidden">
                        <TabsList className="bg-transparent w-full flex overflow-x-auto hide-scrollbar gap-1 md:gap-2 no-scrollbar justify-start md:justify-around">
                            {['Services', 'Reviews', 'Amenities', 'About'].map((tab) => (
                                <TabsTrigger
                                    key={tab.toLowerCase()}
                                    value={tab === 'Services' ? 'portfolio' : tab.toLowerCase()}
                                    className="text-gray-900 font-semibold px-4 md:px-8 py-2 md:py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6D1357] data-[state=active]:to-[#6D1357] data-[state=active]:text-white rounded-xl transition-all text-xs md:text-sm whitespace-nowrap"
                                >
                                    {tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <TabsContent value="portfolio" className="space-y-4 outline-none">
                        {serviceData.packages.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {serviceData.packages.map((pkg, index) => (
                                    <div
                                        key={pkg._id || index}
                                        onClick={() => togglePackage(pkg)}
                                        className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer relative ${selectedPackages.some(p => p._id === pkg._id)
                                            ? 'border-2 border-[#C06C84] ring-2 ring-[#C06C84]/10'
                                            : 'border-gray-100'
                                            }`}
                                    >
                                        {selectedPackages.some(p => p._id === pkg._id) && (
                                            <div className="absolute top-3 right-3 z-10 bg-[#C06C84] text-white p-1 rounded-full shadow-lg">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                        <div className="h-48 bg-gray-100 relative">
                                            {pkg.image ? (
                                                <img src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${pkg.image[0]}`} alt={pkg.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                                                    <Scissors className="w-12 h-12 opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 mb-1">{pkg.name}</h3>
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{pkg.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[#C06C84] font-bold text-lg">₹{pkg.price}</span>
                                                <span className="text-xs text-gray-500">{pkg.priceUnit}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">No packages available.</div>
                        )}
                    </TabsContent>

                    <TabsContent value="reviews" className="outline-none">
                        <div className="space-y-4">
                            {serviceData.reviews.length > 0 ? (
                                serviceData.reviews.map((r, i) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">{r.avatar || '👤'}</div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
                                    <p className="text-gray-500">No reviews yet for this service.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="amenities" className="outline-none">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {serviceData.amenities.map((a, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex items-start gap-3 shadow-sm">
                                    <div className="w-8 h-8 rounded-lg bg-[#C06C84]/10 flex items-center justify-center shrink-0">
                                        <a.icon className="w-4 h-4 text-[#C06C84]" />
                                    </div>
                                    <span className='text-gray-700 font-medium text-sm leading-tight pt-1'>{a.label}</span>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="about" className="outline-none">
                        <div className="bg-white p-5 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#C06C84]" />
                                About this Service
                            </h3>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                                {serviceData.about}
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div >

            {/* Bottom CTA */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50"
            >
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <div>
                        <div className="text-[10px] md:text-xs text-gray-500 mb-1 font-medium">
                            {selectedPackages.length > 0 ? `${selectedPackages.length} service(s) selected` : 'No service selected'}
                        </div>
                        <div className="flex items-baseline space-x-1.5">
                            <span className="text-2xl md:text-3xl font-bold text-gray-900">
                                ₹{totalPrice > 0 ? totalPrice.toLocaleString() : serviceData.basePrice.toLocaleString()}
                            </span>
                            <span className="text-[10px] md:text-sm text-gray-500 font-medium">/total</span>
                        </div>
                    </div>
                    <button
                        onClick={handleContinueToBook}
                        className="px-8 md:px-12 py-3.5 md:py-4 bg-[#6D1357] text-white rounded-2xl font-bold text-base md:text-lg hover:shadow-xl hover:shadow-[#1A0515]/40 transition-all transform hover:scale-105"
                    >
                        Book Now
                    </button>
                </div>
            </motion.div >

            <AddonsModal
                isOpen={showAddonsModal}
                onClose={() => setShowAddonsModal(false)}
                providerId={id}
                selectedPackageIds={selectedPackages.map(p => p._id)}
                onContinue={handleAddonsContinue}
            />
        </div >
    );
}
