import { footer, site } from "@/lib/content";

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
    </footer>
  );
}
