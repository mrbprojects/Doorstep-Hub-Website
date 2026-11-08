'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function DynamicSEO() {
    const pathname = usePathname();
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (!pathname || typeof window === 'undefined') return;

        // On initial page mount, SSR has ALREADY rendered authoritative canonical and metadata
        // from the Next.js 16 Metadata API. Bypassing initial client mount completely eliminates
        // any hydration race condition or DOM collision.
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Standard routes have authoritative server-rendered metadata from Next.js Server Components.
        // Dynamic client-side metadata resolution is only needed for client-only dynamic routes.
        const currentPath = pathname === '/' ? '/' : pathname.replace(/\/$/, "");
        const isClientOnlyDynamicRoute = currentPath.includes('/details/') || currentPath.includes('/store/');

        if (!isClientOnlyDynamicRoute) {
            return;
        }

        let isCancelled = false;

        const updateSEO = async () => {
            try {
                const origin = 'https://doorstephub.com';
                const canonicalUrl = `${origin}${currentPath}`;

                let seoData = null;

                if (currentPath.includes('/details/')) {
                    const slug = currentPath.split('/details/').pop();
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/dhub_service_details/${slug}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({})
                    });
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.seo) {
                            seoData = result.seo;
                        }
                    }
                } else if (currentPath.includes('/store/')) {
                    const id = currentPath.split('/store/').pop().split('?')[0];
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/service_center_services/${id}`);
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.serviceCenter?.seo) {
                            seoData = result.serviceCenter.seo;
                        }
                    }
                }

                if (isCancelled || !seoData) return;

                // Defer DOM mutation to next animation frame so React commit phase finishes cleanly
                requestAnimationFrame(() => {
                    if (isCancelled) return;

                    // Update Canonical in-place
                    const linkCanonical = document.querySelector('link[rel="canonical"]');
                    if (linkCanonical) {
                        if (linkCanonical.getAttribute('href') !== canonicalUrl) {
                            linkCanonical.setAttribute('href', canonicalUrl);
                        }
                    }

                    const { title, description, keywords } = seoData;

                    if (title && document.title !== title) {
                        document.title = title;
                    }

                    const metaDescription = document.querySelector('meta[name="description"]');
                    if (metaDescription && description && metaDescription.getAttribute('content') !== description) {
                        metaDescription.setAttribute('content', description);
                    }

                    const metaKeywords = document.querySelector('meta[name="keywords"]');
                    const keywordsStr = Array.isArray(keywords) ? keywords.join(', ') : keywords;
                    if (metaKeywords && keywordsStr && metaKeywords.getAttribute('content') !== keywordsStr) {
                        metaKeywords.setAttribute('content', keywordsStr);
                    }
                });
            } catch (error) {
                console.error("Error updating dynamic SEO:", error);
            }
        };

        updateSEO();

        return () => {
            isCancelled = true;
        };
    }, [pathname]);

    return null;
}

