import React from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';

const InteractiveCard = ({ title, desc, delay }) => {
  const isTouch = typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const { left, top } = e.currentTarget.getBoundingClientRect();
      mouseX.set(touch.clientX - left);
      mouseY.set(touch.clientY - top);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, delay } }}
      viewport={{ once: true }}
      whileHover={isTouch ? undefined : { y: -5, scale: 1.02, transition: { type: 'spring', stiffness: 500, damping: 30 } }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="glass-panel"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '2rem 1.5rem',
        borderRadius: '16px',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'crosshair',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, rgba(143, 97, 58, 0.12), transparent 80%)`,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0,
        }}
        whileHover={isTouch ? undefined : { opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Animated accent line */}
      <motion.div 
        initial={{ width: '0px' }}
        whileInView={{ width: '40px', transition: { duration: 0.8, delay: delay + 0.3 } }}
        whileHover={isTouch ? undefined : { width: '100%', transition: { type: 'spring', stiffness: 400, damping: 30 } }}
        viewport={{ once: true }}
        style={{ height: '3px', background: 'var(--color-accent)', marginBottom: '1.5rem', borderRadius: '2px', zIndex: 1, position: 'relative' }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-text-dark)', fontWeight: 700, letterSpacing: '-0.5px' }}>{title}</h4>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{desc}</p>
      </div>
    </motion.div>
  );
};

const WhyUs = () => {
  const cards = [
    { title: 'Global Structure', desc: 'Canada-incorporated entity with a credible, internationally recognised legal and corporate structure.' },
    { title: 'Local Presence', desc: 'On-the-ground presence in both India and the West - bridging global supply with Indian industrial demand.' },
    { title: 'Market Expertise', desc: 'Deep knowledge of the Rajkot and Gujarat scrap buyer ecosystem built through direct trade relationships.' },
    { title: 'Compliant Process', desc: 'Structured, compliant payment processes that meet the expectations of international exporters.' }
  ];

  return (
    <section id="why-us" className="section" style={{ padding: '4rem 0 6rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, letterSpacing: '-1.5px', margin: 0 }}
          >
            Why Stallion Metallist
          </motion.h2>
        </div>
        
        <div className="why-us-grid">
          {cards.map((card, idx) => (
            <InteractiveCard 
              key={idx} 
              title={card.title} 
              desc={card.desc} 
              delay={idx * 0.1} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
