import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useMotionValue, useMotionTemplate } from 'framer-motion';

// Ultra-modern spotlight card component
const SpotlightCard = ({ children, delay }) => {
  const isTouch = typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0, transition: { duration: 0.8, delay } }}
      viewport={{ once: true }}
      whileHover={isTouch ? undefined : { y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 500, damping: 30 } }}
      onMouseMove={handleMouseMove}
      className=""
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '2.5rem',
        borderRadius: '24px',
        border: '1px solid var(--inv-border)',
        background: 'var(--inv-card-bg)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'crosshair',
        transition: 'box-shadow 0.2s ease-out'
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, rgba(143, 97, 58, 0.15), transparent 80%)`,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0,
        }}
        whileHover={isTouch ? undefined : {}}
        transition={{ duration: 0.3 }}
      />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </motion.div>
  );
};

const StatItem = ({ endValue, suffix, label, desc, delay, index }) => {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px 0px" });

  useEffect(() => {
    if (isInView) {
      let startTimestamp = null;
      const duration = 2500;
      
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        
        setValue(Math.floor(easeOut * endValue));
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
    }
  }, [isInView, endValue]);

  return (
    <SpotlightCard delay={delay}>
      <div ref={ref} style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '1rem' }}>
        <span style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, lineHeight: 1, color: 'var(--inv-text)', letterSpacing: '-2px' }}>
          {value}
        </span>
        <span style={{ fontSize: 'clamp(1.5rem, 2vw, 2rem)', fontWeight: 800, color: 'var(--color-accent)', marginLeft: '0.2rem' }}>
          {suffix}
        </span>
      </div>
      
      <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--inv-text)', margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
        {label}
      </h4>
      <p style={{ fontSize: '0.95rem', color: 'var(--inv-text-muted)', lineHeight: 1.5, margin: 0, flex: 1 }}>
        {desc}
      </p>
      
      <div style={{ marginTop: '2.5rem', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: delay + 0.5, ease: "easeOut" }}
          style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-accent), #f3c7a3)' }}
        />
      </div>
    </SpotlightCard>
  );
};

const Stats = () => {
  return (
    <section style={{ padding: '3rem 0', position: 'relative', background: 'var(--inv-bg)', overflow: 'hidden', transition: 'background 0.5s ease' }}>
      {/* Geometric Grid Background */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundSize: '50px 50px',
        backgroundImage: 'linear-gradient(to right, var(--inv-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--inv-grid-line) 1px, transparent 1px)',
        zIndex: 0
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, var(--inv-bg) 80%)', zIndex: 0 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Subtle background text watermark */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', textAlign: 'center', pointerEvents: 'none', zIndex: 0 }}>
          <span style={{ fontSize: '18vw', fontWeight: 900, color: 'var(--inv-text)', opacity: 0.03, letterSpacing: '-5px', lineHeight: 0.8, whiteSpace: 'nowrap' }}>
            SCALE
          </span>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1.5rem',
          position: 'relative',
          zIndex: 1
        }}>
          <StatItem 
            index={1}
            endValue={50} 
            suffix="K+" 
            label="Tons Traded Annually" 
            desc="Moving massive volumes of high-grade scrap seamlessly across international borders every year."
            delay={0.1} 
          />
          <StatItem 
            index={2}
            endValue={4} 
            suffix="" 
            label="Global Markets Served" 
            desc="Established trade routes across the UAE, China, Europe, and the North American sectors."
            delay={0.2} 
          />
          <StatItem 
            index={3}
            endValue={3} 
            suffix="" 
            label="Major Ports Operated" 
            desc="Dedicated customs clearing and logistics handling at Mundra, Kandla, and JNPT terminals."
            delay={0.3} 
          />
          <StatItem 
            index={4}
            endValue={100} 
            suffix="+" 
            label="Trusted Partners" 
            desc="A deeply vetted network of certified international exporters, recyclers, and processors."
            delay={0.4} 
          />
        </div>
      </div>
    </section>
  );
};

export default Stats;
