'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { GoogleMap, Marker, OverlayViewF, FLOAT_PANE } from '@react-google-maps/api';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Award,
  CheckCircle,
  Shield,
  Users,
  Calendar,
  X,
  Check,
  Sparkles,
  ThumbsUp, CheckCheck, Loader2, Store,
  VerifiedIcon,
  Smartphone,
  Download,
  Wrench,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  Zap,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useServiceCart } from '@/context/ServiceCartContext';
import { AdSenseUnit } from '@/components/sell-buy/ads/AdSenseUnit';
import { ADSENSE_CONFIG } from '@/config/adsense';
import { useLocationContext } from '@/context/LocationContext';
import DOMPurify from 'dompurify';
import { AmcServiceCoverage } from '@/components/amc/AmcServiceCoverage';
import { fetchCategories, fetchSubcategoriesByCategorySlug } from '@/lib/api';

const DEFAULT_APPLIANCE_SUBCATEGORIES = [
  {
    _id: 'sub_tv',
    title: 'TV Repair & Installation',
    subtitle: 'LED, LCD, Smart TV, Screen, Motherboard & Sound fixes',
    icon: '📺',
    badge: 'Popular',
    href: '/appliance-repairs',
  },
  {
    _id: 'sub_ac',
    title: 'AC Repair & Deep Jet Service',
    subtitle: 'Deep Jet Cleaning, Gas Refill, Cooling & PCB repair',
    icon: '❄️',
    badge: 'Seasonal Deal',
    href: '/appliance-repairs',
  },
  {
    _id: 'sub_wm',
    title: 'Washing Machine Service',
    subtitle: 'Front & Top load, Drum, Motor, Drainage & PCB issues',
    icon: '🧺',
    badge: 'Quick Fix',
    href: '/appliance-repairs',
  },
  {
    _id: 'sub_fridge',
    title: 'Refrigerator Repair',
    subtitle: 'Single & Double Door, Compressor, Gas charging & Cooling',
    icon: '🧊',
    badge: 'Fast Support',
    href: '/appliance-repairs',
  },
  {
    _id: 'sub_micro',
    title: 'Microwave & Kitchen Care',
    subtitle: 'Heating issues, Magnetron, Turntable & Control Panel repair',
    icon: '🍲',
    badge: 'Expert Care',
    href: '/appliance-repairs',
  },
  {
    _id: 'sub_ro',
    title: 'Water Purifier (RO) Service',
    subtitle: 'Filter change, Membrane replacement, TDS & Taste control',
    icon: '💧',
    badge: 'Essential',
    href: '/appliance-repairs',
  },
  {
    _id: 'sub_chimney',
    title: 'Kitchen Chimney Service',
    subtitle: 'Deep duct cleaning, motor repair, filter change & oil cup fix',
    icon: '💨',
    badge: 'Trending',
    href: '/appliance-repairs',
  },
  {
    _id: 'sub_geyser',
    title: 'Geyser & Water Heater',
    subtitle: 'Thermostat replacement, element repair, water leak & scaling',
    icon: '🔥',
    badge: 'Verified',
    href: '/appliance-repairs',
  },
  {
    _id: 'sub_hob',
    title: 'Gas Stove & Kitchen Hob',
    subtitle: 'Burner cleaning, flame issues, gas leak & auto-ignition repair',
    icon: '⚡',
    badge: 'Top Rated',
    href: '/appliance-repairs',
  },
  {
    _id: 'sub_cooler',
    title: 'Air Cooler Repair & Pump',
    subtitle: 'Motor rewinding, pump replacement, wiring & pad cleaning',
    icon: '🌬️',
    badge: 'Quick Fix',
    href: '/appliance-repairs',
  },
  {
    _id: 'sub_dish',
    title: 'Dishwasher Maintenance',
    subtitle: 'Spray arm, water leakage, drainage pump & error code repair',
    icon: '🍽️',
    badge: 'Specialist',
    href: '/appliance-repairs',
  },
  {
    _id: 'sub_inverter',
    title: 'Inverter & UPS Service',
    subtitle: 'Battery charging, backup issues, PCB fix & wiring check',
    icon: '🔋',
    badge: 'Safe & Verified',
    href: '/appliance-repairs',
  },
];

// ── Map Configuration ──
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const MAP_OPTIONS = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
    { featureType: 'transit', elementType: 'geometry.fill', stylers: [{ color: '#037166' }] },
    { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit.station.bus', stylers: [{ visibility: 'off' }] },
  ],
};

const GREEN_DOT = {
  url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  scaledSize: { width: 44, height: 44 },
  anchor: { x: 22, y: 44 },
};

const CENTER_LOGO = {
  url: '/servicecenterpointlogo.png',
  scaledSize: { width: 38, height: 50 },
  anchor: { x: 19, y: 50 },
};

const getServiceFallbackImage = (name = '', subcategoryName = '') => {
  const n = (name || '').toLowerCase();
  const sub = (subcategoryName || '').toLowerCase();
  const text = `${n} ${sub}`;

  // 1. Check specific service name first
  if (n.includes('inspect') || n.includes('diagnos') || n.includes('visit') || n.includes('doorstep')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('hardware') || n.includes('component') || n.includes('ram')) {
    return 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('motherboard') || n.includes('chip') || n.includes('circuit') || n.includes('ic')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('data') || n.includes('recovery') || n.includes('backup') || n.includes('hdd') || n.includes('ssd')) {
    return 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('screen') || n.includes('display') || n.includes('panel')) {
    return 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('charging') || n.includes('port') || n.includes('power')) {
    return 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('virus') || n.includes('malware') || n.includes('security')) {
    return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('software') || n.includes('os') || n.includes('windows')) {
    return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('clean')) {
    return 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('network') || n.includes('wifi') || n.includes('setup')) {
    return 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('laptop')) {
    return 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('desktop') || n.includes('computer') || n.includes('pc')) {
    return 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&auto=format&fit=crop&q=80';
  }

  // 2. Appliance checks
  if (text.includes('refrigerat') || text.includes('fridge')) {
    return 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('wash') || text.includes('laundry')) {
    return 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('tv') || text.includes('television')) {
    return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('microwave') || text.includes('oven')) {
    return 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('ac') || text.includes('air condition')) {
    return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80';
  }

  if (sub.includes('laptop')) {
    return 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80';
  }
  if (sub.includes('desktop') || sub.includes('computer')) {
    return 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&auto=format&fit=crop&q=80';
  }

  return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80';
};

const resolveServiceImageUrl = (imagePath, serviceName = '', subcategoryName = '') => {
  const fallback = getServiceFallbackImage(serviceName, subcategoryName);
  if (!imagePath || typeof imagePath !== 'string') return fallback;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;

  const clean = imagePath.replace(/^\/+/, '');
  // Uploads live on devapis.doorstephub.com
  return `https://devapis.doorstephub.com/${clean}`;
};

export function StoreDetailPage({ storeId, serviceId, onBack }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Service Rates');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [reviewsToShow, setReviewsToShow] = useState(3);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [faqActiveIndex, setFaqActiveIndex] = useState(null);

  // API data state
  const [loading, setLoading] = useState(true);
  const [centerData, setCenterData] = useState(null);
  const [resolvedProviderId, setResolvedProviderId] = useState(null); // Always a real MongoDB _id
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [bannerImage, setBannerImage] = useState('');
  const [aboutBio, setAboutBio] = useState('');
  const [locationData, setLocationData] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);

  // Subcategory filtering states
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('all');
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Tabs scroll reference and logic
  const tabsRef = useRef(null);
  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Subcategory horizontal scroll ref & state
  const subcatScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [dynamicApplianceSubcategories, setDynamicApplianceSubcategories] = useState(DEFAULT_APPLIANCE_SUBCATEGORIES);

  const checkSubcatScroll = useCallback(() => {
    if (subcatScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = subcatScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  const scrollSubcategories = (direction) => {
    if (subcatScrollRef.current) {
      const scrollAmount = subcatScrollRef.current.clientWidth * 0.85;
      subcatScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkSubcatScroll, 400);
    }
  };

  // Addons popup state
  const [showAddonsPopup, setShowAddonsPopup] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [addonsData, setAddonsData] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [loadingAddons, setLoadingAddons] = useState(false);

  // Get service cart functions from context
  const { addToCart: addToServiceCart, clearCart } = useServiceCart();
  // Get user's real location
  const { location, isMapsLoaded } = useLocationContext();

  // Fetch subcategories once resolvedProviderId is determined
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!resolvedProviderId) return;
      setLoadingSubcategories(true);
      try {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/service_center_subcategories/${resolvedProviderId}`;
        console.log('Fetching subcategories from:', url);
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          console.log('Subcategories loaded:', data);
          if (data.success) {
            const list = data.subcategories || data.data || [];
            setSubcategories(list);
            if (list.length > 0) {
              const firstId = list[0].subcategoryId || list[0]._id || list[0].id;
              setSelectedSubcategoryId(firstId);
              // Trigger the service load for this subcategory by default
              handleSubcategoryTabChange(firstId);
            } else {
              // No subcategories, show all services
              setSelectedSubcategoryId('all');
              handleSubcategoryTabChange('all');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [resolvedProviderId]);

  // Load all appliance repair subcategories dynamically for the exploration carousel
  useEffect(() => {
    let isMounted = true;
    const loadDynamicSubcategories = async () => {
      try {
        const cats = await fetchCategories(location);
        if (!isMounted || !Array.isArray(cats) || cats.length === 0) return;

        const results = await Promise.allSettled(
          cats.slice(0, 10).map((cat) =>
            fetchSubcategoriesByCategorySlug(cat.slug, location).then((subs) => ({
              catName: cat.name,
              catSlug: cat.slug,
              subs,
            }))
          )
        );

        if (!isMounted) return;
        const merged = [];
        const badgeList = ['Popular', 'Quick Fix', 'Seasonal Deal', 'Fast Support', 'Expert Care', 'Essential', 'Top Rated', 'Verified'];
        const iconList = ['📺', '❄️', '🧺', '🧊', '🍲', '💧', '💨', '🔥', '⚡', '🌬️', '🍽️', '🔋'];
        let idx = 0;

        results.forEach((res) => {
          if (res.status === 'fulfilled' && Array.isArray(res.value?.subs)) {
            res.value.subs.forEach((sub) => {
              merged.push({
                _id: sub._id,
                title: sub.name,
                subtitle: sub.title || sub.description || `Expert doorstep repair & service for ${sub.name}`,
                icon: sub.image ? (
                  <img
                    src={sub.image.startsWith('http') ? sub.image : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${sub.image}`}
                    alt={sub.name}
                    className="w-7 h-7 object-contain rounded-lg"
                  />
                ) : iconList[idx % iconList.length],
                badge: badgeList[idx % badgeList.length],
                href: sub.slug ? `/${sub.slug}` : `/appliance-repairs`,
              });
              idx++;
            });
          }
        });

        if (merged.length > 0) {
          setDynamicApplianceSubcategories(merged);
        }
      } catch (err) {
        console.error('Failed to load dynamic appliance subcategories:', err);
      }
    };

    loadDynamicSubcategories();
    return () => {
      isMounted = false;
    };
  }, [location?.lat, location?.lng]);

  // Handle subcategory filtering
  const handleSubcategoryTabChange = async (subcatId) => {
    setSelectedSubcategoryId(subcatId);
    setLoading(true);
    try {
      const providerId = resolvedProviderId || storeId;
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/service_center_services/${providerId}`;
      if (subcatId && subcatId !== 'all') {
        url += `?subcategoryId=${subcatId}`;
      }

      console.log('Fetching services for subcategory:', subcatId, 'from:', url);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const rawServices = data.services || data.data?.services || [];
          const mappedServices = rawServices.map(s => ({
            id: s._id || s.id,
            name: s.name || s.title,
            description: s.description || s.bio,
            price: s.price || s.minFare || s.inspectionCost || 0,
            image: s.image || s.logo,
            rating: s.rating || 4.5,
            totalOrders: s.totalOrders || 0,
            duration: s.duration || '60 mins',
            subcategoryName: s.subcategoryName,
            subcategoryId: s.subcategoryId || s.subCategoryId || null,
            categoryId: s.categoryId || s.bookingCategoryId || null,
            bannerImages: s.banner_images || []
          }));
          setServices(mappedServices);
        }
      }
    } catch (error) {
      console.error('Error fetching filtered services:', error);
      toast.error('Failed to load services for this subcategory');
    } finally {
      setLoading(false);
    }
  };

  // Fetch service center details from API
  useEffect(() => {
    let interval;
    if (lightboxIndex !== null && portfolioImages.length > 1) {
      interval = setInterval(() => {
        setLightboxIndex((prev) => (prev + 1) % portfolioImages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [lightboxIndex, portfolioImages.length]);

  useEffect(() => {
    const fetchCenterDetails = async () => {
      setLoading(true);
      try {
        let resolvedStoreId = storeId;

        // If storeId is not a valid MongoDB ID (24 hex chars), treat it as a slug
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(storeId);

        if (isMongoId) {
          // Already a real ID — use directly
          setResolvedProviderId(storeId);
        } else {
          // Resolve slug to real MongoDB _id
          try {
            const centersRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/get_service_center`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lattitude: location?.lat ?? 17.3850,  // Use real user location, fallback to Hyderabad
                longitude: location?.lng ?? 78.4867,
                page: 1,
                limit: 100
              })
            });
            const centersData = await centersRes.json();
            if (centersData.success && Array.isArray(centersData.nearByServiceCenters)) {
              const generateSlug = (name) => name?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';
              const matched = centersData.nearByServiceCenters.find(c =>
                c.slug === storeId ||
                c._id === storeId ||
                generateSlug(c.business_name || c.name) === storeId
              );
              if (matched) {
                resolvedStoreId = matched._id;
                setResolvedProviderId(matched._id);
                console.log('Resolved slug to provider _id:', matched._id);
              }
            }
          } catch (resError) {
            console.error('Error resolving slug to ID:', resError);
          }
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/service_center_services/${resolvedStoreId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch service center details');
        }

        const data = await response.json();

        if (data.success) {
          // Set center data
          const center = data.nearByServiceCenters?.[0] || data.data || data.serviceCenter;
          setCenterData(center);

          // If we still don't have a resolved provider ID, extract it from center data
          if (center?._id) {
            setResolvedProviderId(prev => prev || center._id);
          }



          // Set reviews
          setReviews(data.reviews || center?.reviews || []);

          // Set portfolio images
          const portfolioUrls = data.portfolio?.images?.map((img) =>
            `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${img.startsWith('/') ? img.slice(1) : img}`
          ) || [];
          setPortfolioImages(portfolioUrls);

          // Set banner image
          if (data.banner_image) {
            setBannerImage(`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${data.banner_image}`);
          }

          // Set about bio
          setAboutBio(data.about?.bio || '');

          // Set location data
          setLocationData(data.location || null);

          console.log('Service center data loaded:', data);
        }
      } catch (error) {
        console.warn('[StoreDetailPage] Service center slug not directly found, falling back to instant doorstep booking view:', error);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchCenterDetails();
    }
  }, [storeId, location?.lat, location?.lng]);

  // Fetch Global Settings for App Links
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

  // Keep users on the detail route if center data is temporarily unavailable.
  // The previous forced redirect caused valid slug detail views to bounce to home.

  // Pre-select serviceId if provided
  useEffect(() => {
    if (serviceId && services.length > 0) {
      if (!selectedPackages.includes(serviceId)) {
        setSelectedPackages([serviceId]);
      }
    }
  }, [serviceId, services]);

  // Get center data or use fallback
  const center = centerData || {
    firstName: 'Loading',
    lastName: '...',
    address: 'Loading address...',
    avgRating: 0,
    totalRatings: 0,
    totalOrders: 0,
    BasePrice: 0,
    inspectionCost: 0,
    serviceBookingCost: 0
  };
  const whatsappLink = 'https://wa.me/918886688666';
  const businessName = center.business_name || `${center.firstName || ''} ${center.lastName || ''}`.trim() || 'Service Center';

  const handleSelectPackage = (packageId) => {
    setSelectedPackages(prev =>
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  // Fetch service addons
  const fetchServiceAddons = async (serviceId) => {
    setLoadingAddons(true);
    try {
      console.log('Fetching addons for service:', serviceId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/service-addons`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceIds: [serviceId],
            providerId: resolvedProviderId || storeId
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch addons');
      }

      const data = await response.json();
      console.log('Addons API response:', data);

      if (data.success && data.data && data.data.length > 0) {
        return data.data[0]; // Return first item with addons
      }
      return null;
    } catch (error) {
      console.error('Error fetching addons:', error);
      return null;
    } finally {
      setLoadingAddons(false);
    }
  };

  const handleAddToCart = async (service) => {
    console.log('Add to cart clicked for service:', service);
    // Store current service
    setCurrentService(service);

    // Check for addons
    const addons = await fetchServiceAddons(service.id);

    if (addons && addons.addons && addons.addons.length > 0) {
      // Show popup if addons exist
      console.log('Showing addons popup with data:', addons);
      setAddonsData(addons);
      setSelectedAddons([]); // Reset selected addons
      setShowAddonsPopup(true);
    } else {
      // No addons, add directly to cart
      console.log('No addons found, adding directly to cart');
      addServiceToCart(service, []);
    }
  };

  const addServiceToCart = async (service, addons = []) => {
    try {
      // Step 1: Clear the cart first
      console.log('Clearing cart before adding new items...');
      await clearCart();

      // Step 2: Add parent service
      console.log('Adding parent service to cart:', service);
      const parentAdded = await addToServiceCart(
        resolvedProviderId || storeId, // Use real MongoDB _id, not slug
        service.id,                    // itemId
        'service',                     // itemType
        1                              // quantity
      );

      if (!parentAdded) {
        toast.error('Failed to add service to cart');
        return;
      }

      // Step 3: Add selected addons
      if (addons.length > 0) {
        console.log('Adding addons to cart:', addons);
        for (const addon of addons) {
          await addToServiceCart(
            resolvedProviderId || storeId, // Use real MongoDB _id, not slug
            addon._id,                     // itemId (addons use _id)
            'addon',                       // itemType
            1,                             // quantity
            service.id                     // parentServiceId
          );
        }
      }

      // Close popup and navigate to address
      setShowAddonsPopup(false);
      localStorage.setItem('service_cart_flow', 'true');
      router.push('/appliances/address');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add items to cart');
    }
  };

  const handleContinueWithAddons = () => {
    if (currentService) {
      const selected = addonsData.addons.filter(addon =>
        selectedAddons.includes(addon._id)
      );
      addServiceToCart(currentService, selected);
    }
  };

  const handleSkipAddons = () => {
    if (currentService) {
      addServiceToCart(currentService, []);
    }
  };

  const toggleAddonSelection = (addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleContinueBooking = async () => {
    if (selectedPackages.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Clear the cart first
      console.log('Clearing cart before adding multiple items...');
      await clearCart();

      // Step 2: Add all selected services
      const servicesToAdd = services.filter(s => selectedPackages.includes(s.id));
      console.log('Adding multiple services to cart:', servicesToAdd);

      for (const service of servicesToAdd) {
        await addToServiceCart(
          resolvedProviderId || storeId,
          service.id,
          'service',
          1
        );
      }

      // Step 3: Navigate to address
      localStorage.setItem('service_cart_flow', 'true');
      router.push('/appliances/address');
    } catch (error) {
      console.error('Error in multiple selection cart update:', error);
      toast.error('Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const ShimmerServiceCard = () => (
    <div className="h-[280px] rounded-2xl bg-white border border-gray-100 overflow-hidden relative flex flex-col">
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent" />
      <div className="w-full h-32 bg-gray-100 flex-shrink-0" />
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1.5">
          <div className="h-3.5 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-2.5 w-1/2 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
        <div className="h-7 w-full bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  );


  if (loading) {
    return (
      <div className="appliance-detail-page min-h-screen pt-24 pb-20 bg-gray-50/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button skeleton */}
          <div className="h-9 w-20 bg-gray-200 rounded-full animate-pulse mb-6" />
          {/* Hero skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-[4.5fr_3.8fr_1.7fr] gap-6 mb-8">
            <div className="h-[250px] rounded-2xl bg-gray-200 animate-pulse" />
            <div className="h-[250px] rounded-2xl bg-gray-100 animate-pulse" />
            <div className="h-[250px] rounded-2xl bg-gray-100 animate-pulse" />
          </div>
          {/* Content skeleton */}
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-4">
              <div className="h-10 w-2/3 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-gray-100 rounded animate-pulse" />
              {[1,2,3].map(i => (
                <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
              <div className="h-14 rounded-2xl bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!centerData) {
    const formattedTitle = storeId
      ? storeId
          .replace(/[-_]+/g, ' ')
          .trim()
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ')
      : 'Doorstep Appliance Repair & Service';

    const playStoreUrl =
      globalSettings?.customerAndroidAppLink ||
      'https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share';
    const appStoreUrl =
      globalSettings?.customerIosAppLink ||
      'https://apps.apple.com/in/app/doorstep-hub/id6475340236';

    return (
      <div className="appliance-detail-page min-h-screen pt-20 pb-20 bg-[#F8FAFC]">
        {/* Top Breadcrumb */}
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 flex-wrap">
            <button onClick={() => router.push('/')} className="hover:text-[#037166] transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => router.push('/appliance-repairs')} className="hover:text-[#037166] transition-colors">Appliance Repairs</button>
            <span>/</span>
            <span className="text-gray-800 font-semibold truncate max-w-[280px] sm:max-w-md">{formattedTitle}</span>
          </div>
        </div>

        {/* Hero Banner Section */}
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#003831] via-[#025951] to-[#037166] text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-white/10">
            {/* Background Glows */}
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#04a99d]/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#FF4900]/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 xl:col-span-8 space-y-5 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-[#6ee7b7]">
                  <Sparkles className="w-4 h-4 text-[#34d399]" />
                  <span>Doorstep Hub Appliance Service</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                  Looking for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5eead4] to-[#fef08a]">{formattedTitle}</span>?
                </h1>

                <p className="text-white/85 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal">
                  Doorstep Hub verified expert technicians provide fast on-site repair, genuine spare parts, and a <strong className="text-white font-semibold">30-day service warranty</strong> right at your doorstep. No waiting, no confusion!
                </p>

                {/* Direct Action Buttons in One Row */}
                <div className="pt-2 flex items-center gap-2 sm:gap-2.5 flex-wrap lg:flex-nowrap">
                  <button
                    onClick={() => router.push('/appliance-repairs')}
                    className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-semibold text-xs sm:text-sm hover:-translate-y-0.5 transition-all whitespace-nowrap flex-shrink-0"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Browse All Services</span>
                  </button>
                 
                 
                  <button
                    onClick={() => router.push('/book-appointment')}
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-4.5 py-3 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF4900] hover:from-[#ff7a1a] hover:to-[#e04000] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#FF4900]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all whitespace-nowrap flex-shrink-0"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Instant Appointment</span>
                  </button>

                 

                  <a
                    href={`https://wa.me/918886688666?text=${encodeURIComponent(`Hi, I need doorstep repair service for ${formattedTitle}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs sm:text-sm hover:-translate-y-0.5 transition-all shadow-md whitespace-nowrap flex-shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Us</span>
                  </a>

        
                </div>

                {/* Quick Trust Pillars */}
                <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/15">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#34d399] flex-shrink-0" />
                    <span className="text-xs text-white/90 font-medium">Doorstep in 60 Mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#34d399] flex-shrink-0" />
                    <span className="text-xs text-white/90 font-medium">30-Day Warranty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-[#34d399] flex-shrink-0" />
                    <span className="text-xs text-white/90 font-medium">Verified Experts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                    <span className="text-xs text-white/90 font-medium">4.8★ Top Rated</span>
                  </div>
                </div>
              </div>

              {/* Right: Quick Booking Card / Visual Showcase */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-7 shadow-xl text-left space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/15">
                    <div>
                      <p className="text-xs font-semibold text-[#6ee7b7] uppercase tracking-wider">Fast Home Service</p>
                      <h3 className="text-lg font-bold text-white">Instant Service Request</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF6B00] to-[#FF4900] flex items-center justify-center text-white shadow-md">
                      <Zap className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                    Skip the hassle of visiting a service center. Tell us your issue, and our nearest verified technician will visit your location.
                  </p>

                  <div className="space-y-2 text-xs sm:text-sm text-white/90">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="w-6 h-6 rounded-full bg-[#037166] text-white flex items-center justify-center text-xs font-bold">1</span>
                      <span>Select your appliance & problem</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="w-6 h-6 rounded-full bg-[#037166] text-white flex items-center justify-center text-xs font-bold">2</span>
                      <span>Technician arrives at your selected time</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="w-6 h-6 rounded-full bg-[#037166] text-white flex items-center justify-center text-xs font-bold">3</span>
                      <span>Inspect, repair & pay after service completion</span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push('/book-appointment')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#04a99d] to-[#037166] hover:from-[#05b8ab] hover:to-[#025951] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Schedule Booking Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stylish Mobile App Download Banner */}
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c1a17] via-[#091411] to-[#040e0b] border border-[#037166]/30 text-white p-6 sm:p-10 lg:p-12 shadow-xl">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-[#037166]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#037166]/20 border border-[#037166]/40 text-xs font-semibold text-[#2dd4bf]">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>DOORSTEP HUB MOBILE APP</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Download Doorstep Hub App — <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2dd4bf] to-[#99f6e4]">Bookings Made Effortless</span>
                </h2>

                <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Get 1-click doorstep appliance repairs, real-time live GPS technician tracking, transparent pricing, and instant customer chat support right on your phone.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <a
                    href={playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-40 sm:w-44 h-12 sm:h-14 bg-gradient-to-br from-[#037166] to-[#04a99d] rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden border border-[#037166]/30 p-2"
                    title="Get it on Google Play"
                  >
                    <img src="/andriod1.png" alt="Google Play" className="h-full w-auto object-contain brightness-0 invert opacity-95" loading="lazy" />
                  </a>

                  <a
                    href={appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-40 sm:w-44 h-12 sm:h-14 bg-gradient-to-br from-[#037166] to-[#04a99d] rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden border border-[#9ecbc3] p-2"
                    title="Download on App Store"
                  >
                    <img src="/apple2.png" alt="App Store" className="h-full w-auto object-contain brightness-0 invert opacity-95" loading="lazy" />
                  </a>

                  <div className="flex items-center gap-2 pl-2">
                    <div className="flex text-amber-400">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-xs sm:text-sm text-white/80 font-medium">4.8 / 5 Rating</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <div className="w-full max-w-xs rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[#037166] text-white flex items-center justify-center shadow-lg shadow-[#037166]/40">
                    <Download className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-white">App-Exclusive Benefits</h4>
                  <ul className="text-xs text-white/70 space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2dd4bf] flex-shrink-0" />
                      <span>Instant ₹100 Welcome Bonus</span>
                    </li>
                     <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2dd4bf] flex-shrink-0" />
                      <span>Book Service With ₹99 and pay only ₹175 after service completion </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2dd4bf] flex-shrink-0" />
                      <span>Real-time tracking of technician</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2dd4bf] flex-shrink-0" />
                      <span>Easy 1-tap re-booking & warranty claims</span>
                    </li>
                  </ul>
                  <a
                    href={playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full py-2.5 rounded-xl bg-white text-[#003831] font-bold text-xs hover:bg-gray-100 transition-colors"
                  >
                    Download App Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Services & Subcategories Horizontal Scroll with Manual Left/Right Chevrons */}
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-left">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#037166] uppercase tracking-wider">Explore Services</p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Popular Appliance Repairs at Doorstep</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollSubcategories('left')}
                disabled={!canScrollLeft}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all hover:border-[#037166]/40"
                aria-label="Previous subcategories"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollSubcategories('right')}
                disabled={!canScrollRight}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all hover:border-[#037166]/40"
                aria-label="Next subcategories"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => router.push('/appliance-repairs')}
                className="hidden sm:inline-flex text-sm font-bold text-[#037166] hover:text-[#04a99d] items-center gap-1 transition-colors ml-2"
              >
                <span>View All Categories</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={subcatScrollRef}
            onScroll={checkSubcatScroll}
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {dynamicApplianceSubcategories.map((srv, idx) => (
              <div
                key={srv._id || idx}
                className="flex-shrink-0 w-[185px] sm:w-[195px] lg:w-[calc((100%-5*16px)/6)] group relative rounded-2xl bg-white border border-gray-200/80 p-3.5 sm:p-4 hover:shadow-xl hover:border-[#037166]/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5 mb-2.5">
                    <span className="text-2xl p-1.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center min-w-[36px] min-h-[36px]">
                      {srv.icon}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#037166]/10 text-[#037166] whitespace-nowrap">
                      {srv.badge}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#037166] transition-colors line-clamp-2 min-h-[34px]">
                    {srv.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-snug line-clamp-2 font-normal">
                    {srv.subtitle}
                  </p>
                </div>

                <div className="pt-2.5 mt-3 border-t border-gray-100 flex items-center justify-between gap-1">
                  <span className="text-[10px] font-semibold text-gray-400 truncate">In 60 Mins</span>
                  <button
                    type="button"
                    onClick={() => router.push(srv.href || '/appliance-repairs')}
                    className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-md bg-[#037166] hover:bg-[#025951] text-white text-[11px] font-bold shadow-sm transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    <span>Book Now</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Doorstep Hub */}
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-left">
          <div className="rounded-2xl bg-white border border-gray-200/80 p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-6">
              Why Customers Trust Doorstep Hub
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#EBF7F6] text-[#037166] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">30-Day Warranty</h4>
                <p className="text-xs text-gray-500">Free re-check guarantee on every completed repair</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#EBF7F6] text-[#037166] flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">Verified Technicians</h4>
                <p className="text-xs text-gray-500">100% background-checked & certified professionals</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#EBF7F6] text-[#037166] flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">60-Minute Response</h4>
                <p className="text-xs text-gray-500">Quick arrival with genuine replacement parts</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#EBF7F6] text-[#037166] flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">Upfront Estimates</h4>
                <p className="text-xs text-gray-500">No hidden surprises, fixed transparent rate card</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generate Schema.org JSON-LD for Local SEO
  const schemaData = centerData ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": centerData.business_name || `${centerData.firstName} ${centerData.lastName}`,
    "image": (centerData.image || centerData.logo)
      ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${centerData.image || centerData.logo}`.replace(/([^:]\/)\/+/g, "$1")
      : "https://doorstephub.com/d-hub-logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": centerData.cityName || centerData.city || "",
      "addressRegion": centerData.stateName || centerData.state || "",
      "addressCountry": "India",
      "streetAddress": centerData.address
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": centerData.lattitude || centerData.latitude,
      "longitude": centerData.longitude || centerData.longitude
    },
    "url": typeof window !== 'undefined' ? window.location.href : '',
    "telephone": centerData.phone || "+918886688666",
    "areaServed": centerData.cityName || centerData.city || "",
    "serviceType": centerData.speciality || "Appliance Repair Services",
    "aggregateRating": centerData.avgRating ? {
      "@type": "AggregateRating",
      "ratingValue": centerData.avgRating,
      "reviewCount": centerData.totalRatings || centerData.reviews?.length || 10
    } : undefined
  } : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="appliance-detail-page min-h-screen pt-24 pb-28 lg:pb-20 bg-gray-50/30"
    >
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => onBack ? onBack() : router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 mb-4 sm:mb-8 rounded-full bg-white border border-black text-gray-700 hover:bg-gray-50 hover:text-[#037166] transition-all text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Hero Image Gallery - 3 Cards Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 sm:mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[4.5fr_3.8fr_250px] gap-4 sm:gap-5">

            {/* CARD 1: BANNER IMAGE CARD */}
            <div className="relative w-full h-28 sm:h-44 lg:h-[230px] rounded-2xl border border-gray-100 shadow-lg overflow-hidden bg-white flex items-center justify-center">
              {bannerImage ? (
                <img
                  src={bannerImage}
                  alt={center.business_name}
                  className="w-full h-full object-cover"
                  fetchpriority="high"
                  loading="eager"
                  decoding="sync"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-[#037166]/10" />
                </div>
              )}
            </div>

            {/* CARD 2: STORE INFO CARD */}
            <div className="relative h-auto lg:h-[230px] bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-start sm:items-center gap-3 mb-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white flex items-center justify-center">
                      {(center.logo || center.image) ? (
                        <img loading="lazy" decoding="async"
                          src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${(center.logo || center.image).startsWith('/') ? (center.logo || center.image).slice(1) : (center.logo || center.image)}`}
                          alt={`${businessName} Logo`}
                          className="w-full h-full object-contain bg-white"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1667503779301-3120a323859a?auto=format&fit=crop&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                          <Store className="w-7 h-7 text-[#037166]/20" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight mb-1 truncate">
                      {center.title || center.business_name || `${center.firstName || ''} ${center.lastName || ''}`}
                    </h1>
                    {center.description && (
                      <p className="text-gray-500 text-xs sm:text-sm mb-1.5 leading-relaxed line-clamp-2">
                        {center.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[#037166] text-[#037166]" />
                        <span className="text-gray-900 font-bold text-xs sm:text-sm">{(center.avgRating || center.rating)?.toFixed(1) || '4.5'}</span>
                        <span className="text-gray-400 text-[10px] sm:text-xs">({center.totalRatings || center.reviews?.length || 0})</span>
                      </div>

                      <div className="px-2 py-0.5 rounded-full bg-[#037166]/5 border border-[#037166]/10 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#037166]" />
                        <span className="text-[#037166] text-[10px] font-bold">Express Service</span>
                      </div>
                      <div className="px-2 py-0.5 rounded-full bg-[#037166]/5 border border-[#037166]/10 flex items-center gap-1">
                        <VerifiedIcon className="w-3 h-3 text-[#037166]" />
                        <span className="text-[#037166] text-[10px] font-bold">Verified Partner</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-2">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-[#037166] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-xs sm:text-sm font-medium line-clamp-2">
                      {center.address}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#037166]/10">
                      <CheckCheck className="w-2.5 h-2.5 text-[#037166]" />
                    </div>
                    <span className="text-gray-700 text-xs sm:text-sm font-semibold">
                      {center.totalOrders || 0}+ Jobs Done
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-2.5 mt-3">
                    <a
                      href={globalSettings?.customerAndroidAppLink || "https://play.google.com/store/apps/details?id=com.doorstephub.customer"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-24 sm:w-28 md:w-32 h-9 sm:h-10 rounded-full bg-[#DEF2EF] hover:bg-[#cbece6] transition-all border border-[#9ecbc3]/50 shadow-sm overflow-hidden p-0.5"
                      title="Get it on Google Play"
                    >
                      <img src="/andriod1.png" alt="Google Play" className="h-full w-auto object-contain" loading="lazy" decoding="async" />
                    </a>
                    <a
                      href={globalSettings?.customerIosAppLink || "https://apps.apple.com/in/app/doorstep-hub/id6475340236"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-24 sm:w-28 md:w-32 h-9 sm:h-10 rounded-full bg-[#DEF2EF] hover:bg-[#cbece6] transition-all border border-[#9ecbc3]/50 shadow-sm overflow-hidden p-0.5"
                      title="Download on the App Store"
                    >
                      <img src="/apple2.png" alt="App Store" className="h-full w-auto object-contain" loading="lazy" decoding="async" />
                    </a>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-[#25D366] hover:bg-[#20bd5a] transition-all border border-[#1da851]/40 shadow-sm shrink-0"
                      title="Chat on WhatsApp"
                      aria-label="Chat on WhatsApp"
                    >
                      <img loading="lazy" decoding="async"
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                        alt="WhatsApp"
                        className="w-4 sm:w-5 h-4 sm:h-5"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: STORE TIMINGS CARD */}
            <div className="relative h-auto lg:h-[230px] bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-gray-100">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#037166]/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-[#037166]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight truncate">Working Hours</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Open Now</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Monday - Saturday</span>
                    <span className="text-gray-800 text-xs sm:text-sm font-extrabold block">
                      {center.opening_time && center.closing_time
                        ? `${center.opening_time} - ${center.closing_time}`
                        : center.timings || "09:00 AM - 08:00 PM"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Sunday</span>
                    <span className="text-gray-800 text-xs sm:text-sm font-extrabold block">
                      {center.sunday_opening_time && center.sunday_closing_time
                        ? `${center.sunday_opening_time} - ${center.sunday_closing_time}`
                        : "11:00 AM - 04:00 PM"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-center">
                <span className="inline-flex w-auto max-w-[210px] flex-col items-center justify-center rounded-full px-4 py-1.5 text-white bg-gradient-to-r from-[#00907f] to-[#007367] text-center shadow-md">
                  <span className="text-[9px] font-bold tracking-wider uppercase text-white/90">Available For</span>
                  <span className="text-xs font-extrabold whitespace-nowrap">24/7 Booking</span>
                </span>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Sticky Tab Navigation */}
        <div className="sticky top-16 sm:top-20 z-40 mb-6 sm:mb-8 bg-[#DEF2EF]/90 backdrop-blur-xl border-y border-[#9ecbc3]/40 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
              {(() => {
                const faqs = centerData?.faqs || center?.faqs || [];
                const tabsList = ['Service Rates', 'About', 'Working Images', 'Location', 'Reviews'];
                if (faqs && faqs.length > 0) {
                  tabsList.push('FAQs');
                }
                return tabsList.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab
                      ? 'bg-[#037166] text-white shadow-md shadow-[#037166]/20'
                      : 'text-gray-600 hover:text-[#037166] hover:bg-[#037166]/10'
                      }`}
                  >
                    {tab}
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'Service Rates' && (
            <motion.div
              key="Service Rates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header & Subcategory Filter Tabs */}
              <div className="mb-8 w-full px-1 border-b border-gray-100 pb-6">
                <div className="mb-4">
                  <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1.5">Our Services & Rate Cards</h2>
                  <p className="text-gray-500 text-sm sm:text-base">Choose from our professional repair packages</p>
                </div>

                {/* Subcategory Filter Tabs */}
                {subcategories.length > 0 && (
                  <div className="relative flex items-center max-w-full shrink-0">
                    {/* Tabs Container */}
                    <div
                      ref={tabsRef}
                      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
                    >
                      {subcategories.map((subcat) => {
                        const id = subcat.subcategoryId || subcat._id || subcat.id;
                        return (
                          <button
                            key={id}
                            onClick={() => handleSubcategoryTabChange(id)}
                            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${selectedSubcategoryId === id
                              ? 'bg-[#037166] text-white border-[#037166] shadow-md shadow-[#037166]/20'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[#123F4A]'
                              }`}
                          >
                            {subcat.name}
                          </button>
                        );
                      })}
                    </div>

                  </div>
                )}
              </div>

              {/* Service Cards: 6 per row on desktop with responsive breakdown */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-8 w-full">
                  {Array.from({ length: 6 }).map((_, i) => <ShimmerServiceCard key={i} />)}
                </div>
              ) : services && services.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-8 w-full">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => handleSelectPackage(service.id)}
                      className={`group relative h-full bg-white border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col justify-between ${selectedPackages.includes(service.id)
                        ? 'border-[#037166] shadow-md shadow-[#037166]/10'
                        : 'border-gray-100 hover:border-[#037166]/40'
                        }`}
                    >
                      {/* Service Image */}
                      <div className="relative w-full h-32 sm:h-36 overflow-hidden bg-gray-50 flex-shrink-0">
                        <img
                          loading="lazy"
                          decoding="async"
                          src={resolveServiceImageUrl(service.image, service.name, service.subcategoryName)}
                          alt={service.name || 'Service Rate Card'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getServiceFallbackImage(service.name, service.subcategoryName);
                          }}
                        />

                        {/* Selected Tag */}
                        {selectedPackages.includes(service.id) && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#037166] text-white shadow-sm flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span className="text-[8px] font-bold uppercase tracking-wider">Selected</span>
                          </div>
                        )}

                        {/* Rating Badge */}
                        {service.rating && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-white/95 shadow-sm border border-gray-100 flex items-center gap-1 backdrop-blur-sm">
                            <Star className="w-2.5 h-2.5 fill-[#037166] text-[#037166]" />
                            <span className="text-gray-900 font-bold text-[9px]">{service.rating}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                        <div className="flex-1 mb-2">
                          <h4 className="text-[13px] sm:text-[14px] font-extrabold text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-[#037166] transition-colors">
                            {service.name}
                          </h4>

                          {service.subcategoryName && (
                            <div className="mb-1.5 inline-flex px-1.5 py-0.5 rounded bg-[#037166]/10 border border-[#037166]/20 max-w-full">
                              <span className="text-[#037166] text-[9px] font-semibold uppercase tracking-wide truncate">{service.subcategoryName}</span>
                            </div>
                          )}

                          {service.description && (
                            <div
                              className="text-gray-500 text-[10px] sm:text-[11px] font-normal line-clamp-2 leading-relaxed mb-2"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(service.description) }}
                            />
                          )}

                          <div className="mt-1">
                            <p className="text-gray-400 text-[9px] italic leading-tight">Starting from</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-base sm:text-lg font-extrabold text-[#037166] leading-none">₹{service.price}</span>
                              {service.priceUnit && (
                                <span className="text-gray-400 text-[9px] sm:text-[10px]">/{service.priceUnit}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer: Orders & CTA */}
                        <div className="flex flex-col gap-1.5 border-t border-gray-50 pt-2 mt-auto">
                          {service.totalOrders > 0 && (
                            <div className="flex items-center gap-1 text-gray-500 text-[10px] whitespace-nowrap">
                              <CheckCheck className="w-3 h-3 text-[#037166]" />
                              <span>{service.totalOrders} orders</span>
                            </div>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(service);
                            }}
                            className="w-full py-1.5 px-2 rounded-full bg-[#037166] text-white font-bold text-[11px] whitespace-nowrap hover:bg-[#04a99d] transition-all flex items-center justify-center gap-1 shadow-sm hover:shadow active:scale-95"
                          >
                            Choose Service
                            <ArrowLeft className="w-2.5 h-2.5 rotate-180" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">No services available at this center yet.</p>
                </div>
              )}

              {/* Action Buttons */}
              {services && services.length > 0 && (
                <div className="flex justify-center sm:justify-start gap-4 w-full mb-8">
                  <button
                    onClick={handleContinueBooking}
                    disabled={loading || selectedPackages.length === 0}
                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-gray-900 text-white font-bold hover:shadow-xl transition-all text-center flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Continue Booking (${selectedPackages.length})`}
                    {!loading && <ArrowLeft className="w-4 h-4 rotate-180" />}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'About' && (
            <motion.div
              key="About"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About {center.business_name}</h2>
              <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-8 shadow-sm">
                <div
                  className="text-gray-600 text-lg leading-relaxed whitespace-break-spaces [&_a]:text-[#037166] [&_a]:underline"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(aboutBio || '', {
                      ADD_ATTR: ['target', 'rel'],
                    })
                  }}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#037166]/30 transition-all shadow-sm">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#037166]/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#037166]" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Expert Technicians</h4>
                  </div>
                  <p className="text-gray-500 font-medium">Verified professionals with years of experience</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#037166]/30 transition-all shadow-sm">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#037166]/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-[#037166]" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 leading-tight">Service Warranty</h4>
                  </div>
                  <p className="text-gray-500 font-medium">All repairs backed by our guarantee</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#037166]/30 transition-all shadow-sm">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#037166]/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-[#037166]" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Same-Day Service</h4>
                  </div>
                  <p className="text-gray-500 font-medium">Fast turnaround for urgent repairs</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Working Images' && (
            <motion.div
              key="Working Images"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Work</h2>
              <p className="text-gray-500 mb-8">See examples of our repair and service projects</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {portfolioImages.length > 0 ? (
                  portfolioImages.map((image, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => setLightboxIndex(index)}
                      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm"
                    >
                      <img src={image} alt={`${businessName} Work ${index + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    No working images available
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'Location' && (
            <motion.div
              key="Location"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Our Location</h2>
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg mb-12">
                <div className="relative h-[500px] bg-gray-50">
                  {isMapsLoaded && locationData ? (
                    <GoogleMap
                      mapContainerStyle={MAP_CONTAINER_STYLE}
                      center={{ lat: parseFloat(locationData.latitude), lng: parseFloat(locationData.longitude) }}
                      zoom={15}
                      options={MAP_OPTIONS}
                    >
                      <Marker position={{ lat: parseFloat(locationData.latitude), lng: parseFloat(locationData.longitude) }} icon={CENTER_LOGO} />
                      {location && <Marker position={{ lat: location.lat, lng: location.lng }} icon={GREEN_DOT} />}
                    </GoogleMap>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Reviews' && (
            <motion.div
              key="Reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
              <div className="space-y-4">
                {reviews.slice(0, reviewsToShow).map((review, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                        {review.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-gray-900">{review.name}</h5>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-4 h-4 ${j < Math.floor(review.rating) ? 'fill-[#037166] text-[#037166]' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm font-medium">{review.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'FAQs' && (
            <motion.div
              key="FAQs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
              {(() => {
                const faqs = centerData?.faqs || center?.faqs || [];
                return faqs.length > 0 ? (
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div
                        key={index}
                        className={`border rounded-2xl overflow-hidden transition-all duration-300 ${faqActiveIndex === index
                            ? 'bg-white border-[#037166]/50 shadow-md shadow-[#037166]/5'
                            : 'bg-white border-gray-150 hover:border-[#cbd5e1]'
                          }`}
                      >
                        <button
                          onClick={() => setFaqActiveIndex(faqActiveIndex === index ? null : index)}
                          className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                        >
                          <span className="text-lg font-medium text-gray-900">
                            {faq.question || faq.title}
                          </span>
                          <span className="text-[#037166] flex-shrink-0">
                            <svg
                              className={`w-5 h-5 transition-transform duration-300 ${faqActiveIndex === index ? 'rotate-180' : ''
                                }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {faqActiveIndex === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-[#f1f5f9] pt-4">
                                {faq.answer || faq.description}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">No FAQs available yet</div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RESPONSIVE ADSENSE UNIT ── */}
        <div className="my-8">
          <AdSenseUnit slotId={ADSENSE_CONFIG.slots.categoryFeed} />
        </div>
      </div>

      <AnimatePresence>
        {showAddonsPopup && addonsData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddonsPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Add Related Services</h2>
                <button onClick={() => setShowAddonsPopup(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                {addonsData.addons.map((addon) => (
                  <div
                    key={addon._id}
                    onClick={() => toggleAddonSelection(addon._id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddons.includes(addon._id) ? 'bg-[#037166]/5 border-[#037166]' : 'bg-white border-gray-100'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${selectedAddons.includes(addon._id) ? 'bg-[#037166] border-[#037166]' : 'border-gray-200'}`}>
                        {selectedAddons.includes(addon._id) && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-gray-900 font-bold">{addon.childServiceName}</h4>
                        <div className="text-gray-500 text-xs" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(addon.description) }} />
                        <span className="text-[#037166] font-bold">₹{addon.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={handleSkipAddons} className="flex-1 py-3 rounded-full bg-gray-50 text-gray-400 font-bold">Skip</button>
                <button onClick={handleContinueWithAddons} className="flex-1 py-3 rounded-full bg-[#037166] text-white font-bold">Add Selected</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPackages.length > 0 && activeTab === 'Service Rates' && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[60] p-4 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl"
          >
            <div className="max-w-[1400px] mx-auto space-y-3">
              {(() => {
                const selectedId = selectedPackages[selectedPackages.length - 1];
                const svc = services.find((s) => s.id === selectedId);
                return (
                  <AmcServiceCoverage
                    serviceId={selectedId}
                    categoryId={svc?.categoryId || centerData?.categoryId || centerData?.bookingCategoryId}
                    subcategoryId={
                      svc?.subcategoryId ||
                      (selectedSubcategoryId !== 'all' ? selectedSubcategoryId : null)
                    }
                    compact
                  />
                );
              })()}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-gray-900 font-bold text-lg">{selectedPackages.length} Selected</span>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total: ₹{services.filter(s => selectedPackages.includes(s.id)).reduce((acc, curr) => acc + curr.price, 0)}</p>
                </div>
                <button onClick={handleContinueBooking} className="px-8 py-3 rounded-full bg-gradient-to-r from-[#037166] to-[#04a99d] text-white font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#037166]/20 hover:shadow-[#037166]/35">
                  Continue Booking <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.02) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </motion.div>
  );
}
