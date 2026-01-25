import React from 'react';

const HeroSection = ({ t }) => {
  return (
    <section className="relative h-screen sticky top-0 z-0 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/stock/2024 Toyota Vellfire/cover.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover parallax-layer scale-105"
          style={{ '--parallax-speed': 0.12 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/10" />
      </div>
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6">
          <div
            className="max-w-3xl text-white parallax-layer"
            style={{ '--parallax-speed': 0.5 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/70">
              {t('Best Auto', 'Best Auto')}
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">
              {t('Redefine your driving experience.', '重塑你的驾驶体验。')}
            </h1>
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
