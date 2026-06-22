import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ThemeTransition = ({ onMidpoint, onComplete }) => {
  const [phase, setPhase] = useState('entering');

  const handleAnimationComplete = () => {
    if (phase === 'entering') {
      onMidpoint();
      setPhase('exiting');
    } else if (phase === 'exiting') {
      onComplete();
    }
  };

  const shardVariants = {
    entering: { x: 0, y: 0 },
    exiting: (custom) => ({ x: custom.x, y: custom.y }),
    initial: (custom) => ({ x: custom.x, y: custom.y })
  };

  // Easing function for a "heavy" but fast slide
  const transition = { duration: 0.5, ease: [0.76, 0, 0.24, 1] };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0, 
      zIndex: 99999, 
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        
        {/* Shard 1 (Top Left) */}
        <motion.polygon 
          points="0,0 100,0 80,30 40,60 0,40" 
          fill="#222222" 
          stroke="#222222" strokeWidth="0.5"
          custom={{ x: -100, y: -100 }}
          initial="initial"
          animate={phase}
          variants={shardVariants}
          transition={transition}
          onAnimationComplete={handleAnimationComplete}
        />

        {/* Shard 2 (Right) */}
        <motion.polygon 
          points="100,0 100,100 60,100 40,60 80,30" 
          fill="#111111" 
          stroke="#111111" strokeWidth="0.5"
          custom={{ x: 100, y: 0 }}
          initial="initial"
          animate={phase}
          variants={shardVariants}
          transition={transition}
        />

        {/* Shard 3 (Bottom Left) */}
        <motion.polygon 
          points="0,40 40,60 60,100 0,100" 
          fill="#1A1A1A" 
          stroke="#1A1A1A" strokeWidth="0.5"
          custom={{ x: -100, y: 100 }}
          initial="initial"
          animate={phase}
          variants={shardVariants}
          transition={transition}
        />

      </svg>
    </div>
  );
};

export default ThemeTransition;
