import React from 'react';

const HeroSection = ({ t, copyVisible = false }) => {
  return (
    <section className="relative h-screen sticky top-0 z-0 overflow-hidden bg-black">
      {/* Background Image - pure visual, no text overlay */}
      <div className="absolute inset-0">
        <img
          src="/stock/back/hero-alphard.jpg.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover parallax-layer scale-105"
          style={{ '--parallax-speed': 0.12 }}
        />
        {/* Subtle gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      </div>
    </section>
  );
};

export default HeroSection;
