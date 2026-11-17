import Link from "@/components/Link";
import BrandLogo from "./BrandLogo";
import { Arrow } from "./Icons";
import { whatsappUrl } from "@/data/company";
import ContactDetails from "./ContactDetails";
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link href="/" className="brand footer-logo" aria-label="BR Construction home">
            <BrandLogo />
          </Link>
          <p>
            Considered construction. Intelligent engineering.
            <br />
            Exceptional spaces, thoughtfully delivered.
          </p>
          <div className="footer-actions">
            <Link href="/#contact" className="button button-gold">
              Start your project <Arrow diagonal />
            </Link>
            <a
              className="button button-outline"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Message BR Construction on WhatsApp (opens in a new tab)"
            >
              WhatsApp <Arrow diagonal />
            </a>
          </div>
        </div>
        <div>
          <span className="section-label">EXPLORE</span>
          <Link href="/#about">The studio</Link>
          <Link href="/projects">Project collection</Link>
          <Link href="/#process">Our process</Link>
          <Link href="/contact">Start a conversation</Link>
        </div>
        <div>
          <span className="section-label">EXPERTISE</span>
          <Link href="/services/residential-commercial-construction">
            Residential & commercial
          </Link>
          <Link href="/services/architecture-engineering">
            Architecture & engineering
          </Link>
          <Link href="/services/interior-design">Bespoke interiors</Link>
          <Link href="/services/turnkey-renovation">Turnkey & renovation</Link>
        </div>
        <div className="footer-contact">
          <span className="section-label">GET IN TOUCH</span>
          <ContactDetails compact />
        </div>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        <span>BRCONSTRUCTION</span>
      </div>
    </footer>
  );
}
