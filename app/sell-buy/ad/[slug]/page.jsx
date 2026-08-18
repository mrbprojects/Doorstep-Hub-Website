'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { getImageUrl, fetchSellBuyListingBySlug } from '@/lib/sellBuyApi';
import {
  Heart,
  Share2,
  ShieldCheck,
  MapPin,
  Clock,
  PhoneCall,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  X,
} from 'lucide-react';

export default function AdDetailPage() {
  const params = useParams();
  const slug = params?.slug || 'sample-item';
  const router = useRouter();
  
  // Use useAuth to safely get the current user since localStorage logic differs.
  const { user, token: authContextToken } = useAuth() || {};

  const [showPhone, setShowPhone] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [listing, setListing] = useState({
    title: 'Maruti Suzuki Swift VXI 2022 Petrol - mint condition',
    price: 545000,
    description:
      'Single owner vehicle in pristine condition. Regularly serviced at authorized Maruti Suzuki service center. No accidental history. Full insurance cover valid till end of year.',
    condition: 'like_new',
    location: { city: 'Hyderabad', area: 'Gachibowli', state: 'Telangana' },
    createdAt: new Date().toISOString(),
    images: [
      '/uploads/thumbn_ph_image/default_image.jpg',
      '/uploads/thumbn_ph_image/default_image.jpg',
    ],
    seller: {
      name: 'Rakesh Verma',
      rating: 4.8,
      reviewsCount: 24,
      isVerified: true,
      memberSince: '2023',
      phone: '+91 98765 43210',
    },
  });

  useEffect(() => {
    fetchSellBuyListingBySlug(slug)
      .then((result) => {
        if (result) {
          // result can be { listing, sellerProfile, otherListings, similarListings } (native)
          // or directly a listing object from eClassify
          const listingData = result.listing || result;
          const sellerData = result.sellerProfile || null;
          setListing((prev) => ({
            ...prev,
            ...listingData,
            // handle both native and eClassify field names
            title: listingData.title || listingData.name || prev.title,
            images: listingData.images || (listingData.gallery_images?.map(g => g.image)) || prev.images,
            seller: sellerData || {
              id: listingData.user?.id || listingData.user?._id || listingData.sellerId?._id || listingData.sellerId || prev.seller?.id,
              name: listingData.user?.name || listingData.sellerId?.name || prev.seller?.name,
              phone: listingData.user?.mobile || listingData.sellerId?.mobile || prev.seller?.phone,
              isVerified: true,
            },
          }));
        }
      })
      .catch(() => {});
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
        // We can pass conversation id or just navigate, the chat page will fetch the latest.
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

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(listing.price || 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/sell-buy" className="hover:text-[#037166]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/sell-buy/categories" className="hover:text-[#037166]">Listings</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 truncate max-w-md font-bold">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Gallery & Details */}
          <div className="lg:col-span-8 space-y-5">
            {/* Gallery Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Main Image Viewer */}
              <div className="relative w-full h-[350px] sm:h-[450px] md:h-[500px] bg-black flex items-center justify-center">
                <img
                  src={getImageUrl(listing.images?.[activeImageIndex])}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Thumbnails Filmstrip */}
              {listing.images && listing.images.length > 1 && (
                <div className="bg-slate-900 p-4 flex items-center gap-3 overflow-x-auto border-t border-slate-800 scrollbar-hide">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImageIndex === idx ? 'border-white ring-2 ring-white/30' : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={getImageUrl(img)} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Overview & Description */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-5">
              <div>
                <span className="bg-[#037166]/10 text-[#037166] text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
                  Condition: {listing.condition?.replace('_', ' ')}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-[#0f172a] mt-3 leading-snug">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{listing.location?.area ? `${listing.location.area}, ${listing.location.city}` : listing.location?.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Posted {new Date(listing.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Description</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Price & Seller Card */}
          <div className="lg:col-span-4 space-y-5">
            {/* Price Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-[#037166]">{formattedPrice}</span>
                <button className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              {/* Only show interaction buttons if the user is NOT the owner */}
              {(!user || String(user._id || user.id) !== String(listing.seller?._id || listing.sellerId)) ? (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleChatSeller}
                    className="bg-[#037166] hover:bg-[#025951] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat Seller</span>
                  </button>

                  <button
                    onClick={() => setOfferModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Make Offer</span>
                  </button>
                </div>
              ) : (
                <div className="bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-center">
                  <span className="text-xs font-bold text-slate-500">This is your listing</span>
                </div>
              )}

              {/* Show Phone */}
              <button
                onClick={() => setShowPhone(!showPhone)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{showPhone ? listing.seller?.phone || '+91 98765 43210' : 'Show Phone Number'}</span>
              </button>
            </div>

            {/* Seller Info Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Seller Information</h3>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#037166]/10 text-[#037166] flex items-center justify-center font-black text-lg">
                  {listing.seller?.name?.[0] || 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">{listing.seller?.name || 'Verified Seller'}</span>
                    <ShieldCheck className="w-4 h-4 text-cyan-600" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Member since {listing.seller?.memberSince || '2023'}</p>
                </div>
              </div>

              <Link
                href={`/sell-buy/seller/${slug}`}
                className="block text-center text-xs font-bold text-[#037166] hover:text-[#025951] pt-4 border-t border-slate-100 transition-colors"
              >
                View Seller Profile & Other Ads →
              </Link>
            </div>

            {/* Safety Tips Card */}
            <div className="bg-gradient-to-br from-[#fffdf2] to-[#fff8eb] rounded-3xl border border-amber-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Safety First</span>
              </div>
              <ul className="text-xs text-amber-900/80 space-y-2 list-disc list-inside font-medium marker:text-amber-400">
                <li>Meet in a safe, public local area.</li>
                <li>Never send advance payments or wire transfers.</li>
                <li>Inspect the item thoroughly before finalizing.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Make Offer Modal */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-base font-black text-slate-900">Make an Offer</h3>
              <button
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
                    <DollarSign className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#037166] focus:border-transparent transition-all"
                    placeholder="E.g. 20000"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setOfferModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOffer}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-2"
              >
                Submit Offer
              </button>
            </div>
          </div>
        </div>
      )}

      <SellBuyFooter />
    </div>
  );
}
