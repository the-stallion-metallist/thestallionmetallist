import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useAnimationFrame, animate } from 'framer-motion';
import { ArrowRight, X, ChevronRight } from 'lucide-react';
import './Services.css';

const services = [
  {
    id: 'metal',
    title: 'Metal Recycling',
    description: 'Comprehensive processing and recycling for all types of ferrous and non-ferrous metals. We turn industrial scrap into reusable raw materials efficiently and sustainably, utilizing state-of-the-art sorting technology to guarantee maximum recovery rates.',
    image: '/images/metal_recycling.webp',
    span: 'col-span-1'
  },
  {
    id: 'waste',
    title: 'Industrial Waste Diversion',
    description: 'Advanced sorting and diversion strategies to minimize landfill impact and maximize resource recovery for heavy industries. We partner with manufacturing plants to create custom zero-waste solutions.',
    image: '/images/waste_diversion.webp',
    span: 'col-span-2'
  },
  {
    id: 'shredding',
    title: 'Product Destruction',
    description: 'Secure and certified destruction of proprietary equipment and off-spec products utilizing heavy-duty industrial shredders. We provide complete video verification and certificates of destruction.',
    image: '/images/product_destruction.webp',
    span: 'col-span-1'
  }
];

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const trackRef = useRef(null);
  const [singleSetWidth, setSingleSetWidth] = useState(0);
  
  const x = useMotionValue(0);
  const speed = useMotionValue(1); // 1 = full speed, 0 = paused

  // Duplicate services 4x for continuous unbroken panoramic track
  const repeatedServices = [...services, ...services, ...services, ...services];

  useEffect(() => {
    const updateWidth = () => {
      if (trackRef.current && trackRef.current.children.length >= services.length * 2) {
        const firstChild = trackRef.current.children[0];
        const nextSetChild = trackRef.current.children[services.length];
        
        if (firstChild && nextSetChild) {
          const wrapDistance = nextSetChild.offsetLeft - firstChild.offsetLeft;
          setSingleSetWidth(wrapDistance);
        }
      }
    };
    
    updateWidth();
    const timer = setTimeout(updateWidth, 150);
    window.addEventListener('resize', updateWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedService]);

  // Smoothly slow down slider on hover or modal opening
  useEffect(() => {
    const targetSpeed = (isHovered || isDragging || selectedService) ? 0 : 1;
    animate(speed, targetSpeed, { duration: 0.5, ease: "easeOut" });
  }, [isHovered, isDragging, selectedService, speed]);

  useAnimationFrame((time, delta) => {
    if (!singleSetWidth || isDragging) return;
    
    // Cap delta at 32ms to prevent jerks after tab switching
    const safeDelta = Math.min(delta, 32);
    const moveBy = 65 * (safeDelta / 1000) * speed.get();
    let newX = x.get() - moveBy;
    
    // Seamless modular wrap-around with zero visual jump
    if (newX <= -singleSetWidth) {
      newX += singleSetWidth;
    } else if (newX > 0) {
      newX -= singleSetWidth;
    }
    
    x.set(newX);
  });

  return (
    <section className="section services-modern-section" id="services">
      <div className="container">
        <div className="services-header">
          <h2 className="section-title">Our Expertise</h2>
          <p className="section-subtitle">Pioneering sustainable industrial solutions through state-of-art recycling and material recovery.</p>
        </div>
      </div>

      {/* Full width slider track */}
      <div className="slider-container">
        <motion.div 
          ref={trackRef}
          className="slider-track"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -singleSetWidth * 2, right: 0 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        >
          {repeatedServices.map((service, index) => {
            const instanceKey = `${service.id}-${index}`;
            return (
              <motion.div 
                className={`modern-card ${service.span}`}
                key={instanceKey}
                style={{ borderRadius: 16 }}
                onClick={() => {
                  if (!isDragging) {
                    setSelectedService(service);
                  }
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
                whileTap={{ scale: 0.98 }}
              >
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <div className="card-bg-wrapper">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="card-bg-img"
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                    <div className="card-overlay"></div>
                  </div>
                  <div className="card-content">
                    <h3>{service.title}</h3>
                    <div className="explore-btn">
                      <span>Explore</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Butter-smooth Animated Modal */}
      <AnimatePresence>
        {selectedService && (
          <>
            <motion.div 
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              onClick={() => { setSelectedService(null); setShowContact(false); }}
            />
            <div className="modal-container-wrapper">
              <motion.div 
                className="modern-modal"
                initial={{ opacity: 0, scale: 0.92, y: 25 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ type: "spring", stiffness: 360, damping: 28 }}
                style={{ borderRadius: 24 }}
              >
                <div className="modern-modal-inner">
                  <button 
                    className="close-btn" 
                    onClick={() => { setSelectedService(null); setShowContact(false); }}
                    aria-label="Close dialog"
                  >
                    <X size={22} />
                  </button>
                  
                  <div className="modal-hero">
                    <img 
                      src={selectedService.image} 
                      alt={selectedService.title} 
                      className="modal-hero-img"
                      decoding="async"
                    />
                    <div className="modal-hero-overlay"></div>
                    <h3 className="modal-title">
                      {selectedService.title}
                    </h3>
                  </div>
                  
                  <div className="modal-body">
                    <p className="modal-desc">{selectedService.description}</p>
                    
                    <div className="modal-actions" style={{ position: 'relative' }}>
                      <AnimatePresence mode="wait">
                        {!showContact ? (
                          <motion.button 
                            key="quote"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="btn btn-primary modal-action-btn" 
                            onClick={() => setShowContact(true)}
                          >
                            Get a Quote <ChevronRight size={18} />
                          </motion.button>
                        ) : (
                          <motion.div 
                            key="contact"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}
                          >
                            <a href="mailto:contact@thestallionmetallist.com" className="btn btn-primary" style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}>
                              Email Us
                            </a>
                            <a href="tel:+919997348394" className="btn" style={{ flex: 1, textAlign: 'center', justifyContent: 'center', background: 'var(--color-border)', color: 'var(--color-text-dark)', border: 'none' }}>
                              Call Us
                            </a>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Services;
