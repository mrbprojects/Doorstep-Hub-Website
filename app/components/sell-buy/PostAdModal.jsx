'use client';

import React, { useState, useEffect } from 'react';
import { fetchSellBuyCategories, getImageUrl } from '@/lib/sellBuyApi';
import {
  CheckCircle2,
  Upload,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Grid,
  Loader2,
  X,
  Lock,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { SubcategoryIcon } from '@/components/sell-buy/SubcategoryIcon';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export function PostAdModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [indianStates, setIndianStates] = useState([]);
  const [citiesForState, setCitiesForState] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [allIndianCities, setAllIndianCities] = useState([]);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

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
    state: 'Telangana',
    city: 'Hyderabad',
    area: '',
    postalCode: '',
    phone: '',
  });

  useEffect(() => {
    if (isOpen) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      setIsLoggedIn(!!token);

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

      // Load Google Maps script if not already loaded
      if (typeof window !== 'undefined' && !window.google?.maps) {
        const existing = document.getElementById('gmaps-script');
        if (!existing) {
          const script = document.createElement('script');
          script.id = 'gmaps-script';
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
          script.async = true;
          document.head.appendChild(script);
        }
      }
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCitySearch = (query) => {
    setCitySearchQuery(query);
    handleChange('city', '');
    if (!query.trim()) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      return;
    }
    // Use Google Places Autocomplete
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      const svc = new window.google.maps.places.AutocompleteService();
      svc.getPlacePredictions(
        { input: query, componentRestrictions: { country: 'in' }, types: ['(cities)'] },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setCitySuggestions(predictions.map((p) => ({
              placeId: p.place_id,
              description: p.description,
              mainText: p.structured_formatting.main_text,
              secondaryText: p.structured_formatting.secondary_text,
            })));
            setShowCitySuggestions(true);
          } else {
            setCitySuggestions([]);
          }
        }
      );
    }
  };

  const selectCity = (suggestion) => {
    // Get place details to extract city + state
    if (typeof window !== 'undefined' && window.google?.maps?.places && suggestion.placeId) {
      const dummy = document.createElement('div');
      const svc = new window.google.maps.places.PlacesService(dummy);
      svc.getDetails(
        { placeId: suggestion.placeId, fields: ['address_components', 'geometry', 'name'] },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const comps = place.address_components || [];
            const getComp = (type) => comps.find((c) => c.types.includes(type))?.long_name || '';
            const city = getComp('locality') || getComp('administrative_area_level_2') || suggestion.mainText;
            const state = getComp('administrative_area_level_1');
            const postalCode = getComp('postal_code');
            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();

            setFormData((prev) => ({
              ...prev,
              city,
              state: state || prev.state,
              postalCode: postalCode || prev.postalCode,
              latitude: lat ? String(lat) : prev.latitude,
              longitude: lng ? String(lng) : prev.longitude,
            }));
            setCitySearchQuery(city);
          }
        }
      );
    } else {
      // fallback
      handleChange('city', suggestion.mainText || suggestion);
      setCitySearchQuery(suggestion.mainText || suggestion);
    }
    setCitySuggestions([]);
    setShowCitySuggestions(false);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GMAPS_KEY}&language=en`
          );
          const geo = await res.json();

          if (geo.status === 'OK' && geo.results?.length) {
            const comps = geo.results[0].address_components || [];
            const getComp = (type) => comps.find((c) => c.types.includes(type))?.long_name || '';

            const city = getComp('locality') || getComp('administrative_area_level_2') || getComp('sublocality_level_1');
            const state = getComp('administrative_area_level_1');
            const area = getComp('sublocality_level_1') || getComp('sublocality') || getComp('neighborhood');
            const postalCode = getComp('postal_code');

            setFormData((prev) => ({
              ...prev,
              city: city || prev.city,
              state: state || prev.state,
              area: area || prev.area,
              postalCode: postalCode || '',
              latitude: String(latitude),
              longitude: String(longitude),
            }));
            setCitySearchQuery(city || '');
            toast.success('Location detected!');
          } else {
            toast.error('Could not fetch location. Please fill manually.');
          }
        } catch (err) {
          console.error(err);
          setGpsLoading(false);
        } finally {
          setGpsLoading(false);
        }
      },
      () => { setGpsLoading(false); }
    );
  };

  // Auto-trigger GPS when user reaches Step 4 and city not yet filled
  useEffect(() => {
    if (step === 4 && !formData.city && navigator.geolocation) {
      handleDetectLocation();
    }
  }, [step]);

  const handleFileChange = (e) => {
    const incoming = Array.from(e.target.files || []);
    const combined = [...selectedFiles, ...incoming].slice(0, 5); // max 5
    setSelectedFiles(combined);
    setImagePreviews(combined.map((f) => URL.createObjectURL(f)));
    // Reset input so same file can be re-added if removed
    e.target.value = '';
  };

  const removeFile = (index) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    setImagePreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const savedLat = localStorage.getItem('user_lat') || '17.38504';
      const savedLng = localStorage.getItem('user_lng') || '78.48667';

      // Get userId from localStorage
      const userStr = localStorage.getItem('user_details') || localStorage.getItem('user');
      let userId = '';
      if (userStr) {
        try { userId = JSON.parse(userStr)?._id || JSON.parse(userStr)?.id || ''; } catch (e) {}
      }

      const fd = new FormData();
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
      fd.append('city', formData.city);
      fd.append('state', formData.state || 'Telangana');
      fd.append('area', formData.area || '');
      fd.append('pincode', formData.postalCode || '');
      fd.append('postalCode', formData.postalCode || '');
      fd.append('phone', formData.phone);
      fd.append('latitude', formData.latitude || savedLat);
      fd.append('longitude', formData.longitude || savedLng);
      fd.append('lat', formData.latitude || savedLat);
      fd.append('lng', formData.longitude || savedLng);
      if (userId) fd.append('user_id', userId);

      selectedFiles.forEach((file) => {
        fd.append('gallery_images', file);
      });

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sell-buy/add-item`, {
        method: 'POST',
        headers,
        body: fd,
      });

      const data = await res.json();

      // ── KYC BLOCK RESPONSE ──────────────────────────────────────────────────
      if (res.status === 403 || data?.kycStatus) {
        const kycStatus = data?.kycStatus || 'NOT_SUBMITTED';
        const msg =
          kycStatus === 'SUBMITTED' || kycStatus === 'UNDER_REVIEW'
            ? 'Your KYC is still under Admin review. You can post ads once Admin approves your verification.'
            : 'Seller Verification Required! Submit your KYC documents and wait for Admin approval before posting ads.';
        toast.error(msg, { duration: 5000 });
        setSubmitting(false);
        return;
      }
      // ────────────────────────────────────────────────────────────────────────

      if (data.error === false || data.success) {
        setSubmittedSuccess(true);
        toast.success('Ad submitted successfully! It will go live once reviewed.');
      } else {
        toast.error(data.message || 'Failed to post advertisement');
      }
    } catch (err) {
      toast.error('An error occurred while posting your ad.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setSubmittedSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="relative w-full max-w-4xl bg-white rounded-md shadow-2xl overflow-hidden my-8 border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#037166]/10 text-[#037166] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Post Advertisement</h2>
              <p className="text-[11px] text-slate-500 font-medium">Reach thousands of buyers in your local area</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!isLoggedIn ? (
            /* Auth Login Prompt */
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-200">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Login Required</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Please log in to your DoorstepHub account to create and manage advertisements.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    handleResetAndClose();
                    window.location.href = '/sell-buy/dashboard';
                  }}
                  className="bg-[#037166] hover:bg-[#025850] text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
                >
                  Login / Register Now
                </button>
              </div>
            </div>
          ) : submittedSuccess ? (
            /* Submission Success & Pending Review Notice */
            <div className="text-center py-10 space-y-5">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-inner">
                <Clock className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase rounded-full">
                  Under Review
                </span>
                <h3 className="text-xl font-black text-slate-900">Ad Submitted Successfully!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your advertisement has been submitted to our moderation team. Upon admin approval, your item will go live on the marketplace under the category <strong className="text-slate-800">{formData.categoryName || 'Selected Category'}</strong>.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="bg-[#037166] hover:bg-[#025850] text-white font-bold text-xs px-8 py-3 rounded-xl transition-all shadow-md"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            /* Multi-step Form Wizard */
            <div className="space-y-6">
              {/* Stepper Progress */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-md border border-slate-100 text-xs font-bold text-slate-500">
                {['Category', 'Details', 'Photos', 'Location', 'Contact', 'Preview'].map((stName, idx) => {
                  const stepNum = idx + 1;
                  const isActive = step === stepNum;
                  const isDone = step > stepNum;
                  return (
                    <div key={stName} className="flex items-center gap-1.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isActive
                            ? 'bg-[#037166] text-white'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNum}
                      </div>
                      <span className={`hidden sm:inline ${isActive ? 'text-[#037166] font-extrabold' : ''}`}>
                        {stName}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* STEP 1: CATEGORY */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                    Step 1: Select Category
                  </h3>
                  {categories.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs font-medium">Loading categories...</div>
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
                          className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'border-[#037166] bg-[#037166]/5 text-[#037166] ring-2 ring-[#037166]/20 font-bold'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                          }`}
                        >
                          {cat.image ? (
                            <img src={getImageUrl(cat.image)} alt={cat.name} className="w-12 h-12 object-contain mb-1 rounded-lg" />
                          ) : (
                            <Grid className="w-10 h-10 mb-1" />
                          )}
                          <span className="text-[10px] leading-tight">{cat.name}</span>
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
                      <div className="space-y-2.5 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800">
                            Select Subcategory for <span className="text-[#037166]">{formData.categoryName}</span>:
                          </label>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {subcats.length} subcategories available
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
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
                                className={`text-xs px-4 py-2.5 rounded-xl border font-semibold transition-all flex items-center justify-center gap-1.5 ${
                                  isSubSelected
                                    ? 'bg-[#037166] text-white border-[#037166] shadow-md ring-2 ring-[#037166]/20'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                                }`}
                              >
                                <SubcategoryIcon
                                  icon={sub.icon}
                                  name={sub.name}
                                  className={`w-4 h-4 flex-shrink-0 ${isSubSelected ? 'text-white' : 'text-[#037166]'}`}
                                />
                                <span>{sub.name}</span>
                                {isSubSelected && <CheckCircle2 className="w-4 h-4 text-emerald-200 ml-1" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-[#037166] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#025850] flex items-center gap-1.5"
                    >
                      Next: Details <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DETAILS */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                    Step 2: Details ({formData.categoryName}{formData.subcategoryName ? ` > ${formData.subcategoryName}` : ''})
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ad Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. iPhone 13 128GB Blue - Great Condition"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
                    <textarea
                      rows={3}
                      placeholder="Describe your item details, features, condition..."
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 25000"
                        value={formData.price}
                        onChange={(e) => handleChange('price', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Condition *</label>
                      <select
                        value={formData.condition}
                        onChange={(e) => handleChange('condition', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-700"
                      >
                        <option value="new">Brand New</option>
                        <option value="like_new">Like New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="used">Used</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="bg-slate-100 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-slate-200 flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="bg-[#037166] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#025850] flex items-center gap-1.5"
                    >
                      Next: Photos <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PHOTOS */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                    Step 3: Upload Photos
                  </h3>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#037166] transition-colors bg-slate-50/50">
                    <Upload className="w-8 h-8 text-[#037166] mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">Click or drag images to upload</p>
                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB each</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="modal-file-upload"
                    />
                    <label
                      htmlFor="modal-file-upload"
                      className="inline-block mt-3 bg-[#037166] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-[#025850] transition-colors"
                    >
                      Select Files
                    </label>
                  </div>
                  {/* Image Preview Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        {imagePreviews.length}/5 Photos — First image is cover
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} className="relative group flex-shrink-0">
                            <img
                              src={src}
                              alt={`Preview ${idx + 1}`}
                              className={`w-16 h-16 object-cover rounded-lg border-2 transition-all ${
                                idx === 0 ? 'border-[#037166] ring-2 ring-[#037166]/20' : 'border-slate-200'
                              }`}
                            />
                            {idx === 0 && (
                              <span className="absolute bottom-0.5 left-0.5 text-[7px] font-black bg-[#037166] text-white px-1 py-0.5 rounded leading-none">
                                COVER
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                        {imagePreviews.length < 5 && (
                          <label
                            htmlFor="modal-file-upload"
                            className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#037166] transition-colors text-slate-400 hover:text-[#037166] flex-shrink-0"
                          >
                            <Upload className="w-4 h-4" />
                            <span className="text-[8px] font-bold mt-0.5">Add</span>
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-slate-100 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-slate-200 flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="bg-[#037166] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#025850] flex items-center gap-1.5"
                    >
                      Next: Location <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: LOCATION */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Step 4: Location</h3>
                      <p className="text-[10px] font-medium text-slate-500">Use auto-detect or enter location details manually</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={gpsLoading}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#037166]/10 text-[#037166] rounded-xl text-xs font-bold hover:bg-[#037166]/20 transition-colors disabled:opacity-50"
                    >
                      {gpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                      {gpsLoading ? 'Detecting...' : 'Auto-detect location'}
                    </button>
                  </div>

                  {/* Side-by-side 2x2 Grid Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* State */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#037166] focus:outline-none"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* City (Searchable with Autocomplete or Manual Input) */}
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. Hyderabad, Bengaluru"
                          value={citySearchQuery || formData.city}
                          onChange={(e) => {
                            handleChange('city', e.target.value);
                            handleCitySearch(e.target.value);
                          }}
                          onFocus={() => citySearchQuery && setShowCitySuggestions(true)}
                          onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#037166] focus:outline-none"
                        />
                      </div>
                      {/* Suggestions dropdown */}
                      {showCitySuggestions && citySuggestions.length > 0 && (
                        <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 overflow-hidden">
                          {citySuggestions.map((suggestion) => (
                            <button
                              key={suggestion.placeId || suggestion.mainText || suggestion}
                              type="button"
                              onMouseDown={() => selectCity(suggestion)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left transition-colors"
                            >
                              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="font-bold">{suggestion.mainText || suggestion}</span>
                              {suggestion.secondaryText && <span className="text-slate-400 text-[10px] ml-1">{suggestion.secondaryText}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Area / Locality */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Area / Locality</label>
                      <input
                        type="text"
                        placeholder="e.g. Gachibowli, Banjara Hills"
                        value={formData.area}
                        onChange={(e) => handleChange('area', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#037166] focus:outline-none"
                      />
                    </div>

                    {/* Pincode / Postal Code */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pincode / Postal Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 500032"
                        value={formData.postalCode || ''}
                        onChange={(e) => handleChange('postalCode', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#037166] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setStep(3)} className="bg-slate-100 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-slate-200 flex items-center gap-1.5">
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button type="button" onClick={() => setStep(5)} className="bg-[#037166] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#025850] flex items-center gap-1.5">
                      Next: Contact <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: CONTACT */}
              {step === 5 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                    Step 5: Contact Details
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
                    <input
                      type="text"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="bg-slate-100 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-slate-200 flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(6)}
                      className="bg-[#037166] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#025850] flex items-center gap-1.5"
                    >
                      Next: Review <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: PREVIEW & SUBMIT */}
              {step === 6 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                    Step 6: Preview & Submit
                  </h3>

                  {/* Modern Preview Card */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-lg p-4 space-y-4">
                    {/* Title & Price Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200/60">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#037166]/10 text-[#037166] mb-1">
                          {formData.categoryName || 'General'}{formData.subcategoryName ? ` • ${formData.subcategoryName}` : ''}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          {formData.title || 'Untitled Item'}
                        </h4>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-black text-[#037166]">
                          ₹{Number(formData.price || 0).toLocaleString('en-IN')}
                        </p>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                          {formData.isNegotiable ? 'Negotiable' : 'Fixed Price'}
                        </span>
                      </div>
                    </div>

                    {/* Image Previews Strip (if photos uploaded) */}
                    {imagePreviews.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Photos ({imagePreviews.length})
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {imagePreviews.map((src, i) => (
                            <div key={i} className="relative flex-shrink-0">
                              <img
                                src={src}
                                alt={`Preview ${i + 1}`}
                                className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                              />
                              {i === 0 && (
                                <span className="absolute bottom-0.5 left-0.5 text-[7px] font-black bg-[#037166] text-white px-1 py-0.2 rounded">
                                  COVER
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Structured Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Condition */}
                      <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          ✓
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Condition</p>
                          <p className="font-bold text-slate-800 capitalize">
                            {formData.condition?.replace('_', ' ') || 'Used'}
                          </p>
                        </div>
                      </div>

                      {/* Contact Phone */}
                      <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          📞
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</p>
                          <p className="font-bold text-slate-800">
                            {formData.phone || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      {/* Location (Full width) */}
                      <div className="sm:col-span-2 bg-white p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#037166] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                          <p className="font-bold text-slate-800">
                            {[formData.area, formData.city, formData.state, formData.postalCode]
                              .filter(Boolean)
                              .join(', ') || 'Not specified'}
                          </p>
                        </div>
                      </div>

                      {/* Description (Full width) */}
                      {formData.description && (
                        <div className="sm:col-span-2 bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Description</p>
                          <p className="text-xs text-slate-700 font-normal line-clamp-3">
                            {formData.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer buttons */}
                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="bg-slate-100 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-slate-200 flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={submitting}
                      className="bg-[#037166] hover:bg-[#025850] text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Submit For Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
