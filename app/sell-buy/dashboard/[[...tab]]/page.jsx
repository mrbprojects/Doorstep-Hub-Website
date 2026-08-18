'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { PostAdModal } from '@/components/sell-buy/PostAdModal';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import {
  fetchSellBuyListings,
  getImageUrl,
  submitSellerVerification,
  fetchSellerVerificationStatus,
} from '@/lib/sellBuyApi';
import {
  Tag,
  Heart,
  MessageSquare,
  DollarSign,
  ShieldCheck,
  Eye,
  PlusCircle,
  TrendingUp,
  User,
  LogOut,
  Lock,
  Loader2,
  Clock,
  ExternalLink,
  CheckCircle,
  Upload,
  FileText,
  X,
  AlertCircle,
  BadgeCheck,
  Check,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MarketplaceDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const { user, token, logout } = useAuth() || {};
  const { openAuthModal } = useAuthModal() || {};

  const tabParam = params?.tab?.[0] || 'listings';
  const getInitialTab = () => {
    if (tabParam === 'my-ads') return 'listings';
    if (tabParam === 'favorites') return 'favorites';
    if (tabParam === 'profile') return 'profile';
    return 'listings';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Keep state synced if URL changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [tabParam]);

  const [userListings, setUserListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [isPostAdModalOpen, setIsPostAdModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [clientToken, setClientToken] = useState(null);
  const [localUser, setLocalUser] = useState(null);

  // Dynamic user saved favorites
  const [savedFavorites, setSavedFavorites] = useState([]);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

  // OLX-Style Seller KYC State
  const [kycData, setKycData] = useState({
    status: 'NOT_SUBMITTED', // 'NOT_SUBMITTED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
    idType: 'AADHAAR',
    idNumber: '',
    fullName: '',
  });

  // Real File Upload States (Saved in Local Uploads Directory)
  const [docFrontFile, setDocFrontFile] = useState(null);
  const [docBackFile, setDocBackFile] = useState(null);
  const [docFrontPreview, setDocFrontPreview] = useState(null);
  const [docBackPreview, setDocBackPreview] = useState(null);

  const [submittingKyc, setSubmittingKyc] = useState(false);

  // Client-side authentication & persistent state initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tok = localStorage.getItem('auth_token');
      setClientToken(tok);
      const storedUser = localStorage.getItem('user_details') || localStorage.getItem('user');
      if (storedUser) {
        try {
          setLocalUser(JSON.parse(storedUser));
        } catch (e) {
          /* ignore JSON error */
        }
      }

      // Load Saved Favorites
      const favsStr = localStorage.getItem('sell_buy_favorites') || localStorage.getItem('favorites');
      if (favsStr) {
        try {
          const parsed = JSON.parse(favsStr);
          if (Array.isArray(parsed)) setSavedFavorites(parsed);
        } catch (e) {}
      }

      // Load cached local KYC status
      const kycStr = localStorage.getItem('seller_kyc_data');
      if (kycStr) {
        try {
          const parsed = JSON.parse(kycStr);
          if (parsed?.status) setKycData((prev) => ({ ...prev, ...parsed }));
        } catch (e) {}
      }
    }
  }, [token, user]);

  const activeUser = user || localUser;
  const authToken = token || clientToken;
  const isAuthenticated = !!authToken;
  const currentUserId = activeUser?._id || activeUser?.id;

  // Fetch real seller verification status from backend API
  useEffect(() => {
    async function checkVerification() {
      if (!currentUserId) return;
      try {
        const res = await fetchSellerVerificationStatus(currentUserId);
        if (res?.success && res?.data?.status) {
          const backendStatus = res.data.status;
          setKycData((prev) => ({
            ...prev,
            status: backendStatus,
            idType: res.data.idType || prev.idType,
            idNumber: res.data.idNumber || prev.idNumber,
          }));
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'seller_kyc_data',
              JSON.stringify({ status: backendStatus, idType: res.data.idType, idNumber: res.data.idNumber })
            );
          }
        }
      } catch (err) {
        console.error('Error checking seller verification status:', err);
      }
    }
    checkVerification();
  }, [currentUserId]);

  // Fetch real listings for the signed-in user
  useEffect(() => {
    async function loadUserListings() {
      if (!isAuthenticated) {
        setLoadingListings(false);
        return;
      }
      try {
        setLoadingListings(true);
        const res = await fetchSellBuyListings(currentUserId ? { user_id: currentUserId } : { limit: 10 });
        setUserListings(res?.listings || []);
      } catch (err) {
        console.error('Error fetching user listings for dashboard:', err);
      } finally {
        setLoadingListings(false);
      }
    }
    loadUserListings();
  }, [isAuthenticated, currentUserId]);

  // Analytics Stats calculated strictly from real user listings & state (NO hardcoded fallbacks!)
  const activeAdsCount = userListings.filter((item) => (item.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  const pendingAdsCount = userListings.filter((item) => (item.status || '').toUpperCase() === 'PENDING_REVIEW').length;
  const totalViews = userListings.reduce((acc, item) => acc + Number(item.viewsCount || item.views || 0), 0);

  const isKycApproved =
    kycData.status === 'APPROVED' || kycData.status === 'VERIFIED';
  const isKycPending =
    kycData.status === 'SUBMITTED' || kycData.status === 'UNDER_REVIEW' || kycData.status === 'PENDING_REVIEW';

  const kycStatusLabel = isKycApproved
    ? 'Approved'
    : isKycPending
    ? 'Under Admin Review'
    : 'Not Verified';

  // Guard for posting ads - STRICT ADMIN APPROVAL REQUIRED
  const handleOpenPostAdModal = () => {
    if (!isAuthenticated) {
      if (openAuthModal) openAuthModal();
      else toast.error('Please login to post an advertisement');
      return;
    }

    if (!isKycApproved) {
      toast.error('Seller Verification Required! Admin must approve your KYC before you can post ads.', {
        duration: 4000,
      });
      setIsKycModalOpen(true);
      return;
    }

    setIsPostAdModalOpen(true);
  };

  // Dynamic Validation Config based on ID Type
  const getIdTypeConfig = (type) => {
    switch (type) {
      case 'AADHAAR':
        return {
          label: 'Aadhaar Card Number',
          maxLength: 12,
          placeholder: 'e.g. 123456789012 (12 Digits)',
          regex: /^\d{12}$/,
          errorMsg: 'Aadhaar Card number must be exactly 12 digits.',
          requiresBack: true,
          formatInput: (val) => val.replace(/\D/g, '').slice(0, 12),
        };
      case 'PAN':
        return {
          label: 'PAN Card Number',
          maxLength: 10,
          placeholder: 'e.g. ABCDE1234F (10 Characters)',
          regex: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
          errorMsg: 'PAN Number must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).',
          requiresBack: false,
          formatInput: (val) => val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10),
        };
      case 'DRIVING_LICENSE':
        return {
          label: 'Driving License Number',
          maxLength: 16,
          placeholder: 'e.g. TS0920210001234 (13-16 Characters)',
          regex: /^[A-Z0-9]{13,16}$/,
          errorMsg: 'Driving License number must be 13 to 16 alphanumeric characters.',
          requiresBack: true,
          formatInput: (val) => val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 16),
        };
      case 'GST':
        return {
          label: 'GSTIN Business Number',
          maxLength: 15,
          placeholder: 'e.g. 36AAAAA0000A1Z5 (15 Characters)',
          regex: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
          errorMsg: 'GSTIN must be a valid 15-character GSTIN (e.g. 36AAAAA0000A1Z5).',
          requiresBack: false,
          formatInput: (val) => val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15),
        };
      default:
        return {
          label: 'ID Number',
          maxLength: 20,
          placeholder: 'Enter ID Number',
          regex: /.+/,
          errorMsg: 'ID Number is required.',
          requiresBack: false,
          formatInput: (val) => val,
        };
    }
  };

  const idConfig = getIdTypeConfig(kycData.idType);

  // Input Change Handler with Restrictive Masking
  const handleIdNumberChange = (e) => {
    const rawVal = e.target.value;
    const formatted = idConfig.formatInput(rawVal);
    setKycData((prev) => ({ ...prev, idNumber: formatted }));
  };

  const handleIdTypeChange = (e) => {
    const newType = e.target.value;
    setKycData((prev) => ({
      ...prev,
      idType: newType,
      idNumber: '', // Reset ID number when switching document type
    }));
  };

  // Handle Front & Back Document File Pickers with Type Validation
  const handleFrontFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit. Please select a smaller photo.');
        return;
      }
      setDocFrontFile(file);
      setDocFrontPreview(URL.createObjectURL(file));
      toast.success('Front ID photo attached');
    }
  };

  const handleBackFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit. Please select a smaller photo.');
        return;
      }
      setDocBackFile(file);
      setDocBackPreview(URL.createObjectURL(file));
      toast.success('Back ID photo attached');
    }
  };

  // Submit KYC to Backend API (Files stored in backend ./uploads/sell_buy/)
  const handleKycSubmit = async (e) => {
    e.preventDefault();

    // 1. Full Name Validation
    if (!kycData.fullName || kycData.fullName.trim().length < 3) {
      toast.error('Please enter your full name as printed on document (minimum 3 letters)');
      return;
    }

    // 2. ID Number Validation based on Selected Type
    if (!idConfig.regex.test(kycData.idNumber)) {
      toast.error(idConfig.errorMsg);
      return;
    }

    // 3. Document Front Side Upload Check
    if (!docFrontFile && !docFrontPreview) {
      toast.error('Front side photo of your ID document is required');
      return;
    }

    // 4. Document Back Side Upload Check if mandatory
    if (idConfig.requiresBack && !docBackFile && !docBackPreview) {
      toast.error(`Back side photo is required for ${kycData.idType.replace('_', ' ')}`);
      return;
    }

    setSubmittingKyc(true);
    try {
      const fd = new FormData();
      fd.append('userId', currentUserId || '65c8f12a341b2c3d4e5f6a7b');
      fd.append('idType', kycData.idType);
      fd.append('idNumber', kycData.idNumber);
      fd.append('fullName', kycData.fullName);

      if (docFrontFile) {
        fd.append('docFront', docFrontFile);
      }
      if (docBackFile) {
        fd.append('docBack', docBackFile);
      }

      const res = await submitSellerVerification(fd);
      if (res?.success || res?.error === false) {
        const updated = {
          ...kycData,
          status: 'UNDER_REVIEW',
          submittedAt: new Date().toISOString(),
        };
        setKycData(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem('seller_kyc_data', JSON.stringify(updated));
        }
        setIsKycModalOpen(false);
        toast.success('KYC Documents uploaded successfully! Admin will review and verify your seller badge.');
      } else {
        toast.error(res?.message || 'Failed to submit verification to admin');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred submitting KYC verification.');
    } finally {
      setSubmittingKyc(false);
    }
  };

  const STATS = [
    { label: 'Active Ads', count: activeAdsCount, icon: Tag, color: 'bg-[#037166]/10 text-[#037166]' },
    { label: 'Pending Review', count: pendingAdsCount, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Views', count: totalViews, icon: Eye, color: 'bg-blue-50 text-blue-600' },
    { label: 'Saved Favorites', count: savedFavorites.length, icon: Heart, color: 'bg-rose-50 text-rose-600' },
    { label: 'Unread Messages', count: unreadChatsCount, icon: MessageSquare, color: 'bg-purple-50 text-purple-600' },
    {
      label: 'KYC Verification',
      status: kycStatusLabel,
      icon: ShieldCheck,
      color: isKycApproved
        ? 'bg-emerald-50 text-[#037166]'
        : isKycPending
        ? 'bg-amber-50 text-amber-600'
        : 'bg-slate-100 text-slate-500',
    },
  ];

  const isIdValid = idConfig.regex.test(kycData.idNumber);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader onPostAdClick={handleOpenPostAdModal} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {!isAuthenticated ? (
          /* AUTHENTICATION REQUIRED PROMPT */
          <div className="max-w-xl mx-auto my-12 bg-white rounded-lg p-8 border border-slate-200 shadow-lg text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#037166]/10 text-[#037166] flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Sign in to Access Your Dashboard</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Please log in to manage your marketplace listings, track ad views, view buyer inquiries, and post new advertisements.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => (openAuthModal ? openAuthModal() : router.push('/sell-buy/dashboard'))}
                className="w-full sm:w-auto bg-[#037166] hover:bg-[#025951] text-white font-extrabold text-xs px-8 py-3.5 rounded-md shadow-md transition-all flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Login / Register Now</span>
              </button>
              <Link
                href="/sell-buy"
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-6 py-3.5 rounded-md transition-all"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED USER DASHBOARD */
          <div className="space-y-8">
            {/* User Profile Welcome Header */}
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-[#037166] text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                  {activeUser?.name?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                      Welcome back, {activeUser?.name || 'Seller'}!
                    </h1>
                    <button
                      type="button"
                      onClick={() => setIsKycModalOpen(true)}
                      className={`text-[11px] font-extrabold uppercase px-3 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                        isKycApproved
                          ? 'bg-emerald-100 text-[#037166] border border-emerald-300'
                          : isKycPending
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      <BadgeCheck className="w-4 h-4" />
                      {isKycApproved
                        ? 'Verified Seller (Admin Approved)'
                        : isKycPending
                        ? 'KYC Under Admin Review'
                        : 'Unverified - Submit KYC to Post Ads'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeUser?.mobile ? `Mobile: ${activeUser.mobile}` : activeUser?.email || 'Seller Account'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenPostAdModal}
                  className="bg-[#037166] hover:bg-[#025951] text-white font-extrabold text-xs px-6 py-3.5 rounded-md shadow-md transition-all flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>POST NEW FREE AD</span>
                </button>

                {logout && (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      toast.success('Logged out successfully');
                    }}
                    className="p-3 rounded-md border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Analytics Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {STATS.map((st) => {
                const Icon = st.icon;
                return (
                  <div key={st.label} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center ${st.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{st.label}</p>
                    <p className="text-xl font-black text-slate-900">
                      {st.count !== undefined ? st.count : st.status}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Quick Management Link Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div
                onClick={() => setActiveTab('listings')}
                className={`cursor-pointer p-6 rounded-lg border transition-all ${
                  activeTab === 'listings' ? 'bg-white border-[#037166] shadow-md ring-2 ring-[#037166]/10' : 'bg-white border-slate-200 hover:border-[#037166]'
                }`}
              >
                <Tag className="w-8 h-8 text-[#037166] mb-3" />
                <h3 className="text-base font-bold text-slate-900">My Listings ({userListings.length})</h3>
                <p className="text-xs text-slate-500 mt-1">Edit, renew, or manage your active advertisements.</p>
              </div>

              <div
                onClick={() => setActiveTab('favorites')}
                className={`cursor-pointer p-6 rounded-lg border transition-all ${
                  activeTab === 'favorites' ? 'bg-white border-[#037166] shadow-md ring-2 ring-[#037166]/10' : 'bg-white border-slate-200 hover:border-[#037166]'
                }`}
              >
                <Heart className="w-8 h-8 text-rose-500 mb-3" />
                <h3 className="text-base font-bold text-slate-900">Saved Favorites ({savedFavorites.length})</h3>
                <p className="text-xs text-slate-500 mt-1">View and manage bookmarked marketplace items.</p>
              </div>

              <Link href="/sell-buy/chat" className="bg-white p-6 rounded-lg border border-slate-200 hover:border-[#037166] hover:shadow-md transition-all block">
                <MessageSquare className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="text-base font-bold text-slate-900">Chats & Inquiries ({unreadChatsCount})</h3>
                <p className="text-xs text-slate-500 mt-1">Communicate directly with interested buyers.</p>
              </Link>

              <div
                onClick={() => setIsKycModalOpen(true)}
                className="cursor-pointer bg-white p-6 rounded-lg border border-slate-200 hover:border-[#037166] hover:shadow-md transition-all"
              >
                <ShieldCheck className="w-8 h-8 text-teal-600 mb-3" />
                <h3 className="text-base font-bold text-slate-900">Seller Verification</h3>
                <p className="text-xs text-slate-500 mt-1">
                  KYC Status: <span className="font-extrabold text-[#037166]">{kycStatusLabel}</span>
                </p>
              </div>
            </div>

            {/* TAB CONTENT: Listings / Favorites */}
            {activeTab === 'listings' ? (
              <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Your Advertisements</h3>
                    <p className="text-xs text-slate-500">Listings created under your account ({userListings.length})</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenPostAdModal}
                    className="text-xs font-bold text-[#037166] hover:underline"
                  >
                    + Post New Ad
                  </button>
                </div>

                {loadingListings ? (
                  <div className="py-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-[#037166] mx-auto mb-2" />
                    <p className="text-xs font-semibold">Loading your active listings...</p>
                  </div>
                ) : userListings.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {userListings.map((item) => {
                      const isPending = (item.status || '').toUpperCase() === 'PENDING_REVIEW';
                      return (
                        <div key={item._id || item.id || item.slug} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={getImageUrl(item.images?.[0] || item.coverImage || item.image)}
                              alt={item.title || item.name}
                              className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900">{item.title || item.name}</h4>
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                  isPending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-[#037166]'
                                }`}>
                                  {isPending ? 'Under Review' : 'Active'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                {item.location?.city || item.city || 'Hyderabad'} • ₹{Number(item.price || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/sell-buy/ad/${item.slug}`}
                              className="text-xs font-bold text-[#037166] hover:bg-[#037166]/10 px-3 py-2 rounded-md transition-colors inline-flex items-center gap-1"
                            >
                              View Ad <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 space-y-3">
                    <Tag className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">You haven&apos;t posted any advertisements yet.</p>
                    <button
                      type="button"
                      onClick={handleOpenPostAdModal}
                      className="bg-[#037166] hover:bg-[#025951] text-white font-extrabold text-xs px-6 py-3 rounded-md shadow-md transition-all inline-block"
                    >
                      Post Your First Ad Now
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* TAB: SAVED FAVORITES */
              <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Saved Favorites</h3>
                    <p className="text-xs text-slate-500">Bookmarked listings ({savedFavorites.length})</p>
                  </div>
                </div>

                {savedFavorites.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-3">
                    <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">No saved favorites yet.</p>
                    <Link
                      href="/sell-buy"
                      className="bg-[#037166] hover:bg-[#025951] text-white font-extrabold text-xs px-6 py-3 rounded-md shadow-md transition-all inline-block"
                    >
                      Explore Marketplace
                    </Link>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600">
                    You have {savedFavorites.length} saved item(s) in your bookmarks.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <SellBuyFooter />

      {/* Post Ad Modal Popup */}
      <PostAdModal isOpen={isPostAdModalOpen} onClose={() => setIsPostAdModalOpen(false)} />

      {/* SELLER KYC VERIFICATION MODAL (DYNAMIC FIELD VALIDATION) */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
          <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden my-8 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-md bg-[#037166]/10 text-[#037166] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Seller Verification (KYC)</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Earn a Verified Seller Badge on DoorstepHub</p>
                </div>
              </div>
              <button
                onClick={() => setIsKycModalOpen(false)}
                className="w-8 h-8 rounded-md bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleKycSubmit} className="p-6 space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-md flex items-start gap-2.5 text-xs text-slate-700">
                <BadgeCheck className="w-5 h-5 text-[#037166] shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-[#037166]">Required for Posting Advertisements</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Your KYC document files will be saved in backend local uploads directory for Admin approval.
                  </p>
                </div>
              </div>

              {/* Document Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Government ID Type *</label>
                <select
                  value={kycData.idType}
                  onChange={handleIdTypeChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md py-2.5 px-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#037166] focus:outline-none"
                >
                  <option value="AADHAAR">Aadhaar Card (12 Digits)</option>
                  <option value="PAN">PAN Card (10 Characters)</option>
                  <option value="DRIVING_LICENSE">Driving License (13-16 Chars)</option>
                  <option value="GST">GSTIN / Business Registration (15 Chars)</option>
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name on Document *</label>
                <input
                  type="text"
                  placeholder="e.g. Bhanu Prakash"
                  value={kycData.fullName}
                  onChange={(e) => setKycData({ ...kycData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md py-2.5 px-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#037166] focus:outline-none"
                  required
                />
              </div>

              {/* Dynamic ID Number Field with Real-Time Validation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">{idConfig.label} *</label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {kycData.idNumber.length} / {idConfig.maxLength}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={idConfig.maxLength}
                  placeholder={idConfig.placeholder}
                  value={kycData.idNumber}
                  onChange={handleIdNumberChange}
                  className={`w-full bg-slate-50 border rounded-md py-2.5 px-3 text-xs font-mono text-slate-900 focus:ring-2 focus:outline-none ${
                    kycData.idNumber && !isIdValid
                      ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                      : kycData.idNumber && isIdValid
                      ? 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/20'
                      : 'border-slate-300 focus:ring-[#037166]'
                  }`}
                  required
                />
                {kycData.idNumber && !isIdValid && (
                  <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {idConfig.errorMsg}
                  </p>
                )}
                {kycData.idNumber && isIdValid && (
                  <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Valid format for {kycData.idType.replace('_', ' ')}
                  </p>
                )}
              </div>

              {/* DOCUMENT UPLOAD CARDS WITH TYPE-BASED RESTRICTIONS */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* FRONT ID CARD (MANDATORY) */}
                <div className="relative">
                  <input
                    type="file"
                    id="docFrontInput"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFrontFileChange}
                  />
                  {docFrontPreview ? (
                    <div className="relative border-2 border-[#037166] rounded-md p-2 bg-emerald-50/50 flex flex-col items-center justify-center text-center h-32 overflow-hidden group">
                      <img
                        src={docFrontPreview}
                        alt="Front ID Preview"
                        className="w-full h-20 object-cover rounded-xs border border-slate-200"
                      />
                      <div className="flex items-center justify-between w-full mt-1.5 px-1">
                        <span className="text-[10px] font-extrabold text-[#037166] truncate max-w-[100px]">
                          ✓ {docFrontFile?.name || 'Front Photo'}
                        </span>
                        <label
                          htmlFor="docFrontInput"
                          className="text-[10px] text-[#037166] font-bold underline cursor-pointer"
                        >
                          Change
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="docFrontInput"
                      className="border-2 border-dashed border-slate-300 hover:border-[#037166] rounded-md p-4 text-center bg-slate-50 hover:bg-[#037166]/5 cursor-pointer transition-all flex flex-col items-center justify-center h-32 block"
                    >
                      <Upload className="w-5 h-5 text-[#037166] mb-1.5" />
                      <p className="text-xs font-bold text-slate-800">Upload Front Side *</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG (Max 5MB)</p>
                    </label>
                  )}
                </div>

                {/* BACK ID CARD (MANDATORY FOR AADHAAR/DRIVING LICENSE, OPTIONAL FOR PAN/GST) */}
                <div className="relative">
                  <input
                    type="file"
                    id="docBackInput"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleBackFileChange}
                  />
                  {docBackPreview ? (
                    <div className="relative border-2 border-[#037166] rounded-md p-2 bg-emerald-50/50 flex flex-col items-center justify-center text-center h-32 overflow-hidden group">
                      <img
                        src={docBackPreview}
                        alt="Back ID Preview"
                        className="w-full h-20 object-cover rounded-xs border border-slate-200"
                      />
                      <div className="flex items-center justify-between w-full mt-1.5 px-1">
                        <span className="text-[10px] font-extrabold text-[#037166] truncate max-w-[100px]">
                          ✓ {docBackFile?.name || 'Back Photo'}
                        </span>
                        <label
                          htmlFor="docBackInput"
                          className="text-[10px] text-[#037166] font-bold underline cursor-pointer"
                        >
                          Change
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="docBackInput"
                      className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center h-32 block ${
                        idConfig.requiresBack
                          ? 'border-slate-300 hover:border-[#037166] bg-slate-50 hover:bg-[#037166]/5'
                          : 'border-slate-200 bg-slate-50/60 opacity-80'
                      }`}
                    >
                      <Upload className="w-5 h-5 text-[#037166] mb-1.5" />
                      <p className="text-xs font-bold text-slate-800">
                        Upload Back Side {idConfig.requiresBack ? '*' : '(Optional)'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG (Max 5MB)</p>
                    </label>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsKycModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingKyc || (kycData.idNumber && !isIdValid)}
                  className="bg-[#037166] hover:bg-[#025951] text-white font-extrabold text-xs px-6 py-2.5 rounded-md shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingKyc ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Submit Verification to Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
