"use client";

import { useEffect, useState } from "react";

// Page-load intro curtain. Reduced-motion users never see it (hidden via CSS),
// and it self-removes after the reveal so it never blocks interaction.
export default function Intro() {
  const [gone, setGone] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setGone(true); return; }

    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    const t1 = setTimeout(() => {
      setDone(true);
      document.body.style.overflow = "";
      const t2 = setTimeout(() => setGone(true), 1000);
      return () => clearTimeout(t2);
    }, 1650);
    return () => {
      clearTimeout(t1);
      document.body.style.overflow = "";
    };
  }, []);

  if (gone) return null;
  return (
    <div className={`intro${done ? " done" : ""}`} id="intro">
      <div className="intro-inner">
        <img className="intro-logo" src="/brand/logo-mark.png" alt="Stallion Metallist" />
        <div className="intro-word">THE STALLION <span>METALLIST</span></div>
        <div className="intro-line" />
      </div>
    </div>
  );
}
