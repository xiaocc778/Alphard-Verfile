import React, { useEffect, useMemo, useState } from 'react';

/**
 * AutoAspectImage
 * Keeps the full image visible (no crop) by setting the wrapper's aspect-ratio
 * to match the loaded image's natural dimensions.
 *
 * Result: object-contain without letterboxing, because the container ratio equals the image ratio.
 */
export default function AutoAspectImage({
  src,
  alt = '',
  fallbackSrc,
  className = '',
  imgClassName = '',
  initialAspect = '4 / 3',
  loading,
  decoding = 'async',
}) {
  const initialSrc = useMemo(() => src || fallbackSrc || '', [src, fallbackSrc]);
  const [resolvedSrc, setResolvedSrc] = useState(initialSrc);
  const [aspect, setAspect] = useState(initialAspect);

  useEffect(() => {
    setResolvedSrc(initialSrc);
    setAspect(initialAspect);
  }, [initialSrc, initialAspect]);

  // Ensure aspect ratio is computed even when the image is served from cache and onLoad
  // may not fire reliably across route transitions.
  useEffect(() => {
    if (!resolvedSrc) return undefined;

    let cancelled = false;
    const probe = new Image();

    const apply = () => {
      if (cancelled) return;
      const w = probe.naturalWidth || 0;
      const h = probe.naturalHeight || 0;
      if (w > 0 && h > 0) setAspect(`${w} / ${h}`);
    };

    probe.onload = apply;
    probe.onerror = () => {
      // If primary fails, try fallback (and let the <img> onError handle real swap too).
      if (fallbackSrc && probe.src !== fallbackSrc) {
        probe.src = fallbackSrc;
        return;
      }
    };

    probe.src = resolvedSrc;
    if (probe.complete) apply();

    return () => {
      cancelled = true;
    };
  }, [resolvedSrc, fallbackSrc]);

  const handleError = () => {
    if (fallbackSrc && resolvedSrc !== fallbackSrc) setResolvedSrc(fallbackSrc);
  };

  if (!resolvedSrc) {
    return <div className={`bg-surface ${className}`} aria-hidden="true" />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: aspect }}>
      <img
        src={resolvedSrc}
        alt={alt}
        onError={handleError}
        loading={loading}
        decoding={decoding}
        onLoad={(e) => {
          const w = e.currentTarget.naturalWidth || 0;
          const h = e.currentTarget.naturalHeight || 0;
          if (w > 0 && h > 0) setAspect(`${w} / ${h}`);
        }}
        className={`absolute inset-0 h-full w-full object-contain ${imgClassName}`}
      />
    </div>
  );
}

