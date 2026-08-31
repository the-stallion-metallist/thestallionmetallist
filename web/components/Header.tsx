"use client";

import { useEffect, useState } from "react";
import { nav } from "@/lib/content";

// Mobile menu shows a few more links than the desktop pill.
const mobileNav = [
  { label: "Non-ferrous scrap", href: "/non-ferrous-scrap" },
  { label: "Aluminium", href: "/aluminium-scrap" },
  { label: "Copper", href: "/copper-scrap" },
  { label: "Brass", href: "/brass-scrap" },
  { label: "Stainless", href: "/stainless-steel-scrap" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Recycle Cans", href: "/#ubc" },
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
            <a className="brand" href="/">
              <img className="mk" src="/brand/logo-mark.png" alt="Stallion Metallist logo" />
              <b>STALLION <span>METALLIST</span></b>
            </a>
            <nav className="nav-links">
              {nav.map((l) => (
                <a href={l.href} key={l.href}>{l.label}</a>
              ))}
            </nav>
            <a className="btn btn-primary nav-cta" href="/contact" style={{ padding: "0.65rem 1.3rem" }}>
              Get a quote
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
        <a className="btn btn-primary" href="/contact" style={{ marginTop: "1rem" }} onClick={() => setOpen(false)}>
          Get in touch
        </a>
      </div>
    </>
  );
}
