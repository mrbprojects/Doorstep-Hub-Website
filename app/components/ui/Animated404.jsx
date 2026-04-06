'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export function Animated404() {
    useEffect(() => {
        const previousBodyBg = document.body.style.backgroundColor;
        const previousHtmlBg = document.documentElement.style.backgroundColor;
        const previousBodyBgImportant = document.body.style.getPropertyValue('background-color');
        const previousHtmlBgImportant = document.documentElement.style.getPropertyValue('background-color');
        const previousBodyPriority = document.body.style.getPropertyPriority('background-color');
        const previousHtmlPriority = document.documentElement.style.getPropertyPriority('background-color');
        document.body.style.setProperty('background-color', '#D9EAE8', 'important');
        document.documentElement.style.setProperty('background-color', '#D9EAE8', 'important');
        const timer = setTimeout(() => {
            window.location.href = 'https://doorstephub.com/appliance-repair-services';
        }, 3000);
        return () => {
            clearTimeout(timer);
            if (previousBodyBgImportant) {
                document.body.style.setProperty('background-color', previousBodyBgImportant, previousBodyPriority || '');
            } else {
                document.body.style.backgroundColor = previousBodyBg;
            }
            if (previousHtmlBgImportant) {
                document.documentElement.style.setProperty('background-color', previousHtmlBgImportant, previousHtmlPriority || '');
            } else {
                document.documentElement.style.backgroundColor = previousHtmlBg;
            }
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4"
            style={{ backgroundColor: '#D9EAE8' }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl flex flex-col items-center justify-center gap-3"
            >
                <img
                    src="/doorstepanimation.gif"
                    alt="Doorstep Hub Logo Animation"
                    className="w-auto max-w-full max-h-[60vh] object-contain"
                />
                <p className="text-center text-lg font-semibold text-[#2F4F4C] whitespace-nowrap">
                    I’d be happy to help with your booking.
                </p>
            </motion.div>
        </div>
    );
}
