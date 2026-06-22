import React from 'react';
import { motion } from 'framer-motion';

const isTouch = typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const TradeItem = ({ text, delay }) => (
  <motion.li 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={isTouch ? undefined : "hover"}
    style={{ 
      padding: '1.5rem 1rem', 
      borderBottom: '1px solid rgba(188,188,188,0.15)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      cursor: 'crosshair',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <motion.span 
      variants={{ hover: { x: 10, color: 'var(--color-accent)' } }}
      transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
      style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text-dark)', zIndex: 2 }}
    >
      {text}
    </motion.span>
    
    <motion.div 
      variants={{ hover: { width: '40px', opacity: 1 } }}
      initial={{ width: '0px', opacity: 0 }}
      transition={{ type: 'tween', ease: 'easeOut', duration: 0.4 }}
      style={{ height: '2px', background: 'var(--color-accent)', zIndex: 2 }}
    />
    
    <motion.div 
      variants={{ hover: { opacity: 1 } }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(143, 97, 58, 0.05) 0%, transparent 100%)', zIndex: 1 }}
    />
  </motion.li>
);

const Trade = () => {
  return (
    <section id="trade" className="section">
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2.5rem auto' }}>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '1.5rem', color: 'var(--color-text-dark)' }}
          >
            What We Trade
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}
          >
            We deal in a wide range of internationally graded metal scrap, sourced from established exporters and traded to processors, recyclers, and industrial manufacturers in India.
          </motion.p>
        </div>

        <div className="responsive-grid" style={{ gap: '3rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-panel"
            style={{ padding: 'clamp(1.5rem, 5vw, 4rem)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ position: 'absolute', top: '2rem', right: '2rem', fontSize: 'clamp(6rem, 15vw, 12rem)', fontWeight: 900, color: 'var(--color-text-dark)', opacity: 0.03, pointerEvents: 'none', lineHeight: 0.8, letterSpacing: '-5px', zIndex: 0 }}>
              01
            </div>
            
            <h3 style={{ fontSize: '2.5rem', marginBottom: '3rem', color: 'var(--color-text-dark)', fontWeight: 800, letterSpacing: '-1px', zIndex: 1 }}>Ferrous</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, zIndex: 1 }}>
              <TradeItem text="HMS 1 & 2 (Heavy Melting Scrap)" delay={0.1} />
              <TradeItem text="Shredded Scrap" delay={0.2} />
              <TradeItem text="Cast Iron Scrap" delay={0.3} />
              <TradeItem text="Structural & Industrial Scrap" delay={0.4} />
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-panel"
            style={{ padding: 'clamp(1.5rem, 5vw, 4rem)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ position: 'absolute', top: '2rem', right: '2rem', fontSize: 'clamp(6rem, 15vw, 12rem)', fontWeight: 900, color: 'var(--color-accent)', opacity: 0.03, pointerEvents: 'none', lineHeight: 0.8, letterSpacing: '-5px', zIndex: 0 }}>
              02
            </div>
            
            <h3 style={{ fontSize: '2.5rem', marginBottom: '3rem', color: 'var(--color-accent)', fontWeight: 800, letterSpacing: '-1px', zIndex: 1 }}>Non-Ferrous</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, zIndex: 1 }}>
              <TradeItem text="Aluminium (UBC, Taint Tabor, Zorba, Extrusion)" delay={0.1} />
              <TradeItem text="Copper" delay={0.2} />
              <TradeItem text="Brass" delay={0.3} />
              <TradeItem text="Stainless Steel 304 / 316" delay={0.4} />
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Trade;
