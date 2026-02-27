'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Bed, Utensils, Calendar, DollarSign, Check, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';

const staticQuestions = [
    {
        id: 'roomType',
        title: 'What type of room do you prefer?',
        icon: Bed,
        options: [
            { value: 'single', label: 'Single Room', desc: 'Your own private space' },
            { value: '2-sharing', label: '2 Sharing', desc: 'Share with one person' },
            { value: '3-sharing', label: '3 Sharing', desc: 'Share with two people' },
            { value: '4-sharing', label: '4+ Sharing', desc: 'Dormitory style' },
        ],
    },
    {
        id: 'duration',
        title: 'How long do you plan to stay?',
        icon: Calendar,
        options: [
            { value: '1-month', label: '1 Month', desc: 'Short term stay' },
            { value: '3-months', label: '3 Months', desc: 'Medium term' },
            { value: '6-months', label: '6 Months', desc: 'Extended stay' },
            { value: 'long-term', label: 'Long Term', desc: '1 year or more' },
        ],
    },
    {
        id: 'budget',
        title: 'What is your budget range?',
        icon: DollarSign,
        options: [
            { value: '3-6k', label: '₹3,000 - ₹6,000', desc: 'Budget friendly' },
            { value: '6-10k', label: '₹6,000 - ₹10,000', desc: 'Mid range' },
            { value: '10-15k', label: '₹10,000 - ₹15,000', desc: 'Premium' },
            { value: '15k+', label: '₹15,000+', desc: 'Luxury' },
        ],
    },
    {
        id: 'food',
        title: 'Do you need food included?',
        icon: Utensils,
        options: [
            { value: 'with-food', label: 'With Food', desc: 'Meals included in rent' },
            { value: 'without-food', label: 'Without Food', desc: 'Self-catering' },
            { value: 'optional', label: 'Optional', desc: 'Flexible arrangement' },
        ],
    },
    {
        id: 'moveIn',
        title: 'When do you want to move in?',
        icon: Calendar,
        options: [
            { value: 'today', label: 'Today', desc: 'Immediate move-in' },
            { value: 'this-week', label: 'This Week', desc: 'Within 7 days' },
            { value: 'next-week', label: 'Next Week', desc: '8-14 days' },
            { value: 'flexible', label: 'Flexible', desc: 'No rush' },
        ],
    },
];

export function QuestionnaireModal({ isOpen, onClose, categoryName, categoryId }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [questions, setQuestions] = useState(staticQuestions);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSubcategories = async () => {
            if (!categoryId || !isOpen) return;

            setLoading(true);
            try {
                const response = await fetch('https://api.doorstephub.com/v1/dhubApi/app/professional-services-flow/public/subcategories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categoryId })
                });
                const data = await response.json();

                if (data.success && data.data && data.data.length > 0) {
                    const subcategoryQuestion = {
                        id: 'subcategoryId',
                        title: 'Select a subcategory',
                        icon: Layers,
                        options: data.data.map(sub => ({
                            value: sub._id,
                            label: sub.name,
                            desc: sub.categoryName,
                            image: sub.image // Optional: if we want to show images
                        }))
                    };

                    setQuestions([subcategoryQuestion, ...staticQuestions]);
                } else {
                    setQuestions(staticQuestions);
                }
            } catch (error) {
                console.error("Error fetching subcategories", error);
                setQuestions(staticQuestions);
            } finally {
                setLoading(false);
            }
        };

        fetchSubcategories();
    }, [categoryId, isOpen]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(0);
            setAnswers({});
        }
    }, [isOpen]);

    const currentQuestion = questions[currentStep];
    const progress = ((currentStep + 1) / questions.length) * 100;

    const handleSelect = (value) => {
        setAnswers({ ...answers, [currentQuestion.id]: value });
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Navigate to results page with answers
            const queryParams = new URLSearchParams({
                categoryId,
                categoryName,
                ...answers
            });
            router.push(`/pghostels/results?${queryParams.toString()}`);
            onClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!currentQuestion) return null;

    const isAnswered = answers[currentQuestion.id];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
                >
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-[#037166] to-[#025951] text-white p-6">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-4">
                                <h2 className="text-2xl font-bold mb-2">Find the best PG for you</h2>
                                <p className="text-white/90">Answer {questions.length} quick questions to match your needs</p>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-y-0 left-0 bg-white rounded-full"
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-white/80">
                                <span>Step {currentStep + 1} of {questions.length}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                        </div>

                        {/* Question Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loading ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#037166]"></div>
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
                                        {/* Question Title */}
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#037166] to-[#025951] rounded-2xl flex items-center justify-center">
                                                <currentQuestion.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">{currentQuestion.title}</h3>
                                        </div>

                                        {/* Options */}
                                        <div className="grid gap-3">
                                            {currentQuestion.options.map((option) => {
                                                const isSelected = answers[currentQuestion.id] === option.value;
                                                return (
                                                    <motion.button
                                                        key={option.value}
                                                        onClick={() => handleSelect(option.value)}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`relative p-4 rounded-2xl border-2 transition-all text-left ${isSelected
                                                            ? 'border-[#037166] bg-[#037166]/5'
                                                            : 'border-gray-200 bg-white hover:border-[#037166]/50'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-3">
                                                                {/* Optional: Show image if available (for subcategories) */}
                                                                {option.image && (
                                                                    <div
                                                                        className="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0"
                                                                        style={{ backgroundImage: `url('https://api.doorstephub.com/${option.image}')` }}
                                                                    />
                                                                )}
                                                                <div>
                                                                    <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                                                                    <div className="text-sm text-gray-600">{option.desc}</div>
                                                                </div>
                                                            </div>
                                                            {isSelected && (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="w-6 h-6 bg-[#037166] rounded-full flex items-center justify-center flex-shrink-0"
                                                                >
                                                                    <Check className="w-4 h-4 text-white" />
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="border-t border-gray-200 p-6 bg-gray-50/50">
                            <div className="flex items-center justify-between gap-4">
                                <button
                                    onClick={handleBack}
                                    disabled={currentStep === 0}
                                    className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    <span>Back</span>
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={!isAnswered}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#037166] to-[#025951] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#037166]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <span>{currentStep === questions.length - 1 ? 'Show Results' : 'Next'}</span>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
