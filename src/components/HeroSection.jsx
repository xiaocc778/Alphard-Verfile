import React from 'react';

const HeroSection = ({ t, copyVisible = false }) => {
  return (
    <section className="relative h-screen sticky top-0 z-0 overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/stock/back/hero-alphard.jpg.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover parallax-layer scale-105"
          style={{ '--parallax-speed': 0.12 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/10" />
      </div>

      {/* Copy - controlled by parent via copyVisible prop */}
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
