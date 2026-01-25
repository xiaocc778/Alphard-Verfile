import React, { useEffect, useState } from 'react';

const HeroSection = ({ t }) => {
  const [copyVisible, setCopyVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCopyVisible(true);
      return;
    }

    const onScroll = () => {
      const y = window.scrollY || 0;
      // Show copy when scrolled down, hide when at/near top
      setCopyVisible(y > 30);
    };

    // Check initial position (in case page loads with scroll position)
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="relative h-screen sticky top-0 z-0 overflow-hidden bg-black">
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

      {/* Copy - hidden at top, fades in/out on scroll */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6">
          <div
            className="max-w-3xl mx-auto text-center text-white"
            style={{
              opacity: copyVisible ? 1 : 0,
              transform: copyVisible ? 'translateY(0)' : 'translateY(32px)',
              transition: 'opacity 600ms ease-out, transform 600ms ease-out',
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
