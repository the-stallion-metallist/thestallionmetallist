import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Lenis from 'lenis';
import Header from './components/Header';
import Footer from './components/Footer';
import GlowBackground from './components/GlowBackground';
import ThemeTransition from './components/ThemeTransition';
import Home from './pages/Home';
import Contact from './pages/Contact';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('stallion_theme') || 'dark';
  });

  const [themeTransition, setThemeTransition] = useState({ active: false, nextTheme: null });

  useEffect(() => {
    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('stallion_theme', theme);

    return () => {
      lenis.destroy();
    };
  }, [theme]);

  const initiateThemeToggle = () => {
    if (themeTransition.active) return;
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeTransition({ active: true, nextTheme });
  };

  const handleMidpoint = () => {
    setTheme(themeTransition.nextTheme);
  };

  const handleTransitionComplete = () => {
    setThemeTransition({ active: false, nextTheme: null });
  };

  return (
    <>
      <GlowBackground />
      {themeTransition.active && (
        <ThemeTransition 
          onMidpoint={handleMidpoint} 
          onComplete={handleTransitionComplete} 
        />
      )}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header theme={theme} toggleTheme={initiateThemeToggle} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer theme={theme} />
      </div>
    </>
  );
}

export default App;
