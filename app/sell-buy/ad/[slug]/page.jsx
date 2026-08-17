'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
} from 'lucide-react';

export default function AdDetailPage() {
  const params = useParams();
  const slug = params?.slug || 'sample-item';

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
              name: listingData.user?.name || listingData.sellerId?.name || prev.seller?.name,
              phone: listingData.user?.mobile || listingData.sellerId?.mobile || prev.seller?.phone,
              isVerified: true,
            },
          }));
        }
      })
      .catch(() => {});
  }, [slug]);

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
          <Link href="/sell-buy" className="hover:text-[#00b2ca]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/sell-buy/categories" className="hover:text-[#00b2ca]">Listings</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 truncate max-w-md font-bold">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Gallery & Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Gallery Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm overflow-hidden space-y-4">
              <div className="relative aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden">
                <img
                  src={getImageUrl(listing.images?.[activeImageIndex])}
                  alt={listing.title}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              {/* Thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImageIndex === idx ? 'border-[#00b2ca] ring-2 ring-[#00b2ca]/20' : 'border-slate-200 opacity-70'
                      }`}
                    >
                      <img src={getImageUrl(img)} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Overview & Description */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="bg-cyan-50 text-[#00b2ca] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md">
                  Condition: {listing.condition?.replace('_', ' ')}
                </span>
                <h1 className="text-xl sm:text-3xl font-black text-[#0f172a] mt-2 leading-snug">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
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
          <div className="lg:col-span-4 space-y-6">
            {/* Price Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-[#00b2ca]">{formattedPrice}</span>
                <button className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/sell-buy/chat"
                  className="bg-[#00b2ca] hover:bg-[#0097ac] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Seller</span>
                </Link>

                <button
                  onClick={() => setOfferModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Make Offer</span>
                </button>
              </div>

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
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Seller Information</h3>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#00b2ca]">
                  {listing.seller?.name?.[0] || 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-slate-900">{listing.seller?.name || 'Verified Seller'}</span>
                    <ShieldCheck className="w-4 h-4 text-cyan-600" />
                  </div>
                  <p className="text-[11px] text-slate-500">Member since {listing.seller?.memberSince || '2023'}</p>
                </div>
              </div>

              <Link
                href={`/sell-buy/seller/${slug}`}
                className="block text-center text-xs font-bold text-[#00b2ca] hover:underline pt-2 border-t border-slate-100"
              >
                View Seller Profile & Other Ads →
              </Link>
            </div>

            {/* Safety Tips Card */}
            <div className="bg-amber-50 rounded-3xl border border-amber-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Safety First</span>
              </div>
              <ul className="text-[11px] text-amber-900/80 space-y-1.5 list-disc list-inside font-medium">
                <li>Meet in a safe, public local area.</li>
                <li>Never send advance payments or wire transfers.</li>
                <li>Inspect the item thoroughly before finalizing.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <SellBuyFooter />
    </div>
  );
}
