'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Star, MapPin, Clock, Heart, ChevronRight, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/spasalon/ui/tabs';
import { AddonsModal } from '@/components/spasalon/AddonsModal';


export function DetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [activeTab, setActiveTab] = useState('details');
    const [service, setService] = useState(null);
    const [selectedPackages, setSelectedPackages] = useState([]);
    const [showAddonsModal, setShowAddonsModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServiceDetails = async () => {
            if (!params?.id) return;
            setLoading(true);
            try {
                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/single-professional-provider', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        providerId: params.id
                    })
                });
                const data = await response.json();

                if (data.success && data.storeData && data.storeData.length > 0) {
                    const store = data.storeData[0];
                    const mappedService = {
                        id: store._id || params.id,
                        name: store.business_name || `${store.firstName} ${store.lastName}`,
                        provider: store.business_name || 'Professional Service',
                        image: store.logo ? `https://api.doorstephub.com/${store.logo}` : 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80',
                        rating: parseFloat(store.avgRating || 4.5).toFixed(1),
                        reviewCount: store.totalOrders || 0,
                        price: store.BasePrice || store.minFare || 999,
                        duration: '60 min',
                        distance: '2.5 km',
                        address: store.address || 'Address not available',
                        description: store.description || store.bio || 'Experience the ultimate relaxation with our premium services.',
                        includes: store.services ? store.services.split(',') : [
                            'Premium Service',
                            'Expert Staff',
                            'Hygienic Environment',
                            'Quality Products'
                        ],
                        packages: data.provider_rate_cards || [],
                        reviews: data.customerRatings ? data.customerRatings.map(r => ({
                            name: r.name || 'Anonymous',
                            rating: r.rating || 5,
                            comment: r.comment || 'Great service!',
                            avatar: '👤'
                        })) : []
                    };
                    setService(mappedService);

                    if (data.provider_rate_cards && data.provider_rate_cards.length > 0) {
                        setSelectedPackages([data.provider_rate_cards[0]]);
                    }
                }
            } catch (error) {
                console.error("Error fetching service details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServiceDetails();
    }, [params?.id]);

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

    if (loading || !service) return <div className="min-h-screen pt-20 flex justify-center items-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-32 pt-16">
            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.back()}
                className="fixed top-24 left-4 z-50 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors border border-gray-200"
            >
                <ArrowLeft className="w-5 h-5 text-gray-900" />
            </motion.button>

            {/* Hero Image */}
            <div className="relative h-[400px] overflow-hidden">
                <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-8"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                        {/* Left - Name & Provider */}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                {service.name}
                            </h1>
                            <p className="text-xl text-gray-600">{service.provider}</p>
                        </div>

                        {/* Right - Quick Stats */}
                        <div className="flex flex-wrap gap-4">
                            {/* Rating Card */}
                            <div className="bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 rounded-2xl p-4 border border-[#F59E0B]/20 min-w-[120px]">
                                <div className="flex items-center justify-center mb-1">
                                    <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B] mr-1" />
                                    <span className="text-2xl font-bold text-gray-900">{service.rating}</span>
                                </div>
                                <div className="text-xs text-gray-500 text-center">Rating</div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-2">
                            <TabsList className="bg-transparent w-full grid grid-cols-4 gap-2">
                                <TabsTrigger
                                    value="details"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#C06C84] data-[state=active]:to-[#6C5CE7] data-[state=active]:text-white text-gray-600 hover:text-gray-900 rounded-xl transition-colors"
                                >
                                    Details
                                </TabsTrigger>
                                <TabsTrigger
                                    value="services"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#C06C84] data-[state=active]:to-[#6C5CE7] data-[state=active]:text-white text-gray-600 hover:text-gray-900 rounded-xl transition-colors"
                                >
                                    Services
                                </TabsTrigger>
                                <TabsTrigger
                                    value="reviews"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#C06C84] data-[state=active]:to-[#6C5CE7] data-[state=active]:text-white text-gray-600 hover:text-gray-900 rounded-xl transition-colors"
                                >
                                    Reviews
                                </TabsTrigger>
                                <TabsTrigger
                                    value="about"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#C06C84] data-[state=active]:to-[#6C5CE7] data-[state=active]:text-white text-gray-600 hover:text-gray-900 rounded-xl transition-colors"
                                >
                                    About
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Details Tab */}
                        <TabsContent value="details">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                            >
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Service Description</h3>
                                <p className="text-gray-700 leading-relaxed text-lg mb-6">{service.description}</p>
                            </motion.div>
                        </TabsContent>

                        {/* Services / Portfolio Tab */}
                        <TabsContent value="services">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid gap-4"
                            >
                                {service.packages.map((pkg) => {
                                    const isSelected = selectedPackages.some(p => p._id === pkg._id);
                                    return (
                                        <div
                                            key={pkg._id}
                                            onClick={() => togglePackage(pkg)}
                                            className={`bg-white rounded-2xl p-4 shadow-sm border-2 cursor-pointer transition-all ${isSelected
                                                ? 'border-[#C06C84] bg-[#C06C84]/5'
                                                : 'border-gray-100 hover:border-[#C06C84]/30'
                                                }`}
                                        >
                                            <div className="flex gap-4">
                                                {/* Package Image */}
                                                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <img
                                                        src={pkg.image ? `https://api.doorstephub.com/${pkg.image}` : service.image}
                                                        alt={pkg.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Package Details */}
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-bold text-gray-900 line-clamp-1">{pkg.name}</h3>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                                            ? 'border-[#C06C84] bg-[#C06C84]'
                                                            : 'border-gray-300'
                                                            }`}>
                                                            {isSelected && (
                                                                <Check className="w-3 h-3 text-white" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1 mb-2">{pkg.description}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-lg text-gray-900">₹{pkg.price}</span>
                                                        <span className="text-xs text-gray-400 capitalize">{pkg.priceUnit}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </TabsContent>

                        {/* Reviews Tab */}
                        <TabsContent value="reviews">
                            <div className="space-y-4">
                                {service.reviews.map((review, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C06C84] to-[#6C5CE7] flex items-center justify-center text-2xl flex-shrink-0">
                                                {review.avatar}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{review.name}</h4>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < review.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* About Tab */}
                        <TabsContent value="about">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">About {service.provider}</h3>
                                    <p className="text-gray-700 leading-relaxed text-lg">
                                        {service.provider} is a premium wellness center offering top-quality spa and salon services.
                                        Our expert staff is dedicated to providing you with the best experience.
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-[#C06C84]/10 to-[#C06C84]/5 rounded-2xl p-8 border border-[#C06C84]/30">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-[#C06C84]" />
                                        Address
                                    </h3>
                                    <p className="text-gray-700 text-lg">{service.address}</p>
                                </div>
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>

            {/* Fixed Bottom CTA */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50"
            >
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
                    <button
                        onClick={() => {
                            if (selectedPackages.length === 0) {
                                if (service.packages && service.packages.length > 0) {
                                    setSelectedPackages([service.packages[0]]);
                                    setShowAddonsModal(true);
                                } else {
                                    console.warn("No packages found");
                                }
                                return;
                            }
                            setShowAddonsModal(true);
                        }}
                        className="w-full md:w-auto md:px-24 py-4 bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-[#C06C84]/40 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        Book Now
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            {/* Addons Modal */}
            <AddonsModal
                isOpen={showAddonsModal}
                onClose={() => setShowAddonsModal(false)}
                providerId={params.id}
                selectedPackageIds={selectedPackages.map(p => p._id)}
                onContinue={(selectedAddons) => {
                    setShowAddonsModal(false);
                    const packageIds = selectedPackages.map(p => p._id).join(',');
                    const addonIds = selectedAddons.map(a => a._id).join(',');
                    router.push(`/spa-salon/booking/address?providerId=${params.id}&packageId=${packageIds}&addons=${addonIds}`);
                }}
            />
        </div>
    );
}
