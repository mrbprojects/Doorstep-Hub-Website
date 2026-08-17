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
} from 'lucide-react';

export default function PostAdPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [formData, setFormData] = useState({
    categoryId: '',
    categoryName: '',
    title: '',
    description: '',
    price: '',
    isNegotiable: true,
    condition: 'used',
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
          setFormData((prev) => ({
            ...prev,
            categoryId: String(list[0]?.id || list[0]?._id || ''),
            categoryName: list[0]?.name || '',
          }));
        }
      }
    });
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('name', formData.title || 'Untitled Item');
      fd.append('description', formData.description || '');
      fd.append('category_id', formData.categoryId || '');
      fd.append('price', String(Number(formData.price) || 0));
      fd.append('condition', formData.condition);
      fd.append('city', formData.city);
      fd.append('state', 'Telangana');
      fd.append('phone', formData.phone);
      // attach files
      selectedFiles.forEach((file) => {
        fd.append('gallery_images', file);
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sell-buy/add-item`, {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if ((data.error === false || data.success) && data.data?.slug) {
        router.push(`/sell-buy/ad/${data.data.slug}`);
      } else {
        router.push('/sell-buy');
      }
    } catch (err) {
      router.push('/sell-buy');
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
                      ? 'bg-[#00b2ca] text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                </div>
                <span className={`hidden sm:inline ${isActive ? 'text-[#00b2ca] font-extrabold' : ''}`}>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map((cat) => {
                  const catId = String(cat.id || cat._id || '');
                  const isSelected = formData.categoryId === catId;
                  return (
                    <button
                      key={catId}
                      type="button"
                      onClick={() => {
                        handleChange('categoryId', catId);
                        handleChange('categoryName', cat.name);
                      }}
                      className={`flex flex-col items-center p-5 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'border-[#00b2ca] bg-[#00b2ca]/5 text-[#00b2ca] ring-2 ring-[#00b2ca]/20'
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

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-[#00b2ca] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#0097ac] flex items-center gap-2"
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
                Step 2: Advertisement Details ({formData.categoryName})
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ad Title *</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 13 128GB Blue - Like New Condition"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#00b2ca] focus:outline-none"
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
                  onClick={() => setStep(3)}
                  className="bg-[#00b2ca] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#0097ac] flex items-center gap-2"
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

              <label className="block border-2 border-dashed border-slate-300 hover:border-[#00b2ca] rounded-2xl p-8 text-center bg-slate-50/50 cursor-pointer transition-colors">
                <Upload className="w-10 h-10 text-[#00b2ca] mx-auto mb-3" />
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
                  <p className="text-xs font-bold text-[#00b2ca] mt-3">{selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''} selected</p>
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
                  onClick={() => setStep(4)}
                  className="bg-[#00b2ca] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#0097ac] flex items-center gap-2"
                >
                  Next: Location <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: LOCATION */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Step 4: Location
              </h2>

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
                  onClick={() => setStep(5)}
                  className="bg-[#00b2ca] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#0097ac] flex items-center gap-2"
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
                  onClick={() => setStep(6)}
                  className="bg-[#00b2ca] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#0097ac] flex items-center gap-2"
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
                    <span className="text-[10px] font-bold uppercase bg-cyan-100 text-[#00b2ca] px-2 py-0.5 rounded">
                      {formData.categoryName}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{formData.title || 'Untitled Item'}</h3>
                  </div>
                  <span className="text-xl font-black text-[#00b2ca]">
                    ₹{formData.price ? Number(formData.price).toLocaleString('en-IN') : '0'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{formData.description || 'No description provided.'}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-200 pt-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formData.area ? `${formData.area}, ${formData.city}` : formData.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span className="capitalize">{formData.condition}</span>
                  </div>
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

      <SellBuyFooter />
    </div>
  );
}
