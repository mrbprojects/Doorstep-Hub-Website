'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function DynamicSEO() {
    const pathname = usePathname();
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (!pathname) return;

        // On initial page mount, SSR has ALREADY rendered authoritative canonical and metadata
        // from the Next.js 16 Metadata API. Bypassing initial client mount completely eliminates
        // any hydration race condition or DOM collision without any artificial timer dependencies.
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const updateSEO = async () => {
            try {
                // 1. Path Normalization
                const currentPath = pathname === '/' ? '/' : pathname.replace(/\/$/, "");
                const origin = 'https://doorstephub.com';
                const canonicalUrl = `${origin}${currentPath}`;

                // 2. Updated Canonical (in-place update to prevent duplicate or orphaned elements)
                let linkCanonical = document.querySelector('link[rel="canonical"]');
                if (linkCanonical) {
                    if (linkCanonical.getAttribute('href') !== canonicalUrl) {
                        linkCanonical.setAttribute('href', canonicalUrl);
                        console.log(`[SEO] Setting Canonical: ${canonicalUrl}`);
                    }
                } else {
                    linkCanonical = document.createElement('link');
                    linkCanonical.rel = "canonical";
                    linkCanonical.setAttribute('href', canonicalUrl);
                    document.head.appendChild(linkCanonical);
                    console.log(`[SEO] Setting Canonical: ${canonicalUrl}`);
                }

                // 3. Dynamic API Mapping
                let seoData = null;

                // Pattern detection for primary APIs
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
                            console.log(`[SEO] Resolved from Service API: ${slug}`);
                        }
                    }
                } else if (currentPath.includes('/store/')) {
                    const id = currentPath.split('/store/').pop().split('?')[0];
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/service_center_services/${id}`);
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.serviceCenter?.seo) {
                            seoData = result.serviceCenter.seo;
                            console.log(`[SEO] Resolved from Store API: ${id}`);
                        }
                    }
                }

                // Fallback to Smart API if primary not found or not dynamic page (handles /nearby-service-centers etc.)
                if (!seoData) {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/web/seo/get-page-seo?path=${currentPath}`);
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.data) {
                            seoData = result.data.data || result.data;
                            console.log(`[SEO] Resolved from Smart API: ${currentPath}`);
                        }
                    }
                }

                // 4. In-place Metadata Injection
                if (seoData) {
                    const { title, description, keywords } = seoData;

                    // Update Title in-place
                    if (title && document.title !== title) {
                        document.title = title;
                    }

                    // Update Description in-place
                    let metaDescription = document.querySelector('meta[name="description"]');
                    if (metaDescription) {
                        if (description && metaDescription.getAttribute('content') !== description) {
                            metaDescription.setAttribute('content', description);
                        }
                    } else if (description) {
                        metaDescription = document.createElement('meta');
                        metaDescription.name = "description";
                        metaDescription.content = description;
                        document.head.appendChild(metaDescription);
                    }

                    // Update Keywords in-place
                    let metaKeywords = document.querySelector('meta[name="keywords"]');
                    const keywordsStr = Array.isArray(keywords) ? keywords.join(', ') : keywords;
                    if (metaKeywords) {
                        if (keywordsStr && metaKeywords.getAttribute('content') !== keywordsStr) {
                            metaKeywords.setAttribute('content', keywordsStr);
                        }
                    } else if (keywordsStr) {
                        metaKeywords = document.createElement('meta');
                        metaKeywords.name = "keywords";
                        metaKeywords.content = keywordsStr;
                        document.head.appendChild(metaKeywords);
                    }
                }
            } catch (error) {
                console.error("Error updating global SEO:", error);
            }
        };

        updateSEO();
    }, [pathname]);

    return null;
}

