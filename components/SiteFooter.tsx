import Link from "@/components/Link";
import { Arrow } from "./Icons";
import BrandLogo from "./BrandLogo";
import ContactDetails from "./ContactDetails";
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <span className="section-label">
            A SHARED VISION. AN ENDURING LEGACY.
          </span>
          <h2>
            Let’s build something
            <br />
            <em>that lasts.</em>
          </h2>
        </div>
        <Link
          className="circle-link"
          href="/#contact"
          aria-label="Start your project"
        >
          <Arrow diagonal />
        </Link>
      </div>
      <div className="footer-grid">
        <div className="footer-brand">
          <Link href="/" className="brand footer-logo" aria-label="BR Construction home">
            <BrandLogo />
          </Link>
          <p>
            Visionary architecture. Intelligent engineering.
            <br />
            Exceptional spaces, thoughtfully delivered.
          </p>
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
          <Link href="/services/architecture-engineering">
            Architecture & engineering
          </Link>
          <Link href="/services/residential-commercial-construction">
            Residential & commercial
          </Link>
          <Link href="/services/interior-design">Bespoke interiors</Link>
          <Link href="/services/turnkey-renovation">Turnkey & renovation</Link>
        </div>
        <div className="footer-contact">
          <span className="section-label">GET IN TOUCH</span>
          <ContactDetails compact />
        </div>
      </div>
      <div className="footer-disclosure">
        <p className="footer-note">Portfolio imagery represents illustrative concepts, not completed BR projects.</p>
        <a href="/#home" className="text-link">Back to top <Arrow style={{ transform: "rotate(-90deg)" }} /></a>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        BRCONSTRUCTION
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} BR Construction. All rights reserved.
        </span>
        <div>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms of use</Link>
        </div>
        <span>DESIGNED WITH PURPOSE. BUILT TO ENDURE.</span>
      </div>
    </footer>
  );
}
