import React, { useEffect, useRef, useState } from 'react';

const HeroSection = ({ t }) => {
  const [copyVisible, setCopyVisible] = useState(false);
  const sectionRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCopyVisible(true);
      return;
    }

    // Use IntersectionObserver to detect when trigger point is passed
    // Trigger is placed 30% down from top of Hero
    // When trigger scrolls UP past viewport center, show copy
    // When trigger scrolls DOWN past viewport center, hide copy
    if (!triggerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When trigger is intersecting (visible), hide copy
        // When trigger is NOT intersecting (scrolled past), show copy
        setCopyVisible(!entry.isIntersecting);
      },
      {
        root: null,
        // Trigger when element crosses 40% from top of viewport
        rootMargin: '-40% 0px -60% 0px',
        threshold: 0,
      }
    );

    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen sticky top-0 z-0 overflow-hidden bg-black">
      {/* Trigger point - when this scrolls past 40% of viewport, copy appears */}
      <div 
        ref={triggerRef} 
        className="absolute top-[15%] left-0 w-full h-1 pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/stock/2024 Toyota Vellfire/cover.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover parallax-layer scale-105"
          style={{ '--parallax-speed': 0.12 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/10" />
      </div>

      {/* Copy - hidden initially, fades in/out based on scroll position */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6">
          <div
            className="max-w-3xl mx-auto text-center text-white"
            style={{
              opacity: copyVisible ? 1 : 0,
              transform: copyVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 500ms ease-out, transform 500ms ease-out',
            }}
          >
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
              {t('Redefine your driving experience.', '重塑你的驾驶体验。')}
            </h2>
            <p className="mt-5 text-lg md:text-xl text-white/85">
              {t(
                'Luxury people movers and executive transport, curated for Australia.',
                '澳洲精选行政级豪华 MPV 与商务出行。'
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
