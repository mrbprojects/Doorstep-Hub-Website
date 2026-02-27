import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, Loader2, AlertCircle } from 'lucide-react';

export function JobApplicationForm({ job: initialJob, onClose }) {
    const [job, setJob] = useState(initialJob);
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Fetch Full Details
    React.useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(`https://api.doorstephub.com/v1/dhubApi/app/careers/job-details/${initialJob._id}`);
                const data = await response.json();
                if (data.success && data.data) {
                    setJob(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch job details:", error);
            } finally {
                setLoadingDetails(false);
            }
        };
        fetchDetails();
    }, [initialJob._id]);

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
            data.append('jobId', job._id);
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/careers/apply', {
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-10 max-w-md w-full text-center"
                >
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Application Sent!</h3>
                    <p className="text-gray-400 mb-8">
                        Thank you for applying to DoorstepHub. We have received your application for <span className="text-white font-semibold">{job.title}</span>.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl relative my-auto max-h-[90vh] flex flex-col"
            >
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#151515]">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">{showForm ? 'Apply for ' : ''}{job.title}</h2>
                        {!showForm && <p className="text-gray-400 text-sm mt-1">{job.department} • {job.location}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loadingDetails ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : showForm ? (
                        <div className="p-8 bg-[#0a0a0a]">
                            <button
                                onClick={() => setShowForm(false)}
                                className="mb-6 text-sm text-gray-400 hover:text-white flex items-center gap-2"
                            >
                                ← Back to Job Details
                            </button>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <FormInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
                                    <FormInput label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <FormInput label="Phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                                    <FormInput label="LinkedIn (Optional)" type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <FormInput label="Experience (Years)" type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} required />
                                    <FormInput label="Notice Period" placeholder="e.g. Immediate, 30 Days" name="noticePeriod" value={formData.noticePeriod} onChange={handleChange} required />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <FormInput label="Current CTC" name="currentCTC" value={formData.currentCTC} onChange={handleChange} required />
                                    <FormInput label="Expected CTC" name="expectedCTC" value={formData.expectedCTC} onChange={handleChange} required />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Current Company</label>
                                    <input
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        type="text"
                                        name="currentCompany"
                                        value={formData.currentCompany}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Resume (PDF)</label>
                                    <div className="relative border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/5 transition-colors group cursor-pointer">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            required
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            {formData.resume ? (
                                                <div className="flex items-center gap-2 text-green-400">
                                                    <Check className="w-5 h-5" />
                                                    <span className="font-medium truncate max-w-[200px]">{formData.resume.name}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                                                    <span className="text-sm text-gray-500 group-hover:text-gray-300">Click to upload or drag and drop</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Cover Letter</label>
                                    <textarea
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors min-h-[100px]"
                                        name="coverLetter"
                                        value={formData.coverLetter}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Application"
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="p-8 space-y-8">
                            {/* Description */}
                            <div className="prose prose-invert max-w-none">
                                <h3 className="text-xl font-bold text-white mb-4">About the Role</h3>
                                <div className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description }} />
                            </div>

                            {/* Responsibilities */}
                            {job.responsibilities && job.responsibilities.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4">Key Responsibilities</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-300">
                                        {job.responsibilities.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Requirements */}
                            {job.requirements && job.requirements.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4">Requirements</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-300">
                                        {job.requirements.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Skills (Optional visualization) */}
                            {job.skills && job.skills.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4">Skills Required</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill, i) => (
                                            <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-sm text-gray-300 border border-white/5">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!showForm && !loadingDetails && (
                    <div className="p-6 border-t border-white/5 bg-[#151515] flex justify-end">
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-8 py-3 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
                        >
                            Apply Now
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function FormInput({ label, type = "text", ...props }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">{label}</label>
            <input
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                type={type}
                {...props}
            />
        </div>
    );
}
