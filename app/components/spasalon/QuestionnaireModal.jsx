'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, MapPin, Clock, DollarSign, User, Calendar, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';

const staticQuestions = [
    {
        id: 'serviceType',
        question: 'Where would you like the service?',
        options: [
            { value: 'home', label: 'Home Service', icon: '🏠' },
            { value: 'center', label: 'Visit Center', icon: '🏢' },
        ],
    },
    {
        id: 'preferredTime',
        question: 'Preferred Time?',
        options: [
            { value: 'morning', label: 'Morning', icon: '🌅' },
            { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
            { value: 'evening', label: 'Evening', icon: '🌙' },
        ],
    },
    {
        id: 'budget',
        question: 'Budget Range?',
        options: [
            { value: '499-999', label: '₹499–₹999', icon: '💰' },
            { value: '999-1999', label: '₹999–₹1999', icon: '💎' },
            { value: '1999+', label: '₹1999+', icon: '👑' },
        ],
    },
    {
        id: 'genderPreference',
        question: 'Gender Preference for Staff?',
        options: [
            { value: 'female', label: 'Female Staff', icon: '👩' },
            { value: 'male', label: 'Male Staff', icon: '👨' },
            { value: 'any', label: 'Any', icon: '🤝' },
        ],
    },
];

export function QuestionnaireModal({ isOpen, onClose, categoryName: initialCategoryName, categoryId: initialCategoryId }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCat, setSelectedCat] = useState({ id: initialCategoryId, name: initialCategoryName });

    // Fetch Categories and Subcategories
    useEffect(() => {
        const fetchData = async () => {
            if (!isOpen) return;
            setLoading(true);

            try {
                const API_BASE_URL = 'https://api.doorstephub.com/v1/dhubApi/app';

                // Case 1: No category selected yet - Fetch all categories
                if (!selectedCat.id) {
                    const catResponse = await fetch(`${API_BASE_URL}/professional-services-flow/public/categories`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ serviceId: '6790757755050f22d997d95d' })
                    });
                    const catData = await catResponse.json();

                    if (catData.success) {
                        const catQuestion = {
                            id: 'categoryId',
                            question: 'Which service category are you looking for?',
                            options: catData.data.map(cat => ({
                                value: cat._id,
                                label: cat.name,
                                icon: '🎯',
                                image: cat.image
                            }))
                        };
                        setQuestions([catQuestion]);
                        setCurrentStep(0);
                    }
                } else {
                    // Case 2: Category is selected (from prop or previous step) - Fetch subcategories
                    const subcatResponse = await fetch(`${API_BASE_URL}/professional-services-flow/public/subcategories`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ categoryId: selectedCat.id })
                    });
                    const subcatData = await subcatResponse.json();

                    if (subcatData.success && subcatData.data.length > 0) {
                        const subcatQuestion = {
                            id: 'subcategoryId',
                            question: `Select a ${selectedCat.name} Service`,
                            options: subcatData.data.map(sub => ({
                                value: sub._id,
                                label: sub.name,
                                icon: '✨',
                                image: sub.image
                            }))
                        };
                        setQuestions([subcatQuestion, ...staticQuestions]);
                        setCurrentStep(0);
                    } else {
                        // If no subcategories, use category + static questions
                        setQuestions(staticQuestions);
                        setCurrentStep(0);
                    }
                }
            } catch (error) {
                console.error("Error fetching modal data", error);
                // Fallback to static if API fails
                setQuestions(staticQuestions);
                setCurrentStep(0);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isOpen, selectedCat.id]);

    // Reset on close or when initialCategoryId changes (e.g. clicking different categories on home page)
    useEffect(() => {
        if (!isOpen) {
            setSelectedCat({ id: initialCategoryId, name: initialCategoryName });
            setAnswers({});
            setCurrentStep(0);
        } else {
            // Update selectedCat if props change while open
            setSelectedCat({ id: initialCategoryId, name: initialCategoryName });
        }
    }, [isOpen, initialCategoryId, initialCategoryName]);

    const handleAnswer = async (value) => {
        const currentQuestion = questions[currentStep];

        // Store answer
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);

        if (currentQuestion.id === 'categoryId') {
            const selectedOption = currentQuestion.options.find(opt => opt.value === value);
            setSelectedCat({ id: value, name: selectedOption.label || 'Category' });
            return; // useEffect will handle fetching subcategories
        }

        // If it's the last step, navigate
        if (currentStep === questions.length - 1) {
            handleComplete(newAnswers, selectedCat.id);
        } else {
            // Otherwise move to next step with slight delay for animation
            setTimeout(() => {
                setCurrentStep(curr => curr + 1);
            }, 300);
        }
    };

    const handleComplete = (allAnswers, catId) => {
        const queryParams = new URLSearchParams();
        if (catId) queryParams.set('categoryId', catId);

        // Add all questionnaire answers to query params
        Object.entries(allAnswers).forEach(([key, value]) => {
            queryParams.set(key, value);
        });

        router.push(`/spa-salon/results?${queryParams.toString()}`);
        onClose();
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else if (selectedCat.id && !initialCategoryId) {
            // If we are on first step of current questions but we have a category selected 
            // that wasn't passed as a prop, go back to category selection
            setSelectedCat({ id: null, name: '' });
        }
    };

    const currentQuestion = questions[currentStep];
    const isLastStep = currentStep === questions.length - 1;
    const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;
    // Check if current question is answered
    const canProceed = answers[currentQuestion?.id];

    if (!currentQuestion && !loading) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-[#E8ECF2] flex flex-col">
                            {/* Header */}
                            <div className="relative p-6 border-b border-[#E8ECF2]">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
                                    Find your perfect spa service
                                </h2>
                                <p className="text-[#64748B]">
                                    {selectedCat.id
                                        ? `Selecting services for `
                                        : "Answer a few quick questions to find "}
                                    <span className="text-[#C06C84] font-medium">
                                        {selectedCat.id ? selectedCat.name : "the best spa services"}
                                    </span>
                                </p>

                                {/* Progress Bar */}
                                <div className="mt-4 bg-[#F6F7FB] rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="h-full bg-gradient-to-r from-[#C06C84] to-[#6C5CE7]"
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                                <p className="text-sm text-[#64748B] mt-2">
                                    Step {currentStep + 1} of {questions.length}
                                </p>
                            </div>

                            {/* Question Content */}
                            <div className="p-8 overflow-y-auto">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="w-12 h-12 border-4 border-[#C06C84] border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-[#64748B]">Finding perfect matches...</p>
                                    </div>
                                ) : (
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentStep}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h3 className="text-xl font-semibold text-[#0F172A] mb-6">
                                                {currentQuestion.question}
                                            </h3>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {currentQuestion.options.map((option) => (
                                                    <motion.button
                                                        key={option.value}
                                                        onClick={() => handleAnswer(option.value)}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`p-6 rounded-xl border-2 transition-all text-left ${answers[currentQuestion.id] === option.value
                                                            ? 'border-[#C06C84] bg-[#C06C84]/10 shadow-lg shadow-[#C06C84]/20'
                                                            : 'border-[#E8ECF2] bg-[#F6F7FB] hover:border-[#C06C84]/50 hover:bg-[#FBEAF0]'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            {option.image ? (
                                                                <div
                                                                    className="w-16 h-16 rounded-xl bg-cover bg-center shadow-inner flex-shrink-0"
                                                                    style={{
                                                                        backgroundImage: `url('${option.image.startsWith('http') ? option.image : `https://api.doorstephub.com/${option.image}`}')`
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-16 h-16 rounded-xl bg-[#F6F7FB] flex items-center justify-center text-3xl flex-shrink-0">
                                                                    {option.icon}
                                                                </div>
                                                            )}
                                                            <span className="text-[#0F172A] font-semibold text-lg">{option.label}</span>
                                                        </div>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-[#E8ECF2] flex items-center justify-between mt-auto">
                                <button
                                    onClick={handleBack}
                                    disabled={currentStep === 0}
                                    className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Back
                                </button>

                                {/* Show Results / Next */}
                                {/* Logic: Show "Show Results" if last step OR if we want to allow early exit? Usually last step. */}
                                {isLastStep && canProceed && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleComplete(answers, selectedCat.id)}
                                        className="px-8 py-3 bg-gradient-to-r from-[#C06C84] to-[#6C5CE7] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#C06C84]/50 transition-all flex items-center gap-2"
                                    >
                                        Show Results
                                        <ChevronRight className="w-5 h-5" />
                                    </motion.button>
                                )}
                                {!isLastStep && canProceed && (
                                    <button
                                        onClick={() => setCurrentStep(curr => curr + 1)}
                                        className="flex items-center gap-2 text-[#C06C84] font-medium hover:text-[#6C5CE7]"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
