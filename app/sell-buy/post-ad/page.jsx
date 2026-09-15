'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SellBuyHeader } from '@/components/sell-buy/layout/SellBuyHeader';
import { SellBuyFooter } from '@/components/sell-buy/layout/SellBuyFooter';
import { fetchSellBuyCategories, getImageUrl } from '@/lib/sellBuyApi';
import {
  CheckCircle2,
  Upload,
  MapPin,
  Tag,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Grid,
  Loader2,
  FileText,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { SubcategoryIcon } from '@/components/sell-buy/SubcategoryIcon';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';

const isElectronicsCategory = (categoryName, subcategoryName) => {
  const text = `${categoryName || ''} ${subcategoryName || ''}`.toLowerCase();
  return (
    text.includes('electronic') ||
    text.includes('appliance') ||
    text.includes('laptop') ||
    text.includes('computer') ||
    text.includes('mobile') ||
    text.includes('tablet') ||
    text.includes('tv') ||
    text.includes('camera') ||
    text.includes('gadget')
  );
};

export default function PostAdPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [billCopyFile, setBillCopyFile] = useState(null);
  const [billCopyPreview, setBillCopyPreview] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  // Cropper state
  const [imagesToCrop, setImagesToCrop] = useState([]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [draftKycModalOpen, setDraftKycModalOpen] = useState(false);
  const [savedAdTitle, setSavedAdTitle] = useState('');

  const [formData, setFormData] = useState({
    categoryId: '',
    categoryName: '',
    subcategoryId: '',
    subcategoryName: '',
    title: '',
    description: '',
    price: '',
    isNegotiable: true,
    condition: 'used',
    warrantyStatus: 'Under Warranty',
    warrantyDetails: '',
    billCopy: 'Available',
    city: 'Hyderabad',
    area: '',
    phone: '',
  });

  useEffect(() => {
    fetchSellBuyCategories().then((cats) => {
      if (cats && cats.length > 0) {
        const parentCats = cats.filter((c) => !c.parent_id && !c.parentId);
        const list = parentCats.length > 0 ? parentCats : cats;
        setCategories(list);
        if (!formData.categoryId) {
          const firstCat = list[0];
          const firstCatId = String(firstCat?.id || firstCat?._id || '');
          const firstSubcats = firstCat?.subcategories || [];
          setFormData((prev) => ({
            ...prev,
            categoryId: firstCatId,
            categoryName: firstCat?.name || '',
            subcategoryId: firstSubcats.length > 0 ? String(firstSubcats[0]?.id || firstSubcats[0]?._id || '') : '',
            subcategoryName: firstSubcats.length > 0 ? firstSubcats[0]?.name || '' : '',
          }));
        }
      }
    });
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    toast.info('Detecting your location…');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const geo = await res.json();
          const addr = geo.address || {};

          const localArea =
            addr.suburb || addr.neighbourhood || addr.quarter ||
            addr.village || addr.town || addr.county || '';
          const city =
            addr.city || addr.town || addr.village || addr.county || 'Hyderabad';

          setFormData((prev) => ({
            ...prev,
            city: city || prev.city,
            area: localArea || prev.area,
          }));

          toast.success('Location detected successfully!');
        } catch (err) {
          console.error(err);
          toast.error('Could not fetch address details. Please fill manually.');
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please allow access in your browser.');
        } else {
          toast.error('Failed to detect location. Please fill manually.');
        }
      }
    );
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Setup for sequential cropping
    const newImagesToCrop = files.map(file => ({
      url: URL.createObjectURL(file),
      file: file
    }));
    
    setImagesToCrop(newImagesToCrop);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    
    // clear input
    e.target.value = null;
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    if (!imagesToCrop.length || !croppedAreaPixels) return;
    
    try {
      setIsCropping(true);
      const currentImage = imagesToCrop[0];
      const croppedBlob = await getCroppedImg(currentImage.url, croppedAreaPixels);
      
      const croppedFile = new File([croppedBlob], currentImage.file.name, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
      
      setSelectedFiles(prev => {
        const updated = [...prev, croppedFile];
        // max 10 images
        return updated.slice(0, 10);
      });
      
      const remainingImages = imagesToCrop.slice(1);
      setImagesToCrop(remainingImages);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (e) {
      console.error(e);
      toast.error('Failed to crop image');
    } finally {
      setIsCropping(false);
    }
  };

  const handleCropCancel = () => {
    const remainingImages = imagesToCrop.slice(1);
    setImagesToCrop(remainingImages);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleNext = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.categoryId) {
        toast.error('Please select a category.');
        return;
      }
      setStep(2);
    } else if (currentStep === 2) {
      if (!formData.title || formData.title.trim().length < 5) {
        toast.error('Please enter a valid title (min 5 characters).');
        return;
      }
      if (!formData.description || formData.description.trim().length < 10) {
        toast.error('Please enter a more detailed description (min 10 characters).');
        return;
      }
      if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
        toast.error('Please enter a valid price greater than 0.');
        return;
      }
      setStep(3);
    } else if (currentStep === 3) {
      if (selectedFiles.length === 0) {
        toast.error('Please upload at least one image of the item.');
        return;
      }
      setStep(4);
    } else if (currentStep === 4) {
      if (!formData.city || formData.city.trim().length === 0) {
        toast.error('Please enter your city.');
        return;
      }
      if (!formData.area || formData.area.trim().length === 0) {
        toast.error('Please enter your area or locality.');
        return;
      }
      setStep(5);
    } else if (currentStep === 5) {
      if (!formData.phone || formData.phone.trim().length < 10) {
        toast.error('Please enter a valid phone number.');
        return;
      }
      setStep(6);
    }
  };


  const handlePublish = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
      const userStr = typeof window !== 'undefined' ? (localStorage.getItem('user_details') || localStorage.getItem('user')) : '';
      let userId = '';
      let userEmail = '';
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          userId = parsedUser?._id || parsedUser?.id || '';
          userEmail = parsedUser?.email || '';
        } catch (e) {}
      }

      const fd = new FormData();
      if (userId) fd.append('user_id', userId);
      if (userEmail) fd.append('email', userEmail);
      fd.append('name', formData.title || 'Untitled Item');
      fd.append('description', formData.description || '');
      fd.append('category_id', formData.categoryId || '');
      fd.append('categoryId', formData.categoryId || '');
      if (formData.subcategoryId) {
        fd.append('subcategory_id', formData.subcategoryId);
        fd.append('subcategoryId', formData.subcategoryId);
        fd.append('sub_category_id', formData.subcategoryId);
      }
      fd.append('price', String(Number(formData.price) || 0));
      fd.append('condition', formData.condition);
      if (isElectronicsCategory(formData.categoryName, formData.subcategoryName)) {
        fd.append('warranty', formData.warrantyStatus || '');
        fd.append('warrantyStatus', formData.warrantyStatus || '');
        fd.append('warrantyDetails', formData.warrantyDetails || '');
        fd.append('billCopy', formData.billCopy || '');
        fd.append('hasBillCopy', formData.billCopy === 'Available' ? 'true' : 'false');
        if (formData.billCopy === 'Available' && billCopyFile) {
          fd.append('bill_copy_image', billCopyFile);
        }
      }
      fd.append('city', formData.city);
      fd.append('state', 'Telangana');
      fd.append('phone', formData.phone);
      // attach files
      selectedFiles.forEach((file) => {
        fd.append('gallery_images', file);
      });

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi').replace(/\/+$/, '');
      const res = await fetch(`${baseUrl}/sell-buy/add-item`, {
        method: 'POST',
        headers,
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      // ── KYC PENDING / DRAFT AD HANDLING ─────────────────────────────────────
      if (data?.isDraft || data?.kycRequired) {
        setSavedAdTitle(formData.title || 'Your Item');
        setDraftKycModalOpen(true);
        return;
      }
      // ────────────────────────────────────────────────────────────────────────

      if (res.status === 403) {
        setSavedAdTitle(formData.title || 'Your Item');
        setDraftKycModalOpen(true);
        return;
      }

      if ((data.error === false || data.success)) {
        toast.success('🎉 Advertisement published successfully! Your ad is now live.');
        router.push('/sell-buy/dashboard');
      } else {
        toast.error(data.message || 'Failed to post advertisement');
      }
    } catch (err) {
      console.error('Error posting ad:', err);
      toast.error(err?.message || 'An error occurred while posting your ad.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SellBuyHeader />

      <main className="flex-1 py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Wizard Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" /> 100% Free Listing — Zero Commission
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a]">Post Your Advertisement</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">List your item in 6 simple steps to reach local buyers</p>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold text-slate-500">
          {['Category', 'Details', 'Photos', 'Location', 'Contact', 'Preview'].map((stName, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={stName} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-[#037166] text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                </div>
                <span className={`hidden sm:inline ${isActive ? 'text-[#037166] font-extrabold' : ''}`}>
                  {stName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step Forms Container */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {/* STEP 1: CATEGORY */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Step 1: Choose Category
              </h2>
              {categories.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">Loading categories...</div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {categories.map((cat) => {
                  const catId = String(cat.id || cat._id || '');
                  const isSelected = formData.categoryId === catId;
                  const subcats = cat.subcategories || [];
                  return (
                    <button
                      key={catId}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          categoryId: catId,
                          categoryName: cat.name,
                          subcategoryId: subcats.length > 0 ? String(subcats[0]?.id || subcats[0]?._id || '') : '',
                          subcategoryName: subcats.length > 0 ? subcats[0]?.name || '' : '',
                        }));
                      }}
                      className={`flex flex-col items-center p-5 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'border-[#037166] bg-[#037166]/5 text-[#037166] ring-2 ring-[#037166]/20 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {cat.image ? (
                        <img src={getImageUrl(cat.image)} alt={cat.name} className="w-10 h-10 object-contain mb-2 rounded-xl" />
                      ) : (
                        <Grid className="w-8 h-8 mb-2" />
                      )}
                      <span className="text-xs font-bold leading-tight">{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Subcategories Selection */}
              {(() => {
                const activeCategory = categories.find(
                  (c) => String(c.id || c._id) === String(formData.categoryId)
                );
                const subcats = activeCategory?.subcategories || [];
                if (subcats.length === 0) return null;

                return (
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Select Subcategory for <span className="text-[#037166]">{formData.categoryName}</span>:
                      </label>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {subcats.length} subcategories available
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 pt-1">
                      {subcats.map((sub) => {
                        const subId = String(sub.id || sub._id || '');
                        const isSubSelected = formData.subcategoryId === subId;
                        return (
                          <button
                            key={subId}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                subcategoryId: subId,
                                subcategoryName: sub.name,
                              }));
                            }}
                            className="flex flex-col items-center gap-2 group transition-all cursor-pointer text-center focus:outline-none"
                          >
                            {/* Round Circle Icon Container */}
                            <div
                              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isSubSelected
                                  ? 'bg-gradient-to-br from-[#037166] to-[#04a99d] text-white ring-4 ring-[#037166]/20 shadow-lg scale-105'
                                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-600 hover:border-[#037166]/40 hover:text-[#037166] shadow-xs'
                              }`}
                            >
                              {sub.image ? (
                                <img
                                  src={getImageUrl(sub.image)}
                                  alt={sub.name}
                                  className={`w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-full transition-transform ${
                                    isSubSelected ? 'brightness-110' : 'group-hover:scale-110'
                                  }`}
                                />
                              ) : (
                                <SubcategoryIcon
                                  icon={sub.icon}
                                  name={sub.name}
                                  className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform ${
                                    isSubSelected ? 'text-white scale-110' : 'text-[#037166] group-hover:scale-110'
                                  }`}
                                />
                              )}

                              {/* Selection Checkmark Badge */}
                              {isSubSelected && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md ring-2 ring-white">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>

                            {/* Title Label underneath */}
                            <span
                              className={`text-[11px] sm:text-xs leading-tight line-clamp-2 max-w-[85px] sm:max-w-[95px] transition-colors ${
                                isSubSelected
                                  ? 'text-[#037166] font-extrabold'
                                  : 'text-slate-700 font-medium group-hover:text-[#037166]'
                              }`}
                            >
                              {sub.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => handleNext(1)}
                  className="bg-[#037166] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#025951] flex items-center gap-2"
                >
                  Continue to Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Step 2: Advertisement Details ({formData.categoryName}{formData.subcategoryName ? ` > ${formData.subcategoryName}` : ''})
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ad Title *</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 13 128GB Blue - Like New Condition"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#037166] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Description *</label>
                <textarea
                  rows={4}
                  placeholder="Describe your item's condition, features, reason for selling, warranty, etc."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#037166] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 35000"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#037166] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Condition *</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleChange('condition', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-[#037166] focus:outline-none"
                  >
                    <option value="new">Brand New (Unopened)</option>
                    <option value="like_new">Like New (Barely used)</option>
                    <option value="good">Good (Normal wear)</option>
                    <option value="fair">Fair (Visible signs of use)</option>
                    <option value="used">Used</option>
                  </select>
                </div>
              </div>

              {/* ── ELECTRONICS SPECIFIC INFORMATION (Warranty & Bill Copy) ── */}
              {isElectronicsCategory(formData.categoryName, formData.subcategoryName) && (
                <div className="bg-gradient-to-br from-teal-50/70 via-slate-50 to-emerald-50/50 border border-[#037166]/25 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-teal-100/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-[#037166] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        ⚡
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Electronics Specific Information
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Warranty status and original invoice availability for electronic devices
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-[#037166]/10 text-[#037166] rounded-full">
                      Electronics Only
                    </span>
                  </div>

                  {/* 1. Warranty Information */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Warranty Information *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { label: 'Under Warranty', value: 'Under Warranty', icon: '🛡️' },
                        { label: 'Brand Warranty', value: 'Brand Warranty', icon: '🏷️' },
                        { label: 'Out of Warranty', value: 'Out of Warranty', icon: '⏱️' },
                        { label: 'No Warranty', value: 'No Warranty', icon: '✕' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange('warrantyStatus', opt.value)}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                            formData.warrantyStatus === opt.value
                              ? 'border-[#037166] bg-[#037166] text-white shadow-xs ring-2 ring-[#037166]/20'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span>{opt.icon}</span>
                          <span className="truncate">{opt.label}</span>
                        </button>
                      ))}
                    </div>

                    {(formData.warrantyStatus === 'Under Warranty' || formData.warrantyStatus === 'Brand Warranty') && (
                      <div className="pt-1.5">
                        <input
                          type="text"
                          placeholder="Warranty duration / details (e.g. 6 Months Remaining, AppleCare+ till Dec 2026)"
                          value={formData.warrantyDetails}
                          onChange={(e) => handleChange('warrantyDetails', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#037166] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* 2. Bill Copy Availability */}
                  <div className="space-y-2 pt-3 border-t border-teal-100/60">
                    <label className="block text-xs font-bold text-slate-800">
                      Original Bill / Invoice Copy Available? *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleChange('billCopy', 'Available')}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                          formData.billCopy === 'Available'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="text-xl">🧾</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold">Bill Copy Available</p>
                          <p className="text-[11px] text-slate-500">I have original invoice / purchase bill copy</p>
                        </div>
                        {formData.billCopy === 'Available' && (
                          <span className="text-xs font-bold text-emerald-600">✓ Selected</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleChange('billCopy', 'Not Available')}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                          formData.billCopy === 'Not Available'
                            ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="text-xl">📄</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold">Bill Copy Not Available</p>
                          <p className="text-[11px] text-slate-500">Bill or invoice is not available</p>
                        </div>
                        {formData.billCopy === 'Not Available' && (
                          <span className="text-xs font-bold text-amber-600">✓ Selected</span>
                        )}
                      </button>
                    </div>

                    {/* ── Bill Copy Image Upload (when Available) ── */}
                    {formData.billCopy === 'Available' && (
                      <div className="mt-3 p-4 bg-white border border-emerald-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                            <span className="text-base">📸</span>
                            <span>Upload Bill / Invoice Copy Image</span>
                          </label>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            Invoice Photo
                          </span>
                        </div>

                        {billCopyPreview ? (
                          <div className="flex items-center gap-4">
                            <div className="relative group">
                              <img
                                src={billCopyPreview}
                                alt="Bill Copy Preview"
                                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border-2 border-emerald-500 shadow-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setBillCopyFile(null);
                                  setBillCopyPreview('');
                                }}
                                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                                title="Remove Bill Copy"
                              >
                                <span className="text-xs font-bold">✕</span>
                              </button>
                            </div>
                            <div className="text-xs space-y-1.5">
                              <p className="font-bold text-emerald-700 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Bill Copy Attached</span>
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {billCopyFile?.name || 'Invoice Image'}
                              </p>
                              <label
                                htmlFor="page-bill-upload"
                                className="inline-block text-xs text-[#037166] font-bold hover:underline cursor-pointer"
                              >
                                Change Image
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              id="page-bill-upload"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setBillCopyFile(file);
                                  setBillCopyPreview(URL.createObjectURL(file));
                                }
                              }}
                            />
                            <label
                              htmlFor="page-bill-upload"
                              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl bg-emerald-50/40 hover:bg-emerald-50/80 cursor-pointer transition-colors text-xs font-bold text-emerald-800"
                            >
                              <Upload className="w-4 h-4 text-emerald-600" />
                              <span>Click to browse & upload Bill / Invoice copy image</span>
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-slate-100 text-slate-700 text-xs font-bold px-6 py-3 rounded-xl hover:bg-slate-200 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => handleNext(2)}
                  className="bg-[#037166] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#025951] flex items-center gap-2"
                >
                  Next: Add Photos <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PHOTOS */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Step 3: Upload Photos
              </h2>
              <p className="text-xs text-slate-500">Upload up to 10 photos. Clear images attract 3x more buyers!</p>

              <label className="block border-2 border-dashed border-slate-300 hover:border-[#037166] rounded-2xl p-8 text-center bg-slate-50/50 cursor-pointer transition-colors">
                <Upload className="w-10 h-10 text-[#037166] mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-700">Click to browse or drag & drop images</p>
                <p className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG, WEBP up to 10MB each (max 10 images)</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {selectedFiles.length > 0 && (
                  <p className="text-xs font-bold text-[#037166] mt-3">{selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''} selected</p>
                )}
              </label>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-slate-100 text-slate-700 text-xs font-bold px-6 py-3 rounded-xl hover:bg-slate-200 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => handleNext(3)}
                  className="bg-[#037166] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#025951] flex items-center gap-2"
                >
                  Next: Location <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: LOCATION */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-lg font-black text-slate-900">
                  Step 4: Location
                </h2>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={gpsLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#037166]/10 text-[#037166] rounded-lg text-xs font-bold hover:bg-[#037166]/20 transition-colors disabled:opacity-50"
                >
                  {gpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                  Detect my location
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Area / Locality *</label>
                  <input
                    type="text"
                    placeholder="e.g. Gachibowli, Hitech City"
                    value={formData.area}
                    onChange={(e) => handleChange('area', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-slate-100 text-slate-700 text-xs font-bold px-6 py-3 rounded-xl hover:bg-slate-200 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => handleNext(4)}
                  className="bg-[#037166] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#025951] flex items-center gap-2"
                >
                  Next: Contact <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CONTACT */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Step 5: Contact Details
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Phone Number *</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="bg-slate-100 text-slate-700 text-xs font-bold px-6 py-3 rounded-xl hover:bg-slate-200 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => handleNext(5)}
                  className="bg-[#037166] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#025951] flex items-center gap-2"
                >
                  Preview & Publish <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: PREVIEW & PUBLISH */}
          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Step 6: Confirm & Publish Free Ad
              </h2>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase bg-cyan-100 text-[#037166] px-2 py-0.5 rounded">
                      {formData.categoryName}{formData.subcategoryName ? ` • ${formData.subcategoryName}` : ''}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{formData.title || 'Untitled Item'}</h3>
                  </div>
                  <span className="text-xl font-black text-[#037166]">
                    ₹{formData.price ? Number(formData.price).toLocaleString('en-IN') : '0'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{formData.description || 'No description provided.'}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-200 pt-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formData.area ? `${formData.area}, ${formData.city}` : formData.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span className="capitalize">{formData.condition}</span>
                  </div>
                  {isElectronicsCategory(formData.categoryName, formData.subcategoryName) && (
                    <>
                      <div className="flex items-center gap-1 text-[#037166] font-semibold">
                        <span>🛡️</span>
                        <span>Warranty: {formData.warrantyStatus || 'No Warranty'}{formData.warrantyDetails ? ` (${formData.warrantyDetails})` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🧾</span>
                        <span className={formData.billCopy === 'Available' ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                          Bill: {formData.billCopy === 'Available' ? 'Available' : 'Not Available'}
                        </span>
                        {billCopyPreview && (
                          <img
                            src={billCopyPreview}
                            alt="Bill Copy Thumbnail"
                            className="w-7 h-7 object-cover rounded-md border border-emerald-300 ml-1"
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Financial Transaction & Marketplace Disclaimer */}
              <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 my-4 shadow-xs">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <p className="font-bold text-amber-950 text-xs sm:text-sm mb-0.5">Marketplace Safety & Payment Policy</p>
                  <p>
                    <strong className="text-amber-950">Doorstep Hub is NOT responsible for any financial transactions</strong>, direct bank/UPI transfers, advance booking fees, or delivery arrangements between buyers and sellers. All payments and product inspections are conducted directly between users at your own risk.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="bg-slate-100 text-slate-700 text-xs font-bold px-6 py-3 rounded-xl hover:bg-slate-200"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={submitting}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm px-8 py-3.5 rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'PUBLISH ADVERTISEMENT (FREE)'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Cropper Modal */}
      {imagesToCrop.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <div>
                <h3 className="text-sm font-black text-slate-900">Crop Your Image</h3>
                <p className="text-xs text-slate-500">
                  {imagesToCrop.length} image{imagesToCrop.length > 1 ? 's' : ''} remaining to crop
                </p>
              </div>
              <button
                onClick={handleCropCancel}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Skip / Cancel
              </button>
            </div>

            <div className="relative flex-1 w-full bg-slate-100">
              <Cropper
                image={imagesToCrop[0].url}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-5 bg-white border-t border-slate-100 z-10 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full accent-[#037166]"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCropCancel}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropConfirm}
                  disabled={isCropping}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#037166] hover:bg-[#025951] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isCropping ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Crop & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draft Saved Pending KYC Approval Modal */}
      {draftKycModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <FileText className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-[11px] font-extrabold uppercase mb-3">
              <span>📋</span> Ad Saved as Draft
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-2">
              Ad Saved as Draft!
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Your advertisement for <strong className="text-slate-900">{savedAdTitle ? `"${savedAdTitle}"` : 'your item'}</strong> has been saved as a draft. 
              <br /><br />
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-3 py-2 rounded-xl block border border-emerald-100 text-xs">
                ✨ After KYC approval, your ad will automatically be posted and go live!
              </span>
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => router.push('/sell-buy/dashboard?kyc=open')}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-black text-white bg-[#037166] hover:bg-[#025951] shadow-lg shadow-[#037166]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Complete KYC Verification
              </button>
              <button
                type="button"
                onClick={() => router.push('/sell-buy')}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}

      <SellBuyFooter />
    </div>
  );
}

