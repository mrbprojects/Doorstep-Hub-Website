'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
    ArrowLeft, Star, MapPin, Sparkles, Clock,
    Users, Flame, Calendar, Filter, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocationContext } from '@/context/LocationContext';

// Map questionnaire values to readable labels
const SERVICE_LABELS = {
    pooja: 'Pooja / Homam',
    astrology: 'Astrology Consultation',
    wedding: 'Wedding Ceremonies',
    vastu: 'Vastu Shastra',
    festival: 'Festival Rituals',
    grieving: 'Last Rites / Shraadh',
};
const OCCASION_LABELS = {
    'new-home': 'New Home / Office',
    birthday: 'Birthday / Anniversary',
    'festival-day': 'Festival Day',
    health: 'Health & Wellbeing',
    general: 'General Blessing',
};
const ATTENDEES_LABELS = {
    personal: 'Intimate (1–10)',
    'small-group': 'Small (10–25)',
    community: 'Community (25–100)',
    large: 'Large (100+)',
};
const TIMING_LABELS = {
    today: 'Today',
    'this-week': 'This Week',
    'next-week': 'Next Week',
    'specific-date': 'Specific Muhurtham',
    flexible: 'Flexible',
};

function ReligiousCategoryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const serviceType = searchParams.get('serviceType') || '';
    const occasion = searchParams.get('occasion') || '';
    const attendees = searchParams.get('attendees') || '';
    const timing = searchParams.get('timing') || '';

    const { location, detectWithIP } = useLocationContext();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!location) {
            detectWithIP().catch(err => console.log('Auto detect failed', err));
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

                // Get religious services serviceId from localStorage, fallback to hardcoded ID
                const RELIGIOUS_SERVICE_ID = '695250aa57bb211ca094e5fd';
                let serviceId = RELIGIOUS_SERVICE_ID;
                try {
                    const savedService = localStorage.getItem('selectedService');
                    if (savedService) {
                        const parsed = JSON.parse(savedService);
                        if (parsed?.id) serviceId = parsed.id;
                    }
                } catch (e) { /* use fallback */ }

                const response = await fetch(
                    'https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/professional-services',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lattitude: lat, longitude: lng, serviceId }),
                    }
                );
                const data = await response.json();
                if (data.success && data.professionalServices) {
                    setServices(data.professionalServices);
                }
            } catch (error) {
                console.error('Error fetching religious services:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [location]);

    const serviceLabel = SERVICE_LABELS[serviceType] || 'Religious Service';
    const hasFilters = serviceType || occasion || attendees || timing;

    return (
        <div className="min-h-screen bg-[var(--off-white)]">
            {/* Hero Header */}
            <div className="relative pt-28 pb-16 overflow-hidden bg-gradient-to-br from-[#800000] via-[var(--temple-red,#8B1A1A)] to-[var(--saffron,#FF9933)]">
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
                />
                <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none">
                    <span className="text-[12rem] text-white font-serif select-none">ॐ</span>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    {/* Back button */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.push('/religious-services')}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Religious Services</span>
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Spiritual tag */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 text-white mb-4">
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                            <span className="text-sm font-medium">Matched Pandits for You</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                            {serviceLabel}
                        </h1>
                        <p className="text-lg text-white/80 max-w-xl">
                            Verified pandits and spiritual professionals near you, ready to serve
                        </p>
                    </motion.div>

                    {/* Filter chips from questionnaire */}
                    {hasFilters && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap gap-2 mt-6"
                        >
                            {serviceType && (
                                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 text-white text-sm">
                                    <Flame className="w-3.5 h-3.5 text-yellow-300" />
                                    {SERVICE_LABELS[serviceType]}
                                </div>
                            )}
                            {occasion && (
                                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 text-white text-sm">
                                    <Star className="w-3.5 h-3.5 text-yellow-300" />
                                    {OCCASION_LABELS[occasion]}
                                </div>
                            )}
                            {attendees && (
                                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 text-white text-sm">
                                    <Users className="w-3.5 h-3.5 text-yellow-300" />
                                    {ATTENDEES_LABELS[attendees]}
                                </div>
                            )}
                            {timing && (
                                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 text-white text-sm">
                                    <Calendar className="w-3.5 h-3.5 text-yellow-300" />
                                    {TIMING_LABELS[timing]}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">

                {/* Header row */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--deep-charcoal,#1a1a2e)]">
                            {loading ? 'Finding Pandits...' : `${services.length} Pandits Available`}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Sorted by rating & availability</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-[var(--saffron,#FF9933)] text-[var(--saffron,#FF9933)] hover:bg-[var(--saffron,#FF9933)] hover:text-white gap-2"
                        onClick={() => router.push('/religious-services')}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Change Preferences
                    </Button>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="relative mb-6">
                            <div className="w-16 h-16 rounded-full border-4 border-[var(--saffron,#FF9933)]/20 border-t-[var(--saffron,#FF9933)] animate-spin" />
                            <Sparkles className="w-6 h-6 text-[var(--saffron,#FF9933)] absolute inset-0 m-auto" />
                        </div>
                        <p className="text-[var(--deep-charcoal,#1a1a2e)] font-medium">Finding divine services nearby...</p>
                        <p className="text-gray-400 text-sm mt-1">Matching your spiritual requirements</p>
                    </div>
                ) : services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, i) => (
                            <motion.div
                                key={service._id || i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <Card
                                    className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-[var(--saffron,#FF9933)]/30 h-full"
                                    onClick={() => router.push(
                                        `/religious-services/service/${service._id}?serviceType=${serviceType}&occasion=${occasion}&attendees=${attendees}&timing=${timing}`
                                    )}
                                >
                                    {/* Image */}
                                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50">
                                        <img
                                            src={
                                                service.logo
                                                    ? `https://api.doorstephub.com/${service.logo}`
                                                    : 'https://images.unsplash.com/photo-1762090420353-47d4a0b3f6af?auto=format&fit=crop&q=80'
                                            }
                                            alt={service.business_name || 'Pandit'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        {/* Rating badge */}
                                        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white text-sm">
                                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{service.avgRating || '4.8'}</span>
                                        </div>

                                        {/* Service type badge */}
                                        {serviceType && (
                                            <div className="absolute top-3 right-3 bg-[var(--saffron,#FF9933)] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                                {SERVICE_LABELS[serviceType]}
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="p-5">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-[var(--deep-charcoal,#1a1a2e)] mb-1 group-hover:text-[var(--saffron,#FF9933)] transition-colors">
                                                {service.business_name || `${service.firstName || ''} ${service.lastName || ''}`.trim() || 'Pandit Ji'}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="line-clamp-1">
                                                    {service.address
                                                        ? service.address.substring(0, 35) + (service.address.length > 35 ? '...' : '')
                                                        : 'Available at Doorstep'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                                                {service.description || service.bio || 'Expert Vedic priest offering authentic religious ceremonies with devotion.'}
                                            </p>
                                        </div>

                                        {/* Tags row */}
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            <Badge className="bg-orange-50 text-[var(--saffron,#FF9933)] border border-orange-100 text-xs">
                                                Verified Pandit
                                            </Badge>
                                            {timing === 'today' && (
                                                <Badge className="bg-green-50 text-green-700 border border-green-100 text-xs gap-1">
                                                    <Clock className="w-3 h-3" /> Available Today
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Price + CTA */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400">Starts from</span>
                                                <span className="text-xl font-bold text-[var(--saffron,#FF9933)]">
                                                    ₹{(service.BasePrice || service.minFare || 1100).toLocaleString()}
                                                </span>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-[var(--saffron,#FF9933)] hover:bg-[var(--temple-red,#8B1A1A)] text-white shadow hover:shadow-orange-200 transition-all"
                                            >
                                                Book Now
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="text-6xl mb-6">🙏</div>
                        <h3 className="text-2xl font-bold text-[var(--deep-charcoal,#1a1a2e)] mb-3">
                            No Pandits Found Nearby
                        </h3>
                        <p className="text-gray-500 max-w-md mb-8">
                            We couldn't find any religious service providers in your area right now. Try a different location or browse all categories.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="border-[var(--saffron,#FF9933)] text-[var(--saffron,#FF9933)] hover:bg-[var(--saffron,#FF9933)] hover:text-white"
                                onClick={() => router.push('/religious-services')}
                            >
                                Browse All Services
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ReligiousCategoryPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[var(--off-white)] flex flex-col items-center justify-center">
                    <Sparkles className="w-10 h-10 text-[var(--saffron,#FF9933)] animate-spin mb-4" />
                    <p className="text-[var(--deep-charcoal,#1a1a2e)]">Loading Sacred Services...</p>
                </div>
            }
        >
            <ReligiousCategoryContent />
        </Suspense>
    );
}
