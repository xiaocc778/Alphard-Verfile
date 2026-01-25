import React from 'react';
import { ArrowRight } from 'lucide-react';

const HeroSection = ({ t, copyVisible = false, onExplore }) => {
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
    </section>
  );
};

export default HeroSection;
