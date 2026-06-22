import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useAnimationFrame, animate } from 'framer-motion';
import { ArrowRight, X, ChevronRight } from 'lucide-react';
import './Services.css';

const services = [
  {
    id: 'metal',
    title: 'Metal Recycling',
    description: 'Comprehensive processing and recycling for all types of ferrous and non-ferrous metals. We turn industrial scrap into reusable raw materials efficiently and sustainably, utilizing state-of-the-art sorting technology to guarantee maximum recovery rates.',
    image: '/images/metal_recycling.png',
    span: 'col-span-1'
  },
  {
    id: 'waste',
    title: 'Industrial Waste Diversion',
    description: 'Advanced sorting and diversion strategies to minimize landfill impact and maximize resource recovery for heavy industries. We partner with manufacturing plants to create custom zero-waste solutions.',
    image: '/images/waste_diversion.png',
    span: 'col-span-2'
  },
  {
    id: 'shredding',
    title: 'Product Destruction',
    description: 'Secure and certified destruction of proprietary equipment and off-spec products utilizing heavy-duty industrial shredders. We provide complete video verification and certificates of destruction.',
    image: '/images/product_destruction.png',
    span: 'col-span-1'
  },
  {
    id: 'transport',
    title: 'Transportation & Logistics',
    description: 'A dedicated fleet of modern heavy-duty vehicles providing seamless pickup and transport of bulk scrap materials. Real-time tracking and flexible scheduling ensure your operations never slow down.',
    image: '/images/transport_logistics.png',
    span: 'col-span-2'
  },
  {
    id: 'demolition',
    title: 'Demolition Services',
    description: 'Safe and professional demolition of industrial metal structures, coupled with immediate site cleanup and scrap processing. Our specialized team handles complex tear-downs with zero operational disruption.',
    image: '/images/demolition_services.png',
    span: 'col-span-1'
  },
  {
    id: 'ewaste',
    title: 'E-Waste Recycling',
    description: 'Futuristic and highly organized electronic waste recycling, recovering precious metals from circuit boards and components. We ensure full data destruction compliance and maximum environmental stewardship.',
    image: '/images/ewaste_recycling.png',
    span: 'col-span-1'
  }
];

const Services = () => {
  const isTouch = typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const trackRef = useRef(null);
  const [halfWidth, setHalfWidth] = useState(0);
  
  const x = useMotionValue(0);
  const speed = useMotionValue(1); // 1 = normal speed, 0 = stopped

  useEffect(() => {
    const updateWidth = () => {
      if (trackRef.current && trackRef.current.children.length > services.length) {
        const firstChild = trackRef.current.children[0];
        const midChild = trackRef.current.children[services.length];
        
        if (firstChild && midChild) {
          // Mathematically perfect distance including all gaps
          const wrapDistance = midChild.offsetLeft - firstChild.offsetLeft;
          setHalfWidth(wrapDistance);
        } else {
          setHalfWidth(trackRef.current.scrollWidth / 2);
        }
      }
    };
    
    // Allow a small delay for layouts to settle
    const timeout = setTimeout(updateWidth, 100);
    window.addEventListener('resize', updateWidth);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedInstance) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedInstance]);

  // Smoothly interpolate the speed based on hover/drag state
  useEffect(() => {
    const targetSpeed = (isHovered || isDragging || selectedInstance) ? 0 : 1;
    animate(speed, targetSpeed, { duration: 0.8, ease: "circOut" });
  }, [isHovered, isDragging, selectedInstance, speed]);

  useAnimationFrame((time, delta) => {
    if (!halfWidth) return;
    
    if (isDragging) {
      // Quietly ensure bounds are respected during drag without fighting x
      let currentX = x.get();
      if (currentX <= -halfWidth) {
        x.set(currentX % halfWidth);
      } else if (currentX > 0) {
        x.set((currentX % halfWidth) - halfWidth);
      }
      return;
    }
    
    // Base speed: 80 pixels per second
    const moveBy = 80 * (delta / 1000) * speed.get();
    let newX = x.get() - moveBy;
    
    // Wrap around perfectly even with huge tab-inactive deltas
    if (newX <= -halfWidth) {
      newX = newX % halfWidth;
    } else if (newX > 0) {
      newX = (newX % halfWidth) - halfWidth;
    }
    
    x.set(newX);
  });

  const selectedService = selectedInstance ? services.find(s => s.id === selectedInstance.id) : null;

  // Duplicate services for seamless loop
  const repeatedServices = [...services, ...services];

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
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        >
          {repeatedServices.map((service, index) => {
            const instanceId = `${service.id}-${index}`;
            return (
              <motion.div 
                layoutId={`card-${instanceId}`}
                className={`modern-card ${service.span}`}
                key={instanceId}
                style={{ borderRadius: 12 }}
                onClick={() => {
                  if (!isDragging) {
                    setSelectedInstance({ id: service.id, instanceId });
                  }
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={isTouch ? undefined : { y: -8, transition: { duration: 0.3 } }}
              >
                <motion.div 
                  style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
                  animate={{ opacity: selectedInstance?.instanceId === instanceId ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="card-bg-wrapper">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="card-bg-img"
                      draggable={false}
                    />
                    <div className="card-overlay"></div>
                  </div>
                  <div className="card-content">
                    <h3>{service.title}</h3>
                    <div className="explore-btn">
                      <span>Explore</span>
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedInstance && (
          <>
            <motion.div 
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInstance(null)}
            />
            <div className="modal-container-wrapper">
              <motion.div 
                className="modern-modal"
                layoutId={`card-${selectedInstance.instanceId}`}
                style={{ borderRadius: 24 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                >
                  <button className="close-btn" onClick={() => setSelectedInstance(null)}>
                    <X size={24} />
                  </button>
                  
                  <div className="modal-hero">
                    <img 
                      src={selectedService.image} 
                      alt={selectedService.title} 
                      className="modal-hero-img"
                    />
                    <div className="modal-hero-overlay"></div>
                    <h3 className="modal-title">
                      {selectedService.title}
                    </h3>
                  </div>
                  
                  <div className="modal-body">
                    <p className="modal-desc">{selectedService.description}</p>
                    
                    <div className="modal-actions">
                      <button className="btn btn-primary modal-action-btn">
                        Get a Quote <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Services;
