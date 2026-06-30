import React from 'react';
import { motion, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';

const InteractiveCard = ({ title, desc, delay, onClick }) => {
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
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, delay } }}
      viewport={{ once: true }}
      whileHover={{ y: -5, scale: 1.02, transition: { type: 'spring', stiffness: 500, damping: 30 } }}
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
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Animated accent line */}
      <motion.div 
        initial={{ width: '0px' }}
        whileInView={{ width: '40px', transition: { duration: 0.8, delay: delay + 0.3 } }}
        whileHover={{ width: '100%', transition: { type: 'spring', stiffness: 400, damping: 30 } }}
        viewport={{ once: true }}
        style={{ height: '3px', background: 'var(--color-accent)', marginBottom: '1.5rem', borderRadius: '2px', zIndex: 1, position: 'relative' }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        <div>
          <h4 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-text-dark)', fontWeight: 700, letterSpacing: '-0.5px' }}>{title}</h4>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', fontSize: '0.9rem', fontWeight: 600 }}>
          <span>Learn more</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </div>
      </div>
    </motion.div>
  );
};

import { X } from 'lucide-react';

const WhyUs = () => {
  const [selectedCard, setSelectedCard] = React.useState(null);

  React.useEffect(() => {
    if (selectedCard) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedCard]);

  const cards = [
    { title: 'Global Structure', desc: 'Canada-incorporated entity with a credible, internationally recognised legal and corporate structure.' },
    { title: 'Local Presence', desc: 'On-the-ground presence in both India and the West, bridging global supply with Indian industrial demand.' },
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
              onClick={() => setSelectedCard(card)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedCard && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCard(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(5px)',
                zIndex: 1000
              }}
            />
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              padding: '1rem'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                style={{
                  background: 'var(--color-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '24px',
                  padding: '2.5rem',
                  maxWidth: '500px',
                  width: '100%',
                  pointerEvents: 'auto',
                  position: 'relative',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
              >
                <button 
                  onClick={() => setSelectedCard(null)}
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-dark)',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                >
                  <X size={24} />
                </button>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--color-text-dark)', fontWeight: 800, paddingRight: '2rem' }}>
                  {selectedCard.title}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>
                  {selectedCard.desc}
                </p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default WhyUs;
