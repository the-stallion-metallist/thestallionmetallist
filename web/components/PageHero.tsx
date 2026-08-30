import type { ReactNode } from "react";

export type Crumb = { label: string; href?: string };

/**
 * Compact dark hero for sub-pages. Matches the home hero's cinematic look
 * (scrapyard photo + veil + copper) but shorter. Styling is scoped so it does
 * not depend on globals.css beyond the shared design tokens.
 */
export default function PageHero({
  eyebrow,
  h1,
  sub,
  crumbs,
  children,
}: {
  eyebrow: string;
  h1: string;
  sub?: string;
  crumbs: Crumb[];
  children?: ReactNode;
}) {
  return (
    <section className="ph">
      <div className="ph-bg" style={{ backgroundImage: "url('/images/hero-bg.webp')" }} />
      <div className="ph-veil" />
      <div className="wrap ph-inner">
        <nav className="ph-crumbs" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={c.label}>
              {c.href ? <a href={c.href}>{c.label}</a> : <span aria-current="page">{c.label}</span>}
              {i < crumbs.length - 1 && <span className="ph-sep">/</span>}
            </span>
          ))}
        </nav>
        <span className="ph-eyebrow">{eyebrow}</span>
        <h1 className="ph-h1">{h1}</h1>
        {sub && <p className="ph-sub">{sub}</p>}
        {children && <div className="ph-cta">{children}</div>}
      </div>

      <style>{`
        .ph { position: relative; overflow: hidden; background: var(--char);
          border-radius: 0 0 clamp(24px,4vw,44px) clamp(24px,4vw,44px); }
        .ph-bg { position: absolute; inset: 0; background-size: cover; background-position: center;
          opacity: 0.42; filter: saturate(0.7) contrast(1.05) brightness(0.85); }
        .ph-veil { position: absolute; inset: 0;
          background:
            linear-gradient(180deg, rgba(19,20,23,0.72) 0%, rgba(19,20,23,0.45) 45%, rgba(19,20,23,0.82) 100%),
            radial-gradient(70% 60% at 82% 4%, rgba(143,97,58,0.20), transparent 60%); }
        .ph-inner { position: relative; z-index: 2;
          padding-top: clamp(120px, 20vh, 180px); padding-bottom: clamp(2.6rem, 6vw, 4.4rem);
          max-width: 900px; }
        .ph-crumbs { font-family: var(--f-body); font-size: 0.82rem; color: var(--on-char-mut);
          margin-bottom: 1.4rem; display: flex; flex-wrap: wrap; gap: 0.1rem; align-items: center; }
        .ph-crumbs a { color: var(--on-char-mut); text-decoration: none; transition: color .2s; }
        .ph-crumbs a:hover { color: var(--copper-lit); }
        .ph-sep { margin: 0 0.55rem; color: color-mix(in srgb, var(--on-char-mut) 55%, transparent); }
        .ph-eyebrow { display: inline-flex; align-items: center; gap: 0.5rem;
          font-family: var(--f-body); font-weight: 600; font-size: 0.72rem; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--copper-lit);
          background: rgba(143,97,58,0.16); padding: 0.4rem 0.85rem; border-radius: 50px; }
        .ph-h1 { font-family: var(--f-disp); color: var(--on-char); font-weight: 700;
          letter-spacing: -0.02em; line-height: 1.04; margin: 1.2rem 0 0;
          font-size: clamp(2.1rem, 5.2vw, 3.6rem); text-wrap: balance; }
        .ph-sub { color: var(--on-char-mut); max-width: 60ch; margin-top: 1.1rem;
          font-size: clamp(1rem, 1.6vw, 1.12rem); line-height: 1.7; }
        .ph-cta { margin-top: 1.9rem; display: flex; gap: 0.9rem; flex-wrap: wrap; }
        .ph-cta .btn-ghost { color: var(--on-char); border-color: rgba(243,237,228,0.28); }
        .ph-cta .btn-ghost:hover { color: var(--copper-lit); border-color: var(--copper-lit); }
      `}</style>
    </section>
  );
}
