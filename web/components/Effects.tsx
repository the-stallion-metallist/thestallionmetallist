"use client";

import { useEffect } from "react";

/**
 * Cross-cutting DOM behaviors, ported from the mockup's inline script:
 * scroll-reveal, count-up stats, ticker pause off-screen, magnetic buttons,
 * grade accordions, and desktop smooth scroll. Renders nothing.
 */
export default function Effects() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: Array<() => void> = [];

    // --- reveal on scroll ---
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // --- ticker marquee pauses when off-screen ---
    const tickerEl = document.querySelector(".ticker");
    const tickerTrack = document.querySelector<HTMLElement>(".ticker-track");
    if (tickerEl && tickerTrack) {
      const tio = new IntersectionObserver(
        (es) => es.forEach((e) => { tickerTrack.style.animationPlayState = e.isIntersecting ? "running" : "paused"; }),
        { threshold: 0 }
      );
      tio.observe(tickerEl);
      cleanups.push(() => tio.disconnect());
    }

    // --- count-up stats ---
    const countUp = (el: HTMLElement) => {
      const to = parseFloat(el.dataset.to || "0");
      const pad = parseInt(el.dataset.pad || "0", 10);
      const fmt = (n: number) => { let s = Math.round(n).toString(); if (pad) s = s.padStart(pad, "0"); return s; };
      if (reduce) { el.textContent = fmt(to); return; }
      const dur = 1800, t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(eased * to);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const statIO = new IntersectionObserver(
      (es) => es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll<HTMLElement>(".count").forEach(countUp);
          statIO.unobserve(e.target);
        }
      }),
      { threshold: 0.4 }
    );
    document.querySelectorAll(".stats-band").forEach((el) => statIO.observe(el));
    cleanups.push(() => statIO.disconnect());

    // --- magnetic buttons (desktop only) ---
    if (finePointer && !reduce) {
      document.querySelectorAll<HTMLElement>(".magnetic").forEach((btn) => {
        const move = (e: MouseEvent) => {
          const r = btn.getBoundingClientRect();
          const mx = e.clientX - r.left - r.width / 2;
          const my = e.clientY - r.top - r.height / 2;
          btn.style.transform = `translate(${mx * 0.3}px, ${my * 0.3 - 2}px)`;
        };
        const leave = () => { btn.style.transform = ""; };
        btn.addEventListener("mousemove", move);
        btn.addEventListener("mouseleave", leave);
        cleanups.push(() => { btn.removeEventListener("mousemove", move); btn.removeEventListener("mouseleave", leave); });
      });
    }

    // --- interactive trade grades (accordion) ---
    document.querySelectorAll<HTMLButtonElement>(".grow").forEach((btn) => {
      const toggle = () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        const spec = btn.nextElementSibling as HTMLElement | null;
        btn.setAttribute("aria-expanded", String(!open));
        if (spec) spec.style.maxHeight = open ? "0px" : `${(spec.firstElementChild as HTMLElement).scrollHeight}px`;
      };
      btn.addEventListener("click", toggle);
      cleanups.push(() => btn.removeEventListener("click", toggle));
    });

    // --- buttery smooth scroll (desktop pointers only) ---
    if (finePointer && !reduce) {
      let target = window.scrollY, current = window.scrollY, runningS = false;
      const clampT = (v: number) => Math.max(0, Math.min(v, document.documentElement.scrollHeight - window.innerHeight));
      const frame = () => {
        current += (target - current) * 0.14;
        if (Math.abs(target - current) < 0.4) { current = target; runningS = false; }
        window.scrollTo({ top: current, behavior: "instant" as ScrollBehavior });
        if (runningS) requestAnimationFrame(frame);
      };
      const onWheel = (e: WheelEvent) => {
        if (e.ctrlKey) return;
        e.preventDefault();
        target = clampT(target + e.deltaY);
        if (!runningS) { runningS = true; requestAnimationFrame(frame); }
      };
      const onScroll = () => { if (!runningS) { target = current = window.scrollY; } };
      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => { window.removeEventListener("wheel", onWheel); window.removeEventListener("scroll", onScroll); });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
