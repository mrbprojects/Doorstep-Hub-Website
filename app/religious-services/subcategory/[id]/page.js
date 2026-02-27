'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Star, MapPin, Sparkles, Filter, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocationContext } from '@/context/LocationContext';

function SubCategoryServicesContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const categoryName = searchParams.get('category') || 'Services';
    const subCategoryName = searchParams.get('name') || 'Available Services';

    const { location, detectWithIP } = useLocationContext();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!location) {
            detectWithIP().catch(err => console.log("Auto detect failed", err));
        }
    }, [location]);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const userLocationData = localStorage.getItem('user_location_data');
                const locationData = userLocationData ? JSON.parse(userLocationData) : null;
                const lat = locationData?.lat || 17.3850;
                const lng = locationData?.lng || 78.4867;

                // Providing `subcategoryId` to the API
                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/professional-services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lattitude: lat,
                        longitude: lng,
                        subcategoryId: params.id,
                    })
                });
                const data = await response.json();

                if (data.success && data.professionalServices) {
                    setServices(data.professionalServices);
                }
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [location, params.id]);

    return (
        <div className="min-h-screen bg-[var(--off-white)] pt-24 pb-10">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="mb-4 text-gray-500 hover:text-[var(--saffron)] pl-0"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Categories
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="text-sm text-[var(--saffron)] font-medium mb-1 uppercase tracking-wider">{categoryName}</div>
                            <h1 className="text-3xl md:text-4xl font-bold text-[var(--deep-charcoal)]">{subCategoryName}</h1>
                            <p className="text-gray-500 mt-2">Verified priests and services for {subCategoryName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-[var(--saffron)]/20 text-[var(--deep-charcoal)] bg-white">
                                {services.length} Services
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-[var(--saffron)]">
                            <Sparkles className="w-10 h-10 animate-spin mb-4" />
                            <p>Finding Divine Services...</p>
                        </div>
                    ) : services.length > 0 ? (
                        services.map((service, i) => (
                            <motion.div
                                key={service._id || i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card
                                    className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-[var(--saffron)]/30 h-full"
                                    onClick={() => router.push(`/religious-services/service/${service._id}?subcategoryId=${params.id}&subCategoryName=${encodeURIComponent(subCategoryName)}&categoryName=${encodeURIComponent(categoryName)}`)}
                                >
                                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[var(--warm-beige)] to-[var(--soft-cream)]">
                                        <img
                                            src={service.logo ? `https://api.doorstephub.com/${service.logo}` : 'https://images.unsplash.com/photo-1762090420353-47d4a0b3f6af?auto=format&fit=crop&q=80'}
                                            alt={service.business_name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
                                            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg text-sm">
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                {service.avgRating || 4.8}
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-[var(--deep-charcoal)] mb-1 group-hover:text-[var(--saffron)] transition-colors">
                                                {service.business_name || `${service.firstName} ${service.lastName}`}
                                            </h3>
                                            <div className="flex items-center text-sm text-gray-500 gap-2 mb-2">
                                                <MapPin className="h-3 w-3" />
                                                {service.address ? service.address.substring(0, 30) + '...' : 'Available at Doorstep'}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                                                {service.description || service.bio || 'Expert Vedic Priests and religious service providers ensuring divine experiences.'}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400">Starts from</span>
                                                <span className="text-xl font-bold text-[var(--saffron)]">₹{(service.BasePrice || service.minFare || 1100).toLocaleString()}</span>
                                            </div>
                                            <Button className="bg-[var(--saffron)] hover:bg-[var(--temple-red)] text-white shadow-lg hover:shadow-[var(--saffron)]/30">
                                                Book Now
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="mb-4 text-4xl">🙏</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Services Found</h3>
                            <p className="text-gray-500">We couldn't find any services for this sub-category nearby.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SubCategoryServicesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">Loading...</div>}>
            <SubCategoryServicesContent />
        </Suspense>
    );
}
