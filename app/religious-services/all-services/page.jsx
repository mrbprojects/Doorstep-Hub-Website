'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
    ArrowLeft, Star, MapPin, Sparkles,
    Search, SlidersHorizontal, ArrowRight,
    CheckCircle, Shield, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLocationContext } from '@/context/LocationContext';

function AllReligiousServicesContent() {
    const router = useRouter();
    const { location, detectLocation } = useLocationContext();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const RELIGIOUS_SERVICE_SLUG = 'rituals-and-religious-services';
    const RELIGIOUS_SERVICE_ID = '695250aa57bb211ca094e5fd';

    useEffect(() => {
        const fetchAllServices = async () => {
            setLoading(true);
            try {
                // Fallback to a default location if not detected yet
                const lat = location?.lat || 17.3850;
                const lng = location?.lng || 78.4867;

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/professional-services`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lattitude: lat,
                        longitude: lng,
                        serviceId: RELIGIOUS_SERVICE_ID
                    })
                });
                const data = await response.json();
                if (data.success && data.professionalServices) {
                    setServices(data.professionalServices);
                }
            } catch (error) {
                console.error('Error fetching all religious services:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllServices();
    }, [location]);

    const filteredServices = services.filter(service =>
        (service.business_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.lastName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[var(--off-white)] pt-28 pb-20">
            <div className="container mx-auto px-4">

                {/* Header Section */}
                <div className="mb-12">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-6 -ml-2 text-[var(--muted-foreground)] hover:text-[var(--saffron)] transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Overview
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-1 w-8 bg-[var(--saffron)] rounded-full"></div>
                                <span className="text-sm font-bold text-[var(--saffron)] uppercase tracking-wider">Divine Directory</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--deep-charcoal)] mb-4">
                                All Religious & <span className="text-[var(--saffron)]">Spiritual Services</span>
                            </h1>
                            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl">
                                Explore our complete library of verified Vedic priests, astrologers, and spiritual experts available in your city.
                            </p>
                        </div>

                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 min-w-[300px]">
                            <div className="pl-3 text-[var(--saffron)]">
                                <Search className="h-5 w-5" />
                            </div>
                            <Input
                                placeholder="Search services or priests..."
                                className="border-none focus-visible:ring-0 text-base"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats & Filters Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 py-4 border-y border-gray-200/60 mt-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-[var(--deep-charcoal)]">{filteredServices.length}</span>
                            <span className="text-sm text-[var(--muted-foreground)] font-medium">Verified Results</span>
                        </div>
                        <div className="h-4 w-[1px] bg-gray-300 hidden sm:block"></div>
                        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                            <MapPin className="h-4 w-4 text-[var(--saffron)]" />
                            <span>{location ? 'Showing results near you' : 'Showing all services'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-[var(--soft-cream)] text-[var(--saffron)] border-[var(--saffron)]/10 px-3 py-1">
                            <Shield className="h-3 w-3 mr-1" /> Verified Experts
                        </Badge>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        // Loading State
                        [...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-4">
                                <div className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
                            </div>
                        ))
                    ) : filteredServices.length > 0 ? (
                        filteredServices.map((service, i) => (
                            <motion.div
                                key={service._id || i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: (i % 8) * 0.05 }}
                            >
                                <Card
                                    className="overflow-hidden hover:shadow-2xl transition-all duration-500 group cursor-pointer h-full border-none shadow-sm ring-1 ring-gray-100 hover:ring-[var(--saffron)]/30"
                                    onClick={() => {
                                        const target = service.slug || service._id;
                                        router.push(`/religious-services/${target}`);
                                    }}
                                >
                                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[var(--warm-beige)] to-[var(--soft-cream)]">
                                        <img loading="lazy" decoding="async"
                                            src={service.logo ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.logo}` : 'https://images.unsplash.com/photo-1762090420353-47d4a0b3f6af?auto=format&fit=crop&q=80'}
                                            alt={service.business_name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                                        <div className="absolute bottom-3 right-3">
                                            <Badge className="bg-white/90 backdrop-blur-sm text-[var(--saffron)] border-none shadow-sm px-2 py-0.5 text-xs font-bold">
                                                NEW
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--sacred-teal)]/10 text-[var(--sacred-teal)] rounded-full border border-[var(--sacred-teal)]/5 w-fit">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--sacred-teal)] animate-pulse"></div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
                                                </div>
                                                {/* <span className="text-[9px] font-bold text-green-600 flex items-center gap-1 uppercase tracking-tighter">
                                                    <CheckCircle className="h-2.5 w-2.5" /> Cash on Service Delivery
                                                </span> */}
                                            </div>
                                            <div className="flex items-center text-sm font-bold text-[var(--deep-charcoal)]">
                                                <Star className="h-3.5 w-3.5 fill-[var(--warm-gold)] text-[var(--warm-gold)] mr-1" />
                                                {service.avgRating || 4.8}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-[var(--deep-charcoal)] mb-2 group-hover:text-[var(--saffron)] transition-colors line-clamp-1">
                                            {service.business_name || `${service.firstName} ${service.lastName}`}
                                        </h3>

                                        <p className="text-sm text-[var(--muted-foreground)] mb-6 line-clamp-2 h-10 leading-relaxed font-medium">
                                            {service.description || service.bio || 'Expert religious and spiritual services conducted with Vedic authenticity.'}
                                        </p>

                                        <div className="flex items-end justify-between pt-4 border-t border-gray-100/80">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mb-0.5 text-left">Starting Rituals From</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-extrabold text-[var(--saffron)] tracking-tight">₹{(service.startingAt || service.BasePrice || service.minFare || 1000).toLocaleString()}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">incl. taxes</span>
                                                </div>
                                            </div>
                                            <Button size="sm" className="bg-[var(--saffron)] hover:bg-[var(--temple-red)] text-white h-10 px-6 font-bold rounded-xl shadow-lg shadow-[var(--saffron)]/20 active:scale-95 transition-all">
                                                Book
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        // No Results State
                        <div className="col-span-full py-32 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[var(--soft-cream)] mb-6">
                                <Sparkles className="h-10 w-10 text-[var(--saffron)] opacity-30" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-[var(--deep-charcoal)] mb-3 px-6">No Sacred Services Found</h3>
                            <p className="text-[var(--muted-foreground)] max-w-md mx-auto mb-10 px-6">
                                We couldn't find any services matching your search or in this location. Please try a different query or set your location.
                            </p>
                            <Button
                                onClick={() => detectLocation()}
                                className="bg-[var(--saffron)] text-white px-10 py-6 rounded-2xl font-bold shadow-xl shadow-[var(--saffron)]/10"
                            >
                                Set Your Location
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AllReligiousServicesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center text-[var(--saffron)] font-bold italic">Loading Sacred Services...</div>}>
            <AllReligiousServicesContent />
        </Suspense>
    );
}

