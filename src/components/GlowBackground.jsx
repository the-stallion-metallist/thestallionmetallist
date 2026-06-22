import React from 'react';
import { motion } from 'framer-motion';

const GlowBackground = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      background: 'var(--color-secondary)' // Deep dark base
    }}>
      {/* Molten Copper Glow */}
      <motion.div
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -100, 100, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          top: '-10%',
          left: '20%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(242, 169, 0, 0.15) 0%, rgba(0,0,0,0) 60%)',
          borderRadius: '50%',
          willChange: 'transform'
        }}
      />
      
      {/* Aluminium/Steel Blue Glow */}
      <motion.div
        animate={{
          x: [0, -150, 50, 0],
          y: [0, 100, -150, 0],
          scale: [1, 0.9, 1.3, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '10%',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, rgba(0, 80, 158, 0.15) 0%, rgba(0,0,0,0) 60%)',
          borderRadius: '50%',
          willChange: 'transform'
        }}
      />

      {/* Subtle Purple/Titanium Glow in the center */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '30%',
          left: '30%',
          width: '40vw',
          height: '40vw',
          background: 'radial-gradient(circle, rgba(120, 0, 255, 0.05) 0%, rgba(0,0,0,0) 60%)',
          borderRadius: '50%',
          willChange: 'transform'
        }}
      />
      
      {/* Minimal grid overlay for a modern technical feel */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
      }} />
    </div>
  );
};

export default GlowBackground;
