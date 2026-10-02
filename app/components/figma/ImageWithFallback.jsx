'use client';

import React, { useState } from 'react';

export function ImageWithFallback(props) {
  const { src, alt, style, className, fallbackSrc = '/hero-technician.jpg', ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  // Sync if src prop changes
  React.useEffect(() => {
    if (src) {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt || 'Doorstep Hub'}
      className={className}
      style={style}
      onError={handleError}
      loading="lazy"
      decoding="async"
      {...rest}
    />
  );
}

