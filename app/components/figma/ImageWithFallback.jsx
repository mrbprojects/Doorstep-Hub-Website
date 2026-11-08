'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export function ImageWithFallback(props) {
  const { src, alt, style, className, fallbackSrc = '/hero-technician.jpg', width, height, fill, sizes, priority, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const [prevSrc, setPrevSrc] = useState(src);
  if (prevSrc !== src) {
    setPrevSrc(src);
    setImgSrc(src || fallbackSrc);
    setHasError(false);
  }

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const imageProps = {
    src: imgSrc || fallbackSrc,
    alt: alt || 'Doorstep Hub',
    className,
    style,
    onError: handleError,
    unoptimized: true,
    ...rest,
  };

  if (fill) {
    imageProps.fill = true;
    if (sizes) imageProps.sizes = sizes;
  } else {
    imageProps.width = width || 400;
    imageProps.height = height || 300;
  }

  return <Image alt={alt || 'Doorstep Hub'} priority={priority} {...imageProps} />;
}

