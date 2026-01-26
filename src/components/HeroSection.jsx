import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_SLIDES = [
  '/stock/back/hero-alphard.jpg.jpg',
  '/stock/2024 Toyota Vellfire/cover.jpg',
  '/stock/25 Toyota Vellfire Executive Lounge/cover.jpg',
  '/stock/2023 Toyota Alphard 2.5L/cover.jpg',
  '/stock/2025 Toyota Voxy (BRAND NEW)/cover.jpg',
];

const HeroSection = ({ t, copyVisible = false, onExplore, slides }) => {
  const safeSlides = useMemo(() => {
    const input = Array.isArray(slides) && slides.length > 0 ? slides : DEFAULT_SLIDES;
    return input.filter(Boolean);
  }, [slides]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(!!mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (safeSlides.length <= 1) return;
    // Preload next slide for smoother crossfade
    const next = new Image();
    next.src = safeSlides[(activeIndex + 1) % safeSlides.length];
  }, [activeIndex, safeSlides]);

  useEffect(() => {
    if (reduceMotion) return;
    if (safeSlides.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safeSlides.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [reduceMotion, safeSlides.length]);

  const goPrev = () => {
    if (safeSlides.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + safeSlides.length) % safeSlides.length);
  };

  const goNext = () => {
    if (safeSlides.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % safeSlides.length);
  };

  return (
    <section className="relative h-screen sticky top-0 z-0 overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0">
        {safeSlides.map((src, idx) => (
          <img
            key={`${src}-${idx}`}
            src={src}
            alt=""
            onError={(e) => {
              e.currentTarget.src = '/stock/back/hero-alphard.jpg.jpg';
            }}
            className="absolute inset-0 h-full w-full object-cover parallax-layer scale-105 transition-opacity duration-1000 ease-out"
            style={{
              '--parallax-speed': 0.12,
              opacity: idx === activeIndex ? 1 : 0,
            }}
          />
        ))}
        {/* Gradient overlay - darker on left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
      </div>

      {/* Copy - left aligned, fades in on scroll */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          <div
            className="max-w-2xl text-left"
            style={{
              opacity: copyVisible ? 1 : 0,
              transform: copyVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 600ms ease-out, transform 600ms ease-out',
            }}
          >
            <h2 
              className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
            >
              {t('Redefine your driving experience.', '重塑你的驾驶体验。')}
            </h2>
            <p 
              className="mt-5 text-lg md:text-xl text-white/90 max-w-lg"
              style={{ textShadow: '0 1px 10px rgba(0,0,0,0.3)' }}
            >
              {t(
                'Luxury people movers and executive transport, curated for Australia.',
                '澳洲精选行政级豪华 MPV 与商务出行。'
              )}
            </p>
            <button 
              onClick={onExplore}
              className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full hover:bg-brand hover:text-white transition-all duration-300 font-bold shadow-lg"
            >
              {t('Explore inventory', '浏览库存')}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Slideshow controls */}
      {safeSlides.length > 1 && (
        <div className="absolute bottom-8 left-6 md:left-12 lg:left-16 z-20 flex items-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/15 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="mx-auto" size={18} />
          </button>

          <div className="flex items-center gap-2">
            {safeSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${idx === activeIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/15 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="mx-auto" size={18} />
          </button>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
