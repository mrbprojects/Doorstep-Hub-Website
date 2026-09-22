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
  updateSellBuyListing,
  fetchSellBuyFavorites,
  toggleFavorite,
  removeFavorite,
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
  Star,
  Sparkles,
  ThumbsUp,
  Camera,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/env';

export default function MarketplaceDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const { user, token, logout, updateProfile } = useAuth() || {};
  const { openAuthModal } = useAuthModal() || {};

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [initialEmail, setInitialEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);
  const [profileImgFile, setProfileImgFile] = useState(null);
  const [profileImgPreview, setProfileImgPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

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
  const [editingAd, setEditingAd] = useState(null);
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

      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('kyc') === 'open') {
        // Clean the ?kyc=open from URL immediately so refresh doesn't re-open it
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);

        // Only open the KYC form if the user hasn't submitted yet
        let cachedStatus = 'NOT_SUBMITTED';
        const kycStr2 = localStorage.getItem('seller_kyc_data');
        if (kycStr2) {
          try {
            const parsed2 = JSON.parse(kycStr2);
            cachedStatus = parsed2?.status || 'NOT_SUBMITTED';
          } catch (e) {}
        }
        if (cachedStatus === 'NOT_SUBMITTED' || cachedStatus === 'REJECTED') {
          setIsKycModalOpen(true);
        } else {
          // Already submitted or approved — just show a toast
          if (cachedStatus === 'SUBMITTED' || cachedStatus === 'UNDER_REVIEW') {
            setTimeout(() => {
              // toast is called after mount; dynamically importing to avoid SSR issues
              import('sonner').then(({ toast }) => {
                toast.info('Your account is under review. Once approved, we will let you know via email.', { duration: 6000 });
              });
            }, 500);
          }
        }
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

  // Load favorites from API and local storage
  const loadUserFavorites = async () => {
    let activeFavs = [];
    try {
      const favsStr = localStorage.getItem('sell_buy_favorites');
      if (favsStr) {
        const parsed = JSON.parse(favsStr);
        if (Array.isArray(parsed)) activeFavs = parsed;
      }
    } catch (e) {}

    if (currentUserId) {
      try {
        const apiFavs = await fetchSellBuyFavorites(currentUserId, authToken);
        if (Array.isArray(apiFavs)) {
          activeFavs = apiFavs;
        }
      } catch (e) {
        console.error('Error fetching favorites:', e);
      }
    }

    setSavedFavorites(activeFavs);
    try {
      localStorage.setItem('sell_buy_favorites', JSON.stringify(activeFavs));
    } catch (e) {}
  };

  useEffect(() => {
    loadUserFavorites();

    const handleFavUpdated = () => {
      loadUserFavorites();
    };

    window.addEventListener('favorites-updated', handleFavUpdated);
    window.addEventListener('storage', handleFavUpdated);
    return () => {
      window.removeEventListener('favorites-updated', handleFavUpdated);
      window.removeEventListener('storage', handleFavUpdated);
    };
  }, [currentUserId, authToken]);

  const handleRemoveFavorite = async (item) => {
    const targetId = String(item?._id || item?.id || item?.slug || '');
    if (!targetId) return;

    // 1. Optimistic removal from state and local storage immediately
    const updated = savedFavorites.filter((f) => {
      const fId = String(f?._id || f?.id || f?.slug || '');
      return fId !== targetId;
    });
    setSavedFavorites(updated);
    try {
      localStorage.setItem('sell_buy_favorites', JSON.stringify(updated));
    } catch (e) {}

    // 2. Call backend delete endpoint
    const dbListingId = item._id || item.id;
    if (dbListingId && currentUserId) {
      try {
        await removeFavorite(dbListingId, currentUserId, authToken);
      } catch (err) {
        console.error('Error removing favorite from backend:', err);
      }
    }
    toast.success('Removed from saved favorites');
  };

  const handleOpenProfileModal = () => {
    const rawAvatar = activeUser?.image || activeUser?.profilePic || activeUser?.profile || '';
    const hasCustom =
      rawAvatar &&
      !rawAvatar.includes('default_image.jpg') &&
      !rawAvatar.includes('default_profile');
    setNameInput(activeUser?.name || '');
    const existingEmail = activeUser?.email || '';
    setEmailInput(existingEmail);
    setInitialEmail(existingEmail);
    setEmailOtp('');
    setEmailOtpSent(false);
    setEmailVerified(Boolean(activeUser?.emailVerifiedAt));
    setProfileImgPreview(hasCustom ? getImageUrl(rawAvatar) : null);
    setProfileImgFile(null);
    setIsProfileModalOpen(true);
  };

  const handleProfileImgChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    setProfileImgFile(file);
    setProfileImgPreview(URL.createObjectURL(file));
  };

  const isEmailChanged = emailInput.trim().toLowerCase() !== initialEmail.trim().toLowerCase();

  const handleEmailChange = (value) => {
    setEmailInput(value);
    if (value.trim().toLowerCase() !== initialEmail.trim().toLowerCase()) {
      setEmailVerified(false);
    } else {
      setEmailVerified(Boolean(activeUser?.emailVerifiedAt));
    }
    setEmailOtp('');
    setEmailOtpSent(false);
  };

  const handleSendEmailOtp = async () => {
    const email = emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!authToken) {
      toast.error('Please sign in again to verify your email');
      return;
    }

    try {
      setSendingEmailOtp(true);
      const response = await fetch(`${API_BASE_URL}/app/user/profile/email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send verification code');
      }
      setEmailOtpSent(true);
      setEmailVerified(false);
      toast.success(data.message || 'Verification code sent');
    } catch (err) {
      toast.error(err.message || 'Failed to send verification code');
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    const email = emailInput.trim().toLowerCase();
    if (!/^\d{6}$/.test(emailOtp)) {
      toast.error('Enter the six-digit verification code');
      return;
    }

    try {
      setVerifyingEmailOtp(true);
      const response = await fetch(`${API_BASE_URL}/app/user/profile/verify-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ email, otp: emailOtp }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid verification code');
      }
      setEmailVerified(true);
      setEmailOtpSent(false);
      toast.success('Email verified successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to verify email');
    } finally {
      setVerifyingEmailOtp(false);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    const trimmedName = nameInput.trim();
    const trimmedEmail = emailInput.trim();

    if (!trimmedName) {
      toast.error('Please enter your name');
      return;
    }
    if (trimmedEmail && (!trimmedEmail.includes('@') || !trimmedEmail.includes('.'))) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (trimmedEmail && isEmailChanged && !emailVerified) {
      toast.error('Verify your new email address before saving');
      return;
    }

    try {
      setSavingProfile(true);
      const payload = new FormData();
      payload.append('name', trimmedName);
      if (trimmedEmail) payload.append('email', trimmedEmail);
      if (activeUser?.mobile || activeUser?.phone) {
        payload.append('phone', activeUser.mobile || activeUser.phone);
      }
      if (profileImgFile) {
        payload.append('image', profileImgFile);
      }

      if (updateProfile) {
        await updateProfile(payload);
      }

      // Also update local storage cache if present
      const stored = localStorage.getItem('user_details') || localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.name = trimmedName;
          if (trimmedEmail) parsed.email = trimmedEmail;
          if (profileImgPreview) parsed.image = profileImgPreview;
          localStorage.setItem('user_details', JSON.stringify(parsed));
          localStorage.setItem('user', JSON.stringify(parsed));
          setLocalUser(parsed);
        } catch (err) {}
      }

      setIsProfileModalOpen(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [soldModalOpen, setSoldModalOpen] = useState(false);
  const [selectedSoldItem, setSelectedSoldItem] = useState(null);
  const [isSubmittingSold, setIsSubmittingSold] = useState(false);

  const handleOpenSoldModal = (item) => {
    setSelectedSoldItem(item);
    setSoldModalOpen(true);
  };

  const handleConfirmSoldModal = async (e) => {
    if (e) e.preventDefault();
    if (!selectedSoldItem) return;

    const listingId = selectedSoldItem._id || selectedSoldItem.id;
    try {
      setIsSubmittingSold(true);
      const res = await updateSellBuyListing(
        listingId,
        {
          status: 'SOLD_OUT',
          userId: currentUserId,
        },
        authToken
      );

      if (res.success || res.error === false || res.data) {
        setUserListings((prev) =>
          prev.map((l) =>
            (l._id || l.id) === listingId ? { ...l, status: 'SOLD_OUT' } : l
          )
        );
        toast.success('Ad marked as Sold Out.');
        setSoldModalOpen(false);
        setSelectedSoldItem(null);
      } else {
        toast.error(res.message || 'Failed to update ad status');
      }
    } catch (err) {
      console.error('Error marking ad as sold:', err);
      toast.error('Failed to update listing status');
    } finally {
      setIsSubmittingSold(false);
    }
  };

  const handleToggleListingStatus = async (item, newStatus) => {
    const listingId = item._id || item.id;
    if (!listingId) return;

    if (newStatus === 'SOLD_OUT') {
      handleOpenSoldModal(item);
      return;
    }

    try {
      setUpdatingStatusId(listingId);
      const res = await updateSellBuyListing(
        listingId,
        { status: newStatus, userId: currentUserId },
        authToken
      );

      if (res.success || res.error === false || res.data) {
        setUserListings((prev) =>
          prev.map((l) =>
            (l._id || l.id) === listingId ? { ...l, status: newStatus } : l
          )
        );
        if (newStatus === 'ACTIVE') {
          toast.success('Ad activated! It is now live on Doorstep Hub marketplace.');
        } else {
          toast.success(`Status updated to ${newStatus}`);
        }
      } else {
        toast.error(res.message || 'Failed to update ad status');
      }
    } catch (err) {
      console.error('Error updating listing status:', err);
      toast.error('Failed to update listing status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Analytics Stats calculated strictly from real user listings & state (NO hardcoded fallbacks!)
  const activeAdsCount = userListings.filter((item) => (item.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  const soldAdsCount = userListings.filter((item) => (item.status || '').toUpperCase() === 'SOLD_OUT' || (item.status || '').toUpperCase() === 'SOLD').length;
  const pendingAdsCount = userListings.filter((item) => (item.status || '').toUpperCase() === 'PENDING_REVIEW').length;
  const totalViews = userListings.reduce((acc, item) => acc + Number(item.viewsCount || item.views || 0), 0);

  const isKycApproved =
    kycData.status === 'APPROVED' || kycData.status === 'VERIFIED';
  const isKycPending =
    kycData.status === 'SUBMITTED' || kycData.status === 'UNDER_REVIEW' || kycData.status === 'PENDING_REVIEW';

  const kycStatusLabel = isKycApproved
    ? 'Verified'
    : isKycPending
    ? 'Under Admin Review'
    : 'Not Verified';

  // Guard for posting ads - STRICT ADMIN APPROVAL REQUIRED
  const handleOpenPostAdModal = () => {
    setEditingAd(null);
    if (!isAuthenticated) {
      if (openAuthModal) openAuthModal();
      else toast.error('Please login to post an advertisement');
      return;
    }

    if (!isKycApproved) {
      toast.error('Verification (KYC) Required! Admin must approve your KYC before you can post ads.', {
        duration: 4000,
      });
      setIsKycModalOpen(true);
      return;
    }

    setIsPostAdModalOpen(true);
  };

  const handleOpenEditAdModal = (ad) => {
    setEditingAd(ad);
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
    { label: 'Sold Out', count: soldAdsCount, icon: CheckCircle, color: 'bg-orange-50 text-orange-600' },
    { label: 'Pending Review', count: pendingAdsCount, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Views', count: totalViews, icon: Eye, color: 'bg-blue-50 text-blue-600' },
    { label: 'Saved Favorites', count: savedFavorites.length, icon: Heart, color: 'bg-rose-50 text-rose-600' },
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
            {(() => {
              const rawAvatar = activeUser?.image || activeUser?.profilePic || activeUser?.profile || '';
              const hasCustomAvatar =
                rawAvatar &&
                !rawAvatar.includes('default_image.jpg') &&
                !rawAvatar.includes('default_profile');

              return (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    {/* Profile Avatar with Photo Display & Camera Update Trigger */}
                    <div className="relative group shrink-0">
                      <div
                        onClick={handleOpenProfileModal}
                        className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-[#037166] to-[#025951] text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-white ring-2 ring-slate-100 cursor-pointer transition-transform group-hover:scale-105"
                        title="Click to update profile photo"
                      >
                        {hasCustomAvatar ? (
                          <img
                            src={getImageUrl(rawAvatar)}
                            alt={activeUser?.name || 'Seller'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span style={{ display: hasCustomAvatar ? 'none' : 'flex' }} className="w-full h-full items-center justify-center font-black">
                          {activeUser?.name?.[0]?.toUpperCase() || <User className="w-7 h-7 text-white/90" />}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenProfileModal}
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center hover:bg-[#037166] hover:text-white transition-all cursor-pointer hover:scale-110"
                        title="Update profile picture"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                          <span>Welcome back, {activeUser?.name || 'Seller'}!</span>
                          <button
                            type="button"
                            onClick={handleOpenProfileModal}
                            className="text-slate-400 hover:text-[#037166] transition-colors cursor-pointer"
                            title="Edit profile & email"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </h1>
                        <button
                          type="button"
                          onClick={() => {
                            if (isKycApproved) {
                              toast.success('✓ Your Verification (KYC) is Approved by Admin! You have full access to post ads.');
                            } else if (isKycPending) {
                              toast.info('⏳ Your KYC documents are currently under Admin review.');
                            } else {
                              setIsKycModalOpen(true);
                            }
                          }}
                          className={`text-[11px] font-semibold px-3 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                            isKycApproved
                              ? 'bg-emerald-100 text-[#037166] border border-emerald-300'
                              : isKycPending
                              ? 'bg-amber-100 text-amber-700 border border-amber-300'
                              : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <BadgeCheck className="w-4 h-4" />
                          {isKycApproved
                            ? 'Verified Seller'
                            : isKycPending
                            ? 'KYC Under Admin Review'
                            : 'Unverified - Submit KYC to Post Ads'}
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap mt-0.5">
                        {activeUser?.mobile && (
                          <span className="inline-flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 px-2.5 py-0.5 rounded-lg text-slate-700">
                            <span>📱</span>
                            <span>{activeUser.mobile}</span>
                            <span className="text-[10px] text-slate-400 ml-0.5" title="Phone is linked to OTP and locked">🔒</span>
                          </span>
                        )}
                        {activeUser?.email ? (
                          <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100/90 border border-slate-200/80 px-2.5 py-0.5 rounded-lg">
                            <span>✉️</span>
                            <span>{activeUser.email}</span>
                            <button
                              type="button"
                              onClick={handleOpenProfileModal}
                              className="text-[10px] text-[#037166] hover:underline font-bold ml-0.5 cursor-pointer"
                              title="Edit email address"
                            >
                              Edit
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleOpenProfileModal}
                            className="text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          >
                            <span className="text-amber-600">⚠️</span>
                            <span>Email not added • Click to add email</span>
                          </button>
                        )}
                        {!activeUser?.mobile && !activeUser?.email && <span>Seller Account</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleOpenPostAdModal}
                      className="bg-[#037166] hover:bg-[#025951] text-white font-extrabold text-xs px-6 py-3.5 rounded-md shadow-md transition-all flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Post AD Free Now</span>
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
              );
            })()}

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
                <div className="flex items-center justify-between mb-3">
                  <Tag className="w-8 h-8 text-[#037166]" />
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-[#037166] border border-teal-200">
                    {userListings.length} {userListings.length === 1 ? 'Ad' : 'Ads'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">My Ads</h3>
                <p className="text-xs text-slate-500 mt-1">Edit, renew, or manage your active advertisements.</p>
              </div>

              <div
                onClick={() => setActiveTab('favorites')}
                className={`cursor-pointer p-6 rounded-lg border transition-all ${
                  activeTab === 'favorites' ? 'bg-white border-[#037166] shadow-md ring-2 ring-[#037166]/10' : 'bg-white border-slate-200 hover:border-[#037166]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Heart className="w-8 h-8 text-rose-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                    {savedFavorites.length} {savedFavorites.length === 1 ? 'Ad' : 'Ads'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Favorite Ads</h3>
                <p className="text-xs text-slate-500 mt-1">View and manage bookmarked marketplace items.</p>
              </div>

              <Link href="/sell-buy/chat" className="bg-white p-6 rounded-lg border border-slate-200 hover:border-[#037166] hover:shadow-md transition-all block">
                <div className="flex items-center justify-between mb-3">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                  {unreadChatsCount > 0 && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 animate-pulse">
                      New
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900">Messages</h3>
                <p className="text-xs text-slate-500 mt-1">Communicate directly with interested buyers.</p>
              </Link>

              <div
                onClick={() => {
                  if (isKycApproved) {
                    toast.success('✓ Your Verification (KYC) is Approved by Admin! You have full access to post ads.');
                  } else if (isKycPending) {
                    toast.info('⏳ Your KYC documents are currently under Admin review.');
                  } else {
                    setIsKycModalOpen(true);
                  }
                }}
                className={`p-6 rounded-2xl border transition-all ${
                  isKycApproved
                    ? 'bg-emerald-50/40 border-emerald-200 cursor-default'
                    : isKycPending
                    ? 'bg-amber-50/40 border-amber-200 cursor-default'
                    : 'bg-white border-slate-200 hover:border-[#037166] hover:shadow-md cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <ShieldCheck className={`w-8 h-8 ${isKycApproved ? 'text-[#037166]' : isKycPending ? 'text-amber-600' : 'text-red-500'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isKycApproved
                      ? 'bg-emerald-100 text-[#037166] border border-emerald-200'
                      : isKycPending
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}>
                    {isKycApproved ? 'Verified ✓' : isKycPending ? 'Under Review' : 'Not Verified'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Verification (KYC)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  KYC Status: <span className={`font-extrabold ${isKycApproved ? 'text-[#037166]' : isKycPending ? 'text-amber-700' : 'text-red-600'}`}>{kycStatusLabel}</span>
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
                      const rawStatus = (item.status || 'ACTIVE').toUpperCase();
                      const isPending = rawStatus === 'PENDING_REVIEW' || rawStatus === 'UNDER_REVIEW';
                      const isSold = rawStatus === 'SOLD_OUT' || rawStatus === 'SOLD';
                      const isActive = rawStatus === 'ACTIVE';
                      const itemId = item._id || item.id || item.slug;
                      const isBusy = updatingStatusId === (item._id || item.id);

                      return (
                        <div
                          key={itemId}
                          className={`py-4 px-3 sm:px-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all ${
                            isSold
                              ? 'bg-slate-50/90 border-slate-200/80 opacity-60 grayscale-[35%] select-none'
                              : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                              <img
                                src={getImageUrl(item.images?.[0] || item.coverImage || item.image)}
                                alt={item.title || item.name}
                                className={`w-full h-full object-cover ${isSold ? 'grayscale opacity-75' : ''}`}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'https://devapis.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg';
                                }}
                              />
                              {isSold && (
                                <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center">
                                  <span className="text-[9px] font-black text-white uppercase tracking-wider bg-rose-600 px-1.5 py-0.5 rounded shadow">
                                    SOLD OUT
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`font-bold text-sm line-clamp-1 ${isSold ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                  {item.title || item.name}
                                </h4>
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                  isPending
                                    ? 'bg-amber-100 text-amber-700'
                                    : isSold
                                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                    : isActive
                                    ? 'bg-emerald-100 text-[#037166]'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {isPending ? 'Under Review' : isSold ? 'Sold Out' : isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                {item.location?.city || item.city || 'Hyderabad'} • ₹{Number(item.price || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                            {/* Mark as Sold button (if active) */}
                            {isActive && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleToggleListingStatus(item, 'SOLD_OUT')}
                                title="Mark as Sold Out"
                                className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                              >
                                {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 text-rose-600" />}
                                <span>Mark as Sold</span>
                              </button>
                            )}

                            {/* If Sold: Grayed out and disabled badge (not clickable again) */}
                            {isSold && (
                              <span className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200/80 px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-not-allowed select-none whitespace-nowrap">
                                <Check className="w-3.5 h-3.5 text-slate-400" />
                                <span>Sold Out</span>
                              </span>
                            )}

                            {/* Edit Ad button (if not sold) */}
                            {!isSold && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditAdModal(item)}
                                title="Edit Advertisement"
                                className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3.5 py-2 rounded-xl transition-all active:scale-95 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                              >
                                <Pencil className="w-3.5 h-3.5 text-amber-600" />
                                <span>Edit</span>
                              </button>
                            )}

                            <Link
                              href={`/sell-buy/ad/${item.slug}`}
                              className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5 border whitespace-nowrap ${
                                isSold
                                  ? 'text-slate-400 border-slate-200 bg-slate-50 pointer-events-none cursor-not-allowed'
                                  : 'text-[#037166] hover:bg-[#037166]/10 border-slate-200 bg-white'
                              }`}
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
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Saved Favorites</h3>
                    <p className="text-xs text-slate-500">Wishlisted marketplace listings ({savedFavorites.length})</p>
                  </div>
                  <Link
                    href="/sell-buy"
                    className="text-xs font-extrabold text-[#037166] hover:underline"
                  >
                    + Explore Marketplace
                  </Link>
                </div>

                {savedFavorites.length === 0 ? (
                  <div className="py-14 text-center text-slate-400 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-2xl">
                      <Heart className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700">No saved favorites yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Tap the heart icon on any marketplace advertisement to bookmark it and access it quickly here.
                    </p>
                    <Link
                      href="/sell-buy"
                      className="bg-[#037166] hover:bg-[#025951] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all inline-block mt-2"
                    >
                      Explore Marketplace
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedFavorites.map((fav) => {
                      const favId = fav._id || fav.id || fav.slug;
                      return (
                        <div
                          key={favId}
                          className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                        >
                          <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                            <img
                              src={getImageUrl(fav.image || fav.images?.[0] || fav.coverImage)}
                              alt={fav.title || fav.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://devapis.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFavorite(fav)}
                              title="Remove from favorites"
                              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-rose-600 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <p className="text-base font-black text-slate-900">
                                ₹{Number(fav.price || 0).toLocaleString('en-IN')}
                              </p>
                              <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mt-0.5 group-hover:text-[#037166] transition-colors">
                                {fav.title || fav.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                {/* <span>📍</span> */}
                                <span>{fav.city || fav.location?.city || 'Hyderabad'}</span>
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <Link
                                href={`/sell-buy/ad/${fav.slug || favId}`}
                                className="flex-1 text-center bg-[#037166] hover:bg-[#025951] text-white text-xs font-bold py-2 rounded-xl transition-colors shadow-2xs"
                              >
                                View Details
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleRemoveFavorite(fav)}
                                className="px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                title="Remove"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <SellBuyFooter />

      {/* Post / Edit Ad Modal Popup */}
      <PostAdModal
        isOpen={isPostAdModalOpen}
        initialData={editingAd}
        onClose={() => {
          setIsPostAdModalOpen(false);
          setEditingAd(null);
        }}
      />

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
                  <h2 className="text-base font-black text-slate-900">Verification (KYC)</h2>
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

            {/* Modal Content: If Approved, Pending, or Submission Form */}
            {isKycApproved ? (
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#037166] flex items-center justify-center mx-auto shadow-sm">
                  <BadgeCheck className="w-9 h-9 text-[#037166]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">Verification Approved</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Your identity documents have been reviewed and approved by the admin. Your account is fully verified.
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 font-bold max-w-sm mx-auto">
                  ✓ Verified Seller Badge Active • Unlimited Ad Posting Enabled
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsKycModalOpen(false)}
                    className="bg-[#037166] hover:bg-[#025951] text-white font-extrabold text-xs px-8 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Done / Close
                  </button>
                </div>
              </div>
            ) : isKycPending ? (
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                  <Clock className="w-9 h-9 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">KYC Under Admin Review</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Your documents have already been uploaded and are currently being reviewed by our Doorstep Hub. No further action is required.
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 font-bold max-w-sm mx-auto">
                  ⏳ Review in progress • We will notify you once approved
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsKycModalOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-8 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">ID Proof *</label>
                  <select
                    value={kycData.idType}
                    onChange={handleIdTypeChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md py-2.5 px-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#037166] focus:outline-none"
                  >
                    <option value="AADHAAR">Aadhaar Card (12 Digits)</option>
                    <option value="DRIVING_LICENSE">Driving License (13-16 Chars)</option>
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
            )}
          </div>
        </div>
      )}

      {/* ── MARK AS SOLD OUT CONFIRMATION MODAL ── */}
      {soldModalOpen && selectedSoldItem && (
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
                <img
                  src={getImageUrl(selectedSoldItem.images?.[0] || selectedSoldItem.coverImage || selectedSoldItem.image)}
                  alt={selectedSoldItem.title || selectedSoldItem.name}
                  className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://devapis.doorstephub.com/uploads/thumbn_ph_image/default_image.jpg';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {selectedSoldItem.title || selectedSoldItem.name}
                  </p>
                  <p className="text-xs font-black text-[#037166] mt-0.5">
                    ₹{Number(selectedSoldItem.price || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {selectedSoldItem.location?.city || selectedSoldItem.city || 'Hyderabad'}
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
                disabled={isSubmittingSold}
                className="flex-[1.5] flex items-center justify-center gap-2 py-3 px-4 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl shadow-md shadow-rose-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingSold ? (
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

      {/* ── UPDATE PROFILE MODAL (PHOTO, NAME, EMAIL & LOCKED PHONE) ── */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#037166]/10 text-[#037166] flex items-center justify-center text-lg font-bold">
                  👤
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Seller Profile Settings</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Update your photo, display name, and email</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center border border-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto">
              {/* Profile Image Picker */}
              <div className="flex flex-col items-center justify-center pb-2">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#037166] to-[#025951] text-white font-black text-3xl flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-slate-100">
                    {profileImgPreview ? (
                      <img
                        src={profileImgPreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>{nameInput?.[0]?.toUpperCase() || <User className="w-9 h-9 text-white/90" />}</span>
                    )}
                  </div>
                  <label
                    htmlFor="profilePhotoPicker"
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#037166] hover:bg-[#025951] text-white shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    title="Choose photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </label>
                  <input
                    type="file"
                    id="profilePhotoPicker"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleProfileImgChange}
                  />
                </div>
                <label
                  htmlFor="profilePhotoPicker"
                  className="text-xs font-bold text-[#037166] hover:underline cursor-pointer mt-2"
                >
                  {profileImgPreview ? 'Change Photo' : 'Upload Profile Photo'}
                </label>
                <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG (Max 5MB)</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Bhanu Prakash"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#037166] focus:bg-white focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Email Address */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <label className="block text-xs font-bold text-slate-700">Email Address</label>
                  {emailInput.trim() && emailVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={emailInput}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="min-w-0 flex-1 bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#037166] focus:bg-white focus:outline-none transition-all"
                  />
                  {!emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={sendingEmailOtp || !emailInput.trim()}
                      className="shrink-0 rounded-xl bg-[#037166]/10 px-3 py-2.5 text-[11px] font-extrabold text-[#037166] hover:bg-[#037166]/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sendingEmailOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : emailOtpSent ? 'Resend' : 'Verify email'}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Used for buyer inquiry alerts and ad status notifications.
                </p>
                {emailOtpSent && !emailVerified && (
                  <div className="mt-2.5 rounded-xl border border-[#037166]/20 bg-[#037166]/5 p-2.5">
                    <p className="mb-2 text-[10px] font-semibold text-slate-600">
                      Enter the six-digit code sent to {emailInput.trim()}.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit OTP"
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold tracking-[0.2em] text-slate-900 outline-none focus:ring-2 focus:ring-[#037166]"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        disabled={verifyingEmailOtp || emailOtp.length !== 6}
                        className="shrink-0 rounded-lg bg-[#037166] px-3 py-2 text-[11px] font-extrabold text-white hover:bg-[#025951] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {verifyingEmailOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Phone Number (Locked & Non-Editable) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Registered Phone Number</label>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Locked (Cannot be changed)</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={activeUser?.mobile || activeUser?.phone || 'Not available'}
                    disabled
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl py-2.5 px-3.5 text-xs font-semibold cursor-not-allowed select-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Your phone number is permanently verified with OTP authentication for account security.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile || !nameInput.trim() || (Boolean(emailInput.trim()) && isEmailChanged && !emailVerified)}
                  className="bg-[#037166] hover:bg-[#025951] text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
