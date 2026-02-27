'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * Optimized Image Component with lazy loading and error handling
 */
export const OptimizedImage = ({
    src,
    alt,
    width,
    height,
    className = '',
    fallbackSrc = '/images/placeholder.png',
    priority = false,
    quality = 75,
    objectFit = 'cover',
    onLoad = null,
    onError = null,
    ...props
}) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Update src if prop changes
    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
        setIsLoading(true);
    }, [src]);

    const handleLoad = (e) => {
        setIsLoading(false);
        if (onLoad) onLoad(e);
    };

    const handleError = (e) => {
        console.error('Image load error:', src);
        setHasError(true);
        setIsLoading(false);
        setImgSrc(fallbackSrc);
        if (onError) onError(e);
    };

    return (
        <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
            {isLoading && !hasError && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
            )}
            <Image
                src={imgSrc}
                alt={alt || 'Image'}
                width={width}
                height={height}
                quality={quality}
                priority={priority}
                className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                style={{ objectFit }}
                onLoad={handleLoad}
                onError={handleError}
                {...props}
            />
        </div>
    );
};

/**
 * Lazy Image Component with Intersection Observer
 */
export const LazyImage = ({
    src,
    alt,
    width,
    height,
    className = '',
    fallbackSrc = '/images/placeholder.png',
    threshold = 0.1,
    rootMargin = '50px',
    ...props
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold,
                rootMargin
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (observer) observer.disconnect();
        };
    }, [threshold, rootMargin]);

    return (
        <div ref={imgRef} style={{ width, height }}>
            {isVisible ? (
                <OptimizedImage
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    className={className}
                    fallbackSrc={fallbackSrc}
                    {...props}
                />
            ) : (
                <div
                    className={`bg-gray-200 animate-pulse ${className}`}
                    style={{ width, height }}
                />
            )}
        </div>
    );
};

/**
 * Background Image with lazy loading
 */
export const LazyBackgroundImage = ({
    src,
    children,
    className = '',
    fallbackSrc = '/images/placeholder.png',
    threshold = 0.1,
    rootMargin = '50px'
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [imgSrc, setImgSrc] = useState(null);
    const [hasError, setHasError] = useState(false);
    const divRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold,
                rootMargin
            }
        );

        if (divRef.current) {
            observer.observe(divRef.current);
        }

        return () => {
            if (observer) observer.disconnect();
        };
    }, [threshold, rootMargin]);

    useEffect(() => {
        if (isVisible && src) {
            const img = new window.Image();
            img.onload = () => setImgSrc(src);
            img.onerror = () => {
                setHasError(true);
                setImgSrc(fallbackSrc);
            };
            img.src = src;
        }
    }, [isVisible, src, fallbackSrc]);

    return (
        <div
            ref={divRef}
            className={className}
            style={{
                backgroundImage: imgSrc ? `url(${imgSrc})` : 'none',
                backgroundColor: imgSrc ? 'transparent' : '#e5e7eb'
            }}
        >
            {children}
        </div>
    );
};

export default OptimizedImage;
