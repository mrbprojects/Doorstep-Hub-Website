'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    X, ChevronRight, ChevronLeft, Check,
    Flame, Users, Calendar, Clock, Sparkles, Star, Home as HomeIcon, Sun
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const questions = [
    {
        id: 'serviceType',
        title: 'What type of service do you need?',
        icon: Flame,
        options: [
            { value: 'pooja', label: 'Pooja / Homam', desc: 'Traditional rituals & fire ceremonies' },
            { value: 'astrology', label: 'Astrology Consultation', desc: 'Jyotish, horoscope & predictions' },
            { value: 'wedding', label: 'Wedding Ceremonies', desc: 'Mangalsutra, weddings & engagement rituals' },
            { value: 'vastu', label: 'Vastu Shastra', desc: 'Home & office energy consultation' },
            { value: 'festival', label: 'Festival Rituals', desc: 'Navratri, Diwali, Ganesh & more' },
            { value: 'grieving', label: 'Last Rites / Shraadh', desc: 'Antima Samskara & annual rituals' },
        ],
    },
    {
        id: 'occasion',
        title: 'What is the occasion?',
        icon: Star,
        options: [
            { value: 'new-home', label: 'New Home / Office', desc: 'Griha Pravesh & inauguration' },
            { value: 'birthday', label: 'Birthday / Anniversary', desc: 'Janamdin pooja & blessings' },
            { value: 'festival-day', label: 'Festival Day', desc: 'Specific festival or auspicious date' },
            { value: 'health', label: 'Health & Wellbeing', desc: 'Maha Mrityunjaya & healing rituals' },
            { value: 'general', label: 'General Blessing', desc: 'Satyanarayan or daily prayer' },
        ],
    },
    {
        id: 'attendees',
        title: 'How many people will attend?',
        icon: Users,
        options: [
            { value: 'personal', label: 'Just Me / Family', desc: 'Intimate ceremony (1–10 people)' },
            { value: 'small-group', label: 'Small Gathering', desc: '10–25 people' },
            { value: 'community', label: 'Community Event', desc: '25–100 people' },
            { value: 'large', label: 'Large Event', desc: '100+ people' },
        ],
    },
    {
        id: 'timing',
        title: 'When do you need the service?',
        icon: Calendar,
        options: [
            { value: 'today', label: 'Today', desc: 'Same day booking' },
            { value: 'this-week', label: 'This Week', desc: 'Within 7 days' },
            { value: 'next-week', label: 'Next Week', desc: '8–14 days' },
            { value: 'specific-date', label: 'Specific Muhurtham', desc: 'An auspicious date I have in mind' },
            { value: 'flexible', label: 'Flexible', desc: 'Pandit can suggest the date' },
        ],
    },
];

export function ReligiousQuestionnaireModal({ isOpen, onClose }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(0);
            setAnswers({});
        }
    }, [isOpen]);

    const currentQuestion = questions[currentStep];
    const progress = ((currentStep + 1) / questions.length) * 100;
    const isAnswered = answers[currentQuestion?.id];

    const handleSelect = (value) => {
        setAnswers({ ...answers, [currentQuestion.id]: value });
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            const queryParams = new URLSearchParams(answers);
            router.push(`/religious-services/category?${queryParams.toString()}`);
            onClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const QuestionIcon = currentQuestion?.icon;

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
                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-[600px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
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

                            {/* Decorative Om */}
                            <div className="absolute top-2 right-14 text-5xl text-white/10 font-serif select-none">ॐ</div>

                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-5 h-5 text-yellow-200" />
                                    <span className="text-white/90 text-sm font-medium">Find the right Pandit for you</span>
                                </div>
                                <h2 className="text-2xl font-bold">Book a Religious Service</h2>
                                <p className="text-white/80 text-sm mt-1">
                                    {questions.length} quick questions to match your sacred needs
                                </p>
                            </div>

                            {/* Progress */}
                            <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-y-0 left-0 bg-white rounded-full"
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-white/80">
                                <span>Step {currentStep + 1} of {questions.length}</span>
                                <span>{Math.round(progress)}% complete</span>
                            </div>
                        </div>

                        {/* Question Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Question Title */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'linear-gradient(135deg, #FF6B35, #E85D2F)' }}
                                        >
                                            {QuestionIcon && <QuestionIcon className="w-6 h-6 text-white" />}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{currentQuestion?.title}</h3>
                                    </div>

                                    {/* Options */}
                                    <div className="grid gap-3">
                                        {currentQuestion?.options.map((option) => {
                                            const isSelected = answers[currentQuestion.id] === option.value;
                                            return (
                                                <motion.button
                                                    key={option.value}
                                                    onClick={() => handleSelect(option.value)}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`relative p-4 rounded-2xl border-2 transition-all text-left ${isSelected
                                                        ? 'border-orange-500 bg-orange-50'
                                                        : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <div className="font-semibold text-gray-900 mb-0.5">{option.label}</div>
                                                            <div className="text-sm text-gray-500">{option.desc}</div>
                                                        </div>
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                                                style={{ background: 'linear-gradient(135deg, #FF6B35, #E85D2F)' }}
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
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 p-5 bg-orange-50/30">
                            <div className="flex items-center justify-between gap-4">
                                <button
                                    onClick={handleBack}
                                    disabled={currentStep === 0}
                                    className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Back
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={!isAnswered}
                                    className="flex-1 px-6 py-3 text-white rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                                    style={isAnswered ? { background: 'linear-gradient(135deg, #FF6B35, #E85D2F)', boxShadow: '0 4px 20px rgba(255, 107, 53, 0.35)' } : { background: '#ccc' }}
                                >
                                    <span>{currentStep === questions.length - 1 ? '🙏 Show Pandits' : 'Next'}</span>
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
