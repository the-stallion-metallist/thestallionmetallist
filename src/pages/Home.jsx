import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Trade from '../components/Trade';
import Stats from '../components/Stats';
import DehradunInitiative from '../components/DehradunInitiative';
import WhyUs from '../components/WhyUs';

const Home = () => {
  return (
    <main>
      <Hero />
      <About />
      <Services />
      <Trade />
      <Stats />
      <DehradunInitiative />
      <WhyUs />
    </main>
  );
};

export default Home;
