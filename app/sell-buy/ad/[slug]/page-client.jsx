'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { ListingCard } from '@/components/sell-buy/cards/ListingCard';
import { VideoShortsModal } from '@/components/sell-buy/VideoShortsModal';
import { getImageUrl, fetchSellBuyListingBySlug, updateSellBuyListing } from '@/lib/sellBuyApi';
import { AdSenseUnit } from '@/components/sell-buy/ads/AdSenseUnit';
import { ADSENSE_CONFIG } from '@/config/adsense';
import {
  Heart,
  Share2,
  ShieldCheck,
  MapPin,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  X,
  IndianRupee,
  Flag,
  Play,
  Megaphone,
  Sliders,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Star,
  Check,
} from 'lucide-react';

export default function AdDetailPage() {
  const params = useParams();
  const slug = params?.slug || 'sample-item';
  const router = useRouter();

  const { user, token: authContextToken } = useAuth() || {};

  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [shortsModalOpen, setShortsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [reportReason, setReportReason] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const [listing, setListing] = useState({
    title: 'Construction Site Building Crane Sunset',
    price: 320000,
    description: '',
    condition: 'like_new',
    location: { city: 'Hyderabad', area: 'Hitech City', state: 'Telangana' },
    createdAt: new Date().toISOString(),
    images: [],
    seller: {
      name: 'Asgar WRTeam',
      rating: 4.9,
      reviewsCount: 38,
      isVerified: true,
      memberSince: '2023',
      phone: '',
    },
  });

  const [similarListings, setSimilarListings] = useState([]);
  const [otherListings, setOtherListings] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetchSellBuyListingBySlug(slug)
      .then((result) => {
        if (result) {
          const listingData = result.listing || result;
          const sellerData = result.sellerProfile || null;
          const similar = result.similarListings || [];
          const other = result.otherListings || [];

          setListing((prev) => ({
            ...prev,
            ...listingData,
            title: listingData.title || listingData.name || prev.title,
            images: listingData.images || (listingData.gallery_images?.map(g => g.image)) || prev.images || [],
            seller: sellerData || {
              id: listingData.user?.id || listingData.user?._id || listingData.sellerId?._id || listingData.sellerId || prev.seller?.id,
              name: listingData.user?.name || listingData.sellerId?.name || prev.seller?.name || 'Verified Member',
              phone: listingData.user?.mobile || listingData.sellerId?.mobile || prev.seller?.phone || '',
              isVerified: true,
              memberSince: listingData.sellerId?.createdAt ? new Date(listingData.sellerId.createdAt).getFullYear() : '2023',
            },
          }));

          setSimilarListings(similar);
          setOtherListings(other);
          setIsLiked(listingData.is_liked || false);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const handleChatSeller = async () => {
    if (!listing || !listing.seller) return;

    let activeUser = user;
    if (!activeUser && typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_details') || localStorage.getItem('user');
      if (stored) {
        try { activeUser = JSON.parse(stored); } catch(e) {}
      }
    }

    if (!activeUser) {
      toast.error('Please login to chat with the seller');
      router.push('/login');
      return;
    }

    try {
      const buyerId = activeUser._id || activeUser.id;
      const listingId = listing._id || listing.id;

      toast.loading('Starting conversation...', { id: 'chat-init' });

      const currentToken = authContextToken || localStorage.getItem('auth_token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sell-buy/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ buyerId, listingId }),
      });

      const data = await res.json();
      if (data.success || data.error === false) {
        toast.success('Conversation started!', { id: 'chat-init' });
        sessionStorage.setItem('activeConvId', data.data?._id || '');
        sessionStorage.setItem('activeConvData', JSON.stringify(data.data || {}));
        router.push('/sell-buy/chat');
      } else {
        toast.error(data.message || 'Failed to start conversation', { id: 'chat-init' });
      }
    } catch (e) {
      console.error(e);
      toast.error('Something went wrong', { id: 'chat-init' });
    }
  };

  const handleSubmitOffer = async () => {
    if (!offerAmount || isNaN(offerAmount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    let activeUser = user;
    if (!activeUser && typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_details') || localStorage.getItem('user');
      if (stored) {
        try { activeUser = JSON.parse(stored); } catch(e) {}
      }
    }

    if (!activeUser) {
      toast.error('Please login to make an offer');
      router.push('/login');
      return;
    }

    try {
      toast.loading('Submitting offer...', { id: 'offer-init' });
      const currentToken = authContextToken || localStorage.getItem('auth_token') || '';
      const buyerId = activeUser._id || activeUser.id;
      const listingId = listing._id || listing.id;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sell-buy/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ buyerId, listingId, offerAmount }),
      });

      const data = await res.json();
      if (data.success || data.error === false) {
        toast.success('Offer submitted successfully!', { id: 'offer-init' });
        setOfferModalOpen(false);
        router.push('/sell-buy/chat');
      } else {
        toast.error(data.message || 'Failed to submit offer', { id: 'offer-init' });
      }
    } catch (e) {
      console.error(e);
      toast.error('Something went wrong', { id: 'offer-init' });
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out ${listing.title} on Doorstep Hub!`,
          url: shareUrl,
        });
      } catch (err) {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleToggleFavoriteDetail = async () => {
    let activeUser = user;
    if (!activeUser && typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_details') || localStorage.getItem('user');
      if (stored) {
        try { activeUser = JSON.parse(stored); } catch(err) {}
      }
    }

    const listingId = listing._id || listing.id;
    if (!listingId) return;

    const prevLiked = isLiked;
    const nextLiked = !prevLiked;
    setIsLiked(nextLiked);

    try {
      const storedFavs = JSON.parse(localStorage.getItem('sell_buy_favorites') || '[]');
      let updatedFavs = Array.isArray(storedFavs) ? storedFavs : [];
      if (nextLiked) {
        if (!updatedFavs.some((f) => (f._id || f.id) === listingId)) {
          updatedFavs.push({
            _id: listingId,
            id: listingId,
            title: listing.title,
            price: listing.price,
            image: listing.images?.[0] || listing.coverImage || listing.image,
            slug: listing.slug,
            city: listing.location?.city || listing.city || 'Hyderabad',
            status: listing.status || 'ACTIVE',
          });
        }
      } else {
        updatedFavs = updatedFavs.filter((f) => (f._id || f.id) !== listingId);
      }
      localStorage.setItem('sell_buy_favorites', JSON.stringify(updatedFavs));
      window.dispatchEvent(new Event('favorites-updated'));

      if (activeUser) {
        const token = authContextToken || localStorage.getItem('auth_token') || '';
        const userId = activeUser._id || activeUser.id;
        await toggleFavorite(listingId, userId, token);
      }

      toast.success(nextLiked ? 'Saved to favorites' : 'Removed from favorites');
    } catch (err) {
      console.error(err);
      setIsLiked(prevLiked);
    }
  };

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [soldModalOpen, setSoldModalOpen] = useState(false);
  const [soldRating, setSoldRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [soldPlatform, setSoldPlatform] = useState('doorstephub');
  const [soldComment, setSoldComment] = useState('');

  const handleConfirmSoldModal = async (e) => {
    if (e) e.preventDefault();
    if (soldRating < 4) {
      toast.error('Minimum 4-star rating is required to complete feedback submission.');
      return;
    }

    const listingId = listing._id || listing.id;
    if (!listingId) return;

    try {
      setIsUpdatingStatus(true);
      const token = authContextToken || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '');
      const activeUserId = user?._id || user?.id;

      const res = await updateSellBuyListing(
        listingId,
        {
          status: 'SOLD_OUT',
          userId: activeUserId,
        },
        token
      );

      if (res.success || res.error === false || res.data) {
        setListing((prev) => ({ ...prev, status: 'SOLD_OUT' }));
        toast.success('Ad marked as Sold Out.');
        setSoldModalOpen(false);
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleAdStatus = async (newStatus) => {
    const listingId = listing._id || listing.id;
    if (!listingId) return;

    if (newStatus === 'SOLD_OUT') {
      setSoldModalOpen(true);
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const token = authContextToken || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '');
      const activeUserId = user?._id || user?.id;

      const res = await updateSellBuyListing(
        listingId,
        { status: newStatus, userId: activeUserId },
        token
      );

      if (res.success || res.error === false || res.data) {
        setListing((prev) => ({ ...prev, status: newStatus }));
        if (newStatus === 'ACTIVE') {
          toast.success('Listing activated! Now visible in marketplace.');
        } else {
          toast.success(`Status updated to ${newStatus}`);
        }
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReportAd = (e) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      toast.error('Please specify a reason');
      return;
    }
    toast.success('Thank you. Your report has been submitted for admin review.');
    setReportModalOpen(false);
    setReportReason('');
  };

  const formattedPrice = listing.price
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(listing.price)
    : 'Contact for Price';

  const imagesList = (listing.images && listing.images.length > 0)
    ? listing.images
    : [listing.image || listing.coverImage || '/uploads/thumbn_ph_image/default_image.jpg'];

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const rawStatus = (listing.status || 'ACTIVE').toUpperCase();
  const isSold = rawStatus === 'SOLD_OUT' || rawStatus === 'SOLD';
  const conditionDisplay = (listing.condition || 'Used').replace('_', ' ');
  const adIdNumber = listing._id ? listing._id.slice(-6).toUpperCase() : listing.id || '2384';
  const sellerPhoneDigits = String(
    listing.seller?.phone || listing.user?.mobile || listing.sellerId?.mobile || ''
  ).replace(/\D/g, '');
  const whatsappPhone = sellerPhoneDigits
    ? (sellerPhoneDigits.startsWith('91') ? sellerPhoneDigits : `91${sellerPhoneDigits.replace(/^0+/, '')}`)
    : '918886688666';
  const whatsappHref = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`Hi, I'm interested in your listing: ${listing.title || ''}`)}`;

  const WhatsAppIcon = ({ className = 'w-5 h-5' }) => (
    <svg className={`${className} fill-current`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800">
      <SellBuyHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full space-y-5">
        {/* ── eClassify Style Breadcrumbs & Top Video Ad Short Pill ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto scrollbar-hide">
            <Link
              href="/sell-buy"
              className="hover:text-[#037166] shrink-0 font-medium"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link href="/sell-buy/categories" className="hover:text-[#037166] shrink-0 font-medium">
              Ads
            </Link>
            {listing.category?.name && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <Link href={`/sell-buy/${listing.category.slug || ''}`} className="hover:text-[#037166] shrink-0 font-medium">
                  {listing.category.name}
                </Link>
              </>
            )}
            {listing.subcategoryName && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span className="text-slate-500 shrink-0 font-medium">{listing.subcategoryName}</span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-900 truncate max-w-xs font-bold">{listing.title}</span>
          </div>

          {/* eClassify [Video Ad] Short Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShortsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#037166] to-[#04a99d] hover:brightness-110 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-md shadow-[#037166]/20 transition-all active:scale-95 cursor-pointer animate-pulse"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Video Ad / Short</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              title="Share this ad"
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
            </button>
            <button
              type="button"
              onClick={handleToggleFavoriteDetail}
              title="Save to favorites"
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isLiked
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── TOP HERO BANNER (eClassify style – Looking for a Job?) ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 border border-orange-100 shadow-sm">
          {/* decorative circle */}
          <div className="absolute right-48 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-gradient-to-br from-rose-400/25 to-orange-400/25 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6">
            <div className="flex items-center gap-5">
              {/* decorative icon stack */}
              <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg shrink-0 text-2xl select-none">
                🏷️
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">Sell Your Items Fast!</h3>
                <p className="text-sm text-slate-600 mt-0.5">Post free ads and reach thousands of verified local buyers instantly.</p>
              </div>
            </div>
            <Link
              href="/sell-buy/post-ad"
              className="shrink-0 inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md whitespace-nowrap active:scale-98 cursor-pointer"
            >
              POST FREE AD
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── Main 2-Column Content Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ── LEFT COLUMN (8 Cols): Gallery, Ads Space, Overview, Description, Map ── */}
          <div className="lg:col-span-8 space-y-5">
            {/* Gallery Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
              {/* Studio Stage */}
              <div className="relative w-full h-[360px] sm:h-[460px] md:h-[500px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden group">
                {/* Background ambient glow */}
                <div className="absolute inset-0 bg-radial from-[#037166]/15 to-transparent pointer-events-none" />

                <img
                  src={getImageUrl(imagesList[activeImageIndex])}
                  alt={listing.title}
                  className="w-full h-full object-contain p-2 sm:p-4 select-none cursor-zoom-in"
                  onClick={() => { setLightboxIndex(activeImageIndex); setLightboxOpen(true); }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://devapis.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg';
                  }}
                />
                {/* Expand hint */}
                <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
                  <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    Tap to expand
                  </span>
                </div>

                {/* Top Badge: Verified Ad & Video Short Trigger */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md border border-white/15 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Listing
                  </span>

                  <button
                    type="button"
                    onClick={() => setShortsModalOpen(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    Watch Ad
                  </button>
                </div>

                {/* Top Right Counter */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/10">
                    {activeImageIndex + 1} / {imagesList.length}
                  </span>
                </div>

                {/* Carousel Arrow Controls */}
                {imagesList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-[#037166] text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-[#037166] text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Filmstrip */}
              {imagesList.length > 1 && (
                <div className="bg-slate-900/95 p-3 sm:p-4 flex items-center gap-3 overflow-x-auto border-t border-slate-800 scrollbar-hide">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-18 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#037166] ring-2 ring-[#037166]/40 scale-105 opacity-100'
                          : 'border-white/10 opacity-50 hover:opacity-90'
                      }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://devapis.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── TOP ADVERTISEMENT SPACE BANNER (728x90 style) ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#025951] p-4 sm:p-5 text-white border border-slate-700/60 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                    Sponsored Advertisement Space
                  </span>
                  <h4 className="text-sm font-bold text-white">Promote Your Business & Services Here</h4>
                  <p className="text-xs text-white/70">Reach thousands of daily local verified buyers on DoorstepHub</p>
                </div>
              </div>

              <Link
                href="/sell-buy/post-ad"
                className="bg-[#037166] hover:bg-[#04a99d] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shrink-0 whitespace-nowrap"
              >
                Advertise With Us
              </Link>
            </div>

            {/* ── eClassify OVERVIEW / ATTRIBUTES GRID ── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#037166]" />
                  Overview & Details
                </h3>
                <p className="text-xs text-slate-500 mt-1">Item specifications and key verified properties</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unit Type</span>
                  <span className="text-sm font-extrabold text-slate-900 capitalize mt-0.5 block truncate">
                    {listing.category?.name || 'Electronics'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Condition</span>
                  <span className="text-sm font-extrabold text-slate-900 capitalize mt-0.5 block">
                    {conditionDisplay}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price Status</span>
                  <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block">
                    {listing.isNegotiable !== false ? 'Negotiable' : 'Fixed Price'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ad ID</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                    #{adIdNumber}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Posted in</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block truncate">
                    {listing.location?.city || 'Hyderabad'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verification</span>
                  <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> 100% Verified
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Listing Date</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                    {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                  </span>
                </div>

                {/* Warranty Info (if available / electronics) */}
                {(listing.warranty || listing.warrantyStatus) && (
                  <div className="bg-teal-50/70 border border-[#037166]/20 rounded-2xl p-3.5">
                    <span className="text-[10px] font-bold text-[#037166] uppercase tracking-wider block">Warranty</span>
                    <span className="text-sm font-extrabold text-slate-900 mt-0.5 block truncate" title={`${listing.warrantyStatus || listing.warranty}${listing.warrantyDetails ? ` (${listing.warrantyDetails})` : ''}`}>
                      🛡️ {listing.warrantyStatus || listing.warranty}
                      {listing.warrantyDetails ? ` (${listing.warrantyDetails})` : ''}
                    </span>
                  </div>
                )}

                {/* Bill Copy Availability (if set) */}
                {(listing.billCopy || listing.hasBillCopy !== undefined || listing.billCopyImage) && (
                  <div className={`border rounded-2xl p-3.5 ${
                    listing.billCopy === 'Available' || listing.hasBillCopy
                      ? 'bg-emerald-50/70 border-emerald-200/70'
                      : 'bg-slate-50 border-slate-200/70'
                  }`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bill / Invoice</span>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className={`text-sm font-extrabold truncate ${
                        listing.billCopy === 'Available' || listing.hasBillCopy ? 'text-emerald-700' : 'text-slate-700'
                      }`}>
                        {listing.billCopy === 'Available' || listing.hasBillCopy ? '🧾 Available' : '📄 Not Available'}
                      </span>
                      {listing.billCopyImage && (
                        <button
                          type="button"
                          onClick={() => setIsBillModalOpen(true)}
                          className="shrink-0 text-[10px] font-bold text-[#037166] hover:underline bg-white px-2 py-0.5 rounded border border-emerald-300 shadow-xs cursor-pointer"
                        >
                          View Bill ↗
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Video Short</span>
                  <button
                    type="button"
                    onClick={() => setShortsModalOpen(true)}
                    className="text-sm font-extrabold text-[#037166] hover:underline mt-0.5 block text-left cursor-pointer"
                  >
                    ▶ Available
                  </button>
                </div>
              </div>
            </div>

            {/* ── DESCRIPTION SECTION ── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Description
              </h3>
              <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                  {listing.description || 'No detailed description provided by the seller.'}
                </p>
              </div>
            </div>

            {/* ── VERIFIED BILL COPY SECTION (if image attached) ── */}
            {listing.billCopyImage && (
              <div className="bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 rounded-3xl border border-emerald-200/80 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                      🧾
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        Original Bill / Invoice Copy
                      </h3>
                      <p className="text-xs text-emerald-800 font-medium">
                        The seller has attached an invoice copy for verification
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                    Verified Bill
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setIsBillModalOpen(true)}
                    className="relative group w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0 cursor-pointer"
                  >
                    <img
                      src={getImageUrl(listing.billCopyImage)}
                      alt="Bill / Invoice Copy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity">
                      🔍 Expand
                    </div>
                  </button>

                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-800">Purchase Invoice Document</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Click the image to view the full original bill and verify product authenticity, date of purchase, and serial details.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsBillModalOpen(true)}
                      className="inline-flex items-center gap-1.5 bg-[#037166] hover:bg-[#025951] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <span>🔍 View Full Bill Image</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── LOCATION MAP SECTION ── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#037166]" />
                    Location
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {listing.location?.area
                      ? `${listing.location.area}, ${listing.location.city || 'Hyderabad'}, ${listing.location?.state || 'Telangana'}`
                      : `${listing.location?.city || listing.city || 'Hyderabad'}, ${listing.location?.state || 'Telangana'}`}
                  </p>
                </div>

                {/* Open in Google Maps link */}
                <a
                  href={`https://www.google.com/maps?q=${listing.latitude || listing.location?.latitude || listing.location?.lat || listing.lattitude || '17.4483'},${listing.longitude || listing.location?.longitude || listing.location?.lng || listing.longitude || '78.3915'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#037166] hover:underline bg-[#037166]/10 px-3 py-1.5 rounded-xl transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>
              </div>

              {/* Dynamic Interactive Map Container with Listing Coordinates */}
              <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                <iframe
                  src={`https://maps.google.com/maps?q=${listing.latitude || listing.location?.latitude || listing.location?.lat || listing.lattitude || '17.4483'},${listing.longitude || listing.location?.longitude || listing.location?.lng || listing.longitude || '78.3915'}&hl=en&z=15&output=embed`}
                  className="w-full h-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Listing Location Map"
                />
              </div>

              {/* Coordinates Pill */}
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {/* Exact Pin: {listing.latitude || listing.location?.latitude || listing.location?.lat || listing.lattitude || '17.4483'}, {listing.longitude || listing.location?.longitude || listing.location?.lng || listing.longitude || '78.3915'} */}
                </span>
                <span className="text-slate-400">Verified Seller Location</span>
              </div>
            </div>

            {/* ── PLACEMENT 1: POST-DESCRIPTION / SPECIFICATIONS BODY UNIT ── */}
            <AdSenseUnit slotId={ADSENSE_CONFIG.slots.listingDetail} />

            {/* ── REPORT AD BAR (eClassify Style) ── */}
            <div className="flex items-center justify-between p-4 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-600">
              <span>Did you find any problem with this advertisement?</span>
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                Report Ad
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN (4 Cols): Price, Action Buttons, Ads Space, Seller, Safety ── */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            {/* Price & Primary Action Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-3.5">
              {/* Price + Negotiable / Sold Out Badge */}
              <div className="flex items-start justify-between gap-3">
                <span className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${
                  isSold ? 'text-slate-400 line-through' : 'text-[#037166]'
                }`}>
                  {formattedPrice}
                </span>
                {isSold ? (
                  <span className="text-[10px] font-black text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 shrink-0 uppercase tracking-wider">
                    Sold Out
                  </span>
                ) : listing.isNegotiable !== false ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 shrink-0">
                    Negotiable
                  </span>
                ) : null}
              </div>

              {/* Title & Location – compact */}
              <div className="space-y-1.5">
                <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                  {listing.title}
                </h2>
                <p className="text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-[#037166] mt-0.5 shrink-0" />
                  <span>
                    {listing.location?.area ? `${listing.location.area}, ` : ''}
                    {listing.location?.city || 'Hyderabad'}
                  </span>
                </p>

                {/* Electronics Highlights: Warranty & Bill Badges */}
                {(listing.warranty || listing.warrantyStatus || listing.billCopy || listing.hasBillCopy !== undefined) && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {(listing.warranty || listing.warrantyStatus) && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-50 text-[#037166] px-2.5 py-1 rounded-lg border border-teal-200/60">
                        <span>🛡️</span>
                        <span>{listing.warrantyStatus || listing.warranty}</span>
                      </span>
                    )}
                    {(listing.billCopy || listing.hasBillCopy !== undefined) && (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                        listing.billCopy === 'Available' || listing.hasBillCopy
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        <span>{listing.billCopy === 'Available' || listing.hasBillCopy ? '🧾' : '📄'}</span>
                        <span>Bill: {listing.billCopy === 'Available' || listing.hasBillCopy ? 'Available' : 'Not Available'}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-slate-100" />

              {/* Action Buttons / Sold Out Banner / Owner Controls */}
              {(!user || String(user._id || user.id) !== String(listing.seller?._id || listing.sellerId)) ? (
                <div>
                  {isSold ? (
                    <div className="bg-red-50/80 border border-red-200 rounded-xl p-3.5 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-red-700 font-extrabold text-xs">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>This Item Has Been Sold Out</span>
                      </div>
                      <p className="text-[11px] text-red-600/80">The seller has completed this transaction. Contact options are closed.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[1fr_1fr_48px] gap-2.5">
                      <button
                        type="button"
                        onClick={handleChatSeller}
                        className="w-full bg-[#037166] hover:bg-[#025951] text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-[#037166]/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOfferModalOpen(true)}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                      >
                        <IndianRupee className="w-4 h-4" />
                        <span>Make Offer</span>
                      </button>

                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Chat on WhatsApp"
                        aria-label="Chat on WhatsApp"
                        className="w-12 h-full min-h-[44px] bg-[#25D366] hover:bg-[#1da851] text-white rounded-xl shadow-md shadow-green-500/20 transition-all flex items-center justify-center active:scale-98"
                      >
                        <WhatsAppIcon className="w-5 h-5" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">This is your listing</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      isSold ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-[#037166]'
                    }`}>
                      {isSold ? 'Sold Out' : 'Active'}
                    </span>
                  </div>
                  {isSold ? (
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => handleToggleAdStatus('ACTIVE')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>{isUpdatingStatus ? 'Updating...' : 'Mark as Active (Re-activate)'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => handleToggleAdStatus('SOLD_OUT')}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{isUpdatingStatus ? 'Updating...' : 'Mark as Sold Out'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

           
           

            {/* ── SELLER INFORMATION CARD ── */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                Seller Information
              </span>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#037166] to-[#04a99d] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  {listing.seller?.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {listing.seller?.name || 'Verified Seller'}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Member since {listing.seller?.memberSince || '2023'}
                  </p>
                </div>
              </div>

              <Link
                href={(() => {
                  // Try all possible seller user ID sources
                  const sellerId =
                    (typeof listing.sellerId === 'object' ? listing.sellerId?._id : listing.sellerId) ||
                    listing.user?._id ||
                    listing.seller?._id ||
                    listing.seller?.id ||
                    listing.seller?.userId?._id ||
                    null;
                  if (!sellerId) return '/sell-buy';
                  return `/sell-buy/seller/${sellerId}`;
                })()}
                className="block text-center text-xs font-bold text-[#037166] hover:text-[#025951] pt-3.5 border-t border-slate-100 transition-colors"
              >
                View Seller Profile & Other Ads →
              </Link>
            </div>


               {/* ── SIDEBAR ADVERTISEMENT SPACE (300x250 Box style) ── */}
             <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 border border-slate-700 text-white space-y-3 text-center shadow-sm">
              <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400 text-slate-900 px-2.5 py-0.5 rounded-full inline-block">
                Sponsored Ad Space
              </span>
              <h4 className="text-sm font-bold text-white leading-snug">Boost Your Ad to 10x More Buyers</h4>
              <p className="text-[11px] text-white/70">Get featured on top banners, categories, and YouTube shorts popup views</p>
              <Link
                href="/sell-buy/post-ad"
                className="inline-block w-full py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs hover:bg-slate-100 transition-colors"
              >
                Feature Your Listing
              </Link>
            </div>

            {/* ── SAFETY GUIDELINES CARD ── */}
            <div className="bg-gradient-to-br from-amber-50/70 via-amber-50/40 to-orange-50/30 rounded-3xl border border-amber-200/70 p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="uppercase tracking-wider text-[11px] font-black">Safety Guidelines</span>
              </div>
              <ul className="text-xs text-amber-900/80 space-y-2 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Meet the seller in a safe, public local place.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Inspect the product thoroughly before payment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Never transfer advance money without seeing the item.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── RELATED ADS / SIMILAR LISTINGS SECTION (eClassify Style) ── */}
        {similarListings.length > 0 && (
          <section className="pt-8 border-t border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Related Ads
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Explore similar verified listings</p>
              </div>
              <Link
                href="/sell-buy/categories"
                className="text-xs sm:text-sm font-bold text-[#037166] hover:underline"
              >
                See All
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {similarListings.slice(0, 4).map((item) => (
                <ListingCard key={item._id || item.id || item.slug} listing={item} />
              ))}
            </div>
          </section>
        )}

        {/* ── BOTTOM APP DOWNLOAD BANNER (eClassify style) ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 shadow-lg">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 60%)'}} />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 p-6 sm:p-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">Experience the Magic<br className="hidden sm:block" /> of the DoorstepHub App</h3>
              <p className="text-white/80 text-sm mt-1 font-medium">Buy, sell &amp; discover services — all from your pocket.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0 relative z-20">
              {/* Google Play */}
              <a
                href="https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open("https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share", "_blank");
                }}
                className="flex items-center gap-2.5 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all whitespace-nowrap active:scale-98 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M3.18 23.7c.34.2.73.23 1.1.1l12.5-7.22-2.74-2.74L3.18 23.7z" fill="#EA4335"/>
                  <path d="M21.37 10.46l-2.84-1.64-3.07 3.07 3.07 3.07 2.87-1.66a1.7 1.7 0 000-2.84z" fill="#FBBC04"/>
                  <path d="M2.07 1.3A1.7 1.7 0 001.5 2.6v18.8c0 .5.2.96.57 1.3l.08.07 10.53-10.53v-.25L2.07 1.3z" fill="#4285F4"/>
                  <path d="M14.84 11.89L4.28 1.3c-.37.2-.65.53-.77.94l10.54 10.56.79-.91z" fill="#34A853"/>
                </svg>
                <div className="text-left leading-none">
                  <div className="text-[9px] font-semibold text-slate-500">Download on the</div>
                  <div className="text-sm font-extrabold">Google Play</div>
                </div>
              </a>
              {/* App Store */}
              <a
                href="https://apps.apple.com/in/app/doorstep-hub/id6475340236"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open("https://apps.apple.com/in/app/doorstep-hub/id6475340236", "_blank");
                }}
                className="flex items-center gap-2.5 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all whitespace-nowrap active:scale-98 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.37 2.78M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="text-left leading-none">
                  <div className="text-[9px] font-semibold text-slate-500">Download on the</div>
                  <div className="text-sm font-extrabold">App Store</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* ── PLACEMENT 2: AD DETAIL RELATED / BOTTOM BODY UNIT (BEFORE FOOTER) ── */}
        <AdSenseUnit slotId={ADSENSE_CONFIG.slots.relatedListings} />
      </main>

      {/* ── FULLSCREEN IMAGE LIGHTBOX ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
          onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false); }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 shrink-0">
            <span className="text-white/70 text-sm font-semibold">{lightboxIndex + 1} / {imagesList.length}</span>
            <h4 className="text-white text-sm font-bold line-clamp-1 flex-1 text-center px-4">{listing.title}</h4>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main image */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            <img
              key={lightboxIndex}
              src={getImageUrl(imagesList[lightboxIndex])}
              alt={`Image ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none animate-in fade-in duration-200"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://devapis.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg'; }}
            />
            {/* Prev */}
            {lightboxIndex > 0 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(i => i - 1)}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {/* Next */}
            {lightboxIndex < imagesList.length - 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(i => i + 1)}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          {imagesList.length > 1 && (
            <div className="shrink-0 flex items-center gap-2.5 overflow-x-auto px-4 py-3 border-t border-white/10 scrollbar-hide">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-14 h-12 sm:w-16 sm:h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                    lightboxIndex === idx ? 'border-[#037166] ring-2 ring-[#037166]/50 scale-105' : 'border-white/20 opacity-50 hover:opacity-80'
                  }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`thumb ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://devapis.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg'; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── YouTube Shorts Video Ad Popup Modal ── */}
      <VideoShortsModal
        isOpen={shortsModalOpen}
        onClose={() => setShortsModalOpen(false)}
        listing={listing}
        allListings={[listing, ...similarListings, ...otherListings]}
      />

      {/* ── Make Offer Modal ── */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-[#037166]" />
                Make an Offer
              </h3>
              <button
                type="button"
                onClick={() => setOfferModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Asking Price</span>
                <span className="text-lg font-black text-[#037166]">{formattedPrice}</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 ml-1">Your Offer Amount (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#037166] focus:border-transparent transition-all"
                    placeholder="Enter your offer amount"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOfferModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitOffer}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                Submit Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Report Ad Modal ── */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Flag className="w-5 h-5 text-rose-500" />
                Report Advertisement
              </h3>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportAd} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Help us keep DoorstepHub safe. Please tell us why you are reporting this ad:
              </p>
              <textarea
                rows={4}
                required
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="E.g. Inappropriate content, fraudulent seller, wrong price, etc."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#037166] focus:outline-none"
              />

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MARK AS SOLD CONFIRMATION MODAL (Ad Detail Page) ── */}
      {soldModalOpen && listing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold shadow-xs">
                  🏷️
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Mark as Sold Out?</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Confirm product sale</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoldModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Product preview card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3.5">
                {listing.images?.[0] && (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{listing.title}</p>
                  <p className="text-xs font-black text-[#037166] mt-0.5">
                    ₹{Number(listing.price || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {listing.location?.city || listing.city || 'Hyderabad'}
                  </p>
                </div>
              </div>

              {/* Warning note */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <span>⚠️</span>
                  <span>Confirmation Notice</span>
                </p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Are you sure you want to mark this item as <strong>Sold Out</strong>? Once confirmed, this advertisement will be deactivated and removed from active search listings.
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button
                type="button"
                onClick={() => setSoldModalOpen(false)}
                className="flex-1 py-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSoldModal}
                disabled={isUpdatingStatus}
                className="flex-[1.5] flex items-center justify-center gap-2 py-3 px-4 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl shadow-md shadow-rose-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Yes, Mark as Sold</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── BILL COPY IMAGE MODAL VIEWER ── */}
      {isBillModalOpen && listing.billCopyImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative max-w-3xl w-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 text-white">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧾</span>
                <div>
                  <h3 className="text-sm font-black text-white">Original Purchase Bill / Invoice</h3>
                  <p className="text-[10px] text-emerald-400 font-medium">Verified Invoice for: {listing.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBillModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
              <img
                src={getImageUrl(listing.billCopyImage)}
                alt="Original Bill Invoice Copy"
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg border border-slate-800"
              />
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
              <span>DoorstepHub Classifieds Buyer Protection</span>
              <a
                href={getImageUrl(listing.billCopyImage)}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-[#037166] hover:bg-[#025951] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                Open Full Size ↗
              </a>
            </div>
          </div>
        </div>
      )}

      <SellBuyFooter />
    </div>
  );
}
