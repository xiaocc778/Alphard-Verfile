import React, { useEffect, useMemo, useState } from 'react';

/**
 * FramedImage
 * - Foreground: object-contain (keeps full image visible)
 * - Background: same image, object-cover + blur (fills empty space gracefully)
 * - Edge polish: subtle vignette + border
 */
export default function FramedImage({
  src,
  alt = '',
  fallbackSrc,
  className = '',
  imgClassName = '',
  bgClassName = '',
  fit = 'contain', // 'contain' | 'cover'
  mode = 'framed', // 'framed' | 'plain'
  loading,
  decoding = 'async',
}) {
  const initial = useMemo(() => src || fallbackSrc || '', [src, fallbackSrc]);
  const [resolvedSrc, setResolvedSrc] = useState(initial);

  useEffect(() => {
    setResolvedSrc(initial);
  }, [initial]);

  const handleError = () => {
    if (fallbackSrc && resolvedSrc !== fallbackSrc) setResolvedSrc(fallbackSrc);
  };

  if (!resolvedSrc) {
    return <div className={`relative overflow-hidden bg-surface ${className}`} aria-hidden="true" />;
  }

  const fitClass = fit === 'cover' ? 'object-cover' : 'object-contain';

  // Plain mode: just show the image (no blur background, no framing).
  if (mode === 'plain') {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={resolvedSrc}
          alt={alt}
          onError={handleError}
          loading={loading}
          decoding={decoding}
          className={`absolute inset-0 h-full w-full ${fitClass} ${imgClassName}`}
        />
      </div>
    );
  }

  // Framed mode: contain image + blurred background fill + subtle vignette.
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={resolvedSrc}
        alt=""
        aria-hidden="true"
        onError={handleError}
        loading={loading || 'lazy'}
        decoding={decoding}
        className={`absolute inset-0 h-full w-full object-cover scale-[1.12] blur-2xl brightness-[0.85] saturate-[1.05] ${bgClassName}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 ring-1 ring-black/10 pointer-events-none" />

      <img
        src={resolvedSrc}
        alt={alt}
        onError={handleError}
        loading={loading}
        decoding={decoding}
        className={`relative z-10 h-full w-full ${fitClass} drop-shadow-[0_12px_30px_rgba(0,0,0,0.25)] ${imgClassName}`}
      />
    </div>
  );
}

