import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <section id="about" className="section">
      <div className="container">
        <div className="responsive-grid">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-panel"
            style={{ padding: 'clamp(1.5rem, 5vw, 3.5rem)', display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>At a Glance</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
              Stallion Metallist Ltd. is an international metal scrap trading company incorporated in Calgary, Canada, with active operations across India.
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '1rem 0', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem' }}>
                <strong style={{ minWidth: '150px', color: 'var(--color-accent)' }}>Incorporated:</strong> 
                <span>Calgary, Alberta, Canada</span>
              </li>
              <li style={{ padding: '1rem 0', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem' }}>
                <strong style={{ minWidth: '150px', color: 'var(--color-accent)' }}>India Operations:</strong> 
                <span>Rajkot, Gujarat & Dehradun, Uttarakhand</span>
              </li>
              <li style={{ padding: '1rem 0', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem' }}>
                <strong style={{ minWidth: '150px', color: 'var(--color-accent)' }}>Industry:</strong> 
                <span>Metal Scrap Trading & Import</span>
              </li>
              <li style={{ padding: '1rem 0', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem' }}>
                <strong style={{ minWidth: '150px', color: 'var(--color-accent)' }}>Sourcing Markets:</strong> 
                <span>UAE · China · Europe · North America</span>
              </li>
            </ul>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ marginTop: 'auto', paddingTop: '3rem' }}
            >
              <div style={{ padding: '1.5rem', background: 'rgba(143, 97, 58, 0.05)', borderRadius: '16px', border: '1px solid rgba(143, 97, 58, 0.1)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(143, 97, 58, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-dark)', letterSpacing: '0.5px' }}>Global Network</h4>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>Seamless international logistics connecting reliable buyers and sellers.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-panel"
            style={{ padding: 'clamp(1.5rem, 5vw, 3.5rem)', borderTop: '4px solid var(--color-accent)' }}
          >
            <h3 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>How We Operate</h3>
            <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
              Stallion Metallist operates as a full-cycle international trade entity - from supplier identification and price negotiation to shipment coordination and Indian customs clearance.
            </p>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--color-text-dark)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li>Supplier sourcing across UAE, China, Europe, and North America through direct relationships.</li>
              <li>Negotiation and contract execution with international exporters.</li>
              <li>Import documentation, customs clearance, and port coordination at Mundra, Kandla, and JNPT.</li>
              <li>Buyer fulfilment to recyclers, melting furnaces, and industrial manufacturers in the Gujarat industrial belt.</li>
              <li>Payment terms structured around international trade standards - LC at sight and T/T arrangements.</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
