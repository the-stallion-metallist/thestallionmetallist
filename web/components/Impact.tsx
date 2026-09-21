"use client";

import { useEffect, useRef } from "react";

/* ============================================================================
 * IMPACT — recycling impact "dashboard" band. Replaces the old UBC app section
 * (the app now leads the hero). Styled like the in-app dashboard card: a dark
 * panel on the light page with copper accents, count-up figures, per-stat
 * icons, and a staggered scroll-reveal (transform/opacity, reduced-motion safe).
 *
 * Numbers: the can count is the real base figure. Energy and CO2 are ESTIMATES
 * derived from it using standard aluminium-recycling factors (recycling saves
 * ~95% of the energy of primary aluminium; ~3 t of aluminium at ~15 g/can).
 * Update `stats` here if the real figures change.
 * ========================================================================== */

type Stat = { to: number; unit: string; label: string; icon: "can" | "bolt" | "leaf" };

const stats: Stat[] = [
  { to: 200000, unit: "", label: "Cans recycled", icon: "can" },
  { to: 40000, unit: "kWh", label: "Energy saved", icon: "bolt" },
  { to: 25, unit: "tonnes", label: "CO₂ avoided", icon: "leaf" },
];

function Icon({ name }: { name: Stat["icon"] }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "bolt") return <svg viewBox="0 0 24 24" width="20" height="20" {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>;
  if (name === "leaf") return <svg viewBox="0 0 24 24" width="20" height="20" {...p}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5-6" /></svg>;
  return <svg viewBox="0 0 24 24" width="20" height="20" {...p}><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M7 8h10M9 3v2m6-2v2" /></svg>;
}

export default function Impact() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nums = Array.from(root.querySelectorAll<HTMLElement>("[data-to]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

    if (reduce) {
      nums.forEach((el) => { el.textContent = fmt(Number(el.dataset.to || "0")); });
      return; // leave the panel in its visible resting state, no motion
    }

    root.classList.add("im-anim"); // enable the from-hidden reveal (JS only, so no-JS stays visible)
    const runCount = () => nums.forEach((el) => {
      const to = Number(el.dataset.to || "0");
      let t0 = 0;
      const step = (now: number) => {
        if (!t0) t0 = now;
        const p = Math.min(1, (now - t0) / 1600);
        el.textContent = fmt((1 - Math.pow(1 - p, 3)) * to);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { root.classList.add("im-in"); runCount(); io.disconnect(); } }),
      { threshold: 0.35 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <section className="im" id="ubc">
      <div className="wrap">
        <div className="im-head">
          <span className="im-eyebrow">Our impact</span>
          <h2>Recycling that adds up.</h2>
          <p className="im-sub">
            Every can we collect in Dehradun goes back into industry instead of landfill. Here is what
            2,00,000+ cans add up to so far.
          </p>
        </div>

        <div className="im-panel" ref={ref}>
          <div className="im-bar">
            <div className="im-brand">
              <img src="/brand/logo-mark.png" alt="" />
              <b>THE STALLION METALLIST<span> · IMPACT</span></b>
            </div>
            <span className="im-live"><i /> Live in Dehradun</span>
          </div>

          <div className="im-grid">
            {stats.map((s) => (
              <div className="im-stat" key={s.label}>
                <span className="im-ic" aria-hidden="true"><Icon name={s.icon} /></span>
                <div className="im-num">
                  <span data-to={s.to}>0</span><span className="im-plus">+</span>
                  {s.unit && <span className="im-unit">{s.unit}</span>}
                </div>
                <div className="im-lbl">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="im-foot">
            Energy and CO&#8322; are estimates from cans collected, using standard aluminium-recycling
            factors (recycling saves about 95% of the energy of new aluminium).
          </div>
        </div>

        <a className="im-link" href="/aluminium-can-collection-dehradun">
          How doorstep collection works in Dehradun <span aria-hidden="true">→</span>
        </a>
      </div>

      <style>{`
        .im{background:var(--paper);padding-block:clamp(3rem,7vw,5.4rem)}
        .im-head{max-width:640px;margin-bottom:clamp(1.6rem,4vw,2.4rem);display:grid;gap:.8rem}
        .im-eyebrow{font-family:var(--f-body);font-weight:600;font-size:.72rem;letter-spacing:.14em;
          text-transform:uppercase;color:var(--copper)}
        .im-head h2{font-family:var(--f-disp);font-weight:700;letter-spacing:-.02em;line-height:1.05;
          font-size:clamp(1.8rem,4vw,2.8rem);color:var(--ink);text-wrap:balance}
        .im-sub{color:var(--ink-soft);font-size:1.05rem;line-height:1.7;max-width:56ch}

        .im-panel{position:relative;overflow:hidden;isolation:isolate;
          background:linear-gradient(155deg,#20222a,#141319);border:1px solid rgba(243,237,228,.08);
          border-radius:26px;padding:clamp(1.4rem,3.5vw,2.4rem);
          box-shadow:0 40px 80px -40px rgba(28,25,23,.55)}
        /* ambient copper glow, top-right */
        .im-panel::before{content:"";position:absolute;z-index:-1;top:-40%;right:-15%;width:60%;height:120%;
          background:radial-gradient(circle,rgba(224,177,132,.16),transparent 62%);pointer-events:none}
        /* one-time light sweep on reveal */
        .im-panel::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;
          background:linear-gradient(115deg,transparent 34%,rgba(224,177,132,.14) 50%,transparent 66%);
          transform:translateX(-130%)}
        .im-panel.im-in::after{animation:im-sheen 1.1s cubic-bezier(.4,0,.2,1) .15s both}
        @keyframes im-sheen{to{transform:translateX(130%)}}

        .im-bar{display:flex;align-items:center;justify-content:space-between;gap:1rem;
          padding-bottom:clamp(1.2rem,3vw,1.8rem);border-bottom:1px solid rgba(243,237,228,.08);flex-wrap:wrap}
        .im-brand{display:flex;align-items:center;gap:.6rem}
        .im-brand img{width:30px;height:30px}
        .im-brand b{font-family:var(--f-disp);font-weight:600;font-size:.74rem;letter-spacing:.1em;color:var(--on-char)}
        .im-brand b span{color:var(--copper-lit)}
        .im-live{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--f-body);font-weight:600;
          font-size:.72rem;letter-spacing:.06em;color:var(--on-char-mut);
          background:rgba(224,177,132,.12);border:1px solid rgba(224,177,132,.22);padding:.34rem .7rem;border-radius:50px}
        .im-live i{width:7px;height:7px;border-radius:50%;background:var(--copper-lit);
          box-shadow:0 0 0 0 rgba(224,177,132,.6);animation:im-pulse 2.4s infinite}
        @keyframes im-pulse{70%{box-shadow:0 0 0 8px rgba(224,177,132,0)}100%{box-shadow:0 0 0 0 rgba(224,177,132,0)}}

        .im-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;
          padding-block:clamp(1.4rem,3.5vw,2.2rem)}
        .im-stat{display:grid;gap:.7rem;padding:1.2rem 1.3rem;border-radius:16px;
          background:rgba(243,237,228,.03);border:1px solid rgba(243,237,228,.07)}
        /* mobile: compact the tiles so the section is shorter and scrolls easier */
        @media(max-width:720px){
          .im-grid{grid-template-columns:1fr;gap:.7rem;padding-block:1.2rem}
          .im-stat{grid-template-columns:auto 1fr;align-items:center;gap:.35rem .95rem;padding:.9rem 1.05rem}
          .im-stat .im-ic{grid-row:span 2;width:38px;height:38px}
          .im-num{font-size:2.05rem}
          .im-lbl{align-self:start}
        }
        .im-ic{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;color:var(--copper-lit);
          background:rgba(224,177,132,.12);border:1px solid rgba(224,177,132,.2)}
        .im-num{font-family:var(--f-disp);font-weight:700;line-height:1;color:var(--on-char);
          display:flex;align-items:baseline;gap:.05rem;font-variant-numeric:tabular-nums;
          font-size:clamp(2.2rem,5vw,3.1rem)}
        .im-plus{color:var(--copper-lit)}
        .im-unit{font-family:var(--f-body);font-weight:600;font-size:.9rem;color:var(--on-char-mut);
          margin-left:.4rem;letter-spacing:.02em}
        .im-lbl{font-family:var(--f-body);font-weight:600;font-size:.76rem;letter-spacing:.1em;
          text-transform:uppercase;color:var(--copper-lit)}
        .im-foot{border-top:1px solid rgba(243,237,228,.08);padding-top:1rem;
          color:var(--on-char-mut);font-size:.78rem;line-height:1.6;max-width:70ch}
        .im-link{display:inline-flex;align-items:center;gap:.4rem;margin-top:1.4rem;
          font-family:var(--f-body);font-weight:600;font-size:1rem;color:var(--copper);text-decoration:none;
          border-bottom:1px solid transparent;transition:border-color .2s,color .2s}
        .im-link:hover{color:var(--copper-dk);border-color:var(--copper)}

        /* staggered scroll-reveal (JS-gated via .im-anim so no-JS stays visible) */
        .im-panel.im-anim .im-stat{opacity:0;transform:translateY(18px)}
        .im-panel.im-anim.im-in .im-stat{opacity:1;transform:none;
          transition:opacity .6s cubic-bezier(.2,.7,.2,1),transform .6s cubic-bezier(.2,.7,.2,1)}
        .im-panel.im-in .im-stat:nth-child(2){transition-delay:.12s}
        .im-panel.im-in .im-stat:nth-child(3){transition-delay:.24s}

        /* desktop hover lift */
        @media(hover:hover) and (pointer:fine){
          .im-stat{transition:transform .25s ease,border-color .25s ease,background .25s ease}
          .im-stat:hover{transform:translateY(-4px);border-color:rgba(224,177,132,.35);background:rgba(243,237,228,.05)}
        }

        @media (prefers-reduced-motion: reduce){
          .im-live i,.im-panel::after{animation:none}
          .im-panel.im-anim .im-stat{opacity:1;transform:none}
        }
      `}</style>
    </section>
  );
}
