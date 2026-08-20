import React from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <main style={{ paddingTop: '120px', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-panel"
          style={{ padding: '4rem', borderRadius: '32px', maxWidth: '800px', margin: '0 auto' }}
        >
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--color-text-dark)' }}>Get in Touch</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '3rem' }}>
            We're here to help answer any questions you might have about our metal recycling and trading operations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>India Operations</h3>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-dark)', lineHeight: 1.6 }}>
                115A, Iksana Workspace, IT Park<br />
                Sahastradhara Road<br />
                Dehradun, Uttarakhand 248001<br />
                India
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>Contact Details</h3>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-dark)', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: 1.6 }}>
                <span><strong>Email:</strong> <a href="mailto:contact@thestallionmetallist.com" style={{ color: 'inherit', textDecoration: 'none' }}>contact@thestallionmetallist.com</a></span>
                <span><strong>Phone:</strong> <a href="tel:+919997348394" style={{ color: 'inherit', textDecoration: 'none' }}>+91 99973 48394</a></span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Contact;
