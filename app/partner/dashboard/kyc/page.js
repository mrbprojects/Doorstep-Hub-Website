'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Loader2, RefreshCw, Save, Upload, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useProviderAuth } from '@/context/ProviderAuthContext';
import {
    checkKycStatus,
    getKyc,
    updateKycDocuments,
    resolveProviderMediaUrl,
} from '@/lib/providerAuthApi';

const inputCls =
    'w-full px-4 py-3 rounded-xl bg-gray-50 border border-[#123F4A] text-sm focus:outline-none focus:ring-2 focus:ring-[#037166]/40 focus:border-[#037166]';
const labelCls = 'block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide';

function DocUpload({ label, name, preview, onChange }) {
    return (
        <div>
            <label className={labelCls}>{label}</label>
            <label className="block border border-dashed border-[#123F4A] rounded-xl p-4 cursor-pointer hover:border-[#037166]/40 transition-all bg-gray-50">
                {preview ? (
                    <Image src={preview} alt={label} className="w-full h-32 object-contain rounded-lg mb-2"  width={500} height={300} />
                ) : (
                    <div className="flex flex-col items-center py-4 text-gray-400">
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-xs">Click to upload</span>
                    </div>
                )}
                <input type="file" accept="image/*,application/pdf" className="hidden" name={name} onChange={onChange} />
            </label>
        </div>
    );
}

export default function PartnerKycPage() {
    const { token, profile, refreshProfile } = useProviderAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [kycStatus, setKycStatus] = useState('not_applied');
    const [form, setForm] = useState({ aadhar_number: '', pan_number: '' });
    const [files, setFiles] = useState({});
    const [previews, setPreviews] = useState({});

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [statusRes, kycRes] = await Promise.all([
                checkKycStatus(token).catch(() => null),
                getKyc(token).catch(() => null),
            ]);
            const status =
                statusRes?.kyc_status ||
                statusRes?.data?.kyc_status ||
                profile?.kyc_status ||
                'not_applied';
            setKycStatus(status);

            const data = kycRes?.result || kycRes?.data || kycRes || {};
            setForm({
                aadhar_number: data.aadhar_number || '',
                pan_number: data.pan_number || '',
            });
            setPreviews({
                aadhar_card_front: resolveProviderMediaUrl(data.aadhar_card_front),
                aadhar_card_back: resolveProviderMediaUrl(data.aadhar_card_back),
                pan_card_front: resolveProviderMediaUrl(data.pan_card_front),
                pan_card_back: resolveProviderMediaUrl(data.pan_card_back),
            });
        } finally {
            setLoading(false);
        }
    }, [token, profile]);

    useEffect(() => {
        if (!token) return;
        let active = true;
        Promise.all([
            checkKycStatus(token).catch(() => null),
            getKyc(token).catch(() => null),
        ]).then(([statusRes, kycRes]) => {
            if (!active) return;
            const status =
                statusRes?.kyc_status ||
                statusRes?.data?.kyc_status ||
                profile?.kyc_status ||
                'not_applied';
            setKycStatus(status);

            const data = kycRes?.result || kycRes?.data || kycRes || {};
            setForm({
                aadhar_number: data.aadhar_number || '',
                pan_number: data.pan_number || '',
            });
            setPreviews({
                aadhar_card_front: resolveProviderMediaUrl(data.aadhar_card_front),
                aadhar_card_back: resolveProviderMediaUrl(data.aadhar_card_back),
                pan_card_front: resolveProviderMediaUrl(data.pan_card_front),
                pan_card_back: resolveProviderMediaUrl(data.pan_card_back),
            });
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, [token, profile]);

    const handleFile = (field) => (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFiles((prev) => ({ ...prev, [field]: file }));
        setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;

        setSaving(true);
        try {
            const formData = new FormData();
            if (form.aadhar_number) formData.append('aadhar_number', form.aadhar_number);
            if (form.pan_number) formData.append('pan_number', form.pan_number);
            Object.entries(files).forEach(([key, file]) => formData.append(key, file));

            await updateKycDocuments(token, formData);
            toast.success('KYC documents submitted successfully');
            await refreshProfile();
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to submit KYC');
        } finally {
            setSaving(false);
        }
    };

    const statusColors = {
        approved: 'bg-green-100 text-green-700 border-green-200',
        applied: 'bg-amber-100 text-amber-700 border-amber-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">KYC Verification</h1>
                    <p className="text-sm text-gray-500 mt-1">Upload identity documents for partner verification</p>
                </div>
                <button type="button" onClick={load} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#037166]">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${statusColors[kycStatus] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                <ShieldCheck className="w-4 h-4" />
                Status: {String(kycStatus).replace(/_/g, ' ')}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#037166]" /></div>
            ) : (
                <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelCls}>Aadhar Number</label>
                            <input className={inputCls} value={form.aadhar_number} onChange={(e) => setForm({ ...form, aadhar_number: e.target.value })} placeholder="12-digit Aadhar" />
                        </div>
                        <div>
                            <label className={labelCls}>PAN Number</label>
                            <input className={inputCls} value={form.pan_number} onChange={(e) => setForm({ ...form, pan_number: e.target.value.toUpperCase() })} placeholder="ABCDE1234F" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DocUpload label="Aadhar Front" name="aadhar_card_front" preview={previews.aadhar_card_front} onChange={handleFile('aadhar_card_front')} />
                        <DocUpload label="Aadhar Back" name="aadhar_card_back" preview={previews.aadhar_card_back} onChange={handleFile('aadhar_card_back')} />
                        <DocUpload label="PAN Front" name="pan_card_front" preview={previews.pan_card_front} onChange={handleFile('pan_card_front')} />
                        <DocUpload label="PAN Back" name="pan_card_back" preview={previews.pan_card_back} onChange={handleFile('pan_card_back')} />
                    </div>

                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#037166] text-white font-bold rounded-xl hover:bg-[#025951] disabled:opacity-60">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Submit KYC Documents
                    </button>
                </motion.form>
            )}
        </div>
    );
}
