"use client";

import { useEffect, useRef } from "react";

// Thin copper bar at the very top that fills as you scroll the page.
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : "0%";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <div className="scroll-prog" ref={ref} />;
}
