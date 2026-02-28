'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    TrendingUp,
    Users,
    Shield,
    Smartphone,
    ArrowRight,
    Download,
    Star,
    Wallet,
    Clock,
    UserCheck,
    MapPin,
    Calendar,
    DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

const PartnerBenefits = [
    {
        icon: Users,
        title: "Verified Customers",
        desc: "Access 50K+ verified customers actively seeking your services across 10+ cities.",
        stats: "50K+",
        color: "from-[#10b981] to-[#059669]"
    },
    {
        icon: Wallet,
        title: "Guaranteed Payments",
        desc: "Weekly payouts with 0% commission on first 100 bookings. Transparent pricing always.",
        stats: "₹5Cr+",
        color: "from-[#3b82f6] to-[#1d4ed8]"
    },
    {
        icon: Clock,
        title: "Flexible Schedule",
        desc: "Set your availability, accept jobs that fit your schedule. Work when you want.",
        stats: "24/7",
        color: "from-[#f59e0b] to-[#d97706]"
    }
];

const HowItWorksSteps = [
    {
        step: "01",
        title: "Download App",
        desc: "Get the partner app from Play Store or App Store",
        icon: Download
    },
    {
        step: "02",
        title: "Complete Profile",
        desc: "Upload documents & get verified in 24 hours",
        icon: UserCheck
    },
    {
        step: "03",
        title: "Start Earning",
        desc: "Receive jobs, complete service & get paid instantly",
        icon: DollarSign
    }
];

const PartnerStats = [
    { value: "10K+", label: "Active Partners", icon: Users },
    { value: "98%", label: "Success Rate", icon: TrendingUp },
    { value: "₹25K", label: "Avg Monthly", icon: Wallet },
    { value: "50K+", label: "Happy Customers", icon: Users }
];

export default function BecomePartnerPage() {
    const [appLinks, setAppLinks] = useState({
        android: 'https://play.google.com/store/apps/details?id=com.doorstephub.partner',
        ios: 'https://apps.apple.com/in/app/doorstep-hub/id6475340236'
    });

    useEffect(() => {
        router.replace('/service-partner');
    }, [router]);
    return null;
}
