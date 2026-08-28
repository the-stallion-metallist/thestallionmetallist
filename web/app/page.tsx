import Intro from "@/components/Intro";
import ScrollProgress from "@/components/ScrollProgress";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import About from "@/components/About";
import Routes from "@/components/Routes";
import Ubc from "@/components/Ubc";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Trade from "@/components/Trade";
import Stats from "@/components/Stats";
import Why from "@/components/Why";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";
import Effects from "@/components/Effects";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Intro />
      <Header />
      <main id="top">
        <Hero />
        <Ticker />
        <About />
        <Routes />
        <Ubc />
        <Services />
        <Process />
        <Trade />
        <Stats />
        <Why />
        <Cta />
      </main>
      <Footer />
      <Effects />
    </>
  );
}
