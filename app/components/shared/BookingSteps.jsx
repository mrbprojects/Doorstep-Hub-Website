'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Flow types
export const FLOW_TYPES = {
    NORMAL: 'normal',        // Service → Direct → Address → Confirm
    SERVICE_CENTER: 'center' // Service → Direct → Cart → Address → Confirm
};

// Step configurations for each flow type
const STEP_CONFIGS = {
    [FLOW_TYPES.NORMAL]: [
        { id: 'service', label: 'Service' },
        { id: 'direct', label: 'Direct' },
        { id: 'address', label: 'Address' },
        { id: 'confirm', label: 'Confirm' }
    ],
    [FLOW_TYPES.SERVICE_CENTER]: [
        { id: 'service', label: 'Service' },
        { id: 'direct', label: 'Direct' },
        { id: 'cart', label: 'Cart' },
        { id: 'address', label: 'Address' },
        { id: 'confirm', label: 'Confirm' }
    ]
};

export function BookingSteps({
    flowType = FLOW_TYPES.NORMAL,
    currentStep = 'confirm',
    onStepClick,
    serviceSlug = 'appliances'
}) {
    const router = useRouter();
    const steps = STEP_CONFIGS[flowType] || STEP_CONFIGS[FLOW_TYPES.NORMAL];

    // Determine step status based on current step
    const getStepStatus = (stepId) => {
        const currentIndex = steps.findIndex(s => s.id === currentStep);
        const stepIndex = steps.findIndex(s => s.id === stepId);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return 'pending';
    };

    // Handle step click navigation
    const handleStepClick = (step) => {
        const status = getStepStatus(step.id);

        // Only allow clicking on completed steps
        if (status !== 'completed') return;

        // Call custom handler if provided
        if (onStepClick) {
            onStepClick(step.id);
            return;
        }

        // Default navigation logic
        switch (step.id) {
            case 'service':
                router.push(`/${serviceSlug}`);
                break;
            case 'cart':
                router.push(`/${serviceSlug}/cart`);
                break;
            case 'address':
                // Address page is typically part of the booking flow
                // Navigation handled by parent component
                break;
            case 'direct':
                // Direct booking - go back to service details
                router.back();
                break;
            default:
                break;
        }
    };

    return (
        <div className="flex items-center gap-2">
            {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const isClickable = status === 'completed';

                return (
                    <React.Fragment key={step.id}>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleStepClick(step)}
                                disabled={!isClickable}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${status === 'completed' || status === 'active'
                                        ? 'bg-gradient-to-r from-[#037166] to-[#04a99d]'
                                        : 'bg-white/10'
                                    } ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                                    }`}
                            >
                                {status === 'completed' ? (
                                    <CheckCircle className="w-5 h-5 text-white" />
                                ) : (
                                    <div
                                        className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-white' : 'bg-white/30'
                                            }`}
                                    />
                                )}
                            </button>
                            <span
                                className={`text-sm font-medium hidden sm:inline transition-colors ${status === 'active' ? 'text-white' : 'text-white/70'
                                    } ${isClickable ? 'hover:text-white cursor-pointer' : ''}`}
                                onClick={() => isClickable && handleStepClick(step)}
                            >
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`h-0.5 flex-1 transition-colors ${steps[index + 1] && getStepStatus(steps[index + 1].id) !== 'pending'
                                        ? 'bg-[#037166]'
                                        : 'bg-white/10'
                                    }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
