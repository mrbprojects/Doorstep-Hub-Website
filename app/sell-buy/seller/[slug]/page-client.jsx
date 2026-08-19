// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
// import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
// import { ListingCard } from '@/components/sell-buy/cards/ListingCard';
// import { ShieldCheck, MapPin, Calendar, Box, Star, Phone, MessageSquare } from 'lucide-react';

// export default function SellerProfileClient({ params }) {
//   const { slug } = params;
//   const router = useRouter();
  
//   const [seller, setSeller] = useState(null);
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function loadSellerData() {
//       setLoading(true);
//       try {
//         const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devapis.doorstephub.com/v1/dhubApi').replace(/\/$/, '');
        
//         // Extract raw 24-hex ObjectId if slug is formatted like "name-6a844ebde..."
//         const idMatch = String(slug).match(/([0-9a-fA-F]{24})$/);
//         const queryId = idMatch ? idMatch[1] : slug;

//         const res = await fetch(`${API_BASE_URL}/sell-buy/sellers/${queryId}`);
//         const data = await res.json();

//         if (data.success && data.data) {
//           const profileRaw = data.data.profile || data.data.seller || data.data;
//           // Normalise seller display name — it may be nested under userId
//           const displayName =
//             profileRaw.name ||
//             profileRaw.userId?.name ||
//             slug.replace(/[-_]?[0-9a-fA-F]{24}$/, '').replace(/[-_]/g, ' ') ||
//             'Verified Seller';
//           setSeller({ ...profileRaw, name: displayName });

//           // API returns key "activeListings" (not "listings")
//           const items = data.data.activeListings || data.data.listings || [];
//           setListings(items);
//         } else {
//           // Non-success but not a network error — show not-found
//           setSeller(null);
//         }
//       } catch (err) {
//         console.error('Failed to load seller profile', err);
//         setSeller(null);
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (slug) {
//       loadSellerData();
//     }
//   }, [slug]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
//         <SellBuyHeader />
//         <main className="flex-1 max-w-7xl mx-auto px-4 w-full py-10">
//           <div className="animate-pulse bg-slate-200 h-64 rounded-3xl w-full mb-8"></div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//             <div className="animate-pulse bg-slate-200 h-80 rounded-2xl"></div>
//             <div className="animate-pulse bg-slate-200 h-80 rounded-2xl"></div>
//             <div className="animate-pulse bg-slate-200 h-80 rounded-2xl"></div>
//           </div>
//         </main>
//         <SellBuyFooter />
//       </div>
//     );
//   }

//   if (!seller) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
//         <SellBuyHeader />
//         <main className="flex-1 flex flex-col items-center justify-center p-10">
//           <h2 className="text-2xl font-black text-slate-800 mb-2">Seller Not Found</h2>
//           <p className="text-slate-500 mb-6">The seller profile you are looking for does not exist.</p>
//           <button 
//             onClick={() => router.push('/sell-buy')}
//             className="px-6 py-2 bg-[#037166] text-white rounded-xl font-bold hover:bg-[#025951] transition"
//           >
//             Go Back Home
//           </button>
//         </main>
//         <SellBuyFooter />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
//       <SellBuyHeader />

//       <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        
//         {/* Seller Profile Header */}
//         <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
//           <div className="h-32 bg-gradient-to-r from-[#037166] to-[#04a08f]"></div>
          
//           <div className="px-8 pb-8 relative">
//             {/* Avatar */}
//             <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-200 -mt-12 mb-4 overflow-hidden flex-shrink-0 relative shadow-md">
//               <div className="w-full h-full bg-[#037166] flex items-center justify-center text-white text-3xl font-bold uppercase">
//                 {seller.name?.charAt(0) || seller.userId?.name?.charAt(0) || 'S'}
//               </div>
//             </div>

//             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
//               <div>
//                 <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
//                   {seller.name || seller.userId?.name || 'Verified Seller'}
//                   {seller.verificationStatus === 'APPROVED' && (
//                     <ShieldCheck className="w-6 h-6 text-[#037166]" />
//                   )}
//                 </h1>
                
//                 <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-slate-600 font-medium">
//                   {seller.location?.city && (
//                     <div className="flex items-center gap-1.5">
//                       <MapPin className="w-4 h-4 text-slate-400" />
//                       <span>{seller.location.city}</span>
//                     </div>
//                   )}
//                   <div className="flex items-center gap-1.5">
//                     <Calendar className="w-4 h-4 text-slate-400" />
//                     <span>Member since {new Date(seller.createdAt || Date.now()).getFullYear()}</span>
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
//                     <span>{seller.rating || '4.5'} Rating</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 {/* <button className="flex-1 md:flex-none px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center justify-center gap-2">
//                   <Phone className="w-4 h-4" />
//                   <span>Call Seller</span>
//                 </button> */}
//                 <button className="flex-1 md:flex-none px-6 py-2.5 bg-[#037166] hover:bg-[#025951] text-white font-bold rounded-xl transition flex items-center justify-center gap-2">
//                   <MessageSquare className="w-4 h-4" />
//                   <span>Chat</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Listings Section */}
//         <div>
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
//               <Box className="w-6 h-6 text-[#037166]" />
//               Seller&apos;s Listings
//             </h2>
//             <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold">
//               {listings.length} Active Items
//             </span>
//           </div>

//           {listings.length > 0 ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {listings.map(listing => (
//                 <ListingCard key={listing._id} listing={listing} />
//               ))}
//             </div>
//           ) : (
//             <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
//               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Box className="w-8 h-8 text-slate-300" />
//               </div>
//               <h3 className="text-lg font-bold text-slate-900 mb-1">No active listings</h3>
//               <p className="text-slate-500">This seller doesn&apos;t have any active items for sale right now.</p>
//             </div>
//           )}
//         </div>

//       </main>

//       <SellBuyFooter />
//     </div>
//   );
// }
