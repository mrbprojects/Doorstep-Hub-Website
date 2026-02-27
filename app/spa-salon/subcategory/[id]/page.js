'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Star, Clock, ChevronRight, ShieldCheck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocationContext } from '@/context/LocationContext';

function SpaSubCategoryContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const categoryName = searchParams.get('category') || 'Services';
    const subCategoryName = searchParams.get('name') || 'Service List';
    const categoryId = searchParams.get('categoryId') || null;

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
                // Mock Support
                if (params.id.startsWith('mock_')) {
                    setServices([
                        { _id: 'mock_svc_1', serviceName: 'Luxury Haircut & Wash', price: 899, duration: '45 mins', rating: 4.8, image: '' },
                        { _id: 'mock_svc_2', serviceName: 'Classic Haircut', price: 499, duration: '30 mins', rating: 4.5, image: '' },
                        { _id: 'mock_svc_3', serviceName: 'Beard Grooming', price: 299, duration: '20 mins', rating: 4.7, image: '' },
                    ]);
                    setLoading(false);
                    return;
                }

                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/professional-services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subCategoryId: params.id })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && Array.isArray(data.professionalServices)) {
                        setServices(data.professionalServices);
                    }
                }
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [params.id]);

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            {/* Back + Title */}
            <div className="container mx-auto px-4 pb-6 flex items-center space-x-4">
                <button
                    onClick={() => {
                        if (categoryId) {
                            router.push(`/spa-salon/category/${categoryId}?name=${encodeURIComponent(categoryName)}`);
                        } else {
                            router.back();
                        }
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors flex-shrink-0"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-700" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{subCategoryName}</h1>
                    <p className="text-sm text-gray-500">{categoryName}</p>
                </div>
            </div>

            {/* Service List */}
            <div className="container mx-auto px-4 pb-12">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.length > 0 ? (
                            services.map((service, index) => (
                                <motion.div
                                    key={service._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => router.push(`/spa-salon/service/${service._id}?subcategoryId=${params.id}&subCategoryName=${encodeURIComponent(subCategoryName)}&categoryName=${encodeURIComponent(categoryName)}`)}
                                    className="group cursor-pointer"
                                >
                                    <div className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl hover:shadow-[#C06C84]/10 transition-all border border-gray-100 h-full flex flex-col">
                                        <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-gray-100">
                                            {service.logo ? (
                                                <img
                                                    src={`https://api.doorstephub.com/${service.logo}`}
                                                    alt={service.business_name || service.serviceName}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-[#C06C84]/5 flex items-center justify-center">
                                                    <Heart className="w-12 h-12 text-[#C06C84]/20" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-green-700 flex items-center gap-1 shadow-sm">
                                                <ShieldCheck className="w-3 h-3" />
                                                Verified
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#C06C84] transition-colors line-clamp-2">
                                                    {service.business_name || service.serviceName || `${service.firstName || ''} ${service.lastName || ''}`.trim()}
                                                </h3>
                                                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                                                    <span className="text-xs font-bold text-amber-700">{service.rating || '4.8'}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center text-gray-500 text-sm mb-2 space-x-4">
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1 text-[#C06C84]" />
                                                    {service.duration || '45 mins'}
                                                </div>
                                            </div>
                                            {service.address && (
                                                <p className="text-xs text-gray-400 line-clamp-1 mb-2">{service.address}</p>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500">Starts at</p>
                                                <p className="text-xl font-bold text-gray-900">₹{service.startingAt || service.minFare || service.price || '499'}</p>
                                            </div>
                                            <Button className="bg-[#C06C84] hover:bg-[#A0556C] text-white rounded-xl px-6">
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                No services found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SpaSubCategoryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
            <SpaSubCategoryContent />
        </Suspense>
    );
}
