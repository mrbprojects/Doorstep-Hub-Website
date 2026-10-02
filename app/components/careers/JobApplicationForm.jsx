import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Check, Loader2, AlertCircle, Briefcase, MapPin, Clock, ArrowLeft, FileText } from 'lucide-react';
import DOMPurify from 'dompurify';

export function JobApplicationForm({ job: initialJob, isGeneralApplication = false, onClose }) {
    const [job, setJob] = useState(initialJob);
    const [loadingDetails, setLoadingDetails] = useState(!isGeneralApplication);
    const [showForm, setShowForm] = useState(isGeneralApplication);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Fetch Full Details if it's a specific job
    useEffect(() => {
        if (!initialJob || isGeneralApplication || !initialJob._id) {
            setLoadingDetails(false);
            return;
        }

        const fetchDetails = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/careers/job-details/${initialJob._id}`);
                const data = await response.json();
                if (data.success && data.data) {
                    setJob(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch job details:", err);
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchDetails();
    }, [initialJob, isGeneralApplication]);

    // Keyboard Escape key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        experienceYears: '',
        currentCompany: '',
        currentCTC: '',
        expectedCTC: '',
        noticePeriod: '',
        linkedinUrl: '',
        portfolioUrl: '',
        coverLetter: '',
        resume: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Please upload a PDF file only.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size should be less than 5MB.');
                return;
            }
            setFormData(prev => ({ ...prev, resume: file }));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const data = new FormData();
            if (job && job._id) {
                data.append('jobId', job._id);
            } else {
                data.append('jobId', 'general-talent');
            }

            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/careers/apply`, {
                method: 'POST',
                body: data
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(true);
            } else {
                throw new Error(result.message || 'Application failed. Please try again.');
            }
        } catch (err) {
            console.error("Application Error:", err);
            setError(err.message || "Failed to submit application");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white border border-[#E5ECEB] rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl"
                >
                    <div className="w-16 h-16 bg-[#E6F7F5] rounded-full flex items-center justify-center mx-auto mb-5 text-[#008C80]">
                        <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#101828] mb-2">Application Received!</h3>
                    <p className="text-sm text-[#475467] mb-7 leading-relaxed">
                        Thank you for applying to Doorstep Hub. We have received your application for{' '}
                        <span className="text-[#101828] font-semibold">{job?.title || 'Future Opportunities'}</span>. Our talent team will review it and reach out soon.
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3.5 rounded-full bg-[#008C80] text-white font-bold text-sm hover:bg-[#007369] transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                className="bg-white border border-[#E5ECEB] rounded-2xl sm:rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative my-auto max-h-[92vh] flex flex-col"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-5 border-b border-[#E5ECEB] bg-[#F8FCFB]">
                    <div>
                        <h2 className="text-lg sm:text-2xl font-bold text-[#101828] leading-tight">
                            {showForm ? 'Apply for ' : ''}{job?.title || 'General Talent Application'}
                        </h2>
                        {!showForm && job && (
                            <p className="text-xs sm:text-sm text-[#475467] mt-1 flex items-center gap-2">
                                <span>{job.department}</span>
                                {job.location && <span>• {job.location}</span>}
                                {job.employmentType && <span>• {job.employmentType}</span>}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="p-2 rounded-full bg-white border border-[#E5ECEB] hover:bg-gray-100 text-[#667085] hover:text-[#101828] transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                    {loadingDetails ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-[#008C80]" />
                            <span className="text-sm text-[#667085]">Loading role details...</span>
                        </div>
                    ) : showForm ? (
                        /* Application Form */
                        <div>
                            {!isGeneralApplication && (
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="mb-6 text-sm text-[#008C80] font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Back to Job Details</span>
                                </button>
                            )}

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                    <FormInput label="Full Name *" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="e.g. John Doe" />
                                    <FormInput label="Email Address *" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="e.g. john@example.com" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                    <FormInput label="Phone Number *" type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="e.g. +91 9876543210" />
                                    <FormInput label="LinkedIn Profile (Optional)" type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                    <FormInput label="Experience (Years) *" type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} required placeholder="e.g. 3" min="0" />
                                    <FormInput label="Notice Period *" name="noticePeriod" value={formData.noticePeriod} onChange={handleChange} required placeholder="e.g. Immediate, 30 Days" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                    <FormInput label="Current CTC *" name="currentCTC" value={formData.currentCTC} onChange={handleChange} required placeholder="e.g. ₹ 8,00,000 / year" />
                                    <FormInput label="Expected CTC *" name="expectedCTC" value={formData.expectedCTC} onChange={handleChange} required placeholder="e.g. ₹ 11,00,000 / year" />
                                </div>

                                <div>
                                    <FormInput label="Current Company *" name="currentCompany" value={formData.currentCompany} onChange={handleChange} required placeholder="e.g. Current Employer or Fresher" />
                                </div>

                                {/* Resume Upload */}
                                <div className="space-y-1.5">
                                    <label className="text-xs sm:text-sm font-semibold text-[#344054]">
                                        Resume (PDF only, max 5MB) *
                                    </label>
                                    <div className="relative border-2 border-dashed border-[#D0D5DD] hover:border-[#008C80] rounded-2xl p-6 text-center bg-[#F9FAFB] hover:bg-[#F0FAF8] transition-colors group cursor-pointer">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            required={!formData.resume}
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            {formData.resume ? (
                                                <div className="flex items-center gap-2 text-[#008C80] font-semibold text-sm">
                                                    <FileText className="w-5 h-5 text-[#008C80]" />
                                                    <span className="truncate max-w-[280px]">{formData.resume.name}</span>
                                                    <span className="text-xs bg-[#E6F7F5] px-2 py-0.5 rounded text-[#008C80]">Selected</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 rounded-full bg-white border border-[#E5ECEB] flex items-center justify-center text-[#667085] group-hover:text-[#008C80] group-hover:border-[#008C80]">
                                                        <Upload className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-sm font-semibold text-[#101828]">
                                                        Click to upload <span className="font-normal text-[#667085]">or drag and drop</span>
                                                    </div>
                                                    <span className="text-xs text-[#98A2B3]">PDF format up to 5MB</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Cover Letter */}
                                <div className="space-y-1.5">
                                    <label className="text-xs sm:text-sm font-semibold text-[#344054]">
                                        Cover Letter / Message *
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full bg-[#F9FAFB] border border-[#D0D5DD] rounded-xl px-4 py-3 text-sm text-[#101828] focus:outline-none focus:border-[#008C80] focus:ring-1 focus:ring-[#008C80] focus:bg-white transition-all placeholder:text-[#98A2B3]"
                                        name="coverLetter"
                                        value={formData.coverLetter}
                                        onChange={handleChange}
                                        required
                                        placeholder="Tell us why you are interested in this position and what makes you a great fit..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3.5 rounded-full bg-[#008C80] hover:bg-[#007369] text-white font-bold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Submitting Application...</span>
                                        </>
                                    ) : (
                                        <span>Submit Application</span>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* Job Details View */
                        <div className="space-y-6">
                            {/* Meta Badges */}
                            <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-[#E5ECEB]">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0284C7] text-xs font-semibold">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    <span>{job?.employmentType || 'Full-time'}</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDF4] text-[#16A34A] text-xs font-semibold">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{job?.location || 'Hyderabad'}</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] text-xs font-semibold">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{job?.experienceLevel || 'Experience: 2–5 years'}</span>
                                </span>
                            </div>

                            {/* Job Description */}
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-[#101828] mb-3">About the Role</h3>
                                <div
                                    className="text-sm text-[#475467] leading-relaxed space-y-3 prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job?.description || '') }}
                                />
                            </div>

                            {/* Responsibilities */}
                            {job?.responsibilities && job.responsibilities.length > 0 && (
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-[#101828] mb-3">Key Responsibilities</h3>
                                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#475467]">
                                        {job.responsibilities.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Requirements */}
                            {job?.requirements && job.requirements.length > 0 && (
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-[#101828] mb-3">Requirements</h3>
                                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#475467]">
                                        {job.requirements.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Skills */}
                            {job?.skills && job.skills.length > 0 && (
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-[#101828] mb-3">Skills Required</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill, i) => (
                                            <span key={i} className="px-3 py-1 rounded-full bg-[#F2F4F7] text-xs sm:text-sm font-medium text-[#344054] border border-[#E4E7EC]">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Apply Bar (When viewing job details) */}
                {!showForm && !loadingDetails && (
                    <div className="px-6 py-4 sm:px-8 border-t border-[#E5ECEB] bg-[#F8FCFB] flex items-center justify-between">
                        <div className="text-xs sm:text-sm text-[#667085]">
                            Ready to make an impact? Apply today.
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-[#008C80] text-white font-bold text-sm sm:text-base hover:bg-[#007369] transition-colors shadow-sm cursor-pointer"
                        >
                            Apply Now →
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function FormInput({ label, type = "text", placeholder, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[#344054]">{label}</label>
            <input
                className="w-full bg-[#F9FAFB] border border-[#D0D5DD] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-[#101828] focus:outline-none focus:border-[#008C80] focus:ring-1 focus:ring-[#008C80] focus:bg-white transition-all placeholder:text-[#98A2B3]"
                type={type}
                placeholder={placeholder}
                {...props}
            />
        </div>
    );
}
