import React from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Recycle, Zap, Building2, MapPin } from 'lucide-react';

const InitiativeCard = () => {
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="glass-panel"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(2rem, 5vw, 3.5rem)',
        borderRadius: '28px',
        border: '1px solid var(--color-border)',
        maxWidth: '1000px',
        margin: '0 auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(143, 97, 58, 0.15), transparent 80%)`,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.9rem',
            borderRadius: '999px',
            background: 'rgba(143, 97, 58, 0.12)',
            color: 'var(--color-accent)',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            <MapPin size={15} /> Dehradun Local Initiative
          </span>
        </div>

        <h2 style={{
          fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
          fontWeight: 800,
          letterSpacing: '-1px',
          color: 'var(--color-text-dark)',
          marginBottom: '1.5rem',
          lineHeight: 1.2
        }}>
          Recovering Every Can in Dehradun
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <p style={{
            fontSize: '1.15rem',
            lineHeight: 1.75,
            color: 'var(--color-text-dark)',
            margin: 0
          }}>
            The Stallion Metallist runs Dehradun's dedicated used beverage can (UBC) collection network. We partner with hotels, restaurants, and cafés to recover aluminum cans at the source before they end up in landfills.
          </p>

          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.75,
            color: 'var(--color-text-muted)',
            margin: 0
          }}>
            Recycled aluminum uses <strong>95% less energy</strong> than producing new metal. Every can we collect goes back into the supply chain keeping Dehradun cleaner and its aluminum in circulation.
          </p>
        </div>

        {/* Highlight Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          paddingTop: '2rem',
          borderTop: '1px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(143, 97, 58, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent)',
              flexShrink: 0
            }}>
              <Zap size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--color-text-dark)', fontWeight: 700 }}>
                95% Energy Saved
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                Drastically lower footprint compared to virgin aluminum.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(143, 97, 58, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent)',
              flexShrink: 0
            }}>
              <Building2 size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--color-text-dark)', fontWeight: 700 }}>
                Hospitality Partners
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                Direct pickup from hotels, restaurants, and cafés.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(143, 97, 58, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent)',
              flexShrink: 0
            }}>
              <Recycle size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--color-text-dark)', fontWeight: 700 }}>
                Closed-Loop Recycling
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                Zero landfill waste, recirculating aluminum sustainably.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DehradunInitiative = () => {
  return (
    <section id="dehradun-initiative" className="section" style={{ padding: '4rem 0 3rem 0' }}>
      <div className="container">
        <InitiativeCard />
      </div>
    </section>
  );
};

export default DehradunInitiative;
