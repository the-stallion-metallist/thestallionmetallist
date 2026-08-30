import { footer, site, socials } from "@/lib/content";

// Minimal inline icons (currentColor so they inherit the link colour).
function SocialIcon({ label }: { label: string }) {
  if (label === "LinkedIn") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.5C0 23.2.8 24 1.77 24h20.45c.98 0 1.78-.8 1.78-1.76V1.74C24 .78 23.2 0 22.22 0z" />
      </svg>
    );
  }
  if (label === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.22.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.05.42 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.05.37-2.22.42-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.22-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.05-.42-2.22C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.42-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.05-.37 2.22-.42C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.5.01-4.74.07-1.15.05-1.77.24-2.18.4-.55.22-.94.47-1.35.88-.41.41-.66.8-.88 1.35-.16.41-.35 1.03-.4 2.18-.06 1.24-.07 1.6-.07 4.74s.01 3.5.07 4.74c.05 1.15.24 1.77.4 2.18.22.55.47.94.88 1.35.41.41.8.66 1.35.88.41.16 1.03.35 2.18.4 1.24.06 1.6.07 4.74.07s3.5-.01 4.74-.07c1.15-.05 1.77-.24 2.18-.4.55-.22.94-.47 1.35-.88.41-.41.66-.8.88-1.35.16-.41.35-1.03.4-2.18.06-1.24.07-1.6.07-4.74s-.01-3.5-.07-4.74c-.05-1.15-.24-1.77-.4-2.18a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.18-.4-1.24-.06-1.6-.07-4.74-.07zm0 2.76a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6zm0 1.62a3.68 3.68 0 1 0 0 7.36 3.68 3.68 0 0 0 0-7.36zm5.48-.87a1.24 1.24 0 1 1-2.48 0 1.24 1.24 0 0 1 2.48 0z" />
      </svg>
    );
  }
  return null;
}

export default function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <div className="about">
          <a className="brand" href="#top">
            <img className="mk" src="/brand/logo-mark.png" alt="Stallion Metallist logo" />
            <b>STALLION <span>METALLIST</span></b>
          </a>
          <p>{footer.blurb}</p>
          <div className="foot-social">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
              >
                <SocialIcon label={s.label} />
              </a>
            ))}
          </div>
        </div>
        <div className="col">
          <span className="h">{footer.navHeading}</span>
          {footer.navLinks.map((l) => (
            <a href={l.href} key={l.href}>{l.label}</a>
          ))}
        </div>
        <div className="col">
          <span className="h">{footer.contactHeading}</span>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={`tel:${site.phoneHref}`}>{site.phoneDisplay}</a>
          <a href="#">{site.location}</a>
        </div>
      </div>
      <div className="wrap">
        <div className="foot-btm">
          <span>© {site.copyrightYear} Stallion Metallist Ltd.</span>
          <span>{site.incorporation}</span>
        </div>
      </div>

      <style>{`
        .foot-social { display: flex; gap: 0.6rem; margin-top: 1.1rem; }
        .foot-social a {
          display: inline-flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 999px;
          color: color-mix(in srgb, currentColor 62%, transparent);
          border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
          transition: color .2s ease, border-color .2s ease, transform .2s ease;
        }
        .foot-social a:hover {
          color: var(--copper-lit, #b98653);
          border-color: color-mix(in srgb, var(--copper-lit, #b98653) 55%, transparent);
          transform: translateY(-2px);
        }
        @media (prefers-reduced-motion: reduce) {
          .foot-social a { transition: color .2s ease, border-color .2s ease; }
          .foot-social a:hover { transform: none; }
        }
      `}</style>
    </footer>
  );
}
