'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export function Animated404() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/appliance-repair-services');
        }, 5000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-[#D9EAE8] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center"
            >
                <Image
                    src="/doorstepanimation.gif"
                    alt="Doorstep Hub Logo Animation"
                    className="w-64 md:w-80 h-auto object-contain mb-8 mix-blend-multiply"
                 width={500} height={300} />
            </motion.div>
        </div>
    );
}
