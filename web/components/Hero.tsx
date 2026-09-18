"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/content";

/* ============================================================================
 * HERO — app-first. Leads the homepage with the UBC can-collection service
 * ("Cans into cash"), with a secondary door for scrap traders. Light theme,
 * matches the site tokens (globals.css). Everything below the hero is unchanged.
 *
 * Self-contained: all classes are namespaced `ch-` so they never collide with
 * globals.css, and colours come from the site's CSS variables.
 * ========================================================================== */

const APP_URL = site.ubcAppUrl; // the live can-collection PWA
const EARNED = 1240; // demo "total earned" figure shown on the phone, counts up

export default function Hero() {
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = countRef.current;
    if (!el) return;
    const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt(EARNED);
      return;
    }
    let raf = 0, t0 = 0;
    const step = (now: number) => {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / 1100);
      el.textContent = fmt((1 - Math.pow(1 - p, 3)) * EARNED);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="ch">
      <div className="ch-atmos" aria-hidden="true" />
      <div className="wrap ch-grid">
        <div className="ch-copy">
          <span className="ch-eyebrow"><span className="ch-dot" aria-hidden="true" /> Now serving Dehradun</span>
          <h1 className="ch-h1">
            <span className="ch-l1">Cans into cash.</span>
            <span className="ch-l2">Waste into worth.</span>
          </h1>
          <p className="ch-sub">
            Get paid for your used aluminium cans. Book a doorstep pickup, we weigh them at your door and
            pay you on the spot. No fees, and every can we collect gets recycled.
          </p>
          <div className="ch-cta">
            <a className="ch-primary" href={APP_URL} target="_blank" rel="noopener noreferrer">
              Book my pickup <span className="ch-circ" aria-hidden="true">→</span>
            </a>
            <a className="ch-ghost" href="/non-ferrous-scrap">For scrap traders →</a>
          </div>
          <div className="ch-social">
            <span className="ch-stars" aria-hidden="true">★★★★★</span>
            <span><b>5.0</b> on Google</span>
            <span className="ch-sep" aria-hidden="true">·</span>
            <span>Doorstep pickup in Dehradun</span>
          </div>
        </div>

        <div className="ch-stage">
          <div className="ch-halo" aria-hidden="true" />
          <div className="ch-phone" aria-hidden="true">
            <div className="ch-screen">
              <div className="ch-island" />
              <div className="ch-phd">
                <div className="ch-u"><span className="ch-av" /><div><small>Good evening</small><b>Ravi</b></div></div>
                <div className="ch-bell">🔔</div>
              </div>
              <div className="ch-card">
                <div className="ch-row1">
                  <div className="ch-bm"><img src="/brand/logo-mark.png" alt="" /><b>THE STALLION<br /><span>METALLIST · MEMBER</span></b></div>
                  <div className="ch-wallet" />
                </div>
                <div className="ch-lbl">Total earned</div>
                <div className="ch-earned"><span>₹</span><span ref={countRef}>0</span></div>
                <div className="ch-meta">
                  <div><small>Member</small><b>Ravi Kumar</b></div>
                  <div><small>Cans</small><b>820</b></div>
                  <div><small>Since</small><b>2026</b></div>
                </div>
              </div>
              <div className="ch-sheet">
                <div className="ch-sh"><b>Active pickup</b><a href="#">View all</a></div>
                <div className="ch-pcard">
                  <div className="ch-r"><b>100 cans</b><span className="ch-req">● Requested</span></div>
                  <div className="ch-loc">Rajpur Rd · Dehradun</div>
                  <div className="ch-pbar"><i /></div>
                  <div className="ch-psteps"><span className="on">Requested</span><span>Scheduled</span><span>Collected</span></div>
                  <div className="ch-pmeta">
                    <div><small>Pickup</small><b>Tomorrow, 4 PM</b></div>
                    <div style={{ textAlign: "right" }}><small>Est. payout</small><b>₹150</b></div>
                  </div>
                </div>
                <div className="ch-schedule">+ Schedule a pickup</div>
                <div className="ch-pstats">
                  <div><b>820</b><small>CANS</small></div>
                  <div><b>9</b><small>PICKUPS</small></div>
                  <div><b>₹1.2k</b><small>EARNED</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a className="ch-sticky" href={APP_URL} target="_blank" rel="noopener noreferrer" aria-label="Book my pickup">
        Book my pickup <span aria-hidden="true">→</span>
      </a>

      <style>{`
        .ch{position:relative;overflow:hidden;background:var(--paper);padding-bottom:clamp(2rem,5vw,3.5rem)}
        .ch-atmos{position:absolute;inset:0;z-index:0;pointer-events:none;
          background:
            radial-gradient(44% 46% at 90% 0%,rgba(143,97,58,.13),transparent 62%),
            radial-gradient(52% 50% at 2% 98%,rgba(239,233,224,.95),transparent 62%),
            linear-gradient(180deg,#fbf8f3,var(--paper) 42%)}
        .ch-grid{position:relative;z-index:2;display:grid;grid-template-columns:1.02fr .98fr;
          gap:clamp(2rem,5vw,4.5rem);align-items:center;
          padding-block:clamp(104px,14vw,156px) clamp(2rem,5vw,3.5rem)}
        @media(max-width:900px){.ch-grid{grid-template-columns:1fr;gap:2.4rem}.ch-stage{order:2}.ch-copy{order:1}}

        .ch-eyebrow{display:inline-flex;align-items:center;gap:.55rem;font-family:var(--f-body);font-weight:600;
          font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--copper);
          background:var(--copper-tint);border:1px solid rgba(143,97,58,.16);padding:.42rem .9rem;border-radius:50px}
        .ch-dot{width:7px;height:7px;border-radius:50%;background:var(--copper);
          box-shadow:0 0 0 0 rgba(143,97,58,.5);animation:ch-pulse 2.4s infinite}
        @keyframes ch-pulse{70%{box-shadow:0 0 0 9px rgba(143,97,58,0)}100%{box-shadow:0 0 0 0 rgba(143,97,58,0)}}

        .ch-h1{font-family:var(--f-disp);font-weight:700;letter-spacing:-.025em;line-height:1;margin:1.15rem 0 0;
          font-size:clamp(2.6rem,8.2vw,5.6rem);text-wrap:balance}
        .ch-l1{display:block;color:var(--ink)}
        .ch-l2{display:block;background:linear-gradient(94deg,var(--copper),var(--copper-dk));
          -webkit-background-clip:text;background-clip:text;color:transparent}
        .ch-sub{margin-top:1.35rem;max-width:50ch;font-size:clamp(1.02rem,1.6vw,1.18rem);color:var(--ink-soft);line-height:1.7}

        .ch-cta{display:flex;flex-wrap:wrap;align-items:center;gap:1rem 1.5rem;margin-top:2rem}
        .ch-primary{display:inline-flex;align-items:center;justify-content:center;gap:.65rem;min-height:52px;
          font-family:var(--f-body);font-weight:700;font-size:1.05rem;padding:.9rem 1.7rem;border-radius:50px;color:#fff;
          text-decoration:none;background:linear-gradient(180deg,#a06e44,var(--copper-dk));
          box-shadow:0 16px 34px -16px rgba(143,97,58,.75);transition:transform .2s,box-shadow .2s}
        .ch-primary:hover{transform:translateY(-2px);box-shadow:0 22px 40px -18px rgba(143,97,58,.8)}
        .ch-primary:focus-visible{outline:2px solid var(--copper);outline-offset:3px}
        .ch-circ{display:grid;place-items:center;width:23px;height:23px;border-radius:50%;background:rgba(255,255,255,.24);font-size:.85rem}
        .ch-ghost{font-family:var(--f-body);font-weight:600;color:var(--ink-soft);text-decoration:none;
          display:inline-flex;align-items:center;gap:.45rem;padding:.5rem 0;border-bottom:1px solid transparent;transition:color .2s,border-color .2s}
        .ch-ghost:hover{color:var(--copper);border-color:var(--copper)}

        .ch-social{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem .8rem;margin-top:1.5rem;
          color:var(--ink-soft);font-size:.92rem;font-weight:600}
        .ch-stars{color:var(--copper);letter-spacing:1px;font-size:1rem}
        .ch-social b{color:var(--ink)}
        .ch-sep{color:var(--muted);opacity:.6}

        .ch-stage{position:relative;display:flex;justify-content:center;align-items:center}
        .ch-halo{position:absolute;width:min(440px,92%);aspect-ratio:1;border-radius:50%;z-index:0;
          background:radial-gradient(circle,rgba(224,177,132,.5),rgba(240,229,216,.35) 40%,transparent 68%);filter:blur(4px)}
        .ch-phone{position:relative;z-index:2;width:304px;max-width:82vw;background:#0c0d11;border-radius:42px;padding:11px;
          box-shadow:0 54px 90px -34px rgba(28,25,23,.5),0 0 0 1px rgba(28,25,23,.08);animation:ch-bob 7s ease-in-out infinite}
        @keyframes ch-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        .ch-screen{background:linear-gradient(180deg,#16171d,#0f1015);border-radius:32px;overflow:hidden;padding:13px 13px 15px;position:relative;color:#ece9e3}
        .ch-island{width:78px;height:20px;background:#000;border-radius:20px;margin:2px auto 12px}
        .ch-phd{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .ch-u{display:flex;align-items:center;gap:9px}
        .ch-av{width:34px;height:34px;border-radius:50%;background:radial-gradient(circle at 32% 28%,var(--copper-lit),var(--copper-dk))}
        .ch-phd small{display:block;font-size:.6rem;color:#8f8a80}
        .ch-phd b{font-family:var(--f-disp);font-size:.92rem}
        .ch-bell{width:32px;height:32px;border-radius:10px;background:rgba(243,237,228,.06);display:grid;place-items:center;font-size:.82rem}
        .ch-card{background:linear-gradient(150deg,#24252d,#151620);border:1px solid rgba(243,237,228,.06);border-radius:18px;padding:14px}
        .ch-row1{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .ch-bm{display:flex;align-items:center;gap:8px}
        .ch-bm img{width:26px;height:26px}
        .ch-bm b{font-family:var(--f-disp);font-size:.58rem;line-height:1.15;letter-spacing:.06em}
        .ch-bm b span{color:var(--copper-lit)}
        .ch-wallet{width:26px;height:18px;border-radius:5px;background:linear-gradient(135deg,var(--copper-lit),var(--copper-dk))}
        .ch-lbl{font-size:.6rem;color:#8f8a80;text-transform:uppercase;letter-spacing:.1em}
        .ch-earned{font-family:var(--f-disp);font-weight:700;font-size:2rem;margin:.1rem 0 .6rem;font-variant-numeric:tabular-nums}
        .ch-earned span:first-child{font-size:1.05rem;color:#8f8a80;margin-right:2px}
        .ch-meta{display:flex;gap:10px;border-top:1px solid rgba(243,237,228,.08);padding-top:10px}
        .ch-meta small{display:block;color:#8f8a80;font-size:.55rem;text-transform:uppercase;letter-spacing:.08em}
        .ch-meta b{font-family:var(--f-disp);font-size:.82rem}
        .ch-sheet{margin-top:12px;background:rgba(243,237,228,.03);border:1px solid rgba(243,237,228,.06);border-radius:18px;padding:12px}
        .ch-sh{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px}
        .ch-sh b{font-family:var(--f-disp);font-size:.82rem}
        .ch-sh a{color:var(--copper-lit);font-size:.64rem;text-decoration:none}
        .ch-pcard{background:linear-gradient(150deg,#20212a,#131419);border-radius:14px;padding:11px 12px}
        .ch-r{display:flex;justify-content:space-between;align-items:center}
        .ch-r b{font-family:var(--f-disp);font-size:.92rem}
        .ch-req{color:var(--copper-lit);font-size:.58rem;font-weight:600}
        .ch-loc{color:#8f8a80;font-size:.62rem;margin:.1rem 0 .5rem}
        .ch-pbar{height:5px;border-radius:5px;background:rgba(243,237,228,.09);overflow:hidden}
        .ch-pbar i{display:block;height:100%;width:34%;border-radius:5px;background:linear-gradient(90deg,var(--copper-lit),var(--copper))}
        .ch-psteps{display:flex;justify-content:space-between;font-size:.5rem;color:#8f8a80;margin-top:6px}
        .ch-psteps .on{color:var(--copper-lit);font-weight:700}
        .ch-pmeta{display:flex;justify-content:space-between;margin-top:9px}
        .ch-pmeta small{display:block;color:#8f8a80;font-size:.52rem;text-transform:uppercase;letter-spacing:.08em}
        .ch-pmeta b{font-family:var(--f-disp);font-size:.78rem}
        .ch-schedule{margin-top:11px;text-align:center;border-radius:12px;padding:.72rem;
          font-family:var(--f-body);font-weight:700;font-size:.82rem;color:#fff;background:linear-gradient(180deg,var(--copper-lit),var(--copper))}
        .ch-pstats{display:flex;gap:8px;margin-top:11px}
        .ch-pstats>div{flex:1;background:rgba(243,237,228,.04);border-radius:11px;padding:9px 8px;text-align:center}
        .ch-pstats b{font-family:var(--f-disp);display:block;font-size:.92rem}
        .ch-pstats small{color:#8f8a80;font-size:.5rem;letter-spacing:.05em}

        .ch-sticky{display:none}
        @media(max-width:720px){
          .ch-sticky{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:70;
            justify-content:center;align-items:center;gap:.55rem;min-height:56px;
            padding:1rem 1.2rem calc(1rem + env(safe-area-inset-bottom,0px));
            font-family:var(--f-body);font-weight:700;font-size:1.06rem;color:#fff;text-decoration:none;
            background:linear-gradient(180deg,#a06e44,var(--copper-dk));box-shadow:0 -12px 30px -14px rgba(28,25,23,.45)}
          body{padding-bottom:78px}
        }
        @media (prefers-reduced-motion: reduce){.ch-phone,.ch-dot{animation:none}}
      `}</style>
    </section>
  );
}
