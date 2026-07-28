'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Loader2, Save, User } from 'lucide-react';
import { toast } from 'sonner';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import { updateProviderProfile } from '@/lib/providerAuthApi';

const inputCls =
    'w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-[#123F4A] text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#037166]/40 focus:border-[#037166]';
const labelCls = 'block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide';

export default function PartnerProfilePage() {
    const { profile, token, refreshProfile } = useProviderAuth();
    const fileRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        bio: '',
        experience: '',
    });

    useEffect(() => {
        if (!profile) return;
        const fullName = profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        setForm({
            name: fullName,
            email: profile.email || '',
            phone: profile.phone || profile.mobile || profile.whatsappNumber || '',
            address: profile.address || '',
            bio: profile.bio || '',
            experience: profile.experience || '',
        });
        if (profile.image) {
            setPreview(
                profile.image.startsWith('http')
                    ? profile.image
                    : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${profile.image}`
            );
        }
    }, [profile]);

    const handleImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', form.form.name.trim());
            formData.append('email', form.email.trim());
            formData.append('phone', form.phone.trim());
            formData.append('address', form.address.trim());
            formData.append('bio', form.bio.trim());
            formData.append('experience', form.experience.trim());
            if (imageFile) formData.append('image', imageFile);

            await updateProviderProfile(token, formData);
            toast.success('Profile updated successfully');
            await refreshProfile();
        } catch (err) {
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const readOnlyRows = [
        ['Service', profile?.serviceName],
        ['Category', profile?.categoryName],
        ['Subcategory', profile?.subcategoryName],
        ['City', profile?.cityName],
        ['State', profile?.stateName],
        ['Account Status', profile?.status],
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-500 mt-1">Update your partner profile details</p>
            </div>

            <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#037166] to-[#04a99d] flex items-center justify-center">
                            {preview ? <img src={preview} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-white" />}
                        </div>
                        <button type="button" onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#037166] text-white flex items-center justify-center">
                            <Camera className="w-4 h-4" />
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="font-bold text-lg">{form.name || 'Partner'}</p>
                        <p className="text-sm text-gray-500">{form.phone}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className={labelCls}>Full Name</label><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                    <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                    <div><label className={labelCls}>Mobile</label><input className={`${inputCls} bg-gray-100`} value={form.phone} readOnly /></div>
                    <div><label className={labelCls}>Experience</label><input className={inputCls} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="Years of experience" /></div>
                    <div className="md:col-span-2"><label className={labelCls}>Address</label><input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                    <div className="md:col-span-2"><label className={labelCls}>Bio</label><textarea rows={3} className={`${inputCls} resize-none`} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
                </div>

                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#037166] text-white font-bold rounded-xl disabled:opacity-60">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Profile
                </button>
            </motion.form>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">Business Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {readOnlyRows.map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                            <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{value || '—'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
