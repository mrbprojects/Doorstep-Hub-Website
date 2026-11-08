'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, Star, Wifi, Utensils, Shirt, Zap,
    Car, Shield, Camera, Sparkles, MapPin, Check, X, ChevronRight, Home, ChevronLeft,
    Bed, CheckCircle2, ShieldCheck, Layers, Eye, Share2, Heart, Grid, List, Headphones, Navigation, Filter, Info, Users, Lock, Sparkle
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/pghostels/ui/tabs';
import 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { AddonsModal } from '@/components/pghostels/AddonsModal';
import { useServiceCart } from '@/context/ServiceCartContext';
import { toast } from 'sonner';
import { isObjectId } from '@/utils/slugHelper';

const amenityIcons = {
    Wifi: Wifi,
    Food: Utensils,
    Laundry: Shirt,
    PowerBackup: Zap,
    Parking: Car,
    Security: Shield,
    AC: Sparkles,
    CCTV: Camera,
    WiFi: Wifi,
    "High-Speed WiFi": Wifi,
};

const FALLBACK_ROOM_IMAGES = [
    '/pghostels/room_card_1.png',
    '/pghostels/room_card_2.png',
    '/pghostels/room_card_3.png',
    '/pghostels/room_card_4.png',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?auto=format&fit=crop&w=800&q=80'
];

const getCleanImageUrl = (rawPath) => {
    if (!rawPath) return null;
    let clean = '';
    if (Array.isArray(rawPath)) {
        clean = rawPath[0] ? String(rawPath[0]).trim() : '';
    } else if (typeof rawPath === 'string') {
        clean = rawPath.trim();
    }
    if (!clean || clean.includes('default_image.jpg') || clean === 'undefined' || clean === 'null') return null;
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    const baseUrl = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.doorstephub.com').replace(/\/+$/, '');
    return `${baseUrl}/${clean.replace(/^\/+/, '')}`;
};

const resolveRateCardImage = (pkg, index, hostelImages = []) => {
    const direct = getCleanImageUrl(pkg?.image);
    if (direct) return direct;

    if (Array.isArray(pkg?.banner_images) && pkg.banner_images.length > 0) {
        const banner = getCleanImageUrl(pkg.banner_images[0]);
        if (banner) return banner;
    }

    const validHostelImages = (hostelImages || []).filter(img => img && !img.includes('default_image.jpg'));
    if (validHostelImages.length > 0) {
        return validHostelImages[index % validHostelImages.length];
    }

    return FALLBACK_ROOM_IMAGES[index % FALLBACK_ROOM_IMAGES.length];
};

const getCleanLocality = (address) => {
    if (!address) return 'Prime Locality';
    const parts = address.split(',').map(p => p.trim()).filter(Boolean);
    const valid = parts.filter(p => {
        const lower = p.toLowerCase();
        if (/^(plot|flat|h\.no|d\.no|door|shop|pillar|road|lane|#|\d+)/i.test(lower)) return false;
        if (/^\d{5,6}$/.test(p)) return false;
        if (lower === 'india' || lower === 'telangana' || lower === 'andhra pradesh') return false;
        return true;
    });
    const mainArea = valid.find(p => /madhapur|gachibowli|hitech|kondapur|kukatpally|ameerpet|sr nagar|jubilee|banjara|begumpet|secunderabad|dilsukhnagar|miyapur|chanda nagar/i.test(p));
    if (valid.length > 0) {
        if (mainArea && valid[0] !== mainArea) {
            return `${valid[0]}, ${mainArea}`;
        }
        if (valid.length >= 2) {
            return `${valid[0]}, ${valid[1]}`;
        }
        return valid[0];
    }
    return parts[1] || parts[0] || 'Prime Locality';
};

const KNOWN_SUBCATEGORY_NAMES = {
    '6957743bfb021f41b4f314c4': 'AC Dormitory',
    '695774b8fb021f41b4f314f5': 'Non-AC Dorm',
    '69577b503a36219e8594ed34': 'Furnished Rooms',
    '6957a6a5c3248b77c1d74119': 'Furnished Rooms for Womens',
    '69577c783a36219e8594ed98': 'Private Rooms',
    '695776e7fb021f41b4f31616': 'Private Rooms',
    '69577661fb021f41b4f315f9': 'Shared Rooms',
    '69577bf63a36219e8594ed90': 'Shared Rooms',
};

const getRoomTypeName = (pkg, subcategories = []) => {
    // 1. If pkg has a subcategoryName and it is NOT a 24-character hexadecimal ObjectId
    if (pkg?.subcategoryName && typeof pkg.subcategoryName === 'string') {
        const trimmed = pkg.subcategoryName.trim();
        if (!/^[0-9a-fA-F]{24}$/.test(trimmed)) {
            return trimmed;
        }
    }

    // 2. Identify the subcategory ID to look up
    const subId = pkg?.subcategoryId || (pkg?.subcategoryName && /^[0-9a-fA-F]{24}$/.test(pkg.subcategoryName) ? pkg.subcategoryName : null);
    if (subId) {
        if (Array.isArray(subcategories) && subcategories.length > 0) {
            const found = subcategories.find(s => (s.subcategoryId === subId || s._id === subId || s.id === subId) && s.name && !/^[0-9a-fA-F]{24}$/.test(s.name));
            if (found?.name) return found.name.trim();
        }

        if (KNOWN_SUBCATEGORY_NAMES[subId]) {
            return KNOWN_SUBCATEGORY_NAMES[subId];
        }
    }

    // 3. Fallback: Intelligently infer human-readable category from package title and description
    const text = `${pkg?.name || ''} ${pkg?.description || ''}`.toLowerCase();
    if (text.includes('womens') || text.includes('ladies') || text.includes('women')) return 'Furnished Rooms for Womens';
    if (text.includes('furnished')) return 'Furnished Rooms';
    if (text.includes('non-ac dorm') || text.includes('non ac dorm')) return 'Non-AC Dorm';
    if (text.includes('ac dorm') || text.includes('ac dormitory')) return 'AC Dormitory';
    if (text.includes('dorm') || text.includes('dormitory')) return 'Dormitory Rooms';
    if (text.includes('single') || text.includes('private')) return 'Private Rooms';
    if (text.includes('sharing') || text.includes('shared')) return 'Shared Rooms';

    return 'Standard Rooms';
};

const getRoomTag = (pkg, subcategories = []) => {
    const typeName = getRoomTypeName(pkg, subcategories).toLowerCase();
    const text = `${pkg?.name || ''} ${pkg?.description || ''} ${typeName}`.toLowerCase();
    if (typeName.includes('private') || text.includes('private') || text.includes('single')) return 'PRIVATE ROOM';
    return 'SHARED STAY';
};

const getAmenityBadges = (pkg, subcategories = []) => {
    const typeName = getRoomTypeName(pkg, subcategories).toLowerCase();
    const text = `${pkg?.name || ''} ${pkg?.description || ''} ${typeName}`.toLowerCase();
    const badges = [];

    if (typeName.includes('private') || text.includes('single') || text.includes('private')) {
        badges.push({ label: 'Single Bed', icon: '🛏️' });
    } else {
        badges.push({ label: 'Shared Bed', icon: '👥' });
    }

    if (text.includes('non-ac') || text.includes('non ac')) {
        badges.push({ label: 'Non-AC', icon: '🌬️' });
    } else if (text.includes('ac')) {
        badges.push({ label: 'AC Room', icon: '❄️' });
    } else {
        badges.push({ label: 'Ventilated', icon: '🌬️' });
    }

    badges.push({ label: 'Free WiFi', icon: '📶' });

    return badges;
};

const getFacilityIcons = (pkg, subcategories = []) => {
    const typeName = getRoomTypeName(pkg, subcategories).toLowerCase();
    const text = `${pkg?.name || ''} ${pkg?.description || ''} ${typeName}`.toLowerCase();
    const facilities = [];

    if (typeName.includes('private') || text.includes('single') || text.includes('private')) {
        facilities.push({ label: 'Single Bed', icon: Bed });
        facilities.push({ label: 'Attached Bathroom', icon: Sparkles });
        facilities.push({ label: 'Study Table', icon: Layers });
    } else {
        facilities.push({ label: 'Shared Bed', icon: Bed });
        facilities.push({ label: 'Spacious Room', icon: Eye });
        facilities.push({ label: 'Study Table', icon: Layers });
    }

    return facilities;
};

export default function NewHostelDetailPage({ slugOverride = null }) {
    const params = useParams();
    const router = useRouter();
    const slugOrId = slugOverride || params.slug || params.id;
    const searchParams = useSearchParams();
    const fromListing = searchParams.get('fromListing') || null;

    const [activeTab, setActiveTab] = useState('roomTypes');
    const [viewingRateCard, setViewingRateCard] = useState(null);
    const [, setRateCardImageIndex] = useState(0);
    const [, setGlobalSettings] = useState(null);

    const [hostelData, setHostelData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [showAddonsModal, setShowAddonsModal] = useState(false);
    const [addonsData, setAddonsData] = useState(null);
    const [isCheckingAddons, setIsCheckingAddons] = useState(false);
    const { addToCart, clearCart } = useServiceCart();

    // Photo Gallery Active Index
    const [selectedHeroImageIndex, setSelectedHeroImageIndex] = useState(0);

    // Wishlist & Saved state
    const [wishlist, setWishlist] = useState({});
    const [isPropertySaved, setIsPropertySaved] = useState(false);

    // Room Filter States
    const [selectedRoomTypes, setSelectedRoomTypes] = useState(['all']);
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedStayType, setSelectedStayType] = useState('all'); // 'all' | 'sharing' | 'private'
    const [sortBy, setSortBy] = useState('relevant'); // 'relevant' | 'price_asc' | 'price_desc'
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
    const [showMoreAmenities, setShowMoreAmenities] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Carousel index per room card
    const [roomCardImageIndex, setRoomCardImageIndex] = useState({});

    useEffect(() => {
        const fetchHostelData = async () => {
            if (!slugOrId) return;

            setLoading(true);
            try {
                const isId = isObjectId(slugOrId);
                const apiPayload = isId ? { providerId: slugOrId } : { providerSlug: slugOrId };

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/single-professional-provider`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(apiPayload)
                });
                const data = await response.json();

                if (data.success && data.storeData && data.storeData.length > 0) {
                    const store = data.storeData[0];

                    // Process service photos
                    const serviceImgs = [];
                    if (store.image) {
                        const cleanMain = getCleanImageUrl(store.image);
                        if (cleanMain) serviceImgs.push(cleanMain);
                    }
                    if (Array.isArray(data.serviceImages)) {
                        data.serviceImages.forEach(img => {
                            const c = getCleanImageUrl(img);
                            if (c && !serviceImgs.includes(c)) serviceImgs.push(c);
                        });
                    }
                    if (serviceImgs.length === 0) {
                        serviceImgs.push('/pghostels/clean_hostel_3.png', '/pghostels/clean_hostel_1.png', '/pghostels/clean_hostel_2.png');
                    }

                    // Map API Data to UI Model
                    const mappedData = {
                        id: store._id || store.providerId || slugOrId,
                        providerId: store.providerId || store._id,
                        slug: store.slug || store.providerId || slugOrId,
                        name: store.business_name || `${store.firstName} ${store.lastName}`,

                        location: store.address || 'Location not available',
                        address: store.address || 'Plot no, Ayyappa Society, Madhapur, Hitech City, Hyderabad, Telangana',
                        latitude: store.latitude || null,
                        longitude: store.longitude || null,
                        rating: parseFloat(store.avgRating || 4.8).toFixed(1),
                        totalReviews: store.totalReviews || data.customerRatings?.length || 324,
                        orders: store.totalOrders || 0,
                        basePrice: store.startingAt || 10999,
                        bookingCost: store.startingAt || 199,
                        monthlyPrice: store.startingAt || 10999,
                        logo: store.logo ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${store.logo}` : 'https://images.unsplash.com/photo-1730096081994-73f1fa5f189a?fit=max&fm=jpg&w=200',
                        image: store.image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${store.image}` : serviceImgs[0],
                        images: serviceImgs,

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
                            rating: review.rating || 5,
                            date: review.date ? new Date(review.date).toLocaleDateString() : 'Recently',
                            comment: review.comment || 'No comment provided.'
                        })) : [],

                        packages: data.provider_rate_cards || [],
                        about: data.aboutUs || store.bio || 'Premium PG and co-living accommodation offering comfortable, fully furnished rooms with modern amenities, high-speed WiFi, hygienic meals, and 24/7 security near major IT parks and colleges.',
                        rules: [
                            { rule: 'No smoking inside premises', allowed: false },
                            { rule: 'Visitors allowed during office hours', allowed: true },
                            { rule: 'Gate closes at 10:30 PM', allowed: true },
                        ]
                    };

                    setHostelData(mappedData);

                    // If user landed with an ObjectId but we have a slug, normalize the URL to the slug
                    if (isId && mappedData.slug && mappedData.slug !== slugOrId) {
                        router.replace(`/${mappedData.slug}`);
                    }
                    // Select first package by default if available
                    if (mappedData.packages.length > 0) {
                        setSelectedPackage(mappedData.packages[0]);
                    }

                    // Dynamically calculate price range max
                    const maxP = Math.max(...mappedData.packages.map(p => Number(p.price) || 0), 50000);
                    setPriceRange([0, maxP > 0 ? maxP : 50000]);

                    setFetchError(false);
                } else {
                    setFetchError(true);
                }
            } catch (error) {
                console.error("Error fetching hostel data:", error);
                setFetchError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchHostelData();
    }, [slugOrId, router]);

    useEffect(() => {
        const fetchSubcategories = async () => {
            const targetId = hostelData?.providerId || (isObjectId(slugOrId) ? slugOrId : null);
            if (!targetId) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/provider-subcategories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ providerId: targetId })
                });
                const data = await res.json();
                if (data?.success) {
                    const list = Array.isArray(data.subcategories || data.data) ? (data.subcategories || data.data) : [];
                    setSubcategories(list);
                }
            } catch (e) {
                console.error('Error fetching provider subcategories:', e);
            }
        };
        fetchSubcategories();
    }, [hostelData?.providerId, slugOrId]);

    useEffect(() => {
        const fetchGlobalSettings = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/get_global_settings`);
                const data = await response.json();
                if (data.success && data.policy) {
                    setGlobalSettings(data.policy);
                }
            } catch (error) {
                console.error('Error fetching global settings:', error);
            }
        };
        fetchGlobalSettings();
    }, []);

    // Redirection if not found
    useEffect(() => {
        if (!loading && (fetchError || !hostelData)) {
            router.replace('/appliance-repair-services');
        }
    }, [loading, fetchError, hostelData, router]);

    // Unique Room Types extracted from actual packages
    const hostelPackages = hostelData?.packages;
    const dynamicRoomTypes = useMemo(() => {
        if (!hostelPackages) return [];
        const map = new Map();
        hostelPackages.forEach(pkg => {
            const key = getRoomTypeName(pkg, subcategories);
            const count = (map.get(key) || 0) + 1;
            map.set(key, count);
        });
        return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
    }, [hostelPackages, subcategories]);

    // Dynamic Amenity counts for filter
    const dynamicAmenityFilters = useMemo(() => {
        if (!hostelPackages) return [];
        const list = [
            { id: 'ac', label: 'AC Room', icon: Sparkles },
            { id: 'wifi', label: 'WiFi', icon: Wifi },
            { id: 'bathroom', label: 'Attached Bathroom', icon: Sparkle },
            { id: 'kitchen', label: 'Shared Kitchen', icon: Utensils },
            { id: 'furnished', label: 'Furnished', icon: Layers },
            { id: 'power', label: 'Power Backup', icon: Zap },
            { id: 'security', label: '24/7 Security', icon: Shield },
            { id: 'laundry', label: 'Laundry', icon: Shirt },
        ];

        return list.map(item => {
            const count = hostelPackages.filter(pkg => {
                const roomType = getRoomTypeName(pkg, subcategories).toLowerCase();
                const text = `${pkg.name || ''} ${pkg.description || ''} ${roomType}`.toLowerCase();
                if (item.id === 'ac') return text.includes('ac') && !text.includes('non-ac') && !text.includes('non ac');
                if (item.id === 'wifi') return true; // Standard
                if (item.id === 'bathroom') return text.includes('bath') || text.includes('attach') || text.includes('private');
                if (item.id === 'kitchen') return text.includes('kitchen') || text.includes('dorm');
                if (item.id === 'furnished') return text.includes('furnish') || text.includes('deluxe') || text.includes('premium') || text.includes('bed');
                return true;
            }).length;
            return { ...item, count };
        });
    }, [hostelPackages, subcategories]);

    // Filter and Sort Packages
    const filteredPackages = useMemo(() => {
        if (!hostelPackages) return [];
        let list = [...hostelPackages];

        // 1. Room Type Filter
        if (selectedRoomTypes.length > 0 && !selectedRoomTypes.includes('all')) {
            list = list.filter(pkg => {
                const roomType = getRoomTypeName(pkg, subcategories);
                return selectedRoomTypes.includes(roomType);
            });
        }

        // 2. Stay Type Filter ('all', 'sharing', 'private')
        if (selectedStayType !== 'all') {
            list = list.filter(pkg => {
                const roomType = getRoomTypeName(pkg, subcategories).toLowerCase();
                const text = `${pkg.name || ''} ${pkg.description || ''} ${roomType}`.toLowerCase();
                if (selectedStayType === 'sharing') {
                    return text.includes('sharing') || text.includes('shared') || text.includes('dorm');
                }
                if (selectedStayType === 'private') {
                    return text.includes('single') || text.includes('private');
                }
                return true;
            });
        }

        // 3. Amenities Filter
        if (selectedAmenities.length > 0) {
            list = list.filter(pkg => {
                const roomType = getRoomTypeName(pkg, subcategories).toLowerCase();
                const text = `${pkg.name || ''} ${pkg.description || ''} ${roomType}`.toLowerCase();
                return selectedAmenities.every(aId => {
                    if (aId === 'ac') return text.includes('ac') && !text.includes('non-ac') && !text.includes('non ac');
                    if (aId === 'wifi') return true;
                    if (aId === 'bathroom') return text.includes('bath') || text.includes('attach') || text.includes('private');
                    if (aId === 'kitchen') return text.includes('kitchen') || text.includes('dorm');
                    if (aId === 'furnished') return text.includes('furnish') || text.includes('deluxe') || text.includes('premium') || text.includes('bed');
                    return true;
                });
            });
        }

        // 4. Price Range Filter
        if (priceRange && priceRange.length === 2) {
            list = list.filter(pkg => {
                const p = Number(pkg.price) || 0;
                return p >= priceRange[0] && p <= priceRange[1];
            });
        }

        // 5. Sorting
        if (sortBy === 'price_asc') {
            list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        } else if (sortBy === 'price_desc') {
            list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        }

        return list;
    }, [hostelPackages, subcategories, selectedRoomTypes, selectedStayType, selectedAmenities, priceRange, sortBy]);

    // Reset All Filters
    const handleResetFilters = () => {
        setSelectedRoomTypes(['all']);
        setSelectedStayType('all');
        setSelectedAmenities([]);
        const maxP = Math.max(...(hostelData?.packages || []).map(p => Number(p.price) || 0), 50000);
        setPriceRange([0, maxP]);
        setSortBy('relevant');
        toast.success("Filters reset to default");
    };

    // Toggle Room Type Checkbox
    const toggleRoomType = (typeName) => {
        if (typeName === 'all') {
            setSelectedRoomTypes(['all']);
            return;
        }

        let updated = selectedRoomTypes.filter(t => t !== 'all');
        if (updated.includes(typeName)) {
            updated = updated.filter(t => t !== typeName);
        } else {
            updated.push(typeName);
        }

        if (updated.length === 0) {
            setSelectedRoomTypes(['all']);
        } else {
            setSelectedRoomTypes(updated);
        }
    };

    // Toggle Amenity Checkbox
    const toggleAmenity = (aId) => {
        if (selectedAmenities.includes(aId)) {
            setSelectedAmenities(selectedAmenities.filter(id => id !== aId));
        } else {
            setSelectedAmenities([...selectedAmenities, aId]);
        }
    };

    // Wishlist Toggle
    const toggleWishlist = (pkgId) => {
        setWishlist(prev => {
            const next = { ...prev, [pkgId]: !prev[pkgId] };
            if (next[pkgId]) {
                toast.success("Saved to your wishlist");
            } else {
                toast.info("Removed from wishlist");
            }
            return next;
        });
    };

    // Share Handler
    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: hostelData?.name || 'Doorstep Hub PG & Hostels',
                    text: `Check out ${hostelData?.name} on Doorstep Hub!`,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
            }
        } catch {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    // Booking Handlers (Preserving 100% existing logic)
    const handleContinueToBook = async () => {
        if (!selectedPackage) {
            toast.error("Please select a room first.");
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
                    professionalProviderId: hostelData.id
                })
            });
            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                const allAddons = data.data.flatMap(item => item.addons || []);
                if (allAddons.length > 0) {
                    setAddonsData(allAddons);
                    setShowAddonsModal(true);
                } else {
                    handleAddonsContinue([]);
                }
            } else {
                handleAddonsContinue([]);
            }
        } catch (error) {
            console.error("Error checking addons:", error);
            handleAddonsContinue([]);
        } finally {
            setIsCheckingAddons(false);
        }
    };

    const handleAddonsContinue = async (selectedAddons) => {
        setIsCheckingAddons(true);
        try {
            setShowAddonsModal(false);

            await clearCart(true);

            const packageSuccess = await addToCart(
                hostelData.id,
                selectedPackage._id,
                'professional_service',
                1,
                null,
                'professional',
                true
            );

            if (!packageSuccess) {
                toast.error('Failed to add room to booking');
                return;
            }

            for (const addon of selectedAddons) {
                await addToCart(
                    hostelData.id,
                    addon._id,
                    'professional_addon',
                    1,
                    selectedPackage._id,
                    'professional',
                    true
                );
            }

            sessionStorage.setItem('pg_booking_data', JSON.stringify({
                providerId: hostelData.id,
                packageId: selectedPackage._id,
                addons: selectedAddons.map(a => a._id)
            }));

            const addonIds = selectedAddons.map(a => a._id).join(',');
            router.push(`/pghostels/booking/address?providerId=${hostelData.id}&packageId=${selectedPackage._id}&addons=${addonIds}`);
        } catch (error) {
            console.error('Error during booking initiation:', error);
            toast.error('Failed to initiate booking. Please try again.');
        } finally {
            setIsCheckingAddons(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00796F]"></div>
                    <span className="text-xs font-semibold text-gray-500">Loading hostel details...</span>
                </div>
            </div>
        );
    }

    if (fetchError || !hostelData) {
        return <div className="min-h-screen bg-white" />;
    }

    const propertyPhotos = hostelData.images && hostelData.images.length > 0 ? hostelData.images : ['/pghostels/clean_hostel_3.png'];

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": hostelData.name,
        "image": hostelData.logo || hostelData.image,
        "description": hostelData.about,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": hostelData.address,
            "addressCountry": "IN"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": hostelData.rating,
            "reviewCount": hostelData.totalReviews || 15
        },
        "priceRange": "₹₹",
        "makesOffer": hostelData.packages.map(pkg => ({
            "@type": "Offer",
            "name": pkg.name,
            "price": pkg.price,
            "priceCurrency": "INR",
            "description": pkg.description
        }))
    };

    return (
        <div className="min-h-screen bg-[#F6FBF9] pb-36 pt-16 sm:pt-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />

            <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
                {/* 1. TOP BAR: Back Navigation + Breadcrumb + Share/Save */}
                <div className="flex items-center justify-between flex-wrap gap-3 py-3 border-b border-gray-200/60 mb-5">
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => fromListing ? router.push(`/pghostels/listings/${fromListing}`) : router.back()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#EAF9F5] border border-gray-200 hover:border-[#00796F] text-xs sm:text-sm font-bold text-gray-700 hover:text-[#00796F] shadow-xs transition-all cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 text-gray-600" />
                            <span>Back to Hostels</span>
                        </button>

                        {/* Breadcrumbs */}
                        <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <span className="hover:text-gray-800 cursor-pointer" onClick={() => router.push('/')}>Home</span>
                            <span className="text-gray-300">/</span>
                            <span className="hover:text-gray-800 cursor-pointer" onClick={() => router.push('/pghostels')}>Hyderabad</span>
                            <span className="text-gray-300">/</span>
                            <span className="hover:text-gray-800 cursor-pointer">{getCleanLocality(hostelData.address).split(',')[0] || 'Madhura Nagar'}</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-[#00796F] font-bold truncate max-w-[240px]">{hostelData.name}</span>
                        </div>
                    </div>

                    {/* Share & Save Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 shadow-xs hover:border-[#00796F] transition-all cursor-pointer"
                        >
                            <Share2 className="w-3.5 h-3.5 text-gray-600" />
                            <span>Share</span>
                        </button>
                        <button
                            onClick={() => {
                                setIsPropertySaved(!isPropertySaved);
                                toast.success(isPropertySaved ? "Removed from saved" : "Property saved successfully!");
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shadow-xs transition-all cursor-pointer ${
                                isPropertySaved
                                    ? 'bg-[#EAF9F5] border-[#00796F] text-[#00796F]'
                                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                            }`}
                        >
                            <Heart className={`w-3.5 h-3.5 ${isPropertySaved ? 'fill-[#00796F] text-[#00796F]' : 'text-gray-600'}`} />
                            <span>Save</span>
                        </button>
                    </div>
                </div>

                {/* 2. TOP PROPERTY SECTION: Gallery (Left ~48%) + Property Info (Right ~52%) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-8">
                    {/* Left: Photo Gallery */}
                    <div className="lg:col-span-6 flex flex-col gap-3">
                        {/* Main Large Image Container */}
                        <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200/80 group">
                            <Image
                                src={propertyPhotos[selectedHeroImageIndex] || propertyPhotos[0]}
                                alt={hostelData.name}
                                onError={(e) => { e.currentTarget.src = FALLBACK_ROOM_IMAGES[0]; }}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                             width={500} height={300} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

                            {/* Top-Left Verified Hostel Pill */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-[#00695C] shadow-md border border-emerald-100">
                                    <ShieldCheck className="w-4 h-4 text-[#00796F]" />
                                    Verified Hostel
                                </span>
                            </div>

                            {/* Carousel Prev Button */}
                            {propertyPhotos.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedHeroImageIndex((prev) => (prev - 1 + propertyPhotos.length) % propertyPhotos.length);
                                    }}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-transform active:scale-95 cursor-pointer"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            )}

                            {/* Carousel Next Button */}
                            {propertyPhotos.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedHeroImageIndex((prev) => (prev + 1) % propertyPhotos.length);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-transform active:scale-95 cursor-pointer"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            )}

                            {/* Bottom-Left Photos Count Badge */}
                            <div className="absolute bottom-4 left-4 z-10">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-black/60 text-white backdrop-blur-md border border-white/10 shadow-sm">
                                    <Camera className="w-3.5 h-3.5" />
                                    {selectedHeroImageIndex + 1} / {propertyPhotos.length} Photos
                                </span>
                            </div>
                        </div>

                        {/* Thumbnail Strip (Bottom) */}
                        <div className="grid grid-cols-5 gap-2 sm:gap-3">
                            {propertyPhotos.slice(0, 4).map((photo, pIdx) => (
                                <button
                                    key={pIdx}
                                    onClick={() => setSelectedHeroImageIndex(pIdx)}
                                    className={`relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 transition-all cursor-pointer ${
                                        selectedHeroImageIndex === pIdx
                                            ? 'ring-3 ring-[#00796F] scale-98 shadow-sm'
                                            : 'opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <Image
                                        src={photo}
                                        alt={`Thumbnail ${pIdx + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.src = FALLBACK_ROOM_IMAGES[pIdx % FALLBACK_ROOM_IMAGES.length]; }}
                                     width={500} height={300} />
                                </button>
                            ))}

                            {/* 5th Tile: +X Photos */}
                            <button
                                onClick={() => setActiveTab('gallery')}
                                className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-900 group transition-all cursor-pointer"
                            >
                                <Image
                                    src={propertyPhotos[4] || propertyPhotos[0]}
                                    alt="More photos"
                                    className="w-full h-full object-cover opacity-40 group-hover:opacity-30 group-hover:scale-105 transition-all"
                                    onError={(e) => { e.currentTarget.src = FALLBACK_ROOM_IMAGES[0]; }}
                                 width={500} height={300} />
                                <div className="absolute inset-0 flex items-center justify-center text-white font-extrabold text-xs sm:text-sm">
                                    +{Math.max(propertyPhotos.length - 4, 1)} Photos
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Right: Property Information */}
                    <div className="lg:col-span-6 flex flex-col justify-between gap-5 bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-sm">
                        <div>
                            {/* Property Name + Verified Badge */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-black text-[#102033] tracking-tight">
                                    {hostelData.name}
                                </h1>
                                <CheckCircle2 className="w-5 h-5 text-[#00796F] fill-[#EAF9F5] flex-shrink-0" />
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-2 mt-2 text-xs sm:text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-[#00796F] flex-shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{hostelData.address}</span>
                            </div>

                            {/* Highlights Row */}
                            <div className="flex items-center flex-wrap gap-2.5 mt-3.5">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-[#FFF9EB] text-[#B45309] border border-[#FDE68A]">
                                    <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                                    {hostelData.rating} ({hostelData.totalReviews} reviews)
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#EAF9F5] text-[#00695C] border border-[#BCEEDA]">
                                    Safe & Secure
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#EAF9F5] text-[#00695C] border border-[#BCEEDA]">
                                    Prime Location
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#EAF9F5] text-[#00695C] border border-[#BCEEDA]">
                                    Value for Money
                                </span>
                            </div>

                            {/* 6-Grid Amenity Strip */}
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5 mt-5 pt-5 border-t border-gray-100">
                                {[
                                    { label: 'WiFi', icon: Wifi },
                                    { label: 'AC Rooms', icon: Sparkles },
                                    { label: 'Nutritious Food', icon: Utensils },
                                    { label: 'Laundry', icon: Shirt },
                                    { label: 'Power Backup', icon: Zap },
                                    { label: '24/7 Security', icon: Shield },
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F8FCFA] border border-[#E2F3EE] text-center gap-1.5"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-[#EAF9F5] flex items-center justify-center text-[#00796F]">
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10.5px] font-bold text-gray-700 leading-tight">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location Points & Map Preview Card */}
                        {(() => {
                            const mapQuery = (hostelData.latitude && hostelData.longitude)
                                ? `${hostelData.latitude},${hostelData.longitude}`
                                : `${hostelData.name}, ${hostelData.address}`;
                            const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                            const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
                            const cleanLocality = getCleanLocality(hostelData.address);

                            return (
                                <div className="p-4 rounded-2xl bg-[#F8FCFA] border border-[#E2F3EE] flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="space-y-2 text-xs text-gray-600 font-medium w-full sm:flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-[#00796F] flex-shrink-0" />
                                            <span className="truncate">Close to <strong className="text-gray-800 font-semibold">{cleanLocality}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Navigation className="w-3.5 h-3.5 text-[#00796F] flex-shrink-0" />
                                            <span>2.5 km from Metro Station</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-3.5 h-3.5 text-[#00796F] flex-shrink-0" />
                                            <span>Near Major IT Companies & Colleges</span>
                                        </div>
                                    </div>

                                    {/* Dynamic Interactive Map Preview (Click redirects to Google Maps) */}
                                    <a
                                        href={mapSearchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative w-full sm:w-52 h-24 rounded-2xl overflow-hidden border border-[#BCEEDA] shadow-xs shrink-0 group cursor-pointer block bg-emerald-50 transition-all hover:shadow-md hover:border-[#00796F]"
                                        title="Click to open location in Google Maps"
                                    >
                                        <iframe
                                            title={`${hostelData.name} Map Location`}
                                            src={mapEmbedUrl}
                                            className="w-full h-full border-0 pointer-events-none group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors pointer-events-none" />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-[#00796F] text-white shadow-md group-hover:bg-[#00695C] group-hover:scale-105 transition-all">
                                                <MapPin className="w-3.5 h-3.5 text-white" />
                                                <span>View on Map</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </span>
                                        </div>
                                    </a>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* 3. STICKY PROPERTY NAVIGATION TABS */}
                <div className="sticky top-[64px] sm:top-[72px] z-40 bg-white/95 backdrop-blur-md shadow-md shadow-black/5 rounded-2xl border border-gray-200/80 p-1.5 mb-7 overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-transparent w-full flex flex-row items-center gap-1 sm:gap-2 overflow-x-auto flex-nowrap hide-scrollbar h-11 sm:h-12">
                            <TabsTrigger
                                value="roomTypes"
                                className="flex-shrink-0 data-[state=active]:bg-[#00796F] data-[state=active]:text-white text-gray-700 hover:bg-gray-50 rounded-xl transition-all whitespace-nowrap px-4 sm:px-6 py-2 font-bold flex items-center h-full border-none shadow-none text-xs sm:text-sm cursor-pointer"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                <span>Rate Cards</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="amenities"
                                className="flex-shrink-0 data-[state=active]:bg-[#00796F] data-[state=active]:text-white text-gray-700 hover:bg-gray-50 rounded-xl transition-all whitespace-nowrap px-4 sm:px-6 py-2 font-bold flex items-center h-full border-none shadow-none text-xs sm:text-sm cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                <span>Amenities</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="about"
                                className="flex-shrink-0 data-[state=active]:bg-[#00796F] data-[state=active]:text-white text-gray-700 hover:bg-gray-50 rounded-xl transition-all whitespace-nowrap px-4 sm:px-6 py-2 font-bold flex items-center h-full border-none shadow-none text-xs sm:text-sm cursor-pointer"
                            >
                                <Info className="w-4 h-4 mr-2" />
                                <span>About Us</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="gallery"
                                className="flex-shrink-0 data-[state=active]:bg-[#00796F] data-[state=active]:text-white text-gray-700 hover:bg-gray-50 rounded-xl transition-all whitespace-nowrap px-4 sm:px-6 py-2 font-bold flex items-center h-full border-none shadow-none text-xs sm:text-sm cursor-pointer"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                <span>PG and Hostel Images</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="flex-shrink-0 data-[state=active]:bg-[#00796F] data-[state=active]:text-white text-gray-700 hover:bg-gray-50 rounded-xl transition-all whitespace-nowrap px-4 sm:px-6 py-2 font-bold flex items-center h-full border-none shadow-none text-xs sm:text-sm cursor-pointer"
                            >
                                <Star className="w-4 h-4 mr-2" />
                                <span>Ratings & Reviews</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* 4. MAIN ROOM BOOKING CONTENT AREA */}
                {activeTab === 'roomTypes' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                        {/* ----------------- LEFT FILTER SIDEBAR (~25% / 3 cols) ----------------- */}
                        <div className="hidden lg:block lg:col-span-3 space-y-6">
                            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-sm space-y-6">
                                {/* Header: Filter Rooms + Reset */}
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                    <h3 className="font-extrabold text-[#102033] text-base">Filter Rooms</h3>
                                    <button
                                        onClick={handleResetFilters}
                                        className="text-xs font-bold text-[#00796F] hover:underline cursor-pointer"
                                    >
                                        Reset
                                    </button>
                                </div>

                                {/* Room Type Checkboxes */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                                        Room Type
                                    </h4>
                                    <div className="space-y-2">
                                        {/* All Rooms Option */}
                                        <label className="flex items-center justify-between text-xs sm:text-sm text-gray-700 font-medium hover:text-gray-900 cursor-pointer">
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRoomTypes.includes('all')}
                                                    onChange={() => toggleRoomType('all')}
                                                    className="w-4 h-4 rounded text-[#00796F] focus:ring-[#00796F] border-gray-300"
                                                />
                                                <span>All Rooms</span>
                                            </div>
                                            <span className="text-xs text-gray-400">({hostelData.packages.length})</span>
                                        </label>

                                        {/* Dynamic Subcategories */}
                                        {dynamicRoomTypes.map((t, idx) => (
                                            <label
                                                key={idx}
                                                className="flex items-center justify-between text-xs sm:text-sm text-gray-700 font-medium hover:text-gray-900 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRoomTypes.includes(t.name)}
                                                        onChange={() => toggleRoomType(t.name)}
                                                        className="w-4 h-4 rounded text-[#00796F] focus:ring-[#00796F] border-gray-300"
                                                    />
                                                    <span className="truncate">{t.name}</span>
                                                </div>
                                                <span className="text-xs text-gray-400">({t.count})</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range Filter */}
                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-extrabold uppercase tracking-wider text-gray-400">
                                            Price Range <span className="font-normal lowercase">({hostelData.packages[0]?.priceUnit || 'per service'})</span>
                                        </span>
                                    </div>

                                    {/* Slider */}
                                    <input
                                        type="range"
                                        min="0"
                                        max={Math.max(...hostelData.packages.map(p => Number(p.price) || 0), 50000)}
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                        className="w-full accent-[#00796F] cursor-pointer"
                                    />

                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 font-bold flex-1">
                                            ₹ {priceRange[0].toLocaleString('en-IN')}
                                        </div>
                                        <span className="text-gray-400 text-xs">—</span>
                                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 font-bold flex-1">
                                            ₹ {priceRange[1].toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>

                                {/* Amenities Checkboxes */}
                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                                        Amenities
                                    </h4>
                                    <div className="space-y-2">
                                        {dynamicAmenityFilters.slice(0, showMoreAmenities ? 8 : 5).map((a) => (
                                            <label
                                                key={a.id}
                                                className="flex items-center justify-between text-xs sm:text-sm text-gray-700 font-medium hover:text-gray-900 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAmenities.includes(a.id)}
                                                        onChange={() => toggleAmenity(a.id)}
                                                        className="w-4 h-4 rounded text-[#00796F] focus:ring-[#00796F] border-gray-300"
                                                    />
                                                    <span>{a.label}</span>
                                                </div>
                                                <span className="text-xs text-gray-400">({a.count})</span>
                                            </label>
                                        ))}

                                        <button
                                            onClick={() => setShowMoreAmenities(!showMoreAmenities)}
                                            className="text-xs font-bold text-[#00796F] hover:underline pt-1 cursor-pointer block"
                                        >
                                            {showMoreAmenities ? 'Show Less -' : 'Show More +'}
                                        </button>
                                    </div>
                                </div>

                                {/* Stay Type Buttons (All, Sharing, Private) */}
                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                                        Stay Type
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'all', label: 'All', icon: Users },
                                            { id: 'sharing', label: 'Sharing', icon: Bed },
                                            { id: 'private', label: 'Private', icon: Lock },
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setSelectedStayType(item.id)}
                                                className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold gap-1 transition-all cursor-pointer ${
                                                    selectedStayType === item.id
                                                        ? 'bg-[#00796F] text-white border-[#00796F] shadow-sm'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#00796F]/40'
                                                }`}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                <span>{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Apply Filters Button */}
                                <button
                                    onClick={() => toast.success(`Showing ${filteredPackages.length} filtered rooms`)}
                                    className="w-full py-3 rounded-2xl bg-[#00796F] hover:bg-[#00695C] text-white font-bold text-sm shadow-md shadow-[#00796F]/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                                >
                                    <Filter className="w-4 h-4" />
                                    <span>Apply Filters</span>
                                </button>
                            </div>

                            {/* Need Help Finding a Room Card */}
                            <div className="bg-[#EAF9F5] rounded-3xl p-5 border border-[#BCEEDA] flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-[#00796F] text-white flex items-center justify-center shrink-0">
                                        <Headphones className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-[#102033] text-sm">Need Help Finding a Room?</h4>
                                        <p className="text-xs text-gray-600 mt-0.5 leading-snug">Our team will help you find the best stay as per your needs.</p>
                                    </div>
                                </div>
                                <a
                                    href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi Doorstep Hub, I need help booking a room at ${hostelData.name}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-[#00796F]/25 text-[#00695C] font-bold text-xs hover:bg-[#00796F] hover:text-white transition-all shadow-xs"
                                >
                                    <span>Contact Support</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>

                        {/* ----------------- RIGHT ROOM LISTINGS (~75% / 9 cols) ----------------- */}
                        <div className="lg:col-span-9 space-y-4">
                            {/* Alert / Info Bar + Sort & View Controls */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-3 sm:px-4 border border-gray-200/80 shadow-xs">
                                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#00695C] bg-[#EAF9F5] px-3.5 py-1.5 rounded-xl border border-[#00796F]/20">
                                    <Sparkles className="w-3.5 h-3.5 text-[#00796F]" />
                                    <span>Please select a room type to proceed:</span>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
                                    <span className="text-xs font-bold text-gray-500">
                                        Showing {filteredPackages.length} rooms
                                    </span>

                                    {/* Sort Dropdown */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-gray-400 font-medium hidden sm:inline">Sort by</span>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-[#00796F] cursor-pointer"
                                        >
                                            <option value="relevant">Most Relevant</option>
                                            <option value="price_asc">Price: Low to High</option>
                                            <option value="price_desc">Price: High to Low</option>
                                        </select>
                                    </div>

                                    {/* View Toggle */}
                                    <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                                viewMode === 'grid' ? 'bg-white shadow-xs text-[#00796F]' : 'text-gray-500 hover:text-gray-800'
                                            }`}
                                            title="Grid View"
                                        >
                                            <Grid className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                                viewMode === 'list' ? 'bg-white shadow-xs text-[#00796F]' : 'text-gray-500 hover:text-gray-800'
                                            }`}
                                            title="List View"
                                        >
                                            <List className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Mobile Filter Button */}
                                    <button
                                        onClick={() => setIsMobileFilterOpen(true)}
                                        className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00796F] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                                    >
                                        <Filter className="w-3.5 h-3.5" />
                                        <span>Filters</span>
                                    </button>
                                </div>
                            </div>

                            {/* ROOM CARDS CONTAINER */}
                            {filteredPackages.length > 0 ? (
                                <div className={viewMode === 'list' ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5'}>
                                    {filteredPackages.map((pkg, index) => {
                                        const isSelected = selectedPackage?._id === pkg._id;
                                        const roomTag = getRoomTag(pkg, subcategories);
                                        const isPrivate = roomTag === 'PRIVATE ROOM';
                                        const amenityBadges = getAmenityBadges(pkg, subcategories);
                                        const facilityIcons = getFacilityIcons(pkg, subcategories);
                                        const cardImgs = (pkg.banner_images && pkg.banner_images.length > 0)
                                            ? pkg.banner_images.map(img => getCleanImageUrl(img)).filter(Boolean)
                                            : hostelData.images;
                                        const currentImgIdx = roomCardImageIndex[pkg._id || index] || 0;
                                        const cardImg = cardImgs[currentImgIdx % cardImgs.length] || resolveRateCardImage(pkg, index, hostelData.images);
                                        const isCardWishlisted = Boolean(wishlist[pkg._id || index]);

                                        if (viewMode === 'list') {
                                            return (
                                                <div
                                                    key={pkg._id || index}
                                                    onClick={() => setSelectedPackage(pkg)}
                                                    className={`group bg-white rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden shadow-xs hover:shadow-md flex flex-col md:flex-row items-stretch ${
                                                        isSelected
                                                            ? 'border-2 border-[#00796F] ring-3 ring-[#00796F]/10 bg-[#F8FCFA]'
                                                            : 'border-gray-200/80 hover:border-[#00796F]/40'
                                                    }`}
                                                >
                                                    {/* 1. LEFT: ROOM IMAGE (~27% width, 20% reduced height) */}
                                                    <div className="relative w-full md:w-[27%] h-44 sm:h-48 md:h-auto md:min-h-[170px] bg-gray-100 overflow-hidden shrink-0">
                                                        <Image
                                                            src={cardImg}
                                                            alt={pkg.name}
                                                            onError={(e) => {
                                                                const fallback = FALLBACK_ROOM_IMAGES[index % FALLBACK_ROOM_IMAGES.length];
                                                                if (e.currentTarget.src !== fallback) {
                                                                    e.currentTarget.src = fallback;
                                                                }
                                                            }}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                         width={500} height={300} />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15 pointer-events-none" />

                                                        {/* Stay Badge Top-Left */}
                                                        <div className="absolute top-2.5 left-2.5 z-10">
                                                            <span
                                                                className={`px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase tracking-wide shadow-xs backdrop-blur-sm ${
                                                                    isPrivate
                                                                        ? 'bg-amber-500 text-white'
                                                                        : 'bg-[#2563EB] text-white'
                                                                }`}
                                                            >
                                                                {roomTag}
                                                            </span>
                                                        </div>

                                                        {/* Carousel Arrows on Image */}
                                                        {cardImgs && cardImgs.length > 1 && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setRoomCardImageIndex(prev => ({
                                                                            ...prev,
                                                                            [pkg._id || index]: (currentImgIdx - 1 + cardImgs.length) % cardImgs.length
                                                                        }));
                                                                    }}
                                                                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-xs text-gray-700 transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                                                                >
                                                                    <ChevronLeft className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setRoomCardImageIndex(prev => ({
                                                                            ...prev,
                                                                            [pkg._id || index]: (currentImgIdx + 1) % cardImgs.length
                                                                        }));
                                                                    }}
                                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-xs text-gray-700 transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                                                                >
                                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        )}

                                                        {/* Photo Counter Bottom-Left */}
                                                        <div className="absolute bottom-2.5 left-2.5 z-10">
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-extrabold bg-black/60 text-white backdrop-blur-md">
                                                                <Camera className="w-2.5 h-2.5" />
                                                                <span>{cardImgs?.length || 5} Photos</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* 2. MIDDLE: ROOM DETAILS (~48%, aligned & 20% compact) */}
                                                    <div className="p-3.5 sm:p-4 md:py-3.5 md:px-5 flex flex-col justify-between flex-1 min-w-0 border-b md:border-b-0 md:border-r border-gray-100">
                                                        <div>
                                                            {/* Title & Wishlist Row */}
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div>
                                                                    <h3 className="font-extrabold text-[#102033] text-[15.5px] sm:text-[16.5px] tracking-tight leading-snug group-hover:text-[#00796F] transition-colors">
                                                                        {pkg.name}
                                                                    </h3>
                                                                    <p className="text-gray-500 text-[11.5px] mt-0.5 line-clamp-1 leading-relaxed">
                                                                        {pkg.description || 'Comfortable accommodation with all modern amenities, personal storage and high-speed internet.'}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleWishlist(pkg._id || index);
                                                                    }}
                                                                    className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                                                                    title={isCardWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                                                >
                                                                    <Heart
                                                                        className={`w-4 h-4 transition-colors ${
                                                                            isCardWishlisted ? 'fill-[#EF4444] text-[#EF4444]' : 'text-gray-400 hover:text-gray-600'
                                                                        }`}
                                                                    />
                                                                </button>
                                                            </div>

                                                            {/* Amenity Chips Row 1 */}
                                                            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                                                {amenityBadges.map((badge, bIdx) => (
                                                                    <span
                                                                        key={bIdx}
                                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[10.5px] font-bold bg-[#EAF9F5] text-[#00695C] border border-[#BCEEDA]"
                                                                    >
                                                                        <span>{badge.icon}</span>
                                                                        <span>{badge.label}</span>
                                                                    </span>
                                                                ))}
                                                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
                                                                    +2
                                                                </span>
                                                            </div>

                                                            {/* Facility Details Row 2 */}
                                                            <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 mt-2 text-[11px] text-gray-600 font-medium">
                                                                {facilityIcons.map((f, fIdx) => (
                                                                    <div key={fIdx} className="flex items-center gap-1.5">
                                                                        <f.icon className="w-3 h-3 text-gray-400 shrink-0" />
                                                                        <span>{f.label}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Room Details & Photos Link */}
                                                        <div className="mt-2.5 pt-2 border-t border-gray-100/80 flex items-center">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setViewingRateCard(pkg);
                                                                    setRateCardImageIndex(0);
                                                                }}
                                                                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#00796F] hover:underline cursor-pointer"
                                                            >
                                                                <span>Room Details & Photos</span>
                                                                <ChevronRight className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* 3. RIGHT: PRICING & CTA (~25%, aligned & 20% compact) */}
                                                    <div className="p-3.5 sm:p-4 md:py-3.5 md:px-5 flex flex-col justify-between shrink-0 md:w-[24%] lg:w-[25%] bg-white md:bg-transparent">
                                                        <div>
                                                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-gray-400 block">
                                                                Starts from
                                                            </span>
                                                            <div className="flex items-baseline gap-1 mt-0.5">
                                                                <span className="text-xl sm:text-2xl font-black text-[#00796F] tracking-tight">
                                                                    ₹{Number(pkg.price).toLocaleString('en-IN')}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10.5px] text-gray-500 font-medium block">
                                                                /{pkg.priceUnit || 'per service'}
                                                            </span>
                                                        </div>

                                                        <div className="mt-2.5 space-y-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedPackage(pkg);
                                                                }}
                                                                className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-[13px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98 ${
                                                                    isSelected
                                                                        ? 'bg-[#00796F] text-white shadow-sm shadow-[#00796F]/25'
                                                                        : 'bg-[#00796F] hover:bg-[#00695C] text-white'
                                                                }`}
                                                            >
                                                                {isSelected ? (
                                                                    <>
                                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                        <span>Selected</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span>Select Room</span>
                                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                                    </>
                                                                )}
                                                            </button>

                                                            {/* Availability Status Dot */}
                                                            <div className="flex items-center justify-center gap-1.5 text-[10.5px] font-semibold text-amber-700">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                                <span>{index % 2 === 0 ? 'Limited Rooms Available' : 'Only 2 Rooms Left'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Grid View Alternative
                                        return (
                                            <div
                                                key={pkg._id || index}
                                                onClick={() => setSelectedPackage(pkg)}
                                                className={`group bg-white rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                                                    isSelected
                                                        ? 'border-2 border-[#00796F] ring-3 ring-[#00796F]/10 bg-[#F8FCFA]'
                                                        : 'border-gray-200/80 hover:border-[#00796F]/40'
                                                }`}
                                            >
                                                <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
                                                    <Image
                                                        src={cardImg}
                                                        alt={pkg.name}
                                                        onError={(e) => { e.currentTarget.src = FALLBACK_ROOM_IMAGES[0]; }}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                     width={500} height={300} />
                                                    <div className="absolute top-2.5 left-2.5 z-10">
                                                        <span className="px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase tracking-wide bg-[#00796F] text-white">
                                                            {roomTag}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-sm leading-snug">
                                                            {pkg.name}
                                                        </h3>
                                                        <p className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">
                                                            {pkg.description || 'Clean, comfortable accommodation.'}
                                                        </p>
                                                    </div>

                                                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                                        <div>
                                                            <span className="text-[9.5px] uppercase font-bold text-gray-400 block">Starts from</span>
                                                            <span className="text-base font-black text-[#00796F]">₹{Number(pkg.price).toLocaleString('en-IN')}</span>
                                                        </div>
                                                        <button className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isSelected ? 'bg-[#00796F] text-white' : 'bg-[#EAF9F5] text-[#00796F]'}`}>
                                                            {isSelected ? 'Selected ✓' : 'Select Room'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80 p-8">
                                    <div className="w-14 h-14 rounded-2xl bg-[#EAF9F5] text-[#00796F] flex items-center justify-center mx-auto mb-3">
                                        <Filter className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-extrabold text-[#102033] text-lg">No rooms match your filter criteria</h4>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
                                        Try adjusting your price range, stay type or clearing filters to see all available accommodations.
                                    </p>
                                    <button
                                        onClick={handleResetFilters}
                                        className="mt-4 px-5 py-2.5 rounded-xl bg-[#00796F] text-white font-bold text-xs shadow-md shadow-[#00796F]/20 cursor-pointer"
                                    >
                                        Reset All Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 5. OTHER TABS (Amenities, About, Images, Ratings) */}
                {activeTab === 'amenities' && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
                        <h3 className="text-2xl font-black text-[#102033]">Property Amenities</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'High-Speed WiFi', icon: Wifi, desc: 'Unlimited optical fiber connectivity' },
                                { label: 'Air Conditioned Rooms', icon: Sparkles, desc: 'Modern split AC units installed' },
                                { label: 'Nutritious Food', icon: Utensils, desc: '3 times daily home-style food' },
                                { label: 'Laundry & Washing', icon: Shirt, desc: 'Automatic washing machines available' },
                                { label: 'Power Backup', icon: Zap, desc: '24/7 uninterrupted power generator' },
                                { label: '24/7 Security & CCTV', icon: Shield, desc: 'Round-the-clock guard & surveillance' },
                                { label: 'Two Wheeler Parking', icon: Car, desc: 'Designated secure parking slots' },
                                { label: 'Daily Housekeeping', icon: Sparkle, desc: 'Daily room and washroom sanitization' },
                            ].map((a, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-[#F8FCFA] border border-[#E2F3EE] flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#EAF9F5] text-[#00796F] flex items-center justify-center shrink-0">
                                        <a.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-sm text-[#102033]">{a.label}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-2xl font-black text-[#102033]">About {hostelData.name}</h3>
                            <p className="text-gray-700 leading-relaxed text-base mt-3">{hostelData.about}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-[#EAF9F5] border border-[#BCEEDA]">
                            <h4 className="font-extrabold text-[#00695C] text-sm">Property Location & Access</h4>
                            <p className="text-xs text-gray-700 mt-1">{hostelData.address}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'gallery' && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-[#102033]">Property Image Gallery</h3>
                            <span className="text-xs font-bold text-gray-500">{propertyPhotos.length} Photos</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {propertyPhotos.map((img, idx) => (
                                <div
                                    key={idx}
                                    className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-sm group cursor-pointer"
                                    onClick={() => setSelectedHeroImageIndex(idx)}
                                >
                                    <Image
                                        src={img}
                                        alt={`Hostel photo ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                     width={500} height={300} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-[#102033]">Ratings & Reviews</h3>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-extrabold text-sm">
                                <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                                <span>{hostelData.rating}</span>
                                <span className="text-gray-400 font-normal">({hostelData.totalReviews} verified reviews)</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { name: 'Karthik Rao', rating: 5, date: 'October 2026', comment: 'Extremely well-maintained hostel with peaceful environment and delicious daily meals. Very close to Hitech City offices.' },
                                { name: 'Naveen Kumar', rating: 4.5, date: 'September 2026', comment: 'Spacious rooms, high-speed WiFi never drops, and great maintenance staff. Booking process on Doorstep Hub was completely seamless.' },
                            ].map((r, idx) => (
                                <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-extrabold text-sm text-[#102033]">{r.name}</h4>
                                        <span className="text-xs text-gray-400">{r.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 fill-[#F59E0B]" />
                                        ))}
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 6. STICKY BOTTOM BOOKING SUMMARY BAR */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/90 shadow-2xl z-50"
            >
                <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
                    {/* Left: Property Thumbnail & Name */}
                    <div className="flex items-center gap-3 min-w-0">
                        <Image
                            src={propertyPhotos[0] || FALLBACK_ROOM_IMAGES[0]}
                            alt={hostelData.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0 hidden sm:block"
                            onError={(e) => { e.currentTarget.src = FALLBACK_ROOM_IMAGES[0]; }}
                         width={48} height={48} />
                        <div className="min-w-0">
                            <h4 className="font-black text-[#102033] text-sm sm:text-base truncate">
                                {hostelData.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                                <span className="inline-flex items-center text-amber-600 font-bold">
                                    <Star className="w-3 h-3 fill-[#F59E0B] mr-0.5" />
                                    {hostelData.rating} ({hostelData.totalReviews})
                                </span>
                                <span>•</span>
                                <span className="truncate">{getCleanLocality(hostelData.address).split(',')[0]}</span>
                            </div>
                        </div>
                    </div>

                    {/* Center / Right: Dynamic Price & Continue Button */}
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                {selectedPackage ? `Selected: ${selectedPackage.name}` : 'Starting from'}
                            </span>
                            <div className="flex items-baseline justify-end gap-1">
                                <span className="text-xl sm:text-2xl font-black text-[#00796F]">
                                    ₹{Number(selectedPackage?.price || hostelData.basePrice).toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                                    /{selectedPackage?.priceUnit || 'per service'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleContinueToBook}
                            disabled={isCheckingAddons}
                            className="px-6 sm:px-10 py-3 sm:py-3.5 bg-[#00796F] hover:bg-[#00695C] text-white rounded-2xl font-extrabold text-sm sm:text-base shadow-xl shadow-[#00796F]/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                        >
                            {isCheckingAddons && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                            <span>{isCheckingAddons ? 'Checking...' : 'Continue to Book'}</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* 7. ADDONS MODAL (Preserved 100%) */}
            <AddonsModal
                isOpen={showAddonsModal}
                onClose={() => setShowAddonsModal(false)}
                providerId={hostelData.id}
                selectedPackageId={selectedPackage?._id}
                onContinue={handleAddonsContinue}
                prefetchedAddons={addonsData}
            />

            {/* 8. ROOM DETAILS & RATE CARD GALLERY MODAL */}
            <AnimatePresence>
                {viewingRateCard && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingRateCard(null)}
                            className="absolute inset-0 bg-black/85 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] z-10"
                        >
                            {/* Modal Header */}
                            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">
                                        {viewingRateCard.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {viewingRateCard.description || 'Accommodation details & room photographs'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setViewingRateCard(null)}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Main Image in Modal */}
                            <div className="flex-1 overflow-hidden bg-gray-950 flex items-center justify-center p-4 min-h-[320px]">
                                <Image
                                    src={resolveRateCardImage(viewingRateCard, 0, hostelData.images)}
                                    alt={viewingRateCard.name}
                                    className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl"
                                 width={500} height={300} />
                            </div>

                            {/* Modal Footer with Select Button */}
                            <div className="p-4 sm:p-5 bg-white border-t border-gray-100 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Price</span>
                                    <span className="text-xl sm:text-2xl font-black text-[#00796F]">
                                        ₹{Number(viewingRateCard.price).toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-1">/{viewingRateCard.priceUnit || 'per service'}</span>
                                </div>

                                <button
                                    onClick={() => {
                                        setSelectedPackage(viewingRateCard);
                                        setViewingRateCard(null);
                                        toast.success(`Selected ${viewingRateCard.name}`);
                                    }}
                                    className="px-6 py-2.5 rounded-xl bg-[#00796F] text-white font-bold text-sm shadow-md hover:bg-[#00695C] transition-all cursor-pointer"
                                >
                                    Select This Room
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 9. MOBILE FILTER DRAWER */}
            <AnimatePresence>
                {isMobileFilterOpen && (
                    <div className="fixed inset-0 z-[120] lg:hidden flex flex-col justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto space-y-6 z-10"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-black text-[#102033] text-lg">Filter Rooms</h3>
                                    <button
                                        onClick={handleResetFilters}
                                        className="text-xs font-bold text-[#00796F] hover:underline cursor-pointer"
                                    >
                                        Reset
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Room Type */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Room Type</h4>
                                <label className="flex items-center justify-between text-sm py-1 cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedRoomTypes.includes('all')}
                                            onChange={() => toggleRoomType('all')}
                                            className="w-4 h-4 rounded text-[#00796F]"
                                        />
                                        <span className="font-semibold text-gray-800">All Rooms</span>
                                    </div>
                                    <span className="text-xs text-gray-400">({hostelData?.packages?.length || 0})</span>
                                </label>
                                {dynamicRoomTypes.map((t, idx) => (
                                    <label key={idx} className="flex items-center justify-between text-sm py-1 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedRoomTypes.includes(t.name)}
                                                onChange={() => toggleRoomType(t.name)}
                                                className="w-4 h-4 rounded text-[#00796F]"
                                            />
                                            <span>{t.name}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">({t.count})</span>
                                    </label>
                                ))}
                            </div>

                            {/* Stay Type */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Stay Type</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {['all', 'sharing', 'private'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedStayType(t)}
                                            className={`py-2 rounded-xl text-xs font-bold capitalize border ${
                                                selectedStayType === t ? 'bg-[#00796F] text-white border-[#00796F]' : 'bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="w-full py-3.5 rounded-2xl bg-[#00796F] text-white font-extrabold text-sm shadow-md cursor-pointer"
                            >
                                Apply Filters ({filteredPackages.length} Rooms)
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
