"use client";

import { useEffect, useState } from "react";
import { nav } from "@/lib/content";

// Mobile menu shows a few more anchors than the desktop pill.
const mobileNav = [
  { label: "About", href: "#about" },
  { label: "Recycle Cans", href: "#ubc" },
  { label: "Solutions", href: "#services" },
  { label: "How we operate", href: "#process" },
  { label: "Trade", href: "#trade" },
  { label: "Why Us", href: "#why" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header>
        <div className="nav">
          <div className="nav-inner">
            <a className="brand" href="#top">
              <img className="mk" src="/brand/logo-mark.png" alt="Stallion Metallist logo" />
              <b>STALLION <span>METALLIST</span></b>
            </a>
            <nav className="nav-links">
              {nav.map((l) => (
                <a href={l.href} key={l.href}>{l.label}</a>
              ))}
            </nav>
            <a className="btn btn-primary nav-cta" href="#contact" style={{ padding: "0.65rem 1.3rem" }}>
              Get in touch
            </a>
            <button
              className={`hamburger${open ? " open" : ""}`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu${open ? " open" : ""}`} id="mobileMenu">
        {mobileNav.map((l) => (
          <a href={l.href} key={l.href} onClick={() => setOpen(false)}>{l.label}</a>
        ))}
        <a className="btn btn-primary" href="#contact" style={{ marginTop: "1rem" }} onClick={() => setOpen(false)}>
          Get in touch
        </a>
      </div>
    </>
  );
}
