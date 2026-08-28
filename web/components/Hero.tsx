import { hero } from "@/lib/content";
import type { CSSProperties } from "react";

// allow CSS custom properties (--d) in inline style objects
const v = (d: string): CSSProperties => ({ ["--d" as string]: d } as CSSProperties);

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-stage">
        <div className="bg" style={{ backgroundImage: "url('/images/hero-bg.webp')" }} />
        <div className="veil" />
        <div className="wrap hero-center">
          <span className="badge hero-rise" style={v(".12s")}>
            <span className="sp">✦</span> {hero.badge}
          </span>
          <h1 className="hero-h1">
            <span className="mega hero-rise" style={v(".26s")}>{hero.wordmark}</span>
            <span className="hero-tag hero-rise" style={v(".44s")}>
              {hero.tagLead} <span className="copper">{hero.tagAccent}</span>
            </span>
          </h1>
          <div className="hero-cta hero-rise" style={v(".62s")}>
            <a className="btn btn-primary magnetic" href={hero.ctaPrimary.href}>
              {hero.ctaPrimary.label} <span className="circ">→</span>
            </a>
            <a className="btn btn-ghost magnetic" href={hero.ctaGhost.href}>
              {hero.ctaGhost.label}
            </a>
          </div>
        </div>
        <div className="scroll-cue" aria-hidden="true">
          <div className="mouse" />
          <span>Scroll</span>
        </div>
      </div>

      <div className="wrap seam">
        <svg className="hero-can" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="canBody" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#8b97a3" /><stop offset="0.18" stopColor="#e9edf1" />
              <stop offset="0.42" stopColor="#ffffff" /><stop offset="0.6" stopColor="#c7ced5" />
              <stop offset="0.82" stopColor="#9aa5b0" /><stop offset="1" stopColor="#7c8894" />
            </linearGradient>
            <linearGradient id="canTop" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#9aa5b0" /><stop offset="0.5" stopColor="#eef1f4" /><stop offset="1" stopColor="#8b97a3" />
            </linearGradient>
            <linearGradient id="canBand" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#6e4828" /><stop offset="0.5" stopColor="#a9713f" /><stop offset="1" stopColor="#6e4828" />
            </linearGradient>
          </defs>
          <ellipse cx="60" cy="188" rx="34" ry="8" fill="rgba(0,0,0,0.18)" />
          <rect x="26" y="24" width="68" height="156" rx="10" fill="url(#canBody)" stroke="#77828d" strokeWidth="1" />
          <path d="M30 30 q6 -10 30 -10 t30 10" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2" />
          <rect x="26" y="150" width="68" height="8" fill="#8b97a3" opacity="0.55" />
          <rect x="26" y="44" width="68" height="8" fill="#8b97a3" opacity="0.55" />
          <rect x="26" y="86" width="68" height="30" fill="url(#canBand)" opacity="0.92" />
          <rect x="34" y="30" width="6" height="150" fill="#ffffff" opacity="0.55" />
          <path d="M26 26 h68 v6 q-34 12 -68 0 z" fill="url(#canTop)" />
          <ellipse cx="60" cy="24" rx="34" ry="7" fill="url(#canTop)" stroke="#6b7680" strokeWidth="1" />
          <ellipse cx="60" cy="24" rx="26" ry="4.5" fill="#b9c2cb" />
          <ellipse cx="60" cy="21" rx="10" ry="2.5" fill="#8b97a3" />
        </svg>
      </div>

      <div className="wrap">
        <div className="markets">
          <span className="lbl">{hero.marketsLabel}</span>
          <div className="row">
            {hero.markets.map((m) => (
              <span className="m" key={m}>{m}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
