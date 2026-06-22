import React, { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useProgress, useEnvironment } from '@react-three/drei';
import * as THREE from 'three';

// Preload the studio environment to make it load instantly over the network
useEnvironment.preload({ preset: 'studio' });

// Global flag to track when the main realistic model has finished loading
let isModelLoaded = false;

// Custom hook to share exact geometry and animation logic between loading wireframe and main block
function useCrushedScrap(scrollProgress) {
  const meshRef = useRef();
  
  const { geometry, basePositions, targetPositions } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.6, 12); 
    const positionAttribute = geo.attributes.position;
    
    const basePositions = new Float32Array(positionAttribute.count * 3);
    const targetPositions = new Float32Array(positionAttribute.count * 3);
    
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        
        basePositions[i*3] = vertex.x;
        basePositions[i*3+1] = vertex.y;
        basePositions[i*3+2] = vertex.z;
        
        const fold = Math.sin(vertex.x * 6) * Math.cos(vertex.y * 6) * Math.sin(vertex.z * 6) * 0.25;
        // Deterministic pseudo-random crinkles so wireframe matches final mesh perfectly
        let prng = Math.sin(vertex.x * 12.9898 + vertex.y * 78.233 + vertex.z * 37.719) * 43758.5453;
        prng = prng - Math.floor(prng);
        const crinkle = (prng - 0.5) * 0.25;
        
        targetPositions[i*3] = vertex.x + fold + crinkle;
        targetPositions[i*3+1] = (vertex.y * 0.7) + fold + crinkle; 
        targetPositions[i*3+2] = vertex.z + fold + crinkle;
    }
    geo.computeVertexNormals();
    return { geometry: geo, basePositions, targetPositions };
  }, []);

  useFrame(() => {
    if (meshRef.current && scrollProgress) {
        const progress = scrollProgress.get();
        const easedProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const positionAttribute = geometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
            const bx = basePositions[i*3];
            const by = basePositions[i*3+1];
            const bz = basePositions[i*3+2];
            
            const tx = targetPositions[i*3];
            const ty = targetPositions[i*3+1];
            const tz = targetPositions[i*3+2];
            
            positionAttribute.setXYZ(
              i, 
              bx + (tx - bx) * easedProgress,
              by + (ty - by) * easedProgress,
              bz + (tz - bz) * easedProgress
            );
        }
        
        positionAttribute.needsUpdate = true;
    }
  });

  return { meshRef, geometry };
}

// Creative fallback while the heavy 3D assets (like the Environment HDR) are loading
const LoadingWireframe = ({ scrollProgress }) => {
  const isTouch = typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const { meshRef, geometry } = useCrushedScrap(scrollProgress);
  const materialRef = useRef();
  
  useFrame((state, delta) => {
    if (materialRef.current) {
      const targetOpacity = isModelLoaded ? 0 : 0.3;
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, delta * 3);
      if (isModelLoaded && materialRef.current.opacity < 0.01) {
        meshRef.current.visible = false;
      }
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial 
        ref={materialRef}
        color={0x8f613a} 
        wireframe={true} 
        transparent 
        opacity={0.3} 
      />
    </mesh>
  );
};

// Procedural texture generation for heavy rust, pits, and scratches
function createScrapTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  
  // Base mid-gray
  context.fillStyle = '#888888';
  context.fillRect(0, 0, 512, 512);

  // Draw chunky dark and light spots (deep pits & oxidation)
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 12;
    const val = Math.random() > 0.5 ? Math.random() * 100 : 155 + Math.random() * 100;
    context.fillStyle = `rgb(${val}, ${val}, ${val})`;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    context.fill();
  }

  // Draw aggressive fine scratches
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const len = Math.random() * 30;
    const angle = Math.random() * Math.PI * 2;
    context.strokeStyle = `rgba(255,255,255,${Math.random() * 0.8})`;
    context.lineWidth = Math.random() * 1.5;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(angle)*len, y + Math.sin(angle)*len);
    context.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

const CrushedScrapBlock = ({ scrollProgress }) => {
  const { meshRef, geometry } = useCrushedScrap(scrollProgress);
  const materialRef = useRef();

  const grungeTexture = useMemo(() => createScrapTexture(), []);

  useEffect(() => {
    isModelLoaded = true;
    return () => { isModelLoaded = false; };
  }, []);

  useFrame((state, delta) => {
    // Smooth fade in material once mounted
    if (materialRef.current && materialRef.current.opacity < 1) {
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, 1, delta * 3);
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial 
        ref={materialRef}
        transparent={true}
        opacity={0}
        color={0x8f613a} // Strict Primary Brand Color
        metalness={1.0}  
        roughness={0.6} 
        roughnessMap={grungeTexture}
        bumpMap={grungeTexture}
        bumpScale={0.15} 
        flatShading={true}
        envMapIntensity={1.5} 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const DeferredHeavyAssets = ({ scrollProgress }) => {
  const [startLoading, setStartLoading] = React.useState(false);

  useEffect(() => {
    // Delay mounting the heavy assets by 100ms. 
    // React's useEffect fires before the browser paints the screen.
    // This timeout ensures WebGL actually presents the wireframe buffer 
    // to the monitor before we trigger the Suspense boundary!
    const timer = setTimeout(() => {
      setStartLoading(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!startLoading) return null;

  return (
    <>
      <directionalLight 
        castShadow 
        position={[5, 8, 5]} 
        intensity={4} 
        color={0xffffff} 
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight 
        position={[-5, 5, -5]} 
        color={0xbcbcbc} 
        intensity={20} 
        penumbra={1} 
        distance={20}
        angle={0.5}
      />
      <Environment preset="studio" />
      <CrushedScrapBlock scrollProgress={scrollProgress} />
    </>
  );
};

const SceneContainer = ({ scrollProgress, globalMouse, isCanvasHovered }) => {
  const groupRef = useRef();
  // Track the persistent spinning base separately from the final mesh rotation
  const baseRotation = useRef({ y: 0 });
  
  useFrame((state, delta) => {
    if (groupRef.current) {
        // The block should ALWAYS be slowly spinning, regardless of hover state
        baseRotation.current.y += 0.05 * delta;

        if (isCanvasHovered && globalMouse.current) {
          // Hover state: Combine persistent spin with mouse tracking offset
          const targetRotationY = baseRotation.current.y + (globalMouse.current.x * 2);
          const targetRotationX = -globalMouse.current.y * 2;
          
          groupRef.current.rotation.y += 3 * delta * (targetRotationY - groupRef.current.rotation.y);
          groupRef.current.rotation.x += 3 * delta * (targetRotationX - groupRef.current.rotation.x);
        } else {
          // Idle state: Smoothly return to the base spin and 0 tilt
          groupRef.current.rotation.y += 3 * delta * (baseRotation.current.y - groupRef.current.rotation.y);
          groupRef.current.rotation.x += 2 * delta * (0 - groupRef.current.rotation.x);
        }
    }
  });

  return (
    <group ref={groupRef}>
      <LoadingWireframe scrollProgress={scrollProgress} />
      <Suspense fallback={null}>
        <DeferredHeavyAssets scrollProgress={scrollProgress} />
      </Suspense>
    </group>
  );
};

const InteractiveHeading = () => {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Apply spring physics for ultra-smooth buttery movement
  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Parallax rotation values based on mouse position
  const rotateX = useTransform(y, [-200, 200], [15, -15]);
  const rotateY = useTransform(x, [-200, 200], [-15, 15]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(touch.clientX - centerX);
      mouseY.set(touch.clientY - centerY);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Spring gracefully animates back to 0
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseEnter={() => setIsHovered(true)}
      onTouchStart={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={handleMouseLeave}
      style={{ 
        perspective: 1200, 
        perspectiveOrigin: 'left center',
        display: 'inline-block', 
        marginBottom: '1.5rem',
        cursor: 'default',
        width: '100%'
      }}
    >
      <motion.h1 
        style={{ 
          rotateX, 
          rotateY, 
          color: 'var(--color-text-dark)', 
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
          lineHeight: 0.85, 
          fontWeight: 800,
          transformStyle: 'preserve-3d',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
        animate={{ scale: isHovered ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <motion.div 
          style={{ transform: 'translateZ(20px)' }}
          animate={{ textShadow: isHovered ? '0px 10px 30px rgba(0,0,0,0.15)' : '0px 0px 0px rgba(0,0,0,0)' }}
        >
          RAW SCRAP.
        </motion.div>
        <motion.div 
          style={{ 
            transform: 'translateZ(50px)', // Pushed further out for extreme parallax depth
            background: 'linear-gradient(135deg, var(--color-accent) 0%, #dca87d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block'
          }}
          animate={{ filter: isHovered ? 'drop-shadow(0px 15px 20px rgba(143, 97, 58, 0.3))' : 'drop-shadow(0px 0px 0px rgba(143, 97, 58, 0))' }}
        >
          REFINED<br/>TRADE.
        </motion.div>
      </motion.h1>
    </motion.div>
  );
};

const Hero = () => {
  const containerRef = useRef(null);
  const globalMouse = useRef({ x: 0, y: 0 });
  const [isCanvasHovered, setIsCanvasHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const isTouch = typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse coordinates to -1 to +1 range across the entire browser window
      globalMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      globalMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        globalMouse.current.x = (touch.clientX / window.innerWidth) * 2 - 1;
        globalMouse.current.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
  
  // Use scroll progress relative to the tall container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Mobile background parallax
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 800], ['0%', '25%']);
  
  return (
    <div ref={containerRef} style={{ height: isMobile ? 'auto' : '200vh', position: 'relative' }}>
      <section 
        className="hero-section"
        onMouseEnter={() => setIsCanvasHovered(true)}
        onMouseLeave={() => setIsCanvasHovered(false)}
        style={{ color: 'var(--color-text-dark)' }}
      >
        {isMobile && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
            <motion.img 
              src="/images/aesthetic_hero_bg.png" 
              alt="Premium Scrap Metal Background" 
              style={{ width: '100%', height: '125%', objectFit: 'cover', opacity: 0.4, y: yBg, transformOrigin: 'top' }} 
              draggable={false} 
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-secondary) 5%, transparent 100%)' }}></div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--color-secondary) 0%, transparent 40%)' }}></div>
          </div>
        )}
        <div className="container hero-grid" style={{ zIndex: 1, position: 'relative' }}>
          
          {/* Left Side: Text and CTA */}
          <motion.div style={{ zIndex: 2 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ color: '#dca87d', fontWeight: 800, letterSpacing: '3px', fontSize: '0.85rem', textTransform: 'uppercase', display: 'inline-block', lineHeight: 1, transform: 'translateY(1px)' }}>
                  International Scrap Trading
                </span>
              </div>
              
              <InteractiveHeading />
              
              <p style={{ fontSize: '1.1rem', maxWidth: '520px', marginBottom: '2rem', color: 'var(--color-text-muted)', fontWeight: 400, lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--color-text-dark)', fontWeight: 600 }}>That crushed, shifting core of metal to your right? That's the foundation of our business.</strong><br/><br/>
                We specialize in sourcing, importing, and trading massive volumes of premium ferrous and non-ferrous scrap metal. We take the raw, unyielding materials of the world and connect them directly to heavy industrial buyers and manufacturers across the Indian subcontinent.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <motion.a 
                  whileHover={isTouch ? undefined : { scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#trade" 
                  className="btn btn-primary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  View Our Trade Focus
                </motion.a>
                <motion.a 
                  href="#about" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    fontWeight: 600, 
                    color: 'var(--color-text-dark)', 
                    textDecoration: 'none',
                    textTransform: 'uppercase', 
                    letterSpacing: '1px', 
                    fontSize: '0.75rem',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '50px',
                    border: '1px solid var(--color-border)',
                    backdropFilter: 'blur(10px)',
                    whiteSpace: 'nowrap'
                  }}
                  initial="idle"
                  whileHover={isTouch ? undefined : "hover"}
                  whileTap="tap"
                  variants={{
                    idle: { backgroundColor: 'var(--inv-card-bg)', scale: 1 },
                    hover: { backgroundColor: 'var(--color-border)', scale: 1.03 },
                    tap: { scale: 0.97 }
                  }}
                >
                  How We Operate
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    variants={{ hover: { x: 5 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </motion.svg>
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* Right Side: The 3D Crushed Metal Block */}
          {!isMobile && (
            <motion.div 
              className="hero-3d-container"
              whileTap={{ cursor: 'grabbing' }}
            >
              <Canvas 
                camera={{ fov: 60, position: [0, 0, 4.5] }} 
                dpr={[1, 2]} 
                shadows
                gl={{ alpha: true, antialias: true }}
                style={{ background: 'transparent', width: '100%', height: '100%' }}
              >
                <SceneContainer scrollProgress={scrollYProgress} globalMouse={globalMouse} isCanvasHovered={isCanvasHovered} />
              </Canvas>
            </motion.div>
          )}

        </div>
      </section>
    </div>
  );
};

export default Hero;
