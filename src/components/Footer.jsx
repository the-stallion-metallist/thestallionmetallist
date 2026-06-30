import React from 'react';
import './Footer.css';

const Footer = ({ theme }) => {
  return (
    <footer id="contact" className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} className="footer-brand-container">
              <img 
                src="/brand/stallion-text-1234.png" 
                alt="Stallion Metallist Logo" 
                className="footer-logo"
                style={{ height: '120px', objectFit: 'contain', marginBottom: '1rem' }} 
              />
              <div style={{ 
                fontSize: '1rem', 
                letterSpacing: '1px', 
                color: 'var(--color-text-dark)', 
                fontFamily: "'Montserrat', sans-serif",
                lineHeight: 1,
                marginTop: '-0.5rem',
                marginBottom: '1rem',
                display: 'none'
              }} className="footer-brand-text">
                <span style={{ fontWeight: 300 }}>THE STALLION</span>{' '}
                <span style={{ fontWeight: 800 }}>METALLIST</span>
              </div>
            </div>
            <p className="footer-desc">
              An international metal scrap trading company connecting verified global suppliers to industrial buyers across the Indian subcontinent.
            </p>
          </div>
          <div>
            <h4 className="footer-heading">Operations</h4>
            <p className="footer-text"><strong>Corporate HQ:</strong> Calgary, Alberta, Canada</p>
            <p className="footer-text"><strong>India Operations:</strong> Rajkot, Gujarat & Dehradun, Uttarakhand</p>
            <p className="footer-text"><strong>Indian Entry Ports:</strong> Mundra · Kandla · JNPT</p>
          </div>
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#about" className="footer-link">About Us</a></li>
              <li><a href="#trade" className="footer-link">What We Trade</a></li>
              <li><a href="#about" className="footer-link">How We Operate</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Stallion Metallist Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
