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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>Global Headquarters</h3>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-dark)' }}>
                123 Industrial Avenue, Suite 400<br />
                Toronto, ON M5V 2T6<br />
                Canada
              </p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>India Operations</h3>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-dark)' }}>
                Plot No. 45, GIDC Industrial Estate<br />
                Rajkot, Gujarat 360003<br />
                India
              </p>
            </div>

            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>Contact Details</h3>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-dark)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span><strong>Email:</strong> trade@stallionmetallist.com</span>
                <span><strong>Phone (Global):</strong> +1 587 8933 420</span>
                <span><strong>Phone (India):</strong> +91 98765 43210</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Contact;
