'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function DynamicSEO() {
    const pathname = usePathname();

    useEffect(() => {
        const updateSEO = async () => {
            try {
                // 1. Path Normalization
                // Normalizes trailing slashes and ensures the path is clean
                const currentPath = pathname === '/' ? '/' : pathname.replace(/\/$/, "");

                // 2. API Call
                const response = await fetch(`https://api.doorstephub.com/v1/dhubApi/web/seo/get-page-seo?path=${currentPath}`);
                const result = await response.json();

                if (result.success && result.data) {
                    // Check if nested data exists based on the request's 'res.data.data' specification
                    const seo = result.data.data || result.data;
                    const { title, description, keywords } = seo;

                    console.log(`[SEO Debug] Path: ${currentPath} | Title: ${title}`);

                    // 3. Metadata Injection

                    // Update Title
                    if (title) document.title = title;

                    // 3. Update Canonical (Automated)
                    const canonicalUrl = `https://doorstephub.com${currentPath}`;
                    let linkCanonical = document.querySelector('link[rel="canonical"]');
                    if (!linkCanonical) {
                        linkCanonical = document.createElement('link');
                        linkCanonical.rel = "canonical";
                        document.head.appendChild(linkCanonical);
                    }
                    linkCanonical.href = canonicalUrl;

                    // 4. Update Description
                    let metaDescription = document.querySelector('meta[name="description"]');
                    if (!metaDescription) {
                        metaDescription = document.createElement('meta');
                        metaDescription.name = "description";
                        document.head.appendChild(metaDescription);
                    }
                    if (description) metaDescription.content = description;

                    // 5. Update Keywords
                    let metaKeywords = document.querySelector('meta[name="keywords"]');
                    if (!metaKeywords) {
                        metaKeywords = document.createElement('meta');
                        metaKeywords.name = "keywords";
                        document.head.appendChild(metaKeywords);
                    }
                    // Handle array or string keywords
                    const keywordsStr = Array.isArray(keywords) ? keywords.join(', ') : keywords;
                    if (keywordsStr) metaKeywords.content = keywordsStr;
                } else {
                    // Fallback Canonical even if API fails
                    const currentPath = pathname === '/' ? '/' : pathname.replace(/\/$/, "");
                    const canonicalUrl = `https://doorstephub.com${currentPath}`;
                    let linkCanonical = document.querySelector('link[rel="canonical"]');
                    if (!linkCanonical) {
                        linkCanonical = document.createElement('link');
                        linkCanonical.rel = "canonical";
                        document.head.appendChild(linkCanonical);
                    }
                    linkCanonical.href = canonicalUrl;
                }
            } catch (error) {
                console.error("Error updating dynamic SEO:", error);
                // Fallback to defaults or leave as is - root layout metadata acts as default
            }
        };

        updateSEO();
    }, [pathname]);

    return null; // This component doesn't render anything visible
}
