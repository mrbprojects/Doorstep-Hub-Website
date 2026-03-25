'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    X, ChevronRight, ChevronLeft, Check,
    Flame, Users, Calendar, Clock, Sparkles, Star, Home as HomeIcon, Sun
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const staticQuestions = [
    {
        id: 'budget',
        title: 'Budget Range?',
        icon: Sun,
        options: [
            { value: '499-1500', label: '₹499–₹1,500', desc: 'Essential ceremonies' },
            { value: '1500-5000', label: '₹1,500–₹5,000', desc: 'Detailed rituals' },
            { value: '5000+', label: '₹5,000+', desc: 'Grand community events' },
        ],
    },
];

export function ReligiousQuestionnaireModal({ isOpen, onClose }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});

    // Dynamic lists fetched from API
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(0);
            setAnswers({});
            setSubcategories([]);
        } else {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        setLoadingData(true);
        try {
            const RELIGIOUS_SERVICE_ID = '695250aa57bb211ca094e5fd';
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceId: RELIGIOUS_SERVICE_ID })
            });
            const data = await response.json();
            if (data.success && data.category) {
                setCategories(data.category);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchSubcategories = async (categoryId) => {
        setLoadingData(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryId })
            });
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                setSubcategories(data.data);
            }
        } catch (error) {
            console.error("Error fetching subcategories:", error);
        } finally {
            setLoadingData(false);
        }
    };

    // Construct the dynamic questions array
    const questions = [
        {
            id: 'category',
            title: 'What type of service do you need?',
            icon: Flame,
            options: categories.map(cat => ({
                value: cat._id,
                label: cat.categoryName || cat.name,
                desc: 'Select to explore related services',
                categoryName: cat.categoryName || cat.name
            }))
        },
        {
            id: 'subcategory',
            title: 'Please choose a specific service',
            icon: Sparkles,
            options: subcategories.map(sub => ({
                value: sub._id,
                label: sub.name,
                desc: sub.startingAt || sub.price || sub.minFare ? `Starting at ₹${sub.startingAt || sub.price || sub.minFare}` : sub.description || 'Proceed with this specific service',
                subcategoryName: sub.name,
                price: sub.startingAt || sub.price || sub.minFare || null
            }))
        },
        ...staticQuestions
    ];

    const currentQuestion = questions[currentStep];
    const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;
    const isAnswered = answers[currentQuestion?.id];

    // Unified finish function to avoid stale state issues
    const handleFinish = (finalAnswers) => {
        // Use 'all' if no specific subcategory was chosen
        const subId = finalAnswers.subcategory || 'all';
        
        const params = new URLSearchParams();
        // Standardize ALL params to always be present in URL, matching user structure expectations
        params.set('category', finalAnswers.categoryName || '');
        params.set('categoryId', finalAnswers.category || '');
        params.set('name', finalAnswers.subcategoryName || '');
        params.set('budget', finalAnswers.budget || '');
        
        // Ensure subCategoryId is also in query for certain backend/filter logic
        if (subId !== 'all') params.set('subcategoryId', subId);

        const targetUrl = `/religious-services/subcategory/${subId}?${params.toString()}`;
        
        console.log("🕉️ Sacred redirect path formed:", targetUrl);
        
        // Use window.location.href for a foolproof redirect if router.push has issues in this context
        setTimeout(() => {
            console.log("🚀 Executing final redirect to:", targetUrl);
            window.location.href = targetUrl;
            onClose();
        }, 500);
    };

    const handleSelect = (option) => {
        const updatedAnswers = { ...answers, [currentQuestion.id]: option.value };

        if (currentQuestion.id === 'category') {
            updatedAnswers.subcategory = undefined;
            updatedAnswers.categoryName = option.categoryName;
            setAnswers(updatedAnswers);
            fetchSubcategories(option.value).then(() => {
                setCurrentStep(1);
            });
            return;
        }

        if (currentQuestion.id === 'subcategory') {
            updatedAnswers.subcategoryName = option.subcategoryName;
            setAnswers(updatedAnswers);
            setCurrentStep(2);
            return;
        }

        if (currentQuestion.id === 'budget') {
            setAnswers(updatedAnswers);
            handleFinish(updatedAnswers);
            return;
        }

        setAnswers(updatedAnswers);
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinish(answers);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const QuestionIcon = currentQuestion?.icon || Flame;

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
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-[600px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden flex flex-col"
                    >
                        <div
                            className="relative text-white p-6"
                            style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF9933 50%, #E85D2F 100%)' }}
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="absolute top-2 right-14 text-5xl text-white/10 font-serif select-none pointer-events-none">ॐ</div>

                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-5 h-5 text-yellow-200" />
                                    <span className="text-white/90 text-sm font-medium uppercase tracking-wider">Divine Consultation</span>
                                </div>
                                <h2 className="text-2xl font-black">Spiritual Quest</h2>
                                <p className="text-white/80 text-sm mt-1">
                                    {questions.length} sacred steps to find your ideal Pandit.
                                </p>
                            </div>

                            <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-y-0 left-0 bg-white rounded-full"
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-white/70 uppercase tracking-tighter">
                                <span>Step {currentStep + 1} of {questions.length}</span>
                                <span>{Math.round(progress)}% complete</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-orange-50/10">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <div
                                            className="w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'linear-gradient(135deg, #FF6B35, #E85D2F)' }}
                                        >
                                            {QuestionIcon && <QuestionIcon className="w-7 h-7 text-white" />}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 leading-tight">{currentQuestion?.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">Select the best option for your ceremony</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        {loadingData && (currentQuestion?.id === 'category' || currentQuestion?.id === 'subcategory') ? (
                                            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-2 border-dashed border-orange-100">
                                                <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin mb-6" />
                                                <p className="text-orange-900 font-bold text-lg animate-pulse">Invoking Divine Options...</p>
                                            </div>
                                        ) : currentQuestion?.options.length === 0 ? (
                                            <div className="p-12 text-center text-gray-500 border border-dashed border-orange-200 rounded-3xl bg-white shadow-inner">
                                                <Sparkles className="w-12 h-12 text-orange-200 mx-auto mb-4 opacity-50" />
                                                <p className="font-medium">Peace be with you. No services found for this path yet.</p>
                                            </div>
                                        ) : currentQuestion?.options.map((option) => {
                                            const isSelected = answers[currentQuestion.id] === option.value;
                                            return (
                                                <motion.button
                                                    key={option.value}
                                                    onClick={() => handleSelect(option)}
                                                    whileHover={{ scale: 1.01, x: 4 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    className={`relative p-5 rounded-2xl border-2 transition-all text-left shadow-sm ${isSelected
                                                        ? 'border-orange-500 bg-[#FFF3E0] ring-4 ring-[#FF6B35]/10'
                                                        : 'border-white bg-white hover:border-orange-200 hover:shadow-md'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div 
                                                                    className="font-bold text-lg"
                                                                    style={{ color: isSelected ? '#BF360C' : '#111827' }}
                                                                >
                                                                    {option.label}
                                                                </div>
                                                                {option.price && (
                                                                    <div 
                                                                        className="font-black text-sm px-3 py-1 rounded-full border"
                                                                        style={{ 
                                                                            color: isSelected ? '#E65100' : '#ea580c',
                                                                            backgroundColor: isSelected ? '#FFF3E0' : '#fff7ed',
                                                                            borderColor: isSelected ? '#fed7aa' : '#ffedd5'
                                                                        }}
                                                                    >
                                                                        ₹{option.price}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div 
                                                                className="text-sm font-medium"
                                                                style={{ color: isSelected ? '#D84315' : '#6b7280' }}
                                                            >
                                                                {option.desc}
                                                            </div>
                                                        </div>
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ scale: 0, rotate: -45 }}
                                                                animate={{ scale: 1, rotate: 0 }}
                                                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                                                                style={{ background: 'linear-gradient(135deg, #FF6B35, #E85D2F)' }}
                                                            >
                                                                <Check className="w-5 h-5 text-white" />
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="border-t border-gray-100 p-6 bg-white">
                            <div className="flex items-center justify-between gap-4">
                                <button
                                    onClick={handleBack}
                                    disabled={currentStep === 0}
                                    className="px-8 py-4 bg-gray-50 border-2 border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 hover:text-gray-700 transition-all disabled:opacity-0 disabled:pointer-events-none flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Back
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={!isAnswered}
                                    className="flex-1 px-8 py-4 text-white rounded-2xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xl overflow-hidden relative group"
                                    style={isAnswered ? { background: 'linear-gradient(135deg, #FF6B35, #E85D2F)', boxShadow: '0 8px 30px rgba(255, 107, 53, 0.4)' } : { background: '#e5e7eb' }}
                                >
                                    {isAnswered && (
                                        <motion.div
                                            className="absolute inset-0 bg-white/20"
                                            initial={{ x: '-100%' }}
                                            whileHover={{ x: '100%' }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    )}
                                    <span className="relative z-10">{currentStep === questions.length - 1 ? '🙏 Reveal Pandits' : 'Continue Path'}</span>
                                    <ChevronRight className={`w-5 h-5 relative z-10 transition-transform ${isAnswered ? 'group-hover:translate-x-1' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

