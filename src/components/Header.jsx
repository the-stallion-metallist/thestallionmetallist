import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';

const Header = ({ theme, toggleTheme }) => {
  const isTouch = typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header 
        style={{ position: 'fixed', top: '20px', left: 0, right: 0, zIndex: 100, margin: '0 auto', maxWidth: '1200px', width: 'calc(100% - 40px)' }}
        className="glass-panel"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px', padding: '0 2rem' }} className="header-inner">
          <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <img 
              src="/brand/Stallion logo with transparent bg.png" 
              alt="Stallion Metallist Logo" 
              style={{ 
                height: '42px', 
                objectFit: 'contain', 
                filter: theme === 'light' ? 'invert(1) hue-rotate(180deg) brightness(0.2)' : 'none', 
                transition: 'filter 0.3s' 
              }} 
            />
            <div style={{ 
              fontSize: '0.95rem', 
              letterSpacing: '1px', 
              color: 'var(--color-text-dark)', 
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: 1
            }}>
              <span style={{ fontWeight: 300 }}>THE STALLION</span>{' '}
              <span style={{ fontWeight: 800 }}>METALLIST</span>
            </div>
          </Link>
          
          <nav className="desktop-nav" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <a href="/#why-us" className="link-animated" style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', lineHeight: 1 }}>About</a>
              <a href="/#services" className="link-animated" style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', lineHeight: 1 }}>Expertise</a>
              <a href="/#trade" className="link-animated" style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', lineHeight: 1 }}>Trade</a>
            </div>
            
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', borderLeft: '1px solid var(--color-border)', paddingLeft: '1.25rem' }}>
              <motion.button
                onClick={toggleTheme}
                whileHover={isTouch ? undefined : {}}
                whileTap={{ scale: 0.95 }}
                className="theme-toggle-btn"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-text-dark)',
                  transition: 'border-color 0.3s, background-color 0.3s',
                  position: 'relative'
                }}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'light' ? 90 : 0, scale: theme === 'light' ? 0 : 1 }}
                  style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Moon size={16} strokeWidth={2.5} />
                </motion.div>
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'light' ? 0 : -90, scale: theme === 'light' ? 1 : 0 }}
                  style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Sun size={16} strokeWidth={2.5} />
                </motion.div>
              </motion.button>
              <Link to="/contact" className="btn btn-primary contact-btn" style={{ padding: '0.6rem 1.5rem', fontSize: '0.75rem', letterSpacing: '1.5px', fontWeight: 700, borderRadius: '50px' }}>CONTACT</Link>
            </div>
          </nav>

          <div className="mobile-nav-toggle" style={{ display: 'none', alignItems: 'center', gap: '1rem' }}>
            <motion.button
              onClick={toggleTheme}
              whileHover={isTouch ? undefined : {}}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-text-dark)',
                transition: 'border-color 0.3s, background-color 0.3s',
                position: 'relative'
              }}
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'light' ? 90 : 0, scale: theme === 'light' ? 0 : 1 }}
                style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Moon size={16} strokeWidth={2.5} />
              </motion.div>
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'light' ? 0 : -90, scale: theme === 'light' ? 1 : 0 }}
                style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Sun size={16} strokeWidth={2.5} />
              </motion.div>
            </motion.button>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-dark)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem'
              }}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'var(--color-secondary)',
              zIndex: 90,
              display: 'flex',
              flexDirection: 'column',
              padding: '100px 2rem 2rem 2rem', // Offset for header
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', marginTop: '2rem' }}>
              <a href="/#why-us" onClick={closeMenu} style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-dark)', textDecoration: 'none', letterSpacing: '2px', textTransform: 'uppercase' }}>About</a>
              <a href="/#services" onClick={closeMenu} style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-dark)', textDecoration: 'none', letterSpacing: '2px', textTransform: 'uppercase' }}>Expertise</a>
              <a href="/#trade" onClick={closeMenu} style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-dark)', textDecoration: 'none', letterSpacing: '2px', textTransform: 'uppercase' }}>Trade</a>
              
              <Link to="/contact" onClick={closeMenu} className="btn btn-primary" style={{ marginTop: '2rem', width: '100%', maxWidth: '300px', textAlign: 'center', padding: '1rem', fontSize: '1rem' }}>
                CONTACT US
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style>{`
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: flex !important;
          }
          .header-inner {
            padding: 0 1.25rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;

